# Integration & Acceptance Test Patterns

## Database Integration Pattern

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

## HTTP Client Integration (Mock Server)

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

## Express/Fastify Acceptance Pattern

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

## Anti-Patterns

| Anti-Pattern                      | Problem                 | Solution                      |
| --------------------------------- | ----------------------- | ----------------------------- |
| Mocking the boundary              | Tests nothing           | Use real infrastructure       |
| Domain logic in integration tests | Duplicates unit tests   | Test only adapter behavior    |
| Shared test data                  | Test interdependence    | Factory fixtures, clean DB    |
| Testing call order                | Brittle, over-specified | Assert outcomes, not sequence |
| Giant setup fixtures              | Hard to understand      | Compose small builders        |

## Test Desiderata Applied

| Property          | Integration Test Application                       |
| ----------------- | -------------------------------------------------- |
| **Isolated**      | Clean DB per test; no shared mutable state         |
| **Deterministic** | Fixed timestamps; seeded random; no real clocks    |
| **Fast**          | Connection pooling; parallel-safe schema           |
| **Predictive**    | Real infrastructure = better production prediction |
| **Specific**      | One boundary per test file                         |
