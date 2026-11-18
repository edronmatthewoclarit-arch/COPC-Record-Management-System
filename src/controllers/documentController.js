const pool = require('../db');

// Get all records / documents
const getAllRecords = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM copc_schema.documents');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Handle Document Upload
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid PDF file.' });
    }

    const { record_id, uploaded_by, version_number } = req.body;
    const query = `
      INSERT INTO copc_schema.documents 
      (record_id, uploaded_by, file_name, file_path, file_type, file_size_bytes, version_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      record_id, uploaded_by, req.file.originalname, req.file.path, 
      req.file.mimetype, req.file.size, version_number || 1, 'For Review'
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Document uploaded successfully', document: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Handle Document Review Status Update
const reviewDocument = async (req, res) => {
  try {
    const document_id = req.params.id;
    const { reviewer_id, decision, comments } = req.body;

    const validDecisions = ['Approved', 'For Revision', 'Rejected'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision status value.' });
    }

    const reviewQuery = `
      INSERT INTO copc_schema.document_reviews (document_id, reviewer_id, decision, comments)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    await pool.query(reviewQuery, [document_id, reviewer_id, decision, comments]);

    const updateDocQuery = `
      UPDATE copc_schema.documents
      SET status = $1
      WHERE document_id = $2
      RETURNING *;
    `;
    const updatedDoc = await pool.query(updateDocQuery, [decision, document_id]);

    if (updatedDoc.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.json({ message: `Document status successfully updated to ${decision}`, document: updatedDoc.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getAllRecords, uploadDocument, reviewDocument };