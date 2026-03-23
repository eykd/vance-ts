---
title: "Fluid Time"
date: 2014-08-19
url: https://projectperko.blogspot.com/2014/08/fluid-time.html
labels:
  - game design
  - programming
---

## Tuesday, August 19, 2014 


### Fluid Time

I realized a little while ago that I've been leaning very heavily on a particular concept nobody else seems to use at all. I call it "fluid time". I have to explain it in order to explain my NPC-mod system, so here we go!  
  
Most of my recent prototypes involve being able to fast forward, pause, even rewind. They feature going to some other location, but still having the first location processing in the background.  
  
Normally, if you have things that change over time in a game, you'd attach them to the frame or physics loop and process them each iteration. But that doesn't scale very well as timescales change and the number of changing objects reaches the thousands or millions.  
  
Using fluid time lets me get around that, and handle extremely large numbers of objects at any timescale I please.  
  
It's a pretty basic idea. You take the statistics that behave predictably, and instead of calculating that predictable change every frame, you just create a function for it.  
  
For example, let's say Anna is the only farmer we have. She produces food. When we plonk her into the game world and assign her that task, the "food" stat begins to change in a predictable way. The formula becomes "at day 1: 0 food. +1 food per day."  
  
Now, if we zoom off to the far side of the galaxy and do a million other things, that function continues to exist. It doesn't take up our CPU, Anna doesn't need to be loaded into the scene. If we want to know how much food we have, we just call that function with the current day and it calculates out how much food we have.  
  
Let's say that farmers stop producing food in winter. In that case, our function would simply have a bound. "At day 1: 0 food. +1 food per day until day 270."  
  
We know when the function becomes invalid, so we know when to revisit and recalculate.  
  
If we want to do it strictly, we can: day 270 dawns, we revisit the situation, and the formula changes to "At day 270: 269 food. +0 food per day until day 360."  
  
Alternately, we could simply pause time in that area until we revisit - time stops there at day 270, and the player gets to take control at that time, even though the day might be 190,028 in another sector.  
  
We also have a lot of options about historical info. Once day 270 rolls around, we can either save that now-obsolete span of time, or we can discard it if we don't need to remember. What would historical info get us? Well, you could rewind time, you could look at historical trends, you could play in multiple times simultaneously...  
  
Another big advantage of this method is that it allows synching multiplayer really cheaply. It doesn't work for everything - for example, it can't respond easily to details like movements or the moment-to-moment choices of other players - but it works well for cheaply keeping track of thousands of low-maintenance shared objects. Of course it does: that's what it's intended to do locally, and it works just as well on a network.  
  
There's one more big advantage, and this one's a doozy: it's easy to mod.  
  
One of the core problems with mods is that they can only usually interact with the "surface" of the game. Mods that affect core functionality are usually not possible, to the point where several Skyrim mods come with a java program that runs in the background to forcefully intervene against the core code base. The reason it's hard to do isn't malice, it's architecture: the code is intermeshed with itself to do a specific kind of job, and there's no "cracks" in the wall for mods to break in through.  
  
An event-driven system is a lot more flexible, as you can either overwrite the delegate assignments or start catching events.  
  
But there are some problems with event-driven frameworks.  
  
The biggest for us is that Unity doesn't serialize event subscriptions or delegate assignations, so saving and loading and transferring them over a network is nightmarish. The biggest problem for everyone else is that events are hard to debug, hard to keep track of - too many asynchronous pieces moving in every direction.  
  
So most games don't expose much event-driven stuff, and mods have to break in. This results in things like Skyrim's dreaded "script cancer", where scripts run every frame to check all the relevant stats and states, bogging things down to a crawl. Events would allow you to do this more fluidly, attaching your functions to events like "onStrengthChanged" or "onEquippedItem" or whatever. But... it doesn't serialize and it's hard to debug.  
  
We can tackle both of these issues at once if we create an event handling framework that can serialize and deserialize properly. The framework can easily keep track of who is signed up for what and make it easy to debug and even visualize in real time.  
  
It's annoying to have to build this kind of framework when the C# event/delegate framework works almost well enough on its own, but on the plus side it lets us integrate into Unity and our specific project much more firmly. For example, press F12 and you can see the rays of connectivity between watchers and watchees.  

  
Fluid time benefits from this due to the large number of interconnected moving pieces. A new farmer, or a storm, or a mod that introduces crop blight - they can all interact with the "food" fluid time system and run in a very low-maintenance, cheap way.  
  
Press F12, and you can see what mods are affecting the crop totals, what mods are waiting for food production to reach certain levels, what mods are reflecting food values in some ways, when the current formula is due to be obsolete, what is making it obsolete...  
  
Anyway, soon I'll write a post about how we can use this to make moddable NPCs, but this is long enough as it is. A hint: it involves scripting in the lexical sense!

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:25 AM](https://projectperko.blogspot.com/2014/08/fluid-time.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5837354529288594500 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5837354529288594500&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [programming](https://projectperko.blogspot.com/search/label/programming)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5837354529288594500)

[Newer Post](https://projectperko.blogspot.com/2014/08/repeating-design-space-ships.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/08/moddable-npcs.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5837354529288594500/comments/default)
