---
title: "Metaprogramming and Slogging"
date: 2006-06-04
url: https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html
labels:
  []
---

## Sunday, June 04, 2006 


### Metaprogramming and Slogging

For a few years now, I've wondered why I can program complex engines and full-sized business apps in the same amount of time it takes me to complete a relatively small game. It seems absurd. But I recently stopped and looked back over my code base. And now I know why.  
  
I'm a "metaprogramming" specialist. This functionally means I try to turn anything I program into LISP.  
  
This works really well for regular programs. By "regular" I mean "repeating" rather than "normal". Most business apps are just slight variations on a theme. So I build code which analyzes the situation and builds the necessary code, instead of manually programming it.  
  
To be honest, I haven't worked on many tight programming teams: the teams I worked on tended to be of the "you do this part, he'll do this part" variety rather than the "let me see your code" variety. So, I was surprised to learn that many (most?) programmers manually write all these variations (often using cut and paste). This is perhaps the worst possible method to write the code. It's extremely difficult to make changes and prone to breaking in a heartbeat, in addition to simply taking longer.  
  
Engines - simulations or game systems - are similar. They use a set of rules to determine the world state. Writing an interpreter which incorporates those rules is the same as writing a bunch of code which analyzes a database and produces a web page.  
  
But programming a *game* is very different.  
  
When I'm programming a game, I feel like I'm wading through mud. This is because I can't use many macros - there's very little outright repetition outside the engine itself. The art, the plot, the levels - they all need to be created manually. Programmed explicitly.  
  
The end result is that I have the same amount of code, but I actually have to write all of it for a game. For a business app or engine, it literally writes itself.  
  
Now that I'm into the level generation part of Kampaku, this is striking me more and more. Each level is something which has to be manually drawn and programmed in.  
  
But that isn't the worst part. The worst part is that manual code and self-writing code have a ragged edge between them. Neither works as "smoothly" as it should, because when one side changes, the other side doesn't update properly. You end up with a lot of legacy code and wondering whether you should make the next mod as a macro or a manual bit.  
  
(I've heard that programmers who stick entirely to manual code suffer from the same problem, so perhaps it's simply that manual code has ragged edges. Someone will have to tell me.)  
  
Well, Kampaku is functional, but it's pulling up short. The manual code is simply too complex to allow me to add the social engine I want to include. In fact, the game probably isn't worth playing without the social engine.  
  
I'm going to have to think for a day or two. I think I'm going to have to radically rethink my game programming methods, now that I know the trouble. I had good success with Machine City until I lost it, and it was almost entirely macros. Can I make every game almost entirely macros and custom domain languages?  
  
Including content?  
  
Heh. I can try.  
  
I think I had better investigate Flash tomorrow. I wonder if it supports multiplayer games...

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [3:14 PM](https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114946034027170181 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114946034027170181&from=pencil "Edit Post")


#### 7 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I think custom domain langauges are a good ticket. I'm currently researching Facade, reading the better papers and whatnot. They have procedural content, but of a different sort than something like Machine City, its supportive rather than generative. Of course, all their ABL code was manually done, hence the five year dev time.  
  
I'm thinking thats the approach to take, design a custom langauge that allows agile scripting of particular social dynamics in the context of your engine. It also makes tuning do-able.

[4:56 PM](https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html?showComment=1149465360000#c114946538268349865 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114946538268349865 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/13280914228859902589)

[Duncan M](https://www.blogger.com/profile/13280914228859902589) said...

Flash does do multiplayer. You just have to route all communication via a server. This can be done slowly (through PHP, or similar, scripts and databases) or real-time (via XML and a java server). There may even be more ways, as those were what I was using a few years ago. With AJAX technology, there may be even more integration methods.  
  
I really need to look into Flash (especially the open source options) to see what has changed. I think that the new code engine might be a lot more robust than I remember.

[9:36 PM](https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html?showComment=1149482160000#c114948219610641879 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114948219610641879 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I really need to find either game-specific tutorials or someone to teach me - this movie tutorial stuff is not my style. I'm getting nowhere useful.

[9:49 PM](https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html?showComment=1149482940000#c114948296227929921 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114948296227929921 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I write pretty much manual code, largely because it's cleaner than what you can get with generated code. Though this also depends on what you are writing as well since I am no believer in silver bullets and sometimes I wonder why companies insist on writing certain apps from the ground-up.  
  
There is always the problem of the legacy. How "ragged" your edges are going to be will be determined entirely by how well the software was designed. Unfortunately, the more unplanned and unforeseen features you add to an existing piece of software, the more "ragged" it is going to become. So I might design a great application and then have the team enforce very tight coding standards. If the app is designed well enough, adding more functionality should not be a problem.  
  
Unfortunately, over time, this is going to break down because sooner or later someone is going to add something that is not well supported by the system or come up with a requirement that no one would have guessed the app would ever support.  
  
Which is about the time I start breaking out the word every client/customer hates to hear. "Rewrite". You can't avoid it. I don't care if you're manually writing the code or generating it. The better designed the software, the longer you can hold that beast at bay. Unfortunately, it's been my experience that most software is not well designed and most companies avoid rewrites long past the point they should have just done them.

[8:02 AM](https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html?showComment=1149519720000#c114951977047756051 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114951977047756051 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Jason: I don't have those problems when I program using Lisp fundamentals. "Rewrite" is common, fast, and can be done in sections without legacy problems. The resulting code isn't as tight as it could be, but it's hardly messy and quite clear.  
  
Have you ever tried programming in a Lisp dialect?

[8:53 AM](https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html?showComment=1149522780000#c114952279182169275 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114952279182169275 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

No I have not but I'll try anything once.

[2:18 PM](https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html?showComment=1149628680000#c114962871869296010 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114962871869296010 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Generally it takes three or four tries to learn how to use Lisp in the first place. Keep us posted about your experience.

[2:44 PM](https://projectperko.blogspot.com/2006/06/metaprogramming-and-slogging.html?showComment=1149630240000#c114963028733292033 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114963028733292033 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114946034027170181)

[Newer Post](https://projectperko.blogspot.com/2006/06/chinas-so-lovable.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/06/yeaaaaaarrgggggh-story-time.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114946034027170181/comments/default)
