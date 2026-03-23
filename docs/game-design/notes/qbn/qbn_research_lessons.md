# QBN Research Lessons: What FATE, Sunless Sea/Skies, and Kennedy's Evolution Teach Us

**Synthesized from:**

- [FATE RPG QBN Lessons](../../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)
- [Sunless Sea/Skies Economy Research](../../../research/2026-03-23_sunless-economy/synthesis.md)
- Alexis Kennedy's [QBN to Resource Narratives](https://weatherfactory.biz/qbn-to-resource-narratives/) essay

**Cross-references:**

- [QBN Engine Spec](../../../spec/systems/qbn-engine.md) -- the system specification these lessons inform

---

## 1. Kennedy's QBN Evolution

Alexis Kennedy's intellectual trajectory is the spine of modern QBN thinking, and tracing it reveals what works and what to avoid.

**Fallen London (2009--)** established the vocabulary: qualities, storylets, the opportunity deck. Everything was a number. PC characteristics, currency amounts, story-tracking variables -- all qualities, all interchangeable. This "uniform quality principle" was a deliberate design choice that bought extraordinary flexibility: any storylet could check any quality, any effect could modify any quality. The engine needed only one mechanism. It scaled to thousands of storylets and a decade of live content.

But Kennedy himself came to see this uniformity as a flaw, not just a feature. By treating every quality the same way, Fallen London "erased potentially useful distinctions" between fundamentally different kinds of game state. A captain's identity, their fuel reserves, and a one-shot story flag all behaved identically in the engine. Writers could compensate with careful design, but the engine gave them no help.

**Sunless Sea (2015)** pushed QBN into a more systems-driven direction. Fuel, supplies, terror, and hull damage became the real story -- not because they gated storylets (though they did) but because their interrelationships created emergent drama. Running low on fuel in dark waters raised terror; high terror triggered nightmare storylets; nightmares consumed supplies through crew attrition. The resources _were_ the story, even without a single hand-authored storylet firing. This was the seed of what Kennedy would later call "resource narrative."

But Sea's trade economy failed. A static price matrix across 22 goods and 30+ ports became trivially solvable. Wiki-optimal routes killed emergent trading within weeks of release. The economy was too legible, too stable, too exploitable.

**Sunless Skies (2018)** addressed the trade failure directly with Bargains (time-limited discounted buys at minor ports) and Prospects (premium sell contracts at major ports). Instead of a memorizable lookup table, players scanned for dynamic opportunities and matched them to contracts. The affiliation system tied economic access to character identity -- your trade opportunities reflected who you were, not just which route you had memorized. Failbetter explicitly targeted "profit spikes over steady curves" as a design goal.

**The Resource Narrative essay (2020s)** was Kennedy's synthesis. He retired the term "QBN" altogether, arguing it was misleading (sounds like "high-quality narrative") and too vague. His replacement -- "resource narrative" -- carried a thesis: the interesting design space is not "qualities drive storylet selection" (which is mechanical) but "strategic manipulation of scarce resources produces drama" (which is aesthetic). The resources must align with the story's grain. In Sunless Sea, fuel/supplies/terror map directly to the fiction of a captain struggling against a dark underground ocean. The mapping is not arbitrary; it is poetic.

Kennedy's journey, then, moves from **undifferentiated state variables** to **typed, scarce, story-aligned resources**. The lesson for our engine is clear: qualities are not all created equal, and the engine should know the difference.

## 2. The "All Qualities Equal" Problem

Kennedy's critique of early QBN and FATE's "+2 treadmill" converge on the same structural flaw: treating all qualities as interchangeable numbers produces mechanical homogeneity that drains narrative meaning.

In FATE, every aspect invocation produces the same effect: +2 or a reroll. Whether your aspect is "Hardened War Veteran" or "Lucky Hat," the mechanical outcome is identical. This creates two problems. First, diverse fictional situations feel mechanically the same -- the +2 from being a veteran and the +2 from a lucky hat are indistinguishable at the dice level. Second, it incentivizes stacking: players optimize by accumulating as many applicable aspects as possible, treating the fiction as a formality to be justified after the mechanical decision is made. Multiple independent sources confirm this: practitioners report that players "decide whether to spend a fate point, then retroactively find an aspect to justify it."

In early QBN, the parallel problem manifests differently but equally. When PC characteristics, currency amounts, and story-tracking variables are all just numbers in the same namespace, the engine cannot distinguish between modifying your identity and spending a coin. Writers must manually impose distinctions that the engine does not understand. A story flag that should be permanent can be accidentally modified by a storylet designed to adjust resources. A meter that should tick continuously behaves the same as a boolean that should flip once.

The lesson: our quality taxonomy (see the [QBN Engine Spec](../../../spec/systems/qbn-engine.md#quality-taxonomy)) is not a convenience for content authors. It is an architectural decision that lets the engine enforce behaviors the "all qualities equal" model cannot. Identity qualities should resist modification. Resources should support scarcity economics. Meters should tick. Consequences should decay. The engine, not just the content, must know the difference.

## 3. Quality Taxonomy

FATE's five aspect lifespans (Game, Character, Situation, Consequence, Boost) provide the seed, but our taxonomy extends it to seven types by incorporating Kennedy's resource narrative requirements and the yarnball meter model.

**Identity** (permanent). FATE's Character and Game aspects. Defines what something fundamentally is. Captain traits, ship class, faction alignment. Rarely changes; when it does, the change is a major narrative event. Engine behavior: high inertia, gates large storylet pools, should trigger compel storylets when in tension with circumstances.

**Resource** (scarce, tradeable). Kennedy's primary focus. Fuel, food, currency, cargo. Must be scarce (to force choices), reproducible (to sustain play), and fungible (to create strategic tension). Engine behavior: consumed and replenished, supports economic pressure, drives the "resource narrative" aesthetic.

**Meter** (continuous, ticking). The yarnball model's contribution. Hunger, loneliness, boredom, filth. Rises or falls over time regardless of player action. Creates background pressure that the player must address. Engine behavior: autonomous change rate, generates yarnball pressure storylets, interacts with module effects.

**Reputation** (slow-moving). Faction standing, notoriety, trust. Changes through observed actions, not direct manipulation. Gates social access -- who will deal with you, what missions become available. Engine behavior: modified by public actions, drives affiliation gating (as in Sunless Skies).

**Consequence** (multi-session decay). FATE's Consequence aspect mapped to QBN. Ship damage, crew injury, legal trouble. Imposed by events, heals over time or through dedicated recovery actions. Engine behavior: decays toward baseline, creates recovery arc storylets, occupies "slots" that limit capacity for further consequences.

**Situation** (scene-duration). FATE's Situation aspect. Created by current circumstances, expires when context changes. "Scouted the route," "storm warning," "docked at port." Engine behavior: automatically cleared on context change (e.g., leaving a location), enables prep-and-payoff chains, stacks within limits.

**Momentum** (one-shot). FATE's Boost. Gained and spent in a single interaction. Prep bonuses, lucky breaks, temporary advantages. Engine behavior: consumed on first use, provides immediate benefit, cannot be stockpiled.

Each type implies different engine behaviors for modification, decay, visibility, and storylet interaction. The taxonomy is not a content-authoring convenience; it is an engine-level commitment.

## 4. The Compel Economy

FATE's single most transferable idea is the compel pattern: accept a narrative setback tied to your character's nature, earn a reward. This bidirectional pressure creates dramatic pacing that raw QBN lacks -- the oscillation between resource depletion and resource recovery that gives sessions their rhythm.

But the adaptation must be careful. FATE's compel economy is metagame: fate points exist outside the fiction. Players earn abstract tokens by accepting complications, then spend those tokens for mechanical bonuses. This works at a tabletop (with a human GM mediating) but creates cognitive overhead and breaks immersion in a digital game. Multiple sources across our research confirm that the economy should be **diegetic** in QBN -- the rewards are in-world things (fuel, reputation, information, meter relief), not abstract currency.

FATE's other major lesson about compels is that the dual-edge ideal collapses when players author it. In tabletop FATE, players are supposed to write aspects that cut both ways -- "Hardened War Veteran" should help in combat but cause PTSD complications. In practice, players write purely positive or purely negative aspects, because humans optimize. The dual edge must be **designer-enforced, not player-authored**. In our engine, the designer creates both sides: "Notorious Smuggler" unlocks lucrative black-market jobs AND triggers imperial attention storylets. The engine, not the player, ensures the dual edge.

The compel-as-storylet pattern means the engine proactively surfaces complication storylets when quality states warrant them. A player with high "Notorious Smuggler" docking at a lawful port triggers: _"Imperial customs officers recognize your vessel."_ The player gets options, not punishment. The key design rules:

- Every important quality must gate both beneficial AND complicating storylets
- Compel rewards must be diegetic -- in-world resources, not meta-currency
- The player always has a choice; refusing a compel costs resources but is never unfair
- The engine authors compels, not players (this prevents the FATE dual-edge collapse)

As specified in the [QBN Engine Spec](../../../spec/systems/qbn-engine.md#compel-storylets-system-initiated-complications), compel storylets are a first-class engine concept, not an authoring pattern layered on top.

Note for Ravel: the Ravel language spec is being extended concurrently with `Compel` as a storylet annotation that marks a storylet as system-initiated rather than player-selected. This changes how the engine surfaces and prioritizes the storylet.

## 5. Qualities as Active Agents

The Disco Elysium pattern is the most ambitious idea to emerge from this research, and the least fully resolved.

In most QBN systems, qualities are passive gates. A quality of "Paranoid: 7" means storylets requiring Paranoid >= 5 are available, and storylets requiring Paranoid < 3 are not. The quality filters content but does not generate it.

Disco Elysium inverts this. Its 24 skills function as autonomous narrative voices that interject during dialogue -- Inland Empire offers surreal interpretations, Authority detects power dynamics, Electrochemistry suggests hedonistic impulses. These are not gates; they are active participants. A high Electrochemistry skill does not just unlock drug-related storylets; it inserts itself into unrelated conversations with commentary like "You could use a drink right about now."

Mapped to QBN: strong qualities should **inject themselves** into storylets they do not gate. A captain with high Paranoia does not just see paranoia storylets; their Paranoia quality injects paranoid interpretation options into trade negotiations, crew conversations, and faction encounters. The storylet checks not just "does the player qualify?" but "which of the player's strong qualities want to comment on this situation?"

This is architecturally significant because it means storylets need an injection mechanism -- a way for qualities to volunteer commentary or alternative options into storylets that did not originally reference them. The engine must scan for qualities above an "assertiveness threshold" and offer them opportunities to inject.

The [QBN Engine Spec](../../../spec/systems/qbn-engine.md#qualities-as-active-agents) marks this as a TODO for the Ravel language. The Ravel spec is being extended concurrently with an `Interjection` mechanism that allows quality-tagged content blocks to be inserted into storylets at runtime.

This pattern remains the least proven of the ideas in this document. Disco Elysium is a single-player, heavily authored game with 24 predefined skills. Whether the injection pattern scales to a multiplayer QBN engine with hundreds of qualities is an open question.

## 6. Resource Narrative Framework

Kennedy's resource narrative framework provides three requirements that a quality must meet to participate in the core drama economy:

**Scarce.** Resources must be limited to force meaningful choices. If a player can accumulate unlimited fuel, fuel is no longer a decision -- it is a number going up. Scarcity is what transforms a variable into a dramatic lever. Sunless Sea achieved this with fuel consumption tied to movement: every action costs, and the cost is visible.

**Reproducible.** Players must be able to consistently regenerate resources through gameplay. If a resource is scarce but cannot be replenished, the game effectively has a hidden timer -- the player is always running out, and the only question is when. Reproducibility is what creates the loop: earn, spend, earn again. Kennedy notes that a game effectively ends when the tension between scarcity and reproducibility breaks -- either the player has so much that scarcity vanishes, or resources become so scarce the player cannot continue.

**Fungible.** Resources must be tradeable or convertible, creating strategic tension and opportunity costs. If fuel can be traded for supplies, and supplies can sustain crew morale, then every unit of fuel is also a potential unit of morale -- and the player must decide which they need more. Fungibility is what creates interesting decisions, because every resource acquisition is simultaneously a resource non-acquisition of something else.

The aesthetic goal is what Kennedy calls **"poetic design"**: "selection and design of resource interactions as a context from which drama should tend to emerge." The designer does not script dramatic moments. Instead, resource systems whose interactions naturally produce drama are designed. Events "emerge in a natural-seeming way from the combination of resource states."

This aligns directly with how the [QBN Engine Spec](../../../spec/systems/qbn-engine.md) treats Resource-type qualities: they are the economic substrate from which storylet drama emerges, not a secondary system bolted onto narrative.

The critical insight for our engine: the resources must **align with the grain of the story**. In our Vance-galaxy setting, the resources that matter are the ones that map to the fiction of a merchant-captain navigating a complex social and economic landscape. Fuel and food map to travel pressure. Reputation maps to social access. Cargo maps to economic risk. The resources are not abstract currencies; they are the story.

## 7. Sunless Economy Lessons

Sunless Sea and Sunless Skies provide concrete, tested economic patterns that our engine should learn from.

**Bargains and Prospects.** The Sea-to-Skies evolution demonstrates that static trade matrices fail in practice (wiki-solvable within weeks), while dynamic opportunities sustain engagement. Bargains (time-limited cheap buys at minor ports) and Prospects (premium sell contracts at major ports) replace memorizable routes with moment-to-moment scanning and strategic matching. For a multiplayer game, this is even more critical: static routes would be solved within hours by a player community, while dynamic opportunities create competition and timing pressure.

**Affiliation gating.** Sunless Skies ties economic access to character identity through four affiliations (Academe, Bohemia, Establishment, Villainy). Higher affiliation unlocks more profitable opportunities within that faction's domain. At Villainy 3+, an entire smuggling questline opens. This pattern makes economic progression inseparable from narrative identity -- your trade opportunities reflect who you are and who you know. It maps directly to our Reputation quality type.

**Fuel and supply as persistent drain.** Across both games, fuel (consumed by movement) and supplies (consumed by crew over time) serve as the fundamental economic sink -- a ticking clock that prevents players from ever feeling "done" with the economy. This mirrors Traveller's ship mortgage: persistent costs that force the captain to keep moving, keep trading, keep engaging. For our engine, this means Resource-type qualities tied to travel (fuel, food) must have autonomous drain rates, not just storylet-triggered consumption.

**Profit spikes over steady income.** Failbetter explicitly targeted intermittent high-value payoffs over reliable predictable income. The unpredictability keeps trade engaging across the full game. This is a lesson about quality-of-experience, not mechanics: even if the expected value per unit time is the same, spikey returns feel more engaging than flat returns. Our economic storylets should create moments of windfall and drought, not smooth income curves.

**What failed.** Sea's early-game grind was punishing -- profitable routes required dangerous waters, but reaching them required capital from non-profitable early routes. The 22 goods x 30+ ports complexity drove players to external tools rather than creating in-game engagement. Skies overcorrected somewhat: the starting area was too generous, reducing survival tension. The lesson is that economic pressure must be calibrated to create tension without creating tedium, and the complexity should be in the decisions, not in the lookup tables.

## 8. Anti-Patterns

The research identifies several anti-patterns that our engine must avoid.

**Uniform mechanical effects.** FATE's +2 treadmill, where every aspect invocation produces the same bonus regardless of narrative context. In QBN terms: if every quality check produces the same "unlock/lock" binary, the diversity of qualities is wasted. Storylet branches should produce diverse outcomes -- different narrative text, unique NPCs, modified meter effects -- not uniform scalar bonuses. The tiered potency system in our [QBN Engine Spec](../../../spec/systems/qbn-engine.md#tiered-quality-potency) addresses this directly.

**All qualities equal.** Kennedy's primary critique. Treating PC characteristics, currency amounts, and story-tracking variables identically erases useful distinctions. The engine should enforce behavioral differences between quality types, not leave it to content authors to manually simulate them.

**Player-authored content.** FATE relies on players creating aspects. In a multiplayer computer game, player-authored mechanical content is an exploit vector. Players should trigger quality changes through choices within authored storylets, not author the qualities themselves. No successful digital FATE game exists, and the absence of the free-form negotiation model in shipped digital products is itself evidence that it does not automate.

**Free-form text tags.** FATE aspects are natural-language strings whose mechanical relevance requires human judgment at every step -- negotiating whether an aspect applies, agreeing on compel severity, improvising declarations. In a computer game, free-form text becomes either pre-enumerated tags disguised as free text, or an LLM interpretation layer with unpredictability problems. QBN's numeric/typed quality approach is computationally tractable and should be preserved; narrative richness should come from authored storylet text.

**Static trade matrices.** Sunless Sea's fixed price table. Any static economic system with perfect information will be solved by players (or wikis) and reduced to rote optimization. Dynamic opportunities, rotating contracts, and affiliation-gated access resist this.

**Trivially solvable economies.** Even dynamic systems fail if they converge to a single optimal strategy. The interaction of multiple resource types, affiliation requirements, and time-limited opportunities must create a decision space complex enough that no single strategy dominates.

## 9. Open Questions

Several areas remain unresolved by the research.

**Metagame vs. diegetic pacing.** The research argues for diegetic resource pacing over metagame currency, but no empirical comparison exists. Whether some hybrid approach (a small metagame signal layered on diegetic resources) could work better than pure diegesis is untested.

**Quality injection at scale.** The Disco Elysium pattern (qualities as active agents that inject commentary) is compelling but implemented in a single-player game with 24 predefined skills. Whether this scales to a multiplayer engine with potentially hundreds of qualities per entity -- and what the authoring cost looks like -- is unexplored.

**Compel frequency.** How often should the engine surface compel storylets? Too many and the player feels harassed; too few and the bidirectional pressure never develops. No empirical data exists on the right balance, and FATE's tabletop precedent (GM judgment) does not translate directly.

**Multiplayer economy dynamics.** Both Sunless games are single-player. How Bargains/Prospects behave with multiple competing captains is critical for our MMORPG context and is entirely untested in QBN terms.

**City of Mist as middle ground.** City of Mist (a FATE derivative using narrative tags instead of numeric attributes) was identified as potentially relevant but not investigated. It may offer a bridge between freeform aspects and structured qualities.

**Wildermyth's tag system.** Wildermyth uses structured tags for emergent digital narrative and may be the closest existing implementation of FATE-like ideas in a shipped digital product. It was identified too late for investigation.

**The cost of digital implementation.** Perko's observation that tabletop mechanics taking 30 minutes to create require enormous engineering effort to digitize. The resource cost of implementing quality injection, compel engines, and tiered potency is not assessed in this research.

**Late-game economic health.** No published analysis of how Sunless Skies' economy behaves across a full 40+ hour playthrough -- whether late-game Sovereigns become meaningless. For a persistent MMORPG, this is a critical concern.

---

_This document synthesizes findings from research conducted 2026-03-23. Primary sources: Alexis Kennedy (Weather Factory), Failbetter Games design diaries, FATE SRD, Diaspora SRD, Emily Short's blog, Dice Exploder podcast, Game Design Thinking (Disco Elysium analysis). See the individual research briefings for full source quality assessments and evidence ledgers._
