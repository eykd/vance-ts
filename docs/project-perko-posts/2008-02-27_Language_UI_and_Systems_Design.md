---
title: "Language, UI, and Systems Design"
date: 2008-02-27
url: https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html
labels:
  []
---

## Wednesday, February 27, 2008 


### Language, UI, and Systems Design

Oooh, such a pretentious title! Hopefully, not as pretentious an essay...  
  
Duncan recently mentioned Uru in a comment. Uru is the massively multiplayer variant of Myst, and is a game that has done so badly that even Gametap is taking it off the roster. I only managed to play it briefly, not because it stinks, but because I didn't have much time on my hands.  
  
Exactly why it didn't do very well can be left in the comments section, because it has nothing to do with this post. What *does* have something to do with this post is the Myst mythos. Mystos?  
  
In the fiction of Myst, putting it simply, worlds can be created by writing in special books. Then you can travel to those worlds.  
  
Obviously, the implementation of this within the Myst fiction leaves a lot to be desired: it's not an easy concept to get close to. Not simply in terms of giving the power to the player, but even in terms of giving it to writers. For example, writers decided this language has numbers in it. I can not imagine any possible use numbers would have in defining a world.  
  
*Progressions* of numbers, sure. You want a symbol for the Fibonacci sequence, that I could understand. You want a symbol for "3"? *Why?* The idea of "3" has no purpose in algorithmic world design. It's a flat symbol.  
  
If you didn't understand that, I... um, might be about to lose you completely.  
  
Anyway, one of my long-time interests is the creation of worlds (... obviously?), so the idea of this language has always stuck with me.  
  
Algorithmically designing things is right up there for efficiency. It's obviously more efficient to be able to specify that this next level is a close-combat mission containing lots of shotgun soldiers, and then have the level design itself. You could make a thousand missions a day.  
  
In practice, this works out not so great. In practice, it's dangerously close to a "hard AI" algorithm.  
  
This system has to design a level understanding the parameters of the player and the player's avatar, and make sure to make the level interesting, challenging (but not too hard), paced for humans... and, oh, put in fun microquests and plot elements. Moreover, the design of this level will therefore effect the design of the next levels, because the player and avatar will have slightly different parameters upon leaving the level...  
  
Then, of course, understanding where the level stands in the global game is also important, and basically requires you to solve the whole problem again from the opposite direction.  
  
Creating an algorithm that designs a level is not really feasible.  
  
Which is why the language in Myst fascinates me - as a concept, not as an implementation.  
  
See, when you write in the book, the book doesn't say "this would be interesting, that would be interesting, let's think about it like this." The book says, "physics have been defined as such, materials as such, culture as such... processing..."  
  
This leaves the hard-AI problem on the shoulders of the writer.  
  
But, obviously, the writer couldn't simply write "make a world made of chocolate". The writer would have to write something that the simple underlying algorithm would interpret to mean a world made of chocolate.  
  
This is why the theoretical language would need to include concepts like "high altitude wind pattern", "electron shell progressions", "elemental makeup of the planet..." and it's why "3" is so useless.  
  
Obviously, this kind of language is a *ridiculous* idea. It's so complex, so interwoven at so many levels, it might actually be easier to create it using C++.  
  
But... then again, it might be possible.  
  
The fundamental problem is that of complexity. How many layers is the player dealing with at once? Can the player define new symbols that encapsulate packages of symbols? Can symbols interact with purpose  rather than blindly being executed?  
  
This would let "basic" players do things like write the word "elf" in their book. That word would actually be a complex piece of code that interacts with the algorithm that runs the world. It would try various things to make the world produce elves: any complexities such as lifespan management, genetic weirdities, magic, and so forth would happen behind the scenes.  
  
Obviously, a newbie couldn't design  the world "elf". Such a word would probably be more difficult to create than an entire planet from scratch. (Unless it takes the easy way out by opening a portal to a world full of elves...)  
  
So... the design... would need to be encapsulated. There would have to be tools to help you.  
  
Tools to help you design words that design worlds.  
  
Now, here's the thing: not everyone would benefit from the same suite of tools. Someone who wants to design words that proliferate specific items or ideas would need a radically different set of tools than someone who is experimenting with how different universal constants affect things.  
  
So you could have very different suites.  
  
Imagine this as a MMORPG. Instead of choosing a race or a class or whatever, you choose what tool the character can use...  
  
...  
  
Unrelated problem you may have picked up on: the idea of simulating a universe from beginning to now sounds a little... computationally expensive, don't you think?  
  
Well, I've been thinking about that. What you do is build a language that is specifically geared towards abstracting cleanly. When someone writes down symbols that change the way the universe formed, the system doesn't sit there and extrapolate every atom. It knows how the words act abstractly, and can therefore rapidly extrapolate any given piece of the universe at any given time.  
  
Progressions would be critical to this: you don't want a world that's the same everywhere. If you include progressions, the abstraction algorithm can look at "where" in the progression it "is" and create something meaningful. Sort of like a smart random number generator.  
  
Hrm...  
  
Just random thoughts. What I'm interested in is a system that allows the players to design languages for designing systems. Basically, because player-generated content is crippled by the assumptions your system makes, why not let the players generate a wide variety of them  as well?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [1:16 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5956089026619789010 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5956089026619789010&from=pencil "Edit Post")


#### 32 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09230578036395991204)

[clem](https://www.blogger.com/profile/09230578036395991204) said...

A couple of thoughts on why numbers would prove handy in the Myst creation language:  
  
First, certain objects for a given world just might be worth enumerating. Say, a world that has three moons.  
  
Second, even a progression can make use of constant numbers to define a rate of growth. So, for example, the number of rabbits at moment n+1 is defined by x\_(n+1) = x\_n \* 6.  
  
As an aside, it was never clear to me whether the language actually created the new world or worked as search criteria to find a world consistent with what was written. Given a infinite number of possible worlds, sketching out a rough concept and seeing what world it creates a portal to makes sense. I've never read any of the Myth novels, so maybe this is question was answered there.

[2:49 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204152540000#c4343027089098694323 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4343027089098694323 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09230578036395991204)

[clem](https://www.blogger.com/profile/09230578036395991204) said...

A follow-up on the final paragraph of my last post.  
  
Your world creation system is effectively a very large search space. Perhaps instead of giving players a creation language to create an elf from scratch, you give them a means of defining criteria of what elf-like qualities they'd like to see in a race.  
  
The engine then iterates through the possibilities of the rule set to offer the player possible matches with their concept. The player can can either refine their search based on what they see or accept one of the search results given to them.

[2:59 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204153140000#c2930069744050054353 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2930069744050054353 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Re: Constants.  
  
I feel those are incompatible with abstract design. Specifying that world has three moons? How does that derive from an underlying equation?  
  
On the other hand, the idea that the underlying equation would *solve* for a solution that fit your requirements might be a good one... still, I hate the idea of numbers. There's something deeply flawed about creating a universe with *numbers*.  
  
As to the Myst novels and so forth, of course they explain it. Too much, as always. Like Midichlorians, their explanation is worse than their mystery.

[3:26 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204154760000#c1676877752101463777 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1676877752101463777 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/13280914228859902589)

[Duncan M](https://www.blogger.com/profile/13280914228859902589) said...

An aside to the Mythos of the Myst universe:  
  
The language used in the Art was only related to the common tongue in that they had similar phonetic qualities. Those trained in the Art of Writing had to learn much about the words, grammar, and structure of the language itself. They then had to learn how the world itself worked, because Writing an Age was not just about describing something, but describing something that was possible, functional, and stable. There were a **lot** of rules, although sometimes these could be bent if done creatively enough to result in balance.  
  
Imagine a language where a word is not just a description of a thing, but is, in fact, the thing itself. You begin describing a landscape, but you not only have to describe what it looks like, but what it is made of, and how it fits with the surrounding ecology.  
  
You can also be as specific and detailed as you like. You can describe your Age down to the very colours and textures and smells. Or, sometimes, you can just write a sketch of what you want and get something close (although usually less stable - see Ghen's Ages).  
  
The role of numbers (as appearing in the games) may have no bearing on the way Ages were written. In fact, they may be a linguistic addition added later for communication and technological reasons. Or they may be a fundamental part of how an ages is written, as numbers can be a lot of things, and can significantly impact chemistry, physics, and culture.  
  
\-----  
  
Second aside: The Myst mythos left the creation/search debate rather open. Even in the novels, it is not ever conclusive how the Art works. In fact, it was a major point of religious and ethical contention within the D'ni society as to whether they were creating worlds (as gods) or were merely linking to ones that must exist within a finite realm of possibility.  
  
Both had arguments for. For example, it is possible to Write a complete, yet non-functional book (perhaps to a world that does not exist). On the other hand it is possible to delete words or phrases (or add them) to significantly change an already Written Age, creating perceptible effects in some areas without altering others.  
  
\-----  
  
Lastly: I know it's not offered on GameTap right now, but Uru had a significant single-player portion to the game. This was mostly overshadowed in the on-line version with all the public spaces, new content, and strange way of instancing Ages. If they release the stand-alone game, or if you can pick it up, I highly recommend playing it (and the expansions, *To D'Ni* and *Path of the Shell*). They have the same sense of home, and almost and eerie quality because the cavern is so very empty.

[11:34 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204184040000#c1690039511676416071 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1690039511676416071 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

"Creating an algorithm that designs a level is not really feasible."  
  
I confidently predict that there will be middle-ware in the next five years that will do exactly this.  
  
(In fact I wrote a [six part article](http://roguelikedeveloper.blogspot.com/2008/01/death-of-level-designer-procedural.html) on exactly this).  
  
(Long time reader, first time poster, btw. I really do enjoy this blog).

[11:47 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204184820000#c2706921565242512732 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2706921565242512732 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I posted a long response that evidently didn't take. :P  
  
Duncan: I got a very clear impression that the language tracked down a similar world and remade it. They even talk about natives having memories of "the time before".  
  
Saying "it was left open" is like saying "it was left open" as to whether Deckard was a replicant... but the "subtle hints" disprove the alternative, so it isn't left open at all.  
  
Andrew: I will try to read your essays when I have time, but here are my initial thoughts:  
  
It's certainly not impossible to create a level generation algorithm. Hell, I've done it. But the levels it creates have no value.  
  
Diablo's "random level generation" was actually simply recombining fairly sizeable level chunks, and it still had to revert to entirely prescripted levels when the plot demanded.  
  
Games such as Civ or Spore have random levels, but the levels are vague backdrops that essentially provide noise for the real game. They have very little value.  
  
Roguelikes often have random levels, and here you find the most likely outcome: no plot, no pacing, no values, very few unique or interesting things. Just meandering through a forest of whatever the designers tossed in. That's fine if your game is a spreadsheet game like many Roguelikes, but it does not serve games that want to provide a different experience.  
  
While it's possible that level generation algorithms will become common place, they will produce boring, disjointed levels that can be easily surpassed by any given twelve year old with a real level design tool.

[8:44 AM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204217040000#c4765101701937265645 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4765101701937265645 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

"While it's possible that level generation algorithms will become common place, they will produce boring, disjointed levels that can be easily surpassed by any given twelve year old with a real level design tool."  
  
Gotta disagree with you on this one. I think it's possible to have 'deep' levels that are randomly generated. Funnily enough, I've written a roguelike with a random dungeon generator that I feel goes part way towards this. And [an article](http://roguelikedeveloper.blogspot.com/2007/11/unangband-dungeon-generation-part-one.html) on it... if you want to add that to your reading list as well ;)

[1:19 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204233540000#c3293991811601441677 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3293991811601441677 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Okay, I've read it all.  
  
It sounds like you're thinking about many of my problems, and your work seems very good.  
  
But the core issue remains. Generated levels are either disjointed, boring, or (more commonly) both. A level generator has an extremely hard time creating a coherent, interesting adventure. While it can create a *tactically interesting* level, it cannot create an *emotionally interesting* level.  
  
Simply adding more clever ways to spawn generic terrains, enemies, and events won't serve. It still produces nothing a player will *care* about, unless he is only interested in statistical gameplay. IE, the level might make sense and be a fascinating set of tactical choices, but aside from sheer bloody-mindedness, why would my warrior keep exploring?  
  
To me, in order to be "complete" a level generation system has to offer a *permanent game state change* as a result of playing it. The power turns on. The girl you rescued follows you around. The village burns down.  
  
Even then, it would be very easy to make a level largely unrelated to the reward. I mean, you get to the end of the dungeon and (A) rescue the girl, (B) turn the power back on, or (C) find the super sword. There's no real connection between the level and the reward.  
  
So the level also has to be connected to the reward, which is connected to the game state...  
  
Anyhow, I didn't see a clear solution in any of your essays. What's your suggestion?

[2:05 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204236300000#c1233935057907661149 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1233935057907661149 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Oh, I don't count a new spear or spell as a significant game state change. Sure, it slightly changes your capabilities in terms of exploring the dungeon, but who cares? There's no emotional connection there.

[2:08 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204236480000#c8493097178488424537 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8493097178488424537 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

I can see this turning into a long conversation...  
  
"A level generator has an extremely hard time creating a coherent, interesting adventure. While it can create a tactically interesting level, it cannot create an emotionally interesting level."  
  
There's a lot of assumptions here that we're going to be talking about. I'd like to try to avoid degenerating this conversation into a matter of definitions. Unfortunately, I'm going to have to try to pin you down on what you mean by an emotionally interesting level.  
  
I suspect you're talking about 'narratively interesting', which is what I get from your subsequent comment that "Oh, I don't count a new spear or spell as a significant game state change."  
  
Because, a new spear or spell is a significant game state change. See e.g. Zelda: Windwaker etc, which structures all of the levels around this premise. Each dungeon has a reward approximately half way through which unlocks the dungeon when used correctly as well as being required for the final boss.  
  
And as discussed by many people elsewhere, I don't think games necessarily excel at narrative. So random generated levels isn't going to do well at narrative either.  
  
However, I think games do excel at 'atmosphere' which can be emotionally engaging. See e.g. S. T. A. L. K. E. R. which uses procedural A-Life to make a large component of the level design (monster placement and behaviour) support the overall feeling of 'dread' that the game creates. And atmosphere is something that I feel that random level generation can create.

[2:17 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204237020000#c4005709572767983907 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4005709572767983907 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Of course in a Zelda game a new spear or spell is significant. But in an RPG, they aren't.  
  
Basically, we're talking about the difference between a *statistical* reward (which Roguelikes and level generation is fine at) and *gameplay* rewards (which they can barely do at all). "I got another HP!" is a statistical reward, whereas "now I can double-jump" is a gameplay reward. "Now I can sextuple-jump instead of quintuple-jump" would be a statistical reward, because it introduces no new gameplay element.  
  
Clear?  
  
I would hesitate to say I'm talking about "narrative" anything, because the definition of "narrative" is not exactly clear. I am talking about narratives as in "yeah, the player is doing stuff that makes some kind of sense over time", but I'm not talking about narrative as in "now you must go defeat the ice demon to save the village of nal-Gorrgabath from Kiki the Demon Cat."  
  
The problem is that scripted plot events are, at least so far, deeply linked to gameplay rewards. Which means that in order to get gameplay rewards instead of statistical rewards, you need to break out the fragile, inefficient beast that is scripted events.  
  
I would love to break that cycle, but I haven't figured out any widely-applicable, computer-compatible way to do so. Certainly automated level generation is not the key.  
  
So, I look at your work, and I see something that is very clever for people who like spreadsheets. But I like princesses and exotic alien technology and journals in my levels, not just interesting tactical choices.  
  
So, in my eyes, there needs to be a significant breakthrough before level generators can be of any use *emotionally*. Before they can form coherent arcs through multiple levels, before they can contribute to the overall game experience.

[2:40 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204238400000#c8544039138658965291 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8544039138658965291 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I hope I'm not sounding harsh. I don't mean to.  
  
If I sound harsh, I blame today's Zero Punctuation marathon.

[2:42 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204238520000#c1519847979719667220 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1519847979719667220 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

"Of course in a Zelda game a new spear or spell is significant. But in an RPG, they aren't.  
  
Basically, we're talking about the difference between a statistical reward (which Roguelikes and level generation is fine at) and gameplay rewards (which they can barely do at all)."  
  
Got to disagree with you on this one.  
  
Roguelikes make statistical rewards as important as game play rewards. The canonical example is the failure rate of a spell. The difference between 1% failure chance and 0% failure chance is not statistically significant in the sense you pose, it is game play significant.  
  
The reason this is game-play significant is because of perma-death. Every turn you have to make the decision that is not going to kill your character. And that 1% failure means you can't rely on that particular spell to escape the current situation, because you'll be put in that position enough times for it to matter.  
  
Any number of seemingly insignificant changes like this become much more important in the overall scheme of things with permadeath. Didn't pick up that extra ration and now starving to death. Didn't cast detect traps here because you ran out of mana etc.  
  
As for replacing scripted plot events with procedural generated content, see part six of the article, where I suggest how this is possible by running a behind the scenes metagame which generates the overall plot.

[2:52 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204239120000#c8574766819958637263 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8574766819958637263 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

(And in your hp example: A key 'threshold' for how deep you can explore in games like Angband is whether or not you can survive a single breath or turn of attacks from a monster at that depth. Funnily enough, this threshold happens to be the number of hp you have. So every hp game advances you in this respect).

[2:56 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204239360000#c7581264467459374270 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7581264467459374270 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

BTW: "I would hesitate to say I'm talking about "narrative" anything, because the definition of "narrative" is not exactly clear."  
  
Narrative is more clear in a gaming context to me than 'emotion'. What emotions do games engage? What should they engage?  
  
As far as I can tell, games only peripherally engage things like 'aesthetic experience'. The jury is still out, but there's a great article to read about the [emotions of play](http://onlyagame.typepad.com/only_a_game/2007/12/emotions-of-pla.html), which starts to point towards what feelings are central to game play.  
  
IMO the emotions that best describe the gaming experience are 'flow' and '[yomi](http://www.sirlin.net/Features/feature_Yomi.htm)'. Roughly speaking flow is knowing what to do next, and yomi is knowing what your opponent is going to do next and how to respond to that.

[3:05 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204239900000#c8114680486918832111 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8114680486918832111 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

You should play Passage, a good (if soon to be overly referred to) example of emotions in games.  
  
(Also a good example of automated level design.)

[4:47 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204246020000#c5967577834086650347 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5967577834086650347 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It seems you're approaching games from a *very* hardcore rules-centric viewpoint, so this might be doomed to disagreement, but let me see...  
  
Regardless of whether you agree with the categories (and I don't, they're just examples), you have to agree that there are rewards that change the way you play the game and there are rewards that just change the resource ratios.  
  
I don't agree that these two rewards have the same intrinsic value. Largely, I don't agree because I find playing Angband to be about as interesting as playing Frogger and significantly less interesting than Street Fighter. There is obviously SOME difference, because I can feel it.  
  
It's not graphics: I didn't like Diablo much. It's not that I dislike open worlds: I liked Oblivion even though I never played the plot.  
  
To me, it's clearly that these tactical choices, no matter how complex and carefully balanced, simply do not have any kind of emotional grip on me.  
  
I don't really care what the definition of "emotional" is, that's besides the point. I play the game, I have an experience. The experience is boring if there is not some kind of meaningful progress to be made. And I don't consider "LEVEL 13! WOOOOO!" to be meaningful progress.  
  
That progress doesn't have to be a plot (although plot is very effective). I find joy in Civilization, in the Battlebots game, even in simple 2D fighting games - anything that gives me the opportunity to move in what seems to be a meaningful direction.  
  
The chance to spelunk further and kill -joy!- orcs instead of slimes... well, that just doesn't matter to me at all. Saying that most games are that way is a massive simplification that chops away a huge part of the player experience.  
  
And the experience is what matters, NOT the rules.  
  
I don't care what it's called, or what pigeonhole grammar we scramble to contain it with. I just want to attain it, and it cannot be done with level generators unless a breakthrough is made.  
  
Now, you make claims that you could create plot elements systematically. The answer is: no.  
  
No, you can't.  
  
No, it sounds plausible, but you can't.  
  
Try it.  
  
I'm not saying this out of simple bastardry. I'm saying this out of long years of trying, coupled with watching dozens of other people's long years of trying.  
  
It is possible - barely - to create a system that does create coherent plots that are even unique. But they are so dull, so pointless, so lacking in sparkle...  
  
The thing that makes plots interesting is their incorporation of non-gameplay elements. Things like love affairs, cultural mores, petty jealousies, and scientists eager to study ancient cultures.  
  
Although you can put these things into a giant tumbler and have the engine spit them out, they come out stripped of all their baggage. They come out like pebbles, occasionally pretty, never interesting. The baggage is what makes them interesting in the first place: the human decision to make a plot about something, about someone in particular, revolving around a theme, or whatever other undefinable artistry the human imbues.  
  
If you can do better, then *do it*. You will be rich and famous in no time flat.

[4:53 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204246380000#c883890295279388036 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/883890295279388036 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

"Regardless of whether you agree with the categories (and I don't, they're just examples), you have to agree that there are rewards that change the way you play the game and there are rewards that just change the resource ratios."  
  
Agreed.  
  
It boils down to that we disagree on the ability of randomly generated levels to deliver rewards that change the way you play the game.  
  
As I said originally, we're only at the start of the procedural content generation revolution. But it's going to be here - within the next five years. I stand by my original prediction.

[5:00 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204246800000#c1198604856160942624 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1198604856160942624 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Aww, it was just getting good.  
  
I don't doubt procedural content's future. I work on it myself. I just don't think it will be able to provide the level of quality you seem to be expecting.  
  
A tool only gives back what you put into it. So a tool helps with quantity... but not diversity.

[5:03 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204246980000#c2291753657183861065 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2291753657183861065 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

(Just changed one word to clarify)  
  
I was worried you were in flame on mode.  
  
You still haven't address the 'emotion in games issue' which is what I was querying you about. Forgetting to talk about it is a nice dodge, but not acceptable long term (Unless you want me blogging 'Ascii Dreams 1 ProjectPerko 0' type posts).  
  
"I don't doubt procedural content's future. I work on it myself. I just don't think it will be able to provide the level of quality you seem to be expecting."  
  
I've spent approximately 10 years working on and off on Unangband's dungeon generation, and it's just starting to get in a position where I'm happy with results that it delivers. And it was a surprise to me how it came together (after lots of trying).  
  
Unangband doesn't address the 'ensuring the game rewards occur appropriately'. But it does about well IMO on the 'in-game atmosphere' and 'deep connections' side of things.

[5:35 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204248900000#c1723559581213849600 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1723559581213849600 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I thought I did address it.  
  
The answer is: I don't really care about emotion in games. I care about the player experience. Which should probably have some emotions in it, I guess.  
  
We could argue over the semantics of emotion and try to define A as an emotion and B as not an emotion... but there's really very little point to it. I just mean that a player should have a rich experience, and that means an experience which has some depth to it. (Well, not in all games, but SOME at least, yeah?)  
  
What emotions a designer wants to aim for - or even whether he thinks in these terms - simply does not matter to me.  
  
...  
  
I can't review your progress on Unangband (not having played it), although it looks promising. I just... I see a hell of a lot more horizon in every direction.  
  
As for flame mode, I think you're safely above the minimum height. I would be very surprised if you ever say anything dumb enough to make me really angry.

[6:10 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204251000000#c2308064494396503818 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2308064494396503818 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

"We could argue over the semantics of emotion and try to define A as an emotion and B as not an emotion... but there's really very little point to it. I just mean that a player should have a rich experience, and that means an experience which has some depth to it. (Well, not in all games, but SOME at least, yeah?)"  
  
shovel vs. spade. What do you mean then by rich player experience, and how do random levels not deliver it?  
  
Are you talking about 'player experience' in the Jonathan Blow sense? Or something else?  
  
Or are you defining partly as 'something which is not randomly generated' in which case we're not going to get far.

[6:21 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204251660000#c8364264512571280589 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8364264512571280589 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Usually, I define it as "fascinating". I usually aim to provide a *fascinating* experience.  
  
But what any given player finds fascinating varies hugely. You like Roguelikes. I used to, but these days I don't. These days I seem to like games with plots.  
  
It's not simply that I like the NON-game elements. Partly because the idea that there is a part of the game that is somehow not part of the game is a bit odd, and partly because I get the same entertainment value out of things that are definitely core parts of gameplay. Usually whenever I'm allowed to build content.  
  
Anyway, the point is that my experience is fundamentally different than yours, and therefore "deep" means something fundamentally different (or, at least, pointed in a different direction).  
  
So how would you *like* me to define it?  
  
If you want to know more, you can read these: [fundamental nature of games](http://projectperko.blogspot.com/2008/02/imagery.html) , [problems with procedural content](http://projectperko.blogspot.com/2008/02/giant-worlds-boring-worlds.html) , [argument for humans](http://projectperko.blogspot.com/2008/02/dungeons-drags.html) , and [more on "player experiences"](http://projectperko.blogspot.com/2008/02/protect-and-guide.html).

[6:37 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204252620000#c159211023678581882 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/159211023678581882 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Erm, unless you're asking me to define what a "player experience" is, in which case:  
  
A player experience is what the player, subjectively, experiences. It is not the course of the game, but the experience in the head of the player.

[6:41 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204252860000#c5921815381831720248 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5921815381831720248 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/11099404183952971291)

[Andrew Doull](https://www.blogger.com/profile/11099404183952971291) said...

Ah. Now I see. Your definition is such that I can't hit it and/or answer it without having to read lots more...  
  
That's my trick.  
  
I'll put together a response - I suspect it'll be a blog entry this weekend though.

[6:50 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204253400000#c3878767813547264537 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3878767813547264537 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I tried to avoid it, but you kept pushing. :D  
  
Not all apply directly to the subject at hand, but the question kind of targets a fundamental concern.  
  
It's a complicated subject, and I've been thinking about it a long time. You'll notice the time stamps on those are all very recent, but I've got dozens more of various ages...  
  
I won't ask you to read them.

[7:10 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204254600000#c3826255315233266806 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3826255315233266806 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/05325140104622317511)

[Mark Hughes](https://www.blogger.com/profile/05325140104622317511) said...

*Craig Perko: "On the other hand, the idea that the underlying equation would solve for a solution that fit your requirements might be a good one... still, I hate the idea of numbers. There's something deeply flawed about creating a universe with numbers."  

*  
  
You must really hate reality and physics, then. The real universe is either described perfectly by or actually CREATED by mathematical formulae; depending on how literally you take string theory.  
  
The existence of words, of non-numerical approximate descriptions that your words vaguely suggest that you prefer, these are airy fantasies created by combinations of neural weightings (which can be described purely mathematically) in your organic brain, nothing more. Most of your words are nothing but expressions of emotion, which are just chemical imbalances in the brain.  
  
Chemistry and biology, too, are best defined by numbers. Consider DNA, which is nothing but a long program consisting of base-4 numbers.  
  
As for a computer-simulated universe, there is nothing but 0 and 1, over and over again. We only perceive something more than that because we see it through filter after filter, but the truth is that it is really just numbers.  
  
The fundamental flaw in the Myst book concept is that description alone, without algorithm and mathematics, would be sufficient to define a universe. They, and you, and anyone else interested in creating worlds, would be better off starting with Euclid than Plato.

[11:55 AM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204314900000#c1702665233812728727 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1702665233812728727 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Geeze, Mark, read the post.  
  
I CLEARLY state that progressions, functions, and formula are fine. Damn.  
  
I just don't think that saying "3 of something" is a permissible way to define a world. It doesn't abstract at all.  
  
The "words" I'm suggesting are particular applications of particular formulas in particular scopes.  
  
... Why am I explaining this? You didn't read it, you just decided I was saying the same thing as some other idiot you read somewhere.

[1:08 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204319280000#c6254766285165531713 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6254766285165531713 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/05325140104622317511)

[Mark Hughes](https://www.blogger.com/profile/05325140104622317511) said...

*Craig Perko: "I just don't think that saying "3 of something" is a permissible way to define a world. It doesn't abstract at all."*  
  
I did read your article, and the replies. While you mention progressions, progressions are based on numbers. You cannot define the fibonacci sequence without stating 1, 1, at a minimum, because those are the seed values for the function.  
  
You cannot define a circle without using pi. Even the formula for pi is a series of fixed numbers from a starting point.  
  
There are 4 (or perhaps 8) cardinal directions on a roguelike grid. That's a fact, and a hard, fixed number. The universe you define has a fixed size; this is a difficult thing to work around in a computer-represented world, and produces the pleasing result of keeping the user walled into the interesting area without using all memory and disk space.  
  
And over and over, you refer to how things like generated quests "feel", to the impossibility of creating those "feelings" by math. Well, casinos and gamblers have producing those feelings, altering the chemical imbalances of the brains of players by changing mathematical odds, for millennia. It isn't rocket science, it's just basic game design. Read any book on gambling addiction, and reverse-engineer the tools the casinos use.  
  
Your expectation, to the extent I can extract from your words, is that a generator is not of any use unless it generates every possible space, every possible storyline, at least as well as Shakespeare. But that's not what anyone else needs or expects out of a generator; something roughly in the right space, with perhaps 3 moons (didn't Ultima have white, black, and red moons?) and dungeons made in 80x24 grids, is more than good enough to make a very fun game.  
  
People have been playing and enjoying roguelikes for 30 years. I've been making roguelike/generated-world games for over 20 years, and people have enjoyed them enough to pay me money for several of them. All of these are made with generators that have fixed initial values; "There are 5 towns and 10 dungeons in this world, because the world size is such that this gives me a fair distance between town and dungeon", for example.  
  
I read and understood you just fine, I just think you're absolutely wrong. Claiming that a technique cannot produce a fun world when it has, in fact, been successfully used to produce fun worlds, is nonsense.

[4:00 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204329600000#c4374339549935867029 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4374339549935867029 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Boy, I'm going to skip the numbers stuff because your gross misunderstanding of my position doesn't matter, but as to the rest of your comment:  
  
I believe the EXACT OPPOSITE of everything you posted.  
  
Obviously, your definition of "read and understood" is a bit unusual.  
  
All I'm saying is that the day you mathemagically create dialog and an emotionally involving plot, I'll believe your "you can generate ANYTHING" rhetoric. I've heard it literally hundreds of times, and nobody has ever even gotten close.  
  
You've created content algorithmically as well, you can't be so deluded as to think it would be easy.  
  
As much as you like your Roguelikes, their levels are NOT as good as levels designed by humans. What they have going for them is volume.  
  
Volume isn't to be discounted. Volume is often exactly what you need, and if you're playing a spreadsheet game, it's perfect.  
  
Volume is NOT WHAT I WANT. Spreadsheets are NOT WHAT I WANT. Casinos are NOT WHAT I WANT.  
  
So, hey, stop thinking so close to your vantage point. Your assumptions are really painful.

[5:09 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204333740000#c8322958744200270260 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8322958744200270260 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/14185464573529387638)

[Brog](https://www.blogger.com/profile/14185464573529387638) said...

mark hughes: You cannot define a circle without using pi.  
  
Uh.. how about "the set of points in the plane at distance R from a given point"?  
Pi would not be nearly so important a number if the definition of circles had to include it. The fact that it emerges inevitably from the above definition is what makes it interesting.  
  
However, I too disagree with Craig's claim that "3" has no purpose in algorithmic world design. Sure, the fact that Earth-B has three moons emerges naturally from the laws of motion and gravity, the fact that a proton has three quarks emerges naturally from the basic properties of quarks, but when you're creating a world for a purpose it would be nicer to just specify three moons, three quarks, and let the magic sort out the details. It depends whether you're more interested in playing around with the fundamental laws or in creating something for a reason.  
I'd call these options something like "procedural design" - make up some basic rules and see what comes from them - and "narrative design" - make up the details to suit the overall vision, maybe filling in the irrelevant details procedurally.  
  
What I don't understand about Craig's position is that he first seems to be advocating "procedural design", but then comes down against roguelikes, which seem to me to be canonical examples.  
What a roguelike offers to explore is the space of the game rules; these are the "content". Sure, the levels are oftennot very interesting, but they are not content. In most other games the "content" is the story or the levels, and the rules are (or should be) determined by that.

[12:11 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204661460000#c6511790310711354697 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6511790310711354697 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I am very for procedural content, and I am even for Roguelikes (I don't find they have nearly as high a replay value as people think, but I'm not against them).  
  
It's just that I think that procedural content should be useful as a tool for the *user* , not simply the *developer*.  
  
As for numbers: you have my thinking down perfectly. I was thinking about a very hardcore generation system that doesn't let you do any "top-down" designing.  
  
There are serious problems with top-down designing that I haven't figured out how to solve, yet... the "magic" part.

[12:29 PM](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html?showComment=1204662540000#c3669558038969831816 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3669558038969831816 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5956089026619789010)

[Newer Post](https://projectperko.blogspot.com/2008/02/tailors-paradox.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/02/home-home-on-lagrange.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5956089026619789010/comments/default)
