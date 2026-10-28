# Local Setup, Configuration & Deployment Guide

This guide details everything required to configure, test, and deploy the **AI Community Digital Problem Observatory**.

---

## 💻 1. Prerequisites

- **Node.js**: v18.x or v20.x+ (tested on Node v24)
- **Python**: v3.10+ (tested on Python 3.14)
- **Firebase Project**: `cep-ai` ([Firebase Console](https://console.firebase.google.com/u/0/project/cep-ai/overview))

---

## ⚙️ 2. Environment Variables Configuration

### Frontend Configuration (`frontend/.env`)
```env
# Cloud Firestore & Firebase Auth Credentials
VITE_FIREBASE_API_KEY=AIzaSyADaXMoJOErpXHThu4ZSx4SKy1eXvCmm34
VITE_FIREBASE_AUTH_DOMAIN=cep-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cep-ai
VITE_FIREBASE_STORAGE_BUCKET=cep-ai.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=920330565851
VITE_FIREBASE_APP_ID=1:920330565851:web:c0b0c03c098eff4e8b74fe
VITE_FIREBASE_MEASUREMENT_ID=G-XGHD2EM7JE

# FastAPI Microservice URL
# Local: http://localhost:8000 | Production: https://cep-wacs.onrender.com
VITE_BACKEND_API_URL=http://localhost:8000
```

### Backend Configuration (`backend/.env`)
```env
# Google Gemini Generative AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin Service Account path (or JSON string)
FIREBASE_SERVICE_ACCOUNT_JSON=serviceAccount.json

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://cep-seven.vercel.app

# SMS & Email Providers
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
RESEND_API_KEY=your_resend_api_key
```

---

## 🚀 3. Local Development Quickstart

### Step A: Start the FastAPI AI Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Health Check: `http://localhost:8000/health`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### Step B: Start the React + Vite Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open your browser at `http://localhost:5173`.
- Visit `http://localhost:5173/` for the **Production App**.
- Visit `http://localhost:5173/demo` for the **Isolated Presentation Demo Mode**.

---

## 🧪 4. Automated Testing Suite

### Unit & Architectural Guardrail Tests
```bash
cd frontend
node --test src/__tests__/firestore.test.js
```
Validates:
- Firebase SDK v10+ modular syntax compliance (no legacy v8/v9 compat patterns).
- React Context lifecycle safety (all Firestore subscriptions return unsubscribe cleanup handlers).
- Anti-slop spring physics parameters on `TicketCard.jsx` (`stiffness: 350, damping: 25, mass: 0.8`).
- Firestore security rules community and role validation.

### End-to-End Registration & Cloud Firestore Verification
```bash
node verify_registration_and_db.cjs
```
Automates headless browser user registration, asserts Firebase Auth creation, and validates that the user document is immediately persisted in Cloud Firestore `users/{uid}`.

---

## 🚢 5. Deployment Guide

### Frontend Deployment (Vercel)
The frontend is pre-configured for Vercel deployment:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- Ensure all environment variables from `frontend/.env` are populated in the Vercel Project Settings under **Environment Variables**.

### Backend Deployment (Render / Docker)
A production-ready `backend/Dockerfile` is included:
```bash
docker build -t cep-backend ./backend
docker run -p 8000:8000 --env-file ./backend/.env cep-backend
```
On Render, deploy as a Web Service with:
- **Environment:** Docker
- **Branch:** `main`
- Set `ALLOWED_ORIGINS` to `https://cep-seven.vercel.app`.

