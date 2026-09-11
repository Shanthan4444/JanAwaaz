# JanSetu Release Notes — Version 1.0 (Release Candidate)

**Release Date**: August 22, 2026  
**Status**: RELEASE CANDIDATE READY FOR HACKATHON DEMO

---

## Release Summary

JanSetu MVP 1.0 is a complete, production-hardened civic intelligence and issue resolution platform. It closes the accountability gap in public service delivery by enforcing mandatory **Citizen Verification** (`RESOLVED ≠ CLOSED`).

---

## Included Modules

1. **Citizen Reporting & Tracking (`/report`, `/track/:id`, `/citizen`)**:
   - Mobile OTP authentication (`123456` dev fallback).
   - Image evidence upload & GPS location tagging.
   - Interactive before/after resolution inspection & confetti closure celebration.
   - Reopen safeguard with rejection reason audit log.
2. **AI Civic Intelligence Engine (`aiService.js`)**:
   - Google Gemini 2.5 Flash API (Primary) + Groq Llama3 70B API (Fallback).
   - Categorization, severity scoring (0-100), priority assignment, and duplicate detection.
3. **Municipal Authority Command Center (`/authority`, `/authority/map`)**:
   - AI-prioritized action queue & department filtering.
   - Manual authority decision override & worker assignment.
   - Sector map view & reopened alerts.
4. **Field Worker Operations (`/worker`)**:
   - Task detail, work progress status updates (`IN_PROGRESS`), and mandatory photo resolution evidence upload.
5. **Event-Driven Notifications (`/notifications`)**:
   - Centralized in-app notification engine with live unread badge (`🔔 3`) and 30s background polling.
6. **Civic Intelligence Analytics (`/authority/analytics`)**:
   - Real-time MongoDB aggregations for verification SLAs, median resolution hours, reopen rates, category breakdowns, and AI-generated operational recommendations.
7. **Community Participation Layer (`/community`)**:
   - Issue support counters, volunteer registration, and privacy-safe helper listings.
