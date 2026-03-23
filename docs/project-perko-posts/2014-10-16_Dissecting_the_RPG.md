---
title: "Dissecting the RPG"
date: 2014-10-16
url: https://projectperko.blogspot.com/2014/10/dissecting-rpg.html
labels:
  - game design
  - RPG
---

## Thursday, October 16, 2014 


### Dissecting the RPG

One of my big interests is RPGs such as Mass Effect, Dragon's Dogma, etc. But these days, I find that the gameplay is seriously getting in the way of the experience - for example, Dragon Age is poisoned by its slavish adherence to standard RPG gameplay and progression.  
  
When I break down what I like about various RPGs, it resolves into two things.  
  

# Pacing

First, I really do like the pacing of RPGs, especially with the modern realtime combat systems found in every big-budget game since Oblivion. There's a really powerful pull to this combination of exploration, combat, looting, and optimizing.  
  
I've done a lot of work trying to figure out how to get that same feeling "on the cheap", and I've discovered that there are very specific systems you need to implement. Obviously, you need all four loops. You can actually use as many variants as you want. Most RPGs have three exploration systems: dungeon, overworld, and city. Most also have several kinds of optimization - gear, leveling, skill/spell, item use. Dragon's Dogma, known for its particularly tasty combat, has three kinds of combat situations: free-for-all, anti-titan, and magic. They are actually very different - not different roles within the combat engine, but fundamentally different kinds of combat.  
  
That's not enough.  
  
I've made loads of prototypes with those constraints, but they didn't keep me in the groove. It turns out, what you need is hooks between them. You can't just drop the player from one to the other without warning, and you can't totally rely on the player to switch loops when they get a bit bored. Instead, what you do is set up a world where you are more likely to switch loops (or want to switch loops) if you do a specific kind of thing in this loop.  
  
For example, if you're exploring a dark cave, that's exploration-loop. As you peek around a corner and see a crowd of cave spiders, you know that the combat play is not far away. You can choose to engage combat - and normally you will. But you can also prep, sneak around, back away, choose a first strike, try to pull just a few...  
  
Even in a game like FF6, with random encounters, you would plan your explorations based around the number of steps you were taking. You headed for a tough boss? Don't waste a step. You trying to level? Wander around the entrance, run home when you run out of magic. And everything inbetween. While the encounters were random, the pattern of encounters was not.  
  
Basically, the player can switch loops, but it's only at off-ramps. It's not just that one loop changes the stats in another: it's that when and how you set up your loop changes is gameplay. Perhaps the most important gameplay.  
  

# Characters

Well, Rogue has that same gameplay, and that's the reason it's got such longevity. But I like Mass Effect better than Rogue. I enjoy RPGs where you have party members. The more personality they have and the more interactive they are, the more I like the game.  
  
I like Mass Effect because I like hanging out with the team. Dragon Age has some of the dullest gameplay and character design around, but I like it because the characters are all very interactive.  
  
There's a combination of elements. One is that the NPCs are quite distinct, and feel distinct all of the time. In Skyrim, you can get NPCs to follow you around, but they don't have any significant personality. In Mass Effect, every NPC feels very distinct: distinct personalities, distinct visual designs, distinct voicework, and distinct combat roles. You never forget who you have in your team. You never mistake racist human lady for psychic human lady - they feel completely distinct.  
  
Another element that makes me care is that the NPCs have social interactions - with you and with each other. They are not only distinct, they also exist within the world. Classically this has been backstory exposition, but I think that's an unnecessary holdover. I think social interactions and judgments are far more efficient and effective: Mordin's singing makes more of an impression on the player than his history with krogan genetics.  
  
Social interactions are largely unexplored. At the moment, the three types we have are backstory exposition, random chatter, and loyalty/romance quests. I think there's a lot of room to add in more kinds of social interaction, but it needs a light touch. This is not core gameplay.  
  
The last element that makes me care is the feeling that I can shape them, and perhaps that they can shape me. The most obvious example of this is leveling and gear selection - changing how they fight. But there is a lot more potential.  
  
Part of it is the potential of the character. The path you choose locks away a path you did not take, and just knowing that other path existed makes it clear you've affected their life.  
  
In Old Republic, nearly every character has a very distinct light side and dark side path. I can't play dark side, it's just too badly written, but just knowing that there was a dark side path made me feel that their light side path had more weight. The characters felt more important to me because their lives were changed because of me. Not "oh, the HERO changed their life", but "oh, the PLAYER changed their life."  
  
These big forks are probably not necessary. I think small things are probably more important than big things, although we haven't really gotten that far. Let me give an example:  
  
In Mass Effect, nearly every character is a potential romance target. But once you have chosen a lover, nothing really changes.  
  
Imagine if once you chose a lover, they would ask you to be a bit different. For example, they might steadily redecorate your quarters. They might ask you to wear the NC-7 helmet because it looks soooo good. They might be more upfront about asking you to take specific side missions, or give you optional objectives that are substantially harder. All based on their personality.  
  
For example, you go to explore a new world and Tali might ask you to avoid getting shot: if you get shot, she has to acclimatize to that planet's bacteria. Garrus might ask you to wear specific armor he likes. Liara might ask that you not make anyone angry in conversation, because it gives her an empathic headache. Doing or not doing these things would have no real statistical effect: this is to make hanging out more interesting, not to give you statistical perks.  
  
If all of the NPCs made these kinds of requests, it'd be annoying to try to play the game. However, at this point you've shown that you like a specific NPC enough to spend your fictional lives together. That's permission to be a bit more aggressive with their personality and interests.  
  
Notice, none of these are "loyalty missions". They're not linked to the core plot progression. They just make hanging out a little more interesting.  
  
Anyway, there are a lot of options on how to make NPCs more interesting using these kinds of ideas.  
  
I needed to write this essay before I could write an essay on redesigning the open-world RPG, so that's this essay done. Hopefully you enjoyed reading it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:21 AM](https://projectperko.blogspot.com/2014/10/dissecting-rpg.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5985592239895702053 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5985592239895702053&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [RPG](https://projectperko.blogspot.com/search/label/RPG)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5985592239895702053)

[Newer Post](https://projectperko.blogspot.com/2014/10/designing-noncombat-rpgs.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/10/boring-play.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5985592239895702053/comments/default)
