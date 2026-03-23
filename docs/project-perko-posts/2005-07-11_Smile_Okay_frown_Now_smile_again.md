---
title: "Smile! Okay, frown. Now smile again!"
date: 2005-07-11
url: https://projectperko.blogspot.com/2005/07/smile-okay-frown-now-smile-again.html
labels:
  []
---

## Monday, July 11, 2005 


### Smile! Okay, frown. Now smile again!

Although I didn't get nearly as much done this weekend as I wanted to (and wow, do I feel tired today) I did get a chance to tinker with some new software toys.  
  
No screenies, I'm afraid. It doesn't look like much yet.  
  
The emotion engine (which will have to be named soon: I can't really call it "the emotion engine", since that is big-time copyrighted) is actually coming along. I'm experimenting with drawing the face with nothing but solid half-circles of a particular color. Commonly, black obscured by flesh tone.  
  
It took me a long time - around six or seven hours - to even grasp a basic concept of how to manipulate these things correctly. I haven't had a chance to actually do much yet, and the rotation is a bit broken. However, there is a pleasantly smooth animation and easy transition between smiling and frowning, which is light-years ahead of the sprite graphics of the last version. It can handle many of the mouth's common shapes, although I'm having trouble mastering crooked expressions. I'll be implementing open mouths and lips in the very near future.  
  
There are only two real problems at this stage, and they are related. The first problem is that I have to worry about 'bleed'. The pink half-circles which obscure the black half-circles (allowing them to be 'lines') are often considerably wider than the black half-circles, because of the need to get an arc of significantly less than 180 degrees. This means I have to be very careful with my layering, because they will obscure other lines which aren't part of, say, the mouth or the eyes. This gets considerably more complex when the obscuring pink sprites are constantly changing shape as the expression dictates.  
  
The other problem is similar: I have to constrain the activity of the sprites in general to 'realistic' levels. Of course, I choose what realism is - I could choose mouths which can be wider than the face, for example. But I won't, mostly because of the problem with 'pink bleed', as mentioned last paragraph. So, I have to have all of these sprites inter-related in really complex ways.  
  
Both of these problems might be solved by creating another sprite which was, instead of a half circle, a rather tiny SLICE of circle, say 120 degrees' worth. I may formulate with that now. But the difficulties, although reduces, would remain unchanged. Here, let me show you:  
  
Maximum width of lips: width of face at mouth location times base mouth width (a number between 0.5 and 0.8, say). That's not too hard. But then I get to modify it by the angle the mouth is blocked at. A mouth where 180 degrees are visible is "full width", but if I obscure it down to, say, 90 degrees, then the 45 degree "wings" are blocked, and the whole sprite ends up being something like 70% its "real" width. Calculating out this is difficult, but I think I found a way around it using a Torque 2D native function which determines whether a point is inside a sprite or not. This is more complex than it sounds because much of the sprite is clear and should not count, so math will have to determine whether a point inside the sprite is actually INSIDE the sprite, or merely inside the square 'collision bracket'. I might be able to specify a non-square collision polygon, but I'm not sure if that's compatible.  
  
So, as you see, it's somewhat complex.  
  
I'm hoping to map it on the actual musculature of the face, with which I have some passing knowledge. By crafting 'virtual muscles' and 'tying' them to specific points on the sprites, I can specify maximum stretch and correct shape distortion, as well as allowing for differing expressions between different faces.  
  
Whew.  
  
I also designed a game which utilizes this emotion engine to its fullest. :)

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:49 AM](https://projectperko.blogspot.com/2005/07/smile-okay-frown-now-smile-again.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112110535255480686 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112110535255480686&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112110535255480686)

[Newer Post](https://projectperko.blogspot.com/2005/07/gta-sex-game.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/07/coffee-and-coding-part-second.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112110535255480686/comments/default)
