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


async function initDbWithRetry(retries = 10, delay = 2000) {
  while (retries > 0) {
    try {
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
      console.log('Database initialized successfully.');
      return;
    } catch (err) {
      console.log(`Database connection failed (${err.message}). Retrying in ${delay / 1000}s...`);
      retries -= 1;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  console.error('Could not connect to database after maximum retries.');
}

app.get('/', (req, res) => {
  res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.json({ "status": "ok" });
});


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

app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }
    const result = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *;',
      [title, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
      return res.status(400).json({ error: "Invalid body" });
    }

    const check = await pool.query('SELECT * FROM tasks WHERE id = $1;', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }

    const updatedTitle = title !== undefined ? title : check.rows[0].title;
    const updatedDone = done !== undefined ? done : check.rows[0].done;

    const result = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *;',
      [updatedTitle, updatedDone, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM tasks WHERE id = $1;', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initDbWithRetry();
});