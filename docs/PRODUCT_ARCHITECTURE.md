# JANSETU — PRODUCT & SYSTEM ARCHITECTURE

## 1. Executive Summary

Jansetu is a civic-tech platform designed from first principles to turn civic problems into coordinated action and verified resolution.

Unlike passive complaint recording portals, Jansetu establishes a closed-loop civic network connecting Citizens, Volunteers, Municipal Authorities, Field Workers, and AI Civic Intelligence.

---

## 2. Overall Architectural Blueprint

The application is structured around a decoupled **Frontend/Backend Architecture** operating over standardized REST API boundaries.

```
                 JANSETU
        ┌──────── FRONTEND ────────┐
        │                          │
        │ Citizen                  │
        │ Authority                │
        │ Worker                   │
        │                          │
        │ Shared Components        │
        │ Shared Auth              │
        │ Shared API Client        │
        └────────────┬─────────────┘
                     │
                     │ HTTP
                     ▼
        ┌──────── BACKEND ─────────┐
        │                          │
        │ Auth                     │
        │ Issues                   │
        │ Citizen                  │
        │ Authority                │
        │ Worker                   │
        │ Community                │
        │ AI                       │
        │ Notifications            │
        └────────────┬─────────────┘
                     │
                     ▼
                  MongoDB
```

---

## 3. Product Core Lifecycle

```
Report
  ↓
AI Understands
  ↓
Prioritize + Route
  ↓
Community + Authority
  ↓
Worker Resolution
  ↓
Citizen Verification
  ↓
Closed (or Reopened)
```

### The 8 Lifecycle States
1. `REPORTED`: Issue reported by citizen with photo evidence and location pin.
2. `VERIFIED`: AI Civic Intelligence categorizes department, calculates priority score (0-100), and clears duplicate checks.
3. `ASSIGNED`: Municipal Authority reviews priority queue and dispatches field worker.
4. `IN_PROGRESS`: Field worker arrives on site and commences repair.
5. `RESOLVED`: Field worker uploads work completion photo proof.
6. `CITIZEN_VERIFICATION`: Awaiting reporting citizen validation.
7. `CLOSED`: Reporter confirms resolution quality; +50 Civic Impact Points awarded.
8. `REOPENED`: Reporter flags incomplete work, re-escalating issue to Authority.

---

## 4. Provider-Independent AI Architecture

Application code calls the unified entry point `aiService.analyzeIssue(issueData)` rather than directly invoking provider APIs.

```
                  aiService.analyzeIssue()
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [ Gemini Provider ]               [ Groq Provider ]
   (Primary Engine)                  (Fallback Engine)
            │                                 │
            └────────────────┬────────────────┘
                             ▼
                 Normalized AI Diagnostic
             (Category, Dept, Priority Score)
```

---

## 5. Future MongoDB Data Model Direction

In future phases, the MongoDB database will store normalized collections:
- `users`: Citizen profiles, contact info, impact scores, badges.
- `issues`: Geolocation, title, description, category, department, priority score, status timeline, evidence URLs.
- `issueUpdates`: Audit log of status transitions and field worker proof attachments.
- `workers`: Field worker profiles, specialization, department, assigned tasks.
- `departments`: Municipal departments (Roads, Water, Sanitation, Lighting).
- `volunteerActions`: Records of citizen support, evidence additions, and volunteer hours.
- `notifications`: Push and SMS alert dispatches.
- `rewards`: Civic impact points and verification badges.
