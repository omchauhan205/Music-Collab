# MusicCollab REST API

Base URL (dev): `http://localhost:8080/api`

All request/response bodies are JSON unless noted. Authenticated endpoints require a
bearer token: `Authorization: Bearer <jwt>`.

Interactive documentation (Swagger UI): `http://localhost:8080/swagger-ui.html`

---

## Authentication

### POST `/auth/register`

Create a musician account.

Request:
```json
{ "name": "New Artist", "email": "artist@example.com", "password": "Password@123" }
```

Response `201`:
```json
{
  "token": "<jwt>",
  "user": { "id": 5, "name": "New Artist", "email": "artist@example.com", "role": "MUSICIAN" }
}
```

### POST `/auth/login`

```json
{ "email": "aria@musiccollab.com", "password": "Password@123" }
```

Response `200`: same shape as register.

### GET `/auth/me`

Returns the current user. Requires auth.

---

## Projects

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/projects` | yes | List projects the caller belongs to (admins see all) |
| GET    | `/projects/{id}` | yes | Get one project |
| POST   | `/projects` | yes | Create a project |
| PUT    | `/projects/{id}` | owner | Update a project |
| DELETE | `/projects/{id}` | owner | Delete a project |
| POST   | `/projects/{id}/members` | owner | Add collaborator by email |
| DELETE | `/projects/{id}/members/{userId}` | owner | Remove collaborator |

Create/update body:
```json
{ "title": "New EP", "description": "Demo", "genre": "Rock", "deadline": "2026-12-31", "status": "OPEN" }
```
`status` ∈ `OPEN | IN_PROGRESS | COMPLETED`.

Add member body:
```json
{ "email": "leo@musiccollab.com" }
```

---

## Music Files

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/files` | yes | List accessible files |
| GET    | `/files/{id}` | yes | Get file details |
| POST   | `/files` | yes | Upload a file (multipart) |
| PUT    | `/files/{id}` | owner | Update metadata |
| DELETE | `/files/{id}` | owner | Delete a file |
| GET    | `/files/{id}/versions` | yes | List versions |
| POST   | `/files/{id}/versions` | owner | Upload a new version (multipart) |
| GET    | `/files/{id}/download?versionId=` | yes | Download a version (latest if omitted) |
| GET    | `/files/{id}/comments` | yes | List comments |
| POST   | `/files/{id}/comments` | yes | Add a comment |

Upload (`multipart/form-data`): `name` (required), `description`, `tags`, `projectId`, `file`.
New version: `notes`, `file`.

Uploaded files and comments are created with `moderationStatus: "PENDING"`.

Update metadata body:
```json
{ "name": "Track v1.5", "description": "mix 2", "tags": "rock,demo", "projectId": 1 }
```

Add comment body:
```json
{ "text": "Great mix — let's boost the vocals!" }
```

---

## Portfolio

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/portfolio` | yes | Caller's portfolio items |
| POST   | `/portfolio` | yes | Create item |
| PUT    | `/portfolio/{id}` | owner | Update item |
| DELETE | `/portfolio/{id}` | owner | Delete item |

Create/update body (`type` ∈ `SONG | ALBUM | EP`):
```json
{ "title": "Midnight Echoes", "type": "ALBUM", "description": "Debut", "releaseDate": "2026-11-01", "musicFileId": 3 }
```

---

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/notifications` | yes | List notifications |
| GET    | `/notifications/unread-count` | yes | Unread count |
| PATCH  | `/notifications/{id}/read` | yes | Mark one as read |
| POST   | `/notifications/read-all` | yes | Mark all as read |

---

## Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/dashboard` | yes | Musician stats (projects, files, etc.) |

---

## Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/users/musicians` | yes | List musicians |

---

## Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/public/musicians` | List public musicians |
| GET    | `/public/musicians/{id}` | Public musician profile |
| GET    | `/public/portfolio/{userId}` | Public portfolio for a user |
| GET    | `/public/health` | Public health check |

---

## Admin (role `ADMIN`)

### Dashboard & activity
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/admin/dashboard` | Platform stats |
| GET    | `/admin/activity` | Activity log |
| GET    | `/admin/projects` | All projects |
| GET    | `/admin/portfolio` | All portfolio items |

### Moderation
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/admin/moderation/files` | Pending files |
| GET    | `/admin/moderation/comments` | Pending comments |
| PATCH  | `/admin/moderation/files/{id}` | Set `status: APPROVED \| REJECTED`, optional `note` |
| PATCH  | `/admin/moderation/comments/{id}` | Set `status`, optional `note` |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/admin/users` | List users |
| GET    | `/admin/users/{id}` | Get user |
| POST   | `/admin/users` | Create user |
| PUT    | `/admin/users/{id}` | Update user |
| DELETE | `/admin/users/{id}` | Delete user |

### Settings
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/admin/settings` | List settings |
| PUT    | `/admin/settings/{key}` | Update a setting (`{ "settingValue": "..." }`) |

---

## Error format

```json
{ "timestamp": "2026-01-01T00:00:00Z", "status": 400, "error": "Bad Request", "message": "Validation failed", "path": "/api/..." }
```

| Status | Meaning |
|--------|---------|
| `400` | Validation error / bad request |
| `401` | Missing or invalid token |
| `403` | Authenticated but not allowed (e.g. non-admin on `/admin/**`) |
| `404` | Resource not found or not accessible to the caller |
