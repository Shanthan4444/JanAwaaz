# JanSetu Team Handoff & Developer Guide

This document provides complete instructions for setting up, running, and demonstrating JanSetu **MVP 1.0**.

---

## 1. System Requirements

- Node.js (v18+)
- npm (v9+)
- MongoDB (v6+ or automatic in-memory fallback)

---

## 2. Quick Setup & Start Commands

```bash
# 1. Environment File Setup
cp .env.example backend/.env

# 2. Install Backend & Frontend Dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Seed Demo Database
cd ../backend && npm run seed

# 4. Start Application Servers
# Terminal 1: Backend Server (http://localhost:5000)
cd backend && npm start

# Terminal 2: Frontend Dev Server (http://localhost:5173)
cd frontend && npm run dev
```

---

## 3. Demo Credentials Matrix

| Role | Access URL | Mobile / ID | Password / OTP |
| :--- | :--- | :--- | :--- |
| **Citizen** | `http://localhost:5173/#/citizen/login` | `9876543210` | OTP `123456` |
| **Authority** | `http://localhost:5173/#/authority/login` | `AUTH-001` | `Password123!` |
| **Worker** | `http://localhost:5173/#/worker/login` | `worker-004` | `Password123!` |

---

## 4. Key Golden Demo Issue

- **Issue ID**: `JAN-2026-1042`
- **Title**: Open pothole near university gate
- **Category**: Road Damage (Roads & Infrastructure)
- **Status**: ASSIGNED to Ramesh Kumar (`worker-004`)
- **Location**: University Road (Sector 14)
