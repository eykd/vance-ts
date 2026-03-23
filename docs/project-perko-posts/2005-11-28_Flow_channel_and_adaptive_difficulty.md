---
title: "Flow channel and adaptive difficulty"
date: 2005-11-28
url: https://projectperko.blogspot.com/2005/11/flow-channel-and-adaptive-difficulty.html
labels:
  []
---

## Monday, November 28, 2005 


### Flow channel and adaptive difficulty

In response to [this post](http://onlyagame.typepad.com/only_a_game/2005/11/riddles_of_diff.html).  
  
I've been thinking a lot about the same kinds of things, and I've come up with a few ideas that touch upon this:  
  
First, some game designers want their game to be "hard" or "easy" - and this is a choice I can respect, although I would question its effect on sales.  
  
Second, there's more than one kind of "difficulty", as Corvus pointed out. Adjusting on all these levels independently may very well be possible, but it requires an unusually deft algorithm.  
  
I thought about how to determine the ideal difficulty. My first thought was:  
  
A simple way to do this initially, without alienating them, is to have a tutorial which has several different "paths" they can take. This could be used not only to measure their play preferences (they chose the "exploration" path rather than the "stealth" path) but also their memetic preferences (they really like the rocket launcher, or being a psychic).  
  
However, I decided that wasn't going to be very accurate. There is one sure way to tell that a player is or is not enjoying a game:  
  
How long they play for.  
  
Sure, some players will play in eight hour blocks and others play an hour a week. However, everybody will tend to make time to play a great game and let a weak game slide.  
  
What you do is: over time, you slide the difficulty bar up. And up, and up, and up. After a few hours, they'll reach a point they "can't beat" (or don't care to try to beat) and quit playing.  
  
But most people will come back and try again. I would say nearly all of them. And you are now aware of their limits - the "upper bound" of their "flow channel". After that, your primary goal is to find the optimum flow, which is done by moseying slowly towards that line, and being pushed down each time they quit. Over several sessions, you decrease the difficulty increase and bracket some place where they are having fun.  
  
It's a noisy signal, unfortunately: they may quit to eat dinner, not because it's too hard. But noise just decreases the efficiency of the algorithm - it doesn't invalidate it.  
  
At first glance, this would seem to tend towards "hard". But not really: people who want to explore will be naturally turned off by the rather high-seeming difficulty, and shut off the machine. This will bring the difficulty down, and the rise will be slower this session.  
  
It's got some lumpy parts, but I think it's possible to measure what kind of challenge a player likes by simply measuring when they stop playing, and taking into account that sometimes they'll stop playing for non-game-related reasons.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [3:03 PM](https://projectperko.blogspot.com/2005/11/flow-channel-and-adaptive-difficulty.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113321942360675933 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113321942360675933&from=pencil "Edit Post")


#### 6 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

A way to augment such an algorithm to filter out the noise is to measure re-plays of particular intervals, typically between saves or checkpoints, and see how many times the player attempted a segment. A few games take a stab at this by adjusting the difficulty down after dying twice, Max Payne springs to mind, but if death based challenge adjustment were toned down to be supplmentary to the quit based challenge adjustment, then you might just be in buisiness.

[5:54 PM](https://projectperko.blogspot.com/2005/11/flow-channel-and-adaptive-difficulty.html?showComment=1133229240000#c113322924301059456 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113322924301059456 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/07550565723765898399)

[Chris](https://www.blogger.com/profile/07550565723765898399) said...

Gathering and analysing meta-data on the play patterns has some merit, I think. I do feel, however, that this approach works better for players who want to be in the upper half of the flow channel than those who would like to be at the bottom of it (who might not come back if they conclude the game is too hard). Definitely something worth exploring though!

[11:25 PM](https://projectperko.blogspot.com/2005/11/flow-channel-and-adaptive-difficulty.html?showComment=1133249100000#c113324911832093818 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113324911832093818 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_WQk0 YgqQA9Q/SaAzb6ng2VI/AAAAAAAAANw/Go874k1XLAc/S45-s35/profile.jpg)](https://www.blogger.com/profile/01646249933207430061)

[Darius Kazemi](https://www.blogger.com/profile/01646249933207430061) said...

I'm actually pretty interested in the artistic possibilities for using meta-data to change game content or even to change meta-behavior. I've been fascinated with what you can say about fate by messing with the quicksave system in a game. It would break some of the rules of game design to do something like that but... yeah. Maybe I'll write about this on my blog.

[7:11 AM](https://projectperko.blogspot.com/2005/11/flow-channel-and-adaptive-difficulty.html?showComment=1133277060000#c113327708139951339 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113327708139951339 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Patrick: your method continually pushes towards the middle of the stream. I don't mind dying again and again in some games. I enjoy the difficulty. In other games, this is really irritating.  
  
For example, I don't mind dying in Freedom Fighters - I enjoy it, in some ways. The reset takes me back only a few minutes. Losing a game of Masters of Orion pisses me off, though, because it sets me back fifteen hours.  
  
I may do a post on this very matter later. :)  
  
Chris: Yeah, it's flawed. I admit.  
  
Darius: Uh, I didn't want you to feel left out, so this line is in response to you. Although, honestly, I have very little interest in "fate".

[8:23 AM](https://projectperko.blogspot.com/2005/11/flow-channel-and-adaptive-difficulty.html?showComment=1133281380000#c113328141388299178 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113328141388299178 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Well, I think Chris makes an excellent point about catering to the lower half of the flow channel. Fireball, his current project, is attempting to reach a more casual gaming audience primarily, though it still provides for the hardcore. I suspect Machine City will still be a gamer's game, largely because of its underground and experimental status, and thats fine. Down the road though, these techniques will become invaluable, especially as dynamic content creation comes into more expansive use. Catering to the lowest skill denominator is something worth considering, I prefer challenge myself, but I'm hardly represenative of the mainstream.

[12:30 PM](https://projectperko.blogspot.com/2005/11/flow-channel-and-adaptive-difficulty.html?showComment=1133296200000#c113329625116344479 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113329625116344479 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Patrick: I'm just saying that "dying" can only tell you how hard a player is struggling, not whether he is enjoying the struggle.

[12:41 PM](https://projectperko.blogspot.com/2005/11/flow-channel-and-adaptive-difficulty.html?showComment=1133296860000#c113329687721201145 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113329687721201145 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113321942360675933)

[Newer Post](https://projectperko.blogspot.com/2005/11/expectation-and-pac.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/11/on-creativity.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113321942360675933/comments/default)
