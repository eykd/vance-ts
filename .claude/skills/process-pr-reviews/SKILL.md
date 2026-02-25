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

The default page size is 30 — always request 100 per page to avoid missing recent comments:

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
gh api "/repos/${OWNER_REPO}/issues/${PR}/comments?per_page=100" > /tmp/pr-comments.json
```

If the PR might have more than 100 comments, use `--paginate` flag instead:

```bash
gh api --paginate "/repos/${OWNER_REPO}/issues/${PR}/comments" \
  | jq -s 'add' > /tmp/pr-comments.json
```

### 3. Filter review comments to process

Keep only comments that:

- Contain `<!-- reviewer: security -->`, `<!-- reviewer: architecture -->`, or `<!-- reviewer: quality -->` (sentinel injected by the workflow)
- Do **not** already contain `<!-- processed -->` (idempotency guard)

**Important**: Do NOT use inline `jq` with HTML comment strings. The `!` character in `<!--` triggers zsh history expansion even inside jq filter arguments, producing `Invalid escape at line 1 (while parsing '"\!"')` errors. Use a Python script written to a temp file instead:

```bash
cat > /tmp/check_comments.py << 'PYEOF'
import json, sys
sentinel = "<!-- reviewer:"
processed = "<!-- processed -->"
comments = json.load(open('/tmp/pr-comments.json'))
unprocessed = [c for c in comments if sentinel in c['body'] and processed not in c['body']]
print(f'Unprocessed: {len(unprocessed)}')
for c in unprocessed:
    print(f'  ID: {c["id"]} | {c["body"][:60].replace(chr(10)," ")}')
json.dump(unprocessed, open('/tmp/unprocessed.json', 'w'))
PYEOF
python3 /tmp/check_comments.py
```

If the filtered list is empty: print "No unprocessed review comments found." and stop.

### 4. Resolve parent task ID

Branch naming convention for this project uses the pattern `NNN-kebab-title` (e.g. `011-better-auth`), not `workspace-\w+`. Extract the epic from the branch by searching beads:

```bash
BRANCH=$(git branch --show-current)
# Show all in_progress epics to identify the active one
npx bd list --status=open --type=epic 2>/dev/null | head -5
```

Find the `[sp:07-implement]` child task of the epic — this is the correct parent for review-generated tasks so they appear in `bd ready` and are visible to `ralph`:

```bash
npx bd list --parent "$EPIC_ID" 2>/dev/null | grep "sp:07-implement"
# Use the task ID shown (e.g. tb-ltk.6)
PARENT_ID="tb-ltk.6"
```

**Note**: The `[sp:07-implement]` task may already be closed (✓) — that's fine. New review tasks still belong under it to maintain the hierarchy. Use the closed sp:07-implement ID as `--parent`.

If no epic found, create tasks without `--parent` and warn the user.

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

# JSON-encode via jq to handle multi-line bodies and special characters safely
NEW_BODY=$(printf '<!-- processed -->\n> ✅ **Processed** — Beads tasks created: %s\n> Run on: %s\n\n---\n\n%s' \
  "${TASK_LIST}" "${TODAY}" "${ORIGINAL_BODY}" | jq -Rs .)

printf '{"body":%s}' "${NEW_BODY}" | \
  gh api --method PATCH "/repos/${OWNER_REPO}/issues/comments/${COMMENT_ID}" \
    --input -
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

- **Pagination**: Always use `?per_page=100` (or `--paginate`) when fetching comments. The default 30-item page silently drops newer comments and causes "no unprocessed comments found" false negatives.
- **HTML comment strings in jq**: Never use inline `jq` filters containing `<!--`. The `!` in HTML comment syntax triggers zsh history expansion inside jq filter arguments, producing `Invalid escape (while parsing '"\!"')` errors. Use Python scripts written to temp files instead (see Step 3).
- **Deduplication**: Before creating a beads task, scan existing open tasks for the same file/line/finding. Note duplicates in the processed banner but do not create them again. Reference the existing task ID instead.
- **Closed sp:07-implement parent**: The `[sp:07-implement]` task may be closed (✓) by the time reviews arrive. Still use it as `--parent` — tasks need the hierarchy for `ralph` visibility, and beads allows children under closed parents.
- Write task IDs to a temp accumulator as you create them to build the final summary table.
- The `<!-- processed -->` sentinel is an HTML comment — invisible in rendered GitHub markdown.
- The `<!-- reviewer: ... -->` sentinel is injected by `.github/workflows/claude-code-review.yml` at the top of each review comment's body.
