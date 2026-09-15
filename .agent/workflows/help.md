---
description: Show available GSD commands and usage guide
---

$ARGUMENTS

# GSD Commands Reference

## Core Workflow

| Command | Description |
|---------|-------------|
| `/new-project [--auto]` | Full initialization: questions → research → requirements → roadmap |
| `/discuss-phase [N]` | Capture implementation decisions before planning |
| `/plan-phase [N]` | Research + plan + verify for a phase |
| `/execute-phase <N>` | Execute all plans in parallel waves, verify when complete |
| `/verify-work [N]` | Manual user acceptance testing |
| `/audit-milestone` | Verify milestone achieved its definition of done |
| `/complete-milestone` | Archive milestone, tag release |
| `/new-milestone [name]` | Start next version: questions → research → requirements → roadmap |

## Navigation

| Command | Description |
|---------|-------------|
| `/progress` | Where am I? What's next? |
| `/help` | Show all commands and usage guide |
| `/update` | Update GSD with changelog preview |

## Brownfield

| Command | Description |
|---------|-------------|
| `/map-codebase` | Analyze existing codebase before new-project |

## Phase Management

| Command | Description |
|---------|-------------|
| `/add-phase` | Append phase to roadmap |
| `/insert-phase [N]` | Insert urgent work between phases |
| `/remove-phase [N]` | Remove future phase, renumber |
| `/list-phase-assumptions` | See Claude's intended approach before planning |
| `/plan-milestone-gaps` | Create phases to close gaps from audit |

## Session

| Command | Description |
|---------|-------------|
| `/pause-work` | Create handoff when stopping mid-phase |
| `/resume-work` | Restore from last session |

## Utilities

| Command | Description |
|---------|-------------|
| `/settings` | Configure model profile and workflow agents |
| `/set-profile <profile>` | Switch model profile (quality/balanced/budget) |
| `/add-todo [desc]` | Capture idea for later |
| `/check-todos` | List pending todos |
| `/debug [desc]` | Systematic debugging with persistent state |
| `/quick` | Execute ad-hoc task with GSD guarantees |

## Quick Examples

```
/new-project              # Start new project
/discuss-phase 1          # Discuss phase 1 before planning
/plan-phase 1             # Plan phase 1
/execute-phase 1          # Execute phase 1
/verify-work 1            # Verify phase 1 complete
/progress                 # Check progress
/quick                    # Quick ad-hoc task
```

For detailed help with any command, run the command directly.