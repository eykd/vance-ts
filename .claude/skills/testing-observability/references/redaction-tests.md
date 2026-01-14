# Redaction Tests

**Purpose**: Comprehensive testing patterns for PII and secret redaction functions including pattern matching, field detection, and URL sanitization.

## When to Use

Use this reference when writing tests for redaction utility functions to validate API key detection, JWT token matching, credit card redaction, email masking, nested object handling, and URL parameter sanitization. Critical for defense-in-depth data protection validation.

## Pattern

```typescript
// src/infrastructure/logging/redaction.spec.ts
import { describe, it, expect } from 'vitest';
import { redactValue, redactUrl } from './redaction';

describe('redactValue', () => {
  it('redacts API keys in strings', () => {
    const input = 'api_key: "sk_live_abcdef123456789012345678"';
    const result = redactValue(input);
    expect(result).toBe('[REDACTED]');
  });

  it('redacts JWT tokens', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const result = redactValue(jwt);
    expect(result).toBe('[REDACTED]');
  });

  it('redacts credit card numbers', () => {
    const input = 'Card: 4111-1111-1111-1111';
    const result = redactValue(input);
    expect(result).toBe('Card: [REDACTED]');
  });
});
```

## Testing Object Field Redaction

```typescript
it('redacts sensitive object fields', () => {
  const input = {
    username: 'john',
    password: 'secret123',
    token: 'abc123',
  };
  const result = redactValue(input);
  expect(result).toEqual({
    username: 'john',
    password: '[REDACTED]',
    token: '[REDACTED]',
  });
});

it('masks email addresses', () => {
  const input = { email: 'john.doe@example.com' };
  const result = redactValue(input);
  expect((result as any).email).toBe('j***@example.com');
});
```

## Testing Nested Object Redaction

```typescript
it('handles nested objects', () => {
  const input = {
    user: {
      name: 'John',
      credentials: {
        password: 'secret',
      },
    },
  };
  const result = redactValue(input) as any;
  expect(result.user.credentials.password).toBe('[REDACTED]');
  expect(result.user.name).toBe('John');
});
```

## Testing URL Sanitization

```typescript
describe('redactUrl', () => {
  it('redacts sensitive query parameters', () => {
    const url = 'https://api.example.com/auth?token=abc123&user=john';
    const result = redactUrl(url);
    expect(result).toBe('https://api.example.com/auth?token=[REDACTED]&user=john');
  });

  it('redacts long path segments', () => {
    const url = 'https://api.example.com/users/abc123def456ghi789jkl012mno345pqr678';
    const result = redactUrl(url);
    expect(result).toContain('[ID]');
  });
});
```

## Decision Matrix

| Test Scenario              | Assertion Type                        | Expected Behavior              |
| -------------------------- | ------------------------------------- | ------------------------------ |
| String with API key        | `toBe('[REDACTED]')`                  | Full string replacement        |
| Object with password field | `toEqual({ password: '[REDACTED]' })` | Field-level redaction          |
| Email address              | Regex match                           | Partial masking with asterisks |
| URL query params           | String contains                       | Parameter value redacted       |
| Nested objects             | Deep equality                         | Recursive redaction            |

## Edge Cases

### Array of Objects

**Scenario**: Redacting sensitive data in arrays
**Solution**: Map over array and redact each element

```typescript
it('redacts arrays of objects', () => {
  const input = [
    { user: 'john', password: 'secret1' },
    { user: 'jane', password: 'secret2' },
  ];
  const result = redactValue(input) as any[];
  expect(result[0].password).toBe('[REDACTED]');
  expect(result[1].password).toBe('[REDACTED]');
});
```

### Null and Undefined Values

**Scenario**: Handling null/undefined in redaction pipeline
**Solution**: Return as-is without error

```typescript
it('handles null values', () => {
  expect(redactValue(null)).toBeNull();
  expect(redactValue(undefined)).toBeUndefined();
});
```

## Common Mistakes

### ❌ Mistake: Testing only happy paths

Only testing valid patterns misses edge cases like malformed tokens or partial matches.

```typescript
// Bad: Only tests perfect API key format
it('redacts API keys', () => {
  expect(redactValue('sk_live_abc123')).toBe('[REDACTED]');
});
```

### ✅ Correct: Test boundary conditions

```typescript
// Good: Tests variations and edge cases
describe('API key redaction', () => {
  it('redacts standard API keys', () => {
    expect(redactValue('sk_live_abc123')).toBe('[REDACTED]');
  });

  it('redacts test API keys', () => {
    expect(redactValue('sk_test_abc123')).toBe('[REDACTED]');
  });

  it('handles keys with special characters', () => {
    expect(redactValue('sk_live_abc-123_xyz')).toBe('[REDACTED]');
  });
});
```

## Testing Strategy

**Coverage targets**:

- All sensitive patterns (API keys, tokens, secrets, credentials)
- Field detection (password, token, authorization, etc.)
- Format variations (with/without delimiters)
- Nested structures (objects, arrays, mixed)
- Edge cases (null, undefined, empty strings)

**Regex validation**:

```typescript
// Verify regex compiles and matches expected patterns
describe('Pattern validation', () => {
  it('API key pattern is valid', () => {
    const apiKeyPattern = /sk_(live|test)_[a-zA-Z0-9]{20,}/;
    expect(apiKeyPattern.test('sk_live_abcdefghij1234567890')).toBe(true);
    expect(apiKeyPattern.test('invalid')).toBe(false);
  });
});
```

## Related References

- [logger-unit-tests.md](./logger-unit-tests.md) - Testing logger redaction integration
- [pii-redaction: sensitive-patterns](../../pii-redaction/references/sensitive-patterns.md) - Comprehensive pattern catalog
- [pii-redaction: redaction-functions](../../pii-redaction/references/redaction-functions.md) - Implementation details
