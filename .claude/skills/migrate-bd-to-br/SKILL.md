---
name: migrate-bd-to-br
description: >-
  Full-stack migration from bd (beads npm, @beads/bd) to br (beads_rust).
  Covers infrastructure (package.json, config, hooks), doc transforms,
  script updates, CI, data migration, and verification. Use when migrating
  a repo from bd/npx bd to br, updating AGENTS.md, converting bd commands,
  or fixing stale bd references.
---

<!-- TOC: Decision Tree | Phase 0: Prerequisites | Phase 1: Infrastructure | Phase 2: Safety Hook | Phase 3: Project Instructions | Phase 4: Skills & Commands | Phase 5: Scripts | Phase 6: Build & CI | Phase 7: Docs & Specs | Phase 8: Data Migration | Phase 9: Verification | References -->

# Migrate bd (beads npm) to br (beads_rust)

> **Core principle:** One behavioral change (`bd sync` auto-committed;
> `br sync --flush-only` does not), everything else is mechanical
> find-replace. The JSONL interchange format is fully compatible.

## Decision Tree

```
What are you migrating?
|
+-- Full repo (first-time migration)
|   |
|   +-- Follow Phases 0-9 below in order
|   +-- Use parallel subagents for Phase 4 (bulk mechanical)
|
+-- Single file or small batch
|   |
|   +-- Apply doc transforms from references/transforms.md
|   +-- Run scripts/verify-migration.sh per file
|
+-- Verify existing migration
|   |
|   +-- Run scripts/find-bd-refs.sh /path
|   +-- Any output = incomplete migration
|
+-- Just checking CLI differences
    |
    +-- See references/command-map.md
```

---

## Phase 0: Prerequisites

1. **Install br**:

   ```bash
   curl -fsSL \
     "https://raw.githubusercontent.com/Dicklesworthstone/beads_rust/main/install.sh" \
     | bash
   br --version
   ```

2. **Verify CLI compatibility** before touching any files:

   ```bash
   br update --help | grep -q '\-\-claim'   # Must exist
   br comments add --help                     # Verify syntax
   br reopen --help                           # Must exist
   br epic --help                             # Must exist
   ```

3. **Test data import** (non-destructive):
   ```bash
   br init && br sync --import-only
   br stats   # Verify issue counts match
   ```

### Key syntax differences to confirm

| bd syntax               | br syntax                           | Type                |
| ----------------------- | ----------------------------------- | ------------------- |
| `npx bd <cmd>`          | `br <cmd>`                          | Invocation (no npm) |
| `bd comment <id> "msg"` | `br comments add <id> "msg"`        | Subcommand rename   |
| `bd sync`               | `br sync --flush-only` + manual git | **Behavioral**      |
| `bd dolt push`          | `br sync --flush-only`              | Backend removed     |
| `bd dolt test`          | `br doctor`                         | Command rename      |
| `bd hooks run <hook>`   | _(removed, br has no hooks)_        | Feature removed     |

See [references/command-map.md](references/command-map.md) for the full map.

---

## Phase 1: Infrastructure

### package.json

- Remove `"@beads/bd"` from devDependencies
- Run `npm install` to update lockfile

### .beads/config.yaml

- Remove `no-db: true` and all Dolt-specific settings
- br uses SQLite natively; verify supported keys with `br config list`

### .beads/metadata.json

- Delete (br recreates it on `br init` with SQLite config)

### .beads/README.md

- `bd` -> `br`, remove `npx`, update install to curl, remove Dolt refs
- Link to `github.com/Dicklesworthstone/beads_rust`

### .beads/.gitignore

- Remove Dolt entries (`dolt/`, `dolt-server.*`, `bd.sock*`, etc.)
- Add SQLite entries: `beads.db`, `beads.db-wal`, `beads.db-shm`

### .beads/hooks/ (git hooks)

br is non-invasive and does not use git hooks.

- Hooks with quality gates (pre-commit, commit-msg): **strip beads
  integration block**, keep quality gates
- Hooks that are beads-only (post-checkout, post-merge,
  prepare-commit-msg, pre-push): **delete**

### .husky/ hooks

- Remove any `npx bd hooks run` lines

---

## Phase 2: Safety Hook

If the repo has a `.claude/hooks/pre-tool-use-bash.ts` that enforces
`npx bd` over bare `bd`:

- **Invert** the check: block both `npx bd` and bare `bd`
- Direct users to `br` instead
- Update `bd init --force` guard to `br init --force`

---

## Phase 3: Project Instructions

### CLAUDE.md

- Update "Beads Task Management" section: `npx bd` -> `br`
- Update epic lookup pattern code blocks

### AGENTS.md

- Full rewrite of beads section: `bd` -> `br`
- Remove Dolt sync references
- Update all command examples

---

## Phase 4: Skills & Commands (bulk mechanical)

This is the largest phase. Use **parallel subagents** (up to 5) to
handle groups of files simultaneously.

### Replacement rules for all files

1. `npx bd` -> `br`
2. Bare `bd <subcommand>` -> `br <subcommand>`
3. `@beads/bd` -> `beads_rust`
4. `bd comment <id> "msg"` -> `br comments add <id> "msg"`
5. `bd dolt push` -> `br sync --flush-only`
6. `bd dolt test` -> `br doctor`
7. `npm install --save-dev @beads/bd` -> install via curl
8. `steveyegge/beads` -> `Dicklesworthstone/beads_rust`
9. **Keep** issue ID prefixes like `bd-abc123` unchanged (data, not
   commands)
10. **Don't** replace `bd` inside words (embed, subdirectory)

### Typical file groups for subagents

| Group              | Files                                                            | Est. refs |
| ------------------ | ---------------------------------------------------------------- | --------- |
| Beads skill + refs | SKILL.md, cli-reference.md, batch-patterns.md, jq-cookbook.md    | ~80       |
| Spec-kit commands  | 01-specify through 10-code-quality-review, next, README          | ~140      |
| Other skills       | process-pr-reviews, ralph, code-review, glossary, quality-review | ~40       |
| Scripts            | ralph.sh, review.sh                                              | ~90       |
| Docs & specs       | specs/001-_, specs/008-_, specs/009-\*, docs/                    | ~80       |

---

## Phase 5: Scripts

### ralph.sh (largest file)

- All `npx bd` -> `br`
- **Critical**: `npx bd comment "$id" "msg"` -> `br comments add "$id" "msg"`
  (affects ~20 lines)
- `npx bd comments "$id"` (listing) -> `br comments "$id"` (no `add`)
- Remove Dolt health checks

### review.sh

- All `npx bd` -> `br`
- `bd reopen` -> `br reopen` (verify command exists in Phase 0)

---

## Phase 6: Build & CI

### justfile

Rewrite `beads-init` target:

```bash
beads-init:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v br &>/dev/null; then
        echo "Installing beads_rust..."
        curl -fsSL \
          "https://raw.githubusercontent.com/.../install.sh" | bash
    fi
    if br list --json --quiet 2>/dev/null | grep -q '"id"'; then
        echo "Beads already initialized."
        exit 0
    fi
    br init
    br sync --import-only
```

### CI workflow (.github/workflows/)

- Add `br` install step before beads queries
- `npx bd list` -> `br list`
- Fix `--format json` -> `--json` (common bug in old bd usage)

---

## Phase 7: Docs & Specs

Apply standard replacement rules to:

- `specs/readme.md` (keywords)
- All spec subdirectories (008-beads-integration, 001-ralph, etc.)
- `docs/` status files and guides

For historical spec files (task descriptions referencing `/bd:*`
command namespace or `.claude/commands/bd/` paths): leave as-is.
Only update CLI tool references.

---

## Phase 8: Data Migration

```bash
# 1. Initialize br (creates SQLite db)
br init

# 2. Import existing JSONL
br sync --import-only

# 3. Verify
br stats                          # Check total count
br list --all --json | jq length  # Cross-check

# 4. Test roundtrip
br sync --flush-only              # Export back to JSONL

# 5. Clean Dolt artifacts
rm -rf .beads/dolt/
```

The JSONL format is compatible. Issue data imports with zero loss.

---

## Phase 9: Verification

### Grep sweep (must return zero results)

```bash
grep -rn 'npx bd\b' --include='*.md' --include='*.ts' \
  --include='*.sh' --include='*.yml' --include='*.yaml' .

grep -rn '"@beads/bd"' --include='*.json' .
```

### Bare command sweep

```bash
grep -rn '\bbd\s\+\(create\|list\|show\|update\|close\|ready\|' \
  'init\|dep\|comment\|sync\|epic\|hooks\|dolt\)' \
  --include='*.md' --include='*.ts' --include='*.sh' .
```

### Build verification

```bash
npm run check    # type-check + lint + test
npm run build    # compile
```

### Smoke test

```bash
br list && br ready
br create "Migration test" --description "verify create works"
br close <new-id> --reason "Migration test"
br sync --flush-only
```

### Run verification script

```bash
./scripts/verify-migration.sh <file>     # Per-file check
./scripts/find-bd-refs.sh .              # Repo-wide discovery
```

---

## References

| Need                                           | Reference                                         |
| ---------------------------------------------- | ------------------------------------------------- |
| Full command mapping with syntax differences   | [command-map.md](references/command-map.md)       |
| Doc transform patterns (before/after examples) | [transforms.md](references/transforms.md)         |
| Common mistakes and fixes                      | [pitfalls.md](references/pitfalls.md)             |
| Bulk migration with parallel subagents         | [bulk-migration.md](references/bulk-migration.md) |

## Scripts

| Script                               | Purpose                          |
| ------------------------------------ | -------------------------------- |
| `scripts/find-bd-refs.sh <path>`     | Discover files needing migration |
| `scripts/verify-migration.sh <file>` | Verify migration is complete     |
