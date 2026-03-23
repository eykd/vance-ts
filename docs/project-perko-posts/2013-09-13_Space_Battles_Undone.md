---
title: "Space Battles Undone"
date: 2013-09-13
url: https://projectperko.blogspot.com/2013/09/space-battles-undone.html
labels:
  - game design
---

## Friday, September 13, 2013 


### Space Battles Undone

So, I complained a bit about all the gorgeous, fun-looking spaceship games crawling up from the woodwork. They're all - ALL - about shooting at other space ships using your pew-pew lasers. That was my complaint. We're reducing an amazing, interesting future to the oldest, most base kind of interaction we can.  
  
Is it possible to make a spaceship game without combat in it?  
  
Well, sure. You can build a cargo-hauling game, or a space-station-management game, or a...  
  
But I want a game where the design of your space ship matters, where you put it together out of modules and then fly around and use it.  
  
The problem is that the combat system is deep and integrates well with ship design. It's all about complex, layered play full of tradeoffs. Do you go in for the attack? Do you hold back to regenerate shields a bit? Do you flank because there's lots of them? Do you use a limited-ammo missile now, or later? Do you put power to the engines or the shields or the weapons? Tradeofftradeofftradeoff, and they all link together.  
  
Feeding parameters into this tradeoff machine is the design of your ship. How many engines? Shielding units? Type of armor? Scanners? Chaff? Which of the kajillion types of weapons are equipped?  
  
This is a very fluid way to integrate the physical design of your ship into the very nice combat system.  
  
If we remove combat, we have to find another complex but fluid core gameplay system. I mean, we could just reskin combat, but let's not.  
  
There are a lot of options, but in the end they come down to two possibilities. See, the gameplay has to relate you to the rest of the universe. It has to give your design context. So the core play can't just be the operations of the ship: it has to be the ship interacting with the universe.  
  
So the two possibilities are therefore the ship interacting with planets, and the ship interacting with other groups of people.  
  
Now, can you build a layered gameplay loop out of those?  
  
Sure. Let's go ahead and give it a whirl.  
  
Ship interacting with planets is kind of fun because we can actually keep being physics-centric. The ship's chassis is what we're actually centered around, as we change orbits and land and weather the atmosphere and whatever. Because of this, we can keep a lot of the standard ship design concepts: engines, shields, scanners, generators... and also add in some extra complexity because of the changing conditions. For example, shields which protect against radiation from the sun can be limited to a specific angle, and then you can always keep your ship tilted so the sun is at that angle. Wings, vectored thrusters, air brakes, fins - those can all be useful when attempting to pass through an atmosphere.  
  
And you can design quite a complex ship out of that sort of component jenga. Maybe you build a ship that can do everything... or maybe you go with a mothership design, where the mothership can't land, but has several more special-purpose subships that can detach and go do their thing, each specializing in a different environment, a different kind of challenge.  
  
And what would the challenge be for planetary exploration? Scanning, sure. Let's build on that. A reason to land? Scanning different kinds of things requires you to be on the surface. Something besides scanning, you lazy bum? How about terraforming? Collecting samples? How about stamping down ready-made facilities for colonists coming in later? How about just flagging various regions as belonging to various factions? How about laying out roads and spaceports? Flagging points for drone miners to visit?  
  
The idea of not simply scanning the planet, but also defining how it will grow, gives us a lot of depth. But in terms of organic, layered feedback loops that takes ship design into consideration... that's not so easy.  
  
I think in our case the real solution is to put in harsh resource limits, rather than trying for some kind of real-time challenge. For example, you only carry a certain number of base seeds, a certain number of mining flags, a certain number of landing pads. And these have to last you until you go in for resupply, so you probably want them to last several planetoids, perhaps even several star systems. But here's the key: almost more important than what you lay down is how they are connected. You aren't simply putting down two mining bases: you have to plan for how they will support each other or conflict with each other as the bases grow. Do you put in a colony seed with a high-speed rail running to the mining colonies, to help them grow faster? Do you put it closer to one mining colony than the other? Is it so close that the mining will ash up their skies and make them depressed? How long until the mining base expands to the point where it is close enough to pollute the colony? The topology and weather on the planet will also play into what works how well where, as do whether the bases are from the same faction or different factions.  
  
These are simple challenges, not so complex that they merit being the focus of the game. They exist solely to make deploying resources more interesting and agonized than "three mining bases on this planet". Also, when you come back to visit the planet later, what sort of resources they'll have available to you will depend on how well they've grown.  
  
The way it plays out from the player's perspective is a bit more physical, though. They come into the star system and scan for planets and significant mass deposits such as asteroid belts. They can target scanners more precisely, allowing them to scan specific planets even while quite far away, although they'll obviously want to go in close to get good readings with other, more detailed sensors. I don't think there's any reason to force the player to manually scan the planet by moving the mouse around or whatever, but I do think that there should be certain types of scanning which require them to choose specific points on the planet surface because of the high cost of scanning (either in terms of energy, expended scan-probes, or landing the ship).  
  
Then the player can simply choose where to place things. Some things might require the player to land on that spot, while others can be placed from orbit. Some, like the railway you can lay down wherever you like, require you to actually fly along a path, dropping adaptive rail in a long strand. Obviously a bit of an involved process on larger, atmosphere-rich planets where flying along the surface may take considerable time.  
  
When you design your ship, there's a lot of considerations. The obvious ones are what sort of things you can place on the planets, and how good your scanners are. This is in addition to things like engines, landing capabilities, aerospace capabilities, shielding, and so on. There's crew to consider, and power generation: I would consider both to be a resource that gets used up temporarily as you scan, fix, place, and so on.  
  
Is that enough? Can that be an interesting game?  
  
Probably. It's a bit dry.  
  
Let's talk about the other idea: interacting with people.  
  
When you find another ship, or land on an inhabited planet, or dock on a space station, you aren't just opening a trade window and ferrying things across. Instead, it's all about an exchange of culture and socialization, because space is big and empty and you get pretty lonely flying around all the time.  
  
Our inhabited hull sections (crew quarters, malls, gardens, entertainment sectors, libraries, etc) all have a meter on them - a culture meter. As you fly through space, your crew consumes culture pretty rapidly from the sectors they live in. Don't worry: you never run out. The lower the culture in a section, the larger the percentage of culture the crew recycles and puts back into the culture bank, until at the lowest point they recycle 100% of their culture.  
  
Of course, recycling culture is not free: it builds up some memetic mutation, a red bar that occupies the same space as the culture bar. As the red bar fills up the culture meter more and more, the locals get weirder and less reliable, which can cause problems. But it's a slow-moving system, so there's plenty of time to monitor the situation and head out to a space station or planet for some shore leave before things get out of hand.  
  
Interacting with other groups of people allows you to turn your memetic mutation into culture and "restock", but it's a delicate balance between that and losing crew to the planet or other ship as they "go native".  
  
How does this actually work in terms of fun play that integrates with starship design?  
  
Well, I'm thinking of pressure management, like steam engines or party balloons.  
  
All your crew-inhabited "social" hull elements can be connected to each other depending on how you lay out your ship. People flow along those connections, and out the airlocks. By opening airlocks, you let your people out and their people in, "inflating" and raising the pressure. By closing the airlocks, you stop raising the pressure, the visitors steadily drift home, and the people on leave steadily drift back. You can even do more complex management by having the same contiguous set of social hulls connected to more than one airlock, and twiddle each one to perfectly balance your pressure as you see fit.  
  
So I'm thinking you might land and open an airlock. PSsshsht, in comes a steady stream of visitors (and out go a steady stream of your own crew to do the same to the person you're docking with). They initially congregate mostly in the zone nearest the airlock, which quickly "swells" to a dangerous level of pressure, such that you're starting to lose crew as they decide they want to stay with these interesting people. So you close the airlock, and the flow stops. The "bulge" of people steadily smooths out as they filter down the connected chain of social hull elements, and then slowly drift home. You might pop open the airlock again once in a while, to let in another breath of fresh air, then close it so it can filter through your ship well.  
  
The higher the pressure, the more efficiently your memetic mutation is converted into culture - but the more crew you lose as they go native. Working at low pressure might seem nice, but you'll barely eke out any culture "profit" - you'll just lose your mutation. That'll last you a little while, but you'll build up mutation again far too rapidly. Also, the higher the amount of culture generated by your target from your people abroad, the more stuff they'll be willing to give you, so it's good to keep your pressure up specifically so you can keep their pressure up. Of course, if you can overload their social areas and get their people to "go native" to your ship, hey, that's nothing but good.  
  
Each social hull element has particular characteristics which make it useful in specific ways. A library, for example, houses a massive amount of culture but very few crew. The idea is that the drain on the library is very, very low, and it automatically pumps culture out to connected sections. This allows you to optimize your culture use: the library itself generates almost no memetic mutation, even when mostly empty, because its population is so low. So you can use it to keep other areas "topped off" and really reduce your overall mutation rate. On the downside, because of its super-high max size and super-low mutation levels, a library is hard to recharge - typically you'll need to spend money on culture modules to refill it, rather than using the social intermingling system.  
  
You might think you can just rely on a library and buying culture modules to handle all your cultural recharging, since the library can distribute culture. However, this is not recommended: not only will you have to pay through the nose for culture, but mutation is added to the top of the culture in stock, and the weirdity of the crew is related to how close it gets to maxing out the bar - not how much mutation there actually is. So even with only a tiny amount of mutation, if you refill the library without dealing with the mutation, you'll end up with crazed librarians.  
  
On the other side would be areas with very high max pressure tolerance, or areas which gather mutation in from their neighbors, and so on. There's a lot of actual functionality you can pack into the idea of "contiguous zones", and in this case some zones are more about how your ship operates in deep space, and others are about how your ship operates in social encounters. Some will have limited specials or conditions that come up rarely that can help you maximize how well you do in social encounters. And, of course, how well you do in social encounters can radically change how well the involved faction thinks of you.  
  
Things can get a lot more confusing when there's multiple targets - for example, a space station with two other docked ships is actually three distinct social targets. This is complex not just because each offers a different set of targets for you to try and culturally overload, but also because they are often from different factions and courting one more than the others might lead to other factions getting annoyed. You can target one target at a time for your excursions, but you can't control which people are targeting you. So when you open an airlock you might be letting in three factions swamping you at once, or you might find that nobody is interested in coming aboard - it's just your outgoing pressure.  
  
You might also deal more complexly with the size of whatever you're docking with. An advanced space station might have cheap culture modules for you to purchase, but their inhabitants are kind of boring and familiar, so they don't convert mutation into culture very well. On the other hand, landing at a remote settlement - they might not have any culture modules for sale, but they are very good at turning mutation into culture. Encountering a ship in the depths of space is sort of midway - their crew is somewhat odd, and they might be willing to sell you second-hand culture modules which are, in their eyes, all used up... but in your eyes, still mostly full.  
  
This is an unusual mechanic, and I don't know that it's actually a great one, but it is one way to do a rather deep spaceship-construction game without any violence.  
  
If we really wanted to bite off a lot, we could implement both the planet-marking and the socializing mechanics into one game. They would mesh well, especially because you could have social elements that act as "storage" for faction designators. IE, you might have a political element that can store up to 5 "colony" designators, and those are what you would put on a planet to mark that spot for a colony from a specific faction.  
  
Whew.  
  
Well, that was long, but I really wanted to try to do something noncombat with spaceships, and still retain the awesome feeling of building a space ship out of components. This would do, I think, but it's not something I've really polished. I'm sure there are other compelling ideas I haven't thought of.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:15 AM](https://projectperko.blogspot.com/2013/09/space-battles-undone.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4328638377245221056 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4328638377245221056&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09992341815994604747)

[Walt Destler](https://www.blogger.com/profile/09992341815994604747) said...

I'm working on a starship design game that might be up your alley, though combat is still a big gameplay element.  
  
http://forums.tigsource.com/index.php? PHPSESSID=6d806a76704d57da31b07a5ce19d391b&topic=34156.0

[3:33 PM](https://projectperko.blogspot.com/2013/09/space-battles-undone.html?showComment=1379111620635#c5128182105119564930 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5128182105119564930 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Ah, another promising starship game centered around combat...  
  
It looks fun, but I'm just not excited about combat these days.

[3:50 PM](https://projectperko.blogspot.com/2013/09/space-battles-undone.html?showComment=1379112632808#c7916038801677811700 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7916038801677811700 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4328638377245221056)

[Newer Post](https://projectperko.blogspot.com/2013/09/ikebana.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/09/polishing-mad-science.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4328638377245221056/comments/default)
