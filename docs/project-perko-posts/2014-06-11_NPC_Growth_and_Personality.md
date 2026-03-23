---
title: "NPC Growth and Personality"
date: 2014-06-11
url: https://projectperko.blogspot.com/2014/06/npc-growth-and-personality.html
labels:
  - game design
  - generative
  - npc
  - player-generated content
---

## Wednesday, June 11, 2014 


### NPC Growth and Personality

Most open-world games give you the option to either ignore or hurt an NPC. Some, like Skyrim, give you more complex variations and gameplay within that spectrum. But very few games allow you to be constructive, to help random NPCs.  
  
I came up with a way to do it. Originally, this was a way to make a science fiction setting work for an open-world game. The concept I'm about to describe started off as sci-fi Facebook. But it's easier to explain in a fantasy setting.  
  
Fundamentally, it's a conversation engine overhaul. When you talk to an NPC, the things they say are stored forever in your memory. If you want, you can scroll back and see all the things they've said. You can also tag favorites, to keep from drowning in ancient conversations.  
  
This means they have to say more than a few canned lines. And they do: each thing they say is a state reveal.  
  
Behind the scenes, an engine is introduced to make NPCs more complete. When you create a house for an NPC, rather than specifying a wooden table covered in wooden plates, you would specify a spot for a "small table". The engine would fill in which small table goes there based on the NPC's affluence rating, location, personality, and/or culture. The stock game might just have a bad and a good small table, making the choice pretty easy. But subsequent mods could add in more tables, including some that only appeal to specific personalities or are regional specialties. The mod just registers the new tables into the item list and they are automatically in rotation.  
  
This is also advantageous since it means any NPC can move into any home and it'll become theirs without any scripting required. If a weird foreign NPC moves in, they'll automatically buy or craft weird foreign furniture and clothing.  
  
The NPCs obviously have some stats to drive this engine. They have affluence, relationships to other NPCs (who may be their caretakers/dependents), specific jobs, a personality, a mood, an optional home culture or second set of stats for a secret or seasonal lifestyle.  
  
The player cannot simply see these stats. Instead, they are revealed through the conversation tidbits. Each conversation tidbit is about a specific in-world condition that reflects a specific NPC state.  
  
For example, Anna might say "Have you seen my new horse? I love this horse!"  
  
The in-world state here is "Anna bought a (valuable) horse". The NPC state behind it is "Anna has an affluence of 120".  
  
The moment Anna says it, you can reply with various social niceties and try to become slightly better friends with Anna. But this chatter is just social lubricant. This is not why the system is powerful or useful.  
  
The system is powerful and useful because "Anna bought a (valuable) horse" is concrete.  
  
You can refer to that concrete statement and pull out the pieces of it by simple context. Pick it out of the list and bring it up in conversation with a party member. Point to it and say "do this". The party member knows you want them to buy a good horse.  
  
But you could say "steal this", and the party member would know you want them to steal that specific horse. Say "steal one of these", and the part member knows you just want them to steal any decent horse they can find. Go up to Anna and say "I want this", and negotiate a price for her horse.  
  
You can even manually redirect the context: "this lady..." or "this place..." and now you're talking about Anna and her stable, rather than the horse buying.  
  
All of this works because the game not only keeps track of the state of things in-world, but also the state as it was when the statement is made. Anna has a horse, and she once said she bought that horse.  
  
This knowledge might be valuable to you if you want to butter Alice up - giving her a nice saddle for her horse, or carrots to feed it, or a book on horse grooming. That value comes not from the statement itself, but from the stable world state of her having a horse. If her horse gets stolen, she might not be so happy to get a book on horse grooming, though.  
  
The knowledge is also valuable as a kind of verb to talk to others with, allowing the player to rack up a huge number of in-world contexts to talk about without needing a natural-language parser or worrying about spelling. Moreover, mods will fluidly join ranks without any issue at all. Not only could Anna easily buy a dragonette instead of a horse, she also could easily talk about gablonging the zuzufrass. And now you can tell your followers to gablong things, or get you some damn zuzufrass already!  
  
This system is highly extensible in every direction.  
  
For example, the game can take regular snapshots of your adventures. Fight an orc? The snapshot camera saves pictures of each blow, and the context of each snapshot is saved along with it. Any time in the next hour or so, peruse your snapshots and save the ones you like. The rest stay on schedule for deletion. You can use this to put together war stories. You can also use it to talk to NPCs about these things - for example, if your wizard friendly-fired an ally, a picture was taken of it. Hold up the picture in your mind, and now you're talking about the friendly fire incident. Tell him not to do it, and his battle AI will become more reserved about that sort of thing.  
  
You could take this MUCH further. For example, you could "imagine" things by playing through areas with god mode turned on. Use these memories to talk to your allies, plan out an attack, or explain some bizarre flight of fancy you had. Of course, you'll need to know a lot about an area before you can imagine your way through it...  
  
You can build new locations and NPCs by simply using these snapshots. Examine a bowl. Now you can create that bowl in your creative mode area. Anna bought a horse? Substitute a local NPC for Anna. Now that person bought the horse (and is assigned the same 120 affluence). Substitute a dragon for the horse.  
  
You can quickly create relationships, sidequests, and worries as long as you've talked to other NPCs with similar relationships, sidequests, and worries. Someone once said "wolves are constantly harassing our town"? Substitute in giant frog-lizards for the wolves, and you've got a piece of scenario for your custom town.  
  
The only big problem I see is drowning in commentary. I think you'd need a categorized favorites section, for your most referred-to items. After all, you'll hear tens of thousands of lines of dialog, especially since you'll be more interested in conversing than ever before. You'll also need a way to simply refer to people, places, and items without context - IE, the ability to pick giant frog-lizards out of a list of enemies rather than having to find another conversation that mentioned them.  
  
One of the things that may not be clear so far is that this is a constructive system.  
  
It doesn't just let you refer to thing X more easily. It gives you a grip on the underlying social and economic engines that govern the NPCs lives.  
  
Maybe you start to feel for a miner with a daughter, struggling hard every day to earn just enough to eat. There are a few ways to improve his state.  
  
One way is to give him loot. This will temporarily raise his affluence level. But affluence will always trend towards the base affluence of their job, so you'd have to give him a lot, or come by and give him more fairly often.  
  
Another way is to improve his skills. Training could be one of the basic actions you could take, and if you improved his skills (socially, economically, or miningerally) he would get promoted, increasing his affluence.  
  
Another way is to improve the mine's base output, since a rising tide lifts all boats. You could do this by killing the annoying monsters inside. You could do this by repairing doors and rails and shafts. These are physical activities that do not require the use of the chatter front end.  
  
But you could also use the chatter front end to improve the mine's output. You could do this by searching the mine for overlooked rich veins, saving the snapshot of you finding one, and then telling him about it. Alternately, maybe you learned a trick to more efficient mining from another miner. You can refer to that conversation and transfer that knowledge to the miners here.  
  
You can also use the chatter front end to try and get him promoted by appealing to (or bribing) his boss. Or you could use the chatter front end to relay business opportunities from other people that provide mining supplies or require ore. Or you could convince random people to go and work at the mine, since newcomers will have less seniority and the miner can't help but get promoted.  
  
Now, if I had said "I'm going to build a front end that will let you do all this stuff", you probably would have shook your head. It sounds like a lot. But since I started with how it works, hopefully you can see that those opportunities arise naturally. They literally require no extra work, as long as people can express their needs and opportunities.  
  
Moreover, because the framework behind the NPCs is both simple and flexible, an NPC can also be pushed to radically change their position in the world. You could convince the miner to come with you, not via some kind of quest chain or scripted event, but because you are capable of saying "come with me" and the miner is capable of considering how viable that seems. It'd just be a matter of comparing affluence and danger in his current job vs affluence and danger in your offer, weighted by how much he respects you.  
  
It'd also be pretty easy to let you become an economic juggernaut. If you flat-out bought the mining company, it'd require very little extra content to let you run it as you prefer.  
  
The only sticky point is the scripted quests. Well, those are awkward in Skyrim, too. The hope is that most of the quests won't be scripted, but will arise naturally from the state of the NPCs in the game.  
  
The miner is an example of that: just by encountering him or his child it is clear that he's in a not-so-great situation. The quest to fix things up naturally arises as the miner generates lines of dialog about his state, explaining who he works for, how much he loves his daughter, how concerned he is about their drafty shack, etc.  
  
By setting up the town in a tense arrangement, things should line up to create a situation that feels similar to a set of town sidequests in any other game.  
  
...  
  
I hope everything I said was clear. What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:48 AM](https://projectperko.blogspot.com/2014/06/npc-growth-and-personality.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7149619780466949738 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7149619780466949738&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [generative](https://projectperko.blogspot.com/search/label/generative) , [npc](https://projectperko.blogspot.com/search/label/npc) , [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content)


#### 1 comment:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Intriguing, will keep it in mind.  
  
You're a fascinating person, Mr. Perko, you know that? Wish I knew you in real life. Keep an eye out. ;)

[8:45 AM](https://projectperko.blogspot.com/2014/06/npc-growth-and-personality.html?showComment=1404315933920#c1482640724344723696 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1482640724344723696 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7149619780466949738)

[Newer Post](https://projectperko.blogspot.com/2014/06/clothes-are-expensive.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/06/the-moddable-game.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7149619780466949738/comments/default)
