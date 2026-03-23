---
title: "Hide and Seek"
date: 2013-07-08
url: https://projectperko.blogspot.com/2013/07/hide-and-seek.html
labels:
  - game design
---

## Monday, July 08, 2013 


### Hide and Seek

Nick Lalone tossed out a simple tweet, also [found here](http://gameideaaday.tumblr.com/post/54921144314/mmo-idea-hide-and-seek-permadeath-once-found): a simple game where you (and all other players) hide, and then there's an AI seeker that tries to find you. Players who hide successfully win the round and get some kind of reward.  
  
As far as meaty casual games go, this has all the hallmarks of being a good idea. A simple player action that can be done largely asynchronously, but an action that has some tactical depth to it. Fundamentally, it bears a lot of similarity to Parking Wars: you're choosing a "parking spot" (hiding spot) and hoping nobody calls you on it.  
  
The key to making this sort of game interesting is how well the player can read the seeker's intention. In a game like Parking Wars, you got to know your friends and what times of day they were likely to pop by to play the game - and also whether they would let things ride a bit, or instantly hit you. It was a game about understanding who you are up against.  
  
In this hide-and-seek game, you have to build the seeker such that the players can weigh their options. They have to understand the tendencies of the seeker.  
  
Here's my take on this design:  
  
You can place your character anywhere on the map - well, anywhere with a place to stand that isn't occupied by another player. The map automatically expands as more players log in, and shrinks with fewer players, so there's a constant acreage-to-player ratio. Creating 2D tile maps on the fly is pretty easy, so that's not a technical barrier. You can choose to place yourself somewhere else, but that will set you back some points. Ideally you want to choose a location where you'll be safe for a while, because you're awarded points by not being found.  
  
The player can always see all other players, and the position of the seekers. There's a ratio of acre-to-seeker that is also preserved.  
  
Seekers move according to some general rules. They come in a few simple varieties - the AI doesn't need to evolve, you just need to have which seekers are in the area change, and since they search in different ways, different places will be safe.  
  
For example, you might have an eagle seeker. The eagle moves in a straight line until it hits a barrier, at which point it turns right. It moves at one space per minute, and has extremely long range of vision. If it sees someone, though, it moves rapidly to them - they can't relocate once spotted. Using these rules, you can easily predict the path of an eagle... unless some other player hides badly, and now the eagle is suddenly over there, moving in some other direction!  
  
Or you might have hound seekers, which carefully canvas the local chunk, then roam across several chunks along the roads that are generated in the world - before choosing another chunk to canvas. If you're in a chunk that's being canvassed, you'll want to move, because the hound will eventually look in every spot. But if it's just wandering on the road, you're relatively safe.  
  
Or you might have something scary, like a childcatcher. They always go for places where other seekers have found players in the past. If a place looks like a good hiding spot... it probably is, except against someone who knows that players generally hide there!  
  
Anyway, the simple AI lets the player predict the sort of danger they are in, but it's made more complex by whether there are other players in the area that could get spotted and lure the seeker over. The terrain generation in question needs to be the sort of terrain you can hide in, so nice and rough - probably with some basic biome work. This place is a forest, that one's a jungle, that one's a city, etc.  
  
Also, the AI is self-balancing. If one of the AI seekers is more dangerous than the others, then players will generally try to avoid it and go into the chunks where there are no powerful seekers. However, that raises the population density in those "safe" areas, making them less safe. And lowers the population density in the dangerous areas, making them more safe.  
  
Add in an evolving map and some social features for completeness. If you hide within eyeshot of a friend, you get extra points. Of course, that means anyone who catches your friend will be able to see you. Maybe allow people to have multiple hiders as long as they are on different game worlds, so you don't feel like you only play the game by not playing it.  
  
For monetization, you could go with customizable avatars and buying the points that you normally earn by hiding, or even buying tiles to place on the world map. Traps to snare the seeker, barricades that count as walls for a few hours, hosting a new game world, accessing more game worlds simultaneously.  
  
This'd be easy to program and, I think, fun to play.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:36 AM](https://projectperko.blogspot.com/2013/07/hide-and-seek.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6473237267418215817 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6473237267418215817&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6473237267418215817)

[Newer Post](https://projectperko.blogspot.com/2013/07/games-as-striking-moments.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/06/where-starships-fear-to-tread.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6473237267418215817/comments/default)
