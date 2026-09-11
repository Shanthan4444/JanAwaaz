# 🏛️ JanAwaaz Authority Login Credentials & Governance Documentation

> [!IMPORTANT]
> **DEVELOPMENT / DEMO CREDENTIALS WARNING**:
> The credentials below are provided strictly for local development, demonstration, and hackathon evaluation purposes. In production deployments, authority accounts use salted bcrypt password hashing and OAuth2/SAML SSO authentication.

---

## 📌 Final JanAwaaz Departments (Exactly 5)

JanAwaaz supports **EXACTLY 5 municipal governance departments**. Each department authority portal (`/#/authority/login`) acts as the command center for its specific civic issue domain.

| Department | Authority ID | Officer Email | Demo Password | Handled Civic Issues |
| :--- | :--- | :--- | :--- | :--- |
| **Electrical Department** | `AUTH-ELEC` | `authority.electrical@janawaaz.local` | `ElectricalAuth2026!` | Broken streetlights, electrical civic infrastructure |
| **Water Supply & Sewerage Department** | `AUTH-WATER` | `authority.water@janawaaz.local` | `WaterAuth2026!` | Water leakage, supply pipeline bursts |
| **Roads & Infrastructure Department** | `AUTH-ROADS` | `authority.roads@janawaaz.local` | `RoadsAuth2026!` | Potholes, damaged road surfaces, pavement damage |
| **Municipal Department** | `AUTH-MUNICIPAL` | `authority.municipal@janawaaz.local` | `MunicipalAuth2026!` | Garbage overflow, blocked drains, sewage overflow |
| **Fire Department** | `AUTH-FIRE` | `authority.fire@janawaaz.local` | `FireAuth2026!` | Active fire outbreaks, fire hazards |

---

## 🔑 Authority Credentials Quick Reference Table

| Department Name | Authority ID | Email | Demo Password |
| :--- | :--- | :--- | :--- |
| **Electrical Department** | `AUTH-ELEC` | `authority.electrical@janawaaz.local` | `ElectricalAuth2026!` |
| **Water Supply & Sewerage Department** | `AUTH-WATER` | `authority.water@janawaaz.local` | `WaterAuth2026!` |
| **Roads & Infrastructure Department** | `AUTH-ROADS` | `authority.roads@janawaaz.local` | `RoadsAuth2026!` |
| **Municipal Department** | `AUTH-MUNICIPAL` | `authority.municipal@janawaaz.local` | `MunicipalAuth2026!` |
| **Fire Department** | `AUTH-FIRE` | `authority.fire@janawaaz.local` | `FireAuth2026!` |

---

## 🚫 Invalid Issue Handling

Complaints outside these 5 civic domains (such as lost items, academic grievances, restaurant recommendations, or private pricing complaints) are classified as **`INVALID ISSUE`** during AI classification.

- **No Authority Queue**: Invalid issues are **never** added to department authority queues or field worker tasks.
- **Citizen Feedback**: The citizen is shown a clear explanation outlining why the complaint was not accepted and presenting the 5 supported JanAwaaz civic domains.

---

## 📊 Authority Command Center Features

1. **Department Isolation**: Each authority officer sees ONLY complaints belonging to their assigned department.
2. **Priority Queue (`/authority`)**: Live queue with AI priority scores (0–100) and severity ratings (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
3. **Field Worker Assignment**: Dispatch issues to department-specific field technicians and track resolution evidence.
4. **Accountability Audit**: Real-time worker audit tracking completed vs active vs rejected tasks.
