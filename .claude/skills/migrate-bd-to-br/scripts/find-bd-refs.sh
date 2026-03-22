#!/usr/bin/env bash
# Find files containing bd (beads) references that need migration to br.
# Scans markdown, TypeScript, shell, YAML, and JSON files.
#
# Usage: ./find-bd-refs.sh [path]
#
# Exit codes:
#   0 - No bd references found (migration complete)
#   1 - bd references found (migration needed)

set -euo pipefail

path="${1:-.}"

echo "=== bd -> br Migration Discovery ==="
echo "Scanning: $path"
echo ""

# Find files with npx bd references
npx_files=$(grep -rl 'npx bd\b' "$path" \
  --include="*.md" --include="*.ts" --include="*.sh" \
  --include="*.yml" --include="*.yaml" 2>/dev/null \
  | grep -v node_modules | grep -v '.git/' || true)

# Find files with bare bd command references
bare_files=$(grep -rl '\bbd\s\+\(create\|list\|show\|update\|close\|ready\|init\|dep\|comment\|sync\|epic\|hooks\|dolt\|blocked\|count\|search\|reopen\|children\|stats\|ready\)' "$path" \
  --include="*.md" --include="*.ts" --include="*.sh" \
  --include="*.yml" --include="*.yaml" 2>/dev/null \
  | grep -v node_modules | grep -v '.git/' || true)

# Find files with @beads/bd package reference
pkg_files=$(grep -rl '"@beads/bd"' "$path" \
  --include="*.json" 2>/dev/null \
  | grep -v node_modules | grep -v '.git/' || true)

# Find files with bd sync specifically (critical behavioral change)
sync_files=$(grep -rl '\bbd sync\b' "$path" \
  --include="*.md" --include="*.ts" --include="*.sh" \
  --include="*.yml" --include="*.yaml" 2>/dev/null \
  | grep -v node_modules | grep -v '.git/' || true)

# Display results
if [[ -n "$npx_files" ]]; then
  echo "=== Files with 'npx bd' references ==="
  echo "$npx_files"
  echo ""
fi

if [[ -n "$bare_files" ]]; then
  echo "=== Files with bare 'bd <command>' references ==="
  echo "$bare_files"
  echo ""
fi

if [[ -n "$pkg_files" ]]; then
  echo "=== Files with @beads/bd package reference ==="
  echo "$pkg_files"
  echo ""
fi

if [[ -n "$sync_files" ]]; then
  echo "=== Files with 'bd sync' (critical behavioral change) ==="
  echo "$sync_files"
  echo ""
fi

# Count summary
all_files=$(echo -e "${npx_files}\n${bare_files}\n${pkg_files}\n${sync_files}" \
  | grep -v '^$' | sort -u || true)
total=$(echo "$all_files" | grep -c . 2>/dev/null || echo "0")

echo "=== Summary ==="
echo "Files with npx bd:      $(echo "$npx_files" | grep -c . 2>/dev/null || echo 0)"
echo "Files with bare bd cmd: $(echo "$bare_files" | grep -c . 2>/dev/null || echo 0)"
echo "Files with @beads/bd:   $(echo "$pkg_files" | grep -c . 2>/dev/null || echo 0)"
echo "Files with bd sync:     $(echo "$sync_files" | grep -c . 2>/dev/null || echo 0)"
echo ""
echo "Total unique files needing migration: $total"

if [[ "$total" -gt 0 ]]; then
  echo ""
  echo "=== Migration Recommendation ==="
  if [[ "$total" -le 5 ]]; then
    echo "Strategy: Sequential (1-5 files)"
  elif [[ "$total" -le 15 ]]; then
    echo "Strategy: 2-3 parallel subagents (~$((total / 3)) files each)"
  elif [[ "$total" -le 50 ]]; then
    echo "Strategy: 4-5 parallel subagents (~$((total / 5)) files each)"
  else
    echo "Strategy: 5+ parallel subagents (~$((total / 5)) files each)"
  fi
  exit 1
else
  echo ""
  echo "No bd references found. Migration complete!"
  exit 0
fi
