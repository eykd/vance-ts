# Cross-Artifact Analysis: Auth-Static Site Integration

**Feature**: 012-auth-static-integration | **Date**: 2026-03-13
**Artifacts reviewed**: spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/indicator-cookie.md, checklists/requirements.md, tasks.md
**Beads task**: turtlebased-ts-bjd.5

## Executive Summary

All artifacts are well-aligned with zero CRITICAL issues. Two LOW-severity inconsistencies were found and fixed inline (contract cookie matching logic and missing optional chaining). The spec, plan, tasks, and contracts form a coherent implementation path with thorough red team mitigations integrated into the task breakdown.

## 1. Cross-Artifact Consistency

### 1.1 Spec ↔ Plan Alignment

| Spec Requirement                                           | Plan Coverage                                                          | Status |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- | ------ |
| FR-001: Sign In link + Sign Up button                      | US1 header refactor (plan §US1)                                        | PASS   |
| FR-002: Links navigate to /auth/\*                         | US1 HTML anchors with href                                             | PASS   |
| FR-003: Non-HttpOnly indicator cookie on sign-in           | US2 cookieBuilder + AuthPageHandlers (plan §US2)                       | PASS   |
| FR-004: Clear indicator cookie on sign-out                 | US2 sign-out handler (plan §US2)                                       | PASS   |
| FR-005: Alpine.js store reads cookie, no server round-trip | US2 auth-store.js (plan §US2)                                          | PASS   |
| FR-006: Dashboard button when authenticated                | US3 header refactor (plan §US3, covered in §US1)                       | PASS   |
| FR-007: Static /dashboard/ page                            | US4 Hugo content + layout (plan §US4)                                  | PASS   |
| FR-008: Dashboard redirect unauthenticated to sign-in      | US4 x-init guard (plan §US4)                                           | PASS   |
| FR-009: Indicator cookie non-sensitive                     | Cookie design decisions (plan §Cookie Design)                          | PASS   |
| FR-010: Links work without JS                              | Progressive enhancement strategy (plan §US1, §Progressive Enhancement) | PASS   |
| FR-011: Server-side auth remains authoritative             | Security boundaries (plan §Security Considerations)                    | PASS   |

All 11 functional requirements are addressed in the plan with specific implementation instructions.

### 1.2 Spec ↔ Tasks Alignment

| User Story        | Acceptance Scenarios                                                 | Tasks Covering                                                           | Status |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------ |
| US1 (3 scenarios) | Auth links visible, Sign In navigates, Sign Up navigates             | .6.1 (GWT spec), .6.2 (menu/CSS), .6.3 (header refactor)                 | PASS   |
| US2 (3 scenarios) | Cookie absent = unauth, cookie present = auth, server rejects stale  | .6.4 (GWT spec), .6.5 (cookie TDD), .6.6 (handlers), .6.7 (Alpine store) | PASS   |
| US3 (3 scenarios) | Dashboard button when auth, Sign In when unauth, Dashboard navigates | .6.8 (GWT spec), .6.3 (implementation in header refactor)                | PASS   |
| US4 (3 scenarios) | Auth sees dashboard, unauth redirects, post-login redirect-back      | .6.9 (GWT spec), .6.10 (redirect allowlist), .6.11 (dashboard page)      | PASS   |

All 12 acceptance scenarios have corresponding implementation tasks and GWT spec tasks.

### 1.3 Plan ↔ Contract Alignment

| Contract Element                                                                | Plan Reference                                                        | Status |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| Cookie name `auth_status`                                                       | plan.md §Cookie Design                                                | PASS   |
| Cookie value `1`                                                                | plan.md §US2                                                          | PASS   |
| Cookie attributes (Secure, SameSite=Lax, Path=/, Max-Age=2592000, NOT HttpOnly) | plan.md §US2                                                          | PASS   |
| Set-Cookie on sign-in                                                           | plan.md §US2 code snippet                                             | PASS   |
| Set-Cookie clear on sign-out                                                    | plan.md §US2 code snippet                                             | PASS   |
| Alpine.js store cookie matching                                                 | Fixed: was `startsWith`, now `=== 'auth_status=1'` per plan rationale | FIXED  |
| Alpine.js x-show directives                                                     | Fixed: added optional chaining per red team finding                   | FIXED  |

### 1.4 Plan ↔ Code Reference Verification

All code references in plan.md were verified against the actual codebase:

| Reference                                             | Verified | Notes                                                 |
| ----------------------------------------------------- | -------- | ----------------------------------------------------- |
| AuthPageHandlers.ts lines 194-199 (sign-in success)   | YES      | Correct: `result.ok` check + `headers.append` calls   |
| AuthPageHandlers.ts lines 309-314 (no-session return) | YES      | Correct: `hasSession` check + redirect                |
| AuthPageHandlers.ts lines 319-325 (sign-out success)  | YES      | Correct: `result.ok` + cookie clears                  |
| AuthPageHandlers.ts lines 327-331 (service error)     | YES      | Correct: error fallback redirect                      |
| AuthPageHandlers.ts line 259 (sign-up no cookies)     | YES      | Correct: Location header only                         |
| cookieBuilder.ts line 94 (Max-Age=2592000)            | YES      | Correct                                               |
| header.html buttons range loop                        | YES      | Line 25: `{{ range $i, $e := .Site.Menus.buttons }}`  |
| baseof.html lines 81-82 ({{ end }} + </head>)         | YES      | Correct insertion point                               |
| alpine-3.15.8.min.js exists                           | YES      | 46,632 bytes                                          |
| styles.css exists (no x-cloak yet)                    | YES      | Correct: x-cloak CSS must be added                    |
| menus.yaml buttons menu with "Get Started"            | YES      | Lines 15-18                                           |
| redirectValidator.ts ALLOWED_FIRST_SEGMENTS           | YES      | Currently `['', 'app', 'posts']`, needs `'dashboard'` |

All 12 code references accurate. Zero phantom line references.

## 2. Red Team Finding ↔ Task Coverage

| Red Team Finding                             | Mitigation                                                        | Task           | Status |
| -------------------------------------------- | ----------------------------------------------------------------- | -------------- | ------ |
| Auth guard fail-open (store undefined)       | Optional chaining `$store.auth?.isAuthenticated`                  | .6.3, .6.11    | PASS   |
| Sign-out all-branches indicator clear        | Clear indicator in no-session + service_error branches            | .6.6           | PASS   |
| Dashboard noindex meta tag                   | `<meta name="robots" content="noindex">`                          | .6.11          | PASS   |
| Script defer ordering fragility              | HTML comment warning in baseof.html                               | .6.7           | PASS   |
| Alpine store namespace collision             | Code comment in auth-store.js                                     | .6.7           | PASS   |
| Cookie Max-Age alignment drift               | Cross-reference comment in cookieBuilder                          | .6.5           | PASS   |
| 303 redirect cookie atomicity                | Code comment in handlePostSignIn                                  | .6.6           | PASS   |
| Sign-up no-indicator assumption              | Code comment in handlePostSignUp                                  | .6.6           | PASS   |
| CLS during navbar swap                       | min-w class on x-data wrapper                                     | .6.3           | PASS   |
| Cache-busting for auth-store.js              | Evaluate during implementation (Hugo Pipes vs query param)        | .6.7           | PASS   |
| XSS + indicator cookie manipulation          | Documented as accepted risk; CSP hardening deferred               | N/A (accepted) | PASS   |
| Third-party script cookie visibility         | Documented as accepted risk                                       | N/A (accepted) | PASS   |
| Cross-origin cookie scope                    | Code comment in buildAuthIndicatorCookie                          | .6.5           | PASS   |
| Referrer leakage on redirect                 | Verified existing Referrer-Policy; no action needed               | N/A            | PASS   |
| Browser privacy cookie deletion              | Documented as accepted risk (desync by design)                    | N/A (accepted) | PASS   |
| Cookie synchronization Max-Age               | Alignment comment                                                 | .6.5           | PASS   |
| Script loading order fragility               | HTML comment + optional chaining defense                          | .6.7           | PASS   |
| Alpine store namespace collision             | Code comment                                                      | .6.7           | PASS   |
| 303 redirect atomicity                       | Code comment                                                      | .6.6           | PASS   |
| Dashboard content exposure to screen readers | Accepted for static placeholder; guard for future dynamic content | N/A (accepted) | PASS   |
| Focus management after redirect              | Evaluate during implementation                                    | .6.11          | PASS   |
| aria-live announcement verbosity             | Evaluate during implementation                                    | .6.3           | PASS   |

All red team findings are either addressed in tasks or explicitly accepted as known risks.

## 3. Constitution Alignment

| Principle              | Pre-Design Gate | Post-Design Gate | Analysis Assessment                                                                                     |
| ---------------------- | --------------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| I. Test-First          | PASS            | PASS             | PASS — TDD tasks (.6.5, .6.6, .6.10) precede implementation; GWT specs (.6.1, .6.4, .6.8, .6.9) defined |
| II. Type Safety        | PASS            | PASS             | PASS — Explicit return types on cookie functions; no `any`                                              |
| III. Code Quality      | PASS            | PASS             | PASS — JSDoc required on new public functions                                                           |
| IV. Pre-commit Gates   | PASS            | PASS             | PASS — All changes subject to lint-staged                                                               |
| V. Warning/Deprecation | PASS            | PASS             | PASS — No new warnings introduced                                                                       |
| VI. Workers Target     | PASS            | PASS             | PASS — `Set-Cookie` headers via Web Standard API; no Node.js imports                                    |
| VII. Simplicity        | PASS            | PASS             | PASS — Cookie-based approach avoids infrastructure additions                                            |

## 4. Coverage Gaps

### 4.1 Requirements → Implementation Mapping

All 11 functional requirements (FR-001 through FR-011) have direct implementation paths in the plan and corresponding tasks. No orphan requirements.

### 4.2 Success Criteria Verification

| Success Criterion                                       | Verification Path                                       | Status |
| ------------------------------------------------------- | ------------------------------------------------------- | ------ |
| SC-001: Auth links visible on initial render without JS | Progressive enhancement: plain HTML anchors, no x-cloak | PASS   |
| SC-002: Navbar swap within 1 second                     | Cookie read is synchronous; Alpine init is fast         | PASS   |
| SC-003: Dashboard redirect within 1 second              | x-init fires immediately on Alpine init                 | PASS   |
| SC-004: Zero additional network requests                | Cookie-based, client-side only check                    | PASS   |
| SC-005: 100% navbar links work without JS               | Plain HTML `<a>` tags with href                         | PASS   |

### 4.3 Edge Cases Mapped

All 5 edge cases from the spec are addressed:

1. JS disabled → Progressive enhancement (plan §Progressive Enhancement, noscript block)
2. Sign out on another tab → Stale until next page load (accepted, documented)
3. Indicator cookie present but session expired → Server rejects (plan §Cookie Design)
4. Indicator cookie deleted but session valid → Shows Sign In, user still auth'd server-side
5. Flash of content → Acceptable per Q2 (plan §US4 x-show behavior)

## 5. Issues Found and Fixed

### 5.1 Contract Cookie Matching Logic (LOW)

**Location**: `contracts/indicator-cookie.md` line 53
**Issue**: Used `.startsWith('auth_status=')` while plan.md specifies exact match `=== 'auth_status=1'` with security rationale (reject empty-value form, prevent injection, prevent prefix collisions).
**Resolution**: Fixed inline — updated contract to use `=== 'auth_status=1'`.

### 5.2 Contract Missing Optional Chaining (LOW)

**Location**: `contracts/indicator-cookie.md` consuming components section
**Issue**: Used `$store.auth.isAuthenticated` without optional chaining. Plan.md red team finding specifies `$store.auth?.isAuthenticated` to fail-secure when auth-store.js fails to load.
**Resolution**: Fixed inline — updated all Alpine directive examples to use optional chaining.

## 6. Quickstart ↔ Plan Consistency

The quickstart.md presents a simplified 4-phase implementation order that aligns with but reorders the task dependency graph. Phase ordering is consistent — no quickstart step references a dependency not yet available.

One minor note: quickstart.md Phase 2 says to "Replace 'Get Started' with 'Sign In' and 'Sign Up'" via menus.yaml, but the plan.md actually removes the buttons menu entirely (the auth links are hardcoded in the header template, not menu-driven). This is a simplification in the quickstart that does not create an implementation risk — the tasks.md and plan.md are authoritative.

## 7. Research ↔ Plan Decision Trail

All 6 research decisions (R1–R6) in research.md are faithfully reflected in the plan:

| Research                           | Decision                                   | Plan Alignment |
| ---------------------------------- | ------------------------------------------ | -------------- |
| R1: Indicator cookie design        | `auth_status=1`, non-HttpOnly, Secure, Lax | PASS           |
| R2: Alpine.js store                | `Alpine.store('auth', {...})`              | PASS           |
| R3: Alpine.js loading in Hugo      | `defer` scripts in baseof.html             | PASS           |
| R4: Dashboard auth guard           | `x-init` + `window.location.replace()`     | PASS           |
| R5: Navbar progressive enhancement | Default unauthenticated, Alpine swap       | PASS           |
| R6: Cookie naming (no prefix)      | Plain `auth_status` name                   | PASS           |

Minor note: R3 states "auth-store.js runs inline (small, synchronous)" but the plan correctly uses `defer` for both scripts. The research note is slightly imprecise but the plan is correct — both use `defer` with DOM-order execution guarantee.

## 8. Final Assessment

| Category                   | Status                                                |
| -------------------------- | ----------------------------------------------------- |
| CRITICAL issues            | 0                                                     |
| HIGH issues                | 0                                                     |
| MEDIUM issues              | 0                                                     |
| LOW issues                 | 2 (both fixed)                                        |
| Spec → Plan coverage       | 100% (11/11 FRs, 5/5 SCs, 12/12 acceptance scenarios) |
| Red team → Task coverage   | 100% (all findings addressed or explicitly accepted)  |
| Constitution alignment     | PASS (all 7 principles)                               |
| Code reference accuracy    | 100% (12/12 verified)                                 |
| Cross-artifact consistency | PASS (after 2 inline fixes)                           |

**Verdict**: PASS — Ready for implementation. No CRITICAL issues. All requirements mapped. All red team findings addressed.
