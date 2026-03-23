---
title: "Mod Integration"
date: 2015-03-02
url: https://projectperko.blogspot.com/2015/03/mod-integration.html
labels:
  - game design
  - modding
  - mods
---

## Monday, March 02, 2015 


### Mod Integration

So, it's one thing to talk about easily integrating mods into your game's content. But there is a more complex question: how do you integrate mods into the player experience?  
  
Most mods simply add some content. No biggie. It shows up in the same lists as all the other content, the player experiences it the same way as any other content.  
  
But many mods go further.  
  
For example, in Kerbal there are mods which change how aerodynamics work. In Skyrim there are mods that change how you manage and use your NPC followers. In RimWorld there are mods which overhaul the nature of combat entirely.  
  
In terms of code, all of these mods work. That is, they are coded and the code executes and the game simulation runs properly. But from a player perspective, these mods are clumsy and difficult to use. Even smaller mods such as adding in a new kind of stealth attack or a new kind of thermal simulation are often difficult for a player to understand, difficult to see running.  
  
In Skyrim, this is solved via menus. Some of them are solved via conversation menus - talk to someone and you get a five-deep branching tree of options and possible commands. Others are solved via the mod menu mod, which lets mods put their parameters in a menu for tweaking. But neither of these options tells you how things work - it's just an interface for tweaking the mod. When you're done, the mod goes back to silently doing whatever it was doing.  
  
In Kerbal it is also usually solved by a menu as well, but the menu is displayed right on the main game screen. The problem is that the menu is always in the way, and if you have eight mods, you have eight floating windows. There have been attempts to consolidate using a toolbar mod, but that has issues of its own.  
  
In RimWorld mods really have no say in the interface at all, as far as I can tell. So all mods run silently, not even allowing for option tweaking.  
  
I'm taking the opposite approach.  
  
In my game, there are several spaces the player looks to find information.  
  
One is the contextual popup. When you mouseover a tile or person, it reads out the details of what that is, whether it is navigable, whether it's friendly, what the temperature is, how much electricity it uses, etc. If you click on them, these contextual readouts become solid and interactable - perhaps giving out tooltips, perhaps becoming a button you can click to open a more powerful menu.  
  
The key here is that a mod may, if it wishes, add a line to this context menu. In fact, the core features mentioned - electricity, nagivation, friendliness, etc - are all handled using the same methods as the mods use. So if you want to add a mod for sorted cabinet inventories, it's considered as "core" as the concept of electricity. You can even plant advanced functionality in your widget to draw on the game world for things like radius, heat mapping, etc.  
  
This allows a player to see what the mod is "thinking" about the various objects in the game, and also provides an on-hand way to tweak the tweakable elements of the mod.  
  
The other place a mod might want to talk to the player is in the facility overview tab. The electricity mod shows you total kWh available, total generated, total on-demand, etc. Friendliness might show you how many people of various factions are visiting. Etc. Moreover, these can be interactive. You can tweak things by clicking on the panel or, if there are too many options, you can even have a button which pops up a full-screen menu.  
  
I'm not overselling this: Unity's core functionality is available, and both the context widget and the overview widget are simply considered GameObjects and spawned into the scene. There are a bunch of default hooks - onMenuOpen, onMenuClosed, etc - but you can also add in UI buttons and widgets of your own choosing and code them to do anything you want.  
  
Not all mods need this. A mod that adds a new gun or a new person doesn't need a menu item. The basic mod management screen is plenty for that kind of mod - just allow the player to turn it on and off, no need for ongoing management as you play.  
  
But I want players to build overhaul mods. I want players to turn off my shitty core electricity mod and replace it with their custom mod that does things better. I want players to create a mod to make the NPCs behave very differently, with a variety of context commands and AI cues. I'm happy if a player adds a new gun, but I want them to feel the urge to change the game as well.  
  
That's what I'm working on these days.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:26 AM](https://projectperko.blogspot.com/2015/03/mod-integration.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7185759067720939753 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7185759067720939753&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [modding](https://projectperko.blogspot.com/search/label/modding) , [mods](https://projectperko.blogspot.com/search/label/mods)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7185759067720939753)

[Newer Post](https://projectperko.blogspot.com/2015/03/best-laid-plans-of-mice-and-mods.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/02/basebuilding-with-people.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7185759067720939753/comments/default)
