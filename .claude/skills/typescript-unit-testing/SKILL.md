---
name: typescript-unit-testing
description: 'Use when: (1) writing new unit tests for TypeScript, (2) reviewing existing tests, (3) implementing TDD workflows, (4) creating mocks/test doubles, (5) debugging test failures, (6) questions about test design. Supports Vitest and Jest.'
---

# TypeScript Unit Testing with GOOS & TDD

## The TDD Cycle

```typescript
// 1. RED: Write a failing test
it('applies percentage discount', () => {
  const calculator = new PriceCalculator();
  expect(calculator.applyDiscount(100, 0.2)).toBe(80);
});

// 2. GREEN: Implement minimum code to pass
// 3. REFACTOR: Improve design while tests stay green
```

## Core Decision: What Are You Testing?

| Scenario              | Approach                             |
| --------------------- | ------------------------------------ |
| Pure functions        | Test directly, no mocks              |
| Classes without deps  | Fresh instance per test              |
| Classes with deps     | Mock interfaces at boundaries        |
| Third-party libraries | Wrap in adapter, mock your interface |

## Key Principles

1. **Test behavior, not implementation** — Focus on what, not how
2. **Mock roles, not classes** — Mock TypeScript interfaces
3. **Keep tests isolated** — Each test runs independently
4. **One assertion per concept** — Focus each test on single behavior
5. **Listen to your tests** — Hard to test = bad design

## When to Mock

**Mock these:** Database repos, external APIs, file system, email services, I/O operations

**Don't mock:** Pure functions, value objects, domain objects under test, TypeScript built-ins

## AAA Pattern (Arrange-Act-Assert)

```typescript
it('calculates total with tax', () => {
  // Arrange
  const cart = new ShoppingCart();
  cart.addItem({ id: '1', price: 10 });

  // Act
  const total = cart.calculateTotalWithTax(0.08);

  // Assert
  expect(total).toBe(10.8);
});
```

## Type-Safe Mocks

```typescript
const mockRepo: OrderRepository = {
  save: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn().mockResolvedValue(null),
};
const service = new OrderService(mockRepo);
```

## Quick Wins: Avoid These

- ❌ Testing private methods → Test through public interface
- ❌ Shared mutable state → Use `beforeEach` for fresh instances
- ❌ Testing implementation details → Test behavior
- ❌ Mocking what you don't own → Wrap in adapters
- ❌ Multiple unrelated assertions → Split into separate tests

## When Tests Are Hard to Write

| Symptom              | Design Problem         | Solution                   |
| -------------------- | ---------------------- | -------------------------- |
| Many dependencies    | Interface too broad    | Split responsibilities     |
| Long setup           | Too much coupling      | Delete unnecessary setup   |
| Mocking complex objs | Missing abstraction    | Wrap in simpler adapter    |
| Brittle tests        | Testing implementation | Switch to testing behavior |

## Vitest Quick Reference

```typescript
describe('suite', () => {});
it('test', () => {});
beforeEach(() => {});

expect(value).toBe(42);
expect(value).toEqual({ key: 'value' });
expect(fn).toThrow('error');
await expect(promise).rejects.toThrow();

const mockFn = vi.fn().mockResolvedValue(result);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

## Detailed References

- **[test-desiderata.md](references/test-desiderata.md)** — Kent Beck's 12 properties of good tests
- **[goos-principles.md](references/goos-principles.md)** — Outside-in development methodology
- **[examples.md](references/examples.md)** — Full test suites (Order, Shopping Cart)
- **[anti-patterns.md](references/anti-patterns.md)** — Detailed examples of what to avoid
- **[vitest-setup.md](references/vitest-setup.md)** — Complete testing infrastructure setup
