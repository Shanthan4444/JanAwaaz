# JANSETU — AI DIAGNOSTIC OUTPUT SCHEMA SPECIFICATION

```typescript
export interface IssueAnalysisSchema {
  category: "Road Damage" | "Garbage" | "Streetlight" | "Water Leakage" | "Drainage" | "Traffic Signal" | "Public Infrastructure" | "Other";
  department: "Roads & Infrastructure" | "Solid Waste Management" | "Electricity & Public Lighting" | "Jal Board / Water Works" | "Drainage & Sewerage Board" | "Public Safety & Municipal Traffic" | "Urban Development" | "Municipal Services";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  priority: number;             // Integer 0 to 100
  duplicateRisk: number;       // Float 0.00 to 1.00
  possibleDuplicates?: {
    issueId: string;
    title: string;
    similarity: number;
  }[];
  summary: string;
  reasoning: string;
  confidence: number;          // Float 0.00 to 1.00
  provider: "gemini" | "groq" | "none";
  model: string;
  promptVersion: string;       // e.g. "issue-analysis-v1"
  status: "NOT_ANALYZED" | "ANALYZING" | "ANALYZED" | "AI_UNAVAILABLE";
  analyzedAt: string;          // ISO Date
}
```
