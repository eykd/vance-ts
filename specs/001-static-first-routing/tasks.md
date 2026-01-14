# Tasks: Static-First Routing Architecture

**Input**: Design documents from `/specs/001-static-first-routing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not applicable - this is a documentation/skills update feature, not code implementation.

**Organization**: Tasks are grouped by user story to enable independent verification of each documentation update.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Review reference materials and establish update patterns

- [x] T001 Review data-model.md routing categories and conventions in specs/001-static-first-routing/data-model.md
- [x] T002 Review research.md affected files inventory in specs/001-static-first-routing/research.md
- [x] T003 Review quickstart.md verification checklist in specs/001-static-first-routing/quickstart.md

---

## Phase 2: Foundational (Primary Guide Update)

**Purpose**: Update the main Cloudflare Interactive Web App Guide - MUST complete before other docs/skills

**⚠️ CRITICAL**: This guide is referenced by other documentation. Update it first to establish patterns.

- [x] T004 Update Architecture Overview section to describe static-first routing model in docs/cloudflare-interactive-webapp-guide.md
- [x] T005 Add new "Routing Architecture" section explaining "static by default, dynamic by intent" philosophy in docs/cloudflare-interactive-webapp-guide.md
- [x] T006 Update Project Structure section to show public/ for marketing pages and src/presentation/templates/app/ for Worker-rendered pages in docs/cloudflare-interactive-webapp-guide.md
- [x] T007 Update Router implementation code to use /app/_ and /app/\_/_ patterns (remove root route, remove ASSETS.fetch fallback) in docs/cloudflare-interactive-webapp-guide.md
- [x] T008 Update all HTMX form examples to use /app/\_/ prefix instead of /api/ in docs/cloudflare-interactive-webapp-guide.md
- [x] T009 Update wrangler.jsonc example to show routes configuration for /app/_, /auth/_, /webhooks/\* in docs/cloudflare-interactive-webapp-guide.md
- [x] T010 Update Deployment section to describe static-first build process (SSG builds to public/, Worker references that directory) in docs/cloudflare-interactive-webapp-guide.md

**Checkpoint**: Primary guide updated. Can now update other docs and skills in parallel.

---

## Phase 3: User Story 1 - Developer Reads Updated Documentation (Priority: P1) 🎯 MVP

**Goal**: All documentation clearly describes static-first routing with /app/\* as dynamic boundary

**Independent Test**: Read each documentation file and verify it describes static-first routing correctly per quickstart.md checklist

### Implementation for User Story 1

- [x] T011 [P] [US1] Update auth boundary patterns to show /app/\* as authenticated zone in docs/cloudflare-webapp-security-guide.md
- [x] T012 [P] [US1] Update session middleware examples to apply at /app/\* boundary in docs/cloudflare-webapp-security-guide.md
- [x] T013 [P] [US1] Update auth middleware patterns to enforce at /app/\* boundary in docs/secure-authentication-guide.md
- [x] T014 [P] [US1] Update login/logout route examples to use /auth/\* prefix in docs/secure-authentication-guide.md
- [x] T015 [P] [US1] Update Hugo integration to clarify SSG as primary renderer for marketing pages in docs/hugo-cloudflare-integration-guide.md
- [x] T016 [P] [US1] Update API endpoint examples to use /app/\_/\* convention in docs/hugo-cloudflare-integration-guide.md
- [x] T017 [P] [US1] Update webhook routing examples to use /webhooks/\* prefix in docs/stripe-cloudflare-integration-guide.md
- [x] T018 [P] [US1] Update Slack webhook routes to use /webhooks/slack pattern in docs/slack-bot-integration-guide.md
- [x] T019 [P] [US1] Update authorization boundary references to /app/\* in docs/multi-tenant-boundaries-guide.md

**Checkpoint**: All documentation files updated. Developer can read docs and understand static-first routing.

---

## Phase 4: User Story 2 - Developer Uses Skills with Static-First Patterns (Priority: P1)

**Goal**: All Claude Code skills generate code consistent with static-first routing

**Independent Test**: Invoke each skill and verify generated code uses /app/_, /app/\_/_, /auth/_, /webhooks/_ patterns

### Implementation for User Story 2

- [x] T020 [P] [US2] Update SKILL.md project structure example to show static-first layout in .claude/skills/cloudflare-project-scaffolding/SKILL.md
- [x] T021 [US2] Update scaffold.py router template to use /app/\* routes and remove root route handler in .claude/skills/cloudflare-project-scaffolding/scripts/scaffold.py
- [x] T022 [US2] Update scaffold.py to generate wrangler.jsonc with static-first route configuration in .claude/skills/cloudflare-project-scaffolding/scripts/scaffold.py
- [x] T023 [P] [US2] Update SKILL.md handler examples to use /app/\_/ endpoints in .claude/skills/worker-request-handler/SKILL.md
- [x] T024 [US2] Update middleware.md router examples to show /app/\* boundary with auth middleware in .claude/skills/worker-request-handler/references/middleware.md
- [x] T025 [US2] Update middleware.md auth integration to apply at /app/\* boundary in .claude/skills/worker-request-handler/references/middleware.md
- [x] T026 [P] [US2] Update SKILL.md template structure to show app/ directory for Worker-rendered templates in .claude/skills/htmx-alpine-templates/SKILL.md
- [x] T027 [P] [US2] Update deployment steps to reflect static-first build process in .claude/skills/deploy-your-app/SKILL.md

**Checkpoint**: All primary skills updated. Developer can invoke skills and get static-first code.

---

## Phase 5: User Story 3 - Developer Creates HTMX Partials Under Correct Convention (Priority: P2)

**Goal**: All HTMX examples and patterns use /app/\_/ convention

**Independent Test**: Search all HTMX-related files for endpoint URLs and verify they use /app/\_/ pattern

### Implementation for User Story 3

- [x] T028 [P] [US3] Update htmx-patterns.md endpoint examples to use /app/\_/ prefix in .claude/skills/htmx-alpine-templates/references/htmx-patterns.md
- [x] T029 [P] [US3] Update SKILL.md quick reference table to show /app/\_/ endpoints in .claude/skills/htmx-pattern-library/SKILL.md
- [x] T030 [P] [US3] Update forms.md examples to use /app/\_/ for form actions in .claude/skills/htmx-pattern-library/references/forms.md
- [x] T031 [P] [US3] Update search.md examples to use /app/\_/ for search endpoints in .claude/skills/htmx-pattern-library/references/search.md
- [x] T032 [P] [US3] Update loading.md examples to use /app/\_/ for lazy loading endpoints in .claude/skills/htmx-pattern-library/references/loading.md
- [x] T033 [P] [US3] Update oob.md examples to use /app/\_/ for out-of-band endpoints in .claude/skills/htmx-pattern-library/references/oob.md

**Checkpoint**: All HTMX patterns use /app/\_/ convention. Developer can follow patterns correctly.

---

## Phase 6: User Story 4 - Developer Configures Authentication Boundary (Priority: P2)

**Goal**: Auth documentation clearly shows /app/\* as authenticated zone

**Independent Test**: Review auth-related files and verify they describe /app/\* as auth boundary, not root

### Implementation for User Story 4

- [x] T034 [P] [US4] Update PATTERN.md to describe /app/\* as auth boundary in .claude/skills/latent-features/reference/secure-auth/PATTERN.md
- [x] T035 [P] [US4] Update overview.md architecture to show auth at /app/\* boundary in .claude/skills/latent-features/reference/secure-auth/architecture/overview.md
- [x] T036 [P] [US4] Update session-management.md to show session middleware at /app/\* boundary in .claude/skills/latent-features/reference/secure-auth/implementation/session-management.md
- [x] T037 [P] [US4] Update csrf-protection.md routes to use /app/\* pattern in .claude/skills/latent-features/reference/secure-auth/implementation/csrf-protection.md

**Checkpoint**: Auth boundary clearly documented. Developer understands /app/\* is authenticated zone.

---

## Phase 7: User Story 5 - Developer Understands Static Site Generator Role (Priority: P3)

**Goal**: Documentation clarifies SSG as primary renderer for marketing pages

**Independent Test**: Verify docs describe SSG role and interaction with Worker for /app/\_/\* endpoints

### Implementation for User Story 5

- [x] T038 [US5] Add SSG role section to main guide explaining Hugo/Astro/11ty as marketing page renderer in docs/cloudflare-interactive-webapp-guide.md
- [x] T039 [US5] Add SSG-Worker interaction patterns (static forms posting to Worker, HTMX targeting /app/\_/\*) in docs/cloudflare-interactive-webapp-guide.md

**Checkpoint**: SSG role documented. Developer understands static vs. dynamic boundary.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T040 [P] Run quickstart.md grep commands to verify no old patterns remain
- [x] T041 [P] Verify all /api/ references replaced with /app/\_/ across all updated files
- [x] T042 [P] Verify no Worker root route patterns remain in any documentation
- [x] T043 [P] Verify no ASSETS.fetch fallback patterns remain in router examples
- [x] T044 Review all changes for consistent terminology (static route, dynamic route, HTMX partial)
- [x] T045 Update spec.md status from Draft to Complete in specs/001-static-first-routing/spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - review reference materials
- **Foundational (Phase 2)**: Depends on Setup - update primary guide first
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - Can then proceed in parallel or sequentially by priority
- **Polish (Phase 8)**: Depends on all user story phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Documentation updates
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Skills updates (parallel with US1)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - HTMX patterns (parallel)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Auth patterns (parallel)
- **User Story 5 (P3)**: Depends on US1 (adds to main guide after initial updates)

### Parallel Opportunities

All tasks within Phases 3-7 marked [P] can run in parallel since they affect different files:

```
Phase 3 (US1): T011-T019 can all run in parallel (different doc files)
Phase 4 (US2): T020, T023, T026, T027 can run in parallel (different skill files)
Phase 5 (US3): T028-T033 can all run in parallel (different reference files)
Phase 6 (US4): T034-T037 can all run in parallel (different auth pattern files)
Phase 8:       T040-T043 can all run in parallel (verification commands)
```

---

## Parallel Example: User Story 1 & 2 (Both P1)

```bash
# Since US1 and US2 are both P1 priority, they can run in parallel:

# US1: Documentation updates (all parallel)
Task T011: cloudflare-webapp-security-guide.md
Task T012: cloudflare-webapp-security-guide.md
Task T013: secure-authentication-guide.md
Task T015: hugo-cloudflare-integration-guide.md
Task T017: stripe-cloudflare-integration-guide.md

# US2: Skills updates (all parallel)
Task T020: cloudflare-project-scaffolding/SKILL.md
Task T023: worker-request-handler/SKILL.md
Task T026: htmx-alpine-templates/SKILL.md
Task T027: deploy-your-app/SKILL.md
```

---

## Implementation Strategy

### MVP First (Foundational + US1 + US2)

1. Complete Phase 1: Setup (review materials)
2. Complete Phase 2: Foundational (primary guide)
3. Complete Phase 3: User Story 1 (all documentation)
4. Complete Phase 4: User Story 2 (all skills)
5. **STOP and VALIDATE**: Run quickstart.md verification
6. Commit and deploy if passing

### Incremental Delivery

1. Foundational → Primary guide ready
2. Add US1 → All docs updated → Verify
3. Add US2 → All skills updated → Verify
4. Add US3 → HTMX patterns complete → Verify
5. Add US4 → Auth patterns complete → Verify
6. Add US5 → SSG role documented → Verify
7. Polish → Final verification → Complete

---

## Summary

| Phase     | User Story   | Task Count | Parallel Tasks |
| --------- | ------------ | ---------- | -------------- |
| 1         | Setup        | 3          | 0              |
| 2         | Foundational | 7          | 0              |
| 3         | US1 - Docs   | 9          | 9              |
| 4         | US2 - Skills | 8          | 4              |
| 5         | US3 - HTMX   | 6          | 6              |
| 6         | US4 - Auth   | 4          | 4              |
| 7         | US5 - SSG    | 2          | 0              |
| 8         | Polish       | 6          | 4              |
| **Total** |              | **45**     | **27**         |

**MVP Scope**: Phases 1-4 (Setup + Foundational + US1 + US2) = 27 tasks

---

## Notes

- [P] tasks = different files, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story phase produces independently verifiable documentation state
- Run quickstart.md verification after each phase for incremental validation
- Commit after each phase or logical group
- All changes are documentation/markdown - no code compilation required
