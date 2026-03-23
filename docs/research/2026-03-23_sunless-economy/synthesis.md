# Sunless Sea / Sunless Skies: Economy & Trade Design

**Research briefing for Vance-TS merchant-captain MMORPG**
**Date:** 2026-03-23

---

## Executive Summary

Failbetter Games iterated significantly on trade design between Sunless Sea (2015) and Sunless Skies (2018). Sea used a static, wiki-solvable trade matrix across 30+ ports that became trivial once players found optimal routes. Skies replaced this with a dynamic system of **Bargains** (discounted buy opportunities at minor ports) and **Prospects** (premium sell contracts at major ports), gated behind an **affiliation** progression system. Meanwhile, Alexis Kennedy (Failbetter founder, later Weather Factory) evolved his design philosophy from "quality-based narrative" to **"resource narrative"** -- the principle that drama emerges naturally when players strategically manipulate scarce, reproducible, fungible resources. For our Vance-galaxy MMORPG, the critical takeaways are: fuel/supply as a persistent economic drain, dynamic trade opportunities over static routes, and affiliation-gated access to better deals.

---

## Key Findings

### 1. Sunless Sea: The Static Trade Model

**Port Reports as starter income.** New captains earn money by visiting ports and delivering intelligence reports back to London's Admiralty. Each report yields 1 fuel + a small cash payment. This creates a natural exploration incentive loop: visit new ports to fund further exploration.

**Fixed buy/sell prices across 22 goods and 30+ ports.** Trade in Sea was a lookup table. Players could calculate optimal routes (e.g., the Sphinxstone run from Salt Lions to London, or Sunlight/Wine cycling). Once a player found the best route, they repeated it indefinitely.

**Fuel and supplies as the primary sink.** Fuel is consumed continuously while moving; faster engines and lights-on burn more. Supplies feed the crew over time. London is the cheapest supply source; fuel is cheapest at Hell-adjacent ports (Iron Republic). These ongoing costs create constant pressure to earn, functioning similarly to the ship mortgage in Traveller -- a ticking clock that forces the captain to keep moving and trading.

**What went wrong.** The economy was "trivially solvable" once players accumulated enough starting capital. Optimal routes were documented on wikis within weeks of release. Early-game grind was punishing (players needed echoes for better ships/weapons, but profitable routes required dangerous waters), while late-game trade became background noise -- supplementary income rather than meaningful gameplay. The complexity of 22 goods across 30+ ports drove players to external tools rather than creating in-game engagement.

### 2. Sunless Skies: The Dynamic Trade Redesign

Failbetter explicitly identified Sea's trade problems and redesigned from scratch with three goals: **clarity with complexity**, **risk and reward via profit spikes**, and **narrative integration**.

**Simplified market structure (three rules):**

- Major ports buy any trade good at base price
- Minor ports sell a single export good at base price
- Fuel costs 20 Sovereigns and Supplies cost 40 Sovereigns everywhere (uniform pricing removes fuel-arbitrage)

**Bargains** appear at minor ports -- opportunities to buy goods below base price (e.g., Jumbles of Undistinguished Souls at 45 instead of 70 Sovereigns). They have limited stock and rotate over time. This replaces static price differentials with time-limited opportunities that reward being in the right place at the right time.

**Prospects** appear at major ports -- contracts from NPCs requesting delivery of specific goods at premium prices. Players can hold up to 4 active Prospects simultaneously. Fulfilling a Prospect yields above-market payment and can trigger narrative consequences (e.g., supplying munitions to a faction affects regional conflict). Prospects also rotate, creating urgency.

**Tighter cargo constraints.** Locomotives have limited hold space. Combined with higher per-unit profits, this shifts the gameplay from "run the same route 50 times" to "make deliberate strategic choices about which opportunities to pursue."

**Design intent: profit spikes over steady curves.** Rather than reliable, predictable income from memorized routes, Skies creates intermittent high-value payoffs. Players scan for Bargains, match them to active Prospects, and execute. The unpredictability keeps trade engaging across the full game.

### 3. The Affiliation System

Four affiliations gate access to progressively better trade opportunities:

| Affiliation       | Theme                                   | Trade flavor                               |
| ----------------- | --------------------------------------- | ------------------------------------------ |
| **Academe**       | Universities, research, ancient secrets | Research contracts, rare specimens         |
| **Bohemia**       | Artistic circles, counterculture        | Art goods, exotic curiosities              |
| **Establishment** | Ministry, high society, respectability  | Official contracts, premium goods          |
| **Villainy**      | Criminal underworld                     | Smuggling routes, stolen goods, contraband |

Affiliations increase through character creation choices (Facets), officer recruitment, and story decisions. Higher affiliation unlocks more profitable Bargains and Prospects within that faction's domain. At Villainy 3+, players unlock an entire smuggling questline.

This system ties economic progression to character identity -- a captain's trade opportunities reflect who they are and who they know, not just what route they memorized.

### 4. Kennedy's Resource Narrative Philosophy

Alexis Kennedy retired the term "quality-based narrative" (QBN) in favor of **"resource narrative"** because QBN was misleading and erased useful distinctions between different types of game values.

**Core definition:** A resource narrative is a system where "there is an explicit narrative with a game-like focus on strategically manipulating a set of limited resources."

**Three requirements for effective resource narratives:**

1. **Scarce** -- Resources must be limited to force meaningful choices
2. **Reproducible** -- Players can consistently regenerate/acquire them through gameplay
3. **Fungible** -- Resources can be traded or converted, creating strategic tension and opportunity costs

Kennedy notes that reproducibility and scarcity are in tension. A game effectively ends when this tension breaks: either the player has so much that scarcity vanishes (removing meaningful decisions), or resources become so scarce the player cannot continue.

**"Poetic design"** is Kennedy's term for "selection and design of resource interactions as a context from which drama should tend to emerge." The designer does not script dramatic moments; instead, they create resource systems whose interactions naturally produce drama. Events should "emerge in a natural-seeming way from the combination of resource states."

**Alignment with story:** "The nature and the interrelationship of the resources aligns with the grain of the story." In Sunless Sea, fuel/supplies/terror/hull map directly to the fiction of a captain struggling against a dark underground ocean. The resources ARE the story.

### 5. Fuel/Supply as Core Economic Pressure

Across both games, fuel and supplies serve as the fundamental economic drain:

- **Sunless Sea:** Fuel consumed by movement (rate depends on engine and light); supplies consumed by crew over time. Terror rises in darkness. All three create a constant ticking clock.
- **Sunless Skies:** Fuel consumed by locomotive movement (1 unit = 3 minutes at 1.0x efficiency); weight from cargo increases consumption. Supplies can substitute for fuel in emergencies, providing a safety valve.

This mirrors Traveller's ship mortgage: a persistent cost that prevents players from ever feeling "done" with the economy. The captain must always earn, creating ongoing engagement with trade, missions, and exploration.

### 6. What Worked and What Didn't

**Sunless Sea -- what worked:**

- Port reports as natural exploration incentive
- Fuel/supply pressure creating genuine tension
- Atmospheric integration of economy with dark-ocean fiction
- Early-game survival intensity

**Sunless Sea -- what didn't work:**

- Static trade matrix trivially solvable via wikis
- Punishing early-game grind before profitable routes accessible
- Late-game trade became meaningless background income
- 22 goods x 30+ ports = complexity that drove players to external tools, not engagement

**Sunless Skies -- what worked:**

- Bargains/Prospects create dynamic, unpredictable trade
- Affiliation gating ties economy to character identity
- Narrative consequences for trade decisions
- Simpler base rules with emergent complexity
- Prospect rotation creates urgency without artificial timers

**Sunless Skies -- what didn't work (common criticisms):**

- Some players found the starting area (the Reach) too generous, reducing tension
- Prospect rotation could feel arbitrary when a lucrative opportunity vanished before the player could act
- Reduced difficulty compared to Sea disappointed players who valued survival tension
- The simplified market structure (minor ports sell one thing, major ports buy everything) could feel game-y

---

## Evidence Ledger

| #   | Source                                                                                                                   | Key data extracted                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 1   | [Kennedy: QBN to Resource Narratives](https://weatherfactory.biz/qbn-to-resource-narratives/)                            | Resource narrative framework, scarce/reproducible/fungible, poetic design definition         |
| 2   | [Failbetter: Trade in the Skies -- Roche Limit](https://www.failbettergames.com/news/trade-in-the-skies-roche-limit)     | Bargains/Prospects design, market simplification, affiliation integration, design philosophy |
| 3   | [Steam: Prospects & Bargains Now Live](https://steamcommunity.com/games/596970/announcements/detail/1470853226394055365) | System launch details, mechanical specifics                                                  |
| 4   | [Sunless Sea Wiki: Fuel](https://sunlesssea.fandom.com/wiki/Fuel)                                                        | Fuel mechanics, consumption rates, light/engine interaction                                  |
| 5   | [Steam Guide: Fuel, Supplies and Officers](https://steamcommunity.com/sharedfiles/filedetails/?id=379176889)             | Port report rewards (1 fuel + echoes), supply sourcing                                       |
| 6   | [Sunless Sea Wiki: Trade Route Strategies](https://sunlesssea.fandom.com/wiki/Trade_Route_Strategies)                    | Optimal routes documented, demonstrating solvability                                         |
| 7   | [Sunless Skies Wiki: Affiliations](https://sunlessskies.fandom.com/wiki/Affiliations)                                    | Four affiliations, progression mechanics, trade gating                                       |
| 8   | [Sunless Skies Wiki: Sovereign](https://sunlessskies.fandom.com/wiki/Sovereign)                                          | Currency system, uniform fuel/supply pricing                                                 |
| 9   | [Steam Discussion: Economy feels unforgiving](https://steamcommunity.com/app/304650/discussions/0/617320168191313417/)   | Player criticism of Sea's early-game grind                                                   |
| 10  | [Steam Discussion: Challenge lost in Skies](https://steamcommunity.com/app/596970/discussions/0/1742231069937409444/)    | Criticism that Skies reduced survival tension                                                |

---

## Gaps

- **Multiplayer economy dynamics.** Both Sunless games are single-player. No data on how Bargains/Prospects would behave with multiple competing captains. This is critical for our MMORPG context.
- **Inflation/deflation over time.** No published analysis of how Skies' economy behaves across a full 40+ hour playthrough -- whether late-game Sovereigns become meaningless.
- **Kennedy's "Against Worldbuilding" essays.** The full book likely contains deeper treatment of resource narrative principles; only the blog post was accessible.
- **Fallen London's QBN economy.** The browser game has a more mature QBN economy than either Sunless title, but its trade mechanics were not covered in this research pass.
- **Specific Prospect narrative consequences.** The Failbetter post mentions trade decisions affecting regional conflicts, but no detailed examples were found.

---

## Suggested Further Research

1. **Fallen London's Bazaar economy** -- The browser game's decade-long live economy has more relevance to an MMO than either single-player title. Research how item sinks, seasonal events, and social actions maintain economic health.
2. **Kennedy's "Against Worldbuilding" book** -- Full text likely contains the most developed version of the resource narrative framework, including examples not covered in the blog post.
3. **EVE Online's dynamic economy** -- The closest real-world parallel to "Bargains/Prospects in multiplayer." How do dynamic trade opportunities work when thousands of players compete?
4. **Traveller RPG mortgage mechanics** -- Direct comparison to fuel/supply pressure. How does the ship mortgage create campaign-sustaining economic tension in tabletop play?
5. **Failbetter's GDC/talk archives** -- Lottie Bevan and other Failbetter staff have given talks on Skies' design evolution that may contain implementation details not in blog posts.
