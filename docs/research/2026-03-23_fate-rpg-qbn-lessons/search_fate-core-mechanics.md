# FATE Core Mechanics and Design Philosophy

**Research angle**: FATE core mechanics — aspects, fate points, compels, invocations, stunts, the FATE fractal — and how free-form tagging works as a game system. Focus on mechanical design rationale and lessons for QBN engine design.

**Date**: 2026-03-23
**Queries used**: 7 of 8 (3 QMD local, 4 web)

---

## Evidence Ledger

| #   | Claim                                                                                                                                                                                                                                                               | Source                                  | URL                                                                            | Credibility                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| E1  | Aspects are short phrases declaring narrative importance; they exist on characters, scenes, zones, ships, campaigns, and systems. Anything with an aspect becomes mechanically relevant.                                                                            | QMD: game-design/diaspora.md            | qmd://game-design/diaspora.md                                                  | High — primary SRD text (Diaspora, VSCA)       |
| E2  | Invoke = spend fate point after rolling for +2 or reroll. Tag = invoke an aspect on something else. Compel = before rolling, propose a complication tied to an aspect; target accepts (gains FP) or refuses (pays FP).                                              | QMD: game-design/diaspora.md            | qmd://game-design/diaspora.md                                                  | High — primary SRD                             |
| E3  | Fate point economy is bidirectional: players spend FP to invoke aspects (gaining narrative control), GM offers FP via compels (introducing complications). This ebb and flow is the engine of play.                                                                 | Dice Exploder podcast, Wendi Yu         | https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with          | Medium-high — designer analysis podcast        |
| E4  | The FATE Fractal (Bronze Rule): "anything in the game world can be treated like a character — aspects, skills, stunts, stress tracks, consequences." A city, a fire, an earthquake can all be mechanized identically to a person.                                   | Fate SRD: Demystifying the Fate Fractal | https://fate-srd.com/odds-ends/demystifying-fate-fractal-and-nature-aspects    | High — official SRD                            |
| E5  | The fractal solves a fundamental RPG problem: traditional games can narrate large-scale conflicts but lack mechanics to resolve them. The fractal provides a single unified framework from individual duels to planetary conflicts without rule bloat.              | Iron Bombs blog analysis                | https://ironbombs.wordpress.com/2012/06/06/why-the-fate-fractal-rocks/         | Medium — thoughtful analysis blog              |
| E6  | Five aspect types with different lifespans: Game (permanent campaign issues), Character (permanent traits), Situation (scene-duration), Consequences (semi-permanent injuries), Boosts (one free invoke then gone). Each interacts differently with the FP economy. | Fate SRD: Types of Aspects              | https://fate-srd.com/fate-core/types-aspects                                   | High — official SRD                            |
| E7  | Stunts serve two purposes: (1) allow skills to perform normally-unavailable actions, (2) grant +2 under narrow circumstances. They cost refresh (lower starting FP). They cannot modify the core aspect/FP economy rules.                                           | Fate SRD: Building Stunts               | https://fate-srd.com/fate-core/building-stunts                                 | High — official SRD                            |
| E8  | Maneuvers let players create new aspects on targets or scenes via skill checks. First tag is free; subsequent tags cost FP. This is the primary mechanism for players to reshape the narrative environment.                                                         | QMD: game-design/diaspora.md            | qmd://game-design/diaspora.md                                                  | High — primary SRD                             |
| E9  | Declarations: a player spends a FP and declares a true fact about the world tied to their apex skill. The GM can modify but cannot flatly deny. This gives players direct narrative authority.                                                                      | QMD: game-design/diaspora.md            | qmd://game-design/diaspora.md                                                  | High — primary SRD                             |
| E10 | Writing effective dual-edged aspects is genuinely difficult. Players default to purely positive (easy to invoke) or purely negative (easy to compel). The dual-edge ideal often breaks down in practice.                                                            | Dice Exploder podcast                   | https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with          | Medium-high — practitioner analysis            |
| E11 | The economy can degenerate into mechanical optimization: players stack situation aspects for +2 bonuses rather than engaging narratively, making the system feel like a "plus two treadmill."                                                                       | Dice Exploder podcast                   | https://diceexploder.substack.com/p/fate-points-and-aspects-fate-with          | Medium-high — practitioner analysis            |
| E12 | Mechanical homogenization: "everything's either a +2 or a reroll" makes resolution outcomes mechanically repetitive regardless of fictional context.                                                                                                                | The Angry GM                            | https://theangrygm.com/ask-angry-star-wars-fate-and-critical-gaming/           | Medium — opinionated but analytically rigorous |
| E13 | Scaled invocation (Fate System Toolkit) stratifies aspect potency: tenuous (reroll only), relevant (+2 or reroll), perfect (auto-success or skill+3). This addresses the homogenization problem.                                                                    | Fate SRD: System Toolkit Aspects        | https://fate-srd.com/fate-system-toolkit/aspects                               | High — official SRD                            |
| E14 | Detonating situation aspects: permanently consume an environmental aspect for one free invoke, but the replacement aspect "must always make things more tenuous for everyone." Destruction creates new narrative pressure.                                          | Fate SRD: System Toolkit Aspects        | https://fate-srd.com/fate-system-toolkit/aspects                               | High — official SRD                            |
| E15 | Hostile invocations: when you invoke another PC's aspect against them, they receive the spent FP (but can't use it until next scene). This creates a delayed-reward economy between opposed characters.                                                             | Fate SRD: Invoking & Compelling         | https://fate-srd.com/fate-core/invoking-compelling-aspects                     | High — official SRD                            |
| E16 | Digital implementation can address FATE's improvisational challenges: "with interactive fiction, these judgments can be predetermined in the programming, allowing designers to set what is relevant and when."                                                     | Text Adventures forum discussion        | https://archive.textadventures.co.uk/forum/design/topic/6gase9p-pekg4pddjnsdrg | Low-medium — forum discussion                  |
| E17 | The yarnball model (Perko) maps directly to QBN: each meter is a quality, ship module choices gate which storylets fire, faction-specific meter curves make each faction's narrative space feel mechanically different.                                             | QMD: game-design/yarnball-genealogy.md  | qmd://game-design/yarnball-genealogy.md                                        | High — our own design doc                      |

---

## Key Findings

### 1. The Aspect System: Free-Form Tags as Narrative Primitives

FATE's central innovation is the **aspect** — a short natural-language phrase ("Wanted by the Imperium," "Engine Room on Fire," "Shaky Alliance with House Korval") that can be attached to anything: characters, scenes, zones, entire campaigns [E1]. Aspects are the atomic unit of narrative state. They declare: _this matters_.

What makes aspects a _system_ rather than mere flavor text is their mechanical interface:

- **Invocations** (spend FP, get +2 or reroll) reward players for engaging with the fiction [E2]
- **Compels** (accept complication for FP, or pay FP to refuse) force the fiction to push back [E2]
- **Maneuvers** (skill check to place a new aspect) let players reshape the narrative environment [E8]
- **Declarations** (spend FP to assert a fact) grant direct narrative authority [E9]

The design rationale: aspects bridge the gap between fiction and mechanics. Instead of exhaustively pre-enumerating every possible game state (D&D's condition list, GURPS's advantage catalog), FATE lets players and GMs create situational mechanics on the fly through natural language [E4].

### 2. The Fate Point Economy: Bidirectional Narrative Currency

The fate point economy is FATE's true engine [E3]. It creates a cycle:

1. **Spend FP to invoke** (player gains mechanical advantage by engaging with fiction)
2. **Accept compels to earn FP** (player accepts narrative complication)
3. This creates pressure to write aspects that work both ways — beneficial to invoke, vulnerable to compel

The GM has unlimited FP but can only deploy them through compels tied to existing aspects. Players have limited FP but can spend them freely on any relevant aspect. This asymmetry means:

- Players control _when_ to push hard (invoke)
- The GM controls _when_ to push back (compel)
- The fiction (aspects) mediates both directions

**Design insight for QBN**: This is a _pacing mechanism_. The FP economy controls narrative tempo — high-FP moments are player-driven triumph; low-FP moments are GM-driven complication. QBN qualities already gate storylet availability, but they lack an equivalent pacing currency that lets players trade short-term advantage for long-term vulnerability [E3, E17].

### 3. The FATE Fractal: Everything Is the Same Kind of Thing

The Bronze Rule states that anything in the game world can be modeled as a character: aspects, skills, stress tracks, consequences [E4]. A burning building, a political conspiracy, a starship — all use identical mechanical structures, just at different scales [E5].

**Why this matters**: The fractal means one set of rules handles everything. Players learn one interaction model (invoke/compel/maneuver) and it works at every scope. A conspiracy has aspects you can discover and invoke. A storm has a stress track you can whittle down. A faction has skills it uses to oppose you [E4, E5].

**Design insight for QBN**: QBN already has a proto-fractal in qualities — characters, locations, factions, and abstract concepts can all be tracked as quality values. But QBN qualities are numeric and opaque, while FATE aspects are textual and narratively transparent. The fractal's real lesson is: **use consistent mechanics at every scale, and make the state human-readable** [E4, E5, E17].

### 4. Aspect Lifespan Taxonomy

FATE's five aspect types [E6] form a temporal hierarchy:

| Type              | Lifespan                  | QBN Equivalent                            |
| ----------------- | ------------------------- | ----------------------------------------- |
| Game Aspects      | Permanent (campaign)      | World qualities, faction standings        |
| Character Aspects | Permanent (per character) | Character qualities (stats, traits)       |
| Situation Aspects | Scene-duration            | Storylet-local state, temporary modifiers |
| Consequences      | Multi-scene (injuries)    | Decaying qualities, cooldown timers       |
| Boosts            | One use, then gone        | Single-use bonuses, momentum tokens       |

**Design insight**: QBN typically treats all qualities as the same kind of thing (just numbers on a character). FATE's taxonomy suggests we should explicitly design for **different decay rates** — some qualities are permanent identity, some are situational context, some are fleeting momentum. The decay rate determines how the quality shapes narrative: permanent qualities define _who you are_; situational ones define _what's happening now_; boosts reward _what you just did_ [E6].

### 5. Stunts: Structured Exceptions to General Rules

Stunts are narrow mechanical exceptions: they let a specific skill do something it normally can't, or give +2 under a constrained circumstance [E7]. They cost refresh (starting FP), creating a tradeoff: more special abilities means less narrative flexibility via the FP economy.

**Design insight for QBN**: Stunts map to **special storylet prerequisites or effects that break normal rules** — e.g., a character with the "Smuggler" stunt might access storylets that are normally locked, or get bonus quality changes in trade storylets. The FATE lesson is that these exceptions should be (a) narrow enough to feel special, (b) costly enough to create tradeoffs, and (c) never override the core economy [E7].

### 6. Known Problems and Design Pitfalls

#### The Dual-Edge Problem [E10]

Writing aspects that work both for invocation AND compulsion is hard. In practice, players write purely positive aspects (always invoked, never compelled) or purely negative ones (always compelled, never invoked). The dual-edge ideal collapses under player optimization pressure.

**QBN implication**: Don't rely on players to create dual-edged content. In a computer game, the _engine_ controls both sides. A quality like "Notorious Smuggler" can be designed to unlock lucrative trade storylets (the "invoke") AND trigger imperial attention storylets (the "compel"). The designer, not the player, ensures the dual edge [E10, E16].

#### The +2 Treadmill [E11, E12]

All invocations produce the same mechanical effect (+2 or reroll), making diverse fictional situations feel mechanically identical. Players optimize by stacking situation aspects rather than engaging narratively.

**QBN implication**: Quality effects in storylets should produce _diverse_ mechanical outcomes, not a uniform bonus. A quality like "Well-Connected" shouldn't just give +2 to social checks — it should unlock entirely different storylet branches, introduce unique NPCs, or modify outcome text. Scaled invocation [E13] suggests variable potency based on relevance is worth adopting.

#### Player-Character Desynchronization [E12]

FATE gives players mechanical tools (FP spending) to shape outcomes independent of character goals. This can feel like metagaming rather than roleplay.

**QBN implication**: In a computer MMORPG, this is less of a problem because the player IS the character — there's no GM/player split. But it warns against giving players too many meta-currencies that feel detached from fiction. Qualities should feel like character state, not player resources.

### 7. Design Patterns to Adopt

**ADOPT: The fractal principle** — model everything (characters, factions, locations, ships, abstract threats) using the same quality/storylet framework. One set of mechanics at every scale [E4, E5].

**ADOPT: Aspect lifespan taxonomy** — explicitly design qualities with different decay rates (permanent, multi-session, scene-local, one-shot). Different timescales create different narrative effects [E6].

**ADOPT: Maneuver-like quality creation** — let players create temporary qualities through actions (like FATE maneuvers). In QBN, this means storylet outcomes that create new temporary qualities, which then gate further storylets. The player reshapes the narrative landscape through play [E8].

**ADOPT: Bidirectional pressure on traits** — ensure important qualities have both beneficial and detrimental storylet gates. "Notorious" unlocks underworld content but triggers law enforcement content. The engine enforces the dual edge that FATE players struggle to self-impose [E10, E16].

### 8. Design Patterns to Adapt

**ADAPT: The fate point economy as pacing mechanism** — QBN doesn't need a meta-currency, but it needs pacing. Translate the FP cycle into quality dynamics: high-quality states unlock powerful storylets but also attract powerful complications. The "spend to succeed, accept complications to recover" loop can be expressed through quality thresholds rather than a separate token [E3].

**ADAPT: Compels as system-initiated storylets** — FATE compels are GM-initiated complications. In QBN, this becomes the **storylet engine proactively surfacing complications** when quality states warrant them. A character with high "Wanted" quality doesn't need a GM to offer a compel — the engine automatically makes pursuit storylets available. The key adaptation: make "compel" storylets rewarding enough that players engage willingly rather than feeling punished [E2, E3].

**ADAPT: Scaled invocation for quality relevance** — rather than uniform effects, quality values could have tiered impact: low values provide minor narrative color, medium values unlock standard storylet options, high values unlock dramatic or transformative storylet branches [E13].

**ADAPT: Detonating aspects as consumable qualities** — let players permanently spend a quality for a one-time powerful effect, but the aftermath creates new complications. Burning your "Alliance with House Korval" to get their fleet in a crisis means you no longer have that alliance — and whoever replaces them may be worse [E14].

### 9. Design Patterns to Avoid

**AVOID: Free-form text as mechanical state** — FATE aspects are natural-language strings whose mechanical relevance requires human judgment. In a computer game, this becomes either (a) pre-enumerated tags disguised as free text, or (b) an LLM interpretation layer with all the unpredictability that implies. QBN's numeric qualities are computationally tractable; keep them [E1, E16].

**AVOID: Uniform mechanical effects** — the +2 treadmill shows that when diverse fiction maps to identical mechanics, players optimize rather than engage. Ensure qualities produce meaningfully different storylet gates and outcomes, not just scalar bonuses [E11, E12].

**AVOID: Player-authored tags** — FATE relies on players creating aspects. In a multiplayer computer game, player-authored mechanical content is an exploit vector. The engine should author qualities; players should trigger them through choices [E10, E11].

**AVOID: Separate meta-currency** — adding a fate-point-like token on top of QBN qualities creates cognitive overhead and feels gamey. Express the same dynamics (spend advantage now, accept vulnerability later) through the quality system itself [E3, E12].

---

## Synthesis: What FATE Teaches QBN Designers

FATE's deepest insight is that **narrative state should be mechanically active in both directions** — every interesting character trait should create both opportunities and vulnerabilities. In tabletop FATE, this requires player discipline and GM skill to maintain. In a QBN computer game, the _engine itself_ can enforce this principle by ensuring that any quality which gates beneficial storylets also gates complicating ones.

The FATE fractal teaches that **consistent mechanics at every scale** (character, faction, location, world) reduces cognitive load and enables emergent cross-scale interactions. A faction's "Militant" quality should work the same way as a character's "Aggressive" quality — same storylet gating logic, just different scope.

The fate point economy teaches that **pacing needs a mechanism**. Raw QBN (qualities gate storylets, storylets modify qualities) has no inherent pacing — it's a state machine without tempo. FATE's spend/earn cycle creates narrative rhythm: tension builds as FP deplete, relief comes as compels replenish them. QBN needs an equivalent — perhaps through quality decay rates, escalating complication thresholds, or a "heat" mechanic where beneficial quality accumulation attracts proportional complications.

The known failures teach what computers can fix: the dual-edge problem (designers control both sides), the +2 treadmill (diverse storylet outcomes instead of uniform bonuses), and the improvisation bottleneck (predetermined relevance instead of table negotiation) [E16]. FATE's weaknesses in tabletop play become QBN's strengths in digital implementation.
