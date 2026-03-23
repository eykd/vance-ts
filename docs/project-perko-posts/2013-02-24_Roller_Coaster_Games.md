---
title: "Roller Coaster Games"
date: 2013-02-24
url: https://projectperko.blogspot.com/2013/02/roller-coaster-games.html
labels:
  []
---

## Sunday, February 24, 2013 


### Roller Coaster Games

Every time I play a 3D sonic game and randomly get hung up on a ledge and flung off into space, I wonder whether it's possible to create a good 3D roller-coaster game. Ditch all the parts of the games that aren't about speed and flow. This also isn't a game about dealing with endless random obstacles: it's a game about traveling through levels at high speeds and having fun finding new routes and doing better runs.  
  
The modern Sonic games have a couple of fun camera tricks that can make roller coaster games really interesting. The games are fundamentally 2D, but the game keeps changing which 2D: is it a horizontal 2D like the old sonic, or a top-down 2D like a race car game? Sometimes it wanders into 1D or 3D, and we'll cover those too, but the meat of the gameplay is in 2D.  
  
In the sidescrolling 2D, the challenge is to race along hitting jump and dash as the need arises. While Sonic includes various platform puzzles, we'll do away with them. They're flabby leftovers and the worst part of the 2D game. Instead, we'll focus entirely on the idea of managing ground acceleration, vertical maneuver, and horizontal air dash.  
  
You can raise your speed by running on the ground. This isn't always possible - you might be faced with a pit or some spikes or something. If you wish to accelerate faster, to higher top speeds, you can use dash fuel while on the ground to run much faster. If the level was just a single line of hills, it'd be entirely a matter of running along the ground and using dash.  
  
But it's not just on a surface. There are a lot of reasons you'll need to go vertical. Some of these reasons are built into the level in the form of springs or ramps. Other times, you'll press jump - useful for avoiding ground obstacles, collecting coins in the air, and changing layers. While you're in the air you may be able to shift left and right, but that doesn't really matter much except to optimize coin collection. In Sonic you can also homing-jump, but I'm not going to include this. Instead, the real maneuvering option in the air is that pressing dash makes you move horizontally, allowing you to pop into small horizontal gaps, slam into enemies, and so on.  
  
From the perspective of a roller coaster, this sidescrolling section is about optimizing foot speed, optimizing coin collection, and triggering air events by either high-speed jumping or air dashing.  
  
Every ten to thirty seconds, the game then swings into "car" 2D mode, where you run forward while the camera looks down from behind, giving you a clear look ahead. In Sonic, this sometimes barges into proper 3D as Sonic's speed slows, so we'll want to not allow that. Our goal is speed.  
  
Classically, Sonics tripped up on this because the controls don't scale correctly. This hit a fever pitch with the "Mach Speed Segments" that were literally uncontrollable. The modern Sonic games avoid this by reverting to a rail system. Sometimes this is literal rails, other times it's more like lanes in a highway. You don't want to turn sonic left or right: you just want to make him drift across the lanes. Even in the sections which are not actually lane-controls, the player still acts like they are lane-controlled, since he doesn't want to make any serious turns. He just wants to be a little righter or lefter than he currently is.  
  
We can use this same philosophy: the course of the "road" is what matters. You control your position left and right on the road. This has a lot of similarities with the sidescrolling sections: you can run on the ground to increase speed, dash on the ground to radically increase speed. You control your left/right orientation in much the same way that jumping would control your sidescrolling orientation: to collect coins, avoid trouble, and take different routes. The air dash is replaced by the side dash, which simply allows you to change to the center of the lane to one side instantly. We can also put in "exits", which are sharp offturns you can only take by side dashing into them as you're running along.  
  
Now you can jump in these sections. Classically, the jump is just a way to avoid death as the road breaks. IE, it allows you to skip some hazards without changing lanes, and sometimes those hazards are in all the lanes, so you'll have to jump. Occasionally a jump is a way to enter a linear trigger section, which we'll talk about shortly. Both of these are fine: they add spice without threatening to slow the game down. A lot of these segments also have homing-dash chains, which are great.  
  
In sidescrolling mode, homing dash is a muddy distraction, a weaker version of the horizontal dash. The horizontal dash in these sections allows the exact side view to be used properly and precisely. On the other hand, in the "lane" sections, the camera is behind you and you're not sure precisely how far ahead things are, especially when they aren't sitting on the road in the marked lanes. In this case, the homing dash makes up for a core weakness in the camera. So when you jump and hit dash, you'll homing dash rather than doing an air-horizontal dash.  
  
The camera isn't simply bad, though. The lane camera reveals far more of the future than the side camera does with a far better presence. With the side camera, you have to choose whether you have a hard time seeing the things nearby because the camera is zoomed out, or whether you can't see things far away because the camera is zoomed in. Either way, you have to design the max speeds and the jumping challenges to this shorter distance, often resorting to using linear dash sections or putting markers on the level of what is coming ahead (such as Sonic's "fall hazard" markers and "press O you doof!" markers).  
  
The last kind of challenge is similar to a lane challenge, but it's a "skydiving" challenge. The idea is to control your position as you fall through a tube-shaped zone of space. Sometimes dashing is useful to smash through lightweight barriers. Either way, this area is strictly an optimization challenge and a breather. It's never used as a full gameplay section with multiple paths or careful timing events.  
  
Bosses are a fun topic, but a boss is normally an excuse to use one of the other challenge types, frequently including the low-speed or moderate-speed challenges I'm not considering. Some bosses do use the high-speed challenges, especially the lane challenges, and these can be a lot of fun. But they aren't really a distinct challenge type, just a way to frame the challenges we've already considered.  
  
I think that is the majority of the high-speed challenges in Sonic. There are a variety of low- and medium-speed challenges that we'll just go ahead and discard. They aren't fast enough.  
  
There are, however, some non-challenge elements to talk about. One of these are the linear dash sections. These are chains where things just pong-pong-pong you along. They're fast and fun. Often they have some element of interaction - never so much that you're likely to fail, but enough that you'll feel involved. For example, you land in a cannon and then it fires when you press X. There's no reason to wait - pressing X is just to get the player involved. Similarly, a chain of floating enemies where you hit each with a homing dash. While you can theoretically miss, you're not generally intended to. It's not intended to be a challenge, it's intended to be a way to get the player involved in a linear section.  
  
One of the things that Sonic attempted to introduce along these lines was the "stunt" system. When you're launched into the air, press directions to do stunts and then land properly by pressing buttons. It's not really very interesting, although you could argue that variety alone makes it worthwhile - if you're trying to get the player involved, variety might be useful.  
  
In addition to the linear dash sections are the transition sections, where the camera changes from lane to side or visa-versa. This usually happens over a second or two of "non-play". Sometimes this non-play section is a linear dash. Other times, it's a "run out" on a rail grind or open road section. Either way, the player is generally not allowed to screw up his control during this small section, because otherwise he would screw up his controls.  
  
I think these could form the basis for a roller coaster game.  
  
You'd also need good framing. A good feeling of progress and theme and world presence. Replaying levels is a big part of the fun - finding other paths and doing better. So it's not recommended it be random levels.  
  
Hm. The camera switching and linear dash sections really are the heart of this game type, I think. I wonder whether you could build other kinds of games with the same philosophy. Like a match-3 gem-destroy game that sometimes spools the gems out into a Space Invaders marching flotilla thing... hm.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:32 PM](https://projectperko.blogspot.com/2013/02/roller-coaster-games.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7773139121097940212 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7773139121097940212&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7773139121097940212)

[Newer Post](https://projectperko.blogspot.com/2013/03/social-npcs.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/02/clean-combat.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7773139121097940212/comments/default)
