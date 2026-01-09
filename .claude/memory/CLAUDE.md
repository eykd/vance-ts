# Memory System Development Guide

This file provides guidance for Claude Code when working on the memory system harness code.

## Overview

The memory system is **Claude Code harness tooling** for cross-session continuity. It consists of three components:

1. **Ledger** (`ledger.ts`): Session state tracking for `/clear` operations
2. **Handoff** (`handoff.ts`): Detailed cross-session handoff documents
3. **ArtifactIndex** (`artifact-index.ts`): SQLite FTS5 full-text search over handoffs

## Development Standards

### Location

- All memory system code lives in `.claude/memory/`
- This is NOT application code - it's development tooling
- Dependencies should be in `devDependencies`

### Testing

- **100% test coverage required** for Ledger and Handoff
- ArtifactIndex tests exist but are Jest-incompatible (native modules)
- Manual testing for ArtifactIndex:
  ```bash
  npm run build
  node -e "const { ArtifactIndex } = require('./dist/.claude/memory/artifact-index.js'); const idx = new ArtifactIndex('test.db'); idx.indexHandoff('test.md', 'test content'); console.log('Results:', idx.search('test').length); idx.close();"
  ```

### TypeScript Configuration

- Uses `.claude/tsconfig.json` (extends root config)
- Compiled to `dist/.claude/memory/`
- Type definitions in `.claude/types/`

### Code Quality

Follow the same standards as application code:

- Strict TypeScript checking
- ESLint with explicit return types
- JSDoc on all public APIs
- TDD red-green-refactor workflow

## Testing Commands

```bash
# Run memory system tests only
npx jest .claude/memory

# Run with watch mode
npx jest .claude/memory --watch

# Full validation
npm run check
```

## Architecture Notes

### Ledger Design

- **Purpose**: Survive `/clear` with full state fidelity
- **Philosophy**: Clear (fresh context) > Compact (lossy compression)
- **Format**: Structured markdown with Goal/State/Decisions sections
- **Auto-loading**: SessionStart hook loads on resume

### Handoff Design

- **Purpose**: Cross-session continuity with rich context
- **Format**: YAML frontmatter + markdown body
- **Outcomes**: SUCCESS, PARTIAL_PLUS, PARTIAL, BLOCKED
- **Storage**: Timestamped files in `thoughts/handoffs/{session}/`

### ArtifactIndex Design

- **Purpose**: Semantic search across all handoff history
- **Technology**: SQLite FTS5 with Porter stemming
- **Indexing**: Incremental, happens at handoff creation
- **Query**: Ranked results by relevance

## Integration Points

### Hooks

- **session-start.ts**: Auto-loads ledgers from `thoughts/ledgers/`
- **pre-compact.ts**: Prevents lossy compaction without ledger save
- **user-prompt-submit.ts**: Context pressure warnings
- **status-line.ts**: Real-time context usage display

### File Locations

- **Ledgers**: `thoughts/ledgers/CONTINUITY_CLAUDE-{session}.md`
- **Handoffs**: `thoughts/handoffs/{session}/handoff-{timestamp}.md`
- **Index DB**: `thoughts/artifacts.db` (if used)

## Common Maintenance Tasks

### Adding New Ledger Fields

1. Update `Ledger` interface
2. Add to `toMarkdown()` method
3. Add to `load()` parsing logic
4. Write tests for new field
5. Update `.claude/memory/README.md`

### Changing Handoff Structure

1. Update `Handoff` interface
2. Modify `toMarkdown()` output format
3. Update any parsing logic if needed
4. Ensure backward compatibility if loading old handoffs
5. Write migration tests if breaking changes

### ArtifactIndex Schema Changes

1. Update FTS5 table creation
2. Handle migration for existing databases
3. Update `indexHandoff()` and `search()` methods
4. Test with real data manually (Jest incompatible)

## Remember

- This is tooling for Claude Code sessions, not application code
- Changes here affect the development workflow
- Test thoroughly - bugs here impact all future sessions
- Keep performance in mind - hooks run frequently
- Documentation updates go in `.claude/memory/README.md`
