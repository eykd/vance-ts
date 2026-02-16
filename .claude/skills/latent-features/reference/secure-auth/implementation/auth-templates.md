# Auth Templates

**Purpose**: HTMX + Alpine.js login, register, and error page templates with better-auth integration

**When to read**: During implementation of auth UI pages and form handling

---

## Login Form

Server-rendered login form using HTMX for submission and Alpine.js for client-side state:

```typescript
import { html, safe } from './html';
import type { HtmlEncoder } from '../infrastructure/security/HtmlEncoder';

/**
 * Render the login page.
 * @param returnUrl - Safe redirect URL after login (already validated)
 * @param csrfToken - CSRF token from cookie
 * @param error - Optional error message from previous attempt
 */
export function renderLoginPage(returnUrl: string, csrfToken: string, error?: string): string {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sign In</title>
        <meta
          name="htmx-config"
          content='{"selfRequestsOnly":true,"allowScriptTags":false,"allowEval":false}'
        />
      </head>
      <body>
        <main x-data="{ loading: false, error: '${error ?? ''}' }">
          <h1>Sign In</h1>

          <template x-if="error">
            <div role="alert" class="error">${safe('<span x-text="error"></span>')}</div>
          </template>

          <form
            hx-post="/api/auth/sign-in/email"
            hx-target="body"
            hx-swap="innerHTML"
            hx-indicator="#loading"
            @htmx:before-request="loading = true"
            @htmx:after-request="loading = false"
            @htmx:response-error="error = 'Sign in failed. Please check your credentials.'"
          >
            <input type="hidden" name="_csrf" value="${csrfToken}" />
            <input type="hidden" name="callbackURL" value="${returnUrl}" />

            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              inputmode="email"
            />

            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autocomplete="current-password"
              minlength="12"
            />

            <label>
              <input type="checkbox" name="rememberMe" value="true" checked />
              Remember me
            </label>

            <button type="submit" :disabled="loading">
              <span x-show="!loading">Sign In</span>
              <span x-show="loading">Signing in...</span>
            </button>
          </form>

          <p><a href="/auth/register">Create an account</a></p>
          <p><a href="/auth/forgot-password">Forgot password?</a></p>
        </main>

        <script src="/js/htmx.min.js" nonce="${safe('{{nonce}}')}"></script>
        <script src="/js/alpine.min.js" defer nonce="${safe('{{nonce}}')}"></script>
        ${safe(csrfScript())}
      </body>
    </html>
  `;
}
```

---

## Register Form

```typescript
/**
 * Render the registration page.
 * @param csrfToken - CSRF token from cookie
 * @param error - Optional error message from previous attempt
 */
export function renderRegisterPage(csrfToken: string, error?: string): string {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Create Account</title>
        <meta
          name="htmx-config"
          content='{"selfRequestsOnly":true,"allowScriptTags":false,"allowEval":false}'
        />
      </head>
      <body>
        <main x-data="{ loading: false, error: '${error ?? ''}' }">
          <h1>Create Account</h1>

          <template x-if="error">
            <div role="alert" class="error">${safe('<span x-text="error"></span>')}</div>
          </template>

          <form
            hx-post="/api/auth/sign-up/email"
            hx-target="body"
            hx-swap="innerHTML"
            @htmx:before-request="loading = true"
            @htmx:after-request="loading = false"
            @htmx:response-error.detail="error = mapAuthError($event.detail)"
          >
            <input type="hidden" name="_csrf" value="${csrfToken}" />

            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" required autocomplete="name" />

            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              inputmode="email"
            />

            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autocomplete="new-password"
              minlength="12"
              maxlength="128"
            />
            <small>Must be at least 12 characters</small>

            <button type="submit" :disabled="loading">
              <span x-show="!loading">Create Account</span>
              <span x-show="loading">Creating account...</span>
            </button>
          </form>

          <p><a href="/auth/login">Already have an account? Sign in</a></p>
        </main>

        <script src="/js/htmx.min.js" nonce="${safe('{{nonce}}')}"></script>
        <script src="/js/alpine.min.js" defer nonce="${safe('{{nonce}}')}"></script>
        ${safe(csrfScript())}
      </body>
    </html>
  `;
}
```

---

## Password Reset Request Form

```typescript
/**
 * Render the forgot password page.
 * @param csrfToken - CSRF token from cookie
 * @param success - Whether the reset email was sent
 */
export function renderForgotPasswordPage(csrfToken: string, success?: boolean): string {
  return html`
    <main x-data="{ loading: false, sent: ${success === true ? 'true' : 'false'} }">
      <h1>Reset Password</h1>

      <template x-if="sent">
        <div role="status">
          If an account exists with that email, you will receive a reset link.
        </div>
      </template>

      <template x-if="!sent">
        <form
          hx-post="/api/auth/forget-password"
          hx-swap="outerHTML"
          @htmx:before-request="loading = true"
          @htmx:after-request="loading = false; sent = true"
        >
          <input type="hidden" name="_csrf" value="${csrfToken}" />

          <label for="email">Email</label>
          <input type="email" id="email" name="email" required autocomplete="email" />

          <button type="submit" :disabled="loading">Send Reset Link</button>
        </form>
      </template>

      <p><a href="/auth/login">Back to sign in</a></p>
    </main>
  `;
}
```

**Note**: The success message is intentionally generic ("If an account exists...") to prevent account enumeration.

---

## Error Page Templates

```typescript
/** 401 Unauthorized — session expired or missing */
export function render401Page(): string {
  return html`
    <main>
      <h1>Session Expired</h1>
      <p>Your session has expired. Please sign in again.</p>
      <a href="/auth/login">Sign In</a>
    </main>
  `;
}

/** 403 Forbidden — insufficient permissions */
export function render403Page(): string {
  return html`
    <main>
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <a href="/app">Go to Dashboard</a>
    </main>
  `;
}

/** 429 Too Many Requests — rate limited */
export function render429Page(retryAfter?: string): string {
  return html`
    <main>
      <h1>Too Many Requests</h1>
      <p>You've made too many requests. Please wait a moment and try again.</p>
      ${retryAfter !== undefined ? html`<p>Try again in ${retryAfter} seconds.</p>` : ''}
      <a href="/auth/login">Back to Sign In</a>
    </main>
  `;
}
```

---

## Mapping better-auth Errors to User Messages

better-auth returns errors with status codes and messages. Map these to safe, user-friendly messages:

```typescript
interface AuthErrorMap {
  [key: string]: string;
}

/**
 * Map better-auth error codes/messages to user-friendly strings.
 * Never expose internal error details to the client.
 */
const AUTH_ERROR_MAP: AuthErrorMap = {
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password.',
  USER_ALREADY_EXISTS: 'An account with this email already exists.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before signing in.',
  TOO_MANY_REQUESTS: 'Too many attempts. Please try again later.',
  INVALID_PASSWORD: 'Password must be between 12 and 128 characters.',
  INVALID_EMAIL: 'Please enter a valid email address.',
};

const DEFAULT_ERROR = 'Something went wrong. Please try again.';

/**
 * Get a user-friendly error message from a better-auth API response.
 */
export function mapAuthError(status: number, body?: { message?: string; code?: string }): string {
  if (status === 429) return AUTH_ERROR_MAP['TOO_MANY_REQUESTS'] ?? DEFAULT_ERROR;

  const code = body?.code ?? body?.message ?? '';
  return AUTH_ERROR_MAP[code] ?? DEFAULT_ERROR;
}
```

---

## HTMX Partial Patterns

For HTMX requests, return HTML fragments instead of full pages:

```typescript
app.post('/auth/login', csrfProtection(), async (c) => {
  const auth = createAuth(c.env);
  const formData = await c.req.formData();

  try {
    const result = await auth.api.signInEmail({
      body: {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      },
      headers: c.req.raw.headers,
    });

    const returnUrl = safeRedirectUrl(formData.get('callbackURL') as string, '/app');

    // HTMX: client-side redirect
    if (c.req.header('HX-Request') === 'true') {
      return c.newResponse(null, 200, { 'HX-Redirect': returnUrl });
    }
    return c.redirect(returnUrl);
  } catch (error) {
    const message = mapAuthError(
      error instanceof Error ? 400 : 500,
      error instanceof Error ? { message: error.message } : undefined
    );

    // HTMX: return inline error fragment
    if (c.req.header('HX-Request') === 'true') {
      return c.html(html`<div role="alert" class="error">${message}</div>`);
    }

    return c.html(renderLoginPage('/app', getCsrfCookie(c.req.raw) ?? '', message));
  }
});
```

---

## CSRF Script Helper

Include in all auth pages to wire CSRF tokens into HTMX requests:

```typescript
function csrfScript(): string {
  return `
    <script>
      document.body.addEventListener('htmx:configRequest', function(event) {
        var csrfToken = ('; ' + document.cookie)
          .split('; __Host-csrf=')
          .pop()
          .split(';')
          .shift();
        if (csrfToken) {
          event.detail.headers['X-CSRF-Token'] = csrfToken;
        }
      });
    </script>
  `;
}
```

---

## Testing Strategy

```typescript
describe('Auth Templates', () => {
  it('should encode user-provided error messages', () => {
    const result = renderLoginPage('/app', 'token', '<script>alert("xss")</script>');

    expect(result).not.toContain('<script>alert');
  });

  it('should include CSRF hidden field', () => {
    const result = renderLoginPage('/app', 'my-csrf-token');

    expect(result).toContain('name="_csrf"');
    expect(result).toContain('value="my-csrf-token"');
  });

  it('should include return URL in form', () => {
    const result = renderLoginPage('/app/dashboard', 'token');

    expect(result).toContain('value="/app/dashboard"');
  });
});

describe('mapAuthError', () => {
  it('should map known error codes', () => {
    expect(mapAuthError(400, { code: 'INVALID_EMAIL_OR_PASSWORD' })).toBe(
      'Invalid email or password.'
    );
  });

  it('should return default for unknown errors', () => {
    expect(mapAuthError(500, { code: 'UNKNOWN' })).toBe('Something went wrong. Please try again.');
  });

  it('should handle rate limit status', () => {
    expect(mapAuthError(429)).toBe('Too many attempts. Please try again later.');
  });
});
```

---

## Next Steps

- For XSS prevention in templates → Read `xss-prevention.md`
- For CSRF middleware setup → Read `csrf-protection.md`
- For route protection → Read `hono-auth-middleware.md`
