---
title: "Social NPCs"
date: 2008-07-22
url: https://projectperko.blogspot.com/2008/07/social-npcs.html
labels:
  - social play
  - social simulation
---

## Tuesday, July 22, 2008 


### Social NPCs

I've been trying to write this essay, but it keeps turning into a book. Let's see if I can keep this short...  
  
First, you'll need to read [this](http://projectperko.blogspot.com/2007/04/integrating-characters-into-games.html). In order for a social NPC to be of any interest, they need to have some kind of feedback. It is best to link this into the gameplay - being friends with someone has an in-game effect of some kind. You may also choose to make it social or personal, such as them sharing secrets or childhood wishes. These should not, however, be the only kind of response.  
  
The difficulty here is that the kind of game you're running will, by its nature, limit the kinds of responses you can have. For example, if you're doing a zombie game, the social NPCs are pretty much limited to responses that affect your zombie protection measures. Become friends, they'll share their food, or try to protect you rather than running away, or follow orders better, etc. You can add in the ever-present personal elements too: romance, personal friendship, etc.  
  
This is very limited. In this kind of situation, the "edges" of the simulation, the parts where the players will naturally want to go, will be the parts that don't have anything to do with zombies. It's the "luxury" gameplay: once you've mastered getting people to cooperate with your zombie-protection efforts, you can move on to getting them to kiss you.  
  
Unless you're aiming to make a pornographic game, this is going to be a pretty limited kind of relationship... so let's consider what kinds of feedback (what kinds of things the NPCs can do) would make the social situation "deep" enough to allow for "deep" social gameplay?  
  
To me, the basic idea is the same as in every other form of gameplay. You need to have nested feedback loops. Once the inner one is learned, the next one out starts to spin, modulated by how the player is using the inner one. When that one is learned, you spin up the next one... just like a first person shooter where you learn to move, learn to navigate, learn to shoot, learn to fight, learn to use different weapons, learn to manage ammunition...  
  
There are also side-loops that aren't directly in the chain, such as hacking or other 'mini-games' that don't directly involve the chain... and the chain isn't usually quite as clearly nested as I'm pretending... but overall, it's more or less like I describe.  
  
Most games stick to only one "social loop", and a very one-dimensional loop: how much the character likes you. Once you learn how to make them like you, you get whatever useless reward they offer and then never see them again.  
  
We can think of this linear scale as a first element, much like being able to move left and right in a Super Mario game. If we want to clone the same nested loops that Mario has, we have to implement a "level" (the "mental and social terrain" of the NPC). Moving left and right (being nice or cold) can't get you to the goal, because there's stuff in the way: just being nice all the time will make you fall down the pit because he or she gets suspicious of your cloying nature. Or you hit a wall: they don't mind you being nice, but it's not going to make them like you any better.  
  
Navigating this terrain is important, so we add "jump" functionality, just like in Mario. Once you can socially "jump", you can navigate the terrain left and right - sometimes having to be cold instead of nice in order to get over some blockage.  
  
What does the "jump" represent? What kind of social action "jumps"?  
  
I would probably say "hanging out". Doing some kind of activity together, whether it's slaying monsters or watching a movie or whatever. Spending time together "jumps". We can make different kinds of hanging out have different effectivenesses on different characters: If you're trying to jump in a warrior's social world, watching a movie with them is just a little hop while fighting demon dogs with them is a big leap.  
  
Continuing on the Mario framework, it's not simply jumping and walking around a still level: you have to navigate enemies. Some enemies can be stomped, some enemies can be stomped and give resources (shells) , some enemies cannot be stomped and must either be evaded or fireballed.  
  
The fireball would, I think, be a gift. Again, the size and speed of the fireball would depend on the kind of gift. If you're trying to be friends with a Star Wars geek, giving him a basketball would not produce much of a fireball.  
  
At this stage we've built a complex level and method of navigation, although we're kind of pushing to the side any idea of representation. These nested feedback loops are guaranteed to make our social gameplay more interesting, so long as it's possible to see what we're doing. Unlike most games with social elements, we're not dictated as to exactly what we do, we're just dictated as to the kinds of challenges we encounter. How we deal with them is up to us.  
  
In-world rewards are kind of scarce and boolean with this, though. What does beating a level get you, exactly? You win, they're your friend, you get their useless little thing, and then you never see them again?  
  
Instead, I would have it so that every time you wanted something from them, a level is generated that you have to navigate. If you want them to give you their cool sword, you face a difficult level that will require a lot of being cold, being nice, hanging out, and giving gifts... You would get a different level (but the same general idea) if you wanted them to vote against the Orc Party in the senate...  
  
Some situations would have time pressure - can you convince them to vote before the senate meets? Others wouldn't. But time would be measured in terms of "real-world" time rather than "Mario-level" time.  
  
Anyway, I have lots more thoughts on the matter, and there are a lot more games I want to clone and demonstrate (particularly ones that don't start with a 1D navigation), but this is already long enough.  
  
Do you see what I'm getting at? Do you understand? What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:56 AM](https://projectperko.blogspot.com/2008/07/social-npcs.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7762022265833363395 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7762022265833363395&from=pencil "Edit Post")

Labels: [social play](https://projectperko.blogspot.com/search/label/social%20play) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 9 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/17574626231451600275)

[Ryan](https://www.blogger.com/profile/17574626231451600275) said...

Well, I'm pretty sure the Mario game was all a metaphor, but it made me think of actually playing Mario to determine the outcome of the social interaction, just as you described it. It's just a silly mini-game, but at least it'd be original.  
  
The level is procedurally generated based on the NPC's personality, and how you're interacting. For instance, a person who likes lots of gifts might have a lot of enemies. Or talking to your grandma might be one of those levels that slowly moves to the right (being nice), whether you're ready for it or not.  
  
Moving right gets you nice guy points, moving left gets you mean points, but it's a zero-sum type thing. Nice negates mean.  
If you move right too much, you might get what you want, but that soldier no longer respects you. Some levels will inevitably involve having to go one way or the other so far such that it's your last useful interaction with that person.  
  
Fireballs only work as long as you have meaningful inventory, and ammo is obviously limited.  
  
Getting hit by an enemy would be the equivalent of saying something offensive to the person, and doing favours for the person would get you extra lives.

[10:49 PM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1216792140000#c6979496576204143807 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6979496576204143807 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/17574626231451600275)

[Ryan](https://www.blogger.com/profile/17574626231451600275) said...

Oh yeah, and doing something like saving someone's life might grant you the ability to fly for a level.

[10:50 PM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1216792200000#c2410179536161685238 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2410179536161685238 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Sounds like you've got the idea...

[10:57 PM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1216792620000#c5071537721230789416 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5071537721230789416 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/07640683757330420292)

[Christopher Weeks](https://www.blogger.com/profile/07640683757330420292) said...

I thought I was understanding you, but your response to Ryan's literal minigame idea makes me wonder.  
  
In any case, from the position of not having actually designed any decent games, I don't understand the value in converting one game's feedback loops to social feedback loops. Are you doing it as merely a thought exercise or are you proposing that if you re-theme a successful game in that way -- with a real implementation, that it is more likely to be fun?  
  
I do see a potential game based on or maybe just including these social loops. I like the idea of identifying the kinds of relationships and the kinds of behaviors that lead to the development of those relationships and having players navigate a social landscape. In your example, you have being nice, being cool, giving gifts and hanging out. I'm imagining those as buckets/variables that rise and fall as you interact and if any given NPC had ratios that caused new states to be reached (e.g. when the nice:icy ratio reaches 2.3 the NPC thinks of the PC as a pre-friend or when the cool:gift ratio reaches 1.2 the NPC thinks the PC is a creepy stalker) and this model as an implementation of the thing you describe.  
  
But then I'm once again unsure how literal the Mario analogy is supposed to be. So I'm unsure if what I'm saying is completely divergent from what you're describing one possible underlying mechanical system.

[6:26 AM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1216819560000#c4381028538792246268 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4381028538792246268 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, Ryan's talking about a literal minigame, while I'm talking about controlling the Mario-like situation with social actions (rather than visa-versa). But the basic idea is the same: more complex socialization.  
  
"In any case, from the position of not having actually designed any decent games, I don't understand the value in converting one game's feedback loops to social feedback loops. Are you doing it as merely a thought exercise or are you proposing that if you re-theme a successful game in that way -- with a real implementation, that it is more likely to be fun?"  
  
It's a thought exercise. Because of the difficulty in creating meaningful social interaction, I thought the easiest way to get started would be to hijack a well-known game with fairly good gameplay.  
  
Regarding your relationships paragraph: it's funny, but that's exactly what I'm trying to avoid. The problem is that writing about it takes pages.  
  
Basically, defining relationships creates a very limited framework. I think that the classic relationships - friend, lover, etc - are just stereotypical examples. In reality, every instance is different.  
  
Which implies that there are some kind of underlying structures that make up a relationship, and we just tend to label them "friendship" or "lover" or "rival" and pretend the relationship itself is atomic. But it's not: it's a complex, unique structure.  
  
What I would prefer to do is allow the player to build a custom relationship in that way. Give them access to the building blocks.  
  
This post didn't include much of that because, as you see, it gets long very quick.

[8:52 AM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1216828320000#c2916861906105005804 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2916861906105005804 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/07640683757330420292)

[Christopher Weeks](https://www.blogger.com/profile/07640683757330420292) said...

OK, so I think I get it. Especially, when you note that relationships are way more complex than our atomic descriptions imply. On the other hand, while those descriptions are not really atomic and when you have two "lovers" your two relationships are not identical -- they are similar in some important ways. E.g. you have a reasonable expectation of interacting sexually or otherwise intimately with someone who wears that designation (at least as I think most people use the word). And you could have someone who is both a lover and a rival or someone who is a lover but not a friend. Are you opposed to those labels at all -- like because it poisons the way the player would think about the NPCs, or are you only avoiding them as they would be normally implemented?  
  
Also, from a game-design-philosophy perspective, in a game where you wanted to hide such labels from the player, how do you feel about using them as concepts that guide development? Do you have to merely shape the player's understanding of the relationships or also the dev team (even if that's just you)?  
  
Also, you talk about not just reaching the (e.g.) friendship milestone to get "whatever useless reward they offer." But instead beating a "level" generated based on what you want when you want something from them. What does that level look like? In Mario I know that to deal with the oncoming turtle, I can jump it or fireball it or toss a shell at it or go the other way. That's all simple graphical feedback. What's the feedback that you get and respond to in a social situation?  
  
Finally, what relationship do you envision this notion having to [your social combat thoughts](http://projectperko.blogspot.com/2008/04/social-combat.html)?

[10:19 AM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1216833540000#c326164229517594102 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/326164229517594102 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

"Are you opposed to those labels at all -- like because it poisons the way the player would think about the NPCs, or are you only avoiding them as they would be normally implemented?"  
  
I'm against how they would normally be implemented. In order to get unique relationships, I don't think you can just say "this is a romantic action, this is a friendly action, mix it up". There's an inherent limitation there.  
  
That includes using them as concepts to guide development. Let me see if I can explain why:  
  
Playing go, you place stones to try to capture territory. One of the most important elements is forming "eyes": empty spots surrounded by stones. Once you have two "eyes", it's impossible for your stones to be captured.  
  
These tend to form very recognizable shapes in the end, but go would be a very poor game if you placed those finished shapes rather than building them from stones.  
  
"What's the feedback that you get and respond to in a social situation?"  
  
Here's the crux of the affair. In this particular example, I'm assuming we'll actually use the minigame feedback as a substitute for strictly social feedback.  
  
There are other examples, more complex or advanced examples, which use only social feedback. But I didn't cover that yet.  
  
As to the social combat idea, it's the same basic idea. Although, obviously, a different example.

[10:49 AM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1216835340000#c6009169260156086458 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6009169260156086458 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Its true fireballs only work as long as you have meaningful inventory, and ammo is obviously limited. I like the idea of identifying the kinds of relationships and the kinds of behaviors that lead to the development of those relationships and having players navigate a social landscape.

[12:06 AM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1217660760000#c6020389381858523960 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6020389381858523960 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

That's the basic idea!

[12:31 AM](https://projectperko.blogspot.com/2008/07/social-npcs.html?showComment=1217662260000#c3623064511638196003 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3623064511638196003 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7762022265833363395)

[Newer Post](https://projectperko.blogspot.com/2008/08/soul-calibre-iv.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/07/amber-alert-commentary.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7762022265833363395/comments/default)
