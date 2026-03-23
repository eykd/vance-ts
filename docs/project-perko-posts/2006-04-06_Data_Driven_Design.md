---
title: "Data-Driven Design"
date: 2006-04-06
url: https://projectperko.blogspot.com/2006/04/data-driven-design.html
labels:
  []
---

## Thursday, April 06, 2006 


### Data-Driven Design

Game architecture. This is a messy post. I'm not thinking clearly today.  
  
One of the more popular design paradigms coming into play these days is "data-driven design". This method of design stresses a simple, robust back end where most of the experience of the game is centered around the content that gets pumped through it.  
  
Maybe it's because I'm a databases guy, or maybe because I've seen too much SecondLife, or maybe just because of the way I run tabletops, I don't actually think this is "the future".  
  
You see, data-driven design has one tremendous drawback: you can't exceed the limitations of your back-end. For example, most of the new 3D chat programs will die off, because their back-end is too limited. It's just about 3D chat, and pretty limited 3D chat. No matter how much user content gets created, the overall capabilities of that content are limited.  
  
Some software tries to get around this by allowing scripting as well as simply "more stuff". This allows the stuff to do a wide variety of things instead of just being aesthetic. SecondLife allows you to create a huge variety of things which few other games would allow their players to create: vending machines, polymorphic vehicles, learning scripts. But these things are still limited by the choices made about the back end itself: the game is unresponsive, the graphics are poor, there are huge limitations as to what you can build in terms of size and complexity... these are limits which cannot be worked around.  
  
It's true, you can keep pulling back from limits. Instead of insisting that everyone run their client, SecondLife could have allowed anyone to make their own client. Instead of insisting on the same player model base, they could have allowed people to make their own. Instead of running it on only their limited local servers, they could have allowed shard instances.  
  
But these excessively robust back ends come with prices of their own: incompatibility and steep learning curves. A newbie signs on with the default client and quickly finds that he can't access three quarters of the content because his client doesn't recognize it - or recognizes it poorly. That incompatibility can be solved, but only by hunting down other clients, installing them, and struggling to get them all to work together.  
  
Sure, it's theoretically possible to make everything always compatible with everything. In which case you get another problem: bloat.  
  
The end result is that "data-driven design" leads to one of three roads: limited variability despite unlimited content, incompatibility, or bloat. Often it leads down all of these roads in various amounts, but if you're doing a one-player game, it's usually primarily limited variability.  
  
There's nothing fundamentally wrong with this. All games have limited variability. In fact, those limits are often what drive the game to be razor-sharp and great, rather than a mushy mash of media.  
  
Still, data-driven is not the only solution. It's very efficient for games of a specific size at the moment, but for games which are small or quite large, it's not very efficient. Too much overhead, or too many limitations.  
  
The most efficient solution, for larger games, is probably algorithmic generation. Instead of being "data-driven", you're exactly the opposite: your algorithms spontaneously generate your data. Depending on what sort of game you're creating, the difficulty here varies from insanely difficult to merely somewhat obnoxious. For example, it's not too incredibly obnoxious for Civilization's worlds, cultures, and NPC gameplay to be "emergent" rather than carefully scripted. That part of the game is algorithmically generated, not "data-driven". On the other hand, the actual tiles of the map (jungle, ruins, etc) are "data-driven", because it's nearly impossible to create an algorithm which can generate as meaningful a set of terrain tiles.  
  
The tiles are data, the placement algorithms are algorithms. Is this data-driven design? How about the AI? It's algorithmic, but it has to know about the usefulness of any given tile. That's pretty clearly algorithmic, with very little in the way of being data-driven. The tech tree? Entirely data-driven.  
  
See, it all depends on the depth your creation needs to contain. Few people complain too much that the AI in civilization doesn't act like real countries do. Aside from the fact that real countries have more than ten cities, nobody expects a game to model such a level of political complexity. So a simple model can create algorithmically generated gameplay, instead of having to carefully script each instant of every level. You don't need data on the level: just plug the countries in and let them chug. No data. Just algorithms.  
  
But a quick jaunt over to the world of voice acting shows just the opposite: it's nearly impossible to algorithmically generate good voice acting. Even the best voice programs might sound realistic, but none of them can put as much emotional power in their voice as a good voice actor. At least, not without having every instant carefully controlled, in which case it would be easier to get a voice actor. This is an example of content that had damn well better be data-driven. No algorithms. Just data.  
  
So, no, I don't think "data-driven" is the wave of the future. In fact, I think it's the wave of the past: I think algorithmic generation is becoming more powerful every year. The days of scripting a level are nearly done. In ten years, we'll just say what things should be in the level, and then our algorithms will build it for us.  
  
"Data-driven" design is very useful in many situations. But I don't consider those situations to be universal. Or anywhere near it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:18 AM](https://projectperko.blogspot.com/2006/04/data-driven-design.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114436795598556979 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114436795598556979&from=pencil "Edit Post")


#### 2 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I totally agree, and I would even take it a step further: allow the AI to evolve the content-creation algorithms.

[9:49 AM](https://projectperko.blogspot.com/2006/04/data-driven-design.html?showComment=1144428540000#c114442858901252438 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114442858901252438 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Patrick: Have you ever tried it? That's functionally impossible! Our AI algorithms aren't just not advanced enough: they're not even in the right universe.  
  
Maybe in fifty years...  
  
Corvus: I don't know anything about your project, so this wasn't pointed at you. From your two-sentence explanation, it sounds like data-driven to me, but I don't know anything about it.  
  
However, there's nothing wrong with data-driven. It's the right solution a lot of times. It's just that everyone seeems to be saying, "it's *the* solution!"

[6:48 PM](https://projectperko.blogspot.com/2006/04/data-driven-design.html?showComment=1144460880000#c114446090030798862 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114446090030798862 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114436795598556979)

[Newer Post](https://projectperko.blogspot.com/2006/04/feedburner.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/04/imvu.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114436795598556979/comments/default)
