const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const path = require('path');
const pool = require('./src/db');
const { attachUserIfPresent } = require('./src/utils/authToken');

// Import modular routes
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const requirementRoutes = require('./src/routes/requirementRoutes');
const representativeRoutes = require('./src/routes/representativeRoutes');
const copcRoutes = require('./src/routes/copcRoutes');
const programRoutes = require('./src/routes/programRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const requirementRecordRoutes = require('./src/routes/requirementRecordRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const activityLogRoutes = require('./src/routes/activityLogRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(attachUserIfPresent);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Exposes uploaded files & profile photos

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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/records', documentRoutes); // Alias for records pointing to documents endpoint
app.use('/api/requirements', requirementRoutes);
app.use('/api/requirement-records', requirementRecordRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/document-requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activity', activityLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/representatives', representativeRoutes);
app.use('/api', copcRoutes);

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