---
title: "Boolean Choices"
date: 2007-04-09
url: https://projectperko.blogspot.com/2007/04/boolean-choices.html
labels:
  - game theory
  - story
  - verb thinking
---

## Monday, April 09, 2007 


### Boolean Choices

Last post I mentioned that boolean choices are bad. I also mentioned that all the drama engines I'd seen were doomed - they all use boolean choices. Patrick came around and said, "hey, they all use floats and stuff!"  
  
The *choices* are boolean.  
  
The most obvious example would be in a game like Knights of the Old Republic, where your choices are universally "do good", "be a spaz", and "walk away". These are not choices which give you any kind of expressive freedom.  
  
More complex systems are growing more common. Patrick's full of examples: Storytron and Facade are two big ones. "They use floats!"  
  
They represent an internal state with floats. But the *choices the player can make* are, in fact, brutally binary. This is a result of that *plague* on recent drama thinking: "verb thinking". Verb thinking is better than "noun thinking". Of course, getting stabbed in the shoulder is better than being shot in the face, too. It's like the difference between having the flu and having rabies. It was a good idea when it came out, but it's a dead end: it doesn't go anywhere. Now it just wastes time.  
  
"Punch" is a verb. You punch someone and, like magic, the game runs a quick simulation. Relationship - 40 and anger + 10 or some such. It's boolean: a punch either happens, or it doesn't. "Punch" is either true or false.  
  
Yah, have any of you ever *been* in a fight? There's about a million different kinds of punch, and they carry different meanings. If I punch you as hard as I can in the face, that means I'm so angry I'm willing to break my knuckles so long as you suffer. If I stick to body blows, it means I'm not willing to let this degenerate. If I throw some elbows or knees in, it means something else, and so on and so forth.  
  
*Every verb is like this* . Kiss. Touch. Yell. Barter. Blackmail. Give gift. Play parcheesi. Dance in the rain. They are not true or false. It is not a question of whether you dance in the rain, but rather *how* you dance in the rain.  
  
Crawford would have you use modifiers on your verbs in order to give them some kind of spin. "Punch very hard" or "punch calmly" or some such crap. Booleans stacked on booleans. Relationship - 10 \* modifier. Useless. Bandaids on gunshot wounds.  
  
Games are intricate beasts because they allow you to determine *exactly* how, between thousands of nearly identical choices, you want to play. In a manner so fluid you don't even realize you're doing it. These are *skill challenges*.  
  
In an FPS: strafe left? Strafe right? Go straight for the health? Jump for the high ground? Here or a foot to the left? Can you dodge the rocket? Nothing's preventing you except your own lack of skill.  
  
An RPG is shiftier, because an RPG really *does* boil down to hundreds of booleans: buy a sword or armor? Equip your healer or your mage? Go back to town to rest, or push on? Get that fireball spell when you level up, or that damage bonus? But these stack - a hundred boolean decisions stacked and all simultaneously in play, all the time.  
  
Who is equipped with what. Who is at what levels. Whose stats are what. Whose condition is what. There are three or four viable strategies for each person every round, for a total of maybe a dozen viable options, all affected by the hundreds of choices you've made so far - and that's round to round. Outside of combat, there are hundreds of possible options for combat-affecting decisions. And, of course, you have to balance offense, defense, magic, healing, items, pathfinding through dungeons, lock-picking, whatever else is in the game: it's not just all frontal assault. Your equipment, stats, and other choices "communicate" on many axes, many levels.  
  
And me? I still think the standard RPG has a pretty weak gameplay model. The choices are too transparently clumsy - hey look, a sword of kill shit + 5! That nobody bothers to export to the other town that only has pointy sticks! Like that's not made to layer on top of the hundreds of other long-term boolean choices I've made.  
  
A drama engine? Bah-ha-ha! You get your choice between maybe two  viable strategies any given round, and you have maybe three or four things that affect the outcome, tops.  
  
Booleans. If we're talking in terms of bits, a drama engine's "complexity" isn't even one byte. An RPG? Maybe 32-bit? Depending on the RPG? A game like Quake or Valkyrie Profile or Final Fantasy Tactics, where timing, exact position, and complex recombination matter? Maybe 128-bit.  
  
So, yeah, drama engines. Not enough expressive power using the methods they are using.  
  
Forget your decision trees! Your choices communicate on more than one axis, so your choices should be able to move freely on those axes! Throw down the shackles of "verb thinking" and think with "sliding axis" thinking! Don't "dance"! Waltz! Shimmy! Do the twist! The robot! The hand jive! The tango. It takes more than two to tango, ha!

Posted by [Craig Perko](https://draft.blogger.com/profile/13173752470581218239 "author profile")  at  [8:09 PM](https://projectperko.blogspot.com/2007/04/boolean-choices.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://draft.blogger.com/email-post/11758224/6648059894095473015 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://draft.blogger.com/post-edit.g?blogID=11758224&postID=6648059894095473015&from=pencil "Edit Post")

Labels: [game theory](https://projectperko.blogspot.com/search/label/game%20theory) , [story](https://projectperko.blogspot.com/search/label/story) , [verb thinking](https://projectperko.blogspot.com/search/label/verb%20thinking)


#### 7 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://draft.blogger.com/profile/13614962832390315553)

[Patrick](https://draft.blogger.com/profile/13614962832390315553) said...

Liking the metaphors in this one. You're writing style is like a kettle cooked salt and vinegar chip, a flavor I happen to be able to appreciate.  
  
Here's the thing about Storytron and Facade; Storytron is Boolean on the local level (low agency therefore) but this adds up to a lot of global agency because there's so many goddamned booleans, hundreds of verbs, associated modifiers and so on. Maybe thats like a body cast instead of a band-aid, and modulating the global agency is diffucult so casual play is more remote. But I think you get at least the complexty of an RPG, at least.  
  
Facade is the inverse, you have like thirty verbs that can be adverb modulated affecting global variables plus the beat steering (which is a weighted probablistic curve) and that adds up to a few distinct global outcomes, but the local agency is pretty damn rich.  
  
Would it be better to have a balance? Yeah, of course, thats what the second generation is for (or really clever first gen engines), but I still think your opinion is based on a combination of ignorance and arrogance.  
  
Sorry pal, I've got you out-researched in this dept, at least in regards to Stron and Facade.

[12:17 AM](https://projectperko.blogspot.com/2007/04/boolean-choices.html?showComment=1176189420000#c6864484789858038498 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://draft.blogger.com/comment/delete/11758224/6864484789858038498 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://draft.blogger.com/profile/13173752470581218239)

[Craig Perko](https://draft.blogger.com/profile/13173752470581218239) said...

I am arrogant, but not ignorant. Have you ever *played* a game of Facade? A game in Storytron? Presumably, yes. Did you time yourself?  
  
The *whole game* takes less than an hour. Oh, so it's replayable?  
  
The only reason Facade is "replayable" is because it is a goddamn *puzzle game*, not because it is a social game. It appears to be a social game at first, but the thing devolves into a "how to get them to stay together" puzzle, or a "how to get her to elope with me" puzzle. You're just looking for different endings.  
  
Storytron allows you to make choices, but these choices are not "stacking" in the way you presume. Gah! Like there could even be any meaningful stacking in an hour-long game? Not only is the stacking insignificant, but there's no interpolation, no interweaving, except on the most primitive levels. There's no counterbalances, no varied approaches, no timing, no dwindling resources, no leveling... just three or four social hammers that you hit shit with. Sure, those hammers may change from encounter to encounter, but there are never more than two or three *realistically* available choices at any given time.  
  
If you write a really big world (painfully encoding every last character) then maybe - *maybe* - you could get the complexity of checkers as all your decisions stack up. But you couldn't match the complexity of Final Fantasy I.  
  
**This is why I've always pushed the need for a complex game world to support your social play. It's why I've always said it's easier to make social play subordinate to some other game which is complex enough to stand on its own.**

[6:34 AM](https://projectperko.blogspot.com/2007/04/boolean-choices.html?showComment=1176212040000#c3822254676796923772 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://draft.blogger.com/comment/delete/11758224/3822254676796923772 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://draft.blogger.com/profile/13173752470581218239)

[Craig Perko](https://draft.blogger.com/profile/13173752470581218239) said...

Ah, ah! Wait!  
  
To *you* , Storytron is a giant stack of layered choices. *Because you're programming it* . So your "game" is hundreds of hours long as you script and re-script your world. Storytron is a wonderful game for *writers* to play. But now look at what you're creating from the *player's* point of view.

[6:36 AM](https://projectperko.blogspot.com/2007/04/boolean-choices.html?showComment=1176212160000#c4571882151743814389 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://draft.blogger.com/comment/delete/11758224/4571882151743814389 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://draft.blogger.com/profile/13614962832390315553)

[Patrick](https://draft.blogger.com/profile/13614962832390315553) said...

I do agree with you that a complex game world is important, not only that but I think the most lucrative design space in the social play continent is, at this point, the "drama nested in game" sub-continent, both from an artistic perspective (much wetter at least) and commercially (integrate it into a queue-game/RPG and you've got that audience, integrate it into an action RPG and you've got that audience, ect.).  
  
I think your observation that my experience with SWAT skews my perception of complexity also has some weight. But to be fair, there isn't enough data for your hypothesis to really be tested either way... yet. Come October, we can come to a consensus.  
  
Theoretical physicsists would be betting a bottle of red wine at this point, but you don't drink, so how about this: if any one of the first Storytron storyworlds can be replayed at least ten times and have at least one demonstrably non-boolean dynamic represented across all ten play variations, then you ship me a $50 retail game, if Storytron is found lacking in this dept. (for instance, the variation can only be represented in boolean terms, rather than a character's float value have sublte turns that lead to non-trivial casual variations) then I'll ship you a game of the same value.

[10:21 AM](https://projectperko.blogspot.com/2007/04/boolean-choices.html?showComment=1176225660000#c1135344367160340792 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://draft.blogger.com/comment/delete/11758224/1135344367160340792 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://draft.blogger.com/profile/13173752470581218239)

[Craig Perko](https://draft.blogger.com/profile/13173752470581218239) said...

That's not exactly the terms I would use. How about this: we'll use a third party we both agree on. I suggest Darius, just because he's known to both of us. He plays their flagship game - whatever game you think has the best chance of being complex and immersive.  
  
If he says it has very complex, immersive results, I'll buy you a game. If he says it's basically a puzzle game with social play as a gimmick, you'll buy me a game.  
  
If he can't decide, we mock him a little and nobody buys anybody else any games.

[10:50 AM](https://projectperko.blogspot.com/2007/04/boolean-choices.html?showComment=1176227400000#c4839495688611946683 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://draft.blogger.com/comment/delete/11758224/4839495688611946683 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://draft.blogger.com/profile/13614962832390315553)

[Patrick](https://draft.blogger.com/profile/13614962832390315553) said...

I like it. In the spirit of independence, lets make it a $20 download game instead. We can make it two if you want comprable scale.

[7:34 PM](https://projectperko.blogspot.com/2007/04/boolean-choices.html?showComment=1176258840000#c7640218423572729651 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://draft.blogger.com/comment/delete/11758224/7640218423572729651 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://draft.blogger.com/profile/13173752470581218239)

[Craig Perko](https://draft.blogger.com/profile/13173752470581218239) said...

One is fine. There aren't two downloadable games I want that I haven't purchased yet. ;)

[7:59 PM](https://projectperko.blogspot.com/2007/04/boolean-choices.html?showComment=1176260340000#c7261637981853320678 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://draft.blogger.com/comment/delete/11758224/7261637981853320678 "Delete Comment")

[Post a Comment](https://draft.blogger.com/comment/fullpage/post/11758224/6648059894095473015)

[Newer Post](https://projectperko.blogspot.com/2007/04/nascar-convert.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/04/brick-walls.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6648059894095473015/comments/default)
