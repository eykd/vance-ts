---
description: Review code changes and create beads issues from findings. Use when reviewing feature branch changes and wanting to track findings as tasks.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Retrieve Beads Epic ID**:

   a. Read the epic ID from spec.md front matter:

   ```bash
   grep "Beads Epic" FEATURE_DIR/spec.md | grep -oE 'workspace-[a-z0-9]+|bd-[a-z0-9]+'
   ```

   b. If not found, search beads for an open epic:

   ```bash
   npx bd list --type epic --status open --json
   ```

   c. If no epic found, prompt user:
   - Ask if they want to create an epic first using `/sp:01-specify`
   - Or allow proceeding without issue creation (review only)

3. **Run Code Review**:

   a. Use the `/code-review` skill to review current changes:
   - Default scope: `branch` (changes vs main branch)
   - If user specified `--scope`, use that scope
   - If user specified `--base`, use that base ref

   b. Capture the review output for parsing

4. **Parse Findings from Review Output**:

   Using these regex patterns to extract structured findings:

   ```text
   Finding Start: /^### Finding: (.+)$/
   Severity:      /^\- \*\*Severity\*\*: (Critical|High|Medium|Low)$/i
   Category:      /^\- \*\*Category\*\*: (security|test|quality|architecture|performance)$/i
   File:          /^\- \*\*File\*\*: (.+)$/
   Line:          /^\- \*\*Line\*\*: (\d+)$/
   Description:   /^\- \*\*Description\*\*: (.+)$/
   Risk:          /^\- \*\*Risk\*\*: (.+)$/
   Fix:           /^\- \*\*Fix\*\*: (.+)$/
   ```

   For each finding, extract:
   - Title (from Finding header)
   - Severity (Critical|High|Medium|Low)
   - Category (security|test|quality|architecture|performance)
   - File path
   - Line number (if present)
   - Description
   - Risk explanation
   - Fix recommendation

5. **Map Severity to Priority**:

   | Severity | Beads Priority |
   | -------- | -------------- |
   | Critical | P0 (0)         |
   | High     | P1 (1)         |
   | Medium   | P2 (2)         |
   | Low      | P3 (3)         |

6. **Check for Duplicates**:

   For each finding, generate a duplicate key: `{File}:{Line}:{Category}`

   Query existing issues under the epic:

   ```bash
   npx bd list --parent <epic-id> --status open --json
   ```

   Skip creating issues where the duplicate key matches an existing issue's description pattern.

7. **Create Beads Issues**:

   For each non-duplicate finding, create a beads issue:

   ```bash
   npx bd create "<title>" -t task -p <priority> --parent <epic-id> --json
   ```

   Issue description format:

   ```markdown
   **Code Review Finding**

   - **Category**: [category]
   - **File**: [file]:[line]
   - **Severity**: [severity]

   ## Description

   [description]

   ## Risk

   [risk]

   ## Recommended Fix

   [fix]

   ---

   _Duplicate Key: [file]:[line]:[category]_
   ```

8. **Generate Summary Report**:

   Output a structured summary:

   ```markdown
   ## sp:review Results

   **Epic**: [epic-id] ([feature-name])
   **Findings**: [N] total

   ### Issues Created

   1. [issue-id] [title] (P[priority])
   2. ...

   ### Skipped (Duplicates)

   1. [title] (matches [existing-issue-id])
   2. ...

   ### Summary

   - Created: [N] issues
   - Skipped: [N] duplicates
   - Epic: [epic-id]

   ### Next Steps

   - Run `npx bd ready` to see tasks available for work
   - Run `/sp:06-implement` to start addressing findings
   ```

## Error Handling

- **No epic found**: Prompt user to run `/sp:01-specify` first or proceed without issue creation
- **No findings**: Report "Clean review - no issues found" and exit successfully
- **Beads error**: Log error, continue with remaining findings, report failed creations at end
- **Parse error**: Log unparseable finding, continue with others

## Beads Commands Reference

| Action       | Command                                                            |
| ------------ | ------------------------------------------------------------------ |
| Create issue | `npx bd create "<title>" -t task -p <priority> --parent <epic-id>` |
| List issues  | `npx bd list --parent <epic-id> --status open --json`              |
| View issue   | `npx bd show <id>`                                                 |

## Example Usage

```bash
# Review branch changes and create issues
/sp:review

# Review with specific scope
/sp:review --scope staged

# Review against specific base
/sp:review --base main
```
