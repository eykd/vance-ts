---
title: "Unusual Sorting Algorithms"
date: 2005-04-18
url: https://projectperko.blogspot.com/2005/04/unusual-sorting-algorithms.html
labels:
  []
---

## Monday, April 18, 2005 


### Unusual Sorting Algorithms

[This](http://www.deviantart.com/view/8666529/) is a fun little toy. Go take a look, if you haven't seen it yet.  
  
The game is a simple example of one of my FAVORITE phenomina: emergent systems. The rules of the game are simple: Square tiles on a grid. Two adjacent edges on each tile are 'active', two are 'passive'. When an active edge from one tile touches an active edge on another tile, the touched tile rotates ninety degrees clockwise. The currently rotating tile is not affected. The game starts when you rotate one tile.  
  
Now that I've played it for twenty minutes, I can reliably get scores of 300+. But what interests me is not the scoring, but the mechanism and result.  
  
In the beginning, the grid is awash with ropey tendrils and runic shapes. After a good run, the grid will have an almost crystalline orientation, with large tracts of tiles all facing the same way. None of the tiles that were involved with the mixing are left connected to the ropey tendrils for obvious reasons - a connection forces them to move.  
  
It's a SORTING algorithm, you see. It's an odd one, to be sure, and it doesn't seem to really produce anything meaningfull, but it takes a garbled mess and translates it into areas of orientation. It does this through a series of 'callbacks', I find. One tile affecting another tile, which affects another - that's what you start off thinking. But in truth the real power behind the throne is when one tile calls another... and the rotation brings the OTHER active edge into play, making the ORIGINAL tile move again. This and a heady dose of double-activation means that the sorting routine continues long after you might think it would stop - getting over 1000 rotations is relatively easy.  
  
Watching the process is like watching a game of life: 'clusters' of tiles 'live' by rotating. In rotating, they rotate their neighbors who, more often than not, end up rotating them again, often after several generations. The vast points that are made happen when a 'living' field is organised, then touches an unliving section, which 'bounces' the life back into the organised field, where it orients the field universally in a different direction.  
  
The 'bounceback' feature - the fact that the edges have to be adjacent - seems to kill any chance of an eternal loop. Instead, what we end up with is a neatly sorted playing field. I'm going to look into it some more, as an interesting emergent rule set. I think I'll start collecting them.  
  
I'm really curious about permutations of this rule. What if you had THREE active edges? What if every other tile rotated in the opposite direction? What if the tiles were triangular? What if and active edge has to touch an UNACTIVE edge to make the tile spin, rather than an active one?  
  
Curiouser and curiouser. Maybe I'll program it.  
  
Addendum: I notice that they seem to orient themselves in regard to the nearest global corner, which makes sense - they orient such that there is no possibility of a bounceback. Which makes sense, they "fall to the lowest energy state", as it were.  
  
Multiple sortings brings them closer and closer to this state.  
  
Addendum Addendum: It also makes it VERY easy to spot 'walls' where the cogitation does not reach. In a game, a map could be created this way. :D

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:45 AM](https://projectperko.blogspot.com/2005/04/unusual-sorting-algorithms.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/111384784544530429 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=111384784544530429&from=pencil "Edit Post")


#### 1 comment:

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Aha! I figured out the primary sorting dynamic. The rotations generally continue in a kind of cataclysm of spinning until they hit a barrier - whether this barrier is simply the edge of the grid or a set of tiles that are turned to be unaffected. Sometimes, they will hit a callback, which will set them off in a paroxysm of turning again.  
  
This means that the dynamic is one of building 'walls' - areas where cells can't be affected by the spinners. This means that when a field begins to develop, it slowly 'accretes', because whenever a cell falls into the same alignment, it can no longer be affected by other cells.  
  
The obvious example is in the corner. If a cell has both it's active sides crammed into the walls, it is 'immune' - no natural force can rotate it. If the cells directly above or to the left are rotated such that one of their active sides faces a wall and the other faces the 'dead' cell, they, too, are immune. This is the cause of the 'sorting', and it's a bit of a cop-out.  
  
But I was right: if the cells had a three-way or every-other-side active sides, then it would never accrete 'dead' zones and would therefore theoretically never stop spinning, in an ideal situation.  
  
Damn. It's not as emergent as it looks. It's just a 'flattening', not a 'sorting'. :P

[1:24 PM](https://projectperko.blogspot.com/2005/04/unusual-sorting-algorithms.html?showComment=1113855840000#c111385584580030341 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/111385584580030341 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/111384784544530429)

[Newer Post](https://projectperko.blogspot.com/2005/04/half-life-two.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/04/are-they-liberal-or-stupid.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/111384784544530429/comments/default)
