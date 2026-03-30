import { describe, expect, it } from 'vitest';

import type { RandomPort } from './randomPort.js';
import type { Rng } from './selectionModes.js';

describe('RandomPort', () => {
  /**
   * Inline stub implementing RandomPort with deterministic behavior.
   *
   * @returns A RandomPort with predictable outputs for testing.
   */
  function createStub(): RandomPort {
    return {
      seedToInt(_seed: string): Promise<number> {
        return Promise.resolve(42);
      },
      createRng(seed: number): Rng {
        let state = seed;
        return {
          next(): number {
            state = (state + 1) % 100;
            return state / 100;
          },
        };
      },
    };
  }

  it('should be implementable with seedToInt and createRng', () => {
    const port: RandomPort = createStub();
    expect(port).toBeDefined();
  });

  it('seedToInt returns a Promise<number>', async () => {
    const port = createStub();
    const result = await port.seedToInt('test-seed');
    expect(typeof result).toBe('number');
  });

  it('createRng returns an Rng with next method', () => {
    const port = createStub();
    const rng: Rng = port.createRng(12345);
    const value = rng.next();
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  it('Rng.next advances state on each call', () => {
    const port = createStub();
    const rng = port.createRng(0);
    const first = rng.next();
    const second = rng.next();
    expect(first).not.toBe(second);
  });
});
