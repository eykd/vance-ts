# Quickstart: Import Impeccable Design Skills

**Branch**: `013-import-design-skills` | **Date**: 2026-03-21

## What This Feature Does

Imports 18 design skills from the [impeccable](https://github.com/pbakaus/impeccable) project into the Claude Code skill system, adapted for the Hugo/TailwindCSS 4/DaisyUI 5 stack. Adds a structured design workflow orchestrator (`/design-interview`) that guides developers through multi-phase design tasks.

## How to Verify

### 1. Check Skill Availability

All imported skills should appear with `design-` prefix:

```
/design-interview    # Orchestrator (start here)
/design-frontend     # Reference hub & anti-patterns
/design-polish       # Final quality pass
/design-arrange      # Layout & spacing
/design-colorize     # Strategic color
/design-typeset      # Typography
/design-animate      # Motion design
/design-delight      # Personality & joy
/design-critique     # UX evaluation
/design-audit        # Quality audit
/design-clarify      # UX copy & microcopy
/design-bolder       # Amplify safe designs
/design-quieter      # Tone down aggressive designs
/design-harden       # Production resilience
/design-adapt        # Cross-device adaptation
/design-normalize    # Design system alignment
/design-onboard      # Onboarding flows
/design-overdrive    # Technically ambitious
/design-distill      # Simplification
```

### 2. Check License Compliance

```bash
# NOTICE file exists
cat .claude/skills/NOTICE

# File headers present
head -10 .claude/skills/design-polish/SKILL.md
```

### 3. Test the Orchestrator

Invoke `/design-interview` and verify it:

1. Asks context-gathering questions (users, brand, aesthetics)
2. Recommends proceeding to Theme phase with `daisyui-design-system-generator`
3. Provides a templated prompt for the recommended skill

### 4. Verify Stack Adaptation

Invoke any imported skill (e.g., `/design-arrange`) and check that:

- References use DaisyUI 5 components (not MUI, Chakra, generic CSS)
- References use TailwindCSS 4 utilities (not CSS-in-JS)
- References use Hugo templates (not React/JSX)
- References use Alpine.js (not React state management)

## Key Files

| File                                             | Purpose                                     |
| ------------------------------------------------ | ------------------------------------------- |
| `.claude/skills/NOTICE`                          | Apache 2.0 attribution                      |
| `.claude/skills/design-interview/SKILL.md`       | Orchestrator (renamed from frontend-design) |
| `.claude/skills/design-frontend/SKILL.md`        | Reference hub (from impeccable)             |
| `.claude/skills/design-*/SKILL.md`               | 16 individual design skills                 |
| `.claude/skills/design-frontend/references/*.md` | 7 reference documents                       |
