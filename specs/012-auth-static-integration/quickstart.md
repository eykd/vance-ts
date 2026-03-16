# Quickstart: Auth-Static Site Integration

**Feature**: 012-auth-static-integration | **Date**: 2026-03-13

## What This Feature Does

Connects the Hugo static site to the authentication system so visitors can sign in/sign up from any page, and authenticated users see a Dashboard button instead.

## Implementation Order

### Phase 1: Cookie Infrastructure (US2 - P1)

**TDD in TypeScript — test first, then implement.**

1. Add indicator cookie functions to `src/presentation/utils/cookieBuilder.ts`:
   - `buildAuthIndicatorCookie()` → returns Set-Cookie string
   - `clearAuthIndicatorCookie()` → returns Set-Cookie string with Max-Age=0

2. Wire into handlers at `src/presentation/handlers/AuthPageHandlers.ts`:
   - `handlePostSignIn()`: append indicator cookie after session cookie
   - `handlePostSignOut()`: append indicator clear after session cookie clear

3. Verify: `npx vitest run src/presentation/utils/cookieBuilder.spec.ts`

### Phase 2: Hugo Navbar Update (US1 - P1)

**Hugo changes — validate with build tests.**

1. Update `hugo/config/_default/menus.yaml`:
   - Replace "Get Started" with "Sign In" (`/auth/sign-in`) and "Sign Up" (`/auth/sign-up`)

2. Update `hugo/layouts/_partials/shared/header.html`:
   - Add Alpine.js conditional rendering for auth/unauth states

3. Verify: `cd hugo && npm test`

### Phase 3: Alpine.js Auth Store (US2 - P1)

**Hugo static JS — validate with build tests.**

1. Create `hugo/static/js/auth-store.js`:
   - Alpine.store registration with cookie check

2. Update `hugo/layouts/baseof.html`:
   - Add auth-store.js and Alpine.js script tags

3. Verify: `cd hugo && npm test`

### Phase 4: Dashboard Page (US4 - P2)

**Hugo content + layout — validate with build tests.**

1. Create `hugo/content/dashboard/_index.md`
2. Create `hugo/layouts/dashboard/list.html` with auth guard
3. Verify: `cd hugo && npm test`

## Key Commands

```bash
# TDD for TypeScript changes
npx vitest --watch src/presentation/utils/cookieBuilder.spec.ts

# Hugo build verification
cd hugo && npm test

# Full check
npm run check
```

## Files to Touch

| File | Action | Phase |
|------|--------|-------|
| `src/presentation/utils/cookieBuilder.ts` | Edit (add indicator cookie functions) | 1 |
| `src/presentation/utils/cookieBuilder.spec.ts` | Edit (add tests) | 1 |
| `src/presentation/handlers/AuthPageHandlers.ts` | Edit (wire indicator cookie) | 1 |
| `src/presentation/handlers/AuthPageHandlers.spec.ts` | Edit (update tests) | 1 |
| `hugo/config/_default/menus.yaml` | Edit (replace Get Started) | 2 |
| `hugo/layouts/_partials/shared/header.html` | Edit (Alpine.js conditionals) | 2 |
| `hugo/layouts/baseof.html` | Edit (add Alpine.js + auth-store) | 3 |
| `hugo/static/js/auth-store.js` | Create | 3 |
| `hugo/content/dashboard/_index.md` | Create | 4 |
| `hugo/layouts/dashboard/list.html` | Create | 4 |
