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

    describe('destructive git operations', () => {
      describe('git reset --hard', () => {
        it('blocks git reset --hard with no trailing args', () => {
          const result = evaluateCommand('git reset --hard');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks git reset --hard with trailing ref', () => {
          const result = evaluateCommand('git reset --hard HEAD~3');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks git reset --hard with origin ref', () => {
          const result = evaluateCommand('git reset --hard origin/main');
          expect(result.action).toBe('block');
        });
      });

      describe('git checkout . (discard all changes)', () => {
        it('blocks git checkout .', () => {
          const result = evaluateCommand('git checkout .');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks git checkout -- .', () => {
          const result = evaluateCommand('git checkout -- .');
          expect(result.action).toBe('block');
        });

        it('blocks git checkout HEAD~1 -- . (S7 tree-ish)', () => {
          const result = evaluateCommand('git checkout HEAD~1 -- .');
          expect(result.action).toBe('block');
        });

        it('blocks git checkout main -- .', () => {
          const result = evaluateCommand('git checkout main -- .');
          expect(result.action).toBe('block');
        });

        it('blocks git checkout stash@{0} -- .', () => {
          const result = evaluateCommand('git checkout stash@{0} -- .');
          expect(result.action).toBe('block');
        });
      });

      describe('git restore . (discard all changes)', () => {
        it('blocks git restore .', () => {
          const result = evaluateCommand('git restore .');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks git restore . with trailing space', () => {
          const result = evaluateCommand('git restore . ');
          expect(result.action).toBe('block');
        });
      });

      describe('git clean with force flag (delete untracked)', () => {
        it('blocks git clean -f', () => {
          const result = evaluateCommand('git clean -f');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks git clean -fd', () => {
          const result = evaluateCommand('git clean -fd');
          expect(result.action).toBe('block');
        });

        it('blocks git clean -xfd', () => {
          const result = evaluateCommand('git clean -xfd');
          expect(result.action).toBe('block');
        });

        it('blocks git clean -f -d', () => {
          const result = evaluateCommand('git clean -f -d');
          expect(result.action).toBe('block');
        });
      });
    });

    describe('CLAUDE.md rule enforcement (--amend, --squash)', () => {
      it('blocks git commit --amend -m "fix"', () => {
        const result = evaluateCommand('git commit --amend -m "fix"');
        expect(result.action).toBe('block');
        expect(result.message).toContain('CLAUDE.md');
        expect(result.message).toContain('NEVER amend');
      });

      it('blocks git merge --squash feature', () => {
        const result = evaluateCommand('git merge --squash feature');
        expect(result.action).toBe('block');
        expect(result.message).toContain('CLAUDE.md');
        expect(result.message).toContain('NEVER squash-merge');
      });

      it('allows normal git commit -m "fix: something"', () => {
        const result = evaluateCommand('git commit -m "fix: something"');
        expect(result.action).toBe('allow');
      });

      it('allows commit message mentioning --amend (post-strip)', () => {
        const result = evaluateCommand('git commit -m "discussing --amend"');
        expect(result.action).toBe('allow');
      });
    });

    describe('catastrophic rm (file deletion)', () => {
      describe('combined flags with dangerous targets', () => {
        it('blocks rm -rf /', () => {
          const result = evaluateCommand('rm -rf /');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks rm -rf .', () => {
          const result = evaluateCommand('rm -rf .');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks rm -fr . (Fix 5: reversed flag order)', () => {
          const result = evaluateCommand('rm -fr .');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });
      });

      describe('S1: separated and long-form flags', () => {
        it('blocks rm with long-form recursive and force on /', () => {
          const flags = ['--recur', 'sive --fo', 'rce'].join('');
          const result = evaluateCommand('rm ' + flags + ' /');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks rm -r -f .', () => {
          const result = evaluateCommand('rm -r -f .');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });
      });

      describe('S2: target variations', () => {
        it('blocks rm -rf ./ (trailing slash on dot)', () => {
          const result = evaluateCommand('rm -rf ./');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks rm -rf ~/ (home directory)', () => {
          const result = evaluateCommand('rm -rf ~/');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks rm -rf ../ (parent directory)', () => {
          const result = evaluateCommand('rm -rf ../');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });

        it('blocks rm -rf $HOME (variable expansion)', () => {
          const result = evaluateCommand('rm -rf $HOME');
          expect(result.action).toBe('block');
          expect(result.message).toBeDefined();
        });
      });

      describe('safe targets (allow)', () => {
        it('allows rm -rf node_modules', () => {
          const result = evaluateCommand('rm -rf node_modules');
          expect(result.action).toBe('allow');
        });

        it('allows rm -rf dist', () => {
          const result = evaluateCommand('rm -rf dist');
          expect(result.action).toBe('allow');
        });
      });
    });
  });

  describe('safe pattern whitelists (no false positives)', () => {
    describe('git checkout safe patterns', () => {
      it('allows git checkout -b new-feature (branch creation)', () => {
        const result: GuardResult = evaluateCommand('git checkout -b new-feature');
        expect(result).toEqual({ action: 'allow' });
      });

      it('allows git checkout --orphan initial (orphan branch)', () => {
        const result: GuardResult = evaluateCommand('git checkout --orphan initial');
        expect(result).toEqual({ action: 'allow' });
      });

      it('allows git checkout feature-branch (branch switch)', () => {
        const result: GuardResult = evaluateCommand('git checkout feature-branch');
        expect(result).toEqual({ action: 'allow' });
      });
    });

    describe('git restore safe patterns', () => {
      it('allows git restore --staged file.ts (unstage file)', () => {
        const result: GuardResult = evaluateCommand('git restore --staged file.ts');
        expect(result).toEqual({ action: 'allow' });
      });
    });

    describe('git clean safe patterns', () => {
      it('allows git clean -n (dry run, short flag)', () => {
        const result: GuardResult = evaluateCommand('git clean -n');
        expect(result).toEqual({ action: 'allow' });
      });

      it('allows git clean --dry-run (dry run, long flag)', () => {
        const result: GuardResult = evaluateCommand('git clean --dry-run');
        expect(result).toEqual({ action: 'allow' });
      });
    });

    describe('git reset safe patterns', () => {
      it('allows git reset --soft HEAD~1 (soft reset)', () => {
        const result: GuardResult = evaluateCommand('git reset --soft HEAD~1');
        expect(result).toEqual({ action: 'allow' });
      });
    });

    describe('git branch safe patterns', () => {
      it('allows git branch -d merged-branch (safe delete)', () => {
        const result: GuardResult = evaluateCommand('git branch -d merged-branch');
        expect(result).toEqual({ action: 'allow' });
      });
    });
  });
});
