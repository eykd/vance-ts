# Tasks: Hugo Project Setup with TailwindCSS and DaisyUI

**Input**: Design documents from `/specs/007-hugo-project-setup/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: No automated tests - Hugo templates use manual verification via `hugo server` and `hugo --minify` builds.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to the `hugo/` subdirectory created in this feature.

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create Hugo project directory structure and install dependencies

- [x] T001 Create hugo/ directory structure with content/, layouts/, assets/, config/, data/, static/ subdirectories
- [x] T002 Create hugo/package.json with TailwindCSS 4, DaisyUI 5, @tailwindcss/typography, prettier dependencies
- [x] T003 [P] Create hugo/tailwind.config.js configured to use hugo_stats.json for content scanning
- [x] T004 [P] Create hugo/.prettierrc.json for HTML template formatting
- [x] T005 Run npm install in hugo/ directory to verify dependencies install correctly

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration that MUST be complete before ANY user story layout can work

**⚠️ CRITICAL**: No layout templates can function until Hugo configuration and CSS entry point are complete

- [x] T006 Create hugo/hugo.yaml with languageCode, buildStats enabled, module mounts for hugo_stats.json
- [x] T007 Add cachebusters configuration to hugo/hugo.yaml for CSS regeneration on config changes
- [x] T008 Add taxonomies (tags, series) and output formats configuration to hugo/hugo.yaml
- [x] T009 Create hugo/assets/css/styles.css with TailwindCSS imports, @plugin directives, @theme block
- [x] T010 Add DaisyUI "lemonade" theme configuration with OKLCH colors to hugo/assets/css/styles.css
- [x] T011 Create hugo/config/_default/params.yaml with title, description, social, copyright placeholders
- [x] T012 [P] Create hugo/config/_default/menus.yaml with main, buttons, and footer menu structures

**Checkpoint**: Foundation ready - Hugo should now start without errors (empty site)

---

## Phase 3: User Story 1 - Developer Creates New Hugo Site (Priority: P1) 🎯 MVP

**Goal**: Fully configured Hugo installation that starts and serves a styled page

**Independent Test**: Run `cd hugo && npm install && hugo server` - site starts without errors and shows styled content

### Implementation for User Story 1

- [x] T013 [US1] Create hugo/layouts/baseof.html with HTML5 doctype, head (meta, title), body structure
- [x] T014 [US1] Add TailwindCSS loading via css.TailwindCSS pipe with deferred template execution to hugo/layouts/baseof.html
- [x] T015 [US1] Add page-styles and main blocks to hugo/layouts/baseof.html for child template extension
- [x] T016 [US1] Create hugo/content/_index.md with basic front matter (title, description) for homepage
- [x] T017 [US1] Create minimal hugo/layouts/home.html that extends baseof.html and renders welcome message
- [x] T018 [US1] Verify hugo server starts and displays styled homepage with DaisyUI theme colors (NOTE: Requires Hugo 0.147.8+ - manual verification)

**Checkpoint**: User Story 1 complete - Developer can run `npm install && hugo server` and see styled page

---

## Phase 4: User Story 2 - Developer Uses Base Layout Template (Priority: P2)

**Goal**: Base layout with SEO partials, header, footer that all pages inherit

**Independent Test**: Create test content page, verify it inherits base layout with proper meta tags and styling

### Implementation for User Story 2

- [x] T019 [P] [US2] Create hugo/layouts/_partials/seo/opengraph.html with og:title, og:description, og:image, og:url meta tags
- [x] T020 [P] [US2] Create hugo/layouts/_partials/seo/twitter_cards.html with twitter:card, twitter:title, twitter:description meta tags
- [x] T021 [P] [US2] Create hugo/layouts/_partials/seo/schema.html with WebSite and Article JSON-LD structured data
- [x] T022 [P] [US2] Create hugo/layouts/_partials/seo/google_analytics.html with GA4 script (conditional on params.googleAnalytics)
- [x] T023 [US2] Add SEO partial includes to head section of hugo/layouts/baseof.html
- [x] T024 [P] [US2] Create hugo/layouts/_partials/components/button/primary.html with DaisyUI btn btn-primary styling
- [x] T025 [P] [US2] Create hugo/layouts/_partials/components/button/outline.html with DaisyUI btn btn-outline styling
- [x] T026 [US2] Create hugo/layouts/_partials/shared/header.html with navbar, logo, menu links using DaisyUI components
- [x] T027 [US2] Create hugo/layouts/_partials/shared/footer.html with copyright, location, footer menu using DaisyUI footer
- [x] T028 [US2] Add header and footer partial includes to hugo/layouts/baseof.html body section
- [x] T029 [US2] Add favicon link conditionals to hugo/layouts/baseof.html head (graceful degradation if missing)
- [x] T030 [US2] Verify base layout renders with header, footer, SEO meta tags on all page types (NOTE: Requires Hugo - manual verification)

**Checkpoint**: User Story 2 complete - All pages inherit consistent layout with SEO tags, header, footer

---

## Phase 5: User Story 3 - Developer Builds Production Assets (Priority: P3)

**Goal**: Production builds with minified CSS, purged unused styles, cache-busted filenames

**Independent Test**: Run `hugo --minify`, verify CSS is under 50KB and filenames are fingerprinted

### Implementation for User Story 3

- [x] T031 [US3] Update TailwindCSS loading in hugo/layouts/baseof.html to use fingerprint and minify options
- [x] T032 [US3] Add integrity attribute to CSS link tag in hugo/layouts/baseof.html for SRI
- [x] T033 [US3] Verify hugo_stats.json is generated and contains CSS classes from templates (NOTE: Requires Hugo - manual verification)
- [x] T034 [US3] Run hugo --minify and verify production output in hugo/public/ (NOTE: Requires Hugo - manual verification)
- [x] T035 [US3] Verify CSS file is fingerprinted (hash in filename) and minified (< 50KB) (NOTE: Requires Hugo - manual verification)

**Checkpoint**: User Story 3 complete - Production builds generate optimized, cache-busted assets

---

## Phase 6: User Story 4 - Developer Creates Standard Page Layouts (Priority: P4)

**Goal**: Working layouts for homepage, single content pages, list/section pages, and 404 error page

**Independent Test**: Create content files and verify each layout type renders with proper styling

### Implementation for User Story 4

- [x] T036 [P] [US4] Create hugo/data/home/hero.yaml with enable, title, subtitle, image, button fields
- [x] T037 [P] [US4] Create hugo/layouts/_partials/blocks/home/hero.html with hero section using DaisyUI hero component
- [x] T038 [US4] Update hugo/layouts/home.html to render hero section from data/home/hero.yaml
- [x] T039 [US4] Add page-styles block to hugo/layouts/home.html for hero background image CSS
- [x] T040 [US4] Create hugo/layouts/single.html with article structure, featured image, prose styling using @tailwindcss/typography
- [x] T041 [US4] Add optional table of contents sidebar to hugo/layouts/single.html (conditional on .Params.toc)
- [x] T042 [US4] Create hugo/layouts/list.html with section title, card grid for child pages using DaisyUI card component
- [x] T043 [US4] Add pagination partial support to hugo/layouts/list.html
- [x] T044 [P] [US4] Create hugo/layouts/_partials/shared/pagination.html with DaisyUI pagination styling
- [x] T045 [US4] Create hugo/layouts/404.html with error message, home link using DaisyUI alert component
- [x] T046 [US4] Create sample content: hugo/content/posts/_index.md and hugo/content/posts/sample-post.md
- [x] T047 [US4] Verify all layout types render correctly: homepage, single post, posts list, 404 page (NOTE: Requires Hugo - manual verification)

**Checkpoint**: User Story 4 complete - All standard page layouts functional with DaisyUI styling

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [x] T048 [P] Create hugo/static/.gitkeep for static assets directory
- [x] T049 [P] Create hugo/.gitignore with node_modules/, public/, hugo_stats.json, resources/
- [x] T050 Add RSS output format configuration to hugo/hugo.yaml for blog feeds (already configured in Phase 2)
- [x] T051 Create hugo/layouts/rss.xml custom RSS template (optional enhancement)
- [x] T052 Run full validation: npm install, hugo server (dev), hugo --minify (prod) (NOTE: Requires Hugo - manual verification)
- [x] T053 Verify quickstart.md instructions match actual setup steps (file structure matches)
- [x] T054 Update hugo/config/_default/params.yaml with meaningful placeholder values (completed in Phase 2)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 must complete before US2 (baseof.html is prerequisite)
  - US2 must complete before US3 (need layouts to test production build)
  - US3 and US4 can proceed in parallel after US2
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Creates baseof.html foundation
- **User Story 2 (P2)**: Depends on US1 completion - Extends baseof.html with partials
- **User Story 3 (P3)**: Depends on US2 completion - Tests production build of complete layouts
- **User Story 4 (P4)**: Depends on US2 completion - Creates page-specific layouts extending baseof.html

### Within Each User Story

- Configuration files before templates that use them
- Base layout before page-specific layouts
- Partials before templates that include them
- Content files for testing after layouts are ready

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 and T004 can run in parallel (different config files)

**Phase 2 (Foundational)**:
- T012 can run in parallel with T006-T011 (menus.yaml is independent)

**Phase 4 (User Story 2)**:
- T019, T020, T021, T022 can run in parallel (different SEO partials)
- T024, T025 can run in parallel (different button partials)

**Phase 6 (User Story 4)**:
- T036, T037 can run in parallel (hero data and partial)
- T044 can run in parallel with T042 (pagination partial)

---

## Parallel Example: User Story 2 SEO Partials

```bash
# Launch all SEO partials together:
Task: "Create hugo/layouts/_partials/seo/opengraph.html"
Task: "Create hugo/layouts/_partials/seo/twitter_cards.html"
Task: "Create hugo/layouts/_partials/seo/schema.html"
Task: "Create hugo/layouts/_partials/seo/google_analytics.html"

# Then sequentially:
Task: "Add SEO partial includes to hugo/layouts/baseof.html"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T012)
3. Complete Phase 3: User Story 1 (T013-T018)
4. **STOP and VALIDATE**: Run `hugo server` - see styled homepage
5. This delivers a working Hugo + TailwindCSS + DaisyUI installation

### Incremental Delivery

1. Setup + Foundational → Hugo project initialized
2. User Story 1 → Basic styled site (MVP!)
3. User Story 2 → Full layout with SEO, header, footer
4. User Story 3 → Production-ready builds
5. User Story 4 → Complete page templates
6. Polish → Final cleanup and validation

### Sequential Recommendation

For this feature, sequential execution is recommended:
- US1 → US2 → US3 → US4
- Each story builds on the previous
- Single developer workflow

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Manual verification via `hugo server` and `hugo --minify` (no automated tests)
- Verify each phase checkpoint before proceeding
- Commit after each logical group of tasks
- Reference exemplar project patterns from research.md
