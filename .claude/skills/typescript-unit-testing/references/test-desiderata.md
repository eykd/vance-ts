# Kent Beck's Test Desiderata

The 12 desirable properties for effective tests, in rough priority order.

## 1. Isolated - Tests Don't Affect Each Other

Each test runs independently. A test's result doesn't depend on other tests running first.

**Pattern:**

```typescript
describe('ShoppingCart', () => {
  let cart: ShoppingCart;

  beforeEach(() => {
    cart = new ShoppingCart(); // Fresh instance each test
  });

  it('starts empty', () => {
    expect(cart.itemCount()).toBe(0);
  });

  it('adds items', () => {
    cart.addItem({ id: '1', price: 10 });
    expect(cart.itemCount()).toBe(1);
  });
});
```

**Why it matters:** Tests that share state become order-dependent and break unpredictably.

## 2. Composable - Tests Run in Any Order

Tests can be run individually, in groups, or all together with consistent results.

**Pattern:**

```typescript
// Vitest configuration for composability
export default defineConfig({
  test: {
    sequence: { shuffle: true }, // Random order catches dependencies
    threads: true, // Parallel execution
  },
});
```

**Why it matters:** You should be able to run any subset of tests during development without running everything.

## 3. Fast - Tests Complete in Milliseconds

Unit tests run quickly to enable rapid feedback cycles.

**Pattern:**

```typescript
// ✅ Fast: Pure logic, no I/O
describe('PriceCalculator', () => {
  it('calculates total', () => {
    const result = new PriceCalculator().calculate(100, 1.08);
    expect(result).toBe(108);
  });
});

// ❌ Slow: Unnecessary I/O
describe('PriceCalculator', () => {
  it('calculates total', async () => {
    const calculator = await loadFromDatabase(); // Unnecessary!
    const result = calculator.calculate(100, 1.08);
    expect(result).toBe(108);
  });
});
```

**Why it matters:** Slow tests discourage frequent testing. Fast tests enable constant feedback.

## 4. Inspiring - Tests Give Confidence

When tests pass, you're confident the system works. When they fail, you trust they've found a real problem.

**Pattern:**

```typescript
describe('PaymentProcessor', () => {
  it('processes successful payment', async () => {
    const result = await processor.process({ amount: 100, token: 'valid' });
    expect(result.status).toBe('success');
    expect(result.transactionId).toBeDefined();
  });

  it('handles declined cards', async () => {
    mockGateway.charge.mockRejectedValue(new CardDeclinedError());
    const result = await processor.process({ amount: 100, token: 'declined' });
    expect(result.status).toBe('declined');
  });

  it('retries on network errors', async () => {
    mockGateway.charge
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue({ success: true });

    const result = await processor.process({ amount: 100, token: 'valid' });
    expect(result.status).toBe('success');
    expect(mockGateway.charge).toHaveBeenCalledTimes(2);
  });
});
```

**Why it matters:** Tests should cover critical paths and edge cases to inspire genuine confidence.

## 5. Writable - Tests Are Easy to Write

Tests are straightforward to write. If they're not, the design needs improvement.

**Pattern:**

```typescript
// ✅ Easy to write: Clean interface
export class EmailNotifier {
  constructor(private readonly emailService: EmailService) {}

  async notify(order: Order): Promise<void> {
    await this.emailService.send({
      to: order.customerEmail,
      subject: 'Order Confirmation',
      body: `Order ${order.id} confirmed`,
    });
  }
}

// Test is straightforward
it('sends order confirmation', async () => {
  const mockEmail: EmailService = {
    send: vi.fn().mockResolvedValue(undefined),
  };

  const notifier = new EmailNotifier(mockEmail);
  await notifier.notify(order);

  expect(mockEmail.send).toHaveBeenCalledWith({
    to: 'customer@example.com',
    subject: 'Order Confirmation',
    body: expect.stringContaining('Order'),
  });
});
```

**Why it matters:** Hard-to-write tests signal design problems. Fix the design, not the test.

## 6. Readable - Tests Are Easy to Understand

Tests serve as documentation. Anyone reading them understands what the system does.

**Pattern:**

```typescript
describe('ShoppingCart', () => {
  describe('applying discount codes', () => {
    it('applies percentage discount to total', () => {
      // Given: Cart with items totaling $100
      const cart = new ShoppingCart();
      cart.addItem({ id: '1', price: 50 });
      cart.addItem({ id: '2', price: 50 });

      // When: 20% discount applied
      cart.applyDiscountCode('SAVE20');

      // Then: Total reduced by 20%
      expect(cart.total()).toBe(80);
    });

    it('rejects invalid discount codes', () => {
      const cart = new ShoppingCart();
      cart.addItem({ id: '1', price: 50 });

      const result = cart.applyDiscountCode('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid discount code');
      expect(cart.total()).toBe(50);
    });
  });
});
```

**Why it matters:** Tests document expected behavior. Clear tests help future developers understand intent.

## 7. Behavioral - Tests Verify Behavior Changes

Tests fail when behavior changes, ensuring regressions are caught.

**Pattern:**

```typescript
// ✅ Tests behavior
describe('Order', () => {
  it('cannot be canceled after shipping', () => {
    const order = new OrderBuilder().build();
    order.ship('TRACK123');

    const result = order.cancel();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Cannot cancel after shipping');
    expect(order.status()).toBe('shipped'); // Behavior unchanged
  });
});

// ❌ Tests implementation
describe('Order', () => {
  it('sets internal status field', () => {
    const order = new OrderBuilder().build();
    expect(order['_status']).toBe('pending'); // Implementation detail
  });
});
```

**Why it matters:** Tests should catch functional regressions, not internal refactoring.

## 8. Structure-Insensitive - Tests Survive Refactoring

Tests remain unchanged when code structure changes without behavior changes.

**Pattern:**

```typescript
// This test survives refactoring
describe('PriceCalculator', () => {
  it('calculates total with tax', () => {
    const calculator = new PriceCalculator();
    const total = calculator.calculateTotal({ subtotal: 100, taxRate: 0.08 });
    expect(total).toBe(108);
  });
});

// Implementation can change freely:

// Version 1:
calculateTotal(params: { subtotal: number; taxRate: number }): number {
  return params.subtotal * (1 + params.taxRate);
}

// Version 2 (refactored):
calculateTotal(params: { subtotal: number; taxRate: number }): number {
  const tax = this.calculateTax(params.subtotal, params.taxRate);
  return params.subtotal + tax;
}

private calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate;
}

// Test still passes! Structure-insensitive.
```

**Why it matters:** Tests should enable fearless refactoring, not prevent it.

## 9. Automated - Tests Run Without Manual Steps

All tests run automatically in development and CI/CD without human intervention.

**Pattern:**

```typescript
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch",
    "test:ci": "vitest run --coverage"
  }
}

// .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
```

**Why it matters:** Manual testing doesn't scale. Automation ensures consistent execution.

## 10. Specific - Failures Pinpoint Problems

When a test fails, you immediately know what broke and where.

**Pattern:**

```typescript
// ✅ Specific: Targeted tests
describe('Order', () => {
  describe('calculateTotal', () => {
    it('sums item prices', () => {
      const order = new OrderBuilder().withItem('p1', 1, 10).withItem('p2', 2, 20).build();

      expect(order.calculateTotal()).toBe(50);
    });
  });

  describe('calculateTax', () => {
    it('applies tax rate', () => {
      const order = new OrderBuilder().withSubtotal(100).build();
      expect(order.calculateTax(0.08)).toBe(8);
    });
  });
});

// If calculateTax breaks, only that test fails - immediate diagnosis

// ❌ Not specific: System-wide test
describe('Order System', () => {
  it('processes complete order', async () => {
    // 100 lines touching everything
    expect(invoice.total).toBe(118.8);
    // Failure here - where's the problem?
  });
});
```

**Why it matters:** Specific tests save debugging time. Failures point directly to the problem.

## 11. Deterministic - Tests Produce Consistent Results

Tests always produce the same result given the same code. No flakiness.

**Pattern:**

```typescript
// ✅ Deterministic: Controlled time
interface Clock {
  now(): Date;
}

describe('OrderExpiryChecker', () => {
  it('marks orders expired after 30 days', () => {
    const fixedClock: Clock = { now: () => new Date('2024-01-31') };
    const checker = new OrderExpiryChecker(fixedClock);

    const order = createOrder({ date: new Date('2024-01-01') });

    expect(checker.isExpired(order)).toBe(true);
  });
});

// ❌ Non-deterministic: Real time
describe('OrderExpiryChecker', () => {
  it('marks orders expired', () => {
    const checker = new OrderExpiryChecker();
    const order = createOrder({ date: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) });
    expect(checker.isExpired(order)).toBe(true); // Flaky at month boundaries!
  });
});
```

**Why it matters:** Flaky tests erode trust. Developers ignore intermittent failures.

## 12. Predictive - Tests Predict Production Behavior

If tests pass, the system works in production. Tests use realistic conditions.

**Pattern:**

```typescript
// ✅ Predictive: Realistic test
describe('PaymentProcessor Integration', () => {
  it('handles real payment gateway', async () => {
    const gateway = new StripeGateway({
      apiKey: process.env.STRIPE_TEST_KEY,
      mode: 'test',
    });

    const processor = new PaymentProcessor(gateway);
    const result = await processor.process({
      amount: 1000,
      currency: 'USD',
      cardToken: 'tok_visa', // Real Stripe test token
    });

    expect(result.status).toBe('success');
  });
});

// ❌ Not predictive: Oversimplified mock
describe('PaymentProcessor', () => {
  it('processes payment', async () => {
    const mockGateway = {
      charge: vi.fn().mockResolvedValue({ success: true }),
    };

    const processor = new PaymentProcessor(mockGateway as any);
    const result = await processor.process({ amount: 1000 });

    expect(result.status).toBe('success');
  });
});
// Mock too simple - doesn't catch real API issues
```

**Why it matters:** Tests should predict production behavior, not just satisfy assertions.

## Applying the Desiderata

When writing tests, optimize for these properties in order:

1. **Isolated** - Fresh state per test
2. **Composable** - Run in any order
3. **Fast** - No unnecessary I/O
4. **Inspiring** - Cover critical paths
5. **Writable** - If hard to write, fix design
6. **Readable** - Clear Given-When-Then
7. **Behavioral** - Test what, not how
8. **Structure-Insensitive** - Test public interface
9. **Automated** - CI/CD integration
10. **Specific** - One concept per test
11. **Deterministic** - Inject time dependencies
12. **Predictive** - Use realistic test doubles

Not all properties can be maximized simultaneously - there are tradeoffs. But these properties provide a framework for evaluating test quality.
