# Review.sh Exit Code 130 Fixes

## Problem Summary

The `review.sh` script was failing with exit code 130 (SIGINT) when trying to invoke `claude -p` in a downstream repository. Exit code 130 typically indicates:

1. **Authentication failure** - Claude CLI not authenticated
2. **Workspace restrictions** - Sandbox or security policies blocking execution
3. **Session/state issues** - Claude trying to create session files in restricted locations
4. **System signal** - Actual SIGINT from system or user

## Fixes Applied

### 1. Enhanced Error Diagnostics

Added detailed error logging to help identify the root cause:

- Captures and logs stderr from claude command
- Shows prompt size for debugging large inputs
- Differentiates between timeout (124) and interrupt (130)
- Logs command availability checks

### 2. Prevent Retry on SIGINT

Added logic to not retry on exit code 130, since:

- Authentication failures won't fix themselves
- Workspace restrictions are permanent
- Retrying wastes time and creates confusing logs

### 3. Added `--claude-flags` Option

New option to pass additional flags to the `claude` command:

```bash
./review.sh --claude-flags "--model haiku --no-session-persistence"
```

Common useful flags:

- `--no-session-persistence` - Don't save sessions (helps in restricted environments)
- `--model haiku` - Use faster/cheaper model for reviews
- `--dangerously-skip-permissions` - Bypass permission checks (sandboxes only)

## Diagnostic Steps

### Step 1: Run Diagnostic Script

Copy `test-claude.sh` to your downstream repository and run it:

```bash
# In your downstream repository
cp /path/to/turtlebased-ts/test-claude.sh .
chmod +x test-claude.sh
./test-claude.sh
```

This will test:

1. Claude command availability
2. Basic invocation
3. File content handling
4. Session persistence mode
5. Different models
6. Authentication status

### Step 2: Interpret Results

**If Test 2 fails with exit code 130:**

- Authentication issue: Run `claude setup-token`
- Workspace restrictions: Use `--no-session-persistence` flag
- Sandbox restrictions: Check security policies

**If Test 3 fails but Test 2 passes:**

- Prompt might be too large
- File content has problematic characters
- Try with smaller files first

**If Test 4 passes but Test 2 fails:**

- Session persistence is the issue
- Use `--claude-flags '--no-session-persistence'`

**If Test 5 passes:**

- Consider using haiku model for reviews
- Faster and cheaper than sonnet

### Step 3: Apply Fix

Based on diagnostic results, run review.sh with appropriate flags:

```bash
# If session persistence is the issue
./review.sh --claude-flags '--no-session-persistence'

# If you want faster reviews with haiku
./review.sh --claude-flags '--model haiku --no-session-persistence'

# If in a trusted sandbox with restrictions
./review.sh --claude-flags '--dangerously-skip-permissions --no-session-persistence'
```

## Additional Troubleshooting

### Authentication Issues

```bash
# Check current authentication
claude --version

# Set up authentication token
claude setup-token

# Test authentication
echo "hello" | claude -p
```

### Large Repository Issues

If you have 89 files × 3 skills = 267 reviews:

1. **Start with fewer files:**

   ```bash
   ./review.sh --files src/critical/file1.ts src/critical/file2.ts
   ```

2. **Use only one skill:**

   ```bash
   ./review.sh --skills security-review
   ```

3. **Reduce concurrency** by editing the script:
   ```bash
   # Change line 29 from:
   readonly MAX_CONCURRENT=3
   # To:
   readonly MAX_CONCURRENT=1
   ```

### Check System Resources

```bash
# Check available memory
free -h

# Check CPU load
uptime

# Check if other claude processes are running
ps aux | grep claude
```

### Sandbox Restrictions

If running in a Sprite environment with network restrictions:

```bash
# Try running review.sh with full bypass (ONLY in trusted sandboxes)
./review.sh --claude-flags '--dangerously-skip-permissions'
```

## Understanding the Errors

### Exit Code 130 (SIGINT)

This means the process received a SIGINT signal. Possible causes:

1. **Claude CLI detected unauthenticated state** and exited
2. **Workspace permissions blocked execution**
3. **Session file creation failed** (restricted directory)
4. **User pressed Ctrl+C** (actual interrupt)
5. **System signal** from process manager

### Logs to Check

1. **review.sh log:**

   ```bash
   tail -f .review.log
   ```

2. **Claude debug output:**
   ```bash
   # Run with debug mode
   claude --debug -p "test" 2>&1 | tee claude-debug.log
   ```

## Alternative Approaches

If `claude -p` continues to fail, consider alternative architectures:

### Option 1: Create Beads Tasks Instead

Modify review.sh to create beads tasks instead of invoking Claude:

```bash
# Instead of running reviews, create tasks
for file in "${files[@]}"; do
    for skill in "${SKILLS[@]}"; do
        npx bd create "Review $file with /$skill" \
            --description "$(cat "$file")" \
            --parent "$EPIC_ID"
    done
done

# Then manually work through tasks
npx bd ready --parent $EPIC_ID
```

### Option 2: Use Claude API Directly

If you have API access, write a script using the Anthropic SDK instead of Claude CLI.

### Option 3: Interactive Mode

Instead of batch processing, use Claude Code interactively:

```bash
# Generate review commands
./review.sh --dry-run > review-commands.txt

# Then paste commands into Claude Code interactive session
```

## Testing the Fix

Test the updated review.sh in turtlebased-ts first:

```bash
cd /home/sprite/turtlebased-ts
./test-claude.sh
./review.sh --dry-run --files src/index.ts
./review.sh --claude-flags '--model haiku --no-session-persistence' --files src/index.ts --skills quality-review
```

Once working, copy to downstream repository and test there.

## Questions?

If issues persist, gather this diagnostic information:

```bash
# Save all diagnostic output
{
    echo "=== System Info ==="
    uname -a
    echo ""
    echo "=== Claude Info ==="
    claude --version
    which claude
    echo ""
    echo "=== Test Results ==="
    ./test-claude.sh
    echo ""
    echo "=== Sample File Review ==="
    echo "console.log('test')" | claude -p "Review this code" 2>&1
} > diagnostic-report.txt

cat diagnostic-report.txt
```

Share the diagnostic report for further troubleshooting.
