# TypeScript Best Practices: A Comprehensive Guide

## Introduction

This guide provides a complete reference for setting up a professional TypeScript project with strict type checking, comprehensive linting, robust testing infrastructure, and automated quality gates through pre-commit hooks. Following these practices will help you catch errors early, maintain code quality, and create more maintainable TypeScript applications.

## Project Initialization

Begin by initializing a new Node.js project and installing TypeScript as a development dependency. Create a new directory for your project and run the initialization commands to establish your package.json and install the necessary dependencies.

```bash
mkdir my-typescript-project
cd my-typescript-project
npm init -y
npm install --save-dev typescript @types/node
```

Initialize TypeScript configuration by running the TypeScript compiler with the init flag, which creates a tsconfig.json file with recommended defaults that you'll customize in the next section.

```bash
npx tsc --init
```

## Strict Type Checking Configuration

TypeScript's strict mode is essential for catching type-related bugs at compile time. A properly configured tsconfig.json enforces type safety and prevents common errors that would otherwise only surface at runtime.

### Core Strict Options

The most important configuration is enabling strict mode, which activates all strict type checking options. This single setting encompasses multiple individual strict checks, but it's worth understanding what each one does so you can make informed decisions about your project's type safety requirements.

Replace the contents of your tsconfig.json with this comprehensive configuration:

```json
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    /* Strict Type-Checking Options */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    /* Additional Checks */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    /* Module Resolution */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    /* Emit */
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "removeComments": false,
    "importHelpers": true,
    "downlevelIteration": true,

    /* Interop Constraints */
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

### Understanding Key Strict Options

The noImplicitAny option prevents TypeScript from silently inferring the any type when it cannot determine a more specific type. This forces you to explicitly type variables and function parameters, which catches many potential bugs. For example, without this option, a function parameter without a type annotation would default to any, bypassing type checking entirely.

The strictNullChecks option treats null and undefined as distinct types that must be explicitly handled. This is one of the most valuable strict options because it prevents the notorious "Cannot read property of undefined" runtime errors by forcing you to check for null and undefined values before using them.

The noUncheckedIndexedAccess option makes accessing array elements and object properties with index signatures return a union type that includes undefined. This acknowledges the reality that accessing an array or object by index might not find a value, forcing proper handling of that case.

### Incremental Adoption Strategy

If you're adding strict type checking to an existing codebase, you may want to enable options gradually. Start by enabling strict mode in tsconfig.json, then use inline comments to suppress specific errors while you work through them systematically.

```typescript
// @ts-expect-error: Migrating to strict mode, will fix this function next sprint
function legacyFunction(data) {
  return data.value;
}
```

However, this should be a temporary measure with a clear plan to remove these suppressions. Consider creating GitHub issues for each suppressed error to track the migration work.

## Comprehensive Linting Setup

ESLint with TypeScript support provides extensive code quality checks beyond what the TypeScript compiler offers. It catches potential bugs, enforces consistent code style, and helps teams maintain readable code.

### Installation

Install ESLint, the TypeScript ESLint parser, and recommended rule sets. The TypeScript ESLint project maintains high-quality parsers and plugins specifically designed for TypeScript code. We'll also include eslint-plugin-jsdoc for comprehensive JSDoc validation.

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev eslint-config-prettier eslint-plugin-prettier prettier
npm install --save-dev eslint-plugin-import eslint-plugin-jsdoc
```

### ESLint Configuration

Create an .eslintrc.json file in your project root with a comprehensive set of rules. This configuration uses the recommended TypeScript ESLint rules as a base and adds additional checks for code quality and JSDoc documentation validation.

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "import", "jsdoc"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jsdoc/recommended-typescript",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      {
        "allowString": false,
        "allowNumber": false,
        "allowNullableObject": false
      }
    ],
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        "prefer": "type-imports"
      }
    ],
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "custom": {
          "regex": "^I[A-Z]",
          "match": false
        }
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      },
      {
        "selector": "enumMember",
        "format": ["UPPER_CASE"]
      }
    ],
    "jsdoc/require-jsdoc": [
      "error",
      {
        "require": {
          "FunctionDeclaration": true,
          "MethodDefinition": true,
          "ClassDeclaration": true,
          "ArrowFunctionExpression": false,
          "FunctionExpression": false
        },
        "publicOnly": {
          "cjs": true,
          "esm": true,
          "window": true
        },
        "contexts": ["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "TSEnumDeclaration"]
      }
    ],
    "jsdoc/require-description": [
      "error",
      {
        "contexts": ["any"]
      }
    ],
    "jsdoc/require-param-description": "error",
    "jsdoc/require-returns-description": "error",
    "jsdoc/require-param-type": "off",
    "jsdoc/require-returns-type": "off",
    "jsdoc/require-property-type": "off",
    "jsdoc/check-param-names": "error",
    "jsdoc/check-property-names": "error",
    "jsdoc/check-tag-names": "error",
    "jsdoc/check-types": "error",
    "jsdoc/no-undefined-types": "error",
    "jsdoc/valid-types": "error",
    "jsdoc/require-returns": [
      "error",
      {
        "forceRequireReturn": false,
        "forceReturnsWithAsync": false
      }
    ],
    "jsdoc/require-yields": "error",
    "jsdoc/check-alignment": "error",
    "jsdoc/check-indentation": "error",
    "jsdoc/no-bad-blocks": "error",
    "jsdoc/no-blank-block-descriptions": "error",
    "jsdoc/no-defaults": "error",
    "jsdoc/require-asterisk-prefix": "error",
    "jsdoc/require-hyphen-before-param-description": ["error", "always"],
    "jsdoc/tag-lines": [
      "error",
      "any",
      {
        "startLines": 1
      }
    ],
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    "import/no-duplicates": "error",
    "import/no-unresolved": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["dist/", "node_modules/", "coverage/", "*.js"]
}
```

### Prettier Configuration

Prettier handles code formatting automatically, removing debates about style and ensuring consistency. Create a .prettierrc.json file to define your formatting preferences.

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Add a .prettierignore file to exclude certain directories from formatting:

```
dist
coverage
node_modules
*.min.js
*.json
pnpm-lock.yaml
package-lock.json
```

### JSDoc Linting Rules Explained

The eslint-plugin-jsdoc provides comprehensive validation of JSDoc comments, ensuring your code documentation is accurate, complete, and maintainable. While TypeScript provides type information, JSDoc comments serve the crucial purpose of explaining the why and how, not just the what.

The require-jsdoc rule enforces JSDoc comments on all public functions, methods, and classes. By setting publicOnly to true, we only require documentation for exported APIs, allowing internal implementation details to remain undocumented if their purpose is clear from context. The rule is also configured to require documentation for TypeScript-specific constructs like interfaces, type aliases, and enums, which are critical parts of your public API surface.

The require-description rule ensures that all JSDoc blocks contain meaningful descriptions. Empty JSDoc comments provide no value and can be misleading, so this rule prevents developers from adding comment blocks just to satisfy the require-jsdoc rule without actually documenting the code.

The check-param-names rule validates that documented parameters match the actual function signature. This catches common errors like typos in parameter names, outdated documentation after refactoring, and missing parameter documentation. It prevents the frustrating situation where documentation refers to parameters that don't exist or omits parameters that do.

We disable require-param-type, require-returns-type, and require-property-type because TypeScript already provides this information through its type system. Duplicating type information in JSDoc comments creates maintenance burden and opportunities for the documentation to drift out of sync with the actual types. Instead, we focus on descriptive documentation that adds value beyond what the type signature conveys.

The tag-lines and require-asterisk-prefix rules enforce consistent formatting of JSDoc comments. Consistency in documentation format makes it easier to read and maintain, and it ensures that documentation generation tools can parse your comments correctly.

The require-hyphen-before-param-description rule enforces a hyphen separator between parameter names and descriptions, improving readability and following widespread JSDoc conventions. This makes parameter documentation easier to scan and understand at a glance.

Here's an example of properly documented TypeScript code that satisfies all JSDoc linting rules:

````typescript
/**
 * Represents a user account in the system
 */
export interface UserAccount {
  /** Unique identifier for the user */
  id: string;

  /** User's email address used for authentication */
  email: string;

  /** ISO timestamp of account creation */
  createdAt: string;
}

/**
 * Service for managing user accounts and authentication
 */
export class UserService {
  /**
   * Creates a new user account with the provided credentials
   *
   * @param email - The user's email address, must be valid and unique
   * @param password - The user's password, must meet security requirements
   * @returns A promise that resolves to the newly created user account
   * @throws {ValidationError} When email is invalid or already exists
   * @throws {WeakPasswordError} When password doesn't meet requirements
   */
  async createUser(email: string, password: string): Promise<UserAccount> {
    // Implementation
    throw new Error('Not implemented');
  }

  /**
   * Authenticates a user with email and password credentials
   *
   * @param email - The user's email address
   * @param password - The user's password
   * @returns A promise that resolves to the authenticated user or null if credentials are invalid
   */
  async authenticate(email: string, password: string): Promise<UserAccount | null> {
    // Implementation
    return null;
  }
}

/**
 * Calculates compound interest for an investment
 *
 * This function uses the compound interest formula: A = P(1 + r)^t
 * where A is the final amount, P is principal, r is rate, and t is time.
 *
 * @param principal - Initial investment amount in dollars, must be positive
 * @param rate - Annual interest rate as a decimal (e.g., 0.05 for 5%)
 * @param years - Number of years to compound, must be positive
 * @returns The final amount including compound interest
 * @throws {Error} When any parameter is negative
 * @example
 * ```typescript
 * const finalAmount = calculateCompoundInterest(1000, 0.05, 10);
 * console.log(finalAmount); // 1628.89
 * ```
 */
export function calculateCompoundInterest(principal: number, rate: number, years: number): number {
  if (principal < 0 || rate < 0 || years < 0) {
    throw new Error('All parameters must be non-negative');
  }
  return principal * Math.pow(1 + rate, years);
}

/**
 * Result type for operations that can succeed or fail
 *
 * @template T - The type of the success value
 */
export type Result<T> = { status: 'success'; data: T } | { status: 'error'; error: string };
````

This documentation approach provides several benefits. It explains the purpose and behavior of each function in natural language. It documents edge cases, error conditions, and parameter requirements that aren't captured by the type system. It includes examples showing how to use the function correctly. It uses @throws tags to document what errors can be thrown, helping callers handle exceptions appropriately.

### TypeScript and Import Linting Rules Explained

The no-explicit-any rule prevents the use of the any type, which defeats TypeScript's type system. While there are rare legitimate uses for any, requiring explicit acknowledgment through a suppression comment makes developers think twice before disabling type checking.

The no-floating-promises rule catches a common async/await mistake where promises are created but not awaited or handled. This often leads to unhandled promise rejections and race conditions that are difficult to debug.

The strict-boolean-expressions rule requires explicit boolean conversions in conditional statements. This prevents subtle bugs where truthy/falsy values like empty strings or zero are treated as booleans unexpectedly.

The switch-exhaustiveness-check rule ensures that switch statements on union types handle all possible cases. When combined with TypeScript's type narrowing, this provides compile-time guarantees that all code paths are covered.

## Test Harness Setup

A robust testing infrastructure is essential for maintaining code quality and enabling confident refactoring. This section covers setting up Jest with TypeScript support for unit and integration testing.

### Installing Testing Dependencies

Install Jest along with TypeScript support and testing utilities. The ts-jest package allows Jest to work seamlessly with TypeScript without requiring a separate compilation step.

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/jest-dom
```

### Jest Configuration

Create a jest.config.js file in your project root. This configuration tells Jest how to handle TypeScript files and provides sensible defaults for coverage reporting.

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 10000,
};
```

### Test File Structure

Organize your tests alongside your source code using a consistent naming convention. Create test files with the .spec.ts or .test.ts extension. Here's an example test structure for a utility function:

```typescript
// src/utils/calculator.ts
/**
 * Utility class for basic mathematical operations
 */
export class Calculator {
  /**
   * Adds two numbers together
   *
   * @param a - The first number to add
   * @param b - The second number to add
   * @returns The sum of a and b
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Divides one number by another
   *
   * @param a - The dividend (number to be divided)
   * @param b - The divisor (number to divide by)
   * @returns The quotient of a divided by b
   * @throws {Error} When attempting to divide by zero
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  }
}

// src/utils/calculator.spec.ts
import { Calculator } from './calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers correctly', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(calculator.add(-2, 3)).toBe(1);
    });
  });

  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should throw an error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });
});
```

### Testing Best Practices

Write tests that focus on behavior rather than implementation details. Each test should verify one specific aspect of functionality and have a clear, descriptive name that explains what is being tested and what the expected outcome is.

Use the Arrange-Act-Assert pattern to structure your tests. First, set up the necessary preconditions and inputs. Then, execute the code being tested. Finally, verify that the outcome matches expectations. This makes tests easier to read and understand.

Mock external dependencies to isolate the code under test. Jest provides powerful mocking capabilities that allow you to replace dependencies with controlled test doubles, ensuring tests are fast, reliable, and focused on the specific unit being tested.

```typescript
// Example with mocking
import { UserService } from './user-service';
import { Database } from './database';

jest.mock('./database');

describe('UserService', () => {
  let userService: UserService;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    mockDatabase = new Database() as jest.Mocked<Database>;
    userService = new UserService(mockDatabase);
  });

  it('should fetch user by id', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    mockDatabase.query.mockResolvedValue(mockUser);

    const result = await userService.getUser(1);

    expect(result).toEqual(mockUser);
    expect(mockDatabase.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1]);
  });
});

// src/services/user-service.ts
import type { Database } from './database';

/**
 * User data structure
 */
export interface User {
  /** Unique user identifier */
  id: number;

  /** User's display name */
  name: string;
}

/**
 * Service for managing user data and operations
 */
export class UserService {
  /**
   * Creates a new UserService instance
   *
   * @param database - Database connection for data access
   */
  constructor(private readonly database: Database) {}

  /**
   * Retrieves a user by their unique identifier
   *
   * @param id - The unique identifier of the user to fetch
   * @returns A promise that resolves to the user object, or null if not found
   */
  async getUser(id: number): Promise<User | null> {
    const result = await this.database.query<User>('SELECT * FROM users WHERE id = ?', [id]);
    return result;
  }
}
```

### Coverage Requirements

Set meaningful coverage thresholds that encourage thorough testing without becoming burdensome. The configuration above sets an 80% threshold for branches, functions, lines, and statements. While 100% coverage is often impractical and can lead to diminishing returns, ensuring strong coverage of critical business logic is essential.

Generate and review coverage reports regularly to identify untested code paths. The HTML coverage report provides a visual representation of which lines are covered, making it easy to spot gaps in test coverage.

```bash
npm test -- --coverage
```

## Pre-commit Hooks with Husky and lint-staged

Pre-commit hooks automatically run quality checks before code is committed, preventing problematic code from entering the repository. This creates a safety net that catches issues before they reach code review.

### Installation

Install Husky for managing Git hooks and lint-staged for running linters on staged files only. This approach is more efficient than linting the entire codebase on every commit.

```bash
npm install --save-dev husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
```

### Creating the Pre-commit Hook

Create a pre-commit hook that runs lint-staged by executing the following command. This creates a script in the .husky directory that Git will execute before each commit.

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

### Configuring lint-staged

Add a lint-staged configuration to your package.json that specifies what to run on different file types. This configuration runs all critical quality checks on staged TypeScript files: formatting, linting, type-checking, and related tests.

```json
{
  "lint-staged": {
    "*.ts": [
      "prettier --write",
      "eslint --fix --max-warnings 0",
      "bash -c 'tsc --noEmit'",
      "jest --bail --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

This ensures that every commit:

- Is properly formatted with Prettier
- Passes all ESLint rules (including JSDoc validation)
- Type-checks successfully with TypeScript compiler
- Doesn't break any related tests

### Alternative: Using a Configuration File

For more complex configurations, create a .lintstagedrc.json file in your project root:

```json
{
  "*.ts": [
    "prettier --write",
    "eslint --fix --max-warnings 0",
    "bash -c 'tsc --noEmit'",
    "jest --bail --findRelatedTests --passWithNoTests"
  ],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

The --max-warnings 0 flag ensures that even warnings will prevent the commit, maintaining high code quality standards. The --bail flag on Jest stops test execution on the first failure, providing faster feedback during commits.

### Commit Message Linting

Add commit message linting to enforce conventional commit message format, which makes it easier to generate changelogs and understand the history of changes.

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Create a commitlint.config.js file:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert'],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
```

Add a commit-msg hook:

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

## Package.json Scripts

Add convenient npm scripts to your package.json for common development tasks. These scripts provide consistent commands across your team and CI/CD pipeline. Importantly, these scripts should match exactly what runs in your pre-commit hooks and CI pipeline.

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "clean": "rm -rf dist coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "check": "npm run type-check && npm run lint && npm run test",
    "validate": "npm run type-check && npm run lint && npm run format:check && npm run test:coverage && npm run build",
    "fix": "npm run format && npm run lint:fix",
    "prepare": "husky install"
  }
}
```

### Script Descriptions

**Core Build and Development:**

- `build` - Compile TypeScript to JavaScript
- `build:watch` - Compile in watch mode for development
- `clean` - Remove build artifacts and coverage reports

**Linting and Formatting:**

- `lint` - Check code for linting errors (including JSDoc validation)
- `lint:fix` - Automatically fix linting errors where possible
- `format` - Format code with Prettier
- `format:check` - Check if code is formatted correctly without modifying files

**Testing:**

- `test` - Run all tests
- `test:watch` - Run tests in watch mode for development
- `test:coverage` - Run tests and generate coverage reports

**Quality Gates:**

- `type-check` - Run TypeScript compiler without emitting files (type checking only)
- `check` - Run the quick quality check suite (type-check + lint + test)
- `validate` - Run complete validation matching CI pipeline
- `fix` - Auto-fix all fixable formatting and linting issues

**Git Hooks:**

- `prepare` - Install Husky git hooks (runs automatically after npm install)

The validate script is the most comprehensive, running all quality checks in the same order as your CI pipeline. Running this before pushing ensures your code will pass CI. The check script provides a faster feedback loop during development by skipping coverage reports and the build step.

## CI/CD Integration

Integrate these quality checks into your continuous integration pipeline to ensure all code merged into the main branch meets your standards. Here's an example GitHub Actions workflow:

Create .github/workflows/ci.yml:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Test
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Build
        run: npm run build
```

## Task Runner with Justfile

A Justfile provides a convenient way to run development tasks with simple, memorable commands. Just is a modern command runner similar to Make but with better syntax and cross-platform support. Install Just from https://github.com/casey/just

Create a file named `justfile` (no extension) in your project root:

```make
# List all available commands
default:
    @just --list

# Install dependencies
install:
    npm install

# Run type checking
type-check:
    tsc --noEmit

# Run linting
lint:
    eslint src --ext .ts

# Run linting with auto-fix
lint-fix:
    eslint src --ext .ts --fix

# Check code formatting
format-check:
    prettier --check "src/**/*.ts"

# Format code
format:
    prettier --write "src/**/*.ts"

# Run all tests
test:
    jest

# Run tests in watch mode
test-watch:
    jest --watch

# Run tests with coverage
test-coverage:
    jest --coverage

# Build the project
build:
    tsc

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
    tsc --watch

# Run security audit
audit:
    npm audit

# Update dependencies
update:
    npm update

# Install git hooks
setup-hooks:
    npm run prepare
```

### Using the Justfile

With this Justfile in place, you can run individual checks or combinations:

```bash
# Run type checking only
just type-check

# Run linting only
just lint

# Run tests only
just test

# Run all quality checks (type-check + lint + test)
just check

# Run full validation including build
just validate

# Auto-fix formatting and linting issues
just fix

# Run the complete CI pipeline locally before pushing
just ci
```

### Benefits of Using Just

The Justfile provides several advantages over npm scripts alone. Commands are shorter and more memorable than their full npm equivalents. You can compose commands easily, running multiple checks in sequence. The syntax is cleaner and more readable than package.json scripts. Just provides better error handling and output formatting. Commands work consistently across different operating systems.

The check command is particularly useful during development, running the same quality checks that pre-commit hooks will run. This allows you to verify your changes before attempting to commit, avoiding the frustration of failed commits.

The ci command replicates your entire CI pipeline locally, helping you catch issues before pushing to the remote repository. Running this before creating a pull request saves time in the review cycle by ensuring all checks will pass.

### IDE Integration

Many IDEs support task runners and can integrate with Just. For VS Code, you can create tasks.json entries that call Just commands, or install the Just extension for syntax highlighting and command palette integration.

You can also create keyboard shortcuts for common commands. For example, mapping F5 to `just test-watch` provides instant test feedback during development.

## Quality Check Alignment

It's crucial that the same checks run everywhere: locally during development, in pre-commit hooks, and in CI. This ensures consistency and prevents surprises when code reaches CI. Here's how all the pieces align:

### Complete Check Coverage

| Check         | Pre-commit                   | npm script                 | Justfile                | CI Pipeline          |
| ------------- | ---------------------------- | -------------------------- | ----------------------- | -------------------- |
| Type checking | ✅ `tsc --noEmit`            | ✅ `npm run type-check`    | ✅ `just type-check`    | ✅ Type check step   |
| Linting       | ✅ `eslint --fix`            | ✅ `npm run lint`          | ✅ `just lint`          | ✅ Lint step         |
| Formatting    | ✅ `prettier --write`        | ✅ `npm run format:check`  | ✅ `just format-check`  | ✅ Format check step |
| Testing       | ✅ `jest --findRelatedTests` | ✅ `npm run test:coverage` | ✅ `just test-coverage` | ✅ Test step         |
| Build         | ❌ (too slow)                | ✅ `npm run build`         | ✅ `just build`         | ✅ Build step        |

### Why Pre-commit Skips Build

The pre-commit hook intentionally skips the full build step because it would make commits too slow. Type checking with `tsc --noEmit` provides similar safety (catching type errors) without the overhead of emitting JavaScript files. The build step is verified in CI where performance is less critical.

### Recommended Development Workflow

During active development:

```bash
# Run tests in watch mode
just test-watch
# or
npm run test:watch
```

Before committing:

```bash
# Run quick quality checks
just check
# or
npm run check

# Auto-fix any issues
just fix
# or
npm run fix
```

Before pushing:

```bash
# Run complete validation including build
just validate
# or
npm run validate
```

After pushing:

- CI runs the same checks automatically
- If CI fails, the issue should be reproducible locally with `just ci` or `npm run validate`

### Consistency Benefits

This alignment provides several key benefits:

**No Surprises**: Code that passes pre-commit hooks will pass CI, because they run the same checks.

**Fast Feedback**: Pre-commit hooks catch issues in seconds, before they enter version control.

**Reproducibility**: If CI fails, you can reproduce the failure locally with identical commands.

**Developer Choice**: Developers can use npm scripts, Just commands, or run tools directly based on their preference.

**Clear Standards**: Everyone on the team runs the same quality checks in the same way.

### Troubleshooting Alignment Issues

If you encounter situations where pre-commit passes but CI fails (or vice versa):

1. Verify you're using the same Node.js version locally and in CI (check .nvmrc)
2. Ensure dependencies are up to date: `npm ci` (not `npm install`)
3. Check that all tools are using the same configuration files
4. Run `just ci` or `npm run validate` locally to replicate CI exactly
5. Clear any caches: `npm run clean && rm -rf node_modules && npm install`

## Project Structure Best Practices

Organize your TypeScript project with a clear, scalable structure that separates concerns and makes navigation intuitive. Here's a recommended structure:

```
my-typescript-project/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers (if building an API)
│   ├── models/          # Data models and types
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # Shared TypeScript types and interfaces
│   ├── __tests__/       # Integration tests
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript output
├── coverage/            # Test coverage reports
├── node_modules/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .eslintrc.json
├── .prettierrc.json
├── .prettierignore
├── .nvmrc
├── commitlint.config.js
├── jest.config.js
├── tsconfig.json
├── justfile
├── package.json
└── README.md
```

Each directory should have a clear single responsibility. The services directory contains business logic, the controllers directory handles HTTP request/response cycles, and the utils directory houses reusable utility functions that don't fit elsewhere.

## Type Safety Best Practices

Beyond configuration, writing type-safe TypeScript code requires following certain patterns and avoiding common pitfalls. Always prefer interfaces over type aliases for object shapes, as interfaces can be extended and merged, providing greater flexibility.

Use union types and type guards to model data that can take multiple forms. This is more type-safe than using optional properties or the any type.

```typescript
/**
 * Represents a successful operation result
 *
 * @template T - The type of the success data
 */
type Success<T> = {
  /** Status indicator for successful operations */
  status: 'success';

  /** The data returned by the successful operation */
  data: T;
};

/**
 * Represents a failed operation result
 */
type Failure = {
  /** Status indicator for failed operations */
  status: 'error';

  /** Error message describing what went wrong */
  error: string;
};

/**
 * Discriminated union representing either success or failure
 *
 * @template T - The type of the success data
 */
type Result<T> = Success<T> | Failure;

/**
 * Handles operation results with proper type narrowing
 *
 * This function demonstrates TypeScript's discriminated union type narrowing.
 * After checking the status field, TypeScript knows which properties are available.
 *
 * @param result - The result to handle, either success or failure
 */
function handleResult<T>(result: Result<T>): void {
  if (result.status === 'success') {
    // TypeScript knows result.data exists here
    console.log(result.data);
  } else {
    // TypeScript knows result.error exists here
    console.error(result.error);
  }
}
```

Use the unknown type instead of any when you genuinely don't know the type of a value. Unlike any, unknown forces you to perform type checking before using the value, maintaining type safety.

```typescript
/**
 * Processes a value of unknown type with runtime type checking
 *
 * This function demonstrates safe handling of unknown types by performing
 * runtime type checks before using the value. This is much safer than using
 * the 'any' type, which bypasses all type checking.
 *
 * @param value - A value of unknown type to process
 */
function processValue(value: unknown): void {
  if (typeof value === 'string') {
    console.log(value.toUpperCase());
  } else if (typeof value === 'number') {
    console.log(value.toFixed(2));
  } else {
    console.log('Unsupported type');
  }
}
```

Leverage TypeScript's utility types like Readonly, Partial, Pick, and Omit to transform types without duplication. These utilities make your type definitions more maintainable and expressive.

```typescript
/**
 * User entity representing a registered user account
 */
interface User {
  /** Unique identifier */
  id: number;

  /** User's full name */
  name: string;

  /** User's email address */
  email: string;

  /** User's role in the system */
  role: string;
}

/**
 * Immutable user type with all properties read-only
 *
 * Use this type when passing user data that should not be modified,
 * such as when rendering user information in the UI.
 */
type ReadonlyUser = Readonly<User>;

/**
 * Minimal user information for display in lists and previews
 *
 * This type includes only the essential fields needed for user
 * identification in UI components like dropdowns and lists.
 */
type UserPreview = Pick<User, 'id' | 'name'>;

/**
 * User data without role information
 *
 * Use this type when handling user data in contexts where role
 * information should not be exposed or is not relevant.
 */
type UserWithoutRole = Omit<User, 'role'>;

/**
 * User data with all fields optional
 *
 * Useful for update operations where only some fields may be provided,
 * or for forms where fields are filled in progressively.
 */
type PartialUser = Partial<User>;
```

## Dependency Management Best Practices

Keep your dependencies up to date while maintaining stability. Use exact versions in production dependencies and allow minor/patch updates for development dependencies. Add a .nvmrc file to specify the Node.js version for consistency across development environments.

```bash
# .nvmrc
20.10.0
```

Regularly audit dependencies for security vulnerabilities using npm's built-in audit command. Set up automated dependency updates with tools like Dependabot or Renovate to stay current with security patches and new features.

```bash
npm audit
npm audit fix
```

## Documentation Standards

With strict JSDoc linting enabled, your codebase will maintain high-quality documentation that provides real value to developers. The linting rules enforce consistent formatting and completeness, but good documentation goes beyond satisfying the linter. It should explain the why and how, not just repeat what the code already shows.

Document your TypeScript code with JSDoc comments that provide context for developers and enable better IDE support. TypeScript understands JSDoc annotations and can use them to enhance type checking and provide better autocomplete suggestions. The eslint-plugin-jsdoc configuration we set up earlier enforces documentation on all public APIs while allowing flexibility for internal implementation details.

Write descriptions that focus on the purpose and behavior of the code, not implementation details that may change. Explain edge cases, error conditions, and usage constraints that aren't obvious from the type signature. Include examples for complex functions or APIs that may not be immediately intuitive.

````typescript
/**
 * Calculates the total price including tax
 *
 * This function applies the tax rate to the base price and returns the total.
 * The tax rate should be expressed as a decimal (e.g., 0.08 for 8% tax).
 * Both price and tax rate must be non-negative; negative values indicate
 * an error in the calling code and will result in an exception.
 *
 * @param price - The base price before tax, must be non-negative
 * @param taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns The total price including tax, rounded to 2 decimal places
 * @throws {Error} When price or taxRate is negative
 * @example
 * ```typescript
 * const total = calculateTotal(100, 0.08); // Returns 108
 * const total2 = calculateTotal(50.50, 0.095); // Returns 55.30
 * ```
 */
export function calculateTotal(price: number, taxRate: number): number {
  if (price < 0 || taxRate < 0) {
    throw new Error('Price and tax rate must be non-negative');
  }
  return Math.round(price * (1 + taxRate) * 100) / 100;
}

/**
 * Configuration options for the application logger
 */
export interface LoggerConfig {
  /** Minimum log level to output (debug, info, warn, error) */
  level: 'debug' | 'info' | 'warn' | 'error';

  /** Whether to include timestamps in log messages */
  includeTimestamp: boolean;

  /** Optional file path to write logs to disk */
  filePath?: string;
}

/**
 * Application logger with configurable output levels
 *
 * This logger supports multiple log levels and can write to both
 * console and file outputs. Log messages are formatted consistently
 * and can include timestamps based on configuration.
 */
export class Logger {
  /**
   * Creates a new Logger instance with the specified configuration
   *
   * @param config - Configuration options for the logger
   */
  constructor(private readonly config: LoggerConfig) {}

  /**
   * Logs a debug message
   *
   * Debug messages are only output when the logger level is set to 'debug'.
   * Use this for detailed diagnostic information that is useful during development
   * but not needed in production.
   *
   * @param message - The debug message to log
   * @param context - Optional additional context data to include
   */
  debug(message: string, context?: Record<string, unknown>): void {
    // Implementation
  }
}
````

Use @example tags liberally to show concrete usage patterns. Examples are especially valuable for APIs that accept complex parameters or have nuanced behavior. Good examples serve as executable documentation that developers can copy and adapt for their use cases.

Document exceptions thoroughly with @throws tags. Specify not just what exceptions can be thrown, but under what conditions they occur. This helps calling code handle errors appropriately and makes the contract between caller and callee explicit.

For complex types and interfaces, document not just each property but also the relationships between properties and any invariants that must be maintained. If certain combinations of properties are invalid or certain properties are mutually exclusive, document these constraints clearly.

Maintain a comprehensive README.md that explains project setup, development workflow, testing procedures, and deployment process. Include code examples for common use cases and keep documentation updated as the project evolves.

## Monitoring and Continuous Improvement

Track linting violations and test coverage over time to ensure code quality improves rather than degrades. Use tools like SonarQube or Code Climate for automated code quality analysis and technical debt tracking.

Review and update your linting rules periodically as your team's needs evolve and new ESLint plugins become available. The TypeScript and ESLint ecosystems are constantly improving, with new rules and patterns emerging that can enhance code quality.

Conduct regular code reviews focused not just on functionality but also on adherence to type safety principles and best practices. Use pull request templates that include checklists for common quality requirements.

## Troubleshooting Common Issues

When TypeScript compilation is slow, check your tsconfig.json for overly broad include patterns or missing exclude patterns. Ensure you're excluding node_modules and other directories that shouldn't be compiled.

If ESLint seems slow, make sure you're using the --cache flag, which dramatically improves performance on subsequent runs. Verify that your .eslintignore file excludes unnecessary directories.

When pre-commit hooks fail inconsistently, ensure all team members are using the same Node.js version specified in .nvmrc and have run npm install to get the correct dependency versions.

## Conclusion

Implementing these TypeScript best practices creates a solid foundation for professional software development. Strict type checking catches errors early, comprehensive linting maintains code quality, robust testing provides confidence in changes, and pre-commit hooks automate quality enforcement.

Start by implementing strict type checking and basic linting, then gradually add more sophisticated rules and checks as your team becomes comfortable with the workflow. The initial investment in setup pays dividends through reduced bugs, easier refactoring, and more maintainable code.

Remember that tools and configurations should serve your team's needs rather than dictate them. Adjust these recommendations based on your specific context, project requirements, and team preferences, but maintain the core principles of type safety, automated quality checks, and continuous validation.
