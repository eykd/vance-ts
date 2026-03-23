---
title: "Abusing the Pipeline"
date: 2015-06-29
url: https://projectperko.blogspot.com/2015/06/abusing-pipeline.html
labels:
  - game design
  - modding
  - mods
  - player-generated content
---

## Monday, June 29, 2015 


### Abusing the Pipeline

One of the things I've done a lot of work on is allowing player content - whether through mods or in-game creation tools. More and more, I've come to think that in-game creation tools are not an efficient way to do it. I mean, if you can manage it, sure, but there are a lot of reasons to avoid in-game creation tools.  
  
First, they are effectively duplicating tools. If you use Unity or Unreal, those come with powerful content and scene editors. Creating an in-game editor literally duplicates that functionality. It's far more efficient to allow players to create their content in Unity or Unreal, and then distribute those packages. Giving your players a subset of the game that they can open in Unity or Unreal is a powerful idea.  
  
You have to adjust your pipeline, teach modders to pipe output to an import-friendly asset pack. Unity makes that pretty easy. Not sure about Unreal. But compared to recreating the entire editor and save system, creating a runtime compiler, bugtesting... well, it's much easier to teach a modder to create asset packs than all that!  
  
But that got me to thinking. Once you think about using Unity or Unreal as a mod creation platform, you start thinking about the asset pipeline into them. And out from them.  
  
There's a lot of potential here, I'm just starting to wrap my head around it. Let's start with the basic act of creation.  
  
We're creating star ships. We create them in the Unity editor. As a player, we use the Unity editor. We find the various prefab starship components we want - engines, generators, chairs, beds, landing gear. We put them in the scene, tie them together as a new prefab, maybe rig the system to point to itself in various ways so that, for example, the turrets can't turn on if the landing gear is down.  
  
Export the resulting prefab (or pack of prefabs, maybe you built a fleet) into an asset pack. Share the asset pack with whomever you like, and suddenly it's in our game, Space Ranger Example Game 2000. Your ship is in the game, performing quite well. The turrets only turn on when the landing gear is up, the engines draw power from the reactors and push the ship around, it's all great.  
  
This allows players to build starships without a grid. They use Unity's powerful tools (including optional grid-snap or vert-snap) to lay their ship out with incredible freedom. Collision boxes are automatically computed.  
  
This allows players to build custom variants. New materials. Different animations. Just swap that stuff out and the custom variants will get included in your asset pack, free from any chance of collision with other animations and materials from other star ships.  
  
It also allows players to build custom code or UI, easily packing it into the asset pack. If you want to use AntiSpaceRanger's Cool-Ass-Holographic-Ship-UI, just throw it in and it'll be included into the prefab, whether or not the next player down the line downloaded ASR's CAHS-UI on their own. Create your own UI, if you like.  
  
But... this is not the limit. Not even vaguely.  
  
See, since you're using Unity or Unreal, you can import new assets. A new Blender file. New sounds. New video clips. New textures. Let's focus on Blender.  
  
Your starship can be any shape using the prefab starship components. You can scale them, tilt them, place them in any way you like. But there's no reason to limit yourself to those prefabs, especially when it comes to interiors or complex, smoothed hull shapes.  
  
Why not take to Blender (or Maya or whatever)? Use the library file included with the modder package, and you can import those prefabs into a new Blender file, arrange them in Blender, scale them in Blender. Save it, and in Unity, a finished ship will pop up. A minimal amount of processing can match the Blender objects to their identically-named prefabs and swap them out in the ship prefab - essentially translating your Blender file into the exact same ship you would have gotten by dragging and dropping Unity prefabs.  
  
Except...  
  
You can add more things in Blender. A hull that is any shape and texture you please. New animations. Skeletons. Unity understands all these things, and we can process some of them into game logic - for example, our custom hull elements can be correctly classified and prepared for damage effects.  
  
How far the modder wants to go is up to them. A new animation controller. A ship that flexes and ripples like an organic creature. A ship that grows or shrinks on command. There's a lot of possibilities, limited only by how well the game code copes with weird-but-valid Unity objects.  
  
The ability to shape your own hull really can't be overstated. Passive elements such as rails, running lights, steps, windows, and simple smoothed hull elements are incredibly valuable to the average person. Voxel-based approaches give you some freedom, but there is absolutely nothing like being able to arrange them freely. That requires us to be able to distort and reshape them - something that is easy in Blender and extremely annoying in Unity.  
  
A long, curving hand rail is easy in Blender. Import the hand rail object, stretch it, and curve it. Fit it to your ship perfectly. Unity imports it and it's in your ship! Bang!  
  
More than that, assuming your naming convention is good, Unity understands that it is a hand rail, and will use IK to have nearby astronauts automatically slide their hands along it. That's super-easy, I've done adaptive animations like that a lot. You just need to have the object properly tagged!  
  
(Making custom spaces feel real is incredibly important - I would pay special attention to making adaptive character animations, including things like turning sideways to move through tight areas or stepping easily to the side as you approach furniture.)  
  
Pretty neat, right?! RIGHT!?! yeah.  
  
...  
  
Oh, right, I forgot the other half.  
  
It's possible to make game assets viable to import into any similar game. SREG2000 assets could be imported into Shooty-VR-Game-Ultra. The only limit are class and library dependencies built into the asset package.  
  
It is possible to minimize library and class dependencies by having the ship focus internally. While it's unlikely the same asset pack would load up in both SREG2000 and SVRGU, it would be relatively easy to import SREG2000 content into the SVRGU mod editor (both Unity projects), then winnow out the dependency errors and re-rig the ship for SVRGU use. The core - the meshes, materials, animations, etc - would be the same.  
  
It is possible to create a database of, say, complex space ships. Not simply models: high-functioning ships that contain dozens of internal logic objects. For example, a class that opens and closes a hatch when triggered. A class that runs a specific trigger name on someone's mecanim animator if activated by them. A class that displays the state of that hatch. Because these classes are internal to the ship, there's no real chance of them colliding with game logic. Therefore, these classes can be packaged with the prefab, or packaged with the core idea of the mod editing system for both games.  
  
Sounds interesting!  
  
And, more importantly, sounds viable. Even if you remove all of the advanced features, simply allowing players to create new prefabs out of stock prefabs is incredibly powerful, especially if you can wire components together with references and events and delegates.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:49 AM](https://projectperko.blogspot.com/2015/06/abusing-pipeline.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4045604723515188678 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4045604723515188678&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [modding](https://projectperko.blogspot.com/search/label/modding) , [mods](https://projectperko.blogspot.com/search/label/mods) , [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4045604723515188678)

[Newer Post](https://projectperko.blogspot.com/2015/06/medieval-misstep.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/06/heights-of-engineering-and-soft.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4045604723515188678/comments/default)
