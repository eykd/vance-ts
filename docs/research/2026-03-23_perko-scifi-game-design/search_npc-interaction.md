# Search: NPC Interaction Design

## Queries Run

- `"NPC dialogue conversation interaction"` — 2 results; found core posts on NPC communication and language barriers
- `"character personality companion party member"` — 5 results; hit the motherlode of companion design posts (2014-06-09, 2018-09-10, 2014-06-18, 2013-08-10, 2018-09-10)
- `"social NPC even more chatter"` — 4 results; found chattering questlines, NPC growth/personality, semiautomatic NPCs, dissecting the RPG
- `"social AI reputation faction loyalty trust"` — 0 results
- `"crew ship hiring sailor merchant trade"` — 0 results
- `"social simulation chatter mood emotion"` — 0 results

8 documents fetched and analyzed in full.

## Key Findings

### 1. The Mood System: NPCs Must Push Into Player Awareness

- **Source**: 2014-06-09-companions.md (qmd://perko/2014-06-09-companions.md)
- **Key points**:
  - "A character that quietly does their job is invisible." NPCs need to actively push into the player's attention through a **mood system**.
  - Moods are medium-to-long-term personality changes triggered by situations the NPC's personality cares about. Players can plan to avoid or cause mood triggers.
  - Characters in a mood **pester the player**, making it clear they exist, are in a mood, and what their personality is.
  - Not all characters get along -- incompatible personalities cause more mood problems and complaints. Synergistic characters push each other into good moods with statistical bonuses.
  - Moods are tended by **interacting with** the character (not just talking). Sometimes you need to spend game-time doing something they find interesting, or going someplace they can relax.
- **Notable quote**: "A character that quietly does their job is invisible. Therefore, our characters have to have things outside of combat that matter enough that the player wants to pay attention."
- **Relevance to merchant ship game**: Crew members should have moods triggered by voyage conditions (long journeys, dangerous waters, poor rations, homesickness). Players manage crew happiness through shore leave, activities, and interpersonal dynamics.

### 2. Personality Leveling and Micromanagement

- **Source**: 2014-06-09-companions.md (qmd://perko/2014-06-09-companions.md)
- **Key points**:
  - Instead of only leveling stats, let players spend growth points on a **personality tree** -- alter what causes moods, what moods do, how NPCs behave in moods.
  - **AI overriding**: NPCs take automatic actions (spending cash, equipping gear, scouting ahead, eating foods). Player can enable/disable/require-ask for each. These have small but cumulative mood effects.
  - **Social pestering**: Proximity and attention mechanics -- staying near/far, eye contact forces different social AI modes. Different characters want different social distances.
  - **Action pestering**: Keeping NPCs busy with tasks prevents mood-caused destructive actions.
- **Notable quote**: "Why stick to stats? When a mood ends (good or bad), the character gets growth points. Spend these in a growth tree... you're altering their personality and behaviors bit by bit instead of their combat capabilities."
- **Relevance**: Crew personality development over long voyages. Assigning tasks to keep crew busy and productive. Captain manages crew through work assignments, not just dialogue.

### 3. Interconnectivity and Scope Changes

- **Source**: 2014-06-09-companions.md (qmd://perko/2014-06-09-companions.md)
- **Key points**:
  - Party members should relate to each other, to non-party NPCs, and to the world. Relationships include mentors, rivals, bromances, sponsorships, patriotism.
  - Some relationships cancel or cause moods when characters are together -- use this to balance a party.
  - **Characters should not always stay in your party.** Send them on side missions (trading runs, overseeing construction, helping a town). They send missives with decisions for the player.
  - Missive decisions include: choosing rewards, long-term vs short-term tradeoffs, personal gain vs world benefit, automatic vs manual handling, mood-based tradeoffs ("I can do this better, but it'll put me in a bad mood").
- **Notable quote**: "Characters shouldn't always stay in your party! ...when you encounter a side quest, you can either accept, refuse, or send someone off to help them!"
- **Relevance**: Directly applicable to merchant ship crews. Send crew on shore errands, trading missions, or shore leave. They report back with decisions. Crew relationships affect ship morale.

### 4. Context-Driven Character Expression (Hangout System)

- **Source**: 2018-09-10-character-driven-game-design.md (qmd://perko/2018-09-10-character-driven-game-design.md)
- **Key points**:
  - Characters should contextualize events through **progressions** -- chains of reactions to a task or situation. Different characters want different progressions from the same task.
  - NPCs should offer **action plans** to the player, not just respond to dialogue. "Take it out, I'll support you" vs "let's ambush it, follow my lead" -- functional plans that embed gameplay bonuses and advance character development.
  - **Contexts can be shelved and readopted.** If a character wants to do something and the player ignores it, the character shelves that intention and picks it up later when relevant, avoiding repetitive nagging.
  - Multiple party members can discuss and banter with each other, building collaborative contexts. A third party can disarm failed social situations gracefully.
  - Personal contexts (drunk, angry, mourning, nervous) affect how NPCs approach any task, including minigames. "You're going to have very different 'ship in a bottle' minigames depending on whether your friend is drunk, angry at her parents, mourning the loss of a friend..."
- **Notable quote**: "Hanging out is collaborative. Lydia can't really collaborate with the player in the gameplay as it exists."
- **Relevance**: Crew interactions during downtime at sea. Crew members propose plans during encounters (pirates, storms, trading opportunities). Their mood and personality determine what plans they suggest.

### 5. NPCs Should Judge Actions, Not Intentions

- **Source**: 2014-06-18-growing-npcs.md (qmd://perko/2014-06-18-growing-npcs.md)
- **Key points**:
  - The most powerful NPC experiences come from characters who **move through the same space as the player**, not from backstories or loyalty missions.
  - NPCs should judge based on **observable player actions**, not quest choices. The Skyrim mod "Arissa" judges the player on thief skills (sneak attacks, lockpicking, pickpocketing) rather than ethical dilemmas. This avoids the problem of NPCs misinterpreting player motivations.
  - Clear progression rewards for NPC approval: carry things > equip gear > give lockpicks > give poisons. Simple, observable, never ambiguous.
  - After 30 minutes with Arissa, Perko found himself **changing his behavior for the NPC** -- pulling off unnecessary stealth kills and stealing things he didn't need to impress her. "I can't recall ever doing that for any other NPC."
  - For multiple NPCs, limit active companions to 1-2 to avoid judgment overload.
  - **Plan triggers**: Tell party to "ask around for rumors", "stay close and on alert", "go to the inn", "wander as they see fit". Vague but functional orders.
- **Notable quote**: "The important thing about an NPC, to me, is not the design or the personality. It's that the NPC feels like they are moving through the same space as me."
- **Relevance**: Crew should judge the captain on observable sailing/trading actions. A navigator respects bold routing; a cautious first mate disapproves. Player gives vague orders ("look for trading opportunities in port", "stay alert for pirates"). Clear progression rewards for crew trust.

### 6. The Chatter System: Conversation as World-State Interface

- **Source**: 2014-06-11-npc-growth-and-personality.md (qmd://perko/2014-06-11-npc-growth-and-personality.md)
- **Key points**:
  - Each NPC statement reveals a **concrete in-world state** ("Anna bought a valuable horse" = affluence 120). These become reusable conversation tokens.
  - Players can reference past NPC statements as **verbs** to communicate with other NPCs: "do this", "steal this", "I want this". No natural language parser needed.
  - NPC states are driven by simple underlying stats (affluence, relationships, job, personality, mood, culture). These generate contextual dialogue automatically.
  - The system is **constructive** -- players can improve NPC lives by giving loot, training skills, improving their workplace, relaying knowledge from other NPCs, or appealing to their boss.
  - NPCs can be convinced to change their role based on simple comparison: affluence and danger in current job vs. the player's offer, weighted by respect.
- **Notable quote**: "It doesn't just let you refer to thing X more easily. It gives you a grip on the underlying social and economic engines that govern the NPCs lives."
- **Relevance**: Crew members reveal their state through chatter ("The food's getting stale", "I heard Port Callisto pays triple for spice"). These become actionable intelligence and orders. Recruiting crew works by comparing ship life vs. their current situation.

### 7. NPC Seeming vs Being Intelligent

- **Source**: 2009-10-08-thinking-without-language.md (qmd://perko/2009-10-08-thinking-without-language.md)
- **Key points**:
  - NPCs should **seem** intelligent, not actually be intelligent. Actually intelligent NPCs "act erratically and will frequently derail the pacing and plot."
  - NPCs need just enough independence to adapt to the player, not enough to derail the game. This level of independence "really isn't hard" -- give NPCs a tactical understanding and let them play the social game using simple heuristics.
  - Love triangle example: two prospective love interests can work behind the scenes to ensure the trailing one advances quickly and the leader slows down, maintaining tension. Neither needs to be "smart" -- just aware of a few variables.
  - In a text game, "situational language" is key: create situations that communicate NPC character traits. "She's willing to sacrifice honor for fairness" is better shown through a situation than stated in dialogue.
- **Notable quote**: "It turns out making NPCs more intelligent isn't actually what we want: we simply want them to seem more intelligent. If they actually are more intelligent, they'll act erratically (from our perspective) and will frequently derail the pacing and plot."
- **Relevance**: Crew AI should use simple heuristics that produce the appearance of personality. Don't over-engineer; a crew member who always volunteers for dangerous tasks and one who always suggests caution will feel like distinct people with minimal logic.

### 8. Reducing NPC Complexity for Player Comprehension

- **Source**: 2014-03-31-semiautomatic-npcs.md (qmd://perko/2014-03-31-semiautomatic-npcs.md)
- **Key points**:
  - **Throttle NPC count**: "If the player ever has more than six or seven active NPCs, they are going to lose track." In groups of 4-7, compelling group interactions emerge naturally.
  - Use **shtick** (pirate queen, brutal pirate, ghost pirate) to create instant strong impressions. Shtick matters more than statistical variety. Combine 2-3 sub-shticks for variety.
  - **Personalities must be expressed in-game** to matter. Just labeling someone "shy" is useless if shyness never manifests in gameplay. Match personality traits to game systems.
  - Rely on NPCs feeling real **to each other** through chatter. "A pool of supplies and responses can be used to make it seem convincing, such as a shy person getting flustered in response to another person's chatter."
  - Relationships should be **player-created**, since the player knows the characters' personal dynamics better than the system does. Chatter is stateless -- it expresses personality without tracking relationship scores.
  - **Churn** is essential. Use plot arcs, sending characters on solo missions, or settling characters into locations to prevent party stagnation.
- **Notable quote**: "If the player ever has more than six or seven active NPCs, they are going to lose track. So regardless of what sort of game you're programming, if the NPCs need to matter then you'll need to make sure only a few of them matter."
- **Relevance**: Ship crew should be 4-7 active members. Each crew member needs a strong shtick (the grizzled navigator, the bookish trader, the reckless gunner). Crew chatter during voyages. Port visits introduce churn -- crew may leave, new crew available.

### 9. Party Member Choice Defines Player Character

- **Source**: 2015-08-11-good-bad-game-design.md (qmd://perko/2015-08-11-good-bad-game-design.md)
- **Key points**:
  - In RPGs, the player defines their character's personality by **choosing companions**. "Shepard has a character because you mentally justify why these party members are her favorite."
  - Party member choice is "continuous and ongoing" -- it "wriggles in your brain and forces you to continually imagine how Shepard feels about how things are going."
  - In open-world games, you "put in" actions rather than choices. Continuous play actions (sneaking, shooting, exploring) develop the avatar's character.
- **Notable quote**: "If you offer enough secondary characters and constrain the number you can choose, you can allow a player some freedom to 'put in' their personality and 'get' role play out of it."
- **Relevance**: The crew a player hires defines their captain's identity. Hiring all fighters = pirate captain. Hiring skilled traders and navigators = merchant prince. The choice should feel continuous and defining.

### 10. Faction-Based Dialogue Templates

- **Source**: 2014-06-09-companions.md (qmd://perko/2014-06-09-companions.md)
- **Key points**:
  - For modular NPC dialogue, use a **faction system** where factions have relationships to each other, automatically reflected onto faction members.
  - Dialogue uses templates with embedded variables: `"%amplifiedAddress% %optionalExclamation% %targetFactionMembers% should try getting your hands dirty %rareTimespan%"` becomes "Maybe you mages should try getting your hands dirty once in a while" or "You fucking magicians should try getting your hands dirty sometime!"
  - Relationships between factions are what matter, not specific faction pairs. Miners don't have mage-specific lines -- they have lines for any group they think is hoity-toity.
  - Characters can override tokens for personalized speech patterns (accents, verbal tics).
- **Notable quote**: "This kind of thing is very annoying to write, but it's the only thing I can think of that would be modular enough to support characters and factions added in later."
- **Relevance**: Crew from different factions/backgrounds (navy, pirates, merchants, colonists) have template-driven dialogue reflecting faction attitudes. A naval deserter and a pirate on the same crew generate natural friction through faction relationship templates.

## Evidence Ledger

<!-- EVIDENCE_START -->

| Claim                                                                                      | Source                                     | Date       | Confidence | Excerpt                                                                                                                                                                                                                   | URL                                                    |
| ------------------------------------------------------------------------------------------ | ------------------------------------------ | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| NPCs must actively push into player awareness through moods                                | 2014-06-09-companions.md                   | 2014-06-09 | High       | "A character that quietly does their job is invisible. Therefore, our characters have to have things outside of combat that matter enough that the player wants to pay attention."                                        | qmd://perko/2014-06-09-companions.md                   |
| Personality growth trees > stat growth trees for NPC development                           | 2014-06-09-companions.md                   | 2014-06-09 | High       | "Why stick to stats? When a mood ends (good or bad), the character gets growth points. Spend these in a growth tree... you're altering their personality and behaviors bit by bit instead of their combat capabilities."  | qmd://perko/2014-06-09-companions.md                   |
| Send party members on solo missions with decision-point missives                           | 2014-06-09-companions.md                   | 2014-06-09 | High       | "Characters that are away send regular missives to keep in touch... over the course of the mission, there should be several opportunities for things to go differently, and the missives should ask what they should do." | qmd://perko/2014-06-09-companions.md                   |
| Characters should contextualize events through progressions, offering action plans         | 2018-09-10-character-driven-game-design.md | 2018-09-10 | High       | "When Lydia says 'that bear might threaten travelers...' two action plans might pop up and be selectable... these are represented as dialog, but they're not simply dialog: they're functional plans."                    | qmd://perko/2018-09-10-character-driven-game-design.md |
| Contexts should be shelved and readopted to avoid repetitive nagging                       | 2018-09-10-character-driven-game-design.md | 2018-09-10 | High       | "Instead, she can simply shelve an intended progression when it falls through."                                                                                                                                           | qmd://perko/2018-09-10-character-driven-game-design.md |
| NPCs should judge observable actions, not inferred intentions                              | 2014-06-18-growing-npcs.md                 | 2014-06-18 | High       | "She doesn't judge you based on which quests you accept... She judges you based on how awesome a thief you are. Sneak attacks, picking locks, and picking pockets will earn her friendship."                              | qmd://perko/2014-06-18-growing-npcs.md                 |
| NPCs judging observable actions causes players to change behavior to impress them          | 2014-06-18-growing-npcs.md                 | 2014-06-18 | High       | "I was changing my behavior for Arissa. I was pulling off unnecessary stealth kills and stealing things I didn't need specifically to impress her. I can't recall ever doing that for any other NPC."                     | qmd://perko/2014-06-18-growing-npcs.md                 |
| NPC chatter reveals concrete in-world state that becomes reusable interaction tokens       | 2014-06-11-npc-growth-and-personality.md   | 2014-06-11 | High       | "It doesn't just let you refer to thing X more easily. It gives you a grip on the underlying social and economic engines that govern the NPCs lives."                                                                     | qmd://perko/2014-06-11-npc-growth-and-personality.md   |
| NPCs should seem intelligent, not be intelligent; actual intelligence derails games        | 2009-10-08-thinking-without-language.md    | 2009-10-08 | High       | "It turns out making NPCs more intelligent isn't actually what we want: we simply want them to seem more intelligent."                                                                                                    | qmd://perko/2009-10-08-thinking-without-language.md    |
| Limit active NPCs to 4-7 for compelling group interactions                                 | 2014-03-31-semiautomatic-npcs.md           | 2014-03-31 | High       | "If the player ever has more than six or seven active NPCs, they are going to lose track."                                                                                                                                | qmd://perko/2014-03-31-semiautomatic-npcs.md           |
| Shtick (strong archetype combination) matters more than statistical variety                | 2014-03-31-semiautomatic-npcs.md           | 2014-03-31 | High       | "If you have to choose between adding more variation or more shtick options, always go with shtick!"                                                                                                                      | qmd://perko/2014-03-31-semiautomatic-npcs.md           |
| Player defines their character identity through companion choice                           | 2015-08-11-good-bad-game-design.md         | 2015-08-11 | High       | "Shepard has a character because you mentally justify why these party members are her favorite."                                                                                                                          | qmd://perko/2015-08-11-good-bad-game-design.md         |
| Faction-based dialogue templates enable modular, extensible NPC speech                     | 2014-06-09-companions.md                   | 2014-06-09 | Medium     | "The relationships are what matter, not usually the specific target faction. The miner's don't have a mage-specific line they use, it's a line they use for any group they think is hoity-toity."                         | qmd://perko/2014-06-09-companions.md                   |
| Party construction via social links (leader, sworn companions) provides response structure | 2013-08-10-constructive-implicit-goals.md  | 2013-08-10 | Medium     | "You'd probably construct a party out of social links - this guy is the leader, those three are sworn companions, etc."                                                                                                   | qmd://perko/2013-08-10-constructive-implicit-goals.md  |
| NPC opinions require underlying experiences; shallow fact-labeling breaks immediately      | 2008-08-26-natural-language-barrier.md     | 2008-08-26 | High       | "Adding information in this way is the shallowest, most brittle method of adding information. The illusion of depth we gain is painfully bad."                                                                            | qmd://perko/2008-08-26-natural-language-barrier.md     |
| Churn is essential; use plot arcs, solo missions, settlement to prevent party stagnation   | 2014-03-31-semiautomatic-npcs.md           | 2014-03-31 | High       | "Churn is really important in these games, or you'll settle on one party and stay with it forever."                                                                                                                       | qmd://perko/2014-03-31-semiautomatic-npcs.md           |

<!-- EVIDENCE_END -->

## Gaps & Limitations

1. **No direct merchant/ship/crew content**: Perko never wrote specifically about merchant ships, naval crews, or trading games. All findings are extrapolated from fantasy RPG and open-world companion design.
2. **No MMO-specific advice**: Perko's designs assume single-player contexts. Multiplayer social dynamics (player-to-player vs player-to-NPC) are not addressed.
3. **Text-only considerations absent**: Perko frequently emphasizes visual body language and 3D spatial awareness as NPC communication channels. His 2009 post explicitly argues language is inferior to body language for NPC emotion. For a text-only game, his dialogue template system (faction-based templates with embedded variables) and chatter system are the most directly applicable, but his preferred expression channel (visual/spatial) is unavailable.
4. **No reputation/faction system posts found**: Searches for reputation, faction, loyalty, and trust returned no results. Faction-based dialogue is mentioned within the companions post but there is no dedicated faction system design post in the collection.
5. **Economic NPC systems are theoretical**: The NPC Growth and Personality post describes an economic chatter system but acknowledges it was never implemented ("just hot air").
6. **Limited coverage of NPC hiring/recruitment mechanics**: How players evaluate and choose to recruit NPCs is lightly covered (shtick system in Semiautomatic NPCs) but not deeply explored as a standalone mechanic.
