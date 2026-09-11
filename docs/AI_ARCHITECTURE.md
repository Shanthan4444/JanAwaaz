# JANSETU — AI CIVIC INTELLIGENCE ENGINE ARCHITECTURE

## 1. Executive Summary

Jansetu Phase 3 introduces the **AI Civic Intelligence Engine**.

The engine operates on the backend to automatically categorize, route, prioritize, and evaluate duplicate risks for citizen complaints.

It uses **Google Gemini API** as the primary AI provider and **Groq API** as the fallback provider.

---

## 2. System Architecture Diagram

```
                       JANSETU CITIZEN APP
                                │
                        POST /api/issues
                                │
                                ▼
                       EXPRESS CONTROLLER
                                │
                        MONGODB DOCUMENT
                                │
                                ▼
                        AI SERVICE ENGINE
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
       GEMINI PRIMARY API              GROQ FALLBACK API
      (gemini-2.5-flash)            (llama-3.3-70b-versatile)
                │                               │
                └───────────────┬───────────────┘
                                ▼
                        SCHEMA VALIDATION
                 (issueAnalysisSchema.js)
                                │
                                ▼
                     DUPLICATE DETECTOR MVP
                   (duplicateDetector.js)
                                │
                                ▼
                     EMBEDDED MONGODB DATA
                           (Issue)
                                │
                                ▼
                       FRONTEND DISPLAY
```

---

## 3. Key Non-Negotiable Rules

1. **AI is Advisory, Not Autonomous**: AI recommends categories, departments, priorities, and duplicate risks. It does NOT directly execute database deletions, worker assignments, or case closures.
2. **Backend Key Security**: `GEMINI_API_KEY` and `GROQ_API_KEY` live exclusively on the backend server. They are never sent to the browser or logged.
3. **Non-Blocking Failure**: If both AI providers fail or are unconfigured, the citizen's complaint is still saved with `aiAnalysis.status = 'AI_UNAVAILABLE'`. External AI downtime NEVER destroys citizen complaints.
