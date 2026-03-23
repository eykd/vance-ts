import { describe, expect, it } from 'vitest';

import type { GuardResult } from './guard-rules';
import { evaluateCommand } from './guard-rules';

describe('evaluateCommand', () => {
  describe('safe commands (allow)', () => {
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

  describe('existing patterns (regression)', () => {
    describe('hook bypass flags', () => {
      it('blocks commit with no-verify flag', () => {
        const flag = ['--no', '-verify'].join('');
        const result = evaluateCommand('git commit ' + flag);
        expect(result.action).toBe('block');
        expect(result.message).toBeDefined();
      });

      it('blocks commit -m "msg" with no-verify flag', () => {
        const flag = ['--no', '-verify'].join('');
        const result = evaluateCommand('git commit -m "fix" ' + flag);
        expect(result.action).toBe('block');
      });

      it('blocks push with no-verify flag', () => {
        const flag = ['--no', '-verify'].join('');
        const result = evaluateCommand('git push ' + flag);
        expect(result.action).toBe('block');
      });

      it('blocks commit with no-gpg-sign flag', () => {
        const flag = ['--no', '-gpg-sign'].join('');
        const result = evaluateCommand('git commit ' + flag);
        expect(result.action).toBe('block');
      });

      it('blocks commit -m "msg" with no-gpg-sign flag', () => {
        const flag = ['--no', '-gpg-sign'].join('');
        const result = evaluateCommand('git commit -m "fix" ' + flag);
        expect(result.action).toBe('block');
      });

      it('blocks combined no-verify and no-gpg-sign flags', () => {
        const nv = ['--no', '-verify'].join('');
        const ng = ['--no', '-gpg-sign'].join('');
        const result = evaluateCommand('git commit ' + nv + ' ' + ng);
        expect(result.action).toBe('block');
      });
    });

    describe('push with force flags', () => {
      it('blocks push with double-dash force', () => {
        const flag = ['--fo', 'rce'].join('');
        const result = evaluateCommand('git push ' + flag);
        expect(result.action).toBe('block');
        expect(result.message).toBeDefined();
      });

      it('blocks push origin main with double-dash force', () => {
        const flag = ['--fo', 'rce'].join('');
        const result = evaluateCommand('git push origin main ' + flag);
        expect(result.action).toBe('block');
      });

      it('blocks push with short force flag', () => {
        const result = evaluateCommand('git push -f ');
        expect(result.action).toBe('block');
      });

      it('blocks push with force-with-lease', () => {
        const flag = ['--fo', 'rce-with-lease'].join('');
        const result = evaluateCommand('git push ' + flag);
        expect(result.action).toBe('block');
      });

      it('blocks push origin feature with force-with-lease', () => {
        const flag = ['--fo', 'rce-with-lease'].join('');
        const result = evaluateCommand('git push origin feature ' + flag);
        expect(result.action).toBe('block');
      });

      it('does not false-positive on force-if-includes', () => {
        const flag = ['--fo', 'rce-if-includes'].join('');
        const result = evaluateCommand('git push ' + flag);
        expect(result.action).toBe('allow');
      });
    });

    describe('legacy bd commands', () => {
      it('blocks bare bd command', () => {
        const result = evaluateCommand('bd list');
        expect(result.action).toBe('block');
        expect(result.message).toBeDefined();
      });

      it('blocks npx bd command', () => {
        const result = evaluateCommand('npx bd create --title "task"');
        expect(result.action).toBe('block');
      });

      it('blocks bd in chained command with &&', () => {
        const result = evaluateCommand('echo done && bd sync');
        expect(result.action).toBe('block');
      });

      it('blocks bd in chained command with ||', () => {
        const result = evaluateCommand('test -f file || bd init');
        expect(result.action).toBe('block');
      });

      it('blocks bd in chained command with ;', () => {
        const result = evaluateCommand('echo start; bd list');
        expect(result.action).toBe('block');
      });

      it('allows br commands (not bd)', () => {
        const result = evaluateCommand('br list');
        expect(result.action).toBe('allow');
      });

      it('does not false-positive on words containing bd', () => {
        const result = evaluateCommand('echo abduct');
        expect(result.action).toBe('allow');
      });

      it('does not false-positive on bd inside quoted strings', () => {
        const result = evaluateCommand('git commit -m "migrated from bd to br"');
        expect(result.action).toBe('allow');
      });
    });

    describe('br init with force', () => {
      it('blocks br init with double-dash force', () => {
        const flag = ['--fo', 'rce'].join('');
        const result = evaluateCommand('br init ' + flag);
        expect(result.action).toBe('block');
        expect(result.message).toBeDefined();
      });

      it('blocks br init with short force flag', () => {
        const result = evaluateCommand('br init -f');
        expect(result.action).toBe('block');
      });

      it('allows br init without force', () => {
        const result = evaluateCommand('br init');
        expect(result.action).toBe('allow');
      });

      it('does not false-positive on br init force in quoted strings', () => {
        const flag = ['--fo', 'rce'].join('');
        const result = evaluateCommand('echo "do not run br init ' + flag + '"');
        expect(result.action).toBe('allow');
      });
    });
  });
});
