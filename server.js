const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const pool = require('./src/db');

// Import modular routes
const userRoutes = require('./src/routes/userRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const requirementRoutes = require('./src/routes/requirementRoutes');

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
  apis: ['./src/routes/*.js', './server.js'], // Scans route files for documentation
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// ---------------------

// Mount Modular Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/records', documentRoutes); // Alias for records pointing to documents endpoint
app.use('/api/requirements', requirementRoutes);

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