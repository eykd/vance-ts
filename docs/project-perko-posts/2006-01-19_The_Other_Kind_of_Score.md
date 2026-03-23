---
title: "The Other Kind of Score"
date: 2006-01-19
url: https://projectperko.blogspot.com/2006/01/other-kind-of-score.html
labels:
  []
---

## Thursday, January 19, 2006 


### The Other Kind of Score

(This is a second take on an earlier post. This one, hopefully, is a bit more useful. It contains a few ideas about how to make a notational system that works. No guarantees, of course.)  
  
The basic idea behind any kind of notation is that you are assuming a standard knowledge, and then applying that knowledge. For example, musical notation assumes you know how to play the instruments. Scientific equations assume you know the math to manipulate them. This is, of course, not entirely true of works which are teaching you to play or manipulate - but even then, they assume you're only trying to learn the algorithm or instrument they are teaching, and already know the stuff they rely on.  
  
The idea that the "notation" of a game needs to somehow be "complete" is ludicrous. In fact, the "artistry" of notations (from novels to sculpture and back around to screenplays) is that they are incomplete. They use what the audience and/or performer will know, and then reach heights unimagined a hundred years ago - because they are standing on a platform built by thousands of people all working in the same direction.  
  
However, unlike music, or screenplays, games are interactive. If they weren't interactive, you could just write them like screenplays. Like most people do now. "The zing jing jumps out at you. (Fight ensues, stats are blah blah.) You continue on to the bibble bobble. (Acquire the Goingiboing Gnarkfark.)"  
  
This isn't suitable. People seem to think games should be linear. *Games should not be linear*. At least, not all games. The idea that the choices you make choose between utter failure and standard advancement is bad for a lot of reasons, not least that it multiplies the content required to make a game that plays the same length of time as a nonlinear game. (A nonlinear game has much higher replay value.)  
  
Nobody I've seen has figured out a good way to represent the interactivity of games.  
  
This is because people are using the word "interactivity".  
  
Calling games "interactive" is like calling music "sound". Yeah, it's true, but it doesn't mean anything useful. Clipping your toenails is interactive. That doesn't make it a game any more than dropping an egg counts as music.  
  
This is because it is the *pattern* of interactivity and the *pattern* of sound that makes games and music games and music. How do you make a pattern of sound? You use an instrument that produces similar sounds but different tones whenever you manipulate it. Then, you can create a wide variety of patterns, all with the same base "noise". By simply writing down the variation in pitch and length, you can record much of the pattern - although the secondary characteristics get lost in the shuffle, because you are writing in a way all musicians, regardless of their instruments, are trained to understand.  
  
How do you make a pattern of interactivity?  
  
Well, one would assume you use something which creates similar interactive experiences when used, but can be manipulated to vary the tone. Like, say, a play loop. For example, the FPS play loop always produces the same basic "tone" of gameplay, but it can be manipulated to produce hard fights or easy fights, fast fights or slow fights, long pauses or difficult maneuvers. Teaching how to "play" these loops - even what loops exist in the first place - might be a bit difficult. The MDA framework provides a nice start for many play loops. It can't represent full games - it can only represent play loops. Hence the need for something which can go further, represent multiple interacting play loops.  
  
There's nothing wrong with having one play loop any more than a song that has only one instrument. However, usually having only one play loop is used for emphasis, like a soloist in a song: patterns only really grow complex when you start mixing multiple play loops.  
  
Like a song which has a guitar, a bass, a keyboard, and a drum, you're going to end up with a much more complex and usually more enjoyable game if you use a variety of game loops, like FPS, stat growth, and linear narrative. The pattern you are representing grows much more diverse and complex.  
  
So, okay, our "instruments" are play loops. And you are expected to know how to "play" them. If you can't "play" an FPS "instrument" to program a game experience, stay away from scores that include FPS instruments - or get another person to join your band. Or, like someone who can't play guitar but can play a keyboard, get yourself something you understand that can fake the instrument passably well.  
  
Now the critical part is representing the interactivity. To some extent, this is actually easier than it seems, because nearly all games use the standard "pattern repeat repeat repeat variance" method of play. The simplest example would be the steady increase in speed throughout Tetris: it's always the same pattern of play, but at an increased speed.  
  
It's true in all games. Each character has a "refrain" they play whenever you interact with them. They are goodhearted scamps or foulhearted skanks. They are brutal warriors or terrified victims.  
  
This extends throughout. The enemies follow the same refrains: the guys with shotguns always play this way, the guys with autocannons play that way. Even - and here's the hard part - even the level layouts and placement of supplies has repeating refrains. In Doom III, you could always tell exactly when you would be attacked, and you always knew exactly when you would get more health and ammo - except in a very few cases.  
  
These patterns, these "refrains", are the game proper. But the exceptions are often what makes or breaks a game. Anyone who plays blues can tell you, the refrain doesn't have to change, because the part it supports - the variations - are endless.  
  
Of course, you need a good refrain. That's why blues musicians tend to stick with the few standard refrains, and rock tends to have a few standard drum beats.  
  
So there would be two "parts" to writing down a game design in this way. Writing the refrains, and then writing their exceptions/collusions. Like music, the refrain determines not only the feel of the game, but also its genre. Which play loop instruments you use in what ways... that's important.  
  
How does this write interactivity?  
  
Well, the refrain is something which progresses without exception. It always goes "buh-wheee-o-whee-wheat", then you can sing about how your woman left you. In the same way, games will always have the same "feel" to them, even if the exact path of the player is up to question. The player will always fight zombie-type monsters here, fire-type monsters here. The player power-ups will always be located after boss fights. The player will always have so many enemy encounters after powering up before enemies power up to match. Maybe fights during the refrain will always go "easy-easy-hard-medium". Or "long range, medium range, long range, short range". Lots of level designers do this by accident, never even realizing they are doing so. See Doom III for an example. :)  
  
Refrains can be anything. They are one or more instruments that play a recognizable "tune" that sets the game's feel.  
  
Now, I can't keep calling them "refrains", or at least I shouldn't, because "refrain" means something very specific in music terminology, and I'm not using it the same way. These patterns in the game - depending on the size of the game, there's often dozens or hundreds of "refrains". A game like Tetris has only one, but a game like, say, Halo, would have a symphony-sized ream of them.  
  
This doesn't seem so different from writing little "pieces of level", does it? You say, "He'll run into fire guys here. They'll be mostly long-range, except a few panicky melee fights. There won't be much healing." That's a refrain. Except the refrain is a much more elegant way of jotting it down, because it refers to the intrinsic but unstated *reward and challenge structure*. For example:  
  
!\[Image\](https://lh3.googleusercontent.com/blogger\_img\_proxy/AEn0k\_tgLnKkUIr67G5qBaVFRzuEo0943 Hw6qd-pBuXwMuaFxhOjncBnFtqkEYdPxTvFixH7-Ao8 QulwQ16O0kUmuzz\_ipOuoSgcriMed1trJKXj6SRdPTg3rg=s0-d)  
  
This could represent the situation I just talked about, with the lines representing long range fighting, short range fighting, fire guys, healing, and ammo. "Played" in your mind (or even on a keyboard, if you like), there is a definite syncopation and rhythm which defines this part of the game.  
  
This represents "first tier" interactivity. It represents play, but not as play actually would be. For example, what happens if the player decides to turn back and explore the level for fifteen minutes between some encounters? The rhythm is suddenly very different. This can actually make a huge difference if you're in a game with something time-related happening. For example, if you heal over time.  
  
In short, it doesn't represent how play loops change, it represents how play loops DON'T change. It represents the part of the game which remains constant.  
  
How can it represent true interactivity? How can it represent a live AI squad roaming the level looking for you? How can it represent the other player stealing health power-ups he doesn't need?  
  
It can't. That's jazz. The designer knows his duty: his duty is to have the play loops form this refrain (and a long list of other refrains, presumably). How he handles the loose ends depends on how he "plays" the design of the game.  
  
Can you codify this into something simple? Not that I can see. I can see putting in "bars" to represent where significant breaks in play can happen, or little slides for where things lead directly from one to the other, but I don't see how you can demonstrate what is functionally 7+ dimensional space on a 2D display.  
  
Instead, you represent the important parts. Like the way you take a photograph instead of sculpting a full duplicate of the scene.  
  
Do I think this is "the" way? No. But it can represent the primary play loop patterns, reward/risk situations, "mood", expectation... it's better than the others I've seen so far at large-grain game depiction. This score has the high score. :)  
  
It's a start.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:11 AM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113769352775102950 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113769352775102950&from=pencil "Edit Post")


#### 9 comments:

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I just played an approximation of the example above on a keyboard, assigning notes to the various play loops. It doesn't sound bad, and has a kind of wistful feel to it.  
  
Somehow, though, I doubt transcribing songs into games or visa versa will work out very well. Still, it could be interesting...

[8:45 PM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137732300000#c113773230781604563 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113773230781604563 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Happy to help. Everyone is using musical theory, it seems.

[7:04 AM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137769440000#c113776945596782555 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113776945596782555 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I like what you're saying, the "refrain" idea is similar to "metaplot" in a table-top RPG or storyworld.  
  
I think relating play loops to verbs and their interactions is worth a post.  
  
Music theory is a dead end for game design, don't overindulg it Corvus.  
  
Instead, I think the experience of listening to music, the wave phenomena we tune into, is similar to the experience of motion in film and the interpretation of causation in literature, what has been called Phi. I think figuring out Phi in terms of gameplay is a much better ticket, and is what the musical anology is really pointing to.  
  
For a general introduction to Phi, check this link:  
  
http://peterlynds.net.nz/papers.html  
  
and click on the link for "Subjective Perception of Time..."  
  
Or google "Peter Lynds", click on the papers section and then the link to the paper.

[2:54 PM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137797640000#c113779767042528719 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113779767042528719 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Nice.  
  
I keep thinking that ultimately, there will be levels of the notation schemes, just as there are in other notations. That's a point I was trying to make over in the Lost Garden comment thread...  
  
I think stuff like my own Grammar ideas, the Game Design Patterns, like your "loops," like Hal & Noah's 400, like Chris Bateman's stuff, and so on, are all tackling things at a different level of zoom, so to speak. You're clearly working on a higher level plane than my grammar is, for example.  
  
I also think that ultimately, these different notations and schema don't even need to intersect all that much. Prosodic notation and rhyme scheme diagramming don't; jazz harmony notation and shapenote singing don't...

[4:27 PM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137803220000#c113780322180121121 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113780322180121121 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I'm agreed with you, Raph. No tool can do all things.

[10:28 PM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137824880000#c113782490546224192 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113782490546224192 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_WQk0 YgqQA9Q/SaAzb6ng2VI/AAAAAAAAANw/Go874k1XLAc/S45-s35/profile.jpg)](https://www.blogger.com/profile/01646249933207430061)

[Darius Kazemi](https://www.blogger.com/profile/01646249933207430061) said...

Finally got around to reading this post.  
  
Pros: I like your references to jazz music. Specifically, jazz musicians play from a "lead sheet" which has basically two parts to it: the chord progression, which is just something like "A major, C diminshed, E minor", and the actual notes for the refrain (or "head") itself. When you speak of repetition of themes/refrains, I'm reminded most of modal jazz, which has the sort of cyclical basis to it that most game designs have.  
  
Cons: You seem be referring to interactivity as something binary. But it's an analog scale. Toenail clipping (as you put it in your article) is interactive, but probably a .1 on a 0 to 1 scale. Video games, on the other hand, live on the higher end of that scale. I think "games are interactive" is a more useful statement to make than "music is sound".

[8:53 AM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137862380000#c113786241725481004 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113786241725481004 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I'm going to have to disagree with you, Darius. How "interactive" is Frequency or Dance Dance Revolution? No more than cutting your toenails.  
  
Games are not required to be "above a certain level of interactivity" - whatever the requirements are, they are something else.  
  
On the other hand, your jazz commentary was pretty much exactly what I was trying to say when I used jazz as an example.

[10:01 AM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137866460000#c113786648336094870 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113786648336094870 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

*"In short, it doesn't represent how play loops change, it represents how play loops DON'T change. It represents the part of the game which remains constant."*  
  
I don't see why not. The game knows what's supposed to happen and when because you've outlined it. The player's progress provides the tempo of the tune. The thing is that you've already defined the stave, the game play elements. The Game (or the computer on which it runs) knows that there is supposed to be a quick burst of melee fighting soon followed by some ammo packs, so *the game should improvise* and put them in as best it can. Think of the computer being a dungeon master in a role-play game, but the designer's written the rule book and even helped the DM outline the plot of the next gaming session.  
  
It's not just a designer-written song performed by the player, it's a designer-written improvised jamming session between the player and the computer. The designer can't interact with the actual playing of the game, but the computer can.

[3:14 PM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137971640000#c113797164737403863 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113797164737403863 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, yes, many of my theories allow for that kind of automated "balancing". However, in practice, it's usually quite difficult. So I just didn't talk about it in this post. :)

[4:50 PM](https://projectperko.blogspot.com/2006/01/other-kind-of-score.html?showComment=1137977400000#c113797745457013540 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113797745457013540 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113769352775102950)

[Newer Post](https://projectperko.blogspot.com/2006/01/patterns-in-game-design.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/01/languages-marching-on.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113769352775102950/comments/default)
