---
description: Add phase to end of current milestone in roadmap
---

# GSD Add Phase

## Context

Description: $ARGUMENTS

Load:
- @.planning/ROADMAP.md
- @.planning/STATE.md

## Objective

Add a new integer phase to the end of the current milestone in the roadmap.

Routes to the add-phase workflow which handles:
- Phase number calculation (next sequential integer)
- Directory creation with slug generation
- Roadmap structure updates
- STATE.md roadmap evolution tracking

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/add-phase.md

## Process

Follow the add-phase workflow from `@./.agent/get-shit-done/workflows/add-phase.md`.
The workflow handles all logic including:
1. Argument parsing and validation
2. Roadmap existence checking
3. Current milestone identification
4. Next phase number calculation (ignoring decimals)
5. Slug generation from description
6. Phase directory creation
7. Roadmap entry insertion
8. STATE.md updates