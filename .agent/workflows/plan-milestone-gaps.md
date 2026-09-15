---
description: Create phases to close all gaps identified by milestone audit
---

$ARGUMENTS

# GSD Plan Milestone Gaps

## Context

**Audit results:**
Glob: .planning/v*-MILESTONE-AUDIT.md (use most recent)

**Original intent (for prioritization):**
- @.planning/PROJECT.md
- @.planning/REQUIREMENTS.md

**Current state:**
- @.planning/ROADMAP.md
- @.planning/STATE.md

## Objective

Create all phases necessary to close gaps identified by `/audit-milestone`.

Reads MILESTONE-AUDIT.md, groups gaps into logical phases, creates phase entries in ROADMAP.md, and offers to plan each phase.

One command creates all fix phases — no manual `/add-phase` per gap.

## Execution Context

Load:
- @./.agent/get-shit-done/workflows/plan-milestone-gaps.md

## Process

Execute the plan-milestone-gaps workflow from @./.agent/get-shit-done/workflows/plan-milestone-gaps.md end-to-end.
Preserve all workflow gates (audit loading, prioritization, phase grouping, user confirmation, roadmap updates).