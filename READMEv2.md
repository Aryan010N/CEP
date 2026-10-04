# CEP — AI Community Digital Problem Observatory 🛡️
> **Community Engagement Project · Mobile-First · AI-Powered · Real-Time**
>
> Replaces chaotic WhatsApp groups and paper registers with an intelligent, accountable complaint-to-resolution pipeline — plus an NGO challenge marketplace where students solve real-world problems for credits.

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Role Personas](#role-personas)
4. [NGO Marketplace Module](#ngo-marketplace-module)
5. [Quick Start](#quick-start)
6. [Environment Variables](#environment-variables)
7. [Repository Structure](#repository-structure)
8. [Sprint Status](#sprint-status)
9. [Demo Credentials](#demo-credentials)
10. [Contributing](#contributing)

---

## Overview

CEP is a mobile-first progressive web application built on **React 18 + Vite**, **FastAPI**, **Firebase (Auth, Firestore, Storage)**, and **Google Gemini 1.5 Flash**. It serves two interconnected workflows:

### Workflow A — Complaint Pipeline
```
Resident submits complaint
  → Gemini deduplication gate (blocks if duplicate found)
  → Gemini categorises (Electrical / Plumbing / Sanitation / General) + urgency (Low / Medium / High)
  → Wing Rep reviews and escalates or rejects
  → Admin dispatches workforce
  → Resolution logged → Resident notified via email/push
```

### Workflow B — NGO Challenge Marketplace
```
NGO posts challenge (title, description, tags, deadline, contact)
  → Students browse marketplace
  → Student claims challenge → sends contact request to NGO
  → NGO accepts → Work begins (tracked via status: Open / Claimed / In Review / Closed)
  → On close → student earns CEP Credits recorded in Firestore
```

---

## Architecture

```mermaid
graph TD
    subgraph Frontend [React 18 + Vite — Vercel]
        A[AuthContext.jsx] --> B[CommunityContext.jsx]
        B --> C[ResidentDashboard]
        B --> D[WingRepDashboard]
        B --> E[AdminDashboard]
        B --> F[NGOMarketplace]
    end

    subgraph Backend [FastAPI — Render]
        G[/analyze] --> H[gemini_service.py]
        I[/deduplicate] --> H
        J[/report] --> H
    end

    subgraph Firebase
        K[Firebase Auth]
        L[Cloud Firestore]
        M[Firebase Storage]
        N[FCM Push Notifications]
    end

    Frontend -->|REST| Backend
    Frontend -->|SDK| Firebase
    Backend -->|Gemini API| H
```

---

## Role Personas

| Role | Identity Colour | Key Capabilities |
|---|---|---|
| **Resident / Student** | Indigo | Submit complaint, track status, browse NGO challenges, claim challenges |
| **Wing Representative** | Emerald | View wing-specific tickets, verify/escalate/reject, cannot see other wings |
| **Estate Admin / Warden** | Purple | Cross-wing aggregated feed, workforce dispatch, Gemini briefing, analytics |
| **NGO Partner** | Teal | Post challenges, accept/reject student claims, close resolved challenges |

---

## NGO Marketplace Module

### NGO Post Schema (Firestore: `challenges` collection)
```
challengeId     string   auto-generated
postedBy        string   NGO user UID
orgName         string   NGO organisation name
contactEmail    string   verified email for student contact
title           string   max 120 chars
description     string   max 1000 chars
tags            array    e.g. ["sustainability", "water", "mobile"]
deadline        timestamp
reward          string   e.g. "Certificate + 500 CEP Credits"
status          string   Open | Claimed | In Review | Closed
claimedBy       string   student UID (null if Open)
createdAt       timestamp serverTimestamp
updatedAt       timestamp serverTimestamp
```

### Student Claim Flow
1. Student browses marketplace (filtered by tag, deadline, status=Open)
2. Clicks **"Claim Challenge"** → modal shows NGO contact + description
3. System sends contact-request notification to NGO (email via backend)
4. NGO accepts → `status` updates to `Claimed`, `claimedBy` = student UID
5. Student works externally; marks "Submit for Review" when done
6. NGO reviews and sets `status = Closed` → student earns CEP Credits

---

## Quick Start

### Prerequisites
- Node.js v18+
- Python v3.10+
- Firebase project with Auth, Firestore, Storage, FCM enabled
- Google Gemini API key

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate  |  Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn app.main:app --reload --port 8000
```
API docs: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
cp .env.example .env   # fill in Firebase config + backend URL
npm install
npm run dev
```
App: `http://localhost:5173`

---

## Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=          # For FCM push notifications
VITE_BACKEND_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```env
GEMINI_API_KEY=
FIREBASE_SERVICE_ACCOUNT_JSON=    # Path or JSON string for Admin SDK
ALLOWED_ORIGINS=http://localhost:5173,https://cep-seven.vercel.app
RESEND_API_KEY=                   # Email service for notifications
```

---

## Repository Structure

```
CEP/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI: Vite build check + FastAPI dry-run
├── .agents/
│   └── skills/
│       └── sprint-2-firestore/
│           └── SKILL.md           # Sprint 2 operational playbook
├── frontend/
│   ├── public/
│   │   └── icons/                 # PWA icons (192, 512)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Reusable: Button, Badge, Modal, Card, Input, Toast
│   │   │   ├── Navbar.jsx
│   │   │   ├── BottomNav.jsx      # Mobile-first bottom navigation
│   │   │   ├── TicketCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── ChallengeCard.jsx  # NGO marketplace card
│   │   │   ├── AIAnalysisModal.jsx
│   │   │   └── QRCodeModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Firebase Auth state
│   │   │   └── CommunityContext.jsx # Firestore onSnapshot state
│   │   ├── hooks/
│   │   │   ├── useTickets.js
│   │   │   ├── useChallenges.js
│   │   │   └── useNotifications.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── ResidentDashboard.jsx
│   │   │   ├── WingRepDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── NGOMarketplace.jsx
│   │   │   ├── Settings.jsx       # GDPR delete account
│   │   │   ├── NotFound.jsx       # 404
│   │   │   └── ServerError.jsx    # 500
│   │   ├── services/
│   │   │   ├── firebase.js        # Modular v10+ SDK utilities
│   │   │   ├── api.js             # FastAPI calls with error boundary wrapper
│   │   │   └── notifications.js   # FCM registration + token management
│   │   ├── utils/
│   │   │   ├── roleGuard.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── tickets.py         # /analyze, /deduplicate endpoints
│   │   │   ├── reports.py         # /report Gemini executive summary
│   │   │   ├── challenges.py      # /challenges NGO notification endpoints
│   │   │   └── notifications.py   # Email + FCM trigger endpoints
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── gemini_service.py  # Gemini 1.5 Flash + heuristic fallback
│   │   │   ├── email_service.py   # Resend email dispatch
│   │   │   └── firebase_admin.py  # Firebase Admin SDK init
│   │   └── main.py                # FastAPI entrypoint, CORS, rate limiter
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── firestore.rules                # Security rules
├── storage.rules                  # Storage security rules
├── .mcp.json
├── MASTER_PROJECT_ROADMAP.md
├── REQUIREMENTS.md
├── ARCHITECTURE.md
├── TASKS.md
└── README.md
```

---

## Sprint Status

| Phase | Description | Status |
|---|---|---|
| Sprint 1 | Firebase Auth + Role-Based Navigation | ✅ Complete |
| Sprint 2 | Cloud Firestore real-time migration | 🚧 In Progress |
| Sprint 3 | AI Deduplication Gate + Security Rules | ⏳ Upcoming |
| Sprint 4 | Firebase Storage + Push Notifications | ⏳ Upcoming |
| Sprint 5 | Admin Analytics + NGO Full Workflow | ⏳ Upcoming |
| Sprint 6 | GDPR, Error Boundaries, Legal Pages | ⏳ Upcoming |
| Sprint 7 | PWA, Performance, Accessibility Audit | ⏳ Upcoming |

---

## Demo Credentials

> **Demo Mode:** Click the role buttons in the top nav to instantly switch personas for evaluation.

| Role | Name | Email | Password |
|---|---|---|---|
| Resident | Aarav Sharma | aarav@cep.demo | demo1234 |
| Wing Rep A | Vikram Malhotra | vikram@cep.demo | demo1234 |
| Estate Admin | Dr. Rajesh Iyer | rajesh@cep.demo | demo1234 |
| NGO Partner | Anita Deshmukh | anita@cep.demo | demo1234 |

---

## Contributing

1. Fork the repo
2. `git checkout -b feat/your-feature-name`
3. Commit with conventional commits: `feat:`, `fix:`, `chore:`
4. Push and open a PR against `main`
5. CI must pass before merge

---

*Built with ❤️ for real community impact.*
