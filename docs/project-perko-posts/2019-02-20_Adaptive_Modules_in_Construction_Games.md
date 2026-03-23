---
title: "Adaptive Modules in Construction Games"
date: 2019-02-20
url: https://projectperko.blogspot.com/2019/02/adaptive-modules-in-construction-games.html
labels:
  - construction
  - game design
---

## Wednesday, February 20, 2019 


### Adaptive Modules in Construction Games

One thing I like in construction games is being able to create different modes within a creation. For example, a car that can turn into a jet, or a space ship that can switch between science mode and warp speed mode.  
  
Very few games reward this kind of thinking due to one big constraint: single-purpose, static modules.  
  
Non-adaptive modules.  
  
For example, if I want a space ship that can switch between science and warp speed mode, there has to be some advantage to switching rather than just being in both modes at the same time.  
  
But the modules for science and warping are always the same size, always the same configuration, always require the same amount of power, etc, etc. The only "switching" we'll likely do is simply turning one or the other off to save power, rather than something that creates a fun visual or play impact like sliding parts around, expanding or shifting, etc.  
  
There are a few ways to create the opportunity for players to build adaptive designs, and they all boil down to adaptive modules. Here's some types.  
  
1) Folding modules.  
  
If our science and warp elements can both fold down to take up less space, then we can have them share their expanding zone. To allow for more interesting results, we'll want to allow for at least some adaptiveness in the folding. Perhaps science modules come in a variety of shapes and expansion zones, while warp engines can expand arbitrary amounts, allowing us to pick and choose exactly how much space they share, when.  
  
This can get even more complex with things like power capacitors and tanks being extended when full, etc.  
  
The folding can also be complexly related to the flow of ship resources. Perhaps the science devices unfold and create a new control room people can walk into, meaning it has to be butted up to the pressurized section. Or maybe it has in/out fluid flow, and the position of the outlets changes as it inflates...  
  
2) Expensive timing elements.  
  
If our science and warp elements take quite a bit of juice, simply turning them off and on is important. But to make things feel meaty, simply turning things on and off won't work. We need timing elements.  
  
Perhaps the computers take a little while to boot. The engines need to spool up. The science sensors require a massive influx of water to extend.  
  
To make this really meaty, give us the option to accelerate the timing with outside resources. Computers boot faster if other computers lend it processing power. Engines spool up faster if you use a flywheel assist. Science sensors expand faster if you send them water faster.  
  
Note that these all start up fine with no assist, it's a matter of time savings. That way, even newbies can create this stuff, no need to wire it up in a complex way to just get it working at a baseline level.  
  
3) Incompatibilities.  
  
If modules are incompatible, then turning them on and off is an important technique. To make this especially meaty, the incompatibility should be manageable in some way if you make your ship clever enough.  
  
For example, the warp drive spits out a ton of radiation noise when active, rendering science sensors useless. Computers vibrate when in use, radically lowering the performance of nearby modules. Science sensors require 180hz power, while warp drives require 30hz power.  
  
These incompatibilities mean you can't simply throw more power at your systems to have them all on at the same time. But you can design cleverly. Have an extending strut move the engine away if you need science sensors on at the same time. Have the computers on their own module off to the side of the ship. This gives a reason to create fun, unusual designs.  
  
4) Service requirements.  
  
Requiring human access can make your ships very interesting to design. Why is the engine on a piston rather than permanently floating way out behind the ship? Because that brings it in line with the rigging, so spacewalkers can get to it quickly and easily for maintenance purposes.  
  
This does require you to put in some adaptive human access options. Extending ladders, cables, etc. But those also look great, so they're not a bad call!  
  
5) Stacked modules.  
  
It may seem obvious that every identical module should have identical requirements, but for the sake of making things meaty, the opposite is true.  
  
If modules are stacked on top of each other in a specific way, they should have different performance stats and require subtly different resources. IE, every science sensor arranged in an exact row performs better than the last, but requires power at a higher hz, or requires more cooling.  
  
This will allow players to stack or destack modules to fit their personal vision and constraints. One player might have five stacked science sensors and a big module for providing them with their complex support needs, while another player might have ten unstacked science sensors... requiring more people and more space, but without the complexity.  
  
6) Careful design of multipurpose baseline elements.  
  
Obviously there are baseline elements constraining your operational modules. The most obvious example is electricity, used in nearly every construction game. Other examples might be fluid, food, computation, etc.  
  
Designing these carefully is the key. You want them to inspire specific layouts all on their own.  
  
The easiest way to do that is to make categories of element, then allow a multipurpose system to handle anything within that category. This allows for the same infrastructure to serve multiple roles, while also creating bottlenecks. For example, pipes can handle water, fuel, oil, air, exhaust - anything that flows. Players can create huge numbers of dedicated pipes or fewer pipes that take up less space if they can figure out how to switch the load on the fly...  
  
The basic approach I use is designed to make these baseline elements inspire interesting configurations.  
  
a) Flow types: one type of module moves the generic resource around, one type collects it in a spot (often adaptively sized), one type pushes or pulls it, one type transforms or creates it. For example, pipes, tanks, pumps, intakes. Or network cables, tape archives, sensors, and computers.  
  
This four-fold approach gives me a flexible way to drive different layouts by simply changing which elements take up space in what kinds of ways, or require which secondary resources to run. For example, there's a huge difference between tanks that can expand and tanks that can't. Similarly, there's a huge difference between pipes that take up one voxel space per pipe, as opposed to network cables, where you can bundle any number of them along the same one-voxel channel.  
  
b) Reward both centralization and decentralization. There's beauty both in duplication and in centralization. People should be able to find a cool way to implement "a hundred pipes" approach, but also be able to implement a cool "one big pipe" approach.  
  
In general, one big pipe is what players will tend to rely on if they're just piping lots of one resource. If every module requires water, there's going to be one big water pipe. But as the resources get more varied, the player will tend to go for multiple pipes. Whether this is different temperatures of water, or different fluids, creating converters or mode switching is overhead some players do not relish.  
  
Having resources that vary inside themselves can be very powerful, especially if they can change state and be moved in another way.  
  
For example, if the engine needs fuel... well, maybe each stacked engine performs better, but prefers fuel injected at a hotter temperature. Therefore, the fuel subresource varies on another axis (temperature), making wrangling it more complex without requiring any extra content. Clever players might supherheat the fuel into gas for fast transit, or even freeze it into wax for long-term storage.  
  
Either way, this complexity should arise only as the player embraces it, since this complexity can create a difficulty cliff.  
  
c) Allow suboptimal setups. Allowing the player to fall short while still having a decent result is critical, both for players that aren't great at construction and for players that are trying to be very clever.  
  
An example of this might be if the science sensors require computation to run. If the player doesn't have enough, the science sensors continue to function, but at a reduced rate. Even at zero computation, the science sensors should still function a bit.  
  
You can make this more complex by creating pseudogenerics. For example, the science sensors require quantum computing. Any kind of computer can generate quantum computing, but at less than half speed if they aren't quantum computers. This allows players to use somewhat unsuitable setups in a fun way.  
  
Similarly, you might have pumps specialized in fluids... but they can pump gases a bit. Or visa-versa.  
  
Combining these elements means the players have a ton of flexibility. It also makes for the opportunity for them to add complexity by creating switching systems to use the proper pumps/computers when required, while reusing the same generic flow containers (pipes/wires).  
  
Allowing for extremely high-performance single-use elements is fun as well, but make sure they have other constraints. IE, the fuel-only pump requires tremendous cooling...  
  
... anyway, them's my thoughts on the matter.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:46 AM](https://projectperko.blogspot.com/2019/02/adaptive-modules-in-construction-games.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7296847671488379000 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7296847671488379000&from=pencil "Edit Post")

Labels: [construction](https://projectperko.blogspot.com/search/label/construction) , [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7296847671488379000)

[Newer Post](https://projectperko.blogspot.com/2019/04/modding.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2018/09/character-driven-game-design.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7296847671488379000/comments/default)
