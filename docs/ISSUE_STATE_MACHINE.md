# JANSETU — CONTROLLED ISSUE STATE MACHINE

## 1. Lifecycle State Diagram

```
[REPORTED] ────► [VERIFIED] ────► [ASSIGNED] ────► [IN_PROGRESS]
                                                         │
                                                         ▼
[CLOSED] ◄──── [CITIZEN_VERIFICATION] ◄──── [RESOLVED]
   │
   └──────────► [REOPENED]
```

---

## 2. Transition Matrix (Enforced by `statusMachine.js`)

| Current Status | Allowed Next Statuses | Action / Trigger |
| :--- | :--- | :--- |
| `REPORTED` | `VERIFIED` | `POST /api/authority/issues/:id/verify` |
| `VERIFIED` | `ASSIGNED`, `IN_PROGRESS` | `POST /api/authority/issues/:id/assign` |
| `ASSIGNED` | `IN_PROGRESS` | Worker starts job |
| `IN_PROGRESS` | `RESOLVED` | Worker uploads resolution proof |
| `RESOLVED` | `CITIZEN_VERIFICATION`, `CLOSED` | Field work completion |
| `CITIZEN_VERIFICATION` | `CLOSED`, `REOPENED` | Citizen accepts / rejects proof |
| `CLOSED` | `REOPENED` | Citizen reopens unresolved issue |
| `REOPENED` | `VERIFIED`, `ASSIGNED` | Re-verified by Authority |

---

## 3. Strict Validation Rule
Arbitrary status changes via patch requests are rejected. Transitions MUST follow defined state pathways.
