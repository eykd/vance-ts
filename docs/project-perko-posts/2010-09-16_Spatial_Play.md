---
title: "Spatial Play"
date: 2010-09-16
url: https://projectperko.blogspot.com/2010/09/spatial-play.html
labels:
  - game design
  - world design
---

## Thursday, September 16, 2010 


### Spatial Play

Recently I've been talking about using transportation routes to define a world's civilizations, but I've had a hard time talking about why the play is deep. So I'm going to make a post about the fundamentals of constructive spatial play. IE, things like Sim City, rather than things like Halo.  
  
Normally, a space is defined in terms of two basic principles: how easy a point in space is to cross, and what resources are available from a point in space.  
  
For example, in Civilization you have plains tiles, which are easy to cross. Forest tiles are harder to cross (and give a combat bonus). Mountain tiles are impossible (or very difficult) to cross, as are water tiles. However, as time progresses, you learn to cross water tiles using boats - first shore tiles, then deep sea tiles. Later, flying units can also cross mountains.  
  
This carves up the world into "slices" of land, and civilizations in different slices will have some time before they manage to cross over. Normally, the game Civilization downplays this by having technologies advance so fast that by the time you've finished exploring your starting zone, you have the transportation to move into the neighboring zones. Similarly, in space faring games, your range usually expands faster than you can colonize the stars you're currently limited to. A game where the land "slices" remain separate for longer would appeal to me, as it creates a chunky "settle-explore-settle-explore" feel. But I'm getting distracted.  
  
The other half of a map are the resources available. Normally, the more construction-intensive a game is, the wider the variety of resources. If a game is combat-tactical instead, the resources are much more limited. This is because tactical games (such as Starcraft) lean far more heavily on the way space is carved up. While a Starcraft map won't be explicitly broken into zones, it will have many areas that are difficult to cross, creating an unusual topology that makes you have to think about exactly how you should proceed. Tactical games tend to focus on having a complex topology, rather than actually slicing up space into discrete areas.  
  
Construction-centered games focus more on resources, and slice space up with simplistic abandon on the side. Games like Civilization don't simply feature food, work, and money as resources: they actively feature more than a dozen resource types including gems, whales, tribal villages, coffee... spacefaring games (four-X games) work similarly, with each planet varying by size, inhabitability, gravity, and half a dozen different fundamental resource types, quite separate from things like ruins, natives, and so on.  
  
Okay, now let's work out some basic play models.  
  
Both the tactical and the construction games work on the same fundamental idea: you stake out control over the valuable regions, you use them to expand your capabilities, and you defend them. In tactical games, the topology of the land plays a vital role, while in construction games it is the resources that tend to be more important. This is hardly and either-or, though: it's a sliding scale that varies not just between different games, but between different plays of the same game.  
  
For example, in Starcraft you'll want to gain rapid control over your mining spots, even though they are not often topologically valuable. In Civilization, you may want to clamp down on a particular path specifically because your enemy will come through it, even though there are no resources to take advantage of.  
  
Both kinds of game are about controlling specific points in space - a game of territory. The complexity comes when someone else is jockeying for position as well. Your territories bump up against each other. There is often a little bit of bumping, and then a war where each side attempts to strike deep into the other person's territory. There is no mixing - even the most advanced Civilization game doesn't really go any further than "allowing his troops to pass through your land", which is not really a fundamental part of play.  
  
Now, if you use a transport-based system, things get a bit different. In a transport system, the resources on the land are probably of much less importance. Instead, what matters are the routes built to connect various points. The points themselves probably only have value based on their access to the kinds of spaces that are conducive to building routes. IE, probably rivers and oceans.  
  
The fundamental difference between this kind of situation and the above situation is that it isn't about controlling land, it's about controlling movement. Nearly all economic strength comes from your trade routes - they're the most important thing to build. Please note that there doesn't even have to be any kind of specific goods traveling the route or anything: in most situations, just having a route and "traffic" is enough to do the sim. Generally, the further away the two tips are, the more valuable the route. And the busier the route, the more valuable the route.  
  
Connections are a factor you can't forget, either. If A->B->C, then C should be getting some traffic from A, via B. Generally, this calculation is where the AI comes into play: it determines what percent of the traffic to send through to C instead of claiming for itself, and it determines the taxes on those goods. In the end, this resolves to a single percent: B keeps a specific percent for itself, C gets the rest of the economic boost. If B is part of the same nation, it may very well choose to let all of the traffic through. If B-town is part of a different nation, they may claim 100% unless C-burg's nation has some sort of treaty about it. Of course, B-town's flourishing economy will affect it's B->C route independently of A-ville. In terms of in-game flavor, C-burg will still get some of A-ville's products, but from B-town traders instead of direct.  
  
This isn't really very complex, but as you can see, it starts to lead to a very different kind of play.  
  
You can go to war. You can march down the roads into B-town and conquer them. But in the process, you'll probably destroy their economy, radically diminishing their ability to trade with you. With the trade routes not bringing in the traffic, you have just injured yourself by conquering the enemy.  
  
Perhaps forcing B-town to send all of A-ville's trade straight through to C-burg will more than offset it, though. Or perhaps you should invade a city that is not actively trading with you. Or maybe you just want to claim that the river is yours, so you can tax the water trade on it (or benefit from whatever value that terrain has, in games where there are resources on the world map).  
  
There are many factors: what makes a good target for conquest is no longer a matter of how rich and undefended they are, but whether conquering them makes any damn sense. Your neighbor is not  automatically your enemy: the borders are not iron walls which nothing crosses.  
  
The political game flourishes as well. For example, marrying one of your nobility to one of B-town's nobility is a good excuse to negotiate a more favorable trade status. B-town will send through a higher percentage of the goods from A-ville if you agree to bulk up the B->C trade road to prevent bandits and promote trade speed. If you're playing with cultural drift/unification, marrying will also bring the cultures closer together, or perhaps even inject your culture into their city without having much of their culture injected into yours.  
  
What I'm trying to say is this: a resource-centric game is all about extermination. A trade/travel-centric game is all about interacting.  
  
Games like Civilization have tried to add more and more cultural/trade stuff into their games with every generation. But they are missing the most crucial factor: they are still thinking in terms of controlling locations. They should be thinking in terms of controlling travel.  
  
Sim City understands this to some extent, as roads and other means of travel are central to defining your city. However, if you control every road, there's not very much complexity in the roads themselves. Their only real purpose is to make sure that the traffic values don't get too high.  
  
So, that's my commentary on constructive spacial play. What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:38 AM](https://projectperko.blogspot.com/2010/09/spatial-play.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/659923942010096409 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=659923942010096409&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [world design](https://projectperko.blogspot.com/search/label/world%20design)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/06491438864262214190)

[Z. Cross](https://www.blogger.com/profile/06491438864262214190) said...

"What I'm trying to say is this: a resource-centric game is all about extermination. A trade/travel-centric game is all about interacting.  
"  
  
"A game where the land "slices" remain separate for longer would appeal to me, as it creates a chunky "settle-explore-settle-explore" feel."  
  
Thanks for putting into words my two biggest issues with Civ. It's not that the Civ games are not fun, they just are not as engaging as I keep hoping them to be. Whenever I play Civ IV, I end up playing up until my borders get locked by the other nations.  
  
Anyway, this post and the previous one were very interesting; I think that I might try my hand at making a small trade-route sim akin to those that you described.

[1:04 PM](https://projectperko.blogspot.com/2010/09/spatial-play.html?showComment=1284667459571#c4126014126668991134 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4126014126668991134 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It's always nice when somebody is coming from the exact same angle.  
  
I hope to post some videos on some specific prototypes I've made, so this is probably going to be a major theme for several months.

[1:23 PM](https://projectperko.blogspot.com/2010/09/spatial-play.html?showComment=1284668611397#c144703124762565454 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/144703124762565454 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/659923942010096409)

[Newer Post](https://projectperko.blogspot.com/2010/09/video-and-details.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2010/09/economies-and-world-building.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/659923942010096409/comments/default)
