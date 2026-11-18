const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// GET endpoint to fetch all users from copc_schema.users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, name, email, role, created_at FROM copc_schema.users;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST endpoint for user registration (handled by userController)
router.post('/register', registerUser);

// POST endpoint for user login (handled by userController)
router.post('/login', loginUser);

module.exports = router;