const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userRoutes = require('./src/routes/userRoutes');
const pool = require('./src/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Ensure uploads folder exists locally for PDF handling
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure Multer storage & PDF filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
// 📄 RECORDS & DOMAIN ENDPOINTS
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

// ==========================================
// 📂 DOCUMENTS & FILE UPLOAD / REVIEW MODULE
// ==========================================

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a PDF document for a requirement record
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               record_id:
 *                 type: integer
 *               uploaded_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid PDF file.' });
    }

    const { record_id, uploaded_by, version_number } = req.body;
    const file_name = req.file.originalname;
    const file_path = req.file.path;
    const file_type = req.file.mimetype;
    const file_size_bytes = req.file.size;
    const status = 'For Review'; // Initial calculated status

    const query = `
      INSERT INTO copc_schema.documents 
      (record_id, uploaded_by, file_name, file_path, file_type, file_size_bytes, version_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      record_id, 
      uploaded_by, 
      file_name, 
      file_path, 
      file_type, 
      file_size_bytes, 
      version_number || 1, 
      status
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ 
      message: 'Document uploaded successfully', 
      document: result.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /api/documents/{id}/review:
 *   patch:
 *     summary: Review a document and update its status (Approved, For Revision, Rejected)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewer_id:
 *                 type: integer
 *               decision:
 *                 type: string
 *                 enum: [Approved, For Revision, Rejected]
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document status successfully calculated and updated
 */
app.patch('/api/documents/:id/review', async (req, res) => {
  try {
    const document_id = req.params.id;
    const { reviewer_id, decision, comments } = req.body;

    // Validate calculated status options matching your database check constraint
    const validDecisions = ['Approved', 'For Revision', 'Rejected'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision status value.' });
    }

    // 1. Log the review decision in document_reviews table
    const reviewQuery = `
      INSERT INTO copc_schema.document_reviews (document_id, reviewer_id, decision, comments)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    await pool.query(reviewQuery, [document_id, reviewer_id, decision, comments]);

    // 2. Update the main status field in the documents table
    const updateDocQuery = `
      UPDATE copc_schema.documents
      SET status = $1
      WHERE document_id = $2
      RETURNING *;
    `;
    const updatedDoc = await pool.query(updateDocQuery, [decision, document_id]);

    if (updatedDoc.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.json({ 
      message: `Document status successfully updated to ${decision}`, 
      document: updatedDoc.rows[0] 
    });
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