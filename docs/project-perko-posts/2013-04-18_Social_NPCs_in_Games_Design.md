---
title: "Social NPCs in Games (Design)"
date: 2013-04-18
url: https://projectperko.blogspot.com/2013/04/social-npcs-in-games-design.html
labels:
  - game design
  - social simulation
---

## Thursday, April 18, 2013 


### Social NPCs in Games (Design)

Still thinkin' about social NPCs. The short version of yesterday's post: social NPCs aren't about getting them to like you X amount, it's about how they interact with the world alongside you. In some respects, a character's social algorithm is similar to a character's combat class. It shapes how they engage, how they maneuver, how they act, how long they last, what role they play. But instead of being about combat, it's about some kind of social framework.  
  
If an NPC is simply given a "like" axis for you, it generally implies the designers are treating them as a token or hazard for the players to use or navigate around. This is fine for gameplay, but death for social stuff. Being social fundamentally assumes the other person is in the same basic category as you. IE, an active member of the world.  
  
So most attempts to create social NPCs fail largely because there's no reason for the social NPC. The character only matters if they matter. Their actions only matter if their actions matter. So you have to build the game's framework to allow the NPCs to matter, and then build the social engine to influence that.  
  
As an example, we'll outline two basic games, and discuss how we might implement social NPCs in that framework.  
  
The first game is a horror movie game. The idea of this game is that you are directing a horror movie. So you add whatever cast members you want, pick a scenario and a monster, and begin filming. There's no script, it's all ad-libbed by the cast in response to the threat.  
  
This is a good system to start with because 99% of the meat of this game is the way the characters act and interact. It's also a good place to start because it puts ever-increasing pressure on the characters, which is something most social games leave out. RPGs put ever-increasing pressure on the party, FPS games put ever-increasing pressure on your gunnery skills... if you want to be able to get the real measure of a character, you have to be with them as the pressure mounts.  
  
We'll simulate this with a simple modular structure for each character. The characters have a "physical" mind which is simply a glob of modules connected to each other in 2D space. When the characters "touch", the nodes which impact react. Sometimes they'll react positively, bonding together with a strut and locking the characters together until the strut is shattered. In the movie, this would be represented by a scene where they have a moment related to those nodes and noticeably bond. Other times, the nodes might not get along - for example, two "alpha dog" nodes that impact will result in both characters being hurled away from each other. This can also break struts depending on the force applied. The scene would reflect the two fighting for dominance and then grumping away from each other in different directions, along with any other affected characters subtly relaying their shattered bond.  
  
This is a very simple physics system, which is made more possible by the addition of pressure. Horror movies happen in an isolated space, and as the director, you can apply more and more pressure, shrinking the space with stalking monsters, fires, and so on. This pushes the characters together more forcefully and can even snap bonds. There might be a few other things you can do - like sic the monster on any given character whenever you want, or click on a character to force them to have an active scene where they do something unrelated to the monster.  
  
This is a simple physical system for creating social interactions. It's going to vary a lot depending on a lot of factors - can the characters rotate? What nodes are there? And so on. It's a toy at this level, but it could be turned into a game, especially if the monster is actually automated and your job is to try to jiggle the characters into a solid enough formation that they can escape or survive before the monster kills them all.  
  
The second game is an open-world RPG, kind of a single-player MMORPG where other party members are played by social NPCs.  
  
This offers us several ways to witness the NPCs' personalities and preferences.  
  
1) How they act and react in combat.  
  
2) They can spend time with you on unimportant gameplay, creating a sense of camaraderie. This could be "kill 800 badgers" missions or just hanging out at someone's virtual home.  
  
3) They can get together with you for important raids (both joining you and proposing them while asking you to join).  
  
4) They can message/whisper you what's going on if they are gaming but not in your party, negating the "out of party, out of mind" problem and also allowing you to perform more complex multi-pronged raids.  
  
5) They can email you if things happen in their downtime, further negating the "out of party, out of mind" problem by flat-out telling you what things have developed. Conversation trees here can allow you to develop a deeper understanding and connection as you respond to their emails.  
  
6) How they equip themselves with luxury items, costumes, lay out their homes, and so on. What parts of the world they like, which static NPCs they like... all communicate preferences and let you communicate your judgment/response in return. Of course, they can judge you and other social NPCs based on your own preferences on these matters.  
  
The focus of this design is giving the player as many ways to witness and respond to a character's personality as possible. Unlike the previous design, the focus here is not on simulating the character in an interesting manner, but instead it is on creating an interesting character and allowing you to get to know them. You could structure the gameworld in a lot of distinct ways, and you could make the character algorithms work in a lot of different ways. But none of these components are mysterious: some require a lot of work, some could be made easier or harder, but they are all plausible.  
  
Anyway, that's the sort of thing I'm thinking about.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:14 AM](https://projectperko.blogspot.com/2013/04/social-npcs-in-games-design.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7785017558713017861 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7785017558713017861&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7785017558713017861)

[Newer Post](https://projectperko.blogspot.com/2013/04/glitch-games.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/04/social-npcs.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7785017558713017861/comments/default)
