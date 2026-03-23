---
title: "Brick Walls"
date: 2007-04-09
url: https://projectperko.blogspot.com/2007/04/brick-walls.html
labels:
  - game design
  - generative
---

## Monday, April 09, 2007 


### Brick Walls

Imagine a system that generates content. Whether we're talking new weapons, new relationships, new dungeons, or new plots.  
  
There is a problem with all these systems so far. That problem is that algorithmic content appears "shallow". How many varieties of goblin can you face before you get bored? How many times will a slightly higher attack bonus on a different color sword make you cheer? Although there are not really any generally available  plot generators (because they suck too much to distribute), the problem is the same: how many times can you get someone to like you before it just gets boring?  
  
Some games go "around" this situation, like the Diablo series. While everything is randomly created, it doesn't really get nearly as boring nearly as quickly. This is because everything is not  randomly created. It is carefully crafted stock which is just scrambled a little bit before being served up. And crafting their stock for scrambling was really limiting: notice that they didn't scramble their plot characters or villages? Just the nameless hordes?  
  
The problem is that algorithmically generated stock is  limited. It is limited by your algorithm. You can't make a sword of snicker-snack if you don't write the "snicker-snack enchantment" into your game. If you do, then the joy wears off rather quickly. This is even worse because what algorithms really excel at doing is simply recombining content with different numeric values. Call it a "vorpal" sword, what does it do? Probably the same thing as a +3 sword, only more so. A sword of fire? Like a +3 sword, only it does extra damage to some critters and less to others.  
  
The solution seems to lie in intertangling the generators. For example, your enemy generator creates elementally-aligned baddies. Here's an ice wolf. There's a gluey goblin. Your item generator gives out fire swords and swords of whatever the hell gluey is weak against.  
  
Then, of course, your problem is that of chaos: you have to make it so that the players have a choice  but don't have too many  choices. If you offer them a sword of each type, or if they face a rainbow of enemies weak against various elements, they'll get sick of trying to choose. This is especially true if your game is easy enough to beat using plain ol' weapons.  
  
I think the solution lies in tying the generation system into the dynamics  of the game rather than the content  of the game.  
  
Imagine an FPS like Halo. You can carry only two guns. But the guns and areas are randomly generated to some extent.  
  
You don't have "fire guns" and "ice guns" and "guns +3". You have guns that have very different effects in the very deep dynamics of the system: the guns vary in accuracy, range, recycle speed, ammunition, weight, area of effect and, sure, damage types. Most of these values aren't "match three for a prize!" There are no enemies which are labeled "weak against recycle speed!"  
  
But when the good guy is facing down dozens of quick-moving little bastards, recycle speed is often just what you need. Not because we labeled it like that, but because that's how the dynamics  are.  
  
Think of it as an aversion to booleans. Boolean choices are the worst thing in the world . A or B. B or C. Terrible choices. A or B or C - you're still making a boolean choice - A is on or off. B is on or off. C is on or off. (This is actually why I think most "drama engines" people are talking about are doomed. Boolean choices don't give you enough range of expression.)  
  
By making something 50% faster than average, you make a monster which is harder to hit, forcing the player to rely on weapons that have better odds. If you send things that have 4 points of armor, you force the player to rely on the big guns. If you send lots of little things, the player has to adapt to that, too. But these are sliding scales: things can be somewhat fast... or quite fast, or very fast, or kinda slow, or very slow... which means that a weapon choice isn't about finding a weapon that boolean-matches their weakness. It's about using a weapon that is good enough at what you're facing.  
  
And since it's deeply linked to the dynamics of the game, you can actually have complex routines that create bizarre  content. Like a grenade launcher. A grenade launcher is not something usually covered by a generation routine because it, alone of all weapons, is affected by gravity. Gravity, recoil, cover, speed, line of sight, and dozens of other factors are all dynamics of the game, and by mixing and matching them you can get radically unusual kinds of content.  
  
Of course, a heuristic that can measure the interplay between generation algorithms and tweak them for difficulty is probably also a wise choice...  
  
Anyhow, I've rambled enough.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [5:05 PM](https://projectperko.blogspot.com/2007/04/brick-walls.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/1168738647629742669 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=1168738647629742669&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [generative](https://projectperko.blogspot.com/search/label/generative)


#### 2 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Great post. Obviously procedural content isn't a silver bullet, hand-crafted content will never go extinct, it'll just evolve from its dinosauric present to be smaller and more flexible, more indirect. The "soil" content's relationship with the hand-crafted "seed" content doesn't compose the dynamic, rather the dynamic composes that relationship. Keeping with this gardening metaphor, the dynamic is the weather that provides moisture and nutrients to the soil, which allows the seed to bloom into something very organic and stochastically ordered. Thats a better metaphor than my previous "cigarette ash on a perfortated beer can used to smoke crack" metaphor. :P  
  
Your example of FPS dynamics is useful to ground the theory, but it doesn't exactly set the imagination ablaze. Maybe if you could describe how this could be applied to deep social gameplay, that'd be a post worth linking to. ;)  
  
I find your critique of drama engines (a term I coined, I'd be interested to get an idea of how many others are infected with the meme) to be on point, but not based on reality. Storytron uses floats, Facade, uses floats, Drama Princess uses floats, your own Rocket Heart used broad bounded integers. If you're referring to crusty academic engines from early this decade, yeah those were doomed four years ago. :>\]  
  
That, btw, is what we in the business call an emoticon triptych.

[7:28 PM](https://projectperko.blogspot.com/2007/04/brick-walls.html?showComment=1176172080000#c6839274225021450460 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6839274225021450460 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

You didn't coin "drama engine", Patrick. It's a transparent term. What else are we going to say? "Drama manager"? Ha!  
  
As to your critique of my critique... recursion! Arrrgh!  
  
Alas, although they use floats and ints and such, the CHOICES OF ACTION ARE BOOLEAN. I'll do a quick post on it.

[8:09 PM](https://projectperko.blogspot.com/2007/04/brick-walls.html?showComment=1176174540000#c7382232566120527428 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7382232566120527428 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/1168738647629742669)

[Newer Post](https://projectperko.blogspot.com/2007/04/boolean-choices.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/04/simulating-characters.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/1168738647629742669/comments/default)
