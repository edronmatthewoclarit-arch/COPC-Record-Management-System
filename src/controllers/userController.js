const pool = require('../db');
const bcrypt = require('bcrypt');

// 1. Get All Users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, role, profile_photo, created_at FROM copc_schema.users ORDER BY user_id ASC;'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 2. Register User / Add Representative Modal
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existing = await pool.query('SELECT * FROM copc_schema.users WHERE email = $1;', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO copc_schema.users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING user_id, name, email, role;
    `;
    const result = await pool.query(query, [
      name,
      email,
      hashedPassword,
      role || 'Representative',
    ]);

    res.status(201).json({ message: 'Representative added successfully', user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 3. Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM copc_schema.users WHERE email = $1;', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      profile_photo: user.profile_photo,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 4. Account Settings: Change Profile Photo
const updateProfilePhoto = async (req, res) => {
  try {
    const user_id = req.params.id;
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid image file (JPG, PNG, WEBP).' });
    }

    // Normalize path separators for URLs
    const photoPath = req.file.path.replace(/\\/g, '/');

    const query = `
      UPDATE copc_schema.users 
      SET profile_photo = $1 
      WHERE user_id = $2 
      RETURNING user_id, name, email, role, profile_photo;
    `;
    const result = await pool.query(query, [photoPath, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Profile photo updated successfully', user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 5. Account Settings: Update Password
const updatePassword = async (req, res) => {
  try {
    const user_id = req.params.id;
    const { currentPassword, newPassword } = req.body;

    // Fetch existing user hash
    const userResult = await pool.query('SELECT * FROM copc_schema.users WHERE user_id = $1;', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];

    // Verify current password before changing
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    // Hash and save new password
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query('UPDATE copc_schema.users SET password_hash = $1 WHERE user_id = $2;', [
      newHashedPassword,
      user_id,
    ]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  updateProfilePhoto,
  updatePassword,
};