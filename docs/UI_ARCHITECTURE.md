# JANSETU — FRONTEND UI ARCHITECTURE

## 1. Executive Summary

Jansetu Phase 1 establishes a client-first, domain-separated frontend application built with React 19 and Vite.

It implements a complete local simulation of the civic issue lifecycle over a centralized **Mock API Service Layer** (`src/services/api/mockApi.js`) and **Shared Auth Provider** (`src/services/auth/AuthProvider.jsx`).

---

## 2. Domain Separation Map

```
frontend/src/
├── citizen/                   # Citizen Domain (Public Landing, Progressive Report, Tracker, Feed, Profile)
│   ├── pages/                 # Home, ReportIssue, TrackIssue, Community, Profile
│   ├── components/            # LifecycleHeroVisual, BeforeWithJansetu, AIAnalysisPreview, IssueTimeline
│   ├── auth/                  # MobileLogin, OTPVerification
│   └── flows/                 # ReportFlow, VerificationFlow
│
├── authority/                 # Authority Domain (Dashboard, Priority Queue, Inspector, Map)
│   ├── pages/                 # AuthorityDashboard, AuthorityIssueDetail, AuthorityMap, AuthorityLoginPage
│   ├── components/            # PriorityQueue, PriorityIssueCard, AuthorityMetrics, AIAnalysisPanel
│   └── auth/                  # AuthorityLogin
│
├── worker/                    # Field Worker Domain (Task Deck, Work Completion Proof Uploader)
│   ├── pages/                 # WorkerDashboard, WorkerTaskDetail, WorkerLoginPage
│   ├── components/            # WorkerTaskList, WorkerTaskCard, ResolutionProofUploader
│   └── auth/                  # WorkerLogin
│
├── shared/                    # Shared Component System & Services
│   ├── components/            # Navbar, Footer, Button, Card, IssueCard, Badges, Modals, MapContainer
│   ├── layouts/               # Domain layouts
│   └── types/                 # Frontend Data Contracts
│
└── services/                  # Shared Service Layer
    ├── api/                   # mockApi.js (Mock API client for all domain components)
    └── auth/                  # AuthProvider, ProtectedRoute, RoleGuard
```

---

## 3. Frontend Route Map

| Domain | Route | View Component | Description |
| :--- | :--- | :--- | :--- |
| **Citizen** | `/` | `Home.jsx` | Landing hero with visualizer, pulse metrics, storytelling comparison |
| **Citizen** | `/report` | `ReportIssue.jsx` | 5-step progressive report wizard with AI diagnostic preview |
| **Citizen** | `/track/:id` | `TrackIssue.jsx` | 8-stage progress tracker, community support, citizen verification sign-off |
| **Citizen** | `/community` | `Community.jsx` | Activity stream with filters ([Nearby], [High Priority], [Needs Volunteers]) + Map view |
| **Citizen** | `/profile` | `Profile.jsx` | Civic Impact Score ledger (340 pts), verifications, impact badges |
| **Authority** | `/authority/login` | `AuthorityLoginPage.jsx` | Officer login UI |
| **Authority** | `/authority` | `AuthorityDashboard.jsx` | "GOOD MORNING — 23 issues need attention", Priority Queue table |
| **Authority** | `/authority/issues/:id` | `AuthorityIssueDetail.jsx` | AI Analysis box, worker assignment dropdown, status transition controls |
| **Authority** | `/authority/map` | `AuthorityMap.jsx` | Sector Heatmap with priority and status pin filters |
| **Worker** | `/worker/login` | `WorkerLoginPage.jsx` | Worker Badge ID & PIN Login UI |
| **Worker** | `/worker` | `WorkerDashboard.jsx` | "GOOD MORNING RAMESH - MY TASKS" Task Deck |
| `Worker` | `/worker/tasks/:id` | `WorkerTaskDetail.jsx` | Start Work trigger, Completion photo proof uploader dialog |

---

## 4. Phase 2 Backend Integration Blueprint

All components invoke methods on `mockApi`:
- `mockApi.createIssue(data)` → Future: `apiClient.post('/api/issues', data)`
- `mockApi.supportIssue(id)` → Future: `apiClient.post('/api/issues/:id/support')`
- `mockApi.assignWorker(id, worker)` → Future: `apiClient.post('/api/authority/assign', { id, workerId })`
- `mockApi.verifyResolution(id, isFixed, reason)` → Future: `apiClient.post('/api/issues/:id/verify', { isFixed, reason })`

Component JSX remains untouched during Phase 2 transition.
