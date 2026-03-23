---
title: "Network Control as Gameplay"
date: 2013-09-03
url: https://projectperko.blogspot.com/2013/09/network-control-as-gameplay.html
labels:
  - game design
---

## Tuesday, September 03, 2013 


### Network Control as Gameplay

One of the things I'm doing in my Astrophobia space station game is that I'm making networking into an element of gameplay. In addition to physical space constraints, I'm also adding networking constraints.  
  
There's a lot of reasons for this. It's not complexity for complexity's sake: the constraint adds a tier of automation that would be difficult or impossible to pull off if we "flatten" the network out so that everything is connected to everything.  
  
In the game, there are three colored cables running through every room: white, red, black. In rooms that split up, these cables would split up - some going one way, some another. These cables are the heart of the networking system. They run power and data. Simultaneously, when possible.  
  
The basic rule is that one line can only provide enough power for one heavyweight facility. Things like lights and doors and computer consoles are connected to the power system by the low-grade wiring of the hab modules themselves, so that's not a problem. But you can't plug something that needs industrial levels of power into a standard wall socket. Your life support system, for example, would suck down one line of power. If you had a smelter and a planet-scanner as well, those would each require one line of power. That's all three lines of power - white, red, black.  
  
So this is a pretty limited resource, but not as limited as it sounds. The lines don't run uninterrupted throughout the station. Red isn't the same circuit everywhere. Instead, this particular segment of red might only run through four modules, with another segment of red running through eight others. Obviously, you could power those two segments separately.  
  
So one method to using a lot of heavyweight devices is to split up the network, and have power sources providing to each different area. This requires a fair number of power sources - you might prefer to skimp and use something like a battery bank, which sucks down power and puts power out opportunistically on all three lines, but can run out of juice.  
  
Another option is to hook a bunch of industrial devices to the same power line, but only turn one of them on at a time.  
  
This brings us to the other half of the deal: data.  
  
The lines do not simply bring in power. They transfer data. Even an unpowered line transfers data. This allows, just for starters, remotely controlling the systems.  
  
Put a screen up in a room, plug it into the red power line. Now you have direct access to the status of all devices on the red line - both heavyweight devices and lesser devices such as the screen you're working on. You can see the devices on the screen as you walk by, in real time, a little label highlighted with their basic state. Click on the screen to interact with it properly, bringing up the detailed status reports and options for each connected object. Turn off the planetary scanner by simply clicking on it, then clicking the power toggle. Turn on the ship repair system the same way. Manually guide the repair arms right there - no need to float over to the repair arm bank to do it, so that bank can be left in vacuum and far away.  
  
So there's a balance. The fewer lines you keep to, the more things you can control from anywhere on the line. The more line breaks you have, the easier it is to power every machine simultaneously... but you'll have a harder time controlling them remotely.  
  
That's the tip of the iceberg. Like states in a Turing machine, it isn't really how many or few states you have so much as how they work together.  
  
Let's start with the concept of a router. Plug a router into a room, and it hooks up to any two lines rather than any one line. The router will either keep the lines as they are (red to red, black to black) or swap them (red to black, black to red) depending on its state.  
  
This alone opens up a vast array of control possibilities, giving you the option to not only reroute power, but also reroute control. Switch between the atmospheric scanner and the gravitic scanner as you like, while both machines continue running in the background. Switch between dozens of different security cameras. Completely shut down or bring on-line vast areas of station for maintenance purposes.  
  
But where this entire thing begins to shine is that all of this combines to allow for automation - including NPC work behavior.  
  
Let's say you have a life support system. It runs on tanks of oxygen and nitrogen. Over time, it will use these resources up, and you'll need to swap out the tanks.  
  
The status of the tanks can be read from any connected console. Sure, you can visually read them. But that's just a visual representation of an underlying data stream, and that stream can easily be parsed and reacted to by automatons such as Jed, the only astronaut crazy enough to cohabitate with you.  
  
So Jed "sees" that a life support tank is running low, probably reflected by an in-game visual of him working with the screen.  
  
A basic rule programmed into his little astronaut brain is that he should keep the life support tanks in good condition, so he will now automatically look for a full tank to put there. As long as you put a cargo bay on the same line, he'll see the cargo bay's stocks. The data stream includes the specific in-game objects referred to, so now he can actually go and grab the full tank, cart it to the life support system, swap the two out, and cart the empty tank back to the cargo bay. Similarly, if you drop below a few full tanks in the cargo bay, he can automatically order more and/or call for refilling the empties.  
  
And if there's a router on the line, then after he looks for a cargo bay and doesn't find one, he'll toggle the switch and look again.  
  
This is also valuable for mods. For example, the science scanners create images of what they are scanning. If you see an anomaly, it's usually worth taking manual control and aiming the scanner for an in-depth look at that region. However, the image is transmitted over the network. There's no reason a mod couldn't do image processing and automatically detect and pursue anomalies.  
  
You can also do automation, in theory. Tell a computer (or astronaut) to look for specific outputs from specific devices, and then give specific devices specific inputs. This can easily create chains of events - when a ship loads ore into your ore storage, it reacts when you hit 80% full, pipes the ore into the smelter, deactivates the smelter while piping the basic metal into the refinery, turn on the refinery, etc, etc, eventually pipe it all back to the ship automatically.  
  
I look forward to implementing it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:08 AM](https://projectperko.blogspot.com/2013/09/network-control-as-gameplay.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5300474878808844733 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5300474878808844733&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5300474878808844733)

[Newer Post](https://projectperko.blogspot.com/2013/09/extended-manly-punching.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/08/module-design-in-astrophobia.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5300474878808844733/comments/default)
