---
title: "Superheroes"
date: 2005-11-10
url: https://projectperko.blogspot.com/2005/11/superheroes.html
labels:
  []
---

## Thursday, November 10, 2005 


### Superheroes

Because I have a terminal case of "geek", I am a big fan of superheroes.  
  
If you're rating superheroes (which you have to do, if you're making a game about it), your natural instinct is to do things like "strength: 7" "class 3 flight" "fireball, statistics as follows:"  
  
This is more or less thoroughly useless as ratings go. Last night while falling asleep, I thought of a much better way to rate them. Of course, when I woke up the next morning, I realized it was bunk. But from that bunk, I figured out how to rate them.  
  
There are really only two "useful" superhero games out at the moment. City of Whatever and Freedom Force. City of Whatever is carefully balanced, meaning "neutered". All the heroes are neutralized into the same "category". Here's three examples:  
  
A) You can beat up lava monsters with your bare hands.  
B) You can't kill dozens of enemies at once with your fire power, don't ask why.  
C) You use the same attacks on a 90 foot tall monster as on a 9 inch tall toy.  
  
There are some small differences between characters. For example, some people can fly, others jump. Some people's moves have a higher hit rate. Some people's moves stun. Some people don't have offensive moves at all. The latter is the only real difference to be found between the characters.  
  
Freedom Force is better because it doesn't need to be balanced, but it's painfully UNbalanced. The costs of all the various skills don't change based on your other capabilities, even though their effectiveness certainly does!  
  
For example, the "punch you in the face" move does much more damage for strong characters, but is worth the same number of points regardless of your strength. Ranged attacks cost the same amount no matter whether you're a fast flier or a slow, lumbering ox.  
  
You could say, "that's why you pick synergistic attacks". But the points are supposed to rate the total strength of your hero, so that's inaccurate. Moreover, if your character has a bunch of unrelated attacks, they don't cost any more. Make a character with fire, radiation, and stun attacks, and virtually every enemy in the game is critically weak to you. Despite the fact that those attacks really don't have much to do with each other and turn you into a killing machine, your rating doesn't reflect your real power.  
  
Vector math to the rescue!  
  
By using vector math, it's very easy to see which powers and combinations of powers have which strengths. At least for direct powers: indirect powers (such as buffs) are very rare in the superhero genre. As far as I know, they are really only found in City of Whatever.  
  
It's pretty easy to rate a superhero by their vectors. Functionally, it's very similar to stats, except you choose useful stats.  
  
For example, you could rate Wolverine:  
Movement: 5m/s land (enhanced climb)  
Melee: 2m reach, 0.2s speed, linear effect, X blade damage.  
Defense: Extremely durable, regenerates X % or dmg per second.  
  
Then you could rate, say, Cyclops:  
Movement: 3m/s land  
Ranged: 5m/s linear effect, 0.3s speed, X kinetic damage.  
Melee: 2m reach, 0.3s speed, linear effect, X kinetic damage.  
  
This, of course, doesn't take into account skill at melee combat. Whether you want to allow for melee combat skill, or simply enhance the stats inch by inch, depends on your game design.  
  
But from these stats, you can determine who would win in combat. Given Wolverine's greater land speed and ability to dodge Cyclops' ranged attacks *while at range*, Wolverine isn't vulnerable to long-range damage. If you gave Cyclops a cone-effect gaze rather than a linear gaze, it might be a bit tighter, but we didn't do that. If the characters are under player control, Wolverine's player would need to be pretty good to dodge, given the speeds involved.  
  
Assuming Wolverine gets in to close range, it's a fair bet that Cyclops won't use melee attacks unless there are rules for interfering with melee attacks using melee attacks. His gaze is just as fast and far more effective.  
  
Then it would come down to the math. In 0.3 seconds, Wolverine can move ~2 meters (or equivalent in turning, ducking, etc). However, Wolvie's reaction speed isn't instantaneous. If it takes him 0.1s to react, he can only move 1 meter before Cyclops blasts. At close range, the time it takes for the blast to reach Wolverine is pretty much zero. Given that Cyclops can continue to aim even as his timer counts down, it becomes obvious that Wolverine is in deep trouble unless your dodging protocols are quite forgiving.  
  
However, Wolverine's own attack takes 0.2 seconds and has a 2 meter range. That means that if he's within two meters, he can interrupt Cyclops' assault with his fist, assuming a <0.1s reaction time. Otherwise, he's in a lot of trouble and would have to play a game of hide-and-seek to get close enough.  
  
By simple calculation, you can determine the circumstances in which each would have the advantage, down to the millisecond of timing needed. Of course, this is hardly a complete system. Cyclops' beam hasn't been given any limitation, so he could theoretically just keep blasting. This could be solved either by making his beam blind him or by giving him an overheat/recycle condition. In addition, Wolverine's feral movement type may give him dodge advantages such as side-dashes and pounces. And, of course, I haven't pointed out any minimum effective ranges.  
  
This calculation is pretty complex, but it's the sort of calculation computers can do without difficulty. You'll want to come up with categories that the players can grok. For example, Wolvie would be a "blitzer" and Cyclops would be "ranged". You could make the distinction between ranged attackers who are good against blitzers and those that are bad against blitzers. For example, Jean Grey is very good against blitzers because she can just grab them and hurl them around. Green Arrow is bad against blitzers, because they are usually fast enough to dodge (or catch!) his arrows.  
  
The level of automation in the fight is up to you. Most games have an auto-dodge, but don't show the character dodging. Which is kind of stupid, really. And very few games allow your superhero to get tossed around in that good old Marvel way. You might even make melee combat mostly automated once you've closed.  
  
But the point is: you can calculate what kinds of characters your hero will be best against, and from that determine point value.  
  
Yeah, okay, it's geeky.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:24 AM](https://projectperko.blogspot.com/2005/11/superheroes.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113164274733781070 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113164274733781070&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113164274733781070)

[Newer Post](https://projectperko.blogspot.com/2005/11/friday.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/11/best-christmas-music.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113164274733781070/comments/default)
