# CEP Improvement Prompt — Send this to Claude Code / Antigravity

---

## CONTEXT

You are working on the **Community Engagement Project (CEP)** — an AI-powered mobile-first web app for community complaint tracking and an NGO challenge marketplace. The live app is at https://cep-seven.vercel.app. The stack is:

- **Frontend:** React 18 + Vite + Tailwind CSS, deployed on Vercel
- **Backend:** FastAPI + Google Gemini 1.5 Flash, deployed on Render
- **Database:** Firebase Cloud Firestore (modular v10+ SDK only — NEVER use v8/compat)
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage
- **Notifications:** FCM Push + Resend email

---

## CRITICAL DEFECTS TO FIX FIRST (before any new features)

Fix these in order. Do not skip or reorder.

### DEFECT 1 — Demo Mode is broken by design
The current Demo Mode injects a hardcoded role string without creating a real Firebase Auth session. This means Firestore security rules (which use `request.auth.uid`) will permanently break Demo Mode the moment rules are enforced.

**Fix:** Create a `scripts/seed-demo-users.js` that uses the Firebase Admin SDK to create 4 real Firebase Auth users with email/password and matching Firestore `/users/{uid}` documents. Demo Mode buttons should call `signInWithEmailAndPassword` with those seeded credentials, not inject strings. Demo credentials: aarav@cep.demo / vikram@cep.demo / rajesh@cep.demo / anita@cep.demo — all password: `CepDemo2024!`.

The Firestore user document schema must be:
```json
{
  "role": "resident | wingRep | admin | ngo",
  "wing": "A | B | C | null",
  "communityId": "demo-community",
  "displayName": "Full Name",
  "email": "user@cep.demo",
  "fcmToken": null,
  "cepCredits": 0,
  "migrated": false,
  "createdAt": serverTimestamp()
}
```

### DEFECT 2 — No Firestore Security Rules
The database is completely open. Write and deploy `firestore.rules` immediately:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function hasRole(role) {
      return isAuthenticated() && getUserData().role == role;
    }

    function isSameCommunity(communityId) {
      return isAuthenticated() && getUserData().communityId == communityId;
    }

    // Users can only read/write their own doc
    match /users/{uid} {
      allow read: if request.auth.uid == uid;
      allow create: if request.auth.uid == uid;
      allow update: if request.auth.uid == uid;
    }

    // Tickets
    match /tickets/{ticketId} {
      allow read: if isAuthenticated() && isSameCommunity(resource.data.communityId);
      allow create: if isAuthenticated()
        && request.resource.data.title is string
        && request.resource.data.title.size() <= 100
        && request.resource.data.description is string
        && request.resource.data.description.size() <= 1000
        && request.resource.data.submittedBy == request.auth.uid;
      allow update: if isAuthenticated()
        && (hasRole('admin') || (hasRole('wingRep') && getUserData().wing == resource.data.wing))
        && request.resource.data.keys().hasOnly(['status', 'assignedTo', 'updatedAt', 'resolvedAt']);
    }

    // NGO Challenges
    match /challenges/{challengeId} {
      allow read: if isAuthenticated();
      allow create: if hasRole('ngo')
        && request.resource.data.postedBy == request.auth.uid
        && request.resource.data.title.size() <= 120;
      allow update: if isAuthenticated()
        && (resource.data.postedBy == request.auth.uid
          || (resource.data.status == 'Open' && request.auth.uid != null));
    }

    // Communities
    match /communities/{communityId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('admin');
    }
  }
}
```

Also write `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tickets/{ticketId}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### DEFECT 3 — AI Deduplication is NOT blocking ticket saves
The `/deduplicate` endpoint exists in the backend but is never called before writing to Firestore. This means duplicates flow straight through.

**Fix:** In `frontend/src/services/firebase.js`, the `createTicket()` function MUST follow this order:

```javascript
export async function createTicket(payload) {
  // Step 1: Call deduplication gate
  const dedupResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deduplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      title: payload.title, 
      description: payload.description,
      communityId: payload.communityId 
    })
  });
  const dedupResult = await dedupResponse.json();
  
  if (dedupResult.isDuplicate) {
    // Return error with existing ticket ID — DO NOT write to Firestore
    throw new DuplicateTicketError(dedupResult.duplicateOf, dedupResult.reason);
  }
  
  // Step 2: Only if not a duplicate, write to Firestore
  const docRef = await addDoc(collection(db, 'tickets'), {
    ...payload,
    isDuplicate: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}
```

Create a custom `DuplicateTicketError` class. In the UI, catch this error and show a modal saying "A similar complaint already exists" with a link to the existing ticket.

### DEFECT 4 — onSnapshot memory leaks in CommunityContext
Every `onSnapshot` call must return its unsubscribe function inside a `useEffect` cleanup. Current implementation creates listeners but never cleans them up, causing memory leaks and stale listener accumulation.

**Fix pattern:**
```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'tickets'), where('communityId', '==', communityId)),
    (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  );
  return () => unsubscribe(); // REQUIRED cleanup
}, [communityId]);
```

### DEFECT 5 — CORS is configured as wildcard
In `backend/app/main.py`, change:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ← REMOVE THIS
    ...
)
```
To:
```python
import os
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

---

## AUTH & ONBOARDING REDESIGN

### Login Page (`frontend/src/pages/auth/Login.jsx`)
Completely redesign for mobile-first. Requirements:
- Full-screen layout with the CEP logo at top
- Email input + Password input with show/hide toggle
- "Sign In" primary button
- "Forgot Password?" link → triggers `sendPasswordResetEmail`
- "Don't have an account? Register" link
- Divider line: "or continue as demo"
- 4 demo role buttons in a 2×2 grid: Resident / Wing Rep / Admin / NGO — each calls `signInWithEmailAndPassword` with seeded credentials
- Show a loading spinner on the button while auth is in progress
- Show inline error message below the form on auth failure (e.g. "Invalid email or password")
- Add Zod validation: email must match email regex, password must be ≥ 6 chars
- On successful login, redirect to the dashboard for the user's role

### Register Page (`frontend/src/pages/auth/Register.jsx`)
- Display Name (string, required)
- Email (validated)
- Password (min 8 chars, must contain 1 uppercase + 1 number, show strength indicator)
- Confirm Password (must match)
- Role selector: Radio group — "Resident / Student" | "NGO Partner" (Wing Rep and Admin are assigned by an existing Admin, not self-selected)
- If Resident: Community dropdown (fetched from Firestore `/communities`) + Wing selector (A/B/C/D)
- If NGO: Organisation Name + Contact Email fields
- On submit: `createUserWithEmailAndPassword` → then write Firestore `/users/{uid}` doc → redirect to dashboard
- Show inline validation errors per field, not a toast

---

## MOBILE-FIRST NAVIGATION REDESIGN

### Bottom Navigation Bar (`frontend/src/components/BottomNav.jsx`)
Create this component and show it ONLY on screens smaller than `md` (768px). Hide the top navbar on mobile.

```jsx
// Tabs by role:
// Resident: Home | My Tickets | NGO Challenges | Notifications | Profile
// Wing Rep: Dashboard | Wing Tickets | Profile
// Admin: Overview | All Tickets | Analytics | Profile
// NGO: Dashboard | My Challenges | Profile
```

Each tab:
- Icon (use lucide-react) + label underneath
- Active tab: accent colour underline + icon filled
- Notification badge on Notifications tab if unread count > 0

---

## FULL FIRESTORE SERVICE LAYER

Create `frontend/src/services/firebase.js` with ONLY modular v10+ SDK syntax. No `firebase/compat`. Export these functions:

```javascript
// Tickets
createTicket(payload)           // includes dedup gate as described above
subscribeToTickets(communityId, wing, callback) // returns unsubscribe
updateTicketStatus(ticketId, status, adminUid)  // only admin/wingRep
getTicketById(ticketId)

// Challenges
createChallenge(payload)        // NGO only
subscribeToChallenges(filters, callback)
claimChallenge(challengeId, studentUid) // sets status=Claimed, claimedBy=uid
submitChallengeForReview(challengeId, studentUid)
closeChallenge(challengeId, ngoUid)     // sets status=Closed, increments student cepCredits

// Users
getUserProfile(uid)
updateUserProfile(uid, updates)
saveFCMToken(uid, token)

// Communities
getCommunities()
getCommunityById(communityId)
```

---

## NGO MARKETPLACE FULL WORKFLOW

### NGO Dashboard
When role == 'ngo', show:
1. "Post a Challenge" button → opens a form modal
2. List of challenges posted by this NGO with status badges
3. For each challenge with status = "Claimed": show student name + "Mark as Reviewed" / "Close Challenge" actions
4. Closed challenges show the student who completed it

### Challenge Form (modal)
Fields: Title (max 120), Description (max 1000, markdown supported), Tags (multi-select chip input), Deadline (date picker), Reward (string, e.g. "Certificate + 500 Credits")

On submit: write to Firestore `/challenges/{id}`, send notification email to NGO confirming post.

### Student/Resident Marketplace View
- Card grid (2 columns on mobile, 3 on desktop)
- Each card: Challenge title, org name, tags, deadline, reward, status badge
- Filter bar: by tag, by status (Open / Claimed / Closed), search by keyword
- "Claim Challenge" button visible only when status = Open and user is not NGO
- On claim: show a confirmation modal with NGO contact email visible → write claim to Firestore → send email notification to NGO via backend

### CEP Credits
When NGO closes a challenge: run a Firestore transaction:
```javascript
await runTransaction(db, async (transaction) => {
  const userRef = doc(db, 'users', challenge.claimedBy);
  const userSnap = await transaction.get(userRef);
  transaction.update(userRef, { 
    cepCredits: userSnap.data().cepCredits + 500 
  });
  transaction.update(challengeRef, { 
    status: 'Closed', 
    updatedAt: serverTimestamp() 
  });
});
```

Show CEP Credits on the student's profile page.

---

## BACKEND IMPROVEMENTS

### Add these endpoints to FastAPI:

```python
POST /challenges/notify
# Body: { type: "new_claim" | "ngo_response", challengeId, fromUid, toEmail }
# Sends email via Resend

POST /tickets/notify
# Body: { ticketId, residentEmail, status }
# Sends email when ticket status changes to "Resolved"

GET /health
# Returns: { status: "ok", gemini: true/false, firebase: true/false }
```

### Gemini Fallback Circuit Breaker
In `gemini_service.py`, wrap all Gemini calls:
```python
import asyncio

async def call_gemini_with_fallback(prompt: str, fallback_fn):
    for attempt in range(3):
        try:
            response = await call_gemini(prompt)
            return response
        except Exception as e:
            if "429" in str(e) or "503" in str(e):
                wait = 2 ** attempt
                await asyncio.sleep(wait)
            else:
                break
    # All retries exhausted — use heuristic fallback
    return fallback_fn()
```

### Add `Dockerfile`
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## PWA CONFIGURATION

Install `vite-plugin-pwa`:
```bash
npm install -D vite-plugin-pwa
```

In `vite.config.js`:
```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'CEP — Community Observer',
        short_name: 'CEP',
        theme_color: '#4F46E5',
        background_color: '#0F172A',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
```

---

## UI/DESIGN SYSTEM

The visual design must use this exact token system (update `tailwind.config.js` and `index.css`):

```css
:root {
  /* Base */
  --color-bg: #0F172A;          /* Slate 900 — deep navy background */
  --color-surface: #1E293B;     /* Slate 800 — card surface */
  --color-border: #334155;      /* Slate 700 — subtle borders */
  
  /* Accent */
  --color-primary: #6366F1;     /* Indigo 500 */
  --color-primary-dark: #4F46E5;
  
  /* Role colours */
  --color-resident: #6366F1;    /* Indigo — Resident */
  --color-wingrep: #10B981;     /* Emerald — Wing Rep */
  --color-admin: #8B5CF6;       /* Violet — Admin */
  --color-ngo: #14B8A6;         /* Teal — NGO */
  
  /* Status */
  --color-open: #F59E0B;        /* Amber */
  --color-in-progress: #3B82F6; /* Blue */
  --color-resolved: #10B981;    /* Green */
  --color-rejected: #EF4444;    /* Red */
  
  /* Urgency */
  --color-urgent-high: #EF4444;
  --color-urgent-medium: #F59E0B;
  --color-urgent-low: #6B7280;
  
  /* Typography */
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

Import from Google Fonts: `Inter` (weights 400, 500, 600, 700) and `JetBrains Mono`.

**Card component:** Dark glassmorphism — `bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl`

**Do NOT use:** Plain white cards, rainbow gradients, all-caps labels, or three.js animations.

---

## ERROR HANDLING

### React Error Boundary (`frontend/src/components/ErrorBoundary.jsx`)
```jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-6">The app hit an unexpected error. Your data is safe.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap `<App />` in `main.jsx` with `<ErrorBoundary>`.

### 404 Page (`frontend/src/pages/NotFound.jsx`)
Full-page with CEP branding, "Page not found" message, and a "Go Home" button.

### Add catch-all route in `App.jsx`:
```jsx
<Route path="*" element={<NotFound />} />
```

---

## SETTINGS PAGE AND GDPR

Create `frontend/src/pages/Settings.jsx` with:
- Profile section: edit display name
- Notification preferences: toggle push notifications (saves to Firestore)
- Danger zone: "Delete my account" button → confirmation dialog → calls backend endpoint that uses Firebase Admin SDK to:
  1. Delete all Firestore docs where `uid == auth.uid`
  2. Delete all Firebase Storage files under `tickets/` uploaded by this user
  3. Delete Firebase Auth user with `admin.auth().deleteUser(uid)`
  4. Sign out client-side

---

## ENV FILES TO CREATE

Create `frontend/.env.example`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=your_vapid_key_for_fcm
VITE_BACKEND_URL=http://localhost:8000
```

Create `backend/.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT_JSON=path/to/serviceAccount.json
ALLOWED_ORIGINS=http://localhost:5173,https://cep-seven.vercel.app
RESEND_API_KEY=your_resend_api_key
```

---

## IMPLEMENTATION ORDER

Work in exactly this sequence — do not skip steps:

1. Fix Demo Mode (seed real auth users) — BLOCKING: everything else breaks without this
2. Write and deploy Firestore + Storage security rules — BLOCKING: never ship open rules
3. Create both `.env.example` files
4. Fix `CommunityContext.jsx` onSnapshot memory leaks
5. Fix CORS in backend
6. Implement the AI deduplication gate as a blocking pre-save step
7. Redesign Login + Register pages for mobile
8. Add `BottomNav.jsx` for mobile navigation
9. Add `ErrorBoundary`, `NotFound`, and route catch-all
10. Add `Dockerfile` for backend
11. Implement full NGO challenge CRUD and claim workflow
12. Implement Firebase Storage photo uploads
13. Implement FCM push notifications
14. Implement Admin analytics dashboard
15. Add Settings page with GDPR delete
16. Add `/privacy` and `/terms` static routes
17. Add PWA manifest and service worker
18. Run Lighthouse audit and fix all issues < 90
19. Add Sentry error monitoring to frontend and backend
20. Final E2E Playwright test suite

---

## ADDITIONAL NOTES

- Use **Pydantic v2** syntax in all backend schemas (use `model_validator`, not `validator`)
- Use **Firebase Admin SDK v6+** in backend — never the client SDK
- All Firestore queries must use the **modular v10+ import** style: `import { collection, query, where, onSnapshot } from 'firebase/firestore'`
- Spring animation parameters if using motion/react: `type: "spring", stiffness: 350, damping: 25` — apply ONLY to ticket cards and status badge transitions, not every element
- All text in the UI must pass WCAG AA contrast ratio (4.5:1 minimum)
- Test on iPhone SE viewport (375px) — this is the minimum mobile target
