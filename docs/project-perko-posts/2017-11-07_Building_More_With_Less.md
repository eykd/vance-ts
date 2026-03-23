---
title: "Building More With Less"
date: 2017-11-07
url: https://projectperko.blogspot.com/2017/11/building-more-with-less.html
labels:
  - base building
  - construction
  - game design
---

## Tuesday, November 07, 2017 


### Building More With Less

In a "building" game, I always want to use fewer types of parts to build a wider variety of results.  
  
I want the game to feel expressive, like the player can make a bunch of different things with a bunch of different goals.  
  
For example, do you have a "gatling gun" component? Even if I am making a war ship, a "gatling gun" is an inexpressive element. It's going to be the same for everyone, take up the same space, do the same things in the same way.  
  
Which is why you also have a "laser gun" and a "missile launcher" and a "sniper gun" and whatever other weapons you can think of... that's expensive. It takes effort to make them, space to have them in your game, and visual clutter to make them all selectable. Even after all that, they're still not terribly expressive.  
  
**Adaptive Elements**  
  
How about a system where you have a "gun" module, and then you can tweak the settings?  
  
Change the accuracy, the range, the rate of fire, the ammunition type. To keep it balanced, you could use a points system - extra points in accuracy means less points for rate of fire!  
  
If you allow for this, then players can change their weapon loadout to fit the role they want the weapon to fill... and use a lot of fine grain knobs to do it. As long as combat actually interacts with those stats, you've created a method for players to specialize in different combat roles using a very fluid, adaptive system. Depending on the metagame, players might start using unusual combos that canned one-off weapons would never have though of, like sniper missiles or hyper-accurate micro-range burst lasers.  
  
If the settings reflect suitability for different roles in the greater game environment, they'll be great fun! Just makes sure your UI reflects their settings so the player doesn't forget what is what.  
  
**Soft Constraints and Constraint Systems**  
  
Rather than using a "points" system like above, it's better to use a soft constraint that ties into the greater game environment.  
  
For example, each shot generates heat - the better the shot, the more heat. This is conceptually the same as a points limit, but since it leans into the rest of the world, other kinds of game concerns can affect it. For example, what about firing in short bursts and letting the weapon cool off manually? What about attaching extra coolant systems to cool the weapon faster?  
  
In this case, the greater game system we're leaning into is heat management. This makes heat management a "constraint system", and those have to tie into as many different things as possible to make innovative and interesting builds possible.  
  
For example, attaching "coolant modules" to the gun is extremely dull. It doesn't integrate with anything else. But if you have to actually pump coolant, now you have a topology constraint with a lot of possibilities. For example, maybe you want to run colder coolant? Now you need to build coolers. Is your coolant heating up as it moves between the ten things you're cooling? Hm! What do you do afterwards - vent the heated coolant out of the ship where it's likely to be spotted by enemies, or perhaps use it to pressurize living quarters? Run it around the perimeter of your ship to cool it and de-ice your wings? Use it as a low-grade propellant?  
  
Depending on the scenario, the external parameters and concerns will vary - and the player's own ideas and goals will also cause parameters and concerns to vary.  
  
You do need to make sure your UI can handle players grappling with these systems.  
  
**Carry and Produce**  
  
A related concept is 'carry and produce'. What we did in the last example was turn "heat" from a fungible number into a tangible good. Tangible goods offer a much more interesting challenge with more opportunities for fun constructions. This is especially true if two systems combine into a single tangible good - for example, heat combining with a specific kind of coolant into a single good.  
  
While "heat" is simply a number, once we transform it into a complex good, it becomes both a challenge and an opportunity. Is it hot water? Glycol? Cool air? Liquid hydrogen boiling off? Each of these offers different specific challenges, but uses the same fundamental 'piping' mechanic. That same mechanic could allow them to be used in any other situation where either heat or that substrate is used: hot air becomes life support supply. Boiling liquid hydrogen becomes propellant.  
  
This can be done with almost anything. For example, instead of generating "science points", what if you turn that into a tangible good - a science paper which is only converted to science points upon export? Now the science paper can be manipulated in tons of ways to make it more valuable.  
  
Some players might specialize in quick-and-easy science papers for a trickle of science. Others might specialize in massive databanks to hold the papers until they are at the maximum possible size. Others might use supercomputers to refine the data until the science paper is small, but potent. Others might choose to generate science in different ways - often tied into other kinds of systems.  
  
It's critical that the UI supports this - supports the player immediately knowing what is being carried and how it is being massaged. But if you can do that, you can create a wonderful opportunity for depth and expressiveness.  
  
**Changing Conditions and Triggers**  
  
One overlooked element in most construction games is changing conditions. Normally you just optimize for whatever the current situation is and that's that. About the only construction games with changing conditions are ones where you have to survive the winter, and that's often not pushed very far.  
  
To keep using heat as an example: heat in an ice-cold winter is very different from heat under a baking desert sun is very different from heat at the bottom of the ocean or in outer space. Your initial instinct might be to simply make each base have a specific heat condition - this is an artic base, this is a deep-sea base - but that's something only beginners will find challenging.  
  
Increasing difficulty is much more about the swing, rather than the baseline. Optimizing heating systems is more interesting when sometimes it'll be very hot and sometimes it'll be very cold. Designing a space ship that can fly through the atmosphere as well is more fascinating than simply saying "this is a space ship, that is an airplane".  
  
In general, I think of three kinds of changing parameters, each of which increases in swing as difficulty increases.  
  
1) Routine changes. For example, people going home for the night to sleep, or solar power only being available during the day. Combining routine changes can make for very fun results - for example, solar power is only available during the day AND at night a punishing dust storm rushes by, leaving an opaque layer of dust on everything. Now you have to have a setup that cleans solar panels or hides them at night!  
  
2) Catastrophes. These are things outside of your control (although for game reasons the player may be able to trigger them). Fights. Plagues. Crashes. Winter. Holiday shoppers. Typically these are tests for how "disaster-proof" your design is.  
  
3) Scheduled changes. These are things the player causes as their plans advance. For example, holding an election. Traveling to a new planet. Choosing to land. Giving crew leave. Refurbishing the facility.  
  
In order for these situations to be fun, two considerations must be handled.  
  
1) Soft failure. If the player falls short, they should be able to pull through with damage. This is also where beginners will start, so adjusting for failure should be something players can do manually, while panicking. For example, if a storm hits, players have to be able to order people back inside in order to weather it, and the storms should (at least at normal difficulty levels) not instantly kill anything caught out in them.  
  
2) Programmable responses. The players should be able to trigger responses automatically using in-game objects. For example, allowing the player to lower landing gear when a particular sensor registers there's ground below, or automatically ordering people inside and barricading windows when a storm hits. These can be used by midlevel players to handle changes automatically, and by advanced players to create absurdly complex contraptions.  
  
By the way, I am a big fan of moving parts - whole sections of facility that can move around. Normally this is implemented as full-scale facility elements being rolled around, and that's not a great solution because it's extraordinarily bulky. Instead, I recommend parts can fold up and unfold, allowing things to take up much less space when not in use.  
  
An easy example of this: if you need to charge your laser using a big power cable, but also cool your laser with a coolant pipe, each can be folded away into a wall tile. Both can be folded away at the same time if you need to walk past. Then they unfold and fill the space as needed.  
  
Anyway, those are my thoughts on base building. Use fewer parts for more expressive results by keeping these things in mind.  
  
Let me know if you have any opinions.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:27 AM](https://projectperko.blogspot.com/2017/11/building-more-with-less.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2550610084465135159 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2550610084465135159&from=pencil "Edit Post")

Labels: [base building](https://projectperko.blogspot.com/search/label/base%20building) , [construction](https://projectperko.blogspot.com/search/label/construction) , [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### 1 comment:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/16600604942320525041)

[Juami Benito](https://www.blogger.com/profile/16600604942320525041) said...

The way you describe the gun module being this extremely customizable concept, and how many game numbers can provide great gameplay if transformed into tangible goods, reminds me of the way a different genre does it (or at least I think it does).  
Idk if this is relevant or if you already know this but Slay the Spire the roguelike card game has rigidly defined cards (a lot of them, which is expensive as you said) but their use is flexible. Over the many contexts of differing hands/enemies in player turns, the player is meant to try to assemble the correct ratio of offense, defense, and scaling for any particular turn. However, these cards are technically tangible goods, and depending on the way players have built their decks over the course of a single run they can manipulate these tangible goods in many different ways  
ex:  
\-drawing cards accelerates the player through their deck, so the cards they might have been expecting to play next turn they might have accidentally drawn now, and in a few turns their hands would be completely different based on the speed at which they went through their deck  
\-some special cards transfer cards around (put this card on the top of your draw pile, return this card from your discard pile, etc.)  
Based on these, when the player assembles the correct ratio, they're also at the same time accounting for how they'll set up usage of their tangible goods in future turns  
Also the ratio of offense/defense/scaling is completely dependent on the player's tactics; figuring out the best ratio for the entire fight and for each turn such that you take the least amount of damage as you finish the fight and move on to the next is part of the gameplay and so it feels cool that it's like as players we are constantly trying to customize our turns with very unreliable controls (a deck of cards)  
Does this make any sense as an alternative way of mechanizing customizable modules and tangible goods? ehehehe

[10:41 AM](https://projectperko.blogspot.com/2017/11/building-more-with-less.html?showComment=1600450878589#c6474102189301209782 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6474102189301209782 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2550610084465135159)

[Newer Post](https://projectperko.blogspot.com/2017/12/generating-screen-time.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2017/10/difficulty.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2550610084465135159/comments/default)
