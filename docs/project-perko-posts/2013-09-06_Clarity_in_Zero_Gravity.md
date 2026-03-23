---
title: "Clarity in Zero Gravity"
date: 2013-09-06
url: https://projectperko.blogspot.com/2013/09/clarity-in-zero-gravity.html
labels:
  - game design
  - technical
---

## Friday, September 06, 2013 


### Clarity in Zero Gravity

(This is a long technical post)  
  
As you hopefully know, I'm developing a thing called Astrophobia. It's a game about living on a space station, and it has relatively real-feeling zero gravity stuff going on.  
  
The difficulty lies in what gameplay to create. See, the feeling of being someone stuck on a space station is pretty compelling, but there's no inherent gameplay in changing how the player moves around. It feels very different, but it affords no particular skill challenges. At least, not in any way I can make feel meaty and fun. Most of the actual difficulties of navigating a space station I've abstracted out, because you can't control a digital avatar to the degree required to make it truly realistic.  
  
My original idea was to make the gameplay about creating and managing a space station that deals with vaguely real-feeling hard-scifi challenges, such as maintaining mining vessels or entertaining space tourists or serving as a deep space radio relay.  
  
However, the creation of a space station is actually not easy.  
  
Oh, the mechanics are easy enough. I've already implemented them. You can place rooms, work the systems, and so on. But in terms of headspace, it feels tenuous and difficult. The system I was going to use, which involves colored cables running through the base, is very hard to grasp from inside the base.  
  
It would be quite simple to do from outside the base. Blueprints on a table, draw some lines, check some boxes. Easy to understand. The cognitive load is lessened by the use of tools. That is, the tool of a map.  
  
I did implement a map in the game, and you can use it to build the base. But it feels... wrong. It doesn't feel like you're living in a space station.  
  
After having actually "lived" in a space station - that is, having built a few in the game world and floated around inside of them - I can say that construction isn't part of the feel. Sure, maintenance, attaching things, detaching things - yeah. But actually commissioning new modules and deciding how fundamental wiring is done? That's not part of the experience. I should have realized it immediately, of course: that sort of design work isn't part of any "live in a place" experience. Living in a place is about living in a place, and designing is unrelated.  
  
So I was thinking about breaking the game in half.  
  
Designing a facility (or a module for a facility) is a huge amount of deep fun, and living in the thing you've built is a huge source of deep fun, too. So I really think that I need to split the game in two.  
  
I'm thinking you've got the "living in space" section, but then you've also got the "ground support designing stuff" section. I like the idea of cycles, of a team living on a base for six months, then returning home. And you get to design the add-on or the next base that will be there for the arriving fresh new team.  
  
I like the idea of making the designing of the facility feel as organic and real as living in the facility. To that end, I'm thinking of a design system that feels like pencils on graph paper. This sounds like a detail, but it's not: I'm talking about sticking the design to a 2D, line-centric approach. It feels fitting: the personal portion of the game extends traditional 2D into 3D, so it seems suiting that the traditional 3D designing tools are brought down to 2D.  
  
This constraint isn't really a limitation so much as an advantage born out of the game's overall constraints. Space station modules are, fundamentally, a very constrained design space. For example, they are all basically tubes running along a given axis.  
  
Let's say you want to design an inflatable hab. You could do this by simply choosing that material and drawing a line. Our graph-paper constraint understands you've chosen a structural material and want it to be that radius at those points, and you instantly have a fundamental structure for your module. If you want a rigid cubic tube, draw a line after choosing that, and you've got it. Draw BOTH, and you'll have an inflatable outer hab around a rigid cubic box.  
  
Line controls exist to help you if you want straights, smooth curves, or mirrored modules, obviously. And adjusting them is as easy as grabbing the line and moving it.  
  
Once the fundamental structure is laid down, it's a matter of putting in the things you want to put in. Here a simple, Kerbal-like method of lateral/radial symmetry can be used, or you can manually work with "the far wall" or "the near wall" to place objects that aren't mirrored. So if you want your inflatable hab to have soft beds in it, you can select them, pump the radial symmetry, and then click on the hab. An array of beds will be placed in a ring around the core axis. Exterior solar panels? Same thing, except they automatically get placed on the outside of the wall.  
  
You don't need the added complexity of seeing the hab in 3D, at least not in the basic design system. You don't need to place beds by clicking in a 3D space. The design constraints of the module allow you to place the bed in 2D knowing full well exactly where it'll actually show up. Similarly, since everything needs to be attached to a wall, there's never any confusion about where it'll end up in space. Just cycle through the walls (two for our basic modules, four for our double-layer example) and whatever you place will be placed on that wall with whatever symmetry you've selected putting it in other areas as needed.  
  
Then put in connectors of your choice so your module can connect to other modules. Design those, too. Send it all up at once, and the end result is that these one-axis simple-to-design modules end up as a catacomb of your own design. Which you then live in.  
  
This very easy to use system can allow players to build whatever modules they need or want, and also allows for easy modding as people add more parts, ports, and structural elements. But is is easy to transition from the lineart design to a final, functional mesh?  
  
Well, yes.  
  
Many of the things you added are static modeled. The beds are not dynamically built, just dynamically placed and rotated.  
  
The only mesh that has to be generated is the fundamental structural mesh. This isn't as hard as it sounds, though: create one "slice" of the material, correctly modeled and UV-mapped. Make sure it's got symmetric verts on each side. We can simply take that mesh and duplicate it over and over, each time lining up the left edge of the next bit with the right edge of the previous bit. Scaling up and down happens over the course of the mesh - if X is our spinal axis, then we simply scale all the verts towards the preferred scale depending on their X component.  
  
The difficult part of the fundamental structural mesh is complex structures. For example, what if you want windows? What if your inflatable hab should have big plastic windows in it, ignoring radiation concerns?  
  
The easy way to do this is to have different materials. You'd have three: an opaque mesh slice, a window mesh slice, and a transition mesh slice. However, this can get very complex if you want something like circular windows (rather than ribs that are windows). I think that freeform window placement is probably something to hold off on, but it probably wouldn't be THAT difficult to place them like beds or solar panels, except that instead of just placing meshes, they cut holes in the wall before placing their mesh.  
  
With the technical concerns addressed (or handwaved), I can talk about gameplay.  
  
Right now, I like the idea of having to live in the base for a specific duty cycle - three months, six months, a year, two years - it'll depend on what the player decides and the expense of switching crews, as well as the level of medical support available to the astronauts. However, because of that long timespan, the game obviously cannot be played entirely real-time.  
  
I'm thinking that you can play as much as you like in real time, but there are various things you can do to enter an automatic time-advance. Sometimes these would be short - going to bed would advance you eight hours, perhaps. But they could also be long: simply clicking "go" on your weekly schedule could advance a whole week if nothing breaks in the middle. I want to reward time spent actually wandering the facility and living in it, so I think that "design research" points steadily tick up as you work in real time, second-by-second. Obviously this can be gamed by just leaving the game running in the background, but I'm not to concerned about that kind of exploit. There are plenty of tasks to do in real time if you want to - repairs, maintenance, EVA, even just eating or hanging out with other astronauts. Also, you can switch between multiple teams on multiple space stations...  
  
Design research points are obviously spent in the design phase. I'm thinking they augment the idea of cash: you earn cash by having your space facility actually do something. The cash fee for sending up new modules (whether for a new station or to attach to an existing station) is simply based on weight, nothing more. However, every component has a design difficulty attached to it as well, and if you can't meet that fee, you can't figure out how to work it into the module and it doesn't pass testing. IE, you can't launch. There are obvious opportunities for tradeoff here, with something like a lightweight inflatable wall having a high design cost, but a heavy metal tube having a low design cost.  
  
There might also be other kinds of resources, but we're not going to worry about that yet. That's for mods.  
  
When designing a space station, you need to take into account how it's going to work and what it needs to accomplish. In the beginning that might be mostly just figuring out how to keep astronauts alive. But you'll need to expand. Support tourists, mining fleets, deep space probes, etc. All of these bring in the cash while testing your design capabilities. The more challenging variants don't require bigger stations, but better designs. Share designs with your friends, as well - even invite them aboard.  
  
But when it comes to actual design, an important factor is how the station actually works. In order for a design to be "better" or "worse" it needs to be better or worse **at something**.  
  
Previously I had designed the systems to be about consuming vast amounts of space, so spatial optimization (especially regarding material transfers) was the primary concern. However, with this refit that doesn't really suit. What I would like to do, if possible, is make it so that the individual modules end up really tightly bound together, so that you'll never really consider a module as a completely independent entity.  
  
Let me start with the concept of a control panel. I like the idea of a clunky control panel for this system, rather than the adaptive intelligent computer system I developed. I like the idea that when you launch a module, you have buttons and levers and lights which represent different functions included in the structure of the module. You can transfer between modules, too - the hardpoints will have a dozen or so "wire" points which will count as contiguous when modules are connected.  
  
In previous gameplay prototypes, it was about optimizing space with time, such that various operations might share the same space as long as they didn't share the same time. I think that's still valid, but it can't have the "pumping" feel because that relied on designing the spaces to interleave physically, which is not part of the new design system. Instead, I think the new system is going to be about managing degradation.  
  
That is, you could run the smelter and the die-caster at the same time, but their combined smoke will choke your filters and their failure chance will spike. The vibration and heat will tax both your astronauts and the hab itself, causing slow leaks, cracked electronics, and so on.  
  
I like this idea, because it highlights the joins between modules, giving you freedom to express yourself within a module, and then attempt to optimize how you put modules together and try to maintain them. Obviously, basic supply management is also going to be an issue... but within any one hab, the player should feel free to go with the specific design they feel happy with, rather than worrying that a cabinet is half an inch off of optimal. The pressures are on inter-module and supplies, not intra-module.  
  
That said, controlling operations is going to be important, but it needs to be something which can be scheduled and worked through with an accelerated simulation, rather than painstakingly performed in real time each time. So my thought is that each piece of an operation is very well understood and you can literally schedule them by just dropping basic functionality ("turn on smelter") into a timetable. The controls which can perform that task are automatically detected, and the actual NPC activity which does those operations can be computed. "How long does it take Ralph to get from the smelting panel to the casting panel? There's an airlock in the way? Shit, I have to design this better, there's a wasted hour there..."  
  
Of course, it can also be done manually.  
  
One key left unmentioned so far is the idea of things breaking down. In my previous gameplay, that really wasn't part of the equation. But in this system, it's critically important, because breaking down is one of the major things that happens if you don't optimize well. Part of your design needs to take into account what happens when something breaks down - for example, is there a backup system? In addition, how easy is it to get to that system and repair it? Do you have replacement parts? These are questions that a beginner probably won't care about, but when you start to design large systems for smelting or whatever, it starts to be a concern.  
  
Anyway, those are my thoughts on Astrophobia today. This weekend, I'll put together the module construction system.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:35 AM](https://projectperko.blogspot.com/2013/09/clarity-in-zero-gravity.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/12841445589032209 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=12841445589032209&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [technical](https://projectperko.blogspot.com/search/label/technical)


#### 2 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjaHKYaGHq3pU7I0vtdKtuJEMKm5ep6 UmKCcE5pyYEYrGXsWAXW-poXGIhBl6wUuT2 CzTwuFoZi6hC6wXTizxSWU\_QWIGTJmRzHglIMUDTrx7R9SJqqr37zmJ\_6cfiuq4/s45-c/296929\_2113223436322\_575383855\_n.jpg)](https://www.blogger.com/profile/15818989694914343123)

[Eric Daily](https://www.blogger.com/profile/15818989694914343123) said...

Hey Craig,  
  
I'm sure you already thought of this, but one thing we tried to do at Send More People for our game Drift was to have randomly generated wrecks, each having modules of different types and damage levels. You'd then drift over and scavenge parts you need. So you'd still have that ship building, but it's not a separate stage, it's seamless. You'd detach that part, and float it over to your ship, attach it there and its functionality would then be added to your ship. Not saying this is necessarily better, but we struggled hard to find that happy place in between construction and immersion, and we felt like that was the best fit.  
  
Good luck never the less!  
  
[8:34 PM](https://projectperko.blogspot.com/2013/09/clarity-in-zero-gravity.html?showComment=1378524866704#c6984603848886404152 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6984603848886404152 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I thought about that, but I like the open ended module design.

[9:15 PM](https://projectperko.blogspot.com/2013/09/clarity-in-zero-gravity.html?showComment=1378527329368#c8037612829196211490 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8037612829196211490 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/12841445589032209)

[Newer Post](https://projectperko.blogspot.com/2013/09/mods-and-modules-and-content.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/09/on-pax.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/12841445589032209/comments/default)
