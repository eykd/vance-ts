# Crew

> NPC crew with moods, social needs, and emergent personalities.

## Overview

Crew members are the human element of the yarnball. They have moods, social needs, and opinions that create narrative pressure beyond mere mechanical optimization. Crew composition shapes which storylets fire and how meters behave. From Perko: 4-7 active crew is the sweet spot for meaningful social dynamics without cognitive overload. Beyond that number, players can't track individual personalities and relationships blur together.

**The captain is a special crew member**, not a separate entity class. The captain shares crew comfort meters (Hunger, Filth, Loneliness, Claustrophobia, Boredom) with the rest of the crew, experiences the same module effects, and has their own faction/social meters (Criminality, Distrust, Disinterest, Heat). What makes the captain special is player agency — the captain makes the decisions. But mechanically, the captain is one node in the same social graph as every other crew member.

## Core Design

### Hiring & Composition

- Crew available at ports, influenced by location and faction standing
- Each crew member has qualities that affect encounters and capabilities
- Crew choice defines ship identity — all fighters = pirate captain; skilled traders and navigators = merchant prince. The player defines their captain's personality through who they hire, not through dialogue trees.
- Hire for "shtick" (2-3 combined archetypes) over statistical variety. A crew member who is "ex-military engineer with a gambling problem" is more interesting than one with +2 STR. "If you have to choose between adding more variation or more shtick options, always go with shtick."
- Use talents and visual perks over stat rolls for memorable crew — each crew member should have signature capabilities that are observable in play, not hidden stat bonuses

### Mood System

NPCs enter medium-to-long-term mood states triggered by situations their personality cares about. The mood system is the primary mechanism by which crew push into player awareness.

- **Mood triggers**: Each crew member's personality template defines which situations trigger mood shifts (e.g., a social crew member enters a lonely mood after several jumps without port stops; a claustrophobic crew member deteriorates in cramped quarters)
- **Pestering**: Characters in moods pester the player, making themselves visible through chatter. This is how the game surfaces NPC state without requiring the player to check status screens
- **Mood management**: Players manage moods by interacting with characters — spending time, visiting places they enjoy, assigning preferred tasks. This creates a soft resource management layer over crew
- **Personality growth trees**: NPCs develop along personality axes, not stat axes. A crew member might become more cynical or more trusting based on events, which changes their mood triggers and chatter patterns
- **Faction-templated moods**: Crew from different factions have culturally shaped mood profiles. A crew member from a stoic culture has different triggers than one from an expressive culture

### Chatter System

Each NPC statement reveals a concrete in-world state. Chatter is both narrative texture and a game interface.

- "The food's getting stale" = supply quality dropping. "I haven't talked to anyone in days" = loneliness meter rising
- Chatter statements become reusable interaction tokens the player can reference when giving orders or talking to other NPCs — no natural language parser needed, the chatter provides the verb vocabulary
- Chatter doubles as a tutorial system: players learn what meters matter by listening to what crew complain about

### Observable Action Judgment

- NPCs evaluate the player based on observable behavior, not inferred intentions
- A crew member who values stealth notices when the captain picks locks and sneaks rather than fights — and this changes the relationship
- This creates a feedback loop where the player changes behavior to impress or manage specific crew members
- Judge NPCs by their observable actions too — players should be able to evaluate crew competence by watching what they do, not reading stat sheets

### Context-Driven Action Plans

- NPCs propose what they want to do based on the current situation, not just respond to player commands
- "Take it out, I'll support you" vs "Let's ambush it, follow my lead" are gameplay-embedded plans that advance both the encounter and the NPC relationship
- Action plans reflect the NPC's personality and current mood — a frightened crew member proposes cautious plans; an aggressive one proposes direct action
- Contexts (ongoing situations that shape NPC behavior) should be shelved and readopted to avoid repetitive nagging — an NPC who has been complaining about food quality should eventually shelve that context if nothing changes, then readopt it later

### Social Dynamics

- Crew members interact with each other, not just the player
- Social dynamics feed the yarnball (loneliness, conflict, camaraderie)
- Inter-star quiet time is where crew social dynamics primarily play out — the keyframe simulation between jumps is the stage for crew interactions
- Build fewer, denser crew members with relationships rather than many thin ones — each crew member should have opinions about and relationships with other crew members

### Crew Churn

Crew rotation is essential to prevent party stagnation and keep the social dynamics fresh.

- Send crew members on solo missions with decision-point missives — the crew member reports back with a situation and the player chooses how they respond
- Settle crew at locations (trade posts, faction outposts) where they become persistent NPCs the player can revisit
- Rotate new crew in to introduce fresh shtick and new faction perspectives
- Departing crew carry the player's reputation into the world — a well-treated crew member who settles at a station becomes a future contact

### Crew as Quality Bearers

Each crew member carries their own qualities — not just skills and personality, but **faction reputation, social meters, and consequences**. This is the fractal principle applied to crew: a crew member is a quality-bearing entity just like the player, ship, or faction.

- **Faction connections**: A supercargo with Merchant Guild Rep 8 opens guild storylets for the whole ship, even if the captain has Guild Rep 0. A first mate who's wanted by the Empire (high Heat) attracts law enforcement attention regardless of the captain's clean record.
- **Ship-level aggregation**: The QBN engine checks "does anyone aboard have Quality X >= Y?" when evaluating storylets. Crew qualities compound at the ship level — the ship's effective faction standing is the highest individual's standing among captain and crew.
- **Crew meters**: Each crew member has individual comfort meters (see [Yarnball — Crew-Level vs Ship-Level Meters](yarnball.md#crew-level-vs-ship-level-meters)). These are presented to the player as ship-level aggregates with individual outliers surfaced through chatter.

### Reputation Rub-Off

Crew faction connections **gradually transfer to the captain** through acquired advancement. Working alongside a well-connected crew member slowly builds the captain's own reputation through the interactions that crew member enables.

- A supercargo with Guild Rep 8 introduces the captain to guild contacts → captain slowly builds own Guild Rep through those introductions
- Rub-off rate is slow enough that crew retention matters — losing a connected crew member after 3 jumps yields almost nothing; keeping them for 30 jumps yields meaningful personal reputation
- When a crew member departs, the captain retains accumulated rub-off but loses access to the crew member's higher-tier storylets
- This creates a genuine cost to crew churn: fresh shtick vs. deepening faction connections

### Crew as Storylet Triggers

- Crew skills unlock encounter options
- Crew backgrounds create faction-specific storylets
- Crew moods affect encounter tone and outcomes
- Crew shtick gates unique storylets that wouldn't fire without that specific combination of archetypes aboard
- Crew faction qualities gate ship-level faction storylets — "anyone aboard with Smugglers Rep >= 5?" opens underworld contacts for the whole crew

## Connections

- **Yarnball**: Crew members carry individual comfort meters (presented as ship aggregate); crew faction qualities feed faction/social meters; crew moods are yarnball qualities. See [Yarnball — Meters](yarnball.md#meters).
- **Ship**: Crew quarters and social spaces affect morale; ship module configuration determines what crew can do between jumps; keyframe simulation evaluates crew interactions per module-enabled social spaces
- **Factions**: Crew members carry their own faction reputation that gates ship-level storylets; faction templates shape crew dialogue and mood profiles; crew can own dossier hardpoint connections. See [Yarnball — Dossier System](yarnball.md#the-dossier-system).
- **QBN**: Crew qualities (namespaced per crew member in session layer) gate storylets; crew events are storylets; chatter tokens become QBN interaction vocabulary
- **Character**: Captain is a special crew member; reputation rub-off is the acquired advancement mechanism for faction standing; crew composition is the primary expression of captain identity

## Open Questions

- ~~How deep is crew personality simulation?~~ Resolved: personality growth trees along axes (not stats), mood system with faction-templated triggers, chatter as world-state interface. Deep enough to create emergent social pressure, shallow enough to run on server.
- ~~Can crew members leave? Under what conditions?~~ **Resolved**: Yes — churn is essential. Crew depart based on sustained bad moods, narrative triggers, or player choice. Departing crew settle at locations as persistent NPCs, carry the captain's reputation into the world, and can become future contacts. The cost of departure is losing their faction connections (offset by retained rub-off reputation).
- How do crew interact with multiplayer? (Other players' crew visible? Can players trade crew members? Can a crew member who settled at a station be recruited by another player?)
- ~~What's the crew progression model? Do they level up?~~ Resolved: personality growth trees, not stat growth trees. Crew develop along personality axes based on experiences, changing their mood triggers and action plan tendencies.
- ~~How do chatter tokens work in a text-only interface?~~ **Resolved**: Text-only is actually ideal — chatter is already textual. Chatter statements appear as dialogue lines that simultaneously reveal world state and provide interaction vocabulary. No adaptation needed from Perko's visual-game assumption.
- How do crew mood systems scale in an MMO where NPCs may interact with multiple players? (Each player has their own crew instances; NPC crew at ports are shared but player-recruited crew are per-player)
- What's the right rub-off rate? How many jumps of working with a connected crew member to gain 1 point of faction reputation? (Needs playtesting)

## Sources

- Perko, "Companions" (2014-06-09) — mood system, personality leveling, faction templates, missives
- Perko, "NPC Growth and Personality" (2014-06-11) — chatter as world-state interface, interaction tokens
- Perko, "Growing NPCs" (2014-06-18) — observable action judgment
- Perko, "Character-Driven Game Design" (2018-09-10) — context-driven action plans, context shelving
- Perko, "Semiautomatic NPCs" (2014-03-31) — 4-7 crew limit, shtick over stats, churn
- Perko, "Social NPCs" (2013-04-17) — functional customization via crew, inter-star quiet time
- Perko, "Good/Bad Game Design" (2015-08-11) — crew choice as player identity
- Perko, "Crafting Party Members" (2013-02-14) — talents + visual perks over stat rolls
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`
