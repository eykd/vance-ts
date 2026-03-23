---
title: "Open World Analysis"
date: 2016-09-16
url: https://projectperko.blogspot.com/2016/09/open-world-analysis.html
labels:
  - game design
  - open world
---

## Friday, September 16, 2016 


### Open World Analysis

I've written a few essays mentioning the "hub exploration" play style in passing. It's caught my attention pretty solidly. I've made a few small prototypes, but the "open world" part of the prototypes is pretty lacking. Maybe they're overly structured. Or maybe I'm just too knowledgeable about how they're laid out.  
  
So let's analyze what makes open-world games fun!  
  
First, we have to split the group. Randomly generated worlds and static worlds are very different kinds of games with very different priorities.  
  
I think my hub exploration idea fits better with static worlds like Fallouts, Elder Scrolls, GTAs, Saint's Rows, Assassin's Creeds, Sleeping Dogs, etc. So today we'll focus on those.  
  

## Core Play

The core play of these games is almost always action combat. The exact nature varies widely, but the core experience is typically split into "approach dangerous area->scan for enemies->maneuver to ideal engagement position->engage->deal with enemy response". This five-phase approach seems to be by far the most common setup, supported by the threat of ambush if you handle the early steps sloppily.  
  
Other kinds of play are probably possible, or even polishing that kind of play with other phases. But that five-phase approach works well, and it's obvious why it does: it creates an extremely smooth tension curve.  
  
Each step switches out the game mechanic, and each mechanic is built to ramp up the tension within its specific range. As you approach a dangerous area, the tension starts out at nothing. But you are literally getting closer to danger, and so it naturally ramps up as you start looking for and angling around entrances, defenses, hidey-holes, and so on.  
  
The other steps do the same thing within their ranges, and the edges are blurry enough that the player can shift gears depending on their intent, like a stick shift. At what point do you start scanning for enemies as opposed to approaching a dangerous area? How about moving from scanning to enemies to maneuvering for engagement? You may switch up and down that line half a dozen times depending on the layout you find, your resources, your chosen approach, even just your mood at the moment.  
  
These inflection points, the moments when you choose to shift up or down, are a lot of what makes each game feel distinct. Fallout has no qualms about randomly scattering monsters in your path, so if you want to avoid ambushes, you might grind along in the scan-for-enemies gear even though you'd be more comfortable in the approach-dangerous-places gear. GTA rarely surprises you with enemies. You can casually skate along with almost no tension for long periods of time, giving it that characteristic laid-back feel.  
  
Codifying the play like this can lead to oversimplification, but it can also lead to new approaches. It's fun to think about how I might make my prototype feel good and unique within these constraints.  
  
Other factors which affect tension may also affect this five-phase system, which is probably worth considering. If a player is already sweating from the high stakes, how does that change the performance of the phases? How does it affect the gear shift moments? Can your system handle that - or even be optimized to take advantage of it?  
  

## Nav

Nearly every static open-world game features a slow avatar.  
  
The reason is obvious: hand-made maps are denser and smaller than generated maps. If you let the character move too fast, they'll reach the edge of the map too fast and miss too much. By traveling slow and limiting view range, you can make the player take "small bites". Perfect for hand-made maps.  
  
Pedestrian navigation is typically quite stiff, too. The world is arranged so that you get a lot of different views by moving stiffly from one place to another, but there's rarely any kind of skill challenge to go someplace.  
  
Assassin's Creed has some level of complexity to their movement, including plenty of verticality and jumping. This seems to make the views chaotic enough that Ubisoft just gave up on using wayfinding/signposting entirely. Well, I think there might be power in worlds with complex verticality like that.  
  
Although modal movement (swim, vent-crawl, stealth, etc) seems to add a lot, it's clear that map design is the most important facet of navigation in these games.  
  
But hand-made maps like these typically feature a lot of backtracking, or at least a lot of criss-crossing. It's not bad if the player is exploring, but if they have a strong goal... well, a slow player trying to reach a distant location is going to get pretty grumpy.  
  
Many games use a fast-travel system to let you return to where you have already gone. I'm not a fan of this, though, because it "crushes" the map as you leave: you'll never cross that space again, never see any of the other locations in that space. You've effectively thrown it away.  
  
Other games use vehicles.  
  
This has wide-ranging effects. Vehicles are very high speed and need to see a long ways, which changes how your map can be laid out. Most vehicle-using games effectively separate the vehicle play from the pedestrian play, meaning that there are big stretches of low-density "vehicle" map dotted with patches of high-density "pedestrian" map. Moreover, the vehicle map normally has no enemies on it, since there's no easy way to replicate the five-phase approach when you're speeding along trying to move from point A to point B.  
  
The act of moving from point A to point B is pretty boring, even if there is a challenge to driving fast through twisty roads. Various games spice this up in various ways. In GTA, vehicles are given lovingly wonky physics. This gives you an interest in pulling off stunts and silly self-directed adventures. Most other games don't bother, and instead just put a variety of annoyances on the road to interrupt your travel.  
  
I have a suspicion this is waiting for a revolution, because as it stands the use of vehicles is very disconnected from the pedestrian stuff, and actively works against it in many ways. At the very least, the more island-like map design makes the first phase of the five phase approach either extremely slow (running along a road on foot) or extremely sharp (driving into a gang hideout).  
  
We can constrain the use of vehicles easily enough. For example, only the roads between your settlements are maintained and safe, so that's the only place you can reasonably use vehicles. However, reducing the scope of the vehicles means they are even less integrated into the game than normal. At that point you might as well replace vehicle play with a limited version of fast travel.  
  
We could go the opposite direction, and try to integrate vehicles into the five phase play.  
  
That's what Fallout 4 did with power armor. It takes fuel, but you could use it in tough situations. However, the power armor was not very good at being a vehicle. The vast majority of its fuel was burned just slowly moving from point A to point B... which was the thing vehicles were supposed to help with in the first place.  
  
Another example is Subnautica, which has a variety of vehicles of varied sizes, all of which are about moving more quickly. They do have limited battery life, but batteries are something you can recharge and create, unlike the limited-feeling fuel in Fallout 4. However, Subnautica's main play is not the five-phase play. It's mostly scavenger hunt. By slowing down the vehicles (2-5x as fast as a player, rather than 10-100x) the player can still keep an eye out for signs of good salvage.  
  
It may be that slower vehicles can be integrated into the five-phase play, or at least into certain parts of it.  
  
In the end, this is something that requires a lot of thought. Vehicles generally serve the purpose of shortening the time spent meandering meaninglessly, but the effort to integrate them into the game typically screws up the map, short-circuits the five phase system, and/or creates a whole new category of play that is completely tangential to the main play.  
  

## Phased Implicit Goals

Open world adventures can get me into flow state really fast. The second they stop with their distractingly bad intro and give me controls, I'm on my way to flow.  
  
But maintaining that state is tough, since everyone's mood shifts over time.  
  
So we constantly have other goals in sight. As we are moving towards a goal, we see other potential goals. A dungeon entrance. An abandoned shack. A plume of smoke. A broken wagon.  
  
Unlike the five phase core play, this adapts to the player rather than shaping them. The player will choose to sidetrack to other goals on their way to their main goal, and adopt nearby goals when their goals complete.  
  
This requires a light touch, and that's the challenge. If you tell the player to walk to the next town along the road and there's a broken-down cart in the road, that's a very heavy hand. Players probably won't ignore that, even if they are in a hurry or bored of talky missions. In turn, this can actually break flow faster than having an empty road!  
  
The typical trick here is that the road doesn't really go where you want to go, and so most players will dive off it into the wilderness at some point, creating a less structured adventure. Some games, like Fallout 4, actively shatter the roads so none of them go anywhere useful, forcing every player to wander the wilderness.  
  
Even on the road, most hooks are placed well back from the curb so the player can choose whether to recognize them as hooks. That little side road leading up to the mining village - well, maybe later.  
  
Wilderness encounters can be optimized as well, using intermittently-visible landmarks to lure players in. This is Skyrim's approach - you can see that ruined castle on the hill, you can see that glowing thing in the gully. Some games have a hard time with this due to chaotic lines of sight - for example, it's difficult to properly seed landmarks in Assassin's Creed, because the player could be on the ground, on the roof, on the wall, creeping along camera-down, looking at rooftops camera-up...  
  
HUD icons are invaluable if you can't lay out the map to clue the player in. Nearly all open-world games show HUD icons as you get close to places of interest. I don't much like this practice, so I'd like to avoid it: the only HUD location icons I want are the ones you manually set on your map. Therefore, I may have to give the player an unusually long, clear sight line so they can see my landmarks pretty well. Skyrim-style.  
  

## Supporting Player Narrative

The majority of these games allow the player to be whoever they want. Even in games with specific main characters, the characters are easy to reinterpret through the player's preferences.  
  
Allowing the player to approach the challenges of the game in a preferred way is the foundation of allowing players to create their own narratives. Further, a lot of that is in the pressure the game puts on them to play in another way, pushing them to find solutions, compromise their style, and struggle to keep their personal preference intact.  
  
As an easy example, challenge runs. Playing Skyrim as a martial artist or a pacifist is possible, although in both cases a lot of content has to be avoided. Struggling to move through content that shouldn't be possible is a big part of the fun, to the point where there are mods and exploits that are considered a core part of a pacifist play of Skyrim.  
  
Normally, things are more nuanced. Play Skyrim as a thief. A mage. An archer. A swordsman. A summoner. These kinds of roles were created by the devs, put into the game on purpose, and the content caters to them to some extent. There are still situations where the content becomes very rough - the mage runs out of mana, the archer is stuck near some enemies, the swordsman faces archers at the top of a wall... how you deal with these challenges is what makes your character and their story unique and fun. Does your swordsman sneak up the wall? Charge up the stairs? Switch to a ranged weapon? Use your companion as a distraction?  
  
Designing your encounters to serve these needs is probably a big part of it, but the player narrative is not just how they choose to play moment-to-moment.  
  
Who the player chooses to associate with, who they help, who they hinder, how they shape the world... these are all large factors.  
  
Most such games program these paths in ahead of time. This is the good path, this is the bad path. Here are the people you can help. Here are the people you can associate with.  
  
The problem is that these tend to lock you in for huge lengths of time, asking the same question over and over. Once you've specified that you're "good" rather than "evil", all the choices you make are almost certainly going to go the same way. That's not a player narrative, that's a dev narrative.  
  
Player narratives involve assembling a story out of smaller parts, parts that interact.  
  
For example, in Fallout 4 you can take any one buddy. While there are differences between them, mechanically there's not usually a significant reason to pick one or another. Instead you pick the ones you want to take with you.  
  
Adventuring with the nosy reporter is very different from the nerdy robot or the grizzled gumshoe. Even if they have very little to contribute to your adventures, your adventures are 'with them', and that's a part of your narrative.  
  
More deeply, there are plenty of times where you feel that one character or another 'would feel' a specific way. For example, dragging the nerdy robot into the high-tech robot facility feels more natural than dragging in the punch-happy brawler. The reporter probably has something insightful to say about this corrupt meat-packing ring. Maybe they'll change their minds about something. Maybe they'll feel something.  
  
That's never really programmed into the game. Sure, they often have one or two lines of dialog they spit out in suitable places, but there's no real dynamics to the characters beyond "steadily increasing trust rank". There's also no dynamics to the place - whether you go alone or take any given person, the result will be the same.  
  
Despite that, these pieces are still part of the player's story.  
  
Similarly, chopping up things like "the good path" into tiny chunks allows the players to have more nuanced opinions. Rather than simply always choosing "the good option", the player might end up siding with robots against gangsters, or visa-versa, and that will be reflected in their internal narrative. They didn't choose good or evil, they chose something in-character.  
  
Each of these choices will be remembered to some extent, and the player will slowly build an internal narrative around it. For example, in the Mass Effect series, Tali was my favorite NPC and augmented my favorite character build perfectly, so I tended to favor her whenever I could. But in the third game, I evidently didn't read the devs' mind well enough and a scenario forced me to make a completely idiotic choice between saving her species or the geth in a situation that was about 80% her fault. That was part of my narrative, a major sour note that ruined a three-game friendship.  
  
It wasn't necessarily bad - it is something I still remember. I would have preferred it to have made sense, or arose in a meaningful way, but even as plot-holey as it was, it was still very memorable.  
  
I wouldn't have gotten that invested if Tali was "the good path" or "the evil path", or even "the Tali path". It's the fragmentation that made that slowly growing fondness possible.  
  
That is the other factor, here: the people players spend time with are going to be the biggest influence on the player's story. Right now there is a tendency for each character to be a personal arc and a walking arsenal.  
  
Instead, I think it makes more sense for each party NPC to represent a particular worldview. By choosing who to associate with, the player is fundamentally adopting specific worldviews, and the NPCs will push things in those directions. You can create the world encounters with the assumption that those worldviews matter, and bake them into most of the mission options.  
  
For example, if you take Solus with you, he'll have a lot to say about trying to do pristine work in messy environments, and taking responsibility for your actions even if you never intended to create the problems. In turn, a lot of elements in various quests could be written with these thoughts in mind, even if Solus is not with you.  
  
Rather than "good" or "evil" (or "paragon" or "renegade"), you have the option to push someone to take responsibility they don't feel they should, or shoulder it yourself, or shirk it... this is a much more nuanced set of questions with endless variations and potential for long-term ramifications.  
  
Using these techniques, I think it is possible to "chop up" the world. The player never feels like they're playing out the dev's story. They create their own story by synthesizing play style, friends, and paths throughout the game.  
  
A good example of this is Fallout 2, which kept track of your various escapades and had a ten-minute-long ending sequence explaining the outcome of each. Rather than judge you as "good" or "evil", it simply remembered what you did and reminded you of it.  
  

## Map Re-Use

One thing to keep in mind is that no player will see all the content in your maps in one go. In fact, even if they play hundreds of times, there are some things they'll miss just because their patterns don't take them out that way.  
  
Good or bad, that's how it is, and we need to take that into account.  
  
Replays that stumble onto new content are fascinating, because you realize the world is so much larger than you thought. They give you fresh new grist for your personal narrative, and let you spin your character off in new-feeling directions.  
  
A good example of that is in Skyrim, where it's easy to overlook so many things. For example, just behind the starting ruins is a massive bandit base. The next bandit base along the main path isn't until several hours in, after you've defeated a dragon!  
  
Of course, content you know about can be optimized for your new character, like when we get power armor in the first ten minutes of Fallout 2, or when we take the taxi cart in Skyrim to a city we theoretically don't know anything about just to join the thieves' guild ASAP.  
  
I don't have any really strong ideas on how to make the most of these features, but I do know that we want to push the player to take wobbly paths. Sticking to roads will make replays really dull.  
  

## Multiplayer

A lot of people really love multiplayer, but most of these games don't support it.  
  
Multiplayer requires very specific tweaks to the mechanics to make it feasible, which can be really tough to design and still make work in single player.  
  
For example, the five phase play? As described, the gear shift moments are very per-player, depending on a lot of factors including specific position and mood. If several players are cooperating, the first one that shifts up a gear will leave the others in the lurch, like someone stick-shifting without a clutch.  
  
Because of this, most multiplayer in these games happens on a more straightforward level, using flatter gameplay and relying on the players to get each other hyped to the proper degree.  
  
Good example: GTA. GTA multiplayer largely involves stunt challenges, which are controlled by the players and therefore can be orchestrated pretty solidly. Even if they cooperate to go on missions, the missions tend to be pretty frenzied, skipped the first two phases and starting with "maybe find some cover before shooting".  
  
There are many kinds of multiplayer, though. Asynchronous multiplayer or massively-singleplayer are both possible, and probably easier to program. Hm.  
  
...  
  
Wow, this essay got long. I guess I should stop analyzing.  
  
I've been considering these things and how to make my hub exploration prototypes "feel right", and I think this offers a lot of meat to chew on. What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:18 AM](https://projectperko.blogspot.com/2016/09/open-world-analysis.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8901331648627449184 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8901331648627449184&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [open world](https://projectperko.blogspot.com/search/label/open%20world)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8901331648627449184)

[Newer Post](https://projectperko.blogspot.com/2016/09/adjusting-five-phase-play.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2016/09/local-plateau.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8901331648627449184/comments/default)
