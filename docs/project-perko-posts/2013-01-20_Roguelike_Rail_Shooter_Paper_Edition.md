---
title: "Roguelike Rail Shooter (Paper Edition)"
date: 2013-01-20
url: https://projectperko.blogspot.com/2013/01/roguelike-rail-shooter-paper-edition.html
labels:
  - game design
  - roguelike
  - transition
---

## Sunday, January 20, 2013 


### Roguelike Rail Shooter (Paper Edition)

I built a very simple paper prototype to explore the concept of a rails shooter that gets generated on the fly.  
  
The rules are simple: every node in the game is built out of a topology, gross motion, fine motion, transition, and one or more enemy presentations. I didn't even make unique enemies, by the way.  
  
These can have slightly unique results/conditions.  
  
So, for example, the first node in a random bit might be  
  
TOPOLOGY: Large room full of shelves. High chance of enemies hiding in shelves.  
GROSS MOTION: Run through and then turn around to face the enemies  
FINE MOTION: Slow-motion opportunity  
TRANSITION: Wall explodes (cannot leave room)  
PRESENTING:  
Wave 1: Dread enemies (corpses that get up)  
Wave 2: Popup challenge (enemies that just pop up at close range)  
  
As a result, this is what the player would experience with this node:  
  
"Ah, it's a room full of shelves and corpses. We're sprinting through. Turning around and... oh, a slow-motion power up and the corpses are waking up! Ah, killed the zombies and AGH THERE'S ONE IN MY FACE! Okay, let's go through the doo- AGH THE WALL EXPLODED!"  
  
Of course, this sort of very basic list system can't really reflect the difficulty of implementing this stuff actually happening in a 3D world in real time, but it does allow you to see how this stuff **could** be made to happen.  
  
In this case, I rolled up about ten nodes, and after the wall explodes things go like this:  
  
Still inside the shelving room. After the wall explodes, you turn and see the boss dropping a miniboss through the rubble. Fight!  
  
You run to a maze of tight halls and circle through them until you kill the eight or so zombies within. Then you crawl into an air vent.  
  
In the air vent, there's nothing. But peering out of the air vent is a cluster of enemies around an exploding barrel.  
  
Jumping out of the air vent onto a straight stairwell, you first look down the staircase, then run down it. You're staring at the exit, but then you spin and look up the staircase - zombies are stumbling down it! Kill them! (Please note that "camera pointed uselessly at wall while enemies creep up from behind" is actually a fine motion event, not me interpreting an event to be like this.)  
  
Through the door is the same shelving room you initially fled. You decide to stop and clear the room of the steady stream of zombies coming in from the broken wall. There is a quicktime event (shooting moving targets to avoid terrain damage is a common staple) where you dive through the broken wall  
  
The medium-size windowed room through the broken wall has no enemies in it, but you can see enemies out of the window - and snipe at them, if you like. You pass through the door and seal it.  
  
There's a large room with a small ramp on the other side. There's no enemies but, halfway through the room, there's a direction sting. Something like "Through there! We're getting close to the loading docks!" Then there's a sprint through a pack of slow, damaged enemies to crawl under a vertical door.  
  
You end up in a hall packed with doors, and decide to clear it. A bystander is caught up, and you can rescue them by shooting a steady stream of incoming enemies and a miniboss. Unfortunately, the first door you try is locked.  
  
You move around this large hall repeatedly, hopping around a bit, while shooting the various scattered zombies coming in through the doors. Then the boss arrives and carves away a big chunk of the level before winging off.  
  
Still in the hall of doors, you stand your ground. There is a gore note as the boss drops a pack of corpses as it leaves. After falling wetly to the ground, the corpses stand up and attack, simultaneous with a few zombies coming in from another door. After killing them, you go through the damaged area...  
  
This is the sort of progression you can easily get when you think of more than just map layout and enemies. Even with just generic enemies, you can see the framework for an interesting sequence.  
  
However, the content required to build this is way out of my league, so I'll focus on maybe doing something similar on a much smaller scale.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:24 AM](https://projectperko.blogspot.com/2013/01/roguelike-rail-shooter-paper-edition.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6858051039654651749 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6858051039654651749&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [roguelike](https://projectperko.blogspot.com/search/label/roguelike) , [transition](https://projectperko.blogspot.com/search/label/transition)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6858051039654651749)

[Newer Post](https://projectperko.blogspot.com/2013/01/dlc-and-saying-stuff.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/01/roguelike-rail-shooter.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6858051039654651749/comments/default)
