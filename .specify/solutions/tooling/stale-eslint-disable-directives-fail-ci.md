# Stale eslint-disable Directives Fail CI With max-warnings: 0

**Category**: tooling
**Date**: 2026-03-30
**Feature**: 016-prestoplot-core
**Tags**: eslint, ci, warnings, lint, pre-commit

## Problem

CI quality check failed with `ESLint found too many warnings (maximum: 0)`. Five galaxy infrastructure spec files had unused `eslint-disable-next-line @typescript-eslint/no-unsafe-call` directives that ESLint flagged as warnings. Local pre-commit hooks didn't catch these because they only lint staged files — the galaxy specs were untouched in this branch.

```
src/infrastructure/galaxy/D1RouteRepository.spec.ts
  24:5  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unsafe-call')
```

## Root Cause

The `eslint-disable` comments were added when `applyD1Migrations` from `cloudflare:test` had unresolvable types in ESLint's tsconfig, triggering `@typescript-eslint/no-unsafe-call`. A subsequent dependency update resolved the type issue, but the disable comments were never cleaned up. Since these files weren't modified on this branch, pre-commit (lint-staged) never re-linted them. CI lints the entire `src/` tree and caught the drift.

## Solution

Removed the 5 stale `eslint-disable-next-line` comments from:

- `src/infrastructure/galaxy/D1RouteRepository.spec.ts:24`
- `src/infrastructure/galaxy/D1StarSystemRepository.spec.ts:23`
- `src/infrastructure/galaxy/D1TradePairRepository.spec.ts:24`
- `src/infrastructure/galaxy/galaxy-schema.spec.ts:72`
- `src/infrastructure/galaxy/galaxy-seeder-integration.spec.ts:159`

## Prevention

- **After dependency upgrades**: Run `npx eslint src/ --max-warnings 0` across the full tree to detect stale disable directives, not just staged files.
- **Periodic sweep**: Add a CI step or periodic task to run `eslint --report-unused-disable-directives` to catch drift early.
- **Before opening PRs**: Run `npm run check` (which lints the full tree) rather than relying only on pre-commit hooks which are scoped to staged files.

## Related

- Pre-commit hooks use lint-staged, which only checks changed files — this is a known gap for detecting regressions in untouched files.
