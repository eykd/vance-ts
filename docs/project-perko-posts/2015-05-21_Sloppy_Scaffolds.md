---
title: "Sloppy Scaffolds"
date: 2015-05-21
url: https://projectperko.blogspot.com/2015/05/sloppy-scaffolds.html
labels:
  - game design
---

## Thursday, May 21, 2015 


### Sloppy Scaffolds

Sloppy scaffolds is a way to construct in-game objects, similar to the "voxel" grid method used by Space Engineers, Minecraft, etc.  
  
But while voxels are optimized for terrain, sloppy scaffolds are optimized for functional objects such as bases, starships, plants, and equipment.  
  
The key to this system is mesh distortion. Using relatively simple math, you can scale and bend any mesh. This is what bone animations do, it's really straightforward.  
  
Let's say we're building a base using sloppy scaffolds. The constraint is that we don't build using walls or floor tiles or other basic components: we build using a defined "interior space" form. It's a tube, and we paint it onto the ground with our mouse. The tube becomes a line of connected nodes which can be independently manipulated to create larger and smaller areas, bend the tube in various ways, and so on. Although it is logically a "tube", in this case it is a boxy shape, a wide one-story building.  
  
The tube is actually a pair of meshes. One fairly narrow "rigid" mesh, which contains hardpoints. This can be scaled and rotated, but not bent. Between the rigid meshes is the "flexible" mesh. This creates a fluid curve between rigid mesh elements, and can repeat itself if the gap between the rigid meshes is quite long. Depending on the tube, it may have several sets of rigid meshes that alternate or change on demand, and it may have distinct outward-facing and inward-facing rigid meshes.  
  
The hardpoints are where we put our doors, windows, and walls. We fill the inside of our tube with all the things that either break up the tube (interior walls) or allow access (doors/windows). The hardpoints can also have "logical sets" mounted on to them, which allows us to create internal rooms of various sizes and shapes, and those rooms have furniture mounting points on them. In this way, you can decorate your tube.  
  
Of course, one tube is not enough to make a base with.  
  
For example, let's say you're building a base. Your instinct might be to create a really wide spot in your tube for a complex area - like you want a dorm with bathrooms and a lounge and it's all got to fit in this spot. But there's no interior rooms that break up the space right, since they're all quite simple. What do you do?  
  
Well, you paint another tube. But instead of painting it onto the ground, you paint it onto the exterior hardpoints of the first tube. The new tube automatically configures itself to match the first tube. The hardpoints aren't taken up, either: your doors and windows now go from one tube into the other.  
  
The new tube might be constricted. If you have an arc on the outer tube, the inner tube will be compressed down. If there's still space between the hardpoints for the flexible mesh to connect them, it's fine. But if the hard points collide or are shifted too dramatically, you suffer a "break". A break means that a hard point is deleted, and the connective mesh fills the gap. This will fluidly reduce the number of hardpoints as you paint on more tunnels. Similarly, if you're on the outside of the curve, you'll be stretched. This will never cause a break, but you can add in a new hardpoint that isn't reflected to the other tunnels.  
  
Basically, this is not a rigid grid. The curves do not march lockstep, since the tubes can be expanded and contracted. The curves do not necessarily have the same number of hardpoints.  
  
Now, all of this might not matter if all you're creating is a floor plan. Why add all this complexity for a floor plan?  
  
Let's take it into space. Your interior spaces are now pressurized spaces. You can mount engines and reactors onto those external hardpoints, and there's and "engineering" tube which can have tanks, reactors, and heavy engines mounted within it. What's good about this approach?  
  
First off, by scaling the tunnel you can very nimbly scale the interior mounts. If you need more fuel, make the engineering shaft wider or pull the hardpoints further apart. More thrust? scale up the spot where you put the engine. Want optimal exterior mounting? Shrink the engineering space down and stick on some exterior stuff like solar panels or batteries.  
  
Let's say your core tunnel is a spent on shared spaces and cockpits, and then the central shaft becomes engineering. You want to add in habitation space, gardens, etc, so you paint a tube onto the core shaft, and mirror it for good measure. You could just leave it aligned, but the engines produce a tremendous amount of heat and vibration. So you pull the habitation tube off of the main engineering tube at the back, and then curve it out and away into a fishbone shape. It's still connected at the front, integrated into your shared space, but then it strikes off on its own.  
  
This is the heart of the "sloppy scaffold": the scaffolds stick together when it makes sense, but can also be pulled apart. They can be split up and rejoined and all sorts of combinations.  
  
This is only possible because each scaffold element is "walled". You are never asked to put down A Wall Block or A Roof Block. Instead, you put down bounded areas. So attempting to figure out contiguous space, pathing, and pressurized area is really easy. Each segment is much more expensive than a voxel, but since it covers a lot more logical space than a voxel, it's fine.  
  
Collision detection seems like an issue initially, since a grid is a lot easier to detect collisions on. But it's really not so bad, since the scaffolds break into a bunch of simple bounding boxes. And since the scaffolds only interact at merged hard points, the exact nature of nearby elements is unimportant.  
  
The last piece of the engine is the wiring system. You have scaffolds. You have modules such as engines, solar panels, and chairs. And then you have cables.  
  
Cables run between hardpoints much more freeform, and can spiral off into space or whatever else you need them to do. They are always 1-1, no splitting or splicing, so it's pretty easy to keep track of them. And their whole point is to connect two things in different places together. Maybe this is a pathway, like running hand rails along the outside of the ship. Maybe it's a water supply pipe, providing living spaces with liquid. Maybe it's a data line, piping data from one place to another. These are important to allow us to create connectivity, since our constraints reduce connectivity dramatically.  
  
Now you know the basic idea, but you're probably not sold on why it's better than voxel. It's probably not worth that much effort just to get smoother lines, right?  
  
Well, there's a big power hiding inside this concept. See, since the scaffolds can flex... the ship can flex.  
  
Let's say we built that wishbone-shaped ship. However, that's the configuration we want it in during travel. When it's parked and the engine is off, we'd like those wishbones to come together around the engine. This protects the engine from micro-impacts and also allows us to travel easily between the two wings.  
  
In a voxel system, you'd have to do some noxious hinge crap, break the ship into several different voxel grids, and then suffer through physics simulations. Even then, it wouldn't be very fluid: the pieces would all be broken apart logically, no connections allowed.  
  
In our case, we can simply recalculate all the meshes. Connectivity is maintained: the whole scaffold bends organically, like an octopus limb. Rooms may distort, but assuming there is no breaking due to compression, nothing would really change. Connectivity is maintained outside of the mesh as well, with the cables remaining connected, no complaints. Connectivity on attached scaffolds works as well: attached scaffolds are also recalculated and fluidly reshaped.  
  
Tweening between the two states is also very easy, meaning that it's not a huge problem to animate the shift.  
  
This same operation can be applied to the girth of the scaffold, increasing or decreasing its size. For example, if you want an inflatable habitat, or perhaps you have a docking area and you want to open wide to receive a ship then close down to keep it safe.  
  
The shape of the ship matters, and the ideal shape changes depending on exactly what phase of what mission the ship is on. We might close around engines when we aren't using them. We might extend a spiral of solar panels if we are near a sun. We might move habitable areas away from a radioactive reactor before we turn it on.  
  
Changing the shapes of these ships is normally done on a mission basis, rather than a physics basis. This system is not optimized for physics. So the flex of the pieces as you crash into an asteroid? That'd be expensive to calculate. But switching everything over into "asteroid drilling" mode? Simple!  
  
And why not toss in which things are turned on or off or have their settings changed in this mode? Then you can calculate all the performance of all the ship's pieces, and know exactly how much the engine vibration will affect the crew's downtime, or how slowly the ship has to travel to avoid sending a docked ship crashing through the back wall.  
  
This combines well with overall world optimization. If you have ships where you know the configurations it can be set up into, and you know the stats associated with each configuration... then just load that. You don't need to simulate the ship, you just need to know its performance. Similarly, if you know its performance, you know how fast various resources are changing, and you can set up events to happen when certain amounts are reached. You don't need to simulate the systems every round, you just need to set an event to happen at a certain time, when a resource meets a specific threshold. Some of those can be automatic - running out of fuel, for example. Some can be player-created - customized missions that happen without the player's direct control. Some might be best-guesses based on the crew's default behavior.  
  
Anyway, you can tell that this system is optimized for systems rather than physics. While there might be some physics simulation involved, primarily this responds to environmental threats or direct damage rather than things like flexing or detecting collisions. It's not really any worse at those things than a voxel system, but voxel systems are really bad at them, too. Instead, I'd like to focus on having dozens or hundreds of active objects running at all times with no slowdown. So it's all about the ops: bake the physical layouts into operational details, and use those to quickly block out performance on missions. Basically: turn the physical ship into a spreadsheet.  
  
And if the player can define configurations and missions... they can define stories. They can define an explosion on deck 3 happening at a specific time. They can define a surprise message. They can define a crewmember getting sick, or how crewmembers file in and out of the crew quarters each day. Big or small, this allows players to craft and share scenarios.  
  
...  
  
Well, that was talking about ships. But sloppy scaffolding is useful for more than just ships.  
  
Let's say we're defining alien life forms. It's super-easy to use sloppy scaffolds.  
  
A tree is just a hard wood scaffold with more hard wood scaffolds springing off of it, and twigs attached to those hardpoints, and leaves attached to those. Defining how it is exactly laid out and changes over time is annoying, but it can be done: the life cycle of the average tree, defined in the same way you define a ship transforming into "idle" mode or whatever.  
  
Things that want to animate are a bit more difficult, because computing meshes on the fly is expensive. For example, a mammal would be easy to define using sloppy scaffolds, and it'd be easy to make them vary by simply changing the exact scale of various scaffold elements. But a mammal wants to run around and stuff.  
  
The only realistic way to approach that is to have a core skeleton and then map the scaffold elements to it. This would be similar to Spore's approach, and it'd require a lot of work. But...  
  
What about gear?  
  
Let's say you want to let someone design their own exosuit for missions to distant worlds. You already have a base shape that is mapped to various bones and has various animations. Now it becomes relatively easy to animate: when you paint a scaffold onto the surface of the character, it maps to the bones the nearby mesh verts map to. And if you paint a scaffold onto that scaffold, it maps to the scaffold's map. This creates a simple, fluid way to create (puffy, mechanical) gear. And, as with ships, the scaffolding comes with functionality and hardpoints - meaning you could vary its purpose wildly depending on exactly how you build it.  
  
Now, if your gear has multiple modes, it can shift between those modes exactly like a space ship... while remaining tied to the same bone animations. This means you could shift between different preset configurations *while animating the base character*. Want a fold-out jet pack? Sure!  
  
...  
  
Anyway, I really wanted to come up with something that wasn't as rigid as voxels. Allowing things to remain connected while moving gracefully was a big concern.  
  
I don't see any huge issues with the core idea. Some of the advanced stuff has some hurdles - especially designing clothes - but overall it seems relatively promising!

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:55 AM](https://projectperko.blogspot.com/2015/05/sloppy-scaffolds.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3861922371768801588 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3861922371768801588&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3861922371768801588)

[Newer Post](https://projectperko.blogspot.com/2015/06/unbounded-construction-emerging-genre.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/05/mission-based-iteration-vs-survival-mode.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3861922371768801588/comments/default)
