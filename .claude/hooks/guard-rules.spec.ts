import { describe, expect, it } from 'vitest';

import type { GuardResult } from './guard-rules';
import { evaluateCommand } from './guard-rules';

describe('evaluateCommand', () => {
  it('returns allow for empty command', () => {
    const result: GuardResult = evaluateCommand('');
    expect(result).toEqual({ action: 'allow' });
  });

  it('returns allow for a safe command', () => {
    const result: GuardResult = evaluateCommand('git status');
    expect(result).toEqual({ action: 'allow' });
  });

  it('returns allow for any arbitrary command', () => {
    const result: GuardResult = evaluateCommand('echo hello world');
    expect(result).toEqual({ action: 'allow' });
  });

  it('returns a GuardResult with action property', () => {
    const result = evaluateCommand('ls -la');
    expect(result).toHaveProperty('action');
    expect(result.action).toBe('allow');
  });

  it('does not include message when allowing', () => {
    const result = evaluateCommand('npm test');
    expect(result.message).toBeUndefined();
  });
});
