# ralph.sh Epic Detection Fails When Branch Uses Hyphens but Epic Title Uses Spaces

**Category**: tooling
**Date**: 2026-03-03
**Feature**: 012-clawtask-vertical-slice
**Tags**: ralph, beads, epic, branch-naming, jq

## Problem

Running `./ralph.sh` exits immediately with:

```
Error: No epic found matching feature 'clawtask-vertical-slice'
```

The branch exists and the beads epic exists, but ralph cannot connect them.

## Root Cause

`extract_feature_name` strips the numeric prefix from the branch name:

```
012-clawtask-vertical-slice  →  clawtask-vertical-slice
```

`find_epic_id` then uses `jq contains()` to find an epic whose title includes
that string. But epic titles use natural spaces ("ClawTask Vertical Slice"),
not hyphens — so `contains("clawtask-vertical-slice")` never matches
"clawtask vertical slice".

## Solution

Normalize hyphens to spaces in the jq expression before comparing:

```bash
# Before (broken)
epic_id=$(echo "$epics_json" | jq -r --arg name "$feature_name" \
    '.[] | select(.title | ascii_downcase | contains($name | ascii_downcase)) | .id' | head -n1)

# After (fixed)
epic_id=$(echo "$epics_json" | jq -r --arg name "$feature_name" \
    '.[] | select(.title | ascii_downcase | contains($name | ascii_downcase | gsub("-"; " "))) | .id' | head -n1)
```

The `gsub("-"; " ")` converts `clawtask-vertical-slice` →
`clawtask vertical slice` before the substring match.

**Workaround** (without code change): pass `--epic <id>` explicitly:

```bash
./ralph.sh --epic workspace-bms
```

## Prevention

- When naming beads epics, ensure the title contains the branch slug words
  in order (spaces or hyphens both work after this fix).
- Alternatively, keep epic titles in the format
  `Feature: {branch-words-with-spaces}` so detection is unambiguous.
- The `--epic` flag is always available as an escape hatch.
