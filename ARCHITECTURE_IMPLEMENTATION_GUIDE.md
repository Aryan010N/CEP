# CEP Architecture & Implementation Guide

This document outlines the technical factors required for the Community Engagement Project (CEP), how they are implemented, and how to manage the required API keys. This acts as the source of truth for the project stack.

## 1. Frontend (React + Vite + Tailwind CSS)
**Role:** The user-facing application for residents, admins, and NGOs.
**Implementation Strategy:**
- **State Management:** React Context API (`AuthContext`, `CommunityContext`) for global state.
- **Styling:** Tailwind CSS for rapid, responsive UI, leveraging glassmorphism aesthetics.
- **Routing:** Conditional component rendering based on `currentTab` and user `role`.
- **Hosting:** Vercel or Firebase Hosting (recommended for seamless Firebase ecosystem integration).

## 2. Authentication (Firebase Auth)
**Role:** Securely managing user identities, logins, and registrations.
**Why Firebase Auth?** It's free, handles password resets, email verification, and integrates perfectly with Firestore Security Rules.
**Implementation Steps (Already completed in Sprint 1):**
1. Firebase `signInWithEmailAndPassword` and `createUserWithEmailAndPassword` are active in `frontend/src/context/AuthContext.jsx`.
2. The user's name is updated using `updateProfile`.
**Keys Required:** Firebase Config Object (API Key, Auth Domain, Project ID).

## 3. Database (Cloud Firestore)
**Role:** NoSQL document database to store Communities, Users, Tickets, and Challenges.
**Implementation Strategy:**
- **Data Model:**
  - `users/{uid}`: `{ email, name, role, phone, wing }`
  - `communities/{commId}`: `{ name, city, wings, nomenclature, members_list }`
  - `tickets/{ticketId}`: `{ title, description, resident_id, status, category, urgency, image_url }`
- **Real-time Sync:** Use Firestore `onSnapshot` in `CommunityContext` so when an Admin updates a ticket status, the Resident's dashboard updates instantly without refreshing.
**Keys Required:** Same Firebase Config Object used for Auth.

## 4. Backend (FastAPI + Google Gemini)
**Role:** Handles heavy AI processing (categorization, deduplication) and complex reporting.
**Implementation Strategy:**
- **Framework:** FastAPI for fast, async endpoints.
- **AI Integration:** Google Generative AI SDK (`google-generativeai`).
- **Endpoints:**
  - `POST /api/analyze-ticket`: Takes ticket text, returns JSON with category, urgency, and summary.
  - `POST /api/deduplicate`: Compares new ticket against existing ones.
- **Hosting:** Render.com or Railway.app (Free/Hobby tiers available for Dockerized FastAPI apps).

## 5. API Keys & Secrets Management

### A. Google Gemini API Key
- **Purpose:** Powers the AI analysis on the backend.
- **How to get:**
  1. Go to [Google AI Studio](https://aistudio.google.com/).
  2. Click "Get API Key" -> "Create API Key".
- **Where to put it:**
  - **Local:** `C:\CEP\backend\.env` -> `GEMINI_API_KEY=your_key_here`
  - **Production:** Add as an Environment Variable in your backend hosting provider (e.g., Render Dashboard).

### B. Firebase Configuration
- **Purpose:** Connects the frontend to Firebase Auth and Firestore.
- **How to get:**
  1. Go to [Firebase Console](https://console.firebase.google.com/).
  2. Project Settings (Gear icon) -> General.
  3. Scroll down to "Your apps", select the Web App `</>`.
  4. Copy the `firebaseConfig` block.
- **Where to put it:**
  - **Local:** `C:\CEP\frontend\.env`
    ```env
    VITE_FIREBASE_API_KEY=AIzaSy...
    VITE_FIREBASE_AUTH_DOMAIN=cep.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=cep
    ...
    ```
  - **Production:** Add to Vercel/Firebase Hosting environment variables. 

## Rules for a Clean & Sustainable Deployment
1. **Never commit `.env` files to GitHub.** Ensure `.env` is in `.gitignore`.
2. **Lock down Firestore.** Use Security rules so only authenticated users can read/write data.
3. **Decouple AI from Critical Path.** If the Gemini API fails or times out, the backend should return a graceful fallback (e.g., default urgency to "Medium") so the user can still submit their complaint.
