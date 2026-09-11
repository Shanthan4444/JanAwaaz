# JanSetu 5-Minute Live Hackathon Demo Script

This script walks judges through the complete JanSetu civic issue resolution lifecycle in 5 minutes.

---

## Story Architecture

```
REPORT ──► UNDERSTAND (AI) ──► VERIFY (Authority) ──► ACT (Worker) ──► PROVE (Photo Evidence) ──► VERIFY (Citizen) ──► CLOSE / REOPEN ──► LEARN (Analytics)
```

---

## Minute-by-Minute Script

### 00:00 - 00:45 | The Core Problem & Landing Page
- **Presenter**: *"Most civic portals are black holes. Citizens report potholes or dark streetlights, wait weeks with zero updates, and then receive a notification saying 'Closed' without proof. We built JanSetu to make civic resolution accountable."*
- **Action**: Show Landing Page (`http://localhost:5173/#/`). Point out the **Before vs After JanSetu** visual contrast and the product slogan: **"From civic complaints to verified resolution."**

### 00:45 - 01:30 | Citizen Reporting & AI Civic Intelligence
- **Action**: Click **REPORT AN ISSUE**. Fill title `"Open pothole near university gate"`, select category `Road Damage`, upload photo evidence.
- **Presenter**: *"When a citizen reports an issue, JanSetu AI (powered by Google Gemini with Groq fallback) instantly classifies category, assigns a severity score (91/100), routes to the correct department, and checks for duplicates."*
- **Action**: Show AI Analysis card with Priority 91 score.

### 01:30 - 02:15 | Municipal Authority Verification & Dispatch
- **Action**: Switch to **Authority View** (`/#/authority`).
- **Presenter**: *"Instead of receiving thousands of raw complaint tickets, authority officers see an AI-prioritized action queue. Officer Anil Kumar verifies the report and dispatches Senior Road Technician Ramesh Kumar."*
- **Action**: Click **VERIFY ISSUE** and **ASSIGN WORKER** (select `Ramesh Kumar`).

### 02:15 - 03:00 | Field Worker Execution & Photo Evidence
- **Action**: Switch to **Worker Portal** (`/#/worker`). Open task `JAN-2026-1042`.
- **Presenter**: *"Field worker Ramesh receives the task on site, clicks 'START WORK', and uploads a completion photo after repairs."*
- **Action**: Click **START WORK**, enter resolution note *"Asphalt patch applied and leveled"*, upload proof photo, click **MARK RESOLVED**.

### 03:00 - 04:00 | Core Differentiator: Mandatory Citizen Verification
- **Action**: Switch to **Citizen Track View** (`/#/track/JAN-2026-1042`).
- **Presenter**: *"Here is our biggest differentiator: RESOLVED ≠ CLOSED. Worker resolution is treated as a claim. The citizen who reported the pothole inspects the before/after photos and makes the final call."*
- **Action**: Click `✓ YES, IT'S FIXED`. Trigger confetti celebration and highlight status transition to `CLOSED`.
- **Presenter**: *"If the citizen clicks 'NO, IT'S NOT FIXED', JanSetu reopens the case and alerts the municipal authority."* (Mention `JAN-DEMO-002` reopened demo case).

### 04:00 - 05:00 | Community Signals & AI Civic Analytics
- **Action**: Open **Civic Intelligence Analytics** (`/#/authority/analytics`).
- **Presenter**: *"JanSetu aggregates operational data into civic intelligence. Authority officers see real-time verification SLAs, median resolution times, citizen closure rates, and recurring hotspot areas."*
- **Action**: Highlight the **AI Civic Insights Box**: *"AI identifies that University Road has 23 road damage reports and 7 reopens, recommending a structural road inspection rather than isolated repairs."*
- **Closing**: *"JanSetu closes the loop between citizens, authorities, field workers, and AI."*
