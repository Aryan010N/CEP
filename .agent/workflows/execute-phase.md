---
description: Execute all plans in a phase with wave-based parallelization
---

$ARGUMENTS

# GSD Execute Phase

## Context

Phase: $ARGUMENTS

**Flags:**
- `--gaps-only` — Execute only gap closure plans (plans with `gap_closure: true` in frontmatter). Use after verify-work creates fix plans.

Load:
- @.planning/ROADMAP.md
- @.planning/STATE.md

## Objective

Execute all plans in a phase using wave-based parallel execution.

**Orchestrator stays lean:** discover plans, analyze dependencies, group into waves, spawn subagents, collect results. Each subagent loads the full execute-plan context and handles its own plan.

**Context budget:** ~15% orchestrator, 100% fresh per subagent.

## Execution Context

Load for context:
- @./.agent/get-shit-done/workflows/execute-phase.md
- @./.agent/get-shit-done/references/ui-brand.md

## Process

Execute the execute-phase workflow from @./.agent/get-shit-done/workflows/execute-phase.md end-to-end.
Preserve all workflow gates (wave execution, checkpoint handling, verification, state updates, routing).