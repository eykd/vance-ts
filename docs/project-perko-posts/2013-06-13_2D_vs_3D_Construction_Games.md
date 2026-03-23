---
title: "2D vs 3D Construction Games"
date: 2013-06-13
url: https://projectperko.blogspot.com/2013/06/2d-vs-3d-construction-games.html
labels:
  - game design
  - world design
---

## Thursday, June 13, 2013 


### 2D vs 3D Construction Games

Recently I've been pouring out the Minecraftlike prototypes. I've tried all sorts of shticks, but the one which has the biggest effect is whether the prototype is in 2D or 3D.  
  
More specifically, it's about freedom of movement and scope of comprehension. 2D vs 3D is just the easiest example to draw.  
  
If you have a 2D game like Terraria, the camera allows you a huge amount of situational awareness. You can see all around your character, through ceilings and walls. On the other hand, if you have a first person 3D game, your situational awareness is extremely limited. This leads to good immersion, but it also makes it difficult to build things and manage large, complex worlds and structures.  
  
As an example, in Minecraft people tend to build interior rooms that are either excessively tiny, extremely large, or very open-sided. All of these are because ordinary-size rooms feel weird and claustrophobic in first person view. This is actually true of first person shooters as well, if you look at their level design. This camera limitation also means enemies can sneak up behind you, or even simply be spawned in behind you reasonably.  
  
None of this is true with a long 2D view. Aside from manually blacking out the parts of the level your avatar isn't actively looking at, you can easily "see" the map and most of the monsters nearby. Even implementing fog of war only somewhat reduces this effect. So you can have moderate-sized closed-off rooms, because you'll never feel "trapped" in them. Monsters have a rough time sneaking up on you, and so on.  
  
Now, this isn't actually because of 2D vs 3D - it's all about how the camera and your avatar are related. For example, "2D" could be a top view or a side view or an isometric view or even a full 3D view where the camera is far enough away to see all around the avatar. Similarly, there's an element of whether the camera is world-anchored or avatar-anchored. For example, in a Terraria-like game, the camera is always square on the same orthogonal axes. I made a Terraria variant where you're on a planetoid, and the camera always had "down" be the center of the planet. That really screwed with situational awareness, because the camera's frame of reference was constantly shifting.  
  
By changing the range and behavior of the camera, you can tweak the player's level of environmental awareness. In general, the more distant and "world-anchored" the camera is, the more the game will be about the world rather than the character. But the details matter.  
  
For example, I created an over-the-shoulder Minecraft clone. Being able to see your character at all times really increased player awareness of their character as a game world entity (rather than as a roving camera with a bag). But the range wasn't large enough to really get good situational awareness in terms of maps and terrain. That was on purpose.  
  
Another version with a longer camera gave good situational awareness, but whenever you turned the camera panned with sickening speed because it was so far away from your character. So this is a fundamental weakness: it's good to anchor the camera orthogonally and not respond to the avatar's turning when you get very far from the avatar. However, this is not a very good choice for 3D worlds, as they fundamentally require an adroit camera to see around walls and down holes and such.  
  
Moreover, even a small distance from the avatar makes it almost impossible to have interior spaces in a 3D world. Either the camera has to give awkwardly low, off-kilter angles, or the camera has to strip away the ceiling so you can see through it. Both of those options are pretty crummy. In a polished video game featuring a third-person camera like these, the levels are designed such that the camera doesn't have to do anything awkward except when the designers actually want it to. The floor above you is rarely even in the game, the ceilings are all nice and high, the doors are oddly huge, and even then the camera gets tight over the shoulder on too many occasions.  
  
In a game where constructing the world is the key, those are not really very good options. So we go with a 2D plane. It gives us better awareness without getting confusing. It does limit us to two dimensions, though, which is the major downside.  
  
A "surface" plane is generally considered the best for base-building. This is any typical mostly-flat environment, such as a Starcraft map, early Final Fantasy, Evil Genius, Chess, etc. The reason a surface map is often ideal is because it offers the most unweighted layout complexity. Houses can be and often are one floor deep in the real world. The vertical depth of rug, chair, table, TV are irrelevant to human experience, so you can just abstract them out with a tile system. The people in your world can move up, down, left, right with equal abandon, giving you two axes of basic design freedom.  
  
On the other hand, a "side" plain like Terraria or Mario is a bit wonky. The problem with a side plain is that the vertical axis is no longer the same weight as the horizontal axis. Now you only have one axis of basic design freedom, and one axis of limited design freedom. Kind of "one and a half" axes.  
  
To show what I mean, imagine you're playing on a surface map. You build a living room, and then put a bedroom to the north and a kitchen to the east. It's all easy to navigate, it's all on the same plain. But now imagine it from a side view: you build a living room, then you put a kitchen to one side and the bedroom **above**. Now entering and leaving the bedroom probably involves stairs or jumping or some madness.  
  
But side plain views do offer some advantages in terms of complex relationships within space. A surface plain's physics are going to be "flat" - they propagate evenly across the map. However, if you are building vertically in a side view, you can have much more interesting physics involving stress on the lower floors, heat rising, smog, and whether things from outside can reach high enough up the side of the building to reach that location. Also, a side plain can feature a lot of structures or effects which propagate differently vertically and horizontally, while it would be difficult to justify them propagating only east-west vs north-south in a surface view.  
  
Of course, both can support other layers - just because it's 2D doesn't mean it has to be a single layer of 2D. The surface plane can have basement levels, or perhaps just an "under the floor" system for power and sewage. The side view can similarly have doors leading to rooms "behind" the side view, and can also have wiring "in" the walls. All this stuff can be added to give a 2D game more complexity and interesting goings-on.  
  
...  
  
Ramble ramble ramble.  
  
What I'm saying is that I'm going to try to make some more 2D Minecraftlike prototypes. There's a lot of play I want to explore.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:59 AM](https://projectperko.blogspot.com/2013/06/2d-vs-3d-construction-games.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7212817009594467405 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7212817009594467405&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [world design](https://projectperko.blogspot.com/search/label/world%20design)


#### 3 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

TheOtherGuest said...

The primary reason that I always built unrealistically-sized rooms in Minecraft was that the furniture available is so limited and what does exist isn't that interactive. If I'm constructing a building that contains furniture, my brain tells me I should be able to use that furniture like a normal person (sit down at the table to eat, maybe pull a book off the shelf, etc). It drove me crazy that I couldn't make a chair and sit down (without mods, anyway).  
  
I made small rooms because they didn't look as empty without furniture. I made extremely large rooms because their size and architecture could become the focus and then the emptiness didn't matter so much.

[9:58 AM](https://projectperko.blogspot.com/2013/06/2d-vs-3d-construction-games.html?showComment=1371142697820#c4599615913040875581 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4599615913040875581 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

There is that, for sure. I think they're all pretty related, though. The functionality of furniture is one more element of how the game world works, and therefore one more element of how much awareness and presence you have.  
  
It'd be interesting to make a game where furniture did work right, and somehow make it so that using it was actually in the game somehow. Most games don't have a system for making furniture matter even if it was useful. Hm.

[10:01 AM](https://projectperko.blogspot.com/2013/06/2d-vs-3d-construction-games.html?showComment=1371142885071#c7889809122748643224 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7889809122748643224 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

TheOtherGuest said...

Yeah, I think furniture would only really matter if it was part of a detailed social simulation. For example, you could invite an NPC for dinner and they could react to your actions/state. If you eat standing up, they might not feel as comfortable.  
  
Another related possibility would be a world where what you build is automatically populated, so that you aren't the only one interacting with furniture. You see the NPCs do normal, human-like things using what you've built. I think that would at least make created structures feel more believable, but it would require extra work with AI and maybe some limits on how things can be built.

[5:21 PM](https://projectperko.blogspot.com/2013/06/2d-vs-3d-construction-games.html?showComment=1371169278298#c601603928518872154 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/601603928518872154 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7212817009594467405)

[Newer Post](https://projectperko.blogspot.com/2013/06/rating-and-enjoying-games.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/06/slow-construction.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7212817009594467405/comments/default)
