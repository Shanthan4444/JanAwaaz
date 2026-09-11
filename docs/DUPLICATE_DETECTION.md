# JANSETU — DUPLICATE DETECTION MVP SPECIFICATION

## 1. Overview

The duplicate detection engine calculates duplicate risks for newly reported civic issues using geographic proximity and text similarity algorithms.

- **Module**: [`backend/src/ai/duplicate/duplicateDetector.js`](../backend/src/ai/duplicate/duplicateDetector.js)
- **Search Radius**: `DUPLICATE_SEARCH_RADIUS_METERS` (Default: 300 meters)

---

## 2. Detection Pipeline

```
New Issue Candidate (Location, Category, Title, Description)
                           │
                           ▼
Geospatial Candidate Query (Latitude/Longitude bounding box delta)
                           │
                           ▼
Similarity Evaluation (Jaccard token text similarity)
                           │
                           ▼
Duplicate Risk Score (0.00 to 1.00) + Possible Duplicate List
```

---

## 3. Advisory Policy

- Duplicate risk and candidate lists are purely **advisory**.
- Issues are **never automatically merged or deleted** by the AI engine.
- Citizens and Municipal Officers receive warning alerts if `duplicateRisk > 0.30`.
