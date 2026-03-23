---
title: "The Second Time"
date: 2006-04-17
url: https://projectperko.blogspot.com/2006/04/second-time.html
labels:
  []
---

## Monday, April 17, 2006 


### The Second Time

I've been doing a lot of thinking on the subject of social AI, automatic character generation, and simple narrative generation. To make a long story short, I've got some solid stuff, but it's not sparkling. (Maybe I'll polish and release some of it, but I'm not satisfied...)  
  
What I'm thinking now is a bit different.  
  
I just finished watching someone play through the end of Radiata Story and *immediately start again*, and although he didn't actually do very much in the new game, he shows signs he'll continue. I watched someone finish playing a game and pass the controller over to next person, who starts playing the same game, roughly the same levels, with his own save.  
  
I've been thinking about narrative automation. Even if it's possible, I'm not sure it's a good idea.  
  
What we want isn't narrative automation: we have a story we want to tell. We want to communicate, and the players want to hear the story. Moreover, if it's artfully written, they'll gladly play it multiple times. System Shock II, for example. So, we don't want random or automated storytelling.  
  
What we want is to be able to tell our story in the most interesting way and with the least effort. What we want is to be able to tell the computer the story, and then have the computer flesh out the details.  
  
And I think I have an idea as to how to do that...  
  
It's not done, though. I'd like to hear some other ideas, see if I can get the last pieces to gel. What's your opinion?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:04 PM](https://projectperko.blogspot.com/2006/04/second-time.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114532987749834307 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114532987749834307&from=pencil "Edit Post")


#### 4 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Two orthogonal problems.  
  
With your 'dreamland' automated storytelling idea, you were trying to solve the problem of generating the bare elements of a simple story, I assume from scratch, with the help of preconstructed character archetypes. That's not a useless problem to solve. It's good for creating seed-ideas that might poke someone into creating something interesting. I've heard them called 'plot bunnies' before, because they tend to spawn stories.  
  
What I think you're suggessting now is creating such a framework or starting point yourself, and having a computer fill it in to make an enjoyable story. Why? What problem are you trying to solve by automating this process?

[6:47 AM](https://projectperko.blogspot.com/2006/04/second-time.html?showComment=1145368020000#c114536803794513166 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114536803794513166 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Actually, that's three orthogonal problems...  
  
The problem I'm going to solve now, if I can, is to create middleware which creates the moment-to-moment game around a plot and world you design. Functionally, a social AI for characters you create.  
  
Tossing away the need for scripting everything carefully would radically accelerate the programming process.

[7:00 AM](https://projectperko.blogspot.com/2006/04/second-time.html?showComment=1145368800000#c114536881389212897 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114536881389212897 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Thats fucking ambitous Craig, I think you definetly need to test these theories in something playable and make your bread back with something polished. Then, yeah, try the middleware, but I'm sure you're aware thats a very ambitous approach to interactive drama, A. K. A. the Crawford approach. Context specific models, as you said earlier, might be the more tenable approach for the near future.  
  
My understanding of interactive narrative is that you give the player well elucidated dynamics, like being sinner or a saint, or treating the girl like an sex object or like a person, or responding to a political change by supporting the revolution or stomping it out. You then let player's find thier desired nuance along these dynamics, and their confluence creats a very different experience for each person. I think your automations need to support that sort of gameplay, as well as the more local play of second-guessing the characters and choosing your social actions appropriately.  
  
I was going to hire you in a year and half (provided my efforts proceed smoothly and profitably) to do something like this, but hell, get started on the design framework for some middleware now, I'll buy it from you.  
  
So does this mean you're the forth party to try and build a commercial drama engine? (The other three being Crawford, Mateas and Stern, and Santiago Siri, in chronological order).  
  
I'm trying to help Santi solve some problems for his design, maybe we should get an e-mail thing going.  
  
Will this model include an inference engine ala HMH?  
  
BTW, I'm currently trying to come up with a context specific, metaplot constrained drama engine for my DS project. Get the gist of the basic data structure on my lastest post.

[5:18 PM](https://projectperko.blogspot.com/2006/04/second-time.html?showComment=1145405880000#c114540590108639991 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114540590108639991 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

The system I'm thinking of isn't so complex as it sounds. Essentially, I'm taking all the hard parts of the narrative and social algorithms I've created and replacing them with human work. The parts that they did well and easily are largely the bits that are tedius to program.  
  
The system should allow for rapidly scripting a world: building a map, creating some characters, and building some "plot constructs". After that, the engine can determine a graph of what should be connected to what where to accomplish a certain level of connectivity.  
  
Of course, the actual game I'd be building would be fairly basic...  
  
I'll explain in more detail if it works. :)

[9:11 PM](https://projectperko.blogspot.com/2006/04/second-time.html?showComment=1145419860000#c114541989551119028 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114541989551119028 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114532987749834307)

[Newer Post](https://projectperko.blogspot.com/2006/04/secondlife-economy.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/04/whee.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114532987749834307/comments/default)
