# CEP - AI Community Digital Problem Observatory 🛡️
> **Community Engagement Project (CEP) Platform**  
> Centralized, intelligent complaint tracking, automated Gemini AI categorization & deduplication, multi-community hierarchy customizer, photo evidence attachments, and NGO problem-solving marketplace.

---

## 🌟 Overview & Architecture

The **AI Community Digital Problem Observatory** replaces chaotic WhatsApp groups and paper registers in colleges, hostels, and residential societies with an intelligent, accountable pipeline.

```mermaid
graph TD
    A[1. Resident / Student] -->|Natural Language Complaint| B[Gemini AI Engine]
    B -->|Categorize, Score Urgency, Check Duplicates| C[Designated Wing Representative]
    C -->|Sanity Check: Verify & Escalate| D[Estate Warden / Chief Admin]
    D -->|Dispatch Workforce: Electrician / Plumber| E[Resolution & Public Visibility]
    F[Partner NGOs] -->|Upload Digital Challenges| G[NGO Problem Marketplace]
    G -->|Claim Project for CEP Credits| A
```

### Key Role-Based Personas:
1. **Resident / Student (Indigo Identity):**
   - Natural language complaint submission in any language.
   - Real-time Gemini AI preview (Category: Electrical, Plumbing, Sanitation, General; Urgency: Low, Medium, High).
   - Automated deduplication detection to prevent spamming.
   - Interactive tracking of personal complaints.
2. **Wing Representative (Emerald Identity):**
   - Filtered strictly to their assigned wing (e.g. Wing A).
   - Local sanity check: "Verify & Escalate" or "Flag as Spam / Reject".
3. **Estate Warden / Admin (Purple Identity):**
   - Aggregated cross-wing feed of verified tickets.
   - Workforce assignment (dispatch technicians and update progress).
   - Gemini AI executive management briefing summarizing community infrastructural health.
4. **NGO Partner (Teal Identity):**
   - Problem statement marketplace where NGOs post operational bottlenecks.
   - Engineering students claim challenges to build software/hardware solutions.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: v3.10+ (tested on Python 3.14)

---

### 2. Backend Setup (FastAPI + Google Gemini)

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Add your Google Gemini API Key in .env
# If left blank, the built-in intelligent heuristic engine takes over automatically
echo GEMINI_API_KEY=your_gemini_api_key_here > .env

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

---

### 3. Frontend Setup (React + Vite + Tailwind CSS)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🧭 Live Demo & 1-Click Role Switcher

For assessment presentations and teacher grading, the top navigation bar features a **1-Click Evaluation Persona Switcher**:
- Click **"1. Resident"** -> Log in as *Aarav Sharma (Resident, Wing A)*
- Click **"2. Wing Rep (A)"** -> Log in as *Vikram Malhotra (Wing A Representative)*
- Click **"3. Estate Admin"** -> Log in as *Dr. Rajesh Iyer (Chief Warden & Estate Manager)*
- Click **"4. NGO Connect"** -> Log in as *Anita Deshmukh (GreenTech NGO Lead)*

---

## 📂 Repository Structure

```
c:/CEP/
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, TicketCard, StatusBadge, Modal, AIAnalysisModal, StatsCard, QRCodeModal
│   │   ├── context/          # AuthContext.jsx, CommunityContext.jsx
│   │   ├── pages/            # Login, Register, ResidentDashboard, WingRepDashboard, AdminDashboard, NGOMarketplace
│   │   ├── services/         # firebase.js, api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── api/              # tickets.py (analyze, deduplicate), reports.py (AI executive summary)
│   │   ├── models/           # Pydantic schemas
│   │   ├── services/         # gemini_service.py (Gemini 1.5 Flash + fallback)
│   │   └── main.py           # FastAPI entrypoint with CORS
│   └── requirements.txt
├── TEACHER_ASSESSMENT_GUIDE.md # Complete defense script, evaluation rubric, and next steps
└── README.md
```

---

## 🛡️ Assessment & Defense Matrix

See [`TEACHER_ASSESSMENT_GUIDE.md`](./TEACHER_ASSESSMENT_GUIDE.md) for the exact 5-minute presentation script and answers to judge counter-questions on **Accountability**, **WhatsApp/SMS Alert Triggers**, and **Spam Prevention**.
