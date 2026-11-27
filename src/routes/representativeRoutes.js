const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

// GET /api/representatives
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.role, u.account_status, u.contact_number,
              u.office_name, u.position, u.created_at, p.program_name
       FROM copc_schema.users u
       LEFT JOIN copc_schema.programs p ON u.program_id = p.program_id
       WHERE u.role = 'Office Representative'
       ORDER BY u.user_id ASC;`
    );
    const rows = result.rows.map((u) => ({
      id: u.user_id,
      user_id: u.user_id,
      name: u.name,
      office: u.office_name || 'Assigned Office',
      program: u.program_name || 'Information Technology',
      email: u.email,
      contact: u.contact_number || '',
      position: u.position || '',
      status: u.account_status || 'Active',
    }));
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching representatives.' });
  }
});

// POST /api/representatives
router.post('/', async (req, res) => {
  try {
    const { name, office, program, email, contact, status, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await pool.query(
      'SELECT user_id FROM copc_schema.users WHERE LOWER(email) = LOWER($1);',
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    let programId = null;
    if (program) {
      const progRes = await pool.query(
        'SELECT program_id FROM copc_schema.programs WHERE LOWER(program_name) = LOWER($1) LIMIT 1;',
        [String(program).trim()]
      );
      if (progRes.rows[0]) {
        programId = progRes.rows[0].program_id;
      } else {
        const createdProg = await pool.query(
          'INSERT INTO copc_schema.programs (program_name) VALUES ($1) RETURNING program_id;',
          [String(program).trim()]
        );
        programId = createdProg.rows[0].program_id;
      }
    }

    const hashedPassword = await bcrypt.hash(password || 'Password123!', 10);
    const resolvedStatus = status === 'Inactive' ? 'Inactive' : 'Active';

    const insertRes = await pool.query(
      `INSERT INTO copc_schema.users
         (program_id, name, email, password_hash, role, account_status, office_name, contact_number, position)
       VALUES ($1, $2, $3, $4, 'Office Representative', $5, $6, $7, $8)
       RETURNING user_id, name, email, role, account_status, office_name, contact_number, position;`,
      [programId, name.trim(), normalizedEmail, hashedPassword, resolvedStatus,
        office || null, contact || null, req.body.position || null]
    );
    const created = insertRes.rows[0];
    res.status(201).json({
      id: created.user_id,
      user_id: created.user_id,
      name: created.name,
      office: created.office_name || 'Assigned Office',
      program: program || 'Information Technology',
      email: created.email,
      contact: created.contact_number || '',
      position: created.position || '',
      status: created.account_status,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while adding representative.' });
  }
});

// PUT /api/representatives/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, status, office, program, contact, position } = req.body;
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid representative ID.' });
    }
    const existingRepresentative = await pool.query(
      `SELECT user_id FROM copc_schema.users
       WHERE user_id = $1 AND role = 'Office Representative';`,
      [id]
    );
    if (!existingRepresentative.rows[0]) {
      return res.status(404).json({ error: 'Representative not found.' });
    }
    const resolvedStatus = status === 'Inactive' ? 'Inactive' : 'Active';
    let programId = null;
    if (program !== undefined) {
      if (program) {
        const foundProgram = await pool.query(
          'SELECT program_id FROM copc_schema.programs WHERE LOWER(program_name) = LOWER($1) LIMIT 1;',
          [String(program).trim()]
        );
        if (foundProgram.rows[0]) {
          programId = foundProgram.rows[0].program_id;
        } else {
          const createdProgram = await pool.query(
            'INSERT INTO copc_schema.programs (program_name) VALUES ($1) RETURNING program_id;',
            [String(program).trim()]
          );
          programId = createdProgram.rows[0].program_id;
        }
      }
    }

    const result = await pool.query(
      `UPDATE copc_schema.users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           office_name = COALESCE($3, office_name),
           contact_number = COALESCE($4, contact_number),
           position = COALESCE($5, position),
           program_id = CASE WHEN $6 THEN $7::int ELSE program_id END,
           account_status = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $9 AND role = 'Office Representative'
       RETURNING user_id, name, email, account_status, office_name, contact_number, position;`,
      [name || null, email ? String(email).trim().toLowerCase() : null,
        office || null, contact || null, position || null, program !== undefined,
        programId, resolvedStatus, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Representative not found.' });
    }
    const updated = result.rows[0];
    res.json({
      id: updated.user_id,
      user_id: updated.user_id,
      name: updated.name,
      office: updated.office_name || 'Assigned Office',
      program: program || 'Information Technology',
      email: updated.email,
      contact: updated.contact_number || '',
      position: updated.position || '',
      status: updated.account_status,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating representative.' });
  }
});

module.exports = router;
