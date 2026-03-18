# Library Containment Policy

Third-party libraries are confined to their intended architectural layers via ESLint `no-restricted-imports` rules. This prevents framework coupling from leaking across architecture boundaries.

## Containment Matrix

| Library                          | Allowed in                                         |
| -------------------------------- | -------------------------------------------------- |
| `better-auth` / `better-auth/**` | `src/infrastructure/` only                         |
| `drizzle-orm` / `drizzle-orm/**` | `src/infrastructure/` only                         |
| `hono` / `hono/**`               | `src/presentation/` and `src/worker.ts` only       |
| `@cloudflare/workers-types`      | `src/shared/env.ts` and `src/infrastructure/` only |

All other `src/` layers (domain, application, di, shared) may **not** import these libraries directly. Instead, use the ports and interfaces defined in inner layers:

- **Auth**: Use the `AuthService` port from domain/application layers.
- **Data access**: Use repository interfaces from `src/domain/`.
- **HTTP**: Use domain/application interfaces; only presentation/worker touches Hono.
- **Worker types**: Import `AppEnv` from `src/shared/env.ts` rather than referencing `@cloudflare/workers-types` directly.

## Enforcement

Enforced by ESLint `no-restricted-imports` with the `patterns` option (supporting `**` globs for subpath imports like `better-auth/adapters/drizzle`). Each violation produces a custom message directing the developer to the correct abstraction.

The rules are defined in `eslint.config.mjs` using two constants:

- **`NODE_JS_BAN_PATHS`** — Bans Node.js built-in modules (Cloudflare Workers constraint).
- **`CONTAINED_LIBS`** — Maps each contained library to its glob pattern and error message.

A `restrictedImports(...allowedKeys)` helper composes the full rule by combining Node.js bans with all library bans except those listed as allowed.

## Adding a New Contained Library

1. Add an entry to `CONTAINED_LIBS` in `eslint.config.mjs` with `group` (glob patterns) and `message`.
2. Add a layer override block calling `restrictedImports('new-lib')` for the file patterns where the library is permitted.
3. Update this document's containment matrix.
4. Run `npx eslint src/` to verify zero violations.
