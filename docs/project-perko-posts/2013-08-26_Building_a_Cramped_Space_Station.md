---
title: "Building a Cramped Space Station"
date: 2013-08-26
url: https://projectperko.blogspot.com/2013/08/building-cramped-space-station.html
labels:
  - game design
---

## Monday, August 26, 2013 


### Building a Cramped Space Station

I've started playing around with the feel of a closed-in space station, the feeling that the station was designed to be lived in with a tight space constraint rather than being there for you to fight monsters in. There are a lot of questions about what sort of play you can have.  
  
First off, let's talk about constructive play.  
  
While I can easily put a base together in scene edit view, it reminds me that "leaving" the game camera is the opposite of what I want for the player. I want the player to feel like they are in the facility at all times, so if I allow a player to build a base, I might want to consider what kind of construction we could do from the "inside".  
  
First off, there's adding rooms. Right now I'm working on a 3D grid system, each room taking up a multiple of 5x5x5m chunks of space. The three-dimensionality of the grid makes it a little difficult to design in scene view, because obviously rooms get in the way of rooms, you can never quite see what's going on.  
  
So I began to consider: what if the avatar was what could place rooms? This is in space, so if there's no room there, you can still go to the 5x5x5m grid point and float in empty space. Then you can hit "tab" and pull up a list of rooms that can be placed. Flipping through the options puts up a blue ghost of the room in this grid point - augmented reality in your avatar's helmet, displayed in the game world as a player facsimile.  
  
Rotating and inverting scale are similarly done in-world by your avatar. The player hits "up" while in this mode, and the avatar sweeps her arms forward, spinning the room 90 degrees. Finally, click to lay it down proper. Ideally it'd be constructed somehow - flown in and attached or something - but that would be a lot of programming effort, so I'll probably just have it magically zap in after a few seconds.  
  
This sort of construction allows the player to "burrow". You don't need to do away with the idea of a map to do this, either. You just wouldn't use scene view maps - instead you'd use some kind of simplified iconic map in-world. Zoom the camera in when your avatar displays a map, Dead-Space-style.  
  
That option to zoom in on something your avatar is looking at is actually the backbone of more complex customizations.  
  
You've created some kind of room, but it's stock, probably empty. You can hit tab while inside a room and it'd focus your avatar's attention on whatever hot spot she's looking at. Then, like with placing the room, you can overlay glowing blue options for things to put there. Beds, posters, desks, computers, whatever you want that fits the hot spot type. Of course, zero gravity means you get some pretty freaky orientations...  
  
In terms of gameplay, this lends itself to grimy in-world fiddling as a gameplay mechanic. You slide through the halls of the space station and find an access panel. Pop it open and the camera zooms to let you see it clearly: inside it has a simple status indicator and a few leads that can be interconnected as you like. White, red, black - the twin row of leads can be wired to connect any color to any color, piping data, control, or power from any color to any color. A part of the challenge of the game is therefore wiring up your rooms so that you have all the functionality you need. T-junctions and other sorts of splitters make it difficult because white-red will go one way, and red-black will go the other, all clearly indicated by the wires on the wall.  
  
By constraining the flow of power, control, and data, we can make building space stations a much more interesting situation. It's easy to build a space station which functions, in that it has rooms and people can live in it. But if you want to build a station that has a lot of functionality, you'll need to get clever with the wiring.  
  
What sort of functionality would you need from a space station? Well, locking and unlocking doors, video feeds, PA systems - those are the typical first thoughts, and they'd be included here. But unless you're playing multiplayer, there's not a whole lot of need for that.  
  
Another option is handling failures, shorts, and decompression events - existing rooms slowly degrade, so you need to build with that in mind, and route around rooms that give out entirely. That's not too bad, I suppose.  
  
The option I want to focus on is resource pumping. Various rooms create various kinds of resources. Some will be physical, some will be data, some might even be emotional or cultural. As the owner of the space station, you get resources and special build options for exporting resources to the homeworld. But "raw" resources have a very low value. Instead, you want to convert them to more advanced resources. You catch sunlight, turn it into electricity. Combining electricity and water, you can create heavy-cell batteries, which produces some toxic effluent that needs to be dealt with as well...  
  
Rather than automating the conversion of materials, I want to make it mostly a manual matter. To do this, I will make use of space constraints.  
  
Let's say you receive vast amounts of ore from freelance miners. You need to store that raw ore somewhere, so you build a big room to stick it in. You need to get the ore to the smelter, so you create a wind tunnel that blows through the ore storage room which, with a small amount of robotic assistance, can send rocks gently along another tunnel you created to get the ore to the smelter.  
  
The smelter turns ore into ingots, but not so cheaply. It requires a lot of power - too much power for the "white red black" lines to carry, so you must use heavy power cables running from your generator to the smelter. It also produces a lot of toxic gas and ash, which must be either vented into space or stored for reclamation - both of which add space constraints.  
  
The ingots then get stored somewhere, and they're kind of heavy to move using air, so you use mag-loading. It works fine, and you could sell these ingots if you like. Which means you'll have to have a way to get them to a docking port, so now there's a magnetic conveyor belt running to a docking bay, maybe even the one you originally got the rock at...  
  
Or you could make the ingots more valuable by refining them further - into useful physical forms such as bins, or into higher-grade alloys. Both require more resources, including more power. Do you run another heavy cable line to them, or do you use the same cable line and only run one of the refiners at a time?  
  
You can start to see the spatial constraints rearing their head. At all times there is a question: can I reuse any of this infrastructure? I don't really need to smelt ALL the time - I can smelt far faster than I receive ore, so maybe I smelt, then I turn off the smelter and use that power for the alloying process. Hell, maybe I can even store the alloy bricks back into the ore containment room, since the dock only has 6 direct access room slots... otherwise I'll need to direct ships that want to give ore and ships that want to receive alloys into different docks.  
  
The 3D map allows us to create "focal points" - zones where there is a very high density of diverse resource consumption, such as docking bays, chains of refineries - anything where there's only a few 5x5x5m tiles active, and they eat half a dozen or more different resources that have to be piped in. With vertical having the same ease as horizontal, you can bring resources in via a variety of paths, but you are still limited to orthogonal directions. So there's always an effort to build a system which allows you to reuse some of those paths so you can condense the operation. The easier and smaller the operation, the cheaper it is to set up and the less parts there are to break.  
  
This can be made especially fun because of the white-red-black pipelines that permeate the building. You can use them to send out commands, if you wire everything right. So... can you have a button on the wall of your docking station which initializes transfer of ore, then automatically starts the smelting process while fuel lines refill your visitor from the other side?  
  
This is what I mean by "resource pumping". Resources take up space, whether at rest or in motion. Converting them takes time, so there is an aspect of "turning things on and waiting a bit". And, of course the better the output resources, the more complex the space station you'll need to design to accomplish it.  
  
Anyway, it's been fun to think about these kinds of things. The basic idea - obtain and refine resources - is pretty simple. But working it deeply into the "limited space" doctrine of "realistic" space stations required a bit of thought about the focus of it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:52 AM](https://projectperko.blogspot.com/2013/08/building-cramped-space-station.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3760259871462843829 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3760259871462843829&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3760259871462843829)

[Newer Post](https://projectperko.blogspot.com/2013/08/too-much-doing-stuff.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/08/complexity-in-open-empire-construction.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3760259871462843829/comments/default)
