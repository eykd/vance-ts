/**
 * Tests for the galaxy seeder CLI entry point.
 *
 * @module index.spec
 */

import { main } from './index.js';

describe('main', () => {
  it('should export a main function that returns a promise resolving to a number', async () => {
    const result = await main([]);
    expect(typeof result).toBe('number');
  });
});
