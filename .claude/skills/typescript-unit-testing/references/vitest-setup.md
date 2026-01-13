# Vitest Testing Infrastructure Setup

Complete guide to setting up Vitest for TypeScript unit testing.

## Installation

Install Vitest and dependencies:

```bash
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8
npm install --save-dev @types/node
```

## Basic Configuration

Create `vitest.config.ts` in your project root:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Enable globals (describe, it, expect)
    globals: true,

    // Environment
    environment: 'node', // or 'jsdom' for DOM testing

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/**/*.spec.ts', 'src/**/*.test.ts', 'dist/'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },

    // Test timeout
    testTimeout: 10000,

    // Mock reset behavior
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,

    // Run tests in parallel
    threads: true,

    // Shuffle tests to catch ordering dependencies
    sequence: {
      shuffle: true,
    },
  },

  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test'),
    },
  },
});
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes test files:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Package.json Scripts

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:unit": "vitest run src/**/*.spec.ts",
    "test:integration": "vitest run src/**/*.integration.test.ts"
  }
}
```

## Test Setup File

Create `src/test/setup.ts` for global test configuration:

```typescript
import { beforeEach, afterEach, vi } from 'vitest';

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Extend test timeout for slower tests
if (process.env.TEST_TYPE === 'integration') {
  vi.setConfig({ testTimeout: 30000 });
}
```

Reference the setup file in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts'],
    // ... other config
  },
});
```

## Directory Structure

Organize your test files:

```
src/
├── domain/              # Domain models
│   ├── Order.ts
│   └── Order.spec.ts   # Unit tests
├── application/        # Application services
│   ├── OrderService.ts
│   └── OrderService.spec.ts
├── adapters/          # External adapters
│   ├── OrderRepository.ts
│   └── OrderRepository.integration.test.ts
├── api/               # HTTP layer
│   ├── OrderController.ts
│   ├── OrderController.spec.ts
│   └── OrderController.acceptance.test.ts
└── test/              # Test utilities
    ├── setup.ts
    ├── mocks.ts       # Mock helpers
    └── builders/      # Test data builders
        └── OrderBuilder.ts
```

## Mock Helpers

Create reusable mock factories in `src/test/mocks.ts`:

```typescript
import type { OrderRepository, PaymentGateway, EmailService } from '../types';
import { vi } from 'vitest';

export function createMockOrderRepository(overrides?: Partial<OrderRepository>): OrderRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(null),
    findByCustomerId: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function createMockPaymentGateway(overrides?: Partial<PaymentGateway>): PaymentGateway {
  return {
    charge: vi.fn().mockResolvedValue({
      success: true,
      transactionId: 'txn-default',
    }),
    refund: vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  };
}

export function createMockEmailService(overrides?: Partial<EmailService>): EmailService {
  return {
    send: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}
```

## Test Data Builders

Create builders in `src/test/builders/`:

```typescript
// src/test/builders/OrderBuilder.ts
import { Order, type OrderStatus, type OrderItem } from '../../domain/Order';

export class OrderBuilder {
  private orderId = 'test-order-123';
  private customerId = 'test-customer';
  private items: OrderItem[] = [{ productId: 'product-1', quantity: 1, price: 10 }];
  private status: OrderStatus = 'pending';

  withId(orderId: string): this {
    this.orderId = orderId;
    return this;
  }

  withCustomerId(customerId: string): this {
    this.customerId = customerId;
    return this;
  }

  withItems(items: OrderItem[]): this {
    this.items = items;
    return this;
  }

  withStatus(status: OrderStatus): this {
    this.status = status;
    return this;
  }

  build(): Order {
    return new Order(this.orderId, this.customerId, this.items, this.status);
  }
}
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Run coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-commit Hooks

Install Husky:

```bash
npm install --save-dev husky
npm run prepare
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test:run
```

## Environment Variables

Create `.env.test` for test-specific configuration:

```
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://localhost:5432/test_db
STRIPE_TEST_KEY=sk_test_xxx
```

Load in tests:

```typescript
import { config } from 'dotenv';

// Load test environment
config({ path: '.env.test' });

describe('Integration Tests', () => {
  it('uses test config', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
```

## Watch Mode Configuration

Customize watch mode behavior:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    watch: true,
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
  },
});
```

Run with:

```bash
npm run test:watch
```

## Coverage Reports

View coverage in multiple formats:

```bash
# Terminal summary
npm run test:coverage

# HTML report (opens in browser)
open coverage/index.html

# LCOV for CI tools
cat coverage/lcov.info
```

Configure coverage thresholds in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      // Fail if under threshold
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

## UI Mode

Run tests with visual UI:

```bash
npm run test:ui
```

Features:

- Interactive test runner
- Real-time test results
- Coverage visualization
- Test filtering
- Source code inspection

## Debugging Tests

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test",
      "autoAttachChildProcesses": true,
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
      "program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "smartStep": true,
      "console": "integratedTerminal"
    }
  ]
}
```

### Using only/skip

Focus on specific tests:

```typescript
// Run only this test
it.only('specific test', () => {
  // ...
});

// Skip this test
it.skip('flaky test', () => {
  // ...
});

// Run only this suite
describe.only('specific suite', () => {
  // ...
});
```

## Custom Matchers

Extend Vitest with custom matchers:

```typescript
// src/test/matchers.ts
import { expect } from 'vitest';

interface CustomMatchers<R = unknown> {
  toBeValidOrder(): R;
  toHaveStatus(status: string): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeValidOrder(received: Order) {
    const pass =
      received.orderId !== '' && received.customerId !== '' && received.items().length > 0;

    return {
      pass,
      message: () => (pass ? 'expected order not to be valid' : 'expected order to be valid'),
    };
  },

  toHaveStatus(received: Order, expected: string) {
    const pass = received.status === expected;

    return {
      pass,
      message: () =>
        pass
          ? `expected order not to have status ${expected}`
          : `expected order to have status ${expected}, got ${received.status}`,
    };
  },
});
```

Import in `setup.ts`:

```typescript
import './matchers';
```

Use in tests:

```typescript
it('creates valid order', () => {
  const order = new OrderBuilder().build();
  expect(order).toBeValidOrder();
  expect(order).toHaveStatus('pending');
});
```

## Performance Optimization

### Parallel Test Execution

```typescript
export default defineConfig({
  test: {
    threads: true,
    maxThreads: 4, // Limit concurrent threads
    minThreads: 1,
  },
});
```

### Test Isolation

```typescript
export default defineConfig({
  test: {
    isolate: true, // Run each test file in isolation
  },
});
```

### Selective Test Running

Run only changed tests:

```bash
vitest related src/domain/Order.ts
```

## Troubleshooting

### Slow Tests

Profile tests to find bottlenecks:

```bash
vitest --reporter=verbose --reporter=json --outputFile=profile.json
```

### Memory Leaks

Use Node.js heap snapshots:

```bash
node --expose-gc node_modules/vitest/vitest.mjs run --reporter=verbose
```

### Module Resolution Issues

Ensure TypeScript paths match Vitest aliases:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@test/*": ["./src/test/*"]
    }
  }
}

// vitest.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test'),
    },
  },
});
```

## Summary

This setup provides:

- Fast, parallel test execution
- Coverage reporting with thresholds
- Type-safe mocks and builders
- CI/CD integration
- Interactive UI mode
- Custom matchers
- Debug configuration
- Pre-commit hooks

Adjust configuration based on project needs, but these defaults work well for most TypeScript projects.
