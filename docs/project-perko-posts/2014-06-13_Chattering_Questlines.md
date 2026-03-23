---
title: "Chattering Questlines"
date: 2014-06-13
url: https://projectperko.blogspot.com/2014/06/chattering-questlines.html
labels:
  - npc
  - social simulation
---

## Friday, June 13, 2014 


### Chattering Questlines

A bit ago I posted [a theoretical framework for doing constructive open-world RPGs](http://projectperko.blogspot.com/2014/06/npc-growth-and-personality.html). If you didn't read that, this post won't make much sense.  
  
One of the things that makes open world RPGs so enticing is that everywhere you go feels interesting. The characters always have something going on in their lives and quests to hand out.  
  
For example, you might walk into an early-game village and a woman would desperately ask you to help her find her missing daughter, who snuck off to Gooooooblin Mountain. It's a pretty typical early-game quest, and can really set the tone for the rest of the game. It can also become interesting or fun. For example, it could turn out that the daughter is a full-grown warrior who can definitely fend for herself, or that the child was in danger but the mother was a ghost, or that there was no child and it's a bandit trick. The quest can also be "chained" - find the child, and she explains she was sneaking out to tend to a wounded griffon, and now you have all sorts of options about whether/how you want to help, often gated by stats and skills.  
  
How would you create this sort of situation in my chatter engine?  
  
Well, first you would define the two NPCs and their relationship. Then put them in the locations they need to be. You'd want to disable nav on the child so she doesn't go home, obviously.  
  
The mother doesn't magically know that the child went to Gooooooooblin Mountain. To inform her of this, you would need to create a state record. This is exactly the same as a conversation tidbit. It is exactly the equivalent of the child literally saying "I am on Goooooooblin Mountain". You stick it into the parent's head.  
  
Even with absolutely no additional logic, the adventurer would likely hear this lady talk about her daughter being on Goooooblin Mountain, because it hasn't been talked about yet and unexplored "gossip" (state records in mental inventory) has a higher priority than "conversation" (state records arising from personal state).  
  
But without logic, the mother would come off as not particularly caring. It's very important that our NPCs appear to care.  
  
A child is a "good" item, your own child doubly so. Goooooblin Mountain is a bad item. It doesn't take much effort to figure out that the mother should be worried: a good thing stuck in a bad thing?! That's something you care about regardless of your personality!  
  
But more logic is useful both in making things more lifelike and in allowing the parent to express her personality. The most basic piece of logic that would apply here is the relative power levels of the child and Goooooblin Mountain. A child might have a power level of 1 or so, while Goooooblin Mountain might have a 4 or 5. Alternately, if the child is actually a grown-up warrior, they might have a power level of 20 or 30.  
  
The exact reaction depends both on the relationship and the personality of the mother. If we presume the mother is a worry-wart, then she might imagine Goooooblin Mountain to be 10x more dangerous than it actually is, which would mean she would be worried about her fully-grown warrior daughter. On the other hand, if the mother is of a proud warrior bloodline and has a colder, prouder personality, she could underestimate the danger by 10x, meaning she wouldn't be worried much even about her young daughter. In both of this cases, it might be more of a "could you please check up on my daughter?" rather than "OH MY GOD MY DAUGHTER IS DOOOOOOOOMED"  
  
You'd need some generative text, but I don't think that's hugely difficult if you set your standards a bit low.  
  
Any way you slice it, we didn't exactly program in a "quest" quest. We simply set the stage for a quest to emerge by putting specific people in specific places and making them worry about each other.  
  
We could extend the quest in the same manner. Add in an injured friendly griffon on the Gooooblin Mountain. Set up a relationship between it and the daughter, as well as the daughter knowing its location. Add in some Goooooblins surrounding the griffon's hidey-hole. Now you can decide - is the daughter trying to find a way to the griffon through the goblins (place her outside) or is she stranded with the griffon (place her inside) or captured by the goblins or any number of other options.  
  
But... how can you set it up so that she is actively trying to reach and care for the griffon?  
  
Err... A STATE RECORD.  
  
State records don't have to be past tense, as I brushed on in the prior essay. "I am trying to feed the griffon" is a perfectly valid state record. You can think of it as an AI directive, but it's actually more flexible to think of it as "I fed the griffon" with a future timestamp. By putting it in the future, the character's rudimentary AI will naturally realize that she has to reach the griffon with food in order to achieve it.  
  
This can lead to unexpected results. For example, if you forget to equip her with food, she won't be trying to reach the griffon. She'll be trying to find griffon chow.  
  
The goblins are another issue here. Obviously, the goblins and the griffon know about each other and aren't on friendly terms, so you can establish their relationship as "a standoff", meaning that they'll attack as soon as something changes the balance of power. The goblins are probably treated as a "group mind" rather than individually tracked.  
  
If we leave the child without knowledge of the goblins, it could prove a nasty surprise for everyone involved. Adding the goblins to the child's concept of the universe is easy enough, of course. The question is: what are her reactions?  
  
Again, this is a time for personality to shine through. The exact power level of the child and the goblins is crystal clear - the question is whether the child is panicked, worried, unconcerned, etc.  
  
However, personality actually does more than modify perceived power levels up and down. Personality also controls whether you'd request help.  
  
Depending on the child's personality, she may require quite a bit of coaxing to let you rescue her - or she may recruit the injured griffon and launch an offensive the moment you get close enough for detailed simulation to start.  
  
Basically, personality serves a few purposes.  
  
The first is how risk-averse someone is. Or, perhaps, what situations they are risk-averse in.  
  
The second is how they look for solutions. And this is not a weighting mechanic: each personality forms plans according to its own custom algorithms. Heroes, for example, form basic confrontation plans and only include known party members as participants. Conniving characters will form plans that involve sacrificing your neighbor for your own survival. Neither side is capable of coming up with the other's plans.  
  
This is actually a method to simplify the AI requirements, as well as make them modular enough to upgrade or mod as the game proceeds. The only "core" AI is things like navigation and basic combat. Even in combat, a lot of the choices might be made by personality-specific scripts rather than an overall AI. Which makes party member personality important.  
  
In the end, the biggest advantage to this approach is that it makes NPCs very predictable if you happen to know everything they know. This means you can "script" the environment using NPC personalities. The mother asks you to chase her daughter because the mother has a personality that asks others for help as its primary plan of action. The child needs to be coaxed into allowing you to rescue her because she has a personality that is scared of strangers. This same applies to conniving thieves, drunken louts, corrupt aristocrats, and so on: the AI is deterministic.  
  
...  
  
The last important thing to explain is obsessive NPCs.  
  
In most open-world games, NPCs tend to be concerned with one specific thing. For example, there's the guy that just tends the clock tower. The lady who is obsessed with fireball magic. The dork obsessed with bragging about his bloodline. Someone pretending to be the Great Hero. Etc, etc.  
  
These are accomplished using two methods in tandem.  
  
The first method is to embed a few states in their head as "permanent future". Once the child feeds the griffon, the future state changes to "I fed the griffon" - a past state. However, if we want a lady to continually obsess over fireball magic, we embed "I cast fireball" in her future. We can embed something that is impossible for her to obtain on her own, or we can embed something that will continue to be in the future regardless of however many times you accomplish it, or we can create nested futures, where when that one goes away it reveals another, more difficult one behind it.  
  
The second method is to use "fake states". These are states which are lies. They do not reflect reality. For example, "Aaron is the Great Hero". It's a valid thing to say, but it is wrong: Aaron is not the Great Hero. These are a bit difficult to use and implement, as it requires a contagious counterfactual state and a certain amount of anger when the lie is revealed.  
  
Well, that's more than I need for the prototype, so I'll leave that on the backburner.  
  
Okay! That's it!

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:35 AM](https://projectperko.blogspot.com/2014/06/chattering-questlines.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5914856762205033779 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5914856762205033779&from=pencil "Edit Post")

Labels: [npc](https://projectperko.blogspot.com/search/label/npc) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/06491438864262214190)

[Z. Cross](https://www.blogger.com/profile/06491438864262214190) said...

If you do end up with a prototype for this system, I'd love to see it in action. At the very least, these two essays have led to some fun thought experiments.

[11:51 PM](https://projectperko.blogspot.com/2014/06/chattering-questlines.html?showComment=1402728706041#c8425561331289920034 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8425561331289920034 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I came up with a killer content system, so first I'll be working on RPG content, then I'll be creating prototypes with it.

[6:11 AM](https://projectperko.blogspot.com/2014/06/chattering-questlines.html?showComment=1402751499960#c8249552593603300318 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8249552593603300318 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5914856762205033779)

[Newer Post](https://projectperko.blogspot.com/2014/06/people-organizing-themselves.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/06/clothes-are-expensive.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5914856762205033779/comments/default)
