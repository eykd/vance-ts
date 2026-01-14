# Redaction Functions

**Purpose**: Core utilities for redacting and masking sensitive data in log entries.

## Primary Redaction Function

```typescript
// src/infrastructure/logging/redaction.ts
export function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (typeof value === 'object') {
    return redactObject(value as Record<string, unknown>);
  }

  return value;
}
```

**Design**: Type-based dispatch that handles primitives, strings, arrays, and objects recursively.

## String Redaction

```typescript
function redactString(str: string): string {
  let result = str;

  // Apply all pattern replacements
  for (const pattern of Object.values(SENSITIVE_PATTERNS)) {
    result = result.replace(pattern, '[REDACTED]');
  }

  return result;
}
```

**Behavior**:

- Applies all regex patterns from `SENSITIVE_PATTERNS`
- Multiple matches in same string are all replaced
- Patterns are applied sequentially (order may matter for overlapping patterns)

**Example**:

```typescript
redactString('api_key: "sk_live_abc123", token: "eyJhbGc..."');
// → 'api_key: "[REDACTED]", token: "[REDACTED]"'
```

## Object Redaction

```typescript
function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    if (REDACT_FIELDS.has(lowerKey)) {
      result[key] = '[REDACTED]';
    } else if (MASK_FIELDS.has(lowerKey) && typeof value === 'string') {
      result[key] = maskString(value, lowerKey);
    } else {
      result[key] = redactValue(value);
    }
  }

  return result;
}
```

**Key features**:

- **Field-level redaction**: Checks key names against `REDACT_FIELDS`
- **Field-level masking**: Checks key names against `MASK_FIELDS`
- **Recursive redaction**: Applies `redactValue` to non-sensitive fields
- **Preserves key names**: Only values are redacted, keys remain unchanged

**Example**:

```typescript
redactObject({
  username: 'john',
  password: 'secret123',
  email: 'john@example.com',
  metadata: { token: 'abc123' },
});
// → {
//   username: 'john',
//   password: '[REDACTED]',
//   email: 'j***@example.com',
//   metadata: { token: '[REDACTED]' }
// }
```

## Masking Function

```typescript
function maskString(str: string, fieldType: string): string {
  if (fieldType === 'email') {
    const [local, domain] = str.split('@');
    if (local && domain) {
      return `${local[0]}***@${domain}`;
    }
  }

  if (fieldType === 'phone' || fieldType === 'ip' || fieldType === 'ip_address') {
    return str.slice(0, 3) + '***' + str.slice(-2);
  }

  // Default: show first and last characters
  if (str.length > 4) {
    return str[0] + '***' + str[str.length - 1];
  }

  return '[REDACTED]';
}
```

**Masking strategies**:

- **Email**: Shows first character of local part and full domain
- **Phone/IP**: Shows prefix (3 chars) and suffix (2 chars)
- **Generic**: Shows first and last character for strings >4 chars
- **Short strings**: Fully redacted if ≤4 characters

## Integration with SafeLogger

```typescript
// src/infrastructure/logging/safeLogger.ts
import { redactValue } from './redaction';
import type { StructuredLogEntry, BaseLogFields } from './schema';

export class SafeLogger {
  constructor(
    private baseContext: BaseLogFields,
    private isProduction: boolean
  ) {}

  private createEntry(level: LogLevel, fields: Partial<StructuredLogEntry>): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      ...this.baseContext,
      ...fields,
      level,
      timestamp: new Date().toISOString(),
    };

    // Always redact in production, optionally in development
    if (this.isProduction) {
      return redactValue(entry) as StructuredLogEntry;
    }

    // In development, still redact critical fields
    return this.redactCriticalFields(entry);
  }

  private redactCriticalFields(entry: StructuredLogEntry): StructuredLogEntry {
    const criticalFields = ['password', 'secret', 'token', 'api_key'];
    const result = { ...entry };

    for (const field of criticalFields) {
      if (field in result) {
        (result as Record<string, unknown>)[field] = '[REDACTED]';
      }
    }

    return result;
  }

  debug(fields: Partial<StructuredLogEntry>): void {
    if (!this.isProduction) {
      const entry = this.createEntry('debug', fields);
      console.log(JSON.stringify(entry));
    }
  }

  info(fields: Partial<StructuredLogEntry>): void {
    const entry = this.createEntry('info', fields);
    console.log(JSON.stringify(entry));
  }

  warn(fields: Partial<StructuredLogEntry>): void {
    const entry = this.createEntry('warn', fields);
    console.warn(JSON.stringify(entry));
  }

  error(fields: Partial<StructuredLogEntry>): void {
    const entry = this.createEntry('error', fields);
    console.error(JSON.stringify(entry));
  }
}
```

**Environment-aware redaction**:

- **Production**: Full redaction via `redactValue()`
- **Development**: Critical fields only (preserves debugging info)
- **Debug logs**: Suppressed entirely in production

## Performance Optimization

### Lazy Redaction

For high-throughput scenarios, consider lazy redaction:

```typescript
export class LazyRedactor {
  constructor(private value: unknown) {}

  toJSON(): unknown {
    return redactValue(this.value);
  }
}

// Usage
logger.info({
  event: 'user.created',
  user: new LazyRedactor(userData), // Redacted only when serialized
});
```

### Memoization

For repeated redaction of static data:

```typescript
const redactionCache = new Map<string, string>();

function memoizedRedactString(str: string): string {
  if (redactionCache.has(str)) {
    return redactionCache.get(str)!;
  }

  const result = redactString(str);
  redactionCache.set(str, result);
  return result;
}
```

**Warning**: Cache growth can cause memory leaks. Use bounded caches (e.g., LRU) in production.

## Testing Redaction Functions

```typescript
// src/infrastructure/logging/redaction.spec.ts
import { describe, it, expect } from 'vitest';
import { redactValue } from './redaction';

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

  it('handles arrays', () => {
    const input = [
      { name: 'John', password: 'secret1' },
      { name: 'Jane', password: 'secret2' },
    ];
    const result = redactValue(input) as any[];
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].password).toBe('[REDACTED]');
  });
});
```

## Error Handling

Redaction functions should never throw:

```typescript
function safeRedactValue(value: unknown): unknown {
  try {
    return redactValue(value);
  } catch (error) {
    // If redaction fails, return placeholder to avoid losing log entry
    return '[REDACTION_ERROR]';
  }
}
```

**Rationale**: Logging failures should not crash the application. Prefer partial data over no data.
