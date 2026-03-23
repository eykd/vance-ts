# Research Briefing: FATE RPG Lessons for QBN Game Engine Design

**Date**: 2026-03-23
**Research question**: What lessons can we learn from the FATE RPG system for designing a QBN (quality-based narrative) game engine? Specifically: how do FATE's free-form tagging (aspects), compels, invocations, and fate points map to QBN mechanics — and what design patterns should we adopt, adapt, or avoid?

## Executive Summary

FATE's most transferable idea for QBN is the **compel economy** — the pattern where players earn currency by accepting narrative setbacks, then spend it for later advantage. This bidirectional pressure creates natural dramatic pacing (rising tension as resources deplete, relief through voluntary complications) that QBN currently lacks. The pattern maps directly to storylets that offer valuable quality gains at a cost to other qualities, and the yarnball model's interlocking meters already approximate it — but FATE teaches that the economy should be _legible_ to the player, not hidden behind opaque quality math ([Diaspora SRD](qmd://game-design/diaspora.md), [Dice Exploder podcast](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with), [Refereeing and Reflection](https://refereeingandreflection.wordpress.com/2018/06/24/the-fate-and-the-fudge-ious/)).

FATE's second major lesson is the **fractal principle** (everything modeled with consistent mechanics at every scale) and the **aspect lifespan taxonomy** (permanent traits, scene-duration situations, one-shot boosts). Both cross-confirmed across search agents and map cleanly to QBN quality design. The fractal means characters, factions, locations, and abstract threats should all use the same quality/storylet framework. The taxonomy means qualities should have explicitly designed decay rates — permanent identity qualities, decaying situation qualities, and single-use momentum qualities — rather than treating all qualities as interchangeable numbers, an anti-pattern that Alexis Kennedy himself identified as a core flaw in early QBN ([Weather Factory](https://weatherfactory.biz/qbn-to-resource-narratives/)).

The critical thing to **avoid** is porting FATE's free-form text tags. Aspects are natural-language strings whose mechanical relevance requires human judgment at every step — negotiating whether an aspect applies, agreeing on compel severity, improvising declarations. No successful digital FATE game exists, and this absence is itself evidence that the freeform negotiation model does not automate. QBN's numeric/typed quality approach is computationally tractable and should be preserved; the narrative richness should come from authored storylet text, not from player-improvised tag interpretation ([RPGnet Forum](https://forum.rpg.net/index.php?threads/my-issues-with-fate.670592/), [Emily Short](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/)).

## Key Findings

### ADOPT: Bidirectional Pressure on Qualities (The Compel Pattern)

FATE's compel mechanic — accept a complication tied to your character's aspect, earn a fate point — is the system's most distinctive and most transferable idea. It solves the "optimal play problem" by making setbacks rewarding ([Diaspora SRD](qmd://game-design/diaspora.md), [Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with)).

- In FATE, the economy is metagame (fate points exist outside the fiction). In QBN, it should be **diegetic** — the resources players earn and spend are in-world things (supplies, reputation, connections). This is more immersive for a digital game ([Gamer Theory](https://sgryphon.gamertheory.net/2021/11/rpg-mechanics-fate-core/)).
- FATE's dual-edge ideal (aspects that both help and hurt) collapses in practice because players write purely positive or purely negative aspects. In QBN, the **engine** controls both sides — a quality like "Notorious Smuggler" can be designed to unlock lucrative trade storylets AND trigger imperial attention storylets. The designer, not the player, ensures the dual edge ([Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with), [text adventures forum](https://archive.textadventures.co.uk/forum/design/topic/6gase9p-pekg4pddjnsdrg)).
- The compel-as-storylet pattern means the engine proactively surfaces complication storylets when quality states warrant them, rewarding engagement rather than punishing players.

### ADOPT: The Fractal Principle (Consistent Mechanics at Every Scale)

The FATE Fractal (Bronze Rule) states that anything in the game world can be treated like a character — aspects, skills, stress tracks, consequences ([Fate SRD](https://fate-srd.com/odds-ends/demystifying-fate-fractal-and-nature-aspects)). A city, a fire, a conspiracy can all be mechanized identically to a person ([Iron Bombs](https://ironbombs.wordpress.com/2012/06/06/why-the-fate-fractal-rocks/)).

- QBN already has a proto-fractal: characters, locations, factions, and abstract concepts can all be tracked as quality values. The lesson is to make this **explicit and consistent** — a faction's "Militant" quality should work the same way as a character's "Aggressive" quality.
- The fractal reduces cognitive load (one interaction model at every scope) and enables emergent cross-scale interactions.

### ADOPT: Aspect Lifespan Taxonomy (Quality Decay Rates)

FATE defines five aspect types with different lifespans: Game (permanent), Character (permanent), Situation (scene-duration), Consequences (multi-scene), Boosts (one-shot) ([Fate SRD: Types of Aspects](https://fate-srd.com/fate-core/types-aspects)). Each interacts differently with the fate point economy.

- QBN typically treats all qualities as undifferentiated numbers. FATE's taxonomy suggests explicitly designing qualities with **different decay rates**: permanent identity, multi-session consequences, scene-local situations, and one-shot momentum bonuses.
- Kennedy's own critique confirms this: early QBN treated "PC characteristics the same as currency amounts the same as story tracking variables," erasing "potentially useful distinctions" ([Weather Factory](https://weatherfactory.biz/qbn-to-resource-narratives/)).
- Minimum quality types for a yarnball engine: (a) meters/resources (scarce, tradeable), (b) story flags (boolean progress markers), (c) character traits (persistent descriptors modifying storylet availability).

### ADOPT: Prep-and-Payoff Storylet Chains (The Maneuver Pattern)

FATE's maneuver mechanic lets players place new aspects on targets or scenes, getting one free invocation before normal costs apply ([Diaspora SRD](qmd://game-design/diaspora.md)). This creates a two-phase tactical loop: create advantages, then exploit them.

- Maps cleanly to QBN: storylet effects create temporary qualities consumed by later storylets. A "scouted the enemy camp" quality unlocks a "surprise attack" storylet that consumes it.
- The "free tag" concept translates to a quality that provides a bonus on the next relevant check, then expires or decrements.
- Diaspora's rule limiting one aspect tag per scope per roll suggests **limiting how many temporary qualities can stack** on a single challenge.

### ADAPT: The Fate Point Economy as Pacing Mechanism

The fate point economy creates natural dramatic rhythm — depletion during high-stakes scenes, recovery through accepting complications ([Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with), [Diaspora SRD](qmd://game-design/diaspora.md)). Raw QBN lacks inherent pacing.

- Rather than adding a metagame currency (which creates cognitive overhead and feels gamey), express the same dynamics through **quality thresholds and resource scarcity cycles**: when key resources are depleted, complication storylets offering those resources become attractive; when resources are abundant, ambitious storylets that spend resources for progress become viable.
- The key adaptation: FATE's pacing is metagame; QBN's should be diegetic. Same oscillation pattern, expressed through in-world resources rather than abstract tokens.

### ADAPT: Scaled Invocation (Variable Quality Potency)

The Fate System Toolkit introduced scaled invocation to address the "+2 treadmill" — aspects can be tenuous (reroll only), relevant (+2 or reroll), or perfect (auto-success or skill+3) depending on fitness ([Fate SRD: System Toolkit](https://fate-srd.com/fate-system-toolkit/aspects)).

- In QBN, quality values could have tiered impact: low values provide minor narrative color, medium values unlock standard storylet options, high values unlock dramatic or transformative branches.
- This also maps to the "detonating aspects" variant: permanently spend a quality for a one-time powerful effect, but the aftermath creates new complications.

### ADAPT: Disco Elysium as Implementation Exemplar

Disco Elysium is the strongest example of FATE-adjacent ideas translated digitally, with skills as autonomous narrative agents, the Thought Cabinet as structured aspects, and failure-as-content implementing the compel pattern without an explicit economy ([Game Design Thinking](https://gamedesignthinking.com/disco-elysium-rpg-system-analysis/)).

- Key lesson: **qualities should be active agents that generate content**, not just passive gates. A "Paranoid" quality shouldn't just lock/unlock storylets — it should insert itself into other storylets as commentary, alternative interpretations, or interruptions, the way Disco Elysium's skills interject in dialogue.

### AVOID: Free-Form Text as Mechanical State

FATE aspects are natural-language strings whose mechanical relevance requires human judgment. Even at the table, this breaks down — players "decide whether to spend a fate point, then retroactively find an aspect to justify it," making aspect selection a formality ([RPGnet Forum](https://forum.rpg.net/index.php?threads/my-issues-with-fate.670592/)).

- In a computer game, free-form text becomes either pre-enumerated tags disguised as free text, or an LLM interpretation layer with unpredictability problems.
- No successful digital FATE game exists — this absence is evidence that the freeform negotiation model does not automate.

### AVOID: Uniform Mechanical Effects (The +2 Treadmill)

All FATE invocations produce identical effects (+2 or reroll) regardless of narrative context. This makes diverse situations feel mechanically identical and incentivizes stacking aspects rather than engaging narratively ([Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with), [The Angry GM](https://theangrygm.com/ask-angry-star-wars-fate-and-critical-gaming/), [RPGnet Forum](https://forum.rpg.net/index.php?threads/my-issues-with-fate.670592/)).

- Quality effects in storylets should produce **diverse** outcomes — different storylet branches, unique NPCs, modified outcome text — not uniform scalar bonuses.
- Kennedy's parallel critique: treating all qualities identically "erases potentially useful distinctions" ([Weather Factory](https://weatherfactory.biz/qbn-to-resource-narratives/)).

### AVOID: Player-Authored Mechanical Content

FATE relies on players creating aspects. In a multiplayer computer game, player-authored mechanical content is an exploit vector. Players should trigger quality changes through choices within authored storylets, not author the qualities themselves ([Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with)).

## Consensus & Disagreement

**Areas of consensus**:

- The compel economy pattern (earning rewards from setbacks) is FATE's most transferable idea for QBN — supported by both search agents, confirmed across [Diaspora SRD](qmd://game-design/diaspora.md), [Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with), [Refereeing and Reflection](https://refereeingandreflection.wordpress.com/2018/06/24/the-fate-and-the-fudge-ious/), and [Gamer Theory](https://sgryphon.gamertheory.net/2021/11/rpg-mechanics-fate-core/)
- Free-form text tags do not translate to digital systems — supported by [RPGnet Forum](https://forum.rpg.net/index.php?threads/my-issues-with-fate.670592/), [Emily Short](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/), [text adventures forum](https://archive.textadventures.co.uk/forum/design/topic/6gase9p-pekg4pddjnsdrg), and the absence of any successful digital FATE game
- The fractal principle (consistent mechanics at every scale) maps cleanly to QBN — supported by [Fate SRD](https://fate-srd.com/odds-ends/demystifying-fate-fractal-and-nature-aspects), [Iron Bombs](https://ironbombs.wordpress.com/2012/06/06/why-the-fate-fractal-rocks/), and internal design docs
- Mechanical homogenization (+2 treadmill / all-qualities-equal) is a key anti-pattern — independently identified in FATE by [Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with) and [The Angry GM](https://theangrygm.com/ask-angry-star-wars-fate-and-critical-gaming/), and in QBN by [Alexis Kennedy](https://weatherfactory.biz/qbn-to-resource-narratives/)

**Areas of disagreement**:

- None identified. Both search agents converged on the same adopt/adapt/avoid recommendations independently.

**Emerging / uncertain**:

- Whether a **metagame pacing currency** is strictly worse than diegetic resource pacing, or whether some hybrid approach could work — single-source reasoning, no empirical comparison available
- How exactly to implement **"qualities as active agents"** (the Disco Elysium pattern) in a QBN storylet engine — the concept is compelling but the implementation specifics are unexplored (single-source: [Game Design Thinking](https://gamedesignthinking.com/disco-elysium-rpg-system-analysis/))
- Whether **City of Mist's** tag-based system (a FATE derivative) offers a better bridge between freeform aspects and structured qualities — identified as a gap, not investigated

## Gaps & Limitations

- **No successful digital FATE game exists** to study as a direct precedent. The analysis relies on theoretical mapping rather than empirical observation of what works in practice.
- **Wildermyth** uses a tag/trait system for emergent digital narrative and could provide valuable evidence but was identified too late for investigation in this search round.
- **City of Mist** (FATE derivative using tags instead of numeric attributes) was identified as potentially relevant but not investigated.
- **Academic literature** on translating tabletop narrative mechanics to digital systems was found (Springer chapter "From Tabletop RPG to Interactive Storytelling") but not fetched.
- **The compel-as-authored-content pattern** needs prototyping to determine how QBN should present "accept this complication for a reward" choices to feel like dramatic agency rather than mechanical optimization.
- **Perko's cost of digital implementation** — tabletop mechanics that take 30 minutes to create require enormous engineering effort to digitize ([QMD: Perko](qmd://perko/2008-12-14-play-and-story.md)). The resource cost of implementing these patterns is not assessed here.
- Forum discussions and blog posts constitute the majority of sources; peer-reviewed game design research is absent.

## Source Quality Summary

| Source                                                                                                                                     | Type                     | Credibility | Key Contribution                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------- |
| [Fate SRD](https://fate-srd.com/)                                                                                                          | Official rules reference | High        | Definitive documentation of FATE mechanics: aspects, compels, invocations, fractal, scaled invocation, stunts |
| [Diaspora SRD](qmd://game-design/diaspora.md)                                                                                              | Local reference (VSCA)   | High        | Detailed mechanical specification of FATE aspects, maneuvers, declarations, fate point economy                |
| [Weather Factory / Alexis Kennedy](https://weatherfactory.biz/qbn-to-resource-narratives/)                                                 | Creator statement        | High        | Originator of QBN critiques its limitations; introduces resource narrative concept                            |
| [Emily Short: "Beyond Branching"](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/) | Expert analysis          | High        | Taxonomy of narrative architectures; positions QBN relative to salience-based systems                         |
| [Dice Exploder podcast (Wendi Yu)](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with)                                  | Designer analysis        | Medium-High | Practitioner critique of aspect dual-edge problem and +2 treadmill                                            |
| [Game Design Thinking: Disco Elysium](https://gamedesignthinking.com/disco-elysium-rpg-system-analysis/)                                   | Design analysis          | Medium-High | Detailed analysis of how Disco Elysium implements FATE-adjacent ideas digitally                               |
| [Iron Bombs blog](https://ironbombs.wordpress.com/2012/06/06/why-the-fate-fractal-rocks/)                                                  | Analysis blog            | Medium      | Thoughtful exploration of why the FATE fractal works across scales                                            |
| [The Angry GM](https://theangrygm.com/ask-angry-star-wars-fate-and-critical-gaming/)                                                       | Opinionated analysis     | Medium      | Analytical critique of mechanical homogenization in FATE                                                      |
| [RPGnet Forum](https://forum.rpg.net/index.php?threads/my-issues-with-fate.670592/)                                                        | Forum discussion         | Medium      | Practitioner reports on aspect abundance and retroactive justification problems                               |
| [Refereeing and Reflection blog](https://refereeingandreflection.wordpress.com/2018/06/24/the-fate-and-the-fudge-ious/)                    | Blog analysis            | Medium      | Analysis of compel dysfunction and perverse incentives                                                        |
| [Gamer Theory](https://sgryphon.gamertheory.net/2021/11/rpg-mechanics-fate-core/)                                                          | Mechanics analysis       | Medium      | Quantitative analysis of FATE success rates and token economy dependency                                      |
| [Bruno Dias](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html)                                                                    | Developer analysis       | Medium      | QBN architecture and coupling challenges                                                                      |
| [intfiction.org](https://intfiction.org/t/different-styles-of-qbn-storylet-game-design/78077)                                              | Forum discussion         | Medium      | QBN variant taxonomy (boolean, tag-based, MQBN)                                                               |
| [Text Adventures forum](https://archive.textadventures.co.uk/forum/design/topic/6gase9p-pekg4pddjnsdrg)                                    | Forum discussion         | Low-Medium  | Observation that digital implementation pre-determines relevance judgments                                    |
| [QMD: Perko](qmd://perko/2008-12-14-play-and-story.md)                                                                                     | Local reference          | Medium      | Cost asymmetry between tabletop and digital mechanic creation                                                 |
| [QMD: yarnball-genealogy.md](qmd://game-design/yarnball-genealogy.md)                                                                      | Local reference          | High        | Internal design document mapping yarnball model to QBN qualities                                              |

## Suggested Further Research

- **Wildermyth's tag/trait system**: How does Wildermyth use structured tags for emergent narrative in a digital game? This may be the closest existing implementation of FATE-like ideas in a shipping digital product.
- **City of Mist's narrative tags**: As a FATE derivative that replaces numeric skills with narrative tags, it may offer a middle ground between freeform aspects and rigid numeric qualities.
- **Compel-as-storylet prototyping**: What UX patterns make "accept this complication for a reward" feel like dramatic agency rather than mechanical optimization? How should the tradeoff be presented?
- **Quality-as-active-agent implementation**: How could a QBN engine make qualities interject into storylets (Disco Elysium style) rather than only gating them? What's the authoring cost?
- **Academic literature**: The Springer chapter "From Tabletop RPG to Interactive Storytelling" may contain formal frameworks for evaluating mechanic translation.
- **Pacing mechanism comparison**: Empirical comparison of metagame currency pacing vs. diegetic resource pacing in narrative games — is one strictly better for player engagement?

## Consolidated Evidence Ledger

| #   | Claim                                                                                                                   | Sources                                                                                                                                                                                                                                                           | Overall Confidence | Notes                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------ |
| 1   | Aspects are short phrases declaring narrative importance, attachable to anything (characters, scenes, zones, campaigns) | [Diaspora SRD](qmd://game-design/diaspora.md), [Fate SRD](https://fate-srd.com/fate-core/types-aspects)                                                                                                                                                           | High               | Both primary SRD sources confirm; foundational FATE mechanic       |
| 2   | Invoke = spend FP for +2 or reroll; Compel = accept complication for FP or pay FP to refuse                             | [Diaspora SRD](qmd://game-design/diaspora.md), [Fate SRD](https://fate-srd.com/fate-core/invoking-compelling-aspects)                                                                                                                                             | High               | Core rules, multiple official sources                              |
| 3   | The FP economy is bidirectional: spend to invoke, earn from compels, creating narrative ebb and flow                    | [Diaspora SRD](qmd://game-design/diaspora.md), [Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with), [Gamer Theory](https://sgryphon.gamertheory.net/2021/11/rpg-mechanics-fate-core/)                                          | High               | Cross-confirmed by primary rules and multiple analyst sources      |
| 4   | The FATE Fractal: anything can be modeled as a character using the same mechanical structure                            | [Fate SRD](https://fate-srd.com/odds-ends/demystifying-fate-fractal-and-nature-aspects), [Iron Bombs](https://ironbombs.wordpress.com/2012/06/06/why-the-fate-fractal-rocks/)                                                                                     | High               | Official SRD + independent analysis                                |
| 5   | Five aspect types with different lifespans (Game, Character, Situation, Consequence, Boost)                             | [Fate SRD](https://fate-srd.com/fate-core/types-aspects)                                                                                                                                                                                                          | High               | Official SRD, single authoritative source                          |
| 6   | Stunts are narrow mechanical exceptions costing refresh (starting FP), creating a tradeoff                              | [Fate SRD](https://fate-srd.com/fate-core/building-stunts)                                                                                                                                                                                                        | High               | Official SRD                                                       |
| 7   | Maneuvers place new aspects on targets; first tag is free, subsequent cost FP                                           | [Diaspora SRD](qmd://game-design/diaspora.md)                                                                                                                                                                                                                     | High               | Primary SRD                                                        |
| 8   | Writing dual-edged aspects is difficult; players default to purely positive or purely negative                          | [Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with)                                                                                                                                                                            | Medium             | Single practitioner source, but widely observed in FATE community  |
| 9   | All invocations produce identical +2/reroll regardless of fictional context (mechanical homogenization)                 | [Dice Exploder](https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with), [The Angry GM](https://theangrygm.com/ask-angry-star-wars-fate-and-critical-gaming/), [RPGnet Forum](https://forum.rpg.net/index.php?threads/my-issues-with-fate.670592/) | High               | Three independent sources confirm                                  |
| 10  | Scaled invocation (tenuous/relevant/perfect) addresses homogenization                                                   | [Fate SRD: System Toolkit](https://fate-srd.com/fate-system-toolkit/aspects)                                                                                                                                                                                      | High               | Official SRD variant                                               |
| 11  | Detonating situation aspects: consume for powerful one-shot, replacement must increase tension                          | [Fate SRD: System Toolkit](https://fate-srd.com/fate-system-toolkit/aspects)                                                                                                                                                                                      | High               | Official SRD variant                                               |
| 12  | Digital implementation can pre-determine aspect relevance, addressing FATE's improvisational dependency                 | [Text Adventures forum](https://archive.textadventures.co.uk/forum/design/topic/6gase9p-pekg4pddjnsdrg)                                                                                                                                                           | Uncertain          | Single low-medium credibility source; logically sound but unproven |
| 13  | No successful digital FATE game exists                                                                                  | Both search agents (negative result)                                                                                                                                                                                                                              | Medium             | Absence of evidence, not evidence of absence — but suggestive      |
| 14  | Kennedy abandoned QBN term; "all qualities equal" erases useful distinctions                                            | [Weather Factory](https://weatherfactory.biz/qbn-to-resource-narratives/)                                                                                                                                                                                         | High               | Creator statement from QBN originator                              |
| 15  | Emily Short distinguishes QBN, salience-based, and waypoint narrative architectures                                     | [Emily Short](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/)                                                                                                                                            | High               | Leading expert in interactive narrative                            |
| 16  | Disco Elysium implements FATE-adjacent ideas (skills as agents, failure as content, structured aspects)                 | [Game Design Thinking](https://gamedesignthinking.com/disco-elysium-rpg-system-analysis/)                                                                                                                                                                         | Medium             | Single analyst source; comparison is interpretive                  |
| 17  | Compel refusal creates perverse incentives; "no particular reason to refuse"                                            | [Refereeing and Reflection](https://refereeingandreflection.wordpress.com/2018/06/24/the-fate-and-the-fudge-ious/)                                                                                                                                                | Medium             | Single source; well-argued but represents one perspective          |
| 18  | Players decide to spend FP then retroactively justify with an aspect (formality problem)                                | [RPGnet Forum](https://forum.rpg.net/index.php?threads/my-issues-with-fate.670592/)                                                                                                                                                                               | Medium             | Forum discussion; consistent with other critiques but anecdotal    |
| 19  | Yarnball model maps to QBN: meters as qualities, module choices gate storylets, faction-specific curves                 | [QMD: yarnball-genealogy.md](qmd://game-design/yarnball-genealogy.md)                                                                                                                                                                                             | High               | Internal design document                                           |
| 20  | Tabletop mechanic creation takes 30 minutes vs. enormous digital implementation cost                                    | [QMD: Perko](qmd://perko/2008-12-14-play-and-story.md)                                                                                                                                                                                                            | Medium             | Single source; general observation about design cost asymmetry     |

## Methodology Notes

- **Complexity tier**: Comparison
- **Search rounds**: 1
- **Total queries**: ~15 (7 from search agent 1, 8 from search agent 2)
- **Sources evaluated**: 16 unique sources (2 local QMD references, 3 official Fate SRD pages, 11 external web sources)
- **Deep investigations**: none
- **Conflicts resolved**: none (both search agents converged independently)
- **Known gaps**: Wildermyth tag system not investigated; City of Mist not investigated; academic literature not fetched; compel-as-storylet UX patterns need prototyping; no empirical comparison of metagame vs. diegetic pacing currencies
