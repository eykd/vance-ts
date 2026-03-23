# Implementation Roadmap: Playable Turn Loop

## Context

The game specs are comprehensive (12 system specs, ~3700 lines of Ravel VM spec, ~2400 lines of Prestoplot spec) but no game logic is implemented yet. The codebase has production-ready auth, Clean Architecture, and galaxy generation primitives. The goal is to reach a playable turn loop as fast as possible while enabling content authoring in parallel.

**A player can:** see their system, see available actions, choose one, see the outcome, jump to another system (consuming fuel, ticking meters), find freight jobs, accept and deliver them, and feel meter pressure.

## Dependency Graph

```
Phase 0: Galaxy Seed to D1          [S, 2-3 days]  ─┐
Phase 1: Prestoplot Core            [L, 1-2 weeks] ─┤── run in parallel
Phase 2: Ravel MVP                  [M-L, 5-10 days]┘
         │
Phase 3: Player State + Session     [M, 4-7 days]  ── depends on 0, 2
         │
Phase 4: Turn Loop                  [M, 4-7 days]  ── depends on 0, 1, 2, 3
         │
Phase 5: Freight Jobs + Economy     [M, 4-7 days]  ── depends on 0, 3, 4
         │
Phase 6: Meter Pressure + Chatter   [S-M, 3-5 days] ── depends on 1, 2, 4
```

**Critical path:** 0 + 2 + 3 + 4 (shortest to visible). Prestoplot (1) runs in parallel.
**Total:** ~5-8 weeks with one developer.

---

## Phase 0: Galaxy Seed to D1

**Goal:** Galaxy data queryable from Workers runtime via D1.

**Components:**

- `migrations/0002_galaxy_schema.sql` — `star_systems`, `routes`, `trade_pairs` (pre-computed BTN) tables
- `tools/galaxy-seeder/seed-d1.ts` — Node CLI reads galaxy-output JSON, computes BTN, writes SQL
- `src/domain/galaxy/StarSystemRepository.ts` — port: `findById`, `findConnected`, `findByName`
- `src/domain/galaxy/RouteRepository.ts` — port: `findRoutesFrom`, `findRoute`
- `src/domain/economy/TradePairRepository.ts` — port: `findTradePairs(systemId)`
- `src/infrastructure/repositories/D1StarSystemRepository.ts`
- `src/infrastructure/repositories/D1RouteRepository.ts`
- `src/infrastructure/repositories/D1TradePairRepository.ts`

**Scope:** S (2-3 days)

---

## Phase 1: Prestoplot Core

**Goal:** Grammar-based text generation works. Content authors can write YAML grammars.

**Components (following spec layer placement):**

- `src/domain/prestoplot/` — Grammar, TextRule, ListRule, StructRule, SelectionMode, RenderedString, Seed/ScopedSeed, articleGeneration, markovChain, selectionModes (REUSE/PICK/RATCHET/MARKOV/LIST), errors
- `src/application/prestoplot/` — StoragePort, TemplateEnginePort, RandomPort, RenderStoryService, grammarParser (YAML→Grammar), renderEngine, renderContext
- `src/infrastructure/prestoplot/` — InMemoryStorage, KVStorage, FtemplateEngine, Jinja2Engine (subset), Mulberry32Random, seedHasher (SHA-256 via crypto.subtle)
- Add KV binding `GRAMMAR_KV` to wrangler.toml

**Key spec files:** `docs/spec/systems/prestoplot/01-domain-model.md` through `11-deviations.md`
**Reuse:** `src/domain/galaxy/prng.ts` (Mulberry32)

**Scope:** L (1-2 weeks)

**Content unblocked:** System description grammars, job description grammars, crew chatter grammars.

---

## Phase 2: Ravel MVP

**Goal:** Qualities stored/queried/modified. Storylets matched against quality state. Basic situation flow (enter, see text, choose, qualities change).

**MVP subset (skip compels, interjections, deck, cooldowns, decay):**

- `src/domain/ravel/` — QualityValue, QualityName, QualityType (7 + generic), QualityDeclaration (skip decay/expiry), Expression tree + evaluate(), Predicate + TierPredicate + evaluate(), QualityLayer + QualityState (4-layer resolution), SituationDef (location, predicates, instructions, text), MVP instructions (SET, ADJUST, CHOOSE, TEXT, GOTO), Rulebook (querySituations → ranked by predicate count), VmState (stack, qualities, status)
- `src/application/ravel/` — QualityPersistencePort, RulebookStoragePort, RavelService (init, advance, process choice), CompilerService (YAML→Rulebook, single file)
- `src/infrastructure/ravel/` — D1QualityStore, KVRulebookStore, InMemoryQualityStore
- `migrations/0003_quality_store.sql` — `player_qualities(user_id, quality_name, value, layer)`

**Key spec file:** `docs/game-design/notes/qbn/RAVEL_VM_SPEC.md` sections 2-4

**Scope:** M-L (5-10 days)

**Content unblocked:** Storylet authoring in `.ravel` YAML, quality-gated narrative content.

---

## Phase 3: Player State + Game Session

**Goal:** Authenticated player has a captain with location, fuel, credits. Game page renders their situation.

**Components:**

- `src/domain/game/captain.ts` — entity: userId, name, currentSystemId, fuel, credits, cargoCapacity
- `src/domain/game/CaptainRepository.ts` — port interface
- `src/application/game/createCaptainUseCase.ts` — new game: pick starting system, init qualities
- `src/application/game/loadGameUseCase.ts` — hydrate captain + qualities + system from D1
- `src/infrastructure/repositories/D1CaptainRepository.ts`
- `src/presentation/handlers/GamePageHandler.ts` — `/app/game` route
- `migrations/0004_captain_schema.sql` — `captains(user_id, name, current_system_id, fuel, credits, cargo_capacity)`
- Minimal character creation: pick a name, assigned starting Oikumene system

**Scope:** M (4-7 days)

---

## Phase 4: The Turn Loop

**Goal:** Player sees system description, connected systems, available storylets. Can jump (consuming fuel), select storylets, see outcomes. The core playable loop.

**Components:**

- `src/application/game/viewSystemUseCase.ts` — system description (Prestoplot), connected systems + fuel costs, available storylets (Ravel querySituations)
- `src/application/game/travelUseCase.ts` — validate route, deduct fuel, update location, set Location quality, tick meter qualities
- `src/application/game/executeStoryletUseCase.ts` — player picks storylet, VM executes, returns text + quality changes
- `src/domain/game/travelService.ts` — pure: validate route, compute fuel cost, produce quality deltas
- `src/domain/game/meterTickService.ts` — pure: compute quality deltas per jump
- HTMX endpoints: `POST /app/game/travel`, `POST /app/game/action`, `GET /app/game/system`

**Content files (authored in parallel):**

- `content/grammars/system-descriptions.yaml` — Prestoplot grammar for system prose
- `content/ravel/port-arrival.ravel` — storylets for port types
- `content/ravel/space-events.ravel` — basic travel events

**Scope:** M (4-7 days)

---

## Phase 5: Freight Jobs + Basic Economy

**Goal:** Player sees jobs at port, accepts freight, delivers at destination, earns credits. Can buy fuel.

**Components:**

- `src/domain/economy/freightJob.ts` — entity: id, origin, destination, tons, pay, expires
- `src/domain/economy/jobGenerator.ts` — stochastic algorithm from jobs spec: BTN Fate dice gate, tonnage rolls, price formula (`rate * tons * distance + adjacency_bonus + noise`)
- `src/domain/economy/FreightJobRepository.ts` — port
- `src/application/economy/generateJobsUseCase.ts` — generate from trade pairs
- `src/application/economy/acceptJobUseCase.ts` — validate capacity, assign
- `src/application/economy/deliverJobUseCase.ts` — validate location, pay, free cargo
- `src/application/economy/buyFuelUseCase.ts` — deduct credits, add fuel
- `src/infrastructure/repositories/D1FreightJobRepository.ts`
- `migrations/0005_freight_jobs.sql` — `freight_jobs`, `active_jobs` tables
- HTMX: job board, accept confirmation, delivery result, fuel purchase

**Key spec:** `docs/spec/systems/jobs.md` lines 17-25 (stochastic generation algorithm)

**Scope:** M (4-7 days)

---

## Phase 6: Meter Pressure + Crew Chatter

**Goal:** Hunger meter ticks per jump. Tier crossings produce crew chatter and unlock storylets. Port meals reduce Hunger.

**Components:**

- Expand `meterTickService.ts` for Hunger with tier thresholds (comfortable 0-2, hungry 3-5, starving 6-8, crisis 9-10)
- `src/application/game/chatterService.ts` — generate crew chatter via Prestoplot from meter state
- Expand `travelUseCase.ts` to run meter ticks and collect fired storylets
- Integrate chatter into game view (narrative text between jump and new system)

**Content files:**

- `content/ravel/hunger.ravel` — Hunger quality declaration, tier-gated storylets
- `content/grammars/crew-chatter.yaml` — crew food comments
- `content/ravel/port-services.ravel` — buy meals (reduce Hunger, cost credits)

**Scope:** S-M (3-5 days)

---

## Explicitly Deferred (build on Phase 1-6 foundation)

| System                 | What's Deferred                                                             | When to Add                        |
| ---------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| **Ravel advanced**     | Compels, interjections, opportunity deck, cooldowns, decay/expiry, includes | After playtest feedback on Phase 4 |
| **Ship modules**       | 11-module catalog, condition degradation, resource flows, keyframe sim      | After economy works (Phase 5+)     |
| **Crew system**        | Individual NPCs, personalities, mood, observable action judgment, rub-off   | After meters work (Phase 6+)       |
| **Speculative trade**  | Buy/sell goods, dynamic pricing, Bargains/Prospects                         | After freight jobs work (Phase 5+) |
| **Factions**           | Reputation tiers, dossier hardpoints, faction meter curves, faction jobs    | After crew + meters                |
| **Combat**             | Abstract QBN encounters, archetype roles                                    | After advanced Ravel               |
| **Multiplayer**        | Shared economy, async interaction, regional markets                         | After single-player loop proven    |
| **Character creation** | Full setting-embedded choice sequence                                       | After playtest (MVP: pick a name)  |
| **Travel granularity** | Interplanetary/surface scales                                               | After interstellar works           |
| **Dynamic markets**    | Price memory, supply/demand tracking                                        | After multiplayer                  |

## Content Authoring Timeline

- **After Phase 1** (week 2-3): Grammar files
- **After Phase 2** (week 2-3): Storylet `.ravel` files
- **After Phase 4** (week 4-5): Location-specific content testable in-game
- **After Phase 6** (week 6-8): Full narrative loop content

## Critical Files

- `src/domain/galaxy/types.ts` — existing StarSystem/Route types consumed by all phases
- `docs/spec/systems/prestoplot/01-domain-model.md` — exact types for Phase 1
- `docs/game-design/notes/qbn/RAVEL_VM_SPEC.md` sections 2-4 — VM state machine for Phase 2
- `src/di/serviceFactory.ts` — composition root extended in every phase
- `docs/spec/systems/jobs.md` lines 17-25 — stochastic job generation for Phase 5

## Verification

After each phase, verify:

- `just check` passes (type-check + lint + test)
- `just test-serial` — all unit tests pass with 100% coverage
- Phase 0: `wrangler d1 execute DB --command "SELECT count(*) FROM star_systems"` returns expected count
- Phase 1: Unit tests render grammar → deterministic output from seed
- Phase 2: Unit tests: declare qualities, evaluate predicates, match situations, modify state
- Phase 3: Log in → game page shows current system
- Phase 4: Log in → see system → jump → see new system → select storylet → see outcome
- Phase 5: See job board → accept job → travel → deliver → credits increase
- Phase 6: Jump repeatedly → Hunger rises → chatter appears → buy meal at port → Hunger drops
