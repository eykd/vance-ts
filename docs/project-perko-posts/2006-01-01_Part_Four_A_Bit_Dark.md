---
title: "Part Four: A Bit Dark"
date: 2006-01-01
url: https://projectperko.blogspot.com/2006/01/part-four-bit-dark.html
labels:
  []
---

## Sunday, January 01, 2006 


### Part Four: A Bit Dark

This is the fourth part of some very rough drafts for teaching pattern adaptation control. In this part, I'll try to teach you how to mix patterns. The third chapter can be found [here](http://projectperko.blogspot.com/2005/12/part-three-pieces-of-puzzle.html).  
  
Okay, if I've been at all useful, you've learned the basic idea behind pattern adaptation control: that you can control which patterns the player encounters, and you can tell what kind of interaction with the pattern they have. Using this basic philosophy, you can create highly adaptive games which, in theory, never get boring or repetitive.  
  
For this part, I'm going to use a simple FPS, like Doom III. These games are all about picking up resources and then blowing away bad guys. They have few puzzles, but quite a few optional play moments (such as finding a hidden weapon). We'll call our FPS "Dark", and it'll be like Doom III, except it'll actually be a game.  
  
We're using a *simplified* version, meaning we're not going to have all the possible pattern elements. We're just going to use enough to get a clear idea of what's going on.  
  
**Ludic patterns** (highly interactive pattern pieces)  
Ranged combat (ability to see distant enemies and shoot them)  
Close combat (ability to maneuver, dodge, and face enemies)  
Resource management (using the right weapons, quicksave-whoring)  
Strategic map management (not getting lost, finding hidden stuff)  
Tactical map management (dealing with darkness and obstacles)  
  
**Narrative patterns** (noninteractive pattern pieces)  
Creepy (things that make your skin crawl)  
Surprise (things that move fast or appear suddenly)  
Terrifying (things which are extremely hard to kill)  
Attrition (things which always injure you)  
Worry (dangers you can't directly affect)  
Tension (dangers that aren't hitting you yet)  
Rest (a momentary rest from physical danger)  
  
Now, as I've said before, the patterns you will list will be very different depending on your mindset, your granularity, and your game. However, Dark will be planned out using a dozen patterns. We'll use the "jewelry box" mode, meaning we'll design a bunch of game elements with these patterns in them.  
  
The clearest measure of what the player likes is what equipment he chooses. Therefore, early equipment should serve one explicit pattern so you can quickly map player preferences. Later equipment can have multiple patterns, and you might want a generic "okay at everything" weapon, but the majority of the weapons should be clearly one or two patterns. Weapons should try to have both narrative and ludic patterns if possible. However, because our game does not list useful "memetic" narrative patterns (such as "technophile" or "explosions"), we can't do that in this example. Such is the restriction of using only a dozen patterns: you really need at least two or three times that many.  
  
Examples:  
  
Shotgun. Close combat weapon, as it deals damage to nearby enemies without requiring much in the way of careful aiming. We're going to use a fragmented plastic shell, so our shotgun fires a blue-green wash of ionized plastic. This really hurts up close, but quickly dwindles. Hopefully, this will distinguish it a bit from the pathetic hordes of shotguns out there.  
  
Gauntlet. This is a double weapon, in terms of patterns. It is a close combat weapon, sure, but it is primarily a resource management weapon, since it comes with unlimited ammunition. It is significantly worse than the shotgun at close combat, so if they have access to both, you can clearly determine if they're prizing close combat or resource management by which one they choose.  
  
Automatic Rifle. This is primarily a long range weapon, although not to such an extent that it cannot be used in close combat. It is not the best long-range weapon, but you can make up for that by giving the player lots of ammo.  
  
Explosive Flares. This is a combo flare gun and grenade launcher. It is a tactical map management weapon: in both modes, it relies on and supports the tactical thinker. It alleviates darkness, tags enemies, or causes a radius explosion which damages enemies, scenery, and you. Think tactically and carry two hundred grenades.  
  
You can create an almost unlimited number of weapons/equipment simply using permutations of ludic patterns. A little plasma pistol can be the long-range, resource-friendly weapon. The ranged-tactical weapon would be remote-control mines. Want a resource-friendly tactical weapon? How about the gravity gun?  
  
Once you start adding narrative patterns to your weapons, you can start really getting some interesting stuff. Even my largely inapplicable patterns can be marginally applied. If we make the gauntlet "creepy", it's made of a monster's still-twitching claws, or it bursts out of your hand in a blast of blood. "Surprise" makes it a flickering, fast-moving object that floats free of your hand. "Terrifying" might simply be by making it a massive, mechanical weapon.  
  
Of course, looked at closer, some of the narrative patterns and ludic patterns bear a close relationship. "Resource management", for example, is directly opposing "attrition". Remember, a ludic pattern is one which the player interacts with: action, response, response to the response, and so forth. A narrative pattern is a one-way street. The player can react to it, maybe even get a slightly different result, but the pattern is functionally noninteractive. "Attrition" would be things like radiation damage or a malfunctioning gun. There could be a ludic "attrition" as well, but this would be things like enemies that always seem to hit you before you can kill them.  
  
You could have a ludic "surprise" just as well, although it would be a subset of close combat or tactical map management. In fact, you might want to have one type of "surprise" for each.  
  
But that's more complex. We're talking *less* complex, since this is just an example. So let's think about narrative patterns.  
  
The easiest way to do narrative-only patterns in this kind of game is to design bits of level. You'll still have ludic creeping in, but it's mostly narrative. Enemies are a good blend of narrative and ludic, since they are both interactive and present an unchanging face.  
  
Examples:  
  
Maternity Ward: To make something creepy, pick something which is considered sacred or taboo, then give it a good twist. Like, for example, babies. What will the player think when he enters the maternity ward of the hospital and finds dozens or hundreds of empty cribs? What if you can hear crying, even though you can't see any babies? What if the cribs and walls are spattered in blood? What if you have nurses "tending" the nonexistent babies - combat or noncombat, both would be creepy. You can go as disturbing as you like, although at some point it generally crosses the boundary from "creepy" to "fucked up".  
  
Industrial Complex: To make something surprising, don't give the player much chance to look ahead. An industrial complex can be a maze of twisty walkways, ever-changing as machinery turns in cycles. Because this is not solely a narrative pattern, there are significant ludic results in the tactical and strategic map management patterns.  
  
Industrial Complex, Continued: To make something attrition-heavy, you could simply add hazards which take a toll. That toll could be health or ammunition or energy or any other resource. For example, you might need to fly a limited-fuel jetpack to leap over broken areas. Or you might stumble across leaking radioactive canisters.  
  
Industrial Complex, Finale: Worry and tension are two directions on the same road: dangers you can't do anything about. The only difference is that one hasn't happened yet, and the other one is happening now. Adding video cams and security systems to the industrial complex would up its level of worry and tension.  
  
As you can see, we've created a lot of elements for the industrial complex, and we've only just touched the options. There are dozens of options for each pattern individually, and *hundreds* if you combine two or more patterns together for a single element. For example, you have to jet-pack across a room, landing on swinging mechanical struts before your jetpack overheats and quits working.  
  
You can implement these "mini-maps" in any way you like. Want to add in a rest area? Make a safe-seeming area. Want to spike the tension? Break the promise of rest by perverting the rest area into something creepy.  
  
If you write it right, the rest area can become quite sacred during gameplay, which would make it creepy to twist it. I've seen it done. In a movie or game, it's a clever and effective technique. In a PAC game, you can tell exactly how sacred the player holds the rest area to be, and can determine whether you need to make it more sacred before the perversion, or whether you can be perverse right now.  
  
(A *really* good PAC engine could determine which patterns the player holds most sacred and pervert them on the fly!)  
  
Enemies are generally half ludic, half narrative. By now, you should get the general idea: pick a narrative pattern and a ludic pattern. Tell me about the enemy you came up with. Try it with two of each for a single enemy.  
  
Like the Specter. The specter is invulnerable to nearly all forms of damage and an irritatingly good shot, although he doesn't do much damage. He is only able to hit you at relatively short range, and he can pass through obstacles (but not walls) without slowing.  
  
So on and so forth.  
  
Plot elements are generally wholly narrative, but since I don't have many narrative patterns, I'm not going to go into that here.  
  
That's the core idea. Everyone get it? Perhaps we can talk about making a clockwork version of this later, which is significantly more complex. Right now, we can talk just a touch about depth and hurricanes.  
  
Measuring a player's *skill* at a pattern is significantly more complex than measuring a player's *interest* in a pattern. This is largely because "skill" is used differently here than elsewhere. Because a player might be "skilled" at, say, ranged combat... but he might not be skilled at *this particular ranged combat*. This is especially true in games which rely on surprise. As the player repeats his play, his skill rises insanely fast as he learns where the pieces of the pattern are. This doesn't much increase his overall skill at ranged combat, but it may make him look like a ranged combat dynamo to the poorly design PAC measurer.  
  
The difference is that skill at the pattern is skill at comprehending the way pieces connect. Skill at the particular event is simply knowing what pieces are where. To tell the difference between these two kinds of skill, it is necessary to either (A) allow no identical replays or (B) track how many identical replays of any given event. The second is considerably more complex, because you'll have to record it permanently and give it "decay" so that you can accurately predict their capabilities when they replay that scene six months later instead of a quickload later. And, of course, the scene is different but similar depending on which difficulty you're in...  
  
It's generally easier just to make the game contain no identical replays, either through no replays at all or through re-randomization after every load. Even then, the player will have some idea of what to expect, so their skills will read unusually high...  
  
Skill is difficult to read in this way, as you might have guessed. So, what you generally do is create a nuanced ladder of similar patterns. For example, under "tactical map management", you might have "jumping", "taking cover", "leaning", "strafing", "retreating", and so forth. The player will generally, while participating in tactical map management, hit some of these patterns harder than others. The more patterns he hits, and the harder he hits them, the more skilled he is. Also, some patterns can be considered more "representative of true skill", at your preference. You can, of course, use any depth. "Jumping" deepens into "dodge-jumping", "maneuver-jumping 2D", and "maneuver-jumping 3D", or somesuch.  
  
This is vastly more effective than trying to limit playthroughs or randomizing everything in the game. Because now, even if the player knows where all the enemies are, it's not likely he'll participate in dodge-jumping unless he's actually fairly skilled. Similarly, if he reloads enough to maneuver up to a nice nook in a pile of boxes, that's maneuver-jumping 3D, but it's an actual skill improvement, because now he's "opened" that pattern and is more likely to utilize it in the future.  
  
"Hurricanes" are situations when a player fixates on a particular pattern. If your game feature adaptive narration, this can be either a narrative or ludic pattern. Many players (most?) are prone to hurricanes, but few games allow for them. This is simply because most games do not allow the player a wide variety of selections in one , very deep pattern.  
  
"Hurricane" does not imply continuous play, merely that the only patterns they are interested in while playing are the ones they are fixated on. If your game only really features one pattern (Freecell, for example) then it is automatically a hurricane-causing game.  
  
"Hurricane" is something to be wary of. If you make your game adaptive, what happens when the player only wants to play long-range combats or keeps forcing the PAC engine to create scantily-clad female NPCs? Does your game bow down to that, or buck it, or something between the two? Hurricanes are a stunningly powerful force - a player in a hurricane mode who is denied his fixation is likely to feel betrayed and very irritated, to the extent that they'll quit playing. Even simply adulterating the fixation with other patterns can make them irritated.  
  
One way to deal with hurricanes is to nip them in the bud. PAC measures how interested you are in a given pattern, it's relatively easy to make sure that pattern never accounts for more than, say, 33% of the events in the game.  
  
A second way to deal with hurricanes is to simply *never give one-pattern elements*. A player who cannot get the pure stuff is likely to still be a little circular, but he isn't likely to whip himself into a hurricane. By always mixing patterns together, you can lower the risk of hurricanes.  
  
A third way to deal with hurricanes is embrace them. Players will love your hurricane-game! For as long as the patterns hold out. Once their skill gets too high, they'll drop your game.  
  
Of course, if you can tell when their skill is getting close to the "too high" level, you can *end the game there*. That would make the game a total success. Alternately, you might come up with a set of patterns which can never functionally be entirely plumbed. This is very hard for two reasons. One: it's hard to think up that kind of "easy to learn, hard to master" stuff. Two: it's really hard to create the nuanced skill ladders to measure player skill. Since the complexity arises naturally, you have to get a bunch of people to play it a lot in order to catalogue the nuances. Alternately, you could have your PAC engine automatically map nuances. Good luck with that.  
  
You'll likely always have flaws in your skill ladder. "Bunny hopping" would not have been in the list for FPS players, but it is still a sign of a fairly high level of skill. Your list won't know that unless you continually update your list either automatically or manually.  
  
Whew. It's all a bit complex...  
  
Maybe next time I'll go into detail on nuance detection. But I think it's clear enough here, so I think I want to talk about putting the pieces into a template and actually getting a playable game. Let me know what you think.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [3:48 PM](https://projectperko.blogspot.com/2006/01/part-four-bit-dark.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113616521457533036 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113616521457533036&from=pencil "Edit Post")


#### 2 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I think "Rag Doll Kung Fu" is a good game to apply some of the naunce tree theory too, since it has a very pure "easy to learn, hard to master" mechanic which is really quite deep, when you get down to it. Mark Healey has gone indie, so he might be interested in doing something like that with RDFK, it would beat coding a whole game from scratch.

[9:36 AM](https://projectperko.blogspot.com/2006/01/part-four-bit-dark.html?showComment=1136223360000#c113622336645146238 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113622336645146238 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Actually, that's a really good example. The game dynamic has now been played enough for Mark Healey to know what kind of nuances there are.  
  
However, I am not yet ready to make any calls. I've got to settle down a bit first.

[1:31 PM](https://projectperko.blogspot.com/2006/01/part-four-bit-dark.html?showComment=1136237460000#c113623746426017952 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113623746426017952 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113616521457533036)

[Newer Post](https://projectperko.blogspot.com/2006/01/personality-doubling.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/12/home-again-home-again-jiggety-jig.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113616521457533036/comments/default)
