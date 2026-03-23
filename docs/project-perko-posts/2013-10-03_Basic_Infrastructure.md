---
title: "Basic Infrastructure"
date: 2013-10-03
url: https://projectperko.blogspot.com/2013/10/basic-infrastructure.html
labels:
  - base building
  - game design
---

## Thursday, October 03, 2013 


### Basic Infrastructure

I've been thinking about a mechanic that base-building games overuse and misuse:  
  
Building basic infrastructure.  
  
Nearly all base-building games heavily feature basic infrastructure. For example, in Evil Genius, you always needed to create all the various kinds of rooms to get your mook ecosystem running. Same with Dungeon Keeper. In SimCity, you need to get your roads and power and sanitation running, etc, etc.  
  
These games feature you building one base (or city, or whatever) at a time. The complexity of getting the infrastructure "right" is the main focus, because it takes quite a while for the base to mature and many of the weaknesses in your approach appear at different levels of maturity. That is, the game introduces more and more layers of infrastructure ("your citizens demand police stations!") and your basic structure becomes less and less effective.  
  
However, in games where you build a lot of bases (or rockets, or whatever), this isn't a good approach. You can see that in something like Starcraft: the infrastructure required to get a base running is generally pretty straightforward. Mastering the various paths of optimal construction is a pretty low-level skill - it's pretty much assumed you have the infrastructure part of the game down pat before you even play your first multiplayer match. Then the skill lies not in laying out the infrastructure, but in choosing the path and timing.  
  
I'd like to think that there's a third option hidden between the two.  
  
That is: instead of layering on more and more types of infrastructure as time progresses, we start out any given base with the layers already present, chosen by the player.  
  
Let's say we're making a SimCity game. There's a lot of complexity to be found in laying out roads and sewers and power, but we decide that we're going to simplify all of that. Instead, what we're going to do is make the environment matter a lot more. While it is pretty easy to lay out roads and sewers and power, now you have to consider how those requirements will differ depending on things like winter snows, boiling-hot desert days, a continual flood of poor rural folks moving to the city, and even just simple things like hills. Moreover, the complexities can overlap. You might want to build a city in a hilly desert with a flood of rural immigrants.  
  
The core gameplay is the same in the sense that you're still setting up cities. However, we've moved the complexity from a single, complex case to a number of small, simpler cases that interact. This makes it more suitable for creating many cities at a faster rate, rather than only a few cities at a very slow rate. This, in turn, allows us to leave cities running and allow the player to have a constellation of cities they (and their friends) created.  
  
Let's come up with a different kind of game: there's a fantasy world, and it's got floating islands above it. But nobody's been able to get to the floating islands... until now! You invented the hot air balloon! So the game is about building cities on these islands.  
  
The camera is strict side view. The thickness (depth) of the island at any given brick is how high up you're allowed to build above ground level, creating some easy and flexible topology limits. In terms of basic infrastructure such as places to live, warehouses, plumbing, etc - that can all be handled by very simple modular buildings. No need to painstakingly lay those out - it's not the focus.  
  
Instead, we have a number of other facets that do require infrastructure, and the player is allowed to choose how much he wants to tackle these. For example, building docks for airships. Catapults to throw supplies to other islands. Giant nets to catch incoming supplies (from the ground or other islands). Dangling rope "elevators" to transport to and from the ground. Signal towers to communicate with other islands.  
  
All of these have some amount of infrastructure required. Not only do you have to put in the structures to perform the tasks, but the exact speed and quality of the performed task will vary depending on how well you support it. They also can interfere with each other - you need to keep airships out of the catapults' line of fire, and keep them out of the smoke from the signal towers...  
  
And the player gets to make those decisions. How large are the catapults - that limits how far they can fire, yes. And more of them is a higher fire rate. But how long they take to winch back and reload also depends on the support structures built around and beneath them. The player gets to try to cram as much of the kind of functionality she wants into the limits of the space.  
  
That's some basic functionality - networking between bases - but there's a lot of other kinds of infrastructure.  
  
Productive infrastructure. Not every base needs to be able to brew mistmead, but you might have one base that specializes in doing just that, providing your whole network with the benefits (and profiting). Not every base needs to have a mystical research tower. Not every base needs to gather books from all around the world. But all of these tasks can be done to any extent with any base that the player chooses. In addition to having interesting specific infrastructure requirements, they get along well with other infrastructure requirements. The librarian city will want to host a lot of travelers. The research tower will want extensive signal towers. The mistmead city needs a lot of heavy shipping and farms...  
  
This can be made significantly more complex if the process produces side effects, and you have several options about dealing with them. For example, your magical research tower may produce a magical mist. The longer experiments run, the heavier the mist gets. You have a lot of options on how to deal with the mist. You can stop researching for a while, letting it fade off. You can put up towers on islands in a windstream, letting the native wind blow it away. You can put up fans yourself to blow it away. You can build your tower significantly taller than the rest of the buildings so the mist doesn't affect them very strongly. You might even be able to figure out a way to harvest the mist, or use it to grow magical plants. You can combine these in any way you please.  
  
Besides productive infrastructure, there's also hazards. Exploring has always been a big part of our human endeavors, and exploring naturally takes us to places that are foreign and often dangerous. This can be reflected in various environmental hazards.  
  
A city over a deep jungle might be able to harvest all sorts of interesting things with landing teams... but they won't be able to rely on the local farmers giving them any food, because there aren't any local farmers. You'll need to either pipe it in over a complex series of catapults and nets... or you'll need to grow it locally. Or some combination.  
  
A city over a desert might be exposed to nasty levels of heat and sun. To keep your citizens healthy and energetic, you might use fans (the same ones that blow mist away) or overhanging tarps (that cast shadow as well as they would shed rain). The heat hazard is also an opportunity, though, as it makes it possible to grow desert-related plants and animals and monsters, as well as do desert-related magical research. Drying food and optic heat beams are also possible.  
  
A city over an icy pole might be insanely cold, requiring you to heat the place up with, say, magical firepits. But the firepits have a zone near them that is too hot, and a zone far away that is too cold. So the topology becomes complex. Of course, the cold is useful as well - you can raise cold-attuned plants and beasts, perform cold-related magic, etc. You can also freeze things, harvest ice, and see the stars more clearly.  
  
These conditions can easily be mix-and-match. For example, an extremely high-flying (low atmosphere, isolated) island above an ice field (freezing cold) in a region imbued with sinister magic. The conditions also scale: it's cold, but not THAT cold. The air is thin, but not unworkably so... etc.  
  
In this manner, the player chooses what island to develop for what purposes. The player chooses what conditions they want to try to handle, and what benefits they can get out of it if they design well.  
  
This is an alternative to "slow bases" like SimCity and "fast bases" like Starcraft. It's the "many bases" approach.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:51 AM](https://projectperko.blogspot.com/2013/10/basic-infrastructure.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5786656935137892497 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5786656935137892497&from=pencil "Edit Post")

Labels: [base building](https://projectperko.blogspot.com/search/label/base%20building) , [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5786656935137892497)

[Newer Post](https://projectperko.blogspot.com/2013/10/mode-changing-designs.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/09/misusing-of-moon-crystal.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5786656935137892497/comments/default)
