const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../db');
const { getAllRecords, uploadDocument, formatDocRow } = require('../controllers/documentController');

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

function formatTimeAgo(dateVal) {
  if (!dateVal) return 'Just now';
  const diffMin = Math.max(0, Math.floor((Date.now() - new Date(dateVal).getTime()) / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// GET /api/copc/dashboard
router.get('/copc/dashboard', async (req, res) => {
  try {
    const reqCountRes = await pool.query(
      'SELECT COUNT(*)::int AS total FROM copc_schema.requirements WHERE is_active = TRUE;'
    );
    const docStatsRes = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'Approved')::int AS approved,
         COUNT(*) FILTER (WHERE status IN ('For Review', 'Requested'))::int AS pending,
         COUNT(*) FILTER (WHERE status = 'For Revision')::int AS for_revision,
         COUNT(*)::int AS total_docs
       FROM copc_schema.documents;`
    );

    const totalRequirements = reqCountRes.rows[0]?.total || 0;
    const stats = docStatsRes.rows[0] || { approved: 0, pending: 0, for_revision: 0, total_docs: 0 };
    const completionPercentage = stats.total_docs
      ? Math.round((stats.approved / stats.total_docs) * 100)
      : 0;

    const activityRes = await pool.query(
      `SELECT a.*, u.name AS user_name, u.role AS user_role
       FROM copc_schema.activity_logs a
       LEFT JOIN copc_schema.users u ON a.user_id = u.user_id
       ORDER BY a.created_at DESC, a.activity_id DESC
       LIMIT 10;`
    );

    const recentActivities = activityRes.rows.map((a) => ({
      name: a.user_name || 'System',
      action: a.action,
      meta: a.description || a.user_role || '',
      time: formatTimeAgo(a.created_at),
      tone: a.action.toLowerCase().includes('approved')
        ? 'approval'
        : a.action.toLowerCase().includes('revision')
          ? 'revision'
          : 'upload',
    }));

    const docUpdatesRes = await pool.query(
      `SELECT d.file_name, d.status, d.uploaded_at, u.name AS uploader_name, req.requirement_name
       FROM copc_schema.documents d
       LEFT JOIN copc_schema.users u ON d.uploaded_by = u.user_id
       LEFT JOIN copc_schema.requirement_records rr ON d.record_id = rr.record_id
       LEFT JOIN copc_schema.requirements req ON rr.requirement_id = req.requirement_id
       ORDER BY d.uploaded_at DESC, d.document_id DESC
       LIMIT 5;`
    );

    const documentUpdates = docUpdatesRes.rows.map((d) => ({
      name: d.file_name,
      action: `(${d.status})`,
      meta: `${d.requirement_name || 'COPC'} • ${d.uploader_name || 'Uploader'}`,
      time: formatTimeAgo(d.uploaded_at),
      tone: d.status === 'Approved' ? 'approval' : 'upload',
    }));

    res.json({
      progress: {
        completionPercentage,
        totalRequirements,
        approved: stats.approved,
        pending: stats.pending,
        forRevision: stats.for_revision,
      },
      recentActivities,
      documentUpdates,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching coordinator dashboard.' });
  }
});

// GET /api/program-head/dashboard
router.get('/program-head/dashboard', async (req, res) => {
  try {
    const reqStats = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'Open')::int AS pending_requests,
         COUNT(*) FILTER (WHERE status = 'Submitted')::int AS submitted
       FROM copc_schema.document_requests;`
    );
    const docStats = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'For Revision')::int AS for_revision,
         COUNT(*) FILTER (WHERE status = 'Approved')::int AS approved
       FROM copc_schema.documents;`
    );

    const requestsRes = await pool.query(
      `SELECT dr.*, r.requirement_name, req_by.name AS requested_by_name
       FROM copc_schema.document_requests dr
       LEFT JOIN copc_schema.requirements r ON dr.requirement_id = r.requirement_id
       LEFT JOIN copc_schema.users req_by ON dr.requested_by = req_by.user_id
       ORDER BY dr.created_at DESC
       LIMIT 5;`
    );

    res.json({
      stats: {
        pendingRequests: reqStats.rows[0]?.pending_requests || 0,
        submitted: reqStats.rows[0]?.submitted || 0,
        forRevision: docStats.rows[0]?.for_revision || 0,
        approved: docStats.rows[0]?.approved || 0,
      },
      requestsRequiringAction: requestsRes.rows,
      recentSubmissionActivity: [],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching program head dashboard.' });
  }
});

// Program Head Documents
router.get('/program-head/documents', getAllRecords);
router.post('/program-head/documents/upload', upload.single('file'), uploadDocument);

router.put('/program-head/documents/:id/resubmit', upload.single('file'), async (req, res) => {
  const client = await pool.connect();
  try {
    const prevId = Number(req.params.id);
    const prevRes = await client.query('SELECT * FROM copc_schema.documents WHERE document_id = $1;', [prevId]);
    if (prevRes.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    const prev = prevRes.rows[0];
    await client.query('BEGIN');

    const maxVerRes = await client.query(
      'SELECT COALESCE(MAX(version_number), 0)::int AS max_ver FROM copc_schema.documents WHERE record_id = $1;',
      [prev.record_id]
    );
    const nextVer = (maxVerRes.rows[0]?.max_ver || 1) + 1;
    const fileName = req.file?.originalname || prev.file_name;
    const filePath = req.file ? req.file.path.replace(/\\/g, '/') : prev.file_path;

    const inserted = await client.query(
      `INSERT INTO copc_schema.documents
       (record_id, uploaded_by, previous_version_id, file_name, file_path, file_type, file_size_bytes, version_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'For Review')
       RETURNING *;`,
      [
        prev.record_id,
        req.user?.user_id || prev.uploaded_by,
        prev.document_id,
        fileName,
        filePath,
        req.file?.mimetype || prev.file_type,
        req.file?.size || prev.file_size_bytes,
        nextVer,
      ]
    );

    await client.query('COMMIT');
    res.json({ message: 'Document resubmitted', document: formatDocRow(inserted.rows[0]) });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err.message);
    res.status(500).json({ error: 'Server error while resubmitting document.' });
  } finally {
    client.release();
  }
});

// Document Requests (Program Head & Coordinator)
async function listRequests(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         dr.*,
         r.requirement_name,
         rr.record_name,
         rb.name AS requested_by_name,
         rb.role AS requested_by_role,
         at_u.name AS assigned_to_name,
         at_u.role AS assigned_to_role
       FROM copc_schema.document_requests dr
       LEFT JOIN copc_schema.requirements r ON dr.requirement_id = r.requirement_id
       LEFT JOIN copc_schema.requirement_records rr ON dr.record_id = rr.record_id
       LEFT JOIN copc_schema.users rb ON dr.requested_by = rb.user_id
       LEFT JOIN copc_schema.users at_u ON dr.assigned_to = at_u.user_id
       ORDER BY dr.created_at DESC, dr.request_id DESC;`
    );

    const formatted = result.rows.map((row) => ({
      id: row.request_id,
      request_id: row.request_id,
      title: row.record_name || row.requirement_name || 'Document Request',
      documentName: row.record_name || row.requirement_name || 'Document Request',
      requestedDocument: row.requirement_name || 'COPC Requirement',
      requestedBy: row.assigned_to_name || row.requested_by_name || 'Representative',
      uploader: row.assigned_to_name || row.requested_by_name || 'Representative',
      role: row.assigned_to_role || row.requested_by_role || 'Faculty',
      dateRequested: new Date(row.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      dueDate: row.due_date
        ? new Date(row.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '—',
      status: row.status === 'Open' ? 'Requested' : row.status,
      lastActivity: formatTimeAgo(row.created_at),
      details: row.request_message || '',
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching requests.' });
  }
}

async function createRequest(req, res) {
  try {
    const { requirement_id, requirement, record_id, requested_by, assigned_to, recipient, request_message, remarks, due_date } =
      req.body;

    let reqId = requirement_id ? Number(requirement_id) : null;
    if (!reqId) {
      const reqName = String(requirement || 'Faculty Information').trim();
      const reqRow = await pool.query(
        'SELECT requirement_id FROM copc_schema.requirements WHERE LOWER(requirement_name) = LOWER($1) LIMIT 1;',
        [reqName]
      );
      if (reqRow.rows[0]) {
        reqId = reqRow.rows[0].requirement_id;
      } else {
        const createdReq = await pool.query(
          `INSERT INTO copc_schema.requirements (requirement_name, description, category)
           VALUES ($1, $2, 'Other') RETURNING requirement_id;`,
          [reqName, `Documents for ${reqName}`]
        );
        reqId = createdReq.rows[0].requirement_id;
      }
    }

    let requestedById = requested_by ? Number(requested_by) : req.user?.user_id || null;
    if (!requestedById) {
      const u = await pool.query('SELECT user_id FROM copc_schema.users ORDER BY user_id ASC LIMIT 1;');
      if (!u.rows[0]) {
        return res.status(400).json({ error: 'No user found to create request.' });
      }
      requestedById = u.rows[0].user_id;
    }

    let assignedToId = assigned_to ? Number(assigned_to) : null;
    if (!assignedToId && recipient) {
      const cleanName = String(recipient).split('—')[0].trim();
      const u = await pool.query(
        'SELECT user_id FROM copc_schema.users WHERE LOWER(name) = LOWER($1) LIMIT 1;',
        [cleanName]
      );
      assignedToId = u.rows[0]?.user_id || null;
    }

    const inserted = await pool.query(
      `INSERT INTO copc_schema.document_requests
       (requirement_id, record_id, requested_by, assigned_to, request_message, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Open')
       RETURNING *;`,
      [reqId, record_id || null, requestedById, assignedToId, request_message || remarks || '', due_date || null]
    );

    res.status(201).json({ message: 'Document request created', request: inserted.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating document request.' });
  }
}

router.get('/program-head/requests', listRequests);
router.post('/program-head/requests', createRequest);
router.get('/requests', listRequests);
router.post('/requests', createRequest);

router.get('/program-head/requests/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM copc_schema.document_requests WHERE request_id = $1;', [
      Number(req.params.id),
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching request.' });
  }
});

router.post('/program-head/requests/:id/submit', upload.single('file'), async (req, res) => {
  try {
    const reqId = Number(req.params.id);
    const updated = await pool.query(
      `UPDATE copc_schema.document_requests SET status = 'Submitted' WHERE request_id = $1 RETURNING *;`,
      [reqId]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    res.json({ message: 'Request document submitted', request: updated.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while submitting request document.' });
  }
});

module.exports = router;
