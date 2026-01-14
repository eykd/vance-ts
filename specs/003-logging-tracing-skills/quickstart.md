# Quickstart: Implementing Logging & Tracing Skills

**Feature**: 003-logging-tracing-skills
**Date**: 2026-01-14
**Purpose**: Step-by-step guide for implementing the logging/tracing Claude Code skills

## Prerequisites

- Existing Claude Code skills directory: `.claude/skills/`
- Existing skill patterns to reference: `typescript-unit-testing/`, `cloudflare-observability/`
- Access to source guide: `docs/logging-tracing-guide.md`
- TypeScript development environment with strict mode enabled

## Implementation Sequence

The skills should be implemented in priority order matching user stories:

**Phase 1 (P1 - Foundation)**:

1. structured-logging
2. log-categorization

**Phase 2 (P2 - Important)**: 3. pii-redaction 4. event-naming (note: merged into structured-logging per research.md Decision 5)

**Phase 3 (P3 - Supplementary)**: 5. sentry-integration 6. testing-observability

## Step-by-Step Implementation

### Step 1: Create Skill Directory Structure

For each skill, create the directory structure:

```bash
mkdir -p .claude/skills/{skill-name}/references
```

**Skills to create**:

- `structured-logging`
- `log-categorization`
- `pii-redaction`
- `sentry-integration`
- `testing-observability`

### Step 2: Implement structured-logging (Priority: P1)

**Why first**: Foundation for all other logging skills (User Story 1, FR-005)

1. **Create SKILL.md** (~130 lines):
   - Use `contracts/skill-template.md` as starting point
   - Description: "Use when adding structured logging to Cloudflare Workers with request correlation and environment-aware redaction"
   - Decision tree:
     - Need logger setup? → safe-logger.md
     - Need request correlation? → context-management.md
     - Need schema compliance? → base-fields.md + event-naming.md
     - Need factory patterns? → logger-factory.md
   - Quick example: Basic SafeLogger with AsyncLocalStorage
   - Cross-references: log-categorization, pii-redaction, cloudflare-observability

2. **Create reference files**:
   - `safe-logger.md` (~90 lines): SafeLogger class with redaction integration
   - `context-management.md` (~80 lines): AsyncLocalStorage, W3C Trace Context
   - `base-fields.md` (~70 lines): BaseLogFields interface, validation
   - `event-naming.md` (~60 lines): Dot-notation convention, examples
   - `logger-factory.md` (~70 lines): Factory patterns, environment config

3. **Extract from docs/logging-tracing-guide.md**:
   - Lines 57-105: Minimal Example → safe-logger.md
   - Lines 1181-1236: Request Context Management → context-management.md
   - Lines 199-288: Structured Logging Schema → base-fields.md
   - Lines 289-312: Event Naming Convention → event-naming.md
   - Lines 1237-1301: Logger Factory → logger-factory.md

4. **Validation**:
   - Compile all TypeScript examples
   - Verify SKILL.md <150 lines
   - Verify cross-references are accurate

### Step 3: Implement log-categorization (Priority: P1)

**Why second**: Complements structured-logging with Clean Architecture boundaries (User Story 2, FR-006)

1. **Create SKILL.md** (~120 lines):
   - Description: "Use when determining whether logs belong to domain, application, or infrastructure layers following Clean Architecture"
   - Decision tree: Business event → domain, Request flow → application, External system → infrastructure
   - Quick example: One log per category
   - Cross-references: structured-logging, cloudflare-observability

2. **Create reference files**:
   - `decision-matrix.md` (~60 lines): Flow chart for categorization
   - `domain-logging.md` (~90 lines): Domain events, aggregate logging
   - `application-logging.md` (~90 lines): Use case patterns, request flow
   - `infrastructure-logging.md` (~90 lines): Repository operations, external APIs

3. **Extract from docs/logging-tracing-guide.md**:
   - Lines 334-522: Log Categories section → all reference files
   - Lines 512-522: Decision Matrix → decision-matrix.md
   - Lines 338-380: Domain Logs → domain-logging.md
   - Lines 382-451: Application Logs → application-logging.md
   - Lines 453-511: Infrastructure Logs → infrastructure-logging.md

4. **Validation**:
   - Verify decision matrix is clear and actionable
   - Verify examples for each category compile

### Step 4: Implement pii-redaction (Priority: P2)

**Why third**: Builds on logger foundation with safety patterns (User Story 3, FR-007)

1. **Create SKILL.md** (~110 lines):
   - Description: "Use when implementing systematic PII and secret redaction for defense-in-depth data protection in logs"
   - Decision tree routes to pattern/field/function/URL references
   - Quick example: redactValue usage
   - Cross-references: structured-logging

2. **Create reference files**:
   - `sensitive-patterns.md` (~110 lines): SENSITIVE_PATTERNS catalog
   - `field-detection.md` (~70 lines): REDACT_FIELDS, MASK_FIELDS
   - `redaction-functions.md` (~110 lines): redactValue, redactObject, redactString
   - `url-sanitization.md` (~70 lines): redactUrl implementation

3. **Extract from docs/logging-tracing-guide.md**:
   - Lines 892-1160: PII and Secret Redaction section
   - Lines 905-1033: Redaction Patterns → sensitive-patterns.md, field-detection.md
   - Lines 1035-1101: Safe Logger Implementation → redaction-functions.md
   - Lines 1102-1157: URL Redaction → url-sanitization.md

4. **Validation**:
   - Test redaction patterns against OWASP/NIST guidelines (SC-006)
   - Verify all regex patterns are valid

### Step 5: Implement sentry-integration (Priority: P3)

**Why fourth**: Supplementary to core logging (User Story 4, FR-008)

1. **Create SKILL.md** (~120 lines):
   - Description: "Use when integrating Sentry for rich error tracking with breadcrumbs and context while maintaining structured log correlation"
   - Decision tree routes to setup/context/breadcrumbs/error-capture
   - Quick example: withSentry wrapper
   - Cross-references: structured-logging, pii-redaction

2. **Create reference files**:
   - `withsentry-setup.md` (~90 lines): Initial configuration
   - `context-management.md` (~80 lines): setUser, setTag, setContext
   - `breadcrumbs.md` (~70 lines): addBreadcrumb patterns
   - `error-capture.md` (~80 lines): captureException with context

3. **Extract from docs/logging-tracing-guide.md**:
   - Lines 637-891: Sentry Integration section
   - Lines 658-727: Basic Setup with withSentry → withsentry-setup.md
   - Lines 728-763: Adding Custom Context → context-management.md
   - Lines 764-816: Manual Error Capture → breadcrumbs.md, error-capture.md
   - Lines 817-853: Using Sentry Logs API → error-capture.md

4. **Validation**:
   - Verify @sentry/cloudflare SDK usage (not browser/node)
   - Verify beforeSend/beforeBreadcrumb filtering examples

### Step 6: Implement testing-observability (Priority: P3)

**Why fifth**: Testing patterns after core skills are defined (User Story 6, FR-010)

1. **Create SKILL.md** (~110 lines):
   - Description: "Use when writing tests for logging implementation including logger behavior, redaction correctness, and Workers runtime integration"
   - Decision tree routes to logger-unit/redaction/miniflare tests
   - Quick example: console.log spy test
   - Cross-references: typescript-unit-testing, vitest-cloudflare-config

2. **Create reference files**:
   - `logger-unit-tests.md` (~90 lines): console spy patterns
   - `redaction-tests.md` (~110 lines): Pattern validation tests
   - `miniflare-integration.md` (~90 lines): Workers integration patterns

3. **Extract from docs/logging-tracing-guide.md**:
   - Lines 1434-1654: Testing Observability section
   - Lines 1436-1523: Unit Testing the Logger → logger-unit-tests.md
   - Lines 1525-1600: Testing Redaction → redaction-tests.md
   - Lines 1602-1653: Integration Testing with Miniflare → miniflare-integration.md

4. **Validation**:
   - Verify test examples use Vitest (not Jest)
   - Verify vitest-pool-workers integration patterns

## Content Extraction Strategy

For each skill, follow this process:

1. **Identify source sections** in docs/logging-tracing-guide.md
2. **Extract relevant content** (code examples, patterns, decision matrices)
3. **Adapt to skill format**:
   - Remove narrative prose
   - Focus on actionable patterns
   - Add decision tree structure
   - Include cross-references
4. **Validate**:
   - Compile all TypeScript examples
   - Verify SKILL.md <150 lines
   - Check SC-001 through SC-006

## Quality Checklist

Before marking any skill complete, verify:

- [ ] SKILL.md is under 150 lines (SC-001)
- [ ] Description starts with "Use when:" (SC-002)
- [ ] All code examples compile with strict TypeScript (SC-003)
- [ ] References provide sufficient implementation detail (SC-004)
- [ ] Cross-references are accurate and reciprocal (SC-005)
- [ ] Redaction patterns follow OWASP/NIST guidelines (SC-006)
- [ ] No duplication from 002-observability-skills (FR-011)
- [ ] Progressive disclosure via references (FR-012)

## Post-Implementation

### Update Agent Context

After all skills are implemented, update agent context:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will add new skills to `.claude/CLAUDE.md` Active Technologies section.

### Testing

While skills are documentation (Constitution IV: N/A), validate:

- All code examples compile: `tsc --noEmit` on extracted examples
- Cross-references are valid: Check all skill links resolve
- No broken links: Verify all internal references

### Documentation

Update project documentation:

- Add skills to `.claude/skills/README.md` (if exists)
- Document skill invocation patterns
- Add examples of skill usage to main CLAUDE.md

## Common Pitfalls to Avoid

1. **Exceeding line limits**: SKILL.md must stay <150 lines. Move details to references.
2. **Incomplete code examples**: All examples must compile with imports/exports.
3. **Circular references**: Avoid skill A → skill B → skill A cycles.
4. **Content duplication**: Check 002-observability-skills before adding content.
5. **Vague cross-references**: "See skill X" is too vague; specify what X provides.
6. **Missing types**: All functions need explicit return types per Constitution II.
7. **Using `any`**: Forbidden by Constitution II; use `unknown` with type guards.

## Implementation Time Estimate

**Per skill** (average):

- SKILL.md creation: 1-2 hours
- Reference file creation: 3-5 hours (depending on complexity)
- Content extraction and adaptation: 2-3 hours
- Validation and testing: 1-2 hours
- **Total per skill**: 7-12 hours

**Total for all 5 skills**: 35-60 hours

**Recommended approach**: Implement in priority order (P1 → P2 → P3) to deliver value incrementally.

## Next Steps

1. Run `/sp:06-tasks` to generate detailed implementation tasks
2. Begin with structured-logging skill (highest priority)
3. Validate each skill before moving to next
4. Update agent context after completion
5. Document usage patterns in main CLAUDE.md
