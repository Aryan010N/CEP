---
name: coderabbit
description: CodeRabbit sprint task and PR verification protocol for CEP. Verifies Firebase v10+ modular SDK compliance, React Context lifecycle cleanups, anti-slop spring motion, and sprint scope isolation.
argument-hint: "[task or query, e.g. 'audit sprint 2 pull request', 'verify unsubscribe cleanup in Context', 'check Firebase modular syntax']"
---

# CodeRabbit Sprint & PR Verification Playbook

This skill allows Antigravity agents to simulate the automated CodeRabbit code review gate locally prior to pushing Pull Requests.

## Core Review Directives

### 1. Firebase SDK v10+ Modular Enforcement
- Inspect imports in `src/services/` and `src/context/`:
  - ❌ Reject `firebase.firestore()`, `db.collection()`, `firebase.firestore.FieldValue.serverTimestamp()`.
  - ✅ Demand modular: `import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'`.

### 2. React Context Memory Leak Prevention
- In any `useEffect` containing `onSnapshot`:
  - Verify that the returned value of `useEffect` is an unsubscribe function: `return () => unsubscribe();`.
  - Verify dependency array references stable keys (e.g. `[user?.communityId]`).

### 3. Anti-Slop Motion & Micro-Interactions
- Verify animations use `motion/react` with spring physics:
  - Required spring: `{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }`.
  - Prohibited: animating `height`, `width`, `margin`, or using linear transitions (`transition: all 0.3s ease`).
  - Compositor-only properties: `transform` (`x`, `y`, `scale`) and `opacity`.

### 4. Sprint Scope Isolation
- Verify that changes only address active sprint milestones (e.g., Sprint 2 Firestore data layer).
- Flag premature Phase 3 (Gemini backend) or Phase 4 (cloud infrastructure) changes.

### 5. Verification Command
To run a local static verification against these rules:
```powershell
node --test frontend/src/__tests__/firestore.test.js
```
