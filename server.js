const express = require('express');
const Database = require('better-sqlite3');
const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('./openapi.json');
const app = express();
const PORT = 3000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use(express.json()); 

// Connect to (or create) SQLite database file
const db = new Database('tasks.db');

// Create the tasks table if it does not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// Seed 3 initial tasks ONLY IF table is empty
const countStmt = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const { count } = countStmt.get();

if (count === 0) {
  const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insertStmt.run('Learn Express', 1);
  insertStmt.run('Build CRUD API', 0);
  insertStmt.run('Connect to SQLite', 0);
}

app.get('/', (req, res) => {
  res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.json({ "status": "ok" });
});

let tasks = [
  { id: 1, title: "Learn Express", done: true },
  { id: 2, title: "Build CRUD API", done: false },
  { id: 3, title: "Publish to GitHub", done: false }
];
let nextId = 4;

app.get('/tasks', (req, res) => {
  const stmt = db.prepare('SELECT * FROM tasks');
  const tasks = stmt.all().map(t => ({ ...t, done: Boolean(t.done) }));
  res.status(200).json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = stmt.get(id);

  if (!task) {
    return res.status(404).json({ "error": `Task ${id} not found` });
  }

  res.status(200).json({ ...task, done: Boolean(task.done) });
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ "error": "Title is required" });
  }

  const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const info = stmt.run(title, 0);

  const newTask = {
    id: info.lastInsertRowid,
    title: title,
    done: false
  };

  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // Check if task exists
  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const existingTask = getStmt.get(id);

  if (!existingTask) {
    return res.status(404).json({ "error": `Task ${id} not found` });
  }

  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
    return res.status(400).json({ "error": "Invalid body" });
  }

  const updatedTitle = title !== undefined ? title : existingTask.title;
  const updatedDone = done !== undefined ? (done ? 1 : 0) : existingTask.done;

  const updateStmt = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
  updateStmt.run(updatedTitle, updatedDone, id);

  res.status(200).json({
    id: id,
    title: updatedTitle,
    done: Boolean(updatedDone)
  });
});

app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const info = stmt.run(id);

  if (info.changes === 0) {
    return res.status(404).json({ "error": `Task ${id} not found` });
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});