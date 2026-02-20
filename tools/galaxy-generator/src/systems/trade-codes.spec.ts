import type {
  CivilizationData,
  PlanetaryData,
  TerRating,
} from '../../../../src/domain/galaxy/types';

import { deriveTradeCodes, type TradeCodeInput } from './trade-codes';

/**
 * Creates a default TradeCodeInput for testing.
 *
 * @param overrides - partial input to merge
 * @returns complete TradeCodeInput
 */
function makeInput(overrides: Partial<TradeCodeInput> = {}): TradeCodeInput {
  const defaults: TradeCodeInput = {
    attributes: { technology: 0, environment: 0, resources: 0 },
    planetary: { size: 5, atmosphere: 5, temperature: 7, hydrography: 5 },
    civilization: {
      population: 5,
      starport: 3,
      government: 4,
      factions: 2,
      lawLevel: 3,
    },
  };

  return {
    attributes: { ...defaults.attributes, ...overrides.attributes },
    planetary: { ...defaults.planetary, ...overrides.planetary },
    civilization: { ...defaults.civilization, ...overrides.civilization },
  };
}

/**
 * Creates input with specific attribute overrides for trade code testing.
 *
 * @param attrs - partial TerRating overrides
 * @param planet - partial PlanetaryData overrides
 * @param civ - partial CivilizationData overrides
 * @returns complete TradeCodeInput
 */
function makeTradeInput(
  attrs: Partial<TerRating> = {},
  planet: Partial<PlanetaryData> = {},
  civ: Partial<CivilizationData> = {}
): TradeCodeInput {
  return makeInput({
    attributes: attrs as TerRating,
    planetary: planet as PlanetaryData,
    civilization: civ as CivilizationData,
  });
}

describe('deriveTradeCodes', () => {
  it('returns a readonly string array', () => {
    const result = deriveTradeCodes(makeInput());

    expect(Array.isArray(result)).toBe(true);
  });

  it('is deterministic with the same input', () => {
    const input = makeInput();

    const result1 = deriveTradeCodes(input);
    const result2 = deriveTradeCodes(input);

    expect(result1).toEqual(result2);
  });

  it('returns trade codes in alphabetical order', () => {
    const input = makeInput();
    const result = deriveTradeCodes(input);

    const sorted = [...result].sort();
    expect(result).toEqual(sorted);
  });

  describe('Agricultural (Ag)', () => {
    it('assigns Ag when atmosphere 4-9, hydrography 4-8, population 5-7', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 6, hydrography: 6 }, { population: 6 })
      );
      expect(result).toContain('Ag');
    });

    it('does not assign Ag when atmosphere < 4', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 3, hydrography: 6 }, { population: 6 })
      );
      expect(result).not.toContain('Ag');
    });

    it('does not assign Ag when atmosphere > 9', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 10, hydrography: 6 }, { population: 6 })
      );
      expect(result).not.toContain('Ag');
    });

    it('does not assign Ag when hydrography < 4', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 6, hydrography: 3 }, { population: 6 })
      );
      expect(result).not.toContain('Ag');
    });

    it('does not assign Ag when hydrography > 8', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 6, hydrography: 9 }, { population: 6 })
      );
      expect(result).not.toContain('Ag');
    });

    it('does not assign Ag when population < 5', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 6, hydrography: 6 }, { population: 4 })
      );
      expect(result).not.toContain('Ag');
    });

    it('does not assign Ag when population > 7', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 6, hydrography: 6 }, { population: 8 })
      );
      expect(result).not.toContain('Ag');
    });

    it('assigns Ag at boundary: atmosphere 4, hydrography 4, population 5', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 4, hydrography: 4 }, { population: 5 })
      );
      expect(result).toContain('Ag');
    });

    it('assigns Ag at boundary: atmosphere 9, hydrography 8, population 7', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 9, hydrography: 8 }, { population: 7 })
      );
      expect(result).toContain('Ag');
    });
  });

  describe('Asteroid (As)', () => {
    it('assigns As when size 0, atmosphere 0, hydrography 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 0, atmosphere: 0, hydrography: 0 })
      );
      expect(result).toContain('As');
    });

    it('does not assign As when size > 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 1, atmosphere: 0, hydrography: 0 })
      );
      expect(result).not.toContain('As');
    });

    it('does not assign As when atmosphere > 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 0, atmosphere: 1, hydrography: 0 })
      );
      expect(result).not.toContain('As');
    });

    it('does not assign As when hydrography > 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 0, atmosphere: 0, hydrography: 1 })
      );
      expect(result).not.toContain('As');
    });
  });

  describe('Barren (Ba)', () => {
    it('assigns Ba when population 0, government 0, lawLevel 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, {}, { population: 0, government: 0, lawLevel: 0 })
      );
      expect(result).toContain('Ba');
    });

    it('does not assign Ba when population > 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, {}, { population: 1, government: 0, lawLevel: 0 })
      );
      expect(result).not.toContain('Ba');
    });

    it('does not assign Ba when government > 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, {}, { population: 0, government: 1, lawLevel: 0 })
      );
      expect(result).not.toContain('Ba');
    });

    it('does not assign Ba when lawLevel > 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, {}, { population: 0, government: 0, lawLevel: 1 })
      );
      expect(result).not.toContain('Ba');
    });
  });

  describe('Desert (De)', () => {
    it('assigns De when atmosphere >= 2 and hydrography 0', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 4, hydrography: 0 }));
      expect(result).toContain('De');
    });

    it('does not assign De when atmosphere < 2', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 1, hydrography: 0 }));
      expect(result).not.toContain('De');
    });

    it('does not assign De when hydrography > 0', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 4, hydrography: 1 }));
      expect(result).not.toContain('De');
    });

    it('assigns De at boundary: atmosphere 2, hydrography 0', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 2, hydrography: 0 }));
      expect(result).toContain('De');
    });
  });

  describe('Fluid (Fl)', () => {
    it('assigns Fl when atmosphere >= 10 and hydrography >= 1', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 10, hydrography: 3 }));
      expect(result).toContain('Fl');
    });

    it('does not assign Fl when atmosphere < 10', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 9, hydrography: 3 }));
      expect(result).not.toContain('Fl');
    });

    it('does not assign Fl when hydrography 0', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 10, hydrography: 0 }));
      expect(result).not.toContain('Fl');
    });
  });

  describe('Garden (Ga)', () => {
    it('assigns Ga when size 6-8, atmosphere 5-8, hydrography 5-7', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 7, atmosphere: 6, hydrography: 6 })
      );
      expect(result).toContain('Ga');
    });

    it('does not assign Ga when size < 6', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 5, atmosphere: 6, hydrography: 6 })
      );
      expect(result).not.toContain('Ga');
    });

    it('does not assign Ga when size > 8', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 9, atmosphere: 6, hydrography: 6 })
      );
      expect(result).not.toContain('Ga');
    });

    it('does not assign Ga when atmosphere < 5', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 7, atmosphere: 4, hydrography: 6 })
      );
      expect(result).not.toContain('Ga');
    });

    it('does not assign Ga when atmosphere > 8', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 7, atmosphere: 9, hydrography: 6 })
      );
      expect(result).not.toContain('Ga');
    });

    it('does not assign Ga when hydrography < 5', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 7, atmosphere: 6, hydrography: 4 })
      );
      expect(result).not.toContain('Ga');
    });

    it('does not assign Ga when hydrography > 7', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 7, atmosphere: 6, hydrography: 8 })
      );
      expect(result).not.toContain('Ga');
    });

    it('assigns Ga at boundary: size 6, atmosphere 5, hydrography 5', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 6, atmosphere: 5, hydrography: 5 })
      );
      expect(result).toContain('Ga');
    });

    it('assigns Ga at boundary: size 8, atmosphere 8, hydrography 7', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 8, atmosphere: 8, hydrography: 7 })
      );
      expect(result).toContain('Ga');
    });
  });

  describe('High Population (Hi)', () => {
    it('assigns Hi when population >= 9', () => {
      const result = deriveTradeCodes(makeTradeInput({}, {}, { population: 9 }));
      expect(result).toContain('Hi');
    });

    it('does not assign Hi when population < 9', () => {
      const result = deriveTradeCodes(makeTradeInput({}, {}, { population: 8 }));
      expect(result).not.toContain('Hi');
    });
  });

  describe('High Tech (Ht)', () => {
    it('assigns Ht when technology >= 3', () => {
      const result = deriveTradeCodes(makeTradeInput({ technology: 3 }));
      expect(result).toContain('Ht');
    });

    it('does not assign Ht when technology < 3', () => {
      const result = deriveTradeCodes(makeTradeInput({ technology: 2 }));
      expect(result).not.toContain('Ht');
    });

    it('assigns Ht when technology is 4', () => {
      const result = deriveTradeCodes(makeTradeInput({ technology: 4 }));
      expect(result).toContain('Ht');
    });
  });

  describe('Ice-Capped (Ic)', () => {
    it('assigns Ic when atmosphere 0-1 and hydrography >= 1', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 0, hydrography: 3 }));
      expect(result).toContain('Ic');
    });

    it('assigns Ic when atmosphere 1 and hydrography >= 1', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 1, hydrography: 2 }));
      expect(result).toContain('Ic');
    });

    it('does not assign Ic when atmosphere >= 2', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 2, hydrography: 3 }));
      expect(result).not.toContain('Ic');
    });

    it('does not assign Ic when hydrography 0', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 0, hydrography: 0 }));
      expect(result).not.toContain('Ic');
    });
  });

  describe('Industrial (In)', () => {
    it('assigns In when atmosphere in {0,1,2,4,7,9+} and population >= 9', () => {
      for (const atm of [0, 1, 2, 4, 7, 9, 10, 11]) {
        const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: atm }, { population: 9 }));
        expect(result).toContain('In');
      }
    });

    it('does not assign In when atmosphere is 3, 5, 6, or 8', () => {
      for (const atm of [3, 5, 6, 8]) {
        const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: atm }, { population: 9 }));
        expect(result).not.toContain('In');
      }
    });

    it('does not assign In when population < 9', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 0 }, { population: 8 }));
      expect(result).not.toContain('In');
    });
  });

  describe('Low Population (Lo)', () => {
    it('assigns Lo when population 1-3', () => {
      for (const pop of [1, 2, 3]) {
        const result = deriveTradeCodes(makeTradeInput({}, {}, { population: pop }));
        expect(result).toContain('Lo');
      }
    });

    it('does not assign Lo when population 0', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, {}, { population: 0, government: 0, lawLevel: 0 })
      );
      expect(result).not.toContain('Lo');
    });

    it('does not assign Lo when population >= 4', () => {
      const result = deriveTradeCodes(makeTradeInput({}, {}, { population: 4 }));
      expect(result).not.toContain('Lo');
    });
  });

  describe('Low Tech (Lt)', () => {
    it('assigns Lt when technology <= -3', () => {
      const result = deriveTradeCodes(makeTradeInput({ technology: -3 }));
      expect(result).toContain('Lt');
    });

    it('does not assign Lt when technology > -3', () => {
      const result = deriveTradeCodes(makeTradeInput({ technology: -2 }));
      expect(result).not.toContain('Lt');
    });

    it('assigns Lt when technology is -4', () => {
      const result = deriveTradeCodes(makeTradeInput({ technology: -4 }));
      expect(result).toContain('Lt');
    });
  });

  describe('Non-Agricultural (Na)', () => {
    it('assigns Na when atmosphere 0-3, hydrography 0-3, population >= 6', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 2, hydrography: 2 }, { population: 7 })
      );
      expect(result).toContain('Na');
    });

    it('does not assign Na when atmosphere > 3', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 4, hydrography: 2 }, { population: 7 })
      );
      expect(result).not.toContain('Na');
    });

    it('does not assign Na when hydrography > 3', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 2, hydrography: 4 }, { population: 7 })
      );
      expect(result).not.toContain('Na');
    });

    it('does not assign Na when population < 6', () => {
      const result = deriveTradeCodes(
        makeTradeInput({}, { atmosphere: 2, hydrography: 2 }, { population: 5 })
      );
      expect(result).not.toContain('Na');
    });
  });

  describe('Non-Industrial (Ni)', () => {
    it('assigns Ni when population 4-6', () => {
      for (const pop of [4, 5, 6]) {
        const result = deriveTradeCodes(makeTradeInput({}, {}, { population: pop }));
        expect(result).toContain('Ni');
      }
    });

    it('does not assign Ni when population < 4', () => {
      const result = deriveTradeCodes(makeTradeInput({}, {}, { population: 3 }));
      expect(result).not.toContain('Ni');
    });

    it('does not assign Ni when population > 6', () => {
      const result = deriveTradeCodes(makeTradeInput({}, {}, { population: 7 }));
      expect(result).not.toContain('Ni');
    });
  });

  describe('Poor (Po)', () => {
    it('assigns Po when atmosphere 2-5, hydrography 0-3', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 3, hydrography: 2 }));
      expect(result).toContain('Po');
    });

    it('does not assign Po when atmosphere < 2', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 1, hydrography: 2 }));
      expect(result).not.toContain('Po');
    });

    it('does not assign Po when atmosphere > 5', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 6, hydrography: 2 }));
      expect(result).not.toContain('Po');
    });

    it('does not assign Po when hydrography > 3', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 3, hydrography: 4 }));
      expect(result).not.toContain('Po');
    });

    it('assigns Po at boundary: atmosphere 2, hydrography 0', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 2, hydrography: 0 }));
      expect(result).toContain('Po');
    });

    it('assigns Po at boundary: atmosphere 5, hydrography 3', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 5, hydrography: 3 }));
      expect(result).toContain('Po');
    });
  });

  describe('Rich (Ri)', () => {
    it('assigns Ri when atmosphere 6-8, population 6-8', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 7 }, { population: 7 }));
      expect(result).toContain('Ri');
    });

    it('does not assign Ri when atmosphere < 6', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 5 }, { population: 7 }));
      expect(result).not.toContain('Ri');
    });

    it('does not assign Ri when atmosphere > 8', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 9 }, { population: 7 }));
      expect(result).not.toContain('Ri');
    });

    it('does not assign Ri when population < 6', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 7 }, { population: 5 }));
      expect(result).not.toContain('Ri');
    });

    it('does not assign Ri when population > 8', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 7 }, { population: 9 }));
      expect(result).not.toContain('Ri');
    });

    it('assigns Ri at boundary: atmosphere 6, population 6', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 6 }, { population: 6 }));
      expect(result).toContain('Ri');
    });

    it('assigns Ri at boundary: atmosphere 8, population 8', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 8 }, { population: 8 }));
      expect(result).toContain('Ri');
    });
  });

  describe('Vacuum (Va)', () => {
    it('assigns Va when atmosphere 0', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 0 }));
      expect(result).toContain('Va');
    });

    it('does not assign Va when atmosphere > 0', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { atmosphere: 1 }));
      expect(result).not.toContain('Va');
    });
  });

  describe('Water World (Wa)', () => {
    it('assigns Wa when hydrography >= 10', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { hydrography: 10 }));
      expect(result).toContain('Wa');
    });

    it('does not assign Wa when hydrography < 10', () => {
      const result = deriveTradeCodes(makeTradeInput({}, { hydrography: 9 }));
      expect(result).not.toContain('Wa');
    });
  });

  describe('uninhabited systems', () => {
    it('assigns Ba for uninhabited systems with zero government and law', () => {
      const result = deriveTradeCodes(
        makeTradeInput(
          {},
          { size: 5, atmosphere: 5, hydrography: 5 },
          { population: 0, starport: 0, government: 0, factions: 0, lawLevel: 0 }
        )
      );
      expect(result).toContain('Ba');
    });

    it('can still assign planetary trade codes for uninhabited systems', () => {
      const result = deriveTradeCodes(
        makeTradeInput(
          {},
          { size: 0, atmosphere: 0, hydrography: 0 },
          { population: 0, starport: 0, government: 0, factions: 0, lawLevel: 0 }
        )
      );
      expect(result).toContain('As');
      expect(result).toContain('Ba');
      expect(result).toContain('Va');
    });

    it('assigns Va for uninhabited vacuum world', () => {
      const result = deriveTradeCodes(
        makeTradeInput(
          {},
          { atmosphere: 0, hydrography: 0 },
          { population: 0, starport: 0, government: 0, factions: 0, lawLevel: 0 }
        )
      );
      expect(result).toContain('Va');
    });
  });

  describe('multiple trade codes', () => {
    it('can assign multiple trade codes simultaneously', () => {
      // Garden + Rich + Agricultural + Ni
      const result = deriveTradeCodes(
        makeTradeInput({}, { size: 7, atmosphere: 6, hydrography: 6 }, { population: 6 })
      );
      expect(result).toContain('Ag');
      expect(result).toContain('Ga');
      expect(result).toContain('Ni');
      expect(result).toContain('Ri');
    });

    it('returns empty array when no trade codes apply', () => {
      // Carefully crafted to avoid all trade codes:
      // atmosphere 6 avoids: As, Va, Ic, De, Po, Na, Fl
      // hydrography 4 avoids: Wa, Ga (needs 5-7), Ag (pop too high)
      // population 8 avoids: Ba, Lo, Ni, Hi, Ri (atm 6 but pop must be 6-8 - need atm 9)
      // size 5 avoids: As, Ga
      // technology 0 avoids: Ht, Lt
      // atmosphere 9 + pop 8: not Ag (pop > 7), not In (pop < 9), not Ri (atm > 8)
      const result = deriveTradeCodes(
        makeTradeInput(
          { technology: 0 },
          { size: 5, atmosphere: 9, temperature: 7, hydrography: 4 },
          { population: 8, starport: 3, government: 4, factions: 2, lawLevel: 3 }
        )
      );
      expect(result).toEqual([]);
    });
  });

  describe('no duplicate trade codes', () => {
    it('never returns duplicate codes', () => {
      const result = deriveTradeCodes(
        makeTradeInput(
          { technology: 4 },
          { size: 0, atmosphere: 0, hydrography: 0 },
          { population: 0, starport: 0, government: 0, factions: 0, lawLevel: 0 }
        )
      );
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });
});
