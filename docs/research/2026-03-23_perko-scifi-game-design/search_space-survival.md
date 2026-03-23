# Search: Space Survival and Ship Mechanics

## Queries Run

- `"space game survival ship"` -- 5 results, found the core space survival gameplay post and several construction/survival design posts
- `"resource management and survival mechanics in space games"` (vsearch) -- model download in progress, deferred
- `"trade economy cargo merchant"` -- 0 results, no direct trade/economy posts found
- `"procedural generation galaxy exploration planet"` -- 0 results via BM25
- `"exploration galaxy star planet fuel travel"` (vsearch) -- model download in progress, deferred
- `"resource scarcity fuel oxygen atmosphere"` -- 0 results
- `"starship crew NPC simulation"` -- 2 results, found social NPCs and construction elements posts
- `"faction reputation economy inflation currency"` -- 0 results

8 queries used. BM25 keyword search was most productive; vsearch was unavailable due to embedding model download.

## Key Findings

### 1. Survival as Yarnball: Meters, Modular Ships, and Emergent Narrative

- **Source**: `2019-06-18-space-survival-gameplay.md` (qmd://perko/2019-06-18-space-survival-gameplay.md)
- **Key points**:
  - Survival should be a "yarnball" -- a soft, complicated challenge that interlaces with many other systems and unfolds into narrative based on player choices.
  - Implement Sims-like survival meters (hunger, filth, loneliness, claustrophobia, boredom) that tick up with each space jump.
  - Ship facilities passively reduce meter growth (kitchenette = 90% slower hunger; full kitchen = zero growth until food runs out). Active use gives temporary performance boosts at resource cost.
  - Players customize ships by swapping modules (gym vs media console vs video game console), choosing which survival pressures to mitigate. This creates divergent narratives: a solo explorer swaps gym for media console and buys a robot companion; a crew replaces gym with video games and relies on social interaction.
  - Consumable resources (food, media caches) create trade/resupply pressure. Media caches can be traded between players.
  - The "dossier" system extends the ship-module metaphor to faction reputation: faction rank gives you a dossier with hardpoints for NPCs (diplomats, lawyers, fences, reporters) that reduce negative meters (criminality, distrust, disinterest).
  - Faction-specific meter behavior creates cultural differentiation: Vulcan-like factions never gain disinterest but give bonus distrust for selling science data; Klingon-like factions lose interest rapidly but never give criminality.
  - Negative reputation creates "unhappy dossiers" with nemesis NPCs (cops, bounty hunters) that must be filled before positive slots.
- **Notable quote**: "My goal is to turn survival into a yarnball. A soft, complicated challenge that interlaces with a lot of other things. I also want to make sure that it unfolds into a narrative according to the choices the player makes."
- **Notable quote**: "We didn't write those narratives: we allow the challenges to be faced in a way that turns them into narratives."
- **Notable quote**: "To be clear: I think you could create an entire game around these concepts, rather than the shooty pew pew gameplay that I find so dreary."

### 2. Exploration Needs Implicit Sharing, Not Combat-Survival

- **Source**: `2014-12-10-exploration-needs-implicit-sharing.md` (qmd://perko/2014-12-10-exploration-needs-implicit-sharing.md)
- **Key points**:
  - Exploration is "only half a game" -- virtually every exploration game pairs it with combat-survival, which damages and flattens exploration into "what resources and enemies are in the area?"
  - The most promising replacement for combat-survival is creation. The key differentiator is not how well you create, but how well you can share.
  - "Implicit sharing" -- pieces of player creations automatically embedded in other players' experiences -- is far more powerful than explicit file-sharing. Crashed ships, survival camps, log files, embedded NPCs, local diseases, and cultural artifacts all become discoverable content.
  - Players should be able to create stories, not just structures. "We don't know how to allow players to create stories. We don't know how to program that tool."
  - References Traveller as an early exploration game with randomized worlds.
- **Notable quote**: "Exploration is only half a game... combat-survival damages and flattens the exploration elements. Exploration is boiled down to 'what resources and enemies are in the area?'"
- **Notable quote**: "Pieces of your creations will be embedded in other people's experiences automatically."

### 3. Survival Bases: Room-by-Room Reclamation and NPC Tiers

- **Source**: `2014-04-28-survival-and-the-compromised-base.md` (qmd://perko/2014-04-28-survival-and-the-compromised-base.md)
- **Key points**:
  - Core survival loop: reclaim a base room by room, patch cracks, seal off damaged rooms, create airspace, move NPCs in.
  - NPCs have classes (retrieval specialist, craftsman, electrician, plumber), tiers (based on quality of life -- better living conditions = higher capability), and levels (increase over time).
  - Bases are not permanent; as you advance you abandon old bases and migrate to new ones. NPCs drag equipment along resting-stop routes.
  - Every additional airspace volume added extends time before base needs refilling -- volume itself is a resource.
  - The "compromised base" concept (working within damaged/imperfect structures) is more compelling than building from scratch.
- **Notable quote**: "The gameplay of expanding into a base is the heart of the game. Reclaiming a base room by room, patching the cracks you can patch, sealing off the rooms with larger holes."

### 4. Mission-Based Iteration vs Survival Mode: Challenges as Continuous Pressure

- **Source**: `2015-05-18-mission-based-iteration-vs-survival-mode.md` (qmd://perko/2015-05-18-mission-based-iteration-vs-survival-mode.md)
- **Key points**:
  - Survival mode teaches you to make the game "sing" (mastery); tutorials teach you how to make it "work" (competence). Conflating them is dangerous.
  - Challenges should exert continual pressure, not be flattened by gear upgrades. Once Subnautica gives you a rebreather, depth penalties vanish -- this is "exactly the wrong thing to do."
  - Iterative construction: the player returns to the same challenge with better designs. Kerbal's sandbox mode exemplified this -- you go to Duna, then want to go back with a better rocket.
  - Environmental pressures should directly shape construction decisions. "There's not really any relationship between the monsters of the deep and how you build your base" is a design failure.
  - Creative mode and survival mode should be a sliding scale, not binary. Let players selectively enable/disable constraints.
- **Notable quote**: "Tutorials teach you how to make the game work. Survival mode teaches you to make the game sing."
- **Notable quote**: "The challenges in a given mission don't exist to be flattened away, they exist to exert continual pressure."

### 5. Open Construction Games and Ship Design Continuity

- **Source**: `2015-08-18-good-bad-game-design-pt-2.md` (qmd://perko/2015-08-18-good-bad-game-design-pt-2.md)
- **Key points**:
  - Open construction games should reward carving your own path, like open-world RPGs reward free exploration.
  - Space Engineers succeeds by offering granular optional challenges (inventory multipliers, ammo requirements, power limits, pressurization, enemies) that players mix and match.
  - Missing from Space Engineers: continuity/chaining between constructions. "You build a mining vessel, and then there's some kind of reward or flow to building a refinery base that interfaces with it." Designs should chain into fleets and supply lines.
  - Construction games need the game itself to shoulder the responsibility of rewarding builds, not just rely on community validation.
- **Notable quote**: "One thing Space Engineers doesn't have that an open-world RPG does have is continuity. It's not easy to 'chain' your constructions, so there's not much sense of history or progress between builds."

### 6. Social NPCs on Starships: Crew Dynamics as Gameplay

- **Source**: `2013-04-17-social-npcs.md` (qmd://perko/2013-04-17-social-npcs.md)
- **Key points**:
  - For starship crew games, social NPC elements should focus on "how well the crew can get along during the long quiet time between stars... and also how they react to your various moral choices on missions."
  - NPCs have three behavioral tiers: (1) what situations they seek/avoid (off-shift hangout locations), (2) how they steer situations they're in (voicing opinions on missions, who should date who), (3) moment-to-moment tone and dominance.
  - The heart of social gameplay is not leveling up relationships ("buddy-buddy axis") but how NPCs interact with the world alongside you. "Treat them as a tool, not a target."
  - NPC memory should not boil down to flat plus/minus values -- players will optimize rather than engage naturally.
- **Notable quote**: "You might create a game where you run a starship, and you want the social elements of the NPCs to be about how well the crew can get along during the long quiet time between stars."
- **Notable quote**: "The heart of the social gameplay is not in leveling up your relationship with them, but in how they interact with the world alongside you."

### 7. Ship Parts as Simulated Data Objects

- **Source**: `2016-07-06-scriptableobject.md` (qmd://perko/2016-07-06-scriptableobject.md)
- **Key points**:
  - From Perko's game "The Galactic Line": ship parts are heavy visual objects but must be simulatable without instantiation for hundreds of off-screen ships.
  - Each part declares what it does over time: "drains water and creates power," "drains antimatter and creates power, heat, and radiation," "is pressurized," "has beds."
  - Ships simulate by crawling parts to compile resource flows and calculating the next "keyframe" (mission completion, resource depletion, arrival). Thousands of ships can be simulated with no per-frame update.
  - When a ship is nearby, it resolves into full visual/audio. Damage or events create custom saved states that diverge from the blueprint. Repair missions can restore ships to default blueprints.
  - This architecture supports fleet-scale simulation with individual ship detail when needed.
- **Notable quote**: "Hundreds of ships you can't see, still being simulated as their resources drain away and their mission timers tick up."

## Evidence Ledger

<!-- EVIDENCE_START -->

| Claim                                                                                                              | Source                                                 | Date       | Confidence | Excerpt                                                                                                                                             | URL                                                                                     |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Survival mechanics should be "yarnball" systems that interlace with other mechanics and produce emergent narrative | 2019-06-18-space-survival-gameplay.md                  | 2019-06-18 | High       | "My goal is to turn survival into a yarnball. A soft, complicated challenge that interlaces with a lot of other things."                            | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html                  |
| Ship modules should passively reduce survival meter growth; active use gives temporary boosts at resource cost     | 2019-06-18-space-survival-gameplay.md                  | 2019-06-18 | High       | "If you have a kitchenette, your hunger goes up 90% slower. A full kitchen? It doesn't go up at all... until your food runs out."                   | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html                  |
| Player ship customization choices create divergent narratives (solo explorer vs crew road trip)                    | 2019-06-18-space-survival-gameplay.md                  | 2019-06-18 | High       | "We didn't write those narratives: we allow the challenges to be faced in a way that turns them into narratives."                                   | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html                  |
| Faction reputation should use same modular "hardpoint" metaphor as ships, with NPC slots                           | 2019-06-18-space-survival-gameplay.md                  | 2019-06-18 | High       | "Like a ship, a dossier has specialties and hardpoints... The hardpoints are people."                                                               | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html                  |
| Different factions should have culturally distinct meter behaviors                                                 | 2019-06-18-space-survival-gameplay.md                  | 2019-06-18 | High       | "Your Vulcan-ish faction might never gain disinterest, but gives bonus distrust if you sell science data to other factions."                        | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html                  |
| Exploration is only half a game; combat-survival flattens exploration into resource/enemy scanning                 | 2014-12-10-exploration-needs-implicit-sharing.md       | 2014-12-10 | High       | "Exploration is only half a game... combat-survival damages and flattens the exploration elements."                                                 | https://projectperko.blogspot.com/2014/12/exploration-needs-implicit-sharing.html       |
| Implicit sharing of player-created content (crashed ships, log files, NPCs) enriches exploration                   | 2014-12-10-exploration-needs-implicit-sharing.md       | 2014-12-10 | High       | "Pieces of your creations will be embedded in other people's experiences automatically."                                                            | https://projectperko.blogspot.com/2014/12/exploration-needs-implicit-sharing.html       |
| Base reclamation (room by room, patching, expanding) is more compelling than building from scratch                 | 2014-04-28-survival-and-the-compromised-base.md        | 2014-04-28 | High       | "Reclaiming a base room by room, patching the cracks you can patch, sealing off the rooms with larger holes."                                       | https://projectperko.blogspot.com/2014/04/survival-and-compromised-base.html            |
| NPCs should have class/tier/level systems; quality of life determines capability tier                              | 2014-04-28-survival-and-the-compromised-base.md        | 2014-04-28 | High       | "Tiers are based around quality of life. If someone is living huddled in a shipping container, they aren't going to be capable of doing much work." | https://projectperko.blogspot.com/2014/04/survival-and-compromised-base.html            |
| Survival challenges should exert continual pressure, not be flattened by gear upgrades                             | 2015-05-18-mission-based-iteration-vs-survival-mode.md | 2015-05-18 | High       | "The challenges in a given mission don't exist to be flattened away, they exist to exert continual pressure."                                       | https://projectperko.blogspot.com/2015/05/mission-based-iteration-vs-survival-mode.html |
| Iterative construction: returning to the same challenge with better designs is the core loop                       | 2015-05-18-mission-based-iteration-vs-survival-mode.md | 2015-05-18 | High       | "Compare that to sandbox Kerbal, where once you've gone to Duna... you want to go back to Duna with a better design."                               | https://projectperko.blogspot.com/2015/05/mission-based-iteration-vs-survival-mode.html |
| Construction chains (mining ship -> refinery -> fleet) create continuity and progression                           | 2015-08-18-good-bad-game-design-pt-2.md                | 2015-08-18 | High       | "You build a mining vessel, and then there's some kind of reward or flow to building a refinery base that interfaces with it."                      | https://projectperko.blogspot.com/2015/08/good-bad-game-design-pt-2.html                |
| Starship crew social dynamics should focus on inter-star quiet time and moral choice reactions                     | 2013-04-17-social-npcs.md                              | 2013-04-17 | High       | "You want the social elements of the NPCs to be about how well the crew can get along during the long quiet time between stars."                    | https://projectperko.blogspot.com/2013/04/social-npcs.html                              |
| NPCs should be treated as functional tools, not relationship targets                                               | 2013-04-17-social-npcs.md                              | 2013-04-17 | High       | "Instead of treating the character as a target, treat them as a tool. Characters do stuff."                                                         | https://projectperko.blogspot.com/2013/04/social-npcs.html                              |
| Ship simulation can use keyframe-based resource depletion for thousands of off-screen ships                        | 2016-07-06-scriptableobject.md                         | 2016-07-06 | High       | "Hundreds of ships you can't see, still being simulated as their resources drain away and their mission timers tick up."                            | https://projectperko.blogspot.com/2016/07/scriptableobject.html                         |
| Ship parts should declare resource flows (inputs/outputs) for simulation without full instantiation                | 2016-07-06-scriptableobject.md                         | 2016-07-06 | High       | "It drains water and creates power. It drains antimatter and creates power, heat, and radiation. It's pressurized."                                 | https://projectperko.blogspot.com/2016/07/scriptableobject.html                         |

<!-- EVIDENCE_END -->

## Gaps & Limitations

- **Trade/economy mechanics**: No direct posts found about trade routes, commodity pricing, merchant gameplay, or economic simulation. Perko mentions "resource tiering and keeping inflation under control" at the end of the space survival post but explicitly defers that discussion.
- **Fuel and navigation**: No posts found specifically about fuel mechanics, jump drive costs, navigation planning, or route optimization.
- **Text-based game design**: Perko's posts assume visual/3D games. No discussion of text-only or terminal-based interfaces for space games.
- **MMO-specific concerns**: The space survival post touches on multiplayer but does not address MMO-scale challenges like server architecture, player density, or persistent world economy.
- **Semantic search unavailable**: The vsearch tool required a 1.28GB embedding model download that did not complete during this session. BM25 keyword search may have missed posts that discuss these topics using different terminology.
- **Traveller/Elite references**: Perko mentions Traveller in passing (exploration post) but no dedicated analysis of these classic space trading games was found.
