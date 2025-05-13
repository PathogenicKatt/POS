const oracledb = require('oracledb');
require('dotenv').config();

// Create a connection pool
let pool;

async function init() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONN_STRING,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
      poolAlias: 'default' // Explicitly set pool alias
    });
    console.log('Oracle connection pool created');
  } catch (err) {
    console.error('Oracle connection error:', err);
    throw err;
  }
}

async function executeQuery(sql, binds = []) {
  let connection;
  try {
    connection = await oracledb.getConnection('default'); // Use the named pool
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    return result.rows;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

module.exports = { init, executeQuery };