import { describe, expect, it } from 'vitest';

import { deserializeIR, serializeIR } from './ir.js';
import type { Feature } from './types.js';

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

  it('throws for JSON that does not match Feature shape', () => {
    expect(() => deserializeIR('{"foo":1}')).toThrow('Invalid IR');
  });

  it('throws for null JSON', () => {
    expect(() => deserializeIR('null')).toThrow('Invalid IR');
  });

  it('throws when sourceFile is a string but scenarios is not an array', () => {
    expect(() => deserializeIR('{"sourceFile":"x","scenarios":"bad"}')).toThrow('Invalid IR');
  });

  it('throws for non-object JSON', () => {
    expect(() => deserializeIR('"just a string"')).toThrow('Invalid IR');
  });
});
