const pool = require('../db');
const bcrypt = require('bcrypt');
const { createToken } = require('../utils/authToken');

const ALLOWED_ROLES = [
  'COPC Coordinator',
  'Program Head',
  'Faculty',
  'Office Representative',
  'Dean',
];

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// 1. Get All Users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, role, profile_photo, account_status, created_at FROM copc_schema.users ORDER BY user_id ASC;'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching users.' });
  }
};

// 2. Register User / Add Representative Modal
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, program_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const resolvedRole = role && ALLOWED_ROLES.includes(role) ? role : 'Office Representative';
    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}` });
    }

    // Check if email already exists
    const existing = await pool.query('SELECT user_id FROM copc_schema.users WHERE LOWER(email) = LOWER($1);', [
      normalizedEmail,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO copc_schema.users (name, email, password_hash, role, program_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, name, email, role, program_id, account_status, created_at;
    `;
    const result = await pool.query(query, [
      name.trim(),
      normalizedEmail,
      hashedPassword,
      resolvedRole,
      program_id || null,
    ]);

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while registering user.' });
  }
};

// 3. Login User
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      `SELECT u.*, p.program_name
       FROM copc_schema.users u
       LEFT JOIN copc_schema.programs p ON u.program_id = p.program_id
       WHERE LOWER(u.email) = LOWER($1);`,
      [normalizedEmail]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    if (user.account_status && user.account_status !== 'Active') {
      return res.status(403).json({ error: 'This account is inactive.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ error: `Account is registered as "${user.role}", not "${role}".` });
    }

    const token = createToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      message: 'Login successful',
      token,
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      initials: getInitials(user.name),
      program: user.program_name || 'Information Technology',
      profile_photo: user.profile_photo || user.profile_photo_path || null,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while logging in.' });
  }
};

// 3b. Logout User
const logoutUser = async (req, res) => {
  res.json({ message: 'Logout successful' });
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
      SET profile_photo = $1, profile_photo_path = $1, updated_at = CURRENT_TIMESTAMP
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
    res.status(500).json({ error: 'Server error while updating profile photo.' });
  }
};

// 5. Account Settings: Update Password
const updatePassword = async (req, res) => {
  try {
    const user_id = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

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

    await pool.query(
      'UPDATE copc_schema.users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2;',
      [newHashedPassword, user_id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating password.' });
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  logoutUser,
  updateProfilePhoto,
  updatePassword,
};