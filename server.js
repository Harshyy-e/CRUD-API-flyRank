const express = require('express');
const app = express();
const PORT = 3000;
const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('./openapi.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use(express.json()); 

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
  res.status(200).json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ "error": `Task ${id} not found` });
  res.status(200).json(task);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ "error": "Title is required" });
  }
  
  const newTask = { id: nextId++, title: title, done: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ "error": `Task ${id} not found` });
  
  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
      return res.status(400).json({ "error": "Invalid body" });
  }

  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;
  res.status(200).json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return res.status(404).json({ "error": `Task ${id} not found` });
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});