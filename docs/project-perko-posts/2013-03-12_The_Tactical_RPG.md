---
title: "The Tactical RPG"
date: 2013-03-12
url: https://projectperko.blogspot.com/2013/03/the-tactical-rpg.html
labels:
  - game design
  - tactical RPG
---

## Tuesday, March 12, 2013 


### The Tactical RPG

This post is about controls, mechanics, and how they influence each other.  
  
The way in which you interact with the game determines a lot about what genres arise on that hardware. The tactical RPG is console-based. That is, it's really intended to be played with a control pad. There have been plenty of releases for mice and tablets, but the core genre is founded on a D-pad.  
  
You can see this most clearly in the linearity of command chains. That is, you select a character. Then you move him - blip blip blip. Then you press A. Then you select an action. Then you move the cursor. Then you press A. And so on.  
  
This is an interface style that ages really badly. It doesn't work real great with mice and it works awful with tablets. Let me go ahead an go into detail as to why.  
  
Each kind of interface has a certain kind of affordance. A d-pad or thumbstick is really great for allowing you to make relative directional motions - that is, specifying direction relative to an in-world avatar. A mouse is really great for allowing you to make ongoing spatial motions - that is, specifying a new point in space with each frame. And a touchpad is good for making spatial indications - that is, marking a place in space. Multitouch can do one better.  
  
These are all very different. Tactical RPGs are really built on the idea of a D-pad. They continually pop in different kinds of cursors and ask you to specify direction. So you have a cursor for movement. You have a cursor for action type. You have a cursor for picking a spell. Then you have a "press A to attack/B to cancel" prompt. It flicks through these different contexts very rapidly and fluidly because the controller is a means of specifying direction, rather than position.  
  
On the other hand, using a mouse for this kind of interface is a pain in the ass, because you have to keep reorienting yourself to new spaces. Now the active space is the map focused on the selected character. Now the active space is the action menu. Now the active space is the spell menu. Now the active space is the yes/no option. Each time, our in-world cursor's location is invalidated and becomes relative to a whole new slew of options. We have to reorient each time, and it's a pain in the ass.  
  
Tablets are slightly better at this simply because you literally tap the location. There's not much reorientation going on, because there's no in-world cursor to reorient. Still, there are probably better ways to do it.  
  
To me, this is the heart of the tactical RPG's flaws. And you can see the modern tactical RPGs are attempting to address those flaws (typically by cutting down on the number of menus or making extensive use of keyboard shortcut keys), but the flaws are at the heart of the genre. The genre is built around the idea of telling someone to go to a specific place and do a specific thing, over and over and over. Telling someone - IE, an object in gamespace - to go someplace relative to where they currently are, and then to do one of any number of action options. It's obviously built specifically for a control where you specify directions relative to current position and traverse menus rapidly.  
  
If we want to rebuild the genre, we need to address this. Even on a console, this method is getting old, because menus and tiles are really d-pad territory rather than thumbstick territory. So even if we choose to rebuild the genre for the console market, we would need to change the core interaction.  
  
A tactical RPG is really about two things.  
  
1) Front-loaded character complexity. That is, managing and tweaking your characters outside of combat.  
  
2) Positioning your characters well in response to changing battle conditions.  
  
So, first things first. Ditch the action menu. One option is to make it so that literally everything is contextual... but that might be going a bit too far. Another option is to use an option HUD like XCOM or Starcraft. In our case, instead of the option HUD being about taking an action, it'd be about switching modes.  
  
So select a character and, if you want to switch modes, switch modes. Otherwise, tap or click in a valid place to move there and do what your current mode indicates.  
  
More agile context sensitivity can really boost this into clarity. For example, you tap your fighter. Above the head of every enemy pops up an estimate of how much damage you'll do, how many attacks, etc. You don't need to manually select an enemy to determine whether your attack will do what you want. Similarly, tap or mouse over an enemy and their damage capabilities hover over your heads.  
  
The new Fire Emblem game gets halfway there: you have a really nimble and exceptional way to monitor how enemies can move and attack, but it is limited by the size of the screen. The units are so small that it can't realistically put damage indicators above them. Let's go ahead and assume we have more pixels to work with and do just that.  
  
Both Fire Emblem and XCOM use menus, but they're console-based. Menus are generally a bad idea in tablet and PC games - they work okay at the beginning and end of a level, but they interrupt the flow of play considerably if used for every character action. An omnipresent HUD-button interface is okay, if you have space. On tablets and phones, you can probably get away with a large, simple popup menu, but on a PC the continual mouse-reorienting would be very annoying.  
  
Because we can't use complex menus, we'll write off the ability for the player to make complex noncontextual decisions. That is, the player will no longer be able to pop up a "use items" menu, or choose between ten different spells.  
  
To make up for that, we'll amp up the complexity of the player's existence in space. Amp up contextual options.  
  
To do that, we have to up the interconnectivity of units, both with each other at long and short ranges, and with the terrain at long and short ranges. We also need to add some automated position changes that the player will need to take into account: plenty of knockback attacks from both sides of the combat, a lot of reactive dodges and reorienting.  
  
The design I've created to do this involves a lot of specific mechanics. It may seem like a lot, but it's actually somewhat simpler than most other tactical RPGs. By their nature, tactical RPGs are complex beasts, with loads of different classes of attack and ways units die and don't die.  
  
Without going into more detail (this this is long enough), I stress knockbacks, team-ups, and shoulder-to-shoulder formations. There's also a lot of conversion - that is, a tile, enemy, or hero transforming into something else when conditions are met. So I make the evolution of the battle more complex than it usually is, because I can't make the moment-to-moment participation in the battle as complex as it classically was. Basically, instead of twenty actions you can take with any given character, there's only two or three, but you can take them in much more complex and open-ended ways, and the overall progression of the battle is not as straightforward.  
  
The difficulty with this system is that we've all grown accustomed to the "language" that tactical RPGs speak. Introducing these new mechanics instead of the old ones will require several tutorial stages. Like the new XCOM game, you introduce progressively more complex elements as the game advances. You can't simply have one giant tutorial that continuously dumps crap on your head - it'd be too much.  
  
Which brings us to the nature of tutorial stages, another topic that would take at least this long to talk about. But this is already stupidly long, let's stop.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:07 AM](https://projectperko.blogspot.com/2013/03/the-tactical-rpg.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2935717259908849379 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2935717259908849379&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [tactical RPG](https://projectperko.blogspot.com/search/label/tactical%20RPG)


#### 3 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/14426831179317577197)

[Random\_Phobosis](https://www.blogger.com/profile/14426831179317577197) said...

Speaking of controls, I was shocked by Jagged Alliance: Back in Action and somewhat disappointed by the new XCOM interface.  
Jagged Alliance 2 and Silent Storm weren't ideal, but they were considerably better.  
  
In my opinion, the PC's strongest point is that you can have multiple control areas (game board, inventory, party roster) open at the same time and shift attention between them at will, while on consoles, due to screen resolution and d-pad constraints, the focus belongs to single control area at a time.  
  
There should be a window with all your team, with collapsible inventory screen. There should be a window which lists all the enemies. There should be a minimap. There should be some kind of objectives overlay. Everything should be clickable and expandable. It worked in 800x600 , it will work in 1920x1200.  
Oh, and if there's no way for the designers to eliminate obvious choices from the game (like target the closest or weakest enemy), spacebar should suggest them.

[2:45 AM](https://projectperko.blogspot.com/2013/03/the-tactical-rpg.html?showComment=1363167936005#c9196823627647645195 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/9196823627647645195 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](http://danielprimed.com/)

[Daniel Primed](http://danielprimed.com/) said...

No don't stop! I'm really enjoying reading this. :)  
  
Lately I've been thinking about how to repair some of the issues in my favourite SRPGs (more so in retaining depth while pairing back the complexities of the abstract systems), so I think our ideas overlap a little. Here are my ideas in brief:  
  
\-stripping back the RPG systems so that you're only assigning a few key abilities to each unit. Each of these should be worthwhile and there should be a limited number of slots.  
\-using a rock-scissors-paper approach to classes and magic (where units strengths and weaknesses are determined by their class, shown visually)  
\-increasing the effectiveness of terrain and formations (moving the complexity to the battlefield, where it can easily be read via form fits function as opposed to text and stats).  
\-adding more variable conditions to the environment which add new wrinkles of strategy (lava that moves towards the player, avoiding search lights that follow pre-determined patterns, etc).  
\-adding more organic systems that can be represented on the battlefield (like "burning aura" from Jean d'Arc).  
  
I still have a lot to think about, but these are my initial ideas. I think that many of these points also reduce the need for menus and different modes of control. What do you think?

[4:31 AM](https://projectperko.blogspot.com/2013/03/the-tactical-rpg.html?showComment=1363174267142#c7493624906729930013 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7493624906729930013 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

@Random\_Phobosis:  
  
I think contextual information overlays and popups are critical. But I'm not so sure about contextual option popups (such as "choose an action after moving"). It seems like a bad way to ask for a boring thing.  
  
The permanent floating menus ("button HUDs") are usually used to offer context-FREE information an options. For example, in Starcraft they contain the minimap and facility management buttons, and switched over to showing selected unit stuff only once in a while. In World of Warcraft, they show you all the items and skills and maps that are useable at all times, rather than being very context-sensitive.  
  
So I guess my question is: why do you need multiple control areas? What are you controlling? Are you sure that it's something you actually want to be controllable? Does it add to the game to be able to control that in such detail?  
  
I don't think I'd simply say "no", but I will say it seems slightly clunky.  
  
@Daniel Primed  
  
I have most of the same ideas, although my design features two completely different types of enemies (ghosts and ghouls) that react very differently to different things and attack in different ways. Further complexity is added because ghouls will turn into ghosts if their bodies are destroyed or purified, while ghosts turn into ghouls if they can find something to possess.  
  
So I've tried to make it not just the battlefield that evolves, but also the enemies. Over the course of the battle, the enemies are not static.  
  
Moreover, it builds a very straightforward RPS-type structure. Our spiritualists beat their ghosts beat our warriors beat their ghouls beat our spiritualists. Combined with different positional characteristics, it should make for interesting battles.

[7:37 AM](https://projectperko.blogspot.com/2013/03/the-tactical-rpg.html?showComment=1363185446938#c4533832386287241197 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4533832386287241197 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2935717259908849379)

[Newer Post](https://projectperko.blogspot.com/2013/03/balancing-tactical-rpgs.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/03/rethinking-mmo-combat.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2935717259908849379/comments/default)
