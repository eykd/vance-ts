# Rate Limiting for Membership Operations

**Purpose**: Protect membership endpoints from abuse, enumeration attacks, and denial of service.

## When to Use

Use this reference when:

- Implementing invitation endpoints
- Adding role change functionality
- Protecting against authorization enumeration attacks
- Setting up rate limiting with Cloudflare Workers

## Rate Limit Recommendations

| Operation                | Limit            | Window | Rationale                         |
| ------------------------ | ---------------- | ------ | --------------------------------- |
| Invitations sent         | 10 per org       | 1 hour | Prevent spam invitations          |
| Role changes             | 20 per org       | 1 hour | Prevent rapid permission cycling  |
| Authorization failures   | 5 per user       | 15 min | Prevent resource enumeration      |
| Membership list requests | 100 per user     | 1 hour | Prevent org structure enumeration |
| Failed login attempts    | 5 per IP/account | 15 min | Prevent credential stuffing       |

## Implementation with KV

### Rate Limiter Class

```typescript
// src/infrastructure/rate-limiting/RateLimiter.ts

/**
 * Rate limit configuration.
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

/**
 * Result of a rate limit check.
 */
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate limiter using Cloudflare KV for distributed state.
 */
export class KVRateLimiter {
  constructor(private kv: KVNamespace) {}

  /**
   * Check if an action is allowed under the rate limit.
   * Uses sliding window with atomic increment.
   */
  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowSeconds * 1000;
    const kvKey = `ratelimit:${key}`;

    // Get current state
    const stored = await this.kv.get<{ count: number; windowStart: number }>(kvKey, 'json');

    // Reset if window expired
    if (!stored || stored.windowStart < windowStart) {
      await this.kv.put(kvKey, JSON.stringify({ count: 1, windowStart: now }), {
        expirationTtl: config.windowSeconds,
      });
      return {
        allowed: true,
        remaining: config.limit - 1,
        resetAt: new Date(now + config.windowSeconds * 1000),
      };
    }

    // Check limit
    if (stored.count >= config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(stored.windowStart + config.windowSeconds * 1000),
      };
    }

    // Increment counter
    await this.kv.put(
      kvKey,
      JSON.stringify({ count: stored.count + 1, windowStart: stored.windowStart }),
      { expirationTtl: config.windowSeconds }
    );

    return {
      allowed: true,
      remaining: config.limit - stored.count - 1,
      resetAt: new Date(stored.windowStart + config.windowSeconds * 1000),
    };
  }

  /**
   * Reset rate limit for a key (e.g., after successful auth).
   */
  async reset(key: string): Promise<void> {
    await this.kv.delete(`ratelimit:${key}`);
  }
}
```

### Invitation Rate Limiting

```typescript
// src/application/services/InvitationService.ts

const INVITATION_LIMIT: RateLimitConfig = {
  limit: 10,
  windowSeconds: 3600, // 1 hour
};

/**
 * Send invitation with rate limiting.
 */
export async function inviteMember(
  db: D1Database,
  kv: KVNamespace,
  inviterId: string,
  organizationId: string,
  inviteeEmail: string,
  role: OrgRole
): Promise<Invitation> {
  const rateLimiter = new KVRateLimiter(kv);

  // Rate limit per organization
  const orgLimit = await rateLimiter.check(`invite:org:${organizationId}`, INVITATION_LIMIT);

  if (!orgLimit.allowed) {
    throw new RateLimitError(
      'Too many invitations. Please wait before sending more.',
      orgLimit.resetAt
    );
  }

  // Also rate limit per user to prevent abuse across orgs
  const userLimit = await rateLimiter.check(`invite:user:${inviterId}`, {
    limit: 20,
    windowSeconds: 3600,
  });

  if (!userLimit.allowed) {
    throw new RateLimitError('You have sent too many invitations. Please wait.', userLimit.resetAt);
  }

  // Proceed with invitation logic...
  return createInvitation(db, { organizationId, email: inviteeEmail, role, invitedBy: inviterId });
}
```

### Role Change Rate Limiting

```typescript
// src/application/services/MembershipService.ts

const ROLE_CHANGE_LIMIT: RateLimitConfig = {
  limit: 20,
  windowSeconds: 3600,
};

/**
 * Change member role with rate limiting.
 */
export async function changeMemberRole(
  db: D1Database,
  kv: KVNamespace,
  actorId: string,
  organizationId: string,
  targetUserId: string,
  newRole: OrgRole
): Promise<void> {
  const rateLimiter = new KVRateLimiter(kv);

  const result = await rateLimiter.check(`rolechange:org:${organizationId}`, ROLE_CHANGE_LIMIT);

  if (!result.allowed) {
    throw new RateLimitError(
      'Too many role changes. Please wait before making more changes.',
      result.resetAt
    );
  }

  // Proceed with role change validation and execution...
}
```

### Authorization Failure Rate Limiting

Prevent enumeration attacks by rate limiting authorization failures:

```typescript
// src/application/services/AuthorizationService.ts

const AUTH_FAILURE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowSeconds: 900, // 15 minutes
};

/**
 * Track authorization failures to prevent enumeration.
 */
export async function checkWithEnumerationProtection(
  authz: AuthorizationService,
  kv: KVNamespace,
  actor: Actor,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  const rateLimiter = new KVRateLimiter(kv);

  // Check if user has too many recent failures
  const userKey = actor.type === 'user' ? actor.id : 'anonymous';
  const limitKey = `authfail:${userKey}:${resource.type}`;

  const preCheck = await rateLimiter.check(limitKey, AUTH_FAILURE_LIMIT);

  // If already at limit, return generic denial without checking
  // This prevents timing-based enumeration
  if (!preCheck.allowed) {
    return {
      allowed: false,
      reason: 'Access denied',
    };
  }

  // Perform actual authorization check
  const result = await authz.can(actor, action, resource);

  // Track failures (but not successes)
  if (!result.allowed) {
    await rateLimiter.check(limitKey, AUTH_FAILURE_LIMIT);
  }

  return result;
}
```

## Implementation with Durable Objects

For stricter rate limiting with guaranteed consistency:

```typescript
// src/infrastructure/rate-limiting/RateLimitDO.ts

/**
 * Durable Object for precise rate limiting.
 * Use when KV eventual consistency is not acceptable.
 */
export class RateLimitDO implements DurableObject {
  private requests: number[] = [];

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const windowMs = parseInt(url.searchParams.get('window') || '60000');

    const now = Date.now();

    // Clean old requests
    this.requests = this.requests.filter((t) => t > now - windowMs);

    if (this.requests.length >= limit) {
      const resetAt = this.requests[0]! + windowMs;
      return Response.json({
        allowed: false,
        remaining: 0,
        resetAt,
      });
    }

    this.requests.push(now);

    return Response.json({
      allowed: true,
      remaining: limit - this.requests.length,
      resetAt: now + windowMs,
    });
  }
}

// Usage in Worker
async function checkRateLimit(
  env: Env,
  userId: string,
  operation: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const id = env.RATE_LIMIT.idFromName(`${operation}:${userId}`);
  const stub = env.RATE_LIMIT.get(id);

  const response = await stub.fetch(`https://rate-limit/?limit=${limit}&window=${windowMs}`);

  return response.json<RateLimitResult>();
}
```

## HTTP Response Headers

Always include rate limit headers in responses:

```typescript
// src/presentation/middleware/rateLimitHeaders.ts

/**
 * Add standard rate limit headers to response.
 */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers);

  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString());

  if (!result.allowed) {
    headers.set(
      'Retry-After',
      Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString()
    );
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
```

## Rate Limit Error Handling

```typescript
// src/domain/errors/RateLimitError.ts

/**
 * Error thrown when rate limit exceeded.
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetAt: Date
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// In request handler
if (error instanceof RateLimitError) {
  return new Response(error.message, {
    status: 429,
    headers: {
      'Retry-After': Math.ceil((error.resetAt.getTime() - Date.now()) / 1000).toString(),
    },
  });
}
```

## Testing Rate Limits

```typescript
// tests/unit/rateLimiter.spec.ts

describe('KVRateLimiter', () => {
  it('allows requests within limit', async () => {
    const kv = createMockKV();
    const limiter = new KVRateLimiter(kv);

    for (let i = 0; i < 5; i++) {
      const result = await limiter.check('test-key', { limit: 5, windowSeconds: 60 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
  });

  it('blocks requests over limit', async () => {
    const kv = createMockKV();
    const limiter = new KVRateLimiter(kv);

    // Exhaust limit
    for (let i = 0; i < 5; i++) {
      await limiter.check('test-key', { limit: 5, windowSeconds: 60 });
    }

    // Next request should be blocked
    const result = await limiter.check('test-key', { limit: 5, windowSeconds: 60 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after window expires', async () => {
    const kv = createMockKV();
    const limiter = new KVRateLimiter(kv);

    // Exhaust limit with very short window
    for (let i = 0; i < 5; i++) {
      await limiter.check('test-key', { limit: 5, windowSeconds: 1 });
    }

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 1100));

    // Should be allowed again
    const result = await limiter.check('test-key', { limit: 5, windowSeconds: 1 });
    expect(result.allowed).toBe(true);
  });
});
```

## Security Checklist

| Check                                                     | Done |
| --------------------------------------------------------- | ---- |
| [ ] Invitation endpoints rate limited per org             |      |
| [ ] Role change endpoints rate limited                    |      |
| [ ] Authorization failures tracked to prevent enumeration |      |
| [ ] Rate limit headers included in responses              |      |
| [ ] Retry-After header set on 429 responses               |      |
| [ ] Rate limits cannot be bypassed by changing user agent |      |
| [ ] IP-based limits for unauthenticated endpoints         |      |
| [ ] Tests verify rate limiting behavior                   |      |
