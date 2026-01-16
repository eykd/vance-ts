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

# Run all tests
test:
    npx jest

# Run tests in watch mode
test-watch:
    npx jest --watch

# Run tests with coverage
test-coverage:
    npx jest --coverage

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
