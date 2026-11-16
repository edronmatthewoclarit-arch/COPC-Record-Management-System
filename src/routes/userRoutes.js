const express = require('express');
const router = express.Router();
const pool = require('../db'); // Import your database connection

// GET endpoint to fetch users from pgAdmin
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users'); // Replace 'users' with your table name
    res.json(result.rows); // Send the database rows back as JSON
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;