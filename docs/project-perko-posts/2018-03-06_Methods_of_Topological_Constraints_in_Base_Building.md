---
title: "Methods of Topological Constraints in Base Building"
date: 2018-03-06
url: https://projectperko.blogspot.com/2018/03/methods-of-topological-constraints-in.html
labels:
  - base building
  - game design
---

## Tuesday, March 06, 2018 


### Methods of Topological Constraints in Base Building

I love base building games, and I love it when the base building is a challenge.  
  
Most base building games are spreadsheet games where the checkboxes happen to be on a map somewhere. There's rarely much in the way of topological challenges - it's mostly a matter of building the right things in the right order and dealing with whatever semirandom challenges the game throws at you.  
  
But I like topological challenges. So here's some methods to introduce topological challenges and constraints.  
  
**Time compression** is by far the most common method. Most base-building games feature inhabitants which walk around your world, and they only do their jobs when they're at the right place. Since time is dramatically accelerated, this means that the time they spend going from A to B is a major part of their day. You can see this in games like The Sims, Dwarf Fortress, and any base building game with people that walk around and time that passes.  
  
Personally, I don't much like this constraint. It is overused. It's especially bad in games where the worker AI is semiautonomous: you can't really optimize the worker's habits and instead just have to dully crowd things together and hope it works out.  
  
**Connective constraints** are also quite common. This is when base component A has to be within X distance of base component B, or you need a physical wire, or some other method of constraining the shape of the base by requiring things to be within certain ranges of other things. Often this only applies to specific types of facilities - typically electrical. For example, in Fallout 4 and Rimworld you need to wire up your bases for electricity.  
  
Some games are much more constrictive. For example, in MewnBase you have to have every pressurized unit connected directly to another pressurized unit. In Space Engineers, booster elements have to be directly attached to boostable components.  
  
Some connective constraints are so common and natural that we don't even think about it. For example, every base-building game where you can build vertically requires the next story to be built on top of the previous story. This kind of "crushing constraint" we'll talk more about later.  
  
**Simple topological constraints** is when you can only build in specific places, and the explanation is very bluntly "you can't". For example, in Dune you can only build on concrete, and extending your concrete is a major factor. In fantasy citybuilder, you might only be able to build on the valley tiles, and not on the mountain tiles. You can't build over there because you can't build over there. Simple.  
  
This is typically a level-bound constraint - that is, the player is challenged to make their facility work within the constraints of the level. The connective constraints we discussed before are module-bound constraints instead - that is, these modules have the same constraints regardless of the level you're on. The two typically work in conjunction to put a lot of pressure on a player. These two constraints working together have produced some of my favorite base-building games.  
  
**Perimeter constraints** are when there is a fitness test waged against your base in a topologically consistent way. For example, a windstorm blows through every month, always from the same direction. Invaders spawn at the edge of the map and march towards you. Space lasers hit your battleship from predictable directions while you're in battle.  
  
While there are many kinds of fitness tests, these perimeter constraints deserve special attention because they are topologically enforced. This isn't you running out of gold or whatever: there's something producing stress on your topological perimeter, and you have to build your perimeter specifically to deal with the threat. Extending your base is often expensive simply because you have to start with your defenses!  
  
Some perimeter constraints are more brutal. For example, if the island is constantly sinking, so after a while all your perimeter buildings are simply erased.  
  
**Topological stress constraints** are similar to perimeter constraints, except they're not based around your perimeter. This is commonly used as a secondary enemy type in enemy-centric games. For example, teleporting troops pop up in the middle of your base, or there's lightning strikes that hit randomly somewhere in your facility.  
  
These produce topological stresses, but at semirandom locations. For example, in Evil Genius, one kind of hero would dig through the walls of your base and pop up inside. The places they can arrive are predictable, but typically well inside your defense perimeter.  
  
Building your base to withstand these arbitrary pressures is quite a challenge, and typically these sorts of threats are considered advanced or high-level, since building a functioning base in the first place is the main challenge.  
  
There are other kinds of topological stress constraints:  
  
**Self-induced topological stresses** are similar, but these are topological stresses you create with your own engineering. In a space ship game, this might be heat: you can't fire your lasers for long because you didn't put in enough nearby cooling. In a fantasy game, it could be height: building a skyscraper in Medieval Engineers is challenging because of the physics of building tall stone structures.  
  
Personally, I think self-induced topological stresses are the most fun. I like to change connective constraints into self-induced topological constraints by adding in concepts of quantity, speed, and gravity. For example, many base-building games allow you to pipe water. In most games this is a simple connective constraint - pipes must connect to pipes. But if we introduce some basic physics, we create a lot of interesting new challenges.  
  
At lower levels, piping water would be basically the same as if we were just doing connective piping, because that's how the physics is weighted. But when we try to bring in a lot of water, or water under high speed, or lava instead of water, we have to get really clever. Imagine trying to build a medieval castle and figuring out how to pipe in lava, or maybe using high water pressure to create a defensive cannon.  
  
**Moving constraints** are rarely seen, but they are simply topological constraints coming about because you can move portions of your base. At the most basic level, this can simply mean locking the doors or raising a drawbridge when enemies attack. At more complex levels, it might involve sliding ladders, moving staircases, inflating rooms, tuck-away furniture... but I think this concept can be pushed far, far harder. We just generally don't think about it much.  
  
**Constraint Result Types**  
While we've talked about the kinds of constraints we might see, it's also worth talking about what happens when the constraint hits a fail state.  
  
"Hard" constraints aren't ones that are difficult, they're ones which literally cannot be failed. You can't build on mountain tiles. You can build levitating buildings. If you somehow manage to get into an illegal state, the facility is erased - it collapses, explodes, etc.  
  
A medium-hard constraint is one where you can get into an illegal state, but if you do, the facility doesn't immediately vanish. Instead, it is simply nonoperational or begins a countdown to death. This is often found with things like not wiring up your power-hog modules: the player is allowed to realize their mistake (or plan ahead by building illegally), then fix it up afterwards. This is also often found with things like structural stresses: the overstressed pipe doesn't immediately explode, first it springs a leak.  
  
A soft constraint is where there's not really an "illegal" state, it's just that the state gets worse the more stress you put on it. For example, as you route more electricity through a wire, it gets hotter and hotter and you have to deal with the heat output. Or the taller your building, the thicker the lower story walls get, until they're so cramped that people can't even get through.  
  
Anyway, those are some of my thoughts, mostly to myself. Let me know if you have any opinions on the matter.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:28 AM](https://projectperko.blogspot.com/2018/03/methods-of-topological-constraints-in.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/9155708011582198552 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=9155708011582198552&from=pencil "Edit Post")

Labels: [base building](https://projectperko.blogspot.com/search/label/base%20building) , [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/9155708011582198552)

[Newer Post](https://projectperko.blogspot.com/2018/04/a-simple-game-about-huge-space-nations.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2018/02/constructive-difficulty.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/9155708011582198552/comments/default)
