# CEP Master Project Roadmap

This document serves as the single source of truth for the Community Engagement Project (CEP) phases, sprints, pull requests, and CI/CD pipelines.

---

## CI/CD Pipeline Configuration

We enforce professional standards using GitHub Actions. A Continuous Integration pipeline is configured in `.github/workflows/ci.yml` that automatically runs on every push and pull request to the `main` branch. 
It ensures:
1. The Vite Frontend builds successfully without syntax errors.
2. The FastAPI Backend installs successfully and passes a syntax dry-run.

---

## Phase 1: Authentication Integration (Firebase Auth) - ✅ COMPLETED
**Goal:** Secured the app with real Firebase authentication while preserving Demo Mode.
**Status:** Implemented in Sprint 1.

### Sprint 1 Pull Request Details
**PR Title:** `feat(sprint-1): Core platform setup, role-based navigation, and Firebase Auth integration`

**PR Description Template:**
```markdown
## Overview
This PR concludes Sprint 1 for the Community Engagement Project (CEP). It introduces strict role-based access control, fixes critical backend startup crashes, sets up a robust UI, and successfully integrates real Firebase Authentication.

## Key Changes
- **Backend Stability:** Fixed `UnicodeDecodeError` in FastAPI startup.
- **Firebase Auth:** Added real Firebase `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`.
- **Role-Based Workflows:** Strict tab visibility for Resident, Wing Rep, Admin, and NGO roles.
- **QR Code Engine:** Dependency-free QR code generator for Invites and Complaints.
- **Demo Mode:** Preserved bypass system for quick presentations.
```

**Git Commands (Already Completed):**
```bash
git checkout -b sprint-1
git add -A
git commit -m "feat(sprint-1): Core platform setup and Firebase Auth integration"
git push -u origin sprint-1
```

---

## Phase 2: Database Migration (Cloud Firestore) - 🚧 CURRENT
**Goal:** Move Communities, Tickets, and Challenges from `localStorage` to Cloud Firestore for cross-device, real-time syncing.
**Authoritative Operational Playbook:** See [`SKILL.md`](./SKILL.md) (or `.agents/skills/sprint-2-firestore/SKILL.md`) for mandatory rules and tool integration protocols.

### Sprint 2 Integrated Tooling Architecture
During Sprint 2, all development follows strict operational boundaries enabled by our MCP ecosystem:
- **Context7 MCP:** Enforce documentation pre-checks for Firebase v10+ modular SDK (`collection`, `doc`, `onSnapshot`, `serverTimestamp`) and React 18 Context API. Legacy v8/compat syntax is strictly banned.
- **DesignRevision & Anima MCP:** Discover, inspect, and import production-grade, accessible, mobile-first Tailwind CSS components matching our glassmorphism design system rather than writing generic markup.
- **Google Stitch:** Rapidly synthesize Gemini-powered mobile screens and drawer wireframes into semantic HTML/Tailwind templates.
- **motion.dev:** Enforce physics-based micro-interactions (`type: "spring", stiffness: 350, damping: 25`) with compositor-only properties (`transform`, `opacity`), adhering to our anti-slop guidelines.
- **Manus:** Subagent delegation protocol for routine component boilerplate, mock data generators, and test skeletons under architect review gates.
- **Playwright MCP:** Drive multi-session headless browser instances (Resident vs Admin) to deterministically verify that `onSnapshot` updates reflect in the DOM dynamically without page reloads.

### Sprint 2 Implementation & Verification Steps
1. **Pre-Implementation Doc Check:** Query Context7 MCP for latest `@firebase/firestore` v10+ modular APIs and unsubscribe lifecycle rules.
2. **Component & Token Alignment:** Use DesignRevision, Anima, and Google Stitch for mobile-first, accessible Tailwind components.
3. **Spring Motion Integration:** Integrate `motion/react` with spring physics on interactive cards and status badges.
4. **Firestore CRUD & Service Layer:** Create tree-shakeable utility functions in `frontend/src/services/firebase.js` using `serverTimestamp()`.
5. **Context Sync & Memory Leak Prevention:** Update `CommunityContext.jsx` with `onSnapshot` subscribers that strictly return their unsubscribe cleanup handlers in `useEffect`.
6. **Real-Time Testing Loop with Playwright MCP:**
   - Context A (Resident) views initial ticket list.
   - Context B (Estate Admin) updates ticket status to "In Progress".
   - Playwright asserts Context A DOM dynamically updates to "In Progress" within 1500ms without page reload.
7. **Security Rules Enforcement:** Write and validate Firestore rules requiring `request.auth != null` and restricting ticket updates to authorized community and wing roles.

### Sprint 2 Pull Request Details
You are currently working on Sprint 2. Once your Firestore changes are complete and verified via Playwright, use these details for your PR:

**PR Title:** `feat(sprint-2): Cloud Firestore integration and real-time syncing`

**PR Description Template:**
```markdown
## Overview
This PR concludes Sprint 2 by moving the platform's data layer from `localStorage` to Firebase Cloud Firestore with verified real-time syncing.

## Key Changes
- **Firestore Migration:** Communities, Tickets, and Challenges persisted in Cloud Firestore using modular Firebase v10+ SDK.
- **Real-Time Updates:** Integrated `onSnapshot` listeners with proper unsubscribe cleanup hooks in `CommunityContext.jsx`.
- **Mobile-First UI & Motion:** Glassmorphism UI tokens refined via DesignRevision/Anima with spring physics via `motion/react`.
- **Playwright Verification:** Verified concurrent multi-session DOM reactivity without page reloads.
- **Security:** Established initial Firestore security rules isolating community data.
```

**Git Commands to push Sprint 2:**
```bash
# Assuming you are on main, branch out to your sprint branch
git checkout -b sprint-2

# After making your changes...
git add -A
git commit -m "feat: migrate local storage state to Cloud Firestore with real-time sync"
git push -u origin sprint-2
```

---

## Phase 3: Backend Productionization & Connecting the AI - ⏳ UPCOMING
**Goal:** Ensure the FastAPI backend is robust, handles CORS properly for production, and integrates flawlessly with the Gemini API.

### Implementation Steps
1. Configure strict CORS middleware in `main.py` to allow the frontend URL.
2. Wire the frontend `api.js` (or similar service) to point to the FastAPI backend.
3. Test the Gemini categorization and deduplication endpoints with real data.
4. Create a `Dockerfile` for the backend to ensure it runs exactly the same in production as locally.

**Git Commands to push Phase 3:**
```bash
git checkout -b phase3-backend-ai
git add -A
git commit -m "feat: harden FastAPI backend, add Dockerfile, wire up Gemini endpoints"
git push -u origin phase3-backend-ai
```

---

## Phase 4: Cloud Deployment (Going Live) - ⏳ UPCOMING
**Goal:** Deploy the frontend to the web and the backend to a cloud server, making the app accessible to real users.

### Implementation Steps
1. **Frontend Deployment (Vercel):** Connect Vercel to your GitHub repo, add env vars (`VITE_FIREBASE_API_KEY`, etc.), and deploy.
2. **Backend Deployment (Render/Railway):** Connect to GitHub, deploy the `backend/` directory, and set `GEMINI_API_KEY`.
3. **Final Wiring:** Update `VITE_BACKEND_API_URL` in the frontend production environment to point to the live backend URL.

**Git Commands to push Phase 4:**
```bash
git checkout -b phase4-deployment
git add -A
git commit -m "chore: prepare environment variables and configs for production deployment"
git push -u origin phase4-deployment
```
