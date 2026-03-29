import { describe, expect, it, vi } from 'vitest';

import type { Logger } from './Logger';

/**
 * Contract tests for the Logger port.
 *
 * Verifies the interface shape can be satisfied by test doubles.
 * Adapter tests (ConsoleLogger) live in src/infrastructure/ConsoleLogger.spec.ts.
 */
describe('Logger port', () => {
  describe('interface contract', () => {
    it('can be satisfied by a test double that accepts message and cause', () => {
      const errorFn = vi.fn();
      const stub: Logger = { error: errorFn, info: vi.fn() };

      stub.error('something went wrong', new Error('cause'));

      expect(errorFn).toHaveBeenCalledWith('something went wrong', expect.any(Error));
    });

    it('can be satisfied by a test double that accepts message without cause', () => {
      const errorFn = vi.fn();
      const stub: Logger = { error: errorFn, info: vi.fn() };

      stub.error('something went wrong');

      expect(errorFn).toHaveBeenCalledWith('something went wrong');
    });

    it('can be satisfied by a test double that accepts an info message', () => {
      const infoFn = vi.fn();
      const stub: Logger = { error: vi.fn(), info: infoFn };

      stub.info('operation completed');

      expect(infoFn).toHaveBeenCalledWith('operation completed');
    });
  });
});
