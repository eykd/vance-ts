---
title: "Detailed Gameplay Discussion (Anti-Sims)"
date: 2013-08-14
url: https://projectperko.blogspot.com/2013/08/detailed-gameplay-discussion-anti-sims.html
labels:
  - game design
---

## Wednesday, August 14, 2013 


### Detailed Gameplay Discussion (Anti-Sims)

A few days back I posted about how I wanted to make a base-building game where time weighed heavily on your characters. Sort of the opposite of the Sims in terms of constraints - the Sims gives characters not enough time, and I wanted a game where they have far, far too much.  
  
The responses I got were good in that people were paying attention and thinking about what I was saying, which is always a big win for anyone who writes random crap on the internet. But their recommendations were for mechanics I'd already tried, so I thought I'd explain why I'm not a fan of those mechanics.  
  
First let's cover "spreadsheet gameplay".  
  
Spreadsheet gameplay is when the primary mechanic of the game is you changing a number or a percentage to try and tweak the final outcome. This isn't necessarily a bad kind of gameplay, but it is suited mostly to slow turn-based iterative games. A spreadsheet's fundamental strength is the ability to display a large number of entries and connect them in a transparent way, which means that "more advanced" spreadsheet gameplay usually means "more stuff to tweak".  
  
There are plenty of spreadsheet games out there - most of them are kingdom management games or dating games, for some reason. But let's talk about one for the anti-Sims game concept. You could have each character's daily time as a tweakable system. 8 hours sleeping, 5 hours working on maintenance, 3 hours working on scanning, 3 hours off time, and so on. It's a simple enough concept, and it could be linked into a starship's or base's capacities pretty easily. The gameplay concept is relatively easy to expand, too, as if you have a hundred crew you simply have a hundred of those simple entries, and can maybe manage them in clusters for ease of use. You could also make it seem less spreadsheety by making the management interface more about sliders than numbers, although that's just visual glitter.  
  
However, a spreadsheet has three weaknesses that are aligned squarely on the path I want to take.  
  
The first weakness is that spreadsheets are given to careful minmaxing. The whole point of a spreadsheet is that it gives you all the knobs and you can aim for the best outcome you can get. The way you express yourself is in which outcomes you pursue, not in how you achieve them. It is easy to become enamored with the depth of a spreadsheet, but I want this to feel like The Sims in many ways. Imagine creating a crew based on yourself and your friends, or copied from your favorite television show. The joy lies in their interactions and vagaries. I want the focus to be on the humans, not the values. I want to focus on this human feeling, and although you could inject it into a spreadsheet game (like a dating sim might), I don't really feel it's the best mechanic for the job.  
  
The second weakness is that spreadsheets are not actually very good at handling drifting values. While simple spreadsheet games can handle drifting values, rather than being expressive gameplay, they are more just about forcing you to check in and tweak things. Worse, as the spreadsheet game gets more complex, the drifting values become harder and harder to react to. In fact, this seems to be the primary limit on complexity for spreadsheet games: at a certain point, your own personal stockpiles of stuff become the most important resources available to you, and managing them takes more and more effort the more complex and ongoing the world becomes.  
  
Instead, I'd like the drift to feel much more organic. Rather than adding complexity, I want the drift to feel like strafing in a first person shooter, or bouncing when you try to land in a plane simulator. I want the drift to be something the player grips and feels under her fingers as she plays, rather than being an element of complexity she has to carefully budget for. The drift - personalities steadily changing, supplies slowly running out... it needs to be like a heartbeat. And I can't make a spreadsheet do that very well.  
  
The third weakness is topological flattening. Many spreadsheet games do have a base-building mechanic - some even are full-fledged city-building games. But the topology of the city is usually strongly 'flattened'. That is, any given building is reduced to inputs and outputs, regardless of its position on the map. This makes it easy for the city to pipe into the spreadsheet, and it makes it easy for a player to build the city to accommodate her spreadsheet needs. Games where the base-building is left topologically significant - that is, where the exact placement of buildings matters a lot - are more about base-building than the spreadsheet part, and the spreadsheet part is just a supportive mechanic. Like in Sim City.  
  
I don't like topological flattening because it fundamentally turns something that was 2 or 3 dimensions (a map) into something that is 1 dimension (a list). This loss of complexity goes against my grain.  
  
Those are the reasons I didn't ever make a spreadsheet prototype for this concept that I ended up liking.  
  
But there is the opposite. If a spreadsheet mechanic tends to flatten topology, there's the opposite mechanic: centralized map gameplay. IE, "like the Sims".  
  
This is also a fine mechanic, but it also has some weaknesses squarely on the paths I want to take.  
  
In this mechanic, you build a base, and the focus of the game is on your characters navigating the base you created - moving from room to room, using the rooms.  
  
My problem with this mechanic is that it makes moving from room to room a character limitation, and therefore a limited resource. Basically, it makes it expensive for a character to move through your base, and therefore optimizing your base is all about reducing the amount of walking your characters do. The only way around this is to have zoning, and then have characters assigned to various zones while ignoring their size... but then you've flattened your terrain again, and that's what we're trying to avoid.  
  
Don't misunderstand. A huuuge part of base building is connecting things to things. But rather than make it about the characters, I prefer to make it about stuff. I'll happily put in power and data and water lines, manage airflow, and whatever else I can think of. Making bases where stuff is shuttled around from room to room is great, because it makes the topology really matter. It also can allow you to do some very cool Turing-machine stuff, so I'm all for it.  
  
But I don't want it to be the people. I don't want a situation where a person's activities are limited by time constraints, because the whole conceit of the game is that a person has way, way too much time on their hands. How long it takes to walk from A to B should never even be a concern.  
  
But... this means flattening the base out, doesn't it? And that sort of defeats the purpose!  
  
Well, there's a few ways to use the base topology without making room-to-room movement the primary method.  
  
One is using nodes with radius. So you might assign someone a room to sleep in, and they would automatically "appropriate" all rooms within 2 doorways as space they commonly hang out. Then you could assign them a workstation, and the same appropriation would happen. And a place to eat, and a place to hang out - whatever you like. Assign them however many nodes you like. Maybe they're not even named - they're just "nodes".  
  
This gets around the restrictions on travel by making travel free (at least to places designated by you), but still keeping topology important, since connected rooms are adopted along with the primary rooms you assign.  
  
I made a few prototypes like that, but the problem always ended up being scalability. It's easy to do this with one, two, even five characters. But as the number of characters grows, it becomes more and more difficult to keep track of who is assigned where and feeling what kind of stresses. There's not any fundamental connection between a person and a place - it's arbitrarily assigned. So it's really hard to grasp quickly. It ends up bogging down, which in turn makes it more and more difficult to handle changing values.  
  
This is primarily why I came up with the "beams" method of linking characters to the base. If you missed it: each character is "placed" at a spot, but only in a logical sense, not in a physical sense. They then automatically inhabit/maintain/work in every room with the same X coordinate or the same Y coordinate as them, creating a "+" of interaction. They also interact with people who inhabit the same rooms as them in that room. Also, you can rotate a character to use an "X" instead of a "+", which changes the constraints interestingly.  
  
By having a character occupy a specific place, and then having all the character's interactions with the base oriented around that location, it is easy to grasp exactly who is being affected by what. By making it about a simple axis system rather than about room connectivity, I negate the "price" of traveling between rooms while still maintaining rooms as an important topological resource. Moreover, by continuing to insist on "stuff shuttling", I put opposing topological constraints into play and make base building a matter of weighing multiple kinds of topological concerns.  
  
There are concerns about how this would scale, and I think those concerns are valid... but scaling is the critical problem with all the methods, and they all do it poorly. To some extent, I actually like that. These are people, and there should be a little weight to their behavior.  
  
Another concern is how unbelievably abstract and unrealistic it is. I think that's a good concern, too, but I can't think of a way to concretely represent the complexity of someone's day-to-day habits on a large, complicated deep-space starship. The concern for me was not realism, but clarity and depth. This system works well because you can clearly see everything you need all on one screen, even if you have a hundred crew - and it's easy to tweak, just drag someone around on that one screen. To get that, I'm happy to abstract it out.  
  
As to the directions I needed to go that aligned with the faults in the other methods, let's quickly mention them.  
  
Having that personal feeling rather than a minmax feeling: check. While there is some depth to arranging rooms and crew efficiently, there is a lot of character color waiting in the wings since interpersonal interactions happen on the rooms they are marked as happening on. This means a predictable, modifiable framework for interpersonal color and forming relationships.  
  
Handling drifting values is handled well because the single-screen display allows us to display all the drifting values at the same time as we display what everyone is doing. This makes it easy to tweak either personal behavior by dragging a character, or make it easy to mandate a usage change by clicking on a room and tweaking its output/accessibility. As time flows by, you can watch the steadily decreasing stocks in your supply room in real time, and watch people squabble or get along by watching the highlighting of individuals.  
  
And, of course, there's definitely no topological flattening.  
  
Okay, that's why I designed it the way I did. I don't really expect anyone to care, I just wanted to write up the explanation.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:32 AM](https://projectperko.blogspot.com/2013/08/detailed-gameplay-discussion-anti-sims.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/908252556793622246 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=908252556793622246&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/908252556793622246)

[Newer Post](https://projectperko.blogspot.com/2013/08/i-dont-like-smt4-or-dlc.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/08/the-nature-of-fans.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/908252556793622246/comments/default)
