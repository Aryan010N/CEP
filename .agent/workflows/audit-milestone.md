---
description: Audit milestone completion against original intent before archiving
---

# GSD Audit Milestone

## Context

Version: $ARGUMENTS (optional — defaults to current milestone)

**Original Intent:**
- @.planning/PROJECT.md
- @.planning/REQUIREMENTS.md

**Planned Work:**
- @.planning/ROADMAP.md
- @.planning/config.json (if exists)

**Completed Work:**
Glob: .planning/phases/*/*-SUMMARY.md
Glob: .planning/phases/*/*-VERIFICATION.md

## Objective

Verify milestone achieved its definition of done. Check requirements coverage, cross-phase integration, and end-to-end flows.

**This command IS the orchestrator.** Reads existing VERIFICATION.md files (phases already verified during execute-phase), aggregates tech debt and deferred gaps, then spawns integration checker for cross-phase wiring.

## Execution Context

Load:
- @./.agent/get-shit-done/workflows/audit-milestone.md

## Process

Execute the audit-milestone workflow from @./.agent/get-shit-done/workflows/audit-milestone.md end-to-end.
Preserve all workflow gates (scope determination, verification reading, integration check, requirements coverage, routing).