# JanSetu Hackathon Judge Q&A & Defense Guide

This guide provides concise, technically defensible answers to 18 critical questions judges may ask during presentations or Q&A sessions.

---

## Core Product Differentiators

### Q1: What is JanSetu?
**Answer**: JanSetu is a modern civic-tech platform that connects citizens, municipal authorities, and field workers into a single accountable operating system. It turns reported civic complaints into worker-executed and citizen-verified resolution outcomes.

### Q2: What makes JanSetu different from existing government complaint portals?
**Answer**: Existing portals suffer from "unilateral closure" where authorities mark complaints resolved without proof. JanSetu enforces mandatory **Citizen Verification**: worker resolution is treated as a claim ("Worker uploaded proof") while the citizen who reported it inspects the evidence and decides whether the issue is `CLOSED` or `REOPENED`.

---

## AI Architecture & Reliability

### Q3: Why use AI (Google Gemini + Groq)?
**Answer**: AI reduces manual triage overhead for municipal authorities. When a report is submitted, Gemini analyzes photo/text evidence, categorizes the issue, calculates a severity score (0-100), routes it to the responsible department, and checks for potential duplicates.

### Q4: What happens if AI services fail or hit API quota limits?
**Answer**: We implement a dual-provider architecture: Google Gemini 2.5 Flash is primary, with automatic failover to Groq Llama3 70B. If both fail or network is offline, JanSetu falls back to heuristic default severity/priority scoring (`AI_UNAVAILABLE`), ensuring core reporting and issue resolution remain 100% functional.

### Q5: Can AI make authoritative civic decisions?
**Answer**: No. AI assists and recommends; municipal officers verify and decide. AI outputs are clearly labeled `AI ANALYSIS` with supporting evidence, while officer actions are recorded as `AUTHORITY DECISION`.

---

## Workflow, Trust & Security

### Q6: How do you prevent fake issue closures by workers?
**Answer**: Workers cannot close issues. Workers can only mark tasks `RESOLVED` by uploading mandatory photo evidence and completion notes. Status transitions to `CITIZEN_VERIFICATION`, requiring the reporting citizen to inspect before/after photos and confirm fix quality to achieve `CLOSED` status.

### Q7: What happens if a citizen rejects the worker's resolution?
**Answer**: The citizen clicks `✕ NO, IT'S NOT FIXED` and provides a rejection note. JanSetu transitions the issue to `REOPENED`, appends the audit history, and displays a red alert on the Municipal Authority Command Center for immediate re-assignment.

### Q8: How does worker assignment work?
**Answer**: Verified issues appear in the authority priority queue sorted by severity and priority score. Officers select available field workers by department (e.g. Senior Road Tech Ramesh Kumar) and assign tasks directly.

### Q9: How does community volunteering work?
**Answer**: Citizens can click `VOLUNTEER TO HELP` on community issues. JanSetu aggregates volunteer interest by category/area and alerts authorities (`"8 citizens volunteered to help"`). Citizen mobile numbers remain strictly private to protect identity.

### Q10: How do you prevent duplicate reports?
**Answer**: During issue submission, AI computes duplicate risk based on geospatial proximity (latitude/longitude), category matching, and textual description similarity. If a duplicate exists, citizens are prompted to support the existing report instead of creating redundant tickets.

---

## Analytics, Scalability & Adoption

### Q11: How does Civic Intelligence Analytics work?
**Answer**: Analytics are computed deterministically in MongoDB using aggregation pipelines (`$match`, `$group`, `$sort`). It tracks verification SLAs, median resolution times, citizen closure rates, reopen rates, and recurring hotspot sectors.

### Q12: How do you detect recurring civic hotspots?
**Answer**: MongoDB aggregations group complaints by sector (`location.area`) and category within a selected time window (7, 30, or 90 days). Sectors with >= 2 reports or high reopen rates are flagged as recurring hotspots (e.g. `University Road` with 23 road damage reports and 7 reopens), prompting structural inspections rather than isolated repairs.

### Q13: Is JanSetu scalable?
**Answer**: Yes. JanSetu uses a modular monolithic architecture with isolated service layers (`issueStateService`, `notificationService`, `analyticsService`, `aiService`). Database indexes and MongoDB aggregation pipelines handle high-volume queries efficiently.

### Q14: How could a municipal government adopt JanSetu?
**Answer**: JanSetu can operate as a lightweight operational layer over existing civic infrastructure. Municipal authorities use the web dashboard, field workers use the mobile portal, and citizens report issues via web/PWA without requiring heavy legacy database overhauls.

---

## Security & Privacy

### Q15: How is user data and privacy protected?
**Answer**: Authentication relies on JWT tokens with role-based authorization (`requireRole`). User IDs are strictly extracted from authenticated token context (`req.user.id`). Volunteer contact details are hidden from public community feeds.

---

## Future Roadmap

### Q16: What would you build next in Phase 11+?
**Answer**: 
1. Production SMS/WhatsApp notification integrations.
2. Ward-level authority hierarchy and automated worker dispatch routing.
3. Offline PWA support for field workers in low-connectivity areas.
