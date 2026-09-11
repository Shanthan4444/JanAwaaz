# JANSETU — PROJECT STRUCTURE & FOLDER MAP

## Required Top-Level Directory Layout

```
Jansetu/
│
├── frontend/             # React 19 + Vite Single Page Application
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── citizen/      # Citizen Domain (Pages, Components, Auth UI, Flows)
│       │   ├── pages/
│       │   ├── components/
│       │   ├── auth/
│       │   └── flows/
│       │
│       ├── authority/    # Authority Domain (Pages, Components, Auth UI, Flows)
│       │   ├── pages/
│       │   ├── components/
│       │   ├── auth/
│       │   └── flows/
│       │
│       ├── worker/       # Worker Domain (Pages, Components, Auth UI, Flows)
│       │   ├── pages/
│       │   ├── components/
│       │   ├── auth/
│       │   └── flows/
│       │
│       ├── shared/       # Reusable Shared UI Components, Layouts, Hooks, Utils
│       │   ├── components/
│       │   ├── layouts/
│       │   ├── hooks/
│       │   ├── utils/
│       │   └── types/
│       │
│       ├── services/     # Shared Auth Engine & API Client Infrastructure
│       │   ├── api/
│       │   └── auth/
│       │
│       ├── styles/       # Design Tokens & Global CSS
│       ├── App.jsx
│       └── main.jsx
│
├── backend/              # Node.js + Express API Application
│   ├── package.json
│   └── src/
│       ├── auth/         # Auth Routes & Controllers
│       ├── citizen/      # Citizen Domain Controller & Service
│       ├── authority/    # Authority Domain Controller & Service
│       ├── worker/       # Worker Domain Controller & Service
│       ├── issues/       # Issue Lifecycle Routes, Controllers, Validators
│       ├── community/    # Community Feed Routes & Services
│       ├── ai/           # Provider-Independent AI Service (Gemini + Groq Fallback)
│       │   ├── providers/
│       │   │   ├── gemini.js
│       │   │   └── groq.js
│       │   └── aiService.js
│       │
│       ├── notifications/# Notification Dispatcher
│       ├── models/       # Mongoose Schemas (Future)
│       ├── config/       # Environment & Server Config
│       ├── middleware/   # Shared Authorization (requireAuth, requireRole)
│       ├── utils/
│       ├── app.js        # Express Application Setup
│       └── server.js     # Entry Server Listener
│
├── docs/                 # Architecture & Technical Specifications
│   ├── PRODUCT_ARCHITECTURE.md
│   ├── AUTH_ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   └── REFERENCE_ANALYSIS.md
│
├── README.md             # Project Overview & Blueprint
└── .gitignore            # Git Ignore File
```
