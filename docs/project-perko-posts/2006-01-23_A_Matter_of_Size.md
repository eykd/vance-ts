---
title: "A Matter of Size!"
date: 2006-01-23
url: https://projectperko.blogspot.com/2006/01/matter-of-size.html
labels:
  []
---

## Monday, January 23, 2006 


### A Matter of Size!

This post is a further exploration of the concepts found [here](http://projectperko.blogspot.com/2006/01/other-kind-of-score.html). So you should read that first. Or at least look at the pretty diagram.  
  
I've continued to think about how to represent games. Some people are down on the music analogy, but the more I've thought about it, the more I think something very similar to it is necessary. After all, each "instrument" we use, such as a close combat FPS system or a puzzle system, is more than simply "on" or "off".  
  
Not only does each loop have a "difficulty", it also has a "current state" and a "type". For example, if you get injured during an FPS loop, this makes the next challenge more difficult. This is not just inside the game loop, though. For example, your exploration game loop uses the same hit points as your combat game loop. So, when you get injured exploring, it makes combat more difficult despite the lack of combat-related injuries.  
  
In a diagram, this can be represented fairly easily with touching circles and a label. However, such a diagram doesn't tell you when you'll fight enemies, or how difficult the traps will be. You'll need another diagram for that, and both are missing the critical link between the two. We need a clearer representation.  
  
Fortunately, we can use a "music-like" representation. Here:  
  
!\[Image\](https://lh3.googleusercontent.com/blogger\_img\_proxy/AEn0k\_v1uFwcERhXggFlP3VL78xWGv1ktPgFYFmT8R3 YemxbRLDmjyV7srDxcHS\_rqVHUObi\_5mhE3xGOrdOyqrIpXlctUpfLxS5jKJn\_PNHCgg0ZBMR=s0-d)  
  
I'm not suggesting this is in any way the BEST representation, but I think it does get the job done. As you can see, every play loop has challenges and upgrades. Challenges generally knock you down, upgrades generally make you stronger. These are represented as red or green circles.  
  
The end state is represented by a "cross". This cross is not only within the active play loop, but can also propagate to other play loops. If the cross is missing, the end state is unmoved in other game loops, or is simply on the circle, in the primary game loop.  
  
The position up and down the ladder represents the "power" of the challenge or upgrade. For example, a low-lying green dot might represent a clip of ammo, whereas a low-lying red dot might be a small monster. On the other hand, a boss is up on top, and tends to drop the player's state to quite low thanks to the hammering the player receives.  
  
As you can see, some upgrades and challenges affect other game loops, others do not. This gives you a feeling as to what they are, and lets you fine-tune your player's power in any given game loop. In addition, one challenge or reward can be in multiple game loops, reflecting a complex situation such as dogs and snipers attacking simultaneously, or a boss which requires puzzle solving.  
  
Now, this is awfully detailed. Generally, there is little need to be this detailed. Instead, we should create "chords", which are commonly used multiple-playloop relationships. For example:  
  
!\[Image\](https://lh3.googleusercontent.com/blogger\_img\_proxy/AEn0k\_tLHxoJtQD-HJ7qQjPuRdbQB9\_5asR9CQE17exJp6aielbmKKY2 CqPe3HThDBoepjuWcjCxzzhK6ZQo3gWHfgaAzECE4 TrOTqY4 KuqREZYKvBuu8g=s0-d)  
  
Using a simple "outline the block" system, we can quickly identify our "chords" that we use. Then we can write them in simple progression, in plain English:  
  
Discovery, long-range accent, short-range accent, empty beat. Discovery, trap, long-range combat, ammunition. Upgrade, short-range fight, short-range upgrade, double challenge. Secret, discovery, jumping puzzle, heavy double challenge.  
  
You can even shorten them further, by category. For example, you could call it a "short range accent diminished" or simply "S-" for the quick little short-range fights. You could call the short-range only upgrade "S+".  
  
Similarly, the difference between a secret and a discovery is a small one, and both are simply the opposite of a jumping puzzle.  
  
The patterns are quite clear. You just have to write exactly what the pattern is, so that the game developers know what kind of progression to have. You can write several different progressions, in the same way a song has several different chunks of melody that have different feels. The choice of the player will usually determine which melodic pattern is played at this moment - whether they crawl through the ducts or cross the bridge makes for a very different experience.  
  
But you don't need to specify which, or either. You simply specify the melodic progression(s), and let the developer use them as his artistry suggests.  
  
I think there's got to be a way to simplify the final output - I'm just dashing this off in my last moments before bed, though, so I really can't think of anything. The point is: you need to see the effect of an event in one play loop in other play loops. It's critical. What that event actually *is* doesn't matter: only what effect it has. The actual event will be implemented by the developer. :)

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:19 PM](https://projectperko.blogspot.com/2006/01/matter-of-size.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113808641426254919 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113808641426254919&from=pencil "Edit Post")


#### 2 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I think in order to get behind something like this I would need to see it used for more than level progression, like the mechanics / dynamics of a game of chess or checkers, or something like a simple board game (CandyLand for example).  
  
From what I'm seeing, what you're documenting is plausable excitement / enjoyment / difficulty or a given scenareo, but not possible changes at a later time, or changes to the overall game state due to a potential scenareo change. However, I will admit that I am probably reading this wrong...

[1:48 PM](https://projectperko.blogspot.com/2006/01/matter-of-size.html?showComment=1138139280000#c113813933540933683 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113813933540933683 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I'm literally the first person to admit it's not a full solution. However, you are definitely trying to put it in a niche it was not intended for.  
  
In this notation, checkers and chess would simply be one "play loop", to be instantiated by the developer, using his own judgement on the actual game engine.  
  
What this is intended to dictate is how the play loops interact with each other - essentially, how winning or losing in a game of chess makes your character stronger or weaker in other arenas. For example, winning the game of chess might make someone like or dislike you: that's a side effect that most game design documents have to clumsily and explicitly write out.  
  
The key here is that you're not mapping out the whole game. You're mapping out key "meta-moments". Key progressions, feelings, and metagames which determine how a given part of the game should progress, if it progresses in that way.  
  
For example, if you were singing "Johnny B. Goode" (Johnny Be Good), you have several definite sounds to the sound. You've got the main guitar riff, the guitar solor, and two distinct vocal melodies also supported by guitar. ("... lived a country boy named Johnny B. Goode..." vs "Go go! Go Johnny Go Go Go!")  
  
My notation is simply intended to write those pieces down, and then let the developer string them together as he sees fit.

[2:04 PM](https://projectperko.blogspot.com/2006/01/matter-of-size.html?showComment=1138140240000#c113814027761247524 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113814027761247524 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113808641426254919)

[Newer Post](https://projectperko.blogspot.com/2006/01/oh-no-end-is-near.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/01/something-nicer.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113808641426254919/comments/default)
