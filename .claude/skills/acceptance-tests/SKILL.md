---
name: acceptance-tests
description: >
  Writing GWT acceptance specs and binding generated stubs into executable tests.
  Use when creating new specs in specs/acceptance-specs/, binding generated acceptance
  test stubs, or troubleshooting acceptance pipeline failures.
triggers:
  - write spec
  - write acceptance test
  - bind acceptance test
  - GWT spec
  - acceptance stub
  - spec writing
---

# Acceptance Tests Skill

## Decision Tree

```
What do you need?
│
├─ Write a new spec file
│  → Section: Writing GWT Specs (below)
│  → Reference: references/gwt-writing-guide.md
│
├─ Bind a generated stub into a real test
│  → Section: Binding Generated Stubs (below)
│  → Reference: references/binding-patterns.md
│
├─ Run the acceptance pipeline
│  → Section: Pipeline Quick Reference (below)
│  → Skill: atdd (for full workflow details)
│
└─ Understand the TDD cycle around acceptance tests
   → Skill: atdd (ATDD cycle, ralph.sh integration)
   → Skill: typescript-unit-testing (inner Red-Green-Refactor loop)
```

## Writing GWT Specs

Specs live in `specs/acceptance-specs/` as plain text files using Given-When-Then format.

### File Naming

```
specs/acceptance-specs/US<N>-<kebab-case-title>.txt
```

One file per user story. The `US<N>` prefix must match the story number used in beads.

### Format

```
;=============================================
; Scenario: Description of the scenario
;=============================================
GIVEN some precondition.
WHEN an action occurs.
THEN an observable outcome.
```

- Separator lines: only `;` and `=` characters
- Description lines: start with `;` (but are not separators)
- Keywords: `GIVEN`, `WHEN`, `THEN` in ALL CAPS at line start
- Every step ends with a period
- Multiple scenarios per file are allowed (each gets its own separator block)

### Domain Language Discipline

Specs describe **what the user observes**, not how the system works internally.

**Good** — domain language:

```
GIVEN no registered users.
WHEN a user registers with email "bob@example.com" and password "secret123".
THEN there is 1 registered user.
THEN the user "bob@example.com" can log in.
```

**Bad** — implementation leakage:

```
GIVEN the D1 users table is empty.
WHEN a POST request is sent to /api/auth/register with JSON body.
THEN the database contains 1 row with hashed password.
```

Rules:

- No code identifiers (function names, types, packages, variable names)
- No infrastructure terms (D1, KV, SQL, HTTP, REST, endpoint, JSON, fetch)
- No internal architecture (handler, middleware, Worker, Hono, env binding)
- Use `/spec-check` to audit existing specs for leakage

See `references/gwt-writing-guide.md` for detailed examples and review checklist.

## Binding Generated Stubs

### Architecture

The acceptance pipeline generates test stubs with merge support:

```
specs/acceptance-specs/*.txt → parse → IR JSON → generate → generated-acceptance-tests/*.spec.ts
```

Generated stubs contain `throw new Error("acceptance test not yet bound")` — they are
scaffolds showing what needs to be tested. The pipeline **preserves bound
implementations** across regeneration: any `it()` block that does not contain the
unbound sentinel is kept as-is when stubs are regenerated.

**Edit generated files directly.** Replace `throw new Error("acceptance test not yet bound")`
with real test code. The pipeline will preserve your implementations on subsequent runs.
Use `just acceptance-regen` to force-regenerate all stubs (destroys bound implementations).

### Vitest-Pool-Workers Binding Pattern

Acceptance tests exercise the Worker as a black box via `SELF.fetch()`:

```typescript
import { env, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

// Author views all registered users.
// Source: specs/acceptance-specs/US01-register.txt:2
it('Author views all registered users.', async () => {
  // GIVEN two registered users exist.
  await env.DB.exec(`
    INSERT INTO users (email) VALUES ('alice@example.com'), ('bob@example.com')
  `);

  // WHEN the user lists all users.
  const res = await SELF.fetch(new Request('https://example.com/api/users'));

  // THEN the response shows both users.
  expect(res.status).toBe(200);
  const body = (await res.json()) as { users: Array<{ email: string }> };
  expect(body.users).toHaveLength(2);
});
```

Key points:

- `SELF.fetch(new Request(...))` — calls the Worker as a black box through its HTTP interface
- `env.DB.exec(...)` — sets up D1 state directly for GIVEN preconditions
- `expect(res.status)` and `await res.json()` — assert on observable HTTP behavior
- Each `it()` block maps to one scenario from the spec

See `references/binding-patterns.md` for HTTP patterns, database setup, and assertion strategies.

## Pipeline Quick Reference

| Action                                 | Command                    |
| -------------------------------------- | -------------------------- |
| Full pipeline (parse + generate + run) | `just acceptance`          |
| Parse specs to IR                      | `just acceptance-parse`    |
| Generate stubs from IR                 | `just acceptance-generate` |
| Run generated tests                    | `just acceptance-run`      |
| Unit + acceptance                      | `just test-all`            |
| Audit specs for leakage                | `/spec-check`              |

For full ATDD workflow, cycle management, and ralph.sh integration,
see the **atdd** skill.

## References

- `references/gwt-writing-guide.md` — Detailed spec writing craft, good/bad examples, review checklist
- `references/binding-patterns.md` — Code templates for binding stubs into executable tests
- **atdd** skill — ATDD workflow, pipeline details, ralph.sh outer loop
- **typescript-unit-testing** skill — TypeScript testing patterns, TDD micro/macro loops
