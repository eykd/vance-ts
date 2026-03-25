# Common Pitfalls and Fixes

## Critical Pitfalls

### 1. Forgetting manual git steps after sync (THE BIG ONE)

**Symptom:** Work appears lost after session end.

**Cause:** Docs say `br sync --flush-only` but don't include the
manual `git add .beads/ && git commit` step that follows.

**Detection:**

```bash
for f in $(grep -rl 'br sync --flush-only' . --include="*.md"); do
  if ! grep -q 'git add .beads/' "$f"; then
    echo "MISSING GIT STEPS: $f"
  fi
done
```

**Fix:** After EVERY `br sync --flush-only` in docs, add:

```bash
git add .beads/
git commit -m "sync beads"
```

### 2. bd comment -> br comments add syntax

**Symptom:** `br comment` command not found.

**Cause:** The subcommand structure changed. `bd` used `bd comment`;
`br` uses `br comments add`.

**Detection:**

```bash
grep -rn 'br comment ' --include='*.md' --include='*.sh' .
```

**Fix:** `br comment <id> "msg"` -> `br comments add <id> "msg"`

### 3. npx bd left in scripts

**Symptom:** `npx bd: command not found` after removing @beads/bd
from package.json.

**Cause:** Shell scripts (.sh) still reference `npx bd`.

**Detection:**

```bash
grep -rn 'npx bd' --include='*.sh' .
```

**Fix:** `npx bd` -> `br` (standalone binary, no npm).

---

## Transform Pitfalls

### 4. Incomplete sync transform

**Symptom:** `br sync` without `--flush-only` does import+export.

**Cause:** Transformed `bd sync` to `br sync` but forgot
`--flush-only` flag.

**Detection:**

```bash
grep -n 'br sync[^-]' file.md
grep -n 'br sync$' file.md
```

**Fix:** `br sync` -> `br sync --flush-only` (when replacing bd sync)

### 5. Replacing bd inside words

**Symptom:** "embrr" instead of "embed", "subrirectory" etc.

**Cause:** Naive find-replace of `bd` without word boundaries.

**Prevention:** Use `\bbd\b` regex or only replace `` `bd `` patterns.
Never replace `bd` inside words.

### 6. Replacing issue ID prefixes (when you shouldn't)

**Symptom:** Issue IDs in `.beads/issues.jsonl` don't match docs.

**Cause:** Changed `bd-abc123` to `br-abc123` in docs but the actual
database IDs are unchanged (they're data, not commands).

**Rule:** Existing issue IDs from imported JSONL are preserved.
Only update ID references in templates and examples, not in actual
issue references that match real database IDs.

### 7. Missing non-invasive note

**Symptom:** Readers follow br commands but expect auto-commit.

**Detection:**

```bash
if grep -q '`br ' file.md && ! grep -q 'non-invasive' file.md; then
  echo "MISSING NOTE: $f"
fi
```

**Fix:** Add after beads section header:

```markdown
**Note:** `br` is non-invasive and never executes git commands.
After `br sync --flush-only`, you must manually run
`git add .beads/ && git commit`.
```

---

## Infrastructure Pitfalls

### 8. Forgetting to remove @beads/bd from package.json

**Symptom:** `npm install` still installs old bd package.

**Detection:**

```bash
grep '@beads/bd' package.json
```

**Fix:** Remove from devDependencies, run `npm install`.

### 9. Leaving Dolt artifacts

**Symptom:** Large `.beads/dolt/` directory in git, or Dolt config
in `metadata.json`.

**Fix:**

```bash
rm -rf .beads/dolt/
# br init recreates metadata.json with SQLite config
```

### 10. Not updating safety hooks

**Symptom:** Claude Code hook blocks `br` commands or still
requires `npx bd`.

**Cause:** `.claude/hooks/pre-tool-use-bash.ts` still enforces
`npx bd` over bare `bd`.

**Fix:** Invert the hook to block `bd`/`npx bd` and allow `br`.

### 11. Leaving beads git hooks active

**Symptom:** Pre-commit fails looking for `bd hooks run`.

**Cause:** `.beads/hooks/pre-commit` still has beads integration block.

**Fix:** Strip the `--- BEGIN BEADS INTEGRATION ---` block from
hooks with quality gates. Delete hooks that are beads-only.

---

## Verification Checklist

After migration, ALL of these must pass:

```bash
# Zero remaining references
grep -rn 'npx bd\b' --include='*.md' --include='*.ts' \
  --include='*.sh' --include='*.yml' .          # Must be empty
grep -rn '"@beads/bd"' --include='*.json' .     # Must be empty

# Build still works
npm run check
npm run build

# br works
br list
br stats
```
