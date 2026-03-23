---
title: "Refining the RPG Battle"
date: 2014-01-13
url: https://projectperko.blogspot.com/2014/01/refining-rpg-battle.html
labels:
  - game design
  - RPG
---

## Monday, January 13, 2014 


### Refining the RPG Battle

The RPG Battle is one of the oldest, clunkiest relics of game design still kicking around today. Originally born out of hardware constraints, the setup allowed early games to have world maps that tax the hardware to the limit, and battles which tax the hardware to the limit, and switch between them via a flashing epilepsy screen.  
  
Of course, it's rare for that to be necessary these days, but we've gotten used to the idea of a battle scene that's distinct from the world scene. And it makes sense in certain situations, where we would be switching from real-time to turn-based anyway, so if the mechanics undergo an abrupt shift, the visuals changing to mark it is actually helpful.  
  
But that doesn't change the fact that the battle scene is really outmoded as it stands. JRPGs feel clunky because they are clunky. Maybe you like that, but let's pretend we'd like to change it, and make the battle more interesting. Since I'm developing a prototype with battle scenes that happen "inside" the books you read, it's a good opportunity for me to fix it up.  
  
The first standout element of the standard RPG battle system is not the fact that it is separate from the world map, but the fact that it's a spreadsheet stat mill. Nearly every RPG is driven by the quest for loot and levels, and the battles reflect that by being mostly a matter of throwing stats at stats.  
  
Sometimes games shake this up to some degree. The Persona series has it so you can get extra turns by exploiting weaknesses (or they can exploit yours), which definitely adds a lot of nonstatistical meat to the battles... but for some reason it's still 99% stat grinding. Radiant Historia has a cool combination of turn order and simplified position/AOE elements that make every battle part puzzle. It's also pretty stat-grindy, but less than many JRPGs.  
  
To make the system less spreadsheety, the easiest way is to add in puzzle elements. Weaknesses, manipulatable turn order, simple positional puzzles. Okay, let's take that into account and try to limit the spreadsheety treadmilly part of the game.  
  
Eliminating the treadmill is easy and fun: just make it so the player can change their level whenever they want. Of course, you need to have some kind of limit on it, but it's not one of wasted player time. So let's say that every level you increase increases the amount of game-world time you have to sit out. If you stay at level 1, you can read every book. But if you go to level 2, you have to sit the next book out. Level 3, sit the next 3 books out. Level 4, sit out the next 7 books. And so on. This also means that each level is a lot more powerful and important, of course, and your characters will automatically level up if an attack would 'kill' them.  
  
With that in mind, we can talk about the weaknesses, turn order, and positional elements we need to add. Understanding that our roster will be constantly shifting means our puzzles can take into account that the player will have sub-par and awkward parties a lot of the time. The challenge to the player is to solve them at the lowest levels they can manage, and which characters to level up in order to break through. Obviously, this is going to be tinted a lot by which characters the player is okay doing without for a few stages.  
  

# Position

Let's start with the concept of position. I'm thinking of a typical battle, where the player characters are all on one side (say, the left) and the enemies are on the other (say, the right). I'm thinking about having vertical positioning matter.  
  
For example, you can only attack enemies that are on your row, and visa-versa. So obviously you can change your row by simply dragging the characters up and down. The enemies, too, can shift rows. This is normally a free action, because there are some constraints.  
  
The biggest constraint is that when someone performs a melee attack, the two combatants move towards the center of the screen and are locked together on that row. Neither character may move, and an ally can only move through them by actively wasting a turn to switch places with them.  
  
People are not solely limited to attacking on their row. AOE attacks and chain attacks make it possible to attack people on other rows.  
  
This combines with adjacency attacks of various sorts, disengage techniques, guarding adjacent characters, mobile characters that can roam without switching places, and so on.  
  
In addition to enemies, the battlefield may also be littered with stuff. For example, there might be a boulder in one of the lanes. The boulder would make ranged attacks against that lane impossible, but whoever performs the first melee attack will leap on top of the boulder and have a statistical advantage against the enemy below. This adds further puzzle elements into the battles.  
  

# Turn Order

Turn order is one of the great unused elements in RPGs. It's a shame, because even complex turn orders aren't really using turn orders very well. Turn order can be made an intrinsic part of the gameplay at a much deeper level, and that's part of this design.  
  
Turn order is displayed across the top of the screen, and the player is allowed to rearrange the turns - they can drag their own turns backwards as they see fit.  
  
The reason to do this is because when the player party gets a turn, all of the characters in a row take the same action, each one more powerfully than the last.  
  
This is easy to describe if it's just Anna: if she manages to line up three turns in a row and you pick "attack", she'll attack three times, each more powerfully than the last.  
  
However, it really begins to shine when you have multiple characters. First off, each subsequent attack hits targets in every previous target as well as your own. Because all characters take the same category of action, this will never result in a melee attack hitting everyone that got hit by a fireball: it's AOE after AOE, or melee after melee.  
  
In addition, at higher levels characters gain secondary attributes to their attacks. For example, Anna may use electrical attacks that 'stun' her targets, moving them down one spot in the turn order, while Bob might use a 'smash' that knocks all enemies above him up a row vertically. You could combine these to create quite a string of attacks, much longer than you might normally think is possible, and then lock the enemies in melee so they have a hard time getting down to the vulnerable party members below.  
  
It is literally impossible to give a hero in a chain a different order. So there are lots of times when you'll want to break the chain manually, so you can give a different order to a different hero. Chains are not always the best option - for example, if you have a healer, you often won't want a chain of heal attempts, and you also won't always want your healer to jump forward to participate in a melee.  
  
In addition, mana is shared between all characters in the chain. Characters charge energy by attacking/being attacked, and they have advanced attack options that take up 25%, 50%, or 100% of their max mana charge. Because all characters in a row take the same action, all characters in a row combine mana pools and split the total cost of all of their actions between them. If Anna has 90% charge and Bob has 10% charge, they could perform a 50% mana attack regardless of who goes first in the chain.  
  
The enemies are the same way, of course. Three wolves in a row will all take the same action. The enemies will manipulate turn order as well - not at any particularly cunning level, but like you they will want to break up chains to allow different classes of enemies to use different kinds of techniques. A boss monster doesn't want to get locked into a basic attack chain, for example, and probably doesn't want to waste his mana on shitty mook special attacks... but a mook with a lot of spare mana might get into a chain with a boss specifically to allow the boss to perform a more powerful mana attack!  
  

# Weaknesses

The two previous elements combine well to create a canvas of exploitable weaknesses. The question is: what do you get for exploiting an enemy's weakness, and what do they get for exploiting yours?  
  
I'm thinking that anyone who has a weakness exploited has two things happen to them. First, their state changes, typically to a weaker state - knocked down, shield bashed away, and so on. Rather than being general states, this is specific per enemy and per character. Not every enemy can be knocked down. Not every enemy can be shocked.  
  
Second, next round they are unable to use any advanced techniques, and are limited to attack or disengage.  
  
Third, their turn is moved back one slot - and usually again for every subsequent attack against them until their next turn. If they have multiple turns in the queue, only the first one is moved back... but it's still a very powerful technique that means the target won't get a turn until they have two turns in a row queued up. Contrarily, it also means that when the monster gets back up, they'll have two basic attacks or disengages in a row.  
  
In the early game, weaknesses are less important. But as time goes on weaknesses take center stage, since you want to keep your level low. That means you have more weaknesses, and you need to aggressively exploit the enemy's weaknesses. The problem is that, at low levels, you probably won't have the firepower needed to directly exploit an enemy's weakness. Instead, you'll need to use priming or the limited magic attacks.  
  
Priming is a matter of changing the battlefield conditions to allow you to use more powerful attacks. Typically these are techniques which do little things, in terms of combat. For example, causing it to rain, or slowly regenerating everyone. Once the battlefield is primed with a "half point" of elemental affinity, the basic attacks that normally have a "half point" of elemental affinity combine to create an elemental attack.  
  
This is middle to late game stuff, though - basically, it makes exploiting weaknesses a more cumbersome thing to do at low levels, and also requires you to clearly break up player character turn strings so you can make many different orders. Balancing this against the power of the enemy's offense will be fun.  
  
Of course, sometimes the enemies (and maybe the players) will have special attacks which cause a state change independent of any weakness. For example, a squid boss might be able to grab players and hold them, which really limits their options when it comes to be their turn. It doesn't delay their turn, but you may want to manually delay their turn until someone frees them. While this isn't exactly exploiting a weakness, it is the same kind of tactical, puzzly situation.  
  

# Titanic Enemies

The last thing worth mentioning is that boss monsters don't have to simply occupy one row. You can have monsters that occupy multiple rows, and their pieces count as distinct targets. How these are related can be quite complex: a giant might take up one row for upper body, one row for lower body. The lower body might always have to be exactly one row beneath the upper body, and the upper body might be the only one that attacks. That's quite different from a squid whose tentacles can swarm over any row they like, even submerging and re-emerging somewhere else without worrying about melee locking.  
  
Similarly, the different parts of the boss could have different weaknesses, different weakened states, different parameters of all sorts.  
  
Titanic enemies add a lot of complexity to the battles because it's an excuse to create an intricately linked engine of combat.  
  
If you are reading this line, you're very patient.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:51 AM](https://projectperko.blogspot.com/2014/01/refining-rpg-battle.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4355008538019446966 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4355008538019446966&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [RPG](https://projectperko.blogspot.com/search/label/RPG)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4355008538019446966)

[Newer Post](https://projectperko.blogspot.com/2014/01/on-ludonarrative-babytalk.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/01/parties-and-mechanics.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4355008538019446966/comments/default)
