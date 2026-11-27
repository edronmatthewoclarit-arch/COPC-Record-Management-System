const pool = require('../db');
const { notifyRoles, notifyUsers } = require('../utils/notifications');

function formatFileSize(bytes) {
  const num = Number(bytes);
  if (!num || Number.isNaN(num)) return '1.0 MB';
  if (num < 1024 * 1024) return `${Math.max(1, Math.round(num / 1024))} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDocRow(row) {
  const uploadedAt = row.uploaded_at ? new Date(row.uploaded_at) : new Date();
  const normalizedPath = row.file_path ? String(row.file_path).replace(/\\/g, '/') : '';
  return {
    ...row,
    id: row.document_id,
    name: row.document_name || row.file_name,
    requirement: row.requirement_name || 'General',
    record: row.record_name || row.file_name,
    uploader: row.uploader_name || 'Account',
    role: row.uploader_role || 'Faculty',
    program: row.program_name || 'Information Technology',
    date: uploadedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: uploadedAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    version: `v${row.version_number || 1}`,
    size: formatFileSize(row.file_size_bytes),
    remark: row.latest_remark || row.notes || '',
    file_url: normalizedPath ? `/${normalizedPath.replace(/^\.?\//, '')}` : '',
  };
}

async function fetchFormattedDocumentById(clientOrPool, documentId) {
  const query = `
    SELECT
      d.*,
      rr.record_name,
      req.requirement_name,
      u.name AS uploader_name,
      u.role AS uploader_role,
      p.program_name,
      COALESCE(
        (SELECT dc.comment
         FROM copc_schema.document_comments dc
         WHERE dc.document_id = d.document_id
         ORDER BY dc.created_at DESC, dc.comment_id DESC
         LIMIT 1),
        (SELECT dr.comments
         FROM copc_schema.document_reviews dr
         WHERE dr.document_id = d.document_id
         ORDER BY dr.reviewed_at DESC, dr.review_id DESC
         LIMIT 1)
      ) AS latest_remark
    FROM copc_schema.documents d
    LEFT JOIN copc_schema.requirement_records rr ON d.record_id = rr.record_id
    LEFT JOIN copc_schema.requirements req ON rr.requirement_id = req.requirement_id
    LEFT JOIN copc_schema.users u ON d.uploaded_by = u.user_id
    LEFT JOIN copc_schema.programs p ON u.program_id = p.program_id
    WHERE d.document_id = $1;
  `;
  const result = await clientOrPool.query(query, [documentId]);
  return result.rows[0] ? formatDocRow(result.rows[0]) : null;
}

// Get all records / documents
const getAllRecords = async (req, res) => {
  try {
    const query = `
      SELECT
        d.*,
        rr.record_name,
        req.requirement_name,
        u.name AS uploader_name,
        u.role AS uploader_role,
        p.program_name,
        COALESCE(
          (SELECT dc.comment
           FROM copc_schema.document_comments dc
           WHERE dc.document_id = d.document_id
           ORDER BY dc.created_at DESC, dc.comment_id DESC
           LIMIT 1),
          (SELECT dr.comments
           FROM copc_schema.document_reviews dr
           WHERE dr.document_id = d.document_id
           ORDER BY dr.reviewed_at DESC, dr.review_id DESC
           LIMIT 1)
        ) AS latest_remark
      FROM copc_schema.documents d
      LEFT JOIN copc_schema.requirement_records rr ON d.record_id = rr.record_id
      LEFT JOIN copc_schema.requirements req ON rr.requirement_id = req.requirement_id
      LEFT JOIN copc_schema.users u ON d.uploaded_by = u.user_id
      LEFT JOIN copc_schema.programs p ON u.program_id = p.program_id
      ORDER BY d.uploaded_at DESC, d.document_id DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows.map(formatDocRow));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching documents.' });
  }
};

// Handle Document Upload (supports direct API fields and SendFileModal FormData)
const uploadDocument = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      record_id,
      uploaded_by,
      version_number,
      requirement,
      record,
      documentName,
      document_name,
      name,
      notes,
      remarks,
      uploader,
      role,
    } = req.body;

    if (!req.file && !documentName && !name) {
      return res.status(400).json({ error: 'Please upload a valid document file.' });
    }

    await client.query('BEGIN');

    // 1. Resolve uploader user_id
    let resolvedUploadedBy = uploaded_by ? Number(uploaded_by) : req.user?.user_id || null;
    if (!resolvedUploadedBy && uploader) {
      const userByName = await client.query(
        'SELECT user_id FROM copc_schema.users WHERE LOWER(name) = LOWER($1) LIMIT 1;',
        [String(uploader).trim()]
      );
      if (userByName.rows[0]) resolvedUploadedBy = userByName.rows[0].user_id;
    }
    if (!resolvedUploadedBy && role) {
      const userByRole = await client.query(
        'SELECT user_id FROM copc_schema.users WHERE role = $1 ORDER BY user_id ASC LIMIT 1;',
        [String(role).trim()]
      );
      if (userByRole.rows[0]) resolvedUploadedBy = userByRole.rows[0].user_id;
    }
    if (!resolvedUploadedBy) {
      const fallbackUser = await client.query(
        'SELECT user_id FROM copc_schema.users ORDER BY user_id ASC LIMIT 1;'
      );
      if (!fallbackUser.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'No user account found to associate with the upload.' });
      }
      resolvedUploadedBy = fallbackUser.rows[0].user_id;
    }

    // 2. Resolve or create requirement_records.record_id
    let resolvedRecordId = record_id ? Number(record_id) : null;
    if (!resolvedRecordId) {
      const reqName = String(requirement || 'General Compliance').trim();
      const recName = String(
        record || documentName || name || req.file?.originalname || 'Uploaded Document'
      ).trim();

      const existingReq = await client.query(
        'SELECT requirement_id FROM copc_schema.requirements WHERE LOWER(requirement_name) = LOWER($1) LIMIT 1;',
        [reqName]
      );
      let requirementId = existingReq.rows[0]?.requirement_id;
      if (!requirementId) {
        const createdReq = await client.query(
          `INSERT INTO copc_schema.requirements (requirement_name, description, category)
           VALUES ($1, $2, $3)
           RETURNING requirement_id;`,
          [reqName, `Documents for ${reqName}`, 'Other']
        );
        requirementId = createdReq.rows[0].requirement_id;
      }

      const existingRec = await client.query(
        `SELECT record_id FROM copc_schema.requirement_records
         WHERE requirement_id = $1 AND LOWER(record_name) = LOWER($2)
         LIMIT 1;`,
        [requirementId, recName]
      );
      if (existingRec.rows[0]) {
        resolvedRecordId = existingRec.rows[0].record_id;
      } else {
        const createdRec = await client.query(
          `INSERT INTO copc_schema.requirement_records (requirement_id, record_name, description)
           VALUES ($1, $2, $3)
           RETURNING record_id;`,
          [requirementId, recName, `Supporting record for ${recName}`]
        );
        resolvedRecordId = createdRec.rows[0].record_id;
      }
    }

    // 3. Determine next version_number & previous_version_id
    const prevResult = await client.query(
      `SELECT document_id, version_number
       FROM copc_schema.documents
       WHERE record_id = $1
       ORDER BY version_number DESC
       LIMIT 1;`,
      [resolvedRecordId]
    );
    const previousDoc = prevResult.rows[0] || null;
    const nextVersion = version_number
      ? Number(version_number)
      : (previousDoc?.version_number || 0) + 1;

    const fileName =
      req.file?.originalname ||
      `${String(documentName || name || 'document').replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
    const filePath = req.file ? req.file.path.replace(/\\/g, '/') : `uploads/${fileName}`;
    const fileType = req.file?.mimetype || 'application/pdf';
    const fileSize = req.file?.size || 0;

    const insertQuery = `
      INSERT INTO copc_schema.documents
      (record_id, uploaded_by, previous_version_id, document_name, notes, file_name, file_path, file_type, file_size_bytes, version_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'For Review')
      RETURNING document_id;
    `;
    const insertResult = await client.query(insertQuery, [
      resolvedRecordId,
      resolvedUploadedBy,
      previousDoc?.document_id || null,
      String(document_name || documentName || name || fileName).trim(),
      String(notes || remarks || '').trim() || null,
      fileName,
      filePath,
      fileType,
      fileSize,
      nextVersion,
    ]);

    const newDocId = insertResult.rows[0].document_id;

    await client.query(
      `INSERT INTO copc_schema.activity_logs (user_id, action, description, related_document_id)
       VALUES ($1, $2, $3, $4);`,
      [resolvedUploadedBy, 'Document Uploaded', `Uploaded ${fileName} (v${nextVersion})`, newDocId]
    );

    await notifyRoles({
      roles: ['COPC Coordinator', 'Program Head', 'Dean'],
      title: 'New document submission',
      message: `${fileName} was submitted for review.`,
      type: 'New Submission',
      documentId: newDocId,
      db: client,
    }, resolvedUploadedBy);

    const formatted = await fetchFormattedDocumentById(client, newDocId);
    await client.query('COMMIT');

    res.status(201).json({ message: 'Document uploaded successfully', document: formatted });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err.message);
    res.status(500).json({ error: 'Server error while uploading document.' });
  } finally {
    client.release();
  }
};

// Handle Document Review / Status Update (atomic transaction)
const reviewDocument = async (req, res) => {
  const client = await pool.connect();
  try {
    const document_id = Number(req.params.id);
    const { reviewer_id, decision, status, comments, remarks } = req.body;

    const rawDecision = decision || status;
    const statusAliases = {
      Revision: 'For Revision',
      Pending: 'For Review',
      Submitted: 'For Review',
    };
    const normalizedDecision = statusAliases[rawDecision] || rawDecision;
    const validDecisions = ['Approved', 'For Revision', 'Rejected'];
    const validDocStatuses = [...validDecisions, 'For Review', 'Requested'];

    if (!validDocStatuses.includes(normalizedDecision)) {
      return res.status(400).json({ error: 'Invalid decision status value.' });
    }

    await client.query('BEGIN');

    const existingDoc = await client.query(
      'SELECT document_id, file_name, uploaded_by FROM copc_schema.documents WHERE document_id = $1;',
      [document_id]
    );
    if (existingDoc.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Document not found.' });
    }

    let resolvedReviewerId = reviewer_id ? Number(reviewer_id) : req.user?.user_id || null;
    if (!resolvedReviewerId) {
      const reviewerLookup = await client.query(
        `SELECT user_id FROM copc_schema.users
         WHERE role IN ('COPC Coordinator', 'Program Head', 'Dean')
         ORDER BY user_id ASC LIMIT 1;`
      );
      resolvedReviewerId = reviewerLookup.rows[0]?.user_id || null;
    }

    const reviewText = comments ?? remarks ?? '';
    if (validDecisions.includes(normalizedDecision) && resolvedReviewerId) {
      await client.query(
        `INSERT INTO copc_schema.document_reviews (document_id, reviewer_id, decision, comments)
         VALUES ($1, $2, $3, $4);`,
        [document_id, resolvedReviewerId, normalizedDecision, reviewText]
      );
    }

    await client.query(
      'UPDATE copc_schema.documents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE document_id = $2;',
      [normalizedDecision, document_id]
    );

    if (validDecisions.includes(normalizedDecision)) {
      await notifyUsers({
        userIds: [existingDoc.rows[0].uploaded_by],
        title: normalizedDecision === 'For Revision' ? 'Revision requested' : 'Document review update',
        message: `${existingDoc.rows[0].file_name} was marked ${normalizedDecision}.${reviewText ? ` ${reviewText}` : ''}`,
        type: normalizedDecision === 'For Revision' ? 'Revision Request' : 'Document Approval',
        documentId: document_id,
        db: client,
      });
    }

    await client.query(
      `INSERT INTO copc_schema.activity_logs (user_id, action, description, related_document_id)
       VALUES ($1, $2, $3, $4);`,
      [
        resolvedReviewerId,
        `Document ${normalizedDecision}`,
        `${existingDoc.rows[0].file_name} marked as ${normalizedDecision}`,
        document_id,
      ]
    );

    const formatted = await fetchFormattedDocumentById(client, document_id);
    await client.query('COMMIT');

    res.json({
      message: `Document status successfully updated to ${normalizedDecision}`,
      document: formatted,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err.message);
    res.status(500).json({ error: 'Server error while reviewing document.' });
  } finally {
    client.release();
  }
};

module.exports = { getAllRecords, uploadDocument, reviewDocument, formatDocRow };