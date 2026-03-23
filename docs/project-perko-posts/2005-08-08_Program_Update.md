---
title: "Program Update"
date: 2005-08-08
url: https://projectperko.blogspot.com/2005/08/program-update.html
labels:
  []
---

## Monday, August 08, 2005 


### Program Update

Okay, I did a lot of work on the graphics program over the weekend. It's not gonna work - I can't fill in space. This means it would be only line art. Worse, I would have to figure out some way to make the layers above occlude the layers below. When I was going to fill, that was a non-issue.  
  
So I have to take a few steps back. As I always say: Too complex? Reduce!  
  
My original emotion engine thingie was 1 and 2 1/2 dimensions. One of those dimensions was free: rotation around the Z axis is included in the core architecture of Torque. My recent attempt was to turn those two 1/2 dimensions into two full dimensions - which was too much, since it meant I couldn't even use sprite graphics.  
  
Let's see if I can turn the two 1/2 dimensions into 1.5 dimensions. I need rotation around the Y axis. Rotation around the X axis can be limited to 30 degrees without any real loss.  
  
In addition, legs and arms are easy, since they are largely featureless. The errors in sprite squishing and shaping are acceptably minor.  
  
The problem is the head, torso, and loose cloth, which are both detail-intensive and unforgiving to that same squishing error.  
  
The difficulty is passably obvious: something looks different from the side and the front. So turning something has to change the way it looks.  
  
With a 3D rotation, this means it has to have differences at and between front, left, right, rear, up, and down. The combining is the hard part - what does it look like halfway between right and up? Essentially, the ability to go up and down multiplies the number of 'representations' by four, minimum.  
  
Is there any way to get a smooth-feeling rotation without needing "polygons"? I think so.  
  
My original goal was to manufacture the "polygons" to always be in an optimal "smooth" state, so that no matter how you looked at them, you'd never see jaggies or low-poly counts. I ran into some rather serious problem getting anything besides spheres to work when it was 3 degrees of freedom, but it shouldn't be that hard in 2.5 DoF. Just cut a sprite into vertical strips and display a subsection of them, with the ones in the "middle" being larger than the ones on the "edge". This is slightly different from my 3 DoF version, which cut them into squares and tried to tile them around a sphere. You see the level of complexity? Urgh.  
  
Please note: this isn't a "skin", like in 3D. It's a... well, it's a representation. For example, someone's nose would be represented by an image which panned from left nose to right nose. The "tip" of the nose would be the widest part of the picture. Would it work? Hrm. Maybe not. I'll have to putz around with it.  
  
Well, I'll give it a shot.  
  
Also, I dabbled with digital paints. I've always admired the way a good digital painting looks, so I decided to learn how to do it. Once I have something that doesn't make me blush to see, I'll post it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:33 AM](https://projectperko.blogspot.com/2005/08/program-update.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112351739390473203 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112351739390473203&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112351739390473203)

[Newer Post](https://projectperko.blogspot.com/2005/08/not-yet-beyond-good-and-evil.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/08/social-robots.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112351739390473203/comments/default)
