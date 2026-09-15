---
description: Archive completed milestone and prepare for next version
---

# GSD Complete Milestone

## Context

**Project files:**
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`

**User input:**
- Version: $ARGUMENTS (e.g., "1.0", "1.1", "2.0")

## Objective

Mark milestone complete, archive to milestones/, and update ROADMAP.md and REQUIREMENTS.md.

Purpose: Create historical record of shipped version, archive milestone artifacts (roadmap + requirements), and prepare for next milestone.

Output: Milestone archived (roadmap + requirements), PROJECT.md evolved, git tagged.

## Execution Context

Load:
- @./.agent/get-shit-done/workflows/complete-milestone.md
- @./.agent/get-shit-done/templates/milestone-archive.md

## Process

Follow complete-milestone.md workflow:
0. Check for audit
1. Verify readiness
2. Gather stats
3. Extract accomplishments
4. Archive milestone
5. Archive requirements
6. Update PROJECT.md
7. Commit and tag
8. Offer next steps