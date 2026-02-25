---
name: process-pr-reviews
description: Convert GitHub PR review comments (Security Review, Architecture Review, Code Quality Review) into beads tasks, then mark each comment as processed. Use after review bot comments appear on a PR to bridge CI findings into trackable work. Triggers on `/process-pr-reviews` or `/process-pr-reviews <pr-number>`.
---

# Process PR Reviews

Reads unprocessed review comments from the current PR, creates beads tasks for each finding, then prepends a `<!-- processed -->` banner to each comment so the PR thread stays clean.

## Invocation

```
/process-pr-reviews           # auto-detect PR from current branch
/process-pr-reviews 42        # explicit PR number
```

## Step-by-Step Workflow

### 1. Resolve PR number

```bash
PR=$(gh pr view --json number -q '.number' 2>/dev/null)
# If argument supplied, use that instead
```

If no PR found, tell the user and stop.

### 2. Fetch all PR issue comments

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
gh api "/repos/${OWNER_REPO}/issues/${PR}/comments" > /tmp/pr-comments.json
```

### 3. Filter review comments to process

Keep only comments that:

- Contain `<!-- reviewer: security -->`, `<!-- reviewer: architecture -->`, or `<!-- reviewer: quality -->` (sentinel injected by the workflow)
- Do **not** already contain `<!-- processed -->` (idempotency guard)

```bash
jq '[.[] | select(
  (.body | contains("<!-- reviewer:")) and
  (.body | contains("<!-- processed -->") | not)
)]' /tmp/pr-comments.json > /tmp/unprocessed.json
```

If the filtered list is empty: print "No unprocessed review comments found." and stop.

### 4. Resolve parent task ID

```bash
BRANCH=$(git branch --show-current)
EPIC_ID=$(echo "$BRANCH" | grep -oP 'workspace-\w+' || echo "")
```

If `EPIC_ID` is non-empty, look for an `[sp:07-implement]` child:

```bash
PARENT_ID=$(npx bd list --parent "$EPIC_ID" --status in_progress --format json 2>/dev/null \
  | jq -r '[.[] | select(.title | contains("[sp:07-implement]"))] | first | .id // empty')
PARENT_ID=${PARENT_ID:-$EPIC_ID}
```

If no epic found in branch name, create tasks without `--parent` and warn the user.

### 5. Parse and create beads tasks

For each unprocessed review comment, extract all findings. Each finding follows the format the review bot uses:

```
`file:line` | Severity | One-sentence problem | Concise fix
```

Or in a table/list format with File, Line, Severity, Problem, Fix.

For each finding:

```bash
npx bd create \
  --title "[review-type] Finding title" \
  --description "File: path
Line: N
Severity: High

Problem:
<description of the problem>

Fix:
<description of the fix>" \
  --priority <N> \
  --parent "$PARENT_ID" \
  --type task
```

**Severity → priority mapping:**

| Severity | Priority |
| -------- | -------- |
| Critical | 0        |
| High     | 1        |
| Medium   | 2        |
| Low      | 3        |

**Review-type labels:**

| Comment sentinel                  | Label prefix     |
| --------------------------------- | ---------------- |
| `<!-- reviewer: security -->`     | `[security]`     |
| `<!-- reviewer: architecture -->` | `[architecture]` |
| `<!-- reviewer: quality -->`      | `[quality]`      |

Collect each `(finding → task-id → severity)` tuple for the summary.

### 6. Mark comments as processed

For each processed review comment, prepend the processed banner using the REST PATCH endpoint:

```bash
COMMENT_ID=<id from comment JSON>
ORIGINAL_BODY=<body from comment JSON>
TASK_LIST="beads-xxx (Critical), beads-yyy (High)"  # collected from step 5
TODAY=$(date -u +%Y-%m-%d)

NEW_BODY="<!-- processed -->
> ✅ **Processed** — Beads tasks created: ${TASK_LIST}
> Run on: ${TODAY}

---

${ORIGINAL_BODY}"

gh api --method PATCH "/repos/${OWNER_REPO}/issues/comments/${COMMENT_ID}" \
  -f body="${NEW_BODY}"
```

### 7. Print summary

After processing all comments, print a summary table:

```
## Process PR Reviews — Summary

PR: #42 | Branch: 011-better-auth

| Finding                              | Task ID      | Severity |
|--------------------------------------|-------------|----------|
| [security] SQL injection in login    | beads-a1b2  | Critical |
| [quality] Missing error handling     | beads-c3d4  | Medium   |
| [architecture] Layer boundary breach | beads-e5f6  | High     |

3 tasks created under workspace-abc → beads-xyz ([sp:07-implement])

Run `npx bd ready` to see new tasks.
```

## Edge Cases

**No findings in a review comment** (e.g., review says "No issues found"):

- Still mark the comment as processed (prepend banner with "No tasks created")
- Do not fail silently — report in summary

**Comment body contains unescaped special characters**:

- Use `gh api -f body=@-` with stdin, or escape via `jq -Rs .` before passing

**No parent / no epic in branch**:

- Create tasks without `--parent`
- Warn: "⚠️ No epic found in branch name — tasks created without parent (invisible to ralph)"

**Second run (all comments already processed)**:

- Idempotency guard from step 3 skips them all
- Print: "No unprocessed review comments found. Nothing to do."

## Implementation Notes

- Use `jq` to parse JSON from `gh api` — do not use Python or Node for this
- Write task IDs to a temp accumulator file (`/tmp/pr-review-tasks.json`) between iterations to build the summary table
- The `<!-- processed -->` sentinel is an HTML comment — invisible in rendered GitHub markdown
- The `<!-- reviewer: ... -->` sentinel is injected by `.github/workflows/claude-code-review.yml` at the top of each review comment's body
