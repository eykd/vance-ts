# Quickstart: Galaxy Generation Pipeline

**Feature**: 010-galaxy-generation
**Date**: 2026-02-16

## Prerequisites

- Node.js >= 22.0.0
- npm dependencies installed (`npm install`)

## Generate a Galaxy

```bash
# Using justfile
just generate-galaxy --seed my-seed-value

# Using npx directly
npx ts-node tools/galaxy-generator/src/index.ts --seed my-seed-value
```

## Output

Generated files appear in `./galaxy-output/` (configurable with `--output`):

```
galaxy-output/
  metadata.json      — Config + stats
  costmap.png        — Visual cost map
  costmap.bin        — Binary cost map for Workers
  routes.json        — Pre-computed Oikumene routes
  systems/           — One JSON per star system (~12,000 files)
```

## Development

### Run Tests

```bash
# All tests (main + generator)
npm test

# Generator tests only
npx jest --selectProjects tools

# Watch mode for TDD
npx jest --watch --selectProjects tools
```

### Project Structure

```
src/domain/galaxy/           — Shared types + portable algorithms (PRNG, A*, dice)
tools/galaxy-generator/src/  — Pipeline code (Node.js, uses fs/path)
tools/galaxy-generator/src/  — Tests mirror source structure
```

### Key Files

| File                                     | Purpose                                    |
| ---------------------------------------- | ------------------------------------------ |
| `src/domain/galaxy/types.ts`             | Shared StarSystem, Route, CostMap types    |
| `src/domain/galaxy/prng.ts`              | PRNG interface + Mulberry32 implementation |
| `src/domain/galaxy/dice.ts`              | 4dF and NdS dice roll utilities            |
| `src/domain/galaxy/pathfinding.ts`       | A\* pathfinding (portable)                 |
| `tools/galaxy-generator/src/index.ts`    | CLI entry point                            |
| `tools/galaxy-generator/src/pipeline.ts` | Pipeline orchestrator                      |

### TDD Workflow

1. Write failing test in `tools/galaxy-generator/src/**/*.spec.ts`
2. Run `npx jest --watch --selectProjects tools`
3. Write minimal code to pass
4. Refactor with green tests
5. Verify 100% coverage: `npx jest --coverage --selectProjects tools`

### Determinism Verification

```bash
# Generate twice with the same seed
just generate-galaxy --seed test-seed --output ./out1
just generate-galaxy --seed test-seed --output ./out2

# Verify identical output
diff -r out1 out2  # Should show no differences
```
