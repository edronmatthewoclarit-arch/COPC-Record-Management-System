const express = require('express');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Mount routes
app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running live on http://localhost:${PORT}`);
});