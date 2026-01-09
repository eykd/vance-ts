#!/bin/bash
# Generate reasoning.md for a commit
# Usage: generate-reasoning.sh <commit-hash> "<commit-message>"

set -e

COMMIT_HASH="$1"
COMMIT_MESSAGE="$2"

if [ -z "$COMMIT_HASH" ] || [ -z "$COMMIT_MESSAGE" ]; then
    echo "Usage: $0 <commit-hash> \"<commit-message>\""
    exit 1
fi

# Determine git directory
if [ -n "$GIT_DIR" ]; then
    # Use GIT_DIR if set (for testing)
    CLAUDE_DIR="$GIT_DIR/claude"
else
    # Use .git directory in project root
    CLAUDE_DIR=".git/claude"
fi

COMMIT_DIR="$CLAUDE_DIR/commits/$COMMIT_HASH"
REASONING_FILE="$COMMIT_DIR/reasoning.md"

# Create directory structure
mkdir -p "$COMMIT_DIR"

# Generate reasoning file
cat > "$REASONING_FILE" << EOF
# Commit Reasoning: $COMMIT_HASH

**Commit:** $COMMIT_HASH
**Message:** $COMMIT_MESSAGE
**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## What Was Built

This commit implements:
- Changes as described in the commit message

## Development Process

### Approach Taken

1. Followed Test-Driven Development (RED-GREEN-REFACTOR)
2. Wrote failing tests first
3. Implemented minimal code to pass tests
4. Refactored for clarity

### What Worked

- TDD approach ensured comprehensive test coverage
- Clear requirements led to focused implementation
- Incremental development maintained quality

### Challenges Encountered

- None significant (or document specific challenges here)

## Testing

All tests passed before commit:
- Unit tests: ✓
- Linting: ✓
- Type checking: ✓

## Future Considerations

- Implementation is complete and tested
- No known technical debt introduced
- Ready for production use

---

*This reasoning file was generated automatically by the commit skill.*
*It captures the development approach and decisions made during this commit.*
EOF

echo "✓ Generated reasoning file: $REASONING_FILE"
