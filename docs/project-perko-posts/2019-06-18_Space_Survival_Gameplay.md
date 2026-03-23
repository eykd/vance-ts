---
title: "Space Survival Gameplay"
date: 2019-06-18
url: https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html
labels:
  - game design
  - multiplayer
  - player-generated content
  - space
---

## Tuesday, June 18, 2019 


### Space Survival Gameplay

I was asked a little while ago how I would do a space survival game, since I've been ragging on them recently. I also mentioned it in a video or two. So let's talk.  
  
Let's get started simple. Let's say I'm a Star Citizen dev, out to put survival mechanics into my pew pew shooty game. I already have gorgeous starship interiors, now it's time to leverage them. How do I do it?  
  
Well, my goal is to turn survival into a yarnball. A soft, complicated challenge that interlaces with a lot of other things. I also want to make sure that it unfolds into a narrative according to the choices the player makes.  
  
So I implement a The Simslike survival system. Every time you make a space jump, your various meters go up. Hunger and filth, for example.  
  
Actually using kitchens and showers is a repetitive and uninteresting task, so rather than requiring you to use the facilities, we simply reduce the meter if you have them. If you have a kitchenette, your hunger goes up 90% slower. A full kitchen? It doesn't go up at all... until your food runs out.  
  
We do want to push the player to exist in that space, so we do allow the player to use a facility for a temporary boost - until the end of the next jump. If we use the kitchen, we get a +20%, but it uses up a bit of food. If we use the shower, we get a +10%, but it doesn't use up anything. This bonus doesn't reduce your meters, it simply enhances your performance. It doesn't stack.  
  
To make this into a more narratively cohesive experience, we have to decide on the narrative we want. And the narrative we want is how the pressures of space travel shape our life aboard a ship.  
  
This is not simply about "life aboard a ship". The point is to turn challenges - the challenges of a human surviving in space - into narrative beats. The ship is our tool to do that, but the challenge it parses is the challenge of survival.  
  
If we want a gritty feel, we could get things like life support involved. But the ships in Star Citizen are ridiculously high tech, so instead we're thinking more about the social narrative. How does the mind fail, rather than the body.  
  
So we add a few more meters. Loneliness, claustrophobia, boredom.  
  
When they go up, you have to bring them down. Find someone to talk to. Land on a planet or space station and step outside. Have some fun by daredevil flying or fighting or driving a different vehicle.  
  
...  
  
A new player buying a new ship finds it comes with a little pocket gym. The gym reduces the meter growth of those three stats by 50% each, maybe.  
  
But the player knows they are playing solo, and are planning to go on long explorations. So the big threat here is loneliness. The others can be dealt with in the middle of nowhere by visiting any random rock, but finding a person will be tough.  
  
So the player rips out the gym, replaces it with a media console that constantly blares news shows and comedies. She puts portraits of her family on the wall, or pinups maybe. She buys a wisecracking robot companion.  
  
These keep her company. And she can use them to boost: give the family a kiss, get +30%. Watch a TV show, get +40%, but use up a media slot - she'll need to buy the next season of Game of Space Thrones or trade SpaceYouTube caches with someone else to get those slots filled up with new stuff. Better to keep that cache intact, so it burns at the slower default rate and lasts longer.  
  
And sure, she gets twitchy from the claustrophobia and the boredom. But that's why canyon racing was invented.  
  
...  
  
On the other hand, someone else might be playing on a team. They know loneliness won't be an issue, because there's another player around here. So they max out the others. They buy giant 3D landscapes for their walls - radically reducing claustrophobia, but actually increasing loneliness. They replace their gym with a video game console.  
  
They can go for a long ways without having to land or play around, but they have to chat with someone every two jumps to stay happy.  
  
No problem, they're sitting next to you.  
  
...  
  
We can see how the player's construction choices change the narrative. The player is choosing what narrative beats to include, which ones to play up or limit. One of those players is having a long, lonely journey hopping from planet to planet. The other is on a road trip with friends.  
  
Those are very different narratives. We didn't write those narratives: we allow the challenges to be faced in a way that turns them into narratives.  
  
We can push this in a lot of ways. For example, if we make it so that talking to a specific person works worse every time you do it, then those long journeys get more challenging because you have to find new people to talk to. If you burn media to keep your boredom under control, maybe you change one of those "size three hardpoints" from a gun to a giant subspace antenna that lets you transfer media from space stations a hundred light years away. Need food? There's a variety of greenhouses both internal and external...  
  
These ramifications are polish on a core concept. If we didn't have the core progression, they'd be pointless. Most of this would be pointless if the player had to return to a station every time they logged off, for example: long journeys would be limited by a player's capacity to sit at their desk and play. But since you can log off in midjourney and come back, we can assume many players will go on very long journeys.  
  
The question becomes: what of the players that don't?  
  
What about the players that are short-haul? Players that specialize in fighting or shipping people or freight over shorter distances?  
  
It's a common thing. A lot of players want to sit and do A Mission Now, and be done in half an hour. They don't want to log off midmission and come back to the same thing.  
  
Can we make our survival systems create their narratives, too?  
  
Well... no. It's not survival. But we can use the same core mechanics.  
  
...  
  
We could try to add stats like paperwork that go up as you dock... but what sort of narrative unfolds with that?  
  
Not much of one. How can we make it messier and more entangled?  
  
Well, most short-haul specialists will have specific hub stations - or, at least, specific preferred factions.  
  
This is where it can't be Star Citizen, because their faction system has a ceiling. But if we throw that away, we can allow the player to build their contacts with the faction.  
  
Rather than focusing entirely on the ship, we can allow the player-generated content to include people. Both NPC crewmembers aboard your ship and people you have agreements with on various space stations.  
  
I would do it using a similar modular setup to the one used for ships and interiors:  
  
As you rank up, you get a better "dossier" for that faction.  
  
Like a ship, a dossier has specialties and hardpoints. This dossier specializes in freight permissions. This one improves insurance and rates on being a passenger liner. This one's exploration-based.  
  
The hardpoints are people. This one's a tier 3 diplomat hard point, and you can slot in any NPC diplomat that rank or lower to act as your "weapon", giving you access to more options, more goods, more security, more sites. Reduce the rank by one just like you'd do for hardpoint turrets, and hire that person as a crewmember on your ship instead of being specific to their home space station...  
  
Because the dossiers are essentially ships, we can offload our survival mechanics onto them.  
  
As time passes and things happen, you might gain criminality, or disinterest, or distrust. These can be reduced if you equip the right kind of person on your hardpoints, but otherwise you'll have to do faction missions to clean them up.  
  
And now, again, we've turned a challenge into a narrative.  
  
Building small dossiers is easy, but you quickly learn you need to tweak it to suit your style. Do you do some... not so legal missions? You'll want a lawyer and a fence installed. Do you do a lot of business with other factions? You'll want a politician, to keep the distrust low. You go on long journeys? You'll want a reporter, to keep disinterest under control. You trade with a lot of different systems from that faction? Buy a one-rank-lower trader as a crewmember, so you get that advantage in every system.  
  
These could even be tweaked per-faction. Both by the player, depending on their interactions with the faction... and by the devs.  
  
Your Vulcan-ish faction might never gain disinterest, but gives bonus distrust if you sell science data to other factions. Your Klingon-ish faction loses interest extremely rapidly but never gives out criminality...  
  
This has an extremely high ceiling. At upper levels, you might be adding the president of a space station to your dossier, or using a cross-contact politician to transfer stats to another faction's dossier.  
  
And you can go negative. You're disliked by the Vulcan-ish faction? Add specific nemesis to your unhappy dossier. It's got a few good hard points - contacts from other factions or even turncoats from this faction - but you have to fill all your negative hardpoints first, adding in suspicious cops, angry politicians, and persistent bounty hunters.  
  
Again: build your own narrative out of the challenge. \*You choose\* how your story of banditry or war unfolds.  
  
...  
  
Hopefully this has been a fun exploration of how to make player-created content that can turn simple things (survival, faction rank) into more robust, soft, complex mechanics that create a narrative.  
  
To be clear: I think you could create an entire game around these concepts, rather than the shooty pew pew gameplay that I find so dreary.  
  
There's also a lot to talk about in regards to things like resource tiering and keeping inflation under control, and it's tightly related. But... I think this is long enough.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:49 AM](https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2895887212765462478 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2895887212765462478&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [multiplayer](https://projectperko.blogspot.com/search/label/multiplayer) , [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content) , [space](https://projectperko.blogspot.com/search/label/space)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2895887212765462478)

[Newer Post](https://projectperko.blogspot.com/2019/07/making-things-seem-bigger.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2019/06/boiling-yarnball.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2895887212765462478/comments/default)
