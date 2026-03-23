# Search: CRPG Design Patterns

## Queries Run

- `"RPG character progression skills leveling"` — 5 results; found core articles on advancement, RPG structure, content reuse, Skyrim critique, and cross-pollination
- `"quest design player agency choice"` — 5 results; found limited choice, boolean choices, article on choice, structure of RPG, replay
- `"stat character build class system"` — 5 results; found character creation as world introduction, games with class, crafting party members, system content
- `"MMO multiplayer online persistent world social"` — 2 results; found information handling, player-generated content
- `"Fallout skill consequence meaningful"` — 0 results (terms too narrow)

## Key Findings

### 1. Kill the Class System in CRPGs — Use Skill Gradients Instead

- **Source**: 2005-12-02-games-with-class.md (qmd://perko/2005-12-02-games-with-class.md)
- **Key points**: Classes and levels are approximation tools invented for pen-and-paper bookkeeping. Computers handle granular tracking automatically, so classes are an unnecessary limitation in digital games. A Fallout-style skill system where "diversity and gradients are the name of the game" encourages players to think of characters as unique individuals rather than "a class and a number." Classes reduce uniqueness — in an MMO with 20,000 players, rigid classes produce indistinguishable characters.
- **Notable quote**: "Classes are an approximation tool to make bookkeeping easier for humans. They are _limiting_ your MMORPG, and the only reason they are included is out of inertia."
- **Design recommendation**: Use continuous skill systems, not class/level. Let players discover identity through play rather than pre-selection.

### 2. Advancement Systems: Threshold vs. Spent vs. Acquired

- **Source**: 2006-08-08-advancement.md (qmd://perko/2006-08-08-advancement.md)
- **Key points**: Three fundamental building blocks for progression:
  - **Threshold** (auto-gained, like levels) — low-focus, keeps players in the moment
  - **Spent** (player-allocated, like skill points or money) — high-focus, engages players in system mastery
  - **Acquired** (given without point value, like loot drops) — zero-focus, good for dramatic/freeform games
  - Every game should combine at least two of these. Progression curves matter: exponential XP, faux-exponential (each tier adds qualitative new abilities), linear cost, flat skills (low caps forcing diversification), or temporary advancements (items that decay).
- **Notable quote**: "If you give out rewards too lavishly, they mean nothing. Be stingy. [...] The longer the lead-up time, the more anticipation the players feel."
- **Design recommendation**: Combine spent + acquired systems. Use temporary advancements (decaying items, consumables) to prevent permanent power inflation. Flat skill caps force diversification. Be stingy with rewards.

### 3. RPG Structure: "Exploring Options" vs. "Adding New Options"

- **Source**: 2010-07-05-structure-of-an-rpg.md (qmd://perko/2010-07-05-structure-of-an-rpg.md)
- **Key points**: RPGs have two modes — exploring the current gameplay terrain (leveling, buying gear, figuring out tactics) and adding new gameplay terrain (reaching the next town, fighting the boss, unlocking new areas). New gameplay should be "similar but distinct" — too similar feels pointless, too different feels like earlier investment was wasted. Good RPGs let both thorough explorers and fast-movers enjoy themselves.
- **Notable quote**: "This works best when the new gameplay is similar but distinct. If it's too similar, it doesn't feel different enough to bother exploring. If it's too distinct, it feels like you wasted all the time you spent on the earlier gameplay."
- **Design recommendation**: Structure content as unlockable "gameplay terrain" with controlled similarity gradients. Each new zone/system should build on mastered mechanics while introducing novelty.

### 4. Limited Choice, Big Agency — Meaningful Choices Over Unlimited Freedom

- **Source**: 2007-05-16-limited-choice-but-big-choices.md (qmd://perko/2007-05-16-limited-choice-but-big-choices.md)
- **Key points**: More freedom often means less agency. Two common (bad) patterns: (1) restricted actions in unrestricted space (illusory choice, zero agency), (2) quests as optional distractions with transient results (also zero agency). Better approach: _less freedom, more agency_. Example: instead of "pick race, stats, class," present the player with three pre-generated characters, each with world ties and backstory hooks (e.g., "cybernetic commando who survived the first Strekhakh encounter"). Quests should be algorithmically generated based on character history and have long-term world consequences. Quest results can compile into larger world outcomes (50 players defeating aliens = "aliens pushed back").
- **Notable quote**: "Instead of giving a player more freedom and then trying to compensate by reducing their agency, how about giving a player _less_ freedom and _more_ agency?"
- **Design recommendation**: For an MMORPG, tie character identity to world events at creation. Generate quests from character history. Let aggregate quest results shift the world state. This is directly applicable to a text MMORPG where world narrative can respond to collective player action.

### 5. Boolean Choices Are the Enemy — Choices Must Communicate on Multiple Axes

- **Source**: 2007-04-09-boolean-choices.md (qmd://perko/2007-04-09-boolean-choices.md)
- **Key points**: Light side/dark side choice systems are boolean and meaningless — the player decides once and then just reaffirms. Real RPG complexity comes from hundreds of stacked boolean decisions simultaneously in play (equipment, stats, positioning, resource management). Drama/dialogue choices fail because they typically offer only 2-3 viable options with no stacking, interweaving, or counterbalance. Choices should move freely along sliding axes, not be on/off switches. Social/narrative play needs a complex game world to support it.
- **Notable quote**: "This is why I've always pushed the need for a complex game world to support your social play. It's why I've always said it's easier to make social play subordinate to some other game which is complex enough to stand on its own."
- **Design recommendation**: For a text MMORPG, avoid binary moral choices. Build social/narrative play on top of a mechanically complex base system. Let player expression emerge from the interplay of many small decisions rather than a few big binary ones.

### 6. Player Choice Must Shape the Avatar, Not Just the World

- **Source**: 2009-12-02-an-article-on-choice.md (qmd://perko/2009-12-02-an-article-on-choice.md)
- **Key points**: The Fallout 3 problem — you can nuke a city but then cheerfully befriend the next town as if nothing happened. Choices change the world but fail to change the avatar's personality, future dialogue options, or contextual reactions. Good/evil scales are stupid because you only really choose once. Meaningful moral choices require changing contexts so the answer genuinely differs each time (e.g., "will you be dishonorable to help someone?").
- **Notable quote**: "Although you are faced with the choice fifty times (or five hundred times) in your play, you only actually choose ONCE, near the beginning, and after that you're simply reassuring a skittish computer that you are still playing the same character."
- **Design recommendation**: Choices should alter how future choices are presented and what the character can do/say, not just world flags. In a text game, this is especially achievable — past actions can dynamically shape available dialogue and action options.

### 7. Character Creation Should Introduce the World

- **Source**: 2012-11-06-character-creation-as-world-introduction.md (qmd://perko/2012-11-06-character-creation-as-world-introduction.md)
- **Key points**: Three purposes of character creation: (1) tactical party setup, (2) storytelling hooks for narrative, (3) world introduction (usually neglected). In unfamiliar settings, detailed stat-point allocation paralyzes new players. Solution: use chunky, combinatorial components instead — draw from decks of backstory, species, training, talent. Splash pages with evocative art/descriptions make players go "I want to play a doombaker." Class/background choices should be culturally tied to the world so that picking a character teaches the setting.
- **Notable quote**: "Instead of carefully weighting their stats, allow players to simply choose A, B, or C — several times."
- **Design recommendation**: For a Vance-inspired setting, make character creation a world tour. Offer chunky archetypes tied to factions/planets/cultures rather than stat-point allocation. Each choice teaches setting lore.

### 8. Content Reuse and Adaptive NPCs — Stop Fire-and-Forget

- **Source**: 2015-06-09-content-reuse-and-the-rpg.md (qmd://perko/2015-06-09-content-reuse-and-the-rpg.md)
- **Key points**: RPGs stretch content via grinding, hunting, sidequests, minigames, and algorithmic maps — but modern RPGs overstretch along these axes. Better methods: (1) **Adaptive content** — NPCs you revisit, who evolve, who have relationships with other NPCs, who can join your party. Squaring content by letting players hook NPCs up with each other. Towns that grow and change with tradeoffs, not linear progression. (2) **Short, reusable RPGs** over one bloated 50-hour experience. (3) **Player-generated content** as an inexhaustible stream — but curated, not randomly spliced in. "Generate levels unrandomly. Unstretched, uncompressed."
- **Notable quote**: "Rather than focus on creating more thin towns and NPCs, it's worth considering making fewer, denser assets that can be stretched further without fraying."
- **Design recommendation**: For a text MMORPG, invest in deep, adaptive NPCs with inter-NPC relationships rather than vast shallow content. Let players affect NPC social graphs. Build reusable, recombinant content modules.

### 9. Classes Enable Replayability — The Skyrim Counter-Argument

- **Source**: 2011-01-13-skyrim.md (qmd://perko/2011-01-13-skyrim.md)
- **Key points**: While Perko argues against classes for MMOs (2005), he makes a nuanced counter-argument for single-player RPGs. Removing classes (as Skyrim did) kills replayability because all characters start identical and take 10+ hours to differentiate. Classes let you "walk out the door as a warrior and do warrior things right away." Spell creation and exploits are features, not bugs — a single-player game doesn't need balance. Streamlining complexity is the wrong direction; players enjoy system depth, custom spells, and emergent exploits.
- **Notable quote**: "Character design — choosing not just your visual look but also your stats — is a core part of RPG gameplay. The 'class' was simply an extension of this, allowing you to radically alter your growth curve and quickly develop different ways to play the game."
- **Design recommendation**: The tension between "no classes" (2005) and "classes enable replay" (2011) resolves for an MMORPG: use a Fallout-style continuous skill system but with chunky starting archetypes that give immediate identity and divergent early play, then let characters blur and specialize organically.

### 10. Crafting Party Members — Talent System Over Stat Rolls

- **Source**: 2013-02-14-crafting-party-members.md (qmd://perko/2013-02-14-crafting-party-members.md)
- **Key points**: NPC creation should use "talents" (beefy, cunning, ice-aligned) + visual perks (messy red hair, glasses) instead of granular stat rolls. This makes characters memorable and distinguishable even when they change roles. Scripted NPCs should not be inherently more powerful than player-created ones.
- **Design recommendation**: For a text game, character descriptors should be human-readable traits, not hidden numbers. "Cunning spacer with scarred hands" beats "STR 14 DEX 16 INT 12."

## Evidence Ledger

<!-- EVIDENCE_START -->

| Claim                                                                     | Source                                                 | Date       | Confidence | Excerpt                                                                                                                  | URL                                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------ | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Classes are bookkeeping approximations inappropriate for digital games    | 2005-12-02-games-with-class.md                         | 2005-12-02 | High       | "Classes are an approximation tool to make bookkeeping easier for humans. They are limiting your MMORPG"                 | https://projectperko.blogspot.com/2005/12/games-with-class.html                         |
| Three advancement types: threshold, spent, acquired                       | 2006-08-08-advancement.md                              | 2006-08-08 | High       | "The first building block is your choice between threshold, spent, and acquired advancements"                            | https://projectperko.blogspot.com/2006/08/advancement.html                              |
| Less freedom + more agency beats more freedom + less agency               | 2007-05-16-limited-choice-but-big-choices.md           | 2007-05-16 | High       | "how about giving a player less freedom and more agency?"                                                                | https://projectperko.blogspot.com/2007/05/limited-choice-but-big-choices.html           |
| Boolean choices are the plague of RPG dialogue design                     | 2007-04-09-boolean-choices.md                          | 2007-04-09 | High       | "Every verb is like this... It is not a question of whether you dance in the rain, but rather how you dance in the rain" | https://projectperko.blogspot.com/2007/04/boolean-choices.html                          |
| Choices must change the avatar, not just the world                        | 2009-12-02-an-article-on-choice.md                     | 2009-12-02 | High       | "you only actually choose ONCE, near the beginning, and after that you're simply reassuring a skittish computer"         | https://projectperko.blogspot.com/2009/12/article-on-choice.html                        |
| RPG structure = exploring options + adding new options                    | 2010-07-05-structure-of-an-rpg.md                      | 2010-07-05 | High       | "letting you explore, then letting you open more stuff to explore"                                                       | https://projectperko.blogspot.com/2010/07/structure-of-rpg.html                         |
| Removing classes kills replayability (Skyrim critique)                    | 2011-01-13-skyrim.md                                   | 2011-01-13 | High       | "The class was simply an extension of this, allowing you to radically alter your growth curve"                           | https://projectperko.blogspot.com/2011/01/skyrim.html                                   |
| Character creation should introduce the world via chunky components       | 2012-11-06-character-creation-as-world-introduction.md | 2012-11-06 | High       | "Instead of carefully weighting their stats, allow players to simply choose A, B, or C — several times"                  | https://projectperko.blogspot.com/2012/11/character-creation-as-world-introduction.html |
| Use talents + visual perks instead of stat rolls for memorable characters | 2013-02-14-crafting-party-members.md                   | 2013-02-14 | Medium     | "randomly choose three tiered talents and two visual perks"                                                              | https://projectperko.blogspot.com/2013/02/crafting-party-members.html                   |
| Build fewer, denser NPCs with relationships rather than many thin ones    | 2015-06-09-content-reuse-and-the-rpg.md                | 2015-06-09 | High       | "making fewer, denser assets that can be stretched further without fraying"                                              | https://projectperko.blogspot.com/2015/06/content-reuse-and-rpg.html                    |
| Social play needs complex game mechanics as a foundation                  | 2007-04-09-boolean-choices.md                          | 2007-04-09 | High       | "it's easier to make social play subordinate to some other game which is complex enough to stand on its own"             | https://projectperko.blogspot.com/2007/04/boolean-choices.html                          |
| Persistent world MMOs often mean "you can't do shit" — need player agency | 2008-01-06-information-handling.md                     | 2008-01-06 | Medium     | "persistent world really translates to you can't do shit"                                                                | https://projectperko.blogspot.com/2008/01/information-handling.html                     |
| Quest results should compile into aggregate world outcomes                | 2007-05-16-limited-choice-but-big-choices.md           | 2007-05-16 | High       | "if fifty people defeat Strekhakhs locally... the game itself can say 'The Strekhakhs are being pushed back!'"           | https://projectperko.blogspot.com/2007/05/limited-choice-but-big-choices.html           |
| New gameplay terrain should be similar-but-distinct to prior terrain      | 2010-07-05-structure-of-an-rpg.md                      | 2010-07-05 | High       | "If it's too similar, it doesn't feel different enough... If it's too distinct, it feels like you wasted all the time"   | https://projectperko.blogspot.com/2010/07/structure-of-rpg.html                         |
| Be stingy with advancement rewards; long lead-up builds anticipation      | 2006-08-08-advancement.md                              | 2006-08-08 | High       | "The longer the lead-up time, the more anticipation the players feel... Be stingy"                                       | https://projectperko.blogspot.com/2006/08/advancement.html                              |

<!-- EVIDENCE_END -->

## Gaps & Limitations

- **No semantic search results**: The vector search model had to download during the session, so all queries used BM25 keyword search only. Semantic search might surface additional relevant posts about emergent gameplay, social dynamics, or procedural narrative.
- **MMO-specific design**: Only one post directly addressed MMO persistent-world design frustrations (2008 information-handling). Perko's blog skews toward single-player and tabletop RPG analysis, with MMO commentary scattered across posts about other topics.
- **Combat systems**: No dedicated search was run for combat/encounter design. Perko likely has posts on tactical combat (he references Final Fantasy Tactics and Valkyrie Profile repeatedly) that could inform text-based combat design.
- **Text-specific UI/UX**: Perko writes about graphical RPGs. No posts found addressing text-only interfaces, MUD design, or parser-based interaction — those design constraints will need other sources.
- **Economy and crafting**: No search was run for economic systems, trading, crafting loops, or resource management, which are critical for MMORPGs.
- **Perko's later work (2016-2019)** may contain more refined thinking on these topics; the strongest hits clustered in 2005-2013.
