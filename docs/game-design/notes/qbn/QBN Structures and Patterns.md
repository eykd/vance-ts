# Implementing a Quality-Based Narrative (QBN) System: Structure and Patterns

## Understanding Quality-Based Narrative (QBN)

Quality-Based Narrative (QBN) is a design approach for interactive
stories where progression is driven by character **qualities** (state
variables) rather than predefined branching paths. In a QBN system,
content is organized into **storylets** -- self-contained narrative
snippets (text, dialogue, scenes, etc.) -- that become available or
unlock only when the player's qualities meet certain
conditions[\[1\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=To%20recap%2C%20in%20a%20quality,be%20explicitly%20tracked%20using%20qualities)[\[2\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Quality,in%20your%20relationship%20to%20your).
This is in contrast to a traditional branching narrative, where scenes
are linked by explicit flowchart-style branches. QBN was pioneered by
Failbetter Games (creators of _Fallen London_) and evangelized by
writers like Emily Short, as a way to offer nonlinear storytelling
without the exponential complexity of branching
structures[\[3\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=It%E2%80%99s%20inspired%20by%20some%20recent,of%20organizing%20and%20presenting%C2%A0such%20stories)[\[4\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=It%E2%80%99s%20also%20much%20better%20than,lot%20of%20ugly%20repetition%20as).

In QBN, **qualities** are essentially game/state variables that
represent everything important about the player and story world: from
skills and stats to inventory resources, faction reputations, story
progress flags, relationships, or even abstract
conditions[\[5\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=storylets%20unlocked%20by%20qualities%20www,tool%20implements%20QBN%3B%20so%20did)[\[6\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=don%E2%80%99t%20just%20relate%20to%20your,For%20example).
Every piece of content checks these qualities to decide if it's
currently available. For example, a particular event might require the
player's **Location** quality to be "Edge City" and their **Jade**
resource to be
≥4[\[7\]](https://videlais.github.io/simple-qbn/qbn.html#:~:text=describes%20the%20use%20of%20qualities,quality%20for%20a%20particular%20storylet).
If the player's state meets those prerequisites, the storylet is
unlocked and can be played; otherwise, it remains hidden or "locked." In
Failbetter's original explanation: _"qualities tell storylets what to
do"_, i.e. the presence/values of certain qualities control whether a
given storylet
appears[\[6\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=don%E2%80%99t%20just%20relate%20to%20your,For%20example).

**Storylets** themselves typically contain a chunk of narrative and
often a choice for the player (in Failbetter's terms, each choice is a
"branch" within the
storylet)[\[2\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Quality,in%20your%20relationship%20to%20your).
When a storylet is played, it produces **effects** -- usually changing
some qualities (e.g. giving or removing items, updating story progress,
adjusting relationship values) and narrating the
outcome[\[8\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=This%20is%20a%20storylet%20from,Qualities%20also%20control).
After that, the game again evaluates which storylets are now available
in light of the updated qualities. Storylets are _free-floating_ in the
sense that they are not chained together by fixed links; the core
narrative structure emerges from the logic of qualities unlocking
content, rather than hard-coded scene-to-scene
transitions[\[1\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=To%20recap%2C%20in%20a%20quality,be%20explicitly%20tracked%20using%20qualities).
This gives QBN a very dynamic quality: at any given moment, the player
might have multiple narrative options to choose from (all the storylets
for which they currently qualify), and new options may appear or
disappear as their qualities change.

**Why QBN?** The appeal of quality-based narrative is that it enables a
highly **modular and flexible story structure**. Content can be consumed
in variable orders, multiple plotlines can run in parallel, and the
story world can respond to the player's accumulated state rather than a
single scripted path. Designers often use the metaphor of a **card
deck** or "opportunity deck" for QBN: imagine a deck of storylets that
the player "draws" from based on the state of the
game[\[9\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=The%20metaphor%20of%20cards%20and,the%20deck%20currently%20being%20considered).
This modularity makes QBN ideal for games that are more about an
open-ended world or ongoing experience than a linear plotted
tale[\[10\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=This%20approach%20is%20very%20good,mechanical%20state%20to%20its%20narrative).
In fact, Failbetter's Fallen London (an early QBN game) contains
hundreds of storylets representing many narrative arcs scattered across
its world, which players can discover in various
sequences[\[11\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=A%20major%20advantage%20of%20QBN,story%20%2020%20The%20Frequently).
New stories can be added to such a game post-launch simply by writing
new storylets that hook into the existing qualities -- a powerful
feature for live content and
extensibility[\[12\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Taken%20together%2C%20those%20features%20mean,to%20allow%20interesting%20player%20mods).

Finally, note on terminology: because "quality-based narrative" might
misleadingly sound like "high-quality narrative", Failbetter's Alexis
Kennedy has proposed calling this approach **resource-based narrative
(RBN)**
instead[\[13\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=While%20many%20people%20have%20embraced,Storychoices%2C%202012)[\[14\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,high%20quality%20for%20its%20effect%E2%80%99).
In practice both terms refer to the same idea -- narrative driven by
game state variables -- and you may see "storylet systems" used
informally as well.

## Core Components of a QBN System

Designing a QBN system from scratch means assembling a few core
components and concepts:

- **Storylet Content Library:** You'll need a database of storylets,
  where each storylet entry includes (a) the content to present
  (narrative text, dialogue, etc., possibly with embedded choices), (b)
  a set of **prerequisite conditions** (quality checks that must be true
  for the storylet to be available), and (c) the **effects** or outcomes
  (changes to qualities, and resulting text for each possible choice
  outcome). For instance, a storylet might be labeled "Mysterious
  Stranger in the Tavern," prerequisite: `Location == Tavern` and
  `Nightfall == True` and `Suspicion < 3`; content: a brief encounter
  with a stranger; effect: if the player chooses to listen to the
  stranger, set `HasMap = True` and increase `Suspicion` by 1, etc.

- **Qualities (Game State):** A structured collection of all qualities
  that define the player's state. In implementation terms, this is often
  a key-value store or dictionary (e.g. `{ quality_name: value }`). The
  system needs to support efficient querying of these values to check
  storylet requirements. Every object, stat, or narrative flag can be
  modeled as a quality -- e.g. an inventory item "Jade" might be a
  numeric quality representing how many Jade pieces the player
  has[\[6\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=don%E2%80%99t%20just%20relate%20to%20your,For%20example);
  a reputation like _Connected: Society_ might be a numeric quality that
  goes up or down; a story progression like _Investigating_ might be an
  integer that increments as the player gathers
  clues[\[15\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=What%20is%20a%20Questicle%3F%20Simple%3A,in%20this%20case%20Cryptic%20Secrets).
  All qualities use a common mechanism for checks. This uniformity was a
  deliberate design choice in Fallen London: "PC characteristics are the
  same as currency amounts are the same as story tracking
  variables"[\[16\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,of%2C%20and%20changes%20to%2C%20qualities)
  -- meaning the engine doesn't treat story flags differently from
  resources or skills. (Some designers now distinguish categories of
  qualities for clarity, but under the hood they operate alike.)

- **Storylet Selection Logic:** The runtime system (the **narrative
  engine**) must continually decide "What storylet(s) are available to
  the player right
  now?"[\[17\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=The%20narrative%20engine%20is%20in,almost%20purely%20a%20narrative%20engine).
  Implementing this typically involves scanning the storylet library for
  any entry whose prerequisites are satisfied by the current set of
  quality values. In a naive implementation you might loop through all
  storylets and check conditions; in a more optimized system you might
  index storylets by the qualities they depend on. Regardless, the
  result is a _pool of valid storylets_ at a given time. Depending on
  design, you can present **all** available storylets to the player as
  choices or limit the presentation via some mechanic:

- _List Selection:_ Some QBN games simply list all currently available
  storylet options, possibly separated by category or location. This
  gives the player high agency to choose what to do next. However, if
  too many options show at once it can overwhelm the
  player[\[18\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements),
  so designers often structure the UI to filter or highlight important
  storylets (e.g. main story vs side stories).

- _Card Draw / Random Selection:_ Many QBN systems use a deck metaphor
  -- from the pool of available storylets, only a subset are randomly
  drawn or offered at a
  time[\[9\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=The%20metaphor%20of%20cards%20and,the%20deck%20currently%20being%20considered).
  Failbetter's StoryNexus (and games like _Fallen London_) had an
  "opportunity deck" where storylets would appear as cards the player
  could draw. This adds an element of surprise and pacing (not every
  possible event is shown at once) and can simulate an _exploratory
  feel_. For example, if 10 storylets are available, the game might
  randomly present 3 of them in the player's hand; the rest might appear
  later. Some systems also distinguish **one-shot storylets** (once
  used, they are "discarded" from the deck) versus **sticky storylets**
  (repeatable or persistent options that remain
  available)[\[9\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=The%20metaphor%20of%20cards%20and,the%20deck%20currently%20being%20considered)[\[19\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=As%20passages%20are%20storage%2C%20they,card%E2%80%9D%20marking%20them%20as%20such).
  Designing which content is repeatable versus one-time is an important
  consideration for pacing and grind.

- **Player Interface:** While not a narrative design pattern per se, the
  UI through which players experience QBN is worth planning. A QBN can
  be delivered via pure text (as in a choice-based IF interface), or
  integrated into a larger game UI (for example, storylet options might
  appear when the player enters a location in an RPG). The key
  requirement is that the interface queries the storylet selection logic
  at appropriate times and cleanly presents the current narrative
  choices. Many development tools can be bent to implement QBN: e.g.
  using a Twine story with a custom "storylet" tagging system (as in the
  TinyQBN library) to simulate the deck-and-card model in a
  GUI[\[9\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=The%20metaphor%20of%20cards%20and,the%20deck%20currently%20being%20considered)[\[19\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=As%20passages%20are%20storage%2C%20they,card%E2%80%9D%20marking%20them%20as%20such),
  or using Inkle's Ink to write content and a game-side manager in Unity
  to handle the quality
  checks[\[20\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=,the%20ink%2FUnity%20pairing%20I%20just)[\[21\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=Either%20of%20the%20latter%20two,be%20rolling%20your%20own%20interface).
  If building from scratch, ensure your system can **save and load** the
  quality state (for persistence) and can handle incremental content
  updates (new storylets added easily).

- **Content Tagging & Organization:** As your QBN grows, consider
  organizing storylets by themes or tags (e.g. label some storylets as
  "main plot", "side quest", "faction: Rebels", "location: CityHall",
  etc.). This is not strictly required by QBN, but it helps manage
  complexity. It allows the UI to group content and the development team
  to coordinate who works on what. For example, Fallen London in later
  years introduced ways for authors to mark storylets with different
  colors or priority to guide players to important ones out of a long
  list[\[18\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements).
  In your own tool, you might implement sorting rules (e.g. always show
  storylets related to an active quest first) or filtering (only show
  storylets relevant to the player's current location or goal). This
  keeps the experience focused even as content scales up.

## Designing Qualities and State in a QBN World

One of the first design tasks in a QBN project is defining **what
qualities you will use** to model the narrative and gameplay. This is a
crucial design step -- your qualities are the levers of story
progression and player identity. Here are some guidelines for designing
the quality set:

- **Derive Qualities from Narrative Themes and Gameplay Loops:**
  Identify the core themes, resources, and progression metrics of your
  game's story. For example, if the game is about surviving at sea,
  you'll likely have qualities for resources like "Food" or "Crew
  Morale"; if it's a noir detective story, you might have "Clue Points"
  or "Suspects Identified." A good practice is to list narrative design
  goals or pillars and ensure qualities align with
  them[\[22\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=,many%20a%20good%20game%20design)[\[23\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=But%20this%20does%20ask%20that,for%20%E2%80%9Ccreative%20stats%2C%20consistently%20applied%E2%80%9D).
  Alexis Kennedy notes that in a _resource narrative_, the nature and
  interrelationships of the resources (qualities) should "align with the
  grain of the story" so that story events naturally emerge from the
  game
  state[\[24\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=I%20reckon%20a%20key%20characteristic,drama%20should%20tend%20to%20emerge).
  In other words, the qualities should represent things the player and
  characters _care about_ in the story, so that changing those values
  drives meaningful drama.

- **Make Qualities** Expressive **but also** Reusable**:** There's a
  tension between very specific flags (e.g. a quality
  "TimesFedChameleon") and broad, abstract qualities (e.g. "Ennui" or
  "Dramatic
  Tension")[\[25\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=A%20quality%20like%20%E2%80%9CPersonal%20Growth%E2%80%9D,%E2%80%9D).
  Specific qualities can be more evocative and clearly tied to a
  particular storyline, but they might not carry meaning outside that
  context. Broad qualities apply across many stories, but if they're too
  generic they may feel disconnected from moment-to-moment narrative. A
  best practice in large story worlds is to define a **core set of
  global qualities** that many storylets will use, ensuring consistency
  and interplay across
  content[\[26\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=like%20%E2%80%9CNumber%20of%20Times%20You,%E2%80%9D).
  For example, _Fallen London_ uses "Menaces" like Scandal or Wounds
  which many different stories reference as a consequence of risky
  actions; it also uses "Connected: \[Faction\]" qualities to track
  reputation with various groups, which multiple storylines can increase
  or decrease. These kinds of qualities form a **shared vocabulary** for
  your storyworld. Emily Short describes the goal as finding qualities
  that are "resonant and expressive" _and_ let you "reward the player
  for one thing and unlock something different-yet-related in another
  storyline"[\[27\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=A%20quality%20like%20%E2%80%9CPersonal%20Growth%E2%80%9D,%E2%80%9D).
  This design yields an interconnected narrative: actions in one plot
  can echo in others via the state changes.

- **Progress and Quest Flags:** In QBN, since there's no fixed sequence
  of scenes, you must explicitly model story progression with qualities.
  Common patterns include **progress counters** and **quest flags**. A
  progress counter is a quality that increases as the player advances a
  plot; for example, "InvestigationProgress = 5" might indicate the
  player has gathered 5 clues, which could unlock the climax storylet of
  a
  mystery[\[15\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=What%20is%20a%20Questicle%3F%20Simple%3A,in%20this%20case%20Cryptic%20Secrets).
  A quest flag (boolean or an enumerated value) might mark major
  milestones, e.g. "DragonSlain = True" or "ChosenFaction = Rebels".
  You'll use these in prerequisites to gate content (e.g. the storylet
  "Celebrate Victory" might require `DragonSlain == True`). Essentially,
  to implement a linear sequence _A → B → C_ in storylets, you create a
  quality that represents "Current Chapter" and manually increment it
  from A to B to
  C[\[28\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Another%20trick%20about%20QBN%20is,weren%E2%80%99t%20as%20common%20in%20the).
  Many authoring systems for branching stories handle this implicitly
  (by the structure of the script), but in QBN it's up to the designer
  to manage. This means **a lot of bookkeeping**: for a multi-part
  storyline, you will set a quality "Story X Status" to 1 (story begun)
  to unlock part 1; part 1's outcome sets it to 2, unlocking part 2,
  etc.[\[28\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Another%20trick%20about%20QBN%20is,weren%E2%80%99t%20as%20common%20in%20the).
  Plan these quality state flows carefully so that storylets appear and
  retire at the right times.

- **Economy and Balance:** If your QBN involves qualities that behave
  like currencies or resources (items, money, experience, etc.), think
  about their _interactions and scarcity_. A compelling resource-driven
  narrative often has trade-offs and **interlinked
  resources**[\[24\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=I%20reckon%20a%20key%20characteristic,drama%20should%20tend%20to%20emerge).
  For example, an RPG might have gold and reputation as qualities --
  spending gold might raise reputation with one group but lower another,
  etc. Ensure no single resource/quality dominates the gameplay (unless
  that's intentional). Emily Short advises checking that "no single stat
  is much more useful than the others" and that stats (qualities)
  reflect the game's themes and provide interesting
  trade-offs[\[23\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=But%20this%20does%20ask%20that,for%20%E2%80%9Ccreative%20stats%2C%20consistently%20applied%E2%80%9D).
  In a QBN, this also means if you require the player to accumulate X of
  an item to unlock a storylet, the effort to get X should feel
  proportionate to the narrative payoff. If qualities are part of an
  **economy** (say, you can grind for items in one area and spend them
  to progress elsewhere), map out roughly how many repeats or how much
  time is expected so that pacing stays
  fun[\[29\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=carry%20meaning%20between%20many%20different,stories%20or%20segments%20of%20story).
  These considerations bleed into game design -- for instance,
  Failbetter had to adjust the early _Fallen London_ grind structures
  because requiring too many repeats made the story
  drag[\[30\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20unlocked%20by,largely%20moved%20on%20from%20that).
  Strive for a balance where qualities gating content create
  _motivation_ ("I need to raise my _Renown_ to 5 to see the next
  subplot") without becoming a tedious hurdle.

- **Hidden vs. Exposed Qualities:** Decide which qualities are visible
  to the player. Some QBN designs show the player a list of their stats,
  inventories, etc., while others hide story flags or even abstract
  stats to avoid spoilers or confusion. If qualities are hidden, you as
  the designer can use more abstract narrative flags freely (players
  will only see the effects, not the variable itself). If they're
  exposed, try to use player-facing names that make sense diegetically
  (e.g. "Notoriety" instead of a vague "Flag7") and consider explaining
  their use. Hidden or shown, the underlying work for the author is
  similar, but when qualities are shown, you have to put extra effort
  into making them _intelligible and thematic_ for the
  player[\[27\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=A%20quality%20like%20%E2%80%9CPersonal%20Growth%E2%80%9D,%E2%80%9D).

## Structuring Narrative with Storylets: Key Patterns

One of the strengths of QBN is that it can recreate or **augment classic
narrative structures** by using qualities to handle branching, gating,
and recombination. Here we outline common narrative design patterns in
QBN-based storyworlds, and how to implement them:

- **Linear Sequences (Gauntlets) with Fail States:** You can implement a
  mostly linear storyline (often called a "gauntlet") by using a
  progress quality and optional fail-condition qualities. For example,
  imagine a sequence of challenges **A → B → C → D** that the player
  must pass in order. You'd create a quality like **StoryProgress**, and
  gate each storylet (A, B, C, D) on `StoryProgress` having a specific
  value. Initially `StoryProgress = 0`; storylet A's prerequisite is
  `StoryProgress == 0`. When the player completes A, you set
  `StoryProgress = 1`, unlocking storylet B (`StoryProgress == 1`), and
  so on until D sets the quality to a final value (story complete). Now,
  if the design calls for "if the player makes a mistake at B, go to a
  failure branch", you can incorporate a **menace quality** to track
  failure. For instance, a quality **Alertness** or **Suspicion** might
  start low and increase if the player fails a challenge; if it goes
  high, a "failure storylet" becomes available. In Failbetter's
  parlance, many stories use menace qualities (like Scandal, Wounds,
  Nightmares) to represent accumulating trouble. In a gauntlet, a high
  menace can trigger a detour storylet (perhaps a penalty or side-scene)
  and possibly reset or reduce
  progress[\[31\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20used%20to,trouble%20the%20player%20is%20in)![](media/rId54.png){width="5.833333333333333in"
  height="2.9027777777777777in"}\
  . The diagram below illustrates a gauntlet implemented with storylets:
  the main horizontal track is gated by a progress stat (blue nodes),
  while the red nodes represent fail events unlocked by a high menace
  stat at certain points.

![](media/rId54.png){width="5.833333333333333in"
height="2.9027777777777777in"}\
_Example: A linear "gauntlet" storyline implemented via storylets. A_
_Progress_ _quality (top row numbers) gates the main sequence, while a_
_Menace_ _quality triggers optional failure scenes (red) if things go
wrong. The player can only proceed to the next chapter when Progress
increases, and too much Menace might divert them into a setback
scene._[\[28\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Another%20trick%20about%20QBN%20is,weren%E2%80%99t%20as%20common%20in%20the)[\[31\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20used%20to,trouble%20the%20player%20is%20in)

- **Branching Paths and Bottlenecks:** Traditional branching narratives
  allow the player to take different paths that later rejoin at a common
  event (a "bottleneck"). QBN handles this by using qualities to **track
  the choice** and ensure continuity. For instance, suppose early in the
  story the player can side with **Rebellion** or **Loyalists**, leading
  to two different mid-game sequences, but eventually the plot converges
  at a final battle. In a storylet system, you might have a quality
  **Allegiance** that gets set to "Rebellion" or "Loyalist" based on an
  early choice. That choice will unlock one set of storylets (the Rebel
  path content requires `Allegiance == Rebellion`) and lock out the
  other. Later, when the bottleneck event comes (the final battle), that
  storylet can check the **Allegiance** quality to determine how it
  plays out -- e.g. offer different branches or flavor text depending on
  the side chosen. Emily Short demonstrates that you can replicate
  branch-and-merge, "sorting hat" structures, etc., by giving yourself a
  **flag for the branch choice and a progress stat** to sync up the
  timeline[\[32\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=,Storylets).
  The result is that you get the variation where it matters, but you can
  still bring the narrative back together for key moments. Technically,
  each major branch is a series of storylets with its own prerequisites,
  and the eventual bottleneck storylet has a prerequisite like
  `StoryProgress == X` (indicating "we're at the finale") _and_ perhaps
  checks `Allegiance` to customize outcomes. The QBN benefit is that
  even within one branch, the player might still have freedom to tackle
  sub-events in variable order (since storylets in that segment could be
  non-linear internally).

- **Parallel Objectives (Multiple End Conditions):** QBN excels at
  handling situations where the player must gather a set of things in
  any order. For example, a mystery storyline might require "Gather 3
  clues (means, motive, opportunity) before you can accuse the culprit."
  In a branching script, writing this is cumbersome (you'd have to
  branch for each order the clues could be found, leading to many
  duplicated
  nodes)[\[4\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=It%E2%80%99s%20also%20much%20better%20than,lot%20of%20ugly%20repetition%20as).
  In QBN, the designer gives the player three independent storylets --
  e.g. **Find Means**, **Find Motive**, **Find Opportunity** -- each of
  which, when completed, increments a **ClueCount** or sets a flag for
  that specific clue. The final storylet **Accuse Culprit** is gated on
  the condition that the three clues have been acquired (say
  `ClueCount == 3` or separate booleans all
  true)[\[33\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=whereas%20QBN%20can%20handle%20this,one%20of%20which%20is%20gated).
  The player is free to pursue these in any sequence; after each, the
  game state updates but the remaining storylets stay available. Once
  all prerequisites are met, the finale unlocks. This pattern --
  **collect X items or fulfill X tasks in any order, then conclude** --
  is very natural in QBN. It demonstrates the **concurrency** of
  storylets: multiple narrative threads can be active simultaneously.
  Many open-world games use this implicitly (e.g. gather pieces of an
  artifact from different quests, then assemble them). QBN provides a
  formal way to implement it without hardcoding each path. As Short
  notes, in a choice-scripted system you could simulate this with loops
  and variables, but in QBN "this sort of thing is the
  norm"[\[34\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Certainly%C2%A0many%C2%A0branching%20narrative%20systems%20are%20in,of%20thing%20is%20the%20norm)
  -- it's built into how you structure content.

- **Repeatable Grinding and Skill Challenges:** Some QBN storylets are
  meant to be **repeatable loops** -- for instance, an action the player
  can take multiple times to build up a quality or resource. In Fallen
  London's early design, players often had to grind repeatable storylets
  to raise a skill or accumulate items until they reached a threshold
  that unlocked a new
  storylet[\[30\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20unlocked%20by,largely%20moved%20on%20from%20that).
  A pattern here is to use a quality both as a **measure of ability and
  a gate**. For example, you might have a "Combat Skill" quality and a
  storylet "Venture into the Forest" that is repeatable; each attempt
  might raise Combat Skill slightly (on success) or increase Wounds (on
  failure). Meanwhile, a later storylet "Defeat the Wolf" requires
  `CombatSkill >= 5` to even attempt. This encourages the player to do
  the repeatable action until they have the needed quality level. From a
  design standpoint, this is basically creating a **gameplay loop**
  inside the narrative system. Be cautious with this pattern: repeating
  content can become tedious, so it should be thematically justified and
  ideally offer some variance or risk (e.g. a push-your-luck element
  where each repeat carries a chance of failure or a small narrative
  reward). Failbetter over time moved away from heavy mandatory grinds
  in their narrative, instead pacing progression with a mix of free
  storylets and lightweight requirements, because pure repetition can
  hurt
  engagement[\[30\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20unlocked%20by,largely%20moved%20on%20from%20that).

- **Opportunity Deck and Random Events:** An interesting pattern in many
  QBN games is the use of randomness to surface content in a way that
  feels organic. By treating the set of available storylets like a deck
  of cards, you can introduce _uncertainty_ about what event comes next.
  For example, rather than letting the player choose from 10 storylets,
  you might randomly draw one or two at a time. This is useful for
  **side content or flavor events** that enrich the world without
  overwhelming the player with choice. It can simulate the feeling of
  exploring a world where you "never know what you might encounter
  next," even though under the hood it's pulling from a defined pool of
  storylets. The **card draw** mechanism was explicitly part of
  StoryNexus: storylets could be assigned to the "opportunity deck" and
  would appear at random
  intervals[\[9\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=The%20metaphor%20of%20cards%20and,the%20deck%20currently%20being%20considered).
  Some were one-use only (they vanish after playing, mimicking
  discarding a card) while others could recur. As a designer, you can
  set certain rare storylets to low probability, making them special
  surprises, or have certain storylets only enter the deck when relevant
  qualities are at certain values (creating dynamic event tables). An
  example pattern: in a survival game, while exploring (a state
  indicated by a quality "Exploration Mode"), you draw from a deck of
  storylets like "Find a stream", "Ambushed by wolves", "Strange hermit
  encounter", etc., each with its own prerequisites (maybe wolves only
  appear if `Danger > 2`, hermit only if `DayCount > 10`, etc.). The
  deck ensures the player doesn't encounter everything at once and adds
  replay variability. **Note:** Always ensure randomness doesn't block
  critical progression; use it for optional or atmospheric content, or
  give the player other routes if random luck misbehaves.

- **Geographic and Time-Based Unlocks:** In an open world or
  multi-location game, you can model locations and time as qualities
  too. For example, a **Location** quality could simply be a label
  (string or ID) that denotes where the player currently is. Storylets
  can include a location check in their prerequisites (e.g.
  `Location == London`). That way, only content relevant to the player's
  location
  appears[\[7\]](https://videlais.github.io/simple-qbn/qbn.html#:~:text=describes%20the%20use%20of%20qualities,quality%20for%20a%20particular%20storylet).
  This is how you compartmentalize storylets by area. As the player
  travels, you update the Location quality, which swaps out the
  available storylets. Similarly, you can use a time-of-day quality or
  chapter/era quality to make content time-specific. Many QBN systems
  have a notion of **areas or realms** that effectively partition the
  storylet deck. For instance, Fallen London has different districts
  (each with its own set of storylets when you're "in" that district) as
  well as global opportunity cards. Designing a QBN world often involves
  mapping out what content belongs to which location or chapter. If your
  game has **levels or chapters**, you can use a quality like "Chapter =
  2" to unlock that chapter's content set. This approach can emulate a
  level-based progression inside a storylet
  structure[\[35\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20used%20to,design%20down%20into%20accessible%20areas).
  A concrete example: imagine a Metroidvania narrative game -- you could
  have a quality "AreasUnlocked" and give each area a bit value, and
  storylets in Area 2 all require that bit to be set (meaning the player
  found the key or item to access Area 2). The QBN engine doesn't
  inherently enforce a map, but you can enforce it through quality
  gates.

- **Storylet Chains (Questicles):** Failbetter's team coined the term
  "Questicle" for a series of connected storylets that form a
  mini-narrative
  arc[\[36\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=What%20is%20a%20Questicle%3F%20Simple%3A,in%20this%20case%20Cryptic%20Secrets).
  We've essentially described this under linear sequences and progress
  counters. The pattern of a **beginning, middle, end** within QBN is to
  use one quality to unlock the start, increment it through intermediate
  steps, and have the final step consume or reset something. For
  example, in Fallen London if you start an investigation (trigger
  storylet sets `Investigating = 1`), then each subsequent storylet in
  that quest increases `Investigating` by some amount until you hit a
  target value, at which point a conclusion storylet becomes available
  and completing it might clear `Investigating` back to 0 and give a
  reward quality like a piece of
  lore[\[36\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=What%20is%20a%20Questicle%3F%20Simple%3A,in%20this%20case%20Cryptic%20Secrets).
  The "questicle" pattern is very useful for giving the player a sense
  of discrete stories within the larger world. When designing from
  scratch, think of questicles as **modules** -- you can design a quest
  arc in isolation (with its own quality to track it) and later plug it
  into the world by deciding how the player accesses it (maybe an item
  or a location triggers the start). Because QBN is modular, you can
  have many questicles active in parallel -- just be mindful of how
  their quality requirements might overlap or interact.

- **One-Time or Limited Content:** Sometimes you want a storylet or
  storyline to be playable only once (to give meaningful permanence to
  choices). QBN handles this with what we might call **exclusion
  qualities** or "exile" flags. The idea is to set a quality at the end
  of content that prevents that content from showing up again.
  Failbetter gave an example called _"Mark of Cain"_: after completing a
  certain storyline, you receive a unique quality (the Mark). All the
  storylets of that storyline check for this quality and **will not
  appear if you have it**, ensuring you can never repeat that story on
  that
  character[\[37\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=Anyway%2C%20what%20is%20the%20Mark,and%20then%20it%E2%80%99s%20gone%20forever).
  In your own design, you might simply mark the story as "done". For
  instance, a storylet "Rescue the Princess" could give the player a
  boolean `RescuedPrincess = True` at the end, and every storylet
  related to that rescue might require `RescuedPrincess == False` to be
  available. This way, once finished, those never show up again. Another
  approach is to literally remove the storylet data or set a separate
  "availability" quality, but it's often easiest to just gate it behind
  a flag. This pattern is important for **significant narrative events**
  -- it preserves the consequence of completion. Many QBN games also
  have content that is **repeatable until a success**: e.g. you can
  attempt a challenge multiple times until you succeed, upon which a
  success flag is set and the challenge storylet no longer appears. Use
  exclusion flags to gracefully retire content that shouldn't persist.

- **Dynamic Narrative Callback and Interlocking Stories:** Because QBN
  games retain long-term state through qualities, you can design
  **special callbacks** or Easter eggs that make the world feel
  coherent. For example, Emily Short notes that later stories can check
  for an exact inventory item or quality from an earlier adventure and,
  if present, unlock a unique branch or extra bit of
  content[\[38\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Another%20thing%20I%20like%20about,a%20small%20extra%20inventory%20reward).
  Imagine a storylet "The Haunted Manor" that, if you happen to still
  possess the **Rusty Key** from a previous quest, gives you an
  alternative entry route with special narration. This is a powerful
  pattern for rewarding player memory and persistence. Technically, it's
  just another prerequisite check (e.g. `HasRustyKey == True` on a
  branch), but narratively it's very satisfying. It encourages players
  to engage with multiple storylines because they never know what
  synergy might emerge. Another example of interlocking: one storylet
  demands a resource that you obtain in a completely different
  storyline, effectively linking the two in the player's
  experience[\[39\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=On%20the%20other%20hand%2C%20sometimes,implemented%20irony%20that%20is).
  The designers might not have strictly planned it as a required
  sequence, but the player can _choose_ to combine them (e.g. a mission
  requires 100 pieces of Jade, which the player can get by doing trading
  storylets elsewhere -- it becomes a self-directed side-quest to feed
  into the current quest). The QBN system allows these _emergent
  sequences_: players weave together content from various sources to
  achieve goals, giving a sense of freedom and personalization in the
  narrative[\[40\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=On%20the%20other%20hand%2C%20sometimes,ended).
  As you design, look for opportunities where one storyline's output
  could naturally be another's input (items, information, reputations).
  Then implement those links through quality prerequisites or effects.
  This modular interlocking is **unique to QBN** style structures and
  one of its biggest strengths -- it's reminiscent of a sandbox or
  simulation where narrative bits combine in unpredicted ways, yet
  unlike fully procedural systems, all content is hand-authored (so it
  remains coherent and
  intentional)[\[41\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=flow,ended).

- **Player Agency and Self-Pacing:** A hallmark of quality-driven
  narrative is that players often have significant control over which
  story to pursue next at any given time. Instead of a single next
  chapter, they might see multiple storylets available (perhaps one
  related to the main plot, one a side character's story, another a
  repeatable job for money). This allows players to **role-play and
  self-direct** their experience. For game developers, a key pattern to
  support here is **"always give the player something to
  do"**[\[22\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=,many%20a%20good%20game%20design).
  You should design the content pool such that there are rarely states
  where nothing is available. Even if the main stories are all gated
  (say the player needs to increase a stat to continue), make sure there
  are other filler storylets (jobs, mini-events, explorations) that are
  unlocked at that moment to provide avenues to progress or at least
  entertain. This might mean creating some generally always-available
  content (low-barrier storylets) or using random events from the
  opportunity deck to keep things lively. The QBN structure shines best
  when the player feels _they_ are deciding what goal to tackle next --
  whether to advance a plot now or to go grind for resources or to
  explore a different subplot. From a narrative design perspective, this
  is a high-agency approach. It's wise to periodically **telegraph to
  the player what their options are** ("You could go back to the King's
  court, or venture into the forest for more ingredients, or check on
  your allies in town\..."). This can be done via narrative clues or an
  in-game journal listing open storylets or quests. Guiding the player
  without forcing a linear path is an art: QBN gives the sandbox, but
  you must ensure the sandbox always has some toys in reach.

- **Integrating Storylets with Gameplay Systems:** Many QBN storyworlds
  intersect with other gameplay (combat, strategy, puzzles). The
  **storylet as a reward or consequence** pattern is common. For
  example, a game might have a strategic layer (managing a kingdom) and
  use storylets to inject narrative events or respond to game states. If
  the player's kingdom is starving (a game state), you might unlock a
  storylet "Famine riots" to narratively address it; conversely, winning
  a battle might set a quality that unlocks a "Victory celebration"
  storylet. QBN is flexible enough to serve as a narrative _overlay_ to
  virtually any genre, because qualities can represent inputs from those
  systems (e.g. current level, mission outcomes, etc.). When
  implementing from scratch, plan how your core gameplay will trigger
  quality changes and thereby storylets. Some engines don't include an
  AI _drama manager_ per se, but you can approximate one by manually
  linking game events to quality updates (e.g. time passes -\> increase
  "Year" quality, which might unlock aging-related storylets). Notably,
  Emily Short describes using storylets to mirror common video game
  narrative structures: unlocking storylets with level completion, using
  storylets to deliver dialogue between gameplay segments, or
  structuring storylets like geographic regions that correspond to level
  design[\[42\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20unlocked%20by,largely%20moved%20on%20from%20that)[\[35\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20used%20to,design%20down%20into%20accessible%20areas).
  The pattern here is **treat each chunk of narrative as conditional
  content tied to gameplay state**. That way, your narrative can branch
  or appear based not just on player choice, but on how they are
  performing in other systems (did they sneak through a level vs go in
  guns blazing? Feed that info as qualities and tailor the next
  storylet). This is an advanced use of QBN that moves toward the idea
  of _salience-based_ storytelling (picking the most appropriate next
  storylet based on world
  state)[\[43\]](https://videlais.github.io/simple-qbn/qbn.html#:~:text=%28Storychoices%2C%202012%29),
  but it can be done in a straightforward way by just writing those
  conditional storylets.

### Research-Informed Patterns

> _Added 2026-03-23 from [FATE RPG QBN research](../../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md) and [Sunless economy research](../../../research/2026-03-23_sunless-economy/synthesis.md). See also [QBN Research Lessons](qbn_research_lessons.md)._

The following patterns emerge from cross-referencing FATE RPG mechanics,
Sunless Sea/Skies economy design, and Disco Elysium's narrative system.
They extend the traditional QBN patterns described above.

- **Compel Pattern (System-Initiated Complications):** Unlike standard
  storylets that the player selects, compel storylets are surfaced
  proactively by the engine when a player's qualities create dramatic
  tension with their circumstances. A player with "Notorious Smuggler"
  docking at a lawful port triggers a compel: customs officers recognize
  the vessel. The player always gets a choice (accept inspection, attempt
  bribery), but the engine initiates the encounter. Key rules: every
  important quality must gate both beneficial AND complicating storylets;
  rewards are diegetic (in-world resources, not meta-currency); the
  engine authors compels, not the player. This is FATE's most
  transferable idea -- the bidirectional pressure of earning rewards from
  setbacks creates dramatic pacing that raw QBN lacks. See the [QBN
  Engine
  Spec](../../../spec/systems/qbn-engine.md#compel-storylets-system-initiated-complications)
  for the specification. In Ravel, the `Compel` annotation marks a
  storylet as system-initiated, changing how the engine surfaces and
  prioritizes it.

- **Prep-and-Payoff Chain (The Maneuver Pattern):** Storylet effects
  create temporary **Situation** qualities that are consumed by later
  storylets, producing a two-phase tactical loop: prepare, then exploit.
  Example: a "Scout the asteroid field" storylet creates a "Mapped
  Asteroid Field" situation quality; a later "Navigate the shortcut"
  storylet consumes it for safe passage. Situation qualities expire when
  context changes (e.g., leaving a location). Rules: situation qualities
  stack within limits (prevent infinite prep); first use is "free"
  (bonus), subsequent uses cost resources; unused situation qualities
  decay on context change. This pattern derives from FATE's maneuver
  mechanic and Diaspora's "one tag per scope" stacking limit. In Ravel,
  the `consume` keyword on a quality reference indicates the quality is
  spent rather than merely checked.

- **Injection/Interjection (Qualities as Active Agents):** Strong
  qualities inject themselves into storylets they do not gate,
  volunteering commentary or alternative options. A captain with high
  Paranoia sees paranoid interpretation options inserted into trade
  negotiations, crew conversations, and faction encounters -- not just
  dedicated paranoia storylets. The engine scans for qualities above an
  "assertiveness threshold" and offers them opportunities to inject.
  Derived from Disco Elysium, where skills function as autonomous
  narrative voices that interject during dialogue. In Ravel, the
  `Interjection` mechanism allows quality-tagged content blocks to be
  inserted into storylets at runtime. **Note:** This is the least proven
  pattern in this document -- Disco Elysium is single-player with 24
  predefined skills. Whether injection scales to a multiplayer engine
  with hundreds of qualities is an open question.

- **Tiered Potency (Scaled Quality Impact):** Quality values produce
  diverse effects at different thresholds, not uniform bonuses. Low
  values provide narrative color; medium values unlock standard options;
  high values unlock transformative branches. Example for "Reputation:
  Merchant Guild": 1-3 yields acknowledgment flavor text; 4-6 grants
  access to guild job boards; 7-9 enables calling in favors; 10+ opens
  guild politics storylets and leadership opportunities. This prevents
  the "all qualities feel the same" anti-pattern from both FATE (+2
  treadmill) and early QBN (Kennedy's critique). Derived from the Fate
  System Toolkit's scaled invocation variant (tenuous/relevant/perfect).
  In Ravel, quality checks support tier expressions that map value
  ranges to different branch outcomes.

### Anti-Patterns

> _Added 2026-03-23 from [FATE RPG QBN research](../../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)._

- **All Qualities Equal:** The foundational anti-pattern, identified
  independently in FATE (by the Dice Exploder podcast, The Angry GM, and
  RPGnet practitioners) and in QBN (by Kennedy himself). Treating all
  qualities as interchangeable numbers -- PC characteristics the same as
  currency amounts the same as story-tracking variables -- erases
  meaningful distinctions and produces mechanical homogeneity. The [QBN
  Engine Spec](../../../spec/systems/qbn-engine.md#quality-taxonomy)
  addresses this with a seven-type quality taxonomy (Identity, Resource,
  Meter, Reputation, Consequence, Situation, Momentum), each with
  distinct engine behaviors. This is not a content-authoring convenience;
  it is an architectural decision.

## Best Practices and Considerations for QBN Development

Building a QBN-based storyworld is as much a content design challenge as
a technical one. Here are some general best practices and patterns to
keep in mind, especially aimed at game developers:

- **Plan for Openness and Expansion:** One of QBN's biggest advantages
  is how easy it is to extend the narrative with new storylets or even
  new storylines. If you anticipate adding DLC, live content updates, or
  mods created by others, QBN is a great
  fit[\[12\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Taken%20together%2C%20those%20features%20mean,to%20allow%20interesting%20player%20mods).
  To maximize this benefit, design your quality structure to be
  _modular_. For example, rather than having completely self-contained
  variables for every single quest, consider using some shared qualities
  for common themes (skills, global story flags) so that new content can
  hook into them. Emily Short highlights that storylet systems shine
  when they can "include new material written after the fact or even
  interlock with other stories written by other
  people"[\[44\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=A%20great%20virtue%20of%20the,stories%20written%20by%20other%20people).
  This requires a bit of discipline up front: define naming conventions
  and intended uses for qualities, document them, and perhaps provide a
  guide for future writers. That way, if a new writer comes in to add a
  story, they might see there's already a quality for "City Reputation"
  they can utilize instead of inventing a parallel one. An orderly,
  well-documented quality list is your friend in large QBN projects.

- **Avoiding Overwhelm -- Guide the Player:** As mentioned, a potential
  downside of an open storylet pool is the _paradox of choice_ or
  confusion about what to do next. Mitigate this by UI design (grouping
  and highlighting as discussed) and by gentle narrative direction. It's
  often a good idea to have a few **major qualities that represent the
  main plot threads or goals**, and surface those to the player (like
  quest titles or counters). For instance, an ongoing plot might use a
  "Chapter" quality that is shown as "Chapter 3: The Conspiracy Unfolds"
  in the UI -- the player knows this is a thing to progress. In
  parallel, side content can be clearly marked or introduced as optional
  ("Lord Harrow's Request -- optional"). Another approach is to use an
  in-game narrator or character to suggest leads: e.g. "You recall the
  detective mentioning the docks at night..." which is a clue that a
  storylet "Investigate Docks" (prereq Night and maybe a prior clue) is
  now available. In short, make sure the player rarely has to randomly
  guess what to pursue. Even though QBN allows nonlinear progression,
  **players appreciate clarity on available choices and their
  significance**. Playtesting is crucial here: see if players ever feel
  stuck or unaware of their options, and if so, adjust either the
  content availability or how it's messaged.

- **Testing State Combinations:** QBN games can accumulate a **huge
  number of possible state combinations** (because every quality is a
  dimension of variation). It's important to test edge cases and make
  sure your storylets' logic doesn't produce impossible situations or
  omissions. Some common pitfalls to watch for: forgetting to reset or
  retire a storylet, so it stays available when it shouldn't;
  conflicting prerequisites that accidentally leave a gap (e.g. two
  storylets both require a quality to be \>=10 to continue, but nothing
  ever sets it to 10 -- a bug in logic); or unexpected interactions
  where doing content in one order makes another storylet nonsensical. A
  recommended practice is to maintain a **dependency graph or
  spreadsheet** of storylets vs qualities -- essentially documenting
  which storylets set which qualities and require which
  qualities[\[45\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=Somewhere%20around%20here%20I%20might,the%20project%20with%20a%20team).
  This can help catch logical holes. For example, mark if a storylet is
  one-use; if so, ensure something marks it done. In complex storylines,
  you might draw a flowchart of quality changes (though it won't be a
  strict tree, it can be a state diagram). Automated testing for QBN is
  harder than for linear games, but you can write debug commands to set
  qualities to specific states to jump testers around. Some developers
  also implement a logging system that records which storylets have
  fired in a playthrough -- by analyzing many logs you might spot if
  some storylet never appears or if players bypass some content
  entirely.

- **Content Scaling and Authoring Workload:** Starting a QBN from
  scratch can feel daunting because the system's richness emerges best
  when you have a **critical mass of storylets**. Early on, if you only
  have a handful of storylets, the experience might feel sparse or too
  random[\[46\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=QBN%20does%20pose%20some%20challenges,longer%20story%2C%20such%20as%20the).
  It's worth planning incremental content rollouts: perhaps focus on one
  region or plotline to make sure that part feels complete, then expand
  outward. The modular nature means you can add storylets gradually, but
  players will consume what's there quickly if it's not a lot. One
  strategy is to include some **procedurally combinatorial content** to
  fill in gaps -- e.g. generic events or auto-generated encounters --
  but since the user specifically is not focusing on content generation,
  suffice to say you might include some simpler repeatable storylets to
  occupy the player while you build more bespoke ones. Keep in mind that
  writing for QBN requires thinking in a _state-driven way_. Authors
  must be aware of the qualities and conditions as they write. This is a
  shift from linear writing -- some writers prototype by writing
  storylets on index cards and physically sorting them by prerequisites
  to see how it
  flows[\[47\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=At%20the%20same%20time%2C%20this,as%20a%20paper%20prototyping%20exercise)[\[48\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Very%20frequently%2C%20when%20I%E2%80%99m%20called,simple%2C%20atomic%2C%20robust%2C%20and%20recombinable).
  Embrace that iterative, almost systems-design approach to narrative.
  It can help to write short snippets first and then elaborate once the
  structure is working.

- **Tools and Engines:** If you're developing a QBN system, know that
  there are a few tools that support this pattern to some degree, though
  none are a perfect off-the-shelf solution (as of now). Failbetter's
  own StoryNexus was an online tool for QBN authoring, but it has been
  closed to the public for
  years[\[49\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=Ever%20since%20Failbetter%E2%80%99s%20cancellation%20of,purpose%20system%20invariably).
  However, you can achieve similar results with existing interactive
  fiction tools with some customization:

- **Twine + TinyQBN**: Twine 2 (a popular IF tool) typically does
  branching stories, but libraries like _TinyQBN_ (by Dan Cox) add
  storylet mechanics. They use Twine passages as "cards" and tags for
  prerequisites, essentially layering QBN logic on Twine's
  framework[\[50\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=Card)[\[51\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=Qualities%20for%20the%20cards%20are,has%20not%20be%20discarded%20previously).
  This can be great for small projects or prototypes and doesn't require
  heavy coding.

- **Ink + custom code**: Inkle's Ink is a scripting language for
  interactive fiction that can be integrated into Unity or other
  engines. Ink by itself is more sequential/branching, but you can
  organize your Ink content into knots that serve as storylets and use
  your game code to call those knots when conditions are
  right[\[20\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=,the%20ink%2FUnity%20pairing%20I%20just)[\[21\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=Either%20of%20the%20latter%20two,be%20rolling%20your%20own%20interface).
  Essentially, Ink can act as the text generation engine, while you
  manage qualities and selection in C# or another layer.

- **ChoiceScript or Ren'Py**: These are more branching-oriented out of
  the box, but they support variables and conditional logic. You could
  craft a QBN by carefully using `*goto` and variable checks to simulate
  a free selection of scenes. However, without modifications, they
  aren't as flexible for large pools of content.

- **Custom Engine**: If you're comfortable coding, building a
  lightweight QBN engine isn't too difficult -- at heart, it's a
  rule-based content selector. Bruno Dias, in discussing attempts to
  create a general QBN tool, breaks the task into the _narrative engine_
  (deciding which storylet to show next), the _text engine_
  (formatting/assembling the content text), and the _UI engine_
  (presenting it to
  players)[\[52\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=Scope%3A%20Narrative%20Engine%2C%20Text%20Engine%2C,UI%20Engine)[\[17\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=The%20narrative%20engine%20is%20in,almost%20purely%20a%20narrative%20engine).
  Knowing this, you might use existing text engines (for text
  formatting, gender pronoun handling, etc.) in combination with your
  own narrative logic. If you go this route, design a clear data format
  for storylets (e.g. JSON or a Google Sheets that content designers can
  fill in) and possibly a small domain-specific language for complex
  conditions. Also plan how you'll allow scripting for advanced effects
  if needed (e.g. if a storylet needs to do a random roll or call a game
  function). Bruno notes that if you allow too much scripting inside
  storylets, you essentially turn your content authors into programmers,
  but if you allow none, you might not cover all game
  needs[\[53\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=You%20could%20build%20your%20engine,way%20this%20is%20done%2C%20to)[\[54\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=Building%20a%20DSL%20%28domain,orthogonal%20to%20what%20I%20have).
  Strike a balance by supporting common operations (comparisons,
  arithmetic on qualities, simple if-else text) natively in the data
  format, and reserve heavy logic for the code side.

- **When (Not) to Use QBN:** QBN is powerful, but it's not ideal for
  every type of story. Alexis Kennedy enumerated some genres that don't
  fit as well: linear scripted narratives (like _Gone Home_ or
  _Firewatch_), classic branching CYOA formats, or heavily scripted
  RPGs[\[55\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=Here%20are%20some%20things%20,often%29%20resources).
  If your game's story is very linear or has only a few decision points,
  a QBN structure might be overkill -- a straightforward branching or
  chapter-based script could suffice. QBN shines for **systemic
  narratives**, **sandbox storytelling**, or games where you want
  **replayability and player-driven pacing**. It's excellent for
  simulating a living world (with many small events) or for handling
  lots of optional side content elegantly. It is also a natural choice
  if you plan on writing _a ton of content_ that players might only
  partially see in one run, since QBN will let them encounter bits based
  on their play style without forcing a single path. Keep in mind QBN
  doesn't inherently generate plot coherence -- that's still on the
  writers and designers. It gives you building blocks to create
  **narrative Lego**; you must design how those pieces click together.
  If not carefully managed, a QBN game could feel aimless. But when done
  well, it feels like **the player is weaving their own story out of a
  rich world**, which is exactly what many players love about these
  systems.

## Conclusion

Quality-Based Narrative offers a robust framework for game storytelling
that moves beyond the limits of branching paths. By structuring your
narrative content as storylets gated by character and world qualities,
you enable a highly modular, replayable, and player-responsive
experience. Implementing a QBN system involves careful planning of state
variables and a solid content architecture, but it pays off in
flexibility: you can add new stories easily, let multiple plotlines run
in parallel, and give players a sense of agency in how the narrative
unfolds[\[12\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Taken%20together%2C%20those%20features%20mean,to%20allow%20interesting%20player%20mods)[\[39\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=On%20the%20other%20hand%2C%20sometimes,implemented%20irony%20that%20is).

For game developers, the QBN approach comes with new design patterns to
master -- from managing storylet availability (like a deck of cards) to
inventing resource economies that double as storytelling devices. It
asks designers to think in terms of **game state driving story** at
every turn. The result, however, can be a richly **dynamic storyworld**
that encourages exploration and experimentation. Players can find their
own sequences through content, and designers can continually expand the
narrative without rewriting a linear plot each time. As Emily Short
writes, storylet systems are _"simple, atomic, robust, and
recombinable"_[\[48\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Very%20frequently%2C%20when%20I%E2%80%99m%20called,simple%2C%20atomic%2C%20robust%2C%20and%20recombinable)
-- a powerful combination for interactive narrative design. By
leveraging the structures and patterns outlined above -- from
progress-tracking questicles to interlocking storylet webs -- you can
build a QBN-driven story that feels both coherent and expansively free.
Embrace the modular mindset, and you'll find quality-based narratives
open up many new storytelling possibilities in game design.

**Sources:** Quality-based narrative concepts and examples are drawn
from Failbetter Games' design diaries and the writing of narrative
designers like Emily Short and Alexis Kennedy, who have extensively
discussed storylets and QBN
structures[\[2\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Quality,in%20your%20relationship%20to%20your)[\[16\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,of%2C%20and%20changes%20to%2C%20qualities)[\[36\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=What%20is%20a%20Questicle%3F%20Simple%3A,in%20this%20case%20Cryptic%20Secrets).
Their insights, along with practical observations from projects like
Fallen London, have informed the patterns described in this guide. The
result is a synthesis of known best practices in crafting QBN
storyworlds, aimed at helping you start building your own from scratch.
Enjoy your foray into quality-based storytelling, and happy writing!

---

[\[1\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=To%20recap%2C%20in%20a%20quality,be%20explicitly%20tracked%20using%20qualities)
[\[10\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=This%20approach%20is%20very%20good,mechanical%20state%20to%20its%20narrative)
[\[17\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=The%20narrative%20engine%20is%20in,almost%20purely%20a%20narrative%20engine)
[\[49\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=Ever%20since%20Failbetter%E2%80%99s%20cancellation%20of,purpose%20system%20invariably)
[\[52\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=Scope%3A%20Narrative%20Engine%2C%20Text%20Engine%2C,UI%20Engine)
[\[53\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=You%20could%20build%20your%20engine,way%20this%20is%20done%2C%20to)
[\[54\]](https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html#:~:text=Building%20a%20DSL%20%28domain,orthogonal%20to%20what%20I%20have)
Attempted: Building a general-purpose QBN system \| Bruno Dias

<https://brunodias.dev/2017/05/30/an-ideal-qbn-system.html>

[\[2\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Quality,in%20your%20relationship%20to%20your)
[\[3\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=It%E2%80%99s%20inspired%20by%20some%20recent,of%20organizing%20and%20presenting%C2%A0such%20stories)
[\[4\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=It%E2%80%99s%20also%20much%20better%20than,lot%20of%20ugly%20repetition%20as)
[\[5\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=storylets%20unlocked%20by%20qualities%20www,tool%20implements%20QBN%3B%20so%20did)
[\[11\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=A%20major%20advantage%20of%20QBN,story%20%2020%20The%20Frequently)
[\[18\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements)
[\[28\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Another%20trick%20about%20QBN%20is,weren%E2%80%99t%20as%20common%20in%20the)
[\[33\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=whereas%20QBN%20can%20handle%20this,one%20of%20which%20is%20gated)
[\[34\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Certainly%C2%A0many%C2%A0branching%20narrative%20systems%20are%20in,of%20thing%20is%20the%20norm)
[\[38\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Another%20thing%20I%20like%20about,a%20small%20extra%20inventory%20reward)
[\[39\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=On%20the%20other%20hand%2C%20sometimes,implemented%20irony%20that%20is)
[\[40\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=On%20the%20other%20hand%2C%20sometimes,ended)
[\[41\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=flow,ended)
[\[46\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=QBN%20does%20pose%20some%20challenges,longer%20story%2C%20such%20as%20the)
Beyond Branching: Quality-Based, Salience-Based, and Waypoint Narrative
Structures -- Emily Short\'s Interactive Storytelling

<https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/>

[\[6\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=don%E2%80%99t%20just%20relate%20to%20your,For%20example)
[\[8\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=This%20is%20a%20storylet%20from,Qualities%20also%20control)
[\[15\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=What%20is%20a%20Questicle%3F%20Simple%3A,in%20this%20case%20Cryptic%20Secrets)
[\[36\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=What%20is%20a%20Questicle%3F%20Simple%3A,in%20this%20case%20Cryptic%20Secrets)
[\[37\]](https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two#:~:text=Anyway%2C%20what%20is%20the%20Mark,and%20then%20it%E2%80%99s%20gone%20forever)
Echo Bazaar Narrative Structures, part two \| Failbetter Games

<https://www.failbettergames.com/news/echo-bazaar-narrative-structures-part-two>

[\[7\]](https://videlais.github.io/simple-qbn/qbn.html#:~:text=describes%20the%20use%20of%20qualities,quality%20for%20a%20particular%20storylet)
[\[43\]](https://videlais.github.io/simple-qbn/qbn.html#:~:text=%28Storychoices%2C%202012%29)
Quality-Based Narrative (2010) - SimpleQBN

<https://videlais.github.io/simple-qbn/qbn.html>

[\[9\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=The%20metaphor%20of%20cards%20and,the%20deck%20currently%20being%20considered)
[\[13\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=While%20many%20people%20have%20embraced,Storychoices%2C%202012)
[\[19\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=As%20passages%20are%20storage%2C%20they,card%E2%80%9D%20marking%20them%20as%20such)
[\[50\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=Card)
[\[51\]](https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/#:~:text=Qualities%20for%20the%20cards%20are,has%20not%20be%20discarded%20previously)
Working with TinyQBN: Part 1: Terms and Concepts -- Digital Ephemera

<https://videlais.com/2020/09/05/working-with-tinyqbn-part-1-terms-and-concepts/>

[\[12\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Taken%20together%2C%20those%20features%20mean,to%20allow%20interesting%20player%20mods)
[\[30\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20unlocked%20by,largely%20moved%20on%20from%20that)
[\[31\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20used%20to,trouble%20the%20player%20is%20in)
[\[32\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=,Storylets)
[\[35\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20used%20to,design%20down%20into%20accessible%20areas)
[\[42\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Storylets%20can%20be%20unlocked%20by,largely%20moved%20on%20from%20that)
[\[47\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=At%20the%20same%20time%2C%20this,as%20a%20paper%20prototyping%20exercise)
[\[48\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Very%20frequently%2C%20when%20I%E2%80%99m%20called,simple%2C%20atomic%2C%20robust%2C%20and%20recombinable)
Storylets: You Want Them -- Emily Short\'s Interactive Storytelling

<https://emshort.blog/2019/11/29/storylets-you-want-them/>

[\[14\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,high%20quality%20for%20its%20effect%E2%80%99)
[\[16\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,of%2C%20and%20changes%20to%2C%20qualities)
[\[24\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=I%20reckon%20a%20key%20characteristic,drama%20should%20tend%20to%20emerge)
[\[55\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=Here%20are%20some%20things%20,often%29%20resources)
I've stopped talking about quality-based narrative, I've started talking
about resource narrative -- Weather Factory

<https://weatherfactory.biz/qbn-to-resource-narratives/>

[\[20\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=,the%20ink%2FUnity%20pairing%20I%20just)
[\[21\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=Either%20of%20the%20latter%20two,be%20rolling%20your%20own%20interface)
[\[22\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=,many%20a%20good%20game%20design)
[\[23\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=But%20this%20does%20ask%20that,for%20%E2%80%9Ccreative%20stats%2C%20consistently%20applied%E2%80%9D)
[\[25\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=A%20quality%20like%20%E2%80%9CPersonal%20Growth%E2%80%9D,%E2%80%9D)
[\[26\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=like%20%E2%80%9CNumber%20of%20Times%20You,%E2%80%9D)
[\[27\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=A%20quality%20like%20%E2%80%9CPersonal%20Growth%E2%80%9D,%E2%80%9D)
[\[29\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=carry%20meaning%20between%20many%20different,stories%20or%20segments%20of%20story)
[\[44\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=A%20great%20virtue%20of%20the,stories%20written%20by%20other%20people)
[\[45\]](https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/#:~:text=Somewhere%20around%20here%20I%20might,the%20project%20with%20a%20team)
Mailbag: Development Process for Storylet-based Interactive Fiction --
Emily Short\'s Interactive Storytelling

<https://emshort.blog/2020/02/18/mailbag-development-process-for-storylet-based-interactive-fiction/>
