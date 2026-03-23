---
title: "Best Laid Plans of Mice and Mods"
date: 2015-03-04
url: https://projectperko.blogspot.com/2015/03/best-laid-plans-of-mice-and-mods.html
labels:
  - game design
  - modding
  - mods
  - programming
---

## Wednesday, March 04, 2015 


### Best Laid Plans of Mice and Mods

I'm finally wading into the guts of the new modding system. Anyone who's made space for mods understands the tradeoffs: where do you leave space for modders? What is hardcoded, what is "softcoded" so modders can interject?  
  
But this project is a bit different. It's intended to be open source, so nothing is truly hard-coded: the players can always edit the core code. Similarly, mods are created in the Unity project and exported from that space. It's not simply open source, it's a project where every modder is going to have the source code, even if they never really interact with it.  
  
During this experiment, I've found myself developing in a strange way as a thought experiment. I've been trying to make absolutely every part of the gameplay a mod.  
  
Some things are largely hardcoded. The way construction is handled, the way the basic menuing works, the light of the sun, the core existence of FacilityObjects and FacilityMOBs. In theory, these could be overridden, but they lay outside the modding infrastructure. A mod would need to aggressively intervene into the core systems in order to change those things. But... that's what most mods actually do in other games. The mod experiment has changed what I would consider "acceptable".  
  
This morning I wrote electrical systems into the game. Power is a critical component of base management, so you can consider this a core feature. The vehicles you drive up in have solar panels attached to them, and can also generate electricity through their chemcell engines using some kind of liquid fuel. They have a specific amount of energy storage. These resources will last you some time, hopefully long enough to establish your base as an energy source instead of an energy sink. This is critical because it takes energy to build some things (for example, sintering sand requires energy, welding requires energy, etc). The more vehicles you build and take with you to your next location, the better off you'll be at the start.  
  
There are a number of things the electrical system play requires. When you mouse over a car or a solar panel or whatever, the context popup needs to tell you how much energy is available/generated there. When you look at the facility overview, you need to know how much total energy is available, how much you're producing, how much you're using with standing facilities, how much you're using for construction or one-off activities. Moreover, it needs to continually update every time you build something new, do something new, toggle the behavior of an energy producing facility object, etc.  
  
Sounds kinda... complicated and core, right? I mean, not complex in the grand scheme of things, but wired into a lot of the core game systems.  
  
It's a mod.  
  
Literally. "Core Electricity mod. Requires: Core Facility View mod. Priority 99"  
  
A flip of a toggle, and the mod turns off. Nothing costs any energy. All the things that produce or consume energy stop caring about energy. Maybe some of them will stop being added to the list of available objects, when I care to bother dividing that stuff up.  
  
Now, in a few small ways this is a cheat. Most of the core content is "integrated" with it, in terms of having an electrical cost to build. If you turn the mod off, that electrical cost stops mattering, but it's still part of the content. Similarly, most additional content later will probably also be integrated with the electrical mod. You can't really "not install" the mod, because it would involve not installing nearly every piece of content.  
  
But you can "disable" the mod - all the content stays, but you are no longer limited by electricity and no longer receive reports about it.  
  
All the reporting - the context popup, the facility overview, the build limitations - is part of the mod.  
  
And this is how I've begun to think about my game systems.  
  
Everything is core. Nothing is core. The systems are all stitched into the framework in the same way.  
  
"Isn't that kind of a nightmare to develop?"  
  
Well, I programmed the heart of the electrical systems before work this morning. In half an hour.  
  
The key is the easy combination of ScriptableObject mod definition, the two GameObjects you specify as the overview menu item and the context menu item, and the UnityEvents that hook in automatically. It gives you an extremely easy "in" for hooking into the game world and running calculations.  
  
"Isn't it painfully limited?"  
  
Well, it's basically an API. The mod itself is fundamentally a way to interface with the game framework. But unlike a rigid mod API, this happens inside the Unity framework. In addition to the ease of integrating with UnityEvents and the inspector, you can use Unity's debugging capabilities and interact with the rest of the systems using actual code.  
  
I've found that it produces extremely crisp results. Game systems tend to get complex and inter-related very fast and in very convoluted ways, at least when I program them. This keeps the systems so crisp you can actually turn them off.  
  
This probably wouldn't work for every game. But in games which are largely statistical, this seems very powerful.  
  
I'm sure I'll encounter drawbacks soon, because otherwise everyone would develop this way already. I'll keep everyone posted.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:10 AM](https://projectperko.blogspot.com/2015/03/best-laid-plans-of-mice-and-mods.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/68567005597580667 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=68567005597580667&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [modding](https://projectperko.blogspot.com/search/label/modding) , [mods](https://projectperko.blogspot.com/search/label/mods) , [programming](https://projectperko.blogspot.com/search/label/programming)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/68567005597580667)

[Newer Post](https://projectperko.blogspot.com/2015/03/optional-things-exist.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/03/mod-integration.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/68567005597580667/comments/default)
