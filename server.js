const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const userRoutes = require('./src/routes/userRoutes');
const pool = require('./src/db');

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

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
  apis: ['./src/routes/*.js', './server.js'], // Scans your route files for Swagger annotations
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// ---------------------

// Mount routes
app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running live on http://localhost:${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});
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
    const result = await pool.query('SELECT * FROM copc_schema.documents'); // Match your table name here
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});