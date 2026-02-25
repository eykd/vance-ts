---
name: status
description: 'Generate a dated project status snapshot summarizing architecture, stack, routes, security, testing, automation, skills, and affordances. Use when capturing current boilerplate state, onboarding new contributors, or before major milestones.'
---

# Project Status Snapshot

Generate a comprehensive, dated project status document at `docs/YYYY-MM-DD_project_status.md`.

## Process

### 1. Gather Metadata

Read the following files to collect project state:

- `package.json` — name, version, dependencies, scripts
- `wrangler.toml` — worker name, bindings, compatibility date
- `tsconfig.json` — target, lib, strict flags
- `src/shared/env.ts` — `Env` interface (Cloudflare bindings)
- `src/worker.ts` — routes and middleware
- `hugo/hugo.yaml` + `hugo/config/_default/params.yaml` — theme, site config
- `hugo/package.json` — Hugo version, CSS stack
- `migrations/` — list all migration files
- Git state: current branch, main branch, recent commits, clean/dirty status

### 2. Count Project Artifacts

Use Glob/Grep to count:

| Artifact         | Pattern                             |
| ---------------- | ----------------------------------- |
| Source files     | `src/**/*.ts` excluding `*.spec.ts` |
| Test files       | `src/**/*.spec.ts`                  |
| Skills           | `.claude/skills/*/SKILL.md`         |
| Acceptance specs | `specs/acceptance-specs/*.txt`      |
| Reference docs   | `docs/*.md`                         |

### 3. Write Output

Create `docs/YYYY-MM-DD_project_status.md` (using today's date) with these sections:

1. **Header** — Title, date, current branch, main branch
2. **Summary paragraph** — One-paragraph description of what this project is
3. **Runtime Stack** — Table: Layer, Technology, Version
4. **Cloudflare Bindings** — Table: Binding, Type, Purpose (from `Env` interface)
5. **Architecture tree** — 4-layer Clean Architecture directory tree from `src/`
6. **Route table** — Method, Path, Handler, Auth (from `worker.ts`)
7. **Security posture** — Bullet list of security features
8. **Database schema** — From `migrations/` files
9. **Hugo site summary** — Theme, layouts, SEO, build verification
10. **Testing infrastructure** — Vitest projects table, ATDD pipeline, pre-commit gate
11. **Task management** — Beads overview
12. **Automation** — Spec-kit phases table, Ralph, CI/CD workflows
13. **Skills inventory** — Count + domain categories
14. **Reference docs** — Count of guides
15. **Affordances for future work** — Three categories: Ready / Available / Config-only
16. **Quick-reference commands** — Key development commands

### 4. Formatting Rules

- Use GitHub-flavored Markdown
- Use tables for structured data (stack, bindings, routes, etc.)
- Use code blocks for directory trees and command examples
- Keep descriptions concise — this is a reference snapshot, not prose
- Include actual counts and versions, not placeholders

## Reference Template

Use `docs/2026-02-25_project_status.md` as the canonical example of expected output format and level of detail. Match its structure, tone, and completeness.

## Output

The final document path: `docs/YYYY-MM-DD_project_status.md`

Confirm to the user:

- File path written
- Summary of key stats (source files, tests, skills, specs)
- Any notable changes from the last status snapshot (if one exists)
