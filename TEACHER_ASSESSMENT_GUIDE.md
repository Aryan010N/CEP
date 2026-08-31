# Teacher Assessment & Evaluation Guide 🎓
## AI Community Digital Problem Observatory (CEP Mobile-First Platform)

---

## 1. How to Test the Project Locally (Step-by-Step)

### Step 1: Start Backend (FastAPI + Gemini)
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- **Health Check:** `http://localhost:8000/health`
- **Swagger Docs:** `http://localhost:8000/docs`

### Step 2: Start Frontend (Mobile-First Vite + React)
```bash
cd frontend
npm run dev
```
- **App URL:** `http://localhost:5173`
- *Tip for Best Assessment View:* Press `F12` in Chrome/Edge, click the **Device Toggle (Phone icon)** to view in mobile phone dimensions (e.g. iPhone 14 / Pixel 7), or enjoy the responsive desktop layout!

---

## 2. 5-Minute Live Demo Script for Assessment / Teachers

### 🕒 Minute 1: Multi-Community Self-Registration & Custom Hierarchy Titles
1. **Explain:** *"Our platform isn't limited to a single hostel or hardcoded roles. Any housing society, apartment complex, or village RWA can register themselves in 30 seconds and configure their own hierarchy names."*
2. **Action:**
   - Tap **"Communities"** (or the Hub icon in the bottom navigation).
   - Tap **"+ Register New Community"**.
   - Select Preset: **"Housing Society / Apartment"** or **"Residential Colony / RWA"**.
   - Show the custom hierarchy fields:
     * *Reporter Title:* e.g. **"Flat Owner"**
     * *Verifier Title:* e.g. **"Floor Captain"**
     * *Authority Title:* e.g. **"Society Secretary"**
   - Click **"Create Community"**.
   - **Showcase to Teacher:** The entire app dynamically adapts: navbar persona switchers, badge tags, and routing headers now display the custom names!

### 🕒 Minute 2: Complaint Submission with Photo / Camera Proof
1. **Explain:** *"Residents log complaints using natural language, attach photo proof, and let Gemini AI automatically categorize and route to the local Floor Captain."*
2. **Action (Flat Owner Role):**
   - Tap **"Sample 2 (Pipe Leak)"** or take/select a photo using the **Image Picker**.
   - Tap **"Analyze & Submit Complaint"**.
   - **Showcase to Teacher:** The Gemini AI modal displays the photo evidence, classifies the trade as **Plumbing**, urgency as **High**, and explains the auto-routing.
   - Tap **"Submit to Floor Captain"**.

### 🕒 Minute 3: Verifier Node Inspection & Escalation
1. **Explain:** *"The Floor Captain acts as a human-in-the-loop spam filter for their specific tower or wing."*
2. **Action (Floor Captain Role):**
   - Switch persona to **"2. Floor Captain"**.
   - Open the ticket, tap **"Zoom Photo"** to inspect evidence.
   - Tap **"Verify & Escalate"**.
   - **Showcase to Teacher:** The ticket is timestamped and forwarded to the Society Secretary.

### 🕒 Minute 4: Society Secretary Dispatch & Lifecycle Completion
1. **Explain:** *"The management hub receives verified tickets and coordinates physical technicians with full status tracking."*
2. **Action (Society Secretary Role):**
   - Switch persona to **"3. Society Secretary"**.
   - View the AI Management Briefing.
   - Tap **"Manage Workforce & Status"** on the ticket.
   - Set status to **"In Progress"** $\rightarrow$ Assign **"AquaMaster Plumber"** $\rightarrow$ Save.
   - Move to **"Resolved & Closed"** with remarks: *"Replaced faulty joint. Pressure restored."*
   - **Showcase to Teacher:** The ticket moves across the full lifecycle to resolution.

### 🕒 Minute 5: NGO Technical Bridge & Mobile Experience
1. **Action:**
   - Tap the bottom **"NGO"** tab.
   - Showcase open operational challenges uploaded by NGOs (e.g. *Waste Auditing AI*, *IoT Water Tank Dashboard*).
   - Tap **"Claim Challenge"** to demonstrate student participation for CEP credits.

---

## 3. Defense Matrix: Addressing Evaluation & Counter-Questions

### ❓ Question 1: "Your app just takes complaints. Who actually solves the problem? Who takes responsibility?"
> **Your Defense:**
> *"The platform is an **accountability and visibility pipeline**. Currently, complaints get lost in WhatsApp chats without ownership. Our system assigns strict ownership: the Floor Captain / Wing Rep is accountable for acknowledging and verifying within hours, and once escalated, the public visibility on the dashboard ensures the Society Secretary / Warden acts quickly. We solve the administrative tracking bottleneck that causes delayed physical repairs."*

---

### ❓ Question 2: "How does this work for different types of communities (hostels vs societies vs RWAs)?"
> **Your Defense:**
> *"Our platform features a **Custom Nomenclature Engine**. When a community registers, they define their own hierarchy: a hostel can use `Student $\rightarrow$ Wing Rep $\rightarrow$ Warden`, while a luxury society can use `Flat Owner $\rightarrow$ Floor Captain $\rightarrow$ Society Secretary`. The entire data schema and UI adapt seamlessly."*

---

### ❓ Question 3: "What if residents send fake complaints, test messages, or spam?"
> **Your Defense:**
> *"Three layers of protection prevent spam: (1) Complaints require photo evidence, (2) Our Gemini AI deduplication engine detects and groups repetitive reports, and (3) The elected Verifier node sanity-checks the issue locally before any maintenance crew is dispatched."*

---

## 4. Next Tasks & Milestones Roadmap

1. **WhatsApp & SMS Webhooks (Twilio):** Trigger instant WhatsApp messages to Verifiers when a complaint is logged in their block.
2. **Offline Progressive Web App (PWA):** Service worker caching for offline complaint drafting when cell signal is weak.
3. **Automated Maintenance PDF Reports:** One-click official PDF summary downloads for monthly society/hostel committee meetings.
