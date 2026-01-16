# Data Model: Ralph Automation Loop

**Date**: 2026-01-16
**Feature**: 001-ralph-automation

## Overview

ralph.sh is a stateless orchestration script. All persistent state is managed by external systems (beads, git). This document describes the data flows and state transitions.

## External State (Managed by Beads)

### Epic

```
Entity: Epic (beads issue, type=epic)
├── id: string (e.g., "workspace-9w6")
├── title: string (e.g., "Feature: ralph-automation")
├── status: "open" | "closed"
└── children: Phase Tasks[]
```

### Phase Task

```
Entity: Phase Task (beads issue, type=task)
├── id: string (e.g., "workspace-9w6.2")
├── title: string (e.g., "[sp:03-plan] Create implementation plan...")
├── status: "open" | "in_progress" | "closed"
├── parent: Epic.id
└── depends_on: Phase Task.id[]  # Dependency chain
```

### Dependency Chain

```
clarify (01) → plan (02) → checklist (03) → tasks (04) → implement (05) → review (06)
    ↑                                                                           ↓
  MANUAL                                                                    AUTOMATED
(prerequisites)                                                           (ralph.sh scope)
```

## Script Internal State (Runtime Only)

### Configuration

```typescript
interface Config {
  maxIterations: number; // Default: 50, override with --max-iterations
  dryRun: boolean; // Default: false, set with --dry-run
  epicId: string; // Detected from branch name
  branchName: string; // Current git branch
}
```

### Runtime State

```typescript
interface RuntimeState {
  iteration: number; // Current iteration count (1-based)
  startTime: Date; // When ralph.sh started
  retryCount: number; // Current retry attempt for Claude invocation
  currentTaskId: string; // Task being processed this iteration
  completedTasks: string[]; // Tasks completed during this run
}
```

### Lock File Format

```
# .ralph.lock
<PID>
<START_TIMESTAMP_ISO8601>
<BRANCH_NAME>
```

Example:

```
12345
2026-01-16T10:30:00Z
001-ralph-automation
```

## State Transitions

### Script Lifecycle

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Parse Arguments    │
│  (--dry-run, etc)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐     ┌─────────────────────┐
│ Validate Prereqs    │────▶│  EXIT 1: Missing    │
│ - claude CLI        │ fail│  prerequisites      │
│ - beads init        │     └─────────────────────┘
│ - epic exists       │
│ - clarify complete  │
└──────┬──────────────┘
       │ pass
       ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Acquire Lock       │────▶│  EXIT 1: Already    │
│                     │ fail│  running            │
└──────┬──────────────┘     └─────────────────────┘
       │ ok
       ▼
┌─────────────────────┐
│    MAIN LOOP        │◀───────────────┐
└──────┬──────────────┘                │
       │                               │
       ▼                               │
┌─────────────────────┐                │
│  Check bd ready     │                │
│  for epic tasks     │                │
└──────┬──────────────┘                │
       │                               │
       ├─── no tasks ──▶ EXIT 0: Success
       │                               │
       ▼                               │
┌─────────────────────┐                │
│  Log iteration      │                │
│  start + task       │                │
└──────┬──────────────┘                │
       │                               │
       ▼                               │
┌─────────────────────┐                │
│  Invoke Claude      │                │
│  claude -p /sp:next │                │
└──────┬──────────────┘                │
       │                               │
       ├─── success ───────────────────┤
       │                               │
       ▼                               │
┌─────────────────────┐                │
│  Retry with backoff │                │
│  (up to 10 times)   │                │
└──────┬──────────────┘                │
       │                               │
       ├─── retry success ─────────────┤
       │                               │
       ▼                               │
┌─────────────────────┐                │
│  EXIT 1: Claude     │                │
│  invocation failed  │                │
└─────────────────────┘                │
                                       │
┌─────────────────────┐                │
│  iteration++        │────────────────┤
└──────┬──────────────┘                │
       │                               │
       ├── < max ──────────────────────┘
       │
       ▼
┌─────────────────────┐
│  EXIT 2: Max        │
│  iterations reached │
└─────────────────────┘
```

### Exit Codes

| Code | Meaning                                                                        |
| ---- | ------------------------------------------------------------------------------ |
| 0    | Success - all tasks complete                                                   |
| 1    | Failure - prerequisites missing, lock conflict, or Claude errors after retries |
| 2    | Limit reached - max iterations hit before completion                           |
| 130  | Interrupted - user pressed Ctrl+C                                              |

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         ralph.sh                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐    branch name    ┌─────────┐                         │
│  │   git   │ ─────────────────▶│ config  │                         │
│  └─────────┘                   └────┬────┘                         │
│                                     │                              │
│  ┌─────────┐    ready tasks    ┌────▼────┐    /sp:next   ┌───────┐│
│  │  beads  │◀─────────────────│  loop   │──────────────▶│ claude ││
│  │  (bd)   │                   └────┬────┘               │  CLI   ││
│  └────┬────┘                        │                    └───┬───┘│
│       │                             │                        │     │
│       │ task status                 │ iteration count        │     │
│       │ dependency chain            │ retry state            │     │
│       ▼                             ▼                        ▼     │
│  ┌─────────┐                   ┌─────────┐              ┌───────┐ │
│  │ .beads/ │                   │ stdout  │              │sp:next│ │
│  │ (JSONL) │                   │ (logs)  │              │ skill │ │
│  └─────────┘                   └─────────┘              └───────┘ │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Invariants

1. **Single instance**: Only one ralph.sh can run per branch (enforced by lock file)
2. **Prerequisite phases complete**: sp:02-clarify must be closed before ralph.sh starts
3. **Beads consistency**: All state transitions happen through beads; ralph.sh never modifies .beads directly
4. **Idempotent iterations**: Each iteration is self-contained; interrupting and restarting continues from current beads state
