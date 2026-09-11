# JANSETU — AUTHORITY CONTROL CENTER API SPECIFICATION

## 1. Authentication Endpoints (`/api/auth`)

- `POST /api/auth/authority/login`
  - Input: `{ credential: "anil@jansetu.local", password: "Password123!" }`
  - Output: `{ token: "jwt...", user: { id, name, role, department } }`
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Output: `{ user: { id, name, role, department } }`
- `POST /api/auth/logout`

---

## 2. Authority Endpoints (`/api/authority`)

Headers for all requests: `Authorization: Bearer <token>`

- `GET /api/authority/dashboard`
  - Output: `{ metrics: { critical, high, pending, inProgress }, priorityQueue: [...] }`
- `GET /api/authority/issues`
- `GET /api/authority/issues/:issueId`
- `POST /api/authority/issues/:issueId/verify`
  - Action: Transitions `REPORTED` → `VERIFIED`
- `POST /api/authority/issues/:issueId/decision`
  - Input: `{ priority, department, severity, reason }`
- `POST /api/authority/issues/:issueId/assign`
  - Input: `{ workerId: "worker-004" }`
  - Action: Transitions `VERIFIED` → `ASSIGNED`
- `GET /api/authority/workers`
- `GET /api/authority/map/issues`
