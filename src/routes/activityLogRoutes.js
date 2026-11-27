const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const requestedLimit = Number(req.query.limit || 50);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 200)
    : 50;
  const userId = req.query.user_id ? Number(req.query.user_id) : null;

  if (userId !== null && (!Number.isInteger(userId) || userId < 1)) {
    return res.status(400).json({ error: 'user_id must be a positive integer.' });
  }

  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS user_name, u.role AS user_role
       FROM copc_schema.activity_logs a
       LEFT JOIN copc_schema.users u ON u.user_id = a.user_id
       WHERE ($1::int IS NULL OR a.user_id = $1)
       ORDER BY a.created_at DESC, a.activity_id DESC
       LIMIT $2;`,
      [userId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching activity logs.' });
  }
});

module.exports = router;