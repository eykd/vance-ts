---
title: "Space Games and Physical Programming"
date: 2015-04-15
url: https://projectperko.blogspot.com/2015/04/space-games-and-physical-programming.html
labels:
  - construction
  - game design
  - space
---

## Wednesday, April 15, 2015 


### Space Games and Physical Programming

Most space games take inspiration from pulp sci-fi. They are about exploring amazing new places, encountering strange new people.  
  
Those pulp stories abstract out all the complexities NASA has to deal with. The spacefarers have a relatively easy time surviving the rigors of space, and are mostly challenged by the amazing new things they encounter instead of basic space travel. This simplification allows authors to tell a good story, fast.  
  
But games require complexity.  
  
Most space games introduce complexity from the standard genres. So you add in more guns, more engines. Sometimes more cargo space. You have a statistical challenges, fighting, trading. Complexity introduced from other genres.  
  
But space has its own complexity. Obviously. Just surviving is a challenge. You don't need the artificial challenges of combat. Instead, just reintroduce a small amount of the natural complexity of space travel.  
  
Physical programming is one way to do this.  
  
Physical programming is the basic idea that various components can be connected in various ways and moderate their own behaviors accordingly. For example, you might have a heater attached to a thermometer, and the heater will turn on if the thermometer drops below a specific value. Pretty simple idea.  
  
Physical programming is about having all that stuff reflected in physical systems. Ideally, systems that you can clearly see in the main world. So you would be able to look at the ship and see the heater, whether it's on or off. See the thermometer, how high or low it is. Even, ideally, see the target temperature we've set up.  
  
This contrasts with a more common approach, where the heater would have a built-in thermometer and you'd be able to dial a number into the heater's configuration. Obviously, that's more efficient - but it's not physical. It's software. Digital. Integrated.  
  
Using very primitive basic components is a good way to allow us to control exactly how much complexity we want to expose the players to at the start, and still allow the players infinite freedom to tackle more complexity if they want.  
  
If you look at old space modules like the [Vostok](http://en.wikipedia.org/wiki/Vostok_1), you can see the kind of aesthetic this produces. It's also an opportunity to talk about a specific example of what you might have to build.  
  
Let's say an astronaut is going up just a bit, then right back down. They might only need one air tank. You can leave it for the astronaut to control - they can turn a nozzle and get a burst of air on their own. You don't really need to "program" it, you can just trigger it with a hotkey. You might include a barometer so you know when to open the air.  
  
But if the astronaut plans to stay up for long, they'll need more air. The Vostok has a ring of air tanks. In theory you could still do this manually - a different hotkey for each tank, personally keeping track of which ones are empty or full... but that's a lot of hotkeys, especially if you also need to do ventilation, electronics, etc.  
  
The answer is to add automation. Physical programming requires that automation to be physical, to be visible.  
  
You might start simply: you have a knob with calls for air, but it's connected to all the tanks - at each nozzle, it is broken by a mechanical switch. When you turn the knob, the pressure travels down the cable and hits the first mechanical switch. If it's open, the tank is opened and closed by the motions of the control knob. If the switch is closed, the pressure continues on to the next tank.  
  
Now you have one button to control the air flow, and you can manually click on a switch when a tank runs out to move to the next tank.  
  
Of course, that can be automated as well. Each tank has a pressure gauge on it, and you can use that to control whether the switch is open or closed. Now you have a knob to control the air, and it'll automatically fall through as the tanks run dry.  
  
You can automate it even further by connecting the barometer to the knob and automating it - when pressure gets low, pump more air in. This might need to be made more complex in situations where there's no leakage, because then you're worried about oxygen running out rather than air pressure getting low.  
  
It might seem odd to introduce painstaking mechanical solutions for basic things, but this allows us to precisely control how much complexity and challenge the player will encounter. The visibility of each component allows players to understand what they are looking at immediately, and also allows for us to do "topological programming".  
  
Topological programming is a subset of physical programming where the size and placement of the pieces is extremely important. For example, in Space Engineers, the conveyor system is topological programming. But it's baby stuff.  
  
An example more in-line with our earlier example would be the barometer. The barometer does not "read out a number" - you aren't transmitting a number over a cable. Instead, the barometer has a peg which moves up and down depending on the pressure. To make the compressed air activate at a specific pressure, you lay a switch over the barometer at the right physical point. It gets tripped when the peg moves. Variants allow for one-way activation, different kinds of activation depending on the direction, etc.  
  
The barometer also isn't a specific "size". It's as long as you want to stretch it. Cords and cables can't run across it unless they are a switch. You can also add complexity by changing the fundamental shape we're attaching this to: if it's a tube, like most space capsules, then you can attach it vertically but not around the circumference. It's not a curvable object.  
  
So we can make it as limited and challenging as we like - or make it easier and simpler to work with. Whatever our target complexity is. We can even do all different kinds of complexity in the same game using various tech tiers.  
  
Or tech which is good but fragile. For example, a barometer which outputs a digital number might be possible, but it malfunctions slightly in direct sunlight and gives erroneous readings.  
  
Moreover, because these are programmed onto a physical space, you can cut and paste functional "programs" by literally cutting and pasting. If we have a great system for monitoring pressure and using air tanks, we can copy that meter of tube and put the exact same design on another ship. We could even define it as "stretching" - the air tanks are an array of repeating elements, and if we define them as such when we lay down the initial code, we can scale the system to larger or smaller tubes by simply increasing or decreasing the number of repeating elements.  
  
In this way even beginners can use advanced systems. This is a great way to let people play without forcing them to wade through a bog of details. It's also a great way to allow the systems to scale up to incredible complexity, since people can creatively combine subroutines.  
  
Simulating these systems might seem annoying - it might seem like there's too many moving parts to do it reasonably. But very few of these mechanical bits need physics simulation, or even frame-to-frame simulation. The vast majority of them are event-based rather than simulation-based, which means that 99% of the time they are as lightweight as their models. LOD can even fix that, and in extreme cases you could unload their physical piece completely, just leaving their event response intact.  
  
Physics simulation is, after all, not the point. Neither is damage simulation. The idea is to draw "game-level" complexity out of actual space travel issues.  
  
Start with air. Heat. Ventilation. Keep moving up. Water. Food. Waste. Radiation. Keep moving up. Fitness, sleep, play, socializing, training. Keep moving up.  
  
You can also do the other half of the equation. Rocket engines. Vernier thrusters. SAS. Docking ports. Electricity constraints. Solar panels. Combine them: socializing with visitors, maybe.  
  
The point here is to stop playing up the complexity of combat or trading. Unlike Kerbal, we're also not reveling in the complexity of orbital mechanics. Instead, we're reveling in the complexity of humans surviving in extreme conditions thanks to these wonderful machines we've built.  
  
Our simulation should make it fun to try to get your astronauts to flourish in space.  
  
Or underwater, maybe. That could be awesome, too.  
  
Anyway, this was a tough essay to pin down, I hope you enjoyed it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:15 AM](https://projectperko.blogspot.com/2015/04/space-games-and-physical-programming.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/9174255652053738636 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=9174255652053738636&from=pencil "Edit Post")

Labels: [construction](https://projectperko.blogspot.com/search/label/construction) , [game design](https://projectperko.blogspot.com/search/label/game%20design) , [space](https://projectperko.blogspot.com/search/label/space)


#### 1 comment:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/13821591351542571226)

[Unknown](https://www.blogger.com/profile/13821591351542571226) said...

Well this article is extremely relevant to something I'm working on... Lemme just bookmark this :p

[4:42 PM](https://projectperko.blogspot.com/2015/04/space-games-and-physical-programming.html?showComment=1429314142911#c7581321908553962267 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7581321908553962267 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/9174255652053738636)

[Newer Post](https://projectperko.blogspot.com/2015/05/topological-play-pull-push-connect-and.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/04/how-to-sci-fi.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/9174255652053738636/comments/default)
