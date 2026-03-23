---
title: "Gamey Update"
date: 2005-10-24
url: https://projectperko.blogspot.com/2005/10/gamey-update.html
labels:
  []
---

## Monday, October 24, 2005 


### Gamey Update

!\[Image\](https://lh3.googleusercontent.com/blogger\_img\_proxy/AEn0k\_ue7DUaljNjZWlRUq3K10RTahvmwzl98 Nl8lH\_Qfx64ufSMbMMo5 Ala2N3XEveeuByvfDXRyY-2lb7rWcgZk-4YQxN-sgV5NVNtgisItps=s0-d)  
  
So, I worked on the game over the weekend. Keep in mind these screenshots are using two tile sprites and one enemy sprite, all of which are preliminary. The player ship is complex, but still uses preliminary graphics (it's way too crowded).  
  
The game is a shmup: a 2D shooter. It's a bit different than the usual fare, both in terms of gameplay and in terms of the engine which drives it.  
  
You see, in this game you have a gunner. This means you have a turret. This means that you don't fire straight: you fire where ever your mouse pointer is when you click. This is a dramatically different feel of game from a normal shooter.  
  
[Shooting at the cursor.](http://www.projectperko.com/images/tms06.jpg)  
  
In a normal shmup, your guns are fixed-fire. This means that moving is inextricably linked with shooting: you have to get into a position to hit the enemy while staying safe. The reason I didn't follow this was because the keyboard doesn't like having more than two buttons pushed at a time. Holding fire, left, and down is something which simply isn't possible on a keyboard. Therefore, fire control is in the mouse.  
  
This dissolves most of the link between position and firing capability. You can shoot anyone, anywhere, so long as there's nothing in the way. This, in turn, means I can make navigation more complex. (I also make running into walls harmless, at least at this point in the game.)  
  
[Navigating made hard.](http://www.projectperko.com/images/tms05.jpg)  
  
Originally, we (if I use "we" and "I" interchangeably, it's due to the makeup of the "team") were planning on using Torque 2D's native tile map capabilities. But I rejected this idea after some thought.  
  
You see, the whole game is built in two stages. The engine and the data. The engine runs this lattice of scripts - scripts which can be seen and edited by any user, allowing for mods and easy game expansion. However, we can't ship every player his own copy of the T2D development studio, so they would be stuck using the tile maps we provided.  
  
This plus a number of secondary concerns made it obvious I had to build my own "tile" engine. After thinking about it for a week, I made the one you see in these screens. It's not really a "tile" engine in the classical sense. Tiles do not have to be of a set size or orientation, for example.  
  
Level layouts are generated on the fly by map heuristics. It takes tile "bricks" - groups of coherent tiles - and stacks them into something resembling a classic shooter level. If I want to change something, I don't have to edit a tile map: I change one script, and it cascades down through all the maps.  
  
The effect is quite solid, and can be re-built and tweaked and replaced by anyone with an ounce of creativity. It's also capable of creating scenes a real tile map would be sheer agony to reproduce.  
  
[Tile map highlight.](http://www.projectperko.com/images/tms01.jpg)  
  
The game allows players to set up their ship with the options they want for a given level. IE:  
  
[Selecting options.](http://www.projectperko.com/images/tms04.jpg)  
  
Once objects are selected, the level begins. You don't have multiple lives. Instead, you have a large amount of health. While your gunner isn't busy shooting people or reloading, he or she repairs the ship, restoring a point of health after a few seconds of not shooting anything. Some gunners are better at this than others, obviously.  
  
[Combat example.](http://www.projectperko.com/images/tms03.jpg)  
  
Cutscenes before, after, and during the game are available. These cut scenes can have 'if' statements, inputs, and variable outputs. If you wanted, you could drop the shooter part entirely and make the game nothing but a series of interactive cut scenes. The cutscene code is only partially implemented.  
  
[Ugly cutscene example.](http://www.projectperko.com/images/tms02.jpg)  
  
At the end of Sunday, I had programmed twelve hours straight with only the shortest of breaks for two Marx Brothers' movies and an episode of Red Dwarf. But I wasn't done yet! I put in more FX!  
  
This is the first time I've used the FX engine in T2D - the effects from before were graciously donated by Darius. Here I use some of mine, some of his. :)  
  
[Final shot.](http://www.projectperko.com/images/tms08.jpg)  
[Big version of the lead shot.](http://www.projectperko.com/images/tms07.jpg)  
  
Things left to implement: Bosses, cutscenes.  
  
This game is built using pattern adaptation control (PAC), both in the engine and the game itself. I will explain that, if I have the time.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:58 AM](https://projectperko.blogspot.com/2005/10/gamey-update.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113017477444185517 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113017477444185517&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113017477444185517)

[Newer Post](https://projectperko.blogspot.com/2005/10/bit-about-math.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/10/riverfall.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113017477444185517/comments/default)
