# Checklist: Build Script Requirements Quality

**Purpose**: Validate completeness, clarity, and consistency of requirements for the `build-template.sh` script
**Created**: 2026-01-19
**Focus**: Build script (FR-001 through FR-013, FR-017, FR-019)
**Depth**: Standard
**Audience**: Author (Self-Review)

---

## Requirement Completeness

- [ ] CHK001 - Are all file types that should be excluded explicitly enumerated? [Completeness, Spec §FR-003 through §FR-007]
- [ ] CHK002 - Is the behavior defined when a file matches multiple exclusion rules? [Gap]
- [ ] CHK003 - Are requirements for handling symbolic links documented? [Gap]
- [ ] CHK004 - Is the behavior for empty directories specified? [Gap]
- [ ] CHK005 - Are requirements for files with special characters in names defined? [Gap]

## Requirement Clarity

- [ ] CHK006 - Is "files matching patterns in `.gitignore`" precisely defined (recursive, nested .gitignore files, negation patterns)? [Clarity, Spec §FR-003]
- [ ] CHK007 - Is the exact format of `{### FILE path ###}` headers documented with escaping rules? [Clarity, Spec §FR-011]
- [ ] CHK008 - Is "exclusions count" in progress summary defined (files, directories, or both)? [Clarity, Spec §FR-017]
- [ ] CHK009 - Is "files processed count" defined (total files, or only included files)? [Clarity, Spec §FR-017]
- [ ] CHK010 - Is the exact structure of the generated `wrangler.toml` specified beyond the listed requirements? [Clarity, Spec §FR-008 through §FR-010]

## Requirement Consistency

- [ ] CHK011 - Are exclusion rules in FR-003 through FR-007 consistent with what's actually in .gitignore? [Consistency]
- [ ] CHK012 - Is the `dist/` directory exclusion requirement missing (since dist/ contains the output)? [Consistency, Gap]
- [ ] CHK013 - Is `node_modules/` explicitly excluded or assumed via .gitignore? [Consistency, Gap]

## Edge Case Coverage

- [ ] CHK014 - Is behavior specified when repository root has no .gitignore file? [Edge Case, Spec §FR-003]
- [ ] CHK015 - Are requirements defined for handling binary files with embedded `{###` sequences? [Edge Case, Spec §FR-011]
- [ ] CHK016 - Is behavior specified for files larger than available memory? [Edge Case, Gap]
- [ ] CHK017 - Are requirements for handling read-protected files documented? [Edge Case, Gap]
- [ ] CHK018 - Is behavior defined when output path is on a read-only filesystem? [Edge Case, Spec §FR-002]

## wrangler.toml Generation

- [ ] CHK019 - Is the complete structure of the generated wrangler.toml defined (not just the three listed elements)? [Completeness, Spec §FR-008 through §FR-010]
- [ ] CHK020 - Are the exact commented-out binding formats specified for D1, KV, and R2? [Clarity, Spec §FR-010]
- [ ] CHK021 - Is the `{{ app_name }}` syntax confirmed as correct for tmplr variables? [Clarity, Spec §FR-008]
- [ ] CHK022 - Are other wrangler.toml fields required (compatibility_date, main entry point)? [Gap]

## Variable Substitution

- [ ] CHK023 - Is behavior specified when `package.json` doesn't have a `name` field? [Edge Case, Spec §FR-012]
- [ ] CHK024 - Are requirements for escaping `{{` and `}}` in non-variable contexts defined? [Clarity, Gap]
- [ ] CHK025 - Is the scope of variable substitution clear (only package.json name, or other files)? [Clarity, Spec §FR-012]

## Output Format

- [ ] CHK026 - Is the file encoding for template output specified (UTF-8, line endings)? [Gap]
- [ ] CHK027 - Are requirements for preserving file permissions in the template defined? [Gap]
- [ ] CHK028 - Is the order of files in the template output specified (alphabetical, directory-first)? [Gap]

## Error Handling

- [ ] CHK029 - Are error reporting requirements defined for build failures? [Gap]
- [ ] CHK030 - Is the exit code requirement specified for build script failures? [Gap]
- [ ] CHK031 - Are requirements for partial failure handling defined (continue on error vs stop)? [Gap]

## Non-Functional Requirements

- [ ] CHK032 - Is the 30-second performance target (SC-001) measurable with defined conditions? [Measurability, Spec §SC-001]
- [ ] CHK033 - Are disk space requirements for the build process documented? [Gap]
- [ ] CHK034 - Is the dependency on specific Bash version (5.x) a hard requirement or best-effort? [Clarity, Spec §FR-019]

---

**Total Items**: 34
**Traceability**: 26/34 items (76%) reference spec sections or mark gaps
