---
title: "Integrating Mods"
date: 2014-10-07
url: https://projectperko.blogspot.com/2014/10/integrating-mods.html
labels:
  - game design
  - mods
---

## Tuesday, October 07, 2014 


### Integrating Mods

I like mods. I'd like to talk about how to integrate mods into the core game. I'd like to talk about the future of mods. So let's start with the current generation of mods.  
  
Right now, there are four reigning kings of mods. Kings and queens? Four reigning prime ministers of mods.  
  
These four ministers of mods are Kerbal, Space Engineers, Skyrim, and Minecraft. I haven't done much Minecraft modding, so we'll put that aside and I'll explain my thoughts using the first three.  
  
Kerbal and Space Engineers have similar fundamentals, so their mods often end up having a similar impact on the game. Both games feature picking parts out of a huge list and choosing where to put them. In short, they are construction games.  
  
Most mods for these games add parts. However, this leads to swamping. No matter how many filters and categories you add, the player is tasked to consider all of these parts as potential components at all times. Kerbal has introduced a nice smooth slope via career mode, and Space Engineers is working towards a very diverse set of categories, but neither approach is perfect. In both cases the player will eventually have to be familiar with all parts all the time, and that means the guidance just delays the inevitable.  
  
There are mods that are about things other than parts, but we'll talk about that later. Instead, let's talk about Skyrim.  
  
Many of Skyrim's mods are also about adding stuff into the game - the Skyrim equivalent of "parts". Armor, weapons, spells, NPCs, foods, monsters, dungeons - add it all in and stir it up!  
  
No matter how many Skyrim mods you add, you are unlikely to feel swamped. Even if you add 10,000 new swords, you're not likely to feel like you're drowning in swords. The reason is simple: you are never given a list of swords.  
  
Skyrim is not a construction game, it's a scrounging game. Because of this, there is never a complete list of stuff. You stumble across it - a shop might have one or two, a bandit might equip one, one might pop up in a dungeon somewhere. You are never asked to pick a spear from the 10,000 possible spears. Instead, you're asked to pick between a Spear of Winter's Breath or a Kingfisher Spear.  
  
In Skyrim, stuff is terrain. If you add more stuff, you widen the terrain. The player walks along and stumbles across the things you have added. They can choose whether to carry it with them as they go, or ignore it, or destroy it, or whatever.  
  
The longer the player walks, the more times they stumble across mod content. And, of course, if the player knows what mods they want to focus on, they can seek out that place first and get that stuff first.  
  
The equivalent would be if mods in Kerbal didn't add parts to your rocket construction facility, but instead scattered parts around the cosmos. If you went to the Mun, it wouldn't be to get science. It'd be to collect parts that are seeded there. There would have to be "core packs" too, of course, especially if we want to design decent-looking spaceplanes.  
  
Anyway, these kinds of mods are "content packs".  
  
There's also mods that change how the game works, and mods that do both at the same time. For example, Kerbal's "remote tech" mod, which radically changes how probes and communication work. Or any of Skyrim's "magic rebalancing" mods which change how magic works.  
  
Functional packs that change how things work (while perhaps also introducing new content) are rarer than content packs for a few reasons. One is that it is way harder to program a new kind of activity than to just give new stats to a sword.  
  
But even if they were the same difficulty, a player would still have more content packs installed than function packs. The reason is because of conflicts.  
  
When designing for the future of mods, conflicts are at the heart of our considerations. The future of mods involves dozens, hundreds of mods installed at the same time. Conflicts will arise.  
  
One kind of conflict is just in the player's head. For example, Kerbal has several life support mods. Aside from some minor resource overlapping due to shared resource names, none of them really conflict-conflict. It just doesn't make much sense to have them installed at the same time.  
  
These are "categorical conflicts". Categorical conflicts are limits on the concept of your game. If all the players rush to create the same three mods over and over, it means that they all see your game as lacking in the same fundamental place. However, if the players create dozens of different mods and they rarely have any category conflicts, it means your game is a strong platform for them to explore their interests.  
  
This doesn't necessarily apply to all categories. For example, Skyrim has hundreds of mods about sex and nudity: that's obviously a category the players really wanted to explore. But Skyrim also has dozens of mods about tweaking the rendering settings. That's not really a category in the game so much a thing the game does.  
  
This is a "system conflict": the game has a system that works in a specific way, and two mods that both change that system are likely to conflict. Two mods that change how things render. Two mods that change how airplanes fly.  
  
Kerbal life support mods are not a system conflict, because there was no system for life support in the game. But replacing the planet textures is a system conflict.  
  
Sometimes it's hard to tell whether something is a category conflict or a system conflict. For example, the dozens of Skyrim mods that replace the base body and armor meshes/textures. These categories are not exclusive: many system conflicts are also category conflicts. One tells you what the players are interested in, the other tells you what the game is capable of.  
  
"Resource conflicts" are the last type. This is when two mods conflict due to bad engineering. For example, one Skyrim mod which allows you to kill sleeping people, and another that allows you to drink their blood. When you hit the action button, which action happens?  
  
That's a minor conflict, because most mods learned to add options to a context menu instead of overriding the basic operations. But there are similar conflicts that are more persistent: a mod that makes your NPCs loiter around towns realistically conflicts with a mod that makes them follow you in a more tactically-sound way. The conflict only exists because the NPCs don't understand that they should behave differently between a town and a dungeon.  
  
When engineering a moddable game, it's probably worthwhile to consider these kinds of conflicts and understand how they will shape the modding community.  
  
Categorical conflicts aren't necessarily bad - they let the player base cooperate in a specific way - but keep in mind that these will give rise to all-encompassing mods that dominate your modding community. These huge, complex mods will conflict with everything and everyone, so you need to give the modders the tools to subdivide their mods and/or create variations to get along with other mods.  
  
Skyrim does this well - not through any effort of the Skyrim devs, but through efforts of the modding community. An in-game mod management console and an out-of-game mod install tool both offer players a bevy of options to specify not only what they want the mod to do, but also what mods they would like it to be compatible with.  
  
Larger mods will have versioning, so the mod system should support versions right from the start, and allow for comparing the same mod to itself to see which one is more recent. Ideally, it should even support contacting a server to check whether the installed version is out of date. Super-ideally, a P2P system could be used to host mods to prevent centralization issues such as a primary distributor being bought out by Curse.  
  
If you don't include these features, they'll probably arise on their own, but that usually means a pretty mangy, stumbling distribution system that will fall over dead randomly.  
  
Moving down into the game itself, to prevent resource conflicts you should try to make flexible API integration for mods. Kerbal has a pretty good example of this in their resources system, where mods can specify the nature of resources such as oxygen, water, karbonite, etc. This doesn't require any C# code or libraries or anything, and every mod can access the resources.  

  
A slightly better way to do it would be to allow mods to have part lists inside of resource/mod checks. IE, "if oxygen has been defined, add these three parts, otherwise don't bother" or "if Remote Tech is installed, use these parts instead of these". Allowing the mod to ask the player about configuration both up-front and in an in-game window should also be possible with a simple line of script. If conflicts arise, allow the player to choose which mod has supremacy, perhaps after checking with each mod for a fallback state.  
  
Mods which are modular are probably going to slowly gain importance, so allowing modders to let players turn on and off bits of their mods will probably be more and more important.  
  
However, all that stuff is the basic stuff. What we're really interested in is how mods are integrated into the game.  
  
Those ideas are all about functional mods. But most mods are and will probably always be content packs. In fact, content packs are likely to become so prevalent that players will be creating and downloading them without even thinking of them as content packs, such as with Spore's creature sharing.  
  
Content is going to explode. Space Engineers is touching on this - they let players create ships, and now their game infrastructure is buckling under the demand for better, faster, more interesting sharing options.  
  
In addition to the skyrocketing amount of content and demands for ever-more-flexible content sharing capabilities, there's also the bugaboo that content packs often rely on other mods. If I have a mod which flies random player-created ships through my Space Engineers game, what happens when those ships have mods I do not have?  
  
The Kerbal fail state is self-destruction: the ship flat-out can't be loaded. Space Engineers is slightly less bad, but you're still going to end up with busted ships.  
  
Even if you autoshare mods, the mods will conflict!  
  
The answer is wrappers.  
  
Mod wrappers are in-game conceits that control which mods work, when. Rather than a mod flat-out overwriting the game's base code, the mod's code is only called when the game is "inside" the wrapper.  
  
In Kerbal, that could be "space agency". So if Kerbal implemented a ship-sharing system with automatic mod-loading (impossible given their code base but let's pretend), the idea would be that your friend's ship would belong to their space agency. In turn, the mods their ship uses are considered separately from the mods you're using. Some might allow crosstalk - for example, if you both have a version of Remote Tech installed, the ships might be able to relay for each other. Others might be similar but incompatible, and not allow crosstalk - you have Remote Tech, she has Antenna Range.  
  
The key to wrappers is figuring out the edges. What happens when one of your ships and one of her ships dock?  
  
In Kerbal, the two ships are merged. So, what happens with the mods?  
  
One option is to not allow ships from different agencies to dock. Another is to assign one player as leader and shut down all the mods from the other player - the parts that serve those mods are still loaded, but they are dormant. Another is to make the mods list actually per-part rather than per-agency - although the overhead might get absurd.  
  
Imagine if in the next Elder Scrolls game, mods were by region. As you moved from land to land, things changed - the rendering changed, the rules of stealth changed, which swords were available changed. If you conquer a land, you can choose to change the mods. If you are playing multiplayer, you can shift between their world and yours, and the mods may change...  
  
Anyway, the key to this concept is that the wrappers are clear in-game concepts that allow players to choose exactly what mods should be applied where. These aren't normally under the control of the modders.  
  
To allow this, your code base will need to allow mods to register themselves rather than simply overwriting the game's base function. Your mod API needs to support not just the mod's capabilities within the game, but also the way the game knows the mod exists. It should allow mods to ask which mods are active in which wrappers, and it should ask mods whether they have anything to contribute.  
  
For example, a sword content pack might have 10,000 different swords. Rather than making the mod responsible for littering the swords around the world, the mod would instead tell the game it has opinions about swords (or weapons). Whenever choosing weapons (for NPCs, for stores, as loot), the game would ask all interested mods whether they have any suggestions. Then the game creates a weighted stack and doles out the final result to the player. When you ask the mod for suggestions, you pass it an information pack it can ask questions from - what culture is it? How rich? What level?  
  
If you want to be extra-safe, once you've collected a list, run the list back through the mods to see if they have any weighting adjustments they want to make. This would allow mods to synergize, or shut off the default content, or similar.  
  
Even the information pack should be linked to this concept of suggestions from mods. The base content adds in level, wealth, culture, etc. But a mod might overlay a "biome" information bit, or a "minerals" bit, or any number of other things. This allows functional mods to behave in a way very similar to content mods with a minimum of hacking into the core game code.  
  
Anyway, I'm looking forward to the mods of the future. I hope some of these ideas become common.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:47 AM](https://projectperko.blogspot.com/2014/10/integrating-mods.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/142131866239267311 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=142131866239267311&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [mods](https://projectperko.blogspot.com/search/label/mods)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/16993116520760182498)

[Antsan](https://www.blogger.com/profile/16993116520760182498) said...

I had thoughts like this, but rather in relation to a kind of collaborative world building tool/god MMO.  
  
Think of The Elder Scrolls and the Dragon Break for instance - modeling something like the Dragon Break might be possible with mod management like this.

[1:19 PM](https://projectperko.blogspot.com/2014/10/integrating-mods.html?showComment=1412972354250#c6453264900164183484 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6453264900164183484 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Sure, sounds fun!

[1:47 PM](https://projectperko.blogspot.com/2014/10/integrating-mods.html?showComment=1412974052813#c4694967322629324415 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4694967322629324415 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/142131866239267311)

[Newer Post](https://projectperko.blogspot.com/2014/10/cooperative-vs-collaborative.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/09/generating-playable-star-trek-plots.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/142131866239267311/comments/default)
