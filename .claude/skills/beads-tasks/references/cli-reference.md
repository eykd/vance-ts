# bd CLI Reference

Authoritative command reference derived from actual `bd <cmd> --help` output. When in doubt, run `npx bd <cmd> --help` to verify.

## Global Flags

These flags work with every `bd` command:

| Flag             | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `--json`         | Output in JSON format                                                     |
| `--actor <name>` | Actor name for audit trail (default: `$BD_ACTOR`, git user.name, `$USER`) |
| `--db <path>`    | Database path (default: auto-discover `.beads/*.db`)                      |
| `-q, --quiet`    | Suppress non-essential output (errors only)                               |
| `-v, --verbose`  | Enable verbose/debug output                                               |
| `--readonly`     | Read-only mode: block write operations                                    |
| `--sandbox`      | Sandbox mode: disables auto-sync                                          |
| `--allow-stale`  | Allow operations on potentially stale data                                |

## bd create

Create a new issue (or multiple issues from markdown file).

```
bd create [title] [flags]
```

**Aliases:** `create`, `new`

### Key Flags

| Flag                         | Description                                                               |
| ---------------------------- | ------------------------------------------------------------------------- |
| `--title <string>`           | Issue title (alternative to positional argument)                          |
| `-d, --description <string>` | Issue description                                                         |
| `--body-file <path>`         | Read description from file (use `-` for stdin)                            |
| `-t, --type <string>`        | Issue type: `bug\|feature\|task\|epic\|chore\|decision` (default: `task`) |
| `-p, --priority <string>`    | Priority `0-4` or `P0-P4`, 0=highest (default: `2`)                       |
| `--parent <id>`              | Parent issue ID for hierarchical child                                    |
| `-a, --assignee <string>`    | Assignee                                                                  |
| `-l, --labels <strings>`     | Labels (comma-separated)                                                  |
| `-e, --estimate <int>`       | Time estimate in minutes                                                  |
| `--due <string>`             | Due date/time (`+6h`, `+1d`, `tomorrow`, `2025-01-15`)                    |
| `--defer <string>`           | Defer until date (hidden from `bd ready` until then)                      |
| `--deps <strings>`           | Dependencies in format `type:id` or `id`                                  |
| `--notes <string>`           | Additional notes                                                          |
| `--acceptance <string>`      | Acceptance criteria                                                       |
| `--design <string>`          | Design notes                                                              |
| `--spec-id <string>`         | Link to specification document                                            |
| `--external-ref <string>`    | External reference (e.g., `gh-9`, `jira-ABC`)                             |
| `--metadata <string>`        | Custom metadata (JSON string or `@file.json`)                             |
| `--silent`                   | Output only the issue ID (for scripting)                                  |
| `--dry-run`                  | Preview without creating                                                  |
| `-f, --file <path>`          | Create multiple issues from markdown file                                 |
| `--no-inherit-labels`        | Don't inherit labels from parent                                          |
| `--ephemeral`                | Create as ephemeral (subject to TTL compaction)                           |

## bd list

List issues. Default: open issues, limit 50.

```
bd list [flags]
```

### Key Flags

| Flag                            | Description                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `-s, --status <string>`         | Filter by status: `open`, `in_progress`, `blocked`, `deferred`, `closed`                         |
| `-t, --type <string>`           | Filter by type                                                                                   |
| `-p, --priority <string>`       | Filter by priority (`0-4` or `P0-P4`)                                                            |
| `--priority-min/max <string>`   | Priority range (inclusive)                                                                       |
| `-a, --assignee <string>`       | Filter by assignee                                                                               |
| `-l, --label <strings>`         | Filter by labels (AND logic)                                                                     |
| `--label-any <strings>`         | Filter by labels (OR logic)                                                                      |
| `--parent <id>`                 | Show children of specified parent                                                                |
| `--no-parent`                   | Exclude child issues (top-level only)                                                            |
| `-n, --limit <int>`             | Limit results (default 50, use 0 for unlimited)                                                  |
| `--sort <field>`                | Sort by: `priority`, `created`, `updated`, `closed`, `status`, `id`, `title`, `type`, `assignee` |
| `-r, --reverse`                 | Reverse sort order                                                                               |
| `--all`                         | Include closed issues                                                                            |
| `--ready`                       | Status=open only (NOT blocker-aware; use `bd ready` instead)                                     |
| `--overdue`                     | Issues with `due_at` in the past                                                                 |
| `--deferred`                    | Only issues with `defer_until` set                                                               |
| `--title <string>`              | Filter by title substring (case-insensitive)                                                     |
| `--desc-contains <string>`      | Filter by description substring                                                                  |
| `--created-after/before <date>` | Date range filters (YYYY-MM-DD or RFC3339)                                                       |
| `--updated-after/before <date>` | Date range filters                                                                               |
| `--pretty` / `--tree`           | Hierarchical tree format                                                                         |
| `--long`                        | Detailed multi-line output                                                                       |
| `--id <string>`                 | Filter by specific IDs (comma-separated)                                                         |
| `--no-assignee`                 | Issues with no assignee                                                                          |
| `--no-labels`                   | Issues with no labels                                                                            |
| `--empty-description`           | Issues with empty/missing description                                                            |
| `--pinned` / `--no-pinned`      | Filter by pinned status                                                                          |

## bd show

Show issue details.

```
bd show [id...] [--id=<id>...] [flags]
```

**Aliases:** `show`, `view`

| Flag           | Description                             |
| -------------- | --------------------------------------- |
| `--children`   | Show only children of this issue        |
| `--refs`       | Show issues that reference this issue   |
| `--short`      | Compact one-line output                 |
| `--local-time` | Timestamps in local time instead of UTC |
| `-w, --watch`  | Watch for changes                       |

**JSON output note:** `bd show <id> --json` returns an array. For a single issue, the object is at `.[0]`. When the issue has children, they appear in the `dependents` array within the object.

## bd ready

Show ready work — open issues with no active blockers.

```
bd ready [flags]
```

**Important:** `bd ready` is NOT equivalent to `bd list --ready`. It uses the `GetReadyWork` API which applies blocker-aware semantics. `bd list --ready` only filters `status=open` and misses dependency-blocked issues.

| Flag                      | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `-n, --limit <int>`       | Maximum issues (default 10)                    |
| `-p, --priority <int>`    | Filter by priority                             |
| `-t, --type <string>`     | Filter by type                                 |
| `-a, --assignee <string>` | Filter by assignee                             |
| `-u, --unassigned`        | Only unassigned issues                         |
| `-l, --label <strings>`   | Filter by labels (AND)                         |
| `--label-any <strings>`   | Filter by labels (OR)                          |
| `--parent <id>`           | Filter to descendants of this bead/epic        |
| `-s, --sort <string>`     | Sort: `priority` (default), `hybrid`, `oldest` |
| `--plain`                 | Plain numbered list (no tree)                  |
| `--pretty`                | Tree format (default true)                     |
| `--include-deferred`      | Include future deferred issues                 |
| `--include-ephemeral`     | Include wisps                                  |
| `--gated`                 | Find molecules ready for gate-resume dispatch  |
| `--mol <id>`              | Filter to steps within a molecule              |

## bd update

Update one or more issues. If no ID given, updates last touched issue.

```
bd update [id...] [flags]
```

| Flag                         | Description                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `--claim`                    | Atomically claim (sets assignee to you, status to `in_progress`; fails if already claimed) |
| `-s, --status <string>`      | New status                                                                                 |
| `--title <string>`           | New title                                                                                  |
| `-d, --description <string>` | New description                                                                            |
| `-p, --priority <string>`    | Priority (`0-4` or `P0-P4`)                                                                |
| `-t, --type <string>`        | New type                                                                                   |
| `-a, --assignee <string>`    | Assignee                                                                                   |
| `--parent <id>`              | Reparent (empty string to remove parent)                                                   |
| `--add-label <strings>`      | Add labels                                                                                 |
| `--remove-label <strings>`   | Remove labels                                                                              |
| `--set-labels <strings>`     | Replace all labels                                                                         |
| `--notes <string>`           | Additional notes                                                                           |
| `--append-notes <string>`    | Append to notes                                                                            |
| `-e, --estimate <int>`       | Time estimate in minutes                                                                   |
| `--due <string>`             | Due date (empty to clear)                                                                  |
| `--defer <string>`           | Defer until date (empty to clear)                                                          |
| `--acceptance <string>`      | Acceptance criteria                                                                        |
| `--design <string>`          | Design notes                                                                               |
| `--spec-id <string>`         | Link to spec                                                                               |
| `--external-ref <string>`    | External reference                                                                         |
| `--metadata <string>`        | Set metadata (JSON or `@file.json`)                                                        |
| `--set-metadata <key=value>` | Set metadata key (repeatable)                                                              |
| `--unset-metadata <key>`     | Remove metadata key (repeatable)                                                           |
| `--body-file <path>`         | Read description from file                                                                 |

## bd close

Close one or more issues. If no ID given, closes last touched issue.

```
bd close [id...] [flags]
```

| Flag                    | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `-r, --reason <string>` | Reason for closing                                |
| `--suggest-next`        | Show newly unblocked issues after closing         |
| `--continue`            | Auto-advance to next molecule step                |
| `--no-auto`             | With `--continue`, show next step but don't claim |
| `-f, --force`           | Force close pinned issues or unsatisfied gates    |

## bd query

Query issues using a simple query language.

```
bd query [expression] [flags]
```

### Query Language Syntax

| Operator             | Example                                          |
| -------------------- | ------------------------------------------------ |
| `=`                  | `status=open`                                    |
| `!=`                 | `status!=closed`                                 |
| `>`, `>=`, `<`, `<=` | `priority<=1`, `created>7d`                      |
| `AND`                | `status=open AND priority<=1`                    |
| `OR`                 | `type=bug OR type=feature`                       |
| `NOT`                | `NOT status=closed`                              |
| `()`                 | `(status=open OR status=blocked) AND priority<2` |

### Supported Fields

`status`, `priority`, `type`, `assignee`, `owner`, `label`, `title`, `description`, `notes`, `created`, `updated`, `closed`, `id`, `spec`, `pinned`, `ephemeral`, `template`, `parent`, `mol_type`

### Date Values

- Relative: `7d`, `24h`, `2w`
- Absolute: `2025-01-15`, `2025-01-15T10:00:00Z`
- Natural: `tomorrow`, `"next monday"`, `"in 3 days"`

### Flags

| Flag                | Description                       |
| ------------------- | --------------------------------- |
| `-a, --all`         | Include closed issues             |
| `-n, --limit <int>` | Limit (default 50, 0 = unlimited) |
| `--sort <field>`    | Sort by field                     |
| `-r, --reverse`     | Reverse sort                      |
| `--long`            | Detailed output                   |
| `--parse-only`      | Show AST (for debugging)          |

## bd search

Search issues by text across title, description, and ID.

```
bd search [query] [flags]
```

| Flag                            | Description            |
| ------------------------------- | ---------------------- |
| `-s, --status <string>`         | Filter by status       |
| `-t, --type <string>`           | Filter by type         |
| `-a, --assignee <string>`       | Filter by assignee     |
| `-l, --label <strings>`         | Filter by labels (AND) |
| `--label-any <strings>`         | Filter by labels (OR)  |
| `-n, --limit <int>`             | Limit (default 50)     |
| `--sort <field>`                | Sort by field          |
| `-r, --reverse`                 | Reverse sort           |
| `--long`                        | Detailed output        |
| `--priority-min/max <string>`   | Priority range         |
| `--created-after/before <date>` | Date range             |
| `--updated-after/before <date>` | Date range             |
| `--desc-contains <string>`      | Description substring  |
| `--no-assignee`                 | No assignee            |
| `--no-labels`                   | No labels              |

## bd dep

Manage dependencies between issues.

### Subcommands

**`bd dep add <blocked> <blocker>`** — Add a dependency (blocked depends on blocker).

```bash
bd dep add bd-42 bd-41             # bd-42 depends on bd-41
bd dep add bd-42 --blocked-by bd-41  # Same (flag syntax)
bd dep bd-41 --blocks bd-42        # Same (reverse syntax)
```

Types: `blocks` (default), `tracks`, `related`, `parent-child`, `discovered-from`, `until`, `caused-by`, `validates`, `relates-to`, `supersedes`

**`bd dep remove <blocked> <blocker>`** — Remove a dependency.

**`bd dep list <id>`** — List dependencies or dependents.

| Flag                     | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `--direction <down\|up>` | `down` = dependencies (default), `up` = dependents |
| `-t, --type <string>`    | Filter by dependency type                          |

**`bd dep tree <id>`** — Show dependency tree.

| Flag                           | Description                 |
| ------------------------------ | --------------------------- |
| `--direction <down\|up\|both>` | Tree direction              |
| `-d, --max-depth <int>`        | Max depth (default 50)      |
| `--status <string>`            | Filter by status            |
| `-t, --type <string>`          | Filter by dependency type   |
| `--format mermaid`             | Output as Mermaid flowchart |

**`bd dep cycles`** — Detect dependency cycles.

**`bd dep relate <id1> <id2>`** — Create bidirectional relates_to link.

## bd epic

Epic management commands.

**`bd epic status`** — Show epic completion status.

| Flag              | Description                          |
| ----------------- | ------------------------------------ |
| `--eligible-only` | Show only epics eligible for closure |

**`bd epic close-eligible`** — Close epics where all children are complete.

| Flag        | Description             |
| ----------- | ----------------------- |
| `--dry-run` | Preview without closing |

## bd children

List child issues of a parent. Convenience alias for `bd list --parent <id>`.

```
bd children <parent-id> [--json] [--pretty]
```

## bd blocked

Show blocked issues.

```
bd blocked [--parent <epic-id>] [--json]
```

## JSON Output Schema

Actual field names from live `bd --json` output (snake_case):

### Task Object (from `bd list --json`)

```json
{
  "id": "workspace-9z7",
  "title": "Feature: template-builder",
  "description": "Spec: specs/001-template-builder/spec.md",
  "status": "open",
  "priority": 0,
  "issue_type": "epic",
  "owner": "user@example.com",
  "assignee": null,
  "created_at": "2026-01-19T19:05:35Z",
  "created_by": "User Name",
  "updated_at": "2026-01-19T19:05:35Z",
  "dependency_count": 0,
  "dependent_count": 0,
  "comment_count": 0
}
```

### Task Object with dependents (from `bd show <id> --json`)

Additional fields on child/dependent objects:

```json
{
  "closed_at": "2026-01-19T19:38:52Z",
  "close_reason": "Completed requirements",
  "dependency_type": "parent-child"
}
```

### Key field notes

| Field              | Type    | Notes                                                                      |
| ------------------ | ------- | -------------------------------------------------------------------------- |
| `id`               | string  | Issue ID (e.g., `workspace-9z7`)                                           |
| `priority`         | integer | 0-4, where 0 is highest                                                    |
| `issue_type`       | string  | NOT `type` — values: `task`, `bug`, `feature`, `epic`, `chore`, `decision` |
| `status`           | string  | `open`, `in_progress`, `blocked`, `deferred`, `closed`                     |
| `created_at`       | string  | ISO 8601 UTC timestamp                                                     |
| `dependency_count` | integer | Number of issues this depends on                                           |
| `dependent_count`  | integer | Number of issues that depend on this                                       |
| `dependents`       | array   | Present in `bd show --json` output, contains child/dependent objects       |
| `close_reason`     | string  | Present when closed                                                        |

### Status Values

`open`, `in_progress`, `blocked`, `deferred`, `closed`

### List output vs show output

- `bd list --json` returns a flat array of objects with count fields (`dependency_count`, `dependent_count`)
- `bd show <id> --json` returns an array with full objects including nested `dependents` array
