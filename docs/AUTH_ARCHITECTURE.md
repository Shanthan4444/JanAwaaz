# JANSETU — AUTHENTICATION & AUTHORIZATION ARCHITECTURE

## 1. Core Principle: Separate Login UI, Shared Auth Infrastructure

Jansetu provides distinct login user experiences for Citizens, Municipal Authorities, and Field Workers, but connects them to a unified, shared authentication infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                       LOGIN EXPERIENCES                     │
├──────────────────────┬──────────────────────┬───────────────┤
│    Citizen Login     │   Authority Login    │ Worker Login  │
│ (Mobile + OTP Flow)  │ (Credentials Flow)   │ (Badge + PIN) │
└──────────┬───────────┴──────────┬───────────┴───────┬───────┘
           │                      │                   │
           └──────────────────────┼───────────────────┘
                                  ▼
                 ┌─────────────────────────────────┐
                 │    SHARED AUTH INFRASTRUCTURE   │
                 │   (AuthProvider & authApi.js)   │
                 └────────────────┬────────────────┘
                                  │
                                  ▼
                     Unified Authenticated Identity
                   { userId, name, role, permissions }
```

---

## 2. Shared Identity Schema

All authenticated users, regardless of login mechanism, resolve to the same normalized identity object:

```json
{
  "userId": "USR-1042",
  "name": "Ananya Sharma",
  "role": "CITIZEN", // "CITIZEN" | "AUTHORITY" | "WORKER"
  "permissions": [
    "report:issue",
    "track:issue",
    "verify:resolution",
    "community:support"
  ]
}
```

---

## 3. Role & Permission Matrix

| Role | Auth Method | Core Permissions |
| :--- | :--- | :--- |
| **CITIZEN** | Mobile Number + OTP | `report:issue`, `track:issue`, `verify:resolution`, `community:support`, `volunteer:action` |
| **AUTHORITY** | Officer Credentials + Password | `issues:read`, `issues:assign`, `status:update`, `reports:analytics` |
| **WORKER** | Worker Badge ID + PIN | `tasks:read`, `tasks:update_status`, `tasks:upload_proof` |

---

## 4. Backend Reusable Authorization Middleware

Future backend routes will enforce permissions via reusable middleware:

```javascript
// Middleware Contracts
requireAuth()                  // Verifies JWT token
requireRole(['AUTHORITY'])     // Restricts route by role
requirePermission('issues:assign') // Restricts route by granular permission
```
