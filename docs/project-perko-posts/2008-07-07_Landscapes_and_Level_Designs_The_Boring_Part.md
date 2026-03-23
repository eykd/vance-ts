---
title: "Landscapes and Level Designs: The Boring Part"
date: 2008-07-07
url: https://projectperko.blogspot.com/2008/07/landscapes-and-level-designs-boring.html
labels:
  - level design
---

## Monday, July 07, 2008 


### Landscapes and Level Designs: The Boring Part

Well, I went and wrote the [little blurb](http://projectperko.blogspot.com/2008/07/landscapes-and-level-designs.html), but then Matthew Rundle went and requested all the boring stuff. Here are some of the nitpicky little details about line of sight and terrain.  
  
One thing you have to keep in mind from the start is that there is no fundamental difference between designing motion and level design (in considering vision). WEIRD. Lemme sup up.  
  
Most games focus on controlling player vision by putting up walls and doors and other large, opaque barriers. The player is then allowed to move as he sees fit. Well, not entirely: he's channeled into various halls and cannot proceed unless he opens specific doors and so forth. But he's allowed to progress at his own pace.  
  
Some games (especially old "rails shooters") focus on controlling player vision by the simple expedient of controlling every aspect of player movement. Sometimes they mix in some opaque stuff, but it's just to break things up a bit: the same basic level of obstruction could be done by simply having the bad guys peek in from the side of the screen.  
  
The two are mathematically equivalent.  
  
Even in situations where the player is given complete freedom of movement (a minimum of funneling and forced door-opening), they are still equivalent. Because the player line-of-sight calculations only care about how long a player has to meaningfully react to a newly spotted challenge.  
  
It doesn't matter whether you spin their camera to reveal a bunch of guys standing in a field or whether they turn the corner of a twisty maze manually and see a bunch of dudes hiding behind rocks. In both cases, the challenge is the same.  
  
... well, according to the simple formula:  
  
challenge = player\_response\_time / required\_reaction\_time  
  
However, both player\_response\_time and required\_reaction\_time are complicated beasts.  
  
In a game where you control your own progress, how long a player takes to notice an enemy is going to usually be fairly low, because they know what areas they are revealing and therefore can focus on them. A lot of free-moving games like this shake things up by having "forced forward" challenges: you fall through the floor, the door seals behind you, wolves jump through the walls around you... anything to keep you from always being in control.  
  
HOWEVER, in free-moving games, actually reacting to what you've noticed generally takes longer. You can aim and shoot a lot faster with a gun controller than with two thumb pads and a trigger.  
  
Do they come out equivalent, then? Rail-shooters having longer reaction times but shorter response times?  
  
Hell no! There's no equivalence! It all depends on everything!  
  
Many free-movement games have auto-locking, for example. But even more importantly, a "response" isn't necessarily "shoot the commie bastards!" Although that's the only response in a rails shooter, in a free-movement shooter maneuvering is pretty important. If you see a bunch of guys as you turn the corner, you can UN-turn the corner (unless you're "forced forward").  
  
That response is a whole lot faster than trying to aim, to the point where it's barely above your reaction speed itself! In fact, in many cases, I've ducked back around corners without even seeing an enemy - you can say that the response in those cases is actually *faster than my reaction speed*.  
  
Of course, once spotted and run from, the rules change... let's not get into that.  
  
At this point, we're only considering the simplest half of the formula, but there's a few more things that need to be mentioned:  
  
Games that aren't shooters - such as RPGs or roguelikes - tend to be "on your own time" - usually turn-based or, at least, not bothering to have the enemy engage in real time. In these situations, the first half of the formula is broken up funny.  
  
Usually, player\_response\_time = reaction\_time + response\_activation\_time.  
  
However, we've already seen that, in a free-motion game, you can dramatically "squish" player\_reaction\_time and take panicky, effective responses before you would have reacted at all.  
  
"On your own time" games simply take that a step further and squish it to zero, leaving you with only the response activation time... which is usually measured in game units (turns) rather than seconds. This is often further simplified to be ONE. One turn.  
  
Iteration will make a mess of this sort of thing, so we'll ignore it for now.  
  
Required\_reaction\_time is simply how long the player has to react before something goes south. Before he gets shot. Before the timer hits zero and he explodes.  
  
Already we can start to see our nice, simple formula falling apart. Required reaction times are not cement. If you don't achieve them, you usually don't die: you simply lose some resources. This is true in virtually every kind of game.  
  
Similarly, the required\_reaction\_time can't simply be listed by enemy in a free-movement game. What about the enemy you backpedal to delay? There, you can backpedal until you run out of level. When you run out of level isn't determined by the enemy! The enemies' options may also be constrained, such as an archer stuck on an island, or a horde of fat blobs trying to squirm across a narrow bridge.  
  
Well, that's pretty detailed... and I'm not really trying to replace common designer sense with formula. So let's just use common sense: if it matters, it matters, screw the formula.  
  
However, formula are handy for focusing our minds, so lets return to ours.  
  
What we have is actually an iterative situation. We have two *cyclic* elements, not a simple formula.  
  
murglflorp = (Player Response Cycle) ~ (Enemy Response Cycle)  
  
With the first iteration in both player and enemy cycles involving how long it takes you to notice and orient on the target.  
  
The formula is meaningless, because how do you compare cycles? Well... you can always frame it in DPS:  
  
player\_DPS = Player\_Average\_Damage / Player\_Cycle\_Speed  
  
Except DPS is notoriously bad. "Front-weighted" DPS, such as a barbarian hitting someone with an ax and then having a four second recovery, is *much* more effective than a wizard who does the same DPS over the course of four seconds - because the enemy won't be stabbing the barbarian as his HP dwindles.  
  
Also, of course, unless you're in an "on your own time" game, usually you'll have to aim and hit, which changes your DPS... and it's important, because some enemies are easy to hit (large, slow blobs) and some are hard to hit (fast little insects).  
  
player\_DPS\_simple = Player\_Hit\_Chances \* ( (Player\_Average\_Instant\_Damage + Player\_Average\_Slow\_Damage \* constant) / Player\_Cycle\_Speed)  
  
Obviously, the player's average slow damage only counts over a single cycle: if the DPS from, say, poison triggers once per player cycle, it counts as instant damage... BUT it deals free damage next cycle! (We'll call it "bleed".) So...  
  
player\_DPS\_complex = player\_DPS\_simple + cycle\_number \* (Player\_Average\_Bleed\_Damage \* Player\_Bleed\_Likelyhood)  
  
Not all bleed lasts forever, so...  
  
if cycle\_number > max\_bleed\_length, cycle\_number = max\_bleed\_length.  
  
All of this stuff depends heavily enemy resistances and so forth, but we'll skim over that.  
  
The enemy's half is exactly the same equation, just replace "player" with "enemy".  
  
So, we end up with  
  
player\_DPS\_complex vs enemy\_DPS\_complex  
  
but we need to add a bit more...  
  
average\_time\_to\_kill = enemy\_HP / player\_DPS\_complex + player\_reaction\_speed  
  
attrition = enemy\_DPS\_complex \* (average\_time\_to\_kill - enemy\_reaction\_speed)  
  
And that's it. We can stack the enemies up, in which case the player reaction speed is judged as excruciatingly low because he has to shoot each enemy unless he switches to a grenade or something.  
  
Except... what do these formula leave out?  
  
LINE OF SIGHT AND TERRAIN, yeah. Remember those?  
  
We've calculated out all of this stuff, but we didn't bother to take into account the max range of engagement for each side, the level of cover available, and so forth.  
  
To some extent, the reaction speeds rely on this sort of thing: a player surprised from behind will have a worse reaction speed, an enemy who doesn't see you will have a terrible reaction speed...  
  
But it's still very loose, very improper. It's important to consider the level as its own living, breathing thing.  
  
So, let's presume we assign attrition values (and ranges) to each enemy (with each of the player's weapons and error bars for good/bad players). From there, we can plug THOSE values into something level-based.  
  
Levels have the unfortunate tendency to be two or even three dimensional, with a very wishy-washy "time" dimension tacked on. (Remember, we're not talking about a specific play-through, which has concrete time, but a potential play-through or the aggregate of all our player's play-throughs.)  
  
If you picture a map from above (we're not actually doing this, but pretend), you'll see all the various rooms and hallways and hills and trees and so forth. Now, if you were going to try to build a heat map of danger, how would you do it?  
  
Aside from running testers or bots through it and recording it all, there's really no useful way to do so. The real problem is that the progression of the player is so important: enemies do not exist for all time, they only exist from the moment they are created until the moment they are killed, at which point the player frequently uses whatever terrain advantage they held against whoever's next.  
  
This means that any analysis you use has to take into account how the player proceeds through the level!  
  
... Ahhhh... but... Instead of treating the level as a contiguous, three-and-a-half dimensional beastie, let's break it down into a series of challenges. After all, that's how they face it.  
  
Thinking of it this way also negates any need to try to take actual timing into account. If the player dallies, or runs off and explores a side area, your planning is undamaged. They will EVENTUALLY reach this challenge, at which point it will begin.  
  
Of course, the challenge may react differently to characters with various resources, and if they go off and explore a side area, they may very well have different resources... but we'll get to that.  
  
After any given challenge, the important thing to know is how many resources were used - ammo, health, etc. To do this, we can't calculate quite as simply as we would like, because things like cover, numbers, range, and so forth will change our calculations dramatically.  
  
So we'll use what is basically Feynman's approach: we'll add up the probabilities, starting with the simplest path through the challenge and moving to the more complex (less likely) paths.  
  
To do this, you need to make sure you're dealing with single, tiny challenges. While in your mind you might be lumping a series of conflicts through a twisty passage as a single challenge, to add it up you should really split it up and add the results (and the error bars) together. Otherwise it gets too complex too quickly.  
  
As an example, the player emerges into a room. On the far side are three soldiers who are, for mysterious reasons, idly smoking near an explosive barrel.  
  
Adding up the paths we take is pretty simple. Most likely path: player shoots the crates, soldiers die. Expenditure: 3 bullets (machine gun or pistol) or 1 bullet (anything else).  
  
Next less likely path is the player not having quite that much speed, and so a few of the soldiers get shots off at him before the barrel goes up. Expenditure: as above, plus 0-15% health, as calculated from the enemy's advanced DPS formula.  
  
Next likely path is one of the soldiers managing to get away from the barrels and engaging in a typical attrition combat - use the attrition values calculated above. Next likely, two soldiers. This means the first soldier is standard attrition level, but the second soldier is standard attrition level PLUS enemy advanced DPS \* average time to kill.  
  
All three soldiers escaping death by barrel means the same thing, with another standard attrition level plus enemy advanced DPS \* 2 \* average time to kill.  
  
Let's assume that EADPS (enemy advanced DPS) is 5% per second. Let's assume average time to kill is 2 seconds. Therefore, average attrition is 10%. We'll also say that the barrel late explosion time is 1 second, giving each soldier 5% if you don't blow the barrel up immediately.  
  
This means that in the end we have (in average, no error bars, not including ammo expenditures):  
  
No damage (all soldiers die instantly)  
15% damage (1 second delay)  
25% damage (ditto plus one escaped soldier)  
45% damage (ditto plus another escapee that gets 2 extra seconds)  
75% damage (ditto plus another escapee that gets 4 extra seconds)  
  
Adding them up isn't really necessary, but if you want to, make sure you weight it towards the first value - so our final score would be around 10-20%, depending on your weighting scheme. That last score is very unlikely, after all.  
  
These soldiers are serious business, you can see: an enemy that takes two seconds to kill is a significant enemy. But we've used standard attrition values. If there's any significant cover, all the attrition values would be reduced to half or even lower, especially the "extra seconds", during which a soldier may be completely blocked from attack by good maneuvering.  
  
To account for this, we could reduce non-engaged enemies ("extra seconds") to half or even a quarter effectiveness, which would end up reducing those high-attrition, unlikely results considerably.  
  
Now, let's do the same basic thing, but no barrel. Instead, the player has a rocket launcher.  
  
The first values are the same: kill all the soldiers instantly with a rocket launcher, or kill two but not the third. In addition, the low probabilities are the same: kill the soldiers one at a time.  
  
But there are probabilities in the middle where soldiers escape, but are killed more than one at a time, much reducing their number of free seconds. Except, of course, that your rocket isn't going to work out the same because it runs with a different average time to kill (probably much faster than the machine gun). Chances are high that, unless you set up the initial situation to avoid insta-gibbing, having a rocket with no barrel will actually result in less attrition than having a barrel and machine gun.  
  
Of course, rockets should be a significantly rarer resource than machine gun bullets... and if the player has a rocket launcher and a machine gun, which will he use? It's not instant-switch: he'll probably use whichever he has equipped...  
  
This adding-up of probabilities doesn't have to be exact. It just has to be good enough - everything will be tweaked on QA anyway.  
  
The idea is, however, that you can string these things together. More importantly, you can string their error bars together.  
  
So, for example, if you had three of these exploding-barrel groups one after another (each unique enough to be more than snap and shoot), you would say:  
  
30% attrition, error bars at 100% and 0%  
20 bullets, error bars at 140 and 0  
0 rockets, error bars at 15 and 0  
  
(people could do worse than this, but they would be considered outliers...  
  
By tracking the "edges", you can contain the experience to things which are numerically interesting. You see that they could have used up 140 bullets, so you make sure there are only 75 bullets available. They could use 15 rockets, so make sure they only have 8.  
  
This means an expert will get by sticking to bullets and rockets, because he's not going to use very many. The average player will use up a fair number, but have enough left to feel safe. The weak player will be in the dregs.  
  
You can add in negative feedback systems if you like, giving weak players more stuff, but generally I find that a player-chosen difficulty system works fine for that.  
  
If you were doing a boss encounter or a more harrowing experience, you'd want to restrict them to near the labeled average, rather than halfway between the label and the maximum. So if this was meant to be harrowing, you would give out 25 bullets and 2 rockets.  
  
(It's not a very good experience to make harrowing, though: the error bars are too large. For bosses and other harrowing experiences, you want to make the error bars as small as possible to allow you to more accurately predict the player's resources. Therefore, you need to avoid chaotic elements such as exploding barrels (unless they are the only thing that can kill the boss).)  
  
You can add any number of challenges together, so long as you keep the error bars intact. Eventually, you're going to have to face the fact that your error bars are way too big. You need to fix that either by fiat (new level, lose your weapons, etc) or by handing out so many resources that everything is always pegged at max. (Not such a good idea.)  
  
Still, once you have the overall challenge rating, you may like to see what the overall LEVEL's rating is. You can get this by repeating the process for challenges: add together the most likely progressions through the level, then the less likely ones, and so forth. Weight the exact same way you did before, although you may have to take into account certain things - like the player who picks up a rocket launcher vs the player who doesn't. That skews your stats, but it's not hard to handle: just recalculate the challenge using the rocket launcher.  
  
Anyway, there are a lot of other things you should also take into account, such as pacing (ah, my article on pacing is gone with my hosting space...) and aesthetics and variation. These formula are really just interesting doo-dads, not some kind of actual solution.  
  
...  
  
Told you it was boring.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:34 AM](https://projectperko.blogspot.com/2008/07/landscapes-and-level-designs-boring.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/255908955154059619 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=255908955154059619&from=pencil "Edit Post")

Labels: [level design](https://projectperko.blogspot.com/search/label/level%20design)


#### 3 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgV0GDkqo1 Spre3kVrDWY1m0 Vu1WKWZBlRvP2VXzBQKLWcjtIYRS-RnSn9HBOlnCQmgCnAi9 ZwUsu-3y765sGe9n\_d-D5 OzhmDtP3UONl3rUjbWNKe25 SxVKrwaeedsnA/s45-c/Me.gif)](https://www.blogger.com/profile/00811255096467614445)

[Mory](https://www.blogger.com/profile/00811255096467614445) said...

Yeah, I guess you're right.

[2:53 PM](https://projectperko.blogspot.com/2008/07/landscapes-and-level-designs-boring.html?showComment=1215467580000#c4503201265878172473 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4503201265878172473 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQGVSPmlXYBXDVsU9gDHvY7gClGEm13CSiUOrvj1yfrx9\_Jj8C45-fhxyb65KGHKGVk9aCNYBXzy9zVtTkuSz42WIY7uJSV8HS5 WhTOUSUlFImSDkvk9nvSzTxK6ihHA/s45-c/grenss.jpg)](https://www.blogger.com/profile/07006701742406299244)

[envelope](https://www.blogger.com/profile/07006701742406299244) said...

This not quite what I expected, but I'm not complaining. I like the boring stuff you post, often, and much of this is interesting to me.

[12:15 AM](https://projectperko.blogspot.com/2008/07/landscapes-and-level-designs-boring.html?showComment=1215501300000#c3200076715834080468 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3200076715834080468 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01867491782144075781)

[DmL](https://www.blogger.com/profile/01867491782144075781) said...

Definitely interesting, if a bit hard to put into practice (unless you're Valve)

[8:29 PM](https://projectperko.blogspot.com/2008/07/landscapes-and-level-designs-boring.html?showComment=1215660540000#c1319348387392001788 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1319348387392001788 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/255908955154059619)

[Newer Post](https://projectperko.blogspot.com/2008/07/review-dennou-coil.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/07/landscapes-and-level-designs.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/255908955154059619/comments/default)
