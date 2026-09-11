# JanSetu (जनसेतु) 🌉 — Next-Gen Civic Intelligence Network

**People's Bridge Between Citizens and Authorities**

JanSetu is an end-to-end, AI-powered civic technology platform engineered to bridge the gap between citizens, municipal authorities, and field maintenance crews. By replacing traditional slow, opaque complaint portals with multi-agent AI vision classification, dynamic severity scoring, automated department dispatch, worker proof-of-work validation, and mandatory citizen verification, JanSetu turns raw civic reports into verified, accountable real-world solutions.

---

## 🚀 Core Value Proposition: `RESOLVED ≠ CLOSED`

In traditional civic portals, authorities can unilaterally mark a complaint as "Resolved" without physical evidence or citizen validation, leading to false closures and public distrust.

```
                                      ┌───────────────────────────────────────────────────────────┐
                                      │              JANSETU CIVIC FLOW PIPELINE                  │
                                      └───────────────────────────────────────────────────────────┘

 [ CITIZEN REPORT ] ──► [ MULTI-KEY GEMINI VISION AI ] ──► [ DUP CHECK & SEVERITY ] ──► [ AUTHORITY COMMAND ]
   Photo + GPS + Voice     Categorization & Analysis         Spatial Proximity Risk        Department Auto-Assign
                                                                                                     │
                                                                                                     ▼
 [ CLOSED & VERIFIED ] ◄── [ CITIZEN VERIFICATION ] ◄── [ WORKER PROOF OF WORK ] ◄── [ WORKER DISPATCH ]
   Confetti & Analytics      Accept 🟢 / Reject 🔴        Photo Evidence + Notes      Mobile Task Assignment
```

1. **Worker Resolution**: Field workers must submit photo evidence of completed physical repairs.
2. **Citizen Inspection**: The citizen inspects before/after photos and accepts or rejects the repair.
3. **Reopen Safeguard**: If rejected, the ticket reopens instantly with high priority (`REOPENED` status), preserving a tamper-proof audit log.

---

## ✨ Key Platform Features

* **🎙️ Multi-Agent AI Vision & Multimodal Reporting**
  * Snap a picture of the issue (pothole, fire hazard, garbage pile, water leakage, electrical defect).
  * Record a voice description transcribed into actionable text in multiple languages (EN, HI, TA, TE, KN).
  * Auto-captures precise GPS location coordinates.

* **🧠 Gemini AI Civic Intelligence Diagnostic**
  * Automatically analyzes uploaded images and text.
  * Assigns **Category**, **Recommended Department**, **Severity**, and a calculated **Priority Score (0-100)**.
  * **Multimodal Consistency & Anti-Hallucination**: Requires visual evidence to confirm claims (e.g. selfies claimed as fire hazards are flagged as `UNCONFIRMED`).

* **📍 Spatial Duplicate Detection Engine**
  * Uses MongoDB geospatial indexing and Haversine distance matrix formulas to detect duplicate complaints within 300 meters.

* **🏛️ Municipal Authority Command Center**
  * Sorts complaints dynamically by urgency score, duplicate risk, and SLA deadlines.
  * Live analytical insights, department performance scoreboard, and operational maps.

* **👷 Field Worker Portal & Proof-of-Work**
  * Real-time task dashboard with turn-by-turn navigation and mandatory resolution photo uploads.

* **✅ Mandatory Citizen Verification**
  * An issue is only officially closed when the reporting citizen confirms the resolution quality based on completion photos provided by the worker.

---

## 📸 Platform Previews

### 1. Landing & Impact
![Landing Page](Screenshot%202026-09-05%20at%202.55.57%20AM.jpg)

### 2. Issue Capture (Voice & Photo)
![Capture Issue](Screenshot%202026-09-05%20at%202.57.24%20AM.jpg)

### 3. Civic Activity Network
![Live Feed & Map](Screenshot%202026-09-05%20at%202.58.24%20AM.jpg)

### 4. AI Diagnostics & Resolution Tracking
![Issue Detail](Screenshot%202026-09-05%20at%202.59.18%20AM.jpg)

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend (Web)** | React 19, Vite, Vanilla CSS Design System (Glassmorphic, Spacious 78px Navbar), Lucide Icons, Canvas Confetti |
| **Mobile App** | React Native, Expo (iOS & Android), TailwindCSS (NativeWind), Geolocation |
| **Backend API** | Node.js (ES Modules), Express.js, JWT Authentication, Twilio SMS |
| **Database** | MongoDB Atlas / Mongoose (Geospatial Indexing, Haversine Matrix) |
| **AI Engine** | Google Gemini 3.7 / 3.8 / 3.5 Flash Vision APIs with key rotation & VLM multimodal verification |

---

## ⚡ Quick Start & Developer Setup Guide

### 1. Clone & Configure Environment
```bash
git clone https://github.com/rohanforgit/JanSetu.git
cd JanSetu/backend
cp .env.example .env
```

Ensure `backend/.env` contains valid credentials:
```env
PORT=5001# JanSetu 🌉

**People's Bridge Between Citizens and Authorities**

JanSetu is a civic-tech platform designed to empower citizens and streamline municipal operations. By leveraging AI for issue categorization and community-driven verification, JanSetu transforms the way urban problems—like potholes, tangled wires, and emergency hazards—are reported and resolved.

---

## 🚨 The Problem
Traditional civic grievance systems are broken:
* **Passive Processes:** Citizens file complaints that disappear into black-hole ticketing systems.
* **Zero Visibility:** No real-time updates on the status of reported issues.
* **Unilateral Closures:** Authorities often close tickets without verified proof of resolution.
* **Public Frustration:** Repeat complaints lead to diminished trust in municipal bodies.

## 💡 The Solution
JanSetu flips the script by introducing a **Product Lifecycle Engine** for civic issues. 
With just a smartphone, a citizen can snap a picture, record an optional voice note (transcribed by AI), and let the system automatically categorize, prioritize, and route the issue to the correct department. The community can track, support, and verify the final resolution.

---

## ✨ Key Features

* **🎙️ AI-Powered Multimodal Reporting**
  * Snap a picture of the issue (pothole, fire, hazards).
  * Record a voice description; our AI transcribes it into actionable text.
  * Auto-captures precise GPS coordinates.

* **🧠 Gemini AI Civic Intelligence Diagnostic**
  * Automatically analyzes the image and text.
  * Assigns **Category** (e.g., Road Damage), **Recommended Department**, **Severity**, and a calculated **Priority Score (0-100)**.

* **🗺️ Civic Activity Network (Live Map & Feed)**
  * View active issues in your vicinity via an OpenStreetMap integration.
  * "Support" issues to increase their impact score.
  * Volunteer for community-driven tasks.

* **شفاف Transparent Resolution Pipeline**
  * Track an issue through 6 clear stages: *Reported → AI Understands → Community + Authority → Worker Acts → Citizen Verifies → Closed*.
  * Direct visibility into which field worker is assigned to the task.

* **✅ Mandatory Citizen Verification**
  * An issue is only officially closed when the reporting citizen confirms the resolution quality based on completion photos provided by the worker.

---

## 📸 Platform Previews

*(Note: Ensure your screenshots are placed in the root or an `/images` folder in your repository to display them correctly.)*

### 1. Landing & Impact
![Landing Page](Screenshot%202026-09-05%20at%202.55.57%20AM.jpg)

### 2. Issue Capture (Voice & Photo)
![Capture Issue](Screenshot%202026-09-05%20at%202.57.24%20AM.jpg)

### 3. Civic Activity Network
![Live Feed & Map](Screenshot%202026-09-05%20at%202.58.24%20AM.jpg)

### 4. AI Diagnostics & Resolution Tracking
![Issue Detail](Screenshot%202026-09-05%20at%202.59.18%20AM.jpg)

---

## 🚀 How It Works (The Lifecycle)

1. **Report:** Tell JanSetu what's wrong. Snap photo evidence and pin the location.
2. **AI Understands:** JanSetu identifies issue category, severity score, and responsible department.
3. **Community + Authority:** People support the issue while municipal authorities coordinate action.
4. **Worker Acts:** The assigned field worker resolves the physical problem and uploads a completion photo.
5. **Citizen Verifies:** The person who reported it confirms whether it was actually fixed.
6. **Impact:** The problem closes, and the contribution counts toward the citizen's civic impact score.

---

## 🛠️ Getting Started (For Developers)

### Prerequisites
* Node.js (v16+)
* npm or yarn
* API Keys (Gemini AI, Google Maps/OpenStreetMap, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/jansetu.git
   cd jansetu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   REACT_APP_GEMINI_API_KEY=your_key_here
   REACT_APP_MAP_KEY=your_key_here
   ```

4. **Run the application:**
   ```bash
   npm start
   ```

---

## 🤝 Contributing
We welcome contributions to make our cities better! 
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jansetu?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_1
JWT_SECRET=jansetu_super_secret_jwt_key_2026
```

### 2. Install Dependencies
```bash
# Backend Dependencies
cd backend
npm install

# Frontend Dependencies
cd ../frontend
npm install
```

### 3. Seed Initial Demo Data
```bash
cd backend
npm run seed
```

### 4. Launch Development Servers

**Backend API (Terminal 1):**
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:5001`*

**Frontend Application (Terminal 2):**
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔐 Demo Credentials

| Portal Role | Access URL | Credentials |
| :--- | :--- | :--- |
| 🧑‍🦱 **Citizen Portal** | `http://localhost:5173/#/citizen/login` | **Phone**: `9876543210`<br>**OTP**: `123456` |
| 🏛️ **Authority Command Center** | `http://localhost:5173/#/authority/login` | **Employee ID**: `AUTH-001`<br>**Password**: `Password123!` |
| 🚒 **Fire Officer (Authority)** | `http://localhost:5173/#/authority/login` | **Employee ID**: `AUTH-FIRE-01`<br>**Password**: `Password123!` |
| 👷 **Field Worker Portal** | `http://localhost:5173/#/worker/login` | **Employee ID**: `worker-004`<br>**Password**: `Password123!` |

---

## 🌐 Production Hosting & Deployment

- **Backend Web Service**: Deployed on Render / Railway (`https://jansetu-2u15.onrender.com/api`)
- **Frontend App**: Deployed on Vercel (`https://jansetu69.vercel.app`)

---

## 📄 License & Acknowledgments

Built for modern civic governance and transparent public infrastructure maintenance. Developed with Node.js, Express, React 19, Expo, Leaflet GIS, and Google Gemini Multimodal AI.
