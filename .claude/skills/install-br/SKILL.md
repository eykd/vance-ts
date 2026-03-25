---
name: install-br
description: Install or update the beads_rust (`br`) CLI via the official installer script. Use when `br` is not found or needs updating.
user_invocable: true
---

# Install beads_rust (`br`) CLI

## Steps

1. Check if `br` is already installed by running `which br`.
2. If already installed, run `br --version` to report the current version and stop — no further action needed.
3. If not installed, run the official installer:
   ```bash
   curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/beads_rust/main/install.sh?$(date +%s)" | bash
   ```
4. After installation, verify by running `br --version`.
5. If `br` is still not found, check whether `~/.local/bin` is on PATH. If not, advise the user to add it:
   ```
   export PATH="$HOME/.local/bin:$PATH"
   ```
   Then retry `br --version` with the updated PATH.
6. Report the installed version to the user.
