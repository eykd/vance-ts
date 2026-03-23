---
title: "More Mathy Bits"
date: 2005-07-21
url: https://projectperko.blogspot.com/2005/07/more-mathy-bits.html
labels:
  []
---

## Thursday, July 21, 2005 


### More Mathy Bits

The 2D engine I'm building is going through very early feasibility testing. There's a few things about it that are becoming clear.  
  
What I am essentially doing is defining a formula shape. If I bend inwards on the X axis at, say, Y=0 (the middle), then that inward bend wraps all the way around. Unlike a model, where a variety of points can be specified, I'm specifying three perimeters (actually, two perimeters, and synthesizing the third) and using them to build all the points automatically.  
  
This should be good enough. It has a few drawbacks, like the fact that the face will have to be very carefully sculpted from limited-span shapes. IE the forehead would be from, say, Y = 0 to max. The nose would be another isolated section, as would the chin. This shouldn't be too bad: a simple analysis of the human body shows that most of it is build of cylindrical shapes which have no weird protrubances that aren't, in faact, new cylindrical shapes.  
  
I'm running into a scripting wall - I simply don't knwo enough about TorqueScript, and all the tutorials are behind the Torque wall, which I can't get through since I own Torque 2D rather than Torque.  
  
Still, I can get around that. It might be a bit cludgy, but... I can get around it.  
  
Expect early screenies on Monday!

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [4:18 PM](https://projectperko.blogspot.com/2005/07/more-mathy-bits.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112198828457623746 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112198828457623746&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112198828457623746)

[Newer Post](https://projectperko.blogspot.com/2005/07/seeing-doctor-receiving-global.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/07/endless-fire-shmup.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112198828457623746/comments/default)
