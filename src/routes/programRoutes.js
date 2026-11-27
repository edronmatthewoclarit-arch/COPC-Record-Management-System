const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM copc_schema.programs ORDER BY program_name ASC;'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching programs.' });
  }
});

router.post('/', async (req, res) => {
  const name = String(req.body.program_name || req.body.name || '').trim();
  const degreeCode = String(req.body.degree_code || '').trim() || null;
  if (!name) return res.status(400).json({ error: 'Program name is required.' });

  try {
    const result = await pool.query(
      `INSERT INTO copc_schema.programs (program_name, degree_code)
       VALUES ($1, $2) RETURNING *;`,
      [name, degreeCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A program with this name already exists.' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating program.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const name = req.body.program_name ?? req.body.name;
  const degreeCode = req.body.degree_code;
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid program ID.' });
  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ error: 'Program name cannot be empty.' });
  }

  try {
    const result = await pool.query(
      `UPDATE copc_schema.programs
       SET program_name = COALESCE($1, program_name),
           degree_code = CASE WHEN $2 THEN $3 ELSE degree_code END
       WHERE program_id = $4
       RETURNING *;`,
      [name === undefined ? null : String(name).trim(), degreeCode !== undefined, degreeCode, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Program not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A program with this name already exists.' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating program.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid program ID.' });

  try {
    const result = await pool.query(
      'DELETE FROM copc_schema.programs WHERE program_id = $1 RETURNING program_id;',
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Program not found.' });
    res.json({ message: 'Program deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while deleting program.' });
  }
});

module.exports = router;