const express = require('express');
const pool = require('../db');

const router = express.Router();

function resolveUserId(req) {
  const value = req.user?.user_id || req.query.user_id || req.body?.user_id;
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

router.get('/', async (req, res) => {
  const userId = resolveUserId(req);
  if (!userId) return res.status(400).json({ error: 'A valid user_id is required.' });

  try {
    const result = await pool.query(
      `SELECT notification_id, user_id, title, message, notification_type,
              related_document_id, related_request_id, is_read, created_at
       FROM copc_schema.notifications
       WHERE user_id = $1
       ORDER BY created_at DESC, notification_id DESC
       LIMIT 100;`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching notifications.' });
  }
});

router.patch('/:id/read', async (req, res) => {
  const userId = resolveUserId(req);
  const notificationId = Number(req.params.id);
  if (!userId || !Number.isInteger(notificationId) || notificationId < 1) {
    return res.status(400).json({ error: 'Valid user and notification IDs are required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE copc_schema.notifications
       SET is_read = TRUE
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *;`,
      [notificationId, userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Notification not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating notification.' });
  }
});

router.patch('/read-all', async (req, res) => {
  const userId = resolveUserId(req);
  if (!userId) return res.status(400).json({ error: 'A valid user_id is required.' });

  try {
    const result = await pool.query(
      `UPDATE copc_schema.notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE;`,
      [userId]
    );
    res.json({ message: 'Notifications marked as read.', updated: result.rowCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating notifications.' });
  }
});

module.exports = router;