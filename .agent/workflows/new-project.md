---
description: Initialize a new project with deep context gathering and PROJECT.md
---

$ARGUMENTS

# GSD New Project

## Context

**Flags:**
- `--auto` — Automatic mode. After config questions, runs research → requirements → roadmap without further interaction. Expects idea document via @ reference.

## Objective

Initialize a new project through unified flow: questioning → research (optional) → requirements → roadmap.

**Creates:**
- `.planning/PROJECT.md` — project context
- `.planning/config.json` — workflow preferences
- `.planning/research/` — domain research (optional)
- `.planning/REQUIREMENTS.md` — scoped requirements
- `.planning/ROADMAP.md` — phase structure
- `.planning/STATE.md` — project memory

**After this command:** Run `/plan-phase 1` to start execution.

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/new-project.md
- @./.agent/get-shit-done/references/questioning.md
- @./.agent/get-shit-done/references/ui-brand.md
- @./.agent/get-shit-done/templates/project.md
- @./.agent/get-shit-done/templates/requirements.md

## Process

Execute the new-project workflow from @./.agent/get-shit-done/workflows/new-project.md end-to-end.
Preserve all workflow gates (validation, approvals, commits, routing).