---
description: Insert urgent work as decimal phase (e.g.,72.1) between existing phases
---

# GSD Insert Phase

## Context

Arguments: $ARGUMENTS (format: <after-phase-number> <description>)

Load:
- @.planning/ROADMAP.md
- @.planning/STATE.md

## Objective

Insert a decimal phase for urgent work discovered mid-milestone that must be completed between existing integer phases.

Uses decimal numbering (72.1, 72.2, etc.) to preserve the logical sequence of planned phases while accommodating urgent insertions.

Purpose: Handle urgent work discovered during execution without renumbering entire roadmap.

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/insert-phase.md

## Process

Execute the insert-phase workflow from @./.agent/get-shit-done/workflows/insert-phase.md end-to-end.
Preserve all validation gates (argument parsing, phase verification, decimal calculation, roadmap updates).