import { describe, expect, it } from 'vitest';

import { deserializeIR, serializeIR } from './ir';
import type { Feature } from './types';

describe('serializeIR / deserializeIR', () => {
  it('round-trips a Feature with no scenarios', () => {
    const feature: Feature = { sourceFile: 'test.txt', scenarios: [] };
    const json = serializeIR(feature);
    const result = deserializeIR(json);
    expect(result).toEqual(feature);
  });

  it('round-trips a Feature with scenarios and steps', () => {
    const feature: Feature = {
      sourceFile: 'specs/US01.txt',
      scenarios: [
        {
          description: 'User does something.',
          line: 2,
          steps: [
            { keyword: 'GIVEN', text: 'state.', line: 3 },
            { keyword: 'WHEN', text: 'action.', line: 4 },
            { keyword: 'THEN', text: 'outcome.', line: 5 },
          ],
        },
      ],
    };
    const json = serializeIR(feature);
    const result = deserializeIR(json);
    expect(result).toEqual(feature);
  });

  it('serializeIR produces valid JSON', () => {
    const feature: Feature = { sourceFile: 'x.txt', scenarios: [] };
    const json = serializeIR(feature);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
