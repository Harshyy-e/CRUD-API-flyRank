# FlyRank Task CRUD API (Containerized Postgres Stack)

A REST API built with Node.js, Express, and PostgreSQL running in Docker containers, managed via Docker Compose.

## Storage Evolution
We transitioned from SQLite to a **containerized PostgreSQL** database server. PostgreSQL is a full-featured, production-ready relational database management system. Running it inside a Docker container ensures consistent behavior across all developer environments without requiring manual local database installations.

## Environment & Secrets Management
Sensitive credentials (database URL, user, password) are loaded securely from environment variables defined in a `.env` file.
- `.env` is listed in `.gitignore` to prevent leaking secrets to GitHub.
- `.env.example` is committed as a reference template for required configuration keys.

## How to Run (One-Command Stack)

1. Clone the repository:
   ```bash
   git clone [https://github.com/Harshyy-e/CRUD-API-flyRank.git](https://github.com/Harshyy-e/CRUD-API-flyRank.git)
   cd CRUD-API-flyRank