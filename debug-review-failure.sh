#!/usr/bin/env bash
# debug-review-failure.sh - Debug specific review.sh failures
#
# Run this in the repository where review.sh is failing with exit code 130

set -euo pipefail

echo "=== Review.sh Failure Debugger ==="
echo ""

# Find the problematic file mentioned in the error
TARGET_FILE="${1:-functions/api/checkout/create-session.ts}"

if [[ ! -f "$TARGET_FILE" ]]; then
    echo "Error: File not found: $TARGET_FILE"
    echo "Usage: $0 [path/to/problematic/file.ts]"
    exit 1
fi

echo "[Test 1] File information"
echo "  Path: $TARGET_FILE"
echo "  Size: $(stat -f%z "$TARGET_FILE" 2>/dev/null || stat -c%s "$TARGET_FILE" 2>/dev/null) bytes"
echo "  Lines: $(wc -l < "$TARGET_FILE")"
echo "  Readable: $(test -r "$TARGET_FILE" && echo "yes" || echo "no")"
echo ""

# Check file encoding
echo "[Test 2] File encoding"
if command -v file &>/dev/null; then
    file "$TARGET_FILE"
else
    echo "  (file command not available)"
fi
echo ""

# Check for non-UTF8 characters
echo "[Test 3] Character encoding issues"
if iconv -f UTF-8 -t UTF-8 "$TARGET_FILE" >/dev/null 2>&1; then
    echo "  ✓ Valid UTF-8"
else
    echo "  ✗ Invalid UTF-8 detected"
fi
echo ""

# Test Claude with this specific file
echo "[Test 4] Testing Claude with this file content..."
PROMPT="Review this TypeScript file for issues:

\`\`\`typescript
$(cat "$TARGET_FILE")
\`\`\`

Respond with just 'review complete' if you can read the file."

echo "  Prompt size: ${#PROMPT} characters"

# Test 4a: Basic invocation
echo "  [4a] Testing basic invocation..."
if timeout 60 claude -p "$PROMPT" >/dev/null 2>&1; then
    echo "  ✓ Basic invocation works"
else
    exit_code=$?
    echo "  ✗ Failed with exit code: $exit_code"
    if [[ $exit_code -eq 130 ]]; then
        echo "      This is SIGINT - likely the root cause"
    fi
fi

# Test 4b: With --no-session-persistence
echo "  [4b] Testing with --no-session-persistence..."
if timeout 60 claude --no-session-persistence -p "$PROMPT" >/dev/null 2>&1; then
    echo "  ✓ No-session-persistence works"
else
    exit_code=$?
    echo "  ✗ Failed with exit code: $exit_code"
fi

# Test 4c: With haiku model
echo "  [4c] Testing with haiku model..."
if timeout 60 claude --model haiku -p "$PROMPT" >/dev/null 2>&1; then
    echo "  ✓ Haiku model works"
else
    exit_code=$?
    echo "  ✗ Failed with exit code: $exit_code"
fi

# Test 4d: With both flags
echo "  [4d] Testing with haiku + no-session-persistence..."
if timeout 60 claude --model haiku --no-session-persistence -p "$PROMPT" >/dev/null 2>&1; then
    echo "  ✓ Combined flags work"
else
    exit_code=$?
    echo "  ✗ Failed with exit code: $exit_code"
fi

echo ""

# Check if there are too many large files
echo "[Test 5] Repository file statistics"
if [[ -d functions ]]; then
    echo "  TypeScript files in functions/:"
    find functions -name "*.ts" ! -name "*.spec.ts" ! -name "*.test.ts" -type f 2>/dev/null | wc -l

    echo "  Large files (>10KB) in functions/:"
    find functions -name "*.ts" ! -name "*.spec.ts" ! -name "*.test.ts" -type f -size +10k 2>/dev/null | wc -l

    echo "  Largest files:"
    find functions -name "*.ts" ! -name "*.spec.ts" ! -name "*.test.ts" -type f -exec du -h {} + 2>/dev/null | sort -rh | head -5
fi
echo ""

# Check for authentication issues
echo "[Test 6] Claude authentication check"
if timeout 10 claude -p "hello" 2>&1 | grep -qi "authentication\|login\|unauthorized\|token"; then
    echo "  ✗ Authentication issue detected"
    echo "    Try: claude setup-token"
else
    echo "  ✓ Authentication appears OK"
fi
echo ""

# Check system resources
echo "[Test 7] System resources"
echo "  Memory available:"
free -h 2>/dev/null || vm_stat 2>/dev/null || echo "  (not available)"
echo ""
echo "  Running claude processes:"
ps aux | grep -c "[c]laude" || echo "  0"
echo ""

echo "=== Recommendations ==="
echo ""

# Analyze results and provide recommendations
if timeout 60 claude --model haiku --no-session-persistence -p "hello" >/dev/null 2>&1; then
    echo "✓ Claude works with recommended flags"
    echo ""
    echo "Run review.sh with:"
    echo "  ./review.sh --claude-flags '--model haiku --no-session-persistence'"
    echo ""
    echo "If still failing, try reviewing in smaller batches:"
    echo "  ./review.sh --claude-flags '--model haiku --no-session-persistence' \\"
    echo "    --files $TARGET_FILE"
else
    echo "✗ Claude fails even with recommended flags"
    echo ""
    echo "Possible issues:"
    echo "  1. File content has problematic characters"
    echo "  2. Prompt is too large (current: ${#PROMPT} chars)"
    echo "  3. Authentication/permission issue"
    echo "  4. System resource exhaustion"
    echo ""
    echo "Try:"
    echo "  1. Run: claude setup-token"
    echo "  2. Check: tail -100 .review.log"
    echo "  3. Reduce concurrency in review.sh (change MAX_CONCURRENT=1)"
fi
