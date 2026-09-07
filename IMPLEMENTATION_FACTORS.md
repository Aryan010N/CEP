# Implementation Factors Guide

This document clearly outlines the four core factors of the Community Engagement Project (CEP): **Frontend, Backend, Database, and Authentication**. 
It includes exact instructions on what to implement, the required API keys, and how to obtain them.

---

## 1. Frontend (React + Vite + Tailwind CSS)
**Role:** The primary interface for Residents, Admins, Wing Reps, and NGOs.

**Implementation Strategy:**
- **State Management:** React Context API (`AuthContext`, `CommunityContext`) manages global state.
- **Styling:** Tailwind CSS provides rapid styling; ensure a polished, modern "glassmorphism" aesthetic.
- **Routing:** Conditional component rendering based on `currentTab` and user `role`.
- **Hosting:** Recommended to use **Vercel** or **Firebase Hosting**.

**Requirements:**
- Make sure to use standard functional components with hooks.
- For production, build the app using `npm run build` and ensure there are no compilation errors.

---

## 2. Backend (FastAPI + Google Gemini AI)
**Role:** To execute complex logic, handle heavy computations, and process AI-based categorizations.

**Implementation Strategy:**
- **Framework:** Python's FastAPI for quick, asynchronous HTTP endpoints.
- **AI Integration:** Uses `google-generativeai` package to interface with Gemini.
- **Core Endpoints:**
  - `POST /api/analyze-ticket`: Uses AI to determine a ticket's category, urgency, and provides a summary.
  - `POST /api/deduplicate`: Prevents duplicate complaints using semantic search/comparison.
- **Hosting:** Deployable via a `Dockerfile` on **Render.com** or **Railway.app**.

**API Keys Required: Google Gemini API Key**
- **How to get it:**
  1. Visit [Google AI Studio](https://aistudio.google.com/).
  2. Click "Get API Key" -> "Create API Key".
- **How to implement it:**
  - **Local Development:** Save it in `C:\CEP\backend\.env` as `GEMINI_API_KEY=your_key_here`.
  - **Production:** Provide it as a secret environment variable in your hosting provider's dashboard.

---

## 3. Database (Cloud Firestore)
**Role:** A scalable, real-time NoSQL database to persist Communities, Users, Tickets, and Challenges.

**Implementation Strategy:**
- **Data Architecture:**
  - `users/{uid}`: `{ email, name, role, phone, wing }`
  - `communities/{commId}`: `{ name, city, nomenclature, members_list }`
  - `tickets/{ticketId}`: `{ title, description, resident_id, status, category, urgency, image_url }`
- **Sync Method:** Use `onSnapshot` listeners to subscribe to collections. This ensures that when a ticket's status is modified by an Admin, the change reflects on the Resident's device immediately.

**API Keys Required: Firebase Config**
- *See Section 4 for instructions.*

---

## 4. Authentication (Firebase Auth)
**Role:** Identity management, ensuring that users are who they claim to be and protecting routes.

**Implementation Strategy:**
- **Methods:** Use `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`.
- **Integration:** Auth status should be strictly tied to the React Context (`AuthContext`), preventing unauthenticated users from accessing the dashboard unless "Demo Mode" is active.
- **Security:** Firestore Security Rules must be written to only permit data access if `request.auth != null`.

**API Keys Required: Firebase Configuration Object**
- **How to get it:**
  1. Go to the [Firebase Console](https://console.firebase.google.com/).
  2. Click the Gear icon -> Project Settings -> General.
  3. Scroll to "Your apps", select the Web App (`</>`).
  4. Copy the values from the `firebaseConfig` block.
- **How to implement it:**
  - **Local Development:** Save it in `C:\CEP\frontend\.env`:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```
  - **Production:** Provide these variables in your Vercel or Firebase Hosting deployment settings.

---

## Best Practices for Sustainability
1. **Never commit `.env` files.** Always add `.env` to `.gitignore`.
2. **Graceful Degradation:** If the Gemini API or Backend fails, the frontend should fall back to manual data entry rather than crashing.
3. **Simplicity:** Keep the project tightly scoped. Implement one Phase at a time, test thoroughly, and push clean PRs.
