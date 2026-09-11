# JANSETU — API CONTRACT SPECIFICATION (PHASE 4)

## 1. Base URL & Common Headers

- **Base URL**: `http://localhost:5001/api` (Configurable via `VITE_API_URL`)
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer <token>` (Required for Authority Endpoints)

---

## 2. Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | UNAUTHENTICATED | FORBIDDEN | INVALID_CREDENTIALS",
    "message": "Human-readable diagnostic error message"
  }
}
```

---

## 3. Auth Endpoints (`/api/auth`)

### `POST /api/auth/authority/login`
```json
// Request
{
  "credential": "anil@jansetu.local",
  "password": "Password123!"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "66c75f1a9b2c3d4e5f6a7b8c",
      "name": "Anil Kumar",
      "email": "anil@jansetu.local",
      "employeeId": "AUTH-001",
      "role": "AUTHORITY",
      "department": "Roads & Infrastructure"
    }
  }
}
```

### `GET /api/auth/me`
Restores current authenticated user profile using `Authorization: Bearer <token>`.

---

## 4. Authority Endpoints (`/api/authority`)

- `GET /api/authority/dashboard` — Returns real metrics & priority queue
- `GET /api/authority/issues` — Filtered issues list
- `GET /api/authority/issues/:issueId` — Single issue detail
- `POST /api/authority/issues/:issueId/verify` — Verifies issue (`REPORTED` → `VERIFIED`)
- `POST /api/authority/issues/:issueId/decision` — Manual decision override
- `POST /api/authority/issues/:issueId/assign` — Assigns worker (`VERIFIED` → `ASSIGNED`)
- `GET /api/authority/workers` — List active workers
- `GET /api/authority/map/issues` — Heatmap issue pins
