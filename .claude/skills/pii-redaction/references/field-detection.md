# Field-Level Detection

**Purpose**: Identify sensitive fields by key names for automatic redaction or masking.

## Redaction Field Sets

Fields that should be completely redacted (replaced with `[REDACTED]`):

```typescript
/**
 * Fields that should always be redacted
 */
export const REDACT_FIELDS = new Set([
  'password',
  'passwd',
  'secret',
  'token',
  'api_key',
  'apiKey',
  'authorization',
  'auth',
  'credit_card',
  'creditCard',
  'card_number',
  'cardNumber',
  'cvv',
  'ssn',
  'social_security',
  'socialSecurity',
]);
```

**Rationale**: These fields contain authentication credentials or highly sensitive data that should never appear in logs, even partially.

## Masking Field Sets

Fields that should be partially visible (show limited characters):

```typescript
/**
 * Fields that should be masked (show partial data)
 */
export const MASK_FIELDS = new Set(['email', 'phone', 'ip', 'ip_address', 'ipAddress']);
```

**Rationale**: These fields contain PII that is useful for correlation but should not be fully exposed. Masking preserves debugging capability while protecting privacy.

## Detection Logic

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

**Key design decisions**:

- **Case-insensitive matching**: Uses `toLowerCase()` to catch `Email`, `EMAIL`, `email`
- **Type checking**: Only mask string values (numbers, booleans, etc. pass through)
- **Recursive redaction**: Non-sensitive fields still undergo recursive redaction for nested sensitive data

## Masking Strategies

### Email Masking

```typescript
function maskString(str: string, fieldType: string): string {
  if (fieldType === 'email') {
    const [local, domain] = str.split('@');
    if (local && domain) {
      return `${local[0]}***@${domain}`;
    }
  }
```

**Output**: `john.doe@example.com` → `j***@example.com`

**Rationale**: Preserves domain for debugging (e.g., checking if corporate vs personal email) while hiding user identity.

### Phone/IP Masking

```typescript
if (fieldType === 'phone' || fieldType === 'ip' || fieldType === 'ip_address') {
  return str.slice(0, 3) + '***' + str.slice(-2);
}
```

**Output**: `555-123-4567` → `555***67`

**Rationale**: Shows prefix (useful for area code/subnet analysis) and suffix for uniqueness checking.

### Generic Masking

```typescript
  // Default: show first and last characters
  if (str.length > 4) {
    return str[0] + '***' + str[str.length - 1];
  }

  return '[REDACTED]';
}
```

**Output**: `hunter2` → `h***2`

**Rationale**: Preserves minimal information for correlation while protecting actual value. Short strings (<5 chars) fully redacted to prevent trivial brute force.

## Custom Field Detection

### Adding Project-Specific Fields

```typescript
// Extend base sets with domain-specific fields
export const PROJECT_REDACT_FIELDS = new Set([
  ...REDACT_FIELDS,
  'internal_api_key',
  'webhook_secret',
  'encryption_key',
]);

export const PROJECT_MASK_FIELDS = new Set([...MASK_FIELDS, 'employee_id', 'customer_code']);
```

### Pattern-Based Field Detection

For dynamic field names:

```typescript
function shouldRedactField(key: string): boolean {
  const lowerKey = key.toLowerCase();

  // Check explicit sets
  if (REDACT_FIELDS.has(lowerKey)) return true;

  // Check patterns
  if (/_secret$/.test(lowerKey)) return true;
  if (/_key$/.test(lowerKey)) return true;
  if (/^api_/.test(lowerKey)) return true;

  return false;
}
```

**Common patterns**:

- Fields ending in `_secret`, `_key`, `_token`
- Fields starting with `api_`, `auth_`, `secret_`
- Fields containing `password`, `credential`, `private`

## Nested Object Handling

Field detection works recursively:

```typescript
const input = {
  user: {
    name: 'John',
    credentials: {
      password: 'secret',
      email: 'john@example.com',
    },
  },
};

const result = redactValue(input);
// {
//   user: {
//     name: 'John',
//     credentials: {
//       password: '[REDACTED]',
//       email: 'j***@example.com',
//     },
//   },
// }
```

## Array Handling

Arrays are mapped element-wise:

```typescript
const input = {
  users: [
    { name: 'John', password: 'secret1' },
    { name: 'Jane', password: 'secret2' },
  ],
};

const result = redactValue(input);
// {
//   users: [
//     { name: 'John', password: '[REDACTED]' },
//     { name: 'Jane', password: '[REDACTED]' },
//   ],
// }
```

## Performance Considerations

- **Set lookups**: `O(1)` average case for field detection
- **Case conversion**: Adds overhead; consider pre-computing lowercase keys
- **Deep recursion**: May hit stack limits on extremely nested objects (consider iterative approach for production)

## Testing Field Detection

```typescript
describe('field detection', () => {
  it('redacts password fields case-insensitively', () => {
    expect(redactObject({ password: 'secret' })).toEqual({ password: '[REDACTED]' });
    expect(redactObject({ Password: 'secret' })).toEqual({ Password: '[REDACTED]' });
    expect(redactObject({ PASSWORD: 'secret' })).toEqual({ PASSWORD: '[REDACTED]' });
  });

  it('masks email fields', () => {
    const result = redactObject({ email: 'john@example.com' });
    expect(result.email).toBe('j***@example.com');
  });

  it('handles nested sensitive fields', () => {
    const input = {
      user: {
        credentials: {
          password: 'secret',
        },
      },
    };
    const result = redactObject(input);
    expect((result.user as any).credentials.password).toBe('[REDACTED]');
  });
});
```
