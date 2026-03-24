# Quickstart: Guard Hook Hardening

## Run Tests

```bash
# Run all hook tests
npx vitest run .claude/hooks/guard-rules.spec.ts

# Watch mode for TDD
npx vitest .claude/hooks/guard-rules.spec.ts
```

## Manual Smoke Test

```bash
# Test a blocked command (expect exit 2)
echo '{"tool_input":{"command":"git reset --hard HEAD~3"}}' | \
  npx tsx .claude/hooks/pre-tool-use-bash.ts
echo $?  # expect 2

# Test an allowed command (expect exit 0)
echo '{"tool_input":{"command":"git commit -m \"fix: something\""}}' | \
  npx tsx .claude/hooks/pre-tool-use-bash.ts
echo $?  # expect 0
```

## File Map

| File                                 | Purpose                                      |
| ------------------------------------ | -------------------------------------------- |
| `.claude/hooks/guard-rules.ts`       | Pure module: all rules + `evaluateCommand()` |
| `.claude/hooks/guard-rules.spec.ts`  | Vitest tests (~50 cases)                     |
| `.claude/hooks/pre-tool-use-bash.ts` | Entry point (stdin → evaluate → exit)        |

## Adding a New Rule

1. Write a failing test in `guard-rules.spec.ts`
2. Add a `GuardRule` to the appropriate array in `guard-rules.ts`:
   - `PRE_STRIP_RULES` — checked against raw normalized command
   - `POST_STRIP_RULES` — checked against quote-stripped command
   - `PLATFORM_RULES` — checked against raw normalized command
3. Run tests until green
