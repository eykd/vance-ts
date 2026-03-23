---
title: "Fun with Fractals"
date: 2007-12-05
url: https://projectperko.blogspot.com/2007/12/fun-with-fractals.html
labels:
  - social simulation
---

## Wednesday, December 05, 2007 


### Fun with Fractals

One of the things I'm always irritated with is the fact that fractals *seem* like they should be applicable to character simulation, but they never work out.  
  
There's one major reason for this. I will approach it obliquely:  
  
A big part of human activity, at least the interesting stuff, is social. Even things that are done alone, such as painting your fingers or blogging, are social.  
  
Social stuff is inherently interactive. Actually, all  of human action is actually inter action. If not with another person, than with a thing or a situation or a disease or whatever.  
  
A further difficulty is that some human activities change the social landscape, changing all further activities and serving as a center for activities. Examples of this vary from building a house to having a weekly poker game to that embarrassing time that nobody will stop talking about.  
  
On the other hand, many human activities are not permanent, but instant - saying hi, selling an apple, winking.  
  
So, not only are human activities interactive, but they are interactive with *themselves* in a bit of a weird way that isn't quite how a fractal normally builds on itself.  
  
But it might be possible to build a more conditional kind of fractal. A multi-phase fractal: a sort of "graph" fractal that builds edges (social actions) and nodes (social centers) deterministically.  
  
For example, each character has a base shape. A base shape is lines of specific colors that get built in a specific pattern, plus a number of spawn nodes that grow more base shapes. If two lines cross and are either identically or opposingly colored, that becomes a social center. A social center exerts gravity, such that all lines drawn near it are curved slightly towards it. Social centers combine if their edges touch, and the larger a social center is, the more gravity it exerts.  
  
That doesn't end up being terribly interesting, as it turns out: you usually end up with what amounts to a boundary of black holes between every character. However, what you can do is give every social center a specific color (or set of colors) it pulls on, and it leaves the others intact... and pushes other-colored social centers away.  
  
This results in a far more interesting situation, where the border black holes break up and migrate, radiating colors in every direction and even developing more or less stable orbital lines. You get massively different results depending on the geography of the base shapes, so that's good. You need to set the dissipation rate pretty high so that minor encounters don't turn in to massive lifelong issues.  
  
While it's interesting enough, can it be translated into characters in a game?  
  
Well, let's presume we're not pretending these beings are human. Let's make them first-generation sentient robots or something. This makes roughness more forgivable. It also gives us an excuse to use an evolutionary population pool instead of hand-programming everything.  
  
Originally, the basic idea was that each colored line was a particular kind of social action - happiness, anger, whatever. This doesn't end up working very well unless you use a very complicated multi-base-shape model, so that's not going to work out.  
  
While it is clear that these colors do map to some kind of emotional output, the overall action needs to vary based on gravitic pressures. So, I've decided that the overall ratio of colors determines the default mood of the character, but the more a particular color is pulled by gravity, the more of that kind of mood they are in when they are drawing that particular segment. Also, if you're running with structurally sound shapes, lines which are stretched or squashed to maintain structural integrity also affect the kind of action in this segment. (You have to separate the edges in your mind: a character who is falling into a red black hole near one person might be feeling very angry, but only when the in-game situation is around that person. They may be perfectly happy when interacting with someone else.)  
  
How you judge fitness is still a bit of mystery to me. You could simply do it by propagation, except this ends up not feeling very human, because they don't have the same reasons or reactions to having children, even if you tweak their interactions with their children.  
  
Fortunately, our creative conceit is that these are robots, so having children like humans doesn't make a whole lot of sense anyway. How they have children and their reaction to their children completely changes the feeling of their society, especially if you are running evolutionary rather than scripting each character. An easy example is if you make it so that they can only have children with the first other bot they have children with, or that they can only have one child per other bot... and, of course, whether there are genders...  
  
Personally, I think that, at the moment, the best way to determine fitness is to allow the player to choose which bots have the neatest patterns of interaction. While these patterns are at least half chance, they are at least partially NOT chance, which does make this an effective method if you have the patience. Also, allowing you to "draw" your own bot base shapes is perfectly acceptable.  
  
In terms of layout, I think it's best if each bot's spread is, at least initially, very linear. This allows you to create a "family" of bots by arranging them in a circle pointing away from each other. This gives them a lot of interaction without immediately dropping everyone into a black hole.  
  
It also means that a family "starts flat". There is no childbirth on the fly, because you need to arrange everyone in circles. However, you can (and should) give parents several turns before children come on-line, and each child should come on-line after a delay as well. This creates the illusion of a growing family, but more importantly, it allows for age dynamics to manifest. Also, of course, you probably should inhibit sexual interactions among family members, assuming you want sexual interactions at all. They are robots, after all.  
  
Also, I like creating social nodes when a robot's interactions cross over *its own interactions*. This lets the robots be self-obsessed and flat-out insane.  
  
I'll try to get something Flashy up and running to show you what I mean, but I wouldn't mind hearing your preliminary thoughts.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:02 AM](https://projectperko.blogspot.com/2007/12/fun-with-fractals.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3298358111118502607 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3298358111118502607&from=pencil "Edit Post")

Labels: [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 4 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

This sounds very interesting, I'm always curious about your latest attempts at doing characters. I'm designing a game right now that is purely multi-player social, a lot easier.  
  
How would you represent the feedback to these interactions in this prototype?  
  
Is it purely a simulation? What are the verbs?  
  
It'd be interesting if these robots start to become aware they're simply fractal algorithms playing off each other, and then letting the player deal with that.

[1:02 PM](https://projectperko.blogspot.com/2007/12/fun-with-fractals.html?showComment=1196888520000#c3974936069629902511 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3974936069629902511 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Multiplayer social games are easier to design, but harder to pull off: players have very erratic schedules, so it's a bit difficult to have a continuous relationship.  
  
At the moment it's purely simulation, although I can see putting the character in the shoes of a "socially aware" robot that can choose what to use when.  
  
There are no verbs, because the noun-verb framework is a bad one. Or, if you prefer, there is only one verb the robots can use: expand.  
  
There is no realistic way that this level of simulation could even become marginally self-aware, but if it develops internal orbits, it could develop a kind of introspective illusion of self awareness... maybe.

[3:20 PM](https://projectperko.blogspot.com/2007/12/fun-with-fractals.html?showComment=1196896800000#c2804435717979349400 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2804435717979349400 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

In my case, a picture will be worth a thousand words. This sounds fascinating, but in truth, it's going far over my head. My only experience with fractals is the (trivial) application of fractal terrain generation. There is a lot of power in that math, though, perhaps akin to perlin noise if it can be harnessed in full generality. So, if you can get that flash demo up, I'd be enthused (my stilted prose might not properly convey that, but meh).

[10:19 PM](https://projectperko.blogspot.com/2007/12/fun-with-fractals.html?showComment=1196921940000#c7221250138843789913 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7221250138843789913 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Don't hold your breath: I only have time for projects like that on weekends.  
  
But the preliminary pics look promising.

[7:26 AM](https://projectperko.blogspot.com/2007/12/fun-with-fractals.html?showComment=1196954760000#c455123594734967596 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/455123594734967596 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3298358111118502607)

[Newer Post](https://projectperko.blogspot.com/2007/12/defined-by-relationships.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/12/tricky-synthesis.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3298358111118502607/comments/default)
