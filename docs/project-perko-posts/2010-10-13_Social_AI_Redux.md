---
title: "Social AI Redux"
date: 2010-10-13
url: https://projectperko.blogspot.com/2010/10/social-ai-redux.html
labels:
  - social simulation
---

## Wednesday, October 13, 2010 


### Social AI Redux

I've talked a lot about social AI in the past, but it's been at least a year, so here's another post about it. Please note that by "social AI", I really mean "the appearance of social AI". I don't have any intention to solve any fundamental AI challenges.  
  
One issue with social AI is that it requires really dense, nuanced information to react realistically. On the order of hundreds or thousands of times more nuanced than today's video games. Perhaps the Kinect will provide enough human feedback, barely, but in more general situations you're going to have to synthesize a lot of the density out of the game world without many cues from human input.  
  
As an example, if your friend touches you, the exact meaning varies hugely depending on the location and type of touch. Arm, shoulder, head, back, waist, chest, hand, etc, etc. Each location gives a different impression. Is it a tap, a pat, a reassuring grip, a restraining grip, a rap, a friendly punch, a warning punch, a caress, a guiding push?  
  
To say that there are N ways to get touched, or even N thousand ways, is a mistake. The fact is that there are an infinite number of ways to get touched. You can't list them all, and even if you could, you don't want to try to interpret them based on a big list. Instead, you want input that is sufficiently dense so as to allow the program to figure out the nature of the touch based on context.  
  
By the way, this density is also important to humans. Humans who are stuck in simple and restricted environments tend to have simpler and less nuanced responses. They often go a little bit batty, like an edge case in a simulation. For example, being stuck in an arctic base for six months. This is fairly well documented, to the point where there are specific recommendations for how to keep your people from going nuts when you station them somewhere with so little stimulation.  
  
Well, aside from that, there's also a ton of interpretive complexity. What is a friendly tap in one country might be an aggressive warning in another, or even a flirty move. Even within one country, different people will react differently. Even the same person will react differently depending on the moods of the people involved and the surrounding context.  
  
The normal method of trying to make a social AI for a game is to give you a variety of interactions, and the AI responds to those interactions in a fairly straightforward way. At its peak, this consists of basically building up a tremendous expert system which takes the mood and the situation and the type of tap and then spits out a response.  
  
This is not a good way to do it for the same reason that carefully scripting every branch of a plot is not a good way to do it. A) it creates distinct 'paths' or 'branches', rather than giving real freedom. B) it gets radically more complex with every choice or branch you add.  
  
So, to quickly state where we are:  
  
You need to do social interactions with a culturally and contextually aware algorithm, rather than using a state machine or expert system, if you want really adaptable social interactions.  
  
You need extremely varied and nuanced inputs to feed that algorithm, or you'll end up basically creating a state machine. AKA "The Arctic Base Issue".  
  
Very few or perhaps none of the human input devices available to you can actually transmit that much nuance.  
  
...  
  
That's really only a tenth of the story. It's the foundation on which you start to talk about social AI, or the appearance of social AI. But it's plenty long as is, I think.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:07 AM](https://projectperko.blogspot.com/2010/10/social-ai-redux.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3058357631325828981 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3058357631325828981&from=pencil "Edit Post")

Labels: [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 5 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

A friend tested the Kintect kit when he was inside a major 3rd party publisher and it can barely parse someone standing still.  
  
I prefer to design systems to generate contexts people people, who bring the cultural awareness to the table. The challenge is a lot more tractable then, as your matric of transaction costs is being stretched from the inside-out, rather than the other way around.

[8:14 AM](https://projectperko.blogspot.com/2010/10/social-ai-redux.html?showComment=1286982867958#c7128147378749506860 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7128147378749506860 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I can't parse that paragraph.

[9:48 AM](https://projectperko.blogspot.com/2010/10/social-ai-redux.html?showComment=1286988484378#c1539438420575242804 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1539438420575242804 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/03856546733839775093)

[Adrian Lopez](https://www.blogger.com/profile/03856546733839775093) said...

"*This is not a good way to do it for the same reason that carefully scripting every branch of a plot is not a good way to do it. A) it creates distinct 'paths' or 'branches', rather than giving real freedom. B) it gets radically more complex with every choice or branch you add.*"  
  
I've written [a new blog post](http://gamedesigntheory.blogspot.com/2010/10/narrative-and-consequences.html) that touches on this issue. My own position is that neither humans nor current AI algorithms are good enough to produce compelling branching narratives and that it's therefore better to abandon any attempt at life-like freedom and focus instead on little "narrative puzzles" in the context of a broader narrative.

[11:18 AM](https://projectperko.blogspot.com/2010/10/social-ai-redux.html?showComment=1287166713619#c4999445494742158454 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4999445494742158454 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I'll read your post in a bit, but based on what you stated, I agree that's a good way to do it.  
  
However, I believe that the inability to create algorithmic narratives / algorithmically modified narratives is not some fundamental law. I think that we can make progress.

[11:25 AM](https://projectperko.blogspot.com/2010/10/social-ai-redux.html?showComment=1287167158411#c6541801447176055476 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6541801447176055476 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/03856546733839775093)

[Adrian Lopez](https://www.blogger.com/profile/03856546733839775093) said...

Yeah. It's not that I've lost hope in AI, but I think it's difficult enough that I'd rather admit it's too difficult for me and go the simpler route.

[11:42 AM](https://projectperko.blogspot.com/2010/10/social-ai-redux.html?showComment=1287168143248#c4910365200465887480 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4910365200465887480 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3058357631325828981)

[Newer Post](https://projectperko.blogspot.com/2010/10/proxy-publisher.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2010/10/interactive-movies.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3058357631325828981/comments/default)
