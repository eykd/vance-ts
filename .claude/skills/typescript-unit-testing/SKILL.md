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

## 100% Coverage Requirement (NON-NEGOTIABLE)

This project REQUIRES 100% test coverage. Not 95%. Not 99%. **100%**.

### Why 100%?

- **Enforced by jest.config.js**: Coverage thresholds are set to 100 for branches, functions, lines, statements
- **Aligns with project philosophy**: Zero-warning policy for TypeScript, zero-warning policy for coverage
- **Constitution mandates it**: Core Principle I requires 100% coverage threshold
- **No exceptions**: Pre-commit hooks will fail on less than 100%

### Achieving 100% Coverage

**Run coverage report to identify gaps**:

```bash
npx jest --coverage
# Look for uncovered lines in the report
```

**For each uncovered line, ask**:

1. **Is this a normal code path?** → Write a test for it
2. **Is this an error handler for external failures?** → Mock the external failure
3. **Is this truly untestable?** (rare) → Use istanbul ignore comment

### When to Use Istanbul Ignore

Istanbul ignore comments are **permitted but should be rare**. Use them ONLY for:

1. **Unreachable defensive code**: Type guards that TypeScript proves can't execute
2. **Platform-specific edge cases**: Code that can't execute in test environment
3. **Third-party library internal errors**: Errors thrown deep in dependencies

**Examples of acceptable usage**:

```typescript
// Acceptable: Type guard that TypeScript proves is unreachable
if (typeof value !== 'string') {
  /* istanbul ignore next */
  throw new Error('Type system prevents this');
}

// Acceptable: Platform-specific error that can't be triggered in tests
try {
  await cloudflareKVOperation();
} catch (error) {
  /* istanbul ignore next */
  if (error.code === 'CLOUDFLARE_INTERNAL_ERROR') {
    // Can't simulate Cloudflare internal errors
  }
}
```

**Examples of WRONG usage**:

```typescript
// WRONG: Lazy - you can test this
/* istanbul ignore next */
if (items.length === 0) {
  return [];
}

// WRONG: Lazy - mock the error
/* istanbul ignore next */
catch (error) {
  console.error(error);
}
```

### Coverage Checklist

Before marking implementation complete:

- [ ] Run `npx jest --coverage`
- [ ] Verify all four metrics show 100%: branches, functions, lines, statements
- [ ] If using istanbul ignore, document WHY in code comment
- [ ] If stuck below 100%, ask yourself: "Can I mock the dependency causing this?"

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
