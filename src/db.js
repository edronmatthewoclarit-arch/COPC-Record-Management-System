// src/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'copc_rms_db',
  password: '1234', // Set as an empty string instead of null or undefined
  port: 5432,
});

module.exports = pool;