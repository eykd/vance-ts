# Claude Code Skills

This directory contains Claude Code skills that guide implementation patterns for the Turtlebased TypeScript codebase. Skills provide progressive disclosure of implementation patterns through decision trees and detailed reference files.

## Skill Organization

Each skill follows a consistent structure:

```
skill-name/
├── SKILL.md              # Decision tree and quick examples (<150 lines)
└── references/           # Detailed implementation guides
    ├── pattern-1.md
    ├── pattern-2.md
    └── ...
```

## How to Use Skills

Skills are invoked by Claude Code during implementation. You can explicitly request a skill in your prompts:

```
"Use the /structured-logging skill to add logging to this Worker"
"Apply the /log-categorization skill to determine the log category"
"Use /pii-redaction to implement data protection"
```

Skills can also be activated automatically by Claude when it detects relevant context.

## Available Skills

### Logging & Tracing

**[structured-logging](./structured-logging/SKILL.md)**

- **Use when:** Adding structured logging to Cloudflare Workers with request correlation and environment-aware redaction
- **Provides:** SafeLogger class, AsyncLocalStorage context patterns, BaseLogFields schema, event naming conventions, logger factory
- **Cross-references:** log-categorization, pii-redaction, cloudflare-observability

**[log-categorization](./log-categorization/SKILL.md)**

- **Use when:** Determining whether logs belong to domain, application, or infrastructure layers following Clean Architecture
- **Provides:** Decision matrix, domain/application/infrastructure logging patterns, required fields by category
- **Cross-references:** structured-logging, cloudflare-observability

**[pii-redaction](./pii-redaction/SKILL.md)**

- **Use when:** Implementing systematic PII and secret redaction for defense-in-depth data protection
- **Provides:** Sensitive pattern regex, field detection, redaction functions, URL sanitization
- **Cross-references:** structured-logging

**[sentry-integration](./sentry-integration/SKILL.md)**

- **Use when:** Integrating Sentry for rich error tracking with breadcrumbs and context
- **Provides:** withSentry wrapper configuration, context management, breadcrumb patterns, error capture
- **Cross-references:** structured-logging, pii-redaction

**[testing-observability](./testing-observability/SKILL.md)**

- **Use when:** Writing tests for logging implementation including logger behavior and redaction correctness
- **Provides:** Logger unit test patterns, redaction validation tests, Miniflare integration tests
- **Cross-references:** typescript-unit-testing, vitest-cloudflare-config

### Observability

**[cloudflare-observability](./cloudflare-observability/SKILL.md)**

- **Use when:** Defining SLOs, adding request timing/metrics, implementing health endpoints, tracking errors, integrating with Analytics Engine
- **Provides:** SLO tracking, request timing patterns, error categorization, health check implementations, Analytics Engine integration
- **Cross-references:** typescript-unit-testing, vitest-cloudflare-config

### Testing

**[typescript-unit-testing](./typescript-unit-testing/SKILL.md)**

- **Use when:** Writing new unit tests, implementing TDD workflows, creating mocks, debugging test failures
- **Provides:** Vitest and Jest patterns, test doubles, TDD workflows, test design principles

**[vitest-cloudflare-config](./vitest-cloudflare-config/SKILL.md)**

- **Use when:** Setting up vitest for Workers projects, configuring D1/KV bindings, creating test helpers
- **Provides:** vitest-pool-workers configuration, binding setup, migration configuration, test helpers

**[vitest-integration-testing](./vitest-integration-testing/SKILL.md)**

- **Use when:** Testing boundaries (database, APIs, queues), writing acceptance tests for user workflows
- **Provides:** Integration test patterns, test fixture setup, transaction rollback strategies

### Domain-Driven Design

**[ddd-domain-modeling](./ddd-domain-modeling/SKILL.md)**

- **Use when:** Building domain entities with validation, creating value objects, defining repository interfaces
- **Provides:** Entity patterns, value object implementations, domain service patterns, repository interfaces

**[clean-architecture-validator](./clean-architecture-validator/SKILL.md)**

- **Use when:** Reviewing code for architecture compliance, finding dependency violations, validating layer boundaries
- **Provides:** Dependency violation detection, layer boundary validation, interface placement rules

### Cloudflare Workers Patterns

**[worker-request-handler](./worker-request-handler/SKILL.md)**

- **Use when:** Creating route handlers for pages/partials, extracting form/query data, connecting handlers to use cases
- **Provides:** Request handler patterns, form data extraction, HX-Trigger headers, middleware patterns

**[cloudflare-use-case-creator](./cloudflare-use-case-creator/SKILL.md)**

- **Use when:** Creating use cases in application layer, defining DTOs, wiring repositories to use cases
- **Provides:** Use case implementation patterns, DTO definitions, repository wiring, CRUD operations

**[d1-repository-implementation](./d1-repository-implementation/SKILL.md)**

- **Use when:** Implementing D1 repositories for Clean Architecture, writing D1 migration files, setting up type-safe queries
- **Provides:** Repository implementations, D1 query patterns, migration files, error handling

**[kv-session-management](./kv-session-management/SKILL.md)**

- **Use when:** Implementing user sessions with KV, creating cache layers, setting up TTL/expiration strategies
- **Provides:** Session storage patterns, cache implementations, TTL strategies, JSON serialization

**[portable-datetime](./portable-datetime/SKILL.md)**

- **Use when:** Working with dates/times that must work across timezones, storing timestamps in databases
- **Provides:** UTC storage patterns, timezone-aware display, timezone-independent tests

**[cloudflare-project-scaffolding](./cloudflare-project-scaffolding/SKILL.md)**

- **Use when:** Creating a new Cloudflare Workers project with HTMX + Alpine.js + TailwindCSS 4 + DaisyUI 5
- **Provides:** Project scaffolding, DDD/Clean Architecture layers, Vitest configuration

**[cloudflare-migrations](./cloudflare-migrations/SKILL.md)**

- **Use when:** Creating D1 migration files, handling schema changes safely, seeding development/testing data
- **Provides:** Migration file patterns, schema change strategies, seed data patterns

### Hugo + Cloudflare Pages

**[hugo-templates](./hugo-templates/SKILL.md)**

- **Use when:** Creating Hugo layouts with HTMX integration, building partials for dynamic content, writing shortcodes with Alpine.js state
- **Provides:** Base layouts, content templates, partials, shortcodes, HTMX integration patterns
- **Cross-references:** htmx-pattern-library, tailwind-daisyui-design, hypermedia-pattern-advisor

**[typescript-html-templates](./typescript-html-templates/SKILL.md)**

- **Use when:** Creating TypeScript HTML response functions, implementing escapeHtml utilities, building template literals for HTMX partials
- **Provides:** Template functions, HTML escaping, HX-Trigger headers, error responses, response patterns
- **Cross-references:** worker-request-handler, tailwind-daisyui-design, htmx-pattern-library

**[hugo-project-setup](./hugo-project-setup/SKILL.md)**

- **Use when:** Creating a new Hugo + Cloudflare Pages project, setting up directory structure, configuring hugo.toml with HTMX endpoints
- **Provides:** Directory layout, Hugo configuration, Wrangler configuration, build pipeline, development workflow
- **Cross-references:** cloudflare-project-scaffolding, vitest-cloudflare-config, hugo-templates

**[static-first-routing](./static-first-routing/SKILL.md)**

- **Use when:** Understanding CDN vs Pages Functions routing, configuring URL structure, deciding which requests need dynamic handling
- **Provides:** Request flow diagrams, path conventions, static vs dynamic decision matrix, /app/\_/\* patterns
- **Cross-references:** worker-request-handler, cloudflare-project-scaffolding, hugo-project-setup

**[hugo-search-indexing](./hugo-search-indexing/SKILL.md)**

- **Use when:** Building search from Hugo markdown content, populating D1 search tables, implementing FTS5 full-text search
- **Provides:** Build scripts for index generation, D1 schema with FTS5, search handler patterns, deployment commands
- **Cross-references:** d1-repository-implementation, cloudflare-migrations, typescript-html-templates

**[hugo-copywriting](./hugo-copywriting/SKILL.md)**

- **Use when:** Analyzing existing Hugo content for style compliance, writing new Hugo content with style guidance, choosing/documenting style guides, evaluating configuration copy, analyzing readability metrics, providing suggestions to match copywriter voice presets
- **Provides:** Readability analysis (Flesch-Kincaid), reading time estimation, 10 copywriter style presets, 6 style guide references, advisory mode guidance, hugo/CLAUDE.md integration
- **Cross-references:** hugo-templates, frontend-design, tailwind-daisyui-design, daisyui-design-system-generator

### Frontend & UI

**[htmx-pattern-library](./htmx-pattern-library/SKILL.md)**

- **Use when:** Building forms with validation, infinite scroll, search with debouncing, out-of-band updates
- **Provides:** HTMX interaction patterns, loading states, optimistic UI, modal/dropdown patterns

**[htmx-alpine-templates](./htmx-alpine-templates/SKILL.md)**

- **Use when:** Creating HTML layouts/pages/partials, adding HTMX interactivity, implementing Alpine.js components
- **Provides:** Template patterns, HTMX integration, Alpine.js components, DaisyUI usage

**[tailwind-daisyui-design](./tailwind-daisyui-design/SKILL.md)**

- **Use when:** Building accessible UI components/layouts, choosing DaisyUI components, implementing typography
- **Provides:** Accessible component patterns, DaisyUI component selection, typography for readability

**[daisyui-design-system-generator](./daisyui-design-system-generator/SKILL.md)**

- **Use when:** Creating WCAG AAA-compliant DaisyUI 5 color themes, generating OKLCH color palettes
- **Provides:** Theme generation, color palette creation, accessible contrast ratios

**[hypermedia-pattern-advisor](./hypermedia-pattern-advisor/SKILL.md)**

- **Use when:** Deciding HTMX vs Alpine.js for interactions, selecting hx-trigger strategies, choosing swap strategies
- **Provides:** Interaction pattern selection, trigger strategies, swap strategies, troubleshooting

### Multi-Tenant Boundaries

**[org-authorization](./org-authorization/SKILL.md)**

- **Use when:** Implementing authorization checks, defining Actor/Action/Resource types, building AuthorizationService
- **Provides:** Core authorization types, AuthorizationService implementation, ownership/admin/system patterns
- **Cross-references:** security-review, ddd-domain-modeling, org-isolation, org-membership

**[org-isolation](./org-isolation/SKILL.md)**

- **Use when:** Auditing tenant isolation, implementing query scoping, writing cross-tenant tests
- **Provides:** TenantScopedDb wrapper, audit checklist, cross-tenant test patterns
- **Cross-references:** d1-repository-implementation, org-authorization, org-testing

**[org-data-model](./org-data-model/SKILL.md)**

- **Use when:** Choosing data model complexity level, planning schema evolution from single-user to enterprise
- **Provides:** Four-stage schema evolution (single-user → collaborators → organizations → resource-perms)
- **Cross-references:** cloudflare-migrations, ddd-domain-modeling, org-membership

**[org-membership](./org-membership/SKILL.md)**

- **Use when:** Implementing membership management, defining role hierarchies, preventing privilege escalation
- **Provides:** Role hierarchy (owner > admin > member > viewer), privilege escalation prevention, invite/remove/transfer
- **Cross-references:** org-authorization, security-review, org-data-model

**[org-testing](./org-testing/SKILL.md)**

- **Use when:** Testing authorization logic, writing tenant isolation tests, creating multi-tenant fixtures
- **Provides:** Policy unit tests, integration tests, acceptance tests for tenant isolation
- **Cross-references:** typescript-unit-testing, vitest-integration-testing, org-isolation

**[org-migration](./org-migration/SKILL.md)**

- **Use when:** Migrating from single-user to multi-tenant, planning organization rollout strategy
- **Provides:** Shadow organizations, feature flags for rollout, database backfill scripts
- **Cross-references:** cloudflare-migrations, kv-session-management, org-data-model

### Security & Quality

**[code-review](./code-review/SKILL.md)**

- **Use when:** Reviewing code before committing, evaluating staged changes, reviewing PR or branch changes, getting feedback on implementation quality, assessing test coverage and quality
- **Provides:** Structured code review covering what changed, correctness, simplicity, test quality, security, and actionable recommendations
- **Cross-references:** security-review, typescript-unit-testing

**[security-review](./security-review/SKILL.md)**

- **Use when:** Reviewing code for security issues, auditing authentication/session handling, checking for vulnerabilities
- **Provides:** Security vulnerability detection, authentication review, XSS/CSRF/SQL injection checks

**[latent-features](./latent-features/SKILL.md)**

- **Use when:** Defining feature specs, planning implementations, implementing authentication/sessions, security-sensitive features
- **Provides:** Progressive disclosure of security patterns, architectural best practices, OWASP-compliant implementations

**[prefactoring](./prefactoring/SKILL.md)**

- **Use when:** Designing systems/modules, creating types/abstractions, naming and structuring code, defining interfaces/contracts, planning error handling
- **Provides:** Ken Pugh's prefactoring principles with TypeScript examples, decision trees for design choices, anti-pattern detection
- **Cross-references:** ddd-domain-modeling, clean-architecture-validator, typescript-unit-testing

### Git & Deployment

**[commit](./commit/SKILL.md)**

- **Use when:** Committing session changes, creating conventional commits, handling pre-commit hook failures
- **Provides:** Commit workflows, hook handling, conventional commit patterns

**[deploy-your-app](./deploy-your-app/SKILL.md)**

- **Use when:** First-time production deployment, setting up Cloudflare Workers/D1/R2/KV, configuring Resend/Sentry
- **Provides:** Deployment guides, service configuration, troubleshooting, cost information

## Skill Invocation Patterns

### Explicit Invocation

Reference a skill directly in your prompt:

```
"Use /structured-logging to add a logger to this Worker"
"Apply /pii-redaction patterns to this log statement"
"Use /log-categorization to determine where this log belongs"
```

### Context-Based Activation

Claude automatically detects when skills are relevant:

- Adding logs → structured-logging, log-categorization
- Implementing security → pii-redaction, security-review
- Writing tests → typescript-unit-testing, testing-observability
- Building UI → htmx-pattern-library, tailwind-daisyui-design
- Database work → d1-repository-implementation, cloudflare-migrations
- Design decisions → prefactoring, ddd-domain-modeling, clean-architecture-validator

### Skill Chains

Skills often reference related skills. Following these references creates implementation chains:

**Logging Chain:**

```
structured-logging → log-categorization → pii-redaction → sentry-integration → testing-observability
```

**DDD Chain:**

```
ddd-domain-modeling → cloudflare-use-case-creator → d1-repository-implementation → clean-architecture-validator
```

**Testing Chain:**

```
vitest-cloudflare-config → typescript-unit-testing → testing-observability → vitest-integration-testing
```

**Multi-Tenant Chain:**

```
org-authorization → org-isolation → org-data-model → org-membership → org-testing → org-migration
```

## Recent Refactorings

### January 2026: Skills Library Token Efficiency Improvements

**Multi-Tenant SaaS Consolidation:**

- Consolidated 6 org-\* skills (org-authorization, org-data-model, org-isolation, org-membership, org-migration, org-testing) into a single latent-feature pattern
- New location: `latent-features/reference/multi-tenant-saas/`
- Result: 50-60% token reduction for focused implementation workflows
- Pattern includes: Authorization (Actor/Action/Resource), data model evolution (4 stages), tenant isolation, membership management, testing strategies

**Progressive Disclosure Refactorings:**

- **hugo-copywriting**: Reduced from 460 → 157 lines (66% reduction)
- **portable-datetime**: Reduced from 457 → 133 lines (71% reduction)
- Both skills now route users to detailed reference files based on their task

**HTMX Skills Duplication Reduction:**

- Eliminated duplicate content across hypermedia-pattern-advisor, htmx-pattern-library, and htmx-alpine-templates
- Established single sources of truth for each topic
- Added clear cross-reference workflow between skills
- Total reduction: 62 lines across 3 skills

**Migration Notes:**

- See `.claude/skills/MIGRATION.md` for guidance on finding content from old org-\* skills
- All content preserved in new locations with improved organization
- Multi-tenant chain updated: latent-features/multi-tenant-saas pattern replaces 6 org-\* skills

---

## Progressive Disclosure

Skills use progressive disclosure to prevent token overload:

1. **SKILL.md**: Quick decision tree and minimal examples (<150 lines)
2. **references/**: Detailed implementation guides with complete code examples
3. **Cross-references**: Related skills for comprehensive implementation

This structure ensures you get just enough information at each step without overwhelming context.

## Skill Development

Skills are created following the patterns in `specs/003-logging-tracing-skills/contracts/`:

- **skill-template.md**: Template for SKILL.md decision trees
- **reference-template.md**: Template for detailed reference files

All skills follow Clean Architecture, TDD practices, and Cloudflare Workers best practices.
