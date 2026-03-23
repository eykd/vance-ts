---
title: "Blade and Interactive Visual Novels"
date: 2008-04-29
url: https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html
labels:
  []
---

## Tuesday, April 29, 2008 


### Blade and Interactive Visual Novels

I have it in my head to make a simple adventure game, and it seemed to me that the easiest way to do it would be to make it in the style of one of those Japanese games that's mostly portraits and text. To that end, I found a free piece of software: the Blade Engine.  
  
Aside from the way it stamps every screen with its logo, at first glance it appears solid enough. However, if you [look at it](http://www.bladeengine.com/BladeEngine/manual/manual.html), it's not very well done, not very modern.  
  
It has some very strange scripting restrictions. First off, the scripting language is very strange in and of itself - you can see that clearly in the manual. It appears to be inherited from 1991.  
  
What you might not be able to see so clearly is that every choice you offer the player requires a new script file to represent the result. So, if you had, say, three things for a player to look at in a room, each would require its own file. A file which is, in all probability, five lines long. If you have thousands of choices, you end up with thousands of tiny text files, all in the same directory, not organized by any force other than your naming convention... for a nonlinear adventure, that's pretty much a death sentence.  
  
Also, it does not appear to support any kind of subdirectories, custom functions, etc. The pay version doesn't seem to have any superior layout, although they have a file packing system which would probably solve the problem that anyone playing your game could easily go and edit the scripts, if they could figure out the primitive scripting language.  
  
Variables cannot be named, but are instead the numbers from 0 to 99, as in "@\[1\]=9" sets the first variable to "9". This would require a confusing lookup table to remember which variables correlate to which events in the game, and I find my planning comes dangerously close to 99 variables as it is...  
  
No loops, no switches, barely an "if" structure...  
  
Moreover, the graphical display is extremely limited. For example, you cannot have a character built of layers - body and expression separate. Or, rather, you can, but there are only three layers in total, so you'd be limited to a single character on screen at a time. A layer can only load one image at a time...  
  
Okay, okay, I get it, it's just for interactive novels, it's not intended for such complex games.  
  
What is?  
  
Flash? Am I going to have to forever build the guts of the various interfaces anew with each project?  
  
I know there are some oldschool adventure game programs that allow you to graphically edit the rooms and so forth, but I'm not looking for something with that much animation. Maybe one of them could be used, ignoring all of the "walking" nonsense?  
  
Maybe I should try Game Maker after all?  
  
Anyone have any experience making games this simple?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [4:47 PM](https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3796553767705604830 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3796553767705604830&from=pencil "Edit Post")


#### 7 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01867491782144075781)

[DmL](https://www.blogger.com/profile/01867491782144075781) said...

Game Maker gives you rooms, all the sprites you could want, easy variables... it's a step up in complexity from Blade and not nearly as complex as flash.

[7:18 PM](https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html?showComment=1209521880000#c2659787685529508823 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2659787685529508823 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It also, apparently, doesn't know the meaning of the words "alpha channel" and thinks I just want everything black to be transparent. What's up with THAT?

[8:13 PM](https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html?showComment=1209525180000#c7981500042718751036 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7981500042718751036 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Try the WinterMute engine (dead-code.org) - extremly flexible, easy to learn and OPEN SOURCE :)  
  
We use it for our Adventure games, and it is an amazing piece of software.

[7:03 AM](https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html?showComment=1209564180000#c5242269697016256320 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5242269697016256320 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Thanks! I'll look into it!

[9:09 AM](https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html?showComment=1209571740000#c5028430038911329335 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5028430038911329335 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It looks great! I'll try to make something in WinterMute. Thanks very much!

[7:30 PM](https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html?showComment=1209609000000#c7507160936417562203 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7507160936417562203 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

A bit late, but if you still have any interest in putting a visual novel style game together, the best choice for it would probably be Ren'Py (renpy.org). It's MIT licensed, cross-platform, and supports just about everything you may have seen in a Japanese (or translated) VN. It's also built with python, and although scripting is based on a set of high-level commands, you can also work at the python language level for anything complicated.

[6:11 PM](https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html?showComment=1219367460000#c6361968816304882574 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6361968816304882574 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Late, but I'm always interested in platforms. I've never seen this one, thanks!

[6:15 PM](https://projectperko.blogspot.com/2008/04/blade-and-interactive-visual-novels.html?showComment=1219367700000#c7766419198166502429 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7766419198166502429 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3796553767705604830)

[Newer Post](https://projectperko.blogspot.com/2008/05/hooray-for-uncanny-valley.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/04/legendary-brain-fuck.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3796553767705604830/comments/default)
