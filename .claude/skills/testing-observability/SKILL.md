# Testing Observability

**Use when:** Writing tests for logging implementation including logger behavior, redaction correctness, and Workers runtime integration.

## Overview

This skill provides testing patterns for observability code in Cloudflare Workers applications. It covers logger unit tests with console.log mocking, comprehensive redaction validation for defense-in-depth data protection, and integration testing with Miniflare and vitest-pool-workers for Workers runtime features like AsyncLocalStorage and environment bindings.

## Decision Tree

### Need to test logger behavior?

**When**: Verifying base field inclusion, redaction, and log level suppression
**Go to**: [references/logger-unit-tests.md](./references/logger-unit-tests.md)

### Need to test redaction functions?

**When**: Validating PII and secret pattern detection, field redaction, and URL sanitization
**Go to**: [references/redaction-tests.md](./references/redaction-tests.md)

### Need to test Workers runtime integration?

**When**: Testing AsyncLocalStorage context, console.log capture, or environment bindings
**Go to**: [references/miniflare-integration.md](./references/miniflare-integration.md)

## Quick Example

```typescript
// src/infrastructure/logging/safeLogger.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SafeLogger } from './safeLogger';

describe('SafeLogger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('includes all base fields in log output', () => {
    const logger = new SafeLogger(
      {
        request_id: 'req-123',
        service: 'test-service',
        environment: 'test',
        version: '1.0.0',
        level: 'info',
        event: '',
        category: 'application',
        timestamp: '2025-01-01T00:00:00Z',
      },
      false
    );

    logger.info({ event: 'test.event' });

    expect(consoleSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);

    expect(logged.request_id).toBe('req-123');
    expect(logged.service).toBe('test-service');
    expect(logged.event).toBe('test.event');
    expect(logged.level).toBe('info');
  });
});
```

## Cross-References

- **[typescript-unit-testing](../typescript-unit-testing/SKILL.md)**: General unit testing principles and patterns for TypeScript code
- **[vitest-cloudflare-config](../vitest-cloudflare-config/SKILL.md)**: Configure vitest-pool-workers for runtime-accurate Workers testing

## Reference Files

- [references/logger-unit-tests.md](./references/logger-unit-tests.md) - Logger behavior tests with console.log mocking and base field validation
- [references/redaction-tests.md](./references/redaction-tests.md) - Comprehensive redaction pattern testing for PII and secrets
- [references/miniflare-integration.md](./references/miniflare-integration.md) - Workers runtime integration testing with AsyncLocalStorage
