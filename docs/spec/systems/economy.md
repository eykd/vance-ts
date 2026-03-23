# Economy

> Trade, currency, and the economic pressure that drives the player loop.

## Overview

The economy is what forces interesting decisions. You have a ship, you have a mortgage, and you need to make money. The question isn't whether to trade — it's _where_, _what_, and _with whom_. Three research streams inform this design: Traveller's mortgage-driven trade loop, Sunless Skies' resource narrative, and MMORPG faucet-sink equilibrium.

## Core Design

### The Mortgage

The ship mortgage is the heartbeat of the game. Adapted from Traveller's canonical mechanic: a fixed monthly payment of **1/240th of the ship's purchase price**, sustained over 40 years (480 payments), totaling 220% of the original cost. For the starting Free Trader equivalent, this means roughly Cr 150,000–200,000 per month in combined costs (mortgage + crew + maintenance + fuel).

**Why it works:** The math is intentionally tight. A full cargo hold on a short-haul route covers roughly 60–70% of monthly operating costs. Players _must_ combine freight, passengers, and speculative trade (or take on riskier jobs) to stay solvent. This transforms trade from an optional activity into the core survival mechanic — without economic pressure, trade becomes tourism.

**Monthly cost breakdown** (calibrate during playtesting):

| Cost              | Approximate share           |
| ----------------- | --------------------------- |
| Mortgage payment  | ~65–70%                     |
| Crew wages        | ~10–12%                     |
| Fuel              | ~10–15% (variable by route) |
| Maintenance       | ~3–5%                       |
| Docking/port fees | ~2–5%                       |

**Consequences of non-payment:** Escalating penalties — reduced credit rating (affecting future financing), faction reputation hits, eventual repossession. The threat must feel real but recoverable; bankruptcy should be a narrative event, not a game-over screen. Missing a payment triggers a QBN quality shift that opens storylets around desperation, debt collection, and shady bailout offers.

**Design principle (Kennedy):** The mortgage is the purest expression of resource narrative — a persistent scarcity that is reproducible (you can always earn more) and fungible (any income source helps). The tension between scarcity and reproducibility IS the game. When that tension breaks — either the player has so much that scarcity vanishes, or so little they can't continue — the game effectively ends.

### Trade Model

Trade operates on two tiers, following Traveller's structure but enhanced with Sunless Skies' dynamism and MMORPG market memory.

#### Tier 1: Routine Commerce (Bread and Butter)

Predictable income from freight, passengers, and mail contracts. This is the safe floor.

- **Freight**: Pay per ton per parsec. Available volume determined by the gravity trade model (see below). Reliable but low-margin.
- **Passengers**: Four types adapted from Traveller, each a narrative hook:
  - **High Passage** — wealthy/important NPCs; requires steward skill; faction dignitaries, potential quest-givers
  - **Middle Passage** — standard travelers; steady income
  - **Working Passage** — free (labor exchange); potential crew recruits; adventure hooks
  - **Low Passage** — cryogenic transport; survival risk on arrival (medic check); desperate NPCs with stories — _why_ are they fleeing?
- **Mail contracts**: Premium pay, require military or scout connections (faction standing gate).

Passenger and freight availability at each port is pre-computed from the gravity trade model during galaxy generation and updated dynamically based on player activity.

#### Tier 2: Speculative Trade (Risk and Reward)

The exciting layer. Buy low, sell high — but with enough randomness to create stories and enough structure to reward knowledge.

**Finding goods**: At each port, available trade goods are determined by the world's trade codes (Ag, In, Ri, Po, Hi, Lo, etc.) plus a random selection. Players with higher Broker skill or better faction standing find more suppliers and better deals.

**Pricing**: Base prices are modified by a roll equivalent to Traveller's 3d6 + modifiers system. Key modifiers:

- World trade codes (Agricultural worlds produce cheap food; Industrial worlds buy it at premium)
- Player Broker skill
- Faction standing at the port
- Current supply/demand state (digital advantage over tabletop — the market remembers previous trades)

The modified result produces a price multiplier ranging from roughly 40% to 400% of base price. This spread creates stories: even a well-planned route can go badly (or unexpectedly well).

**Trade codes create natural complementarities**: An Ag world near an In world creates an obvious food-for-manufactures route. A Ri world near a Po world creates luxury goods flow. Players who learn to read trade codes and identify these pairings gain a meaningful advantage — system mastery, not wiki-lookup.

**Triangular trade**: The most profitable merchants plan multi-stop circuits rather than simple A-to-B runs. World A produces X (desired on B), B produces Y (desired on C), C produces Z (desired on A). "Work this in the right direction and get rich; work it backwards and lose your shirt." The QBN system can generate trade circuit contracts that reward completing multi-stop deliveries.

#### Dynamic Markets (Digital Advantage)

Unlike tabletop Traveller's static pricing, our markets have memory:

- When players flood a market with a commodity, prices drop
- When no one trades a route, prices diverge (creating opportunity)
- Supply and demand tracked per commodity per world
- Price changes propagate slowly (information travels at the speed of trade, not instantly)

This creates the **trade pioneer** gameplay loop: exploring new systems to find untapped price differentials before other players discover and equalize them. It also naturally addresses Traveller's "home-base problem" — optimal routes shift over time, rewarding exploration over repetition.

**Tradeoff note**: Sunless Skies used fixed base prices with dynamic opportunities layered on top (Bargains/Prospects). Traveller used modifier-based pricing. Our hybrid approach uses modifier-based pricing as the foundation with dynamic supply/demand memory on top. This is more complex but appropriate for a persistent multiplayer world where static prices would be arbitraged to death.

#### The Gravity Trade Model

Pre-computed during galaxy generation using the World Trade Number (WTN) / Bilateral Trade Number (BTN) framework from GURPS Far Trader:

- **WTN**: Composite economic rating per world, calculated from population, tech level, starport quality, and trade codes. Our galaxy generation pipeline already produces all these fields.
- **BTN**: Trade volume between two worlds = f(WTN_A, WTN_B, distance). Higher BTN means more freight, more passengers, more available speculative goods.
- **Route classification** (BTN-based):
  - BTN 1–7: Insignificant (frontier routes, sparse traffic)
  - BTN 8–9: Minor/Feeder (connecting routes)
  - BTN 10: Intermediate (solid commercial route)
  - BTN 11: Main (major trade artery)
  - BTN 12+: Major (backbone route, heavy traffic)

This maps directly to the Oikumene/Beyond distinction: Oikumene routes cluster at BTN 9–12+ (reliable, competitive); Beyond routes are BTN 1–8 (sparse, risky, potentially very profitable for pioneers).

The Eaglestone Trade Index supplements this with factors like starport quality (+1 for A/B, -1 for D/E/X), tech level, military bases, capital status, and zone status (Amber: -1/-2; Red: -8). Range: -12 to +8.

#### WTN/BTN Calculation Chain (from spaaace prototype)

The Far Trader prototype provides the exact derivation chain:

1. **UWTN** (Unmodified WTN) = TL modifier + (population_rating / 2). The TL modifier maps GURPS tech levels to a +/- 0.5–1.5 adjustment (TL 0–2: -0.5; TL 9–11: +1.0; TL 12: +1.5).
2. **Port modifier**: A lookup table cross-referencing UWTN band (rows) and starport rating 0–5 (columns). Low UWTN + high starport = bonus (up to +1.5); high UWTN + low starport = penalty (down to -5). This naturally models backwater ports punching above their weight and major economies bottlenecked by poor infrastructure.
3. **WTN** = UWTN + port modifier.
4. **BTN** = WTN_A + WTN_B - distance_modifier, capped at min(WTN_A, WTN_B) + 5, floored at 0. The cap prevents a galactic capital from generating unrealistic trade volume with a frontier outpost — the smaller economy is the bottleneck.

**Distance modifier** uses graph hops (not parsecs): 1 hop = 0, 2 hops = 0.5, scaling up to 6 at 1000+ hops. Disconnected systems cannot trade at all.

**Trade volume tables**: BTN maps to credits/year, displacement-tons/year, dtons/week, and dtons/day through exponential lookup tables. Each half-point of BTN roughly doubles trade volume. The daily table is most relevant for gameplay — it determines how many freight jobs appear per tick. At BTN 7 a route sees 5–10 dtons/day; at BTN 9, 100–500 dtons/day.

#### Freight Rate Dynamics

Freight rates are per-system, not per-route, and fluctuate over time with an asymmetric mean-reverting model:

- **Base rate**: Cr 650 per displacement-ton per jump (the long-run equilibrium).
- **Volatility**: Cr 16.25 per shock unit.
- **Mean reversion**: 20% pull toward base rate each tick.
- **Asymmetric shocks**: After initialization, only negative shocks apply — rates drift down or revert, never spike upward. This models competitive pressure among carriers and creates a market where undercutting is the norm.

**Volume-price relationship**: When freight rates rise above base, available cargo volume drops proportionally (shippers find alternatives or defer). When rates fall below base, volume increases. This creates a negative feedback loop that stabilizes the market around the base rate.

**Design implication**: Players cannot simply wait for high-rate periods to maximize profit. The asymmetric shock model means rates spend most of their time at or below base, with occasional spikes only at initialization. Profit comes from efficiency (low operating costs, good route selection) rather than market timing.

### Bargains and Prospects

Adapted from Sunless Skies' dynamic trade system to add unpredictability on top of the gravity model's baseline.

**Bargains** appear at minor ports — opportunities to buy goods below the current market price. They have limited stock and rotate over time. They reward being in the right place at the right time, not memorizing a spreadsheet.

**Prospects** appear at major ports — contracts from NPCs requesting delivery of specific goods at premium prices. Players can hold a limited number of active Prospects simultaneously (suggest 3–4). Fulfilling a Prospect yields above-market payment and can trigger narrative consequences (e.g., supplying munitions to a faction affects regional conflict).

**Affiliation gating**: Following Sunless Skies, better Bargains and Prospects unlock as faction standing increases. A Villainy-equivalent faction at high standing opens smuggling routes; an Establishment-equivalent opens official government contracts. This ties economic progression to character identity — your trade opportunities reflect who you are and who you know.

**Multiplayer adaptation**: In Sunless Skies (single-player), Bargains and Prospects rotated on timers. In our multiplayer context, Bargains should be **first-come, first-served with limited stock** — multiple captains competing for the same deal creates emergent rivalry. Prospects could be **unique per player** (QBN-generated based on individual qualities) or **shared and competitive** (first to deliver wins). Both approaches have merit; playtesting should determine the balance.

### Faucet-Sink Equilibrium

The central challenge of any persistent MMO economy: currency enters faster than it leaves, causing inflation. Our design targets a mild, controlled inflation rate (1–3% over time) that rewards active play without punishing savings.

**Faucets** (currency enters the economy):

| Faucet                    | Type            | Notes                                        |
| ------------------------- | --------------- | -------------------------------------------- |
| Freight payments          | NPC-generated   | Scales with route BTN                        |
| Passenger fares           | NPC-generated   | Scales with route traffic                    |
| Speculative trade profits | Market-mediated | Net new currency only when selling to NPCs   |
| Job/quest payouts         | NPC-generated   | Primary income for new players               |
| Prospect premiums         | NPC-generated   | Above-market payments for delivery contracts |

**Sinks** (currency leaves the economy):

| Sink                        | Type               | Scaling behavior                              |
| --------------------------- | ------------------ | --------------------------------------------- |
| Mortgage payments           | Fixed recurring    | Scales with ship value                        |
| Fuel costs                  | Variable recurring | Scales with travel distance                   |
| Crew wages                  | Fixed recurring    | Scales with crew size                         |
| Maintenance/repairs         | Variable recurring | Scales with ship wear and combat              |
| Docking fees                | Per-visit          | Scales with port quality                      |
| Transaction taxes           | Per-trade          | Scales with trade volume (most reliable sink) |
| Customs duties              | Per-trade          | Scales with cargo value                       |
| Insurance premiums          | Recurring          | Scales with ship and cargo value              |
| Cosmetic/prestige purchases | Voluntary          | Scales with wealth (progressive sink)         |

**Transaction taxes deserve special attention.** Every successful MMO uses them as the backbone sink: EVE Online charges 2–5% market tax + broker fees; Guild Wars 2 charges 15% total; WoW charges 5%. For a merchant game, these map naturally to port tariffs, customs duties, and brokerage charges. Suggest starting at 5–8% total and tuning from there.

**Progressive sinks** (scaling with wealth) are critical to prevent concentration: luxury ship upgrades, prestige berths, rare cosmetics, faction donations, and port development investments. These should feel like aspirational spending, not punishment.

### Fuel and Supplies as Resource Narrative

Adapted from Sunless Sea/Skies: fuel and supplies are the persistent economic drain that mirrors the mortgage's pressure but operates on a per-voyage basis.

- **Fuel**: Consumed continuously while traveling. Faster engines burn more. Cargo weight increases consumption. Running out mid-voyage is a survival crisis that triggers desperate QBN storylets (distress calls, rationing, drift).
- **Supplies**: Feed the crew over time. Running low triggers morale events, rationing decisions, potential mutiny.
- **Uniform pricing** (Sunless Skies approach): Fuel and supplies cost the same at every port. This prevents fuel-arbitrage from becoming a degenerate strategy and keeps the focus on trade goods. (Alternative: slight regional variation to create logistics gameplay. Playtest both.)

These costs function as a **ticking clock** that forces the captain to keep moving and trading. Combined with the mortgage, they create two layers of economic pressure: long-term (monthly mortgage) and short-term (per-voyage fuel/supply burn).

### Player-to-Player Economy

**Regional markets, not global**: Following EVE Online's model, each port has its own market with local prices. This is essential for the merchant fantasy — buying low in one place and selling high in another IS the game. A single global market would destroy this.

**Information is gameplay**: In a text-based game, knowing where to buy cheap and sell dear is the core skill. Price information should propagate realistically — market data from distant systems is delayed or unavailable unless you have contacts there. This creates a role for information brokers and rewards exploration.

**Market mechanism**: Suggest a hybrid approach:

- **NPC-mediated trade** for routine commerce (freight, passengers, selling speculative goods at ports)
- **Player-to-player direct trade** for specialized goods, contracts, and favors
- **Regional bulletin boards** (not full auction houses) for posting buy/sell offers at specific ports

Full auction houses improve efficiency but kill social trading and enable price manipulation. Regional bulletin boards preserve information asymmetry and distance friction while enabling player commerce. Trust and reputation between traders becomes paramount in a text environment.

**Dual currency**: Consider a premium currency (e.g., Concord Credits or Star Scrip) exchangeable with the base currency at a dynamic rate. This serves three purposes: (1) undercuts black market RMT by providing a sanctioned exchange, (2) acts as a real-time inflation indicator, (3) allows time-rich/money-poor players and money-rich/time-poor players to each play their way. The exchange rate itself becomes a market signal for developers monitoring economic health.

**Bot/RMT prevention**: Text interfaces are easier to bot than graphical ones. Defenses include: CAPTCHA-like narrative choices that require comprehension, rate-limiting on trade actions, anomaly detection on trading patterns, and the sanctioned premium currency exchange that reduces RMT demand. The smaller community of a text MMO also enables stronger social policing.

### Wealth Concentration Mitigation

Wealth concentration is inevitable in every MMO — RuneScape documents that "most of the money is in the hands of only a small clique of players." Without active intervention, veteran captains will control all profitable routes and new players will feel locked out.

**Design countermeasures:**

- **Information decay**: Trade route profitability shifts over time (dynamic markets). No permanent "I found the best route" advantage.
- **Random disruption**: Events that shake up established routes — pirate activity, faction conflicts, resource depletion, new discoveries.
- **Progressive sinks**: Costs that scale with wealth — luxury upgrades, prestige spending, faction investments.
- **New-player bootstrapping**: Starter loans from merchant guilds, guaranteed early contracts, tutorial routes with protected margins. New players need enough capital to participate immediately.
- **Diminishing returns**: Repeated exploitation of the same route yields less over time (market saturation).
- **Catch-up mechanics**: Periodic events or new region openings (Beyond exploration) that give everyone equal footing.
- **No passive income**: Avoid garrison/housing-style passive gold generation. Every credit should require active play. (Traveller lesson: the mortgage exists precisely to prevent "I'm done earning.")

### Anti-Mudflation Design

Mudflation — the progressive devaluation of currency and items as the game ages — is the default failure mode of MMO economies. Prevention requires:

- **Item degradation**: Ships, equipment, and cargo containers wear out and require replacement. This creates ongoing demand for production.
- **Destruction events**: Piracy, accidents, and combat permanently remove items. In a multiplayer context, PvP ship destruction is the most effective sink (EVE model), but must be balanced against griefing concerns.
- **No pure power creep**: New content introduces lateral options (different trade goods, new routes, specialized equipment) rather than strictly better versions that obsolete everything before them.
- **Consumables as core gameplay**: Fuel, supplies, ammunition, and repair materials are consumed and must be repurchased. These create a permanent production-consumption cycle.

### Crafting and Production

Crafting depth is a spectrum. Research suggests two viable approaches:

**Minimal crafting** (Sunless model): Players are traders, not manufacturers. Goods are produced by NPC economies; players move them. Simpler to balance, keeps focus on the merchant fantasy.

**Deep crafting** (EVE model): Players produce goods from raw materials through multi-step supply chains. Creates economic interdependence and specialization. Risk: RuneScape's paradox where "finished goods usually fetch lower prices than the components used to make them" (because crafting XP is the real product).

**Recommendation**: Start minimal. Players trade NPC-produced goods. Add crafting later if the economy needs more player interdependence. Ship upgrades and modifications could be the entry point for player production without requiring a full industrial economy.

## Connections

- **Travel**: Trade routes are travel routes; distance affects profitability; the gravity model uses parsec distance as a key input
- **Ship**: Cargo capacity constrains trade volume; fuel costs eat into margins; ship class determines which routes are viable
- **Yarnball**: Resource scarcity feeds meter pressure; money can't solve everything; mortgage stress triggers QBN storylets
- **Factions**: Faction standing affects trade access, pricing, Bargain/Prospect availability, and smuggling routes
- **Jobs**: Courier contracts are the bread-and-butter income loop (Tier 1); Prospects bridge into Tier 2
- **Multiplayer**: Regional markets, player trade, wealth concentration dynamics, aggregate supply/demand
- **QBN Engine**: Bargains, Prospects, and trade consequences are QBN storylets gated on player qualities
- **Crew**: Crew wages are a fixed sink; crew skills (Broker, Steward, Medic) affect trade outcomes

## Open Questions

- ~~Fixed vs. dynamic pricing?~~ **Resolved**: Hybrid — modifier-based pricing (Traveller) with dynamic supply/demand memory on top. Fixed base prices for fuel/supplies (Sunless Skies).
- How deep is the crafting system, if any? **Leaning minimal** — start with NPC production, add player crafting for ship upgrades if needed.
- Should the economy simulate NPC trade independently of players? **Leaning yes** — NPC trade caravans and freight maintain baseline economic activity even in low-population periods. The Far Trader prototype generates NPC job volume from BTN per tick, providing a concrete model for background economic activity.
- ~~What's the wealth curve? How do we keep endgame players engaged economically?~~ **Partially resolved**: Progressive sinks, information decay, route rotation, and Beyond exploration provide ongoing engagement. Exact wealth curve requires playtesting.
- ~~How do we handle wealth concentration without punishing success?~~ **Partially resolved**: See Wealth Concentration Mitigation section. Specific thresholds and intervention triggers TBD.
- What's the optimal transaction tax rate? Research suggests 5–15% range; need playtesting to find the sweet spot for a merchant-focused game where trade IS the gameplay.
- How do Bargains/Prospects work in multiplayer? Shared-competitive vs. per-player generation needs playtesting.
- What information propagation model? How fast does price data travel between systems? This determines how much information asymmetry exists and how valuable the "information broker" role is.
- How do we handle offline players' economic position? (Mortgage payments accumulate while offline — need a grace period or catch-up mechanic.)
- What's the right number of trade goods? Sunless Sea's 22 was too many (drove players to wikis); Sunless Skies simplified aggressively. Suggest 8–12 core commodity types with trade-code-driven availability.
- How do trade codes modify WTN/BTN? The spaaace prototype assigns boolean trade codes (Agricultural, Industrial, Rich, Poor, etc.) but does not use them to modify WTN/BTN — the original Far Trader rules do include trade code modifiers. Should we add them for richer economic differentiation?
- What's the right tick cadence for freight rate updates and job generation? The prototype uses real-time windows (10 min bid resolution, 20 min job expiry). Our turn-based model needs an equivalent pacing mechanism.

## Sources

- `docs/research/2026-03-23_traveller-economy/synthesis.md` — mortgage mechanics, speculative trade (3d6+mods), trade codes, gravity trade model (WTN/BTN), passage types, triangular trade, home-base problem
- `docs/research/2026-03-23_sunless-economy/synthesis.md` — resource narrative philosophy (Kennedy), Bargains+Prospects system, affiliation gating, fuel/supply pressure, profit spikes over steady curves
- `docs/research/2026-03-23_mmorpg-economy/synthesis.md` — faucet-sink model, EVE player-driven economy, mudflation prevention, auction house tradeoffs, transaction taxes, dual currency, wealth concentration, bot/RMT prevention, crafting economics
- `docs/research/2026-03-23_spaaace-far-trader-economy/synthesis.md` — WTN/BTN calculation chain, trade volume tables, freight rate dynamics, job generation algorithm, reverse auction mechanics, route topology
- Traveller RPG / GURPS Far Trader — trade mechanics, Eaglestone Trade Index
- Alexis Kennedy — resource narrative philosophy (scarce, reproducible, fungible)
- EVE Online — regional markets, Monthly Economic Reports, PLEX system, production-destruction loop
- RuneScape — wealth concentration data, Grand Exchange lessons, faucet-sink documentation
- Guild Wars 2 — gold-to-gems exchange, aggressive transaction taxes
- TradeWars 2002 — text-based space trading precedent
