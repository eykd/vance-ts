# Character

> Player identity and progression through expanding capabilities, not stat inflation.

## Overview

You are a captain. Your identity comes from your ship, your crew, your routes, your faction ties, and the choices you've made — not from a stat sheet. Progression means expanding what you _can do_ and _where you can go_, not making numbers bigger.

## Core Design

### Player Identity

- Captain qualities (skills, reputation, traits) emerge from play, not from pre-game stat allocation
- Identity expressed through choices, not class selection — but choices must be constrained enough to create distinct identities
- Crew composition is the primary expression of player personality: who you hire defines who you are as a captain
- Ship configuration is the secondary expression: what modules you install defines your playstyle

### Character Creation as World Introduction

Character creation should teach the setting, not optimize stats. From Perko: "Instead of carefully weighting their stats, allow players to simply choose A, B, or C — several times."

- Present a series of setting-embedded choices: which faction's port do you start from? What kind of cargo was your first job? Who did you apprentice under?
- Each choice reveals a slice of the world — the player learns about factions, trade routes, and cultural norms through the creation process
- Choices provide chunky starting archetypes tied to the setting (faction, culture, background) that give immediate identity
- No stat screens, no point-buy, no min-maxing — identity emerges from narrative choices that happen to have mechanical consequences
- Character creation is short and replayable — different starting choices lead to genuinely different early game experiences

### Kill Boolean Choices

Binary moral choices are "the plague of RPG dialogue design." Players choose once (good/evil, paragon/renegade) and then merely reaffirm that choice for the rest of the game.

- Choices must change the avatar's future options, not just set world flags. Choosing to help a faction doesn't just set a reputation number — it opens new storylets and closes others.
- Avoid "choose your alignment" moments. Instead, let alignment emerge from the accumulation of small, fragmented decisions made under pressure.
- Social and narrative play needs a mechanically complex base system to support it — the yarnball of interlocking meters provides that foundation. "It's easier to make social play subordinate to some other game which is complex enough to stand on its own."
- For MMO context: individual quest results should compile into aggregate world outcomes ("50 players defeat aliens = aliens pushed back"), giving individual choices weight at scale

### Advancement

Three types of advancement, used in combination to create layered progression:

- **Threshold advancement**: Unlock new tiers of capability at defined milestones. Reaching a faction reputation threshold opens a new tier of missions. Visiting enough systems unlocks navigator abilities. These are discrete gates that expand the possibility space.
- **Spent advancement**: Invest resources to gain skills or capabilities. Spend credits to train at a faction academy. Spend time apprenticing with a skilled crew member. The resource cost creates meaningful tradeoffs — spending on advancement means not spending on ship upgrades or trade goods.
- **Acquired advancement**: Gain through doing. Successfully navigating a hazardous route improves navigation skill. Surviving combat improves tactical awareness. This is the "learn by doing" axis that rewards engagement with specific content.

Design principles for all advancement:

- Be stingy with rewards — long lead-up builds anticipation and makes advancement feel significant
- Wider capability, not bigger numbers. Advancement means new options appear in encounters, not that existing options become statistically better.
- Advancement should never flatten earlier challenges. A skilled captain still faces pressure from the same survival meters; they just have more options for managing them.

### Ship as Character Extension

- Ship configuration is the primary expression of playstyle — the ship is not equipment the character wears, it's an extension of who the character is
- Ship history as narrative (repairs, modifications, journeys taken) — the ship accumulates story
- Ship upgrades are character advancement: expanding ship capability expands what the player can do and where they can go
- Construction chains (early upgrades enabling mid-game capabilities) create a sense of building toward something over time

### Crew as Character Extension

- The player defines their captain's personality through companion choice — this is continuous and ongoing, not a one-time selection
- Hiring decisions are character decisions: choosing an ex-military crew signals a different captain than choosing a scholar
- Crew skills extend the player's capability without inflating the player's stats
- Losing or rotating crew changes the captain's identity, creating ongoing character evolution
- **Crew faction connections extend the captain's reach**: A crew member with high faction reputation opens storylets the captain couldn't access alone. Over time, these connections "rub off" on the captain through acquired advancement — the captain builds their own reputation through interactions the crew member enabled. See [Crew — Reputation Rub-Off](crew.md#reputation-rub-off).
- **The captain is mechanically a crew member**: The captain shares comfort meters with crew, has their own faction/social meters, and participates in the same social graph. What distinguishes the captain is player agency, not mechanical privilege.

## Connections

- **Ship**: Ship is the primary character expression; ship progression is character progression
- **Crew**: Crew composition reflects player values and defines captain personality
- **Factions**: Faction ties define social identity; faction reputation thresholds are advancement gates
- **QBN**: Player qualities gate the full storylet space; advancement expands which storylets can fire

## Open Questions

- ~~Is there character creation, or does identity emerge from play?~~ Resolved: both. Character creation is a short, setting-embedded series of choices that provides a starting archetype, then identity continues to emerge from play decisions.
- What happens if a player loses their ship? (permadeath of ship?) — ship history is narrative capital; losing it should be devastating but not game-ending
- How do other players perceive your character? What's visible? (ship type, crew composition, faction ties, reputation — but not internal stats)
- ~~How does long-term play stay interesting without power creep?~~ Resolved: advancement expands options rather than inflating stats; challenges exert continual pressure rather than being flattened; crew churn and faction dynamics keep the social landscape shifting.
- ~~How do the three advancement types (threshold/spent/acquired) map to specific game systems?~~ **Resolved**:
  - **Threshold**: Faction reputation tiers (unlock dossier slots, mission types, trade access), ship hull upgrades (unlock new module slot counts), route discoveries (unlock Beyond content)
  - **Spent**: Training at faction academies (credits → skills), ship module installation (credits + port time → capability), crew recruitment (credits → social capability)
  - **Acquired**: Reputation rub-off from crew faction connections (time with crew → personal faction rep), navigation skill from successfully flying hazardous routes, broker skill from completing trades, combat awareness from surviving fights
- What starting archetypes exist, and how do they map to factions and regions?

## Sources

- Perko, "Advancement" (2006-08-08) — threshold/spent/acquired taxonomy, stinginess principle
- Perko, "Character Creation as World Introduction" (2012-11-06) — creation as world tour, chunky choices
- Perko, "Games with Class" (2005-12-02) — kill classes for MMOs, continuous skills
- Perko, "Skyrim" (2011-01-13) — chunky archetypes for replayability and early identity
- Perko, "Boolean Choices" (2007-04-09) — kill binary moral choices, complex mechanics for social play
- Perko, "An Article on Choice" (2009-12-02) — choices must change avatar's future options
- Perko, "Limited Choice but Big Choices" (2007-05-16) — aggregate quest results at MMO scale
- Perko, "Good/Bad Game Design" (2015-08-11) — crew choice as player identity
- Perko, "Crafting Party Members" (2013-02-14) — talents + visual perks over stat rolls
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`
