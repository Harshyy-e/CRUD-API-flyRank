# FlyRank Task CRUD API

A simple REST API built with Node.js and Express that manages a to-do list in-memory.

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

## Example curl Command
```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'