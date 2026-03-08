---
name: summary
description: 'Generate a dated project status snapshot at docs/YYYY-MM-DD-status.md.
  Use when onboarding contributors, capturing a milestone, or auditing project state.'
---

# Project Summary Snapshot

Generate a comprehensive, dated project status document using parallel subagents.

## Process

### Phase 1 — Parallel exploration (3 subagents)

Launch all three simultaneously:

**Subagent A — Core metadata**
Read: package.json, wrangler.toml, tsconfig.json, src/shared/env.ts, src/worker.ts
Collect: worker name, deps+versions, TS target/strict flags, Env bindings, routes+middleware, git branch + last 5 commits

**Subagent B — Artifacts**
Read: migrations/\*.sql (list + schema), scripts/ (list files, one-line purpose each),
hugo/content/ (list all content pages), hugo/hugo.yaml + hugo/package.json (theme, Hugo version)

**Subagent C — Counts**
Glob: src/**/_.ts excl _.spec.ts → source file count
Glob: src/**/_.spec.ts → test file count
Glob: .claude/skills/_/SKILL.md → skills count
Glob: specs/acceptance-specs/_.txt → acceptance spec count
Glob: docs/_.md → reference doc count

### Phase 2 — Synthesis subagent

Pass all Phase 1 results to one subagent to draft the full document with these sections:

1. Header — title, date, branch, main branch
2. Summary paragraph — one-paragraph project description
3. Runtime Stack — table: Layer, Technology, Version
4. Cloudflare Bindings — table: Binding, Type, Purpose
5. Architecture — 4-layer Clean Architecture tree from src/
6. Routes — table: Method, Path, Handler, Auth
7. Security posture — bullet list
8. Database schema — from migrations/
9. Hugo Static Site — theme/layouts/SEO/headers bullets + Content pages list
10. Scripts — table: File, Purpose
11. Testing infrastructure — Vitest projects table, ATDD pipeline, pre-commit gate
12. Task management — Beads overview
13. Automation — spec-kit phases table, Ralph, CI/CD
14. Skills inventory — count + domain categories
15. Reference docs — count of guides
16. Affordances — Ready / Available / Config-only categories
17. Quick-reference commands

### Phase 3 — Write output

Write draft to `docs/YYYY-MM-DD-status.md` (using today's date).

## Formatting Rules

- GitHub-flavored Markdown, tables for structured data, code blocks for trees
- Actual counts and versions — no placeholders
- Concise: reference snapshot, not prose

## Reference Template

Use `docs/2026-02-25_project_status.md` as the canonical example of format and detail level.

## Output

Confirm to the user:

- File path written
- Key stats (source files, tests, skills, specs)
- Notable changes from last snapshot (if one exists)
