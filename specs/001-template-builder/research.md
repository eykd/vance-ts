# Research: Template Builder

**Feature**: 001-template-builder
**Date**: 2026-01-19
**Status**: Complete

## Research Questions & Findings

### 1. Which tmplr project to use?

**Decision**: [exlee/tmplr](https://github.com/exlee/tmplr) (Rust-based)

**Rationale**: The specification explicitly mentions "txtar-inspired with `{### FILE path ###}` headers" which matches exlee/tmplr's format. There's also loreanvictor/tmplr (Node.js-based) which uses YAML recipes, but it doesn't match the spec's file format description.

**Alternatives Considered**:

- loreanvictor/tmplr: Node.js-based, uses `.tmplr.yml` YAML config files with `steps` and context-based variable expansion. More complex, requires npm/Node.js at runtime.
- Custom implementation: Would duplicate tmplr functionality unnecessarily.

### 2. tmplr File Format Specification

**Decision**: Use txtar-inspired format with three section types

**Format Details**:

```
# Preamble (treated as comment - anything before first section header)
This template creates a turtlebased-ts project.

{### FILE path/to/file.txt ###}
Content of the file goes here.
Supports {{ variable }} substitution.

{### EXT path/to/append.txt ###}
Content appended to existing file (if not already present).

{### DIR path/to/directory ###}
(Creates empty directory - no content allowed)
```

**Key Points**:

- Variable syntax: `{{ variable_name }}` in both filenames and content
- Magic variables: `$path` (relative path), `$file` (current filename)
- Preamble before first `{### ... ###}` is ignored (comment)
- FILE sections overwrite completely
- EXT sections append if content not already present

### 3. tmplr Binary Releases

**Decision**: Pin to v0.0.9 with embedded checksums

**Available Binaries** (v0.0.9, 2026-01-14):

| Platform | Architecture          | Binary Name                       | Size   |
| -------- | --------------------- | --------------------------------- | ------ |
| macOS    | Apple Silicon (arm64) | `tmplr-aarch64-apple-darwin`      | 436 KB |
| macOS    | Intel (x86_64)        | `tmplr-x86_64-apple-darwin`       | 457 KB |
| Linux    | arm64                 | `tmplr-aarch64-unknown-linux-gnu` | 467 KB |
| Linux    | x86_64                | `tmplr-x86_64-unknown-linux-gnu`  | 509 KB |

**Download URL Pattern**:

```
https://github.com/exlee/tmplr/releases/download/v0.0.9/tmplr-{arch}-{platform}
```

**Checksum Strategy**: The tmplr project does not publish official checksum files. To satisfy FR-020, we will:

1. Download each binary once during initial script development
2. Compute SHA256 checksums locally
3. Embed checksums in `install-tmplr.sh` as hardcoded constants
4. Verify downloaded binary against embedded checksum before use

### 4. Platform Detection Strategy

**Decision**: Use `uname -s` and `uname -m` for platform/architecture detection

**Detection Logic**:

```bash
OS=$(uname -s)      # Darwin, Linux
ARCH=$(uname -m)    # x86_64, arm64, aarch64

# Map to tmplr binary names
case "$OS" in
  Darwin) PLATFORM="apple-darwin" ;;
  Linux)  PLATFORM="unknown-linux-gnu" ;;
  *)      error "Unsupported OS: $OS" ;;
esac

case "$ARCH" in
  x86_64)         ARCH_NAME="x86_64" ;;
  arm64|aarch64)  ARCH_NAME="aarch64" ;;
  *)              error "Unsupported architecture: $ARCH" ;;
esac

BINARY="tmplr-${ARCH_NAME}-${PLATFORM}"
```

### 5. Exclusion Strategy for Build Script

**Decision**: Combine .gitignore patterns with hardcoded exclusions

**Exclusion Sources**:

1. `.gitignore` patterns (FR-003)
2. Hardcoded list: `.git/`, `.beads/`, `specs/`, `thoughts/` (FR-004 through FR-007)

**Implementation Approach**:

- Use `git ls-files` to get tracked files (automatically respects .gitignore)
- Additionally filter out the four hardcoded directories
- This is more reliable than parsing .gitignore manually

**Alternative Considered**: Using `find` with manual .gitignore parsing - rejected because:

- Complex to implement correctly (gitignore has nuanced pattern matching)
- Reinvents what git already does well
- Higher risk of bugs with negation patterns, directory-only patterns, etc.

### 6. wrangler.toml Generation

**Decision**: Use heredoc template embedded in build script

**Template Content** (from FR-008 through FR-010):

```toml
name = "{{ app_name }}"
pages_build_output_dir = "hugo/public"

# Uncomment and configure bindings as needed:
#
# [[d1_databases]]
# binding = "DB"
# database_name = "my-database"
# database_id = "your-database-id"
#
# [[kv_namespaces]]
# binding = "KV"
# id = "your-kv-namespace-id"
#
# [[r2_buckets]]
# binding = "R2"
# bucket_name = "my-bucket"
```

### 7. package.json Variable Substitution

**Decision**: Replace the `name` field value with `{{ app_name }}`

The build script will:

1. Read `package.json`
2. Use `sed` to replace `"name": "turtlebased-ts"` with `"name": "{{ app_name }}"`
3. Include modified content in template

**Edge Case**: If package.json name is already templated, the substitution should be idempotent.

### 8. tmplr Installation Location

**Decision**: Install to `~/.local/bin/tmplr`

**Rationale**:

- `~/.local/bin` is a standard user-local binary directory
- Doesn't require root/sudo
- Is typically in PATH on modern Linux/macOS systems
- Follows XDG Base Directory Specification conventions

**Alternative Considered**: `/usr/local/bin` - rejected because it requires sudo and may not be writable in restricted environments.

## Open Questions (None)

All clarifications from spec.md have been resolved during this research phase.

## Sources

- [exlee/tmplr GitHub Repository](https://github.com/exlee/tmplr)
- [tmplr v0.0.9 Release](https://github.com/exlee/tmplr/releases/tag/v0.0.9)
- [loreanvictor/tmplr GitHub Repository](https://github.com/loreanvictor/tmplr) (alternative, not used)
