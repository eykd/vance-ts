# Feature Specification: Import Impeccable Design Skills

**Feature Branch**: `013-import-design-skills`
**Created**: 2026-03-20
**Status**: Draft
**Beads Epic**: `turtlebased-ts-erz`
**Input**: User description: "Import and adapt impeccable style skills from pbakaus/impeccable repo, namespaced with design- prefix, with Apache 2.0 attribution, integrated with existing Tailwind/DaisyUI/Hugo design skills"

**Beads Phase Tasks**:

- clarify: `turtlebased-ts-erz.1` (closed)
- plan: `turtlebased-ts-erz.2` (closed)
- red-team: `turtlebased-ts-erz.3`
- tasks: `turtlebased-ts-erz.4`
- analyze: `turtlebased-ts-erz.5`
- implement: `turtlebased-ts-erz.6`
- security-review: `turtlebased-ts-erz.7`
- architecture-review: `turtlebased-ts-erz.8`
- code-quality-review: `turtlebased-ts-erz.9`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Invoke an Imported Design Skill (Priority: P1)

A developer working on the Hugo/Tailwind/DaisyUI frontend invokes a design skill (e.g., `/design-polish`) and receives actionable guidance tailored to the project's TailwindCSS 4 + DaisyUI 5 + Hugo template stack — not generic CSS or React advice.

**Why this priority**: The core value proposition is that imported skills actually work with this project's stack. If the skills still reference React, vanilla CSS, or generic tooling, the import has no value.

**Independent Test**: Invoke any imported skill (e.g., `/design-arrange`) and verify its output references DaisyUI components, Tailwind utilities, and Hugo template patterns rather than generic web technologies.

**Acceptance Scenarios**:

1. **Given** a developer invokes `/design-polish`, **When** the skill runs its checklist, **Then** all checklist items reference DaisyUI 5 components, Tailwind CSS 4 utilities, and Hugo template conventions
2. **Given** a developer invokes `/design-colorize`, **When** the skill provides color guidance, **Then** it references the project's OKLCH theme variables and DaisyUI semantic color roles (not raw hex/rgb values)
3. **Given** a developer invokes `/design-typeset`, **When** the skill provides typography guidance, **Then** it references Tailwind's typography plugin and DaisyUI prose classes

---

### User Story 2 - Apache 2.0 License Compliance (Priority: P1)

The imported skills maintain full Apache 2.0 license compliance with proper attribution, modification notices, and license text so the project remains legally compliant.

**Why this priority**: License compliance is a legal requirement and non-negotiable.

**Independent Test**: Verify that NOTICE file, license headers, and attribution are present and conform to Apache 2.0 requirements.

**Acceptance Scenarios**:

1. **Given** the skills are imported, **When** a reviewer checks license compliance, **Then** a NOTICE file exists documenting the original source, author, license, and list of adapted files
2. **Given** a skill file has been modified from the original, **When** a reviewer checks that file, **Then** a modification notice is present indicating what was changed and when
3. **Given** the Apache 2.0 license text, **When** a reviewer checks the repo, **Then** a copy of the Apache 2.0 license is included (or referenced) for the imported content

---

### User Story 3 - Orchestrated Design Workflow (Priority: P1)

A developer starts a design task by invoking `/design-interview` and is guided through a structured multi-phase workflow. At each phase, the orchestrator recommends the right skill(s) with templated prompts — the developer never needs to memorize which of the 18+ design skills to use.

**Why this priority**: Without orchestration, the 18 imported skills are overwhelming. The orchestrator is what makes the skill library usable.

**Independent Test**: Start `/design-interview`, complete the interview phase, and verify the skill recommends the next phase with a specific skill name and templated prompt.

**Acceptance Scenarios**:

1. **Given** a developer invokes `/design-interview`, **When** they complete the interview phase, **Then** the skill recommends proceeding to the Theme phase and provides a templated prompt for `daisyui-design-system-generator`
2. **Given** a developer is in the Refine phase, **When** they describe their design as "too safe/boring," **Then** the orchestrator recommends `/design-bolder` with a context-aware prompt
3. **Given** a developer is in the Review phase, **When** they want a final quality pass, **Then** the orchestrator routes them through `/design-critique` → `/design-audit` → `/design-polish` in sequence

---

### User Story 4 - Discover Design Skills via Existing Workflow (Priority: P2)

A developer discovers imported design skills through the same mechanisms they use for existing skills — the skill list in Claude Code, skill descriptions, and cross-references from existing design skills.

**Why this priority**: Discoverability ensures the imported skills actually get used. Without it, the import is wasted effort.

**Independent Test**: Check that all imported skills appear in Claude Code's skill list with clear descriptions indicating when to use each one.

**Acceptance Scenarios**:

1. **Given** a developer lists available skills, **When** they look for design-related skills, **Then** all imported skills appear with `design-` prefix and clear trigger descriptions
2. **Given** a developer is using `/frontend-design`, **When** the skill references sub-tasks, **Then** it cross-references the appropriate imported `design-*` skills where relevant

---

### User Story 5 - Integration with Existing Design Skills (Priority: P2)

The imported skills complement (not duplicate) existing design skills. Where overlap exists, the imported skills defer to or extend the existing skills rather than contradicting them.

**Why this priority**: Conflicting guidance between old and new skills would confuse developers and reduce trust in the skill system.

**Independent Test**: Review each imported skill for references to existing skills and verify no contradictory guidance exists.

**Acceptance Scenarios**:

1. **Given** an imported skill covers territory also covered by an existing skill (e.g., color, typography, components), **When** both are consulted, **Then** they provide consistent guidance and cross-reference each other
2. **Given** the existing `tailwind-daisyui-design` skill, **When** `/design-colorize` is invoked, **Then** it defers to the existing skill's theme system and extends it with additional color strategy guidance

---

### User Story 6 - Selective Import (Priority: P3)

Not all 21 impeccable skills may be relevant to a Hugo/Tailwind/DaisyUI project. Skills that are framework-specific (e.g., React optimization) or duplicate existing functionality should be excluded or significantly adapted.

**Why this priority**: Importing irrelevant skills adds noise and maintenance burden.

**Independent Test**: Review the import list and verify each included skill has clear relevance to the Hugo/Tailwind/DaisyUI stack.

**Acceptance Scenarios**:

1. **Given** the 21 source skills, **When** the import list is finalized, **Then** each included skill has documented justification for inclusion
2. **Given** a skill like `optimize` that references React-specific patterns, **When** it is adapted, **Then** React references are replaced with Hugo/Tailwind/Alpine.js equivalents

---

### Edge Cases

- What happens when an imported skill references a technology not used in this project (e.g., React, WebGL)? → Replace with project-stack equivalents or remove the reference.
- How are skills that overlap significantly with existing skills handled? → Imported skills extend/complement; existing skills remain the authority.
- What happens when the upstream impeccable repo updates? → This is a one-time fork; no ongoing sync.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Each imported skill MUST be placed in `.claude/skills/design-{name}/SKILL.md` following the `design-` namespace prefix convention
- **FR-002**: Each imported skill MUST be adapted to reference TailwindCSS 4, DaisyUI 5, Hugo Go templates, Alpine.js 3, and HTMX instead of generic or React-specific patterns
- **FR-003**: A NOTICE file MUST be created at `.claude/skills/NOTICE` documenting Apache 2.0 attribution for all imported content, including original source URL, author, license, and list of adapted files
- **FR-004**: Each adapted skill file MUST include a header comment noting: original source, original author, license, and nature of modifications
- **FR-005**: Imported skills MUST NOT duplicate guidance already provided by existing design skills; they must extend or complement existing skills
- **FR-006**: Imported skills MUST cross-reference existing project skills where their domains overlap
- **FR-007**: The existing `frontend-design` skill MUST be renamed to `design-interview`, and `teach-impeccable`'s unique UX-focused context-gathering questions (users, brand, aesthetics, accessibility) MUST be folded into it
- **FR-007a**: The impeccable `frontend-design` skill (orchestrator/reference hub with aesthetic guidelines, AI Slop Test, and sub-skill references) MUST be imported as `design-frontend`
- **FR-010**: `design-interview` MUST be expanded into a full structured orchestrator that routes users through design phases, recommending the right `design-*` sub-skills at each stage:
  - **Interview**: `design-interview` itself (context gathering, aesthetic direction)
  - **Theme**: `daisyui-design-system-generator` (OKLCH color theme)
  - **Components**: `tailwind-daisyui-design` (component patterns, accessibility)
  - **Implement**: Hugo/HTMX/Alpine template skills
  - **Refine**: `design-bolder`, `design-quieter`, `design-colorize`, `design-typeset`, `design-arrange`, `design-animate`, `design-delight`
  - **Review**: `design-critique`, `design-audit`, `design-polish`, `design-clarify`
  - **Harden**: `design-harden`, `design-adapt`, `design-normalize`, `design-onboard`
- **FR-011**: Each phase in the orchestrator MUST provide templated prompts so developers can invoke the recommended skill without needing to know its full capabilities
- **FR-008**: Skills that reference framework-specific patterns (React, Vue, etc.) MUST be rewritten to use Hugo/Alpine.js/HTMX equivalents
- **FR-009**: Reference documents from source skills MUST also be imported and adapted where they contain valuable guidance not already covered by existing skill references

### Key Entities

- **Skill**: A SKILL.md file in `.claude/skills/design-{name}/` with optional `references/` subdirectory containing supporting documentation
- **NOTICE**: Apache 2.0 attribution file tracking provenance of imported content
- **Design Context**: The project's existing design configuration (themes, component patterns, typography) that imported skills must reference

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All imported skills produce guidance that references DaisyUI 5 components and Tailwind CSS 4 utilities — zero references to React, Vue, or vanilla CSS patterns remain
- **SC-002**: Apache 2.0 license compliance is verifiable by reviewing the NOTICE file and file headers — 100% of imported files have proper attribution
- **SC-003**: No contradictory guidance exists between imported skills and the 9 existing design skills
- **SC-004**: Developers can discover and invoke any imported skill within 30 seconds using the `design-` prefix namespace

## Assumptions

- This is a one-time import/fork, not an ongoing sync with the upstream impeccable repo
- The Apache 2.0 license permits modification and redistribution with proper attribution
- Reference documents from impeccable skills will also be imported and adapted where relevant
- The existing `frontend-design` skill will be renamed to `design-interview` to make room for the incoming impeccable `frontend-design` skill (now `design-frontend`); `teach-impeccable` context-gathering will be folded into `design-interview`
- Other existing design skills will not be renamed or reorganized (only cross-references added)

## Interview

### Open Questions

_(No open questions remain)_

**INTERVIEW COMPLETE**

### Answer Log

**Q1** (2026-03-20): Should `teach-impeccable` be imported as standalone or folded into existing `/frontend-design`?
**A1**: Fold `teach-impeccable` into the existing `frontend-design` skill, but rename `frontend-design` → `design-interview` to free the name for the incoming impeccable `frontend-design` skill (imported as `design-frontend`). The impeccable `frontend-design` is an orchestrator/reference hub with aesthetic guidelines, AI Slop Test, and sub-skill references.

**Q2** (2026-03-20): Should `overdrive` (WebGL/WebGPU/technically ambitious implementations) be included?
**A2**: Yes, import fully as `design-overdrive`. Maximum flexibility; the skill itself can warn about feasibility per-project.

**Q3** (2026-03-20): Which of the 21 skills should be excluded entirely vs. adapted?
**A3**: Import 18, exclude 3: `teach-impeccable` (folded into `design-interview`), `optimize` (React-heavy), `extract` (covered by `daisyui-design-system-generator`). Full import list confirmed.

**Q4** (2026-03-21): Should `design-interview` be expanded into a full orchestrator routing users to the right `design-*` skill at the right moment?
**A4**: Yes, expand `design-interview` into a full structured orchestrator with phases: Interview → Theme → Components → Implement → Refine → Review → Harden. Each phase routes to the appropriate `design-*` sub-skills.

**Q5** (2026-03-21): Where should the NOTICE file live — repo root or `.claude/skills/`?
**A5**: `.claude/skills/` — co-located with the attributed content.
