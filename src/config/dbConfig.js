require("dotenv").config(); // if you're using a .env file
const sql = require("mssql");

const config = {
  user: process.env.SQL_USER, // e.g., 'youradmin@your-sql-server'
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER, // e.g., 'your-server-name.database.windows.net'
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect(); // Initiate the connection

module.exports = {
  sql,
  pool,
  poolConnect,
};
