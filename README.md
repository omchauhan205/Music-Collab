# MusicCollab — Online Music Collaboration Platform

A full-stack web application where musicians create projects, upload music, collaborate
with other artists, version tracks, discuss them in comments, and showcase work in a
public portfolio. Administrators moderate uploads and comments and manage users and
platform settings.

Built with **React + Vite + Tailwind CSS** (frontend) and **Spring Boot + PostgreSQL**
(backend).

---

## Features

- **Authentication & roles** — JWT-based auth with `ADMIN` and `MUSICIAN` roles.
- **Projects & collaboration** — create projects, invite collaborators by email, track status.
- **Music files** — upload audio (multipart), edit metadata, upload new versions, download latest.
- **Comments** — per-file discussion threads.
- **Moderation** — uploaded files and comments start `PENDING`; admins approve or reject.
- **Portfolio** — publish tracks to a public portfolio page visible without login.
- **Notifications** — in-app notifications for collaboration and moderation events.
- **Dashboards** — musician and admin dashboards with stats and an activity monitor.
- **Admin tools** — user CRUD, system settings, activity log.
- **Storage** — local filesystem in dev, pluggable S3-compatible storage for production.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, React Router 6, Vite 6, Tailwind CSS v4, Axios |
| Backend    | Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA |
| Database   | PostgreSQL (production) / H2 in PostgreSQL mode (dev) |
| Auth       | JWT (jjwt 0.12) |
| API docs   | springdoc-openapi (Swagger UI) |
| Build      | Maven, npm |

---

## Project Structure

```
UNI-PROJECT2/
├── backend/                 Spring Boot REST API
│   ├── src/main/java/com/musiccollab/
│   │   ├── config/          security, seeding, storage config
│   │   ├── controller/      REST controllers
│   │   ├── dto/             request/response DTOs
│   │   ├── entity/          JPA entities
│   │   ├── repository/      Spring Data repositories
│   │   ├── security/        JWT filter/service
│   │   └── service/         business logic
│   ├── src/main/resources/  application*.yml
│   └── Dockerfile
├── frontend/                React SPA
│   ├── src/
│   │   ├── api/             axios client + endpoint helpers
│   │   ├── components/      layout + UI kit
│   │   ├── context/         auth + toast providers
│   │   └── pages/           route pages (admin / musician / public)
│   └── vite.config.js
├── deploy/                  environment variable templates
├── docs/API.md              REST API reference
├── docker-compose.yml       Postgres + backend
└── render.yaml              Render blueprint (API + DB + static site)
```

---

## Prerequisites

- **Java 21+** (`java -version`)
- **Maven 3.9+** (`mvn -version`)
- **Node.js 20+** and npm
- **PostgreSQL 14+** — only needed for production; dev uses in-memory H2.

---

## Quick Start

### 1. Backend (dev)

Runs with an in-memory H2 database seeded with demo data.

```bash
cd backend
mvn spring-boot:run
```

API: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html
H2 console: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:musiccollab`, user `SA`, empty password)

### 2. Frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173 (the Vite dev server proxies `/api` and `/uploads` to port 8080).

### Demo accounts (seeded)

| Role     | Email                        | Password       |
|----------|------------------------------|----------------|
| Admin    | `admin@musiccollab.com`      | `Password@123` |
| Musician | `aria@musiccollab.com`       | `Password@123` |
| Musician | `leo@musiccollab.com`        | `Password@123` |
| Musician | `mia@musiccollab.com`        | `Password@123` |

---

## Testing

```bash
cd backend
mvn test          # Spring context + integration tests

cd ../frontend
npm run lint      # ESLint
npm run build     # production build
```

---

## Environment Variables

See `deploy/env.backend.example` and `deploy/env.frontend.example` for the full list.
The most important ones:

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `dev` | `dev` (H2) or `prod` (PostgreSQL) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | — | PostgreSQL connection (prod) |
| `JDBC_DATABASE_URL` | — | Full JDBC URL; overrides the pieces above |
| `JWT_SECRET` | dev default | **Change in production** |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:4173` | Allowed frontend origins |
| `STORAGE_TYPE` | `local` | `local` or `s3` |
| `STORAGE_LOCATION` | `./uploads` | Directory for local storage |
| `S3_BUCKET` / `S3_REGION` / `S3_ENDPOINT` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` / `S3_PUBLIC_BASE_URL` | — | S3 object storage settings |
| `SEED_ENABLED` | `true` | Seed demo accounts on first boot |
| `VITE_API_BASE_URL` | `/api` | Backend base URL used by the frontend |

---

## API

Full reference: [`docs/API.md`](docs/API.md).
Interactive docs: Swagger UI at `/swagger-ui.html`.

---

## Deployment

### Option A — Docker Compose (Postgres + backend)

```bash
docker compose up --build
```

The API is available at http://localhost:8080 and persists uploads and DB data in
named volumes. Set a strong `JWT_SECRET` before exposing it.

### Option B — Render (blueprint)

1. Push this repository to GitHub.
2. In Render, **New → Blueprint** and select the repo (`render.yaml` is detected).
3. Render provisions:
   - `musiccollab-db` — PostgreSQL
   - `musiccollab-api` — backend Docker service (health check `/actuator/health`)
   - `musiccollab-web` — frontend static site
4. Update the frontend `VITE_API_BASE_URL` and backend `CORS_ALLOWED_ORIGINS` if your
   service URLs differ from `*.onrender.com` defaults.

> **Note:** Render's free plan does not support persistent disks, so locally stored
> uploads are ephemeral across deploys. Attach a disk (paid) or set `STORAGE_TYPE=s3`
> to persist files.

### Option C — Frontend on Vercel / Netlify

The build is a static SPA. SPA rewrites are already configured via `frontend/vercel.json`
and `frontend/public/_redirects`. Set `VITE_API_BASE_URL` to your deployed backend URL.

```bash
cd frontend
npm run build     # outputs to dist/
```

---

## Moderation Flow

1. A musician uploads a file or posts a comment → status `PENDING`.
2. It is hidden from the public until an admin approves it from the moderation queue.
3. Approved files/comments become visible; rejected ones stay hidden.

---

## License

Academic project — for educational use.
