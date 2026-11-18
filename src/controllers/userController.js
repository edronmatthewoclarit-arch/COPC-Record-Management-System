const pool = require('../db');
const bcrypt = require('bcrypt');

// Register User
const registerUser = async (req, res) => {
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
};

// Login User
const loginUser = async (req, res) => {
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
};

module.exports = { registerUser, loginUser };