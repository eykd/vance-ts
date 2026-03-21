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

# Check for unused code, exports, and dependencies
lint-unused:
    npx knip

# Check code formatting
format-check:
    npx prettier --check "src/**/*.ts"

# Format code
format:
    npx prettier --write "src/**/*.ts"

# Run all tests
test:
    npx vitest run

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

# Run Workers and acceptance tests (requires hugo/public from a prior build)
test-workers:
    npm run test:workers

# Run the full CI pipeline locally
ci: clean install type-check lint lint-unused format-check test-coverage build hugo-install hugo-test test-workers
    @echo "✅ CI pipeline completed successfully!"

# Watch mode for TypeScript compilation
build-watch:
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

# Build Hugo + start Workers dev server (production-like, single port)
dev: hugo-build dev-worker

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

# Run acceptance tests with state leak detection enabled
test-leak-detect:
    DETECT_STATE_LEAKS=true npx vitest run --project=acceptance

# Run acceptance tests 10 times to verify no flakiness
test-stability:
    bash scripts/verify-test-stability.sh

# Run mutation testing on domain and application layers (slow — CI only)
test-mutants:
    npx stryker run

# Run both unit tests and acceptance tests
test-all: test acceptance-run

# ============================================================================
# Beads Task Tracker
# ============================================================================

# Initialize beads database from tracked JSONL (run after fresh clone)
beads-init:
    #!/usr/bin/env bash
    set -euo pipefail
    # Ensure br (beads_rust) is installed
    if ! command -v br &>/dev/null; then
        echo "Installing beads_rust..."
        curl -fsSL https://raw.githubusercontent.com/Dicklesworthstone/beads_rust/main/install.sh | bash
    fi
    # Initialize and import
    br init
    br sync --import-only
    echo "✅ Beads initialized"
