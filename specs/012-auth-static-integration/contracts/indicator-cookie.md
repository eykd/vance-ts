# Contract: Auth Indicator Cookie

**Feature**: 012-auth-static-integration | **Date**: 2026-03-13

## Cookie Specification

| Attribute | Value                              |
| --------- | ---------------------------------- |
| Name      | `__Host-auth_status`               |
| Value     | `1` (present = authenticated)      |
| Secure    | Yes                                |
| HttpOnly  | No (must be JS-readable)           |
| SameSite  | Lax                                |
| Path      | `/`                                |
| Max-Age   | `2592000` (30 days)                |
| Domain    | Not set (defaults to current host) |

## Set-Cookie Headers

### On Sign-In Success

```http
Set-Cookie: __Host-auth_status=1; Secure; SameSite=Lax; Path=/; Max-Age=2592000
```

Appended alongside the existing session cookie:

```http
Set-Cookie: __Host-better-auth.session_token=<token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000
Set-Cookie: __Host-auth_status=1; Secure; SameSite=Lax; Path=/; Max-Age=2592000
```

### On Sign-Out

```http
Set-Cookie: __Host-auth_status=; Secure; SameSite=Lax; Path=/; Max-Age=0
```

Appended alongside the existing session cookie clear:

```http
Set-Cookie: __Host-better-auth.session_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
Set-Cookie: __Host-auth_status=; Secure; SameSite=Lax; Path=/; Max-Age=0
```

## Client-Side Contract

### Alpine.js Auth Store

```javascript
// Registered before Alpine.start()
Alpine.store('auth', {
  isAuthenticated: document.cookie.split(';').some((c) => c.trim() === '__Host-auth_status=1'),
});
```

### Consuming Components

```html
<!-- Navbar: show auth links when unauthenticated -->
<div x-show="!$store.auth?.isAuthenticated">
  <a href="/auth/sign-in">Sign In</a>
  <a href="/auth/sign-up">Sign Up</a>
</div>

<!-- Navbar: show dashboard when authenticated -->
<div x-show="$store.auth?.isAuthenticated">
  <a href="/dashboard/">Dashboard</a>
</div>

<!-- Dashboard: redirect guard -->
<div
  x-init="if (!$store.auth?.isAuthenticated) window.location.replace('/auth/sign-in?redirectTo=%2Fdashboard%2F')"
></div>
```

## Security Boundaries

- Cookie is **non-authoritative** — never used for server-side access control
- Server-side `requireAuth` middleware remains the sole gatekeeper for `/app/*` endpoints
- If indicator cookie exists but session is expired, server rejects protected requests
- If indicator cookie is deleted but session is valid, user sees Sign In/Sign Up but remains authenticated server-side
