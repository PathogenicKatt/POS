const oracledb = require('oracledb');
require('dotenv').config();

let connection;

async function init() {
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONN_STRING
    });
    console.log('Connected to Oracle');
  } catch (err) {
    console.error('Oracle connection error:', err);
    throw err; // Fail fast if connection fails
  }
}

async function executeQuery(sql, binds = [], options = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, binds, {
      autoCommit: true, // Critical for SALES/SaleDetail inserts
      ...options
    });
    return result;
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = { init, executeQuery };