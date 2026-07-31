require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('./openapi.json');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create table & seed if empty on startup
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  const res = await pool.query('SELECT COUNT(*) FROM tasks;');
  if (parseInt(res.rows[0].count) === 0) {
    await pool.query("INSERT INTO tasks (title, done) VALUES ('Learn Express', true);");
    await pool.query("INSERT INTO tasks (title, done) VALUES ('Build CRUD API', false);");
    await pool.query("INSERT INTO tasks (title, done) VALUES ('Containerize Postgres', false);");
  }
}
initDb().catch(console.error);