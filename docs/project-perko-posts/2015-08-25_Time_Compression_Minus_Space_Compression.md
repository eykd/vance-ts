---
title: "Time Compression Minus Space Compression"
date: 2015-08-25
url: https://projectperko.blogspot.com/2015/08/time-compression-minus-space-compression.html
labels:
  - base building
  - game design
  - npc
  - social simulation
---

## Tuesday, August 25, 2015 


### Time Compression Minus Space Compression

I love base-building games. You may have noticed.  
  
But I have a big problem with them: every base-building game reduces characters to a cog. They exist to do a job. The individuals are played down, the base played up. I want a game where the characters are more important.  
  
A core feature of base-building games is time compression. This allows the base to progress faster than life, which is obviously something you want. There are three ways of time compression.  
  
One way is **lifestyle compression**, AKA space-time compression. This is like The Sims: each character in the base has things they do over the course of the day. They wander to and from various rooms or facilities, use them for a specific amount of time, then move on according to a compressed schedule.  
  
Lifestyle compression normally exaggerates the cost of space. It takes 10 minutes to walk 10 feet in the Sims, so you're strongly rewarded for literally compressing your space. An ideal room in that game might be a large, many-cornered room where all the furniture is right by the door, so nobody ever has to actually walk across any of that space. It's not uncommon to mix rooms together to try and put functional furniture close to each other even though it would be a disaster in real life.  
  
You can blunt this effect by having the characters teleport rather than cross space as the timer ticks, but this is rare and largely considered immersion-breaking. Keep this in mind, because it's related to my solution.  
  
Another method is **lifestyle trimming**, AKA schedule compression. This became common in Flash and mobile games, and can be clearly seen in games like the mobile Fallout game about managing a vault. This compresses time by simply trimming away all the other things people might do. They are always at work, always in the classroom, whatever you have assigned them to do, they are always doing it. They don't need rest, they don't need food breaks, they don't have a personal life. They are cogs.  
  
This method is great for not compressing space, allowing you to build your base more freely. But it has the side effect of destroying any semblance of personality: the people in your base are simply mechanisms to make the rooms function. You can try to assign them personalities in your head, but once you have more than about 7 of them, that tends to fall aside.  
  
The last method is **lifestyle chunking**, AKA turn-based/phased scheduling. This is pretty rare, but the basic idea is that time progresses in chunks. This has the uncompressed space of lifestyle trimming, but leaves people's personal lives intact enough that they can have personalities and be remembered as unique individuals by the player.  
  
This method is pretty rare because it's normally done using a turn-based approach, and that's fallen out of favor in recent years.  
  
I'd like to describe a variant of this method which uses a real-time approach. I've designed and paper-prototyped a game, and it might be a fun illustration of how these three approaches are far from tapped out.  
  
\*\*\*\*  
  
You are in control of freighter space ships, traveling vast distances. Each mission lasts months, years, or even decades - although you can have several ships running missions concurrently if you want.  
  
This is the statistical heart of the game. How long is your trip? How many supplies did you bring? How fast/efficiently can you reuse or regenerate supplies? Food, water, clothes, 3D-printer goo, multipurpose electronics, entertainment supplies, luxury goods - all are worth considering as missions get longer.  
  
This foundation drives the rest of the game, giving the player an easily understood baseline to work from. If you want to save mass, put in a water purifier that recycles most of your water. In the beginning, a 90%-efficient recycler works great. But as your mission length stretches to years or decades, you're willing to pay out the nose for a 95%, 98%, 99% efficient recycler. Maybe even have a crew member that is especially good with them to wring out every last possible percentage.  
  
This is a natural growth. Simple, foundational limitations that urge the player to design a base to more efficiently push back against them. Each pushback is a little more complexity on the base building and management side of things. This is a "slow-cycle" gameplay, and is perfect for putting on some medium- or fast-cycle play on top. IE, managing the crew.  
  
But a little more about the slow-cycle gameplay:  
  
Each ship can be designed at least partially by you. This is a base-building game, after all. The ship chassis is set in stone: all you can do is choose what rooms go where. And, in many ship designs, some of those rooms are also set in stone.  
  
The key trick in this Newtonian (no-light-speed-limit) universe is that the space ships are all designed around the same concept: accelerating for half the journey, then flipping and decelerating for half the journey. This produces an almost constant "gravity" towards the engine of the ship, and to minimize damage from interstellar particles, the ships are all classic 70s cigar shapes.  
  
This is not just flavor. The interior of the ships reflect this approach, and every ship has the same three "decks". At the very top of the ship, where nose is narrowest, are the living quarters. Below that, the ship begins to widen, and you have the communal space/off-duty area. Below that the ship gets wider yet, and you have the on-duty areas like engineering, 3d-printing facilities, laboratories, bridge, etc.  
  
That's just the nose of the ship: below that is a huge space for cargo and engines and whatever. But that space just exists statistically: you only care about those top three floors. On-duty, off-duty, and downtime.  
  
And there's the secret. Rather than chunking our lifestyles by time, we're chunking them by floor.  
  
When you look at the on-duty floor, you see your whole crew busy at work at their stations. No matter how many days pass, they work work work work work.  
  
But if you pop up to the off-duty floor, you see your whole crew busy with their secondary tasks. Cooking, cleaning, eating, playing games, drinking together, going to lessons, exercising, etc. While they may move between these stations sometimes, they never leave this floor. You can watch them have their off-duty life continuously. Of course, this is just a view: they are also still working, there's no work penalty for watching them hang around off-duty.  
  
If you pop up to the downtime floor, you see them sleeping and getting up and going to bed and trying to eat breakfast and stuff. Again, you can just watch this forever. They are also working and off-duty at the same time.  
  
This three-view split allows you to easily handle whichever floor you want whenever you want.  
  
The on-duty floor has a minimum of personality. Your characters are basically cogs, keeping the ship running. This floor has the most rooms in it since it's the widest area: in the starter ship, there would be a circle of 8 wedge-shaped rooms with stairs running up the middle. Later ships might have multiple circles, or half-circles, or other interesting configurations, but it's always circle-based with the same wedge-shaped rooms.  
  
The off-duty floor has a narrower circle that continues up from the on-duty circle, with 6 rooms per full circle. This area is about tending to crew needs, starting with food and cleaning, then up to recreation, training, etc. Where people are assigned here is a strong indicator of their personality and interests, along with creating a coherent shape to push the crew to higher levels. You may need to tweak this to keep the crew happy, as most people aren't going to want to be assigned to KP for ten years straight.  
  
The downtime floor is the narrowest circle, with only four wedge-shaped rooms per circle. These are bedrooms, bathrooms, and lounges - places you would hang out quietly, sleep, or get ready for the day. This isn't just flavor, either, because the way these rooms are allocated changes what people have what pull in what groups.  
  
For example, the starter ship (a single circle, classic cigar shape) has 4 downtime rooms. One is hardwired as a lounge. Another needs to be a bathroom. The other two are bedrooms, but since there's a crew of three, there's a two-person bunkroom and a one-person private room.  
  
The captain gets the private room. By that I mean: whoever is in the private room is probably the captain, because social rank is determined by who has the better or worse accommodations. This is reflected in the interpersonal events which can happen, and in the flavor interactions that happens as you watch.  
  
Later on you'll get ships with multiple cores. For example, a two-pronged ship might have two cores, which means 8 downtime rooms. But the two circle cores are important because each is a different social circle. People in circle A tend to hang out with people in circle A, and B sticks with B.  
  
This is a natural and easy way to "cluster" your inhabitants. Even if you have 30 crew, you can "chunk" them in your mind by who they hang out with and what their social standing is in their group. Each player can choose to chunk them in any method they please - one player might prefer to have "A" be for the greasemonkeys that keep the ship going and "B" for command staff and pencilnecks. Another player might have "A" be for women and "B" for men. Another might choose to cram everyone into "A" and have "B" entirely reserved for lounges and bathrooms. Since you choose your crew, you can choose to have only a few people in palatial suites, or cram dozens of people into coffin bunks.  
  
These clusters propagate to the off-duty area. When not actively assigned to a specific duty, people will choose to hang out with others in their group. You can use this to gently guide the crew - force-assign one person from group A to a classroom, and the rest of the people in group A will automatically try to go to class with them... but they will take breaks when they want to, keeping themselves from overstressing. So assign that bookworm that never gets tired of studying to the classroom, and just let the whole group slowly rank up.  
  
This kind of base management feels pretty easy in the paper prototype, and it seems easy to keep track of even ~30 characters.  
  
The last piece of the puzzle is interpersonal events.  
  
I don't think these events should be simulated, at least not past a very basic level. Instead, my approach is that when an opportunity for an interpersonal event arises (random chance), you can click on it and it displays a variety of possible outcomes. No explanation as to what happened to get them to that result. You choose whatever result you want, and imagine whatever interaction you want to justify it.  
  
The potential results will vary depending on what floor you were on when you clicked the event, the established basic relationship of the two, and how they are socially related. IE, a married couple might have different potential results than two people that have never met.  
  
In the paper prototype, I simulated this by drawing random outcomes, but having "upgrade" notes - if a specific relationship existed, the outcome was morphed. IE "start dating" morphs into "get married" if they are dating, morphs into "have kid" if they are married, etc. With this in mind, I can choose from several potential outcomes that reflect their basic relationship, and the game doesn't have to simulate anything or know personalities or anything.  
  
This means A) the player gets to imagine events and personalities, B) we don't have to simulate them and C) we rarely, if ever, conflict with the player's vision.  
  
Anyway, that's my design. If you got this far, let me know what you think. If I get some free time, maybe I'll try programming it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:56 AM](https://projectperko.blogspot.com/2015/08/time-compression-minus-space-compression.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7625427059943229763 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7625427059943229763&from=pencil "Edit Post")

Labels: [base building](https://projectperko.blogspot.com/search/label/base%20building) , [game design](https://projectperko.blogspot.com/search/label/game%20design) , [npc](https://projectperko.blogspot.com/search/label/npc) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09981225682631417415)

[Isaac](https://www.blogger.com/profile/09981225682631417415) said...

I really like the way that using space to break up the discrete uses of time works here. Not quite intuitive, so probably going to take a bit of effort to explain it to new players, but I think once you get it it's a mapping that makes sense.  
  
I've noticed that games, in general, tend towards using position in space as their core metaphor for the simulation. In doing so, they usually keep it euclidian and import our expectations of what space means in the real world. (Culminating in the immersive-sim/Deus Ex path.) Since spatial relationships are an easy way for a visual species to absorb information, this makes sense, and leads to things like hardware support for sprites (i.e. an image that acts as an iconic representation of a thing, with a position in space).  
  
But space in games is ultimately a metaphor, the shadows on the walls of the cave, there's no particular need to be limited to that. Space, in your design here, is used to chunk time into separate spatial places, like comic panels. It's an elegant solution to the problem of the system giving the same amount of time/space to things that are supposed to be of vastly different importance.

[7:32 AM](https://projectperko.blogspot.com/2015/08/time-compression-minus-space-compression.html?showComment=1440599547842#c8926029106615354061 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8926029106615354061 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yup!

[7:34 AM](https://projectperko.blogspot.com/2015/08/time-compression-minus-space-compression.html?showComment=1440599644923#c5351343678684890326 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5351343678684890326 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7625427059943229763)

[Newer Post](https://projectperko.blogspot.com/2015/09/what-makes-games-different.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/08/good-bad-game-design-pt-2.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7625427059943229763/comments/default)
