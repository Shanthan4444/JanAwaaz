# JanSetu Hackathon Demo Fallback & Contingency Plan

This document outlines contingency measures to handle any potential runtime or network issues during live presentations.

---

## Contingency 1: Gemini AI Quota / Network Timeout
- **Symptom**: Gemini API returns 429 quota error or times out.
- **System Safeguard**: Automatic Groq AI fallback (`groqProvider.js`) takes over instantly without breaking backend.
- **Secondary Safeguard**: If both AI providers fail or network is completely offline, JanSetu falls back to heuristic default severity/priority scoring and labels the issue `AI_UNAVAILABLE` while keeping the reporting flow 100% functional.

---

## Contingency 2: MongoDB Connection Failure
- **Symptom**: MongoDB service not running on port 27017.
- **System Safeguard**: Backend database layer (`database.js`) automatically launches an in-memory development MongoDB server instance (`mongodb-memory-server`) on port 52xxx and seeds dev accounts automatically.

---

## Contingency 3: Quick Demo Reset Command
If test data becomes cluttered during rehearsals:
```bash
npm run seed:demo
# or
node backend/src/utils/seed.js
```
This restores all default test users, golden demo issues (`JAN-2026-1042`), and notifications in 2 seconds.
