import { describe, expect, it, vi } from 'vitest';

import { stubStarSystem } from '../../../tests/fixtures/stubStarSystem';

import type { TradePairPartner, TradePairRepository } from './TradePairRepository';

/**
 * Creates a typed stub of TradePairRepository with vi.fn() defaults.
 *
 * @param overrides - Partial overrides for specific methods.
 * @returns A fully typed TradePairRepository stub.
 */
function createStub(overrides: Partial<TradePairRepository> = {}): TradePairRepository {
  return {
    findTradePartners: vi.fn<TradePairRepository['findTradePartners']>(),
    ...overrides,
  };
}

/**
 * Contract tests for the TradePairRepository port.
 *
 * Verifies the interface shape can be satisfied by test doubles.
 * Adapter tests (D1TradePairRepository) live in src/infrastructure/.
 */
describe('TradePairRepository port', () => {
  // The TradePairRepository and TradePairPartner type imports above serve as
  // compile-time checks that the module exports the interfaces correctly.

  describe('interface contract', () => {
    it('findTradePartners returns partner systems with BTN values ordered by descending BTN', async () => {
      const partners: readonly TradePairPartner[] = [
        { system: stubStarSystem({ id: 'alpha-001', name: 'Alpha Centauri' }), btn: 8.5, hops: 1 },
        { system: stubStarSystem({ id: 'beta-001', name: 'Beta Hydri' }), btn: 6.2, hops: 2 },
      ];
      const findFn = vi.fn<TradePairRepository['findTradePartners']>().mockResolvedValue(partners);
      const stub = createStub({ findTradePartners: findFn });

      const result = await stub.findTradePartners('sol-001');

      expect(result).toBe(partners);
      expect(findFn).toHaveBeenCalledWith('sol-001');
    });

    it('findTradePartners returns empty array for isolated systems', async () => {
      const stub = createStub({
        findTradePartners: vi.fn<TradePairRepository['findTradePartners']>().mockResolvedValue([]),
      });

      const result = await stub.findTradePartners('isolated-001');

      expect(result).toEqual([]);
    });
  });
});
