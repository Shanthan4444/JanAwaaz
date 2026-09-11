# JANSETU — AI PROVIDER & FALLBACK STRATEGY

## 1. Provider Tiering

- **Primary Provider**: Google Gemini API (`gemini-2.5-flash`)
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
  - Timeout: 5000ms via `AbortController`
- **Fallback Provider**: Groq API (`llama-3.3-70b-versatile`)
  - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
  - Timeout: 5000ms via `AbortController`

---

## 2. Fallback State Machine

```
   Start AI Analysis
          │
          ▼
   Call Gemini API ──(Success & Valid Schema)──► Return Analysis (provider: gemini)
          │
      (Timeout / Error / Invalid Schema)
          │
          ▼
    Call Groq API ────(Success & Valid Schema)──► Return Analysis (provider: groq, fallbackUsed: true)
          │
      (Timeout / Error / Invalid Schema)
          │
          ▼
   AI Unavailable ─────────────────────────────► Return Analysis (status: AI_UNAVAILABLE, provider: none)
```

---

## 3. Rate & Quota Management

- AI Analysis is triggered **once** during issue creation (`POST /api/issues`) or explicit re-analysis request (`POST /api/issues/:id/analyze`).
- `GET` requests read the stored `aiAnalysis` object from MongoDB. No external AI calls occur on page reads or refreshes.
