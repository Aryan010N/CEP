---
description: Verify completed phase work against requirements with manual user acceptance testing
---

$ARGUMENTS

# GSD Verify Work

## Context

Phase: $ARGUMENTS

**What this does:** Automated verification checks that code exists and tests pass. But does the feature *work* the way you expected? This is your chance to use it.

Load:
- @.planning/ROADMAP.md
- @.planning/STATE.md

## Objective

**This is where you confirm it actually works.**

The system:
1. **Extracts testable deliverables** — What you should be able to do now
2. **Walks you through one at a time** — "Can you log in with email?" Yes/no, or describe what's wrong
3. **Diagnoses failures automatically** — Spawns debug agents to find root causes
4. **Creates verified fix plans** — Ready for immediate re-execution

If everything passes, you move on. If something's broken, you don't manually debug — you just run `/execute-phase` again with the fix plans it created.

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/verify-work.md
- @./.agent/get-shit-done/references/ui-brand.md

## Process

Execute the verify-work workflow from @./.agent/get-shit-done/workflows/verify-work.md end-to-end.
Preserve all workflow gates (verification loop, debug spawning, fix plan creation).