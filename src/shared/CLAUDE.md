# Shared Utilities

Cross-cutting utilities used by multiple layers. Keep this directory minimal.

## Files

- `env.ts` — Environment binding types and helpers
- `hex.ts` — Hex encoding/decoding utilities

## Scope Rules

- Only pure, stateless utility functions belong here
- No domain logic, no business rules
- No external dependencies (Cloudflare APIs are acceptable)
- If a utility is only used by one layer, it belongs in that layer instead

## Dependencies

- Shared → None (pure utilities only)
