# URL Sanitization

**Purpose**: Redact sensitive data from URLs before logging (query parameters, path segments containing tokens).

## Core URL Redaction Function

```typescript
// src/infrastructure/logging/urlRedaction.ts

/**
 * Query parameters that should be redacted
 */
const SENSITIVE_PARAMS = new Set([
  'token',
  'key',
  'api_key',
  'apikey',
  'password',
  'secret',
  'auth',
  'access_token',
  'refresh_token',
  'code', // OAuth codes
  'state', // OAuth state (may contain sensitive data)
]);

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Redact sensitive query parameters
    for (const param of SENSITIVE_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, '[REDACTED]');
      }
    }

    // Redact path segments that look like tokens
    const pathSegments = parsed.pathname.split('/');
    const redactedPath = pathSegments
      .map((segment) => {
        // Redact long alphanumeric strings (likely tokens/IDs)
        if (/^[a-zA-Z0-9_-]{32,}$/.test(segment)) {
          return '[ID]';
        }
        return segment;
      })
      .join('/');

    parsed.pathname = redactedPath;

    return parsed.toString();
  } catch {
    // If URL parsing fails, return a safe fallback
    return '[INVALID_URL]';
  }
}
```

## Query Parameter Redaction

### Sensitive Parameter Detection

Common sensitive parameters to redact:

- **Authentication**: `token`, `auth`, `api_key`, `access_token`, `refresh_token`
- **OAuth**: `code`, `state` (contain sensitive state or authorization codes)
- **Secrets**: `secret`, `password`, `key`

**Example**:

```typescript
redactUrl('https://api.example.com/auth?token=abc123&user=john');
// → 'https://api.example.com/auth?token=[REDACTED]&user=john'
```

### Custom Parameter Sets

Extend for domain-specific parameters:

```typescript
const PROJECT_SENSITIVE_PARAMS = new Set([
  ...SENSITIVE_PARAMS,
  'session_id',
  'webhook_secret',
  'api_secret',
]);
```

## Path Segment Redaction

### Token Detection Heuristic

Redacts path segments that match:

- Length ≥32 characters
- Only alphanumeric, underscore, or hyphen characters
- Pattern: `/^[a-zA-Z0-9_-]{32,}$/`

**Rationale**: Most tokens (JWT, session IDs, API keys) are long random strings. 32 characters is a conservative threshold that catches most tokens while avoiding false positives.

**Example**:

```typescript
redactUrl('https://api.example.com/users/abc123def456ghi789jkl012mno345pqr678');
// → 'https://api.example.com/users/[ID]'
```

### False Positive Mitigation

**Problem**: Some legitimate IDs may be long strings.

**Solution**: Use context-aware detection:

```typescript
function redactPathSegment(segment: string, index: number, allSegments: string[]): string {
  // Don't redact known resource names
  const knownResources = ['users', 'tasks', 'orders'];
  if (knownResources.includes(segment)) {
    return segment;
  }

  // Redact long alphanumeric strings
  if (/^[a-zA-Z0-9_-]{32,}$/.test(segment)) {
    return '[ID]';
  }

  return segment;
}
```

## Integration with Logging

### Request Logging

```typescript
// src/presentation/middleware/logging.ts
import { redactUrl } from '../../infrastructure/logging/urlRedaction';

logger.info({
  event: 'http.request.received',
  category: 'application',
  http_method: request.method,
  http_path: new URL(request.url).pathname, // Path only, no query
  http_url: redactUrl(request.url), // Full URL with redaction
});
```

### Sentry Context

```typescript
// src/presentation/middleware/sentryContext.ts
import * as Sentry from '@sentry/cloudflare';
import { redactUrl } from '../../infrastructure/logging/urlRedaction';

export function setSentryContext(request: Request): void {
  Sentry.setContext('request', {
    method: request.method,
    url: redactUrl(request.url),
    cf_ray: request.headers.get('cf-ray'),
  });
}
```

## Advanced URL Sanitization

### Preserving Query Structure

Sometimes you want to preserve parameter names while redacting values:

```typescript
export function redactUrlPreservingStructure(url: string): string {
  try {
    const parsed = new URL(url);

    for (const [key, value] of parsed.searchParams.entries()) {
      if (SENSITIVE_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.set(key, '[REDACTED]');
      }
    }

    return parsed.toString();
  } catch {
    return '[INVALID_URL]';
  }
}
```

**Output**: `?token=abc123&user=john` → `?token=[REDACTED]&user=john`

### Redacting All Query Parameters

For maximum safety, redact all query parameters:

```typescript
export function stripAllQueryParams(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = parsed.search ? '[QUERY_REDACTED]' : '';
    return parsed.toString();
  } catch {
    return '[INVALID_URL]';
  }
}
```

**Output**: `https://api.example.com/auth?token=abc&user=john` → `https://api.example.com/auth[QUERY_REDACTED]`

## Testing URL Sanitization

```typescript
// src/infrastructure/logging/urlRedaction.spec.ts
import { describe, it, expect } from 'vitest';
import { redactUrl } from './urlRedaction';

describe('redactUrl', () => {
  it('redacts sensitive query parameters', () => {
    const url = 'https://api.example.com/auth?token=abc123&user=john';
    const result = redactUrl(url);
    expect(result).toBe('https://api.example.com/auth?token=%5BREDACTED%5D&user=john');
  });

  it('redacts long path segments', () => {
    const url = 'https://api.example.com/users/abc123def456ghi789jkl012mno345pqr678';
    const result = redactUrl(url);
    expect(result).toContain('[ID]');
  });

  it('preserves short path segments', () => {
    const url = 'https://api.example.com/users/123';
    const result = redactUrl(url);
    expect(result).toBe('https://api.example.com/users/123');
  });

  it('handles multiple sensitive parameters', () => {
    const url = 'https://api.example.com/oauth?code=abc&state=xyz&user=john';
    const result = redactUrl(url);
    expect(result).toContain('code=%5BREDACTED%5D');
    expect(result).toContain('state=%5BREDACTED%5D');
    expect(result).toContain('user=john');
  });

  it('returns safe fallback for invalid URLs', () => {
    const url = 'not-a-valid-url';
    const result = redactUrl(url);
    expect(result).toBe('[INVALID_URL]');
  });
});
```

## Performance Considerations

- **URL parsing**: `new URL()` is fast but can throw for invalid URLs
- **Regex evaluation**: Path segment detection adds O(n) overhead per segment
- **Query parameter iteration**: O(n) per parameter

For high-throughput scenarios, consider caching redacted URLs:

```typescript
const urlCache = new LRUCache<string, string>({ max: 1000 });

function cachedRedactUrl(url: string): string {
  if (urlCache.has(url)) {
    return urlCache.get(url)!;
  }

  const result = redactUrl(url);
  urlCache.set(url, result);
  return result;
}
```

## Compliance Alignment

URL sanitization aligns with:

- **OWASP Logging Cheat Sheet**: Never log authentication tokens or session identifiers in URLs
- **RFC 3986 Section 7.5**: URI producers should not include sensitive data in URIs
- **GDPR Article 32**: Pseudonymization of personal data (URL parameters may contain PII)

## Common Pitfalls

❌ **Logging full URLs without redaction**:

```typescript
logger.info({ url: request.url }); // May contain tokens!
```

✅ **Always redact URLs**:

```typescript
logger.info({ url: redactUrl(request.url) });
```

❌ **Only redacting known parameters**:

```typescript
// Misses custom parameters
parsed.searchParams.delete('token');
```

✅ **Comprehensive redaction**:

```typescript
// Catches all sensitive parameters via set membership
for (const param of SENSITIVE_PARAMS) {
  if (parsed.searchParams.has(param)) {
    parsed.searchParams.set(param, '[REDACTED]');
  }
}
```
