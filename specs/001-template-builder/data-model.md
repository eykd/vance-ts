# Data Model: Template Builder

**Feature**: 001-template-builder
**Date**: 2026-01-19

## Overview

This feature uses file-based data structures rather than database entities. The "data model" describes the file formats and their validation rules.

## File Formats

### 1. Template File (`.tmplr`)

**Entity**: Template File
**Location**: `dist/template.tmplr`
**Format**: txtar-inspired plain text

```
{### FILE <relative-path> ###}
<file-content>

{### FILE <relative-path-2> ###}
<file-content-2>

{### DIR <relative-path> ###}
```

**Fields**:

| Field          | Type   | Required    | Description                                                      |
| -------------- | ------ | ----------- | ---------------------------------------------------------------- | ------------------------ |
| Section Header | String | Yes         | `{### FILE                                                       | DIR <path> ###}` pattern |
| Path           | String | Yes         | Relative path from template root (may contain `{{ variables }}`) |
| Content        | String | Conditional | Required for FILE, forbidden for DIR                             |

**Validation Rules**:

- V1: Section headers must match regex `^\{### (FILE|DIR) .+ ###\}$`
- V2: Paths must not be absolute (no leading `/`)
- V3: Paths must not contain `..` (no directory traversal)
- V4: FILE sections must have non-empty content (at least one character after header)
- V5: DIR sections must have no content between header and next section

**State Transitions**: N/A (static file)

---

### 2. Variable Placeholder

**Entity**: Variable
**Location**: Within template content and paths
**Format**: `{{ variable_name }}`

**Fields**:

| Field | Type   | Required | Description                                     |
| ----- | ------ | -------- | ----------------------------------------------- |
| Name  | String | Yes      | Variable identifier (alphanumeric + underscore) |

**Validation Rules**:

- V1: Variable names must match regex `[a-zA-Z_][a-zA-Z0-9_]*`
- V2: Only `app_name` is a supported variable for this feature

**Supported Variables**:

| Variable   | Description              | Used In                                                                           |
| ---------- | ------------------------ | --------------------------------------------------------------------------------- |
| `app_name` | Project/application name | `wrangler.toml` (name field), `package.json` (name field), potentially file paths |

---

### 3. Checksum Record

**Entity**: Checksum
**Location**: Embedded in `scripts/install-tmplr.sh`
**Format**: Bash associative array or case statement

```bash
declare -A CHECKSUMS=(
  ["tmplr-aarch64-apple-darwin"]="<sha256-hash>"
  ["tmplr-aarch64-unknown-linux-gnu"]="<sha256-hash>"
  ["tmplr-x86_64-apple-darwin"]="<sha256-hash>"
  ["tmplr-x86_64-unknown-linux-gnu"]="<sha256-hash>"
)
```

**Fields**:

| Field       | Type                  | Required | Description                       |
| ----------- | --------------------- | -------- | --------------------------------- |
| Binary Name | String                | Yes      | Platform-specific binary filename |
| SHA256 Hash | String (64 hex chars) | Yes      | SHA256 checksum of binary         |

**Validation Rules**:

- V1: Hash must be exactly 64 hexadecimal characters
- V2: Binary name must match known platform pattern
- V3: Downloaded file hash must match stored hash exactly

---

### 4. Exclusion Rule

**Entity**: Exclusion
**Location**: Hardcoded in `scripts/build-template.sh`
**Format**: List of directory paths

**Hardcoded Exclusions** (from requirements):

| Path        | Requirement |
| ----------- | ----------- |
| `.git/`     | FR-004      |
| `.beads/`   | FR-005      |
| `specs/`    | FR-006      |
| `thoughts/` | FR-007      |

**Dynamic Exclusions**:

- All patterns from `.gitignore` (FR-003) - handled implicitly by using `git ls-files`

**Validation Rules**:

- V1: Excluded paths must not appear in final template
- V2: Excluded patterns must be applied recursively

---

### 5. Build Progress Summary

**Entity**: Build Summary
**Location**: stdout during build execution
**Format**: Plain text output

**Fields**:

| Field            | Type    | Required | Description                         |
| ---------------- | ------- | -------- | ----------------------------------- |
| Files Processed  | Integer | Yes      | Count of files included in template |
| Exclusions Count | Integer | Yes      | Count of files/directories excluded |
| Output Path      | String  | Yes      | Absolute path to generated template |

**Example Output**:

```
Building template...
Processed: 127 files
Excluded: 4 directories, 23 files (gitignore)
Output: /path/to/project/dist/template.tmplr
```

---

## Relationships

```
Template File (1) ──contains──> (*) File Sections
File Section (1) ──may contain──> (*) Variables
Build Script (1) ──uses──> (*) Exclusion Rules
Install Script (1) ──verifies with──> (1) Checksum Record
```

## Entity Lifecycle

### Template File Lifecycle

1. **Created**: When `just build-template` runs successfully
2. **Overwritten**: On subsequent builds (no versioning)
3. **Consumed**: When user runs `tmplr make` on the template

### tmplr Binary Lifecycle

1. **Downloaded**: When install script runs and binary missing
2. **Verified**: SHA256 checksum compared before marking executable
3. **Installed**: Binary placed in `~/.local/bin/tmplr`
4. **Used**: When `tmplr make` is invoked to instantiate template
