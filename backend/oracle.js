try {
  oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_19_21' });
} catch (err) {
  console.error('Oracle client init error:', err);
}

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
  }
}

async function executeQuery(sql, binds = []) {
  try {
    const result = await connection.execute(sql, binds);
    return result.rows;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

module.exports = { init, executeQuery };