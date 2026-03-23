---
title: "The Forever Game"
date: 2013-01-10
url: https://projectperko.blogspot.com/2013/01/the-forever-game.html
labels:
  - game design
---

## Thursday, January 10, 2013 


### The Forever Game

So, like many would-be developers, I've played around a lot with games that build themselves. Let's talk about them a bit.  
  
There are a lot of categories of algorithmic content. Some are very well tested and work great - for example, random map creation is very well done. There are many approaches and most of them work and have been put in games that are quite a bit of fun. Hell, "Roguelike" is a whole genre of game that relies on algorithmic map generation.  
  
There are other kinds of algorithmic generative content. For example, the ever-popular Borderlands features randomized equipment.  
  
So let's talk about how much self-referral the algorithmic content has.  
  
In Borderlands you get random guns. The guns are just guns. Equip 'em, sell 'em, whatever. They don't really create any complexity, just variation.  
  
On the other hand, a random map refers to itself. Each map segment is connected to other map segments. If you create random quests, each element of the plot connects to the next element of the plot. If you create random progressions, each phase connects to the next phase.  
  
Typically, this is the weak part of algorithmic content. Any given chunk of content can be balanced and properly created, but when you start to tie them together you start to get a lot of complexity. In fact, in a game made by hand, the connections are often the most interesting part of the game.  
  
It's not what the next room contains - it's how you're forced to face it, or how you have to work to get there. The transitions between the rooms.  
  
Similarly, it's not that Alice is angry that is interesting in a plot point. It's why she's angry. What caused her to transition into that state.  
  
Thinking of algorithmic content as simply balanced units of gameplay is a mistake. This is the core of the limitations the current algorithmic systems face: they think in terms of units of gameplay, because that's the obvious thing to think of.  
  
If you think of a quest broker brokering random quests, you naturally start with the same assumptions: the broker will need to request a string of level-graded subcomponents. Kill ten rabbits in the D'e'tl'sle-fei'r' fields, then take a letter to H'eja'd'ifl's.  
  
Instead, let's think of transitions. Each transition moves the player. It makes the player feel more emotionally engaged.  
  
For example, the quest might start as "kill ten rabbits in X spot". The transition to that is player controlled, we'll just let that happen. However, we'll then have a transition where after you've killed eight rabbits, you are suddenly attacked by a vicious boar who chases you all around the level. The boar can only be killed by luring him into charging off a cliff.  
  
See, this is a pretty basic pair of challenges: kill N enemies, beat boss. But the transition is what makes it suddenly interesting. There's a sudden jolt of panic when the boar blasts in from nowhere and completely shrugs off your arrows.  
  
Surprise is low-hanging fruit. You can easily improve any algorithmic system by adding in elements of surprise. Collapsing floors, dogs jumping in through windows, whatever.  
  
But there are lots of other kinds of progressions. A lot of them are simple pacing controls - a monster that stalks you from afar for ten minutes before it attacks. A treasure chest you can see but that it'll take some more rooms to get to. Secondary gameplay challenges mixed in with the primary gameplay challenges. Color notes mixed in with the gameplay.  
  
A bit harder to tackle, though, is the player's emotional investment in specific characters, groups, or places. As an easy example: if a monster stalks you for ten minutes before attacking, it's going to seem a lot more personal and weighty than if you just get attacked out of the blue by the same monster.  
  
NPCs, factions, and places don't have to vary wildly in terms of their mechanics or bonuses. You can build up loyalty and investment by having them act. They cause transitions which, in turn, causes the player to feel something about them.  
  
If you are attacking a goblin fort and suddenly the elves stop by to rain arrows down on your targets, you'll probably feel something towards elves. If it was something you wanted, something that benefited you, you'll like them. On the other hand, if their arrows rob you of XP and light the whole place up as a giant fire hazard, you're going to feel that they are really annoying.  
  
This doesn't require a delicate touch. There's no finesse required. Just understanding that it needs to happen, needs to exist as part of your random content is likely enough.  
  
...  
  
I guess I should probably go make a game like that, then.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:08 AM](https://projectperko.blogspot.com/2013/01/the-forever-game.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6264313367593285478 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6264313367593285478&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### 6 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQGVSPmlXYBXDVsU9gDHvY7gClGEm13CSiUOrvj1yfrx9\_Jj8C45-fhxyb65KGHKGVk9aCNYBXzy9zVtTkuSz42WIY7uJSV8HS5 WhTOUSUlFImSDkvk9nvSzTxK6ihHA/s45-c/grenss.jpg)](https://www.blogger.com/profile/07006701742406299244)

[envelope](https://www.blogger.com/profile/07006701742406299244) said...

I think you're saying, it's not enough for generated things to stat differently, the stats have to indicate different behaviours for the thing, and these have to cause different behaviours in the player.  
  
which is a problem that I think i understand. And I know how to code individual behavours that the thing could have. but that's not quite what I want to do. I'm not super sure how to generate a space of possible behaviours.

[6:51 PM](https://projectperko.blogspot.com/2013/01/the-forever-game.html?showComment=1357872712548#c5733848049180874131 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5733848049180874131 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I'm not sure I would approach it like that. It's not about the behavior of the object, it's about the emotional response in the player.  
  
Any object can cause the emotional response. For example, consider "surprise", "dread", and "dismay" as three distinct emotions you could cause in the player.  
  
Any antagonistic gameplay element could do these without having any special behavior. It's a matter of how you introduce the element, or alter the element partway through, or scale the element.

[6:56 PM](https://projectperko.blogspot.com/2013/01/the-forever-game.html?showComment=1357872962516#c6303722785370957026 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6303722785370957026 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQGVSPmlXYBXDVsU9gDHvY7gClGEm13CSiUOrvj1yfrx9\_Jj8C45-fhxyb65KGHKGVk9aCNYBXzy9zVtTkuSz42WIY7uJSV8HS5 WhTOUSUlFImSDkvk9nvSzTxK6ihHA/s45-c/grenss.jpg)](https://www.blogger.com/profile/07006701742406299244)

[envelope](https://www.blogger.com/profile/07006701742406299244) said...

okay, so you have like a emotion-song that you're playing to the player. when the emotion-speaker plays the 'dismay' note it searches the field for an object that could cause dismay and if there isn't one already it inserts one? then that thing does the dismay behaviour?

[7:06 PM](https://projectperko.blogspot.com/2013/01/the-forever-game.html?showComment=1357873609418#c4006482468914393449 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4006482468914393449 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I don't know if you need to make it a song, per se. Just a general idea of the sorts of impressions you want to leave, and what people, places, objects, or abilities you want them to feel that way about.  
  
It doesn't have to be careful or complex. Just interesting.

[7:14 PM](https://projectperko.blogspot.com/2013/01/the-forever-game.html?showComment=1357874099241#c4268366243483485306 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4268366243483485306 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQGVSPmlXYBXDVsU9gDHvY7gClGEm13CSiUOrvj1yfrx9\_Jj8C45-fhxyb65KGHKGVk9aCNYBXzy9zVtTkuSz42WIY7uJSV8HS5 WhTOUSUlFImSDkvk9nvSzTxK6ihHA/s45-c/grenss.jpg)](https://www.blogger.com/profile/07006701742406299244)

[envelope](https://www.blogger.com/profile/07006701742406299244) said...

i'm mostly using a song as an example because it's a linear thing that plays notes, sometimes multiple notes at the same time, and probably isn't generated but might be  
  
it could be done like that, where each quest-line is a 'song', or each npc, or each encounter, or each place  
  
but i think i'm still not getting it. i think the trouble is i want maps to be somewhat static, like a zelda level where if you come back to this room, these monsters are still here. which is not properly surprising.  
  
the-not-careful-not-complex-still-interesting version of this system is mysterious to me.

[7:31 PM](https://projectperko.blogspot.com/2013/01/the-forever-game.html?showComment=1357875096768#c7161309171608383710 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7161309171608383710 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Let me make another post. I wanted to explain it clearer, anyway.

[7:39 PM](https://projectperko.blogspot.com/2013/01/the-forever-game.html?showComment=1357875569553#c4132492460919326762 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4132492460919326762 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6264313367593285478)

[Newer Post](https://projectperko.blogspot.com/2013/01/more-on-transitions.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/01/star-ocean-design-lessons.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6264313367593285478/comments/default)
