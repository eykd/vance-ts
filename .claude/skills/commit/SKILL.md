---
name: commit
description: Create conventional commits for TypeScript project changes with pre-commit validation
allowed-tools: [Bash, Read]
---

# Commit Changes

Create git commits for changes made during this session, following conventional commit format.

## Process

### 1. Review Changes

```bash
# Check current status
git status

# Review what changed (if needed)
git diff
```

### 2. Plan Commit(s)

Think about:

- What was accomplished in this session
- Whether changes should be one commit or multiple logical commits
- Which files belong together
- Clear, descriptive commit messages using conventional commit format

**Commit message format:**

```
<type>: <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### 3. Execute Commit(s)

**For multi-line commit messages, use a single `-m` flag with embedded newlines:**

```bash
# Stage specific files (never use -A or .)
git add file1.ts file2.ts dir/

# Commit with proper conventional format: title, blank line, body
git commit -m "feat: add new feature

- Implement core functionality
- Add comprehensive test coverage
- Update documentation"

# Show result
git log --oneline -n 3
```

This creates the proper format with a blank line between title and body, avoiding the extra blank lines that multiple `-m` flags would create.

### 4. Pre-commit Hooks

**This project has automatic pre-commit validation:**

- Prettier formatting (auto-fixes)
- ESLint linting with `--max-warnings 0`
- TypeScript type checking (`tsc --noEmit`)
- Jest tests for changed files (`--findRelatedTests`)

**Important:**

- Hooks run automatically during commit
- They will auto-fix formatting issues
- Commit will abort if linting/type-checking/tests fail
- Fix issues and retry the commit

## Important Rules

**NEVER add co-author information or Claude attribution:**

- ❌ No "Generated with Claude Code" messages
- ❌ No "Co-Authored-By: Claude" lines
- ✅ Commits should be authored solely by the user
- ✅ Write commit messages as if the user wrote them

**Stage files explicitly:**

- ❌ Never use `git add -A` or `git add .`
- ✅ Always specify files: `git add file1.ts src/utils/`

**Commit message quality:**

- Use imperative mood ("add feature" not "added feature")
- Subject line: max 100 characters
- Body: explain WHY, not just WHAT
- Reference issues if applicable

## Example

```bash
# Review
git status

# Stage specific files
git add src/utils/validator.ts src/utils/validator.spec.ts

# Commit with multi-line message using single -m flag with embedded newlines
git commit -m "feat: add email validator utility

Implement email validation with comprehensive regex pattern.
Includes full test coverage with edge cases."

# Show result
git log --oneline -n 2
```

## TypeScript Project Specifics

**Common commit scenarios:**

1. **New feature with tests:**

   ```
   feat: add [feature name]

   - Implement [component/function]
   - Add comprehensive test coverage
   - Update types/interfaces as needed
   ```

2. **Bug fix:**

   ```
   fix: resolve [issue description]

   - Fix [specific problem]
   - Add regression test
   ```

3. **Configuration changes:**

   ```
   chore: update [tool] configuration

   - Adjust [setting] for [reason]
   - Impact: [description]
   ```

4. **Dependency updates:**

   ```
   chore: update dependencies

   - Update [package] to v[version]
   - Reason: [security/feature/bugfix]
   ```

## Troubleshooting

**Pre-commit hook failures:**

1. **Linting errors:**

   ```bash
   # Fix automatically
   npm run lint:fix

   # Or manually fix and retry commit
   ```

2. **Type errors:**

   ```bash
   # Check types
   npm run type-check

   # Fix errors and retry commit
   ```

3. **Test failures:**

   ```bash
   # Run tests
   npm test

   # Fix failing tests and retry commit
   ```

**Commit message validation failures:**

- Ensure commit message follows conventional commit format
- Check that type is valid (feat, fix, docs, etc.)
- Subject line should be lowercase
- No period at end of subject line

## Remember

- You have full context of what was done in this session
- Group related changes together
- Keep commits focused and atomic when possible
- Pre-commit hooks will validate everything automatically
- The user trusts your judgment - they asked you to commit
