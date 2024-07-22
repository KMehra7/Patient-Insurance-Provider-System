// Reference
// JS Data Type To SQL Data Type Map
// String -> sql.NVarChar
// Number -> sql.Int
// Boolean -> sql.Bit
// Date -> sql.DateTime
// Buffer -> sql.VarBinary
// sql.Table -> sql.TVP

const winston = require('winston');
const sql = require('mssql');
const { DB_PASS } = require('./utils/constants');
const config = {
  user: 'admin1',
  password: DB_PASS,
  server: 'jemm.database.windows.net',
  database: 'JEMM',
  encrypt: true
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    winston.info('Connected to MSSQL')
    return pool
  })
  .catch(err => winston.error('Database Connection Failed! Bad Config: ', err));

async function doQuery(res, query, params, callback) {
  try {
    const pool = await poolPromise;
    let request = pool.request();

    // winston.info(query);

    params.forEach(function (p) {
      request.input(p.name, p.sqltype, p.value);
    });

    let result = await request.query(query);
    callback(result);
  } catch (err) {
    winston.error(`doQuery failed due to error: ${err}`, err);
    return res.status(500).send({ error: err });
  }
}

async function doQueryNoRes(query, params, callback) {
  try {
    const pool = await poolPromise;
    let request = pool.request();

    // winston.info(query);

    params.forEach(function (p) {
      request.input(p.name, p.sqltype, p.value);
    });

    let result = await request.query(query);
    callback(result);
  } catch (err) {
    winston.error(`doQuery failed due to error: ${err}`, err);
  }
}

module.exports = {
  sql, poolPromise, doQuery, doQueryNoRes
}