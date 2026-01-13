# Testing Anti-Patterns in TypeScript

Common mistakes to avoid when writing unit tests.

## 1. Testing Private Methods

**Problem:** Testing implementation details makes tests brittle.

**❌ Bad:**

```typescript
describe('PriceCalculator', () => {
  it('calculates tax correctly', () => {
    const calculator = new PriceCalculator();
    // Accessing private method
    const tax = calculator['calculateTax'](100, 0.08);
    expect(tax).toBe(8);
  });
});
```

**✅ Good:**

```typescript
describe('PriceCalculator', () => {
  it('includes tax in final price', () => {
    const calculator = new PriceCalculator();
    const finalPrice = calculator.calculateFinalPrice(100, 0.08);
    expect(finalPrice).toBe(108);
  });
});
```

**Why:** Private methods can be refactored freely. Test the public interface that clients use.

## 2. Shared Mutable State

**Problem:** Tests that share state become order-dependent.

**❌ Bad:**

```typescript
describe('ShoppingCart', () => {
  const cart = new ShoppingCart(); // Shared across tests!

  it('starts empty', () => {
    expect(cart.itemCount()).toBe(0);
  });

  it('adds items', () => {
    cart.addItem({ id: '1', price: 10 });
    expect(cart.itemCount()).toBe(1); // Fails if run after previous test
  });

  it('calculates total', () => {
    // Depends on previous test adding item
    expect(cart.total()).toBe(10);
  });
});
```

**✅ Good:**

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

  it('calculates total', () => {
    cart.addItem({ id: '1', price: 10 });
    expect(cart.total()).toBe(10);
  });
});
```

**Why:** Each test must be independent and runnable in any order.

## 3. Testing Implementation Details

**Problem:** Tests coupled to internal structure break during refactoring.

**❌ Bad:**

```typescript
describe('UserService', () => {
  it('caches user lookups', async () => {
    const service = new UserService(mockRepository);
    await service.getUser('user-1');

    // Testing internal cache implementation
    expect(service['cache'].has('user-1')).toBe(true);
    expect(service['cache'].get('user-1')).toEqual(expectedUser);
  });
});
```

**✅ Good:**

```typescript
describe('UserService', () => {
  it('only queries repository once for repeated requests', async () => {
    const service = new UserService(mockRepository);

    await service.getUser('user-1');
    await service.getUser('user-1');

    // Test the observable effect
    expect(mockRepository.findById).toHaveBeenCalledTimes(1);
  });
});
```

**Why:** Test behavior (what), not implementation (how). This allows internal refactoring.

## 4. Overly Specific Assertions

**Problem:** Brittle tests that break with minor changes.

**❌ Bad:**

```typescript
describe('OrderService', () => {
  it('creates order', async () => {
    const service = new OrderService(mockRepository);
    await service.createOrder({ customerId: 'customer-1' });

    // Too specific - breaks if any field changes
    expect(mockRepository.save).toHaveBeenCalledWith({
      orderId: 'order-abc123',
      customerId: 'customer-1',
      items: [],
      status: 'pending',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      version: 1,
      metadata: {},
    });
  });
});
```

**✅ Good:**

```typescript
describe('OrderService', () => {
  it('creates order with customer', async () => {
    const service = new OrderService(mockRepository);
    await service.createOrder({ customerId: 'customer-1' });

    // Test essential properties only
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'customer-1',
        status: 'pending',
        orderId: expect.any(String),
      })
    );
  });
});
```

**Why:** Focus on essential properties. Use `expect.objectContaining()` for flexibility.

## 5. Mocking What You Don't Own

**Problem:** Tests coupled to third-party library internals.

**❌ Bad:**

```typescript
import Stripe from 'stripe';

describe('PaymentService', () => {
  it('charges customer', async () => {
    // Mocking Stripe directly - tightly coupled
    const mockStripe = {
      charges: {
        create: vi.fn().mockResolvedValue({ id: 'ch_123' }),
      },
    } as unknown as Stripe;

    const service = new PaymentService(mockStripe);
    await service.charge(100);

    expect(mockStripe.charges.create).toHaveBeenCalled();
  });
});
```

**✅ Good:**

```typescript
// Define your interface
interface PaymentGateway {
  charge(amount: number, token: string): Promise<string>;
}

// Implement adapter
class StripePaymentGateway implements PaymentGateway {
  constructor(private readonly stripe: Stripe) {}

  async charge(amount: number, token: string): Promise<string> {
    const charge = await this.stripe.charges.create({
      amount,
      currency: 'usd',
      source: token,
    });
    return charge.id;
  }
}

// Test with your interface
describe('PaymentService', () => {
  it('charges customer', async () => {
    const mockGateway: PaymentGateway = {
      charge: vi.fn().mockResolvedValue('ch-123'),
    };

    const service = new PaymentService(mockGateway);
    const chargeId = await service.charge(100, 'tok-abc');

    expect(chargeId).toBe('ch-123');
  });
});

// Test adapter separately
describe('StripePaymentGateway Integration', () => {
  it('charges through Stripe', async () => {
    const stripe = new Stripe(process.env.STRIPE_TEST_KEY!);
    const gateway = new StripePaymentGateway(stripe);

    const chargeId = await gateway.charge(100, 'tok_visa');

    expect(chargeId).toMatch(/^ch_/);
  });
});
```

**Why:** Your adapter isolates you from third-party changes. Test your interface, not theirs.

## 6. God Tests (Testing Too Much)

**Problem:** One test covering everything makes debugging difficult.

**❌ Bad:**

```typescript
describe('E-commerce System', () => {
  it('handles complete purchase flow', async () => {
    // Create customer
    const customer = await createCustomer({
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
    });

    // Create products
    const product1 = await createProduct({ name: 'Widget', price: 10 });
    const product2 = await createProduct({ name: 'Gadget', price: 20 });

    // Add to cart
    const cart = new ShoppingCart(customer.id);
    cart.addItem(product1.id, 2);
    cart.addItem(product2.id, 1);

    // Apply discount
    await cart.applyDiscount('SAVE10');

    // Process payment
    const payment = await processPayment(cart.total(), customer.paymentMethod);

    // Create order
    const order = await createOrder(customer.id, cart.items);

    // Send confirmation
    await sendConfirmation(customer.email, order.id);

    // Update inventory
    await updateInventory(cart.items);

    // Record analytics
    await recordPurchase(order.id, cart.total());

    // Verify everything
    expect(order.status).toBe('confirmed');
    expect(payment.status).toBe('success');
    expect(customer.orders).toContain(order.id);
    // ... 50 more assertions

    // If this fails, where do you start debugging?
  });
});
```

**✅ Good:**

```typescript
describe('Order Creation', () => {
  it('creates order with customer', async () => {
    const result = await orderService.create({
      customerId: 'customer-1',
      items: [{ productId: 'product-1', quantity: 1 }],
    });

    expect(result.orderId).toBeDefined();
    expect(result.customerId).toBe('customer-1');
  });
});

describe('Payment Processing', () => {
  it('processes payment successfully', async () => {
    const result = await paymentService.process({
      amount: 100,
      token: 'tok-valid',
    });

    expect(result.status).toBe('success');
    expect(result.transactionId).toBeDefined();
  });

  it('handles payment failure', async () => {
    mockGateway.charge.mockRejectedValue(new PaymentError('Declined'));

    const result = await paymentService.process({
      amount: 100,
      token: 'tok-declined',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBe('Declined');
  });
});
```

**Why:** Focused tests make failures specific. One test per behavior makes debugging fast.

## 7. Not Cleaning Up Mocks

**Problem:** Mock behavior leaks between tests.

**❌ Bad:**

```typescript
describe('OrderService', () => {
  const mockPayment: PaymentGateway = {
    charge: vi.fn(),
  };

  it('processes successful payment', async () => {
    vi.mocked(mockPayment.charge).mockResolvedValue({ success: true });
    // ... test
  });

  it('processes failed payment', async () => {
    // Still has behavior from previous test!
    vi.mocked(mockPayment.charge).mockResolvedValue({ success: false });
    // ... test
  });
});
```

**✅ Good:**

```typescript
describe('OrderService', () => {
  let mockPayment: PaymentGateway;

  beforeEach(() => {
    // Fresh mock for each test
    mockPayment = {
      charge: vi.fn(),
    };
  });

  it('processes successful payment', async () => {
    vi.mocked(mockPayment.charge).mockResolvedValue({ success: true });
    // ... test
  });

  it('processes failed payment', async () => {
    vi.mocked(mockPayment.charge).mockResolvedValue({ success: false });
    // ... test
  });
});
```

**Why:** Each test starts with a clean slate. Use `beforeEach` to reset state.

## 8. Multiple Unrelated Assertions

**Problem:** Tests covering multiple concepts make failures unclear.

**❌ Bad:**

```typescript
describe('Order', () => {
  it('handles various operations', () => {
    const order = new OrderBuilder().build();

    // Testing multiple unrelated things
    expect(order.calculateTotal()).toBe(10);
    expect(order.itemCount()).toBe(1);
    expect(order.customerId).toBe('customer-1');
    expect(order.status).toBe('pending');

    order.confirm();
    expect(order.status).toBe('confirmed');

    order.ship('TRACK123');
    expect(order.status).toBe('shipped');
    expect(order.trackingNumber).toBe('TRACK123');

    // Which assertion failed? Hard to tell from test name.
  });
});
```

**✅ Good:**

```typescript
describe('Order', () => {
  describe('calculateTotal', () => {
    it('sums item prices', () => {
      const order = new OrderBuilder()
        .withItems([{ productId: 'p1', quantity: 2, price: 10 }])
        .build();

      expect(order.calculateTotal()).toBe(20);
    });
  });

  describe('confirm', () => {
    it('transitions from pending to confirmed', () => {
      const order = new OrderBuilder().withStatus('pending').build();

      order.confirm();

      expect(order.status).toBe('confirmed');
    });
  });

  describe('ship', () => {
    it('sets tracking number and status', () => {
      const order = new OrderBuilder().withStatus('confirmed').build();

      order.ship('TRACK123');

      // Related assertions for same concept
      expect(order.status).toBe('shipped');
      expect(order.trackingNumber).toBe('TRACK123');
    });
  });
});
```

**Why:** One concept per test. Clear test names. Easy to find failures.

## 9. Testing at Wrong Level

**Problem:** Unit test trying to test integration or vice versa.

**❌ Bad:**

```typescript
// Unit test with real database - should be integration test
describe('UserService', () => {
  it('saves user', async () => {
    const db = await createDatabase(); // Real database!
    const service = new UserService(new PostgresRepository(db));

    await service.createUser({ name: 'John' });

    const users = await db.query('SELECT * FROM users');
    expect(users).toHaveLength(1);
  });
});
```

**✅ Good:**

```typescript
// Unit test with mock
describe('UserService', () => {
  it('delegates to repository', async () => {
    const mockRepo: UserRepository = {
      save: vi.fn().mockResolvedValue(undefined),
    };

    const service = new UserService(mockRepo);
    await service.createUser({ name: 'John' });

    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'John' }));
  });
});

// Separate integration test
describe('PostgresUserRepository Integration', () => {
  it('persists users', async () => {
    const db = await createTestDatabase();
    const repo = new PostgresUserRepository(db);

    await repo.save({ id: '1', name: 'John' });

    const user = await repo.findById('1');
    expect(user?.name).toBe('John');
  });
});
```

**Why:** Unit tests are fast and focused. Integration tests are slower but verify real connections.

## 10. Unnecessary Mocking

**Problem:** Mocking things that don't need mocking.

**❌ Bad:**

```typescript
describe('PriceCalculator', () => {
  it('calculates total', () => {
    // Mocking Math?!
    const mockMath = {
      round: vi.fn((x: number) => Math.round(x)),
    };

    const calculator = new PriceCalculator(mockMath);
    const total = calculator.calculate(100, 1.08);

    expect(mockMath.round).toHaveBeenCalled();
    expect(total).toBe(108);
  });
});
```

**✅ Good:**

```typescript
describe('PriceCalculator', () => {
  it('calculates total', () => {
    const calculator = new PriceCalculator();
    const total = calculator.calculate(100, 1.08);

    expect(total).toBe(108);
  });
});
```

**Why:** Don't mock pure functions or standard library. Only mock I/O and external dependencies.

## 11. Time-Dependent Tests

**Problem:** Tests that depend on current time are non-deterministic.

**❌ Bad:**

```typescript
describe('SessionManager', () => {
  it('identifies expired sessions', () => {
    const manager = new SessionManager();

    // Using real time - will break eventually!
    const session = {
      expiresAt: new Date(Date.now() - 60000), // 1 minute ago
    };

    expect(manager.isExpired(session)).toBe(true);
  });
});
```

**✅ Good:**

```typescript
interface Clock {
  now(): Date;
}

describe('SessionManager', () => {
  it('identifies expired sessions', () => {
    const fixedClock: Clock = {
      now: () => new Date('2024-01-15T12:00:00Z'),
    };

    const manager = new SessionManager(fixedClock);

    const session = {
      expiresAt: new Date('2024-01-15T11:00:00Z'), // 1 hour ago
    };

    expect(manager.isExpired(session)).toBe(true);
  });
});
```

**Why:** Deterministic tests always pass or fail consistently. Inject time as a dependency.

## Summary: Quick Checklist

Before committing tests, check:

- [ ] Not testing private methods
- [ ] Fresh state with `beforeEach`
- [ ] Testing behavior, not implementation
- [ ] Using `expect.objectContaining()` for flexibility
- [ ] Not mocking third-party libraries directly
- [ ] One concept per test
- [ ] Clean mocks between tests
- [ ] Separate assertions in separate tests
- [ ] Unit tests are fast (no real I/O)
- [ ] Only mocking I/O and side effects
- [ ] Time injected as dependency
- [ ] Descriptive test names

These patterns will make your tests maintainable, reliable, and valuable over time.
