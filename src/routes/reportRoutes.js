const express = require('express');
const pool = require('../db');

const router = express.Router();

function getDateFilters(req, res) {
  const { from, to } = req.query;
  if ((from && Number.isNaN(Date.parse(from))) || (to && Number.isNaN(Date.parse(to)))) {
    res.status(400).json({ error: 'from and to must be valid dates.' });
    return null;
  }
  if (from && to && new Date(from) > new Date(to)) {
    res.status(400).json({ error: 'from must be earlier than or equal to to.' });
    return null;
  }
  return [from || null, to || null];
}

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM copc_schema.programs) AS programs,
         (SELECT COUNT(*)::int FROM copc_schema.requirements WHERE is_active = TRUE) AS active_requirements,
         (SELECT COUNT(*)::int FROM copc_schema.requirement_records WHERE status = 'Active') AS active_records,
         (SELECT COUNT(*)::int FROM copc_schema.documents) AS documents,
         (SELECT COUNT(*)::int FROM copc_schema.documents WHERE status = 'Approved') AS approved_documents,
         (SELECT COUNT(*)::int FROM copc_schema.document_requests
          WHERE status IN ('Open', 'Requested', 'Submitted', 'For Revision', 'Resubmitted')) AS open_requests;`
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while generating report summary.' });
  }
});

router.get('/documents', async (req, res) => {
  const dates = getDateFilters(req, res);
  if (!dates) return;
  const status = req.query.status || null;

  try {
    const result = await pool.query(
      `SELECT d.document_id, d.document_name, d.file_name, d.status, d.version_number,
              d.uploaded_at, d.updated_at, u.name AS uploader_name,
              r.requirement_name, rr.record_name, p.program_name
       FROM copc_schema.documents d
       LEFT JOIN copc_schema.users u ON u.user_id = d.uploaded_by
       LEFT JOIN copc_schema.requirement_records rr ON rr.record_id = d.record_id
       LEFT JOIN copc_schema.requirements r ON r.requirement_id = rr.requirement_id
       LEFT JOIN copc_schema.programs p ON p.program_id = r.program_id
       WHERE ($1::date IS NULL OR d.uploaded_at::date >= $1::date)
         AND ($2::date IS NULL OR d.uploaded_at::date <= $2::date)
         AND ($3::text IS NULL OR d.status = $3)
       ORDER BY d.uploaded_at DESC, d.document_id DESC;`,
      [...dates, status]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while generating document report.' });
  }
});

router.get('/requests', async (req, res) => {
  const dates = getDateFilters(req, res);
  if (!dates) return;
  const status = req.query.status || null;

  try {
    const result = await pool.query(
      `SELECT dr.*, r.requirement_name, rr.record_name,
              requester.name AS requested_by_name, assignee.name AS assigned_to_name
       FROM copc_schema.document_requests dr
       LEFT JOIN copc_schema.requirements r ON r.requirement_id = dr.requirement_id
       LEFT JOIN copc_schema.requirement_records rr ON rr.record_id = dr.record_id
       LEFT JOIN copc_schema.users requester ON requester.user_id = dr.requested_by
       LEFT JOIN copc_schema.users assignee ON assignee.user_id = dr.assigned_to
       WHERE ($1::date IS NULL OR dr.created_at::date >= $1::date)
         AND ($2::date IS NULL OR dr.created_at::date <= $2::date)
         AND ($3::text IS NULL OR dr.status = $3)
       ORDER BY dr.created_at DESC, dr.request_id DESC;`,
      [...dates, status]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while generating request report.' });
  }
});

router.get('/requirements', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.requirement_id, r.requirement_name, r.category, r.program_id,
              r.academic_year, r.responsible_role, r.is_required, r.is_active,
              p.program_name,
              COUNT(DISTINCT rr.record_id)::int AS record_count,
              COUNT(DISTINCT d.document_id)::int AS document_count,
              COUNT(DISTINCT d.document_id) FILTER (WHERE d.status = 'Approved')::int AS approved_count
       FROM copc_schema.requirements r
       LEFT JOIN copc_schema.programs p ON p.program_id = r.program_id
       LEFT JOIN copc_schema.requirement_records rr ON rr.requirement_id = r.requirement_id
       LEFT JOIN copc_schema.documents d ON d.record_id = rr.record_id
       GROUP BY r.requirement_id, p.program_name
       ORDER BY r.requirement_name;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while generating requirement report.' });
  }
});

module.exports = router;