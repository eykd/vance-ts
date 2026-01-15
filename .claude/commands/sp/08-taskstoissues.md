---
description: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
tools: ['github/github-mcp-server/issue_write']
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Retrieve Beads Epic ID and Tasks**:

   a. Get the epic ID from spec.md:

   ```bash
   grep "Beads Epic" FEATURE_DIR/spec.md | grep -oE 'workspace-[a-z0-9]+|bd-[a-z0-9]+'
   ```

   b. Export open tasks from beads:

   ```bash
   npx bd list --parent <epic-id> --status open --json
   ```

   c. Parse the JSON to get task list with IDs, titles, descriptions, and priorities

3. Get the Git remote by running:

```bash
git config --get remote.origin.url
```

> [!CAUTION]
> ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL

4. For each task in the beads list, use the GitHub MCP server to create a new issue in the repository that is representative of the Git remote.

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL

**Beads Task to GitHub Issue Mapping**:

| Beads Field | GitHub Issue Field                                    |
| ----------- | ----------------------------------------------------- |
| title       | title                                                 |
| description | body (prepend with beads ID)                          |
| priority    | labels (P1→priority:critical, P2→priority:high, etc.) |
| parent_id   | Mention parent epic/task in body                      |
