---
title: "Voxel Parkour"
date: 2015-02-05
url: https://projectperko.blogspot.com/2015/02/voxel-parkour.html
labels:
  - game design
  - parkour
  - voxel
---

## Thursday, February 05, 2015 


### Voxel Parkour

Let's talk about parkour voxel games!  
  
This will have two parts. One: technicals of parkouring on voxels. Two: Why the hell would we use a voxel game?  
  
Most parkour games are magnetic. Setpieces are put in the game world specifically to attract your parkouring, and if a jump looks a bit risky, your character will usually snap to the target in a very forgiving manner. This is because parkour is all about judging distance and speed, but in the average 3D world it's a bit difficult to do. So they simplify it by making a pretty clear dividing line between "obviously OK" and "obviously not OK".  
  
In a voxel world, you can read distance and speed pretty well, out to about 6 or 7 bricks. So if your jump is 3.5 bricks, you'll quickly be able to determine whether you can make it or not.  
  
Nothing is ever simple, though, because that's when you're running orthogonally. If you're running across the blocks diagonally, the actual distance is much harder to judge.  
  
Well, that's not actually a problem. When a distance is near their jump limit, players will naturally align themselves square with the jump - IE, orthogonal. The only times players will jump at an awkward angle is when they're pretty sure they'll make it and don't need to try very hard. So there's no need to restrict the player to orthogonal movement like in the original Tomb Raiders - we can just assume the player will square off naturally if a jump looks difficult.  
  
There would still be some gotchas - like a knight's move jump, for example. But in general, that'd work, especially if ledge grabbing is pretty forgiving.  
  
In these case we've been talking about jump distances of 3.5 bricks. That sort of implies the bricks are quite large - perhaps a cubic meter. That's larger than an average voxel game.  
  
Well, the smaller the bricks (or the longer the jumps), the more difficult it is to read distances and the more complex layouts become. Large blocks are easy to read, so in this world that would be the voxel size. Of course, you can add a lot of complexity to that. For example, design your own blocks using cubic centimeter voxels to build a cubic meter voxel. Or have 'small voxels' for things like chairs and books and stuff, but if you use them, that voxel becomes too cluttered to run through and the character either trips or slows to a walk - basically, if you shrink the voxel size, you necessarily shrink the player's mobility to match.  
  
Anyway, there are other technical concerns when building a parkour game - parkour moves, inertia, camera motion, etc. However, none of those seem particularly voxel-centric, so let's gloss over them and move on to WHY?  
  
...  
  
Why build a voxel parkour game?  
  
In general, you can think of a parkour game as oscillating between linear and exploration segments. Something like Mirror's Edge is mostly linear segments, with exploration limited to finding the path the developers allow you to take. Something like Crackdown or Assassin's Creed is mostly exploration, with the only linear sections being challenges or you trying to get through an area as quickly as possible because you've been here before.  
  
As you might expect, if a game has more exploration segments, then the game needs more things to find. Crackdown and Asscreed are both littered with collectibles, side missions, and random encounters, as are most games with an open-world feel.  
  
The old Tomb Raider games took this another direction: they were primarily exploration, and there were certain collectibles to find, but the core thing to explore for was puzzle solutions. This has fallen by the wayside in recent years, because nobody likes spending time thinking about how to do something... but in our voxel game, it might be worth reconsidering.  
  
See, the strength of a voxel game is player-created content. Voxels are very easy to comprehend, and players can place them in a straightfoward way. However, a player's capabilities are limited: they can only visualize so many blocks at once, and the UI only allows them to place blocks in certain ways. Minecraft's relatively small voxels may seem like a strength, but they are also a weakness: the scale at which most players build is quite small. Most players never build anything larger than a medium-size mansion. It's just too annoying. If you're going to build something bigger, you usually use a tool assist to make it easier.  
  
Obviously, all of this varies. But the point is that if we want a parkour game, we have to allow player creations to be large enough to be fun to parkour. A single player needs to be able to create a small city, so that visitors can parkour on it.  
  
In just raw voxel terms, using larger voxels is a big help. Tomb Raider's original voxels were about 2m on each edge, which is probably about right if we want players to be able to create cities... but it requires a huge variety of voxels. Walls that are two meters thick are absurd, and ceilings that thick are doubly so... which means that the voxels would have to be complex baked objects. This is a "floor and wall and ceiling" voxel. And it's cousins for every wall configuration. And windows. And doors. It gets really complex.  
  
I think the best solution is to use a "voxel chunking" system. This is pretty straightforward: voxels might be, say, 25cm per edge (about a third of a Minecraft block), but you have to lay them down in 10x10x10 chunks (2.5m, about the size of one floor of a building). When you're in "build mode", the system highlights each chunk boundary with maneuverability by simply looking at the voxel layout. If the top edges are filled out with solid voxels, it can be ledge-grabbed. If the remaining 8x8 top blocks are filled out, it can be run across. If a subset of that is filled out (say, 4x8), it's a narrow beam which can be slowly walked across. If it's a subset of that (say, 3x3), then it's a point that can be stood on, but it's jump-on, jump-off. The walls determine your wall-jumping and wall-running capabilities, but the interiors of the voxel are wholly unimportant to the parkour engine. If you enter into one of these blocks, you stop parkouring and start walking slowly, and collisions are determined at the smaller scale.  
  
A bunch of physics heuristics can also be applied, chunking your 10x10x10 object into a particular combination of pressure points, mass, and rigidity. That's optional, but it's always nice to have a powerful simplification available.  
  
From the player's perspective, this voxel-chunking system works in a different way. Rather than "building up" your house, you "build down" your house. You place solid 10x10x10 voxels of the material you like, and then you clear away the insides using simple tools that clear away specific surface sizes. So you block out your world, then hollow out the areas you want hollowed out, and then you edit per-voxel. Unlike Minecraft, there wouldn't be a whole lot of special-case voxels, because our detail level is high enough to let the player craft chairs and windows and such without having them prefabricated.  
  
We can also have shortcuts pretty easily. For example, if you block out a building then assign an NPC to finish its construction, the NPC will intelligently carve out the interior, create windows and doors and interior walls and furniture etc. Different NPCs might have different preferences, or if multiple NPCs are assigned the same building they might carve out pieces in different styles... there's lots of fun options if we want to spent some time creating algorithms for helping the player.  
  
All of that complexity boils down to a surface simplicity. When the player is dashing, all they care about is which surfaces are solid. But when a player is not dashing, they can enjoy the complexity of the high-detail regions.  
  
Building large is good, but exploring that world needs to have benefits. You want things to do and to find.  
  
Sometimes, the player will place things to find or do - players will certainly enjoy creating dungeons full of traps and puzzles. However, I think players should also be allowed to nurture these into existence.  
  
If a player builds a city, I'd like to see that same player dashing through the city, climbing, looking in alleys, peeking in subways and homes. And to incentivize that, I think the structures players build need to exist as more than empty buildings. I think NPCs, plants, and animals need to inhabit this world.  
  
When you assign these things to live in your various creations, you do so with the understanding that after in-game time passes, they will create some useful resource. Fruit, magic essence, books, leather, whatever. But the rules as to how they appear and how they stack can be varied and interesting, meaning that as you become better at the game you'll learn to create more efficient housing, more interesting machines. And dash through them.  
  
By making windows and streets an important part of whether an NPC is happy, you can make players block out cities rather than giant warrens. You could also introduce structural limitations - building out of stone or wood could result in specific stresses and buildings could collapse if built too tall or spidery... well, it could be really fun to experiment with the various restrictions and what sort of complex, parkourable structures arise. Especially if you start mixing together player content semirandomly into large, shared cities...  
  
Well, add to that some kind of mechanical/electrical thing, and you have quite a game.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:46 AM](https://projectperko.blogspot.com/2015/02/voxel-parkour.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6312589719936677981 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6312589719936677981&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [parkour](https://projectperko.blogspot.com/search/label/parkour) , [voxel](https://projectperko.blogspot.com/search/label/voxel)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6312589719936677981)

[Newer Post](https://projectperko.blogspot.com/2015/02/creating-stories.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/01/suitably-casual.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6312589719936677981/comments/default)
