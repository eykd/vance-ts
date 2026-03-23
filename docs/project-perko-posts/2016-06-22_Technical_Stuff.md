---
title: "Technical Stuff"
date: 2016-06-22
url: https://projectperko.blogspot.com/2016/06/technical-stuff.html
labels:
  - game design
  - technical
---

## Wednesday, June 22, 2016 


### Technical Stuff

[Last essay](http://projectperko.blogspot.com/2016/06/nonlinear-rpgs_20.html) I posted about how we might think of using the power of a linear RPG in a nonlinear way: we can use predefined arcs to strongly seed random content. I got a fair number of people saying "how?", which is not surprising because my explanation was "It's easy... (There, I just cut twenty pages from this essay.)"  
  
Well, here are those twenty pages.  
  
We need to generate random content as the player explores, but the issue is that we're not really trying to create "a random dungeon". Each content chunk that unfolds is huge and bombastic, in linear-RPG fashion. We don't enter a random level of a dungeon: we go to a whole new star system with a bunch of plot events woven into it.  
  
This is both easier and harder. It's easier because this part is so much easier than generating random dungeons. It's harder because we do, eventually, have to generate random dungeons.  
  
The heuristic for generating content is simple: while it can be largely random, it needs to "make sense" to the player.  
  
One method of doing this is keyword filtering. So all the pieces we use (factions, types of places, scripted NPCs, events) have plus and minus keywords.  
  
For example, a toxic jungle planet might have +colonize, +toxin. This means the planet generates those keywords.  
  
By filtering to keep things matching keywords, we can link the planet to subsequent (or prior) pieces of content. When placing something on the planet, we would choose something that hits at least one of those keywords - for example, a new colony. It has the keywords +colonize, +economy, -monsters, -toxin.  
  
The new colony matches the colonize keyword and conflicts with the toxin keyword, both of which are considered good things from a storytelling perspective. So we know that any quest lines involving the colony can "spread" to the wilderness of the planet either in alliance (+colonize) or conflict (!toxin), which allows us to generate minor sidequests such as "Go find toxin samples" or "go help our scouts look for more colonizable locations".  
  
Creating a big list of such sidequests is pretty straightforward, and can use dangling dialog fragments that get hooked into whatever faction is involved. It doesn't much matter whether the colony is full of humans or elves or quarians - anyone can say "go find toxin samples" and have their combat units seeded into a generic map.  
  
The key to this operation is that now there are more keywords in play. The planet alone only had two: colonize and toxin. Now we have economy and monsters as well, and can place elements that match any of those. This can be used for "large" pieces of content (an orbital trade station that has the +economy tag) or "small" content (a sidequest where a batch of monsters is discovered, but it's just a sidequest).  
  
You can see how this creates a web.  
  
Moreover, we've just been talking about places, but each place has to be inhabited by at least one faction, which grows the keywords even further. If it's a quarian colony, that's radically different from a human colony, and that will be reflected in the keywords in play, which in turn will change the sidequests you'll discover.  
  
The quarian keywords are pretty complex, with tags like "+life-support" and "+scrounge". These keywords are unlikely to match very many big places, but they will generate sidequests such as "the life support is offline!" and "scrounge us up some stuff". They may also generate NPCs involved with those keywords, or sub-maps such as garbage depots and life support facilities.  
  
These submaps and quests would feel random and arbitrary if linked into a human colony, since the humans exist to talk about underdog newcomers struggling to integrate. But those missions are core to the quarian experience, so it'd feel pretty good and suitable no matter the exact situation.  
  
Subquests can involve just one place, but in general we'll want to create threads. We should engineer our subquests to do just that by having keyword-driven subquests that involve multiple places, probably all linked by the same keyword, although often inverted (IE, a +monsters and a -monsters location: monsters flood from one place to the other.)  
  
Simple example: the quarians might have a life support problem at their on-world colony, but if there's also a quarian ship in orbit, they both have that keyword. We can use a two-site variant on the mission, perhaps "we need life support components from the ship" or "both have life support failing for the same reason" or even "the ship's life support is failing and we'll need to bring the crew to the colony as it explodes!"  
  
(There's no reason a sidequest can't alter a location, either by destroying it, changing it to a different location, adding/removing keywords, etc. We just need to mark those quests with suitable dialog tidbits to make the player aware that they're about to Change Things and give them an option to back off for a while.)  
  
By bringing multiple sites into a sidequest, we create a reason for players to move. Backtracking sometimes has a bad connotation, but in this case it's absolutely vital to provide a sense of place, a sense that things exist in the same world. Because of this, our sidequests should often have "feelers" written into them - for example, a human on the trading station above the planet might say "the colonists on the planet have been ordering a lot of toxin filters, but we're totally out..."  
  
These can be opportunistic optional elements. IE, the sidequest is (1 +life-support location) with a bunch of keyword feelers for luring the player in, like (+economy: "Totally out of those toxin filters") and (+cutting-edge: "Our filters aren't compatible with their old junk...") None of the feelers is necessary: you can simply trigger the mission by vising the location. But they link the location to the rest of the universe and make it feel real.  
  
That's the simplest secret: linking the random elements together to make them feel real. Whether that's by having missions that span several locations/factions or having a mission that simply gets mentioned in other places.  
  
When generating content, it's also helpful to generate depth-first instead of breadth-first. That is, rather than generating each planet of the solar system, then generating the things on each planet, you should instead start with the most important planet, generate a location on it, generate sublocations for that location, generate a new location, etc. Then generate the next planet when that planet's filled up, etc.  
  
The reason for that is the keyword density. If you generate all the planets without any subelements, each generated planet is only going to "read" the early planet keywords and the star system's base keywords. IE, things like "radiation" and "inhabitable", but not things like "scrounge" or "economy".  
  
By generating the densest areas first, you allow the outlying locations to support them. By the time we get around to generating the moons of the gas giant, we have a big list of keywords. Populating the moon, we'll be able to filter for matches against existing content, giving us moon bases that support the overall arc of the core content. IE, we'll have a moon base related to economy or life-support or whatever, rather than just a random generic moon base.  
  
Visiting that moon base will show us a small selection of sidequests related to the specifics of the base (+economy: "Get two corporations to play nice together", +economy: "pirate attacks are interfering-->moon base destroyed"), but also a bevy of feelers reaching out to content in other places ("The colonists keep ordering toxin filters, we're out of them!", "I've heard there's monsters on the planet, big things." "Man, did you hear about the derelict they found in the asteroid belt?!")  
  
Well, there are a lot more details involved in actually implementing that system, such as determining what kinds of content can exist within what kinds of content, how to cram actual maps into those spaces, how to convert maps from combat mazes into walkable areas and back, etc. But hopefully you have the basic idea: it's all about keywords and piggybacking those keywords to connect objects.  
  
I hope you get that, because we're going to kick it up a few notches.  
  
One thing worth remembering is that we're fundamentally a linear RPG. The area the player can kick around in is targeted to a specific tactical situation, with specific ideal levels and equipment. The player will kick around that area as long as they want, and only let the game move forward when they want to allow it.  
  
A lot of events and missions have outcomes that matter, at least a little. These things should be clearly marked so that the player doesn't accidentally stomp on their own stomping ground. For example, if the "failing life support" mission will result in the ship being lost, be sure that the mission start trigger gives the player an opportunity to back off.  
  
But more than that, outcomes frequently trigger new missions.  
  
This is important, because we want to present a specific (medium-low) sidequest density. It's possible to generate an infinite number of sidequests, especially when we have three factions in a location and the result is 15 different keywords. So... we lock some of the sidequests to keep the number the player is faced with under control.  
  
The key here is that some sidequests have a notable outcome - for example, exploding the ship, or introducing a new keyword. These are good excuses to scuttle the existing sidequests and introduce the next batch. This can be due to the passage of time... or due to direct causality in the case of introducing a new keyword, even if the "new" keyword already exists.  
  
For example, you go to the quarian colony. You fight monsters (+monsters), settle a zoning dispute (+colonize), and scavenge up mining rig parts (+scrounge). But when you decide to tackle the life support sidequest, you get a subtle warning, since you get the option to back out before you start. When you start, it turns out to also be affecting the ship above and, by the end, the ship has exploded and the crew has joined the colony (--> add +colonize). Scrap the leftover sidequests and introduce the next set.  
  
Although the +colonize keyword already existed, now that it has be re-added, it's relatively easy to mark any new +colonize missions as resulting from that disaster, as described by dialog fragments in the disastrous mission. IE "We've been stranded down here, and it's been tough to keep things together..." then transition over to the new mission's dialog "... my child has gone missing, please find her!" Even if the dialog is a bit disjointed, it creates a sense of continuity.  
  
This sense of forward progress is pretty tangible and fun, but even more important, it allows us to create a core arc for the entire content pack.  
  
As I mentioned in the previous essay, your various main characters will represent core arcs. You may also have other core arcs that aren't character-centric, although you might not need them.  
  
These arcs contain batches of content that get slotted into new content opportunistically. These create keywords before the content is even created to begin with, and that means the content will likely be created with those keywords matched in.  
  
For example, Tali's working her way up her "quarian destiny" arc, and this particular event is about examining a new habitable world and seeing if it's suitable for quarians (and finding out it isn't). In addition to a bunch of specific content (maps, conversations, etc) it comes with keywords: +inhabitable, +toxic.  
  
Well, we create the star system. Those keywords mean nothing to a star. We start to create the first planet.  
  
We automatically filter for existing keywords, and we come up with a list of planets that are either inhabitable, toxic, or both. If we create a planet that is inhabitable and toxic, the quarian arc is confirmed and immediately slotted in, with any locations in the arc being instantly established as if they were randomly generated. This will, in turn, drive the rest of the system to create compatible elements and a web of missions that are properly themed.  
  
If there never is a location with a suitable combination of +inhabitable, +toxic, the arc is left on the back burner and it'll try again later, maybe next content chunk.  
  
We can afford to be laid-back about it because we probably have 4 or 5 arcs vying for our attention, and at least one of them is likely to find a suitable setup. We can even program the arcs to have flexible sub-events that can happen if we don't fill the main event, although the autogenerated events are probably fine.  
  
The big advantage of arc events is when they get really involved and dominate the content. For example, near the end of Tali's arc, we have a dedicated location where we fight across a geth carrier group, and then after that another dedicated location where we go to Tali's homeworld and do all that stuff about hacking the geth and then fending them off, etc. While other random content may be wedged into the cracks, the majority of those locations are set in stone, and the progression should feel very consciously-chosen and solid.  
  
One way to duplicate that feel is to have action setpieces - missions that end in epic encounters.  
  
Many locations can have setpieces designed into them, and the setpieces can have a variety of zesty encounters programmed into them. Quests can opportunistically dump you into these setpieces for the finale, and they can be populated by the proper factions as required.  
  
For example, a mining base might have maps for mines, refineries, corporate barracks, and a cargo dock. Each of those maps have setpieces: an underground rail system, an area full of conveyors and pouring molten stone, endless rows of destructable beds and tables, or a cargo ship desperately trying to take off.  
  
Action finales are programmed into those locations, not into the missions that are climaxing. The underground rails normally feature track-switch puzzles, but in an action finale, it's a race through the dark while fighting off other cars. The refineries normally have the machine area blocked off, but in the action finale it's a battle across the conveyors while molten rocks splashes everywhere. The barracks normally feature a maze of flimsy-walled rooms, but in the finale it's about soldiers (or monsters, whatever) smashing down those thin walls and sending cheap furniture flying into heaps. The cargo area normally has a cargo ship sitting in it, but during the finale its turrets are firing and exhaust ports belching as it strains against the docking clamps...  
  
Because these events are flexible, they can either be graded by impressiveness or have their impressiveness scaled to match the requirements. Every time a mission in a content chunk has a finale, the next finale should try to be one step up.  
  
So if our first significant mission ends up in the cargo dock, the ship might be belching smoke and asking for permission to launch, but not actually doing anything substantial. But if it's the tenth significant mission, it'll be firing turrets, blazing the main engines, belching exhaust, and pulling around the docking clamp arms in dangerous sweeping patterns, maybe even on a timer.  
  
Although there's no fundamental connection between the quests that cause the rising action, the fact that the rising action is rising should be enough to carry the content.  
  
The question is: what's the transition to the next content? What's the final boss?  
  
This would probably have to depend on your game, but my instinct is that there is a bank of generic content arcs, represented by a councilmember's interest in the location. Assuming there's no core character arc, a random councilmember arc is brought into play and serves the same purpose. These arcs are suitably generic, but always culminate in a final battle of some kind - for example, "exterminate the pirates in this region" or "find out if there really is an gene-smuggling going on" or even the innocuous-sounding "lay the foundation for a trade agreement".  
  
Anyway, that's the bulk of the technical stuff I skipped over.  
  
Let's see, the only things I can think of that I skipped are the specifics of the player's experience in each major content chunk.  
  
Remember that this is a linear RPG and that grinding is a thing: make sure there are plenty of permanent enemy maps the player can grind on.  
  
Also remember that missions can only take control away from the player when the player volunteers for it... but that they shouldn't feel shy about doing that once the player does! I gave an example about an exploding ship, but the same holds true for missions that split the party or force the player to crash-land for a while or blow up a world they used to visit or whatever.  
  
The two biggest times the player volunteers are A) when they defeat the end boss and B) when they set course for the new star system. Therefore, the first mission of a content chunk and the last moments of a content chunk should take control away most aggressively, to show the coolest things and make the most important changes.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:56 AM](https://projectperko.blogspot.com/2016/06/technical-stuff.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/1884870314466420407 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=1884870314466420407&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [technical](https://projectperko.blogspot.com/search/label/technical)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/1884870314466420407)

[Newer Post](https://projectperko.blogspot.com/2016/07/galactic-politics.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2016/06/nonlinear-rpgs_20.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/1884870314466420407/comments/default)
