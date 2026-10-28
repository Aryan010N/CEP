# AI Community Digital Problem Observatory 🛡️
## Comprehensive Problem Statement, System Architecture & End-to-End Workflow Specification (From 0 to Complete)

[![Live Production](https://img.shields.io/badge/Production%20App-https%3A%2F%2Fcep--seven.vercel.app%2F-indigo?style=for-the-badge&logo=vercel)](https://cep-seven.vercel.app/)
[![Live Demo Environment](https://img.shields.io/badge/Demo%20Environment-https%3A%2F%2Fcep--seven.vercel.app%2Fdemo-amber?style=for-the-badge&logo=google-chrome)](https://cep-seven.vercel.app/demo)
[![Firebase Project](https://img.shields.io/badge/Firebase%20Console-cep--ai-orange?style=for-the-badge&logo=firebase)](https://console.firebase.google.com/u/0/project/cep-ai/overview)
[![Backend API](https://img.shields.io/badge/Backend%20API-FastAPI%20Render-emerald?style=for-the-badge&logo=fastapi)](https://cep-wacs.onrender.com)

---

## 1. Executive Summary & Problem Statement

### 1.1 The Reality Before CEP (Point 0)
In student hostels, residential apartment complexes, and university campuses across India and globally, community issue management suffers from severe operational bottlenecks:
1. **The WhatsApp Chaos:** Residents report water leaks, electrical sparking, broken elevators, or unhygienic washrooms in generic WhatsApp groups. Crucial maintenance requests are lost within minutes beneath personal chats, memes, and announcements.
2. **Paper Registers & Bureaucratic Friction:** Traditional physical registers kept at guard desks or warden offices require in-person visits, handwriting complaints, and offer zero tracking, no status visibility, and no proof of work.
3. **Duplicate Flood & Noise:** When a major issue occurs (e.g., a burst pipe or blown transformer), 30 different residents submit identical complaints across different channels, overwhelming the administrative staff with redundant noise while other urgent problems are ignored.
4. **Lack of Accountable Verification:** Estate administrators and wardens cannot physically inspect every complaint before dispatching expensive external repair vendors. Spurious or prank tickets waste maintenance funds.
5. **Student Disconnect & Academic Incentive Gap:** Students have technical, organizational, and creative skills, while local NGOs struggle with operational hurdles (waste management, energy audits, community tutoring). Historically, there was no digital bridge linking student civic engagement with academic credit rewards.

### 1.2 The CEP Solution (Point 100)
The **AI Community Digital Problem Observatory** transforms civic management into an intelligent, transparent, and gamified lifecycle:
- **Multimodal AI Classification & Deduplication:** Powered by Google Gemini 3.8 Flash to auto-classify categories, predict urgency, and semantically block duplicate complaints at the point of submission.
- **Three-Tier Human Escalation Pipeline:** Standardizes authority roles (`Resident` $\rightarrow$ `Wing Representative` $\rightarrow$ `Estate Admin`), ensuring every issue is verified locally before administrative dispatch.
- **Sub-30s SMS & Email Notification Alerts:** Automated alerts to authorities upon verification and status change notifications to residents.
- **NGO Challenge Marketplace & CEP Credit Gamification:** Connects grassroots NGOs with students through real-world social impact tasks rewarded with CEP credits, honor badges, and leaderboards.
- **Guaranteed Production & Demo Isolation:** Real data is preserved in separate Firestore collections while evaluators and guests can explore seeded roles at `/demo`.

---

## 2. Standardized Role Personas

To maintain consistency across UI strings, Firestore data models, and documentation, the platform standardizes the 4 distinct stakeholder roles:

```
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│ 1. RESIDENT     │  ───> │ 2. WING REPRESENTATIVE │  ───> │ 3. ESTATE ADMIN     │  ───> │ 4. NGO PARTNER  │
│ (Indigo Accent) │       │ (Emerald Accent)       │       │ (Purple Accent)     │       │ (Teal Accent)   │
└─────────────────┘       └────────────────────────┘       └─────────────────────┘       └─────────────────┘
```

| Persona | Firestore `role` | Identity Accent | Primary Responsibilities |
|---|---|---|---|
| **Resident / Student** | `resident` | **Indigo** | Submits complaints with photos, upvotes existing issues, tracks real-time progress, claims NGO challenges, earns CEP credits. |
| **Wing Representative** | `wing_rep` | **Emerald** | Local floor/wing validator; filters spam/duplicates; performs on-site verification; escalates validated tickets to administration. |
| **Estate Admin** *(reconciled)* | `admin` | **Purple** | Overall campus/society manager; dispatches maintenance crews; monitors community health metrics; reviews Gemini AI executive briefings. |
| **NGO Partner** | `ngo` | **Teal** | Grassroots organization partner; posts community challenges; reviews student submissions; certifies social impact hours. |

> [!NOTE]
> **Naming Reconciliation Note:** Across all UI views, Firestore documents, schema rules, and documentation, the executive authority role is standardized to **"Estate Admin"** (reconciling legacy references to "Chief Warden").

---

## 3. End-to-End System Workflow (0 to Complete)

```mermaid
sequenceDiagram
    autonumber
    actor Resident as 1. Resident / Student
    participant UI as CEP Frontend (React / Vite)
    participant AI as Gemini AI Engine (FastAPI)
    participant DB as Cloud Firestore (cep-ai)
    actor WingRep as 2. Wing Representative
    actor Admin as 3. Estate Admin
    participant Notif as Twilio SMS & Resend Email
    actor NGO as 4. NGO Partner

    Note over Resident,DB: STEP 1: ONBOARDING & AUTHENTICATION
    Resident->>UI: Enters registration form or scans Community QR Code
    UI->>DB: Atomic Auth user creation & Firestore /users/{uid} document initialization

    Note over Resident,AI: STEP 2: PROBLEM REPORTING & AI AUDIT
    Resident->>UI: Types complaint ("Water leaking from ceiling in Wing A washroom") + Photo
    UI->>AI: POST /api/tickets/analyze & POST /api/tickets/deduplicate
    AI-->>UI: Returns Category ("Plumbing"), Urgency ("High"), AI Summary, Deduplication Check
    UI->>DB: Saves Ticket document to /tickets with status "Submitted"

    Note over WingRep,Notif: STEP 3: WING REP LOCAL SANITY CHECK & SMS DISPATCH
    WingRep->>UI: Reviews Wing A tickets queue
    WingRep->>UI: Clicks "Verify & Escalate"
    UI->>DB: Updates status to "Verified_By_Rep" & attaches verified_by UID
    UI->>Notif: POST /api/notifications/sms (<30s Twilio alert to Estate Admin)

    Note over Admin,Notif: STEP 4: ESTATE ADMIN DISPATCH & WORKFORCE TRACKING
    Admin->>UI: Receives SMS alert; opens Admin Dispatch Board
    Admin->>UI: Assigns Maintenance Crew ("Apex Plumbing Co.") & sets "In_Progress"
    UI->>DB: Updates status to "In_Progress"
    UI->>Notif: POST /api/notifications/email (Status update dispatched to Resident)

    Note over Admin,Resident: STEP 5: RESOLUTION & CEP CREDIT GAMIFICATION
    Admin->>UI: Marks ticket as "Resolved" with repair completion notes
    UI->>DB: Status -> "Resolved" & increments Resident CEP credits (+20 Points)
    Resident->>UI: Observes issue marked Resolved & checks updated Scoreboard

    Note over NGO,Resident: STEP 6: NGO CHALLENGE MARKETPLACE & SOCIAL IMPACT
    NGO->>UI: Publishes Community Challenge ("AI Model for Waste Segregation", +300 Credits)
    Resident->>UI: Claims Challenge from Marketplace Board
    Resident->>NGO: Submits project solution & documentation
    NGO->>UI: Approves submission -> Student awarded 300 CEP Credits & Social Impact Badge
```

### Detailed Workflow Step Breakdown:

#### Step 1: Onboarding, First-Class Authentication & Self-Healing Sync
- **Dedicated Auth Gateway:** Unauthenticated visitors landing on `/` immediately see an embedded Auth Card featuring clean `[ Sign In ]` and `[ Create Account ]` tabs, with dedicated URL paths (`/login`, `/register`, `/signup`).
- **Clear Navigation & Session Control:** The top navigation bar provides prominent `Sign In` and `Create Account` triggers when signed out, and a direct `Sign Out` button when signed in.
- **Demo Account Isolation Alert:** When an assessment evaluator account (`@cep.demo`) is detected on the production app (`/`), a top notification banner prompts the user to switch to their real account or navigate to `/demo`.
- **Atomic Registration Flow:** The application executes an **atomic execution lock** (`isSigningUpRef`) preventing race conditions between Firebase Auth and Firestore `setDoc` writes.
- **Transactional Compensation & Auto-Healing:** If a network partition interrupts the Firestore write, a transactional compensation automatically rolls back the orphaned Auth account, and the `onAuthStateChanged` listener features an **auto-healing sync** that restores user documents if an authenticated user document is ever missing.

#### Step 2: Intelligent Problem Intake & Gemini AI Gates
- The resident enters an issue description with optional image evidence.
- The React client streams the payload to the FastAPI backend:
  - `POST /api/tickets/analyze`: Gemini 3.8 Flash extracts the structural category (`Electrical`, `Plumbing`, `Sanitation`, `General`), urgency level (`Low`, `Medium`, `High`), defect summary, and recommended action.
  - `POST /api/tickets/deduplicate`: Gemini compares the semantic embedding of the new complaint against active tickets in that community. If an exact duplicate exists, the user is alerted to upvote the existing ticket instead of creating clutter.
- The ticket is saved in Cloud Firestore (`tickets/{ticketId}`) with status `Submitted`.

#### Step 3: Wing Representative Local Verification & SMS Alert
- Wing Reps only see complaints matching their designated wing (e.g., "Wing A").
- Reps physically verify the issue, weeding out accidental clicks or prank reports.
- Upon clicking **"Verify & Escalate"**, the backend triggers an automated **Twilio SMS Notification** to the Estate Admin within 30 seconds:
  ```
  [CEP ALERT] New verified High-urgency Plumbing issue reported in Wing A (Room A-204):
  Water leaking from ceiling washroom pipe. Verified by Rep Vikram Malhotra.
  ```

#### Step 4: Estate Admin Workforce Dispatch
- The Estate Admin views cross-community metrics, aggregated statistics, and verified tickets.
- The admin dispatches internal or contracted maintenance technicians (e.g., "Apex Plumbing", "QuickFix Electric").
- The ticket transitions to `In_Progress`, triggering a **Resend Status Email** to the resident notifying them that help is en route.
- The admin dashboard features an on-demand **Gemini Executive Briefing** summarizing major maintenance trends and overdue work orders.

#### Step 5: Resolution & CEP Gamification Feedback Loop
- Once repairs are finished, the Estate Admin marks the ticket `Resolved`.
- The reporting resident receives **+20 CEP Credits**.
- Residents can also **Upvote** critical tickets; each upvote boosts priority on the admin's dispatch board.
- The **Scoreboard** (`/scoreboard`) ranks residents, active Wing Reps, and tracks community-wide resolution speed. Reps earn badges ("Wing Leader", "Master Verifier") based on verified ticket throughput.

#### Step 6: NGO Challenge Marketplace
- Local NGOs post project-based community challenges on `/challenges` requiring technical or organizational solutions (e.g., IoT water meter telemetry, food waste audits).
- Students browse open challenges, claim tasks, and submit deliverables.
- Upon verification by the NGO, the student is awarded **300+ CEP Credits**, certificates of appreciation, and public acknowledgment on the community honor roll.

---

## 4. Production vs. Demo Separation Architecture

To allow university professors, evaluators, and recruiters to test the application without polluting live community data, the codebase strictly isolates production from demo environments:

| Attribute | Production Environment | Demonstration Environment |
|---|---|---|
| **URL Route** | `https://cep-seven.vercel.app/` (or `/app`) | `https://cep-seven.vercel.app/demo` |
| **Firestore Database Collections** | `users`, `tickets`, `communities`, `challenges` | `demo_users`, `demo_tickets`, `demo_communities`, `demo_challenges` |
| **Authentication Barrier** | Real user registration via Firebase Auth | Pre-seeded 1-Click Persona switcher + Demo logins |
| **Data Immutability** | Real resident reports and maintenance records | Isolated sandbox data; changes do not affect production |
| **UI Persona Switcher** | Hidden | Prominently displayed top evaluation banner |

```
Production Client ───> /tickets, /users, /communities ───> [Real Community Data]
Demo Client (/demo) ──> /demo_tickets, /demo_users ───────> [Isolated Sandbox Data]
```

---

## 5. Cloud Firestore Data Schema Reference

The live database in project `cep-ai` adheres to the following schemas:

### 5.1 Collection: `users/{uid}`
```typescript
interface UserProfile {
  uid: string;                 // Firebase Auth UID
  email: string;               // e.g. "aarav@campus.edu"
  displayName: string;         // e.g. "Aarav Sharma"
  role: "resident" | "wing_rep" | "admin" | "ngo";
  communityId: string;        // e.g. "comm_emerald_1"
  community_id: string;       // Normalized legacy alias
  wing: string;               // e.g. "Wing A"
  room_number: string;        // e.g. "A-304"
  phone: string;              // e.g. "+91 98765 43210"
  cepCredits: number;         // Accumulated gamification points (e.g. 150)
  createdAt: Timestamp;       // Server timestamp
}
```

### 5.2 Collection: `tickets/{ticketId}`
```typescript
interface MaintenanceTicket {
  ticket_id: string;          // e.g. "TICK-8021"
  title: string;              // "Main corridor ceiling fan sparking"
  description: string;        // Detailed issue text
  category: "Electrical" | "Plumbing" | "Sanitation" | "General";
  urgency: "Low" | "Medium" | "High";
  status: "Submitted" | "Verified_By_Rep" | "Assigned" | "In_Progress" | "Resolved" | "Rejected";
  resident_id: string;        // Submitter Auth UID
  resident_name: string;      // Submitter name
  community_id: string;       // Community identifier
  wing: string;               // Wing/Division identifier
  room_number: string;        // Room / flat location
  image_url: string | null;   // Photo proof URL
  upvotes: number;            // Community validation count
  upvoted_by: string[];       // Array of resident UIDs who upvoted
  verified_by: string | null; // Wing Rep UID or name
  assigned_worker: string | null; // Dispatched technician/contractor
  ai_summary: string;         // Gemini 1-sentence defect diagnosis
  suggested_action: string;   // Gemini recommended maintenance step
  server_created_at: Timestamp;
  server_updated_at: Timestamp;
}
```

### 5.3 Collection: `communities/{communityId}`
```typescript
interface Community {
  community_id: string;       // e.g. "comm_emerald_1"
  name: string;               // "Emerald Heights Campus Hostel"
  type: "hostel" | "housing_society" | "rwa_colony" | "ngo_hub" | "custom";
  city: string;               // "Bengaluru"
  wings: string[];            // ["Wing A", "Wing B", "Wing C", "Wing D"]
  admin_uid: string;          // Assigned Estate Admin UID
  nomenclature: {
    reporter_label: string;   // "Resident / Student"
    verifier_label: string;   // "Wing Representative"
    authority_label: string;  // "Estate Admin"
    division_label: string;   // "Wing"
  };
  members: Array<{ uid: string; name: string; role: string }>;
  created_at: string;
}
```

### 5.4 Collection: `challenges/{challengeId}`
```typescript
interface NGOChallenge {
  challenge_id: string;       // e.g. "NGO-CH-101"
  ngo_name: string;           // "CleanCity & EcoGreen Foundation"
  title: string;              // "AI Image Model for Waste Segregation"
  description: string;        // Project scope and deliverable guidelines
  skills_required: string[];  // ["React", "Python", "Computer Vision"]
  status: "Open" | "Claimed" | "In_Review" | "Closed";
  claimed_by_user_id: string | null;
  claimed_by_user_name: string | null;
  contact_email: string;      // NGO coordinator email
  reward: string;             // "Certificate of Merit + 300 CEP Credits"
  created_at: string;
}
```

---

## 6. Live Infrastructure & Environment Configuration

### 6.1 Endpoints & Deployment Status
- **Frontend Web App (Production):** [https://cep-seven.vercel.app/](https://cep-seven.vercel.app/)
- **Frontend Web App (Demo):** [https://cep-seven.vercel.app/demo](https://cep-seven.vercel.app/demo)
- **Backend API Server (Render):** [https://cep-wacs.onrender.com](https://cep-wacs.onrender.com)
- **Firebase Project Console:** [https://console.firebase.google.com/u/0/project/cep-ai/overview](https://console.firebase.google.com/u/0/project/cep-ai/overview)

### 6.2 Essential Environment Variables

#### Frontend (`frontend/.env`)
```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=cep-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cep-ai
VITE_FIREBASE_STORAGE_BUCKET=cep-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=79146197170
VITE_FIREBASE_APP_ID=1:79146197170:web:...
VITE_API_URL=https://cep-wacs.onrender.com
```

#### Backend (`backend/.env`)
```bash
GEMINI_API_KEY=AIzaSy...
TWILIO_ACCOUNT_SID=AC... (or simulated)
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
RESEND_API_KEY=re_... (or simulated)
ALLOWED_ORIGINS=https://cep-seven.vercel.app,http://localhost:5173
```

---

## 7. Verification & Health Audit Checklist

Every critical system pathway has been rigorously tested:

| Verification Category | Test Description | Result |
|---|---|:---:|
| **User Registration & DB Sync** | Live Auth creation + Firestore `/users/{uid}` document write + auto-cleanup | **PASSED** |
| **Orphaned User Repair** | Verified `ryan@edu.com` (`cXC6ZwZSs3e1xvIK9K8XmJA5x7n2`) has valid Firestore doc | **PASSED** |
| **Demo vs Prod Separation** | Verified `demo_tickets`, `demo_communities`, `demo_challenges` isolated from prod | **PASSED** |
| **Frontend Production Build** | Vite production bundle compilation with 0 syntax or asset errors | **PASSED** |
| **Modular SDK Unit Tests** | 5/5 passing tests covering Firebase v10+ modular compliance & lifecycle safety | **PASSED** |
| **FastAPI Backend & Gemini** | Render live health check returns active Gemini 3.8 Flash engine status | **PASSED** |
| **Terminology Reconciliation** | Standardized "Estate Admin" across code, UI strings, and documentation | **PASSED** |
| **Git Repository Cleanliness** | All remote branches merged and deleted; 100% of codebase unified on `main` | **PASSED** |

---

## 8. Quickstart Guide (Local Development)

### Prerequisites
- Node.js v18+ and Python 3.10+
- Git

### 1. Clone the Unified Repository
```bash
git clone https://github.com/Aryan010N/CEP.git
cd CEP
git checkout main
```

### 2. Run Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Run Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` for the Production app or `http://localhost:5173/demo` for the Demo sandbox.

