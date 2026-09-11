# JanSetu Pre-Flight Hackathon Demo Checklist

Use this checklist 15 minutes before presenting JanSetu to judges to ensure a zero-flakiness, high-impact demonstration.

---

## 1. System Readiness Checks

- [ ] **MongoDB Service Running**: Standard MongoDB service running on `localhost:27017` or standalone fallback database initialized.
- [ ] **Backend Server Started**: `npm start` in `backend/` running on `http://localhost:5000`.
- [ ] **Frontend Dev Server Started**: `npm run dev` in `frontend/` running on `http://localhost:5173`.
- [ ] **Database Reseeding Complete**: Executed `node backend/src/utils/seed.js` or `npm run seed`.
- [ ] **API Keys Verified**: `GEMINI_API_KEY` present in `backend/.env`.

---

## 2. Browser Environment Checks

- [ ] **Browser Console Clean**: Open Developer Tools Console (F12) and ensure 0 uncaught errors exist.
- [ ] **Network Tab Clear**: Verify no 404 or CORS errors on active requests.
- [ ] **Browser Zoom**: Set browser zoom to 100% (or 110% for large display projectors).

---

## 3. Demo Account Credentials Matrix

| Role | Access URL | Credentials |
| :--- | :--- | :--- |
| **Citizen** | `http://localhost:5173/#/citizen/login` | Mobile `9876543210` • OTP `123456` |
| **Authority** | `http://localhost:5173/#/authority/login` | Employee ID `AUTH-001` • Password `Password123!` |
| **Worker** | `http://localhost:5173/#/worker/login` | Employee ID `worker-004` • Password `Password123!` |

---

## 4. Key Demo Issues Reference

- `JAN-2026-1042`: Golden Path issue (Open pothole near university gate - Assigned to Ramesh Kumar).
- `JAN-2026-1043`: Critical water leak issue (Green Park Rd).
- `JAN-DEMO-002`: Reopened demo case showing citizen rejection & authority alert.
