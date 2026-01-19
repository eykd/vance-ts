# Feature Specification: Template Builder

**Feature Branch**: `001-template-builder`
**Created**: 2026-01-19
**Status**: Draft
**Beads Epic**: `workspace-9z7`
**Input**: User description: "Build process to package repository into single-file tmplr template for project scaffolding"

**Beads Phase Tasks**:

- clarify: `workspace-9z7.1`
- plan: `workspace-9z7.2`
- checklist: `workspace-9z7.3`
- tasks: `workspace-9z7.4`
- analyze: `workspace-9z7.5`
- implement: `workspace-9z7.6`
- review: `workspace-9z7.7`

## Clarifications

### Session 2026-01-19

- Q: Where should tmplr binaries be downloaded from during installation? → A: Binary release from GitHub (no Rust required, more portable)
- Q: What output/feedback should the build process provide to the user? → A: Progress with summary (files processed count, exclusions count, output path)
- Q: Should the installation script pin to a specific tmplr version or always download latest? → A: Pinned version (specify version in script, update manually)
- Q: What should the build script be implemented in? → A: Bash script (simple, no build step, portable to Unix systems)
- Q: Should the installation script verify the downloaded tmplr binary? → A: Checksum verification (SHA256, compare against published checksum)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Build Template from Repository (Priority: P1)

A developer wants to package the current repository state into a distributable template file that others can use to bootstrap new projects. They run a single command and receive a `.tmplr` file ready for distribution.

**Why this priority**: This is the core feature - without template building, nothing else works. It enables the entire scaffolding workflow.

**Independent Test**: Can be fully tested by running `just build-template` and verifying the output file exists at `dist/template.tmplr` with correct structure and variable placeholders.

**Acceptance Scenarios**:

1. **Given** a developer in the repository root, **When** they run `just build-template`, **Then** a file `dist/template.tmplr` is created containing the packaged repository.
2. **Given** the repository contains files matching `.gitignore` patterns, **When** the template is built, **Then** those files are excluded from the template.
3. **Given** the repository has `.git/`, `.beads/`, `specs/`, and `thoughts/` directories, **When** the template is built, **Then** all four directories are excluded from the template.

---

### User Story 2 - Template Includes wrangler.toml with Variable (Priority: P1)

A developer building the template needs the output to include a `wrangler.toml` file that uses `{{ app_name }}` as a placeholder, even though the source repository has no `wrangler.toml`.

**Why this priority**: The wrangler.toml with app_name variable is essential for Cloudflare deployment - without it, instantiated projects cannot be deployed.

**Independent Test**: Can be tested by building the template and inspecting the output to verify `wrangler.toml` is present with `{{ app_name }}` placeholder.

**Acceptance Scenarios**:

1. **Given** the source repository has no `wrangler.toml`, **When** the template is built, **Then** the template includes a `wrangler.toml` file with `name = "{{ app_name }}"`.
2. **Given** the template is built, **When** inspecting the `wrangler.toml` content, **Then** it contains Cloudflare Pages configuration with `pages_build_output_dir = "hugo/public"`.
3. **Given** the template is built, **When** inspecting the `wrangler.toml` content, **Then** it contains commented-out placeholders for D1, KV, and R2 bindings.

---

### User Story 3 - Instantiate Template into New Project (Priority: P2)

Claude (or a developer) receives a URL to the template file. The system automatically installs tmplr if needed, downloads the template, and instantiates it into a new repository with a specified app name.

**Why this priority**: Instantiation is the consumer-side of the feature. It's essential but depends on the template being built first (P1).

**Independent Test**: Can be tested by running the instantiation script on a clean Linux system, verifying tmplr is installed and the output directory contains all expected files with variables substituted.

**Acceptance Scenarios**:

1. **Given** tmplr is not installed on the system, **When** running the instantiation process, **Then** tmplr is automatically downloaded and installed for the current platform.
2. **Given** a template URL and app name, **When** running the instantiation command, **Then** a directory structure is created with all repository files and variables substituted.
3. **Given** a template is instantiated with `app_name=my-cool-app`, **When** inspecting the generated `wrangler.toml`, **Then** it contains `name = "my-cool-app"`.
4. **Given** a template is instantiated, **When** inspecting the generated `package.json`, **Then** the `name` field contains the provided app_name value.

---

### Edge Cases

- What happens when `dist/` directory doesn't exist? The build process creates it.
- What happens when `dist/template.tmplr` already exists? It is overwritten.
- What happens when the repository contains binary files (images, fonts)? They are included in the template as-is.
- What happens when app_name contains invalid characters (spaces, uppercase)? tmplr substitutes the value as-is; validation is the caller's responsibility.
- What happens when a file path in the repository contains `{{ app_name }}`? It is treated as a variable and substituted during instantiation.
- What happens when tmplr download fails (network error)? The installation script reports the error and exits with non-zero status.
- What happens on an unsupported platform (e.g., Windows)? The installation script reports the unsupported platform and exits with non-zero status.
- What happens when checksum verification fails? The installation script deletes the downloaded file, reports the mismatch, and exits with non-zero status.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a `just build-template` command that packages the repository into a single `.tmplr` file.
- **FR-002**: System MUST output the template to `dist/template.tmplr`.
- **FR-003**: System MUST exclude all paths matching patterns in `.gitignore` from the template.
- **FR-004**: System MUST exclude the `.git/` directory from the template.
- **FR-005**: System MUST exclude the `.beads/` directory from the template.
- **FR-006**: System MUST exclude the `specs/` directory from the template.
- **FR-007**: System MUST exclude the `thoughts/` directory from the template.
- **FR-008**: System MUST generate a `wrangler.toml` file in the template with `name = "{{ app_name }}"`.
- **FR-009**: System MUST include `pages_build_output_dir = "hugo/public"` in the generated `wrangler.toml`.
- **FR-010**: System MUST include commented-out placeholder bindings for D1, KV, and R2 in the generated `wrangler.toml`.
- **FR-011**: System MUST use the tmplr file format (txtar-inspired with `{### FILE path ###}` headers).
- **FR-012**: System MUST replace `{{ app_name }}` placeholders in `package.json` `name` field.
- **FR-013**: System MUST create the `dist/` directory if it does not exist.
- **FR-014**: System MUST provide an installation script that automatically downloads the correct tmplr binary from GitHub releases for the current platform (Apple Silicon macOS, x64 Linux, arm64 Linux).
- **FR-015**: System MUST detect the current platform and architecture to select the appropriate tmplr binary.
- **FR-016**: System MUST make the downloaded tmplr binary executable.
- **FR-017**: System MUST output progress summary including: files processed count, exclusions count, and output file path.
- **FR-018**: System MUST pin tmplr to a specific version in the installation script (not always-latest).
- **FR-019**: Build and installation scripts MUST be implemented in Bash (no TypeScript/Node.js compile step required).
- **FR-020**: Installation script MUST verify downloaded tmplr binary against SHA256 checksum before execution.

### Key Entities

- **Template File**: A single `.tmplr` file containing all repository files with section headers and variable placeholders.
- **Variable**: A placeholder in the format `{{ variable_name }}` that is substituted during instantiation. Only `app_name` is supported.
- **Exclusion Rule**: A pattern or path that determines which files/directories are omitted from the template.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Running `just build-template` produces a valid `dist/template.tmplr` file in under 30 seconds for repositories under 100MB.
- **SC-002**: A template instantiated with a given app_name produces a working project that passes `npm install && npm run check` on first run.
- **SC-003**: The built template excludes 100% of files matching exclusion rules (no leaked .git, .beads, specs, thoughts, or gitignored files).
- **SC-004**: The instantiated project can be deployed to Cloudflare Pages without manual wrangler.toml edits (beyond uncommenting optional bindings).

## Assumptions

- The tmplr binary is available for Apple Silicon macOS, x64 Linux, and arm64 Linux (verified: pre-built binaries exist for all three).
- The repository uses `package.json` with a `name` field that should be templated.
- The Hugo static site outputs to `hugo/public/` as configured.
- Binary files in the repository will be handled correctly by tmplr's file format.
- The `dist/` directory is already in `.gitignore` (verified: it is).
