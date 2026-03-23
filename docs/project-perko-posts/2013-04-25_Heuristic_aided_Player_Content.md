---
title: "Heuristic-aided Player Content"
date: 2013-04-25
url: https://projectperko.blogspot.com/2013/04/heuristic-aided-player-content.html
labels:
  - player-generated content
---

## Thursday, April 25, 2013 


### Heuristic-aided Player Content

I always want to lower the bar for players. I want every player to create content. I want every player to play content created by players. This makes sense from every conceivable angle.  
  
To lower the bar, one thing I've experimented with is "heuristic-aided player design", where players create things using fast, easy methods and the algorithms fill in all the details. These can then be tweaked or used as-is. This is an alternative to modular design systems.  
  
For example, if you're building a dungeon. One option is modular design, where you have a bunch of rooms and you put them down in the places you want them. This is good if you're aiming for balanced challenge creation, but it's difficult for the player to really express themselves.  
  
So I played around with "finger painting" the dungeon. The players just draw general strokes, and the heuristic translates them into corridors and halls. Switch "colors", and the heuristic interprets it as a new kind of zone - for example, creating a guard-filled security sector in front of a wealth-filled complex of vaults.  
  
The problem with this is that the specification is shallow. Even if you use the strokes to determine connectivity, you're still doing very basic stuff. There's no meat in these designs - it's the same level of expression as dropping in premade rooms. You lack all the custom stuff - tricky traps, conditionals, chatty NPCs, unusual combats, chains of scenarios. That's stuff you get a good custom-made level. You can't get that with finger-painting.  
  
I saw a little blurb by Corvus Elrod about how he was planning to do algorithmic melee weapon generation, allowing users to submit images of their weapons and then calculating the various parameters like damage, speed, accuracy... but he had also assumed that the player would have to mark the handholds on the weapons. I mean, obviously: knowing the handhold location means you know the lever length, the balancing, the level of control... you really can calculate out the mechanics of a melee weapon with just a colored silhouette and handhold marks.  
  
I thought to myself: it is these anchor points that give the heuristics what they need. The weapon's silhouette can only be interpreted in light of these anchor points.  
  
Put more precisely, the weapon has a role in the system. The role is to be swung or thrust in combat. How well it fulfills that role depends on both the construction of the weapon and **how the wielder holds it**. The actual method can vary wildly - some weapons are better at thrusting than swinging, some are short, some are long, some are heavy, some are light, some are blunt, some are sharp, some are spiked, some have handguards and counterweights... but around half of these things can only be determined if you know where the adventurer will hold the weapon!  
  
In designing a dungeon using finger paint, I was neglecting the handholds. A dungeon serves a specific role: it exists to be traversed by the adventuring party. So the shape of the dungeon can only be properly interpreted when you know where the adventuring party will be "gripping" it, and how.  
  
Like a melee weapon, a dungeon might end up feeling a bit different depending on who "swings" it, even between different swings. But the fundamental nature of the dungeon is based on how the dungeon can be gripped. In the case of a dungeon, we're not talking about hands, we're talking about adventure beats. Places that give the adventuring party purpose and invest them in the adventure.  
  
There are probably more kinds of adventure beat than handhold, because we probably want to allow for a lot of different kinds. This one is freeing hostages, this one is finding records about the boss, this one is overhearing a password from the guards, this one is where you get dumped down a level by a trap...  
  
Moreover, the dungeon around these beats will change. Its role will change, and therefore its implementation will change. A series of halls leading to a hostage-freeing situation will be geared for hostage keeping and containment, with locked doors and guards and cells. On the other hand, the same hallways leading to an "endless waves of enemies until you retreat" beat will be spookily empty and spattered with blood.  
  
Much like you can understand the transmission of forces and the effective impact points by understanding the handhold on a melee weapon diagram, you can also understand the transmission of adventure and the effective emotional impact points by understanding the intended story beats in a dungeon.  
  
...  
  
Actually, I'm pretty sure you could do this for a lot more than dungeons. Clothes, spells, starships, alien civilizations, even social NPCs...  
  
Forever, I've been drawing diagrams of these sorts of things. And, well, that works. But to really understand them and make the diagrams actually matter in-world, you also need to understand exactly how they will be used. This means putting down operational anchor points.  
  
This is a really fun little idea. I might create some prototypes based on it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:08 AM](https://projectperko.blogspot.com/2013/04/heuristic-aided-player-content.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/890040935532243568 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=890040935532243568&from=pencil "Edit Post")

Labels: [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/890040935532243568)

[Newer Post](https://projectperko.blogspot.com/2013/04/survival-horror-isnt-about.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/04/war-stories-and-power-rangers.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/890040935532243568/comments/default)
