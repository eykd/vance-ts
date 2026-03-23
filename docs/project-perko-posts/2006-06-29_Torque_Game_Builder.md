---
title: "Torque... Game Builder?"
date: 2006-06-29
url: https://projectperko.blogspot.com/2006/06/torque-game-builder.html
labels:
  []
---

## Thursday, June 29, 2006 


### Torque... Game Builder?

So, I'm finally managing to upgrade from Torque 2D Alpha 2 to "Torque Game Builder", which is apparently the beta version of Torque 2D.  
  
I haven't got to play with it much, but I'm already excited. They have packages!  
  
Packages are when you can define code without executing it. The primary usefulness is making polymorphic functions. You can have a global function, then have another version of that function in a package. When you load the package, it overwrites the global function.  
  
So what? Well, here's the kicker: when you *unload* the package, the global function comes back.  
  
For a simple example, lets say you want your player to be "dizzy" for a while. Well, just load a package which overwrites the default control functions with something less reliable. Then, when the timer is up, *unload* them.  
  
That's a pretty poor example, because it can be easily emulated by checking a "dizziness" variable and calling a different function. But, take my word for it, packages are a very powerful design feature.  
  
Also, Game Builder has a snazzy interface that handles what appears to be the vast majority of the busywork. To me, that's secondary to the *radically enhanced* capabilities that packages give. So many of my algorithms are suddenly simplified!  
  
If you have an early adopter T2D license, *go download the new version*.  
  
No license? You can buy it. It's no longer hella-cheap, but it's still pretty cheap.  
  
My vigor is renewed! Expect something fun soon!

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [2:07 PM](https://projectperko.blogspot.com/2006/06/torque-game-builder.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/115161611542865316 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=115161611542865316&from=pencil "Edit Post")


#### 1 comment:

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

That's interesting, because I can't find any documentation for them ANYWHERE.  
  
Kind of irritating. I would have been using them for a year, if they had been listed somewhere obvious.

[7:40 AM](https://projectperko.blogspot.com/2006/06/torque-game-builder.html?showComment=1151678400000#c115167842161376099 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/115167842161376099 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/115161611542865316)

[Newer Post](https://projectperko.blogspot.com/2006/06/on-simplified-combat.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/06/some-economics.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/115161611542865316/comments/default)
