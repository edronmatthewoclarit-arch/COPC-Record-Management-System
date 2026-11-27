const express = require('express');
const pool = require('../db');

const router = express.Router();
const preferenceFields = [
  'document_requests',
  'revision_requests',
  'new_submissions',
  'document_approvals',
];

function isValidContacts(contacts) {
  return Array.isArray(contacts) && contacts.every((contact) =>
    contact &&
    ['Email', 'Phone'].includes(contact.contact_type) &&
    typeof contact.contact_value === 'string' &&
    contact.contact_value.trim() &&
    (contact.is_primary === undefined || typeof contact.is_primary === 'boolean')
  );
}

router.get('/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ error: 'A valid user ID is required.' });
  }

  try {
    const user = await pool.query(
      `SELECT u.user_id, u.name, c.email, u.contact_number, u.office_name, u.position
       FROM copc_schema.users u
       JOIN copc_schema.user_credentials c ON c.user_id = u.user_id
       WHERE u.user_id = $1;`,
      [userId]
    );
    if (!user.rows[0]) return res.status(404).json({ error: 'User not found.' });

    await pool.query(
      `INSERT INTO copc_schema.user_settings (user_id)
       VALUES ($1) ON CONFLICT (user_id) DO NOTHING;`,
      [userId]
    );
    await pool.query(
      `INSERT INTO copc_schema.user_notification_preferences (user_id)
       VALUES ($1) ON CONFLICT (user_id) DO NOTHING;`,
      [userId]
    );
    const [settings, preferences, contacts] = await Promise.all([
      pool.query('SELECT theme, updated_at FROM copc_schema.user_settings WHERE user_id = $1;', [userId]),
      pool.query(
        `SELECT document_requests, revision_requests, new_submissions, document_approvals, updated_at
         FROM copc_schema.user_notification_preferences WHERE user_id = $1;`,
        [userId]
      ),
      pool.query(
        `SELECT contact_id, contact_type, contact_value, is_primary
         FROM copc_schema.user_contacts WHERE user_id = $1
         ORDER BY is_primary DESC, contact_id ASC;`,
        [userId]
      ),
    ]);

    const savedContacts = contacts.rows;
    if (!savedContacts.some((contact) => contact.contact_type === 'Email')) {
      savedContacts.push({
        contact_id: null,
        contact_type: 'Email',
        contact_value: user.rows[0].email,
        is_primary: true,
      });
    }
    if (user.rows[0].contact_number &&
        !savedContacts.some((contact) => contact.contact_type === 'Phone')) {
      savedContacts.push({
        contact_id: null,
        contact_type: 'Phone',
        contact_value: user.rows[0].contact_number,
        is_primary: true,
      });
    }
    res.json({
      user: user.rows[0],
      settings: settings.rows[0],
      notification_preferences: preferences.rows[0],
      contacts: savedContacts,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching user settings.' });
  }
});

router.patch('/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ error: 'A valid user ID is required.' });
  }

  const { theme, contact_number, office_name, position, notification_preferences, contacts } = req.body;
  if (theme !== undefined && !['Light', 'Dark'].includes(theme)) {
    return res.status(400).json({ error: 'Theme must be Light or Dark.' });
  }
  if (notification_preferences !== undefined &&
      (!notification_preferences || typeof notification_preferences !== 'object' ||
       Array.isArray(notification_preferences) ||
       preferenceFields.some((field) => notification_preferences[field] !== undefined &&
         typeof notification_preferences[field] !== 'boolean'))) {
    return res.status(400).json({ error: 'Notification preferences must contain boolean values.' });
  }
  if (contacts !== undefined && !isValidContacts(contacts)) {
    return res.status(400).json({
      error: 'Contacts must be an array of Email or Phone contact values.',
    });
  }
  if (contacts !== undefined &&
      ['Email', 'Phone'].some((type) => contacts.filter(
        (contact) => contact.contact_type === type && contact.is_primary === true
      ).length > 1)) {
    return res.status(400).json({ error: 'Only one contact of each type can be primary.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      `UPDATE copc_schema.users
       SET contact_number = CASE WHEN $5 THEN $1 ELSE contact_number END,
           office_name = CASE WHEN $6 THEN $2 ELSE office_name END,
           position = CASE WHEN $7 THEN $3 ELSE position END,
           updated_at = CASE WHEN $5 OR $6 OR $7
                             THEN CURRENT_TIMESTAMP ELSE updated_at END
       WHERE user_id = $4
       RETURNING user_id;`,
      [contact_number ?? null, office_name ?? null, position ?? null, userId,
        contact_number !== undefined, office_name !== undefined, position !== undefined]
    );
    if (!userResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found.' });
    }

    if (theme !== undefined) {
      await client.query(
        `INSERT INTO copc_schema.user_settings (user_id, theme, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE
         SET theme = EXCLUDED.theme, updated_at = CURRENT_TIMESTAMP;`,
        [userId, theme]
      );
    }

    if (notification_preferences) {
      await client.query(
        `INSERT INTO copc_schema.user_notification_preferences (user_id)
         VALUES ($1) ON CONFLICT (user_id) DO NOTHING;`,
        [userId]
      );
      const assignments = [];
      const values = [userId];
      for (const field of preferenceFields) {
        if (notification_preferences[field] !== undefined) {
          values.push(notification_preferences[field]);
          assignments.push(`${field} = $${values.length}`);
        }
      }
      if (assignments.length) {
        assignments.push('updated_at = CURRENT_TIMESTAMP');
        await client.query(
          `UPDATE copc_schema.user_notification_preferences
           SET ${assignments.join(', ')} WHERE user_id = $1;`,
          values
        );
      }
    }

    if (contacts !== undefined) {
      const primaryEmail = contacts.find(
        (contact) => contact.contact_type === 'Email' && contact.is_primary === true
      );
      const primaryPhone = contacts.find(
        (contact) => contact.contact_type === 'Phone' && contact.is_primary === true
      );
      if (primaryEmail || primaryPhone) {
        await client.query(
          `UPDATE copc_schema.user_credentials
           SET email = COALESCE($1, email),
               updated_at = CASE WHEN $1 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE updated_at END
           WHERE user_id = $2;`,
          [primaryEmail?.contact_value.trim() || null, userId]
        );
        if (primaryPhone) {
          await client.query(
            `UPDATE copc_schema.users
             SET contact_number = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2;`,
            [primaryPhone.contact_value.trim(), userId]
          );
        }
      }
      await client.query('DELETE FROM copc_schema.user_contacts WHERE user_id = $1;', [userId]);
      for (const contact of contacts) {
        await client.query(
          `INSERT INTO copc_schema.user_contacts (user_id, contact_type, contact_value, is_primary)
           VALUES ($1, $2, $3, $4);`,
          [userId, contact.contact_type, contact.contact_value.trim(), contact.is_primary === true]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'User settings updated successfully.' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That email address is already in use.' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating user settings.' });
  } finally {
    client.release();
  }
});

module.exports = router;