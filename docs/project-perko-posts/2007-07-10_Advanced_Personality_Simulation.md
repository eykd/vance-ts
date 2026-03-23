---
title: "Advanced Personality Simulation"
date: 2007-07-10
url: https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html
labels:
  - characters
  - emotion
  - game design
  - social simulation
---

## Tuesday, July 10, 2007 


### Advanced Personality Simulation

When you're trying to create a "next generation" NPC, usually the method is to make it so that the NPC thinks about relationships in a more complicated way than "I like you X amount", and can therefore respond in a way more complicated than "I'll give you the quest".  
  
I've discussed a lot of difficulties with this, ranging from a need for a wide variety of actions with nuance to the need for a detailed world to offer fodder for interaction. Today I'd like to assume those and talk a little bit about an easy way to do the actual personality calculations.  
  
The problem with the majority of "advanced personality models" is that they still default to flat numbers. For example, they have a stat as to how much they like you. The urge most designers feel is to simply add more flat numbers: this is how much they like you, that's how much they trust you, that's how attracted they are too you, that's how much they respect or fear you...  
  
I think it's more important to have fewer, deeper numbers rather than more, shallow numbers. The basics of deep gameplay are to have a few rules that produce complex situations, not to have a lot of rules that produce complex situations. The latter is inherently limited, inefficient, and flat-out inferior.  
  
So let's say we've got only one number: how much they like you.  
  
The way to make it more interesting and realistic is to *also* have the derivatives and integrals of that number. Basically, we turn that number into:  
  
Their long-term relationship with you. (area)  
How much they like you. (position)  
How respectable/fun you've been recently. (velocity)  
How charming you're being. (acceleration)  
  
All of these numbers change with everything the character does, but they are all deeply intertangled. Each character can then have a personality designed to weight those factors differently.  
  
For example, a suspicious aristocrat might have a low maximum acceleration threshold, and therefore innately distrust anyone being especially charming. This doesn't affect the end result in terms of how the acceleration changes the velocity changes the position: it just changes how they act towards you right now.  
  
On the other hand, an honorable knight might weight almost all his interactions based on **area** rather than position. How charming you're being right now won't affect his decisions much.  
  
You can also split up their actions into *action* and *demeanor*, or even into long-term, short-term, and demeanor. For example, the aristocrat will be charming right back to anyone who's being charming, but he won't believe a word of it when they say that they'll pay you back next Friday.  
  
A knight, on the other hand, might have a demeanor based almost entirely on charm and fun (acceleration and velocity) but make his long-term decisions based entirely on area (long-term relationship). IE, "You're an ass, but you're my brother, so I'll do it."  
  
It's not so complex. Easy, in fact. And more realistic than trying to decide on what four or five *kinds* of relationships a person can have. Instead, a given NPC will interpret their emotions into whatever makes sense for their personality, and the "kinds of relationships" will emerge naturally.  
  
For extra fun, let players define their character's personality. :D

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:07 AM](https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6947504924676798091 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6947504924676798091&from=pencil "Edit Post")

Labels: [characters](https://projectperko.blogspot.com/search/label/characters) , [emotion](https://projectperko.blogspot.com/search/label/emotion) , [game design](https://projectperko.blogspot.com/search/label/game%20design) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 7 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjT7uUKpqWUp3g3OOg1qI0SCCfXxC7mTBAjIiZRON9025hidI4ICBM8VDVsf2ZZjZvthdgnFcIPoammyvHG75iaai43 DeQwESgeuv9wZ3gFnGeOI37qyFM4vr0o0l0U4kk/s45-c/2e7d0508-s.jpg)](https://www.blogger.com/profile/10742095724171892869)

[Chill](https://www.blogger.com/profile/10742095724171892869) said...

Little question: Area meaning Time x How Much They Like You?  
  
Bigger thought: I was thinking about this topic today actually. It was in conjunction with some ideas I had about emergent behaviors. Anyways, I hit upon the idea that I like 'roughness' in a system. Meaning that there may be a few stats, but the important thing is that there a lot of places on that scale that one could be.  
  
Magic: The Gathering was my example of this, where you can say to me "Oh I prefer the 1 and 2 costing creature so-and-so type" and I can respond "Well I have been doing well with the 4 costing of that type because I do other stuff in the early game and the creatures have good synergy with the deck strategy"  
  
Point is, the more actually different ways one can affect a system and get meaningful feedback, the better.

[2:52 PM](https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html?showComment=1184104320000#c455780055657150681 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/455780055657150681 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Area is adding up how much they like you every time increment. So if they liked you a lot a year ago but hate you now, that's still a positive area.  
  
But I don't agree with the rest of your comment. I used to, but not these days. The reasons are kind of complicated, so I'll make another post out of them rather than explain them here.

[3:33 PM](https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html?showComment=1184106780000#c4165047762353982394 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4165047762353982394 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Looking foward to reading that, maybe if we can glean the pearls of experience now we can accelerate our own advancement. ;)  
  
What I find most refreshing about this is it implies a pretty robust model of memory with a very simple data-structure. I bet something like this could work well in an emergent/heterogenous drama engine framework, like Rocket Heart, possibly your more recent model (where economy of gifts or somesuch is a major factor).

[4:42 PM](https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html?showComment=1184110920000#c3360648163853539415 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3360648163853539415 "Delete Comment") 

[!\[Image\](https://3.bp.blogspot.com/\_eQc1 BjxSqMc/SqVDmQgu9UI/AAAAAAAAAIc/FEbzpeoqesI/S45-s35/32c39ba09d84622a7a6b4e7fae61c410.png)](https://www.blogger.com/profile/12131030304120690961)

[noonat](https://www.blogger.com/profile/12131030304120690961) said...

A lot of developers use the "advanced personalities" as a crutch so that they **don't have to** design personalities. Bad!  
  
I think a simplified system like this would create much more *unique* personalities for the characters, while still giving the player the sense that they are having an effect on the world.  
  
I wonder how Animal Crossing does it. Although it's player-to-NPC relationships are fairly rudimentary, people seem to find them very believable.

[6:49 PM](https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html?showComment=1184118540000#c4181704225906936107 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4181704225906936107 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

That was my aim: simple rules, expressive results.  
  
As for animal crossing, the reason the characters in it feel fairly believable is actually two reasons:  
  
1) The characters don't express themselves all that much, so a lot of the details (facial expression, etc) are left to the player.  
  
2) The characters are related to some part of the world instead of being standalone. That was actually part of my presumption at the beginning of this essay: you have to have a world full of things that can be affected by relationships.  
  
It makes there a reason to like or dislike a character - that's the one that gave me seeds, that's the one that always wants to borrow money. These world actions are very expressive while not actually requiring any complex computations.

[6:55 PM](https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html?showComment=1184118900000#c2798807565093980035 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2798807565093980035 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](http://www.safemeds.com/)

[Viagra Online](http://www.safemeds.com/) said...

when I played D&D some time ago, we have some problem with NPC and this because the DM have a little superiority complex, he always give more stuffs to NPC than us, and this create a imbalance between us and NPC.  
[Generic Viagra](http://www.safemeds.com/generic-viagra.htm) [Buy Viagra](http://www.safemeds.com/viagra/buy.html).

[6:48 AM](https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html?showComment=1284472082216#c950182567181600134 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/950182567181600134 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

i stumbled upon this through random googlings, and really like this idea.  
  
i know the post is old, just wanted to thank you for changing the way i was looking at a problem.  
  
cheers!

[10:39 PM](https://projectperko.blogspot.com/2007/07/advanced-personality-simulation.html?showComment=1366522782986#c5969330146200490413 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5969330146200490413 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6947504924676798091)

[Newer Post](https://projectperko.blogspot.com/2007/07/put-in-another-gun-itll-add-gameplay.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/07/cooperative-storytelling-guide.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6947504924676798091/comments/default)
