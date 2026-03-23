# Combat

> Abstract, handled through QBN encounters. Not a separate tactical layer.

## Overview

Combat is rare in the Oikumene (quickly quenched by law enforcement) and more common in the Beyond. It's handled through the same QBN encounter system as everything else — no separate combat mini-game. The drama comes from the consequences, not the tactics.

## Core Design

### Less Freedom, More Agency

Combat encounters follow Perko's core principle: constrained choices with meaningful consequences beat open-ended freedom with shallow consequences. The player doesn't have a hundred tactical options; they have a few, each of which reshapes what happens next.

- Each combat encounter presents 2-4 options shaped by ship qualities, crew abilities, and context
- Options are not "attack/defend/flee" generics — they are contextual plans that reflect the specific situation
- Choosing an option changes the encounter's trajectory and the player's future options. A flanking maneuver that fails doesn't just cost HP; it puts the ship in a position where new (worse) options appear.
- Binary "fight or flight" is explicitly avoided — combat choices should be fragmented and situation-specific

### Archetype-Based Combat Roles

From Perko's "kill classes, use archetypes" principle: combat capability comes from chunky, observable archetypes rather than stat-based class systems.

- Ship archetypes (armed trader, fast courier, converted warship) determine the palette of combat options available
- Crew archetypes contribute specific combat actions — a crew member with a military background offers tactical options that a merchant crew cannot
- Archetypes combine: ship type + crew composition + installed modules = the unique set of options available in any given combat encounter
- No hidden combat stats that the player must optimize — combat effectiveness should be observable and understandable from what the player has (ship, crew, modules)

### Ship Combat

- QBN encounters with combat-tagged storylets
- Ship qualities (weapons, shields, crew skill, module configuration) determine which options appear
- Crew action plans shape the encounter: crew members propose combat approaches based on their personality and mood ("I can get us behind them" from a bold pilot; "We should cut and run" from a cautious navigator)
- Outcomes range from clean escape to catastrophic damage
- Damage feeds back into yarnball (repairs needed, meter spikes, crew morale shifts, resource loss)

### Personal Combat

- Same QBN pattern as ship combat
- Player and crew qualities determine options
- Abstract resolution — no hit points or combat rounds
- Crew shtick matters: a crew member who is "ex-marine sharpshooter with a bad knee" offers different personal combat options than "retired diplomat who carries a concealed weapon"

### Combat Consequences

Combat's weight comes from its consequences, not its mechanics. Every combat encounter should leave a mark on the yarnball.

- Damage to ship modules degrades their passive meter reduction — combat literally makes daily life harder
- Crew injuries create mood shifts and reduce capability
- Reputation effects: witnesses and survivors carry news of the encounter to factions
- Resource expenditure (ammunition, fuel for evasion, medical supplies) creates economic pressure
- The aftermath of combat generates its own storylets (repair decisions, crew trauma, faction fallout)

### Combat Frequency

- Oikumene: very rare, law enforcement intervenes. Combat here is a desperate act with severe legal consequences.
- Beyond: more common, higher stakes. The absence of law enforcement means encounters escalate differently.
- Combat avoidance should be a viable and often preferable strategy — the game should reward clever avoidance as much as successful fighting

## Connections

- **QBN**: Combat encounters are storylets; combat options are quality-gated
- **Ship**: Ship archetype and module configuration determine combat options; damage degrades modules
- **Crew**: Crew archetypes and moods shape available combat actions; crew propose context-driven action plans
- **Yarnball**: Combat consequences spike meters; damage degrades module passive effects
- **Travel**: Region determines combat frequency; escape options depend on ship range and navigation
- **Factions**: Combat outcomes affect faction reputation; faction standing may determine whether enemies attack at all

## Open Questions

- ~~How do we make combat feel consequential without a tactical layer?~~ Resolved: through yarnball consequences (module damage, crew mood, resource loss, faction reputation) and constrained meaningful choices rather than tactical depth
- Is PvP possible? Under what circumstances? (Perko's systems assume single-player; PvP combat in a text-based QBN system is an open design problem)
- How does combat interact with faction reputation? (Witnesses, survivors, and aftermath should propagate reputation effects)
- ~~Should combat have a "preparation" phase?~~ Resolved: yes, implicitly — ship configuration, crew composition, and module installation ARE the preparation phase. The strategic choices made between combats determine what options appear during combat.
- How do aggregate combat outcomes work at MMO scale? (Perko suggests quest results should compile into aggregate world outcomes — "50 players defeat pirates = piracy reduced in sector")
- How does the text-only interface present combat pacing and tension without visual spectacle?

## Sources

- Perko, "Boolean Choices" (2007-04-09) — kill binary choices, fragmented choices over binary paths
- Perko, "Limited Choice but Big Choices" (2007-05-16) — less freedom + more agency, aggregate world outcomes
- Perko, "An Article on Choice" (2009-12-02) — choices must change avatar's future options
- Perko, "Games with Class" (2005-12-02) — kill classes, use continuous skills
- Perko, "Skyrim" (2011-01-13) — chunky archetypes for initial identity
- Perko, "Character-Driven Game Design" (2018-09-10) — NPC action plans in encounters
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`
