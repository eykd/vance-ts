---
title: "Semiautomatic NPCs"
date: 2014-03-31
url: https://projectperko.blogspot.com/2014/03/semiautomatic-npcs.html
labels:
  - game design
  - generative
  - npc
---

## Monday, March 31, 2014 


### Semiautomatic NPCs

In which I write a very long essay as if I know what I'm talking about.  
  
We've gotten to the point where creating random NPCs is pretty easy. In turn, a lot of games have started to use random NPCs as primary NPCs or even player avatars, rather than just filler characters. However, when brought into the limelight these characters tend to fade a bit, so lets talk about some facets of creating and using NPCs.  
  
The first things to consider is the role the NPC is intended to play. Originally, random NPCs were simply intended to give the world a bit more color and liveliness - not every enemy you shoot has the same face, for example. However, we've started seeing a lot of other roles.  
  
Random NPCs in tactical RPGs are very common as party members, in which case the NPCs play the role of a bundle of stats and algorithmic growth. Unfortunately, scripted NPCs have a lot of extra oomph here, as they have personalities, character arcs, unique looks and abilities, and often unique relationships with other characters. In games like Final Fantasy Tactics, most players prefer to use scripted NPCs instead of random NPCs, and there is a certain amount of annoyance at the inarguably more complex and interesting character you get later on forcing you to kick a staple random NPC off your front line. Random NPCs can have personalities and relationships, but usually they are only in the player's head and pale in comparison to a scripted NPC with actual in-game storyline.  
  
If you want random NPCs to fill that role well, then you need to include the hooks for the social half of these RPGs - the parts where we learn to care about the characters.  
  
We're not talking about a powerful social AI or anything, just some basic hooks.  
  

## Reduction

First, let's think about cutting away rather than adding. A big problem with random NPCs (and massively singleplayer content generation, if you're using that instead) is that you have so many options. So there's an impulse to just throw more and more of it into the game. An unlimited number of random NPCs.  
  
In practice, this is an absolutely awful idea if you want to care about the NPCs at all. A better option is to dramatically throttle access to NPCs. If the player ever has more than six or seven active NPCs, they are going to lose track. So regardless of what sort of game you're programming, if the NPCs need to matter then you'll need to make sure only a few of them matter.  
  
The best way to do this is to have certain exceptional visual traits. You can have hundreds and hundreds of variable NPCs just floating around the cities or whatever, but it's the ones with exceptional traits that stand out and lure the player into including them onto the player team. While there can be a rich variety of them available, the player shouldn't actually be able to accept very many of them: every character counts.  
  
It's not just a matter of losing track of who is who, but also a matter of the social dynamics that arise. In groups of 4-7, you can create compelling group interactions pretty easily. Lower than that and you need to make the interactions super nuanced, higher than that the individual interactions start to blur together into mush.  
  
Of course, that many characters is rather low for any decent-length game, so you would probably use mechanisms to introduce churn. Plots that pull characters away, settling characters into specific towns for bonuses, characters getting thrown in jail, characters retiring... but don't flood the player with characters. You don't need nearly as many characters as most designers think - just a few!  
  

## Reducing Complexity

A lot of random NPC generators have very organic, diverse options. For example, in an Elder Scrolls game you can randomize every little detail of their body, stats, skills, powers, inventory... All of that stuff can be tweaked very precisely.  
  
But that kind of complexity is actually very pedestrian. It's useful - if you can do it you should - but to show it to the player is a huge mistake. For things like the exact percentage of red in their eye color, you obviously wouldn't go showing that to the player during gameplay... but, on the other hand, you do show them the exact strength rating, exact level, exact inventory...  
  
This is stuff is obviously going to come up in the course of play, but it is just a distraction when initially scoping out a new NPC. That stuff has value only when the player has a grip on it - IE, only when the player is actively upgrading the character - IE only after the character has joined the player's team.  
  
For things like stats, I think the best option is to randomize very chunkily. A new NPC doesn't have "strength 68", their stats are all represented in a multiple of 25 or 50, so the player can quickly understand their basic category and not worry so much about the precise number.  
  
For things like techniques or spells, the same general idea applies. It was always annoying in Dragon's Dogma to try and find a healer pawn, because you have to read through all these techniques that the mage just happens to know looking for that one. Obviously those NPCs were not random, but if they had been it would have been smart to have a "healer" category. Any random NPC with that mage subtrait would have all the healing spells up to their level, even if a party member would normally have to buy them individually.  
  
Their inventory also needs to be simpler to understand. I've been sticking to fantasy RPGs, and in those games the individual inventories tend to be pretty slim, focusing on the party-wide inventories. If you are in a fantasy RPG, a randomly generated NPC's inventory can be very basic default stuff, because the player is expected to quickly upgrade them using party resources. This removes the inventory as a thing that needs to be considered.  
  
But there are a lot of situations where the inventory matters a lot more, depending on the game type. This is a bit theoretical because nearly all random NPCs are in action or RPG games at the moment, but imagine something like Animal Crossing. Except, instead of a stock town, you "adopt" random NPCs into your town. Not only is their appearance random, but also their clothes, home, inventory...  
  
This could get quite complex to examine, so again I would simplify things. By assigning categories of interests and content, you can make it clear what sort of NPC you're talking about and insure they have a solid variety of that kind of thing. A character might be "gothy". Rather than coming with a particular "goth" costume and a particular "goth" house, they have a variety of goth costumes in their closet and a randomly created house containing goth decorations. You know what you're getting when you choose the goth even if you don't know the exact contents you'll get in the end.  
  
Personalities are also a concern, although we'll talk about them later. Basically, the issue is that if your personalities have a lot of little fiddly stats that drive them, you'll want to summarize those stats in the same way as we've talked about above.  
  

## Shtick

More important than the statistical variation of the random NPCs is their shtick. In fact, if you have to choose between adding more variation or more shtick options, always go with shtick! Even if everyone has the same face or animation, the shtick will make them feel unique.  
  
When you are manually writing a scripted NPC, you can add a lot of long-term characterization that can really help make the character feel real. However, random NPCs can't do that, at least not without pioneering some new kind of algorithm. Instead, you have to use shtick to give the character a maximum initial impact, to try and cement them into the head of the player enough that the player will fill in all the pseudorandom garbage that happens over the course of the game with personality.  
  
Because of that, shticks have to leave a really strong impression. I don't recommend making atomic shticks, but instead combining two or three basic categories of subshtick into one, so you can get maximum variety. Each kind of subshtick needs to have both a visual and personality element that makes the character both look and feel unique.  
  
For example, you might stumble across a character whose shtick seems to be "pirate". However, that's not quite true: pirate is a very obvious visual, but you instantly know a lot more about the character. For example, "Pirate queen/king", "brutal pirate", "noble pirate", "ghost pirate" - fragments of shtick that get glued together. Each one creates a specific visual and expected personality, as well as having certain statistical effects.  
  
Depending on your needs, your shticks may be a bit more reserved. If you were making a game about high school, for example, "jock" would be a subshtick... but in a fantasy RPG, that'd be a pretty weak choice.  
  
In addition to fitting into your setting, shticks need to be high-contrast. In order to make the characters jump out of the background noise, the shticks need to have a lot of punch. Basically, the people with shticks are exemplars of your setting, representing the highest order of some setting element. If the visual impact lies within or near the range that can be achieved by random variation, it's not a shtick, it's just a high stat. And that's a really dull thing to be your characterization.  
  
So our pirate isn't just some grungy lady with an eye patch. She's got to go "full pirate". Some statistical forcing, yes: rings around the eyes, grubby, some bling. But most of the characteristics should be nearly unique, and certainly not found in the general population. Tricorner hat, peg leg, hook hand, parrot, eyepatch, red longcoat - pick 3.  
  
If she's a "brutal" pirate, you get the brutal elements. That certainly involves some statistical forcing - and some of it may combine. We're going to get a lady with a lot of scars and dirt. However, brutal also comes with a custom set of animations and some body and face morphs that aren't normally available, so she'll look significantly more dangerous and hungry. After all, this "brutal" means "an epitome of this world's brutality."  
  
If she's a "ghost" pirate, she'd obviously have some undead features - perhaps being partially see-through, or having a skull for a head. "Brutal" requires some thought as to how to make it stand out as unique, but "ghost" has obvious traits that you can just plug in.  
  

## Personality and Relationships

While the shtick serves to create an impression of the character in the mind of the player, it's also important to keep reinforcing that image over the course of the game. This is why you do need some concept of a personality.  
  
This is a bit iffy, because by "personality" I actually mean "personality expressed in-game". Just labeling someone as shy or heroic or whatever is fine, but if it never comes up in gameplay it's totally irrelevant. If you have a "shy" personality element, then you'll need a way for them to be recognizably shy during gameplay.  
  
If your game is just endless combat and buying new weapons, you're not going to be able to use that "shy" trait because there's nothing social to be shy about. So you can't reasonably have a "shy" trait in that kind of game, and would instead stick to traits that show during fighting and leveling and buying gear, such as "bloodthirsty" or "careful".  
  
Normally, if I want random NPCs to feel real, I rely heavily on them feeling real *to each other*. Personalities can be defined in contrast to the world, or to an enemy, but in most cases personalities shine most when interacting with the people nearby.  
  
So I usually try to implement some kind of camaraderie system where the characters chatter with each other. A pool of supplies and responses can be used to make it seem convincing, such as a shy person getting flustered in response to another person's chatter. This reveals both character's personality traits.  
  
However, this chatter is not the same as a relationship.  
  
If you want relationships, I recommend that you allow the player to create them, since the player knows how their personal lives are developing better than you do. Other than that, the chatter is largely stateless. It just exists to express the personalities of the characters and shake up the player's internal representations a little bit to keep it from getting stale.  
  

## Plot Arcs And Churn

Probably the biggest concern for a lot of people is the idea of a plot or character arc. Written NPCs grow and change over the course of a game! Random ones really don't.  
  
First, I don't think it's that important. The characters should have a fairly rich internal life in the player's head, so enforcing some kind of arc on them would be awkward. If you do that, you should choose the most basic arcs and make it really obvious which characters are going to go through which arcs.  
  
Instead, I like to think of this as an opportunity to introduce much-needed churn and emotional plot points.  
  
So a character doesn't necessarily have an arc, but once the party has been settled into its configuration for a while, they should randomly pull the outside world into view.  
  
For example, after wandering with us for a while, our pirate queen character would suddenly be approached by her old crew, or find a batch of pirates in the next town, or realize there are wanted posters of her all over town and the sheriff is hunting her.  
  
There are three keys to these plot "arcs".  
  
1) They should be very simple and have only a few resolution states. One of those states should be that the character is retired for a fair while. This probably means they all need to be preprogrammed, at least in terms of their rough structure and progression. Many shticks can share the same set of quests.  
  
2) They should have between one and three new, unique NPCs involved. If there's a bounty on her, it's not just that there are endless hordes of faceless bounty hunters. You also have a sheriff that is an interesting character, an interesting bounty hunter, and an interesting side character who might also have a bounty on their head, or look so much like the pirate queen that they are being attacked in turn. Obviously, these slots have to be programmed into the event ahead of time, and there would be restrictions on the sorts of shtick they could have.  
  
3) There should be real threat to someone outside your party. It's not just that bounty hunters are after your pirate queen: there are others at risk. Every unique NPC should be at risk in some way, even if the risk is just that they will lose their job. Categories of basic NPCs can also be threatened. For example, every woman that has red hair like hers. Or other bounty targets that haven't really done much wrong. Or perhaps the sheriff has bet his job on this bounty. In the end, some people will be hurt no matter which resolution you aim for.  
  
Churn is really important in these games, or you'll settle on one party and stay with it forever. Plot arcs introduce churn, but they are hardly the only method of doing so.  
  
Another method is "easy plots", where you have to leave characters behind to deal with a particular situation while you move on ahead. These can be suuuuper-vague, and in general should give you the choice of two party members to leave behind, and you can choose either one or both. The rate at which this needs to happen varies - it certainly doesn't need to happen in every new dungeon. These characters can come back later, perhaps a few levels higher, after the situation has been resolved.  
  
Another method is to make dropping characters a major mechanic, like in Valkyrie Profile. By settling characters into specific locations you can prepare for the endgame or whatever. You can even make this temporary, so the characters can return later.  
  
Anyway, those are my extreeeeeemely long thoughts on random NPC generation.  
  
Well, that's not true. There's actually another essay this long that I want to write on the nature of interior, exterior, and pan-character growth and challenge, but I'll spare you that.  
  
FOR NOW.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:24 AM](https://projectperko.blogspot.com/2014/03/semiautomatic-npcs.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2035175905639123727 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2035175905639123727&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [generative](https://projectperko.blogspot.com/search/label/generative) , [npc](https://projectperko.blogspot.com/search/label/npc)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2035175905639123727)

[Newer Post](https://projectperko.blogspot.com/2014/04/backstories-are-not-characterization.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/03/constraining-construction-for-improved.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2035175905639123727/comments/default)
