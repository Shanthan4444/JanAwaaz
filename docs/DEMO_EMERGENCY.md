# JanSetu Live Presentation Emergency Runbook

If any unexpected technical issues occur during live judge presentations, follow these recovery procedures immediately.

---

## Emergency Protocol 1: AI Service Offline or Timeout
- **Action**: Do NOT pause the presentation.
- **Explanation**: JanSetu automatically falls back to Groq AI provider or heuristic default severity scoring (`AI_UNAVAILABLE`).
- **Judges Talking Point**: *"JanSetu is built with non-blocking AI failure isolation. If cloud AI APIs experience latency or downtime, the core civic reporting and worker dispatch engine continues operating without interruption."*

---

## Emergency Protocol 2: Database Connection Lost
- **Action**: Run `npm run seed` in `backend/` terminal to instantly re-initialize the standalone in-memory database and seed test accounts in 2 seconds.

---

## Emergency Protocol 3: Quick Demo Reseed
```bash
cd backend && npm run seed
```
This restores all default test users, golden demo issues (`JAN-2026-1042`), and notifications.
