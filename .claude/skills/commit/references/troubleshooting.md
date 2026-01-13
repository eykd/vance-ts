# Commit Troubleshooting

## Pre-commit Hook Failures

### Linting Errors

```bash
# Fix automatically
npm run lint:fix

# Or manually fix and retry commit
```

### Type Errors

```bash
# Check types
npm run type-check

# Fix errors and retry commit
```

### Test Failures

```bash
# Run tests
npm test

# Fix failing tests and retry commit
```

## Commit Message Validation Failures

- Ensure commit message follows conventional commit format
- Check that type is valid (feat, fix, docs, etc.)
- Subject line should be lowercase
- No period at end of subject line

## TypeScript Project Commit Scenarios

### New Feature with Tests

```
feat: add [feature name]

- Implement [component/function]
- Add comprehensive test coverage
- Update types/interfaces as needed
```

### Bug Fix

```
fix: resolve [issue description]

- Fix [specific problem]
- Add regression test
```

### Configuration Changes

```
chore: update [tool] configuration

- Adjust [setting] for [reason]
- Impact: [description]
```

### Dependency Updates

```
chore: update dependencies

- Update [package] to v[version]
- Reason: [security/feature/bugfix]
```
