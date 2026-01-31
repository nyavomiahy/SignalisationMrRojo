const { Pool } = require("pg");
require("dotenv").config();

// const pool = new Pool({
//   host: process.env.PGHOST,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   database: process.env.PGDATABASE,
//   port: process.env.PGPORT,
// });

const pool = new Pool({
  host: process.env.DB_HOST,   // db
  user: process.env.DB_USER,   // postgres
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

module.exports = pool;
