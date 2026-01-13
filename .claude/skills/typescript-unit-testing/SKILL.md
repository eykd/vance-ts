---
name: typescript-unit-testing
description: Write effective TypeScript unit tests using GOOS (Growing Object-Oriented Software, Guided by Tests) and TDD (Test-Driven Development) principles with Kent Beck's Test Desiderata. Use when writing new unit tests for TypeScript code, reviewing existing tests, implementing TDD workflows, creating mocks/test doubles, applying outside-in development, debugging test failures, refactoring with test coverage, or answering questions about TypeScript test design and best practices. Supports Vitest, Jest, and other TypeScript testing frameworks.
---

# TypeScript Unit Testing with GOOS & TDD

Write effective, maintainable TypeScript unit tests following GOOS principles and Kent Beck's Test Desiderata.

## Quick Start: The TDD Cycle

Follow the Red-Green-Refactor cycle:

```typescript
// 1. RED: Write a failing test
describe('PriceCalculator', () => {
  it('applies percentage discount', () => {
    const calculator = new PriceCalculator();
    expect(calculator.applyDiscount(100, 0.2)).toBe(80);
  });
});

// 2. GREEN: Implement minimum code to pass
export class PriceCalculator {
  applyDiscount(price: number, discount: number): number {
    return price * (1 - discount);
  }
}

// 3. REFACTOR: Improve design while tests stay green
export class PriceCalculator {
  applyDiscount(price: number, discount: number): number {
    this.validateInputs(price, discount);
    return price * (1 - discount);
  }

  private validateInputs(price: number, discount: number): void {
    if (price < 0 || discount < 0 || discount > 1) {
      throw new Error('Invalid inputs');
    }
  }
}
```

## Core Decision: What Are You Testing?

### Pure Functions (No Dependencies)

No mocks needed - test directly:

```typescript
export function calculateDiscount(price: number, percent: number): number {
  if (price < 0 || percent < 0 || percent > 100) {
    throw new Error('Invalid inputs');
  }
  return price * (1 - percent / 100);
}

// Test directly
it('applies discount correctly', () => {
  expect(calculateDiscount(100, 20)).toBe(80);
});
```

### Classes Without Dependencies

Test with fresh instances:

```typescript
describe('ShoppingCart', () => {
  let cart: ShoppingCart;

  beforeEach(() => {
    cart = new ShoppingCart(); // Fresh instance per test
  });

  it('starts empty', () => {
    expect(cart.total()).toBe(0);
  });
});
```

### Classes With Dependencies

Mock collaborators at boundaries:

```typescript
// Define role (interface)
export interface PaymentGateway {
  charge(amount: number, token: string): Promise<PaymentResult>;
}

// Test by mocking the role
describe('OrderService', () => {
  let mockGateway: PaymentGateway;

  beforeEach(() => {
    mockGateway = {
      charge: vi.fn().mockResolvedValue({ success: true, transactionId: 'txn-123' }),
    };
  });

  it('processes payment', async () => {
    const service = new OrderService(mockGateway);
    await service.placeOrder({ amount: 100, token: 'tok-abc' });

    expect(mockGateway.charge).toHaveBeenCalledWith(100, 'tok-abc');
  });
});
```

## Key Principles

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Mock roles, not classes** - Mock TypeScript interfaces, not concrete classes
3. **Keep tests isolated** - Each test runs independently
4. **One assertion per concept** - Focus each test on a single behavior
5. **Listen to your tests** - Hard to test = bad design

## Test Structure: AAA Pattern

Always structure tests as Arrange-Act-Assert (Given-When-Then):

```typescript
it('calculates total with tax', () => {
  // Arrange (Given): Set up test data
  const cart = new ShoppingCart();
  cart.addItem({ id: '1', price: 10 });
  cart.addItem({ id: '2', price: 20 });

  // Act (When): Perform operation
  const total = cart.calculateTotalWithTax(0.08);

  // Assert (Then): Verify outcome
  expect(total).toBe(32.4);
});
```

## When to Mock

**Mock these:**

- Database repositories
- External API clients
- File system operations
- Email/notification services
- Any I/O operations
- Objects with side effects

**Don't mock these:**

- Pure functions
- Value objects (Money, DateRange, etc.)
- Simple data structures
- Domain objects you're testing
- TypeScript built-ins

**Critical rule:** Never mock third-party libraries directly - wrap them in your own adapter:

```typescript
// ❌ BAD: Mocking Stripe directly
const mockStripe = { charges: { create: vi.fn() } };

// ✅ GOOD: Mock your adapter
interface PaymentGateway {
  charge(amount: number): Promise<string>;
}

class StripeGateway implements PaymentGateway {
  // Wraps Stripe
}

// Test with your interface
const mockGateway: PaymentGateway = {
  charge: vi.fn().mockResolvedValue('txn-123'),
};
```

## Test Organization

Use nested `describe` blocks for clarity:

```typescript
describe('OrderService', () => {
  describe('placeOrder', () => {
    describe('when payment succeeds', () => {
      it('creates and saves the order', () => {});
      it('sends confirmation email', () => {});
    });

    describe('when payment fails', () => {
      it('does not save the order', () => {});
      it('returns error to caller', () => {});
    });
  });
});
```

## Creating Type-Safe Mocks

Use helper functions for consistent mocks:

```typescript
// src/test/mocks.ts
export function createMockRepository(): OrderRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(null),
  };
}

// Use in tests
const mockRepo = createMockRepository();
const service = new OrderService(mockRepo);
```

## Test Data Builders

Use builders for complex objects:

```typescript
export class OrderBuilder {
  private orderId = 'test-order';
  private status: OrderStatus = 'pending';

  withId(id: string): this {
    this.orderId = id;
    return this;
  }

  withStatus(status: OrderStatus): this {
    this.status = status;
    return this;
  }

  build(): Order {
    return new Order(this.orderId, this.status);
  }
}

// Use in tests
const order = new OrderBuilder().withId('order-123').withStatus('confirmed').build();
```

## Common Testing Patterns

### Testing Async Operations

```typescript
it('fetches user by id', async () => {
  mockRepo.findById.mockResolvedValue({ id: '1', name: 'John' });

  const user = await service.getUser('1');

  expect(user.name).toBe('John');
});
```

### Testing Errors

```typescript
it('throws error when user not found', async () => {
  mockRepo.findById.mockResolvedValue(null);

  await expect(service.getUser('missing')).rejects.toThrow('User not found');
});
```

### Testing State Transitions

```typescript
it('transitions from pending to confirmed', () => {
  const order = new OrderBuilder().withStatus('pending').build();

  order.confirm();

  expect(order.status).toBe('confirmed');
});
```

### Making Time Testable

```typescript
// Define clock interface
interface Clock {
  now(): Date;
}

// Use in implementation
class SessionManager {
  constructor(private clock: Clock) {}

  isExpired(session: Session): boolean {
    return session.expiresAt < this.clock.now();
  }
}

// Test with fixed time
it('identifies expired sessions', () => {
  const fixedClock = { now: () => new Date('2024-01-15T12:00:00Z') };
  const manager = new SessionManager(fixedClock);

  const session = { expiresAt: new Date('2024-01-15T11:00:00Z') };

  expect(manager.isExpired(session)).toBe(true);
});
```

## Quick Wins: Avoid These Anti-Patterns

1. **❌ Testing private methods** - Test through public interface instead
2. **❌ Shared mutable state** - Use `beforeEach` for fresh instances
3. **❌ Testing implementation details** - Test behavior, not internal structure
4. **❌ Mocking what you don't own** - Wrap third-party libs in adapters
5. **❌ Over-specific assertions** - Use `expect.objectContaining()` for flexibility
6. **❌ Multiple unrelated assertions** - Split into separate tests

## When Tests Are Hard to Write

If tests are difficult to write, the design needs improvement:

- **Many dependencies?** → Interface too broad, split responsibilities
- **Long setup?** → Consider what's actually needed (delete unnecessary setup)
- **Mocking complex objects?** → Wrap in simpler adapter interface
- **Brittle tests?** → Testing implementation, switch to testing behavior

## Vitest Quick Reference

```typescript
// Test organization
describe('suite', () => {});
it('test', () => {});

// Lifecycle
beforeEach(() => {}); // Runs before each test
afterEach(() => {}); // Runs after each test

// Assertions
expect(value).toBe(42); // Strict equality
expect(value).toEqual({ key: 'value' }); // Deep equality
expect(array).toContain(item);
expect(fn).toThrow('error');
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();

// Mocking
const mockFn = vi.fn();
const mockFn = vi.fn().mockReturnValue(42);
const mockFn = vi.fn().mockResolvedValue(result);

// Verification
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(2);

// Partial matching
expect(obj).toEqual(expect.objectContaining({ key: 'value' }));
expect(val).toEqual(expect.any(String));
```

## Detailed References

For deeper guidance on specific topics:

- **Kent Beck's Test Desiderata** - See [test-desiderata.md](references/test-desiderata.md) for the 12 properties of good tests
- **GOOS Principles** - See [goos-principles.md](references/goos-principles.md) for outside-in development methodology
- **Complete Examples** - See [examples.md](references/examples.md) for full test suites with Order and Shopping Cart examples
- **Anti-Patterns** - See [anti-patterns.md](references/anti-patterns.md) for detailed examples of what to avoid
- **Vitest Configuration** - See [vitest-setup.md](references/vitest-setup.md) for complete testing infrastructure setup

Load these references when you need detailed guidance on a specific aspect of testing.
