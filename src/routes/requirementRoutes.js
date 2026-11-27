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
       LEFT JOIN copc_schema.users u ON rr.assigned_to = u.user_id
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
        requirement_type: rec.requirement_type,
        assigned_to: rec.assigned_to,
        active_status: rec.status,
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
        responsible: r.responsible_role,
        year: r.academic_year,
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
       LEFT JOIN copc_schema.users u ON rr.assigned_to = u.user_id
       WHERE rr.requirement_id = $1
       ORDER BY rr.record_id ASC;`,
      [reqId]
    );
    res.json({
      ...requirement,
      id: requirement.requirement_id,
      name: requirement.requirement_name,
      responsible: requirement.responsible_role,
      year: requirement.academic_year,
      records: recordsResult.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching requirement.' });
  }
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const {
    requirement_name, name, description, category, program_id,
    academic_year, year, responsible_role, responsible, is_required, is_active,
  } = req.body;
  const resolvedName = requirement_name ?? name;
  const resolvedYear = academic_year !== undefined ? academic_year : year;
  const resolvedRole = responsible_role !== undefined ? responsible_role : responsible;

  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid requirement ID.' });
  if (resolvedName !== undefined && !String(resolvedName).trim()) {
    return res.status(400).json({ error: 'Requirement name cannot be empty.' });
  }
  if (program_id !== undefined && program_id !== null &&
      (!Number.isInteger(Number(program_id)) || Number(program_id) < 1)) {
    return res.status(400).json({ error: 'program_id must be a positive integer or null.' });
  }
  if (is_required !== undefined && typeof is_required !== 'boolean') {
    return res.status(400).json({ error: 'is_required must be a boolean.' });
  }
  if (is_active !== undefined && typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean.' });
  }

  try {
    const result = await pool.query(
      `UPDATE copc_schema.requirements
       SET requirement_name = CASE WHEN $1 THEN $2 ELSE requirement_name END,
           description = CASE WHEN $3 THEN $4 ELSE description END,
           category = CASE WHEN $5 THEN $6 ELSE category END,
           program_id = CASE WHEN $7 THEN $8::int ELSE program_id END,
           academic_year = CASE WHEN $9 THEN $10 ELSE academic_year END,
           responsible_role = CASE WHEN $11 THEN $12 ELSE responsible_role END,
           is_required = COALESCE($13, is_required),
           is_active = COALESCE($14, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE requirement_id = $15
       RETURNING *;`,
      [
        resolvedName !== undefined, resolvedName === undefined ? null : String(resolvedName).trim(),
        description !== undefined, description ?? null,
        category !== undefined, category === undefined ? null : String(category).trim(),
        program_id !== undefined, program_id === null ? null : Number(program_id),
        resolvedYear !== undefined, resolvedYear ?? null,
        resolvedRole !== undefined, resolvedRole ?? null,
        is_required ?? null, is_active ?? null, id,
      ]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Requirement not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A requirement with this name already exists.' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating requirement.' });
  }
});

// POST /api/requirements - Create a new COPC requirement
router.post('/', async (req, res) => {
  try {
    const requirementName = (req.body.requirement_name || req.body.name || '').trim();
    const description = (req.body.description || '').trim();
    const category = (req.body.category || 'Other').trim();
    const isRequired = req.body.is_required !== undefined ? req.body.is_required : true;
    const programId = req.body.program_id ? Number(req.body.program_id) : null;
    const academicYear = req.body.academic_year || req.body.year || null;
    const responsibleRole = req.body.responsible_role || req.body.responsible || null;

    if (typeof isRequired !== 'boolean') {
      return res.status(400).json({ error: 'is_required must be a boolean.' });
    }
    if (programId !== null && (!Number.isInteger(programId) || programId < 1)) {
      return res.status(400).json({ error: 'program_id must be a positive integer.' });
    }

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
      `INSERT INTO copc_schema.requirements
         (requirement_name, description, category, program_id, academic_year, responsible_role, is_required)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [requirementName, description, category, programId, academicYear, responsibleRole, isRequired]
    );
    const created = result.rows[0];
    res.status(201).json({
      ...created,
      id: created.requirement_id,
      name: created.requirement_name,
      responsible: created.responsible_role,
      year: created.academic_year,
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
    const requirementType = req.body.requirement_type || 'Required';
    const assignedTo = req.body.assigned_to ? Number(req.body.assigned_to) : null;
    const targetCount = req.body.target_count === undefined ? 1 : Number(req.body.target_count);
    const recordStatus = req.body.status || 'Active';

    if (!recordName) {
      return res.status(400).json({ error: 'Record name is required.' });
    }
    if (!['Required', 'Optional'].includes(requirementType)) {
      return res.status(400).json({ error: 'requirement_type must be Required or Optional.' });
    }
    if (!['Active', 'Inactive'].includes(recordStatus)) {
      return res.status(400).json({ error: 'status must be Active or Inactive.' });
    }
    if (!Number.isInteger(targetCount) || targetCount < 1) {
      return res.status(400).json({ error: 'target_count must be a positive integer.' });
    }
    if (assignedTo !== null && (!Number.isInteger(assignedTo) || assignedTo < 1)) {
      return res.status(400).json({ error: 'assigned_to must be a positive integer.' });
    }

    const reqExists = await pool.query(
      'SELECT requirement_id FROM copc_schema.requirements WHERE requirement_id = $1;',
      [requirementId]
    );
    if (reqExists.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found.' });
    }

    const result = await pool.query(
      `INSERT INTO copc_schema.requirement_records
         (requirement_id, record_name, description, requirement_type, assigned_to, target_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [requirementId, recordName, description, requirementType, assignedTo, targetCount, recordStatus]
    );
    const created = result.rows[0];
    res.status(201).json({
      ...created,
      id: created.record_id,
      name: created.record_name,
      requirement_type: created.requirement_type,
      assigned_to: created.assigned_to,
      active_status: created.status,
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