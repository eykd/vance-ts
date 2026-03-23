---
title: "Starship Grid+"
date: 2014-05-06
url: https://projectperko.blogspot.com/2014/05/starship-grid.html
labels:
  - construction
  - gameplay
---

## Tuesday, May 06, 2014 


### Starship Grid+

A few days back I posted a video about how grids, voxels, and Minecraft-style bricks aren't well-suited to ship design.  
  
Fundamentally, voxel- or grid-based play is about either controlling flow or ordering a chaotic topology, neither of which are concepts starship games use. I caught a little flak from Space Engineer fans, because Space Engineer almost sort of kinda makes a vague attempt to be about controlling flow. Theoretically, in the future, Space Engineers could be about controlling flow and then their construction method would work well.  
  
But I thought a little about the other half of the equation: grids are also useful for organizing chaotic topology. Could we make a starship construction system out of that?  
  
My idea is that you start with a large-scale grid, a 3D grid where each tile is something like 10x10x5m. You can put all sorts of stuff in there, use mirroring, and all that good stuff. Not every module is 1x1x1: many modules are more awkward shapes that aren't even cubic. For example, a particular engine might be shaped like a pyramid, growing larger and larger as it goes further back.  
  
Some modules can also be arbitrarily extended, such as interior deck space: a long wafer of starship would be a deck, and you could drag it to scale it longer or wider, each "tick" of "wider" or "longer" being one tile unit. You wouldn't make them taller, though: if you wanted another deck level, you'd attach another deck wafer. You could shape these to "hug" the complex shapes of the core functional modules.  
  
Within each deck wafer there is a smaller grid, something like a 2m grid. This grid would be 2D simply because handling it would get too complex otherwise. Within this 2D space you can place various rooms and facilities that are intended to be pressurized, such as bunks, kitchens, gardens, hallways, doors, airlocks, cargo closets, atmospheric exchangers, etc. The large grid means there would be a 5x5-tile "fine grain" grid per large-scale tile, but it wouldn't be a simple 5x5 grid: each kind of deck wafer might have a different shape within that space, and a different reaction to being expanded in various ways. At the minimum, most of the edges would be covered in a hull tile, excepting for occasional spots where you could run a hallway through to another area or put in an airlock.  
  
By giving the deck wafers an internal layout and having it depend on the gross layout of the ship, you create a complex topology inside the ship. The player is then challenged to put the facilities inside that space not simply according to what space is available, but also with concerns as to where the halls are, which parts of a room can have maintenance access to an automated system, which areas should be restricted to what kind of security level...  
  
The best part about this approach is that it could easily be turned into a functional map, where the player moves through that space. Whether in 3D or 2D, the player could be made responsible for his decisions - forced to access the automated systems that were hidden behind someone's wall, forced to traverse the length of the ship, forced to search for a stowaway in all the nooks and crannies, fight a fire, whatever. Leaving the pressurized areas of the ship would be possible, but only if you put on a bulky space suit and not in situations where the ship is accelerating, being bombarded by radiation, or so on.  
  
You can actually use this more deeply, too. While there would undoubtedly be a lot of stock parts, something like a reactor would also be made up of an interior grid. If you wanted to make your own, you could get a particular shape of chassis and put reactor parts into it. Reaction chamber, coolant, control computers, power station, and so on. In doing so you could create a reactor of your own design. This may be a bit complex - for example, if you create a chain of power stations, is that better than just having one? Depends on your application! And, of course, you may have to repair or resupply it during gameplay, so be sure to lay it out reasonably!  
  
Similarly, you can go finer-grain. You don't like the default cabin? Well, each 2x2x3m fine-grain tile consists of a 2x2x3 grid. Place things inside that - walls, furniture, functional elements. Newly researched technologies, epic cultural artifacts, whatever. Now you have a custom room.  
  
You could go even finer, allow the player to construct individual objects using a more typical voxel grid system, then determining the bounds of the object for inclusion into the room editor or equipment system.  
  
Now, just laying out the ship like this is pretty ugly. Ships locked to a large grid layout are generally brutish and bland. A fine grid can work out because you can sculpt it somewhat, but when the grid is 10x10x5m, steps and sweeps are not as feasible. Rather than force the player to carefully create custom shapes for every time they don't like the flat brick approach, we allow the player to warp objects. Each object has a spine and each node in the spine can be moved out of alignment to warp the whole object along a spline. This is really not hard, it's a simple envelope deform.  
  
This offers a number of advantages aside from looking nice.  
  
The first is that a single, continuous object is both cheaper and more durable than the same amount of space using different objects. Rather than breaking your ship up with a deck wafer here and there and there, having one deck wafer that bends to be in those spaces is much more efficient.  
  
The second is that attachments inherit rotation from their root. So if you have a bent deck or module, the item attached to it will be arranged along that tangent or normal instead of the global one. This allows for things like angled wings, huge solar arrays that don't collide, and other grid-breaking alignments.  
  
The third is that a lot of modules are awkwardly shaped due to the requirements of their construction. IE, since particle accelerators have to be arranged in strict lines, your fusion reactor has long-ass prongs coming out of it. By warping either the reactor or the modules passing nearby, you can dodge and weave to keep your ship tightly designed. While there's no penalty for having spidery, sprawling ships, since you have to actually move through them during gameplay it's often hugely advantageous to have a more compact ship.  
  
More interestingly from my perspective, warping the spine of the object also warps the fine-grain mesh within the object. If you've got a deck wafer that is curling right, the outside grid tiles are going to be much larger than the inside grid tiles. Most things can't be compressed that much: if you have a kitchen, you could put it on the outside track and it'd be a more spacious kitchen than normal, which is nice. But if you put it on the inside, you wouldn't even be able to fit a human inside that crushed space, so you can't place a kitchen there.  
  
So the curling introduces a new kind of topological challenge. Put hallways on the inside track, because they are okay with being crushed. Don't bend things like reactors too sharply, because some of the interior components will be crushed and the reactor will not work... but, on the other hand, some reactors might be okay with being warped in one direction but not another, or you could design your own with the final warping in mind from the start.  
  
Of course, as we can go finer-grain, we can also warp finer-grain.  
  
This doesn't matter much for rooms like staterooms, which are probably something like 2x2. Warping really only works if you have something much longer than it is wide - for example, a hallway, or a row of hydroponic plants. Why would you ever want to warp one?  
  
Fundamentally, these long rooms are very much like the deck wafers: you stretch them longer and longer to get more space and performance. There's an overhead with each room, and by simply extending them you save a lot. For example, a hydroponic garden uses 5 space watts plus 1 space watt per tile. The final tile on each end of a hallway is a bulkhead tile, which costs 3 space credits extra and also can't have rooms attached.  
  
If you draw a zig-zag hallway, you end up with 3 hallways and 4 bulkheads. However, if you draw a single long hallway and warp its spine to move from one side to the other, you have only 1 hallway with 2 bulkheads. Of course, this doesn't turn as sharply, so you do end up obstructing some tiles that would have been available otherwise, so it's up to you whether that's worth it. Is it worth saving 6 space credits? It could end up being more than that, depending on how much zig-zagging you need to do.  
  
You can also warp items that you create. Are you creating a custom chair out of voxels? Sounds great! No reason to make it all one object, though. Why not model the back of the chair separately, then add it into the editor and warp its spine so it has a graceful curve to it? Looking to make a fancy shirt? Why not warp the edge between two colors, or create a graceful scoop neck instead of a blocky square-neck.  
  
In these situations, the spin might not just warp: it might also bulge, allowing you to grow or shrink the radius of the voxels in that area. Want to shape your character? Resize the arm spines for bulging biceps. Creating an alien? Stretch out the neck and then give it ominous bulges.  
  
This also works in tandem with the recent idea of the Starship Vignette. If you design a starship with retrofits programmed in right at the start, then your ship's shape needs to be able to handle new modules in new shapes. By warping them cleverly, you can allow your ship to handle several different engines or whatever by making sure they're in the right place to attach properly, and out of the way of the prongs. You can try to get around this by just building sprawling ships, but it'll be really awkward and still might not work any better than reshaping things better.  
  
...  
  
Of course, all of this is just a thought experiment. The content required to create such a game is pretty significant, and I'm working on For SCIENCE at the moment. However, I'm confident in the technology: I've created many demos in Unity where you warp meshes via envelope spline deforms, and they work fine. The game doesn't require any magical AI or anything. It's roughly as complex as Space Engineers or Kerbal.  
  
Even though I don't specifically plan to make this game, I wanted to post it as an example of how you can stretch the concept of construction further than most people think.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:14 AM](https://projectperko.blogspot.com/2014/05/starship-grid.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4332846842861961550 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4332846842861961550&from=pencil "Edit Post")

Labels: [construction](https://projectperko.blogspot.com/search/label/construction) , [gameplay](https://projectperko.blogspot.com/search/label/gameplay)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4332846842861961550)

[Newer Post](https://projectperko.blogspot.com/2014/05/fun-damage.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/05/starship-vignette.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4332846842861961550/comments/default)
