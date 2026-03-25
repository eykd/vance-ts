import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Logger } from '../application/ports/Logger';

import { ConsoleLogger } from './ConsoleLogger';

describe('ConsoleLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('implements the Logger port interface', () => {
    const logger: Logger = new ConsoleLogger();
    expect(logger).toBeDefined();
  });

  it('delegates error(message, cause) to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = new ConsoleLogger();
    const cause = new Error('boom');

    logger.error('something failed', cause);

    expect(spy).toHaveBeenCalledWith('something failed', cause);
  });

  it('delegates error(message) without cause to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = new ConsoleLogger();

    logger.error('something failed');

    expect(spy).toHaveBeenCalledWith('something failed', undefined);
  });

  it('delegates info(message) to console.info', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new ConsoleLogger();

    logger.info('operation completed');

    expect(spy).toHaveBeenCalledWith('operation completed');
  });
});
