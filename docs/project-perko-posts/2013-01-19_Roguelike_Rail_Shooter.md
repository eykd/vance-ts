---
title: "Roguelike Rail Shooter"
date: 2013-01-19
url: https://projectperko.blogspot.com/2013/01/roguelike-rail-shooter.html
labels:
  - game design
---

## Saturday, January 19, 2013 


### Roguelike Rail Shooter

I was thinking about whether you could make a roguelike rails shooter.  
  
Obviously, you could create just a chain of rooms with pop-up challenges. But a rails shooter is a lot more than that. So let's consider it.  
  
Let's split the content into four fundamental types.  
  
1) Topology  
  
2) Timing and motion  
  
3) Enemies  
  
4) Enemy presentation  
  
We can separate the level out into premade topolgogical segments - random room-like objects. The rooms are not static - their elements can be permuted in various ways. A door could be locked, a roof collapsed, etc. This is important because the other three types need to be able to affect the topology to some extent.  
  
The rooms get stitched together not just at the doors, but at the windows and overhangs and broken walls and collapsed roofs.  
  
Since it's a rails shooter, how you move through the level and aim the camera is a major factor in the gameplay. This means you have to program in a lot of things like looking around, backing up, diving forward, and so on. These can be largely independent of the topology, except in that the topology has to allow it. Topology pieces come with several established possible paths, and you basically just stitch them together (including using multiple paths through the same room when possible). But you combine that path with the pacing and camera work to support your enemy presentation needs.  
  
Enemy presentation is the key element of all rails shooters. The enemies aren't just arbitrary pop-up targets like a gallery shooter. They have an existence in the level. They associate with the topology: range, height, and obscuring stuff. They associate with the timing and motion, to: surprises, peeking, cover, parallax, spinning, glimpses. They combine, too: sniper opportunities, firing through windows, down from a walkway, up onto the roof...  
  
Even further, enemy presentation also involves how many enemies, whether they are widely separated on the screen or clumped, and so on.  
  
So, is it possible to make a game out of this?  
  
I dunno. I think maybe I'll try a paper prototype.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:38 PM](https://projectperko.blogspot.com/2013/01/roguelike-rail-shooter.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/9051831628726762649 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=9051831628726762649&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/9051831628726762649)

[Newer Post](https://projectperko.blogspot.com/2013/01/roguelike-rail-shooter-paper-edition.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/01/games-tied-down.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/9051831628726762649/comments/default)
