# Galaxy Generator — TypeScript Implementation Specification

## 1. Overview

This document specifies a TypeScript implementation of a procedural spiral-galaxy star-field generator. The original algorithm is implemented in Python (see `galaxies.py`) and is loosely based on the technique described at [codeboje.de/starfields-and-galaxies-python](https://codeboje.de/starfields-and-galaxies-python/).

The generator produces 2D coordinate pairs representing stars in a spiral galaxy. It works by plotting randomised elliptical clouds of stars along spiral paths that emanate from a shared centre. The result, when rendered, resembles a multi-armed spiral galaxy.

### 1.1 Goals

- Faithful, behaviour-equivalent port of the Python algorithm to idiomatic TypeScript.
- Strong static typing throughout; no `any` types.
- Reproducible output via a seedable pseudo-random number generator (PRNG).
- Lazy generation using ES2015+ generators (`function*` / `yield`), matching the Python implementation's use of generators.
- Zero runtime dependencies beyond a bundled or injected PRNG.
- Comprehensive unit-test coverage with deterministic seed-based assertions.

### 1.2 Non-Goals

- Rendering, visualisation, or UI of any kind.
- 3D coordinates or volumetric modelling.
- Physical simulation of gravitational dynamics.
- Performance optimisation beyond what idiomatic TypeScript provides naturally (e.g. no WASM, no WebGL compute).

---

## 2. Domain Concepts

### 2.1 Coords

A simple value object representing a point in 2D space.

```
Coords { x: number; y: number }
```

The Python source uses a `Coords` named-tuple imported from `salvage.domain.entities`. The TypeScript equivalent should be a plain interface or a small immutable class. Coordinates are always integers in the final output (the Python code calls `round()` before yielding), but intermediate calculations use floating-point arithmetic.

### 2.2 Galaxy Anatomy

| Term | Meaning |
|---|---|
| **Centre** | The `(x, y)` origin of the galaxy. All arms radiate from here. |
| **Arm** | A single spiral path along which star clouds are placed. Arms are evenly distributed around 360°. |
| **Star cloud** | An elliptical cluster of stars placed at a point along an arm. Cloud size grows with distance from the centre. |
| **Star** | A single `Coords` point within a cloud. |

### 2.3 Number

Throughout this spec, `Number` refers to the TypeScript `number` type (IEEE 754 double). The Python source defines a union `float | int`; in TypeScript this collapses to `number`.

---

## 3. Public API

### 3.1 Module Exports

The module should export:

1. The `GalaxyGenerator` class (or, alternatively, a plain object / namespace with static functions — see §3.2).
2. The `Coords` type/interface.
3. The `GalaxyConfig` interface (the options bag for the top-level generator).

### 3.2 Class vs. Functional Design

The Python implementation uses a class with exclusively `@classmethod` methods — no instance state is ever created. The TypeScript port **should** therefore expose the three generator functions as standalone exported functions rather than static methods on a class. This is more idiomatic in TypeScript and avoids a misleading class wrapper. A re-export namespace may optionally group them.

Recommended public surface:

```ts
export function* generateSpiralGalaxyCoords(config?: Partial<GalaxyConfig>): Generator<Coords>;
```

The two subordinate generators (`generateSpiralArmCoords`, `generateEllipticStarfieldCoords`) should also be exported for testability and potential reuse but are considered **secondary API** — consumers will typically call only the top-level function.

### 3.3 `GalaxyConfig`

All fields are optional; every field has a default.

| Field | Type | Default | Description |
|---|---|---|---|
| `center` | `[number, number]` | `[0, 0]` | `(x, y)` origin of the galaxy. |
| `size` | `[number, number]` | `[4000, 4000]` | Suggested width and height of the galaxy field. Converted internally to radians for the spiral calculation (see §4.1). |
| `turn` | `number` | `0` | Base rotation of the galaxy in **radians**. |
| `deg` | `number` | `5` | Controls the "tightness" of the spiral. Higher values produce more windings and more stars. Despite the name, this is **not** in degrees — it is the upper bound of the parametric variable `n` that drives the spiral. |
| `dynSizeFactor` | `number` | `1` | Scaling factor applied to the distance of star clouds from the centre. |
| `spcFactor` | `number` | `8` | Divisor controlling the number of stars per cloud. Lower values → more stars. |
| `arms` | `number` (integer) | `4` | Number of spiral arms. |
| `multiplier` | `number` | `1` | Final scalar applied to every output coordinate. |
| `limit` | `number \| null` | `null` | Hard cap on the total number of stars yielded. `null` means unlimited. |
| `seed` | `number \| string \| null` | `null` | Seed for the PRNG. `null` means non-deterministic (use a fresh random seed). Passing the same seed must produce the identical sequence of coordinates. |

> **Naming convention:** Python snake_case names are converted to camelCase per TypeScript convention. `dyn_size_factor` → `dynSizeFactor`, `spc_factor` → `spcFactor`, etc.

### 3.4 `SpiralArmConfig`

This is the internal configuration passed from the galaxy-level generator to the arm-level generator. It is **not** part of the primary public API, but should be exported as a type for advanced consumers and testing.

| Field | Type | Description |
|---|---|---|
| `center` | `[number, number]` | Galaxy centre. |
| `size` | `[number, number]` | Already-converted `(sx, sy)` radian-scaled values. |
| `turn` | `number` | Per-arm rotation (base turn + arm shift). |
| `deg` | `number` | Spiral extent. |
| `xp1` | `number` | Pre-computed initial ellipse semi-axis (x). |
| `yp1` | `number` | Pre-computed initial ellipse semi-axis (y). |
| `mulStarAmount` | `number` | Stars-per-cloud scaling factor. |
| `dynSizeFactor` | `number` | Distance scaling. |
| `multiplier` | `number` | Final coordinate scalar. |
| `rng` | `PRNG` | The PRNG instance to use. |

### 3.5 `EllipticStarfieldConfig`

Configuration for generating a single elliptical star cloud.

| Field | Type | Description |
|---|---|---|
| `amount` | `number` (integer) | Number of stars to place in this cloud. |
| `center` | `[number, number]` | Centre of the ellipse. |
| `radius` | `[number, number]` | `(rx, ry)` semi-axes of the ellipse. |
| `turn` | `number` | Rotation of the ellipse (radians). |
| `multiplier` | `number` | Final coordinate scalar. |
| `rng` | `PRNG` | The PRNG instance to use. |

---

## 4. Algorithm Detail

This section describes the algorithm step-by-step so that an implementer can produce a byte-identical output sequence (given the same PRNG implementation and seed).

### 4.1 Galaxy-Level Setup (`generateSpiralGalaxyCoords`)

1. **Obtain a PRNG** from the `seed` parameter (see §5).
2. **Convert size to radians:**

   ```
   sx = 2.0 * size[0] * π / 360.0
   sy = 2.0 * size[1] * π / 360.0
   ```

   This converts the user-supplied "pixel" size into a radian measure that scales the spiral.

3. **Compute initial ellipse parameters:**

   ```
   xp1 = round(deg / π * sx / 1.7) * dynSizeFactor
   yp1 = round(deg / π * sy / 1.7) * dynSizeFactor
   ```

   Note: these `xp1`/`yp1` values are used only to derive `mulStarAmount`. They are **not** the same variables as the `xp1`/`yp1` that appear inside the arm generator (which are recomputed per-step). The Python source re-uses the names, which is a source of confusion — the TypeScript port should use distinct names (e.g. `initialXp1` / `initialYp1` at this level).

4. **Compute stars-per-cloud factor:**

   ```
   mulStarAmount = (xp1 + yp1) / spcFactor
   ```

5. **Iterate arms.** For each arm index `arm` in `[0, arms)`:

   ```
   shift = (arm / arms) * 2 * π
   ```

   Delegate to `generateSpiralArmCoords` with `turn + shift` as the arm's rotation.

6. **Enforce limit.** Maintain a running count across all arms. If `limit` is non-null, stop yielding once the count reaches `limit`, even if an arm is mid-generation.

### 4.2 Arm-Level Generation (`generateSpiralArmCoords`)

This generator walks along a single spiral arm, placing elliptical star clouds at intervals.

1. **Initialise** parametric variable `n = 0.0`.
2. **While** `n <= deg`:

   a. Compute the raw spiral position:

      ```
      xpos = cos(n) * n * sx * dynSizeFactor
      ypos = sin(n) * n * sy * dynSizeFactor
      ```

   b. Rotate by the arm's `turn` angle:

      ```
      xp1 =  cos(turn) * xpos + sin(turn) * ypos
      yp1 = -sin(turn) * xpos + cos(turn) * ypos
      ```

   c. Compute the cloud centre:

      ```
      cx = centerX + xp1
      cy = centerY + yp1
      ```

   d. Compute the distance from the cloud centre to the galaxy centre:

      ```
      dist = sqrt((cx - centerX)² + (cy - centerY)²)
      ```

   e. Compute the cloud size (number of stars and ellipse radius):

      ```
      sizeTemp = 2 + (mulStarAmount * n) / (dist / 200  ||  1)
      ```

      The `|| 1` guards against division by zero when `dist` is 0 (i.e. the very first cloud sits on the centre). Note the Python source uses `(dist / 200) or 1`, which is truthy-falsy: `0.0` is falsy in Python, so this correctly substitutes `1` when `dist` is zero. TypeScript should replicate this with `(dist / 200) || 1`.

   f. Compute the star count for this cloud:

      ```
      amount = floor(sizeTemp / (n || 2))
      ```

      Python's `int()` truncates toward zero; for positive values this is equivalent to `Math.floor()`. The `|| 2` guard prevents division by zero on the first iteration when `n` is `0`.

   g. **Yield from** `generateEllipticStarfieldCoords` with:
      - `amount` as computed above.
      - `center` = `(cx, cy)`.
      - `radius` = `(sizeTemp, sizeTemp)` — note both semi-axes are equal, making this a circular cloud despite the function name.
      - `turn` and `multiplier` passed through.
      - The same `rng` instance (see §5.1 on PRNG sharing).

   h. Advance `n`:

      ```
      angle = rng.randint(0, 4) + 1   // random integer in [1, 5]
      n += 2.0 * angle * π / 360.0
      ```

      This means `n` advances by a random increment between approximately 0.0349 and 0.1745 radians (2°–10°) per step, introducing organic irregularity in cloud spacing.

### 4.3 Cloud-Level Generation (`generateEllipticStarfieldCoords`)

Generates `amount` star coordinates within a rotated ellipse using a density-biased random distribution.

For each of the `amount` stars:

1. Pick a random angle:

   ```
   degree = rng.randint(0, 360)
   degreeRad = 2.0 * degree * π / 360.0
   ```

2. Compute a density-biased inside factor:

   ```
   insideFactor = rng.randint(0, 10000) / 10000
   insideFactor = insideFactor * insideFactor    // square it for centre-biased density
   ```

   Squaring the uniform `[0, 1]` value biases the distribution toward 0, placing more stars near the centre of the ellipse.

3. Compute the raw position within the ellipse:

   ```
   xpos = sin(degreeRad) * round(insideFactor * rx)
   ypos = cos(degreeRad) * round(insideFactor * ry)
   ```

4. If `turn ≠ 0`, apply rotation:

   ```
   xposRot =  cos(turn) * xpos + sin(turn) * ypos
   yposRot = -sin(turn) * xpos + cos(turn) * ypos
   xpos = xposRot
   ypos = yposRot
   ```

5. Yield the final coordinate:

   ```
   Coords(round((cx + xpos) * multiplier), round((cy + ypos) * multiplier))
   ```

---

## 5. Pseudo-Random Number Generator (PRNG)

### 5.1 Requirements

The Python source relies on `random.Random` (Mersenne Twister) via a helper `dice.get_rng(seed)`. The TypeScript port must provide:

- A **seedable** PRNG that produces deterministic sequences for a given seed.
- An `randint(min, max)` method returning a uniform random integer in `[min, max]` (inclusive on both ends), matching Python's `random.randint` semantics.

### 5.2 PRNG Sharing

A critical detail: the Python code creates **one** PRNG at the galaxy level and passes it (as a `random.Random` instance) down to `generate_spiral_arm_coords`. However, `generate_elliptic_starfield_coords` receives `seed` — and in the arm generator, the call passes the original `seed` parameter (not `rng`). Examining the arm-level signature and call site:

```python
# In generate_spiral_arm_coords:
yield from cls.generate_elliptic_starfield_coords(
    ...
    seed=seed,   # ← this is the `seed` parameter of generate_spiral_arm_coords
)
```

And `generate_spiral_arm_coords` receives `seed=None` by default but is called from the galaxy level with `seed=rng` (the `Random` instance). So `seed` at the arm level is the `rng` object, and it is passed straight to the elliptic generator, which also calls `dice.get_rng(seed)`.

The implication depends on how `dice.get_rng` behaves when given an existing `Random` instance. Most likely it returns the instance unchanged (pass-through). **The TypeScript port should adopt this same pattern**: if the seed is already a PRNG instance, return it as-is; otherwise create a new PRNG from the seed value.

This means **all three generators share a single PRNG instance**, and the sequence of random draws across the entire galaxy is deterministic and interleaved. This is essential for reproducibility.

### 5.3 Recommended PRNG Interface

```ts
interface PRNG {
  /** Return a uniform random integer in [min, max] (inclusive). */
  randint(min: number, max: number): number;
}
```

The implementation may use any algorithm (Mersenne Twister, xoshiro256, mulberry32, etc.) as long as it is seedable and deterministic. For test-compatibility with the Python output, a Mersenne Twister implementation would be ideal — but this is not a strict requirement unless cross-language reproducibility is a goal.

### 5.4 `getRng` Helper

```ts
function getRng(seed: PRNG | number | string | null): PRNG
```

- If `seed` is already a `PRNG`, return it unchanged.
- If `seed` is a number or string, create and return a new PRNG seeded with that value.
- If `seed` is `null`, create a PRNG with a non-deterministic seed (e.g. `Date.now()` or `crypto.getRandomValues`).

---

## 6. Type Definitions (Complete)

Below is the full set of types that the module should export or use internally.

```ts
/** A 2D point. Coordinates are always rounded integers in final output. */
export interface Coords {
  readonly x: number;
  readonly y: number;
}

/** Configuration for the top-level galaxy generator. All fields optional. */
export interface GalaxyConfig {
  center: [number, number];
  size: [number, number];
  turn: number;
  deg: number;
  dynSizeFactor: number;
  spcFactor: number;
  arms: number;
  multiplier: number;
  limit: number | null;
  seed: PRNG | number | string | null;
}

/** Seedable pseudo-random number generator contract. */
export interface PRNG {
  randint(min: number, max: number): number;
}
```

Internal config types (`SpiralArmConfig`, `EllipticStarfieldConfig`) are documented in §3.4 and §3.5 above.

---

## 7. Function Signatures

```ts
export function* generateSpiralGalaxyCoords(
  config?: Partial<GalaxyConfig>
): Generator<Coords, void, undefined>;

export function* generateSpiralArmCoords(
  config: SpiralArmConfig
): Generator<Coords, void, undefined>;

export function* generateEllipticStarfieldCoords(
  config: EllipticStarfieldConfig
): Generator<Coords, void, undefined>;

export function getRng(seed: PRNG | number | string | null): PRNG;
```

All generators yield `Coords` and return `void`. They accept no values via `.next()`.

---

## 8. Edge Cases and Defensive Behaviour

### 8.1 Division-by-Zero Guards

There are two explicit guards in the algorithm that must be preserved:

1. **`(dist / 200) || 1`** in the arm generator (§4.2 step e). When the first cloud is placed exactly at the galaxy centre, `dist` is `0`, so `dist / 200` is `0`, which is falsy. The guard substitutes `1`.

2. **`n || 2`** in the arm generator (§4.2 step f). On the first iteration `n` is `0.0`, which is falsy. The guard substitutes `2`.

Both of these rely on JavaScript/TypeScript's falsy semantics for `0`, which match Python's truthiness rules for `0.0`.

### 8.2 Floating-Point Consistency

JavaScript and Python both use IEEE 754 doubles, so intermediate arithmetic should produce identical results for the same inputs. However, `Math.round()` in JavaScript uses "round half to even" (banker's rounding) in some engines, whereas Python's `round()` also uses banker's rounding. Verify that the chosen runtime's `Math.round` matches. If exact cross-language parity is required, supply a custom `round` that explicitly implements round-half-to-even.

### 8.3 Negative or Zero `arms`

The Python code does not validate `arms`. If `arms` is `0`, the `range(0)` loop simply produces nothing. The TypeScript port should replicate this: zero arms yields zero stars, no error. Negative values should either be clamped to 0 or raise a `RangeError` — the spec recommends the latter for clarity.

### 8.4 Negative `amount` in Elliptic Generator

If the computed `amount` (from `Math.floor(sizeTemp / (n || 2))`) is negative or zero, the Python `range()` call produces an empty sequence. TypeScript should guard `amount` with `Math.max(0, amount)` or simply skip the loop body.

### 8.5 Very Large `deg` Values

Large `deg` values produce extremely long spirals with many clouds. Combined with a low `spcFactor`, this can generate millions of coordinates. The `limit` parameter exists specifically for this case. The implementation should not pre-allocate arrays; the generator/yield pattern inherently handles backpressure.

---

## 9. Testing Strategy

### 9.1 Deterministic Seed Tests

Given a fixed seed, the generator must produce the exact same sequence of `Coords` every time. Tests should:

- Generate N coordinates with a known seed.
- Assert the exact `(x, y)` values of the first several and last several coordinates.
- Assert the total count (when `limit` is set).

### 9.2 Statistical Property Tests

Without relying on exact values, verify:

- **Symmetry.** With a large sample, the mean `x` and `y` should approximate the centre.
- **Arm count.** Performing angular binning (arctan2 from centre) on a large sample should reveal `arms` distinct peaks.
- **Density gradient.** Stars closer to the centre should be more numerous than stars at the periphery (due to the squared `insideFactor`).

### 9.3 Edge-Case Tests

- `arms = 0` → yields nothing.
- `limit = 0` → yields nothing.
- `limit = 1` → yields exactly one coordinate.
- `size = [0, 0]` → all stars collapse to the centre (after rounding).
- `multiplier = 0` → all output coordinates are `(0, 0)`.
- `deg = 0` → the arm loop body executes once (when `n = 0 <= 0`), producing one cloud at the centre.

### 9.4 PRNG Isolation Test

Two generators created with different seeds must produce different sequences. Two generators with the same seed must produce identical sequences.

### 9.5 Generator Laziness Test

Verify that requesting only the first 10 coordinates from a generator configured for millions does not consume excessive memory or time.

---

## 10. Project Structure (Recommended)

```
src/
  galaxy-generator.ts       Top-level generator function
  spiral-arm-generator.ts   Arm-level generator function
  elliptic-starfield.ts     Cloud-level generator function
  prng.ts                   PRNG interface, getRng helper, default implementation
  types.ts                  Coords, GalaxyConfig, internal config types
  index.ts                  Barrel re-exports

tests/
  galaxy-generator.test.ts
  spiral-arm-generator.test.ts
  elliptic-starfield.test.ts
  prng.test.ts
```

Each generator lives in its own module for clarity, testability, and to prevent the name-shadowing issues present in the Python source.

---

## 11. Migration Notes and Python Divergences

This section catalogues deliberate differences from the Python source and the rationale for each.

### 11.1 Static Methods → Free Functions

The Python `GalaxyGenerator` class has only `@classmethod` methods and no instance state. TypeScript free functions (or a namespace) are more idiomatic and avoid misleading consumers into instantiating a stateless class.

### 11.2 Variable Shadowing

The Python arm generator re-uses the parameter names `xp1` and `yp1` as local variables inside the loop, shadowing the values passed in from the galaxy-level setup. These shadowed values are never read after the first assignment within the loop. The TypeScript port should use distinct names (e.g. `rotatedX`, `rotatedY`) to eliminate confusion.

### 11.3 `seed` Parameter Ambiguity

In the Python source, `seed` serves double duty: it can be a raw seed value or an already-initialised `Random` object. The TypeScript port formalises this with the `PRNG | number | string | null` union type and the `getRng` helper.

### 11.4 `Coords` Construction

The Python `Coords` is a named-tuple (likely with `x` and `y` fields). The TypeScript port uses a `Readonly` interface. If consumers need structural equality checks, consider providing a `coordsEqual(a, b)` helper or implementing `Coords` as a frozen plain object.

### 11.5 Integer Truncation

Python's `int()` truncates toward zero. For the positive values produced by `sizeTemp / (n || 2)`, this is identical to `Math.floor()`. However, if negative values are theoretically possible, use `Math.trunc()` instead to match Python's behaviour exactly.

### 11.6 Rounding Semantics

Python 3's `round()` uses banker's rounding (round half to even). JavaScript's `Math.round()` uses "round half away from zero" (e.g. `Math.round(0.5) === 1`, but Python's `round(0.5) === 0`). If exact cross-language reproducibility is needed, implement a custom `bankersRound` function:

```ts
function bankersRound(x: number): number {
  const floored = Math.floor(x);
  const decimal = x - floored;
  if (decimal === 0.5) {
    return floored % 2 === 0 ? floored : floored + 1;
  }
  return Math.round(x);
}
```

If cross-language reproducibility is **not** a goal, standard `Math.round()` is acceptable.

---

## 12. Performance Considerations

- **Generator-based streaming.** The entire pipeline should remain lazy. No intermediate arrays should be allocated for the full star set. This mirrors the Python `yield` / `yield from` pattern and allows consumers to process arbitrarily large galaxies without memory pressure.
- **Avoid repeated trigonometric calls.** `cos(turn)` and `sin(turn)` are constant within a single arm. Cache them at the start of `generateSpiralArmCoords`.
- **Hot loop in elliptic generator.** The innermost loop (star placement) will execute the most iterations. Keep it allocation-light — yield plain object literals `{ x, y }` rather than class instances.
- **`limit` short-circuit.** The galaxy-level generator must check the limit counter immediately after each yield and return early, not just at arm boundaries.

---

## 13. Future Extension Points

These are out of scope for the initial implementation but worth keeping in mind architecturally:

- **3D coordinates.** Adding a `z` component to model disc thickness.
- **Star metadata.** Attaching colour, luminosity, or spectral class to each star.
- **Galactic bulge.** Generating a separate dense elliptical cluster at the centre.
- **Bar structure.** Supporting barred spiral galaxies (SBa, SBb, SBc).
- **Configurable density profiles.** Allowing the `insideFactor` squaring to be replaced with arbitrary density curves.

The generator architecture (nested generators with config objects) is well suited to all of these extensions without breaking the existing API.
