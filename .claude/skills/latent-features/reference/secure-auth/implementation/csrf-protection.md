# CSRF Protection

**Purpose**: Cross-Site Request Forgery protection using signed double-submit cookie pattern

**When to read**: During implementation of form submissions and state-changing operations

**Source**: Full implementation in `docs/secure-authentication-guide.md` (lines 1479-1731)

---

## Threat Model

**CSRF Attack**: Malicious site tricks user's browser into making unauthorized request to your app

**Example**:

```html
<!-- Evil site: evil.com -->
<form action="https://yourapp.com/transfer" method="POST">
  <input name="amount" value="1000" />
  <input name="to" value="attacker" />
</form>
<script>
  document.forms[0].submit();
</script>
```

User's browser automatically includes session cookie → Request looks legitimate!

---

## Defense Strategy: Signed Double-Submit Cookie

**How it works**:

1. Generate CSRF token on session creation
2. Store token in session (server-side)
3. Send token to client in cookie (JavaScript-readable)
4. Client includes token in header or form field for state-changing requests
5. Server validates submitted token matches session token

**Why this works**:

- Attacker's site can't read your cookies (Same-Origin Policy)
- Attacker can't forge valid token
- Combined with SameSite cookies for defense-in-depth

---

## CSRF Token Generation

```typescript
export class CsrfTokenGenerator {
  private static readonly BYTES_LENGTH = 32; // 256 bits

  generate(): string {
    const bytes = new Uint8Array(CsrfTokenGenerator.BYTES_LENGTH);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
```

**Key requirements**:

- Cryptographically random (not predictable)
- Unique per session (not reused)
- Sufficient entropy (256 bits)

---

## CSRF Middleware

**File**: `src/presentation/middleware/csrfProtection.ts`

```typescript
export interface CsrfConfig {
  cookieName: string; // "__Host-csrf"
  headerName: string; // "X-CSRF-Token"
  formFieldName: string; // "_csrf"
  protectedMethods: string[]; // ["POST", "PUT", "PATCH", "DELETE"]
  excludePaths: string[]; // ["/api/webhooks"]
}

export function createCsrfMiddleware(config: Partial<CsrfConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return async function csrfMiddleware(ctx: Context, next: Next): Promise<Response> {
    const { request, session } = ctx;
    const method = request.method.toUpperCase();

    // Skip for safe methods (GET, HEAD, OPTIONS)
    if (!cfg.protectedMethods.includes(method)) {
      return next();
    }

    // Skip for excluded paths (webhooks, etc.)
    const url = new URL(request.url);
    if (cfg.excludePaths.some((path) => url.pathname.startsWith(path))) {
      return next();
    }

    // Require valid session
    if (session === undefined) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Extract token from request
    const submittedToken = await extractCsrfToken(request, cfg);

    if (submittedToken === null) {
      return csrfError('Missing CSRF token');
    }

    // Validate against session token (constant-time comparison)
    if (!session.validateCsrfToken(submittedToken)) {
      return csrfError('Invalid CSRF token');
    }

    // Also verify Origin/Referer header for defense-in-depth
    if (!validateOrigin(request)) {
      return csrfError('Invalid request origin');
    }

    return next();
  };
}

async function extractCsrfToken(request: Request, config: CsrfConfig): Promise<string | null> {
  // First check header (preferred for HTMX/AJAX)
  const headerToken = request.headers.get(config.headerName);
  if (headerToken !== null && headerToken.length > 0) {
    return headerToken;
  }

  // Then check form body (traditional form submissions)
  const contentType = request.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const cloned = request.clone();
      const formData = await cloned.formData();
      const formToken = formData.get(config.formFieldName);

      if (typeof formToken === 'string' && formToken.length > 0) {
        return formToken;
      }
    } catch {
      // Form parsing failed
    }
  }

  return null;
}

function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  const host = request.headers.get('Host');

  // If no Origin, check Referer
  if (origin === null) {
    const referer = request.headers.get('Referer');
    if (referer === null) return true; // Or false for stricter security

    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }

  // Validate Origin matches Host
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}
```

---

## CSRF Cookie Configuration

**Must be JavaScript-readable** (NOT HttpOnly):

```typescript
export function csrfCookieHeader(token: string, secure: boolean): string {
  const parts = [
    `__Host-csrf=${token}`,
    'Path=/',
    'SameSite=Lax', // Or Strict for higher security
  ];

  if (secure) {
    parts.push('Secure');
  }

  // Note: NOT HttpOnly - JavaScript needs to read this
  return parts.join('; ');
}
```

**Why not HttpOnly?**

- HTMX needs to read token to include in requests
- Safe because token is also validated server-side
- Attacker's site still can't read it (Same-Origin Policy)

---

## HTMX Integration

**Include token in all HTMX requests**:

```html
<!-- Option 1: Global header configuration on <body> -->
<body hx-headers='{"X-CSRF-Token": "TOKEN_VALUE"}'>
  <!-- All HTMX requests will include this header -->
</body>

<!-- Option 2: JavaScript event listener -->
<script>
  document.addEventListener('DOMContentLoaded', function () {
    document.body.addEventListener('htmx:configRequest', function (event) {
      // Read from cookie and add to request
      const csrfToken = getCookie('__Host-csrf');
      event.detail.headers['X-CSRF-Token'] = csrfToken;
    });
  });

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
</script>
```

---

## Traditional Form Integration

**Hidden field for non-HTMX forms**:

```typescript
export function csrfField(csrfToken: string): string {
  return `<input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">`;
}
```

```html
<form method="POST" action="/submit">
  <!-- Include CSRF token -->
  <input type="hidden" name="_csrf" value="TOKEN_VALUE" />

  <!-- Form fields -->
  <input type="text" name="username" />
  <button type="submit">Submit</button>
</form>
```

---

## Defense-in-Depth Layers

1. **CSRF Token** (primary defense)
   - Unique per session
   - Validated on state-changing requests
   - Constant-time comparison

2. **SameSite Cookies** (secondary defense)
   - `SameSite=Lax`: Protects POST/PUT/DELETE, allows top-level GET
   - `SameSite=Strict`: Maximum protection, may break legitimate flows

3. **Origin Validation** (tertiary defense)
   - Check Origin header matches Host
   - Fallback to Referer header
   - Reject cross-origin requests

4. **HTTPS Only** (transport security)
   - Secure flag on cookies
   - HSTS header
   - Prevents MITM attacks

---

## Exclusion Patterns

**When to exclude CSRF protection**:

- Webhooks from external services (no session)
- Public APIs with API key authentication
- Read-only endpoints (GET requests)

```typescript
const csrfMiddleware = createCsrfMiddleware({
  excludePaths: [
    '/api/webhooks', // External webhooks
    '/api/public', // Public API
  ],
});
```

**Important**: Only exclude paths that:

- Don't require authentication
- Don't modify state
- Have alternative authentication (API keys, signatures)

---

## Security Considerations

1. **Token rotation**: Regenerate token on privilege escalation
2. **Constant-time comparison**: Prevents timing attacks on token validation
3. **Token scope**: One token per session (not per request)
4. **Token storage**: Server-side (in session), not just in cookie
5. **HTTPS required**: Without HTTPS, tokens can be stolen via MITM

---

## Testing Strategy

```typescript
describe('CSRF Protection', () => {
  it('should reject POST without CSRF token', async () => {
    const request = new Request('https://app.com/submit', {
      method: 'POST',
      headers: { Cookie: '__Host-session=valid_session' },
    });

    const response = await csrfMiddleware(mockContext(request), mockNext);

    expect(response.status).toBe(403);
  });

  it('should accept POST with valid CSRF token', async () => {
    const request = new Request('https://app.com/submit', {
      method: 'POST',
      headers: {
        Cookie: '__Host-session=valid_session',
        'X-CSRF-Token': 'valid_token',
      },
    });

    const response = await csrfMiddleware(mockContext(request), mockNext);

    expect(response.status).toBe(200);
  });

  it('should reject request with mismatched origin', async () => {
    const request = new Request('https://app.com/submit', {
      method: 'POST',
      headers: {
        Cookie: '__Host-session=valid_session',
        'X-CSRF-Token': 'valid_token',
        Origin: 'https://evil.com',
      },
    });

    const response = await csrfMiddleware(mockContext(request), mockNext);

    expect(response.status).toBe(403);
  });
});
```

---

## Common Pitfalls

1. **Using HttpOnly for CSRF cookie** - JavaScript can't read it, breaks HTMX
2. **Not validating Origin** - Token alone isn't sufficient
3. **Sequential token comparison** - Vulnerable to timing attacks
4. **Reusing tokens across sessions** - Reduces security
5. **Excluding too many paths** - Reduces protection coverage

---

## Next Steps

- For XSS prevention → Read `xss-prevention.md`
- For HTMX security configuration → Read `htmx-alpine-security.md`
- For complete authentication flow → Read full guide sections on AuthHandlers
