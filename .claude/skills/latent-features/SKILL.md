---
name: latent-features
description: Progressive disclosure of implementation patterns for Cloudflare platform features, especially security-critical patterns
allowed-tools: [Read, Bash]
---

# Latent Features Skill

**Purpose**: Token-efficient access to comprehensive implementation patterns through progressive disclosure.

---

## When to Use This Skill

**REQUIRED when**:

- Defining feature specifications (`/sp:02-specify`)
- Planning feature implementations (`/sp:04-plan`)
- Implementing authentication or session management
- Working with security-sensitive features

**DO NOT use for**:

- Simple bug fixes or refactoring
- Non-security utility functions
- Basic CRUD without authentication

---

## Available Patterns

### 0. Adding New Patterns (Meta-Pattern)

**Triggers**: create pattern, add pattern, new pattern, extend latent-features

**Covers**: Step-by-step guide for adding new patterns to this skill with progressive disclosure

**Quick start**: Read `reference/meta/adding-patterns.md`

**What you get**:

- Pattern structure requirements
- Step-by-step process (6 steps)
- File templates for all components
- Progressive disclosure guidelines
- Token efficiency best practices
- Example walkthrough
- Anti-patterns and checklist

**Use this when**:

- Adding new implementation patterns to latent-features skill
- Understanding the pattern structure and rationale
- Need templates for PATTERN.md, architecture/, implementation/ files

---

### 1. Secure Session-Based Authentication

**Triggers**: authentication, login, logout, session, password, user registration, auth

**Covers**: OWASP-compliant session auth for Cloudflare Workers with defense-in-depth security

**Quick start**: Read `reference/secure-auth/PATTERN.md` for complete pattern guide

**Progressive disclosure**:

- Specification phase → `architecture/overview.md` (~120 lines)
- Planning phase → `implementation/domain-entities.md` (~504 lines)
- Implementation → Choose from implementation/\*.md files (~295-458 lines each)

**Reference structure**:

```
reference/secure-auth/
├── PATTERN.md                          # Pattern guide (this file)
├── architecture/
│   └── overview.md                     # Security architecture, threat model
└── implementation/
    ├── domain-entities.md              # User, Session, Email, Password
    ├── password-security.md            # Argon2id, PBKDF2
    ├── session-management.md           # KV storage, cookies, lifecycle
    ├── csrf-protection.md              # CSRF middleware, tokens
    └── xss-prevention.md               # Output encoding, safe templates
```

---

## Usage Pattern

### 1. Read Pattern Guide First

When a pattern applies to your task, start here:

```bash
Read .claude/skills/latent-features/reference/[pattern-name]/PATTERN.md
```

This gives you:

- Pattern overview and capabilities
- Progressive disclosure roadmap
- Which files to read for your current phase
- Token efficiency guidance

### 2. Follow Progressive Disclosure Path

The pattern guide tells you which files to load based on your phase:

- **Specification**: Load architecture overview (~100-150 lines)
- **Planning**: Load domain/architecture files (~500-700 lines)
- **Implementation**: Load specific implementation files as needed (~300-500 lines each)

### 3. Access Full Reference (Rarely)

Only when focused files are insufficient:

```bash
Read docs/[pattern-name]-guide.md
```

---

## Token Efficiency

**Example workflow** (secure authentication):

```
Read PATTERN.md                    →  ~200 lines (pattern guide)
Read architecture/overview.md      →  ~120 lines (specification)
Read implementation/domain-entities.md → ~504 lines (planning)
Read implementation/password-security.md → ~295 lines (implementation)

Total: ~1,119 lines across 4 files
vs full guide: ~3,818 lines
Savings: ~71% token reduction
```

---

## Adding New Patterns

**See Pattern 0 (Meta-Pattern) above** for complete guide: `reference/meta/adding-patterns.md`

**Quick reference**:

1. Create comprehensive guide in `docs/[pattern-name]-guide.md`
2. Extract focused reference files following pattern structure
3. Write PATTERN.md with progressive disclosure path
4. Update this SKILL.md with pattern entry

**Pattern structure**:

```
reference/[pattern-name]/
├── PATTERN.md                      # Pattern guide (350-500 lines)
├── architecture/
│   └── overview.md                 # High-level design (100-150 lines)
└── implementation/
    └── [component].md              # Focused implementation (250-500 lines)
```

---

## Best Practices

1. **Always start with PATTERN.md** - It's your roadmap
2. **Load only what you need** - Progressive disclosure saves tokens
3. **Follow the recommended path** - Each phase has optimal files
4. **Cache context efficiently** - Files stay in context once loaded
5. **Defer full guide** - Only load complete reference when necessary

---

## Notes

- All patterns follow OWASP guidelines (current as of January 2026)
- Security patterns use defense-in-depth (multiple layers)
- Implementation examples use TypeScript for Cloudflare Workers
- Architecture patterns assume DDD/Clean Architecture
- All patterns include testing strategies
