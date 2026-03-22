# Data Model: Auth-Static Site Integration

**Feature**: 012-auth-static-integration | **Date**: 2026-03-13

## Entities

### Auth Indicator Cookie (New)

Not a database entity — a browser cookie used as a UI signal.

| Property | Type   | Description                                         |
| -------- | ------ | --------------------------------------------------- |
| name     | string | `auth_status` (constant)                            |
| value    | string | `1` when authenticated (absent when not)            |
| Secure   | flag   | HTTPS-only transmission                             |
| SameSite | string | `Lax` (allows top-level navigations)                |
| Path     | string | `/` (available on all pages)                        |
| Max-Age  | number | `2592000` (30 days, matches session cookie)         |
| HttpOnly | flag   | **NOT set** (must be readable by `document.cookie`) |

**Lifecycle:**

- **Created**: On successful sign-in (alongside session cookie)
- **Cleared**: On sign-out (alongside session cookie clear)
- **Read by**: Alpine.js auth store (`document.cookie` parsing)

### Alpine.js Auth Store (New)

Client-side reactive state, not persisted.

| Property          | Type    | Description                            |
| ----------------- | ------- | -------------------------------------- |
| `isAuthenticated` | boolean | `true` if `auth_status` cookie present |

**Lifecycle:**

- **Initialized**: On Alpine.js init (every page load)
- **Read from**: `document.cookie` — synchronous, no network request
- **Consumed by**: Navbar conditional rendering, dashboard auth guard

## Existing Entities (Unchanged)

### Session Cookie

| Property | Value                              |
| -------- | ---------------------------------- |
| name     | `__Host-better-auth.session_token` |
| HttpOnly | Yes                                |
| Secure   | Yes                                |
| SameSite | Lax                                |
| Path     | `/`                                |
| Max-Age  | 2592000                            |

No changes required — indicator cookie is set alongside this cookie, not replacing it.

### CSRF Cookie

| Property | Value         |
| -------- | ------------- |
| name     | `__Host-csrf` |
| HttpOnly | Yes           |
| Secure   | Yes           |
| SameSite | Strict        |
| Path     | `/`           |
| Max-Age  | 3600          |

No changes required.

## Relationships

```
Session Cookie (HttpOnly, authoritative)
  └── set alongside → Auth Indicator Cookie (JS-readable, UI hint)
                          └── read by → Alpine.js Auth Store
                                          ├── drives → Navbar conditional rendering
                                          └── drives → Dashboard auth guard
```

## Validation Rules

- Indicator cookie value is always exactly `1` (no user-supplied data)
- Cookie is set/cleared only by server-side code (not by client-side JS)
- Cookie presence is a UI hint — never used for authorization decisions server-side
- Alpine.js store treats missing cookie as "not authenticated" (safe default)

## State Transitions

```
Unauthenticated → Sign In (success) → Authenticated
  - Session cookie: SET
  - Indicator cookie: SET (auth_status=1)
  - Alpine.js store: isAuthenticated = true (on next page load)

Authenticated → Sign Out → Unauthenticated
  - Session cookie: CLEARED
  - Indicator cookie: CLEARED
  - Alpine.js store: isAuthenticated = false (on next page load)
```
