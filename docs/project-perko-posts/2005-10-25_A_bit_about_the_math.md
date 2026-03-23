---
title: "A bit about the math"
date: 2005-10-25
url: https://projectperko.blogspot.com/2005/10/bit-about-math.html
labels:
  []
---

## Tuesday, October 25, 2005 


### A bit about the math

!\[Image\](https://lh3.googleusercontent.com/blogger\_img\_proxy/AEn0k\_vvypwgwcryE9upa8 Czq0JAyVbv0 LpM8PY0vsxXuOLL3j978dlyRJUvLCbAeceEXHW6f2xJrZ6tLbvAJOtn6kM-dKUVc1 EsgUq3e2JZVQ8n=s0-d)  
  
As I mentioned, the design of the game isn't just stabbing in the dark: am am/will be testing my theories about game design on this game. Fortunately for me, the fact that you can fire in any direction actually makes the math *easier* than for a standard shmup.  
w  
Here's an example of some of the math regarding weapons:  
  
No weapon shoots straight. Each weapon/gunner combo has an inaccuracy, measured in angles. With a good gun and a sharp shooter, you can get an accurate stream of fire without difficulty. But when you whip out the shotgun and man it with your cook, you get bullets flying out in a roughly hemispherical aura, generally centered on your mouse pointer.  
  
Which is "better"? Both are good. More skilled players will tend to prefer, if the weapon is balanced, accurate weapons. This is because they are pretty assured of their ability to lead correctly and hit enemies. In a fixed-fire game, wide-area weapons ("wave beams" and "shotguns") are useful largely because they allow the player some slack in how he needs to maneuver in order to hit the enemies. In this game, he can shoot at any enemy, regardless of his position, assuming there's not a giant rock in the way.  
  
But wide-area weapons still have their place. Putting aside the awesome feeling as half the scaffolds in the level peel away under your wide-area weapon, the core effectiveness of the weapon can be calculated mathematically.  
  
This is going to be a little complex.  
  
A weapon has an effective cone. A highly accurate weapon has an extremely narrow cone, whereas a shotgun has a very wide cone. The bullets have a chance to be on any path down that cone. Let's presume it's an even chance. Inaccuracy is even, in my game, but shotgun shell distribution is weighted towards the center of the cone. Still, let's assume an even chance.  
  
A shotgun fires 15 bullets per shot. The rate of fire, depending on the gunner, is around three shots in 0.75 seconds, followed by a half second load time. The cone, again depending on the gunner, is about 100 degrees wide.  
  
Of course, you're likely to use a double-barrel approach. Two turrets means 30 bullets per shot, but a slower rate of fire, slower reload time, and less ammo. (More ammo, actually, but not as much more as the added drain. So less shots.) The cone is closer to 120 degrees.  
  
Shotgun pellets do an average of 2 damage. Some gunners will bring it down to 1.5, some up to 3.  
  
The machine gun fires about 10 shots per second, say. It can fire for about a second and a half, and reload takes a little over a third of a second. The effect cone is about 25 degrees wide, although with something like this, gunner selection really comes into play: the cone can be as narrow as 10 degrees or as wide as 60 degrees.  
  
Double turrets means 20 shots per second, one second of fire time, and a half second reload. The effect cone is about 40, base.  
  
Machine gun bullets do an average of 5 damage. Minimum of about 3, maximum of about 8.  
  
Now, the questions are simple:  
  
How many bullets will pass through a given zone of width 1? (1 "scale", which is approximately the width of a standard enemy: the size of your ship.) What is the minimum? The maximum? Obviously, this depends on distance from the source: 100% of shotgun shells will hit something of width 1 if it's right in front of the gun, but that percentage lowers rapidly.  
  
With that in mind, how large are your enemies? What distances will they tend to be at? Minimum? Maximum?  
  
How much damage does each bullet do? How much damage can they take? What is the chance they will survive the encounter? If they die, how much of the volley will sweep past their debris and how much will they have absorbed?  
  
We have two enemies: a cannon (width 1) and cannon shot (width 0.3). Cannon shot is a valid target: this is not always the case with bullets. Cannon shot has 1 HP, the cannon has 6. Cannons, because they are mounted on destructable scaffolding, are a complex subject. Let's stick to bullets for this example.  
  
The range at which cannons usually fire is when they are a bit less than halfway down the screen. The player is usually between 8 and 15 units away, depending on how open the level is and how many enemies there are. If a cannon gets closer than that, it is realistically destroyed - we'll discuss that in a later edition. However, for the sake of argument, we'll also talk about closer ranges.  
  
Here is a quick table defining the width of an effect zone at a particular distance and the percentage taken up by a 0.3 wide target. This isn't perfectly accurate, but it is plenty close.  
  
|  | 3 | 8 | 15 |
| 25 degrees: | 1.3 | 3.5 | 6.5 |
| 40 degrees: | 2.1 | 5.6 | 10.5 |
| 100 degrees: | 5.2 | 14.0 | 26.2 |
| 120 degrees: | 6.3 | 16.8 | 31.4 |

|  | %3 | %8 | %15 |
| 25 degrees: | 23% | 8.6% | 4.6% |
| 40 degrees: | 14% | 5.4% | 2.9% |
| 100 degrees: | 5.8% | 2.1% | 1.1% |
| 120 degrees: | 4.7% | 1.8% | 1.0% |

The first two are pretty much accurate regardless. However, due to the special dispersion pattern of the shotgun rounds, the last two percentages are roughly triple near the center and roughly 1/3 near the edge.  
  
So, if we're trying to shoot a bullet out of the air, a single shot doesn't have a whole heck of a lot of chance to do so. Now, the size of the bullet actually alters this significantly: we're using point-sized bullets in our calculations. But in this case, the player is firing essentially point-sized bullets. I believe they are 0.1 in size, which is not exactly formidable. It raises the percentages, but we'll discard that and simply remember that these numbers are a mite low.  
  
Now, here's the same table, with volley information. We're simply multiplying the percentage by the volley number to get a final "realistic" percentage for a "short burst" at the target. Again, it's not incredibly accurate to do so, but it's easy and not really noticeably inaccurate.  
  
|  | %3 | %8 | %15 |
| 3 bullets @ 25: | 69% | 25.8% | 13.8% |
| 6 bullets @ 40: | 84% | 32.4% | 17.4% |
| 15 bullets @ 100: | 87% | 31.5% | 16.5% |
| 30 bullets @ 120: | 141% | 54.0% | 30.0% |

First glance at these numbers show what you might expect: two turrets are more likely to knock down an enemy than one turret, and shotguns are more likely to knock down an enemy than machine guns. This is especially true because the shotgun percentages listed are extremely low if our aim is decent and the bullet is near the center of the cone.  
  
Of course, these numbers are because our enemy has only one health.  
  
If our enemy was a cannon, with 6 health, we would have a different story: we would need to track how many shots are likely to hit, instead of whether any given shot is likely to hit. We can do that some other day.  
  
Anyhow, the numbers aren't quite as straight-forward as you might think. That's for one "volley". If you miss and want to fire another "volley", you start running into problems. The double shotgun only has two volleys in it before a lengthy reload, whereas the single machine gun has a functionally unlimited number of volleys: you can keep firing over the course of the bullet's whole trip.  
  
The other problem is multiple targets.  
  
Multiple targets is really where the math starts to get complex.  
  
A shotgun is both good and bad at multiple targets. If the targets are fairly closely clustered, you can hit them all with a single volley. However, if the targets are widely spaced, you can't. Or, at best, you might choose to tag both with light fire.  
  
But if they're very closely spaced or stacked, you'd be better off using a machine gun, since the concentrated firepower will cut through multiple targets, whereas the shotgun will probably have most of its fire along any given vector absorbed by the target. This doesn't apply much to the 0.3 wide, 1 health bullets, since a single bullet of any kind will drop them.  
  
A shotgun doesn't have very many volleys, so if you have multiple widely spaced targets (especially likely in cases with enemies that are quickly introduced), there's a very real threat that you will run out and be stuck dodging until you reload.  
  
On the other hand, accurate weapons require a more accurate volleys... except they don't, really. They simply require a lengthy volley which traces a line the enemy is sure to cross. Since we're using simple enemies, these kinds of volleys are acceptable. If we were fighting an adaptive enemy, we would have to worry about how well he could dodge, and things get complicated again.  
  
There's math for it all, but it would fill another five pages. So, I'll leave you now, thinking about shotguns vs machine guns, and which is preferable in any given situation.  
  
By the way, I decided the health meter was too hard to see, up in the corner, so I added a "omygodimonfire" set of markers. As you get damaged, your ship begins to smoke and smolder, making it pretty obvious how damaged you are. :)

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:41 AM](https://projectperko.blogspot.com/2005/10/bit-about-math.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113025902565245116 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113025902565245116&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113025902565245116)

[Newer Post](https://projectperko.blogspot.com/2005/10/pac-visits-machine-city.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/10/gamey-update.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113025902565245116/comments/default)
