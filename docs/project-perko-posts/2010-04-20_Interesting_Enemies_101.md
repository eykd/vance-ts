---
title: "Interesting Enemies 101"
date: 2010-04-20
url: https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html
labels:
  - game design
---

## Tuesday, April 20, 2010 


### Interesting Enemies 101

The last couple of posts have made me realized that some of the knowledge I take for granted as "basic" really isn't. So this post is about the basics: what makes a game challenging, what makes enemies fun.  
  
When I design a game - typically a tabletop RPG or board game, but sometimes computer games - there are four kinds of challenges I generally consider.  
  
The first kind of challenge is the puzzle. This is when the scenario set up by the developer has a specific path to resolution. For example, a crate-pushing room. A fetch quest is technically a puzzle, but it's a crappy one.  
  
The second kind of challenge is the information challenge. An info challenge is different from a puzzle because there is no "boolean" solution: there are many paths you can take and the results will vary in different ways. There is typically very little randomness in this kind of challenge, aside from that required to define the scenario. A good example is Civilization city-building: where you put your cities and what you build in/around them is not affected by randomness, but it's not a single-solution puzzle, either.  
  
The third kind of challenge is the gamble. Gambles are typically simpler than information challenges and make up for it by having either randomness or real-time skill be a major component. This is the kind of challenge most enemies present: in an FPS, the accuracy and speed of the play is challenged, while in an RPG weighted dice rolls are substituted for real-time player skill. Same kind of challenge, either way.  
  
The last kind of challenge is a fulfillment challenge, where you allow the player to alter a scenario in ways not usually tied directly to game mechanics. For example, allowing someone to dress in whatever way they want, or to add knickknacks to their house.  
  
Of these four, the gamble is obviously where your enemies fit in easiest. The "standard five" model (eggshell, skirmisher, heavy, sniper, spawner) are built to challenge the general kinds of real-time skill a player can have.  
  
However, it's important not to get too caught up in such a simplistic view. The gamble challenge isn't entirely served by enemies. For example, in Guitar Hero, the gamble challenge is the stream of notes. You don't need enemies, because the stream of notes serves the exact same purpose.  
  
In other situations, the reverse happens, and enemies can (and should) bleed over into other challenge types. For example, a turtle in Super Mario Bros leaves behind a shell when you kill it. The shell is a tool used to turn gamble challenges (hopping on the goombas requires a fair amount of agility) to an information challenge (hitting the lot of them with a turtle shell normally doesn't require such agility).  
  
I think most of the memorable games actually have that kind of very muddy situation, where it's hard to say that something is A or B. The information and gambling challenges often cross over each other. For example, in Tetris, dropping the blocks is obviously real-time skill, but it requires advanced pattern recognition as well, which is an information challenge component. It straddles the two.  
  
Similarly, the strength of a tabletop RPG is that a puzzle challenge often converts over to an information challenge or gamble as the players go outside the expected conditions. The flexibility offered by an actual GM is one of the reasons that tabletop RPGs are still so popular despite their poor mechanical design and irritating interface.  
  
To go a little philosophical, when I'm designing a new game, I lock down some images in my head to use as a kind of vision to drive my design. I say "images" because English is not a very good language: they're not simply images, but processes, potentials, and emotions as well.  
  
Once I have a clear idea of the kind of thing I want to make, I try to come up with a core set of mechanics that will support all four kinds of challenges, or at least the latter three (not puzzles). As I'm doing this, I try to come up with specific situations where I can see the mechanics crossing: interesting play always happens where the mechanics collide. That's the "mixing" of challenge types I'm talking about, although you can also have collisions between different mechanics for the same kind of challenge.  
  
All of this has been a pretty roundabout way of reaching this final point, which is how to make interesting enemies.  
  
The way to make interesting enemies, as you may have guessed by reading about that mixing and colliding, is to make enemies that collide with other game mechanics. This is usually not done in AAA titles because it can make large games hopelessly complex and impossible to balance. But for indie games and mods, it's a must if you want to have interesting play.  
  
As an example, let's look at a side-scrolling action game such as the Contra series. At its core, the navigation on the screen is an information challenge, while the interaction with enemies is a gamble.  
  
If you're designing enemies for this kind of game, you'll probably start by simply considering the Fundamental Five. You create enemies that are eggshells, skirmishers, snipers, heavies, and spawners. But that's pretty dull. The best enemies collide the multiple kinds of challenges, the multiple kinds of mechanics. They create "boundary challenges", where the challenge is unusual because it interacts with multiple kinds of mechanics.  
  
To some extent, this is placement. By putting enemies at specific points in a level, you can make them interact with the level layout, turning navigation from an information challenge into a gamble. For example, a section where an enemy is firing across an upper platform, and the player is required to jump up between the bullets to get up there and hit him. Another common variant is the "roller" which rolls along the top of the platform, then along the bottom and back up to the top in an endless circle.  
  
On the opposite side of things are enemies that *are* platform navigation, such as a boss that has platforms on him, or a boss that requires you to jump to specific areas to dodge or hit him. It's normally only bosses that are built like this because it takes so long to actually play out the battle.  
  
There's no reason to stick with the oldschool. For example, we can create enemies that can be stood on as if they were platforms, so luring them to a specific point so you can jump off them is important (or using them to cross spikes). Other enemies might only pop up and attack if you're standing on specific areas in the level - wall turrets, for example.  
  
Still more options: enemies that destroy or create terrain, enemies that change the gravity in a region, enemies that deflect shots in unusual ways such that they might be able to hit a sniper if used correctly (or yourself, if used incorrectly).  
  
Also, you can implement new mechanics to give you another thing to butt up against. As an example, if our game features a lot of swinging (Bionic Commando, Batman, Spider-Man) we can introduce enemies that butt into that: enemies that leave grease spots you can't attach to, enemies that cut your cable, enemies that swing, enemies you can swing from, etc, etc. And, of course, don't forget the normal level navigation, which can butt up against the swinging system as well.  
  
There's no problem thinking of these kinds of fun enemies. I can think of them all day. The two problems related to these enemies are both easily manageable, if you keep them in mind.  
  
The first problem is programming. Unless you think ahead, you can find yourself having to write very complex special-case code for every enemy in your game. Make sure to think ahead.  
  
The second problem is complexity. It's easy to swamp a player with too many different kinds of boundary challenges, too quickly. Generally, I try to keep my players at one boundary condition per level. I go up to two if I feel that the boundary condition is suitably transparent. For example, I might use both the enemies-that-swing and the enemies-you-can-swing-from in the same level, because both of those are pretty straightforward. But combining enemies-that-are-platforms with enemies-that-generate-and-destroy-platforms would be sadistic, and only suitable for The Hard Boss.  
  
This is basically an unwavering rule. If you revisit a particular boundary challenge in a later level, you want to make sure to get rid of one of the boundary challenges you *were* using. The human brain can only comprehend so much simultaneously. Later, if your boundary conditions become a genre, you can start to assume the player is completely familiar with them... but until then, make sure not to swamp the player with too many boundary conditions at the same time, even if they theoretically "learned" them earlier in the game.  
  
To me, these are the basics of enemy design.  
  
Enemies aren't the only thing in the game, however, and remember that those other mechanics aren't just fluff. They allow the player to do something, and that's critical. Level design, how the player moves, what the avatar's actions are, power progressions, etc, etc. All of that has to be considered as well.  
  
But just covering enemy design is plenty for one essay.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:04 AM](https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5553084361242680514 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5553084361242680514&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### 7 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/03146360375570794401)

[Ian Schreiber](https://www.blogger.com/profile/03146360375570794401) said...

Interesting post. I normally play in different spaces (TCGs, Sims) where enemy design isn't relevant, so I haven't really thought about this in depth, and it's good to see someone that has.  
  
I would argue that "twitch"-based skill challenges and random-based die rolls are distinct. They are certainly highly related, but there is one key difference: with reflexes, a player gets better at handling them over time and can improve their performance as their reaction time and understanding of the mechanics increases, and this can continue pretty much without limit (see some of the absolute insanity at the pro levels of Street Fighting games). With random dice, the player can improve to a point as they more fully understand the nature and boundaries of randomness... but there is a cap. A bare-bones Contra guy with no special weapons can make it through all 8 levels in the hands of an expert player; a Level 1 Fighter will simply not defeat an Ancient Red Dragon in Final Fantasy no matter how skilled the player is.  
  
Also, if this is meant to be a true beginner article, I'd recommend actually defining eggshells, skirmishers, snipers, heavies, and spawners. The names are mostly self-explanatory to me, but they might not be to everyone.

[12:48 PM](https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html?showComment=1271792923090#c7872641720248180365 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7872641720248180365 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

See, I originally thought the same, that time-based skill and randomness were distinct. However, after a lot of thought, I don't think they are. They both give the player the same kind of "well, try again for a new result!" feel, and the challenges you actually give out in each are quite similar. For example, a skirmisher in a turn-based RPG has the same fundamental "feel" as a skirmisher in an FPS because they offer the same "kind" of challenge despite one being luck and one being skill.  
  
It can certainly be argued either way, and I'm not particularly adamant about it.  
  
I kind of skipped over defining the five basic enemy types because I think it would make its own essay. I'm not sure it's easy to define them well in one paragraph. I tried a few times, but I kept having to delete the paragraph because it kept turning into three paragraphs, four, five...  
  
This is largely because of the need to explain the outliers, such as a skirmisher in a turn-based RPG. It takes quite a few words to describe how "relative spatial maneuvering" can be effectively simulated using a few stats plus dice rolls, and the player will equate the two in terms of the feel of the encounter.  
  
I skipped it doubly because I wanted to make it clear that the "fundamental five" enemies aren't actually the primary thing to concern yourself with.  
  
Maybe I should make another post...

[1:27 PM](https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html?showComment=1271795235441#c6804495186197803227 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6804495186197803227 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgV0GDkqo1 Spre3kVrDWY1m0 Vu1WKWZBlRvP2VXzBQKLWcjtIYRS-RnSn9HBOlnCQmgCnAi9 ZwUsu-3y765sGe9n\_d-D5 OzhmDtP3UONl3rUjbWNKe25 SxVKrwaeedsnA/s45-c/Me.gif)](https://www.blogger.com/profile/00811255096467614445)

[Mory](https://www.blogger.com/profile/00811255096467614445) said...

*They both give the player the same kind of "well, try again for a new result!" feel*  
  
..as do many puzzles with just one correct solution. It makes me cringe a little bit just to stick all kinds of skill-based challenges into one category, but I definitely can't accept lumping them together with randomness. The experiences are too distinct.

[2:05 PM](https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html?showComment=1271797503183#c4004747488328659951 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4004747488328659951 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I disagree, but it's a relatively minor point. The main reason I lump them together is because the five enemy types specifically serve both luck and skill based challenges in the same way.

[2:12 PM](https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html?showComment=1271797967558#c1555239843474983488 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1555239843474983488 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQGVSPmlXYBXDVsU9gDHvY7gClGEm13CSiUOrvj1yfrx9\_Jj8C45-fhxyb65KGHKGVk9aCNYBXzy9zVtTkuSz42WIY7uJSV8HS5 WhTOUSUlFImSDkvk9nvSzTxK6ihHA/s45-c/grenss.jpg)](https://www.blogger.com/profile/07006701742406299244)

[envelope](https://www.blogger.com/profile/07006701742406299244) said...

are information challenges always about placement of resources?

[10:07 PM](https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html?showComment=1271912852499#c2697456875964603846 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2697456875964603846 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I suppose it depends on what you mean by "resources". Are enemies resources? How about physics toys such as in The Incredible Machine?  
  
How about the hollow areas you carve out in Dwarf Fortress to make your living space? Or the traps you lay down?  
  
I don't think about it in terms of resources or placement, largely because they're kind of fuzzy terms.

[7:11 AM](https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html?showComment=1271945501091#c4649067994199459306 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4649067994199459306 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

(I jumped on "resources" in that phrase, but "placing" is just as iffy. Is tilting the map considered "placement"?)

[7:12 AM](https://projectperko.blogspot.com/2010/04/interesting-enemies-101.html?showComment=1271945566721#c3206816494468013105 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3206816494468013105 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5553084361242680514)

[Newer Post](https://projectperko.blogspot.com/2010/04/gambling-and-colored-spinny-things.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2010/04/base-building.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5553084361242680514/comments/default)
