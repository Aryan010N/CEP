---
description: Capture idea or task as todo from current conversation context
---

$ARGUMENTS

# GSD Add Todo

## Context

Load:
- @.planning/STATE.md

## Objective

Capture an idea, task, or issue that surfaces during a GSD session as a structured todo for later work.

Routes to the add-todo workflow which handles:
- Directory structure creation
- Content extraction from arguments or conversation
- Area inference from file paths
- Duplicate detection and resolution
- Todo file creation with frontmatter
- STATE.md updates
- Git commits

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/add-todo.md

## Process

Follow the add-todo workflow from `@./.agent/get-shit-done/workflows/add-todo.md`.

The workflow handles all logic including:
1. Directory ensuring
2. Existing area checking
3. Content extraction (arguments or conversation)
4. Area inference
5. Duplicate checking
6. File creation with slug generation
7. STATE.md updates
8. Git commits