---
title: "Designing Inhabitant-Centric Games"
date: 2018-01-11
url: https://projectperko.blogspot.com/2018/01/designing-inhabitant-centric-games.html
labels:
  - base building
  - game design
  - narrative
  - player-generated content
---

## Thursday, January 11, 2018 


### Designing Inhabitant-Centric Games

This is an example game design for a person-centric base-building game. Sort of like Rimworld, except the people are the focus and their stories feel more solid, like in The Sims. See [the previous post](http://projectperko.blogspot.com/2018/01/the-sims-vs-rimworld.html) for details of the why and how.  
  
One thing we need to do is abstract jobs more than Rimworld and other base-building games do. If jobs are simulated in the same space and time as the home, then duties won't be very isolated. This means it's difficult to control the way duties work and the events they cause, and it also makes the duty time 'permeable' - people can swing in and out as they see fit. Those are all bad things.  
  
Therefore, our first goal is to create workspaces separate from our home spaces. The two obvious approaches are out-map and in-map jobs.  
  
Out-map jobs are simply duties that take characters out of the densely simulated home area and off to somewhere else. For example, a farmer leaves to tend the fields, which are not part of the same map. Or a superhero leaves to patrol the city, which is obviously not inside the secret base. These remote areas can still be managed by the player - setting up exactly how many of what fields are where, or what the patrol route is - but they're not simulated in the same space and the workers are not available to the people still at home. Of course, out-map jobs are also good in that you can change the remote conditions without needing to change the local conditions, or visa-versa.  
  
In-map jobs are when the worker is still in the home space, but not being simulated as part of the home experience. This could be something like a woodshop - the worker is technically still on the map, but they aren't wandering around or chatting or worrying about whether they need to go to the bathroom. In a superhero setting, this could be researchers or radio support or training - anything that can be done locally and allows us to lock them into a set pattern for the day. The difficulty with this approach is that it doesn't naturally give a schedule - you can train whenever, you can research whenever, etc. That makes it a little harder to create scheduling frission between different jobs.  
  
Obviously jobs aren't the only thing that matter in our design, but with this in mind, we know that a big part of our design will be outside the map, or at least abstracted within the map.  
  
Within our densely-simulated space, we need to design carefully. The purpose of this space is to help build personal stories both in gameplay and in the player's mind. Most of the base-building games that are popular these days are meter-by-meter designs. This has many advantages, allowing the player to express themselves freely while also locking the player into topological challenges presented by both the initial setup and the player's own previous base-building choices. It's a good way to create opportunities for the player to freely create a base with a lot of unusual elements both incidental and purposeful in an attempt to optimize performance.  
  
But that's a base-centric approach. If we plan to be people-centric, we need our bases to support story and context, both with game mechanics and in the player's mind.  
  
What can do that?  
  
Well, if we want to create context, then we have to make the inhabitants relate to the space with context. That is, the people in the world have to want to use the space in specific ways that produce familiar or memorable stories.  
  
In The Sims, examples of this would be the bathroom. There are rules about exclusivity in the bathroom - it's usually one person at a time, but perhaps family can use it at the same time. You can create different kinds of bathrooms to give the player funny stories about how the bathroom works - for example, sticking a window in it facing the living room. The exclusivity rules are in-game rules that are familiar to the player and create good context, while the funny design alternatives are mostly in the player's head, but still create good context.  
  
Bedrooms are similar: is it one person's room? A big bed for the parents? A crowded row of beds for a bunkroom? There are in-game rules about the effects of these things, but even more important is how the player has expectations for these things and feels a heavy sense of context depending on how it's built and the people living in it.  
  
Public spaces like living rooms are equally high-context. These are gathering places where people get together. Sometimes in passing, sometimes to cooperatively do something (eating, watching TV, etc), sometimes to do different things in the same area at the same time (one person cooking, one person dancing). Public spaces are further leveraged by scheduled events such as parties and family dinners. All of the various ways people can gather have context, and the space itself enables those contexts while simultaneously creating additional context in all the ways it doesn't quite fit. For example, if your party can't easily get food, you get more context: hungry guests moving into the kitchen instead of staying in a completely open space, now standing clumped together.  
  
All that said, The Sims still uses a meter-by-meter construction system. Well, there are some differences.  
  
The Sims construction focuses on walls to a great extent. Most base-building games have walls that are one tile thick: meter thick walls! But The Sims has paper-thin walls, and this allows the player to carve up map quite densely and with ease. This packs far more useable space into the same size map. This may sound unimportant, but it's critical. Not only can you fit more, larger characters onto the player's screen at one time, but the characters are also substantially closer together, allowing them to interact more regularly and freely. For example, someone in the kitchen can easily chat with someone in the living room, whereas if the walls were a meter thick, that would feel more like shouting range.  
  
These seem like small details, but when it comes to creating human context, human details like that matter.  
  
The Sims also has complex standing positions. Rather than "one tile per person", people in The Sims can stand in arbitrary places and in arbitrary groups. Although I don't think The Sims uses proximity as a reflection of intimacy, this is an obvious use: people who stand closely are more intimate than ones that stand meters apart. Similarly, people who sit on a couch together are in a different social situation than people sitting on random chairs.  
  
In short, a dense space that can be used by people standing in a wide variety of configurations. A dense space with variable publicness and utility.  
  
Combined with our off-map jobs, this clearly reflects a focus on someone's home, rather than the more widely-scoped mixed spaces of most base-building games.  
  
Classically base-building games have avoided being solely about someone's home. Statistically, the other aspects of the base are more interesting. But statistically interesting is not what we're interested in. Topologically interesting, yes. But we're simplifying the statistical aspect, and a very easy way to do that is to chop off all the job-related base-building stuff.  
  
From here, deciding a genre is probably critical, since 'home' has a different meaning depending on the genre.  
  
If we set it in the modern era, it'll be very Simslike, because we've basically reverse engineered the core features of that game.  
  
A superhero genre would work well. A team tower or secret base would be our home. Our characters could have night patrols, daytime rescue missions, media reachouts, school, day jobs, investigations - those would be off-site. On-site abstracted jobs could involve training, radio support, research, crafting, etc. This would no doubt be an interesting setup, but there is a weakness in that superhero bases tend to be attacked. This isn't as bad as in most base-building games, because 90% of your assets are locked into your inhabitants, not your facility. Rebuilding or moving is cheap enough. But players would still focus on defenses, and that may be hard to make feel just interesting enough without taking over the game entirely.  
  
A fantasy setting could go rural or adventurous. A rural setting would allow people to go off map for things like farming, crafting, etc. It would also allow for interesting long-term setups, since sending children away for years would not be uncommon. However, I'm not sure that the feel of rural fantasy life would make much of an impact on the player.  
  
An adventuring setting could be fun, though. You could run a guildhouse. It would have a lot of similarities with the superhero idea, but missions would often take several days, and managing funds would probably be more important. The medieval lifestyle simplifies the living space considerably, and characters would be far more likely to have to spend their leisure time together instead of separately watching TV or whatever.  
  
A sci fi setting might be fun. You could create a Mars base or something, with dome bubbles for inhabitable areas. Within each dome, only thin walls would be used for weight and air permeability, allowing for very dense space. The lifestyle of science fiction might not have much impact on the player, but sci fi is more flexible than fantasy, so it's possible to just make their lifestyles more familiar even if it doesn't really make too much sense in the setting.  
  
Well, you could also do something like Firefly, where it's aboard a space ship. The problem with this is that space ships often have very heavy, environmentally-sealed areas. In addition, there's not really any "off map" to go to, meaning that our job management might be hard.  
  
A fantasy sailing ship might be fun, too. Job management might be hard due to the lack of 'off map', but I think it could be managed.  
  
There are a lot of possibilities. I don't really feel the need to push further down any given road right now, though. I'll just let my brain rest a bit.  
  
What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:32 AM](https://projectperko.blogspot.com/2018/01/designing-inhabitant-centric-games.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7958136020866284457 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7958136020866284457&from=pencil "Edit Post")

Labels: [base building](https://projectperko.blogspot.com/search/label/base%20building) , [game design](https://projectperko.blogspot.com/search/label/game%20design) , [narrative](https://projectperko.blogspot.com/search/label/narrative) , [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content)


#### 2 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Um, there is a subgenre of adult games where you run a brothel or a slave dungeon or whatever. Such games are very inhabitant-centered, obviously, and off map activities are often very abstracted, most of the time it is just a button that increases some resource over time. But the home space is usually much more detailed and every upgrade unlocks new dialogues and encounters. After a while your base feels very lived-in similar to hubs in many Bioware games.

[11:58 AM](https://projectperko.blogspot.com/2018/01/designing-inhabitant-centric-games.html?showComment=1515700704052#c6179745111958874460 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6179745111958874460 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, that's certainly a genre that would benefit from having this sort of design. But I suspect they aren't simulating the characters' lives in enough detail to have fun stories emerge.  
  
I mean, in The Sims people chat and play together and cook dinner and throw parties and such. That's generally not the focus in porn games, I think.

[1:05 PM](https://projectperko.blogspot.com/2018/01/designing-inhabitant-centric-games.html?showComment=1515704725008#c2239279570210654486 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2239279570210654486 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7958136020866284457)

[Newer Post](https://projectperko.blogspot.com/2018/01/simple-mechanics-for-compelling-games.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2018/01/the-sims-vs-rimworld.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7958136020866284457/comments/default)
