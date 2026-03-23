# Quality-Based Narrative (QBN): System Design and Narrative Patterns

## What is a Quality-Based Narrative?

A **Quality-Based Narrative (QBN)** is an interactive storytelling model
where the progression of the story is determined by the player's
changing state, or **qualities**, rather than a fixed branching plot
structure. In a QBN (a term popularized by Failbetter Games for titles
like *Fallen London*), the game offers **storylets** -- self-contained
snippets of story or events -- based on the current values of the
player's
qualities[\[1\]](https://emshort.blog/2012/10/16/storynexus-is-open/#:~:text=StoryNexus%20supports%20authors%20in%20building,to%20be%20open%20to%20him)[\[2\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Quality,tool%20implements%20QBN%3B%20so%20did).
This means what choices or story nodes are available at any moment
depends on things like the player's stats, inventory, past actions, or
story progress, rather than a predetermined sequence. The result is a
narrative design that is more dynamic and **non-linear** than a classic
choose-your-own-adventure: instead of a fixed branching tree, storylets
can appear in **any order that fits the state**, allowing players to
explore content in a fluid
way[\[1\]](https://emshort.blog/2012/10/16/storynexus-is-open/#:~:text=StoryNexus%20supports%20authors%20in%20building,to%20be%20open%20to%20him).

**Storylets** are the core building blocks of QBN. As narrative designer
Emily Short defines, a storylet is "an atomic piece of content" -- which
could be a scene, event, or dialogue -- that comes with **prerequisites
(conditions)** for when it can be accessed and **effects** that update
the game state after it's
played[\[3\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Here%E2%80%99s%20my%20basic%20definition%20of,other%20things%3A%20events%2C%20snippets%2C%20etc).
In practice, a storylet might be a short narrative passage (perhaps a
few paragraphs of text, maybe with a choice of player actions) that
**unlocks only if certain qualities meet required values**, and upon
completion it might modify some qualities as
consequences[\[4\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=storylets%20unlocked%20by%20qualities%20www,tool%20implements%20QBN%3B%20so%20did).
For example, a storylet about finding a secret door might only be
available if your "Perception" quality is 5 or higher, and choosing to
open the door could then increase your "Curiosity" quality or grant an
item. Under the hood, **qualities are simply variables** (often numeric)
representing everything from character attributes and resources to story
flags and relationship
statuses[\[4\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=storylets%20unlocked%20by%20qualities%20www,tool%20implements%20QBN%3B%20so%20did).
A fundamental trait of Failbetter's approach is that *all these
variables are treated uniformly* -- character stats, currencies,
inventory counts, story progress markers are all **qualities in one
system**[\[5\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,of%2C%20and%20changes%20to%2C%20qualities).
This unified modeling means any storylet can check or change any kind of
quality, giving tremendous flexibility in linking story events to game
state.

**QBN vs. Branching Narrative:** Unlike a traditional branching
narrative that hard-codes story paths and choices in a tree structure, a
QBN does not have an explicit "branching logic" for the entire plot.
Instead, it uses **rules and content chunks** (storylets) that can be
assembled in many possible orders. There isn't a single big branching
diagram authored by the writer; rather, the narrative emerges from which
storylets become available due to the player's qualities and choices. In
essence, QBN replaces a predetermined choose-your-path flow with a
**state-driven selection** process. This doesn't mean the story lacks
structure -- designers still impose structure via qualities (for
example, a "chapter" quality that gates major plot sections) -- but it
means the player has more freedom to **navigate storylets non-linearly**
or even skip certain content if conditions don't lead them
there[\[1\]](https://emshort.blog/2012/10/16/storynexus-is-open/#:~:text=StoryNexus%20supports%20authors%20in%20building,to%20be%20open%20to%20him).
Each storylet is like a piece of a jigsaw puzzle that can be placed when
it fits the current state. Because of this, QBNs tend to feel more like
exploring a world or a narrative space, as opposed to following a single
branching path. There may still be choice points *within* a storylet
(Failbetter calls the options within a storylet "branches"), but after
resolving a storylet the player returns to the pool of available content
rather than a fixed next
node[\[4\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=storylets%20unlocked%20by%20qualities%20www,tool%20implements%20QBN%3B%20so%20did).
In short, **QBN is about reactive narrative structure**: the game
continuously responds to the player's state by offering appropriate
story snippets.

## Structuring a QBN System (System and Design Considerations)

To implement a QBN from scratch, you'll need to design a system that
manages **qualities, storylets, and the logic that connects them**. Here
we break down the key components and how they work together at a system
level:

- **Qualities (Player and World State):** Qualities are the backbone of
  QBN. They encompass anything worth tracking in the narrative. For
  instance, qualities might include the player's skills (e.g.
  `Dangerous=3`, `Watchful=5` in *Fallen London* terms), resources and
  inventory counts (`Gold=100`, `Rations=2`), story progression flags
  (`Quest_A_Progress=2`), relationship statuses (`Friendship_Bob=50`
  points), or even abstract narrative flags (`KnowsSecret_X = true`). In
  Failbetter's design all qualities share a common format (often an
  integer value) and are "created equal," meaning the system doesn't
  inherently distinguish a quality representing *health* from one
  representing *chapter number* -- they're all just state
  variables[\[5\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,of%2C%20and%20changes%20to%2C%20qualities).
  This uniformity simplifies the logic: **any storylet can check any
  quality** as a prerequisite. When structuring your system, it helps to
  categorize qualities conceptually, even if under the hood they are the
  same type: for example, you might define categories like **Progress
  Qualities** (track where the player is in a narrative arc or quest),
  **Resource Qualities** (currencies or points that can be gained and
  spent), **Skill/Ability Qualities** (character capabilities that might
  gate options or determine success/failure), **Menace Qualities**
  (undesirable counters that lead to trouble if they get too high), and
  **Relationship Qualities** (measuring affinity or status with other
  characters). These categories aren't hard-coded types but design
  patterns -- they guide how you use qualities in storytelling. For
  instance, a *progress quality* might be something like `Chapter=3` or
  `RescueMissionStage=2`, which you use to unlock the next storylet in a
  linear series, whereas a *menace quality* like `Suspicion=7` might
  trigger a "get arrested" event if it exceeds 10, and a *resource
  quality* like `Gold=100` might be spent to bribe a guard in a
  storylet. Deciding on the set of qualities for your storyworld is a
  crucial early step -- they effectively define what aspects of
  character and story state your narrative logic will consider.

- **Storylets (Content Nodes with Conditions and Effects):** All
  narrative content in a QBN system lives in discrete packets we call
  storylets. Each storylet should be stored with **metadata defining
  when it is available** and what it does. In practical terms, a
  storylet entry in your system might include: a unique ID or name, the
  content to present (text, dialogue, etc.), a list of **prerequisite
  conditions** (e.g. `Location=Forest`, `Quest_A_Progress=2`,
  `Gold>=50`, `Dangerous<3`), and a list of **outcomes/effects** on
  qualities (e.g. set `Quest_A_Progress=3`, subtract 50 Gold, increase
  `Dangerous` by 1, etc.). The prerequisite logic can be as simple or
  complex as needed -- many systems allow logical expressions, multiple
  required qualities, greater/less than comparisons, or specific values.
  When the game is "waiting" to present new story content, the QBN
  system performs a **query against the storylet database**: *find all
  storylets whose prerequisites are satisfied by the player's current
  qualities*. Johnnemann Nordhagen gives a succinct example: imagine a
  pool of quest storylets tagged with metadata like `#full_moon` or
  conditions like `<has_magic_sword:true>` or
  `{aliens_killed_count > 5}` -- when the story engine needs a next
  quest, it checks these conditions against the game state and finds
  what quests are currently
  valid[\[6\]](https://johnnemann.medium.com/narrative-design-202-more-about-storylets-6d34f438f93d#:~:text=A%20storylet%2C%20to%20retread%20old,quests%20that%20fit%20the%20criteria).
  Your implementation would need a similar mechanism to filter storylets
  by the player's state. Any storylets that pass the check are
  considered "available content." Importantly, **storylets are modular**
  and *reorderable*: they are written to make sense in any sequence as
  long as the entry conditions are met. This often means each storylet
  is a self-contained episode or scene. If a longer storyline needs to
  play out in sequence, that sequence is enforced via qualities (for
  example, Storylet B requires `QuestProgress=1` which only becomes true
  after Storylet A sets it). In effect, qualities allow you to *encode
  narrative dependencies without rigidly linking storylets together*.

- **Content Selection and Presentation:** Once the system knows which
  storylets are available, it must decide how to present them to the
  player. There are a few patterns for this in QBN systems, each with
  different gameplay feel:\
  **(a) Player-Driven Choice:** The simplest method is to present the
  player with a menu or list of all available storylets they can
  currently pursue. For example, Failbetter's StoryNexus engine (used in
  *Fallen London*) would show a list of storylet titles in each location
  that the player could click on, each representing an opportunity that
  meets the
  requirements[\[1\]](https://emshort.blog/2012/10/16/storynexus-is-open/#:~:text=StoryNexus%20supports%20authors%20in%20building,to%20be%20open%20to%20him).
  This gives the player agency to pick which thread to follow among the
  open options. Good UI design is critical here to keep the list
  manageable -- often storylets are grouped by context (such as physical
  location or a category) so the player isn't flooded with dozens of
  choices at once. **Location-based gating** is one common solution:
  storylets may have a location attribute, and only storylets for the
  player's current location are
  shown[\[7\]](https://mkremins.github.io/publications/Storylets_SketchingAMap.pdf#:~:text=narrative%20content%20in%20games,the%20storylets%20model%2C%20the%20player).
  That way, moving between locations or chapters naturally filters the
  content. Another UI aid is to highlight or prioritize storylets that
  are part of the main storyline versus optional or repeatable
  ones[\[8\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements)
  -- for instance, Failbetter eventually added indicators and sorting
  for "pinned" storylets critical to progress, versus secondary ones, to
  guide players in a sea of
  content[\[8\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements).\
  **(b) Random or System-Directed Selection:** Another approach is to
  have the system pick an available storylet for the player, either
  randomly or according to some drama-management algorithm. This can
  create a sense of the story "surprising" the player with events. A
  notable pattern here is the **"opportunity deck"** used in *Fallen
  London*: instead of listing every minor storylet, the game deals a few
  at random (drawn from a pool of those whose conditions you meet) into
  your hand. You can then play one, and later draw more. This random
  selection adds variety and pacing, essentially throttling content so
  that the player gradually encounters different storylets over time
  rather than everything at once. Other games use AI director logic to
  choose the most appropriate next storylet from the pool -- for
  example, *Heaven's Vault* ranks possible dialogue topics by *salience*
  (relevance to recent events) and picks one that best fits the
  conversation, treating each topic as a
  storylet[\[9\]](https://johnnemann.medium.com/narrative-design-202-more-about-storylets-6d34f438f93d#:~:text=The%20algorithmic%20implications%20are%20so,thinking%20about%20right%20n%20ow).
  In a pure QBN, this is optional -- you may not need a sophisticated
  drama manager if giving the player choice is acceptable -- but the
  architecture can accommodate it. If you do let the system auto-select
  events (as in some emergent narrative games), you're basically turning
  the QBN into a *story simulator* that serves up the "next" event based
  on state.

- **Applying Effects and Updating State:** After the player engages with
  a storylet (whether they chose it or it was triggered), the storylet's
  content plays out and the specified effects on qualities occur. This
  could mean incrementing some progress stat, toggling a flag, granting
  an item (increasing an inventory quality), adjusting a relationship
  meter, or perhaps spawning new qualities. These changes are what drive
  the narrative forward: by altering qualities, the game state shifts,
  which in turn will change which storylets are now available. For
  example, playing a storylet "Explore the Cave" might set
  `ExploredCave=true` and increase `TreasureFound` by 1. Immediately
  after, the system will re-query the storylet database and maybe find
  that a new storylet "Confront the Cave Guardian" is now unlocked by
  `ExploredCave=true`, while the one you just played might become
  unavailable (unless it's repeatable). **This loop of \> check
  available content \> play storylet \> update state \> check again**
  continues until some ending condition is reached (e.g. a storylet that
  signifies the narrative's conclusion) or indefinitely in an open-world
  narrative. Because storylets can be designed to be replayable or
  optional, a QBN game often doesn't force an immediate end -- players
  can often continue to explore side content or grind qualities unless a
  strict ending is enforced by the design.

- **Repeatability and One-Shot Events:** In structuring your QBN
  content, decide which storylets are single-use versus repeatable. Some
  storylets (especially those that advance a unique story plot) should
  logically only happen once. You can enforce that by having the
  storylet's effect set a flag quality (e.g. `Done_Story_X = true`) and
  include `Done_Story_X = false` as a prerequisite so it *cannot appear
  again* once completed. Other storylets, however, might be designed for
  repetition -- for instance, a generic **grinding action** like "Patrol
  the streets" that the player can do as many times as they want to
  raise a skill or gather resources. In some QBN implementations, *all*
  storylets are technically repeatable unless explicitly turned
  off[\[10\]](https://mkremins.github.io/publications/Storylets_SketchingAMap.pdf#:~:text=the%20opposite%20is%20true%3A%20all,repeatable%20unless%20designers%20take%20special),
  so it's up to the author to add conditions preventing re-entry if they
  want it one-time. Early designs of *Fallen London* leaned heavily on
  repeatable storylets that players had to grind "over and over again
  until the player gains enough skill to pass" a
  threshold[\[11\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=or%20by%20repetitive%20grinds%20where,largely%20moved%20on%20from%20that).
  Repetition is thus a built-in possibility of QBN systems -- a strength
  for gameplay loops but a challenge for narrative writing (we'll
  discuss pattern strategies for handling repeated content below).

In summary, structuring a QBN system means **modeling the game world as
a collection of qualities (state variables) and writing many small
narrative chunks (storylets) tagged by the conditions under which they
make sense**. The runtime of the game is essentially a cycle of checking
which storylets fit the current state and then allowing the player (or
an algorithm) to pick one to experience. This structure is highly
modular: adding a new storylet later is straightforward (just give it
some prerequisites and effects) and doesn't require rewriting a whole
branching tree. It also decouples the *order* of events from the
*authorship* of events -- as a designer you focus on writing each piece
and its requirements, and you rely on the system to weave them together
appropriately during play. Next, we'll look at common **narrative design
patterns** that emerge in QBN-based storyworlds and how you can
implement them within this framework.

## Narrative Design Patterns in QBN-Based Storyworlds

Designing narratives in a QBN format requires thinking in terms of
**states and modular events**, but it doesn't mean abandoning narrative
structure. In fact, many classic storytelling structures can be achieved
with QBN, and there are new patterns unique to this approach. Below is a
comprehensive guide to key narrative design patterns and methods for
structuring a QBN storyworld, along with how to implement them:

- **Linear Sequences (Gauntlets):** Even though QBN is flexible, you can
  still create a linear storyline when needed. A **gauntlet** is a
  linear sequence of storylets that the player goes through one after
  the
  other[\[12\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=For%20instance%2C%20here%E2%80%99s%20a%20gauntlet,might%20be%20represented%20in%20storylets).
  To implement this, you use a **progress quality** that gates each
  step. For example, a quest chain might have a quality
  `QuestX_Progress` that starts at 0. The first storylet of Quest X
  requires `QuestX_Progress = 0` and upon completion sets
  `QuestX_Progress = 1`. The next storylet requires
  `QuestX_Progress = 1`, sets it to 2, and so on. This ensures the
  player sees the storylets in order. You can also include conditional
  *failure branches* within those storylets to create slight detours
  while still moving forward -- e.g. if the player "makes a mistake" in
  a challenge, the storylet might branch to a failure outcome (perhaps
  raising a menace quality) but still increment the progress so they
  continue down a largely linear
  path[\[12\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=For%20instance%2C%20here%E2%80%99s%20a%20gauntlet,might%20be%20represented%20in%20storylets).
  Essentially, a gauntlet in QBN is a straight line enforced by
  incrementing a stat, very similar to how you'd lock and unlock levels
  in a linear game. The difference is that outside of that sequence, the
  player could still go do other unrelated storylets if available; but
  the gauntlet's next step won't appear until the previous step's
  condition is met.

- **Branch-and-Bottleneck Structures:** A **branch & bottleneck**
  pattern is common in choice-based narratives -- the player can take
  one of several paths for a while, but eventually they converge to the
  same critical juncture. QBN can recreate this by using qualities to
  mark which branch was taken and then using a single later storylet
  that has *any of* those branch markers as prerequisites (or a
  consolidated progress value). For example, suppose at Progress 2 the
  player can do either Storylet A or B (two different approaches to a
  problem). If they do A, it sets `PathChosen = A`; if they do B, it
  sets `PathChosen = B`. Later at Progress 3, you have a bottleneck
  storylet C that requires `QuestX_Progress = 3` (meaning the earlier
  part is done) and maybe it checks that `PathChosen` is either A or B
  -- if the differences need to be resolved, you can have slight
  variation inside C based on that flag. In essence, both A and B lead
  to C, reconverging the narrative. From the player perspective, they
  had a different middle experience but arrive at the same pivotal
  event. Emily Short demonstrates that storylet systems handle this
  smoothly: you allow "some variation and then channel \[the player\]
  back for critical
  moments"[\[13\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=And%20here%E2%80%99s%20a%20branch,channeled%20back%20for%20critical%20moments).
  The **critical technique** is to use a shared progress quality to mark
  the point of convergence. Both branch storylets set
  `QuestX_Progress = 3` by the end, so that the bottleneck storylet
  requiring progress 3 now appears regardless of which branch was taken.
  This avoids the duplication that pure branching would need (where
  you'd have to manually converge branches in the narrative script).
  With QBN, convergence is just a matter of designing the state logic to
  funnel back together.

- **Early Branching ("Sorting Hat" Pattern):** This refers to a
  structure where a single early choice determines one of several
  distinct story paths for the rest of the game (like choosing a faction
  or a house at the start -- hence *"sorting hat"* ala Harry Potter). In
  QBN, the moment of that choice would set a **long-term quality flag**
  (e.g. `Alliance=Rebels` vs `Alliance=Empire`). Subsequent storylets
  for that storyline would check this flag and offer content
  accordingly. You might literally have separate storylet chains for
  each faction, each gated by the faction quality. Emily Short describes
  this as an initial key choice that determines which of several linear
  narratives the player will
  experience[\[14\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Or%20a%20sorting%20hat%2C%20where,narratives%20the%20player%20will%20experience).
  The QBN implementation is straightforward: as soon as the choice is
  made, set a quality (or multiple qualities) to represent it, and have
  mutually exclusive storylets for each path. For instance, if
  `Alliance=Rebels`, only Rebel storyline storylets appear; if
  `Alliance=Empire`, the Empire ones appear instead. This pattern
  essentially **branches the entire game into distinct tracks** using a
  persistent quality. It's a simple use of QBN but an important one for
  giving players a sense of a personalized narrative arc from the start.

- **Loops and Cyclical Narratives:** One of the strengths of QBN is
  handling **repeating cycles** with variations, often called a
  **loop-and-grow** structure. In a loop-and-grow design, the player
  experiences a similar sequence multiple times, but each iteration the
  state has advanced, so there are new differences or growth each cycle.
  Emily Short's game *Bee* is a prime example: the story is structured
  by the calendar year, with each year having recurring seasonal events
  (holidays, etc.), training sessions, and so on, over several years of
  the protagonist's
  life[\[15\]](https://emshort.blog/category/quality-based-narrative/#:~:text=My%20game%20Bee%2C%20for%20instance%2C,the%20members%20of%20her%20family)[\[16\]](https://emshort.blog/category/quality-based-narrative/#:~:text=%E2%80%9CWhat%20month%20is%20it%3F%E2%80%9D%20makes,This%20means%20that).
  Every time a year passes, the next cycle repeats those seasonal
  opportunities but the character is a bit older and more skilled, so
  content may shift. To implement loops, you can use a **cyclic
  quality** like "Month" that goes from January to December, and a
  "Year" counter that increments after December. Storylets would use the
  month as a prerequisite to unlock seasonal content (e.g. `Month = 12`
  prerequisite for a Christmas event), and playing that event might
  advance the month. When Month wraps back to 1 (January), a storylet
  sets `Year += 1`. This way the content for each month becomes
  available again in the new year, but you can also tie new effects to
  the increasing year or other progress stats (NPC relationships might
  deepen each year, challenges might get harder,
  etc.)[\[17\]](https://emshort.blog/category/quality-based-narrative/#:~:text=,is%20also%20advanced%20by%201)[\[18\]](https://emshort.blog/category/quality-based-narrative/#:~:text=Month%2C%20year%2C%20and%20character%20story,skill%2C%20motivation%2C%20and%20family%20poverty).
  The **loop-and-grow** pattern thus combines repetition with evolution:
  the **same structure repeats** (preventing the combinatorial explosion
  of a pure time-cave branching), but the **stateful changes** ensure
  it's not literally the same experience each
  time[\[19\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Or%20a%20loop,structure%20I%20used%20for%20Bee).
  QBN systems handle this elegantly since you can simply re-unlock
  storylets based on a cyclical condition and still check other
  qualities to alter outcomes. For example, maybe each year the
  "Spelling Bee competition" storylet is unlocked, but it checks your
  `SpellingSkill` quality -- in year 1 you might fail, by year 3 you
  succeed because that skill resource has
  increased[\[20\]](https://emshort.blog/category/quality-based-narrative/#:~:text=These%20other%20stats%20aren%E2%80%99t%20progress,end%20of%20year%20spelling%20bee).
  This pattern is great for games with an in-game time cycle (days,
  years, seasons) or any narrative that wants to emphasize routines and
  progression (e.g. a roguelike story structure where each run is a loop
  with accumulated knowledge).

- **Parallel and Braided Storylines:** QBN truly shines when handling
  **multiple story arcs running in parallel**. In a traditional linear
  narrative, it's tricky to let the player follow multiple plotlines
  simultaneously -- usually one must be paused or the narrative might
  become incoherent. But with storylets, you can design the content as a
  web of sub-plots that **progress independently but coexist**. Each
  subplot (or quest, or character arc) can have its own progress
  quality, and storylets associated with that arc check that quality.
  The player can then switch between these arcs as they like, picking up
  one storyline, then another, as long as prerequisites are met. For
  example, in *Bee* the protagonist's life has several concurrent
  threads: the **main arc** of growing up and approaching the final
  national spelling bee, and **smaller arcs** like relationships with
  family members, improving her spelling skill, dealing with financial
  hardship,
  etc.[\[15\]](https://emshort.blog/category/quality-based-narrative/#:~:text=My%20game%20Bee%2C%20for%20instance%2C,the%20members%20of%20her%20family)[\[21\]](https://emshort.blog/category/quality-based-narrative/#:~:text=The%20character%20relationships%2C%20meanwhile%2C%20are,%E2%80%9Cyear%E2%80%9D%20of%20the%20main%20narrative).
  These were implemented by tracking multiple stats: one for years
  passed (main arc), one for month/season (to cycle content), and
  separate ones for each character relationship
  progress[\[22\]](https://emshort.blog/category/quality-based-narrative/#:~:text=To%20track%20where%20the%20player,tracked%20several%20different%20progress%20stats).
  The relationship stories could advance on their own schedule -- you
  might fully resolve one character's subplot early (e.g. become best
  friends with your sister by Year 2), while another subplot lingers.
  Because storylets from any arc can appear as long as their conditions
  are satisfied, the player experiences a **braided narrative**:
  interweaving episodes from different storylines. This pattern requires
  careful **signposting** to the player so they know what options
  pertain to which storyline, but when done well it gives a rich sense
  of an expansive world with multiple ongoing stories. It's important to
  consider **interaction between parallel arcs** too -- storylets in one
  arc might influence qualities in another. This can be a feature, not a
  bug: it allows arcs to affect each other in meaningful
  ways[\[23\]](https://emshort.blog/category/quality-based-narrative/#:~:text=Storylets%20encourage%20narrative%20designers%20to,one%20another%20in%20memorable%20ways)[\[24\]](https://emshort.blog/category/quality-based-narrative/#:~:text=Thanks%20to%20these%20abstractions%2C%20one,affect%20what%20happens%20in%20another).
  For instance, imagine two parallel quests in a fantasy game -- one to
  negotiate peace between factions, another to rescue a friend. If you
  become infamous (a quality) in the course of the rescue quest, that
  could lock you out of a peaceful negotiation path in the other quest,
  redirecting the outcome. In QBN, such cross-arc effects are easy to
  implement: it's just one storylet's effects setting a quality that
  another storylet's prerequisites respond to. Designers often embrace
  this to create a sense that **episodes "remember" each other** or have
  ripple effects, which is more flexible than segmented branching
  stories. As Emily Short notes, storylets encourage thinking in terms
  of systems, enabling **episodic stories that feed into a larger arc**
  and even allowing new episodes to be added without breaking existing
  ones[\[25\]](https://emshort.blog/category/quality-based-narrative/#:~:text=,fictionally%20and%20mechanically%20interesting%20ways).
  This modularity means a large narrative can be built as a collection
  of semi-independent threads that occasionally meet or influence one
  another -- much like how TV series have multiple subplots that
  sometimes cross over.

- **Resource Gating and Stat-Building:** A common pattern in QBN game
  design is to use **resources or stats as gateways** for content. Since
  qualities can represent not just story flags but also things like
  money, equipment, or character skills, you can require the player to
  achieve certain resource levels to unlock storylets. This merges
  narrative with game-like progression. For example, a storylet might
  demand that the player have at least 50 Coin to attempt bribing a
  guard -- if not, the player must go earn more money via other
  storylets before this option becomes available. Likewise, a dangerous
  expedition story might only unlock if your `SurvivalSkill` quality is,
  say, 5 or higher; until then, maybe only training missions (which
  increase that skill) are accessible. This pattern creates a **gameplay
  loop of preparation**: the player is aware of a narrative goal but
  must do related activities to meet the prerequisites. Failbetter's
  games often structured early content this way -- e.g., you needed a
  certain level in a stat (Watchful, Shadowy, etc.) or a certain item to
  progress a storyline, which encouraged grinding simpler storylets to
  raise those qualities. *Fallen London* originally had many cases where
  you'd "grind by repetitive actions" until you gained enough skill or a
  specific key item to pass a storylet's
  challenge[\[11\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=or%20by%20repetitive%20grinds%20where,largely%20moved%20on%20from%20that).
  The QBN system makes this straightforward: any storylet can have as
  prerequisite `Quality >= X`, effectively **locking content behind stat
  thresholds** rather than narrative sequence. When the player reaches
  that threshold, new storylets "magically" appear, giving a satisfying
  sense of discovery and achievement.

Additionally, **skill checks** and probabilistic outcomes are often used
in QBN storylets to add uncertainty. For instance, a storylet might
always be available, but the result of choosing an action could depend
on a stat -- success if your skill is high, or failure (perhaps with
some consequence) if it's low. This can be implemented by having
multiple branches inside the storylet: one branch labeled "success"
requiring `Skill >= N` (or a random roll against the skill), and one
branch "failure" for the other case. Both branches might conclude by
setting some qualities (success might progress the story or reward you,
failure might raise a menace quality or force a detour). From a pattern
perspective, this introduces **branching within a storylet** that
doesn't create new storylets, but affects qualities that lead to
different storylets later (for example, a failure might increase your
`Wounds` menace, which could trigger a hospital storylet if it gets too
high). In short, **resource and stat management is woven into the
narrative** in QBN design. The player isn't just picking story options;
they're also managing qualities that open and close story options.
Alexis Kennedy actually prefers calling this style *"resource
narrative"*, because a well-designed QBN often feels like an explicit
narrative focused on **strategically manipulating resources** (be they
health, relationships, or story currency) such that story events emerge
naturally from those resource
states[\[26\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=It%20occurred%20to%20me%20last,story%20advancement%20or%20something%20else).
The narrative challenge for the designer is to ensure the resource
mechanics align with the story's themes (so it feels natural that, say,
raising "Reputation" unlocks a diplomatic storyline, or running low on
"Supply" triggers a desperation event). When done right, **the resource
dynamics *are* the story**: players experience drama through the rise
and fall of these values, not just through pre-scripted plot twists.

- **Menace and Consequence Systems:** QBN storyworlds often include
  **menace** qualities or other negative counters that track the
  accumulation of trouble, danger, or failures. Rather than a fail-state
  like "Game Over", high menace levels typically unlock special
  storylets that represent the consequences of the player's actions.
  Failbetter's games pioneered this with qualities like "Nightmare" (too
  high, you suffer a nightmare scenario) or "Wounds" (too high, you're
  waylaid by injury). For example, in *Sunless Skies* if your **Terror**
  stat gets too high, it will unlock unique **Nightmare storylets**
  where the character experiences horrifying
  visions[\[27\]](https://emshort.blog/category/quality-based-narrative/#:~:text=This%20is%20still%20a%20fairly,the%20protagonist%20with%20unspeakable%20visions).
  Similarly, *Fallen London* has menace storylets that send you to
  prison if your `Suspicion` gets too high, or to a sick-bed if your
  `Wounds` are high -- these are temporary narrative detours that the
  player must resolve (often lowering the menace quality) before
  returning to normal play. The design pattern here serves multiple
  purposes: it provides **failure handlers** (the story reacts to
  failure states with more story instead of a dead end) and it adds a
  layer of **tension** -- as menace qualities creep up, the player knows
  some complication will happen. Implementing menace-based content
  involves setting certain storylets to require a threshold like
  `Menace_X >= N`. Those storylets typically also have effects to reset
  or reduce that menace (representing the idea that you deal with the
  problem, e.g. escaping jail might reset `Suspicion` to a safe level).
  In *Bee*, Emily Short included a *poverty* stat as a menace: if the
  family's Poverty got too high, it would **close off some story options
  and open up others that reflect the
  hardship**[\[28\]](https://emshort.blog/category/quality-based-narrative/#:~:text=level%20to%20be%20able%20to,end%20of%20year%20spelling%20bee).
  For instance, high Poverty might disable a storylet like "Buy a fancy
  dress for the dance" (because you can't afford it) but enable a
  storylet like "Take a loan from a friend" that wouldn't appear
  otherwise. This pattern makes the world state very dynamic -- the
  narrative adapts not only to the player's positive progress but also
  to negative states. It effectively creates **branching by failure**
  conditions: the worse things get, the more the story shifts to address
  those troubles. A well-designed menace system in QBN thus ensures that
  even "bad" outcomes lead to interesting content (often some of the
  most memorable content!). It also encourages the player to manage
  their menace qualities by maybe taking actions to reduce them (which
  themselves can be storylets -- e.g. a storylet "Tend to your wounds"
  lowers the Wounds quality, at the cost of time or other resources).
  Menace mechanics tie back into the idea of resource narrative: they
  are resources you want to keep low. And because they are just
  qualities, they interlock with other story logic easily -- e.g. an
  infiltration mission storylet might raise Suspicion if you fail,
  pushing you closer to that arrest event which is its own mini-story.
  Designers can get creative with menace-like qualities to model
  anything from moral corruption to supernatural curses -- the key is
  these values trigger content when they cross thresholds, adding a
  *system-driven plot twist* to the narrative.

- **Emergent Side-Quests and Open Story Ordering:** One of the most
  powerful narrative effects of a QBN system is that it allows
  **emergent narrative sequencing** -- players can end up stitching
  together storylets in an order that the author might not have
  explicitly planned, yet the result still makes narrative sense. This
  often happens through the need to fulfill prerequisites. For example,
  suppose you're in the middle of a storyline where you need a certain
  item or piece of information to proceed. In a QBN game, that
  requirement (a quality needed) might prompt the player to **go off on
  a side-quest of their choosing to obtain it**, then come back. Emily
  Short gives a great illustration: say you're trying to impress a
  bishop in a storylet that requires you to donate a large sum of money.
  You don't have enough funds, so you leave that storylet, wander off to
  do odd jobs elsewhere in the world (perhaps even morally dubious jobs
  for Hell, in the *Fallen London* universe) to earn money, then return
  to donate to the
  church[\[29\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=On%20the%20other%20hand%2C%20sometimes,implemented%20irony%20that%20is).
  The system didn't force that specific sequence (it just said "Needs
  100 money"); the *player* chose how to meet that condition,
  effectively **weaving a custom side-story into the main story**. This
  emergent property -- where the player's problem-solving creates a
  narrative twist -- is a hallmark of QBN gameplay. To support it,
  ensure that your storylet design leaves these openings: don't always
  provide a single path to a goal, instead require a quality that could
  be obtained via multiple avenues. When the player does something
  out-of-sequence, the narrative still remains coherent because the
  gating quality ensures the right context (e.g. you only donate when
  you have the money, even if how you got the money was unrelated
  storylets). Another emergent aspect is when storylets from different
  arcs end up connecting because of shared qualities. For instance, the
  item you fetched in an unrelated sidequest might unexpectedly give you
  a special option in a later storylet ("Oh, since you retrieved the
  *Dragon's Egg* earlier, you can now use it to bargain with the
  queen!"). QBN is excellent for these **callback interactions**.
  Writers often intentionally add a few storylets or branches that check
  for some odd combination of qualities as Easter eggs -- unique content
  if, say, you did Arc A and Arc B, something new
  happens[\[30\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Another%20thing%20I%20like%20about,a%20small%20extra%20inventory%20reward).
  These touches reward players for thorough exploration and make the
  world feel interconnected. From a patterns perspective, we might call
  this **implicit side-quest integration**: the system lets content from
  one plotline naturally be used in another because everything is
  state-driven, not hardwired. It's worth noting that this open ordering
  can lead to sequences the author didn't predict, so testing is needed
  to ensure there are no contradictory outcomes. However, since
  storylets are relatively self-contained, worst case the player just
  misses some storylets or sees them in a peculiar order -- it generally
  doesn't break the game, it just gives a unique narrative. Many players
  of *Fallen London* or other QBN games report moments of delightful
  irony or personalization, where they realize *their* story had a twist
  that wasn't explicitly scripted but came from the way they pursued the
  content. As a designer, embracing this means writing content that is
  modular and resilient to order: avoid assuming "the player must have
  seen X before Y" unless you enforce it with a quality; otherwise allow
  that maybe Y happens first and still make sense. Done well, the
  narrative feels **player-driven** -- the player assembles the story
  from pieces, almost like telling their own story with the game as a
  partner.

- **Managing Complexity and Guiding the Player:** As QBN worlds grow,
  one design concern is how to prevent the player from getting
  overwhelmed or lost. With many storylets available, we need patterns
  to **structure the discovery of content**. A few common techniques
  used in QBN systems are:\
  **Locations & Regions:** Partition the world into locations or
  chapters, and tie storylets to those contexts. Players naturally
  navigate the world to find content. For example, only when in the
  "Enchanted Forest" location will the forest-related storylets appear.
  This not only makes logical sense fictionally, but also limits the
  active storylet pool to a subset at any time. It's a straightforward
  way to impose structure on an otherwise freeform
  system[\[7\]](https://mkremins.github.io/publications/Storylets_SketchingAMap.pdf#:~:text=narrative%20content%20in%20games,the%20storylets%20model%2C%20the%20player).
  You can also use narrative "chapters" in a similar way -- e.g. a
  quality `Chapter=2` means you're in Chapter 2 of the game, and maybe
  only storylets tagged for Chapter 2 are active. When the main plot
  advances to Chapter 3 (by setting that quality), it effectively
  retires the old content and introduces new content, keeping focus.\
  **Main Plot Beacons:** Use a main storyline progress quality and
  always ensure there is at least one obvious available storylet that
  advances it. This acts as a beacon or guidepost for players. Ancillary
  storylets can be optional, lower priority in the UI, or even hidden
  behind explicit player actions like drawing cards or searching.
  Failbetter, for instance, highlights "Exceptional Story" or ambition
  storylets in a different color or UI area to signal they are
  important, while leaving repeatable or minor storylets in a different
  list[\[8\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements).
  By **differentiating critical story content from filler content** in
  the interface, you give the player a way to orient themselves.\
  **Opportunity Systems:** As mentioned, the deck-of-opportunities or
  random surfacing of content is another pattern to manage complexity.
  It effectively **curates the experience** so that at any given moment
  the player only sees a handful of the possible storylets. This can
  also inject an element of surprise and prevent the analysis-paralysis
  of seeing every choice. If you implement a deck, you typically allow
  the player some draws per in-game time unit (like *Fallen London*'s
  actions) so they gradually encounter content. This also encourages
  replay or long-term play, as not everything will appear in one
  session. The downside is randomness can frustrate some players if
  they're hunting for a specific event, so often designers include ways
  to pin or increase the chance of certain storylets if needed.\
  **Player Journals and Logs:** Though not unique to QBN, it's worth
  mentioning: providing the player with a journal or quest log that
  summarizes active plotlines and perhaps hints at what to do (e.g. "You
  are trying to appease the Bishop. Perhaps earning some money would
  help.") can mitigate confusion. In QBN, where the player might step
  away from a storyline for a while to do side content, a reminder of
  their goals is very helpful when they return.\
  **Scaling and Adding Content:** A pattern observed in long-running QBN
  games is that you can keep **adding new storylets and even new
  qualities over time** to enrich the world. Because the content is
  modular, adding new stories doesn't require overhauling existing ones
  -- just introduce a new set of storylets with their own conditions.
  Authors do need to check if new content inadvertently conflicts with
  old content's assumptions (for example, a new storylet that
  unintentionally satisfies a condition for an old story could create an
  edge case). Generally, though, QBN is robust for expansion. As Emily
  Short notes, you can "drop in modular elements of new content
  alongside old content" with minimal disruption, which is crucial for
  episodic content or live storytelling that updates
  regularly[\[31\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements).
  The pattern here is to **design for extensibility**: plan your
  qualities with room for growth (e.g. if you have a quality tracking a
  reputation from 1--5, maybe you leave the possibility for future
  content that extends it to 10), and avoid absolute endings that
  preclude adding more side content. Many QBN-based games have a
  quasi-open structure even after the main narrative, allowing
  additional content ("Exceptional stories", holiday events, new quests)
  to slot in as long as the player's qualities meet whatever start
  conditions those have. This keeps the storyworld **alive and
  evolving**, a big draw for player retention in long-term projects.

- **Writing for a QBN:** While not a "pattern" per se, it's worth
  addressing narrative technique in QBN since it differs from linear
  writing. Because players might encounter storylets in various orders
  or even repeat some of them, **writing robust, context-independent
  prose** is important. Each storylet should establish context enough
  that it can stand alone if needed. You can't rely on the immediately
  previous story to have delivered information (unless you enforce that
  sequence with qualities). Techniques like **recapping in brief within
  dialogue** or using the **character's known state** (qualities) to
  tailor text can help. For repeated content, writers often use a style
  similar to NPC "barks" in games -- short flavor snippets that don't
  become annoying on
  repetition[\[32\]](https://intfiction.org/t/different-styles-of-qbn-storylet-game-design/78077#:~:text=strands%20that%20can%20progress%20independently,array%20for%20the%20most%20impact).
  Variation is key: if a storylet might be repeated, consider writing a
  few alternate descriptions or outcomes that the system can cycle
  through or randomly pick, so the player isn't seeing verbatim text for
  the tenth time. At the very least, ensure the text is somewhat generic
  or evergreen so that reading it multiple times isn't jarring or overly
  tedious. Another pattern is to acknowledge repetition humorously or
  narratively (e.g. the narrator commenting "Here we go again\..." on a
  fourth attempt) if it fits the tone, so the player feels the game
  recognizes their repetition. QBN also benefits from **conditional
  text** within storylets -- small lines that change if certain
  qualities are set. This can personalize the content and keep it
  feeling reactive. For example, if you have a storylet that several
  arcs might lead into, you can include a line like "Because you sided
  with the Rebels earlier, the Duke eyes you with suspicion." that only
  shows if `Alliance=Rebels`. This way, even a convergent storylet can
  reflect the path the player took, maintaining coherence. As a general
  rule, writing for QBN is a bit like writing a collection of short
  stories that share characters and world, rather than chapters of a
  single linear story. Each piece should enrich the world and possibly
  reference others via qualities, but it must not presume a strict order
  unless that order is enforced. When done well, the result is a richly
  layered narrative that players can **navigate almost like exploring a
  map** -- discovering narrative content in whichever direction their
  character's development takes them.

## Conclusion

Building a Quality-Based Narrative system from scratch means thinking of
story structure in terms of **systems and states** rather than
flowcharts. The implementation involves creating a flexible engine that
serves up storylets based on game state, and the narrative design
involves crafting those storylets and qualities to support a wide range
of player paths. The payoff for this effort is a form of interactive
storytelling that is highly **replayable, customizable, and scalable**.
Players get the sense that the story responds to them -- because it
literally does, gating content on their qualities -- and that they have
freedom to chart their own course through the narrative.

For game developers, a QBN approach can solve the problem of branching
narrative explosion by instead organizing content in a **hub-and-spoke
or web-like structure**. It encourages a modular workflow: multiple
writers can work on different storylets or arcs simultaneously, as long
as they agree on the qualities and conditions that link them. It also
allows live content updates (new storylets can slot in later) without
disrupting an existing story graph. On the flip side, it requires robust
tracking of state and thorough planning to ensure the game doesn't
become incoherent or overwhelming. As we've seen, patterns like using
progress qualities for linear sections, managing parallel plots with
separate stats, gating content by resources and skills, and handling
failure through menace qualities are all tools to impose **narrative
structure within a systemic framework**.

Ultimately, Quality-Based Narrative design merges the narrative artistry
of writing story events with the systemic thinking of game design. It's
a **powerful alternative to strict branching**: any rule or condition
you can imagine can be used to select the next storylet, giving you far
more narrative possibilities than a fixed
script[\[33\]](https://johnnemann.medium.com/narrative-design-202-more-about-storylets-6d34f438f93d#:~:text=This%20kind%20of%20storytelling%20flexibility,a%20storylet%20system%2C%20it%E2%80%99s%20easy).
When you align those rules with the themes of your game -- turning
character traits, relationships, and challenges into quantitative
qualities -- the player's journey becomes uniquely their own story,
assembled from the palette you provide. As Alexis Kennedy notes, the
goal is often to let drama **"emerge in a natural-seeming way from the
combination of resource states"**, rather than from a linear plot
mandate[\[26\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=It%20occurred%20to%20me%20last,story%20advancement%20or%20something%20else).
By following the system and pattern guidelines above, you can design a
QBN-based storyworld that feels alive, reactive, and rich with narrative
possibilities, giving players the thrill of discovering *their* story
within your world.

**Sources:** The concepts and examples above draw on insights from
Failbetter Games' design of *Fallen London* and StoryNexus (pioneering
QBN
platforms)[\[1\]](https://emshort.blog/2012/10/16/storynexus-is-open/#:~:text=StoryNexus%20supports%20authors%20in%20building,to%20be%20open%20to%20him)[\[2\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Quality,tool%20implements%20QBN%3B%20so%20did),
commentary by Alexis Kennedy on the evolution to "resource
narrative"[\[34\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,of%2C%20and%20changes%20to%2C%20qualities)[\[26\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=It%20occurred%20to%20me%20last,story%20advancement%20or%20something%20else),
Emily Short's extensive analysis of storylet structures and their
advantages[\[3\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Here%E2%80%99s%20my%20basic%20definition%20of,other%20things%3A%20events%2C%20snippets%2C%20etc)[\[35\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=A%20storylet%20in%20one%20place,the%20chain%20of%20causality%20is)[\[20\]](https://emshort.blog/category/quality-based-narrative/#:~:text=These%20other%20stats%20aren%E2%80%99t%20progress,end%20of%20year%20spelling%20bee),
and other industry discussions on narrative design patterns for
storylets and quality-based
storytelling[\[36\]](https://emshort.blog/category/quality-based-narrative/#:~:text=,fictionally%20and%20mechanically%20interesting%20ways)[\[27\]](https://emshort.blog/category/quality-based-narrative/#:~:text=This%20is%20still%20a%20fairly,the%20protagonist%20with%20unspeakable%20visions).
These patterns have been observed in games ranging from text-based
interactive fiction to ambitious AI-driven narratives, making QBN a
versatile approach for modern game narrative design.

------------------------------------------------------------------------

[\[1\]](https://emshort.blog/2012/10/16/storynexus-is-open/#:~:text=StoryNexus%20supports%20authors%20in%20building,to%20be%20open%20to%20him)
StoryNexus is Open -- Emily Short\'s Interactive Storytelling

<https://emshort.blog/2012/10/16/storynexus-is-open/>

[\[2\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Quality,tool%20implements%20QBN%3B%20so%20did)
[\[4\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=storylets%20unlocked%20by%20qualities%20www,tool%20implements%20QBN%3B%20so%20did)
[\[8\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements)
[\[29\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=On%20the%20other%20hand%2C%20sometimes,implemented%20irony%20that%20is)
[\[30\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=Another%20thing%20I%20like%20about,a%20small%20extra%20inventory%20reward)
[\[31\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=tool,how%20to%20surface%20these%20elements)
[\[35\]](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/#:~:text=A%20storylet%20in%20one%20place,the%20chain%20of%20causality%20is)
Beyond Branching: Quality-Based, Salience-Based, and Waypoint Narrative
Structures -- Emily Short\'s Interactive Storytelling

<https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/>

[\[3\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Here%E2%80%99s%20my%20basic%20definition%20of,other%20things%3A%20events%2C%20snippets%2C%20etc)
[\[11\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=or%20by%20repetitive%20grinds%20where,largely%20moved%20on%20from%20that)
[\[12\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=For%20instance%2C%20here%E2%80%99s%20a%20gauntlet,might%20be%20represented%20in%20storylets)
[\[13\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=And%20here%E2%80%99s%20a%20branch,channeled%20back%20for%20critical%20moments)
[\[14\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Or%20a%20sorting%20hat%2C%20where,narratives%20the%20player%20will%20experience)
[\[19\]](https://emshort.blog/2019/11/29/storylets-you-want-them/#:~:text=Or%20a%20loop,structure%20I%20used%20for%20Bee)
Storylets: You Want Them -- Emily Short\'s Interactive Storytelling

<https://emshort.blog/2019/11/29/storylets-you-want-them/>

[\[5\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,of%2C%20and%20changes%20to%2C%20qualities)
[\[26\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=It%20occurred%20to%20me%20last,story%20advancement%20or%20something%20else)
[\[34\]](https://weatherfactory.biz/qbn-to-resource-narratives/#:~:text=,of%2C%20and%20changes%20to%2C%20qualities)
I've stopped talking about quality-based narrative, I've started talking
about resource narrative -- Weather Factory

<https://weatherfactory.biz/qbn-to-resource-narratives/>

[\[6\]](https://johnnemann.medium.com/narrative-design-202-more-about-storylets-6d34f438f93d#:~:text=A%20storylet%2C%20to%20retread%20old,quests%20that%20fit%20the%20criteria)
[\[9\]](https://johnnemann.medium.com/narrative-design-202-more-about-storylets-6d34f438f93d#:~:text=The%20algorithmic%20implications%20are%20so,thinking%20about%20right%20n%20ow)
[\[33\]](https://johnnemann.medium.com/narrative-design-202-more-about-storylets-6d34f438f93d#:~:text=This%20kind%20of%20storytelling%20flexibility,a%20storylet%20system%2C%20it%E2%80%99s%20easy)
Narrative Design 202: More About Storylets \| by Johnnemann Nordhagen \|
Medium

<https://johnnemann.medium.com/narrative-design-202-more-about-storylets-6d34f438f93d>

[\[7\]](https://mkremins.github.io/publications/Storylets_SketchingAMap.pdf#:~:text=narrative%20content%20in%20games,the%20storylets%20model%2C%20the%20player)
[\[10\]](https://mkremins.github.io/publications/Storylets_SketchingAMap.pdf#:~:text=the%20opposite%20is%20true%3A%20all,repeatable%20unless%20designers%20take%20special)
Sketching a Map of the Storylets Design Space

<https://mkremins.github.io/publications/Storylets_SketchingAMap.pdf>

[\[15\]](https://emshort.blog/category/quality-based-narrative/#:~:text=My%20game%20Bee%2C%20for%20instance%2C,the%20members%20of%20her%20family)
[\[16\]](https://emshort.blog/category/quality-based-narrative/#:~:text=%E2%80%9CWhat%20month%20is%20it%3F%E2%80%9D%20makes,This%20means%20that)
[\[17\]](https://emshort.blog/category/quality-based-narrative/#:~:text=,is%20also%20advanced%20by%201)
[\[18\]](https://emshort.blog/category/quality-based-narrative/#:~:text=Month%2C%20year%2C%20and%20character%20story,skill%2C%20motivation%2C%20and%20family%20poverty)
[\[20\]](https://emshort.blog/category/quality-based-narrative/#:~:text=These%20other%20stats%20aren%E2%80%99t%20progress,end%20of%20year%20spelling%20bee)
[\[21\]](https://emshort.blog/category/quality-based-narrative/#:~:text=The%20character%20relationships%2C%20meanwhile%2C%20are,%E2%80%9Cyear%E2%80%9D%20of%20the%20main%20narrative)
[\[22\]](https://emshort.blog/category/quality-based-narrative/#:~:text=To%20track%20where%20the%20player,tracked%20several%20different%20progress%20stats)
[\[23\]](https://emshort.blog/category/quality-based-narrative/#:~:text=Storylets%20encourage%20narrative%20designers%20to,one%20another%20in%20memorable%20ways)
[\[24\]](https://emshort.blog/category/quality-based-narrative/#:~:text=Thanks%20to%20these%20abstractions%2C%20one,affect%20what%20happens%20in%20another)
[\[25\]](https://emshort.blog/category/quality-based-narrative/#:~:text=,fictionally%20and%20mechanically%20interesting%20ways)
[\[27\]](https://emshort.blog/category/quality-based-narrative/#:~:text=This%20is%20still%20a%20fairly,the%20protagonist%20with%20unspeakable%20visions)
[\[28\]](https://emshort.blog/category/quality-based-narrative/#:~:text=level%20to%20be%20able%20to,end%20of%20year%20spelling%20bee)
[\[36\]](https://emshort.blog/category/quality-based-narrative/#:~:text=,fictionally%20and%20mechanically%20interesting%20ways)
quality-based narrative -- Emily Short\'s Interactive Storytelling

<https://emshort.blog/category/quality-based-narrative/>

[\[32\]](https://intfiction.org/t/different-styles-of-qbn-storylet-game-design/78077#:~:text=strands%20that%20can%20progress%20independently,array%20for%20the%20most%20impact)
Different styles of QBN/storylet game design - Other Development
Systems - The Interactive Fiction Community Forum

<https://intfiction.org/t/different-styles-of-qbn-storylet-game-design/78077>
