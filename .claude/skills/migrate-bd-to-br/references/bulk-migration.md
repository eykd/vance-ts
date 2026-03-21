# Bulk Migration Strategy

## When to Use

Use parallel subagents when migrating 10+ files. The mechanical
`npx bd` -> `br` replacement is ideal for parallelization since
files are independent.

## Batch Strategy

| File count | Strategy   | Agents        |
| ---------- | ---------- | ------------- |
| 1-5        | Sequential | 1 (direct)    |
| 6-15       | Parallel   | 2-3 subagents |
| 16-50      | Parallel   | 4-5 subagents |
| 50+        | Parallel   | 5+ subagents  |

## Subagent Prompt Template

```
Update the following files to migrate from bd (beads npm) to
br (beads_rust).

## Replacement rules (apply ALL):

1. `npx bd` -> `br` (standalone binary, no npx needed)
2. Bare `bd <subcommand>` -> `br <subcommand>`
3. `@beads/bd` -> `beads_rust`
4. `bd comment <id> "msg"` -> `br comments add <id> "msg"`
5. `bd dolt push` -> `br sync --flush-only`
6. `bd dolt test` -> `br doctor`
7. `npm install --save-dev @beads/bd` -> install via curl
8. `steveyegge/beads` -> `Dicklesworthstone/beads_rust`
9. Keep issue ID prefixes like `bd-abc123` unchanged
10. Don't replace `bd` inside words (embed, subdirectory)

## Files:
[list files here]

Read each file first, then make edits. Be thorough.
```

## Recommended File Groups

### Group 1: Beads skill + references

- `.claude/skills/beads-tasks/SKILL.md`
- `.claude/skills/beads-tasks/references/cli-reference.md`
- `.claude/skills/beads-tasks/references/batch-patterns.md`
- `.claude/skills/beads-tasks/references/jq-cookbook.md`

### Group 2: Spec-kit commands

- `.claude/commands/sp/01-specify.md`
- `.claude/commands/sp/02-clarify.md`
- `.claude/commands/sp/03-plan.md`
- `.claude/commands/sp/04-red-team.md`
- `.claude/commands/sp/05-tasks.md`
- `.claude/commands/sp/06-analyze.md`
- `.claude/commands/sp/07-implement.md`
- `.claude/commands/sp/08-security-review.md`
- `.claude/commands/sp/09-architecture-review.md`
- `.claude/commands/sp/10-code-quality-review.md`
- `.claude/commands/sp/next.md`
- `.claude/commands/sp/README.md`

### Group 3: Scripts

- `ralph.sh` (largest file, ~79 refs)
- `review.sh` (~12 refs)

### Group 4: Other skills

- `.claude/skills/process-pr-reviews/SKILL.md`
- `.claude/skills/ralph/SKILL.md`
- `.claude/skills/code-review/SKILL.md`
- `.claude/skills/code-review/references/review-sections.md`
- `.claude/skills/code-review/references/output-format.md`
- `.claude/skills/quality-review/references/known-issues.md`
- `.claude/skills/glossary/SKILL.md`

### Group 5: Docs and specs

- `CLAUDE.md`, `AGENTS.md`
- `docs/review-sh.md`
- `specs/readme.md`
- All files in `specs/008-beads-integration/`
- All files in `specs/001-ralph-automation/`

## Verification Between Batches

After each subagent completes, verify before proceeding:

```bash
# Quick check per group
grep -rn 'npx bd' <group-files> --include='*.md' --include='*.sh'
# Must return empty
```

## Commit Strategy

Recommended: one commit for the full migration.

```bash
git add <all-changed-files>
git commit -m "$(cat <<'EOF'
chore: migrate from bd (beads npm) to br (beads_rust)

Replace @beads/bd npm package with beads_rust standalone binary.
- All `npx bd` commands become `br`
- `bd comment` syntax becomes `br comments add`
- Replace Dolt backend with SQLite
- Remove beads git hooks (br is non-invasive)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```
