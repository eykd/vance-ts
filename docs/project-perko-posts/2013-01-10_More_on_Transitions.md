---
title: "More on Transitions"
date: 2013-01-10
url: https://projectperko.blogspot.com/2013/01/more-on-transitions.html
labels:
  - game design
---

## Thursday, January 10, 2013 


### More on Transitions

I wrote an essay [(link)](http://projectperko.blogspot.com/2013/01/the-forever-game.html) about generative content. I'd like to explain it a bit clearer.  
  
Let's use the idea of a fantasy game where there's a hero guild, and you can build arbitrary heroes and take them out on quests. But we want the heroes to feel like they really have a personality and an effect on the world, rather than just being a bundle of combat stats.  
  
We have generative content: the heroes. We want the content to mean more than just varying stats and classes, so we decide to use the idea of transitions. We build a random quest engine and a world... we put together a game. And this is what comes out:  
  
The village chief asks you to go into a cave and kill off a small pack of goblins that's been marauding in the area. So you go into the cave.  
  
Here's where the algorithmic generation of content begins. And here's where transitions begin.  
  
The transition engine starts by asking "what do I want the player to feel, and about what?"  
  
Let's say the player has been getting pretty relaxed recently, doing pretty well. So we want to give him a bit of a scare. The engine decides that the player should feel dread about these goblins. So the next piece of content has to be introduced in a way which causes dread - a very specific emotion.  
  
So the cave opens up and becomes a catwalk above a vast cavern. And the cavern is filled with a raucous goblin army. Hundreds of goblins. They don't see you, but now you know that there is a goblin army. That's dread.  
  
Lets say the player pushes on. Well, let's go ahead and punch things up. We'll give the player a taste of a similar emotion: dismay. The way we introduce the next piece of content should dismay the player. In this case, we'll say that the player stumbles across an alarm trap - and the sound of hundreds of angry goblins fills the air. They take shots at you from below, but the bridge is wide enough that they cannot hurt you. But they are coming for you. Stamp stamp stamp!  
  
The algorithm is not terribly complex - it has a few concepts that a normal map generator doesn't have, such as the idea of specifically introducing rooms you can't yet reach, and introducing resources (a monster army) that aren't actively doing anything. But those aren't complicated concepts - other engines also do that, they just don't do it for the same exact reasons we want to.  
  
Now, this doesn't rob the player of choice. They could have turned around, or rolled a boulder off instead of moving forward, or whatever. And it isn't a specific set of results you are aiming for. It's a heuristic that allows you to, in this case, make the player afraid of goblins.  
  
Afraid of an enemy so dull and boring that they are used as the primary example of standard fantasy mooks.  
  
If it can spice up a completely standard enemy, it can spice up the variations you create, too.  
  
For example, let's say you have a rogue on your team. The rogue detects the alarm trap ahead of time. Yay! You now like your rogue a bit more. It's a transition - the transition that used to be a dismaying alarm trap is now an empowering discovery of that trap.  
  
You can even give the characters some level of personality *because you know what the transitions are*. The characters can know that the alarm trap would have caused dismay. And they can react: "This is getting too dangerous, we should turn back" says A'li'ce. "I am not scared of goblins," B'-ob' replies in a harsh whisper.  
  
In turn, these statements make the player feel emotionally invested in the characters. These random characters, these bundles of stats - suddenly they have a personality, they're interacting with the world.  
  
This is much easier than trying to script them to do that in response to elements on a random map. If you stumble across an alarm trap on a normally-generated random map, there's a big chance it's out of position, not actually very dangerous. So the characters treating it as a threat is actually de-investing, because they come off as not actually connected to the situation at hand.  
  
In this case, the transition is created very close to the time it comes into play, so the situation is well known to the engine, the emotion it is intended to cause is relatively likely to actually be caused, and the characters won't appear totally daft when they react to it.  
  
Actually, the characters chatting about what might be ahead is, fundamentally, a kind of transition! As much as a door you have to kick down, or a dragon that flies down out of nowhere, or scattered cover that lets you sneak up on a patrol, or a villager crying out for help.  
  
That's what I'm trying to talk about.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:01 PM](https://projectperko.blogspot.com/2013/01/more-on-transitions.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4398012777543849254 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4398012777543849254&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### 1 comment:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQGVSPmlXYBXDVsU9gDHvY7gClGEm13CSiUOrvj1yfrx9\_Jj8C45-fhxyb65KGHKGVk9aCNYBXzy9zVtTkuSz42WIY7uJSV8HS5 WhTOUSUlFImSDkvk9nvSzTxK6ihHA/s45-c/grenss.jpg)](https://www.blogger.com/profile/07006701742406299244)

[envelope](https://www.blogger.com/profile/07006701742406299244) said...

okay, that makes a lot of sense.

[8:08 PM](https://projectperko.blogspot.com/2013/01/more-on-transitions.html?showComment=1357877282421#c6650491744226348727 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6650491744226348727 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4398012777543849254)

[Newer Post](https://projectperko.blogspot.com/2013/01/action-script-and-location.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/01/the-forever-game.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4398012777543849254/comments/default)
