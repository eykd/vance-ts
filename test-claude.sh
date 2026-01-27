#!/usr/bin/env bash
# test-claude.sh - Diagnostic script for review.sh Claude invocation issues
#
# Tests the claude command in various configurations to identify what's
# causing exit code 130 (SIGINT) errors.

set -euo pipefail

echo "=== Claude Code Diagnostic Test ==="
echo ""

# Test 1: Check if claude command exists
echo "[Test 1] Checking claude command..."
if command -v claude &>/dev/null; then
    echo "✓ claude command found at: $(which claude)"
    echo "  Version: $(claude --version 2>&1 | head -n1)"
else
    echo "✗ claude command not found"
    exit 1
fi
echo ""

# Test 2: Simple interactive test
echo "[Test 2] Testing basic claude -p invocation..."
if echo "Say 'test passed'" | timeout 10 claude -p 2>&1 >/dev/null; then
    echo "✓ Basic invocation works"
else
    exit_code=$?
    echo "✗ Basic invocation failed with exit code: $exit_code"
    if [[ $exit_code -eq 130 ]]; then
        echo "  This is SIGINT - likely authentication or permission issue"
    fi
fi
echo ""

# Test 3: Test with file content
echo "[Test 3] Testing with file content (simulating review)..."
test_file=$(mktemp)
cat > "$test_file" <<'EOF'
export function hello(): string {
    return "world";
}
EOF

test_prompt="Review this TypeScript code and respond with 'looks good':
\`\`\`typescript
$(cat "$test_file")
\`\`\`"

if timeout 30 claude -p "$test_prompt" 2>&1 >/dev/null; then
    echo "✓ File content review works"
else
    exit_code=$?
    echo "✗ File content review failed with exit code: $exit_code"
fi
rm -f "$test_file"
echo ""

# Test 4: Test with --no-session-persistence flag
echo "[Test 4] Testing with --no-session-persistence..."
if timeout 10 claude --no-session-persistence -p "Say 'test passed'" 2>&1 >/dev/null; then
    echo "✓ No-session-persistence mode works"
    echo "  Recommendation: Use --claude-flags '--no-session-persistence' with review.sh"
else
    exit_code=$?
    echo "✗ No-session-persistence mode failed with exit code: $exit_code"
fi
echo ""

# Test 5: Test with haiku model (faster/cheaper)
echo "[Test 5] Testing with haiku model..."
if timeout 10 claude --model haiku -p "Say 'test passed'" 2>&1 >/dev/null; then
    echo "✓ Haiku model works"
    echo "  Recommendation: Use --claude-flags '--model haiku' for faster reviews"
else
    exit_code=$?
    echo "✗ Haiku model failed with exit code: $exit_code"
fi
echo ""

# Test 6: Check authentication
echo "[Test 6] Checking Claude authentication..."
if timeout 5 claude -p "hello" 2>&1 | grep -qi "authentication\|login\|token"; then
    echo "✗ Authentication issue detected"
    echo "  Try running: claude setup-token"
else
    echo "✓ Authentication appears OK"
fi
echo ""

echo "=== Diagnostic Complete ==="
echo ""
echo "If tests passed, try running review.sh with:"
echo "  ./review.sh --claude-flags '--no-session-persistence --model haiku'"
echo ""
echo "If test 2 failed with exit code 130, check:"
echo "  1. Run 'claude setup-token' to authenticate"
echo "  2. Check if you're in a restricted sandbox environment"
echo "  3. Verify workspace permissions"
