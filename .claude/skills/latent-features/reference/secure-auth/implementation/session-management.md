# Session Management with Cloudflare KV

**Purpose**: Secure session storage and management using Cloudflare KV

**When to read**: During implementation of session persistence layer

**Source**: Full implementation in `docs/secure-authentication-guide.md` (lines 1322-1476)

---

## Architecture

**Why KV for sessions?**

- Fast, edge-replicated (low latency worldwide)
- Built-in TTL for automatic session expiration
- Globally consistent for Workers
- Suitable for ephemeral data (sessions)

**Why D1 for users?**

- Relational data structure
- Durable, persistent storage
- ACID transactions
- Better for long-lived data

---

## Session Data Structure

```typescript
export interface SessionData {
  readonly sessionId: string;
  readonly userId: string;
  readonly createdAt: string; // ISO 8601
  readonly expiresAt: string; // ISO 8601
  readonly lastActivityAt: string; // ISO 8601
  readonly ipAddress: string; // For anomaly detection
  readonly userAgent: string; // For anomaly detection
  readonly csrfToken: string; // Bound to session
}
```

**Key naming**: `session:{sessionId}` (e.g., `session:abc123...xyz`)

---

## KV Session Repository

**File**: `src/infrastructure/repositories/KVSessionRepository.ts`

```typescript
export class KVSessionRepository implements SessionRepository {
  private static readonly KEY_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';

  constructor(private readonly kv: KVNamespace) {}

  async save(session: Session, ttlSeconds: number): Promise<void> {
    const key = `${KVSessionRepository.KEY_PREFIX}${session.sessionId}`;
    const data = JSON.stringify(session.toJSON());

    await this.kv.put(key, data, {
      expirationTtl: ttlSeconds, // KV auto-deletes after TTL
    });

    // Track session by user for bulk operations
    await this.addToUserSessions(session.userId, session.sessionId, ttlSeconds);
  }

  async findById(sessionId: string): Promise<Session | null> {
    const key = `${KVSessionRepository.KEY_PREFIX}${sessionId}`;
    const data = await this.kv.get(key);

    if (data === null) return null;

    try {
      const sessionData = JSON.parse(data) as SessionData;
      return Session.fromData(sessionData);
    } catch {
      await this.delete(sessionId); // Invalid data, clean up
      return null;
    }
  }

  async delete(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (session !== null) {
      await this.removeFromUserSessions(session.userId, sessionId);
    }

    const key = `${KVSessionRepository.KEY_PREFIX}${sessionId}`;
    await this.kv.delete(key);
  }

  async deleteAllForUser(userId: string): Promise<void> {
    const sessionIds = await this.getUserSessionIds(userId);

    // Delete all sessions for this user
    await Promise.all(
      sessionIds.map((id) => this.kv.delete(`${KVSessionRepository.KEY_PREFIX}${id}`))
    );

    await this.kv.delete(`${KVSessionRepository.USER_SESSIONS_PREFIX}${userId}`);
  }

  async updateActivity(session: Session, ttlSeconds: number): Promise<void> {
    const updated = session.withUpdatedActivity();
    await this.save(updated, ttlSeconds);
  }

  private async getUserSessionIds(userId: string): Promise<string[]> {
    const key = `${KVSessionRepository.USER_SESSIONS_PREFIX}${userId}`;
    const data = await this.kv.get(key);

    if (data === null) return [];

    try {
      return JSON.parse(data) as string[];
    } catch {
      return [];
    }
  }
}
```

---

## Session Configuration

**wrangler.jsonc**:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "your-sessions-kv-id",
    },
  ],
  "vars": {
    "SESSION_DURATION_SECONDS": "86400", // 24 hours
    "SESSION_COOKIE_NAME": "__Host-session", // __Host- prefix for security
    "CSRF_COOKIE_NAME": "__Host-csrf",
  },
}
```

**Key points**:

- `__Host-` cookie prefix requires Secure + Path=/ + no Domain
- Session duration: 24 hours is typical, adjust based on security needs
- Separate KV namespace for sessions (not mixed with other data)

---

## Cookie Security

**Session cookie must have**:

- `HttpOnly` - Not accessible via JavaScript (XSS protection)
- `Secure` - HTTPS only (MITM protection)
- `SameSite=Lax` - CSRF protection (or `Strict` for higher security)
- `Path=/` - Available to entire application
- `__Host-` prefix - Additional security requirements enforced

```typescript
function setSessionCookie(sessionId: string, secure: boolean): string {
  const parts = [
    `__Host-session=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=86400`, // 24 hours
  ];

  if (secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}
```

---

## Session Lifecycle

### 1. Create Session (Login)

```typescript
// After successful authentication
const sessionId = new SessionIdGenerator().generate();
const csrfToken = new CsrfTokenGenerator().generate();

const session = Session.create({
  sessionId: SessionId.create(sessionId),
  userId: user.id,
  ipAddress: request.headers.get('CF-Connecting-IP') ?? 'unknown',
  userAgent: request.headers.get('User-Agent') ?? 'unknown',
  csrfToken: CsrfToken.create(csrfToken),
  durationSeconds: 86400,
});

await sessionRepository.save(session, 86400);

// Set cookies
const headers = new Headers();
headers.append('Set-Cookie', setSessionCookie(sessionId, true));
headers.append('Set-Cookie', setCsrfCookie(csrfToken, true));

return new Response('Login successful', { headers });
```

### 2. Validate Session (Every Request)

```typescript
async function validateSession(
  request: Request,
  sessionRepository: SessionRepository
): Promise<Session | null> {
  const cookies = parseCookies(request.headers.get('Cookie') ?? '');
  const sessionId = cookies['__Host-session'];

  if (!sessionId) return null;

  const session = await sessionRepository.findById(sessionId);

  if (session === null) return null;
  if (session.isExpired()) {
    await sessionRepository.delete(sessionId);
    return null;
  }

  // Refresh activity if needed
  if (session.needsRefresh(900)) {
    // 15-minute idle timeout
    await sessionRepository.updateActivity(session, 86400);
  }

  return session;
}
```

### 3. Destroy Session (Logout)

```typescript
async function logout(request: Request, sessionRepository: SessionRepository): Promise<Response> {
  const cookies = parseCookies(request.headers.get('Cookie') ?? '');
  const sessionId = cookies['__Host-session'];

  if (sessionId) {
    await sessionRepository.delete(sessionId);
  }

  // Clear cookies
  const headers = new Headers();
  headers.append('Set-Cookie', clearSessionCookie());
  headers.append('Set-Cookie', clearCsrfCookie());

  return new Response('Logged out', { headers });
}

function clearSessionCookie(): string {
  return '__Host-session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}
```

### 4. Revoke All Sessions (Password Change)

```typescript
async function handlePasswordChange(
  userId: string,
  sessionRepository: SessionRepository
): Promise<void> {
  // Delete all sessions for security
  await sessionRepository.deleteAllForUser(userId);

  // User must log in again with new password
}
```

---

## Session ID Generation

```typescript
export class SessionIdGenerator {
  private static readonly BYTES_LENGTH = 32; // 256 bits

  generate(): string {
    const bytes = new Uint8Array(SessionIdGenerator.BYTES_LENGTH);
    crypto.getRandomValues(bytes);
    return this.toUrlSafeBase64(bytes);
  }

  isValid(sessionId: string): boolean {
    const expectedLength = Math.ceil((SessionIdGenerator.BYTES_LENGTH * 4) / 3);
    if (sessionId.length !== expectedLength) return false;
    return /^[A-Za-z0-9_-]+$/.test(sessionId);
  }

  private toUrlSafeBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
```

**Security requirements**:

- At least 128 bits of entropy (we use 256 bits)
- Cryptographically secure random generation
- URL-safe encoding (no special characters)
- Unpredictable (not sequential or guessable)

---

## Security Considerations

1. **Session fixation**: Always regenerate session ID after login
2. **Session hijacking**: Bind session to IP/User-Agent, monitor for anomalies
3. **Session expiration**: Implement both absolute (24h) and idle (15min) timeouts
4. **Logout everywhere**: Support bulk session revocation (password change, security breach)
5. **CSRF binding**: Each session has unique CSRF token
6. **No session data in cookies**: Only session ID in cookie, data in KV

---

## Testing Strategy

```typescript
describe('KVSessionRepository', () => {
  it('should save and retrieve session', async () => {
    const session = Session.create({...});
    await repo.save(session, 3600);

    const retrieved = await repo.findById(session.sessionId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.userId).toBe(session.userId);
  });

  it('should auto-expire after TTL', async () => {
    const session = Session.create({...});
    await repo.save(session, 1);  // 1 second TTL

    await new Promise(resolve => setTimeout(resolve, 1500));

    const retrieved = await repo.findById(session.sessionId);
    expect(retrieved).toBeNull();
  });

  it('should delete all sessions for user', async () => {
    const session1 = Session.create({ userId: 'user123', ... });
    const session2 = Session.create({ userId: 'user123', ... });

    await repo.save(session1, 3600);
    await repo.save(session2, 3600);

    await repo.deleteAllForUser('user123');

    expect(await repo.findById(session1.sessionId)).toBeNull();
    expect(await repo.findById(session2.sessionId)).toBeNull();
  });
});
```

---

## Next Steps

- For CSRF protection → Read `csrf-protection.md`
- For authentication handlers → Read full guide sections on AuthHandlers
- For rate limiting → Read full guide sections on KVRateLimiter
