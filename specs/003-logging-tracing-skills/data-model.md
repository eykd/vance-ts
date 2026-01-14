# Data Model: Logging & Tracing Skills Structure

**Feature**: 003-logging-tracing-skills
**Date**: 2026-01-14
**Purpose**: Define skill structure, file relationships, and content organization

## Skill Entity Model

### Skill

Represents a single Claude Code skill directory with SKILL.md and references/.

**Attributes**:

- `name`: kebab-case identifier (e.g., "structured-logging")
- `description`: One-line "Use when:" description
- `skill_md_path`: `.claude/skills/{name}/SKILL.md`
- `references_dir`: `.claude/skills/{name}/references/`
- `line_count_limit`: 150 lines for SKILL.md (SC-001)

**Relationships**:

- HAS MANY Reference Files (1 skill → 3-5 references)
- CROSS-REFERENCES Other Skills (via named links in SKILL.md)

**Validation Rules**:

- SKILL.md must be <150 lines
- Description must start with "Use when:"
- Must have at least 2 reference files
- All code examples must compile (TypeScript strict mode)

---

### Reference File

Represents a detailed markdown file covering one specific topic within a skill.

**Attributes**:

- `filename`: kebab-case with .md extension (e.g., "safe-logger.md")
- `file_path`: `.claude/skills/{skill_name}/references/{filename}`
- `topic`: Single focused topic
- `line_count_range`: 50-150 lines (guideline, not hard limit)
- `content_mix`: ~35% code examples, ~35% decision matrices, ~30% explanatory text

**Relationships**:

- BELONGS TO One Skill
- MAY REFERENCE Other Reference Files (within same or different skills)

**Validation Rules**:

- Must have clear single-topic focus
- Code examples must be complete (imports, types, exports)
- Must provide sufficient detail for implementation without external docs (SC-004)

---

### Cross-Reference

Represents a link from one skill to another for related concerns.

**Attributes**:

- `from_skill`: Source skill name
- `to_skill`: Target skill name
- `context`: What the target skill provides
- `location`: Where the link appears (SKILL.md or specific reference file)

**Validation Rules**:

- Must not create circular dependencies
- Target skill must exist
- Context must be specific (not generic "for more info")

---

## Skill Definitions

### Skill 1: structured-logging

**Directory**: `.claude/skills/structured-logging/`

**Description**: Use when adding structured logging to Cloudflare Workers with request correlation and environment-aware redaction.

**SKILL.md Structure** (<150 lines):

- When to use (5-10 lines)
- Decision tree:
  - Need logger setup? → see references/safe-logger.md
  - Need request correlation? → see references/context-management.md
  - Need schema compliance? → see references/base-fields.md + references/event-naming.md
  - Need factory patterns? → see references/logger-factory.md
- Quick example: Basic SafeLogger usage (10-15 lines)
- Cross-references:
  - log-categorization (for choosing category)
  - pii-redaction (for safety)
  - cloudflare-observability (for metrics integration)

**Reference Files**:

1. `safe-logger.md` (80-100 lines)
   - SafeLogger class implementation
   - Redaction integration
   - Production vs development modes
2. `context-management.md` (70-90 lines)
   - AsyncLocalStorage setup
   - W3C Trace Context parsing
   - Request ID generation and propagation
3. `base-fields.md` (60-80 lines)
   - BaseLogFields interface
   - Required field checklist
   - Field validation patterns
4. `event-naming.md` (50-70 lines)
   - Dot-notation convention ({domain}.{entity}.{action}[.{outcome}])
   - Event naming examples by category
   - Common patterns catalog
5. `logger-factory.md` (60-80 lines)
   - Factory function patterns
   - Environment configuration
   - Logger instance management

**Total**: 1 SKILL.md + 5 references

---

### Skill 2: log-categorization

**Directory**: `.claude/skills/log-categorization/`

**Description**: Use when determining whether logs belong to domain, application, or infrastructure layers following Clean Architecture.

**SKILL.md Structure** (<150 lines):

- When to use (5-10 lines)
- Decision tree:
  - Business event? → domain
  - Request flow? → application
  - External system? → infrastructure
  - Unsure? → see references/decision-matrix.md
- Quick examples: One log per category (20-30 lines)
- Cross-references:
  - structured-logging (for base logger setup)
  - cloudflare-observability (for SLO impact)

**Reference Files**:

1. `decision-matrix.md` (50-70 lines)
   - Decision flow chart
   - Question-based categorization
   - Edge cases and how to resolve
2. `domain-logging.md` (80-100 lines)
   - Domain event patterns
   - Aggregate logging
   - Required fields (aggregate_type, aggregate_id, domain_event)
3. `application-logging.md` (80-100 lines)
   - Request flow patterns
   - Use case execution logging
   - HTTP context, timing, validation failures
4. `infrastructure-logging.md` (80-100 lines)
   - Repository operation patterns
   - External API call logging
   - Query timing, operation types, connection health

**Total**: 1 SKILL.md + 4 references

---

### Skill 3: pii-redaction

**Directory**: `.claude/skills/pii-redaction/`

**Description**: Use when implementing systematic PII and secret redaction for defense-in-depth data protection in logs.

**SKILL.md Structure** (<150 lines):

- When to use (5-10 lines)
- Decision tree:
  - Need pattern catalog? → references/sensitive-patterns.md
  - Need field detection? → references/field-detection.md
  - Need redaction logic? → references/redaction-functions.md
  - Need URL sanitization? → references/url-sanitization.md
- Quick example: redactValue usage (10-15 lines)
- Cross-references:
  - structured-logging (for logger integration)

**Reference Files**:

1. `sensitive-patterns.md` (100-120 lines)
   - SENSITIVE_PATTERNS regex catalog
   - API keys, JWT tokens, AWS credentials
   - Credit cards, PII (email, phone, SSN, IP)
   - Test cases for each pattern
2. `field-detection.md` (60-80 lines)
   - REDACT_FIELDS set (password, token, secret, etc.)
   - MASK_FIELDS set (email, phone, ip)
   - Field naming conventions that trigger redaction
3. `redaction-functions.md` (100-120 lines)
   - redactValue() recursive implementation
   - redactObject() field-level logic
   - redactString() pattern application
   - Circular reference detection
4. `url-sanitization.md` (60-80 lines)
   - redactUrl() implementation
   - Sensitive query parameter detection
   - Path segment anonymization

**Total**: 1 SKILL.md + 4 references

---

### Skill 4: sentry-integration

**Directory**: `.claude/skills/sentry-integration/`

**Description**: Use when integrating Sentry for rich error tracking with breadcrumbs and context while maintaining structured log correlation.

**SKILL.md Structure** (<150 lines):

- When to use (5-10 lines)
- Decision tree:
  - Initial setup? → references/withsentry-setup.md
  - Add context? → references/context-management.md
  - Track operations? → references/breadcrumbs.md
  - Capture errors? → references/error-capture.md
- Quick example: withSentry wrapper (15-20 lines)
- Cross-references:
  - structured-logging (for log correlation)
  - pii-redaction (for beforeSend filtering)

**Reference Files**:

1. `withsentry-setup.md` (80-100 lines)
   - withSentry wrapper configuration
   - Release tracking via CF_VERSION_METADATA
   - Environment setup, sampling rates
   - beforeBreadcrumb and beforeSend hooks
2. `context-management.md` (70-90 lines)
   - setUser() patterns (without PII)
   - setTag() for filtering
   - setContext() for request metadata
3. `breadcrumbs.md` (60-80 lines)
   - addBreadcrumb() categories
   - PII-safe data patterns
   - Breadcrumb lifecycle
4. `error-capture.md` (70-90 lines)
   - captureException() with context
   - captureMessage() for warnings
   - Fail-open pattern handling

**Total**: 1 SKILL.md + 4 references

---

### Skill 5: testing-observability

**Directory**: `.claude/skills/testing-observability/`

**Description**: Use when writing tests for logging implementation including logger behavior, redaction correctness, and Workers runtime integration.

**SKILL.md Structure** (<150 lines):

- When to use (5-10 lines)
- Decision tree:
  - Logger unit tests? → references/logger-unit-tests.md
  - Redaction validation? → references/redaction-tests.md
  - Integration tests? → references/miniflare-integration.md
- Quick example: console.log spy test (15-20 lines)
- Cross-references:
  - typescript-unit-testing (for general TDD patterns)
  - vitest-cloudflare-config (for Workers test setup)

**Reference Files**:

1. `logger-unit-tests.md` (80-100 lines)
   - console.log spy patterns
   - JSON.parse validation
   - Field presence assertions
   - Environment-aware behavior tests
2. `redaction-tests.md` (100-120 lines)
   - Test cases for each SENSITIVE_PATTERN
   - Field redaction validation
   - Circular reference handling
   - URL sanitization tests
3. `miniflare-integration.md` (80-100 lines)
   - Miniflare setup for Workers
   - Console capture patterns
   - JSON log parsing in tests
   - AsyncLocalStorage context in tests

**Total**: 1 SKILL.md + 3 references

---

## Cross-Reference Matrix

| From Skill            | To Skill                 | Context                                 | Location |
| --------------------- | ------------------------ | --------------------------------------- | -------- |
| structured-logging    | log-categorization       | Choosing appropriate category           | SKILL.md |
| structured-logging    | pii-redaction            | Integrating redaction into logger       | SKILL.md |
| structured-logging    | cloudflare-observability | Request timing and metrics integration  | SKILL.md |
| log-categorization    | structured-logging       | Base logger setup before categorization | SKILL.md |
| log-categorization    | cloudflare-observability | SLO impact categorization               | SKILL.md |
| pii-redaction         | structured-logging       | Logger integration points               | SKILL.md |
| sentry-integration    | structured-logging       | Log correlation with Sentry breadcrumbs | SKILL.md |
| sentry-integration    | pii-redaction            | beforeSend filtering patterns           | SKILL.md |
| testing-observability | typescript-unit-testing  | General TDD workflow and patterns       | SKILL.md |
| testing-observability | vitest-cloudflare-config | Workers-specific test configuration     | SKILL.md |

## File Size Summary

| Skill                 | SKILL.md Lines | Reference Count | Total Reference Lines | Total Lines |
| --------------------- | -------------- | --------------- | --------------------- | ----------- |
| structured-logging    | ~130           | 5               | ~380                  | ~510        |
| log-categorization    | ~120           | 4               | ~330                  | ~450        |
| pii-redaction         | ~110           | 4               | ~340                  | ~450        |
| sentry-integration    | ~120           | 4               | ~300                  | ~420        |
| testing-observability | ~110           | 3               | ~280                  | ~390        |

**Grand Total**: 5 SKILL.md files (~590 lines) + 20 reference files (~1,630 lines) = ~2,220 total lines

**Average per skill**: ~444 lines (SKILL.md + all references)

**Token efficiency**: Developers typically load 1 SKILL.md (~120 lines) + 1-2 references (~150 lines) = ~270 lines per invocation, well within token budget.

## Validation Checklist

- [ ] All SKILL.md files under 150 lines (SC-001)
- [ ] All descriptions start with "Use when:" (SC-002)
- [ ] All code examples compile with strict TypeScript (SC-003)
- [ ] Reference files provide sufficient implementation detail (SC-004)
- [ ] Cross-references are accurate and bidirectional where appropriate (SC-005)
- [ ] Redaction patterns align with OWASP/NIST guidelines (SC-006)
- [ ] No content duplication from 002-observability-skills (FR-011)
- [ ] All skills follow progressive disclosure pattern (FR-012)
