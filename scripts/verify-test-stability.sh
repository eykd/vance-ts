#!/usr/bin/env bash
set -euo pipefail

PASSES=0
FAILS=0

for i in $(seq 1 10); do
  echo "=== Run $i/10 ==="
  if npx vitest run --project=acceptance 2>&1; then
    PASSES=$((PASSES + 1))
  else
    FAILS=$((FAILS + 1))
  fi
done

echo "Results: $PASSES passed, $FAILS failed out of 10 runs"
[ "$FAILS" -eq 0 ] || exit 1
