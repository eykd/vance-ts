---
title: "Starship Game Design Discussion"
date: 2013-08-19
url: https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html
labels:
  - game design
  - technical
---

## Monday, August 19, 2013 


### Starship Game Design Discussion

I've been really thinking a lot about the kinds of gameplay you can get out of different kinds of design/construction games. So I've come up with a new idea for a game, which I'm codenaming "Rocketload". I'm going to discuss the design here, and although it's in public, it's mostly to cement it in my head. Feel free to comment if you somehow find it interesting.  
  
The game has two fundamental pieces that work in tandem. There's a payload design/delivery system, and research system. They support each other and both operate in the same timescales in universe time. IE, if you launch a new payload, you could fast forward until it arrives... but all the other facilities and research projects and rockets will progress apace.  
  
The rocket part of the game is component construction followed by staged launching, but not like Kerbal. Rather than constructing a physical rocket, you would construct a logical rocket. We're going to abstract out the physics because otherwise we wouldn't be able to simulate a hundred payloads simultaneously, which we're going to need to be able to do. Your highly trained rocket engineers will turn the logical design into a concrete design and send it into space for you, as you watch.  
  
That's because the focus of our game is not on rocket physics, but on creating a massive network of spaceborn facilities. The focus is on facilities, not on rockets. The rockets just act as a constraint on your ability to put facilities in places.  
  
Designing a rocket is a simple matter: the design section is a bunch of horizontal bars. Let's say we want to design something like Sputnik: it goes "beep beep" as it orbits the earth.  
  
We grab the "beeper" object and put it on one of those bars. Next to it shows up the warning "Requires 1 mAh/day, no power source" or something similar. So we drag our smallest battery (1 Ah) and put it on the bar below the beeper. The simplistic logic of the bars instantly understands that the battery is available to power the beeper. So the beeper's warning would change to "42 day limit". That's how long it'd be until the battery runs out of juice.  
  
We need to put it in orbit. For that we'll need a rocket engine, so we choose a launch-grade engine and put it below the battery. We could add as many launch-grade engines as we want, but one will do. We also have to add some fuel, so we'll put it on the same row to link it to that engine. To help us with this, at any point we can designate a target for our launch by clicking in the solar system map - a low orbit over our home planet.  
  
A burn pattern would appear - a line of varying color to denote burn points, and whether there is enough fuel for them as loaded. When the target is assigned, the engine bar has a note attached with a fuel cost vs how much fuel you've got loaded up. You can launch without enough fuel, if you like - the assumption is that you'd pick it up somewhere out in deep space before you needed it.  
  
So it's a much simpler setup than Kerbal, all about simple logical connectivity.  
  
But there is some complexity hidden in the wings. For example, let's say we want to put it in orbit around the moon instead of ourselves. One option would be to simply click on a lunar orbit instead of a homeworld orbit. However, the engine costs for this would be annoying. So let's change out the launch-grade engine for the smallest engine we have, and much less fuel. The burn pattern blinks error - you can't reach escape velocity with this. But we can package the whole thing up as a stage by simply clicking on the little "-{" button that encompasses those three bars. Then we add a launch-grade engine and some fuel to a fourth bar, and the system understands it is responsible for launching the other payload, including the small rocket and its fuel. So we click on earth orbit for this one.  
  
This stage's burn pattern is from the surface to orbit. The inner stage's burn pattern is now from orbit to orbit - something the small engine can handle.  
  
Of course, you can continue to edit the stages. Add fuel to the inner stage. Remove fuel. Add a new rocket. Layer on as many stages as you want and put the satellite around Pluto - although it'll run out of juice at 42 days, so you're not likely to still be able to hear it.  
  
Now this was a simple beeping satellite that creates only a very modest number of science points, and it'll run out of battery before anything goes wrong. But the primary concern with facilities is maintenance. Stuff breaking. Everything has a degradation rate, with degradation being that rate added over time. It will break when it hits 100 degradation, so something with 1 degradation/day will break in 100 days without maintenance. Our beeper and tiny battery probably have 0.01/day degradation rate...  
  
This degradation rate really changes how you try to build facilities, because you have to take into account their failure rate and pattern. Humans can maintain (reduce degradation rate 90%) and repair (reduce degradation total from 90 to 50 at the cost of spare parts), so having a manned mission can radically extend the longevity, although all that life support is heavy. Also, humans act as a science lab or construction center, so if you want to do offworld research/construction, you'll need folks in orbit.  
  
However, the degradation rate is not 100% static. Rocket engines produce a specific amount of vibration, and that's doubled or so when traveling through an atmosphere. Vibration causes degradation to the rest of the system, but not equally: each layer absorbs some of the vibration, reducing the effect on the next layer. So, in our "beepy satellite around the moon" example, once we got to earth orbit and our launch stage detached, we would see that our small engine for reaching lunar orbit would have quite a lot of degradation, our battery less, and our beepy thing least. Our small engine produces only a small amount of vibration, so it's unlikely to cause our battery to fail.  
  
This should give facility/starship design some fun complexity, especially when you start to consider docking, replacing parts with other parts, strapping on add-ons in deep space, and so on. It can rival Kerbal in terms of complexity, but the complexity is all on the space side rather than the liftoff side. Scattering facilities and probes all over the star system for science, materials-gathering, construction, culture, staging... yeah!  
  
Of course, the other side of the game is the science half. It makes the facilities matter.  
  
While it's always a fun impulse to build a space station for the sake of building a space station, it's important to the longevity of the game to have that space station matter in the game world. And this is where science comes into play.  
  
Let's say that your scanny probe picked up a new kind of resource while orbiting earth: a resource called "paired ions" or somesuch. The scientific explanation doesn't matter, all that matters is that it's something new and you want to bring it home. So you need a collector for it.  
  
So we go home and build a new kind of rocket part - a deep space "paired ion" collector and storage tank.  
  
We do this by using the device creation system, which looks just like the standard payload system, except you're using logical components rather than rocket components. Our device would be a tank (defaulting to standard alloys and intended to contain paired ions) with a deep space intake pointed into it (defaulting to standard electronics, and intended to ingest paired ions).  
  
Just like that, we have the plans for a device. Except that device is going to be really, really slow or awkwardly huge, because it's a passive collector, and passive collectors are rough. So let's put in some electricity. We could add a battery (a tank containing electricity), but it'd make more sense to just specify an electrical intake, allowing us to power the collector from any kind of electrical source we want to design into our rocket. There. Our efficiency skyrocketed.  
  
Of course, this is just an idea for a device. It's not finished. In order to actually create the device, we need to add in some research elements. The basic idea of any R&D project is that you start off by researching (using science inputs), and then you transition to engineering and final design (using material inputs). Science inputs basically build up "momentum", and then you bleed off momentum with the material inputs until you reach 0 and stop. The more science input, the better the engineering of the final result. The more material input, the larger/more materials. In both cases, momentum is based more on time running rather than actual amount of science/material, so juggle things to be more effective.  
  
This is reflected by simply dragging science and/or material inputs onto whatever components you want them to be attached to.  
  
One science input is the facility that detects the paired ions in the first place. Let's attach that to our ion collector part. This is a good match, because our detection facility is detecting the same resource. The two are well-matched, and therefore the research will be more effective than the momentum would imply. This should give us a really high-quality collector!  
  
We also have a satellite orbiting the earth going "beep beep beep". We could add that to another component, such as the electrical input or the tank itself. But there's not any particularly good reason to do that - it'd add momentum for minimal benefit. We also can't add it to the collector: only one science input per device. We go ahead and add it to the electrical input just in case we want to use it, even though it's unlikely. Still, that means we can't use it in another project. One science project at a time.  
  
To decelerate we need to add materials. We'll add a stock alloy material to all three elements, since we can throttle them as we please and don't have to use them if we don't want to.  
  
Our project is then a matter of throttling up on the ion detection research input and leaving it throttled up as long as we want. We can go do other things, leave it "baking".  
  
After a while, when we feel we've done enough research, we can throttle up on the storage tank's materials. This will cut research - you can only do research or development at any given time, not both. This will steadily decelerate us, and in the end we'll have spent all our acceleration on our collector, making a very high-quality collector, and all our deceleration on our tank, which will give us a very large tank.  
  
The final stats also have to include degradation and price as well, and it's all worked out with simple algorithms. This system would have a noticeable degradation, because it has a high-tech part that isn't very big. If we had decelerated on the collector instead of the tank, our collector would be much bigger (and even more effective), and have a lower degradation rate due to the extra space and material used. Of course, our tank would be tiny.  
  
And then the part gets added to our manifest and we can put it on a rocket, fly it out there, do our collecting, and then bring it back to our orbital base or land it back at home using parachutes.  
  
Of course, it can get quite interesting. For example, what if that detecting station crapped out partway into our research cycle? Would we continue to accelerate using just the "beep beep" satellite so we could have a larger final product, or would we settle for a runty final device?  
  
Also, paired ions are a material. When we get back a tankload, we might build an engine that uses paired ions as fuel. We might then use paired ions as a development material to decelerate the research. But this uses up our limited supply. What if we run out before we finish decelerating? Do we let the project idle along while we go fetch more?  
  
All told, I think this combination of systems allows us to take our own approach to developing our space network. It also allows us to occupy the same space as other players (if we want) while still having distinct technologies. The combination of device function, research sources, and materials should make developing new devices fun, and keeping your space facilities operational in the face of degradation should keep things spicy.  
  
The key to all of this, the hidden purpose behind this design, is mods.  
  
See, using this system, mods are very easy to make.  
  
If you want to add a laserbeam comm array mod, then you would add the laser beam pieces into the base device options. Then, not only can you distribute your default laser comm devices, but other people can use them in other kinds of devices. For example, powering their laser with jet fuel, or having a laser input control their light show. This should allow people to combine mods very easily as well, since the various mods will have device options that can be combined into one final device rather than being distinct objects that must always remain separate. The key lies in the simple but robust method of connecting elements to each other.  
  
That's the hope, anyway.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:02 AM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7779223061556826718 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7779223061556826718&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [technical](https://projectperko.blogspot.com/search/label/technical)


#### 12 comments:

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Oh, addendum for myself:  
  
Various LEDs, noise indicators, dials, and so on could be added to the parts to respond to states and control the device in a more complex way.  
  
Care would have to be taken, as it cannot interfere with the high-speed simulation of dozens of facilities. But, on the other hand, it provides a lot of really great potential!

[12:13 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1376939618041#c4358453484244135567 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4358453484244135567 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01820409963072076964)

[Chris](https://www.blogger.com/profile/01820409963072076964) said...

I really like this idea! I think it has a huge amount of potential.  
  
I'd been toying with a similar idea, but with a different focus. I've been working on a 2D physics engine lately (refactoring engine code is fun), and had been contemplating the feasibility of making a 2D Kerbal clone. With a 2D engine, the focus would not be on proper weight/balance/rocketry, but on Delta-V planning and orbital mechanics. It would be a game almost entirely focused on the "manoeuvre tool" in the Kerbal map screen.  
  
I enjoy the rocket design and mass/power/thrust/ISP calculation part of Kerbal, but the game quickly starts memory stalling (very badly) as soon as you have around 2000-3000 parts on screen. In addition, after you have built a 4-module space station and landed rovers on a couple of planets and moons, the meta-game loses momentum. I know they are working on Career mode, but the focus is going to be on rocket-assembly, rather than space-colonisation, as you indicate.  
  
That's why I find your "logical-rocket-design" idea so compelling. The level of simulation I'm targeting fits quite comfortably in the "pick your payload, stages, engine sizes, and fuel loads, and leave the build to the engineers" model. If the game's focus is then on orbital mechanics and docking/combining science payloads, the meta-game becomes clear.  
  
The research model you propose is novel, but probably not the direction I would choose for myself. I'd be more inclined to combine a fairly-deep tech tree with research/resource prerequisites, and add a "publicity factor", which drives the incoming financials. Working up to achieving the public support and funding for a permanent Mars base - with all the complex delta-V requirements to build and sustain it - sounds like a deep, complex and fun meta-game.

[6:46 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377049590296#c5891049659033397175 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5891049659033397175 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I considered that kind of tech tree, but I decided it wasn't as moddable as I wanted.  
  
In the end, ten players playing the same base world (no modded-in resources or device types) will end up navigating the same "tech tree" as they discover the same resources on the same moons and planets. But their individual pieces of technology will hopefully be varied.  
  
Then, of course, someone could add a mod and get a different "tech tree"...

[7:01 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377050508050#c4095793332188450119 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4095793332188450119 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01820409963072076964)

[Chris](https://www.blogger.com/profile/01820409963072076964) said...

I totally get your concern, but I was leaning towards a "recipe and components" model. The tech tree unlocks new higher efficiency engines, new fuel types, and probably a list of about 2 dozen power sources and 3 dozen science experiments.  
  
While you are certainly going to get "recommended recipes" which leads to a limited set of min-maxed designs, the player choice is more in line with "Which 5 experiments should I host on my ISS", given limited power/delta-V options.  
  
I was also leaning towards your dark star concept, in that ISS is a long-duration mission, so a balance of maintenance, life-support and science would need to be explored over a longer term. Combine that with unique science sources (biology on Europa, infrared astronomy at Lagrange points, etc, then I am expecting the breadth should make up for limited modding support.  
  
While I like mods, I actually play Kerbal as vanilla. I always feel that mods allow the math (e.g. efficiency, power, thrust, etc.) to be "gamed", and take away a certain flair to the optimisation challenge the game is supposed to provide.  
  
[7:42 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377052957795#c5892802299977033526 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5892802299977033526 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

If you haven't played some modded Kerbal, you probably have no idea just how much the mods change the game.  
  
Listen, you should really, really do yourself a favor and at least download the remotetech mod, just to get a taste of the sorts of play that opens up when you let players take the helm with mods. It does not introduce anything that affects the actual rocketry side, so it's safe for someone who prizes the balance of the game.  
  
http://kerbalspaceport.com/remotetech-3/

[7:50 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377053408566#c582076990828487666 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/582076990828487666 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01820409963072076964)

[Chris](https://www.blogger.com/profile/01820409963072076964) said...

Fair point, a work colleague has been pushing me to try out B9-Aerospace, procedural fairings, and FAR. I'd been considering it before I try another interplanetary endeavour. Most of the Kerbal mods I've looked at fall into a similar category, like Kethane. My other concern with mods comes from years of playing WoW: keeping mods and patches in sync (for an alpha!) is a major effort, and rarely worth the reward.  
  
Remotetech looks very interesting though! Automation is much more interesting to me than more rocket parts and better physics. I'll check it out.  
  
The main other concern I have with mods is my interest with Kerbal is now more meta-game larger scale missions, and I was finding the performance issues were getting untenable. Maybe Remotetech will help with that though, via remote coordination. I'll see.

[8:14 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377054845167#c3140951388666196962 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3140951388666196962 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, Kerbal has a pretty nasty upper limit on how complicated things can get due to the brute-force physics simulation.  
  
That's kinda one of the big reasons I came up with this idea. Hitting the limit and getting annoyed really motivates you to figure out what you really want from the game.

[8:16 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377054979849#c6620042161631556951 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6620042161631556951 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I didn't mean to sound dismissive, I just think you'll understand why I prize player mods so highly if you see what they're capable of.

[8:39 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377056381580#c8106783754484563428 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8106783754484563428 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01820409963072076964)

[Chris](https://www.blogger.com/profile/01820409963072076964) said...

Yeah, exactly! My design motivation came from the same place. I have a thousand+ cell spreadsheet calculating the efficiency and power of every stock engine and tank, with engine and effective ISP rates, as well as a big per-stage delta-V calculator for my preferred lifter, here: http://kerbalspaceport.com/payload-delivery-system-pds/  
  
I know something like mech-jeb can produce it in real-time, but the fun for me is really in the planning and optimisation at design time, rather than the real-time simulation or rocket-editor itself. It was fun mastering space-docking, but now it just feels like it adds 20 minutes to every mission I do, fighting fuel-weight balance and RCS placement. In the same way, my space station stopped being fun once I realised that continuing to tack on modules wasn't achieving anything grander.  
  
That's why I'm thinking of focusing on the science metagame and 2D orbital mechanics. My hypothetical game would probably resemble a spreadsheet more than a real-time action game, with pre-planned automated actions for stage separation and orbital burns. I want to avoid stepping on Kerbal's toes, for obvious reasons.

[8:40 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377056407311#c136209199944812767 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/136209199944812767 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, it'd certainly be easier to build. Spreadsheet games are very easy to develop in comparison.

[8:41 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377056477759#c8022383205411848159 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8022383205411848159 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01820409963072076964)

[Chris](https://www.blogger.com/profile/01820409963072076964) said...

So, I just reread your article. I think we are probably in a similar place, motivation wise, but now I am getting a better sense of your driver for the mods.  
  
For me, the interest in the science meta-game is also multi-vehicle coordination. I am thinking Mars Orbiter relaying lander measurements, a GPS satellite network spanning the globe, Spy satellites, asteroid probes and, eventually, mining and refuelling stations.  
  
I would approach this by saying there are a few limited channels (laser, infrared, visible light, radio communications, gas/liquid/solid payloads, etc). I would then attempt to combine those channels into interesting objectives driven by a social/political simulation. So, the government will fund manned space stations if you build NRO spy satellites, commercial funds and research credits come from GPS and other public services, and all of it depends on public support by showpieces: a human landing on Mars, the first asteroid mining base, etc.  
  
The player would have a lot of freedom as to the objectives he set for himself, there would probably be a list of around 100 different mission types. Some are fiendishly difficult, like finding life on Europa, which would give the game longevity.  
  
In this design, the mod-support required for mission design would be minimal (just a few numbers - a spy satellite would have visible-camera and targeting requirements, just like Hubble), but very easy to author. Adding new space-parts via mods shouldn't be necessary, because of the Lego-like nature of construction.

[9:17 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377058672897#c7174678972766874821 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7174678972766874821 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It seems like a feasible design.  
  
My focus, on the other hand, is to enable the players to build their own play method. Right from the start, a vanilla player will be able to focus their efforts very differently depending on their preferences.  
  
Some might rush for heavy launchers, others for advanced electronics and scanners. This is made even more powerful when the players can add new objectives and play styles via modding - not simply parts that do the same thing differently, but parts that do things that didn't exist. FTL drives, Sims-like lifestyles for the astronauts, manual rover control, fireworks, aliens...  
  
Basically, I don't have any interest in providing any kind of directed mission, because I want the player's goals to evolve as they do. The only directed missions I'd provide would be tutorials.

[9:27 PM](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html?showComment=1377059243331#c2658365566319336193 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2658365566319336193 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7779223061556826718)

[Newer Post](https://projectperko.blogspot.com/2013/08/complexity-in-open-empire-construction.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/08/dynasty-warriors-8-unpolished.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7779223061556826718/comments/default)
