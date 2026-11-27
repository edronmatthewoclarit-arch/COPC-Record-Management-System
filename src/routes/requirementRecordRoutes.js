const express = require('express');
const pool = require('../db');

const router = express.Router();
const allowedTypes = ['Required', 'Optional'];
const allowedStatuses = ['Active', 'Inactive'];

router.get('/', async (req, res) => {
  const requirementId = req.query.requirement_id ? Number(req.query.requirement_id) : null;
  if (requirementId !== null && (!Number.isInteger(requirementId) || requirementId < 1)) {
    return res.status(400).json({ error: 'requirement_id must be a positive integer.' });
  }

  try {
    const result = await pool.query(
      `SELECT rr.*, u.name AS assigned_to_name
       FROM copc_schema.requirement_records rr
       LEFT JOIN copc_schema.users u ON u.user_id = rr.assigned_to
       WHERE ($1::int IS NULL OR rr.requirement_id = $1)
       ORDER BY rr.requirement_id, rr.record_id;`,
      [requirementId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching requirement records.' });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid record ID.' });

  try {
    const result = await pool.query(
      `SELECT rr.*, u.name AS assigned_to_name
       FROM copc_schema.requirement_records rr
       LEFT JOIN copc_schema.users u ON u.user_id = rr.assigned_to
       WHERE rr.record_id = $1;`,
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Requirement record not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching requirement record.' });
  }
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { record_name, description, requirement_type, assigned_to, status, target_count } = req.body;
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid record ID.' });
  if (requirement_type !== undefined && !allowedTypes.includes(requirement_type)) {
    return res.status(400).json({ error: 'requirement_type must be Required or Optional.' });
  }
  if (status !== undefined && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'status must be Active or Inactive.' });
  }
  if (record_name !== undefined && !String(record_name).trim()) {
    return res.status(400).json({ error: 'record_name cannot be empty.' });
  }
  if (target_count !== undefined && (!Number.isInteger(Number(target_count)) || Number(target_count) < 1)) {
    return res.status(400).json({ error: 'target_count must be a positive integer.' });
  }
  if (assigned_to !== undefined && assigned_to !== null && assigned_to !== '' &&
      (!Number.isInteger(Number(assigned_to)) || Number(assigned_to) < 1)) {
    return res.status(400).json({ error: 'assigned_to must be a positive integer or null.' });
  }

  try {
    const result = await pool.query(
      `UPDATE copc_schema.requirement_records
       SET record_name = COALESCE($1, record_name),
           description = CASE WHEN $2 THEN $3 ELSE description END,
           requirement_type = COALESCE($4, requirement_type),
           assigned_to = CASE WHEN $5 THEN $6 ELSE assigned_to END,
           status = COALESCE($7, status),
           target_count = COALESCE($8, target_count),
           updated_at = CURRENT_TIMESTAMP
       WHERE record_id = $9
       RETURNING *;`,
      [
        record_name === undefined ? null : String(record_name).trim(),
        description !== undefined,
        description ?? null,
        requirement_type ?? null,
        assigned_to !== undefined,
        assigned_to === null || assigned_to === '' ? null : Number(assigned_to),
        status ?? null,
        target_count === undefined ? null : Number(target_count),
        id,
      ]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Requirement record not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating requirement record.' });
  }
});

module.exports = router;