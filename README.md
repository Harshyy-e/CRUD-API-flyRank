# FlyRank Task CRUD API (SQLite Backed)

A REST API built with Node.js, Express, and SQLite that manages a persistent to-do list.

## Why SQLite?
We transitioned from an in-memory storage array to **SQLite** because SQLite provides persistent storage directly on disk inside a single file (`tasks.db`). It requires zero server setup, is lightweight, and ensures our data survives server restarts without needing a complex database cluster.

## Database Location
The database is automatically created as `tasks.db` in the root folder when the app runs for the first time. It is added to `.gitignore` so fresh clones start clean with the seed data.

## How to Run
1. Install dependencies: `npm install`
2. Start the server: `node server.js`
3. View Swagger Docs: Visit `http://localhost:3000/docs` in your browser.

## Endpoints

| CRUD Operation | HTTP Method | Endpoint | Meaning |
| --- | --- | --- | --- |
| Read | GET | `/` | API Info |
| Read | GET | `/health` | Health Check |
| Read | GET | `/tasks` | List all tasks |
| Read | GET | `/tasks/:id` | Get task by ID |
| Create | POST | `/tasks` | Add a new task |
| Update | PUT | `/tasks/:id` | Update task by ID |
| Delete | DELETE | `/tasks/:id` | Remove task by ID |

## Example Hand-Run SQL Query
Executed directly in DB Browser for SQLite:
```sql
SELECT * FROM tasks WHERE done = 1;