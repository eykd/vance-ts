---
title: "Feedback Scales"
date: 2014-01-03
url: https://projectperko.blogspot.com/2014/01/feedback-scales.html
labels:
  - game design
---

## Friday, January 03, 2014 


### Feedback Scales

I was watching [Vlambeer's screenshake video](https://www.youtube.com/watch?v=AJdEqssNZ-U) and it made me think a bit about feedback. Obviously, his talk is a lot more useful, because he actually shows some stuff. But I thought I'd talk about it from a more theoretical standpoint.  
  
The thing I noticed about Vlambeer's approach is that a lot of the feedback he uses is immediate, but a lot of it is prolonged. I don't want to put up super-clear lines, but I do want to try and categorize it a bit so that it's easier to discuss.  
  
One kind of feedback is related to player inputs. Something like kickback is immediate feedback on a direct input - you press a button, your character moves backwards, or walks right, or jumps, or the menu opens, whatever. There is also conditional feedback on inputs, such as the gun lag as you jump - it tells you an ongoing, modal bit of info about how the game is currently interpreting your inputs. Something like walking, strafing, or jumping might be considered gameplay rather than feedback, although the line is just semantics.  
  
There's also feedback on the game state as a direct result of player action - showing success or failure. Here's where the classification starts to get tricky, because there's so many options. Well, let's talk about some variations anyway, to help understand them a bit.  
  
The visibility and animation effects on your bullets are a highly reliable ongoing feedback mechanism. You press a button, and you get big, juicy bullets. The sound effect is also a feedback effect, but it's really not an ongoing thing - it's "immediate" instead of "ongoing". The discarded shells that show your firing are a permanent (or long-term) feedback effect. In both cases, they are a direct result of your action, so we'll call them "first order". First order feedback.  
  
Enemy hit animations, explosions, bullet holes, and so on are also a result of what the player does, but there's a chain of causality. The player presses the fire button and, if she's in the right spot and the enemy is in the right spot, a short moment later the enemy gets hit. Since the player causes an event which causes an event, we'll call these "second order" feedback. By the way, catching a ledge, jumping into a powerup, and getting flung from a cannon are also second order events that require second order feedback.  
  
Things like enemy death are third order. That is, you fire a bullet which hits an enemy which causes their health to finally run out. If your enemies are all one-hit kills then it would be second order, since there's no "injury" event, just a "death" event.  
  
But normally something like a dying animation would be an immediate third order effect. Corpses lying around would be a long-term effect, as would smoke hanging over exploded robots or whatever.  
  
All of these are about communicating state. The more removed (higher order) the effect, the more you need to clearly communicate state changes and modes, because it's "further away" from the player and is harder for the player to directly grasp. On the other hand, the stuff "close" to the player is something they'll quickly grasp and repeatedly cause, so it should be something that doesn't make the game annoying with its size or excessive clarity - IE, a prolonged screen flash each time you fire a machine gun (first order) might be excessive, but might make sense every time you set off a grenade (second order).  
  
Well, you want to communicate some state immediately, to tell the player exactly what is going on in the game world. However, sometimes you want to tell the player about things that already happened, or even about things that haven't happened yet, such as allowing the player to see through a security camera or out a window or something. It's important for the player to feel grounded in the game, so telling them what they did is a great way to do that, and that's why bullet holes, broken robots, smoke clouds, shell casings and so on add so much to a game. Some reminders will be relatively short-lived, such as smoke clouds that take ten seconds to clear. Others might be permanent. Either way, their role as gameplay is probably minor if it exists at all. They exist to remind the player what happened, not create gameplay.  
  
But not all feedback is to communicate state to the player. A lot of feedback exists simply to make the world more exciting. For example, bullet scatter or random enemy death animations don't communicate much state to the player, if any. Instead, they add spice to the way the game communicates. Normally you'll want to avoid making this "spice" actually screw up gameplay. For example, you don't want the player to jump a random height when they hit jump. That would simply interfere.  
  
And, of course, even though I dryly talk about feedback as supplying information, that's a pretty iffy way to consider it. Sure, some kinds of feedback are mostly about supplying information, such as good camera work. Other kinds are clearly less about "communicating information" and more about "hammering it in really hard", such as momentary pauses, strengthening bass, etc.  
  
Anyway, these feedback ideas can definitely be extrapolated to nearly any kind of play. Any game with a complex, changing state could think of the same kinds of categories and maybe come up with some good, juicy ideas.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:55 AM](https://projectperko.blogspot.com/2014/01/feedback-scales.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4112577557626681597 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4112577557626681597&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4112577557626681597)

[Newer Post](https://projectperko.blogspot.com/2014/01/skepticatheist-community.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/12/ys-memories-of-crap-writing.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4112577557626681597/comments/default)
