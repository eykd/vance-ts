---
title: "Game Spacetime"
date: 2005-10-28
url: https://projectperko.blogspot.com/2005/10/game-spacetime.html
labels:
  []
---

## Friday, October 28, 2005 


### Game Spacetime

One of the difficulties of doing either vector math or pattern adaptation on a game is that space and time are not exactly... straightforward. Especially if we want to view it from a player-centric view.  
  
To give you a quick background: a lot of people like to view the fabric of space as spacetime. Roughly speaking, as a four dimensional construct rather than a three dimensional construct. Unfortunately for our sanity, things warp space-time.  
  
Think about flying from wherever you are to Hong Kong. Even if your plane flies straight, you'll still be flying in an arc, because the curvature of the earth will insist you do so. Shortcuts can actually be taken by flying in what would be, viewed on a map, an arc. Measured on the map, these paths are longer. But because they "skip" the curvature of the earth, these paths are actually shorter.  
  
We generally think of maps as being very accurate, even though they have no "Z" component. However, missing these "Z" components means that a lot of little details you'll encounter along the way are missing. A map of Seattle doesn't show you that the whole thing dives a hundred meters down into the sea: as far as you can tell by looking at the map, the road to the sea is flat as a board.  
  
Similarly, our "3D" "map" of the cosmos isn't accurate, either, because it has a hidden "time" axis we cannot see. We pull this time axis out of our butt using gravitic analysis - "The sun pulls us in an orbit". But as far as you can see by looking at a map of our solar system, there's nothing inherent telling you it's easier to drive towards the sun than away from the sun.  
  
Games have maps, too. Whether 2D or 3D, these maps are usually absurdly complex things. In our mind, when we design them, we represent them with an added "time" dimension. Not *where the player will be at a given moment* , but *how the player will be moving while in this part of the map*. For example, "This bridge collapses as you touch it, so the player will be running across it". Or "the player has to jump over this wall to proceed". Or "the player has to get to the ax to kill Bowser, so we know how he'll be jumping".  
  
In theory, we can consider these required motions to be geodesics from a game design point of view. That is, straight paths through our "game space-time". Deviation from that path is "unusual", even though adhering to the path requires the player to take action. We know he *will* take that action, because he has to in order to progress.  
  
It's an interesting task, but is it workable? Well, for some games, time and "map" gamespace are very closely linked. You can draw paths across the level, from goal to goal. Mario has to jump the pipes, Link has to fight the boss, the progression is very clear. This could be called a "play-like" relationship, because the map will pass under you at a given rate ("the speed of play") in a given direction: "choice" is wholly illusory. Time, space, and the map are one and the same, although any given player's "speed of play" will differ.  
  
You can do this for a large number of games without any real notable added complexity. RPGs are easy to do this way, for example. Even MMORPGs can be mapped in this way, both in their worlds and in their skill paths, using a graph for a map.  
  
But this only works for games whose time and space are closely dependent.  
  
What about a fighting game? Suddenly "time" is wholly independent from "location". You're on this little level, you'll keep criss-crossing it with essentially no preferences until somebody dies. And the "optimal path"? Varies based on ten million factors, including how skilled you were.  
  
You can't represent this with a standard 2D "map", even though the actual gamespace is 2D. That's because the gameplay is largely independent of the map: the "memetic gamespace" that the players actually use warps and twists based on where the enemy is, what attacks are in the air, and where the walls are.  
  
*The very nature of "space" changes, from a certain point of view.*  
  
My vector math is attempting to quantify that by assuming a player will adapt to the situation, depending on their level of skill. If there is a fireball arcing at them, then from my game design perspective, the very nature of space changes such that the fireball can be considered a "bulge" in "time" which the player will "naturally" tend to avoid (or block). When watching a fight, you hopefully don't ever see someone just stand there and get hit by a fireball. They jump or block.  
  
This isn't a player "choice". It is the optimal path - one of two "geodesic" paths. The player won't choose against it.  
  
However, you have to remember that this bulge is in the player's mind. If he doesn't see the fireball, or doesn't grok what it does, then space remains flat and he'll get hit. That said, you can predict *average* and *expert* behavior by using this kind of model. (You should also, theoretically, be able to *create* average and expert behavior in your AI, but the calculations may be too time-intensive.)  
  
This kind of map - with the criss-crossing and bulging - would be called a "time-like" map.  
  
This same model also applies to play-like maps, but treating them as play-like is more efficient.  
  
Can it be done? Sure can!  
  
Remember my recent post comparing a shotgun to a machine gun in Machine City? The *real* difference is that a shotgun "compresses" space towards the mouse pointer, effectively bringing anything in that swath closer together. It is also a "dip" in "time". The dip is the "same" width, but not nearly as deep as the narrower machine gun dip. And, of course, it's much wider - except that space is compressed, so it's the same width.  
  
It's fairly easy to map the "height" of an enemy within that dip based on their ability to resist your weapon (HP). The further below "the surface" it ends, the more likely it is to die when you fire.  
  
This is a calculation which is considerably more computationally friendly both for you and for your computer than the mathy bits I spoke of before. However, in order to determine the type of "dipping" going on, you need to use those mathy bits beforehand. :)  
  
I hope this explains a bit about why game spacetime is a little more complex than you might suspect.  
  
This can also be applied to other forms of gameplay, from the longest RPG to Warioware. Player-centric vector calculation. :)

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [2:01 PM](https://projectperko.blogspot.com/2005/10/game-spacetime.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113053786758973856 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113053786758973856&from=pencil "Edit Post")


#### 2 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

This would explain why I've been unable to do better than a hueristic analysis using top-down axioms. I wonder if thinking about challenge in terms of fields and fuzzy graphs might be more useful than a strictly crisp approach, where the "dips" in the causation result from overlaps of fuzzy contraints. Or is that still an oversimplication?

[6:47 PM](https://projectperko.blogspot.com/2005/10/game-spacetime.html?showComment=1130550420000#c113055045216077858 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113055045216077858 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I don't know. It would probably depend on how you actually mapped it out. If you can get it to work, great!

[7:56 AM](https://projectperko.blogspot.com/2005/10/game-spacetime.html?showComment=1130774160000#c113077419424296736 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113077419424296736 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113053786758973856)

[Newer Post](https://projectperko.blogspot.com/2005/10/scaling-images.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/10/and.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113053786758973856/comments/default)
