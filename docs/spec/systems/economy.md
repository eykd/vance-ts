# Economy

> Trade, currency, and the economic pressure that drives the player loop.

## Overview

The economy is what forces interesting decisions. You have a ship, you have a mortgage, and you need to make money. The question isn't whether to trade — it's _where_, _what_, and _with whom_. Three research streams inform this design: Traveller's mortgage-driven trade loop, Sunless Skies' resource narrative, and MMORPG faucet-sink equilibrium.

## Core Design

### The Mortgage

_TODO: Define mortgage mechanics, payment schedule, consequences_

From Traveller: fixed monthly ship payment (1/240th of purchase price) that makes trading survival, not tourism. The mortgage is the fundamental pressure that keeps the player moving.

### Trade Model

_TODO: Define trade mechanics, pricing, route calculation_

Inputs from research:

- **Speculative trade** (Traveller): buy low, sell high based on trade codes and modifiers
- **Gravity trade model** (Far Trader): World Trade Number × Bilateral Trade Number for calculating inter-world trade volume — directly implementable from galaxy generation pipeline
- **Resource narrative** (Kennedy/Sunless): resources must be "scarce, reproducible, and fungible"; drama emerges from resource interactions

### Faucet-Sink Equilibrium

_TODO: Define currency sources and drains_

From MMORPG research:

- **Faucets**: job payouts, trade profits, quest rewards
- **Sinks**: mortgage payments, fuel, repairs, crew wages, docking fees, transaction taxes
- Transaction taxes are the most reliable sink
- Must prevent mudflation (currency devaluation over time)

### Player-to-Player Economy

_TODO: Define scope of player trade, auction house vs. direct trade_

Open design questions from MMORPG research:

- EVE-style player-driven vs. NPC-mediated hybrid
- Auction house tradeoffs (convenience vs. social interaction)
- Dual currency considerations
- Bot and RMT prevention in text format

## Connections

- **Travel**: Trade routes are travel routes; distance affects profitability
- **Ship**: Cargo capacity constrains trade volume; fuel costs eat into margins
- **Yarnball**: Resource scarcity feeds meter pressure; money can't solve everything
- **Factions**: Faction standing affects trade access and pricing
- **Jobs**: Courier contracts are the bread-and-butter income loop
- **Multiplayer**: Shared market, player trade, economic impact visibility

## Open Questions

- Fixed vs. dynamic pricing? (Traveller uses modifiers; Sunless uses fixed)
- How deep is the crafting system, if any?
- Should the economy simulate NPC trade independently of players?
- What's the wealth curve? How do we keep endgame players engaged economically?
- How do we handle wealth concentration without punishing success?

## Sources

- `docs/research/2026-03-23_traveller-economy/synthesis.md` — mortgage, speculative trade, gravity model
- `docs/research/2026-03-23_sunless-economy/synthesis.md` — resource narrative, Bargains+Prospects
- `docs/research/2026-03-23_mmorpg-economy/synthesis.md` — faucet-sink, mudflation, EVE model
- Traveller RPG / GURPS Far Trader — trade mechanics
- Alexis Kennedy — resource narrative philosophy
