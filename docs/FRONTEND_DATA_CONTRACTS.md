# JANSETU — FRONTEND DATA CONTRACTS

These data contracts mirror the future MongoDB schemas and backend JSON payloads:

```typescript
export interface Issue {
  id: string;                    // e.g. "JAN-2026-1042"
  title: string;
  description: string;
  category: string;             // "Road Damage" | "Water Supply" | "Electrical" | "Sanitation"
  department: string;           // "Roads & Infrastructure" | "Jal Board"
  severity: "Low" | "Medium" | "High" | "Critical";
  priority: number;             // 0 - 100 calculated score
  priorityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "REPORTED" | "VERIFIED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CITIZEN_VERIFICATION" | "CLOSED" | "REOPENED";
  location: {
    area: string;
    landmark: string;
    latitude: number;
    longitude: number;
  };
  distanceText?: string;
  evidence: string[];           // Image URLs
  reporter: {
    id: string;
    name: string;
  };
  supporters: number;
  volunteers: number;
  assignedWorker?: {
    id: string;
    name: string;
    role: string;
    phone: string;
    avatar: string;
    status: string;
  };
  createdAt: string;            // ISO Date
  updatedAt: string;            // ISO Date
  timeline: {
    status: string;
    title: string;
    time: string;
    description: string;
  }[];
  aiAnalysis?: {
    category: string;
    department: string;
    severity: string;
    priority: number;
    duplicateRisk: string;
    reason: string;
  };
  resolutionProof?: {
    beforeUrl?: string;
    afterUrl: string;
    timestamp: string;
    note: string;
  };
}

export interface User {
  id: string;
  name: string;
  role: "CITIZEN" | "AUTHORITY" | "WORKER";
  impactScore: number;
  issuesReported: number;
  evidenceContributions: number;
  verificationsCompleted: number;
  volunteerActions: number;
  badge: string;
  avatar: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  avatar: string;
  status: string;
}
```
