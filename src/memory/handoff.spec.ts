import { existsSync, readdirSync, rmdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

import { Handoff } from './handoff';

describe('Handoff', () => {
  const testHandoffsDir = join(__dirname, '../../thoughts/handoffs');

  afterEach(() => {
    // Clean up test files
    const testSessionDir = join(testHandoffsDir, 'test-session');
    if (existsSync(testSessionDir)) {
      const files = readdirSync(testSessionDir);
      files.forEach((file: string) => {
        unlinkSync(join(testSessionDir, file));
      });
      rmdirSync(testSessionDir);
    }
  });

  describe('constructor', () => {
    test('creates handoff with session id', () => {
      const handoff = new Handoff('test-session-123');

      expect(handoff.sessionId).toBe('test-session-123');
      expect(handoff.outcome).toBe('PARTIAL_PLUS');
      expect(handoff.contextSummary).toBe('');
      expect(handoff.recentChanges).toEqual([]);
      expect(handoff.whatWorked).toEqual([]);
      expect(handoff.whatFailed).toEqual([]);
      expect(handoff.patternsDiscovered).toEqual([]);
      expect(handoff.nextSteps).toEqual([]);
      expect(handoff.openQuestions).toEqual([]);
    });
  });

  describe('toMarkdown', () => {
    test('converts handoff to markdown format with frontmatter', () => {
      const handoff = new Handoff('test-session-123');
      handoff.outcome = 'SUCCESS';
      handoff.contextSummary = 'Implemented authentication';
      handoff.recentChanges = ['src/auth.ts: Added OAuth'];
      handoff.whatWorked = ['JWT strategy'];
      handoff.whatFailed = ['Session storage failed'];
      handoff.patternsDiscovered = ['Use server components'];
      handoff.nextSteps = ['Add role-based access'];
      handoff.openQuestions = ['How to handle token refresh?'];

      const markdown = handoff.toMarkdown();

      expect(markdown).toContain('---');
      expect(markdown).toContain('session_id: test-session-123');
      expect(markdown).toContain('outcome: SUCCESS');
      expect(markdown).toContain('# Session Handoff');
      expect(markdown).toContain('## Context Summary');
      expect(markdown).toContain('Implemented authentication');
      expect(markdown).toContain('## Recent Changes');
      expect(markdown).toContain('- src/auth.ts: Added OAuth');
      expect(markdown).toContain('## What Worked');
      expect(markdown).toContain('- JWT strategy');
      expect(markdown).toContain('## What Failed / Blockers');
      expect(markdown).toContain('- Session storage failed');
      expect(markdown).toContain('## Patterns Discovered');
      expect(markdown).toContain('- Use server components');
      expect(markdown).toContain('## Next Steps');
      expect(markdown).toContain('- Add role-based access');
      expect(markdown).toContain('## Open Questions');
      expect(markdown).toContain('- How to handle token refresh?');
    });
  });

  describe('save', () => {
    test('saves handoff to file in session directory', () => {
      const handoff = new Handoff('test-session');
      handoff.contextSummary = 'Test handoff';

      handoff.save();

      const sessionDir = join(testHandoffsDir, 'test-session');
      expect(existsSync(sessionDir)).toBe(true);

      const files = readdirSync(sessionDir);
      expect(files.length).toBe(1);
      expect(files[0] ?? '').toMatch(/^handoff-\d{4}-\d{2}-\d{2}T.+\.md$/);

      const firstFile = files[0];
      if (firstFile === undefined) {
        throw new Error('No files found');
      }
      const content = readFileSync(join(sessionDir, firstFile), 'utf-8');
      expect(content).toContain('session_id: test-session');
      expect(content).toContain('Test handoff');
    });
  });
});
