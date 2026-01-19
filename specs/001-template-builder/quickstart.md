# Quickstart: Template Builder

**Feature**: 001-template-builder
**Date**: 2026-01-19

## Overview

This guide covers building the turtlebased-ts template and using it to scaffold new projects.

---

## Building the Template

### Prerequisites

- Git installed and repository cloned
- Bash 4.0+ (for associative arrays)

### Build Command

From repository root:

```bash
just build-template
```

### Expected Output

```
Building template...
Processed: 127 files
Excluded: 4 directories, 23 files (gitignore)
Output: /home/user/turtlebased-ts/dist/template.tmplr
```

### Verify Build

Check the template was created:

```bash
ls -la dist/template.tmplr
head -50 dist/template.tmplr  # View first 50 lines
```

You should see section headers like:

```
{### FILE package.json ###}
{
  "name": "{{ app_name }}",
  ...
}

{### FILE wrangler.toml ###}
name = "{{ app_name }}"
...
```

---

## Installing tmplr

### Automatic Installation

```bash
just install-tmplr
```

### Expected Output

```
Detecting platform... Linux x86_64
Downloading tmplr v0.0.9 (tmplr-x86_64-unknown-linux-gnu)...
Verifying checksum... OK
Installing to ~/.local/bin/tmplr
tmplr installed successfully.
```

### Verify Installation

```bash
~/.local/bin/tmplr --version
# Or if ~/.local/bin is in PATH:
tmplr --version
```

### Add to PATH (if needed)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

---

## Creating a New Project from Template

### Basic Usage

```bash
tmplr make dist/template.tmplr my-new-project app_name=my-new-project
```

This creates `my-new-project/` directory with all template files, substituting `{{ app_name }}` with `my-new-project`.

### Verify New Project

```bash
cd my-new-project

# Check package.json has correct name
grep '"name"' package.json
# Should show: "name": "my-new-project"

# Check wrangler.toml has correct name
grep '^name' wrangler.toml
# Should show: name = "my-new-project"

# Install dependencies and verify project works
npm install
npm run check
```

---

## Manual Testing Checklist

Since this is Bash tooling (not TypeScript), use this manual testing checklist:

### Build Script Tests

- [ ] **T1**: `just build-template` creates `dist/template.tmplr`
- [ ] **T2**: Running build twice overwrites the file (no errors)
- [ ] **T3**: Template excludes `.git/` directory (grep for `.git` in output)
- [ ] **T4**: Template excludes `.beads/` directory
- [ ] **T5**: Template excludes `specs/` directory
- [ ] **T6**: Template excludes `thoughts/` directory
- [ ] **T7**: Template excludes `node_modules/` (from .gitignore)
- [ ] **T8**: Template includes `wrangler.toml` with `{{ app_name }}`
- [ ] **T9**: Template's `package.json` has `"name": "{{ app_name }}"`
- [ ] **T10**: Build output shows file count, exclusion count, and output path

### Install Script Tests

- [ ] **T11**: `just install-tmplr` downloads correct binary for platform
- [ ] **T12**: Running install twice says "already installed"
- [ ] **T13**: Binary is executable after install
- [ ] **T14**: Checksum verification works (manually corrupt a binary to test failure)

### End-to-End Tests

- [ ] **T15**: Create project from template with `tmplr make`
- [ ] **T16**: New project's `package.json` has correct app_name
- [ ] **T17**: New project's `wrangler.toml` has correct app_name
- [ ] **T18**: New project passes `npm install && npm run check`

---

## Troubleshooting

### "git command not found"

Install git:

```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git
```

### "Unsupported architecture"

The template builder only supports:

- x86_64 (Intel/AMD 64-bit)
- arm64/aarch64 (Apple Silicon, ARM 64-bit)

32-bit systems are not supported.

### "Checksum verification failed"

This indicates the downloaded binary may be corrupted or tampered with. Try:

1. Delete the downloaded file
2. Run install script again
3. If it persists, check network connection or firewall

### "Cannot create ~/.local/bin"

Ensure you have write permissions in your home directory:

```bash
mkdir -p ~/.local/bin
chmod 755 ~/.local/bin
```

### Template variables not substituted

Ensure you're using the correct variable syntax:

```bash
# Correct - key=value format
tmplr make template.tmplr myproject app_name=my-app

# Wrong - don't use quotes around value
tmplr make template.tmplr myproject app_name="my-app"
```

---

## Next Steps

After creating a project from the template:

1. Initialize git: `git init && git add . && git commit -m "Initial commit from template"`
2. Configure Cloudflare: Uncomment bindings in `wrangler.toml` as needed
3. Deploy: `npx wrangler pages deploy hugo/public`
