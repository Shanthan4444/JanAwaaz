# JANSETU — AUTHORITY CONTROL CENTER ARCHITECTURE

## 1. Overview

The **Authority Control Center** connects reported citizen complaints to municipal resolution teams.

Municipal Officers log into `/authority/login`, view department-prioritized issues, inspect AI diagnostic recommendations, verify issue reports, override priorities when necessary, and assign field technicians.

---

## 2. Component Pipeline

```
CITIZEN REPORT ──► MONGODB ──► AI ANALYSIS
                                  │
                                  ▼
                         AUTHORITY COMMAND CENTER
                        (/api/authority/dashboard)
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼                                           ▼
   VERIFY ISSUE REPORT                        HUMAN DECISION OVERRIDE
 (POST /issues/:id/verify)                  (POST /issues/:id/decision)
            │                                           │
            └─────────────────────┬─────────────────────┘
                                  ▼
                        ASSIGN FIELD WORKER
                     (POST /issues/:id/assign)
                                  │
                                  ▼
                     TIMELINE & AUDIT RECORDED
                          (IssueUpdate)
```

---

## 3. Human Oversight Principle

- AI output (`aiAnalysis`) is treated as a **Recommendation**, NOT an autonomous decision.
- Municipal Officers have full authority to override priority, category, department, or severity.
- Overrides are saved separately in `authorityDecision` object, preserving the original AI baseline for model evaluation and auditability.
