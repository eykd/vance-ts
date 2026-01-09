#!/bin/bash
# Test script for generate-reasoning.sh

set -e

# Setup test environment
TEST_DIR=$(mktemp -d)
export GIT_DIR="$TEST_DIR/.git"
mkdir -p "$GIT_DIR"

# Test 1: Script creates directory structure
echo "Test 1: Creates directory structure..."
bash .claude/scripts/generate-reasoning.sh "abc123" "test commit message" >/dev/null 2>&1 || true
if [ ! -d "$GIT_DIR/claude/commits/abc123" ]; then
    echo "FAIL: Directory not created"
    exit 1
fi
echo "PASS"

# Test 2: Script creates reasoning.md file
echo "Test 2: Creates reasoning.md file..."
if [ ! -f "$GIT_DIR/claude/commits/abc123/reasoning.md" ]; then
    echo "FAIL: reasoning.md not created"
    exit 1
fi
echo "PASS"

# Test 3: Reasoning file contains commit hash
echo "Test 3: Reasoning file contains commit hash..."
if ! grep -q "abc123" "$GIT_DIR/claude/commits/abc123/reasoning.md"; then
    echo "FAIL: Commit hash not in reasoning file"
    exit 1
fi
echo "PASS"

# Test 4: Reasoning file contains commit message
echo "Test 4: Reasoning file contains commit message..."
if ! grep -q "test commit message" "$GIT_DIR/claude/commits/abc123/reasoning.md"; then
    echo "FAIL: Commit message not in reasoning file"
    exit 1
fi
echo "PASS"

# Cleanup
rm -rf "$TEST_DIR"

echo ""
echo "All tests passed!"
