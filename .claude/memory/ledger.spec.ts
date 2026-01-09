import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

import { Ledger } from './ledger';

describe('Ledger', () => {
  const testLedgersDir = join(__dirname, '../../thoughts/ledgers');

  afterEach(() => {
    // Clean up test files
    const testFile = join(testLedgersDir, 'CONTINUITY_CLAUDE-test-session.md');
    if (existsSync(testFile)) {
      unlinkSync(testFile);
    }
  });
  describe('constructor', () => {
    test('creates ledger with session name', () => {
      const ledger = new Ledger('test-session');

      expect(ledger.sessionName).toBe('test-session');
      expect(ledger.goal).toBe('');
      expect(ledger.constraints).toEqual([]);
      expect(ledger.completed).toEqual([]);
      expect(ledger.inProgress).toEqual([]);
      expect(ledger.keyDecisions).toEqual([]);
      expect(ledger.workingFiles).toEqual([]);
    });
  });

  describe('toMarkdown', () => {
    test('converts ledger to markdown format', () => {
      const ledger = new Ledger('test-session');
      ledger.goal = 'Implement authentication';
      ledger.constraints = ['Must use OAuth2'];
      ledger.completed = ['Set up database'];
      ledger.inProgress = ['Create login form'];
      ledger.keyDecisions = ['Using JWT tokens'];
      ledger.workingFiles = ['src/auth.ts'];

      const markdown = ledger.toMarkdown();

      expect(markdown).toContain('# Session Continuity Ledger');
      expect(markdown).toContain('## Current Goal');
      expect(markdown).toContain('Implement authentication');
      expect(markdown).toContain('## Constraints');
      expect(markdown).toContain('- Must use OAuth2');
      expect(markdown).toContain('## Completed');
      expect(markdown).toContain('- [x] Set up database');
      expect(markdown).toContain('## In Progress');
      expect(markdown).toContain('- [ ] Create login form');
      expect(markdown).toContain('## Key Decisions');
      expect(markdown).toContain('- Using JWT tokens');
      expect(markdown).toContain('## Working Files');
      expect(markdown).toContain('- src/auth.ts');
    });
  });

  describe('save', () => {
    test('saves ledger to file', () => {
      const ledger = new Ledger('test-session');
      ledger.goal = 'Test goal';

      ledger.save();

      const filePath = join(testLedgersDir, 'CONTINUITY_CLAUDE-test-session.md');
      expect(existsSync(filePath)).toBe(true);

      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain('# Session Continuity Ledger');
      expect(content).toContain('Test goal');
    });
  });

  describe('load', () => {
    test('loads ledger from file', () => {
      const filePath = join(testLedgersDir, 'CONTINUITY_CLAUDE-test-session.md');
      const markdown = `# Session Continuity Ledger

## Current Goal
Load test goal

## Constraints
- Test constraint

## Completed
- [x] Test completed task

## In Progress
- [ ] Test in-progress task

## Key Decisions
- Test decision

## Working Files
- test.ts`;

      writeFileSync(filePath, markdown);

      const ledger = Ledger.load('test-session');

      expect(ledger.sessionName).toBe('test-session');
      expect(ledger.goal).toBe('Load test goal');
      expect(ledger.constraints).toEqual(['Test constraint']);
      expect(ledger.completed).toEqual(['Test completed task']);
      expect(ledger.inProgress).toEqual(['Test in-progress task']);
      expect(ledger.keyDecisions).toEqual(['Test decision']);
      expect(ledger.workingFiles).toEqual(['test.ts']);
    });
  });
});
