---
description: Execute the implementation plan by processing tasks from beads. Uses bd ready to get available tasks and bd close to mark completion.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count:
     - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
     - Completed items: Lines matching `- [X]` or `- [x]`
     - Incomplete items: Lines matching `- [ ]`
   - Create a status table:

     ```text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     | security.md | 6   | 6         | 0          | ✓ PASS |
     ```

   - Calculate overall status:
     - **PASS**: All checklists have 0 incomplete items
     - **FAIL**: One or more checklists have incomplete items

   - **If any checklist is incomplete**:
     - Display the table with incomplete item counts
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - Wait for user response before continuing
     - If user says "no" or "wait" or "stop", halt execution
     - If user says "yes" or "proceed" or "continue", proceed to step 3

   - **If all checklists are complete**:
     - Display the table showing all checklists passed
     - Automatically proceed to step 3

3. Load and analyze the implementation context:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan (human reference)
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

4. **Retrieve Beads Epic ID**:

   a. Read the epic ID from spec.md front matter:

   ```bash
   grep "Beads Epic" FEATURE_DIR/spec.md | grep -oE 'workspace-[a-z0-9]+|bd-[a-z0-9]+'
   ```

   b. If not found, search beads for the epic:

   ```bash
   npx bd list --type epic --status open --json
   ```

   c. Store epic ID for task queries

5. **Get Ready Tasks from Beads**:

   a. Query beads for tasks ready to work on:

   ```bash
   npx bd ready --json
   ```

   - This returns tasks with no blocking dependencies
   - Parse JSON to get task IDs, titles, and priorities

   b. If no ready tasks, check remaining open tasks:

   ```bash
   npx bd list --parent <epic-id> --status open --json
   ```

   - If all tasks complete, report completion
   - If tasks exist but none ready, there may be blocking dependencies

   c. Display ready tasks to user:

   ```text
   Ready Tasks:
   1. [workspace-abc123] US1: Initialize Beads (priority: 1)
   2. [workspace-abc124] Setup project structure (priority: 1)
   ```

6. **Project Setup Verification**:
   - **REQUIRED**: Create/verify ignore files based on actual project setup
   - Check for .gitignore, .dockerignore, .eslintignore, .prettierignore as needed
   - Apply technology-specific patterns from plan.md

7. **Execute Implementation** following the task plan:

   For each ready task:

   a. **Mark task in progress**:

   ```bash
   npx bd update <task-id> --status in_progress --json
   ```

   b. **Execute the task implementation**:
   - Follow TDD approach if tests are included
   - Create/modify files as specified in task description
   - Validate the implementation works

   c. **Mark task complete**:

   ```bash
   npx bd close <task-id> --reason "<brief-completion-summary>" --json
   ```

   - Provide a brief summary of what was done

   d. **Update tasks.md** (for human reference):
   - Mark the corresponding task as [X] in tasks.md
   - This keeps the markdown file in sync with beads

   e. **Check for newly ready tasks**:

   ```bash
   npx bd ready --json
   ```

   - Completing a task may unblock dependent tasks
   - Display any newly available tasks

8. **Implementation execution rules**:
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code**: If tests are included, write them first
   - **Core development**: Implement models, services, CLI commands, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Unit tests, performance optimization, documentation

9. **Progress tracking and error handling**:
   - Report progress after each completed task
   - Show beads task status: `npx bd stats --json`
   - Halt execution if any critical task fails
   - For parallel tasks, continue with successful tasks, report failed ones
   - Provide clear error messages with context for debugging
   - Suggest next steps if implementation cannot proceed

10. **Completion validation**:

    a. Check remaining tasks:

    ```bash
    npx bd list --parent <epic-id> --status open --json
    ```

    b. If all tasks complete:
    - Verify implemented features match the original specification
    - Validate that tests pass and coverage meets requirements
    - Confirm the implementation follows the technical plan
    - Report final status with summary of completed work

    c. Display final beads summary:

    ```bash
    npx bd stats --json
    npx bd dep tree <epic-id>
    ```

Note: This command uses beads for task tracking. If beads is not initialized or tasks are not in beads, it will fall back to reading tasks.md. Suggest running `/sp:05-tasks` to create beads tasks if needed.

## Beads Task Lifecycle

```text
┌──────────┐     bd update      ┌─────────────┐     bd close     ┌────────┐
│   open   │ ────────────────→  │ in_progress │ ──────────────→  │ closed │
└──────────┘   --status         └─────────────┘    --reason       └────────┘
                in_progress
```

## Beads Commands Reference

| Action               | Command                                               |
| -------------------- | ----------------------------------------------------- |
| Get ready tasks      | `npx bd ready --json`                                 |
| Mark in progress     | `npx bd update <id> --status in_progress`             |
| Mark complete        | `npx bd close <id> --reason "summary"`                |
| View task            | `npx bd show <id>`                                    |
| List open tasks      | `npx bd list --parent <epic-id> --status open --json` |
| View statistics      | `npx bd stats --json`                                 |
| View dependency tree | `npx bd dep tree <epic-id>`                           |

## Error Handling

If beads commands fail:

1. **bd: command not found**: Suggest `npm install --save-dev @beads/bd`
2. **No ready tasks but open tasks exist**: Check dependencies with `bd dep tree`
3. **Task update fails**: Log error, continue with next task, report at end
4. **Epic not found**: Fall back to tasks.md for task list
