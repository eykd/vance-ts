---
title: "A Programmer's Vacation"
date: 2005-07-05
url: https://projectperko.blogspot.com/2005/07/programmers-vacation.html
labels:
  []
---

## Tuesday, July 05, 2005 


### A Programmer's Vacation

All images < 20k, unless otherwise noted.  
  
So, I relaxed over the weekend and made some little toys I've always wanted to make.  
  
THANK YOU, Garage Games, for Torque 2D. These toys are ones which I've tried to make before, but had a considerably more difficult time. With Torque, they were FUN to make.  
  
The first thing I made was a dancing figurine. Using realistic joint limits and some semblence of balance and inertia, I created a dancing figurine. The dancer can be extended and limited easily - you can add more legs, take away some arms, or put on wings - whatever you like! Here's some pictures. Warning: although these are work-safe, anyone glancing into your cubicle may think you're looking at porn. Because the figurine is pink and person-shaped.  
  
[Here.](http://www.projectperko.com/images/dance01.jpg) [Here.](http://www.projectperko.com/images/dance02.jpg) [Here.](http://www.projectperko.com/images/dance03.jpg) [Here.](http://www.projectperko.com/images/dance04.jpg) [Here.](http://www.projectperko.com/images/dance05.jpg) [Here.](http://www.projectperko.com/images/dance06.jpg)  
  
The screenshots don't really do it justice, though. The point was the movement. It is fluid and very human.  
  
The problem, of course, is that the figure can't TURN. Which means that it is very UNREALISTIC and, moreover, totally useless. I could give it the ability to turn - thirty degrees either way wouldn't be too incredibly hard. But even that would not be sufficient for use in a video game. And making it fully turnable - I might as well make it 3D, since the method would be essentially that.  
  
So that toy is pretty much useless, aside from screensavery goodness.  
  
The second toy is NOT useless. It is, in fact astonishingly useful. And I'm shocked at how well it came out for the amount of work I put into it (<15 hours, including drawing the sprites).  
  
One of the things that has always struck me about games is the way they TOTALLY MISS THE POINT. "We have the best facial animations", "you can see their expressions - totally realistic!"  
  
Bullshit! Body languages is as critical as facial animation, and is actually more game-friendly. But nobody really uses it. I see some stupid "laugh" animation, or a woman who's supposed to be "flirting", but it's just on the face. That makes it FAKE. That's worse than having BAD expressions.  
  
One of my obsessions has been, for years, making a kind of "emotional engine" which can animate a character portrait (bust-view) realistically. You want someone to laugh, you need the way they tip their head back a little and their body shakes, followed by the way they either close or roll their eyes and shake their head. You want someone flirting, you have to get the pitch and turning of the head, the foreward cant of the body. All with a minimum of actual animation.  
  
The difficulties are many. I tried 3D, but that requires both a high-detail model and some difficult transformations and joint work. It still looked fake. I wanted to try 2D, but the problem with that is, of course, that 2D doesn't take well to turning "left" and "right", although it does take well to the facial gymnastics and exaggeration which I was persuing.  
  
Well, I made it 2D this weekend. The actual expression engine is pretty weak, but I was concentrating on the body language and parallaxing correctly, so I can forgive that.  
  
[Here is what the screen looks like (50k).](http://www.projectperko.com/images/emoti01.jpg) A clever programmer might be able to figure out the core of my approach from that screenshot. A really clever one might be able to foretell the kinds of problems I would have. Some of my math is still a bit Mickey Mouse, but up to about thirty degrees off true, it holds. Which is fine, since the sprites only look decent to about that angle anyway.  
  
The engine can handle numerous emotions and body language pieces. It's actually surprisingly adept at looking like a petulant toddler, a flirtatious... flirting-person, or an angry asshole. All without ANY classical sprite animation. The screenshots aren't great examples, because the power lies in the MOVEMENT of the figure. The mathematical quirkeries, when left to randomization, tend to average out to a kind of worried look. Under actual controls, you can get any kind of expression, but letting the system putter around at random does get you a higher percentage of nervous expressions. Just explaining the bulge in the screenshot ratio - it's not some questionable fixation, just math.  
  
[Here.](http://www.projectperko.com/images/emoti02.jpg) [Here.](http://www.projectperko.com/images/emoti03.jpg) [Here.](http://www.projectperko.com/images/emoti04.jpg) [Here.](http://www.projectperko.com/images/emoti05.jpg) [Here.](http://www.projectperko.com/images/emoti06.jpg) [Here.](http://www.projectperko.com/images/emoti07.jpg)  
  
In addition, because of the way it works, you can swap new parts in - such as hair or costumes or eyes - but, additionally, you can change the actual layout of the face! Here's a few faces I popped up once I'd plugged in some randomization:  
  
[Here.](http://www.projectperko.com/images/emoti08.jpg) [Here.](http://www.projectperko.com/images/emoti09.jpg) [Here.](http://www.projectperko.com/images/emoti10.jpg) [Here.](http://www.projectperko.com/images/emoti11.jpg) [Here.](http://www.projectperko.com/images/emoti12.jpg) [Here.](http://www.projectperko.com/images/emoti13.jpg) [Here.](http://www.projectperko.com/images/emoti14.jpg)  
  
Obviously, the sprites are simplistic - I didn't spend much time on them. Before I create a 'release' version to incorporate into my games, I'll need to refactor the whole thing and include a much more detailed facial expression engine. I know how to do it, and I think that'll be a lot of fun! Things I don't know for sure how to do, but have some theories: fix the tiny math weirdnesses, handle hair more realistically.  
  
I've no plans to slow my actual work program I'm making - this is my 'vacation' program that I chug along on while at home.  
  
Still, the idea is strong, the code is proof. Any game I release will contain fully 'animate' characters. Again, the screenshots don't really do justice: the smooth animation going from one emotion to another - or simply reveling in one emotion through several postures - is powerful, if a little cartoony. Just tell the figure what it's supposed to feel, and let it do all the work. You could even set up an emotional matrix: obviously, a six year old who is embarrassed acts quite differently than a sixty year old who feels the same way. This is fairly easy to program.  
  
It'll look good, it'll feel good, and it'll cause a feeling of empathy that most character portraits and "facial animations" can't reach. I am pleased.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:32 AM](https://projectperko.blogspot.com/2005/07/programmers-vacation.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112058312641529662 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112058312641529662&from=pencil "Edit Post")


#### 2 comments:

[!\[Image\](https://cfoust.8bit.co.uk/images/myeyes.jpg)](https://www.blogger.com/profile/04620030154228411039)

[Textual Harassment](https://www.blogger.com/profile/04620030154228411039) said...

I'd just like to say that that's brilliant, and so are you. Wish I could see it in motion. I even like the art. More realistic drawings would just more work to make it look right.  
  
I wish I was the tye of person who did such amazing work to relax. Sooo lazy.  
  
CFoust

[3:22 PM](https://projectperko.blogspot.com/2005/07/programmers-vacation.html?showComment=1120602120000#c112060214653554620 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/112060214653554620 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I'll release the .exe version... when I figure out HOW... and then you can see it all move!  
  
I can't claim that ALL of my relaxing is productive. Much of it is pretty wasteful. But a productive relaxing period is very energizing. :)

[3:47 PM](https://projectperko.blogspot.com/2005/07/programmers-vacation.html?showComment=1120603620000#c112060367408559273 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/112060367408559273 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112058312641529662)

[Newer Post](https://projectperko.blogspot.com/2005/07/people-are-smart.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/07/july-fourth-pompous-intellectuals.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112058312641529662/comments/default)
