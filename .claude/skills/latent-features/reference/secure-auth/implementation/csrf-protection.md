# CSRF Protection

**Purpose**: Cross-Site Request Forgery protection using double-submit cookie pattern as Hono middleware

**When to read**: During implementation of form submissions and state-changing operations

**Why this is needed**: better-auth does not provide CSRF protection for custom form endpoints. HTMX forms that POST to your own routes (outside `/api/auth/*`) need CSRF tokens.

---

## Threat Model

**CSRF Attack**: Malicious site tricks user's browser into making unauthorized request to your app

```html
<!-- Evil site: evil.com -->
<form action="https://yourapp.com/app/transfer" method="POST">
  <input name="amount" value="1000" />
  <input name="to" value="attacker" />
</form>
<script>
  document.forms[0].submit();
</script>
```

User's browser automatically includes session cookie — request looks legitimate.

---

## Hono CSRF Middleware

**File**: `src/middleware/csrf.ts`

```typescript
import type { MiddlewareHandler } from 'hono';
import type { AppType } from './auth';

const CSRF_COOKIE = '__Host-csrf';
const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_FIELD = '_csrf';
const PROTECTED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const TOKEN_BYTES = 32; // 256 bits

/**
 * Generate a cryptographically random CSRF token.
 */
function generateCsrfToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Extract CSRF token from request (header first, then form body).
 */
async function extractToken(request: Request): Promise<string | null> {
  // Prefer header (HTMX/AJAX)
  const headerToken = request.headers.get(CSRF_HEADER);
  if (headerToken !== null && headerToken.length > 0) return headerToken;

  // Fallback to form body
  const contentType = request.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await request.clone().formData();
      const formToken = formData.get(CSRF_FIELD);
      if (typeof formToken === 'string' && formToken.length > 0) return formToken;
    } catch {
      // Form parsing failed
    }
  }

  return null;
}

/**
 * Extract CSRF token from cookie.
 */
function getCsrfCookie(request: Request): string | null {
  const cookies = request.headers.get('Cookie') ?? '';
  const match = cookies.split(';').find((c) => c.trim().startsWith(`${CSRF_COOKIE}=`));
  return match?.split('=')[1]?.trim() ?? null;
}

/**
 * Validate Origin/Referer header matches Host for defense-in-depth.
 */
function validateOrigin(request: Request): boolean {
  const host = request.headers.get('Host');
  const origin = request.headers.get('Origin');

  if (origin !== null) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('Referer');
  if (referer !== null) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // No Origin or Referer — allow (some browsers omit on same-origin)
  return true;
}

/**
 * CSRF protection middleware for Hono.
 *
 * On GET: Sets a CSRF cookie (token for JavaScript to read).
 * On POST/PUT/PATCH/DELETE: Validates submitted token matches cookie.
 *
 * @param excludePaths - Paths to skip CSRF checks (e.g., ['/api/auth', '/webhooks'])
 */
export function csrfProtection(
  excludePaths: string[] = ['/api/auth', '/webhooks']
): MiddlewareHandler<AppType> {
  return async (c, next) => {
    const method = c.req.method.toUpperCase();
    const pathname = new URL(c.req.url).pathname;

    // Skip excluded paths
    if (excludePaths.some((path) => pathname.startsWith(path))) {
      await next();
      return;
    }

    // For safe methods: ensure CSRF cookie exists
    if (!PROTECTED_METHODS.has(method)) {
      await next();

      // Set CSRF cookie if not already present
      if (getCsrfCookie(c.req.raw) === null) {
        const token = generateCsrfToken();
        c.header('Set-Cookie', `${CSRF_COOKIE}=${token}; Path=/; SameSite=Lax; Secure`);
      }
      return;
    }

    // For state-changing methods: validate CSRF token
    if (!validateOrigin(c.req.raw)) {
      return c.text('Invalid request origin', 403);
    }

    const cookieToken = getCsrfCookie(c.req.raw);
    if (cookieToken === null) {
      return c.text('Missing CSRF token', 403);
    }

    const submittedToken = await extractToken(c.req.raw);
    if (submittedToken === null) {
      return c.text('Missing CSRF token', 403);
    }

    if (!timingSafeEqual(cookieToken, submittedToken)) {
      return c.text('Invalid CSRF token', 403);
    }

    await next();
  };
}
```

---

## HTMX Integration

Include the CSRF token in all HTMX requests automatically:

```html
<!-- Option 1: JavaScript event listener (recommended) -->
<script>
  document.body.addEventListener('htmx:configRequest', function (event) {
    const csrfToken = getCookie('__Host-csrf');
    if (csrfToken) {
      event.detail.headers['X-CSRF-Token'] = csrfToken;
    }
  });

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
</script>

<!-- Option 2: Global header on body (simpler, but token is static) -->
<body hx-headers='{"X-CSRF-Token": "TOKEN_VALUE"}'>
  <!-- All HTMX requests include this header -->
</body>
```

---

## Traditional Form Integration

For non-HTMX forms, include the token as a hidden field:

```typescript
function csrfField(token: string): string {
  return `<input type="hidden" name="_csrf" value="${HtmlEncoder.encodeForAttribute(token)}">`;
}
```

---

## Defense-in-Depth Layers

1. **CSRF Token** (primary) — Double-submit cookie, constant-time comparison
2. **SameSite Cookies** (secondary) — better-auth sets `SameSite=Lax` on session cookies
3. **Origin Validation** (tertiary) — Check Origin/Referer matches Host
4. **HTTPS Only** (transport) — `Secure` flag on cookies, HSTS header

---

## Testing Strategy

```typescript
describe('CSRF Protection', () => {
  it('should reject POST without CSRF token', async () => {
    const app = new Hono();
    app.use('*', csrfProtection());
    app.post('/submit', (c) => c.text('ok'));

    const res = await app.request('/submit', { method: 'POST' });

    expect(res.status).toBe(403);
  });

  it('should accept POST with valid CSRF token', async () => {
    const token = 'test-token-value';
    const app = new Hono();
    app.use('*', csrfProtection());
    app.post('/submit', (c) => c.text('ok'));

    const res = await app.request('/submit', {
      method: 'POST',
      headers: {
        Cookie: `__Host-csrf=${token}`,
        'X-CSRF-Token': token,
      },
    });

    expect(res.status).toBe(200);
  });

  it('should reject request with mismatched origin', async () => {
    const token = 'test-token-value';
    const app = new Hono();
    app.use('*', csrfProtection());
    app.post('/submit', (c) => c.text('ok'));

    const res = await app.request('https://app.com/submit', {
      method: 'POST',
      headers: {
        Cookie: `__Host-csrf=${token}`,
        'X-CSRF-Token': token,
        Origin: 'https://evil.com',
      },
    });

    expect(res.status).toBe(403);
  });

  it('should skip CSRF for excluded paths', async () => {
    const app = new Hono();
    app.use('*', csrfProtection(['/webhooks']));
    app.post('/webhooks/stripe', (c) => c.text('ok'));

    const res = await app.request('/webhooks/stripe', { method: 'POST' });

    expect(res.status).toBe(200);
  });
});
```

---

## Next Steps

- For XSS prevention in templates → Read `xss-prevention.md`
- For auth page templates → Read `auth-templates.md`
