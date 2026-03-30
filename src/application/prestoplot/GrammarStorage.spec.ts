import { describe, expect, it } from 'vitest';

import type { GrammarDto, StoragePort } from './GrammarStorage.js';

describe('GrammarStorage re-exports', () => {
  it('re-exports StoragePort from domain layer', () => {
    const stub: StoragePort = {
      load: (_key: string): Promise<GrammarDto | null> => Promise.resolve(null),
      save: (_key: string, _grammar: GrammarDto): Promise<void> => Promise.resolve(),
      delete: (_key: string): Promise<void> => Promise.resolve(),
      keys: (): Promise<readonly string[]> => Promise.resolve([]),
    };
    expect(stub).toBeDefined();
  });

  it('re-exports GrammarDto from domain layer', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'test',
      entry: 'main',
      includes: [],
      rules: {},
    };
    expect(dto.version).toBe(1);
  });
});
