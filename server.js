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

app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC;');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

