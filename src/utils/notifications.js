const pool = require('../db');

async function notifyUsers({
  userIds,
  title,
  message,
  type = 'General',
  documentId = null,
  requestId = null,
  preference = null,
  db = pool,
}) {
  const ids = [...new Set((userIds || []).map(Number).filter(Number.isInteger))];
  if (!ids.length) return [];

  const preferenceColumn = {
    'Document Request': 'document_requests',
    'Revision Request': 'revision_requests',
    'New Submission': 'new_submissions',
    'Document Approval': 'document_approvals',
  }[preference || type];

  const result = await db.query(
    `INSERT INTO copc_schema.notifications
       (user_id, title, message, notification_type, related_document_id, related_request_id)
     SELECT u.user_id, $2, $3, $4, $5, $6
     FROM copc_schema.users u
     LEFT JOIN copc_schema.user_notification_preferences pref ON pref.user_id = u.user_id
     WHERE u.user_id = ANY($1::int[])
       AND ($7::text IS NULL OR COALESCE(
         CASE $7
           WHEN 'document_requests' THEN pref.document_requests
           WHEN 'revision_requests' THEN pref.revision_requests
           WHEN 'new_submissions' THEN pref.new_submissions
           WHEN 'document_approvals' THEN pref.document_approvals
         END, TRUE
       ))`,
    [ids, title, message, type, documentId, requestId, preferenceColumn || null]
  );
  return result.rows;
}

async function notifyRoles(options, excludedUserId = null) {
  const db = options.db || pool;
  const result = await db.query(
    `SELECT user_id
     FROM copc_schema.users
     WHERE role = ANY($1::text[])
       AND ($2::int IS NULL OR user_id <> $2)`,
    [options.roles, excludedUserId]
  );
  return notifyUsers({ ...options, db, userIds: result.rows.map((row) => row.user_id) });
}

module.exports = { notifyUsers, notifyRoles };