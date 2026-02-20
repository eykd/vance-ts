# Contract: Galaxy Generation CLI

**Type**: Command-Line Interface
**Date**: 2026-02-16

## Overview

The galaxy generator is invoked as a CLI tool that reads configuration, runs the pipeline, and writes output files.

## Invocation

```bash
npx ts-node tools/galaxy-generator/src/index.ts --seed <seed> [options]
```

Or via justfile:

```bash
just generate-galaxy --seed <seed>
```

## Arguments

| Argument            | Type    | Required | Default            | Description                                  |
| ------------------- | ------- | -------- | ------------------ | -------------------------------------------- |
| `--seed`            | string  | Yes      | (none)             | Master seed for deterministic generation     |
| `--output`          | string  | No       | `./galaxy-output/` | Output directory path                        |
| `--config`          | string  | No       | (none)             | Path to JSON config file overriding defaults |
| `--arms`            | number  | No       | 4                  | Number of spiral arms                        |
| `--oikumene-count`  | number  | No       | 250                | Target Oikumene system count                 |
| `--max-route-range` | number  | No       | 40                 | Maximum route range in coordinate units      |
| `--verbose`         | boolean | No       | false              | Enable detailed progress logging             |

## Exit Codes

| Code | Meaning                                                 |
| ---- | ------------------------------------------------------- |
| 0    | Pipeline completed successfully                         |
| 1    | Invalid arguments or configuration                      |
| 2    | Pipeline failed during generation                       |
| 3    | Validation failed (e.g., disconnected Oikumene network) |

## Output

See `output-format.md` for the complete output specification.

## Progress Output (stdout)

```
[1/7] Generating star positions...     12,043 stars generated
[2/7] Computing cost map...            820x820 grid
[3/7] Calculating stellar density...   done
[4/7] Selecting Oikumene...            247 systems selected
[5/7] Generating system attributes...  12,043 systems attributed
[6/7] Pre-computing routes...          1,843 routes computed
[7/7] Writing output files...          done

Galaxy generation complete.
  Seed: oikumene-alpha-1
  Systems: 12,043 (247 Oikumene, 11,796 Beyond)
  Routes: 1,843 (avg cost: 27.4)
  Output: ./galaxy-output/
  Time: 18.3s
```
