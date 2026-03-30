import { describe, expect, it } from 'vitest';

import type { RandomPort, Rng } from './RandomSource.js';

describe('RandomSource re-exports', () => {
  it('re-exports RandomPort from domain layer', () => {
    const stub: RandomPort = {
      seedToInt: (_seed: string): Promise<number> => Promise.resolve(42),
      createRng: (_seed: number): Rng => ({ next: (): number => 0.5 }),
    };
    expect(stub).toBeDefined();
  });
});
