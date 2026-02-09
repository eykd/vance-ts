import { SystemTimeProvider } from './SystemTimeProvider';

describe('SystemTimeProvider', () => {
  it('returns a number close to Date.now()', () => {
    const provider = new SystemTimeProvider();
    const before = Date.now();
    const result = provider.now();
    const after = Date.now();

    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });
});
