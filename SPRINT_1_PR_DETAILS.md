# Sprint 1: PR Details & CI/CD Pipeline

## 1. Pull Request Details for Sprint 1
You are currently on the `sprint-1` branch and have successfully committed all the changes (including the Firebase Auth implementation). Use the following template for your Pull Request when merging `sprint-1` into `main` on the `CEP` repository.

**PR Title:**
`feat(sprint-1): Core platform setup, role-based navigation, and Firebase Auth integration`

**PR Description:**
```markdown
## Overview
This PR concludes Sprint 1 for the Community Engagement Project (CEP). It introduces strict role-based access control, fixes critical backend startup crashes, sets up a robust UI, and successfully integrates real Firebase Authentication.

## Key Changes
- **Backend Stability:** Fixed `UnicodeDecodeError` in FastAPI startup by enforcing UTF-8 encoding in `.env` parsing.
- **Firebase Auth (Phase 1):** Replaced mock logins with real Firebase `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`.
- **Role-Based Workflows:** Implemented strict tab and navigation visibility for `Resident`, `Wing Rep`, `Admin`, and `NGO` roles.
- **Community Management:** Separated the Community switch/register flows into distinct tabs and implemented a membership model.
- **QR Code Engine:** Built a pure JS, dependency-free QR code generator for Community Invites and Complaint Spot tagging.
- **Demo Mode:** Preserved the golden "Demo Mode" toggle to bypass Firebase and allow quick presentation persona switching.
- **Mobile Responsiveness:** Fixed overflow issues on `TicketCard`, `StatsCard`, and modals for mobile devices.

## Testing Performed
- [x] Backend successfully starts via `uvicorn`.
- [x] Frontend `vite build` completes with 0 errors.
- [x] Firebase User Registration and Login works successfully.
- [x] UI scales correctly on mobile viewport simulations.

## Next Steps (Sprint 2 / Phase 2)
- Migrate local storage data (Communities, Tickets) to Cloud Firestore.
```

---

## 2. CI/CD Pipeline (GitHub Actions)

To maintain professional standards, add a Continuous Integration (CI) pipeline to the repository.

### Setup Instructions

1. In your local repository root (`C:\CEP`), create the following directory structure:
   `.github/workflows/`
2. Inside the `workflows` folder, create a file named `ci.yml`.
3. Paste the following YAML content into `ci.yml`.

**`.github/workflows/ci.yml`**
```yaml
name: CEP CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  frontend-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: ./frontend/package-lock.json
          
      - name: Install Frontend Dependencies
        run: npm install
        
      - name: Build Frontend
        run: npm run build
        
  backend-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          
      - name: Install Backend Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          
      - name: Verify FastAPI Syntax (Dry Run)
        run: python -m compileall app/
```
