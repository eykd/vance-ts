---
name: vitest-integration-testing
description: 'Use when: (1) testing boundaries (database, APIs, queues), (2) writing acceptance tests for user workflows, (3) setting up test fixtures with real infrastructure, (4) questions about transaction rollback or HTTP test clients. For pure unit tests, use typescript-unit-testing skill instead.'
---

# Integration & Acceptance Testing with Vitest

## Test Type Distinction

| Type            | Purpose                     | Entry Point        | Infrastructure                 |
| --------------- | --------------------------- | ------------------ | ------------------------------ |
| **Unit**        | Single function/class logic | Direct call        | None (mocked)                  |
| **Integration** | Boundary verification       | Adapter/repository | Real (test DB, mock HTTP)      |
| **Acceptance**  | User workflow end-to-end    | HTTP client        | Real (DB, routing, middleware) |

## Directory Structure

```
src/
├── domain/
│   └── Order.spec.ts              # Unit tests next to source
├── adapters/
│   └── OrderRepository.integration.test.ts
├── api/
│   └── OrderController.acceptance.test.ts
└── test/
    ├── setup.ts                   # Global setup
    ├── builders.ts                # Test data builders
    └── fixtures.ts                # Database fixtures
```

## File Naming

- `*.spec.ts` — Unit tests (fast, isolated, no I/O)
- `*.integration.test.ts` — Tests ONE boundary with real infrastructure
- `*.acceptance.test.ts` — End-to-end user workflow tests

## Given-When-Then Structure (Mandatory)

```typescript
it('persists order with line items', async () => {
  // Given: Initial state
  const order = Order.create({ customerId: 'customer-1', items: [...] });

  // When: Execute the action
  await repository.save(order);
  const loaded = await repository.findById(order.orderId);

  // Then: Assert outcomes
  expect(loaded).toBeDefined();
  expect(loaded?.items).toHaveLength(1);
});
```

## Quick Decision Guide

**"Integration or acceptance?"**

- Tests ONE adapter/boundary → Integration
- Tests complete user workflow via HTTP → Acceptance

**"Should I use real DB?"**

- Integration test for persistence → Yes
- Unit test for domain logic → No

**"Why is my test flaky?"**

- Check: time dependencies, random IDs, test order, external calls, shared state

## Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['./src/test/setup.ts'],
    mockReset: true,
    restoreMocks: true,
    sequence: { shuffle: true }, // Catch order dependencies
  },
});
```

## Package Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run src/**/*.spec.ts",
    "test:integration": "vitest run src/**/*.integration.test.ts",
    "test:acceptance": "vitest run src/**/*.acceptance.test.ts"
  }
}
```

## Detailed References

- **[patterns.md](references/patterns.md)** — Database integration, HTTP client, acceptance test patterns, test data builders, factory fixtures, time handling
- **[database-testing.md](references/database-testing.md)** — Complete DB patterns with transaction rollback
- **[http-testing.md](references/http-testing.md)** — HTTP adapters and supertest patterns
