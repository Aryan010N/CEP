# CEP Master Project Roadmap
> **Single source of truth for all phases, sprints, pull requests, and CI/CD pipelines.**
> Last updated: October 2026

---

## CI/CD Pipeline

GitHub Actions enforces professional standards via `.github/workflows/ci.yml` on every push and PR to `main`:

1. **Vite Frontend:** `npm run build` — must pass with zero errors.
2. **FastAPI Backend:** `pip install -r requirements.txt` + syntax dry-run via `python -c "from app.main import app"`.
3. **Firestore Rules:** `firebase emulators:exec --only firestore "npx jest firestore.rules.test.js"` — rules tests must pass.

---

## ⚠️ Critical Defects Found in Current Dev Plan

These must be fixed before proceeding to any new feature work:

| # | Defect | Severity | Fix |
|---|---|---|---|
| 1 | **No `.env.example` exists** — devs clone and have no idea what vars are needed | 🔴 Critical | Create `frontend/.env.example` and `backend/.env.example` with all keys documented |
| 2 | **No Firestore Security Rules** — any authenticated user can read/write any document | 🔴 Critical | Write `firestore.rules` immediately before any Firestore data goes to production |
| 3 | **AI deduplication is post-save** — the Gemini endpoint exists but is never called before a ticket is written to Firestore | 🔴 Critical | Make deduplication a blocking gate: frontend calls `/deduplicate` → if flagged → block save |
| 4 | **Demo mode bypasses real auth** — Demo Mode logs in with hardcoded role strings, not real Firebase Auth UIDs; role-based Firestore rules will break Demo Mode entirely | 🔴 Critical | Create real seeded Firebase Auth demo users + matching Firestore user docs |
| 5 | **No `localStorage` migration path** — Sprint 2 replaces localStorage but existing Demo data in user browsers will be orphaned | 🟠 High | Write a one-time migration helper `migrateLocalStorageToFirestore()` called on first authenticated load |
| 6 | **`CommunityContext.jsx` has no unsubscribe cleanup** — `onSnapshot` listeners are created but never cleaned up on unmount | 🟠 High | Return unsubscribe from every `useEffect` that calls `onSnapshot` |
| 7 | **CORS is not configured for production** — `main.py` allows `*`; will silently fail or over-expose in production | 🟠 High | Set `ALLOWED_ORIGINS` from env var; reject `*` in production |
| 8 | **No error boundary** — a single component crash produces a blank white screen | 🟠 High | Wrap `App.jsx` in `<ErrorBoundary>` with a branded fallback |
| 9 | **NGO workflow is UI-only** — NGO cards exist but claim/contact/status flow has no Firestore writes or backend calls | 🟠 High | Implement full NGO challenge CRUD and claim flow as detailed in Phase 5 |
| 10 | **No rate limiting on ticket submission** — a resident can spam unlimited tickets | 🟡 Medium | Check last submission timestamp in Firestore before allowing a new ticket write |
| 11 | **No `Dockerfile` for backend** — Render deployment is fragile without a locked container | 🟡 Medium | Add `backend/Dockerfile` with pinned Python version |
| 12 | **No 404 / 500 pages** — unknown routes crash the router silently | 🟡 Medium | Add `NotFound.jsx` and `ServerError.jsx` with React Router catch-all |
| 13 | **Mobile navigation is missing** — desktop navbar is not usable on mobile (no bottom nav bar) | 🟡 Medium | Implement `BottomNav.jsx` for mobile, hide desktop nav on small screens |
| 14 | **No PWA manifest or service worker** — declared as mobile-first but not installable | 🟡 Medium | Add `manifest.json` + Vite PWA plugin with offline caching |
| 15 | **No storage rules** — Firebase Storage is open by default | 🟡 Medium | Write `storage.rules` restricting uploads to authenticated users, max 5MB |
| 16 | **`imageUrl` is a string field** — no actual file upload capability exists | 🟡 Medium | Implement Firebase Storage upload flow with `getDownloadURL` |
| 17 | **No GDPR delete-account flow** — required for any public-facing app collecting personal data | 🟡 Medium | Add Settings page with "Delete my account" that removes Auth user + Firestore docs |
| 18 | **Backend has no Gemini fallback circuit breaker** — if Gemini API is down, ticket submission fails entirely | 🟡 Medium | Catch 429/5xx from Gemini, return heuristic fallback response instead of 500 |
| 19 | **No email notification on ticket resolution** — residents never know their ticket was resolved | 🟡 Medium | Trigger Resend email when Admin sets status to "Resolved" |
| 20 | **No input sanitisation on ticket title/description** — XSS and schema violation possible | 🟡 Medium | Add Pydantic field validators + frontend character limits with live counters |

---

## Phase 1: Authentication & Core Setup ✅ COMPLETED

**Goal:** Firebase Auth, role-based navigation, Demo Mode.

### Sprint 1 PR
**Title:** `feat(sprint-1): Core platform setup, role-based navigation, and Firebase Auth integration`

**Git (already pushed):**
```bash
git checkout -b sprint-1
git add -A
git commit -m "feat(sprint-1): Core platform setup and Firebase Auth integration"
git push -u origin sprint-1
```

---

## Phase 2: Auth Hardening + Onboarding Redesign 🚧 DO THIS FIRST (before Firestore)

**Goal:** Fix the broken Demo Mode, create real seeded users, and build a proper sign-up/login UX that works on mobile.

**Why this is Phase 2 (moved up):** Demo Mode currently uses string-based role injection that will completely break once Firestore security rules go live. Fix auth before migrating data.

### Sprint 2A Tasks
- [ ] Create `scripts/seed-demo-users.js` — creates 4 real Firebase Auth users + Firestore `/users/{uid}` docs with role, wing, and profile fields
- [ ] Remove hardcoded role string from Demo Mode; replace with `signInWithEmailAndPassword` using seeded credentials
- [ ] Build `Login.jsx` mobile-first redesign: email/password form + Google Sign-In + "Use Demo" shortcuts
- [ ] Build `Register.jsx`: email, password, display name, select role (Resident/NGO), select community/wing
- [ ] Add Zod validation on all auth form fields with inline error messages
- [ ] Add `useEffect` to redirect already-authenticated users away from `/login`
- [ ] Write `/users/{uid}` Firestore doc on registration: `{ role, wing, communityId, displayName, email, createdAt }`
- [ ] Add "Forgot Password" flow using `sendPasswordResetEmail`

### Sprint 2A PR
**Title:** `feat(sprint-2a): Auth hardening, seeded demo users, and mobile-first onboarding redesign`

```bash
git checkout -b sprint-2a
git add -A
git commit -m "feat(sprint-2a): real seeded demo users, auth hardening, mobile login/register redesign"
git push -u origin sprint-2a
```

---

## Phase 3: Cloud Firestore Migration 🚧 CURRENT

**Goal:** Move Communities, Tickets, and Challenges from `localStorage` to Cloud Firestore with real-time syncing. Fix the six Firestore-related defects above.

### Sprint 3 Tasks

#### 3A — Firestore Security Rules (MUST BE FIRST)
- [ ] Write `firestore.rules`:
  ```
  /users/{uid}       → read: uid == request.auth.uid; write: uid == request.auth.uid
  /tickets/{id}      → read: auth != null + same community; create: auth != null; update: role == admin || role == wingRep
  /challenges/{id}   → read: auth != null; create: role == ngo; update: role == ngo || claimedBy == request.auth.uid
  /communities/{id}  → read: auth != null; write: role == admin
  ```
- [ ] Write `storage.rules`: authenticated users only, max 5MB, image MIME types only
- [ ] Deploy rules: `firebase deploy --only firestore:rules,storage:rules`
- [ ] Write Jest tests for every rule using the Firebase Emulator

#### 3B — Firestore Service Layer
- [ ] Create `frontend/src/services/firebase.js` with tree-shakeable exports:
  - `createTicket(payload)` — calls `/deduplicate` API first; blocks if duplicate
  - `subscribeToTickets(communityId, wing, callback)` — returns unsubscribe
  - `updateTicketStatus(ticketId, status, updatedBy)`
  - `createChallenge(payload)`
  - `subscribeToChallenges(filters, callback)`
  - `claimChallenge(challengeId, studentUid)`
- [ ] Use `serverTimestamp()` for all `createdAt`/`updatedAt` fields
- [ ] Never use `.toDate()` without a null guard

#### 3C — Context & Memory Leak Prevention
- [ ] Refactor `CommunityContext.jsx`: every `onSnapshot` call inside `useEffect` must `return unsubscribeFunction`
- [ ] Write `migrateLocalStorageToFirestore()` helper; call once on first authenticated session, then set a migration flag in the user's Firestore doc

#### 3D — Real-Time Testing
- [ ] Playwright test: Resident adds ticket → Admin dashboard updates within 1500ms without reload
- [ ] Playwright test: Admin updates ticket status → Resident dashboard badge updates within 1500ms

### Sprint 3 PR
**Title:** `feat(sprint-3): Cloud Firestore migration, security rules, and real-time syncing`

```bash
git checkout -b sprint-3
git add -A
git commit -m "feat(sprint-3): Firestore migration with security rules, service layer, and real-time tests"
git push -u origin sprint-3
```

---

## Phase 4: AI Deduplication Gate + Backend Hardening

**Goal:** Gemini must block duplicate tickets before they are saved. Backend must be production-grade.

### Sprint 4 Tasks
- [ ] Frontend: before `createTicket()` calls Firestore, call `POST /deduplicate` with ticket payload
  - If `{ isDuplicate: true, existingTicketId }` → show modal with link to existing ticket, block submission
  - If `{ isDuplicate: false }` → proceed to Firestore write
- [ ] Backend: if Gemini returns 429 or 5xx, fall back to heuristic (keyword + Levenshtein distance) and return `{ fallback: true }`
- [ ] Add Pydantic v2 field validators: `title` max 100 chars, `description` max 1000 chars, `status` must be in enum
- [ ] Add rate limiting middleware in FastAPI: max 5 ticket submissions per user per hour (check via Redis or Firestore timestamp)
- [ ] Add `Dockerfile` for backend with `python:3.12-slim` base
- [ ] Configure CORS from `ALLOWED_ORIGINS` env var only; remove wildcard
- [ ] Add `/health` endpoint returning `{ status: "ok", gemini: bool }`

### Sprint 4 PR
**Title:** `feat(sprint-4): AI deduplication gate, backend hardening, Dockerfile, rate limiting`

```bash
git checkout -b sprint-4
git add -A
git commit -m "feat(sprint-4): blocking AI deduplication, backend hardening, Dockerfile"
git push -u origin sprint-4
```

---

## Phase 5: Mobile-First UI Redesign + PWA

**Goal:** The app must feel native on mobile. Add bottom navigation, offline support, and installability.

### Sprint 5 Tasks
- [ ] Add `BottomNav.jsx` with 4–5 tabs: Home, Tickets, NGO, Notifications, Profile — visible only on `< md` screens
- [ ] Hide top navbar on mobile; show only on `>= md`
- [ ] Implement `vite-plugin-pwa` with Workbox: cache shell + Firestore offline persistence
- [ ] Add `manifest.json`: name, short_name, icons (192, 512), theme_color, display: standalone
- [ ] Add `loading="lazy"` to all images; skeleton loaders for Firestore lists
- [ ] Implement `motion/react` spring transitions: `type: "spring", stiffness: 350, damping: 25` on ticket cards and status badge changes only (not every element)
- [ ] Add pull-to-refresh gesture on mobile dashboards
- [ ] Audit colour contrast ratios — all text must pass WCAG AA (4.5:1)
- [ ] Add `<ErrorBoundary>` wrapping all page-level components with branded fallback UI

### Sprint 5 PR
**Title:** `feat(sprint-5): Mobile-first UI redesign, PWA, error boundaries, motion`

```bash
git checkout -b sprint-5
git add -A
git commit -m "feat(sprint-5): PWA, bottom nav, motion, error boundaries, mobile layout"
git push -u origin sprint-5
```

---

## Phase 6: Firebase Storage + Notifications

**Goal:** Real photo uploads for complaint evidence. Residents notified when their ticket is resolved.

### Sprint 6 Tasks
- [ ] Replace `imageUrl` string field with Firebase Storage upload in `createTicket()`:
  - Accept `File` object in the form
  - Upload to `gs://cep/tickets/{ticketId}/{filename}`
  - Store `downloadURL` in Firestore ticket doc
- [ ] Add file size validation (max 5MB) and MIME type check (image/*) on frontend before upload
- [ ] Add progress indicator for upload
- [ ] FCM Push Notifications:
  - Register service worker + get FCM token on login
  - Save token to `/users/{uid}/fcmToken` in Firestore
  - When Admin sets ticket `status = "Resolved"`, backend triggers FCM push to resident's token
- [ ] Email fallback: if FCM fails, send Resend email to resident's email
- [ ] Test notifications end-to-end with Playwright

### Sprint 6 PR
**Title:** `feat(sprint-6): Firebase Storage photo uploads and FCM push notifications`

```bash
git checkout -b sprint-6
git add -A
git commit -m "feat(sprint-6): real photo uploads, FCM notifications, email fallback"
git push -u origin sprint-6
```

---

## Phase 7: NGO Marketplace Full Workflow

**Goal:** Complete the end-to-end NGO challenge lifecycle so it is actually functional, not just a UI.

### Sprint 7 Tasks
- [ ] NGO Registration flow: additional fields for `orgName`, `contactEmail`, `website`
- [ ] NGO Dashboard: post challenge form + list of own challenges with claim requests
- [ ] `challenges` Firestore collection: full CRUD with security rules
- [ ] Student claim flow: "Claim Challenge" → writes claim request → NGO sees it in their dashboard
- [ ] NGO accept/reject claim: updates `status` and `claimedBy`
- [ ] Student submission: "Submit for Review" button → NGO reviews → closes challenge
- [ ] CEP Credits: on challenge close, increment `/users/{studentUid}/cepCredits` in Firestore
- [ ] Challenge browse: filter by tag, status, deadline; search by keyword
- [ ] Backend `/challenges/notify` endpoint: sends email to NGO on new claim, to student on NGO response
- [ ] Playwright test: NGO posts → Student claims → NGO accepts → Credits incremented

### Sprint 7 PR
**Title:** `feat(sprint-7): Full NGO marketplace workflow — post, claim, review, credits`

```bash
git checkout -b sprint-7
git add -A
git commit -m "feat(sprint-7): NGO challenge full lifecycle, claim workflow, CEP credits"
git push -u origin sprint-7
```

---

## Phase 8: Admin Analytics Dashboard

**Goal:** Admins need data, not just a list.

### Sprint 8 Tasks
- [ ] Aggregate metrics in Firestore using Cloud Functions or client-side computed from `onSnapshot`:
  - Total Tickets, Open / In Progress / Resolved counts
  - Resolution Rate (%) and Average Resolution Time
  - Top 3 categories this week
  - Wing-by-wing breakdown
- [ ] Render as stat cards + simple bar chart (Recharts)
- [ ] Gemini executive briefing: "Summarise the community's infrastructure health this week" → rendered as a formatted card
- [ ] Export tickets to CSV button (client-side using `papaparse`)

### Sprint 8 PR
**Title:** `feat(sprint-8): Admin analytics dashboard with Gemini briefing and CSV export`

```bash
git checkout -b sprint-8
git add -A
git commit -m "feat(sprint-8): admin analytics, Gemini briefing, CSV export"
git push -u origin sprint-8
```

---

## Phase 9: Legal, GDPR, and Production Resilience

**Goal:** Make the app legally compliant and resilient against crashes.

### Sprint 9 Tasks
- [ ] `/privacy` static route: Privacy Policy covering Firebase data collection and Gemini AI processing
- [ ] `/terms` static route: Terms of Service
- [ ] Settings page: "Delete my account" flow — deletes Firebase Auth user + all Firestore docs for that UID + Storage files
- [ ] React Error Boundaries: branded 404 (`NotFound.jsx`) and 500 (`ServerError.jsx`) pages
- [ ] Gemini circuit breaker: exponential backoff on 429; graceful degradation message on sustained failure
- [ ] Structured logging in FastAPI using `structlog` with request IDs
- [ ] Add Sentry (or equivalent) to both frontend and backend for error monitoring

### Sprint 9 PR
**Title:** `feat(sprint-9): GDPR compliance, legal pages, error boundaries, error monitoring`

```bash
git checkout -b sprint-9
git add -A
git commit -m "feat(sprint-9): GDPR delete, privacy/terms pages, error monitoring, circuit breaker"
git push -u origin sprint-9
```

---

## Phase 10: Performance, Accessibility & Final Audit

**Goal:** Ship a product that passes Lighthouse ≥ 90 on all axes.

### Sprint 10 Tasks
- [ ] Run Lighthouse audit: Performance, Accessibility, Best Practices, SEO
- [ ] Code-split routes with `React.lazy()` + `Suspense`
- [ ] Optimise images: WebP format, responsive `srcset`
- [ ] Add `aria-label`, `role`, and keyboard navigation to all interactive elements
- [ ] Reduce Motion: respect `prefers-reduced-motion` — disable spring animations
- [ ] Add `<meta>` SEO tags and Open Graph tags for social sharing
- [ ] Final Playwright E2E test suite covering all critical user journeys
- [ ] Security audit: check for exposed API keys in bundle, validate all Firestore rules

### Sprint 10 PR
**Title:** `feat(sprint-10): Lighthouse audit, accessibility hardening, final E2E tests`

```bash
git checkout -b sprint-10
git add -A
git commit -m "feat(sprint-10): performance, accessibility, final audit"
git push -u origin sprint-10
```

---

## Appendix: Firestore Data Model

```
/users/{uid}
  role: "resident" | "wingRep" | "admin" | "ngo"
  wing: "A" | "B" | "C" | null
  communityId: string
  displayName: string
  email: string
  fcmToken: string | null
  cepCredits: number (default 0)
  migrated: boolean
  createdAt: timestamp

/tickets/{ticketId}
  title: string (max 100)
  description: string (max 1000)
  category: "Electrical" | "Plumbing" | "Sanitation" | "General"
  urgency: "Low" | "Medium" | "High"
  status: "Open" | "Verified" | "In Progress" | "Resolved" | "Rejected"
  submittedBy: uid
  wing: string
  communityId: string
  imageUrl: string | null (Firebase Storage download URL)
  isDuplicate: boolean
  duplicateOf: ticketId | null
  aiCategory: string
  aiUrgency: string
  aiConfidence: number
  createdAt: timestamp
  updatedAt: timestamp
  resolvedAt: timestamp | null
  assignedTo: string | null

/challenges/{challengeId}
  postedBy: uid
  orgName: string
  contactEmail: string
  title: string (max 120)
  description: string (max 1000)
  tags: string[]
  deadline: timestamp
  reward: string
  status: "Open" | "Claimed" | "In Review" | "Closed"
  claimedBy: uid | null
  createdAt: timestamp
  updatedAt: timestamp

/communities/{communityId}
  name: string
  wings: string[]
  adminUid: uid
  createdAt: timestamp
```

---

## Appendix: Gemini Prompt Templates

### Ticket Analysis Prompt
```
You are an infrastructure complaint triage assistant.
Analyse the following complaint and respond ONLY in JSON:
{
  "category": "Electrical | Plumbing | Sanitation | General",
  "urgency": "Low | Medium | High",
  "confidence": 0.0-1.0,
  "summary": "one sentence"
}
Complaint: {complaint_text}
```

### Deduplication Prompt
```
You are a complaint deduplication engine.
Given an incoming complaint and a list of existing open complaints,
determine if the incoming complaint is substantially the same as any existing one.
Respond ONLY in JSON:
{
  "isDuplicate": true | false,
  "duplicateOf": "ticketId or null",
  "reason": "brief explanation"
}
Incoming: {incoming_text}
Existing: {existing_tickets_json}
```

### Admin Executive Briefing Prompt
```
You are a community infrastructure analyst. Given the following ticket data,
write a 3-paragraph executive briefing for an estate warden. Be factual, concise,
and highlight the top urgent issue and recommended action.
Ticket data: {tickets_json}
```
