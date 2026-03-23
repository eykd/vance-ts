---
title: "Compound Grinding Engines"
date: 2016-08-31
url: https://projectperko.blogspot.com/2016/08/compound-grinding-engines.html
labels:
  - game design
  - gameplay
  - grinding
---

## Wednesday, August 31, 2016 


### Compound Grinding Engines

I've been thinking about how some games are compelling even when in barely alpha states, and others don't become compelling until nearly the whole game is complete. And I think I know the answer: compound grinding engines.  
  
Most games burn content for play. An RPG, for example, requires the devs to create characters, monsters, maps, equipment, stats, skills, scenes, all this content. This is essentially a steam boiler: throw content in the hopper and the player bubbles.  
  
In order to keep the engine going, you have to keep burning content.  
  
But in the beginning, the devs don't have much fuel. They haven't created much content, and most of their content is placeholder assets. There's not really any point to bringing players in right now, so the devs usually show off their art instead of releasing demos.  
  
There's nothing wrong with this, but clearly the game isn't playable out of the gate. Players would just be disappointed.  
  
On the other hand, some games are substantially more playable even in primitive states. Simulation games, mostly. Physics sims, life sims, empire sims, any kind of sim game seems to have some kind of pull that makes it fun even when it's very primitive. What is it?  
  
Well, "simulation" is the key word. The player sets something up and then watches it unfold. The player is creating content out of the initial content. We can extract a lot more heat out of this content because it forms secondary content, maybe even tertiary content.  
  
Rather than just a single steam boiler, we're building [a compound steam engine](https://en.wikipedia.org/wiki/Compound_steam_engine).  
  
This isn't quite as straightforward as putting together an RPG. It requires less content, but the content needs to be carefully fitted together because a leak in the first "chamber" will make the other chambers break. Right now, it feels like most games that get it right are either accidents or instinct, so let's take a closer look.  
  
Games like [Besiege](http://store.steampowered.com/app/346010/) are basically double chamber engines. The devs provide some physics content, the players arrange it and have fun going to town with it.  
  
It requires some care. For starters, allowing the players to build whatever they want with no guidance is not going to work, at least not as an initial play style. You need to give the players something to strive for. Something that a beginner can figure out how to do and an expert can hook additional constraints to. IE, "knock over the tower" can turn into "with a giant mech" or "using only sheep" when the expert players decide to try.  
  
There's the core fitness test - the fundamental constraints. These should vary so that the players can explore different variations. In Besiege, that's the various levels. This has the advantage of being something that can be churned out in huge quantities later on. In Space Engineers, the constraints can be fine-tuned during world creation. In Kerbal, the constraints vary across a huge map and you can choose different destinations to engage different constraints.  
  
There's also the self-challenge constraints. These typically arise from the components you allow players to build with.  
  
Usually, physics simulations have a variety of parts that have different physical characteristics. By playing this up both statistically and visually, you can easily create self-challenge constraints. These typically arise from either holding back (banning specific systems such as liquid fuel rockets, explosives, pilots) or hilarious overstretching (mecha out of a joint block, using extendable landing gear to flap wings, using stacked explosives to drill out a five hundred meter shaft, making an 8-bit processor out of redstone). Both of these approaches can be predicted based on the components, the way they interact, the way they interact with constraints, and how clearly they are demarcated visually and systemically.  
  
That's worth talking about, but we're going to instead move on to a much more straightforward example of multi-chamber systems: NON-physics simulations. For example, life sims, empire sims, farm sims, etc.  
  
That is... grinding.  
  
Today we'll defining grinding as designing a system that takes some player time in order to change a parameter in some way.  
  
The first half of the equation is taking player time. Typically this is done via a static constraint: the game simply takes some time to interact with. Making selections, moving from place to place, etc. However, in some games specific tasks have an additional time cost, typically paired up with stat costs. IE, watering each plant takes a small amount of energy and plays a two second animation, or boxing someone requires you to play a minigame for thirty seconds.  
  
Anyway, to me the second half is important: parameter change.  
  
This is the "content". This is what the player pays attention to. However, without context, it's useless.  
  
These stats often carry some context over from their real-world implication to start. For example, in Cookie Clicker, there's the initial context of "hah hah cookies how funny". Then additional context is overlaid based on the way systems interact with that 'stat'.  
  
Similarly, in a life sim you might grind your sports stat or your intelligence or something. The initial context of "I'm sporty" or "I'm brainy" is decent, but you absolutely must layer systems on top of it in order for it to pull the player in.  
  
It's tempting to just add "things that happen when you reach N points of stat". This is popular in dating games: to date the jock you need N sports points, to date the nerd you need N intelligence. But this is "single boiler" content, the same way marching through a dungeon or buying a new sword is content in an RPG.  
  
To get a "multiple boiler" setup, we need to have compression and decompression cycles. I know, I know, stretching the damn metaphor.  
  
Most of the compelling prototypes I've played feature only a small amount of "real content". Whether it's a composite VN with only one character or whether it's a space empire game with undifferentiated planets, the key is that our grinding gets "spent".  
  
IE, we don't just get research points and have ever more of them: we gain research points in order to spend them on a technology.  
  
The technology is the content, but the whole point is that you're going to have to go back to the previous chamber and grind there again in order to get the next technology. This means that each research grinding is done with a purpose: you're grinding specifically  
to get tech A or B, not to just get a higher research rating. Mid-term goals built right in.  
  
MMORPGs use a grinding system based around "fonts" and "sinks": kill monsters for cash, that cash drains away to upgrades, shops, etc. But that's not what we're talking about.  
  
Ours is more of a piston-based approach. The player focuses on injecting high-pressure gas into the chamber expecting a single "pump" of the cylinder. It's true, you are gaining research points, but the intent is for that single sweep of the piston: BAM, you have a new tech and that chamber is now spent.  
  
Whew, that metaphor is stretching pretty thin. Let's leave it behind.  
  
The point is to create a series of asynchronous, parallel, interlocking grinding systems that the player will use to obtain specific results which will then reset that system.  
  
The player isn't just grinding to improve tech points or gain intellect, they're grinding to spend those points on something.  
  
This can easily be interwoven and daisy-chained. The player grinds industry to build a bigger city that they can use to grind tech more efficiently so they can unlock a new mining rig to let them grind industry more efficiently...  
  
You're going to have long-term state. That's how the player knows they're making progress. But the point is that the long-term state feeds back into the grinding most of the time, rather than simply being a content reward. Content rewards are expensive and don't chain well, so I think of them as the final link in the chain.  
  
A fun thing to do is to make the long-term state conflict, so you can only optimize in one direction and then need to un-optimize to go another route. Alternately, you can add in states that cause unusual mutations in the flow of grinding. For example, if the player builds a police state, then half of all research points become spy points. Yeah, the citizen unhappiness that results is not great, but if you are pumping out a lot of research, you can power through to the spy expenditures you want to achieve and then dismantle the state...  
  
Another fun thing to do is "soft limiting". For example, you have a max research cap of 50 points of research, regardless of how you grind. But unlike a hard limit, this is a soft limit. Even without upgrading your facilities to get a higher cap, you can exceed that limit in a specific, limited way. Maybe the cap is applied at the end of each month, or you lose 50% of that overage each day, or you pay $10/day upkeep for each additional point, or each point requires an additional scientist. Each soft constraint will inspire the player to create a plan to exceed it in a different way, so think it through.  
  
These kinds of capabilities are what separate a powerful compound grinding engine from just another newbie sim game. A relatively small amount of content can have vast effects and keep a player coming back hour after hour before you've even added art.  
  
In theory.  
  
I have a lot of thoughts on this, especially in regards to setting up and maintaining flow at the same time, but this is more than long enough. What do you all think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:22 AM](https://projectperko.blogspot.com/2016/08/compound-grinding-engines.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3130512418840993891 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3130512418840993891&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [gameplay](https://projectperko.blogspot.com/search/label/gameplay) , [grinding](https://projectperko.blogspot.com/search/label/grinding)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3130512418840993891)

[Newer Post](https://projectperko.blogspot.com/2016/09/heartbeat-gameplay.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2016/08/concrete-analogies.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3130512418840993891/comments/default)
