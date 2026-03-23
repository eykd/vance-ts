---
title: "Generating Uniqueness"
date: 2008-05-03
url: https://projectperko.blogspot.com/2008/05/generating-uniqueness.html
labels:
  - characters
  - game design
---

## Saturday, May 03, 2008 


### Generating Uniqueness

Once again, I'm interested in how to generate unique content. For me, this usually means NPCs. After all, if you can generate unique NPCs, everything else is easy. :D  
  
To me, there are a few specific types of NPC uniqueness to be achieved. Let me go over them.  
  
The first, and easiest, is simple **statistical deviation**. He's got a strength of twelve, she's five foot three, he has a kindness of 43, she has a longsword +4 vs dragons. Whatever. Also included here is anything where you have a fair number of options that are a list, rather than generated on the fly. For example, hair type or elemental alignment.  
  
Statistical deviation is good because it is fairly cheap to implement and allows for detailed feedback. If his strength is twelve, he can just barely lift the grate. If she's five foot three, you look down on her head and can't find her in a crowd. Both scripted and emergent feedback are fairly easy (scripted: the grate requires 11 strength, emergent: people obscure the camera, so you can't see the girl).  
  
However, statistical deviation is fairly boring, especially when using large numbers of characters, very small numbers of characters, or player-rolled characters. In these situations, the deviation is either too weak, too random, or a maddening gambling game (click reroll eight billion times).  
  
If you don't see why, try rolling up random characters in your favorite tabletop RPG. If you roll up a few, you end up with weird, pointless characters that would never make a good party. Roll up a lot, you start to lose track of which characters are "interesting", and even which exist. Try to roll up the best you can get, you'll find there's always something that's not quite how you wanted it... maybe next time!  
  
So, you need more than statistical deviation. Another method is **associative deviation**, which associates characters with some in-world thing to give them an anchor. This random character is a member of the mage's guild. That random character is in love with the queen. That character is an outcast, and that character is a republican. Alignments are a typical example of this, although I really hate alignments.  
  
These are different from things like elemental damage type and hair color because associative deviation gives you a "path" between characters, other characters, places, and actions. Mage guild members "clump up" and cooperate. Outcasts are treated like crap by almost everyone. Lawful evil people tend to pursue specific activities. I mean, if hair color or elemental damage type is a significant cause of social "clumping", then sure, it's associative rather than statistical deviation.  
  
These are not too difficult to create, and you can weight them to show up more frequently or less frequently based on a large number of factors. This allows you to create a pleasantly "bumpy" "topology" of NPCs instead of the painfully bland "field of nameless NPCs all alike".  
  
Obviously, categories are just approximations. Some things will be both statistical and associative. For example, how wealthy you are. It's a simple statistical deviation, but it has emergent (and probably scripted) effects on how you interact with the game world.  
  
...  
  
Those are the two easy methods of generating unique characters, but while they create **unique** characters, they don't really create unique **characters**. Worlds inhabited by such NPCs feel kind of flat and full of pointlessness, although it can be a good starting point for a few scripters aiming to generate a few thousand NPCs.  
  
There are a few more ways of generating unique *characters*, which I'll explain.  
  
One is **superlative deviation** . This is basically statistical deviation, except taken to an absurd extreme. For example, the range of strength might be 20-80. This character has -32, or maybe 499. By falling massively outside the bounds of common power, the deviation causes him to be very unique. Of course, it needs to be very uncommon: if every tenth person has superlative strength, it's not really very unique or interesting. Similarly, the character has to *know* he has superlative whatever and adapt his performance (and, preferably, his social interactions) to his superlatives.  
  
There are a wide variety of superlatives that don't require any kind of baseline statistical deviation. For example, you probably won't have statistical deviation on how well someone can hear, but you can certainly have someone who is deaf, or someone who can hear people's heartbeats from a mile away.  
  
The difficulty with superlatives is balance. You either have to throw balance out the window, or you have to carefully control who can be superlative, when and where.  
  
Another kind of uniqueness you can have is **reactive deviation**, in which a character is given a very unusual, unique way to react to certain kinds of things. For example, one character might be allergic to sunlight. Or maybe a character is terrified of the water. Maybe someone really, really likes donuts.  
  
It's actually not too difficult to whip up a few thousand unique combinations using a few simple tables, but you need to have a character AI advanced enough to change its actions based on its goals and reactions. It needs to be able to hunt for donuts, or notice water and react to it. Moreover, it can't be blind about it: someone who really likes donuts is not going to jump off a cliff after that Krispy Kreme, unless you're doing a comedy game. He's just going to get really angry at whoever wasted the donut. Similarly, the man who fears water needs to be able to try to fight that fear if circumstances require.  
  
This also covers characters with unusual or reversed progressions. For example, if someone starts at a high level and loses levels as he gains experience. That's not such a flat example as a fear of water, but it falls in the same category.  
  
Obviously, this requires pretty solid AI and a fairly good sim, although it's not impossible. My favorite side effect of this is that it's pretty easy to make a character arc out of their strange reactions: he has to overcome his fear of water, that one has to fight his donut-stuffing mouth or fail the team...  
  
However, my favorite kind of uniqueness is **recombinant content**. This has an easy example, but it's nightmarishly complex at the deepest levels.  
  
The example for recombinant content is the ability to combine a wide variety of clothes templates and color them however you want. If you want shorts and a green polo shirt, fine. If you want fishnet stockings and a fuzzy bodice, fine. If you want fishnet stockings and a green polo shirt, fine.  
  
This allows the player to create a unique look out of a wide variety of pieces.  
  
The problem with it is twofold. First, the characters have to have a heuristic to keep from idiotic combos (IE, fishnets and polo shirts). This isn't too terribly hard with clothes - a few subculture markers and some basic color rules will do the trick. But the second problem is that clothes are a rotten, shallow example.  
  
Instead, the real example is the character of the character. While characters have a baseline AI that handles the basics and may have statistical deviations for personality traits, the personalities these produce is bland at best and terribly broken at worst.  
  
Instead, a series of "pieces" could be combined, like combining clothes. Like clothes, the pieces can vary in and of themselves, having different "colors", "patterns", "layouts", "textures", "prints", whatever you can think of that might have a correlation.  
  
"Pieces" are significantly more complex than clothes, largely because they're not exactly clearly defined, are they? Are pieces memories of past events? Or are they special personality tendencies to give someone that interesting, subtle oddness? Or maybe they're connections to other characters and places? Or buried elemental capabilities that tend to surface, granting both power and odd behavior?  
  
The choices are essentially unlimited, which is the most difficult part of this, for me. Because, when you implement it, you have to cut the choices down to just a very select subset. One you can not only build heuristics for assembling, but one that you can make have effects in game that make sense.  
  
Anyhow, those are my five ways of making unique characters. Anything to add or comment on?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [2:21 PM](https://projectperko.blogspot.com/2008/05/generating-uniqueness.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/1099959643326928235 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=1099959643326928235&from=pencil "Edit Post")

Labels: [characters](https://projectperko.blogspot.com/search/label/characters) , [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15857128158095957668)

[Dirk Kok](https://www.blogger.com/profile/15857128158095957668) said...

I think those are all valid techniques. The first two will probably generate characters seen in Daggerfal and Morrowind.  
  
The next few techniques sound like they would produce characters similar to Bethesda's Radient AI (along with all the funny stories).  
  
I believe the road to success is to make use of some form of behavioural scaffolding. This could be in the form of hand scripted behaviours, scenario's etc. Of course this limits the "randomness" to the amount of content created by hand, allowing the designer to control the level of randomness.  
  
From this position one could scale back the scaffolding while tweaking the AI to produce similar results as was achieved through scripting (if possible).

[11:51 PM](https://projectperko.blogspot.com/2008/05/generating-uniqueness.html?showComment=1209883860000#c331405200453827507 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/331405200453827507 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Dirk, that's pretty much what I think. If you want to read more on what I think on that matter, here are some links:  
  
http://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html  
  
http://projectperko.blogspot.com/2008/02/hey-lets-talk-roguelikes.html  
  
It's been a few years since I've posted on behavioral scaffolding, although it was a major part of my posts back in... 2006? I think?  
  
It's past time to upgrade those thoughts, I suppose, so I won't link to them.

[11:52 AM](https://projectperko.blogspot.com/2008/05/generating-uniqueness.html?showComment=1209927120000#c4405444079555807939 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4405444079555807939 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/1099959643326928235)

[Newer Post](https://projectperko.blogspot.com/2008/05/open-that-little-black-box-yeah.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/05/hooray-for-uncanny-valley.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/1099959643326928235/comments/default)
