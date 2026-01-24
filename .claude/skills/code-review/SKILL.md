---
name: code-review
description: Review code changes for quality, correctness, and security. Use when (1) reviewing code before committing, (2) evaluating staged changes, (3) reviewing PR or branch changes, (4) getting feedback on implementation quality, (5) identifying security issues in changes, (6) assessing test coverage and quality, or (7) preparing changes for team review.
---

# Code Review Skill

Comprehensive code review following best practices for quality, security, and maintainability.

## Review Process

1. **Determine scope**: Use git diff based on scope parameter (default: working directory)
2. **Detect current epic**: Extract epic ID from current git branch
3. **Invoke review subagents in parallel**:
   - quality-review (correctness, test quality, simplicity, code standards)
   - security-review (OWASP vulnerabilities, auth, data security)
   - clean-architecture-validator (dependency violations, layer boundaries)
4. **Collect findings**: Aggregate findings from all three reviews
5. **Create beads tasks**: For each finding, create a task under the current epic
6. **Generate output**: Structured report with actionable recommendations and copy-paste prompt

## Scope Parameter

| Scope               | Git Command               | Description            |
| ------------------- | ------------------------- | ---------------------- |
| `working` (default) | `git diff`                | Uncommitted changes    |
| `staged`            | `git diff --cached`       | Staged changes         |
| `head`              | `git diff HEAD~1`         | Last commit            |
| `branch`            | `git diff <base>..HEAD`   | Branch changes vs base |
| `refs`              | `git diff <ref1>..<ref2>` | Custom ref comparison  |

### Usage Examples

```bash
# Review uncommitted changes
/code-review

# Review staged changes
/code-review --scope staged

# Review last commit
/code-review --scope head

# Review branch changes
/code-review --scope branch --base main
```

## Review Sections

See [references/review-sections.md](references/review-sections.md) for detailed guidance on each section:

1. **What Changed**: Plain English summary of functionality
2. **Does It Work**: Correctness, testing, production-readiness
3. **Simplicity & Maintainability**: Code clarity and future maintenance
4. **Test Quality**: When test files present (see [references/test-quality.md](references/test-quality.md))
5. **Security Review**: Via `/security-review` skill invocation
6. **Recommendations**: Prioritized action items
7. **Copy-Paste Prompt**: Ready-to-use fix prompt

## Output Format

See [references/output-format.md](references/output-format.md) for the complete structured format.

### Finding Format (for automated parsing)

```markdown
### Finding: [Title]

- **Severity**: Critical|High|Medium|Low
- **Category**: security|test|quality|architecture|performance
- **File**: path/to/file.ts
- **Line**: 42
- **Description**: What's wrong
- **Risk**: What could go wrong
- **Fix**: How to fix it
```

## Large Changeset Handling

For changesets over 1000 lines:

- Provide high-level summary of all changes
- Focus detailed review on highest-risk files
- Note that full review was not possible due to size
- Recommend splitting into smaller changesets

## Epic Detection

Before creating beads tasks, detect the current epic:

1. Get current git branch: `git branch --show-current`
2. Extract feature name: Remove numeric prefix (e.g., "001-feature-name" → "feature-name")
3. Find matching epic: `npx bd list --type epic --status open --json | jq -r '.[] | select(.title | ascii_downcase | contains("feature-name")) | .id'`

If no epic is found, skip beads task creation and only generate the review report.

## Integration with Review Subagents

### Quality Review

Invoke using Task tool with `subagent_type="general-purpose"`:

```
Review the code changes for quality, correctness, and test quality using the /quality-review skill.
```

Handles:

- Correctness and production-readiness
- Test quality (Kent Beck's Test Desiderata)
- Simplicity and maintainability
- Code standards compliance

### Security Review

Invoke using Task tool with `subagent_type="general-purpose"`:

```
Review the code changes for security vulnerabilities using the /security-review skill.
```

Handles:

- SQL injection, XSS, CSRF
- Authentication/session issues
- Input validation gaps
- Secrets exposure

### Clean Architecture Validation

Invoke using Task tool with `subagent_type="general-purpose"`:

```
Review the code changes for architecture compliance using the /clean-architecture-validator skill.
```

Handles:

- Layer boundary violations
- Dependency direction violations
- Interface placement issues
- Coupling concerns

## Creating Beads Tasks from Findings

After collecting findings from all three reviews, create a beads task for each finding:

```bash
npx bd create "Fix: [Finding Title]" \
  --parent "$epic_id" \
  --type task \
  --priority "[0-3 based on severity]" \
  --description "[Finding details including file, line, problem, risk, and fix]"
```

### Severity to Priority Mapping

| Severity | Priority | Description                                              |
| -------- | -------- | -------------------------------------------------------- |
| Critical | P0       | Blocks merge - security vulnerabilities, data loss risks |
| High     | P1       | Fix before merge - significant bugs, test gaps           |
| Medium   | P2       | Should fix - code smells, improvements                   |
| Low      | P3       | Optional - style issues, documentation                   |

### Task Description Format

```markdown
**Category**: [security|test|quality|architecture|performance]
**File**: [path/to/file.ts:line]

**Problem**: [Description in plain English]

**Risk**: [Business impact - what could go wrong]

**Fix**: [Recommended solution]
```

## Detailed Workflow

### Step 1: Get Code Changes

```bash
# Based on scope parameter
git diff                    # working (default)
git diff --cached          # staged
git diff HEAD~1            # head
git diff <base>..HEAD      # branch
```

### Step 2: Detect Current Epic

```bash
# Get current branch
branch=$(git branch --show-current)

# Extract feature name (remove numeric prefix)
feature=$(echo "$branch" | sed 's/^[0-9]*-//')

# Find matching epic
epic_id=$(npx bd list --type epic --status open --json | \
  jq -r --arg name "$feature" '.[] | select(.title | ascii_downcase | contains($name | ascii_downcase)) | .id' | head -n1)
```

### Step 3: Invoke Review Subagents in Parallel

Launch all three reviews using the Task tool in a **single message with multiple tool calls**:

1. Task tool → quality-review skill
2. Task tool → security-review skill
3. Task tool → clean-architecture-validator skill

**CRITICAL**: Send all three Task tool calls in one message for parallel execution.

### Step 4: Collect Findings

Parse findings from each subagent's output:

- Extract structured findings (severity, category, file, line, description, risk, fix)
- Deduplicate findings across reviews
- Sort by severity (Critical → High → Medium → Low)

### Step 5: Create Beads Tasks

For each finding, create a beads task:

```bash
npx bd create "Fix: [Title]" \
  --parent "$epic_id" \
  --type task \
  --priority "[0-3]" \
  --description "[Structured description]"
```

**Skip beads creation if**:

- No epic found for current branch
- No findings to report
- User explicitly opts out

### Step 6: Generate Consolidated Report

Create a single report combining:

- Summary of all reviews
- What Changed section
- Findings from all three reviews organized by severity
- Beads tasks created (with IDs)
- Copy-paste prompt to fix all findings

## Edge Cases

- **No changes**: Report "No changes detected" and exit gracefully
- **Outside git repo**: Report error explaining git repository requirement
- **No epic found**: Skip beads creation, generate report only
- **Binary files**: Note but don't analyze; focus on text-based source files
- **Very large changesets**: Switch to summary mode with warning
- **Beads not initialized**: Skip beads creation, generate report only

## Review Guidelines

### Audience: Non-Technical Managers

**CRITICAL**: Write the ENTIRE review for non-technical managers, not developers.

- Technical jargon is OK when explained briefly and concisely
- Always follow technical terms with plain English explanation (e.g., "SQL injection - inserting malicious database commands")
- Explain impacts in business terms (risk, cost, user experience)
- Focus on "what" and "why", not implementation details
- Keep explanations concise - don't over-explain
- Keep all sections accessible to non-technical readers

### Prioritize Findings

1. **Critical**: Security vulnerabilities, data loss risks - block merge
2. **High**: Significant bugs, test gaps - fix before merge
3. **Medium**: Code smells, improvements - should fix
4. **Low**: Style issues, documentation - optional

### Focus on Value

- Summarize for non-technical stakeholders
- Explain the "why" not just the "what"
- Provide actionable recommendations
- Include specific file and line references

### Always Include Copy-Paste Prompt

**REQUIRED**: Every review with findings MUST end with a copy-paste prompt in a code block that the customer can paste directly into Claude Code to implement the recommended fixes.

## Complete Workflow Example

```
User: /code-review --scope staged

1. Get staged changes:
   git diff --cached

2. Detect epic:
   branch = "001-user-authentication"
   feature = "user-authentication"
   epic_id = "workspace-abc123"

3. Launch parallel reviews (single message, 3 Task calls):
   - Task(quality-review) → findings: 2 test issues, 1 code quality issue
   - Task(security-review) → findings: 1 SQL injection, 1 XSS vulnerability
   - Task(clean-architecture-validator) → findings: 1 layer violation

4. Create beads tasks:
   - workspace-abc123-t1: Fix SQL injection (P0)
   - workspace-abc123-t2: Fix XSS vulnerability (P0)
   - workspace-abc123-t3: Fix layer violation (P1)
   - workspace-abc123-t4: Add missing tests (P1)
   - workspace-abc123-t5: Simplify complex function (P2)
   - workspace-abc123-t6: Improve variable naming (P3)

5. Generate report:
   - Summary for non-technical readers
   - All findings organized by severity
   - Beads tasks created section
   - Copy-paste prompt to fix all issues

Output to user:
   - Consolidated review report
   - 6 beads tasks created
   - Ready-to-paste prompt
```

## Error Handling

### When Beads Task Creation Fails

If beads task creation fails for any reason:

- Log the error but continue with the review
- Include error message in the report
- Still generate the findings section and copy-paste prompt
- Inform the user they can create tasks manually if needed

### When Review Subagents Fail

If any subagent fails to complete:

- Continue with other subagents
- Note which reviews failed in the report
- Generate findings from successful reviews only
- Recommend re-running the failed review manually

### When No Epic Is Found

If no epic matches the current branch:

- Skip beads task creation entirely
- Include note in report: "No epic found for current branch - skipping beads task creation"
- Still generate complete review with findings and copy-paste prompt
