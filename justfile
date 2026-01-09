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
ci: clean install type-check lint format-check test-coverage build
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
