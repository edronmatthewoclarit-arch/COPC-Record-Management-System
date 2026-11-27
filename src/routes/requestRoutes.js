const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pool = require('../db');
const { notifyUsers } = require('../utils/notifications');

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads', 'requests');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${suffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF, DOC, DOCX, JPG, or PNG files are allowed.'));
  },
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dr.*, r.requirement_name, rr.record_name,
              requester.name AS requested_by_name, assignee.name AS assigned_to_name
       FROM copc_schema.document_requests dr
       LEFT JOIN copc_schema.requirements r ON r.requirement_id = dr.requirement_id
       LEFT JOIN copc_schema.requirement_records rr ON rr.record_id = dr.record_id
       LEFT JOIN copc_schema.users requester ON requester.user_id = dr.requested_by
       LEFT JOIN copc_schema.users assignee ON assignee.user_id = dr.assigned_to
       ORDER BY dr.created_at DESC, dr.request_id DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching document requests.' });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid request ID.' });

  try {
    const result = await pool.query(
      'SELECT * FROM copc_schema.document_requests WHERE request_id = $1;',
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Document request not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching document request.' });
  }
});

router.post('/', async (req, res) => {
  const requirementId = req.body.requirement_id ? Number(req.body.requirement_id) : null;
  const requesterId = Number(req.body.requested_by || req.user?.user_id);
  const assignedTo = req.body.assigned_to ? Number(req.body.assigned_to) : null;
  const recordId = req.body.record_id ? Number(req.body.record_id) : null;
  const dueDate = req.body.due_date || null;

  if ((requirementId !== null && (!Number.isInteger(requirementId) || requirementId < 1)) ||
      (requirementId === null && !req.body.document_name) ||
      !Number.isInteger(requesterId) || requesterId < 1) {
    return res.status(400).json({
      error: 'requested_by is required, with either a valid requirement_id or document_name.',
    });
  }
  if (assignedTo !== null && (!Number.isInteger(assignedTo) || assignedTo < 1)) {
    return res.status(400).json({ error: 'assigned_to must be a positive integer.' });
  }
  if (recordId !== null && (!Number.isInteger(recordId) || recordId < 1)) {
    return res.status(400).json({ error: 'record_id must be a positive integer.' });
  }
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return res.status(400).json({ error: 'due_date must use YYYY-MM-DD format.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO copc_schema.document_requests
         (requirement_id, record_id, requested_by, assigned_to, request_message,
          document_name, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Open')
       RETURNING *;`,
      [
        requirementId,
        recordId,
        requesterId,
        assignedTo,
        req.body.request_message || '',
        req.body.document_name || null,
        dueDate,
      ]
    );
    const request = inserted.rows[0];
    if (assignedTo) {
      await notifyUsers({
        userIds: [assignedTo],
        title: 'New document request',
        message: req.body.document_name || 'A document has been requested from you.',
        type: 'Document Request',
        requestId: request.request_id,
        db: client,
      });
    }
    await client.query(
      `INSERT INTO copc_schema.activity_logs (user_id, action, description)
       VALUES ($1, 'Document Request Created', $2);`,
      [requesterId, `Created document request #${request.request_id}.`]
    );
    await client.query('COMMIT');
    res.status(201).json({ message: 'Document request created.', request });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating document request.' });
  } finally {
    client.release();
  }
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const validStatuses = [
    'Open', 'Submitted', 'Completed', 'Cancelled',
    'Requested', 'For Revision', 'Resubmitted', 'Approved',
  ];
  const { status, due_date, assigned_to, request_message, document_name } = req.body;
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid request ID.' });
  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid document request status.' });
  }
  if (assigned_to !== undefined && assigned_to !== null && assigned_to !== '' &&
      (!Number.isInteger(Number(assigned_to)) || Number(assigned_to) < 1)) {
    return res.status(400).json({ error: 'assigned_to must be a positive integer or null.' });
  }
  if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return res.status(400).json({ error: 'due_date must use YYYY-MM-DD format.' });
  }

  try {
    const result = await pool.query(
      `UPDATE copc_schema.document_requests
       SET status = COALESCE($1, status),
           due_date = CASE WHEN $2 THEN $3::date ELSE due_date END,
           assigned_to = CASE WHEN $4 THEN $5::int ELSE assigned_to END,
           request_message = CASE WHEN $6 THEN $7 ELSE request_message END,
           document_name = CASE WHEN $8 THEN $9 ELSE document_name END,
           updated_at = CURRENT_TIMESTAMP
       WHERE request_id = $10
       RETURNING *;`,
      [
        status ?? null,
        due_date !== undefined,
        due_date || null,
        assigned_to !== undefined,
        assigned_to === null || assigned_to === '' ? null : Number(assigned_to),
        request_message !== undefined,
        request_message ?? null,
        document_name !== undefined,
        document_name ?? null,
        id,
      ]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Document request not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating document request.' });
  }
});

router.post('/:id/submit', upload.single('file'), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid request ID.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE copc_schema.document_requests
       SET status = 'Submitted',
           attachment_path = COALESCE($1, attachment_path),
           attachment_name = COALESCE($2, attachment_name),
           updated_at = CURRENT_TIMESTAMP
       WHERE request_id = $3
       RETURNING *;`,
      [req.file ? req.file.path.replace(/\\/g, '/') : null, req.file?.originalname || null, id]
    );
    const request = result.rows[0];
    if (!request) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Document request not found.' });
    }

    await notifyUsers({
      userIds: [request.requested_by],
      title: 'Document request submitted',
      message: request.document_name || request.request_message || 'The requested document was submitted.',
      type: 'New Submission',
      requestId: request.request_id,
      db: client,
    });
    await client.query(
      `INSERT INTO copc_schema.activity_logs (user_id, action, description)
       VALUES ($1, 'Document Request Submitted', $2);`,
      [req.user?.user_id || request.assigned_to, `Submitted document request #${request.request_id}.`]
    );
    await client.query('COMMIT');
    res.json({ message: 'Document request submitted.', request });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err.message);
    res.status(500).json({ error: 'Server error while submitting document request.' });
  } finally {
    client.release();
  }
});

module.exports = router;