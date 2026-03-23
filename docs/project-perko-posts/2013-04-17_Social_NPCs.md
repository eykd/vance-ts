---
title: "Social NPCs"
date: 2013-04-17
url: https://projectperko.blogspot.com/2013/04/social-npcs.html
labels:
  - social simulation
---

## Wednesday, April 17, 2013 


### Social NPCs

I've been thinking - again! - about social NPCs.  
  
Recently I've started to think of them in a slightly different way. When we talk about social NPCs, what is it that we really want?  
  
Do we want NPCs that react to the player's game choices interestingly? Do we want NPCs that the player can interact with socially in a compelling way? Do we want NPCs which can shape our world - or at least their own lives - based on their personal preferences?  
  
A lot of this is about the game you're designing. For example, you might create a game where you run a starship, and you want the social elements of the NPCs to be about how well the crew can get along during the long quiet time between stars... and also how they react to your various moral choices on missions.  
  
Or maybe you're doing a classic RPG, and your social NPCs are more about getting to know the people who are on this mission with you, and getting that feeling of camaraderie.  
  
Or maybe you're doing a Minecraft game, and you want randomly created villagers that form meaningful relationships with each other while shaping the village's inhabitated lands.  
  
These all call for different kinds of social algorithms.  
  
In general, I've started to think of NPCs as having three tiers you may want to make algorithmic or script, depending on your need.  
  
The lowest level is what sort of situations the NPC seeks to be part of, and what sort of situations they seek to avoid. This will determine the low-level activities they generally perform. In a space ship crew game, this might simply be where they hang out off-shift. In a fantasy RPG, this might be their moral alignment and the kinds of outcomes they would prefer from the various kinds of quests. In a village game, this might govern the sort of friends the NPC has, which kinds of buildings he prefers to inhabit, and so on.  
  
The middle level is how the NPC seeks to steer situations they have become part of. This will determine how they try to resolve or take advantage of game situations as they unfold.  
  
A starship crew would voice their thoughts about how an away mission should be handled or who should date who. A fantasy RPG character will use this to position themselves in the unfolding battles, and govern how they treat loot and danger. A villager would use this to determine how they act when day-to-day concerns arise, such as storms or visiting peddlers.  
  
The topmost layer is how the NPC judges and interacts with people (and things) moment to moment. In all the situations listed so far, this would be the tone of voice they take, whether they jockey for dominance, whether they judge you for your clothes, and so on. In theory, it is really about how well people get on moment-to-moment, regardless of how well they mesh or clash on a larger scale. In practice, this would probably involve a lot of generative dialog and confusing emergent behavior, so this may be something which is better to script or simplify down to arbitrary values.  
  
Each of these levels seems largely independent to me. You could script one and create an algorithm for another. The exact algorithm would vary based on your game world, of course, but none of them are particularly mysterious.  
  
But... notice what's missing from this equation?  
  
I didn't talk at all about things like how much they like you or trust you or whatever.  
  
Obviously, memory plays a big role in socialization, and there will be some kind of like and/or trust values going on. But the meat of a character is not in whether or not they like you: it's in how they act and react.  
  
The heart of the social gameplay is not in leveling up your relationship with them, but in how they interact with the world alongside you. Instead of treating the character as a target, treat them as a tool. Characters do stuff. Sometimes they do stuff on their own. Sometimes because you tell them to, or on your behalf. And sometimes they will oppose you. It is the contours of these activities that make interacting with them interesting - not whether you can get another point on the buddy-buddy axis.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [12:16 PM](https://projectperko.blogspot.com/2013/04/social-npcs.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/1586729782597885733 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=1586729782597885733&from=pencil "Edit Post")

Labels: [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 2 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Permafrostrocks said...

So, in you final comment, you mean the memory of an npc does not actually matter?  
  
I thought it would be intersting to have npcs remembering at least some things relating to you for a certain time. The more important the memory the longer it is kept. However, an MMORPG would mean, lots of people interact with the same npcs. Each player creates memories in multiple npcs and the npcs accumulating a huge memory heap. What if the npc has too much memories to effectively (speed) react in its environment? What if a server slows down because this phenomenon is occuring at hundreds of npcs instances?  
  
In the end, it is more a compromise to neglect a deeper npc memory system. Still, with enough caution in respect to memory and complexity, it should be possible to let npcs remember some things. If you beating someone up regularly ingame, he or she should remind you (in a most likely negative way) until you stop doing it for a few ig time ticks. Even players are limited in time and cannot create thousands of long lasting memories for each and every npc.

[8:33 AM](https://projectperko.blogspot.com/2013/04/social-npcs.html?showComment=1379172783420#c841787741119854188 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/841787741119854188 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

The other problem with NPCs remembering things is that memories typically boil down to a flat plus or minus, which subverts the idea of them being functional. Players will try to optimize what the NPCs remember about them, rather than simply working with the NPCs.  
  
It might be possible to get around it, but you'd have to be careful.

[9:31 AM](https://projectperko.blogspot.com/2013/04/social-npcs.html?showComment=1379176317487#c1999173310234351646 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1999173310234351646 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/1586729782597885733)

[Newer Post](https://projectperko.blogspot.com/2013/04/social-npcs-in-games-design.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/04/avatars-with-layers.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/1586729782597885733/comments/default)
