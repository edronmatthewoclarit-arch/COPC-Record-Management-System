const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const bcrypt = require('bcrypt');
const userRoutes = require('./src/routes/userRoutes');
const pool = require('./src/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the COPC RMS Backend API! Go to /api-docs for Swagger UI.');
});

// --- Swagger Setup ---
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'COPC Record Management API',
      version: '1.0.0',
      description: 'API documentation for our Express and PostgreSQL backend',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js', './server.js'], // Scans your route files and server.js for Swagger annotations
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// ---------------------

// Mount modular routes
app.use('/api/users', userRoutes);

// ==========================================
// 📄 RECORDS ENDPOINT
// ==========================================
/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Retrieve all records from the database
 *     description: Fetches all rows from your PostgreSQL table
 *     responses:
 *       200:
 *         description: A list of records retrieved successfully
 */
app.get('/api/records', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM copc_schema.documents');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 🔐 AUTHENTICATION ROUTES (Bcrypt)
// ==========================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with a hashed password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO copc_schema.users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING user_id, name, email, role;
    `;
    const result = await pool.query(query, [name, email, hashedPassword, role || 'Faculty']);

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user login via bcrypt comparison
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = `SELECT * FROM copc_schema.users WHERE email = $1;`;
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({ message: 'Login successful', name: user.name, role: user.role });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running live on http://localhost:${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

// Test database connection pool on boot
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

/**
 * @swagger
 * /api/requirements:
 *   get:
 *     summary: Retrieve all COPC requirements
 *     description: Fetches all rows from the requirements table in copc_schema
 *     responses:
 *       200:
 *         description: A list of requirements retrieved successfully
 */
app.get('/api/requirements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM copc_schema.requirements;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});