---
name: atdd
description: Acceptance Test-Driven Development workflow with GWT specs, acceptance pipeline, and two-stream testing
triggers:
  - acceptance test
  - GWT spec
  - ATDD
  - acceptance criteria
  - Given When Then
---

# ATDD Workflow

Acceptance Test-Driven Development (ATDD) adds an outer acceptance test loop around the inner
Red-Green-Refactor TDD cycle. This ensures implementations satisfy observable behavior
requirements, not just unit-level correctness.

## Two Test Streams

| Stream           | Purpose              | Location                      | Scope                         |
| ---------------- | -------------------- | ----------------------------- | ----------------------------- |
| Acceptance tests | WHAT the system does | `generated-acceptance-tests/` | User-observable HTTP behavior |
| Unit tests       | HOW it does it       | Alongside production code     | Internal correctness          |

## GWT Spec Format

Specs live in `specs/acceptance-specs/` as `.txt` files:

```text
;===============================================================
; User can register with email and password.
;===============================================================
GIVEN no registered users.

WHEN a user registers with email "bob@example.com" and password "secret123".

THEN there is 1 registered user.
THEN the user "bob@example.com" can log in.
```

### Rules

- One file per user story: `specs/acceptance-specs/US<N>-<kebab-title>.txt`
- Domain language ONLY — no code, infrastructure, or framework terms
- A non-developer must understand every statement
- Committed to git (specs are the source of truth)
- Run `/spec-check` to audit for implementation leakage

## Acceptance Pipeline

The pipeline transforms GWT specs into executable Vitest tests:

```
specs/acceptance-specs/*.txt  →  parse  →  IR JSON  →  generate  →  Vitest spec files
```

### Commands

| Command                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `just acceptance`          | Full pipeline: parse, generate, run             |
| `just acceptance-parse`    | Parse `specs/acceptance-specs/*.txt` to IR JSON |
| `just acceptance-generate` | Generate Vitest tests from IR                   |
| `just acceptance-run`      | Run generated acceptance tests                  |
| `just test-all`            | Run both unit and acceptance tests              |

### Pipeline CLI

```bash
npx tsx acceptance/pipeline.ts --action=parse     # specs → IR
npx tsx acceptance/pipeline.ts --action=generate  # IR → tests
npx tsx acceptance/pipeline.ts --action=run       # parse + generate + run
```

## ATDD Cycle Structure

```
execute_atdd_cycle(task):
    spec = find_spec_for_task(task)  # specs/acceptance-specs/US<N>-*.txt

    if no spec found:
        fall back to unit TDD cycle  # backward compatible

    # Check if acceptance tests already pass
    if acceptance tests PASS: close task, done

    # BIND: write acceptance test implementations from spec
    BIND: replace throw new Error("...") stubs with real SELF.fetch() test code

    # Inner TDD loop (up to 15 cycles)
    for each inner cycle:
        RED:      write smallest failing unit test
        GREEN:    write minimal code to pass
        REFACTOR: improve without changing behavior

        # Check acceptance after each inner cycle
        if acceptance tests PASS: close task, done

    # Exhausted: mark BLOCKED
```

### Key principles

- Acceptance tests define DONE — not LLM judgment
- BIND step writes test implementations before inner TDD starts
- Each inner cycle makes the smallest possible change
- Tasks without specs fall back to standard TDD (backward compatible)
- Inner cycle limit is 15 (vs 5 for pure TDD) to allow incremental progress
- The pipeline preserves bound test implementations across regeneration

## Spec Guardian

The spec-guardian agent audits specs for implementation leakage:

- Run with `/spec-check` or `/spec-check specs/acceptance-specs/US1-add-item.txt`
- Checks for code references, infrastructure terms, framework language, etc.
- Outputs a table of findings with suggested rewrites

## Task-to-Spec Linkage

Tasks with `US<N>` in their title (e.g. `US03: View the list`) are automatically linked
to `specs/acceptance-specs/US<N>-*.txt` by `ralph.sh`. Tasks without a `US<N>` prefix
use the standard TDD cycle without acceptance testing.
