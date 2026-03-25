# Specs Index (The Pin)

Read this before implementing any feature. When you search for a term and find it
here, follow the Spec path to the full specification. Keywords are intentionally
broad — synonyms, related terms, tech names, problem descriptions.

---

## Ralph Automation Loop

Keywords: ralph, automation, loop, autonomous, unattended, CI loop, /sp:next, sp:next,
iterate, Claude CLI, phase automation, feature completion, lock file, retry, SIGINT,
progress persistence, dry-run, max-iterations, epic detection, beads epic, ralph.sh
Spec: specs/001-ralph-automation/spec.md

---

## Refactoring Skill

Keywords: refactor, refactoring, code smell, red-green-refactor, TDD, extract function,
extract method, long function, duplication, shotgun surgery, primitive obsession,
polymorphism, decision tree, smell catalog, clean code, SKILL.md, progressive
disclosure, Martin Fowler, skill creation
Spec: specs/001-refactoring-skill/spec.md

---

## Static-First Routing Architecture

Keywords: routing, static-first, CDN, Cloudflare Pages, Worker routes, /app, /auth,
/webhooks, HTMX, Alpine.js, progressive enhancement, marketing pages, Hugo, dynamic
routes, /app/\_/, authentication boundary, wrangler.toml, pages_build_output_dir,
hypermedia, static site
Spec: specs/001-static-first-routing/spec.md

---

## Template Builder

Keywords: template, scaffold, scaffolding, boilerplate, project generator, tmplr, txtar,
single-file, packaging, distribution, instantiate, app-name, variable substitution,
bash script, binary download, sha256, checksum, wrangler.toml, starter kit, bundle
Spec: specs/001-template-builder/spec.md

---

## Observability Skills

Keywords: observability, SLO, SLI, service level objective, service level indicator,
error budget, burn rate, request timing, latency, Server-Timing, health endpoint,
health check, liveness, readiness, dependency health, D1 health, KV health, analytics
engine, metrics, monitoring, alerting, cloudflare-observability
Spec: specs/002-observability-skills/spec.md

---

## Logging and Tracing Skills

Keywords: logging, structured logging, tracing, log schema, AsyncLocalStorage, W3C trace
context, correlation, request ID, PII, redaction, Sentry, breadcrumb, SafeLogger,
BaseLogFields, log categorization, domain log, application log, infrastructure log,
event naming, dot-notation, console.log, sentry/cloudflare
Spec: specs/003-logging-tracing-skills/spec.md

---

## Hugo Skills

Keywords: Hugo, Hugo templates, Go templates, layouts, partials, shortcodes, HTMX,
Alpine.js, TypeScript HTML templates, html escaping, HX-Trigger, toast notification,
DaisyUI, TailwindCSS, search indexing, gray-matter, hugo-project-setup, static site,
content management, hugo.toml, frontmatter
Spec: specs/004-hugo-skills/spec.md

---

## Multi-Tenant Boundary Skills

Keywords: multi-tenant, multi-tenancy, tenant, organization, org, authorization, RBAC,
role-based, actor, action, resource, policy, tenant isolation, cross-tenant, data
leakage, query scoping, organization_id, membership, roles, owner, admin, member,
viewer, privilege escalation, migration, shadow organization
Spec: specs/005-multi-tenant-skills/spec.md

---

## Self-Organizing Skeleton

Keywords: directory skeleton, project structure, DDD, clean architecture, domain layer,
application layer, infrastructure layer, presentation layer, CLAUDE.md, contextual
guidance, .gitkeep, seed repository, src/domain, src/application, src/infrastructure,
src/presentation, use-cases, entities, value-objects, repositories, handlers
Spec: specs/006-self-organizing-skeleton/spec.md

---

## Hugo Project Setup

Keywords: Hugo setup, TailwindCSS 4, DaisyUI 5, theme, baseof.html, CSS pipeline,
hugo_stats.json, purging, minification, fingerprint, cache-busting, home layout,
single layout, list layout, Open Graph, Twitter Cards, schema.org, JSON-LD,
Google Analytics, lemonade theme, hugo/package.json, npm install
Spec: specs/007-hugo-project-setup/spec.md

---

## Beads Integration

Keywords: beads, br, task tracking, epic, task hierarchy, dependency graph, br init,
br create, br ready, br close, br dep, br list, spec-kit, /sp:01-specify, namespace
swap, task status, git-backed, issue tracker, epic ID, sub-task, phase tasks
Spec: specs/008-beads-integration/spec.md

---

## Code Review Skill

Keywords: code review, review, /code-review, /sp:review, review finding, review scope,
security review, test quality, GitHub Actions, PR review, pull request, beads issues,
severity, CRITICAL, HIGH, MEDIUM, LOW, git diff, staged changes, environment-agnostic
Spec: specs/009-code-review-skill/spec.md

---

## Acceptance Specs (GWT)

Keywords: GWT, given-when-then, acceptance test, user story, US01, US02, health check,
health endpoint, 404, not found, API error, status 200, status 404, liveness check,
structured error response, acceptance-specs, txt spec format
Spec: specs/acceptance-specs/ (US<N>-<kebab-title>.txt files)

---

## User Authentication

Keywords: authentication, auth, login, logout, register, sign-in, sign-up, sign-out,
user account, email password, better-auth, session, session management, cookie, rate
limiting, brute force, email enumeration, password strength, protected routes, middleware,
access control, OAuth, Google login, social login, CSRF, security headers, Hono, D1,
KV, credential, hashed password, route protection, redirect after login
Spec: specs/011-better-auth/spec.md

---

## Auth-Static Site Integration

Keywords: auth integration, static site auth, navbar auth, sign in link, sign up button,
dashboard, auth status, session check, authenticated navbar, HTMX swap, Alpine.js store,
progressive enhancement, auth guard, client-side redirect, auth endpoint, hypermedia auth,
Get Started replacement, nav auth area, auth state, fail-closed
Spec: specs/012-auth-static-integration/spec.md

---

## Import Impeccable Design Skills

Keywords: impeccable, design skills, import, adapt, fork, Apache 2.0, license, attribution,
NOTICE, pbakaus, frontend design, style, polish, critique, audit, animate, arrange, colorize,
typeset, clarify, delight, distill, harden, normalize, bolder, quieter, onboard, optimize,
overdrive, extract, design-prefix, skill namespace, DaisyUI adaptation, Tailwind adaptation
Spec: specs/013-import-design-skills/spec.md

---

## Guard Hook Hardening

Keywords: hook, guard, pre-tool-use, bash, destructive, blocked, git reset, git checkout,
git clean, git restore, rm -rf, git commit --amend, git merge --squash, git stash drop,
git stash clear, git branch -D, git add, wrangler, gh repo delete, command normalization,
safe pattern, whitelist, false positive, exit code, warning, advisory, DCG, PreToolUse,
dangerous command, force push, hook bypass, pre-commit
Spec: specs/014-guard-hook-hardening/spec.md

---

## How to Update This File

When adding a new spec via `/sp:01-specify`, the workflow updates this file automatically.
To update manually, append an entry using this format:

    ## Feature Name
    Keywords: kw1, kw2, kw3, ...  (10-20 terms: synonyms, related, tech, problems solved)
    Spec: specs/NNN-name/spec.md
