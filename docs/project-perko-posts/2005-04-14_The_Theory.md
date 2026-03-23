---
title: "The Theory!"
date: 2005-04-14
url: https://projectperko.blogspot.com/2005/04/theory.html
labels:
  []
---

## Thursday, April 14, 2005 


### The Theory!

Because I know you've all been waiting for it, this explains the whys and hows behind making a game about vector analysis. IE almost any twitch game ever released. Please note: you CAN CERTAINLY mate these kinds of games with puzzle games, strategic games, stories - but those are a different kind of play, not covered in this session.  
  
The mind of your player is doing ONE THING when he plays your game (aside from audiovisual interpretation and controller manipulation): it is predicting WHERE and WHEN things will be. That's the POINT of these kinds of games.  
  
Generally (99.999998% of the time) these games have some kind of Avatar. Some single object which embodies the player's interests. Whether that's a space ship, a race car, a marble, a frog, or whatnot, the purpose of these avatars is to give the player a STARTING point for vector analysis: a FOCAL POINT. He knows, automatically, that the vectors that concern him are the ones radiating towards the avatar.  
  
Some games do NOT do this. For example, DDR and Chu Chu Rocket. One has no avatar, the other has an invulnerable avatar. However, neither of these games lies within the domain of this theory, so they should definitely be taken with a grain of salt.  
  
The universe revolves around the avatar. The vast majority of the player's actions radiate from the avatar. Moving the avatar, for example. Or shooting your gun. Everything the player will EVER THING ABOUT, kinetically speaking, will always revolve around WHERE the avatar is and WHAT it can do/is doing.  
  
The SIMPLEST form of play is simple AVATAR MOVEMENT. This sort of game revolves around moving the avatar (sometimes, even merely telling the avatar when to jump). There are targets. Some targets you want to hit, some you want to miss, some you REALLY want to hit, etc. There are CONTROLLED VECTORS, usually involving the avatar being moved by the player. Then there are often (but not always) UNCONTROLLED VECTORS, which is essentially the target areas moving relative to you and each other in a way the player has to deal with.  
  
You can try to make an interesting game out of just this simple kind of analysis, and numerous car racing games prove that it isn't as boring as it might sound. The key? DELAY and WASHY ACCELERATION. In a car racing game, your car attempts to adjust to various play zone irregularities, such as traffic or a curve. The reason it is fun is because the vectors you can pull out of your ass to respond are NOT simple 'twitch and move' vectors! They only mildly change your vector, usually with a wish-washy feeling and often only after a fairly significant delay. This makes the computations quite a lot harder and, hence, more interesting.  
  
However, there is a limit to how many complex vectors the mind can handle. Putting washy steering into a shmup often totally overloads a player and leaves them screaming, in need of a new controller. Some of the hardest shmups I've played - and I've played a lot of shmups - have just a small 'begin turn' and 'end turn' animation which add a burr to your vectors so you have to start and end them just a tiny bit earlier than you thought. A very powerful tool, and we'll come back to it.  
  
Most games of this type contain shooting. Shooting is a VERY POWERFUL TOOL. Insanely powerful. First, shooting makes the player perform THREE VECTOR CALCULATIONS AT ONCE: Where the bullet will be, where the target will be, and where the ship has to be in order to make the shot. These calculations are usually made very positive, in that if you screw up, you really don't suffer much. A few games are royal bastards and make it so that if you let a bullet through to something that is NOT your avatar - such as the bottom of the screen - you suffer. That's your decision, but I would suggest making it so that the only thing that the player cares about is the avatar.  
  
Second, they make some (or all) of the DANGER zones into TARGETS, meaning that instead of simply AVOIDING the danger zones, your duty is to SHOOT them. They serve multiple purposes. This is a rather important topic, but for now it should be vaguely obvious that anything in your game which only serves one purpose probably isn't doing enough.  
  
However, more than just vector calculations, bullets offer you a FEEDBACK LOOP. Kill a bad guy, the world is a safer place. One more person who's NOT SHOOTING AT YOU and NOT DESCENDING TOWARDS YOU. This feedback loop makes the game interesting on a strategic level, rather than on a strictly vectored level. Threat assessment is, however, a different topic... and usually players who are busy doing vector calculous are pretty bad threat assessors. Just keep that in mind.  
  
You'll notice that very few enemies in these games shoot, and most that DO shoot DON'T move much, and shoot in regular patterns. Why is that? Because you're thinking of these enemies as DANGER ZONES - unsafe locations to be avoided or destroyed. When it suddenly BREAKS into SEVERAl danger zones, you're flummoxxed. That really wasn't in the charts. It was supposed to move like so.  
  
Asteroids used this cheerfully by making the asteroids break WHEN YOU SHOT THEM, making each shot a joyful experience in DOUBLING YOUR DANGER SPOTS. This kind of clever use of danger zones is perfect. It reacts directly to player input to do something strange yet predictable. I could write a book soley on that kind of thing - you can make a perfectly good game without clever target manipulation... but that sort of manipulation helps.  
  
Okay, so that's the idea, right? How can you apply this crap? I'll tell you... now.  
  
Your game, if it is in this genre, is a mess of safe zones, danger zones, and target zones, often serving more than one purpose. The primary joy of these games is VECTOR CALCULATION - moving to interact with these zones, jockying for firing position, etc.  
  
So what you have to do is introduce the right AMOUNT and TYPE of vectors. Your primary decision is obviously "how hard do I want this game to be?" After deciding that, it's a matter of making a few basic gameplay choices.  
  
Every vector takes a certain amount of player calculation. For these purposes, SLOW vectors take LESS calculation, whereas FAST vectors take MORE calculation (or, more accurately, they reduce relative vision, requiring FASTER calculation). STEADY vectors, such as most bullets, take less calculation, but ACCELERATING vectors, such as falling apples or turning starships, take MORE calculation (and should probably have a predictable method of acceleration).  
  
The avatar vectors are also critically important, because these vectors are essentially MULTIPLIERS, affecting the computative 'cost' of the other vectors. Every microsecond of DELAY on the player vectors makes ALL the other vectors take more calculation. The more WASHY the controls, the more difficult all the calculations - for example, if you're using turning controls rather than left/right buttons, or if you continue moving in a direction you're no longer pressing. Lastly, the SIZE of the avatar matters - smaller the avatar, easier the game.  
  
Now, the most important part is how slow or fast the avatar vectors make the avatar move, but this is tricky. First, the speed is RELATIVE to the speed AND SIZE of the other targets. If you move faster than they do, dodging will be easier. If you move slower, dodging will be hard see Relative Vision for more info). Having said that, players can only react and adjust so fast, and if it is physically too fast, the players will have a hard time controlling the ship. In addition, speed MAY rather radically upset the effect of the other contributers, such as delay and washiness.  
  
Any attack vectors you put in are ALSO critically important because they make the AVATAR VECTORS harder (hence making ALL vectors harder). After all, MANEUVERING into position to make a shot is usually the critical part of taking a shot. The SLOWER the shot, the more difficult it is to line up a decent one. The faster, the easier. A shot which TRACKS is obvious MUCH easier. A shot which ACCELERATES is more difficult, because the vector is harder to compute. A shot which TURNS is the same way, but probably even WORSE due to the way most enemies tend to move down towards the avatar. Shots with a SMALL area of effect are harder to use than ones with a LARGE area of effect. Shots with a LONG reload time are a bitch.  
  
As you can see, these principles can, if properly used, allow you to balance your game to any difficulty level. Also - joys of joys - you can start to balance your weapon loadouts and/or ship specs. Obviously, they'll need to be tweaked over play testing, but you know what to look for.  
  
For example, it has long been the fashion to have a big, tough spaceship and a small, fast spaceship. But that big, tough spaceship has one positive attribute (tough) and one NEGATIVE attribute (big). Big isn't good. It's BAD. Whereas the smaller spacecraft is smaller and more nimble - two attributes that make the game EASIER. This means that, in order to balance these, the bigger ship is going to need to be QUITE A BIT tougher, and expert players will probably STILL choose the fast ship, because 'fast' is a vector skill, whereas 'tough' isn't.  
  
Weapon loadouts often contain a LASER and a MACHINE GUN. Compare and contrast: the laser moves across the screen INSTANTLY. The machine gun has is fast, but not instant. In this area, the machine gun is at a disadvantage. In addition, the laser is also usually WIDER, making it easier to use and often more effective. Furthermore, the laser often PENETRATES TARGETS and continues on, making it EVEN MORE EFFECTIVE. If you wanted your laser and your machine gun to have equal power, you would have to REALLY boost the machine gun relative to the laser. Maybe the laser's reload takes all night, whereas the machine gun has a nice, peppy reload. That would probably do it. Maybe the machine gun does more damage, although I would REALLY hesitate to do that, since these sorts of games usually stay away from damage gradients. Maybe there's a limited number of laser shots. Maybe half the enemies are immune to lasers. Anything to decrease its effectiveness.  
  
From here you can go on to make a full compliment of balancable weapons. You have a curving weapon? Make it a fast reload, or make it fire several curving shots. A wave gun? Make it slow-travelling. A missile? Make it accelerate.  
  
Remember, every player is going to be better at a particular facet of calculation. Some players will excel at controlling washy systems. Others will excel at making THOUSANDS of simple vector calculations. Others may be ASTOUNDING at predicting very complex vectors. This is what will lead a player to choose a given game, and a given play style within that game.  
  
Now, there are a few last things that need to be said. First: it is a common practice to combine these sorts of games with other games, such as a strategic 'choose your weapon' game or a prolonged 'tweak your car' game. That's a fine approach, but the core of the game will ALWAYS be vector analysis, and that should be considered first.  
  
Second: the PATTERN of targets (good, bad, and ugly) is important. The more CLEARLY PATTERNED your vectors are, the easier they are to deal with. For example, fifteen ships moving in the exact same oscillating pattern are not going to be as difficult as fifteen ships moving in DIFFERENT oscillating patterns. Similarly, waves and streaks of bullets are easier to deal with than random splatters of bullets.  
  
Third: RELATIVE VISION is of CRITICAL IMPORTANCE. Two ships are not twice as hard as one ship. Depending on how close they are to hurting you, how fast they are moving, how large your board is, two ships might not be any more dangerous than one ship... or it might be fifty times as dangerous. You can read up on that on my site.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [1:11 PM](https://projectperko.blogspot.com/2005/04/theory.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/111351318470819787 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=111351318470819787&from=pencil "Edit Post")


#### 3 comments:

[!\[Image\](https://2.bp.blogspot.com/\_WQk0 YgqQA9Q/SaAzb6ng2VI/AAAAAAAAANw/Go874k1XLAc/S45-s35/profile.jpg)](https://www.blogger.com/profile/01646249933207430061)

[Darius Kazemi](https://www.blogger.com/profile/01646249933207430061) said...

Two years ago I wrote what I think is [an interesting article](http://alpha.gdc.wpi.edu/~darius/galaga.pdf) related to **visual** vectors in the twitch-game playing field, specifically in the case of *Galaga*. It's short and to the point.  
  
I think you're spot-on with your vector-based dynamics. Specifically I like the implications for unearthing new forms of gameplay from a tired genre.

[8:37 AM](https://projectperko.blogspot.com/2005/04/theory.html?showComment=1113579420000#c111357945117465703 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/111357945117465703 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I'll read your paper NOW. Unfortunately for your tired and burned-out eyes (having to read that long-ass essay), it's not even entirely CORRECT - my full theory involves ACTUAL MATH relating to relative vision. It would be quite a bit more difficult to describe.  
  
But this is passable and useful.

[8:59 AM](https://projectperko.blogspot.com/2005/04/theory.html?showComment=1113580740000#c111358077627461684 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/111358077627461684 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Er, that is to say, MY theory isn't correct, not your article. Which, by the way, I enjoyed, despite the big-ass words.

[9:03 AM](https://projectperko.blogspot.com/2005/04/theory.html?showComment=1113580980000#c111358099330237190 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/111358099330237190 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/111351318470819787)

[Newer Post](https://projectperko.blogspot.com/2005/04/star-wars-clone-wars.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/04/right-then.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/111351318470819787/comments/default)
