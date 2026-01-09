import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

import { ArtifactIndex } from './artifact-index';

describe('ArtifactIndex', () => {
  const testDbPath = join(__dirname, '../../thoughts/test-artifacts.db');

  beforeEach(() => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('constructor', () => {
    test('creates database with FTS5 table', () => {
      const index = new ArtifactIndex(testDbPath);

      expect(existsSync(testDbPath)).toBe(true);
      index.close();
    });
  });

  describe('indexHandoff', () => {
    test('indexes handoff content for full-text search', () => {
      const index = new ArtifactIndex(testDbPath);

      const handoffPath = 'thoughts/handoffs/test-session/handoff-2026-01-09.md';
      const content = `---
session_id: test-session-123
created: 2026-01-09T12:00:00Z
outcome: SUCCESS
---

# Session Handoff

## Context Summary
Implemented OAuth authentication

## Recent Changes
- src/auth.ts: Added OAuth provider

## What Worked
- JWT strategy worked well

## What Failed / Blockers
- Session storage failed

## Patterns Discovered
- Use server components for auth

## Next Steps
- Add role-based access control

## Open Questions
- How to handle token refresh?`;

      index.indexHandoff(handoffPath, content);

      const results = index.search('OAuth authentication');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.path).toBe(handoffPath);

      index.close();
    });
  });

  describe('search', () => {
    test('returns ranked results for query', () => {
      const index = new ArtifactIndex(testDbPath);

      index.indexHandoff(
        'thoughts/handoffs/session1/handoff.md',
        'Implemented authentication with OAuth'
      );
      index.indexHandoff('thoughts/handoffs/session2/handoff.md', 'Fixed authentication bug');
      index.indexHandoff('thoughts/handoffs/session3/handoff.md', 'Added user management');

      const results = index.search('authentication');
      expect(results.length).toBe(2);
      expect(results[0]?.path).toContain('session');

      index.close();
    });

    test('returns empty array for no matches', () => {
      const index = new ArtifactIndex(testDbPath);

      index.indexHandoff('thoughts/handoffs/session1/handoff.md', 'Implemented feature X');

      const results = index.search('nonexistent query');
      expect(results.length).toBe(0);

      index.close();
    });
  });
});
