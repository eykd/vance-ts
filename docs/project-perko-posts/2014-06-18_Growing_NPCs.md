---
title: "Growing NPCs"
date: 2014-06-18
url: https://projectperko.blogspot.com/2014/06/growing-npcs.html
labels:
  - game design
  - npc
  - social simulation
---

## Wednesday, June 18, 2014 


### Growing NPCs

I've been thinking about NPCs.  
  
A while back I came up with a "chatter" system that allowed NPCs to remember chunky bits of worldstate, then allowed both them and the player to use those memories to talk about things.  
  
The idea was simple: NPCs are normally scripted to do specific things to further the player's adventure. They have a specific role they are assigned. But that doesn't sit well with me. To me, the NPCs are the player's adventure.  
  
The most powerful experiences I've had in open-world games were when someone was with me. Whether it was another player or a good NPC, it's a powerful experience. The important thing about an NPC, to me, is not the design or the personality. It's that the NPC feels like they are moving through the same space as me.  
  
Chatting with an NPC at a home base is all well and good, but I don't need it. It's extraneous. The NPCs don't need to have a compelling backstory, or a secret they refuse to tell you. They don't need to have a loyalty mission. All they need to do is move with me.  
  
Probably the most powerful NPCs in this regard are from Dragon Age, because they react to each other. Their reactions to me are pretty bad, but their reactions to each other are really good, creating a real personal dynamic to the party. It kept me playing even as the gameplay disintegrated and the story collapsed into mush.  
  
When it comes to interacting with my specific movements through space, the characters fall flat. They do sometimes comment on the spaces we pass through, but always in a passive and passing way. They do occasionally act in response to my actions, but their responses tend to feel arbitrary and annoying because they tend to judge something without allowing any explanation.  
  
For example, if I choose to help someone, my party members will judge that in a particular way no matter what I was thinking. This was a big issue in the Dragon Age games, because I would often find myself blindsided by a character's judgment. The reasons I decided to take a particular action were obviously not the reasons any of the devs thought anyone would, and it often took me quite a while to figure out why a character would be upset with that, or like it.  
  
We can learn from smaller projects, though.  
  
In the original Skyrim, the companions basically didn't exist as anything other that combat flunkies. They had almost no personality after being put into your team. But since then many companion mods have been added.  
  
One of the most interesting to us today is the thief character, Arissa.  
  
She follows many of the same patterns as a Dragon Age character, but she does those patterns much better. She has more active rather than passive location-triggered comments, and she can be released to explore a city on her own, which is very interesting. But those require a lot of custom content for relatively small payoff. Let's talk about her most effective advantage:  
  
She will judge your actions similar to a Dragon Age character. But she does it in a way that doesn't have an opportunity for misunderstanding.  
  
She doesn't judge you based on which quests you accept or that sort of thing. She judges you based on how awesome a thief you are. Sneak attacks, picking locks, and picking pockets will earn her friendship. Murdering friendlies will earn her distrust. This is really interesting, because it ends up painting a very powerful picture of her personality: she appreciates your ability to rob townsfolk blind while they sleep, but if you hurt them physically she'll get pretty upset.  
  
Relatedly, she gives you a very clear progression. You are told when she appreciates or doesn't appreciate things, and once her opinion has changed enough it unlocks new features. A bit of appreciation and she'll carry things for you. More, and she'll let you equip her. More, and you can ask her for lockpicks. More, and you can ask her for poisons. And so on. While these seem minor, they are important rewards to guide players onto the path.  
  
After about half an hour of Arissa as my (only) follower, I found something odd: I was changing my behavior for Arissa. I was pulling off unnecessary stealth kills and stealing things I didn't need specifically to impress her. I can't recall ever doing that for any other NPC - normally I would just choose the NPCs that get along with my play style.  
  
When I was finally caught pickpocketing by a civilian, rather than kill the civilian to cancel the bounty like normal for a villain run, I actually paid my bounty (after giving all the illegal stuff to Arissa to carry).  
  
This story of my adventures was very different from what it would have been with any other companion. An NPC had shaped my adventures in a very open, simple way. No quest lines. No ethical dropdown box. No trying to read my mind and getting it wrong. I had the adventure I was having, and an NPC was a big part of it.  
  
Arissa was flexible enough to fit into my adventure. No matter where it took me, or what mods I had enabled, Arissa's simple preferences held up. She could participate in any setting, any scenario, any specific adventure.  
  
This is the heart of what I'm trying to do with my new prototypes. Basically, I want the overarching megaplot to be a mod. I want people to be able to "mod in" any end-of-the-world storyline they want, and all the NPCs will function in that adventure without an issue.  
  
I would like to expand the functionality of the NPCs. Although Arissa was good for the limits of the engine, she was basically stuck just judging things rather than participating in any kind of meaningful way. The line dividing her active systems (combat AI) and passive systems (judgments) was far too stark.  
  
A more active character can be created, but you need to be careful to keep chaos under control. That means that the game's fundamental systems have to be built with this kind of active NPC in mind.  
  
If Arissa (or Morrigan or whatever) takes loot that I was aiming for, or kills something I wanted to kill, or otherwise disrupts my immediate plans, they are suddenly annoying. The game needs to be built with their free action in mind.  
  
Another problem is the number of NPCs. Arissa works well as the only NPC judging things, but if there were another three of her, each with their own values, it would become a mess. If you're going to have a lot of NPCs, you need a different approach.  
  
In my game engine, the tentative plan right now is to only allow for one or two active companions. You might have many people willing to go with you or be in a dance party together, but they exist as part of the world when they aren't in your party. There are rewards for letting them continue their daily life uninterrupted, at least for decent stretches of time.  
  
The other part of my plan is to have "plan triggers".  
  
In order to not disrupt your plan, all the NPCs really have to do is understand what your plan is. Also, if they understand what the plan is, they can be "moving through space with you" much more effectively, participating in your adventure much more clearly.  
  
So, when you walk into town, click to tell your party to ask around for rumors but not get in trouble. Click a different button to tell them to stay close and on alert. Click a different button to tell them to go straight to the inn, or wander as they see fit, or stay hidden... all associated with you saying something, and them saying something back.  
  
I'm thinking you can even expand this to targeted actions. Control-click to tell a party member to execute the plan there - whether it's talking to those people, stealing those things, blowing away those monsters... sort of like turn-based controls, but much vaguer and faster to trigger. More like saying "There!" rather than "attack goblin B with your fireball spell".  
  
I've also been thinking about a lot of alternatives to the concept of "you". A big part of the problem with open-world games is that the player avatar is a specific person and therefore everything has to revolve around this one person. This one person has to be friends with everyone, know everything, act in a specific way...  
  
To me, that only works for a small game. If an open-world game is going to be longer than a few hours, I think they would benefit from being able to switch avatars. To that end, I've been considering a variety of avatar-switching ideas.  
  
Right now, my favorite is that you are some kind of ghost or godling. You have your own presence, but you can't really do anything without possessing a willing host. As time passes, hosts get steadily more burned out and you have to stop possessing them to allow them to recover. So you'd have a "primary" NPC that you are probably directly controlling most of the time, and one or two secondaries that act with you.  
  
This would allow for a much wider variety of experiences without crowding in too many characters at once.  
  
Well, nothing is set in stone. These are just my thoughts.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:37 AM](https://projectperko.blogspot.com/2014/06/growing-npcs.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8684607772956779260 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8684607772956779260&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [npc](https://projectperko.blogspot.com/search/label/npc) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 2 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjURZbTUeIKNWlbodByylpnvz-37QYcobiyDEYrV3myl\_L8OO8suJx2EDy7h\_W64-WrZXWQc-CGlZ8O5lL3 UcLUKy0wjJDjQMJZZsrulgDhV6 Cfs83r421s5\_Sfmi8D8A/s45-c/cropgrow968982\_10200311668297839\_369994603\_n.jpg)](https://www.blogger.com/profile/13554930621825481241)

[Ellipsis](https://www.blogger.com/profile/13554930621825481241) said...

Now I want to download Arissa. Moreover, breaking the "you" in open-world games is something I'm interested in. The idea of playing as a being separate from the characters can also allow for something I'd like to see well-implemented, which is permanent death in a reasonably immersive, serious world. Thus far permanent death is feature only in roguelikes and independent games that treat it as much like a gag as a legitimate game feature.  
  
If the player were a ghost or godling, they could gain, say, experience being a warrior, and experience being a politician, which would stick with them, even though the specific warrior or politician they were had died, and you can get character stories that have a beginning and end without the game needing to abruptly stop or reset when you get stabbed.  
  
That's a little off-topic from your post, but I think related. I've found a couple times in games like Skyrim or Fallout 3 if a follower or NPC accidentally died in a way that seemed sufficiently dramatic or thematically appropriate I would leave them dead, despite the desire to reload and play perfectly, and the result was often surprisingly satisfying.

[2:30 PM](https://projectperko.blogspot.com/2014/06/growing-npcs.html?showComment=1403645423903#c4048641554505515087 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4048641554505515087 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yup, I agree with all of that.  
  
Most of Skyrim's downloadable followers are immortal and super-overpowered, so you need to do an annoying amount of tweaking.

[2:52 PM](https://projectperko.blogspot.com/2014/06/growing-npcs.html?showComment=1403646731473#c8918409987636907017 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8918409987636907017 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8684607772956779260)

[Newer Post](https://projectperko.blogspot.com/2014/06/play-echoes.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/06/i-still-hate-bioshock-infinite-and.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8684607772956779260/comments/default)
