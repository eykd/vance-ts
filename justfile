# List all available commands
default:
    @just --list

# Install dependencies
install:
    npm install

# Run type checking
type-check:
    npx tsc --noEmit

# Run linting
lint:
    npx eslint src --ext .ts

# Run linting with auto-fix
lint-fix:
    npx eslint src --ext .ts --fix

# Check code formatting
format-check:
    npx prettier --check "src/**/*.ts"

# Format code
format:
    npx prettier --write "src/**/*.ts"

# Run all tests (projects run concurrently)
test:
    npx vitest run

# Run all tests serially (workers → node → acceptance); use on resource-constrained hosts
test-serial:
    npx vitest run --project=workers
    npx vitest run --project=node
    npx vitest run --project=acceptance

# Run tests in watch mode
test-watch:
    npx vitest

# Run tests with coverage (node project only; workers runtime does not support v8 coverage)
test-coverage:
    npx vitest run --coverage --project=node

# Build the project
build:
    npx tsc

# Clean build artifacts
clean:
    rm -rf dist coverage

# Run all quality checks (pre-commit suite)
check: type-check lint test
    @echo "✅ All checks passed!"

# Run all quality checks and build
validate: check build
    @echo "✅ Validation complete!"

# Fix all auto-fixable issues
fix: format lint-fix
    @echo "✅ Auto-fixes applied!"

# Run the full CI pipeline locally
ci: clean install type-check lint format-check test-coverage build hugo-install hugo-test
    @echo "✅ CI pipeline completed successfully!"

# Watch mode for development
dev:
    npx tsc --watch

# Run security audit
audit:
    npm audit

# Update dependencies
update:
    npm update

# Install git hooks
setup-hooks:
    npm run prepare

# ============================================================================
# Hugo Static Site Commands
# ============================================================================

# Install Hugo dependencies
hugo-install:
    cd hugo && npm install

# Start Hugo development server (http://localhost:1313)
hugo-dev:
    cd hugo && npx hugo server

# Build Hugo site for production (output in hugo/public/)
hugo-build:
    cd hugo && npx hugo --minify
    node scripts/sync-asset-paths.js
    node scripts/check-route-collisions.js

# Run Hugo build smoke test
hugo-test:
    cd hugo && npm test

# Clean Hugo build artifacts
hugo-clean:
    cd hugo && rm -rf public resources

# Rebuild Hugo site (clean + build)
hugo-rebuild: hugo-clean hugo-build
    @echo "✅ Hugo site rebuilt!"

# Check Hugo installation and configuration
hugo-check:
    @echo "Checking Hugo installation..."
    @cd hugo && npx hugo version
    @echo "\nChecking Hugo dependencies..."
    @cd hugo && npm list --depth=0
    @echo "\n✅ Hugo setup verified!"

# ============================================================================
# Worker Development Commands
# ============================================================================

# Start local dev server with Workers runtime + static assets
dev-worker:
    npx wrangler dev

# Build and deploy to Cloudflare Workers
deploy: hugo-build
    npx wrangler deploy

# ============================================================================
# Template Builder Commands
# ============================================================================

# Build tmplr template from repository
build-template:
    ./scripts/build-template.sh

# Install tmplr binary for template instantiation
install-tmplr:
    ./scripts/install-tmplr.sh

# ============================================================================
# Acceptance Test Pipeline
# ============================================================================

# Full acceptance pipeline: parse GWT specs → generate Vitest stubs → run tests
acceptance:
    rm -rf acceptance-pipeline/ir/
    npx tsx acceptance/pipeline.ts --action=run

# Parse GWT specs to IR JSON only
acceptance-parse:
    npx tsx acceptance/pipeline.ts --action=parse

# Generate Vitest stubs from IR only
acceptance-generate:
    npx tsx acceptance/pipeline.ts --action=generate

# Run generated acceptance tests only (skips parse/generate)
acceptance-run:
    npx vitest run generated-acceptance-tests/

# Force-regenerate all stubs — DESTROYS bound implementations!
acceptance-regen:
    rm -rf acceptance-pipeline/ir/ generated-acceptance-tests/*.spec.ts
    npx tsx acceptance/pipeline.ts --action=run

# Run both unit tests and acceptance tests
test-all: test acceptance-run

# ============================================================================
# Beads Task Tracker
# ============================================================================

# Initialize beads database from tracked JSONL (run after fresh clone)
beads-init:
    #!/usr/bin/env bash
    set -euo pipefail
    # Ensure dolt is installed
    if ! command -v dolt &>/dev/null; then
        echo "Installing dolt..."
        curl -fsSL https://github.com/dolthub/dolt/releases/latest/download/install.sh | sudo bash
    fi
    # Skip if already initialized and healthy
    if npx bd dolt test --quiet 2>/dev/null && npx bd list --json --quiet 2>/dev/null | grep -q '"id"'; then
        echo "✅ Beads already initialized and healthy — nothing to do."
        exit 0
    fi
    # Hydrate dolt database from the JSONL that travels with the repo
    npx bd init --from-jsonl --server-port 14080
    echo "✅ Beads initialized from issues.jsonl"
