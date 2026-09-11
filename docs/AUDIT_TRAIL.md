# JANSETU — AUDIT TRAIL & HISTORY LOGGING SPECIFICATION

## 1. Overview

Every state change or authority action generates an immutable audit record in the `issueupdates` MongoDB collection ([`backend/src/models/IssueUpdate.js`](../backend/src/models/IssueUpdate.js)).

---

## 2. IssueUpdate Schema

```typescript
export interface IssueUpdateSchema {
  issueId: string;
  type:
    | "ISSUE_REPORTED"
    | "AI_ANALYZED"
    | "AUTHORITY_VERIFIED"
    | "AUTHORITY_DECISION_UPDATED"
    | "WORKER_ASSIGNED"
    | "WORK_STARTED"
    | "WORK_RESOLVED"
    | "CITIZEN_VERIFIED"
    | "ISSUE_REOPENED";
  message: string;
  actorId: string;
  actorRole: "SYSTEM" | "CITIZEN" | "AUTHORITY" | "WORKER";
  actorName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
```

---

## 3. Audited Actions

- **`ISSUE_REPORTED`**: Citizen registers complaint.
- **`AI_ANALYZED`**: AI Civic Intelligence Engine produces category, priority, & reasoning.
- **`AUTHORITY_VERIFIED`**: Municipal Officer verifies complaint validity.
- **`AUTHORITY_DECISION_UPDATED`**: Municipal Officer overrides priority or department.
- **`WORKER_ASSIGNED`**: Municipal Officer dispatches field worker.
