---
description: Check project progress,show context,and route to next action (execute or plan)
---

$ARGUMENTS

# GSD Progress

## Context

Check for active projects:
```bash
ls .planning/*.md 2>/dev/null
```

## Objective

Check project progress, summarize recent work and what's ahead, then intelligently route to the next action - either executing an existing plan or creating the next one.

Provides situational awareness before continuing work.

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/progress.md

## Process

Execute the progress workflow from @./.agent/get-shit-done/workflows/progress.md end-to-end.
Preserve all routing logic (Routes A through F) and edge case handling.