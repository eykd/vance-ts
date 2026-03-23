---
title: "Design with Stage Constraints"
date: 2013-07-30
url: https://projectperko.blogspot.com/2013/07/design-with-stage-constraints.html
labels:
  - game design
---

## Tuesday, July 30, 2013 


### Design with Stage Constraints

Yesterday [I talked about stage-based design](http://projectperko.blogspot.com/2013/07/staged.html) - stages as in rockets, not as in levels. Read that first, if you like, because this builds on it.  
  
When it comes to building stages, a big part of the fun is the constraints that are put on the construction. In Kerbal, there are four major constraints.  
  
1) Rockets fire downward. Since the primary engines fire downward, there's a very strong limit as to vertical construction. You can't put an engine above another engine and fire them both, because the top engine will destroy the bottom engine.  
  
2) Fuel tanks are heavy and get emptied out. This means that you'll optimally want to shed those heavy fuel tanks the instant they dry up - which means many of your stages are arranged specifically to dump empty tanks safely and quickly.  
  
3) The physics of the rocket restrict how you can build it. Wobble, shear, and strain will rip your rocket apart if you build it clumsily. Unfortunately, in Kerbal this can be fixed by just using struts to staple everything together firmly, so it's not as much of an issue.  
  
4) The tradeoff between vertical and horizontal. You can put a lot of things in a vertical line - especially fuel tanks - but that can get difficult when you want to add more complex devices and behaviors. However, horizontal construction interferes with the line of the other vertical segments, and also creates a lot of wobble - at least until you realize the wobble is broken.  
  
These constraints create a wonderful environment where you can build easily, but the restrictions grow organically as you get bigger. The constraints are all about tradeoffs rather than restrictions, and are therefore a lot more flexible and expressive than a game where you have five hardpoints and you slot in three weapons and a shield. Moreover, the constraints are specifically polished such that they interact with building in stages: you can drop large chunks of your creation as you go along, which means the remainder has a new profile and new performance characteristics.  
  
In my early tests for the "sea and sky" game I talked about yesterday, one thing I ran into was the overly simplistic construction system I created. It's worth considering whether a system with some more constraints could be made more interesting.  
  
Unlike space travel, fuel isn't the biggest concern in the sea and sky game. I think that hull is. Each kind of medium - flight, sea, subaquatic - has a different kind of hull with different characteristics. While the different kinds of hulls can survive the different kinds of mediums, they are definitely a burden, adding weight and drag.  
  
It makes sense that, instead of jettisoning fuel tanks, you'd have to jettison hulls. When you want to go from air to submarine, you need to land the blimp on the surface and then just get rid of the blimp part, leave you with a submarine. Of course, the blimp would have to be big enough to carry the submarine, but that's the joy of the stages approach, isn't it? Each stage must be larger than the last.  
  
However, that theory is all well and good, but how do you make it interesting physically? How do you give the player the clay and push him with tradeoffs?  
  
Well, it's got to be in how the hulls connect up and orient, doesn't it?  
  
It's tempting to simply make each hull contain the next hull, like Russian nesting dolls. But that runs into the same problem as the cargo boxes: there's no tight relationship between the stages. It's just cargo-carrying: they don't share the same physics space. So we want our hulls to exist in the same physics space all the time.  
  
Which means we really don't have any option: the hulls have to all be exterior, at least partially.  
  
The question is: do we arrange the hulls into a single hull, or do we have them separated into distinct hulls which are connected - or, perhaps, both?  
  
Well, distinct hulls is problematic for two reasons. One is physics: both the drag and the physics simulation would be annoying to deal with. Another problem is mirroring: radial mirroring is good, but in our case we would be using x-axis mirroring, which has far more limitations. Either way, due to the way that mirroring works, unless you want multiple final stages it's the earlier stages that have to be on the outside, and that would result in extremely complicated structures. The only realistic way to do it would be to not mirror hulls at all, which would limit us more or less to vertical stacking - not how I want to do it.  
  
Anyway, I think that distinct hulls are a possibility, but I think they should be considered advanced. I'm much more interested in having all the hulls in one line, and then blasting off the back every time you want to activate the next section.  
  
The concern here is that every hull has to therefore be acceptable in every medium. If you have a submarine that launches a ship that launches a jet, then your submarine-ship-jet first stage needs to be able to move around underwater. As long as we understand that, we can simply make our hulls work okay like that. The concern for construction is how to protect or hide away the not-yet-required extensions that only work in a specific medium. Do your plane stage wings have sealed jets on them, or perhaps they are folded away inside and only unfold on the surface. Maybe your surface ship hull actually has turbines operating underneath during the submarine stage, since they are going to be submarine engines even while you're on the surface. How can you optimize? How much fun can you design in?  
  
My thought is that each piece of the hull would be smaller than the next, and therefore be partly nestled within its parent. The ship hull's rear 30% is embedded in the submarine hull. The airplane hull is half embedded in the ship hull. This overlap not only keeps the structural integrity of the hull overall, but also shelters the rear area of the child hull such that delicate and medium-specific equipment can be put there.  
  
I think this design fills a lot of my requirements, especially in terms of how each hull is always partially exposed. How well you can use that exposure, and prevent it from screwing up your other stages is the question. Can your hull fit a fold-out wing section internally? Should you expand it until it can? But then you'll need a larger parent hull... oh, and now you need a jet hull with four substages, meaning that the nose is too long and you've got a difficult time with your wings set so far back... maybe you should use an X-mirror external hull attachment for wings a bit further up as well?  
  
Hm. I think it sounds fun.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:09 AM](https://projectperko.blogspot.com/2013/07/design-with-stage-constraints.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3492035412571962668 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3492035412571962668&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3492035412571962668)

[Newer Post](https://projectperko.blogspot.com/2013/07/recovering-operational-stuff-game.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/07/staged.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3492035412571962668/comments/default)
