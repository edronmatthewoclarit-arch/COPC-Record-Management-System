const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { getAllRecords, uploadDocument, reviewDocument } = require('../controllers/documentController');

// Multer storage setup
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

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, or PNG files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });

// Endpoints
router.get('/', getAllRecords);
router.post('/upload', upload.single('file'), uploadDocument);
router.patch('/:id/review', reviewDocument);
router.patch('/:id/status', reviewDocument);

router.get('/:id/comments', async (req, res) => {
  const documentId = Number(req.params.id);
  if (!Number.isInteger(documentId) || documentId < 1) {
    return res.status(400).json({ error: 'Invalid document ID.' });
  }
  try {
    const result = await pool.query(
      `SELECT c.comment_id, c.document_id, c.user_id, u.name AS user_name,
              c.comment, c.created_at
       FROM copc_schema.document_comments c
       LEFT JOIN copc_schema.users u ON u.user_id = c.user_id
       WHERE c.document_id = $1
       ORDER BY c.created_at ASC, c.comment_id ASC;`,
      [documentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching document comments.' });
  }
});

router.post('/:id/comments', async (req, res) => {
  const documentId = Number(req.params.id);
  const comment = String(req.body.comment || req.body.remark || '').trim();
  const userId = req.user?.user_id || req.body.user_id || null;
  if (!Number.isInteger(documentId) || documentId < 1) {
    return res.status(400).json({ error: 'Invalid document ID.' });
  }
  if (!comment) return res.status(400).json({ error: 'Comment cannot be empty.' });
  if (userId !== null && (!Number.isInteger(Number(userId)) || Number(userId) < 1)) {
    return res.status(400).json({ error: 'user_id must be a positive integer.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const document = await client.query(
      'SELECT document_id FROM copc_schema.documents WHERE document_id = $1;',
      [documentId]
    );
    if (!document.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Document not found.' });
    }

    const inserted = await client.query(
      `INSERT INTO copc_schema.document_comments (document_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [documentId, userId ? Number(userId) : null, comment]
    );
    await client.query(
      `INSERT INTO copc_schema.activity_logs (user_id, action, description, related_document_id)
       VALUES ($1, 'Document Comment Added', $2, $3);`,
      [userId ? Number(userId) : null, `Added a comment to document #${documentId}.`, documentId]
    );
    await client.query(
      'UPDATE copc_schema.documents SET updated_at = CURRENT_TIMESTAMP WHERE document_id = $1;',
      [documentId]
    );
    await client.query('COMMIT');
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err.message);
    res.status(500).json({ error: 'Server error while adding document comment.' });
  } finally {
    client.release();
  }
});

module.exports = router;