# Search: Location and World Design

## Queries Run

- `"procedural generation world"` — 5 results; top hits on uniqueness/coherence in procgen, world weaving, outer ring progression
- `"location exploration map environment"` — 5 results; exploration sharing, open world analysis, interior spaces, density, home spaces
- `"open world level design space"` — 5 results; open world analysis, investigative exploration, Star Trek interiors, density, glowing open worlds
- `"base building sandbox construction"` — 4 results; directed sandbox, mission-based iteration, Stellaris stars, filling in the blanks
- `"dungeon topology space station"` — 2 results; basic infrastructure, slow construction
- `"city planet terrain atmosphere sense place"` — 0 results

## Key Findings

### 1. The Three Requirements for Meaningful Procedural Worlds

- **Source**: 2010-06-15-complicated.md (qmd://perko/2010-06-15-complicated.md)
- **Key points**: Perko identifies three requirements for procedurally generated content that feels genuinely unique rather than statistically samey:
  1. **A giant stack of uniqueness**: Every location needs distinctive details, not just stat variations. "Ten million locations that vary only statistically won't be nearly as interesting as a hundred locations that are each unique."
  2. **Coherence ("smearing")**: Uniqueness must propagate to neighbors. "If this planet has an unusual quantity of gold, then the nearby colonies will be better off because of it, and the NPCs at those other colonies will talk about the gold."
  3. **Gateways that draw players in**: Players must be pulled into engaging with the uniqueness. Without compelling reasons to investigate, even genuinely unique content "blends together into a shapeless blah" (citing Spore).
- **Notable quote**: "The amount of effort you put into making a hundred unique locations could probably make ten thousand statistically varying locations, instead. But they would feel very samey. The universe would have little texture."

### 2. World Weaving: Generate Worlds from Paths, Not Points

- **Source**: 2016-08-19-world-weaving.md (qmd://perko/2016-08-19-world-weaving.md)
- **Key points**: A breakthrough concept for procedural generation. Instead of placing discrete "points" (buildings, NPCs, resources) and hoping they feel connected, generate the world out of **overlapping paths**:
  - Paths that cross each other create natural complexity at intersections
  - Simple individual paths woven together produce emergent terrain features (rivers, mountains, cities)
  - Works for physical worlds AND social worlds (NPC arcs, skill progressions, conspiracies)
  - For NPCs: give each character an "arc" (stat growth trajectory). When arcs intersect (two characters at similar skill levels), conflicts and events emerge automatically
  - A commenter (neoshaman) equates this to "circulation" -- building a world with "grammar" (combinatorial structures) and "intents" (paths) rather than a "dictionary" of discrete elements
- **Notable quote**: "Right now, we generate 'points'. Our worlds are filled with plants and animals and buildings and people, but they stand alone. By finding ways to create 'paths' the player can follow, we can weave those paths into a world."

### 3. Density as the Fundamental Axis of Space Design

- **Source**: 2014-07-11-density.md (qmd://perko/2014-07-11-density.md)
- **Key points**: All spatial properties (view distance, movement speed, encounter rate, resource density) are proportional. This means "density" is a single unified axis:
  - Different gameplay modes require different densities: violence works at medium density, exploration at low density, social/theft at high density
  - Open worlds need **multiple native densities** with distinct gameplay for each, not just one density with exceptions
  - Skyrim succeeds (partially) by having three densities: dungeon raiding (medium), wilderness exploration (low), stealing from townsfolk (high)
  - The key failure is when density changes are "exceptions" rather than native. A jet in GTA doesn't change what the world offers, just how fast you cross it
- **Notable quote**: "The spaces don't need to clash and feel disconnected, like with Skyrim. But they do have to change."

### 4. Open World Navigation and the Fast-Travel Problem

- **Source**: 2016-09-16-open-world-analysis.md (qmd://perko/2016-09-16-open-world-analysis.md)
- **Key points**: Deep analysis of open world mechanics:
  - **Five-phase play**: approach -> scan for enemies -> maneuver to engagement -> engage -> deal with response. Each phase creates tension within its range
  - **Navigation**: Hand-made maps use slow avatars to force "small bites." Fast travel "crushes" the map -- you never cross that space again
  - **Phased implicit goals**: As players move toward one goal, they see other potential goals (dungeon entrance, abandoned shack, plume of smoke). Requires a light touch -- too obvious breaks flow
  - **Landmarks over HUD icons**: Use "intermittently-visible landmarks to lure players in" rather than HUD markers. Requires long, clear sight lines (Skyrim-style)
  - **Vehicles are problematic**: They create disconnected low-density "vehicle maps" dotted with high-density "pedestrian maps." Slower vehicles (2-5x player speed, like Subnautica) integrate better
  - **Player narrative through fragmentation**: Chop decisions into tiny chunks rather than binary good/evil. Players build internal narrative from accumulated small choices
- **Notable quote**: "Many games use a fast-travel system to let you return to where you have already gone. I'm not a fan of this, though, because it 'crushes' the map as you leave: you'll never cross that space again, never see any of the other locations in that space. You've effectively thrown it away."

### 5. Investigate-and-Expand: Giving Exploration Meaning

- **Source**: 2015-02-18-investigative-expansive-exploration.md (qmd://perko/2015-02-18-investigative-expansive-exploration.md)
- **Key points**: A two-phase pattern for making exploration meaningful in procedural/open worlds:
  1. **Investigate**: When players find something interesting, let them zoom in and explore it in more detail (visit a space village's cities, talk to people)
  2. **Expand**: Once investigated, the thing integrates into local space and generates contextual missions ("can you find a plant we can eat?", "we have an abandoned base there")
  - This gives barren rocks **context** -- you're exploring on behalf of factions you've chosen to help
  - Multiple factions create overlapping missions, intertwining goals
  - Each space village/faction needs to be unique enough that players have opinions on them specifically
- **Notable quote**: "Exploration is only half a game... The expansion phase is extremely powerful, because it gives you a new context for any barren hunk of rock you stumble across."

### 6. The Concept of "Home" in Games

- **Source**: 2008-02-26-home-home-on-the-lagrange.md (qmd://perko/2008-02-26-home-home-on-the-lagrange.md)
- **Key points**: Every game needs a "home" that serves as a psychological reset point:
  - Home **recalibrates the player** -- brings experience back to a set type, regardless of play style
  - "Home is a well-lit save point" -- seeing one resets tension and tempo for all players equally
  - Home goes beyond rest stops: radial design ("all roads lead to home"), ownership/customization, comfort and belonging, protecting something external
  - Critical: home must be **distinct from the main game**. In The Sims, the house is NOT home because it IS the game
  - A commenter (Duncan M) highlights Uru's Relto age as an ideal game "home" -- customizable, neutral, a hub for all travel
- **Notable quote**: "A player cannot simply always play your game. They get worn down and worn out. So every game needs to have a break -- something that lets the player stop and catch their breath."

### 7. Interior Spaces: Set Design Principles for Game Locations

- **Source**: 2014-07-31-star-trek-interiors.md (qmd://perko/2014-07-31-star-trek-interiors.md)
- **Key points**: Analyzing Star Trek set design for game interior spaces:
  - TOS rooms were cozy and utilitarian but don't scale up -- scaling them produces "bizarrely empty" rooms
  - TNG solved this with oversized rooms + curved walls to break boxiness. Gentle hallway curves keep scenes intimate without feeling confined
  - DS9 used raised/sunken platforms and high ceilings -- these scale well for games
  - Key insight: game interiors are about **set design**, not architecture. Characters must appear to inhabit the space
  - 17 specific design principles listed, including: structural beams, complex ceilings, half-walls, variable room configurations, pocket rooms, multiple wall materials, NPC behavior that interacts with the space
- **Notable quote**: "If you study interior spaces as where people work and live, you'll find a lot of real-world interior decorating/architecture stuff, but it's only mildly applicable to video game spaces. An avatar that appears to live in a space needs to be treated differently than a person who actually lives in a space."

### 8. Strip-Mining vs. Constructive Open Worlds

- **Source**: 2017-03-06-glowing-open-worlds.md (qmd://perko/2017-03-06-glowing-open-worlds.md)
- **Key points**: Open worlds are inherently built to be strip-mined -- resolving a gang war makes the world LESS fun:
  - Strip-mining is not just a side effect but a **pacing mechanism** that lures players forward through the world
  - Without forward lure, players mine out all play options in the first few areas and get bored
  - A constructive open world (where gameplay creates more gameplay) is possible but needs a different forward-lure mechanic
  - The truest power of open worlds: **replay**. The world resets, and replays that stumble onto previously-missed content make the world feel larger than expected
  - Design should push players to take "wobbly paths" -- sticking to roads makes replays dull
- **Notable quote**: "The open world we strip mined? It doesn't stay stripped. We return to the fresh, untrammeled world again and again, whenever we want. To me, that is the truest power of an open world."

### 9. Exploration Needs Implicit Sharing

- **Source**: 2014-12-10-exploration-needs-implicit-sharing.md (qmd://perko/2014-12-10-exploration-needs-implicit-sharing.md)
- **Key points**: Exploration games need player creation that feeds back into others' exploration:
  - Combat-survival "damages and flattens the exploration elements" -- everything reduces to "what resources and enemies are in the area?"
  - Explicit sharing (share map files, seeds) is clumsy. Games need **implicit sharing** -- player creations automatically embedded in others' experiences
  - The ultimate vision: players crash ships, build shelters, embed NPCs, log files, plot lines, even cultures -- and other players discover these as archaeological/narrative content
  - "We don't know how to allow players to create stories. We don't know how to program that tool."
- **Notable quote**: "It's not about how well you can create things, it's about how well you can share them. See, that feeds back into exploration: if you can uncover fragments of some other player's story, that lends a lot of power to the universe."

### 10. The "Many Bases" Approach to Base Building

- **Source**: 2013-10-03-basic-infrastructure.md (qmd://perko/2013-10-03-basic-infrastructure.md)
- **Key points**: A third approach between SimCity's "one slow complex base" and Starcraft's "fast simple bases":
  - Instead of layering more infrastructure types over time, start with all layers present and let the player choose which to tackle
  - Make the **environment** the complexity driver: winter snows, desert heat, floods of immigrants, terrain features
  - Environmental conditions are mix-and-match and scale in intensity
  - Each base in a network specializes in different production/functions, creating interdependencies
  - Side effects (magical mist, heat, cold) create interesting design constraints with multiple solutions
- **Notable quote**: "Instead of layering on more and more types of infrastructure as time progresses, we start out any given base with the layers already present, chosen by the player."

## Evidence Ledger

<!-- EVIDENCE_START -->

| Claim                                                                                        | Source                                            | Date       | Confidence | Excerpt                                                                                                                                                              | URL                                                           |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Procedural worlds need uniqueness, coherence ("smearing"), and gateways to feel alive        | 2010-06-15-complicated.md                         | 2010-06-15 | High       | "You also need coherence. The uniqueness has to mean something... it can probably also be accomplished by 'smearing' uniquenesses"                                   | qmd://perko/2010-06-15-complicated.md                         |
| Generate worlds from overlapping paths, not discrete points                                  | 2016-08-19-world-weaving.md                       | 2016-08-19 | High       | "By finding ways to create 'paths' the player can follow, we can weave those paths into a world"                                                                     | qmd://perko/2016-08-19-world-weaving.md                       |
| Density is a unified axis; open worlds need multiple native densities with distinct gameplay | 2014-07-11-density.md                             | 2014-07-11 | High       | "The spaces don't need to clash and feel disconnected, like with Skyrim. But they do have to change."                                                                | qmd://perko/2014-07-11-density.md                             |
| Fast travel crushes the map; use landmarks over HUD icons                                    | 2016-09-16-open-world-analysis.md                 | 2016-09-16 | High       | "it 'crushes' the map as you leave: you'll never cross that space again"                                                                                             | qmd://perko/2016-09-16-open-world-analysis.md                 |
| Investigate-then-expand pattern gives exploration meaning via contextual missions            | 2015-02-18-investigative-expansive-exploration.md | 2015-02-18 | High       | "it gives you a new context for any barren hunk of rock you stumble across"                                                                                          | qmd://perko/2015-02-18-investigative-expansive-exploration.md |
| Every game needs a "home" as a psychological reset; home must differ from the main game      | 2008-02-26-home-home-on-the-lagrange.md           | 2008-02-26 | High       | "Home is a well-lit save point"                                                                                                                                      | qmd://perko/2008-02-26-home-home-on-the-lagrange.md           |
| Game interiors should follow set design principles, not real architecture                    | 2014-07-31-star-trek-interiors.md                 | 2014-07-31 | High       | "An avatar that appears to live in a space needs to be treated differently than a person who actually lives in a space"                                              | qmd://perko/2014-07-31-star-trek-interiors.md                 |
| Open worlds are strip-mined by design; constructive worlds need alternative forward-lure     | 2017-03-06-glowing-open-worlds.md                 | 2017-03-06 | High       | "strip-mining is not simply a side effect of the preferred play. It's a tactic that pushes the player to move through the game"                                      | qmd://perko/2017-03-06-glowing-open-worlds.md                 |
| Exploration needs implicit sharing of player-created stories, not just explicit file sharing | 2014-12-10-exploration-needs-implicit-sharing.md  | 2014-12-10 | High       | "if you can uncover fragments of some other player's story, that lends a lot of power to the universe"                                                               | qmd://perko/2014-12-10-exploration-needs-implicit-sharing.md  |
| "Many bases" approach: environment-driven complexity with specialization networks            | 2013-10-03-basic-infrastructure.md                | 2013-10-03 | High       | "Instead of layering on more and more types of infrastructure as time progresses, we start out any given base with the layers already present, chosen by the player" | qmd://perko/2013-10-03-basic-infrastructure.md                |
| Statistical variation is fundamentally less interesting than contextual uniqueness           | 2010-06-15-complicated.md                         | 2010-06-15 | High       | "statistical variation just isn't as interesting" (comment reply)                                                                                                    | qmd://perko/2010-06-15-complicated.md                         |
| Player narratives arise from fragmented small choices, not binary good/evil paths            | 2016-09-16-open-world-analysis.md                 | 2016-09-16 | High       | "Player narratives involve assembling a story out of smaller parts, parts that interact"                                                                             | qmd://perko/2016-09-16-open-world-analysis.md                 |
| Random procgen can create atmosphere (dread, wonder) even without hand-crafted content       | 2008-02-27-language-ui-and-systems-design.md      | 2008-02-27 | Medium     | "games do excel at 'atmosphere'... atmosphere is something that I feel that random level generation can create" (commenter, endorsed by Perko)                       | qmd://perko/2008-02-27-language-ui-and-systems-design.md      |

<!-- EVIDENCE_END -->

## Gaps & Limitations

- **No text-only / MUD-specific analysis**: All of Perko's spatial design thinking assumes visual rendering. Translating density, landmarks, sight lines, and interior set design to text-only presentation requires significant interpretation.
- **Limited MMO-specific content**: Most analysis focuses on single-player open worlds (Skyrim, Fallout, GTA). The multiplayer section of the open world analysis is brief and notes that multiplayer "requires very specific tweaks."
- **No direct Vance references**: Perko does not reference Jack Vance or the Oikumene/Beyond concept. The Vance-specific atmosphere of social intrigue, cultural variety, and baroque civilizations must be synthesized from his general principles.
- **Semantic search unavailable**: The vector search model was downloading during this session. Re-running with `qmd vsearch` may surface additional relevant posts, particularly on topics like "atmosphere," "culture," and "social world design."
- **Sci-fi setting posts underexplored**: Posts like "The Stars of Stellaris" (2016-12-19) and "Filling in the Blanks" (2008-12-01) were surfaced but not fully retrieved. They may contain additional relevant insights about space-scale world design.
