# CEP Phase-Wise Roadmap to Deployment

To keep development simple, clean, and professional, the project is structured into distinct, manageable phases. **We will implement these one phase at a time.**

---

## Phase 1: Authentication Integration (Firebase Auth) - ✅ COMPLETED
**Goal:** Secured the app with real Firebase authentication while preserving Demo Mode.
**Status:** Implemented in Sprint 1.

---

## Phase 2: Database Migration (Cloud Firestore)
**Goal:** Move Communities, Tickets, and Challenges from `localStorage` to Cloud Firestore for cross-device, real-time syncing.

**Steps to Implement:**
1. Create Firestore utility functions for CRUD operations.
2. Update `CommunityContext.jsx` to fetch active tickets and communities from Firestore.
3. Implement `onSnapshot` listeners so when an Admin updates a ticket, the Resident sees it immediately without refreshing.
4. Write basic Firestore Security Rules (e.g., users can only read tickets in their community).

**Git Commands upon completion:**
```bash
git checkout -b feat/phase2-firestore-db
git add -A
git commit -m "feat: migrate local storage state to Cloud Firestore with real-time sync"
git push -u origin feat/phase2-firestore-db
```

---

## Phase 3: Backend Productionization & Connecting the AI
**Goal:** Ensure the FastAPI backend is robust, handles CORS properly for production, and integrates flawlessly with the Gemini API.

**Steps to Implement:**
1. Configure strict CORS middleware in `main.py` to only allow the production frontend URL.
2. Wire the frontend `api.js` (or similar service) to point to the FastAPI backend.
3. Test the Gemini categorization and deduplication endpoints with real data.
4. Create a `Dockerfile` for the backend to ensure it runs exactly the same in production as locally.

**Git Commands upon completion:**
```bash
git checkout -b feat/phase3-backend-ai
git add -A
git commit -m "feat: harden FastAPI backend, add Dockerfile, wire up Gemini endpoints"
git push -u origin feat/phase3-backend-ai
```

---

## Phase 4: Cloud Deployment (Going Live)
**Goal:** Deploy the frontend to the web and the backend to a cloud server, making the app accessible to real users.

**Steps to Implement:**
1. **Frontend Deployment (Vercel):**
   - Connect Vercel to your GitHub repository (the `CEP` repo).
   - Add Vercel Environment Variables (`VITE_FIREBASE_API_KEY`, etc.).
   - Deploy.
2. **Backend Deployment (Render or Railway):**
   - Connect Render/Railway to the GitHub repository.
   - Point the deployment to the `backend/` directory.
   - Add `GEMINI_API_KEY` as an environment variable.
3. **Final Wiring:**
   - Update `VITE_BACKEND_API_URL` in the frontend production environment to point to the live Render backend URL.

**Git Commands upon completion:**
```bash
git checkout -b chore/phase4-deployment-prep
git add -A
git commit -m "chore: prepare environment variables and configs for Vercel and Render deployment"
git push -u origin chore/phase4-deployment-prep
```
