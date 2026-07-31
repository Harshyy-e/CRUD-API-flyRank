# FlyRank Task CRUD API (Containerized Postgres Stack)

A REST API built with Node.js, Express, and PostgreSQL running in Docker containers, managed via Docker Compose.

## Storage Swap & Architectural Stability
We transitioned from SQLite/in-memory storage to a **PostgreSQL repository layer**.
- **Database Engine:** PostgreSQL running inside a dedicated Docker container.
- **Routes & Logic Unchanged:** All five CRUD endpoints (`GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`), request/response JSON payloads, and HTTP status codes (`200`, `201`, `204`, `400`, `404`) remained **100% identical**. Swapping the underlying storage layer required zero breaking changes to the REST API interface.

## Environment & Secrets Management
All sensitive database credentials are loaded securely at runtime via environment variables.
- `.env` holds the real `DATABASE_URL` string and is listed in `.gitignore` to prevent credential leaks.
- `.env.example` is committed to the repository as a reference template for required keys.

---

## How to Run (One-Command Stack)

1. Clone the repository:
   git clone https://github.com/Harshyy-e/CRUD-API-flyRank.git
   cd CRUD-API-flyRank

2. Create your `.env` file from `.env.example`:
   cp .env.example .env

3. Start the entire stack (Node.js API + PostgreSQL database) with a single command:
   docker compose up -d --build

4. Access the API & Docs:
   - Base API: http://localhost:3000
   - Swagger UI Documentation: http://localhost:3000/docs

5. Stop the stack:
   docker compose down

---

## Persistence Verification across Restarts

Data persistence is guaranteed across container shutdowns using a named Docker volume (`taskdata`) mounted to `/var/lib/postgresql/data` inside the Postgres container.

### How Persistence was Tested & Verified:
1. **Created Data:** Sent a `POST /tasks` request to create a custom task (`"Test persistent task"`).
2. **Restarted Stack:** Executed `docker compose down` followed by `docker compose up -d` to stop and recreate the containers.
3. **Verified Rows:** Executed `curl -i http://localhost:3000/tasks` after startup. The previously created task survived the container destruction and was returned intact from PostgreSQL.

---

## Endpoints

| CRUD Operation | HTTP Method | Endpoint | Description |
| --- | --- | --- | --- |
| Read | GET | `/` | API Info |
| Read | GET | `/health` | API Health Check |
| Read | GET | `/tasks` | List all tasks |
| Read | GET | `/tasks/:id` | Get task by ID |
| Create | POST | `/tasks` | Create a new task |
| Update | PUT | `/tasks/:id` | Update a task by ID |
| Delete | DELETE | `/tasks/:id` | Remove a task by ID |

---

## Sample curl Output

curl -i http://localhost:3000/tasks

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 212

[
  {"id":1,"title":"Learn Express","done":true},
  {"id":2,"title":"Build CRUD API","done":false},
  {"id":3,"title":"Containerize Postgres","done":false}
]

---

## Running Containers (Docker Desktop)

Both the Node.js API container (`api-1`) and PostgreSQL container (`db-1`) are orchestrated using Docker Compose with persistent data volumes as in the ss.
