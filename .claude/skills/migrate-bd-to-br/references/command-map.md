# Complete bd to br Command Map

## Invocation Change

| Before            | After      | Notes                     |
| ----------------- | ---------- | ------------------------- |
| `npx bd <cmd>`    | `br <cmd>` | Standalone binary, no npm |
| `bd <cmd>` (bare) | `br <cmd>` | Same                      |

## Simple Renames (no behavioral change)

| bd                       | br                       | Flags                                                              |
| ------------------------ | ------------------------ | ------------------------------------------------------------------ |
| `bd ready`               | `br ready`               | Same: `--json`, `--quiet`                                          |
| `bd list`                | `br list`                | Same: `--status`, `--type`, `--parent`, `--json`, `--all`          |
| `bd show <id>`           | `br show <id>`           | Same: `--json`                                                     |
| `bd create "title"`      | `br create "title"`      | Same: `-t`, `-p`, `--parent`, `--description`, `--json`            |
| `bd update <id>`         | `br update <id>`         | Same: `--claim`, `--status`, `--priority`, `--assignee`, `--force` |
| `bd close <id>`          | `br close <id>`          | Same: `--reason`, `--session`                                      |
| `bd reopen <id>`         | `br reopen <id>`         | Same                                                               |
| `bd delete <id>`         | `br delete <id>`         | Same                                                               |
| `bd dep add <a> <b>`     | `br dep add <a> <b>`     | Same                                                               |
| `bd dep remove <a> <b>`  | `br dep remove <a> <b>`  | Same                                                               |
| `bd dep tree <id>`       | `br dep tree <id>`       | Same                                                               |
| `bd dep list <id>`       | `br dep list <id>`       | Same                                                               |
| `bd dep cycles`          | `br dep cycles`          | Same                                                               |
| `bd blocked`             | `br blocked`             | Same                                                               |
| `bd children <id>`       | `br children <id>`       | Same (if available; else `br list --parent <id>`)                  |
| `bd search "term"`       | `br search "term"`       | Same                                                               |
| `bd count`               | `br count`               | Same: `--by`                                                       |
| `bd stats`               | `br stats`               | Same                                                               |
| `bd epic status`         | `br epic status`         | Same                                                               |
| `bd epic close-eligible` | `br epic close-eligible` | Same                                                               |
| `bd init`                | `br init`                | Same (but no Dolt backend)                                         |
| `bd config list`         | `br config list`         | Same                                                               |
| `bd q "title"`           | `br q "title"`           | Quick capture                                                      |

## Syntax Changes (subcommand structure differs)

| bd                          | br                               | Notes                                            |
| --------------------------- | -------------------------------- | ------------------------------------------------ |
| `bd comment <id> "message"` | `br comments add <id> "message"` | Subcommand renamed; `comments add` not `comment` |
| `bd comments <id>`          | `br comments <id>`               | Listing stays same (or `br comments list <id>`)  |

## Behavioral Changes

| bd                    | br                                  | Difference                                      |
| --------------------- | ----------------------------------- | ----------------------------------------------- |
| `bd sync`             | `br sync --flush-only` + manual git | bd auto-committed to git; br only exports JSONL |
| `bd dolt push`        | `br sync --flush-only`              | Dolt backend removed entirely                   |
| `bd dolt test`        | `br doctor`                         | Different diagnostic tool                       |
| `bd hooks run <hook>` | _(removed)_                         | br is non-invasive, no git hooks                |
| `bd onboard`          | _(removed)_                         | Use `br agents --add --force` for AGENTS.md     |

## New Commands in br (no bd equivalent)

| Command                    | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `br stale --days 30`       | Identify untouched issues                     |
| `br label add/remove/list` | Tag management                                |
| `br doctor`                | Run diagnostics and repair                    |
| `br upgrade`               | Self-update binary                            |
| `br agents --add --force`  | Generate/update AGENTS.md                     |
| `br changelog`             | Generate changelog from closed issues         |
| `br graph`                 | Visualize dependency graph                    |
| `br history`               | Manage local history backups                  |
| `br info`                  | Show workspace diagnostic metadata            |
| `br lint`                  | Check issues for missing template sections    |
| `br orphans`               | List orphan issues                            |
| `br schema`                | Emit JSON schemas for br output types         |
| `br where`                 | Show the active .beads directory              |
| `br defer/undefer`         | Schedule issues for later                     |
| `br audit`                 | Record agent interactions (append-only JSONL) |

## Global Flags

| Flag               | In bd? | In br? | Notes                   |
| ------------------ | ------ | ------ | ----------------------- |
| `--json`           | Yes    | Yes    | Machine-readable output |
| `--quiet` / `-q`   | Yes    | Yes    | Suppress output         |
| `--verbose` / `-v` | Yes    | Yes    | Increase logging        |
| `--db <path>`      | Yes    | Yes    | Override database path  |
| `--actor <name>`   | Yes    | Yes    | Audit trail actor       |
| `--allow-stale`    | Yes    | Yes    | Bypass freshness check  |
| `--no-db`          | Yes    | Yes    | JSONL-only mode         |
| `--no-color`       | No     | Yes    | Disable ANSI colors     |
| `--force`          | No     | Yes    | Skip confirmations      |
| `--no-auto-flush`  | No     | Yes    | Skip auto JSONL export  |
| `--no-auto-import` | No     | Yes    | Skip auto import check  |
| `--readonly`       | Yes    | No     | Removed                 |
| `--sandbox`        | Yes    | No     | Removed                 |

## Environment Variables

| bd                      | br                           | Notes                  |
| ----------------------- | ---------------------------- | ---------------------- |
| `BD_ACTOR`              | `--actor` flag (or same env) | Check `br` docs        |
| `BD_GIT_HOOK=1`         | _(removed)_                  | br has no hooks        |
| `BD_DB` / `BD_DATABASE` | `BD_DB` / `BD_DATABASE`      | Override database path |

## Issue ID Format

Both use hash-based prefixed IDs (e.g., `bd-f7a2c1`, `workspace-053`).
After `br init`, new issues get the configured prefix. Existing IDs
from imported JSONL are preserved unchanged.
