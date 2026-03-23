# Search: Sims, Meters, and Interconnected Systems in Perko's Work

## Queries Run

1. `"Sims needs meter"` — 4 results; top hit was 2018-01-11 inhabitant-centric games (86%), plus the 2019-06-18 space survival post (85%)
2. `vsearch "interconnected resource management meters simulation gameplay"` — failed (embedding model download error; CPU-only mode)
3. `"hunger thirst survival meter pressure"` — 0 results
4. `"Dwarf Fortress simulation complex system"` — 4 results; 2015-02-23 basebuilding with people (94%), 2018-01-09 Sims vs Rimworld (92%), 2008-02-29 roguelikes (90%), 2016-09-22 building from inside (89%)
5. `"resource constraint tradeoff interconnected"` — 0 results
6. `"yarnball"` — 3 results; 2019-06-11 Boiling the Yarnball (93%), 2019-06-18 Space Survival Gameplay (88%), 2019-04-19 Modding (86%, just a nav link)
7. `"Sims simulation life people story"` — 3 results; the same 2018-01 pair plus a 2006-02-23 "Under Pressure" hit (85%, not fetched due to query budget)
8. (budget reserved, not used)

## Key Findings (chronological order)

### 2015 — Basebuilding With People: The Social Simulation Manifesto

- **Source**: `perko/2015-02-23-basebuilding-with-people.md` (qmd://perko/2015-02-23-basebuilding-with-people.md)
- **Date**: 2015-02-23
- **Key idea**: Perko argues that base-building games (Rimworld, Dwarf Fortress) fail at making NPCs memorable because they treat people as "cogs in a machine." He proposes removing time compression to let social dynamics breathe, and advocates for "a mental simulation as complex as our physical simulation" -- essentially a rich system of interconnected social meters.
- **Notable quote**: "People aren't defined by a list of stats. They are defined in contrast to other people, including you. This forms a social terrain."
- **Notable quote 2**: "This is all possible because of the ridiculous Dwarf-Fortresslike body simulation. It's quite easy to empathize with someone who has suffered, and seek to ease that suffering through the medical mechanisms of the game."
- **Connection to yarnball meters**: This is an early call for complex, interconnected simulation of people's internal states (physical AND mental), which directly prefigures the yarnball concept. The idea that interesting gameplay comes from managing competing pressures on people's lives (work schedule vs. social time vs. recovery) is proto-yarnball thinking, even without the term.

### 2016 — Building From the Inside: Lifestyle as Interconnected Systems

- **Source**: `perko/2016-09-22-building-from-the-inside.md` (qmd://perko/2016-09-22-building-from-the-inside.md)
- **Date**: 2016-09-22
- **Key idea**: First-person base building in the Fallout 4 vault-building mode. Perko discusses "lifestyle" mechanics explicitly referencing The Sims, and proposes that rather than simulating resident movement in real time, you calculate "good and bad factors based on either radius or simplified LOS" -- essentially environmental meters that affect mood and behavior. He argues most factors should be "notable" rather than good/bad, to give bases personality rather than optimization targets.
- **Notable quote**: "A lot of base-building games feature lifestyles. Like The Sims. These games use time compression to make it very expensive to do anything. Going to the bathroom takes hours."
- **Notable quote 2**: "You have an apartment above the main air filter. It goes 'RRRRHMMRMRMRMMMMMMM' all night... the people above it should grow to accept it. Like how people grow to be at peace with the sounds of traffic whooshing by."
- **Connection to yarnball meters**: This post introduces the idea that environmental factors create a web of interconnected effects on residents -- proximity to noise, infrastructure routing, social spaces. These are proto-meters: not explicit bars, but systemic pressures that interact and create tradeoffs. The emphasis on entanglement (cables competing for wall space, infrastructure affecting room layouts) directly anticipates the "soft, messy challenges" language of the yarnball concept.

### 2018 (Jan 9) — The Sims vs Rimworld: The Genre-Defining Analysis

- **Source**: `perko/2018-01-09-the-sims-vs-rimworld.md` (qmd://perko/2018-01-09-the-sims-vs-rimworld.md)
- **Date**: 2018-01-09
- **Key idea**: Perko's most sustained analysis of The Sims as a design model. The core insight: The Sims works as a people-game because the facility is NOT high-stress. Setbacks are contextualized as personal stories rather than system failures. He argues for "reducing simulation fidelity" to make character lifestyles more readable, and proposes that a character's career/hobby needs to "provide a stable, steadily-advancing scaffold, exert pressure on their life and the life of those around them, provide small random events and schedule burps."
- **Notable quote**: "If we want to make a game that focuses on the lives of the characters, it's critical that their support system is straightforward and robust, so that setbacks can be judged as affecting the characters rather than the support system."
- **Notable quote 2**: "A character's chosen lifestyle/career/hobby needs to provide a stable, steadily-advancing scaffold, needs to exert pressure on their life and the life of those around them, needs to provide small random events and schedule burps, and needs to respond to a character's own personality/pressure/situation outside of the lifestyle."
- **Connection to yarnball meters**: This is the theoretical foundation for the yarnball. Perko identifies that the Sims' genius is turning meter management into narrative (a bad day, not a system failure), and that the key is having multiple overlapping pressures that create schedule conflicts and tradeoffs. The "scaffold + pressure + random events" formula is exactly what the yarnball meters implement.

### 2018 (Jan 11) — Designing Inhabitant-Centric Games: The Applied Design

- **Source**: `perko/2018-01-11-designing-inhabitant-centric-games.md` (qmd://perko/2018-01-11-designing-inhabitant-centric-games.md)
- **Date**: 2018-01-11
- **Key idea**: Perko applies the Sims vs Rimworld analysis to a concrete design. He proposes off-map jobs (abstracting work to create scheduling friction), dense living spaces with thin walls (enabling social proximity), and multiple genre applications (superhero base, sci-fi dome, fantasy guild). The Sims' construction system is analyzed in detail: thin walls, arbitrary standing positions, variable publicness, exclusivity rules (bathrooms).
- **Notable quote**: "Within our densely-simulated space, we need to design carefully. The purpose of this space is to help build personal stories both in gameplay and in the player's mind."
- **Connection to yarnball meters**: This is the bridge post between the Sims analysis and the yarnball concept. The design proposes a system where scheduling friction between jobs, social needs, and personal traits creates interconnected pressures -- people's meters (time, social energy, mood) are implicitly managed through spatial and scheduling design rather than explicit bars.

### 2019 (Jun 11) — Boiling the Yarnball: The Concept Crystallizes

- **Source**: `perko/2019-06-11-boiling-the-yarnball.md` (qmd://perko/2019-06-11-boiling-the-yarnball.md)
- **Date**: 2019-06-11
- **Key idea**: Perko names and defines the "yarnball" concept: "Big, soft, messy challenges that can be approached in a lot of different ways with a lot of different entanglements to the rest of the game." He explicitly includes The Sims (having children as a yarnball), Dwarf Fortress (defensive gates), and Oxygen Not Included (air management) as exemplars. The key innovation is the four-phase model: Planning, Construction, Daily Life, Spotlight -- each phase turns mechanical challenge into narrative.
- **Notable quote**: "Challenge: you need to provide air. Narrative: 'the third and fourth floors of our Mars base are pressurized. Whenever we venture down to the first floor to change out the algae, we hold our breaths and work fast. Sandra got real sick when she couldn't hold her breath long enough.'"
- **Notable quote 2**: "The thing about yarnballs is that you do, eventually, sort them... That's why it's so important that the construction game is a huge pile of yarnballs. If I sort one, there's another behind it. More importantly, as I sort that one, I realize it's tied to the first one, and I didn't sort it well enough!"
- **Connection to yarnball meters**: This IS the yarnball concept post. Meters are implicit in every example: oxygen pressure, food supply, mood, schedule time. The insight is that meters become interesting when they're entangled -- solving one creates pressure on another. The "boiling" metaphor describes letting challenges simmer until the player chooses to engage, then watching cascading consequences unfold.

### 2019 (Jun 18) — Space Survival Gameplay: Yarnball Meters Made Explicit

- **Source**: `perko/2019-06-18-space-survival-gameplay.md` (qmd://perko/2019-06-18-space-survival-gameplay.md)
- **Date**: 2019-06-18
- **Key idea**: One week after "Boiling the Yarnball," Perko applies the concept to a space survival game (riffing on Star Citizen). This is where Sims-like meters become EXPLICIT: "I implement a The Simslike survival system. Every time you make a space jump, your various meters go up. Hunger and filth." He then adds social meters (loneliness, claustrophobia, boredom) and shows how player choices about ship equipment shape which meters they manage, creating personalized narratives. The concept extends to faction "dossiers" that work like ships with their own meter-like stats (criminality, disinterest, distrust).
- **Notable quote**: "Well, my goal is to turn survival into a yarnball. A soft, complicated challenge that interlaces with a lot of other things. I also want to make sure that it unfolds into a narrative according to the choices the player makes."
- **Notable quote 2**: "We can see how the player's construction choices change the narrative. The player is choosing what narrative beats to include, which ones to play up or limit. One of those players is having a long, lonely journey hopping from planet to planet. The other is on a road trip with friends."
- **Connection to yarnball meters**: This is the capstone post where all threads converge. The Sims meter system + yarnball entanglement + narrative emergence = the full "yarnball meters" design pattern. Players don't just manage meters; they choose which meters to prioritize, and that choice creates their story.

## Evidence Ledger

<!-- EVIDENCE_START -->

| Claim                                                                                            | Source                                       | Date       | Confidence | Excerpt                                                                                                                                                                    | URL                                                                     |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------- | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Perko advocates for complex mental simulation of NPCs as early as 2015                           | perko/2015-02-23-basebuilding-with-people.md | 2015-02-23 | High       | "A mental simulation as complex as our physical simulation. Tweaking people's mental state in the same way you'd tweak their physical equipment or cyberwear."             | https://projectperko.blogspot.com/2015/02/basebuilding-with-people.html |
| Perko analyzes The Sims' low-stress facility as key to people-centric gameplay                   | perko/2018-01-09-the-sims-vs-rimworld.md     | 2018-01-09 | High       | "I think nearly all of the difference in this contextualization is simply because the 'facility' in The Sims is not a high-stress facility."                               | https://projectperko.blogspot.com/2018/01/the-sims-vs-rimworld.html     |
| Perko identifies that careers/hobbies must "exert pressure" and create "schedule burps"          | perko/2018-01-09-the-sims-vs-rimworld.md     | 2018-01-09 | High       | "a character's chosen lifestyle/career/hobby needs to provide a stable, steadily-advancing scaffold, needs to exert pressure on their life"                                | https://projectperko.blogspot.com/2018/01/the-sims-vs-rimworld.html     |
| Perko names the "yarnball" concept for interconnected soft challenges                            | perko/2019-06-11-boiling-the-yarnball.md     | 2019-06-11 | High       | "Big, soft, messy challenges that can be approached in a lot of different ways with a lot of different entanglements to the rest of the game."                             | https://projectperko.blogspot.com/2019/06/boiling-yarnball.html         |
| Perko explicitly connects Sims-like meters to the yarnball concept                               | perko/2019-06-18-space-survival-gameplay.md  | 2019-06-18 | High       | "I implement a The Simslike survival system. Every time you make a space jump, your various meters go up. Hunger and filth, for example."                                  | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html  |
| Yarnball meters include social/psychological dimensions, not just physical                       | perko/2019-06-18-space-survival-gameplay.md  | 2019-06-18 | High       | "So we add a few more meters. Loneliness, claustrophobia, boredom."                                                                                                        | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html  |
| Player construction choices determine which meters dominate, shaping narrative                   | perko/2019-06-18-space-survival-gameplay.md  | 2019-06-18 | High       | "The player is choosing what narrative beats to include, which ones to play up or limit."                                                                                  | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html  |
| Environmental factors as proto-meters appear in 2016 base-building analysis                      | perko/2016-09-22-building-from-the-inside.md | 2016-09-22 | Medium     | "just look at where they live, where they work, and where they play. Calculate various good and bad factors based on either radius or simplified LOS."                     | https://projectperko.blogspot.com/2016/09/building-from-inside.html     |
| The yarnball concept includes a four-phase model (Planning, Construction, Daily Life, Spotlight) | perko/2019-06-11-boiling-the-yarnball.md     | 2019-06-11 | High       | "I think there are four phases to this... 1) Planning 2) Construction 3) Daily life 4) Spotlight"                                                                          | https://projectperko.blogspot.com/2019/06/boiling-yarnball.html         |
| Faction dossiers extend the meter pattern to social/political dimensions                         | perko/2019-06-18-space-survival-gameplay.md  | 2019-06-18 | High       | "As time passes and things happen, you might gain criminality, or disinterest, or distrust. These can be reduced if you equip the right kind of person on your hardpoints" | https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html  |

<!-- EVIDENCE_END -->

## Genealogy Summary

The yarnball-meters concept has a clear four-year development arc:

1. **2015**: Perko identifies the problem -- NPCs in base-builders are "cogs in a machine" because their internal states aren't richly interconnected with social context. He calls for mental simulation parity with physical simulation.

2. **2016**: He explores environmental factors as implicit meters -- noise, proximity, infrastructure routing -- that create webs of tradeoffs affecting NPC quality of life. The entanglement theme emerges.

3. **2018 (January)**: The breakthrough pair of posts. Perko reverse-engineers The Sims to identify WHY its meters work: low facility stress means setbacks are personal narratives, not system failures. He formulates the "scaffold + pressure + schedule burps" model for how meters should interact.

4. **2019 (June)**: The yarnball concept crystallizes, and one week later he applies it to an explicit Sims-like meter system for space survival. The full pattern emerges: multiple interconnected meters where player choices about which to prioritize generate personalized narratives.

The throughline is consistent: Perko was never interested in meters as optimization targets. He was interested in meters as narrative generators -- systems where managing competing pressures forces players to make choices that become stories.

## Gaps & Limitations

- **2006 "Under Pressure" post**: Appeared in search results (85% match) but was not fetched due to query budget. Title suggests it may contain early thinking about pressure mechanics. Worth investigating in a follow-up search.
- **Semantic search unavailable**: The vsearch failed due to an embedding model download error. BM25 keyword search may have missed posts that discuss these concepts without using the specific keywords searched.
- **Pre-2015 coverage thin**: Only the 2008 roguelikes post (a Dwarf Fortress reference in passing) appeared from before 2015. Perko's blog runs from 2005; there may be earlier Sims or meter-system references that didn't match keyword queries.
- **"Oxygen Not Included" thread**: Referenced in the yarnball post as a key exemplar but no dedicated post about it was found. Perko may have discussed it in posts not captured by these searches.
- **No explicit "needs system" terminology found**: Perko uses "meters" and "pressure" but never (in these results) uses the game-design term "needs system." Searching that phrase might surface additional material.
