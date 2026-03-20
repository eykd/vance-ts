# Implementation Tasks: Auth-Static Site Integration

**Epic**: `turtlebased-ts-bjd` | **Implement**: `turtlebased-ts-bjd.6`
**Generated**: 2026-03-13

## Task Summary

| ID    | US    | Title                                                        | Priority | Labels           | Deps        |
| ----- | ----- | ------------------------------------------------------------ | -------- | ---------------- | ----------- |
| .6.1  | US1   | Write GWT acceptance spec for static auth links              | P1       | spec, acceptance | —           |
| .6.2  | US1   | Remove buttons menu and add x-cloak CSS rule                 | P1       | hugo             | —           |
| .6.3  | US1+3 | Replace header buttons loop with Alpine.js auth-aware navbar | P1       | hugo, alpine     | .6.2        |
| .6.4  | US2   | Write GWT acceptance spec for client-side auth status check  | P1       | spec, acceptance | —           |
| .6.5  | US2   | TDD indicator cookie functions in cookieBuilder              | P1       | tdd, typescript  | —           |
| .6.6  | US2   | Set/clear indicator cookie in AuthPageHandlers               | P1       | tdd, typescript  | .6.5        |
| .6.7  | US2   | Create Alpine.js auth store and load site-wide               | P1       | hugo, alpine     | —           |
| .6.8  | US3   | Write GWT acceptance spec for authenticated navbar swap      | P2       | spec, acceptance | —           |
| .6.9  | US4   | Write GWT acceptance spec for dashboard auth guard           | P2       | spec, acceptance | —           |
| .6.10 | US4   | TDD add 'dashboard' to redirect allowlist                    | P2       | tdd, typescript  | —           |
| .6.11 | US4   | Create Hugo dashboard page with client-side auth guard       | P2       | hugo, alpine     | .6.7, .6.10 |

## Dependency Graph

```
US1 (P1):  .6.1 (spec)    .6.2 (menu/CSS) → .6.3 (header refactor)
US2 (P1):  .6.4 (spec)    .6.5 (cookie TDD) → .6.6 (handlers)    .6.7 (Alpine store)
US3 (P2):  .6.8 (spec)    [implementation in .6.3]
US4 (P2):  .6.9 (spec)    .6.10 (redirect TDD) → .6.11 (dashboard page)
                           .6.7 (Alpine store)  → .6.11 (dashboard page)
```

## Implementation Order (suggested)

### Phase 1 — Parallel starts (P1)

- `.6.1` GWT spec US1 (independent)
- `.6.4` GWT spec US2 (independent)
- `.6.5` TDD cookie builder (independent)
- `.6.7` Alpine.js auth store (independent)
- `.6.2` Remove buttons menu + x-cloak (independent)

### Phase 2 — Depends on Phase 1

- `.6.6` AuthPageHandlers indicator cookie (after .6.5)
- `.6.3` Header refactor with Alpine auth-aware navbar (after .6.2)

### Phase 3 — P2 items

- `.6.8` GWT spec US3 (independent)
- `.6.9` GWT spec US4 (independent)
- `.6.10` TDD redirect allowlist (independent)

### Phase 4 — Depends on Phase 3

- `.6.11` Dashboard page with auth guard (after .6.7 + .6.10)

## Skills Referenced

- `/acceptance-tests` — GWT spec writing (.6.1, .6.4, .6.8, .6.9)
- `/glossary` — domain terminology (.6.1, .6.4, .6.5, .6.8, .6.9)
- `/typescript-unit-testing` — TDD workflow (.6.5, .6.6, .6.10)
- `/prefactoring` — design decisions (.6.3, .6.5)
- `/hugo-templates` — Hugo layout changes (.6.2, .6.3, .6.7, .6.11)
- `/htmx-alpine-templates` — Alpine.js integration (.6.3, .6.7, .6.11)
- `/error-handling-patterns` — sign-out error paths (.6.6)

## Red Team Findings Addressed

Tasks incorporate mitigations from plan.md red team review:

- **Optional chaining** (`$store.auth?.isAuthenticated`) in .6.3 and .6.11
- **Sign-out all-branches clear** in .6.6
- **Meta robots noindex** in .6.11
- **Script defer comment** in .6.7
- **Store namespace collision comment** in .6.7
- **Cookie Max-Age alignment comment** in .6.5
- **303 redirect atomicity comment** in .6.6
- **Sign-up no-indicator assumption comment** in .6.6
- **CLS min-w class** in .6.3
