---
title: "Adjusting the Five Phase Play"
date: 2016-09-19
url: https://projectperko.blogspot.com/2016/09/adjusting-five-phase-play_19.html
labels:
  - game design
  - open world
---

## Monday, September 19, 2016 


### Adjusting the Five Phase Play

[Last essay](http://projectperko.blogspot.com/2016/09/open-world-analysis.html) I analyzed open-world games a bit, and mentioned the "five phase play" these games rely on:  
  
1) Approach a dangerous area  
2) Scan enemies  
3) Maneuver for engagement  
4) Engage  
5) Deal with response  
  
As I mentioned, these provide a smooth tension curve. Each mechanic is optimized to run in a particular tension range, and to help amp the tension up to the top of that range. Players shift up and down as the situation demands, like a stick shift driver.  
  
I'm happy to create a game that uses those steps, but I need to understand them well enough to put them together. And I have one big issue: I'm fundamentally a stealth player. In most open-world games I default to sniper (or archer) because the stealth doesn't really work. You can sneak, but the fail state for sneaking is catastrophic, leading to save-spamming and eventually deciding it's just not worth it. Moreover, stealth characters can't really secure a location unless they sneak up on every single enemy in a location and murder them in cold blood.  
  
I've been thinking about phases 2 and 3. I think these are the problem, because they have very rigid, nasty fail states.  
  
If you screw up scanning or maneuvering, you are dumped straight to phase 5: dealing with the enemy response. Worse, the maps are very funneled, so your ability to maneuver is very limited. Go out the door, you'll run into another enemy. Run across the parking lot, they'll shoot you from behind.  
  
Every aspect of the encounter is massaged to make these failures less severe. We introduce several "soft fails", like the second it takes an enemy to realize there's movement worth investigating, and then the time to realize the movement is an enemy. We also introduce hilariously forgetful guards, because the player can't move freely enough to adapt to alert guards. The funneled movement also means we have to allow players to leave the mission zone entirely if they completely flub it, without having to worry too much about being hounded by enemies at range.  
  
While these tweaks make the game playable, they create a nasty disjoint between the stealthy phases (1, 2, and 3) and the open phases (4, 5). It's easy to shift up and down within stealthy phases and open phases, but once you've gone from phase 3 to phase 4, you can't go back except by crawling into a corner and waiting a really long time.  
  
I think we can fix this by opening up more movement routes, allowing the player to continue moving while guards are searching. More ways of moving through the area. Here's a few:  
  
**Floors**  
Probably the layout that makes the most sense, we can have our facilities be multiple stories tall. The key here is that floor switching needs to be easier than it normally is - not simply locked to staircases. Postapocalyptic ruins do this well, with lots of holed floors, piled-up rubble, and knocked-down walls. But you can also do this by introducing ledges and making the player athletic enough to climb them. Whether it's an atrium or porches or even just exposed windows, allowing the player to freely move up and down can help the player to find a lot of alternate paths. Keep in mind whether enemies can see the player moving up and down - even if they can, it can buy time, but you need to keep it in mind.  
  
The biggest problem with this kind of verticality is that it's "blind". The player can't keep track of where the enemies are, and it's easy to lose your way, get lost, and forget where the objective is. Generally this is solved by a HUD of some kind marking out known enemies and destinations, but I'm not sure that's a good way to do it. Mirrored layouts might be better, and also facilitate the vertical movement. For example, if each floor is arranged around a central atrium with an asymmetric main hall, it's easy to know where you are relative to other floors, easy to move to other floors, and you can also spy down through that atrium towards the other side of the floor below.  
  
**Soft Barriers**  
While going to other floors is an option, it's got a lot of limitations - poor visibility, limited access, etc. An alternative is to tear the roof off. Low walls, fences, rafters, etc block movement and/or vision, but can still be climbed over or run along. In stealth mode this is good - being above an enemy makes you harder to spot. In open mode this is useful because you can navigate over/along these soft barriers faster than they can, allowing you to navigate to new areas when chased. Wire fences, pits, and hurdles are another option, creating navigation hurdles without blocking line of sight. Trees can be arranged to offer a variety of options like this.  
  
Soft barriers are normally found in postapocalyptic games, since ruins are a great excuse to have a mostly-collapsed roof. However, even in intact worlds there are a lot of elements you can use to do this. Inside, arrange furniture into broken rows of 3-4 meters instead of islands - IE, store shelving should be long shelves, not islands. Office cubicles should be in rows, not islands. Consider making interior walls half-height open-plan walls. Kitchens should have a long counter and at least two exits.  
  
Outside, there are many barriers, the trick is to arrange them into formations that offer cover. Streets should have cars parked bumper-to-bumper on the curb. Parking lots should be tighter and more packed than in real life. Fences around houses, parks, etc should be more common than usual. Bushes should be arranged into hedgerows. Trees can have low branches that require ducking to get under. Using these methods to introduce soft barriers should allow players to move freely away from enemies without being overly funneled.  
  
**Crawling**  
This deserves exploration on its own, even if it has a lot of similarities to soft barriers.  
  
The idea is not that you can hide by crawling: it's that you can safely move through a space by crawling. This is normally useful when you're in stealth mode, as you can hide behind relatively minor barriers and then duck to the next one when an enemy looks away. To accomplish this, you can use typical soft barriers, but you can also use general-purpose debris. For example, a sofa, a chair, a table. These are "islands" that are really no use as soft barriers, but are handy for crawling.  
  
The trick is that the player needs to be able to move freely by doing this. In enclosed spaces, exits are scarce. Interiors should be as open as possible to allow for this kind of stealth: doorways instead of doors. Doors which are open or ajar by default. Windows that are open and unscreened. Or... alternate methods of getting through walls.  
  
The "island" approach is only useful if you're undetected. If a guard is searching for you, they can quickly and easily look behind random debris. Low soft barriers are a good alternative, as is areas where you can "open crawl". The gap under a house, or above a drop ceiling. Beneath cars and trucks and trains. These layouts are useful both when in stealth and when trying to evade guards.  
  
**Hidden Doors**  
All of these approaches work best in large, open areas. When we're inside a house, or office, or any other place with several enclosed rooms, we're still stuck with a funnel. There's only one or two doors, you're going to end up walking straight into another enemy if you try to leave.  
  
Well, we can introduce a lot of "hidden doors".  
  
Probably the most obvious one is windows. You can leave through a window, whether stealthily or loudly, and get to a more open location. Guards will have a hard time following you, too. In addition to typical exterior windows, there are interior windows that look from one room into another, or from a room out into an atrium or factory floor. Windows on the outside of a building are interesting because if you dive through you'll fall who knows how far, but if you slip through you can cling to the outside and climb on the outside of the building. Hope nobody's looking up from below!  
  
Another option is air vents. Air vents you can slip through are quite a conceit: even if the duct was large enough for a person, you'd be hilariously loud. However, for our purposes that conceit is fine. For some reason, nearly every room needs a big air duct, and the player can slip through. Arranging air ducts is an interesting level design challenge, but as long as they are fairly open, they can de-funnel us. Guards need to be smart enough to try and both search the air ducts and arrange guards at the exits. But not so good at it that the player feels trapped - it's more that they need to move to a suboptimal exit.  
  
There are a variety of magical solutions as well - various kinds of wall-phasing. That may not fit with your game idea, though.  
  
And, of course, the option to simply smash down a wall. Not very stealthy, but if you're running away...  
  
**Alternate Movement Modes**  
Swimming, flying, bounding, gliding, phasing, grapple-hooking, sliding, teleporting - there's a lot of alternate movement modes. Some of them are built into the map in obvious ways: swimming requires water. Some are built into the map in subtle ways: gliding requires a high place and a place designed to be fun to glide into.  
  
The problem with these modes is making them accessible while moving through a facility. How many buildings have a river running through them? How many places can you run through by gliding?  
  
Radically enhanced fundamental mobility is possible: superhero-style jumping around. This would radically change our map design and other gameplay mechanics, but it could be fun. Not likely to be stealthy, though.  
  
One worth investigating more carefully is grapple hooks. Being able to create overhead cables to move along might feel kind of Tony Hawky, but it could allow players a lot more freedom on how to move across terrain.  
  
**Non-Avatar**  
So far we've talked about ways to negate the funneling using the player avatar. We can also give the player powers outside of their avatar.  
  
For example, calling in strike teams, assault helicopters, mortar strikes, and so on can be useful both in stealth and open mode.  
  
Alternately, allowing the player to switch to a new avatar will allow the old avatar to lead the guards on a merry chase, or surrender and be captured to similar effect.  
  
**Clearing Zones and Engaging Enemies**  
Once we've destroyed funnels, we have a lot more freedom to design our maps and our enemy responses. But we still have a fundamental problem: most of these open-world games revolve around clearing areas. Other methods of clearing enemies need to be introduced, and the easiest one is to simply make it so that the enemies have a reason for being in a particular area. Resolving that reason will make them leave, whether that involves killing off their leader, stealing the treasure from under their noses, or revealing the traitor they're hunting.  
  
Making this goal-based rather than murder-based will allow us to clear zones without requiring us to murder absolutely everyone. It also opens up opportunities to interact with enemies in other ways - bribing them, recruiting them, putting them to sleep, revealing their secrets to their team-mates, etc. Many of these can be codified rather than written special case, allowing us a lot more freedom in how we do things.  
  
Buuuuuuut  
  
The fourth and fifth phase involve engaging enemies and dealing with their response. If we focus too much on stealth, those will never engage. We'll be ignoring the upper 40% of our tension range.  
  
Well, the zone clearing can require taking people out, either as a primary goal or because they're just way too in the way to avoid. We can allow nonlethal takedowns, there's no problem with that.  
  
Classically a good take-down doesn't alert anyone, that's the point. What we need to do is create a "soft response". This is already a thing, and it's why stealth games feature body-hiding. I think all we need to do is amp that up: rather than just noticing a body, we want to have a variety of responses depending on the type of enemy.  
  
Technologically adept enemies might have heartbeat monitors, GPS tracking, and so on. You can't generally hide the takedown, at least not without compromising their main server, but you have a certain amount of slosh. It takes a few moments to realize something's gone wrong, another little bit for someone to investigate, and so on. During that time, tension will continuously rise as you try to accomplish your main goal and escape.  
  
Less technological enemies will stay more aware of each other. Dogs will smell when you down someone. Bandits will get curious when things get too quiet. The undead will instantly sense the re-death of another undead, etc, etc. The idea is that after a takedown, you're on the clock and you really don't have much time.  
  
This isn't all bad. You can take someone down, then run off to do your actual goal, leaving the guards to get distracted and drawn to that location.  
  
It also has a fun failure state: open combat or running across the map in a desperate escape attempt! Or both!  
  
In any case, the point is simple: we absolutely have to keep our upper tension range intact.  
  
Anyway, those are the things I've been thinking recently when making my prototypes. What are your thoughts?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:39 AM](https://projectperko.blogspot.com/2016/09/adjusting-five-phase-play_19.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8426450535031271600 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8426450535031271600&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [open world](https://projectperko.blogspot.com/search/label/open%20world)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8426450535031271600)

[Newer Post](https://projectperko.blogspot.com/2016/09/building-from-inside.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2016/09/adjusting-five-phase-play.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8426450535031271600/comments/default)
