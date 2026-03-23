---
title: "More Mathy Bits 2"
date: 2005-07-25
url: https://projectperko.blogspot.com/2005/07/more-mathy-bits-2.html
labels:
  []
---

## Monday, July 25, 2005 


### More Mathy Bits 2

(This post contains only musings on my graphical exploits.)  
  
One of the core issues with 2D animation is, of course, the need to animate everything. Some things can be animated in pieces, then recombined into a whole. Some things can be done with rotation and motion. But there are limits: turning is nearly impossible, which is not good, because everyone turns all the time, and it looks shabby if you don't.  
  
The problem with turning is that any given piece needs to be shown from any given angle. There are a couple ways you can do this, but all of them either break down at high resolution or have jerky 'jumps' to new orientations.  
  
I'm trying to get around that. One of the things I assumed during my early musings was that I needed a sprite - a "skin" that I carve up and show. I don't.  
  
The sprite would be used for a lot of things. It can be used to put patterns on things - like the lines of the back, or a pattern on a shirt. But in order to support the required warping these would have to be able to perform, I need to carve them into a tiled grid of high resolution, then wrap the tiles around an imaginary sphere.  
  
Early tests showed that this could be done with things that are spherical. However, I'm having a lot of trouble with things that aren't based on spheres - like clothes. Although I worked out some pretty slick collision detection algorithms for them, I can't actually DRAW them.  
  
I thought, "Why am I doing this? It's ten times harder than I need, but the only added feature it supports is textures. And I can hack suitable textures into a simpler version!"  
  
So, once again my plan revolves around primitive sprites. I'm thinking about a "U" shape, a kind of full-bodied crescent. Linking many shapes together, I'll be able to create straight lines or curves of any variety. I'll support no sprites for the moment, but I'm hopeful about this working and getting to add sprites in the future. Faces will be illegible without sprites, so I'll need them sooner or later, unless I'm going to make some REALLY strange games.  
  
Hmm... actually, that has some appeal...  
  
Regardless, that's my current plan. Collision is fun and easy: circular systems (technically, quasi-spheres) detect collision for all systems. If something is a full circle, it's easy. Otherwise, I calculate based on collision location whether it is an actual collision or not. For example, the tilted oval draping of a long piece of cloth: that's the cloth adhering to a certain part of a collision oval. If something collides with that oval, it doesn't count as a collision until it impacts along the part of the perimiter which is "clothed". At that point, collision is worked out based on relatively simple physics. The cloth's collision oval distorts into a slightly different shape as it is forced to support the weight of the object colliding with it.  
  
Straight lines are no difficulty: instead of a circular collision system, use a square. It's simply a matter of choosing a different collision primitive. The collision primitives have mount points which allow for easy distribution of primitive shapes into lines and such. The difficulty I forsee is "filling in" the part of the material which is not the edge. We'll see how that works.  
  
I forsee some small problems trying to create tubular shapes - or any other shape which is one shape on one 2D axis and another shape on a different 2D axis. However, I can outlaw those. If you want a box, it has to be a box. A spherical shape has to be made entirely out of ovals.  
  
Right now, you're hopefully thinking, "How could this possibly work on the fly?"  
  
The answer is that solid objects - like bodies and chairs - have a set of "solid" collision systems. Things like cloth have "ephemeral" collision systems, which essentially clone the solids as far as their physics allow, then draw automatic collision systems to connect their covered solids together. Lastly, they draw automatic collision systems that descend from the 'ends' as necessary, hanging free (or flapping, whatever).  
  
Keeping track of the Z axis is going to be a bit of a pain, but I have... an idea!  
  
We'll see.  
  
Outlines are going to be a pain, not in that they will actually be difficult, but in that they will double the number of primitive shapes needed to represent a shape. I'll leave them out at first, but I can add them as needed.  
  
I hope to try this out and put some screenshots up in the relatively near future.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [3:40 PM](https://projectperko.blogspot.com/2005/07/more-mathy-bits-2.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112233289416627100 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112233289416627100&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112233289416627100)

[Newer Post](https://projectperko.blogspot.com/2005/07/paths-to-terrorism.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/07/social-play-purely-childish-view.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112233289416627100/comments/default)
