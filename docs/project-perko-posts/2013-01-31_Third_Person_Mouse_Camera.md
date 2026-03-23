---
title: "Third Person Mouse Camera"
date: 2013-01-31
url: https://projectperko.blogspot.com/2013/01/third-person-mouse-camera.html
labels:
  - game design
---

## Thursday, January 31, 2013 


### Third Person Mouse Camera

Recently I've learned to create human(oid) models and animations well enough that I can actually start creating characters rather than dummy bodies. One of the things I've become addicted to is the idea that the character animations need to "understand" the world.  
  
For example, I built a cartoon rig that can walk or run around, but when they get near something, they automatically interact with it in some kind of passive way. Running their hand along a wall that's too close, or putting their back to it if in stealth mode. Automatically looking at and reaching out for grabbable items. Ducking under or sidling through gaps that are technically large enough for them to just go through without such actions.  
  
I really feel that these activities ground the player in the world. If the avatar is interacting with the world, then the player is getting that feedback and, in turn, the player is more "in" the world.  
  
But I've run into an interesting problem: the third person mouse cam.  
  
Not the programming of it. The "shoulder cam" is actually pretty easy to create in Unity. The problem is the gameplay it supports. Or doesn't support.  
  
Shoulder-cam is not really very good for precise shooters. Instead, you get "action" shooters like Tomb Raider, where you just fire on the enemy in general, not with the level of precision you might get with first person cameras. This can be fun, especially if you configure the mouselook such that up/down doesn't change the vertical position you're aiming at, but instead whether the camera is squatting on your shoulder or flying far above. These settings can produce intense shooter action games.  
  
You can do platforming, Prince-of-Persia style. Tomb Raider style, again. I think this mode of gameplay is overly linear, though: I don't really feel like creating such a linear design, and would prefer something more open-world for my immersion-centric approach.  
  
The core difficulty, to me, is that the shoulder cam specializes at the middle distance. It's really good at targeting things that are three or four meters away. Action shooting happens at around that range, as does most platforming. At longer range you're better off with a first-person camera or, alternately, a proper birds-eye cam. Both allow you to finely target distant things. If you're up closer than three meters, your orientation and position begin to get muddy in respect to where the targets are, and things feel mushy and confusing. So you'd normally lock down the axes and go with something like a side view, where your movements can't accidentally make you face in awkward directions.  
  
There are ways around these problems, but fundamentally I'm interested in trying to use the middle distance well. Let's assume that I'm vetoing action shooters and plaformers - perhaps those elements will exist in some amount, but they won't be the core gameplay. What else is left?  
  
Map configuration/construction is one possibility. While Minecraft and its clones tend to be first person, all the action actually happens at the middle range. So a third-person world configuration/construction game should be possible, and even provide for more entertaining platforming.  
  
Another thing that happens at the middle distance is socializing, so it's possible you might be able to create a game around the idea of interacting with people. Not sure how to make that a proper game, although I'll think about it.  
  
Monster/robot training is another one you could do, where you feed/train/program your pets at middle distances, then watch them go off and fight or whatever.  
  
Anything else?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:24 AM](https://projectperko.blogspot.com/2013/01/third-person-mouse-camera.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7608171170253915100 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7608171170253915100&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7608171170253915100)

[Newer Post](https://projectperko.blogspot.com/2013/02/action-games-alternate-play.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/01/snap-together-colonies.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7608171170253915100/comments/default)
