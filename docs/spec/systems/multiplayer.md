# Multiplayer

> The MMO layer: shared economy, faction dynamics, and asynchronous interaction.

## Overview

This is a text MMORPG, but "massively multiplayer" doesn't mean real-time action with thousands on screen. It means a shared, persistent world where player actions have visible impact on the economy, faction dynamics, and trade network. Interaction is primarily asynchronous — players affect each other through the world state, not through direct real-time encounters.

## Core Design

### Shared World State

_TODO: Define what world state is shared vs. per-player_

- Economic conditions (prices, supply/demand)
- Faction power dynamics
- Discovery state (who found what in the Beyond)
- Trade route conditions

### Player-to-Player Interaction

_TODO: Define interaction modes_

- Trade (direct or mediated?)
- Communication (messaging, faction channels?)
- Reputation visibility (what can you see about other players?)
- Cooperative and competitive dynamics

### Asynchronous Design

_TODO: Define how async interaction works_

- Turn-based pacing means players don't need to be online simultaneously
- World state updates between turns
- Player impact accumulates over time

### World Impact

_TODO: Define how player actions change the shared world_

- Economy responds to aggregate player behavior
- Faction dynamics shift based on player allegiance patterns
- Beyond exploration creates permanent discoveries

## Connections

- **Economy**: Shared market, aggregate supply/demand
- **Factions**: Player-influenced faction dynamics
- **QBN**: World-level qualities that reflect MMO state
- **Travel**: Shared discovery of routes and systems

## Open Questions

- How does the MMO layer work? (This is the biggest open question in the design)
- What's the server architecture? (Cloudflare Workers + D1?)
- How do we handle griefing in a text environment?
- What's the player cap per shard/world?
- How do new players encounter existing players' impact?
- Turn cadence: free-form or time-gated (X turns per day)?

## Sources

- `docs/research/2026-03-23_mmorpg-economy/synthesis.md` — EVE model, wealth concentration
- Original vision doc — open questions section
