# Quickstart: Beads-Integrated Spec-Kit Workflow

**Feature**: 008-beads-integration
**Date**: 2026-01-15

This guide demonstrates the `/sp:*` workflow with beads task tracking.

## Prerequisites

1. **Install beads CLI**:

   ```bash
   npm install --save-dev beads_rust
   ```

2. **Verify installation**:
   ```bash
   br --version
   ```

## Workflow Example: Adding a New Feature

### Step 1: Create Feature Specification

```bash
# Run the specify command
/sp:01-specify Add user authentication with OAuth2
```

**What happens**:

1. Creates git branch `009-user-auth` (or next available number)
2. Initializes beads if not already done (`br init`)
3. Creates epic in beads: `Feature: User Authentication`
4. Writes spec to `specs/009-user-auth/spec.md`
5. Stores epic ID in spec metadata

**Verify**:

```bash
# Check epic was created
br list --type epic --json
```

Output:

```json
[
  {
    "id": "bd-f7a2c1",
    "title": "Feature: User Authentication",
    "status": "open",
    "priority": 0,
    "issue_type": "epic"
  }
]
```

### Step 2: Clarify Requirements (Optional)

```bash
/sp:02-clarify
```

**What happens**: Interactive clarification session. No beads changes.

### Step 3: Create Implementation Plan

```bash
/sp:03-plan
```

**What happens**: Creates `plan.md` with technical design. No beads changes.

### Step 4: Generate Tasks

```bash
/sp:05-tasks
```

**What happens**:

1. Reads spec.md and plan.md
2. Creates beads tasks for each user story
3. Creates sub-tasks for implementation steps
4. Establishes dependencies between tasks

**Verify**:

```bash
# View task hierarchy
br dep tree bd-f7a2c1

# Check ready tasks
br ready --json
```

Output (ready tasks):

```json
[
  {
    "id": "bd-f7a2c1.1.1",
    "title": "Set up OAuth2 provider config",
    "status": "open",
    "priority": 1
  }
]
```

### Step 5: Implement Feature

```bash
/sp:07-implement
```

**What happens**:

1. Shows ready tasks from `br ready`
2. Marks current task as `in_progress`
3. Guides implementation
4. Marks tasks `closed` when complete
5. Dependent tasks automatically become ready

**During implementation**:

```bash
# Manual task status updates (if needed)
br update bd-f7a2c1.1.1 --status in_progress
br close bd-f7a2c1.1.1 --reason "OAuth config complete"

# Check what's ready next
br ready
```

### Step 6: Analyze Implementation

```bash
/sp:06-analyze
```

**What happens**: Cross-checks implementation against spec. No beads changes.

## Viewing Progress

### All tasks for a feature

```bash
br list --parent bd-f7a2c1 --json
```

### Only open tasks

```bash
br list --parent bd-f7a2c1 --status open --json
```

### Dependency tree

```bash
br dep tree bd-f7a2c1
```

Output:

```text
bd-f7a2c1 Feature: User Authentication
├── bd-f7a2c1.1 US1: OAuth2 Setup [closed]
│   ├── bd-f7a2c1.1.1 Set up provider config [closed]
│   └── bd-f7a2c1.1.2 Create auth endpoints [closed]
├── bd-f7a2c1.2 US2: Login Flow [in_progress]
│   ├── bd-f7a2c1.2.1 Create login page [closed]
│   └── bd-f7a2c1.2.2 Handle callbacks [open] ← READY
└── bd-f7a2c1.3 US3: Session Management [open]
    └── (blocked by bd-f7a2c1.2)
```

## Command Reference

| Command                | Purpose                | Beads Actions                       |
| ---------------------- | ---------------------- | ----------------------------------- |
| `/sp:00-constitution`  | Project constitution   | None                                |
| `/sp:01-specify`       | Create spec + epic     | `br init`, `br create -t epic`      |
| `/sp:02-clarify`       | Clarify requirements   | None                                |
| `/sp:03-plan`          | Create plan            | None                                |
| `/sp:04-checklist`     | Generate checklists    | None                                |
| `/sp:05-tasks`         | Generate tasks         | `br create`, `br dep add`           |
| `/sp:07-implement`     | Execute tasks          | `br ready`, `br update`, `br close` |
| `/sp:06-analyze`       | Analyze implementation | `br list`, `br stats`               |
| `/sp:08-taskstoissues` | Export to GitHub       | `br list`                           |

## Comparison: Old vs New Workflow

### Old Workflow (sp:\* with markdown)

```markdown
# tasks.md

- [ ] T001 Set up OAuth provider
- [ ] T002 Create auth endpoints
- [x] T003 Test authentication
```

**Limitations**:

- Manual checkbox updates
- No dependency tracking
- No parallel task detection
- Hard to query status

### New Workflow (bd:\* with beads)

```bash
br ready --json
# Shows only unblocked tasks

br list --parent bd-f7a2c1 --status open
# Query open tasks for feature

br dep tree bd-f7a2c1
# Visualize dependency graph
```

**Benefits**:

- Automatic dependency resolution
- Machine-readable task status
- Git-backed persistence
- Multi-agent safe (hash IDs)

## Troubleshooting

### "br: command not found"

```bash
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/beads_rust/main/install.sh" | bash
# Then use: br <command>
```

### "not a beads repository"

```bash
br init
```

### "epic not found for feature"

```bash
# List all epics to find ID
br list --type epic --json
```

### "circular dependency detected"

```bash
# Check for cycles
br dep cycles

# Remove problematic dependency
br dep remove <child-id> <parent-id>
```
