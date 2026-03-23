---
title: "World Weaving"
date: 2016-08-19
url: https://projectperko.blogspot.com/2016/08/world-weaving.html
labels:
  - game dev
  - open world
  - world building
  - world design
---

## Friday, August 19, 2016 


### World Weaving

In the past few days I've been writing a lot about getting players to engage with procedurally generated or tool-assisted worlds.  
  
The basic idea is that you have to get the player to actually engage with the content. That's the idea of the mining/survival gameplay in most of these games: mining resources and shooting monsters involves engaging with the randomized hills, sprayed plants and rocks, random monsters, etc.  
  
I posted a lot of tips about how to improve that engagement, but then I read [this tweet](https://twitter.com/mtrc/status/766286888328130560) and something became obvious: you can make players engage with your content in a much deeper way by making gameplay that pushes them along a specific physical path. IE, a golf course.  
  
An open-world golf game. Randomly generated golf courses make up the world. You can wander the world as you like, and if you feel like playing a hole, you can. The structure of the world matters because you have to painstakingly cross that terrain to get from the tee to the hole. Every variation will be felt. Every plant that can get in the way, every animal that will chase your ball, every boulder with a tunnel through it.  
  
There are some other things I can think of that work like this: hunting, hang-gliding, racing, even grand-scale base-building. But when I started to prototype these things, I found only the golf version felt right. Why?  
  
Well, only the golf game had underlying structure. The racing, hunting, base-building stuff was a layer that gave context to the world, but the world itself still felt unstructured and arbitrary. On the other hand, the golf courses created a fundamental pattern that could be sussed out, and you could feel that there was a structure you could embrace or ignore.  
  
After experimenting with the paper prototype a bit more, I realized that this was not just an illusion: creating the world out of crisscrossing golf courses was fundamentally creating a world with rigorous overlapping patterns. I created a world where the green of each hole is placed in a simple grid pattern, but the rest of the course goes off whichever way it wants, twisting and turning, until you place a tee wherever you end up. They cross each other wildly!  
  
This can be played up even further by scaling the courses - these are minigolf, these are short holes, these are long holes, these are giant courses that you play in a mech. Even the generation is easy - you can just make every course a simple path edged with local debris (trees, rocks, sand), but have overlapping zones turned into hazards. So two courses crossing over each other have a sand pit or waterway in the middle.  
  
As I expanded on this concept, I quickly found that I could tweak parameters and overlap rules and suddenly I had a planet with rivers and oceans (megamaid-size golf hazards), mountains and valleys (courses at different altitudes), and so on. Moreover, basic rules allowed me to place houses, cities, etc (wherever there are a number of tees near each other).  
  
By using structured challenges in my procedural generation, I could weave those challenges together to generate a complex, meaningful world full of a variety of golf challenges.  
  
...  
  
Well, this isn't about golf.  
  
This same idea can be extended. We can build a world out of crisscrossing race courses - some for high-speed drifting, some for off-roading, etc. We can build a world about hunting as long as we make "hunting paths" where the player stalks a target that is taking a specific path. We can make it about hang-gliding where we define expected launch positions and paths of descending height...  
  
As long as we generate our world out of *paths*, we can weave them like a tapestry. They don't even need to be individually complex at all, because their overlaps create the complexity.  
  
So... we can generate a world out of paths!  
  
The player can choose which paths to engage with, but they'll be affected by (engage) nearby paths as well when they do. Moreover, even if they just wander, they'll see natural flow and charming obstacles!  
  
Neat!  
  
We can...  
  
...  
  
Hey, we don't have to build physical worlds.  
  
What if we wanted to generate NPCs?  
  
We have to drop the idea of "quests". Those are points, we need lines. So each NPC has a variety of "directions" they want to "go".  
  
The obvious answer is stats: what if each NPC has an "arc" of stats they want? She wants to gain 20 armorsmithing points and then gain 15 strength. You need to build her up using the least number of resources (moves, political energy, days, cash, goodwill, whatever). Trying to build strength first would be "hitting into the rough", although if you could find a way to gain both at once that'd be fastest.  
  
But the key to this whole affair is that the paths cross each other. Unless another NPC interacts with her stat growth along the way, there's not much depth to this.  
  
I think there are a lot of ways to do this, but one way is to tie matching stats. She wants to increase armorsmithing from 10 to 30, but there are NPCs with armorsmithing of 19 and 23. So on her way up, she'll run into them and have to work around them - either by defeating them in armorsmithing, winning a seasonal competition, charming them, frightening them, or pushing their skill up to 30+ as well.  
  
An extremely simple algorithm can "carry" these collisions along, so that these same people continue to engage her as they automatically try to raise their skill to higher than hers, which naturally creates events where she's pulled into conflicts with her own recurring set of rivals.  
  
Moreover, it's very easy to simply allocate a new arc at any time, and if we detect no NPC collisions (too skilled/population too low) we can either spawn new NPCs with the required stats or require that character to move to a new location with more skilled NPCs (making it in town/the big city/the capital/the celestial palace/valhalla).  
  
This is a very simple algorithm but, as you can see, it creates a fairly compelling environment with recurring character conflicts, inherent drama, contests of skill, and so on. Adding in more details such as relationships, families, memory, and so on can make it even more compelling, but even at the basic level it's already more compelling than just randomly generating NPCs.  
  
Because we can put the skill gain locations into the world (training halls, for example), this also links our NPCs to the world. While you can increase your armorsmithing stat in the armory, that's not the only place you'll go. In addition to always needing to increase another stat somewhere else, the conflicts that arise with other characters have solutions that involve going to other places. IE, who can make the best silver breastplate for the prince's seventh birthday? Well, meet the prince -> gather silver -> talk to the jeweler -> bribe the jeweler with wine from the coast -> gather gems -> meet prince again -> forge breastplate -> party & final judging.  
  
This kind of setup could involve playing as those characters, but the strength of this approach is that it's "open world". Switching characters is valuable.  
  
You can have a bunch of different games based on this.  
  
For example, you play a helpful newcomer trying to earn their place in a new city. Or you play a ghost. Or you play Dumbledore. Or you play the floating head that recruits Power Rangers. Or you're the manager of a gym. Or you're collecting Pokemon.  
  
...  
  
Right now, we generate 'points'. Our worlds are filled with plants and animals and buildings and people, but they stand alone.  
  
By finding ways to create "paths" the player can follow, we can weave those paths into a world. Whether that's a physical world or a social world or some other world. It creates engagement, creates meaningful patterns and variations, and allows the fundamental variations in the content (such as size, stats, or personality) to matter more.  
  
That's my thinking this week.  
  
What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:36 AM](https://projectperko.blogspot.com/2016/08/world-weaving.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/699197598499311799 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=699197598499311799&from=pencil "Edit Post")

Labels: [game dev](https://projectperko.blogspot.com/search/label/game%20dev) , [open world](https://projectperko.blogspot.com/search/label/open%20world) , [world building](https://projectperko.blogspot.com/search/label/world%20building) , [world design](https://projectperko.blogspot.com/search/label/world%20design)


#### 6 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/14426831179317577197)

[Random\_Phobosis](https://www.blogger.com/profile/14426831179317577197) said...

It sounds like a cool way to procedurally generate conspiracies. NPC could be considered as points, and various plots would be paths connecting them. When the plot is afoot, it moves from one NPC to another, triggering them one by one when their role in the plan is played. The player could and either investiagate in opposite direction, looking for conspiracy instigator, or follow the path, which allows to catch up with the plot movement and prevent it from moving further. Naturally while investgating a plot the player would stumble on other plots going through same characters.  
  
There was something similar in pen&paper RPG called Technoir, which you should probably check out. But there were only links - paths are a more powerful fay for structuring the narrative.

[1:55 AM](https://projectperko.blogspot.com/2016/08/world-weaving.html?showComment=1471683330580#c5807330257534539980 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5807330257534539980 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yeah, it's not really my kinda game, but I can see it.

[5:50 AM](https://projectperko.blogspot.com/2016/08/world-weaving.html?showComment=1471697419306#c5595286704365155893 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5595286704365155893 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09981225682631417415)

[Isaac](https://www.blogger.com/profile/09981225682631417415) said...

The paths versus points thing is a useful distinction, and it's started me thinking of ways to use this for other kinds of generation.  
  
Plus, starting from a path gives the machine a concrete relationship to work off of, rather than having to infer it.

[8:21 AM](https://projectperko.blogspot.com/2016/08/world-weaving.html?showComment=1471706479486#c8669282373678896071 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8669282373678896071 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Exactly!

[9:50 AM](https://projectperko.blogspot.com/2016/08/world-weaving.html?showComment=1471711813466#c7134053677889291305 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7134053677889291305 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/05580909434343473133)

[neoshaman](https://www.blogger.com/profile/05580909434343473133) said...

I have always advocated for people to look at "circulation" which the same concept but with another label lol, instead of having "dictionary" you start building "language" with "grammar" (combinatorial expressive structures that nest together (the collisions)) and "intents" (the paths)

[5:58 PM](https://projectperko.blogspot.com/2016/08/world-weaving.html?showComment=1472605099449#c860175297723369071 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/860175297723369071 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yup, kinda the same idea.

[6:07 PM](https://projectperko.blogspot.com/2016/08/world-weaving.html?showComment=1472605664019#c3414355267571948299 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3414355267571948299 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/699197598499311799)

[Newer Post](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2016/08/exploration-changeups.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/699197598499311799/comments/default)
