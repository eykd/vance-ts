# Beads - AI-Native Issue Tracking

Welcome to Beads! This repository uses **beads_rust** (`br`) for issue tracking - a modern, AI-native tool designed to live directly in your codebase alongside your code.

## What is Beads?

Beads is issue tracking that lives in your repo, making it perfect for AI coding agents and developers who want their issues close to their code. No web UI required - everything works through the CLI and integrates seamlessly with git.

**Learn more:** [github.com/Dicklesworthstone/beads_rust](https://github.com/Dicklesworthstone/beads_rust)

## Quick Start

### Essential Commands

```bash
# Create new issues
br create "Add user authentication"

# View all issues
br list

# View issue details
br show <issue-id>

# Update issue status
br update <issue-id> --status in_progress
br update <issue-id> --status done

# Sync database with JSONL (export for git)
br sync --flush-only
```

### Working with Issues

Issues in Beads are:

- **Git-native**: Stored in `.beads/issues.jsonl` and synced like code
- **AI-friendly**: CLI-first design works perfectly with AI coding agents
- **Branch-aware**: Issues can follow your branch workflow
- **SQLite-backed**: Fast local queries with JSONL export for git collaboration

## Why Beads?

**AI-Native Design**

- Built specifically for AI-assisted development workflows
- CLI-first interface works seamlessly with AI coding agents
- No context switching to web UIs

**Developer Focused**

- Issues live in your repo, right next to your code
- Works offline, syncs when you push
- Fast, lightweight, and stays out of your way

**Git Integration**

- JSONL export for git-friendly diffs
- Branch-aware issue tracking
- Intelligent JSONL merge resolution

## Get Started with Beads

Try Beads in your own projects:

```bash
# Install beads_rust
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/beads_rust/main/install.sh" | bash

# Initialize in your repo
br init

# Create your first issue
br create "Try out Beads"
```

## Learn More

- **Documentation**: [github.com/Dicklesworthstone/beads_rust](https://github.com/Dicklesworthstone/beads_rust)
- **Diagnostics**: Run `br doctor`
- **Statistics**: Run `br stats`

---

_Beads: Issue tracking that moves at the speed of thought_
