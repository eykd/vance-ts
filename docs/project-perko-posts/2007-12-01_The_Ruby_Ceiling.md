---
title: "The Ruby Ceiling"
date: 2007-12-01
url: https://projectperko.blogspot.com/2007/12/ruby-ceiling.html
labels:
  []
---

## Saturday, December 01, 2007 


### The Ruby Ceiling

I designed this fun little "civ light" game to build in Ruby on Rails. I even got ImageMagick working for synthesizing the map. Only now that everything's working, I find I've hit a fatal flaw in my otherwise clever plan:  
  
Ruby is really, really, really, really slow.  
  
You don't notice when you're doing something simple, like listing grocery receipts or whatever. But when you tell Rails to create a few thousand entries (tiles on a map), it chokes and essentially dies. I'm sure it would finish eventually, probably. Maybe. But no time this year.  
  
This is something that can be done pretty fast in most situations. I've done something similar in Flash, it takes less than a second. But the combination of Ruby's poor performance and Rail's need to write to a database record by record gums the works up fatally. In order to get around the problem, I would have to generate the map a tiny piece at a time, which would be feasible if what I wanted was a completely crap map... but it's very hard to actually create a realistic-feeling map when you work on it in 5x5 tile chunks!  
  
Maybe an answer will pop into my head (or into my comments), but this is a really irritating flaw. I've heard there's a new version of Ruby out, but trying to get Rails to run properly on a beta language... is not something I care to try.  
  
It's not a flaw I expected to run into.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:21 PM](https://projectperko.blogspot.com/2007/12/ruby-ceiling.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2499421372611381527 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2499421372611381527&from=pencil "Edit Post")


#### 6 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Wouldn't be the first time something like this happened to you. :P

[8:39 AM](https://projectperko.blogspot.com/2007/12/ruby-ceiling.html?showComment=1196613540000#c6688349211414937571 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6688349211414937571 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

No, I don't worry about optimization with a prototype, so I'll usually hit some edge somewhere. But this is a whole new level of slowdown. Ruby makes Flash look like a world-class sprinter.

[8:59 AM](https://projectperko.blogspot.com/2007/12/ruby-ceiling.html?showComment=1196614740000#c1096158524021229550 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1096158524021229550 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15516414416783046990)

[Olick](https://www.blogger.com/profile/15516414416783046990) said...

So wait. Are you putting all these tiles into a database? Or did I read that wrong?

[8:22 PM](https://projectperko.blogspot.com/2007/12/ruby-ceiling.html?showComment=1196655720000#c6096231182611798292 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6096231182611798292 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It's impossible NOT to. There's no other choice, because even session variables are done by database.  
  
I expected it to be slow, since it was writing to a database. But I do writing to a database for a living, and I've never had any performance like this.  
  
I don't mean that Rails takes a bit to do this. I mean it takes more than ten minutes.  
  
And I think most of the slowdown is in Ruby, not Rails. The records do require some calculation and, as I've said, I've never seen a database system this slow.  
  
I'm putting it in space, now. I figure, stars don't have to be coherently placed.

[6:26 AM](https://projectperko.blogspot.com/2007/12/ruby-ceiling.html?showComment=1196691960000#c5574717361250131917 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5574717361250131917 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15516414416783046990)

[Olick](https://www.blogger.com/profile/15516414416783046990) said...

Thats dissapointing. Ruby is very usable. I suppose a performance hit should be expected, but not an unreasonable one...  
  
But putting stars in a logical formation could cause some very interesting scenarios! Set the game near a galaxy's central cluster, where industry and trade and diplomacy abound, or place the game near the fringes of a galaxy and encourage martial combat and piracy... I guess those parts depend on the scale of the game.

[12:34 PM](https://projectperko.blogspot.com/2007/12/ruby-ceiling.html?showComment=1196714040000#c7832323907179771068 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7832323907179771068 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I was thinking of doing something similar, but that's a whole lot simpler than trying to determine mountain ranges and where deserts are...

[3:10 PM](https://projectperko.blogspot.com/2007/12/ruby-ceiling.html?showComment=1196723400000#c2659099916640506230 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2659099916640506230 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2499421372611381527)

[Newer Post](https://projectperko.blogspot.com/2007/12/tricky-synthesis.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/11/social-mmo.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2499421372611381527/comments/default)
