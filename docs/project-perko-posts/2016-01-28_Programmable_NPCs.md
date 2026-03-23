---
title: "Programmable NPCs"
date: 2016-01-28
url: https://projectperko.blogspot.com/2016/01/programmable-npcs.html
labels:
  - base building
  - construction
  - game design
---

## Thursday, January 28, 2016 


### Programmable NPCs

I love programming games. In theory.  
  
In practice, programming games are too esoteric, too separated from anything that feels meaty and fun. In the real world, the "programming" games I love run without any programming at all, and I wedge programming in for extra fun. Kerbal, Space Engineers, and so on: all work fine with no complex staging or programming.  
  
I've been analyzing the concept. Thinking a lot. I think what we need is a way to allow the player to program easily and freely, but more than that, to smoothly slide in and out of non-programming, full-programming, and simple scripting elements.  
  
What do I mean?  
  
Imagine a game like Minecraft or Medieval Engineers, except that you have an unlimited number of NPCs to help you out. The idea is that they can help you build, operate, and maintain your world. You can create villages and so on and so forth. But the implementation is more open-ended: these aren't people with set jobs. They're state machines.  
  
There are a few ways to let players program NPCs. Since AI is complex and depends on wrangling thousands of inputs, most of those methods revolve around picking big chunks of functionality. This NPC is a guard. This NPC is a farmer. This NPC lives here. This NPC lives there.  
  
Let's turn that around a bit. The big difficulty is the huge number of inputs. NPCs need to analyze the terrain, their resources, threats and opportunities, their tiered goals, pre-established schedules, the weather, their equipment, alert/damage states... programming for all these things is why AI is normally supplied by the dev rather than given to the player to fuss with.  
  
But what if we stop thinking of an NPC as an independent agent? What if the NPC is considered as part of the player, augmenting the player's capabilities?  
  
Overlord was a good example of this, allowing you to point and send off your minions in a very easy, fluid way. However, those NPCs are a bit too simplistic and the gameplay was not constructive. Is it possible to do something like this, but with radically more complex, programmable NPCs?  
  
One challenge is how the player interacts with the world. For example, in Minecraft you can build a house, it's very constructive. But building the house is very low-constraint: you rapidly plonk down voxels in any configuration you want, and you can even have a physically impossible floating house without difficulty. Having assistants wouldn't help in this situation, because there's not really any pattern for the NPCs to work on. They can't tell what you intend to build based on what you have built so far, so they can't help.  
  
We could exchange the player's actions and require NPCs to execute them. For example, the player just puts down virtual blueprint voxels and the NPCs have to do the work. But this isn't any better at making complex, programmable NPCs, it just makes the game slower and the player unable to directly affect the world, both of which are bad.  
  
Instead, what if we designed our creative systems specifically to have patterns? Then, when the player starts to create, the NPCs would be able to predict what the player is doing and build as well.  
  
For example, if you build a road, you probably want to build another segment of road one road-segment along the path.  
  
The road example is an easy, clear example. Let's say you dress an NPC up in road-worker costume and link them to you. Now they follow you and read your activities as their input. When you build a section of road, they read your vector and the position of the road, and move one unit further in that direction and build another segment.  
  
Now you have augmented your power. When you build a road, two road segments get built.  
  
You can extend this. What if you link another 50 road workers to yourself? Well... they still only try to build one block along, so you still only have two blocks of road per one block you build.  
  
One way to fix this is to have them move N blocks ahead instead of 1, and then specify each individually. However, a more interesting option is to simply daisy-chain. The NPC's activities are also readable as inputs, so you make the second worker link to the first worker instead of you. And the third worker links to the second, and so on. Now, when you build a road segment, each worker moves along in a chain of single steps, and you can break the chain by simply unlinking the Nth worker.  
  
This works great, especially since there's an obvious physical representation of who is linked to who: a line. The workers form a line. All linked to you, they cluster in your wake as a chaotic mishmash. But daisy-chained, they stretch behind you like a conga line.  
  
Of course, this is really wasteful. In reality you only need one worker, as long as you're patient.  
  
See, like any Turing machine, our workers have an input stack - a "tape" to read. When we linked them to us, we simply put ourselves in the first spot on that tape. We can add themselves as additional entries on the tape, and tweak the road-builder state to move to the next input on the tape.  
  
This means that we build a road segment. This triggers them to build a road segment and also move their input tape, making themselves their own input. Since they just built a road, this triggers them to build a road and move their input tape... it's not an infinite loop because the tape eventually wraps back around to using us as an input.  
  
This works, but the worker will have to complete each segment before moving on to the next, which might be too slow for your taste. It's already a relatively interesting space, with tradeoffs built right in. We're touching on the concept of parallel processing, Turing machines, IO...  
  
Roads are an easy example, easy to use as a demonstration. But they are fundamentally pretty straightforward. While you might like a wider road, or a road that curves, it's pretty "flat" and there's no real constraints on it.  
  
So let's talk about walls.  
  
Rather than the physics-free voxel walls of Minecraft, what if our walls have physical presence, and roofing is actually a challenge? Sort of like Medieval Engineers?  
  
If we we want to build a three-high wall, it's not just plonk-plonk-plonk. We need to have the resources lying around nearby. We need to build a scaffold so we can reach the upper wall areas. We need to lift the resources up the scaffold. The player can do these steps on their own, manually, but it makes sense to use NPCs to help.  
  
For example, you build a wall, and then NPCs are set up to build a scaffold, lift resources up the scaffold, build a wall, build another scaffold, lift resources... you can do this with daisy-chaining, input cycling, or a combination of the two.  
  
To use only one worker, you would equip the worker with gear/clothes representing scaffold-building, wall-building, and resource-toting. You would make yourself the first notch in his input tape, then himself. The order of the states is determined by the order you equip the gear, so the last one on would be the scaffold-building equipment - say, a hat. He sees you build a wall, builds a scaffold - then moves the input tape (to target himself) and switches to the next state - hauling. He saw himself build a scaffold, so he now hauls materials and switches to the next state - wall-building. He saw himself haul materials, so he builds a wall, then loops back to the first state - scaffold-building. He saw himself build a wall, so he builds a scaffold, etc, etc.  
  
This kind of dependency simply makes the world more annoying rather than more complex, but it's a good example of the concept. In reality, the constraints I would want to introduce would be more than mindless busywork.  
  
For example, if you want to build a 20m-high wall, the wall material will tip over under its own weight. So you have to shore it up. You could simply build it thicker, but a clever designer will instead build it banded - some areas have large windows to lighten the wall, and others have flying buttresses and thicker columns. How about supporting the tall wall with scaffolding, knowing it will fall over when the scaffolding is removed... and then putting in crossbeams before removing the scaffolding?  
  
Multiphase and open-pattern construction are powerful features. Not only do they make programming the NPCs more interesting, they also make the world more interesting to inhabit. A skilled player will come up with interesting ways to build taller, wider, deeper, more interesting structures. Another skilled player will come up with a way to build hundreds of miles of structure, although perhaps not as impressive per meter. Yet another player will build something that isn't technically challenging, but feels real and inhabited because the NPCs are programmed to live life convincingly instead of build walls convincingly.  
  
I've left out some details. For example, location flags/vectors are pretty important, and I didn't mention them at all. I didn't talk about how to build or edit gear to perfectly suit your needs. I didn't talk about the idea of maybe building ships, or setting it in space. I didn't talk about harvesting and transporting materials.  
  
But I think I talked about enough. What do you think?  
  
I think the concreteness of allowing the player to physically build things makes the game easy to get into. Combined with easy basic state editing, the player can ease into the idea of telling a wall builder or stack of road workers to follow along and help them. The more complex powers of NPCs with multiple states, state tweaking, recursive NPCs - those can be left for the people who actually want to do them.  
  
Moreover, this makes for a truly excellent semi-shared world. Import a wall crew from your friend Alice, she's programmed them to build that 80m-high megawall wherever you plant a blue flag. Import a city from your buddy Barry. Import a ship - no, a whole shipping lane - from your half-cousin Chip. It can be done automatically, manually, or half-automatically (for example, an in-world "for hire" bulletin board).  
  
That's what I envision.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:38 AM](https://projectperko.blogspot.com/2016/01/programmable-npcs.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5792076324986956755 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5792076324986956755&from=pencil "Edit Post")

Labels: [base building](https://projectperko.blogspot.com/search/label/base%20building) , [construction](https://projectperko.blogspot.com/search/label/construction) , [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5792076324986956755)

[Newer Post](https://projectperko.blogspot.com/2016/03/multiplayer-and-fake-multiplayer.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2016/01/construction-genre.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5792076324986956755/comments/default)
