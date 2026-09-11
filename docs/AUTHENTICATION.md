# JANSETU — AUTHENTICATION & IDENTITY ARCHITECTURE

## 1. Overview

Jansetu Phase 4 introduces a shared identity architecture.

All user personas (**CITIZEN**, **AUTHORITY**, **WORKER**) reside in a single MongoDB `users` collection ([`backend/src/models/User.js`](file:///Users/rohan/Desktop/JanSetu/backend/src/models/User.js)).

---

## 2. Shared Identity Schema

```typescript
export interface UserSchema {
  _id: string;
  name: string;
  email?: string;
  employeeId?: string;
  mobile?: string;
  passwordHash: string;
  role: "CITIZEN" | "AUTHORITY" | "WORKER";
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Password Hashing & Security Rules

- Passwords are **NEVER stored in plaintext**.
- Hashes are generated using **bcryptjs** (`bcrypt.hash(password, 10)`).
- Login endpoints (`POST /api/auth/authority/login`) check `bcrypt.compare`.
- Generic error response (`"Invalid credentials."`) is returned on authentication failures to prevent account enumeration.
- Inactive accounts (`isActive: false`) are denied login (`403 Forbidden`).

---

## 4. Session & Token Management

- JWT tokens are signed using `process.env.JWT_SECRET` with 24-hour expiry.
- Token payload contains minimal identity metadata (`id`, `name`, `role`, `department`, `employeeId`). Sensitive attributes (like `passwordHash`) are strictly excluded.
- Passed in `Authorization: Bearer <token>` HTTP header.
