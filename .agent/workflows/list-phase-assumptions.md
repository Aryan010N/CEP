---
description: Surface Claude's assumptions about a phase approach before planning
---

# GSD List Phase Assumptions

## Context

Phase number: $ARGUMENTS (required)

**Load project state first:**
- @.planning/STATE.md

**Load roadmap:**
- @.planning/ROADMAP.md

## Objective

Analyze a phase and present Claude's assumptions about technical approach, implementation order, scope boundaries, risk areas, and dependencies.

Purpose: Help users see what Claude thinks BEFORE planning begins - enabling course correction early when assumptions are wrong.

Output: Conversational output only (no file creation) - ends with "What do you think?" prompt

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/list-phase-assumptions.md

## Process

1. Validate phase number argument (error if missing or invalid)
2. Check if phase exists in roadmap
3. Follow list-phase-assumptions.md workflow:
   - Analyze roadmap description
   - Surface assumptions about: technical approach, implementation order, scope, risks, dependencies
   - Present assumptions clearly
   - Prompt "What do you think?"
4. Gather feedback and offer next steps