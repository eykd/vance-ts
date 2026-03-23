---
title: "Challenge Stacking"
date: 2013-09-17
url: https://projectperko.blogspot.com/2013/09/challenge-stacking.html
labels:
  - game design
---

## Tuesday, September 17, 2013 


### Challenge Stacking

I wrote a longggg post on how to get players to prefer elegance in their constructions instead of "bigger = better". But it got out of hand and was much too long, so let's take a whack at one of the central ideas:  
  
One kind of elegance, and the easiest kind to implement for a game, is suitability.  
  
For example, you want to land on an atmospheric planet, like Earth.  
  
One solution is to get a big rocket with heavy landing struts. Use the rocket's thrust to decelerate safely to subsonic speeds and continue thrusting all the way to the surface before landing a huge, empty fuel tank on heavy struts wherever you decided to land.  
  
The other option is to drop a teardrop-shaped probe. The bottom of the teardrop is a heat shield, which safely absorbs the re-entry burn and lets friction take you down from supersonic speeds. Then the parachute deploys, slowing you further. The heat shield drops away and spindly little lander legs deploy - tiny, because they don't need to weather re-entry and don't have to support an entire fuel tank. In the end, you safely land without expending any fuel at all.  
  
It's obvious which of these solutions is more elegant. The question is: how do you reward a player for coming up with the second one instead of the first one?  
  
Giving the player limited resources is one option: you choose the elegant solution because it is cheaper or lighter. However, I'm okay with expensive elegant solutions, with large elegant solutions. So I don't like the idea of limited resources, at least not in the construction phase.  
  
I think what makes the fuel-less probe more elegant is that it deals with the challenges of the mission in an appropriate matter, instead of spending a staggering amount of resources in a sub-par workaround.  
  
By understanding the challenges along the mission path, you can use them as opportunities instead of hazards. The rocket-rocket-rocket approach treats all of the challenges as hazards. The passive-teardrop approach treats the challenges as opportunities to get free acceleration. It's an elegant approach, even though it has a lot more moving parts than a rocket-rocket-rocket approach might.  
  
This same approach can be generalized to all kinds of challenges. For example, you want to build a buggy to drive over the lunar surface. The low gravity is a challenge, because it means your grip on the surface is really poor.  
  
Well, in reality a wheel is a very elegant solution on its own. Wheels use gravity to help you propel yourself efficiently, even if the maximum propulsion is pretty low and gets worse on low-gravity worlds. You could improve things a bit by simply making bigger wheels, but let's consider alternatives.  
  
One option is to make a legged "jumper". Low gravity means that the joints can be much lower-powered and still pace across the surface quite quickly. There are a lot of considerations here, though: unless you're quite practiced in building legged robots, you're probably going to find yourself facing challenges such as dust in the joints, poor balance, slipping on sandy slopes, and so on. These are the same considerations you'd be facing with wheels, but we've got wheels down pat.  
  
Another option is to use a hybrid of wheels and climbing legs. The slow progress on wheels is fine, but it's the rough terrain that prevents you from driving that's the problem. For those situations, hooked "climbing" legs can grip onto slopes or large rocks and help to haul you over. They also serve double duty as devices which can flip you back over if you tip. Of course, these are probably not ideal for climbing up proper cliffs, but they would allow you to navigate broken terrain.  
  
Putting aside mobility, the low gravity offers many opportunities for a rover not related to moving. For example, the rover could have a spring-loaded tether which it fires a hundred feet into the "air" to give a good view of the surroundings. The camera falls back to the ground, but it's durable enough to survive the much lower impact trauma than it would have in high gravity, and the rover can reel it in and reset the spring. There are obviously dust and impact considerations to be made, but the ability to get a panoramic view might be worth it.  
  
You could even use a similar system to fire a hook forward, grip the ground, and then drag yourself towards the hook. The low gravity makes dragging quite easy, if you can get the hook to stick.  
  
Another benefit of low gravity (accompanied by low ground speed) is that you can have very fragile unfolding systems - solar panels, long sampling arms, and so on. In fact, you could even put the wheels on spindly extending mounts to give your rover a much higher added stability, although if that speeds up your rover then it will increase the impact and vibration forces on itself and any other devices you've mounted.  
  
Someone who creates a rover with these kinds of utilities for taking advantage of lower gravity will be creating vastly more interesting rovers - and also performing at a higher skill level than someone who just creates yet another generic rover. These are the sorts of opportunities we want to provide, especially in coordination with soft space/weight constraints.  
  
To do this, we need to provide the player with two things.  
  
1) Construction tools adaptable enough to allow the player to misuse them.  
  
2) Challenges that act as both hazards and opportunities.  
  
This is a little more difficult than it sounds, because in order to make challenges that are both hazards and opportunities, we need to have quite a lot of different play systems in effect. Gravity and atmosphere are easy targets for space games, but what other systems might work?  
  
Some are external. Dust and weather are big examples that generally go unused. Atmospheric chemistry is another example, especially if we allow for chemical reactions that can turn one chemical into another. Minerals that perhaps could be mined. These are all challenges - some are more hazard than opportunity, some are more opportunity than hazard, but there's no need to nitpick.  
  
Other play systems are internal. For example, let's say that NPCs can control vehicles to do automatic exploring and scanning. It doesn't matter the type of vehicle - telescopes, probes, mining ships, comm sats, rovers - all vehicles can be automatically controlled by NPCs to optimize their performance. However, NPCs will hesitate and move very deliberately, making their optimization pretty crap.  
  
Gathering information would help to improve NPC performance (and player performance, if they take the helm and can see the information). For example, if you have a good map of Mars near your rover, then you can plan your rover's movements in advance. Maybe you deploy a satellite that passes over your rover and takes pictures. A camera on the rover would be an obvious requirement, giving you detailed feedback as to how you're doing. The formula for how much a camera improves performance is based on the camera's distance from/height over the target. The satellite is quite far away so its information has some value, but not a whole lot, and it's only taken once per orbit. The on-board camera provides very good feedback, but it's actually too close to the target (the ground), limiting its view.  
  
This is when people start coming up with different solutions, like the launched panorama cam. Optimize the cameras.  
  
This basic "line of scanning" formula can be used more abstractly to allow for dozens of different kinds of scanning in the same way that a weather algorithm allows for dozens of different kinds of atmospheres. We can use the same basic formula to calculate out the scientific value of a scan, whether you detected valuable minerals, whether the people on your hab think they have a nice view, whether your space construction facility can safely construct things with all its spindly arms...  
  
Similarly, the ability to convert chemicals into other chemicals (for example CO2 -> O2 -> H2O) can be implemented for a much wider variety of things. For example, you can model the human crew as eating packaged food, which is then converted into waste and plastic packaging, each of which can be converted into other things or ditched as you prefer.  
  
Now, you shouldn't force the player to deal with every challenge all the time. These challenges should be strictly player's choice. If the player wants to use a precreated hab module that handles the waste and packaging quietly, that's fine. But if the player wants to tackle optimizing things and connecting systems, they should also be allowed to do that. Tackle challenges as you like. The player will, at some point, realize that tacking on 50 more tons of food is less effective than setting up a clever, elegant way to recycle waste.  
  
Hm. Now the primary issue with creating such a game is how you would handle the construction/realtime control side of things without falling into the same pitfalls as Kerbal, but without dumbing it down.  
  
The biggest issue there is that not all of these are physically challenging systems. If you want to take in carbon dioxide and output water, the construction involved is just to slap down three or four modules on top of each other and call it a day. Slapping together units doesn't require any particular skill, so it's not a good match for our physical construction skill-based play.  
  
One alternate option is to make the required skill one of long-term prediction. You can connect things up, but you have to know how well your supplies will last, your chances of breaking, and so on.  
  
Another option is to recast things like chemical conversion and cameras into physical constructions that have strict restrictions. For example, converting chemical A into chemical B is just a node you slap in, but the node puts out a massive amount of heat. Another node puts out vibration. This one, radiation. The physical construction you build will then have to not simply resist the stresses of gravity, thrust, and atmosphere, but also the stresses you cause with your own systems.  
  
That would probably work best with inflatable, unfolding systems...  
  
Hm!

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:16 AM](https://projectperko.blogspot.com/2013/09/challenge-stacking.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7100692359848008684 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7100692359848008684&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7100692359848008684)

[Newer Post](https://projectperko.blogspot.com/2013/09/techtris.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/09/ikebana.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7100692359848008684/comments/default)
