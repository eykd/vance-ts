---
name: vitest-integration-testing
description: "Write effective integration and acceptance tests in TypeScript using Vitest. Use when: (1) Writing tests that verify boundaries (database, APIs, queues) in TypeScript/Node.js, (2) Writing acceptance tests for complete user workflows, (3) Setting up test fixtures for real infrastructure with Vitest, (4) Testing Express/Fastify/NestJS applications end-to-end, (5) Questions about database transaction rollback, HTTP test clients (supertest), or fixture patterns. Incorporates Kent Beck's Test Desiderata and GOOS (Growing Object-Oriented Software) principles. For pure unit tests without infrastructure, standard Vitest mocking applies."
---

# Effective Integration & Acceptance Testing with Vitest

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
    ├── fixtures.ts                # Database fixtures
    └── helpers.ts                 # Test utilities
```

## File Naming Conventions

- `*.spec.ts` — Unit tests (fast, isolated, no I/O)
- `*.integration.test.ts` — Tests ONE boundary with real infrastructure
- `*.acceptance.test.ts` — End-to-end user workflow tests

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
    coverage: {
      provider: 'v8',
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    },
  },
});
```

## Given-When-Then Structure (Mandatory)

Every integration/acceptance test must follow this pattern:

```typescript
it('persists order with line items', async () => {
  // Given: Initial state
  const order = Order.create({
    customerId: 'customer-1',
    items: [{ productId: 'product-1', quantity: 2, price: 10 }],
  });

  // When: Execute the action
  await repository.save(order);
  const loaded = await repository.findById(order.orderId);

  // Then: Assert outcomes
  expect(loaded).toBeDefined();
  expect(loaded?.items).toHaveLength(1);
});
```

## Integration Tests

### What They Test

- **Persistence adapters**: Real ORM against real/test DB
- **HTTP adapters**: Your code's outbound HTTP calls
- **Message adapters**: Publish/consume with test broker

### What They Must NOT Do

- Test entire user workflows (that's acceptance)
- Mock the boundary being tested
- Re-test domain logic covered by unit tests

### Database Integration Pattern

```typescript
// src/adapters/PostgresOrderRepository.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgresOrderRepository } from './PostgresOrderRepository';
import { createTestDatabase, cleanDatabase } from '../test/helpers';

describe('PostgresOrderRepository Integration', () => {
  let repository: PostgresOrderRepository;
  let database: Database;

  beforeAll(async () => {
    database = await createTestDatabase();
    repository = new PostgresOrderRepository(database);
    await database.runMigrations();
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    await cleanDatabase(database); // Isolation
  });

  it('saves and retrieves order', async () => {
    // Given
    const order = Order.create({
      customerId: 'customer-1',
      items: [{ productId: 'product-1', quantity: 2, price: 10 }],
    });

    // When
    await repository.save(order);
    const retrieved = await repository.findById(order.orderId);

    // Then
    expect(retrieved?.orderId).toBe(order.orderId);
    expect(retrieved?.items).toHaveLength(1);
  });

  it('returns null for non-existent order', async () => {
    const result = await repository.findById('non-existent');
    expect(result).toBeNull();
  });
});
```

### HTTP Client Integration (Mock Server)

```typescript
// src/adapters/PaymentClient.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PaymentClient } from './PaymentClient';
import { createMockServer } from '../test/helpers/mockServer';

describe('PaymentClient Integration', () => {
  let client: PaymentClient;
  let mockServer: MockServer;

  beforeAll(async () => {
    mockServer = await createMockServer(3001);
    client = new PaymentClient({ baseUrl: 'http://localhost:3001' });
  });

  afterAll(async () => {
    await mockServer.close();
  });

  it('handles successful charge', async () => {
    // Given
    mockServer.expectPost('/payments', {
      response: { status: 200, body: { id: 'pay_123', status: 'success' } },
    });

    // When
    const result = await client.charge({ amount: 1000, token: 'tok_visa' });

    // Then
    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('pay_123');
  });

  it('handles declined payment', async () => {
    mockServer.expectPost('/payments', {
      response: { status: 402, body: { error: 'card_declined' } },
    });

    const result = await client.charge({ amount: 1000, token: 'tok_declined' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('card_declined');
  });
});
```

## Acceptance Tests

### What They Test

- Complete user workflows via HTTP
- Real routing, middleware, validation
- User-visible behavior and outcomes

### What They Must NOT Do

- Call controllers/services directly (use HTTP client)
- Mock framework internals
- Assert on implementation details

### Express/Fastify Acceptance Pattern

```typescript
// src/api/orders.acceptance.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { createTestDatabase, cleanDatabase } from '../test/helpers';

describe('Orders API', () => {
  let app: Application;
  let database: Database;

  beforeAll(async () => {
    database = await createTestDatabase();
    app = createApp(database);
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    await cleanDatabase(database);
  });

  it('creates order with valid data', async () => {
    // Given
    await database.insert('customers', { id: 'cust-1', name: 'John' });
    await database.insert('products', { id: 'prod-1', price: 10, stock: 100 });

    // When
    const response = await request(app)
      .post('/api/orders')
      .send({
        customerId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 2 }],
      })
      .expect(201);

    // Then
    expect(response.body).toMatchObject({
      orderId: expect.stringMatching(/^order-/),
      status: 'confirmed',
      totalAmount: 20,
    });

    // Verify persistence
    const order = await database.findOne('orders', { id: response.body.orderId });
    expect(order).toBeDefined();
  });

  it('returns 400 for invalid customer', async () => {
    await request(app)
      .post('/api/orders')
      .send({ customerId: 'non-existent', items: [] })
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toContain('Customer not found');
      });
  });
});
```

## Test Data Builders

```typescript
// src/test/builders.ts
export class OrderBuilder {
  private props = {
    orderId: `order-${Date.now()}`,
    customerId: 'customer-1',
    items: [{ productId: 'product-1', quantity: 1, price: 10 }],
    status: 'pending' as const,
  };

  withCustomerId(customerId: string): this {
    this.props.customerId = customerId;
    return this;
  }

  withItem(productId: string, quantity: number, price: number): this {
    this.props.items.push({ productId, quantity, price });
    return this;
  }

  withStatus(status: OrderStatus): this {
    this.props.status = status;
    return this;
  }

  build(): Order {
    return Order.create(this.props);
  }
}

// Usage
const order = new OrderBuilder()
  .withCustomerId('vip-customer')
  .withItem('widget', 2, 25)
  .withStatus('confirmed')
  .build();
```

## Factory Fixtures

```typescript
// src/test/fixtures.ts
export async function createTestOrder(
  database: Database,
  overrides?: Partial<OrderData>
): Promise<Order> {
  const data = {
    orderId: `order-${Date.now()}`,
    customerId: 'customer-1',
    items: [{ productId: 'product-1', quantity: 1, price: 10 }],
    status: 'pending',
    ...overrides,
  };

  await database.insert('orders', data);
  return Order.create(data);
}
```

## Test Desiderata Applied

| Property          | Integration Test Application                       |
| ----------------- | -------------------------------------------------- |
| **Isolated**      | Clean DB per test; no shared mutable state         |
| **Deterministic** | Fixed timestamps; seeded random; no real clocks    |
| **Fast**          | Connection pooling; parallel-safe schema           |
| **Predictive**    | Real infrastructure = better production prediction |
| **Specific**      | One boundary per test file                         |

## Handling Time in Tests

```typescript
// Inject clock abstraction
interface Clock {
  now(): Date;
}

class FixedClock implements Clock {
  constructor(private readonly fixedTime: Date) {}
  now(): Date {
    return this.fixedTime;
  }
}

// Usage in tests
it('marks orders as expired after 30 days', () => {
  const now = new Date('2024-01-31');
  const clock = new FixedClock(now);
  const checker = new OrderExpiryChecker(clock);

  const order = createOrder({ date: new Date('2024-01-01') });

  expect(checker.isExpired(order)).toBe(true);
});
```

## Anti-Patterns

| Anti-Pattern                      | Problem                 | Solution                      |
| --------------------------------- | ----------------------- | ----------------------------- |
| Mocking the boundary              | Tests nothing           | Use real infrastructure       |
| Domain logic in integration tests | Duplicates unit tests   | Test only adapter behavior    |
| Shared test data                  | Test interdependence    | Factory fixtures, clean DB    |
| Testing call order                | Brittle, over-specified | Assert outcomes, not sequence |
| Giant setup fixtures              | Hard to understand      | Compose small builders        |

## Don't Mock What You Don't Own

Wrap third-party libraries in your own adapter, then mock YOUR interface:

```typescript
// Define your interface
interface PaymentGateway {
  charge(amount: number, token: string): Promise<PaymentResult>;
}

// Implement adapter for Stripe (or any provider)
class StripePaymentGateway implements PaymentGateway {
  constructor(private stripe: Stripe) {}
  async charge(amount: number, token: string): Promise<PaymentResult> {
    const result = await this.stripe.charges.create({ amount, source: token });
    return { transactionId: result.id, success: true };
  }
}

// In unit tests: mock YOUR interface
const mockGateway: PaymentGateway = {
  charge: vi.fn().mockResolvedValue({ transactionId: 'txn-123', success: true }),
};

// In integration tests: test YOUR adapter against real/test Stripe
describe('StripePaymentGateway Integration', () => {
  it('charges via Stripe test API', async () => {
    const gateway = new StripePaymentGateway(new Stripe(TEST_KEY));
    const result = await gateway.charge(1000, 'tok_visa');
    expect(result.transactionId).toMatch(/^ch_/);
  });
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

## package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run src/**/*.spec.ts",
    "test:integration": "vitest run src/**/*.integration.test.ts",
    "test:acceptance": "vitest run src/**/*.acceptance.test.ts",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Detailed References

For deeper guidance, consult these reference files:

- **[database-testing.md](references/database-testing.md)**: Complete patterns for DB integration tests with transaction rollback
- **[http-testing.md](references/http-testing.md)**: Testing HTTP adapters and acceptance tests with supertest
