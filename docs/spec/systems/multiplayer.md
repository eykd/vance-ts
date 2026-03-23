# Multiplayer

> The MMO layer: shared economy, faction dynamics, and asynchronous interaction.

## Overview

This is a text MMORPG, but "massively multiplayer" doesn't mean real-time action with thousands on screen. It means a shared, persistent world where player actions have visible impact on the economy, faction dynamics, and trade network. Interaction is primarily asynchronous — players affect each other through the world state, not through direct real-time encounters.

## Core Design

### Shared World State

The world state divides into shared (all players see the same thing) and per-player (individual progression) layers.

**Shared state:**

- **Market prices**: Regional markets at each port reflect aggregate supply and demand from all player activity. When many captains flood a port with grain, grain prices drop for everyone.
- **Faction power dynamics**: Faction influence over regions shifts based on collective player allegiance and trade patterns. Supplying munitions to a faction strengthens it visibly.
- **Trade route conditions**: Route safety, pirate activity levels, and traffic density reflect aggregate player and NPC behavior.
- **Beyond discoveries**: When a player charts a new system in the Beyond, that discovery enters the shared map. First-discoverer credit is permanent.
- **Economic indicators**: Aggregate money supply, trade volume by region, and price indices are world-level data (analogous to EVE Online's Monthly Economic Reports, scaled for our context).

**Per-player state:**

- Character qualities (skills, reputation, faction standing)
- Active jobs, Prospects, and quest progress
- Ship condition and cargo
- Personal trade history and contacts
- QBN storylet availability (gated on individual qualities)

### Player-to-Player Interaction

**Regional trade**: Players trade through regional port markets — posting buy/sell offers on local bulletin boards, not a global auction house. This preserves the merchant fantasy where distance and information asymmetry create profit opportunities. Full auction houses improve efficiency but kill social trading and enable price manipulation (RuneScape's Grand Exchange lesson).

**Direct trade**: Players at the same port can trade directly — goods, information, or services. Trust and reputation matter in a text environment where you cannot inspect goods visually. A player's trade history and reputation score become their currency of trust.

**Player-created contracts**: Adapted from EVE's contract system. Players can post courier contracts (pay another captain to deliver cargo), bounties (pay for information or action), and partnership offers (shared investment in speculative trade). This creates emergent economic relationships.

**Communication**: Faction channels, port-local chat, and direct messaging. Smaller text-MMO communities self-police more effectively than massive graphical MMOs — social reputation carries real weight.

**Merchant organizations**: Player-formed groups (guilds, trading companies, cartels) that share market intelligence, coordinate routes, and pool resources. These emerge naturally from economic interdependence — EVE Online corporations are essentially companies with shared assets and payrolls. The design should support but not require organizational play.

### Asynchronous Design

Turn-based pacing means players don't need to be online simultaneously. The world evolves continuously, but individual players interact with it on their own schedule.

- **Market updates**: Prices adjust based on accumulated trade activity since the player's last visit. A port you haven't visited in a week may have very different prices.
- **Job expiration**: Prospects and time-sensitive contracts expire based on game-world time, not player-online time. This creates urgency without requiring real-time play.
- **Faction shifts**: Faction influence changes gradually based on aggregate player actions. A single player's contribution matters but doesn't swing the balance overnight.
- **Offline protection**: Players' ships and assets are safe while offline (no EVE-style offline vulnerability). The mortgage still accrues, but a grace period prevents returning to bankruptcy after a vacation.

### Wealth Concentration and New Player Experience

Wealth concentration is the most dangerous threat to a multiplayer economy. Research from every major MMO confirms it: without intervention, a small elite controls the economy and new players feel locked out.

**The problem**: Compound returns favor the wealthy — rich captains can invest in bulk trading, control scarce routes, and exploit information advantages that poor captains cannot access. Time investment compounds this further.

**Structural countermeasures** (see economy.md for full detail):

- **Dynamic markets** prevent permanent route ownership — profitable routes shift as supply/demand changes
- **Information decay** — market data ages; yesterday's hot tip may be stale
- **New player bootstrapping** — starter loans from merchant guilds, guaranteed early contracts with protected margins, tutorial routes in Oikumene space
- **Progressive sinks** — luxury upgrades, prestige spending, and faction investments that scale with wealth
- **No passive income** — every credit requires active play; no garrison-style gold printing
- **Beyond exploration** as equalizer — newly discovered regions offer fresh opportunities where veterans have no established advantage

**Mentorship incentives**: Wealthy players should benefit from helping new players. Referral bonuses, faction reputation for sponsorship, and trade network effects (more active traders = more market liquidity = better prices for everyone) create positive-sum dynamics.

### Griefing Prevention

Text-based environments face specific griefing vectors:

- **Market manipulation**: Organized groups cornering low-volume commodity markets. Mitigation: NPC market makers that provide floor/ceiling prices on essential goods, preventing complete market lockout.
- **Information griefing**: Spreading false market data or misleading route information. Mitigation: reputation systems that track information reliability; verified market data from official sources (port authorities) vs. unverified player tips.
- **Route camping/piracy griefing**: Repeatedly targeting the same player. Mitigation: Oikumene space has law enforcement NPCs that respond to piracy; piracy penalties scale with repeat offenses against the same target. Beyond space is more lawless (by design) but offers alternative routes.
- **Economic harassment**: Deliberately crashing a market to hurt a specific player. Mitigation: transaction taxes make manipulation expensive; NPC demand provides a floor; market recovery mechanics prevent permanent damage.
- **New player targeting**: Veterans exploiting information advantage to strip new players. Mitigation: protected starter routes, tutorial economy with training wheels, and reputation penalties for predatory behavior toward low-level players.

**Philosophy**: Some conflict is desirable — piracy, trade competition, faction rivalry, and market competition are core gameplay. The line is between **competitive play** (I outtraded you because I read the market better) and **griefing** (I deliberately destroyed your experience with no benefit to myself). Design should make competitive play rewarding and griefing expensive.

### World Impact

Player actions change the shared world in visible, meaningful ways.

- **Economic impact**: Aggregate trade activity shifts regional prices, creates booms and busts, and opens or closes trade routes. A player caravan flooding a market with cheap goods visibly depresses prices for everyone.
- **Faction dynamics**: Player trade allegiances and quest completions shift faction influence. If many players supply Faction A with military goods, Faction A's territorial control expands.
- **Infrastructure development**: Player investment in ports (contributing to upgrades, funding construction) could improve port facilities over time — better starport class means better trade opportunities for everyone.
- **Beyond expansion**: Player exploration of the Beyond gradually expands the known galaxy. First-discoverer credit, naming rights, and early-mover trade advantages reward pioneers.
- **Narrative evolution**: Major world events emerge from aggregate player behavior rather than developer scripting. When enough players arm a faction, war breaks out. When trade routes shift, economies reshape.

### Economic Monitoring

Following EVE Online's practice of hiring a full-time economist, the game should include built-in economic monitoring tools:

- **Money supply tracking**: Total currency in circulation, velocity of money, inflation/deflation indicators
- **Trade volume by region**: Which routes are active, which are dead
- **Wealth distribution**: Gini coefficient or similar measure; alerts when concentration exceeds thresholds
- **Sink/faucet ratios**: Are sinks keeping up with faucets? Where is currency accumulating?
- **Price indices**: Commodity price baskets tracked over time

These metrics inform balance tuning and can trigger automatic or manual interventions (adjusting tax rates, introducing new sinks, seeding NPC trade activity in dead regions).

## Connections

- **Economy**: Shared market, aggregate supply/demand, wealth concentration dynamics, faucet-sink monitoring
- **Factions**: Player-influenced faction dynamics; faction standing affects multiplayer interactions
- **QBN Engine**: World-level qualities that reflect MMO state (faction power, regional economics, conflict status)
- **Travel**: Shared discovery of routes and systems; route conditions reflect aggregate activity
- **Jobs**: Player-created contracts; competitive Prospects; cooperative mission chains

## Open Questions

- ~~How does the MMO layer work?~~ **Partially resolved**: Regional markets, asynchronous interaction, shared world state with per-player progression. Implementation details TBD.
- What's the server architecture? (Cloudflare Workers + D1?) — Technical architecture for persistent world state, market simulation, and player interaction needs dedicated design.
- ~~How do we handle griefing in a text environment?~~ **Partially resolved**: See Griefing Prevention section. Specific enforcement mechanisms and penalty scaling TBD.
- What's the player cap per shard/world? Thinner markets with fewer players need NPC market makers to provide liquidity. What's the minimum viable player population for a functional economy?
- How do new players encounter existing players' impact? — Visible price histories, faction power displays, discovery credits, and port development levels all show the world other players have shaped.
- ~~Turn cadence: free-form or time-gated (X turns per day)?~~ Leaning free-form with natural pacing from travel time and fuel costs, but daily turn caps could prevent no-lifers from dominating the economy. Needs playtesting.
- How much NPC economic activity should simulate the background economy? Too little and low-population periods feel dead; too much and player actions feel insignificant.
- What's the right balance between competitive and cooperative multiplayer? EVE skews heavily competitive; Sunless games are single-player. Our Vance-inspired setting suggests a world where everyone is out for themselves but temporary alliances are pragmatic.

## Sources

- `docs/research/2026-03-23_mmorpg-economy/synthesis.md` — EVE player-driven economy, regional markets, wealth concentration, griefing, bot/RMT prevention, auction house tradeoffs, transaction taxes, economic monitoring, crafting economics, text-game design lessons
- `docs/research/2026-03-23_sunless-economy/synthesis.md` — single-player economy lessons, Bargains/Prospects multiplayer adaptation gap, affiliation system
- `docs/research/2026-03-23_traveller-economy/synthesis.md` — home-base problem, price convergence in multiplayer, gravity trade model for NPC traffic
- EVE Online — regional markets, Monthly Economic Reports, PLEX, corporate structures, production-destruction loop
- RuneScape — Grand Exchange lessons, wealth concentration data, market manipulation taxonomy
- Guild Wars 2 — gold-to-gems exchange, transaction tax design
- TradeWars 2002 — text-based space trading precedent (port price response to supply/demand)
- Ultima Online — ecology simulation collapse (players optimize harder than designers expect)
