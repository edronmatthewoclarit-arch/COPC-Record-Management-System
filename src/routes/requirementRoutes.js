const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/requirements - List all active requirements with record counts and progress
router.get('/', async (req, res) => {
  try {
    const reqResult = await pool.query(
      `SELECT r.*
       FROM copc_schema.requirements r
       WHERE r.is_active = TRUE
       ORDER BY r.requirement_id ASC;`
    );

    const recResult = await pool.query(
      `SELECT
         rr.*,
         latest_doc.document_id,
         latest_doc.file_name,
         latest_doc.file_size_bytes,
         latest_doc.version_number,
         latest_doc.status AS document_status,
         latest_doc.uploaded_at,
         u.name AS assigned_name,
         u.role AS assigned_role
       FROM copc_schema.requirement_records rr
       LEFT JOIN LATERAL (
         SELECT d.*
         FROM copc_schema.documents d
         WHERE d.record_id = rr.record_id
         ORDER BY d.version_number DESC, d.document_id DESC
         LIMIT 1
       ) latest_doc ON TRUE
       LEFT JOIN copc_schema.users u ON latest_doc.uploaded_by = u.user_id
       ORDER BY rr.record_id ASC;`
    );

    const recordsByReqId = new Map();
    for (const rec of recResult.rows) {
      if (!recordsByReqId.has(rec.requirement_id)) {
        recordsByReqId.set(rec.requirement_id, []);
      }
      recordsByReqId.get(rec.requirement_id).push({
        record_id: rec.record_id,
        id: rec.record_id,
        name: rec.record_name,
        description: rec.description,
        file: rec.file_name || null,
        size: rec.file_size_bytes
          ? `${(Number(rec.file_size_bytes) / (1024 * 1024)).toFixed(1)} MB`
          : '',
        assigned: rec.assigned_name || '—',
        role: rec.assigned_role || '',
        status: rec.document_status || 'Requested',
        updated: rec.uploaded_at
          ? new Date(rec.uploaded_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—',
        version: rec.version_number ? `v${rec.version_number}` : '—',
      });
    }

    const formatted = reqResult.rows.map((r) => {
      const records = recordsByReqId.get(r.requirement_id) || [];
      const approvedCount = records.filter((x) => x.status === 'Approved').length;
      const progress = records.length ? Math.round((approvedCount / records.length) * 100) : 0;
      return {
        ...r,
        id: r.requirement_id,
        name: r.requirement_name,
        recordCount: records.length,
        progress,
        records,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching requirements.' });
  }
});

// GET /api/requirements/:id - Get single requirement with its records
router.get('/:id', async (req, res) => {
  try {
    const reqId = Number(req.params.id);
    const reqResult = await pool.query(
      'SELECT * FROM copc_schema.requirements WHERE requirement_id = $1;',
      [reqId]
    );
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found.' });
    }
    const requirement = reqResult.rows[0];
    const recordsResult = await pool.query(
      `SELECT
         rr.*,
         latest_doc.file_name,
         latest_doc.version_number,
         latest_doc.status AS document_status,
         latest_doc.uploaded_at,
         u.name AS assigned_name,
         u.role AS assigned_role
       FROM copc_schema.requirement_records rr
       LEFT JOIN LATERAL (
         SELECT d.*
         FROM copc_schema.documents d
         WHERE d.record_id = rr.record_id
         ORDER BY d.version_number DESC, d.document_id DESC
         LIMIT 1
       ) latest_doc ON TRUE
       LEFT JOIN copc_schema.users u ON latest_doc.uploaded_by = u.user_id
       WHERE rr.requirement_id = $1
       ORDER BY rr.record_id ASC;`,
      [reqId]
    );
    res.json({
      ...requirement,
      id: requirement.requirement_id,
      name: requirement.requirement_name,
      records: recordsResult.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching requirement.' });
  }
});

// POST /api/requirements - Create a new COPC requirement
router.post('/', async (req, res) => {
  try {
    const requirementName = (req.body.requirement_name || req.body.name || '').trim();
    const description = (req.body.description || '').trim();
    const category = (req.body.category || 'Other').trim();
    const isRequired = req.body.is_required !== undefined ? Boolean(req.body.is_required) : true;

    if (!requirementName) {
      return res.status(400).json({ error: 'Requirement name is required.' });
    }

    const existing = await pool.query(
      'SELECT requirement_id FROM copc_schema.requirements WHERE LOWER(requirement_name) = LOWER($1);',
      [requirementName]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Requirement with this name already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO copc_schema.requirements (requirement_name, description, category, is_required)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [requirementName, description, category, isRequired]
    );
    const created = result.rows[0];
    res.status(201).json({
      ...created,
      id: created.requirement_id,
      name: created.requirement_name,
      responsible: req.body.responsible || 'Program Head',
      year: req.body.year || '2026–2027',
      records: [],
      recordCount: 0,
      progress: 0,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating requirement.' });
  }
});

// POST /api/requirements/:id/records - Add a required record under a requirement
router.post('/:id/records', async (req, res) => {
  try {
    const requirementId = Number(req.params.id);
    const recordName = (req.body.record_name || req.body.name || '').trim();
    const description = (req.body.description || '').trim();

    if (!recordName) {
      return res.status(400).json({ error: 'Record name is required.' });
    }

    const reqExists = await pool.query(
      'SELECT requirement_id FROM copc_schema.requirements WHERE requirement_id = $1;',
      [requirementId]
    );
    if (reqExists.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found.' });
    }

    const result = await pool.query(
      `INSERT INTO copc_schema.requirement_records (requirement_id, record_name, description)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [requirementId, recordName, description]
    );
    const created = result.rows[0];
    res.status(201).json({
      ...created,
      id: created.record_id,
      name: created.record_name,
      status: 'Requested',
      assigned: req.body.responsible || '—',
      updated: '—',
      version: '—',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating required record.' });
  }
});

module.exports = router;