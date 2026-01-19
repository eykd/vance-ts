# CLI Interface Contracts

**Feature**: 001-template-builder
**Date**: 2026-01-19

## Overview

This feature exposes functionality through Just commands and Bash scripts. No HTTP/REST/GraphQL APIs are involved.

---

## Command: `just build-template`

**Script**: `scripts/build-template.sh`
**Purpose**: Package repository into single `.tmplr` file

### Input

| Parameter | Type | Required | Default | Description                 |
| --------- | ---- | -------- | ------- | --------------------------- |
| (none)    | -    | -        | -       | Command takes no parameters |

### Behavior

1. Validate current directory is repository root (check for `package.json`)
2. Create `dist/` directory if it doesn't exist
3. Enumerate files using `git ls-files`
4. Filter out hardcoded exclusions (`.git/`, `.beads/`, `specs/`, `thoughts/`)
5. For each included file:
   - Add `{### FILE <path> ###}` section header
   - Append file contents
6. Generate `wrangler.toml` content with `{{ app_name }}` variable
7. Transform `package.json` name field to `{{ app_name }}`
8. Write complete template to `dist/template.tmplr`
9. Print summary to stdout

### Output

**On Success** (exit code 0):

```
Building template...
Processed: <N> files
Excluded: <M> directories, <P> files (gitignore)
Output: /absolute/path/to/dist/template.tmplr
```

**On Failure** (exit code 1):

```
Error: <description>
```

### Error Conditions

| Condition               | Exit Code | Message                                                    |
| ----------------------- | --------- | ---------------------------------------------------------- |
| Not in repository root  | 1         | `Error: package.json not found. Run from repository root.` |
| Git not available       | 1         | `Error: git command not found.`                            |
| Write permission denied | 1         | `Error: Cannot write to dist/ directory.`                  |

---

## Command: `just install-tmplr`

**Script**: `scripts/install-tmplr.sh`
**Purpose**: Download and install tmplr binary with checksum verification

### Input

| Parameter | Type | Required | Default | Description                 |
| --------- | ---- | -------- | ------- | --------------------------- |
| (none)    | -    | -        | -       | Command takes no parameters |

### Behavior

1. Detect platform (`uname -s`): Darwin or Linux
2. Detect architecture (`uname -m`): x86_64, arm64, or aarch64
3. Construct binary name and download URL
4. Check if binary already exists at `~/.local/bin/tmplr`
   - If exists and version matches, skip download
5. Download binary to temporary location
6. Compute SHA256 checksum of downloaded file
7. Compare against embedded checksum
   - If mismatch, delete file and exit with error
8. Move binary to `~/.local/bin/tmplr`
9. Make binary executable (`chmod +x`)
10. Print success message

### Output

**On Success** (exit code 0):

```
Detecting platform... Darwin arm64
Downloading tmplr v0.0.9 (tmplr-aarch64-apple-darwin)...
Verifying checksum... OK
Installing to ~/.local/bin/tmplr
tmplr installed successfully.
```

**Already Installed** (exit code 0):

```
tmplr v0.0.9 already installed at ~/.local/bin/tmplr
```

**On Failure** (exit code 1):

```
Error: <description>
```

### Error Conditions

| Condition                  | Exit Code | Message                                                                      |
| -------------------------- | --------- | ---------------------------------------------------------------------------- |
| Unsupported OS             | 1         | `Error: Unsupported operating system: <OS>. Supported: Darwin, Linux`        |
| Unsupported architecture   | 1         | `Error: Unsupported architecture: <arch>. Supported: x86_64, arm64, aarch64` |
| Download failed            | 1         | `Error: Failed to download tmplr binary.`                                    |
| Checksum mismatch          | 1         | `Error: Checksum verification failed. Expected: <expected>, Got: <actual>`   |
| Cannot create ~/.local/bin | 1         | `Error: Cannot create directory ~/.local/bin`                                |

---

## Command: `tmplr make` (External)

**Binary**: `~/.local/bin/tmplr`
**Purpose**: Instantiate template into new project (provided by tmplr, not implemented by us)

### Usage

```bash
tmplr make dist/template.tmplr my-project app_name=my-cool-app
```

### Input

| Parameter     | Type      | Required | Description                                   |
| ------------- | --------- | -------- | --------------------------------------------- |
| Template file | Path      | Yes      | Path to `.tmplr` file                         |
| Project name  | String    | Yes      | Output directory name                         |
| Variables     | Key=Value | Yes      | Variable substitutions (e.g., `app_name=foo`) |

### Output

Creates directory structure with all files from template, variables substituted.

---

## Environment Variables

| Variable | Used By          | Description                                    |
| -------- | ---------------- | ---------------------------------------------- |
| `HOME`   | install-tmplr.sh | User home directory for `~/.local/bin`         |
| `PATH`   | All              | Should include `~/.local/bin` for tmplr access |

---

## Dependencies

### build-template.sh

- `git` - for `git ls-files`
- `bash` - GNU bash 4.0+ (for associative arrays)
- Standard utilities: `mkdir`, `cat`, `sed`

### install-tmplr.sh

- `curl` or `wget` - for downloading binary
- `sha256sum` (Linux) or `shasum -a 256` (macOS) - for checksum verification
- `chmod` - for making binary executable
- `mkdir` - for creating directories
