---
description: Execute a quick task with GSD guarantees (atomic commits,state tracking) but skip optional agents
---

$ARGUMENTS

# GSD Quick

## Context

Load:
- @.planning/STATE.md

## Objective

Execute small, ad-hoc tasks with GSD guarantees (atomic commits, STATE.md tracking) while skipping optional agents (research, plan-checker, verifier).

**Quick mode is the same system with a shorter path:**
- Spawns gsd-planner (quick mode) + gsd-executor(s)
- Skips gsd-phase-researcher, gsd-plan-checker, gsd-verifier
- Quick tasks live in `.planning/quick/` separate from planned phases
- Updates STATE.md "Quick Tasks Completed" table (NOT ROADMAP.md)

**Use when:** You know exactly what to do and the task is small enough to not need research or verification.

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/quick.md

## Process

Execute the quick workflow from @./.agent/get-shit-done/workflows/quick.md end-to-end.
Preserve all workflow gates (validation, task description, planning, execution, state updates, commits).