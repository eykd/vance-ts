---
title: "Module Design in Astrophobia"
date: 2013-08-30
url: https://projectperko.blogspot.com/2013/08/module-design-in-astrophobia.html
labels:
  - game design
---

## Friday, August 30, 2013 


### Module Design in Astrophobia

My Astrophobia prototype is coming along swimmingly, one hour at a time. But one challenge that faces me is the design of the cramped space modules you inhabit.  
  
There are two pieces to this equation. Design from a "how you move through them without getting stuck or lost" perspective, and design from a "what they do" perspective.  
  
"What they do" is slightly easier to tackle, so let's talk about that first.  
  
These modules are proper modules in that they connect up in rather arbitrary stacks. Sometimes you may have to use an adapter, but the power and air flows correctly. This means you can "grow" your station with whatever modules you're really interested in having. But what sort of modules is that, and how are they organized?  
  
Well, what sort of things can you do in space?  
  
The first and foremost challenge is, of course, to make your station habitable. The lowest level of habitability requires four things: an airlock with a suit rig, a life support system, a bed, and a bathroom. Obviously, you could have a module which does all these things in one go, but in general you would have a separate module for each. You might sometimes find a bathroom right in a life support module, since water and solids would otherwise have to be pumped from one or the other.  
  
Even with just these four modules, you already have more complexity than you might think. For example, I'm not letting you get away with magic teleporting water.  
  
This means you need to have a fluid pipe connected from the life support to the bathroom (and any other place you might want fluids, such as fish tanks). This is a core part of our actual gameplay: laying out our facility involves weighing a lot of resource transfer options. Fluid pipes are pretty forgiving, so they make a good intro.  
  
Air is obviously piped through each (pressurized) hab through the docking hardpoints. But fluid? Not so much.  
  
So you have to run the fluid pipe to your bathroom. There are two basic approaches to it.  
  
One is to have your fluid pipe run along your modules through custom hardpoints. This is not difficult, but it adds to the weight (and price) of your modules, reduces available space, is noisy, and means you have a specific, quite limited kind of dock hardpoint. The other option is to have the fluid pipes run out of the sides or backs of the modules and run standalone fluid pipes to the areas you want fluid, completely separate from your pressurized modules. Both options have advantages and disadvantages, and you can use either one depending on the modules you decide to buy. Either way, how much space is taken up by your need to pipe water around is an important factor - it may be that space is at a premium for you, or it may be that you can run a zigzag standalone pipe all over massive areas and not care. It depends on your design philosophy. (It will also effect how it breaks and how you can repair it...)  
  
Anyway, the simple constraints of life support are not quite that simple. While providing for one person is pretty easy given the fact that you can simply call up for more water/ox tanks whenever you need them, you may want to do far better if you have a team, or visitors, or are selling oxygen to visiting ships, or are running industrial modules that contaminate the air, or any number of complicated things. Most of these have little to do with the beginning player, but basically a life support module isn't a closed system.  
  
It scrubs CO2 out of the air and then... dumps it out a gas pipe port. You can leave that just venting into space, or you can attach a gas pipe to it and use it for something else. Or you can use a more advanced life support system that can reclaim oxygen from it.  
  
It scrubs contaminates out the air and then... dumps them. Along with some percentage of the nitrogen base. Same thing applies, and if you start to really foul up your air with chemicals, you may have to worry about running low on nitrogen.  
  
It creates oxygen from electrolysis, probably, so there's a hydrogen byproduct. Which is... yup. Out a pipe.  
  
The player is allowed to try to use these outputs or ignore them, as they feel comfortable. But the point is that things do get complex if you want them to. And, in our game, that complexity is reflected by having to move resources around, which takes up physical space.  
  
Basic life support aside, what else can you do in space?  
  
Well, one option is obviously science. There's a plethora of possible science modules. But, in this universe, people have been running around in deep space for quite a while, and research is probably pretty well-established. Most research that you would want to do would be about monitoring unusual local conditions, rather than fundamental research on microgravity.  
  
So there's monitoring humans in the environment. Obviously you and your crew are viable monitoring subjects, but those same devices could be used on visitors. And then there's astrophysics, using particle detectors, gravity detectors, and telescopes. That's probably it.  
  
Research is not really a focus in these facilities, at least not in the vanilla game. So what else can you do in space?  
  
Supporting other spacegoers is always valuable. This might take the form of servicing ships - providing them with fuel, oxygen, water, and food. This would also push the player to develop a complex web of food production or shipping storage, to get maximum return on investment. Repairs might also be a viable source of income, requiring advanced robotic arms.  
  
Other spacegoers include tourists (or crew on "unshore" leave). Providing them with entertainment, relaxation, and excitement could be a fun thing to have to aim for, with garden habs and malls and virtual reality games...  
  
What else can you do in space?  
  
Shipping is simple on the surface, but turns out to be endlessly complex and customizable underneath. Whether you're talking about shipping data or shipping fish, it's a matter of arranging transport in and out, and storage while it's local. Given the difficulty of moving resources around, good storage and dock working would be an art.  
  
Space manufacturing is viable in our universe. Take in resources, output more refined resources or finished goods. This is where you get a lot of industrial contamination, heat, vibration, and the more awful of the noise sources. Whether this is as simple as processing waste from docking vessels or as complicated as turning asteroid ore into spare parts, this can be very profitable if you can get all the pieces working together. Start with shipping, I think.  
  
Obviously, energy generation and storage is another biggie, right from the start. It's not too bad if you just want to run a bit of life support and a television, but if you plan to sell energy to visitors or run massive processing facilities, you may need more than just a few solar panels. You may even need special "power cables" that take up space, just like fluid or gas cables.  
  
Of course, all these things you can do are not mission objectives. They're just random things you might like to do. There's nothing wrong with just building a giant inflatable hab and doing absolutely nothing. When you start a new game, you might choose the kind of environment you start in. This would probably alter how feasible it is to do these various things - or even how hard it is just to stay alive.  
  
...  
  
Now, regarding moving through spaces.  
  
I've chosen a third-person camera for my game because it gives you a sense of awareness about where you are relative to the things in the room. This is especially important in Astrophobia, because things will frequently be in weird places due to the zero gravity. Relying on the player to remember to look up or down is a bad idea, and the third person camera minimizes that.  
  
However, the game is also quite cramped at times - purposefully so. A third-person camera is a little bit difficult in such times, because you're either looking at the outside of a wall, or you're so close to your avatar that they fill the screen. I have some solutions for this - the camera automatically trends towards the correct zoom range for the room you're in, and the actual camera focal point is just over your right shoulder instead of directly into the back of your head, so even at maximum zoom you never fill the screen. You do, however, tend to take up a very large part of the lower-left portion of it. I may do something with that, like make you fade out or make the camera move a bit more to the side or something, I haven't decided.  
  
In the end, living in space is about living in confinement - hence the name. I want the player to always feel like they are straddling the edge of claustrophobia, and that's not hard, because in reality the space station is very claustrophobic. Living spaces are cramped.  
  
There is a limit on how cramped I can actually make the game spaces, though, because the player has to be able to navigate through them. So I can make things a little opener, a little cleaner than you might normally get in a realistic design. The third person camera will actually help a lot, here, because it will make spaces seem smaller than they are.  
  
Navigation is inherently complex in zero gravity as compared to in gravity, and navigation with a third person camera is inherently more complex than navigation in first person or gods-eye.  
  
For example, our little jet pack. Forward, backwards, left, right, up, down. And how do you reorient? Those are just cardinal movements. Keeping the camera from aggressively reorienting is critical, so while there is some gentle orientation built into the cameras to keep from falling through walls or spinning hopelessly, in the end you'll need to control your orientation more carefully.  
  
One option is to use the mouse for orientation. However, this is not ideal for a few reasons.  
  
Third person mouse control is usually "mouse is a cursor in the world, and your character looks at that point". This doesn't work as well in a world where up and down are as viable as left and right. Still, it holds enough promise that I should try it out. The first-person-style "move the mouse to rotate your character" has always worked poorly in third person, and works even worse in zero gravity.  
  
Another option is to use thumbsticks to change your orientation. This would actually be a pretty good solution, except for one problem: I'm not going to require a controller. So I would have to put thumbstick analogs into keyboard controls. So... WSADSHIFTCONTROL for moving, and then... what, QERF for rotation? That's a lot of freaking buttons!  
  
It's made a bit more complex because the astronaut needs to be able to designate what she's looking at. IE, interact with a specific item.  
  
I also want to implement a control scheme for "sticking" to surfaces, so you can "walk" or "climb" along surfaces in a very easy way. I think it'll be a simple extension of the above methods, except that you'll move relative to the surface instead of relative to the camera, and your character rotation will be a lot more forgivingly anchored.  
  
In the end, controls are probably a more difficult problem than actually making the rest of the gameplay. More experimentation is needed!

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:12 AM](https://projectperko.blogspot.com/2013/08/module-design-in-astrophobia.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/224601958581179485 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=224601958581179485&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/224601958581179485)

[Newer Post](https://projectperko.blogspot.com/2013/09/network-control-as-gameplay.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/08/too-much-doing-stuff.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/224601958581179485/comments/default)
