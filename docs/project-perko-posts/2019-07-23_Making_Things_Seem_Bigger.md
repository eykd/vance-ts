---
title: "Making Things Seem Bigger"
date: 2019-07-23
url: https://projectperko.blogspot.com/2019/07/making-things-seem-bigger.html
labels:
  - game design
---

## Tuesday, July 23, 2019 


### Making Things Seem Bigger

One thing I love about video games is that I can make things as big as I want.  
  
However, I've quickly learned that bigger isn't always bigger.  
  
The human brain uses a lot of specific techniques to "feel" how big something is, and those are not the same techniques a game uses to render bigger things.  
  
As a result, a lot of indie content is overly huge... but doesn't feel big. It just feels boring.  
  
So my focus now is on how to make content feel bigger without actually making it that big.  
  
This shares a lot of techniques with various architecture, theme park, and interior design practices, but it's distinct from them because we're working with something that doesn't actually exist.  
  
With that in mind, here's some half-formed ideas I had about it. Feel free to chime in.  
  
\---  
  
One thing is to "clutter" the right amount.  
  
Say you have a 10mx10m area. That's about the footprint of a small house. How do you make it feel big?  
  
Well, one way is to declutter. If the area is wide open, flat, and brightly lit... it'll feel bigger. But it'll also feel empty and pointless when you move through it.  
  
Another way is to clutter. For example, if we put in islands of furniture, maybe add some pillars... we can add a lot of density to the space. In this case it will feel smaller to the eye, but it'll feel much larger and more interesting when you actually move through it.  
  
We can probably get the best of both worlds by using "zoning" tactics instead of simple clutter tactics. For example, using different flooring types to cut the room into areas, adding a raised or lowered section, creating drop ceiling elements, using ceiling topology to create complexity up high, adding lights that create patterns or focal points in the corners... these keep the room feeling large to the eye, but still make it feel detailed as you move through it.  
  
If I was creating a complex level, I might focus on decluttering on neighboring spaces the player won't travel to much, so I can make them physically smaller but feel like they are quite large when glimpsed by the player. Spaces with dense gameplay, I might use clutter to reduce travel times and create overlapping concerns. Spaces with a moderate combination of both gameplay and travel might focus more on zoning...  
  
This is a really basic example, but I wanted to show that what I'm thinking about is not simply "how to make things look bigger", but "how to make things feel bigger as you move through them". After all, video games are interactive.  
  
\---  
  
If you are walking up to a space ship, how can you make it seem like a really big space ship?  
  
How about if you're flying up to one? Swimming? Teleporting?  
  
Controlling the kind of movement the player is using is critical, because that's how you amplify the size of a ship.  
  
For example, if the player is walking on the outside of a ship, the ship is basically terrain, very close to the player's face. Even small ships like fightercraft can feel very large if you're clomping across their wings in magnetic boots! They'll feel even bigger if you're going hand-over-hand along a guide rail, your helmet a mere foot from that same wing surface...  
  
If the player is coming in from a distance, it's important to allow them to feel the distance of the ship by giving them nearby motion. For example, walking through gates, or passing through a cloud of debris, or walking past parked cars. To amplify this, the nearby motion does not have to be parallax: as you approach the ship, cars drive past you away from the ship. Barriers lift in front of you. The wind kicks up a dust storm. These motions will help to give the ship a sense of scale, even though they're not technically parallax.  
  
The ship itself is also optimizable.  
  
One thing you can do is simply add elements of scale to the ship, like a heavy crane loading up cargo, or a worker squatting on the wing, touching up the paint. These are things that we think we understand the size of, so our brain will naturally get a feel for how large the ship is. If they're slightly undersized as compared to what we expect, then the ship will feel oversized: workers should be crouching or kneeling to reduce their apparent size, cranes can be built with "heavy industrial" feel even when they're medium industrial size, etc.  
  
The ship itself has a particular layout that can be optimized to create parallax. Smaller ships should have protrusions and/or limbs: head, wings, engine nacelles, antennae or cannons that stick out. These need to stick out in directions that create parallax: having an antenna stick up is good to create a sense of presence, but it doesn't create any parallax unless it's sticking outward. Things like antennae should have lights at the tip: this will make the parallax clearly visible and also make the ship feel larger at greater distances since the lights will define a perimeter.  
  
Larger ships can be thought of as places rather than things. For them, it's more important to create an approach vector that creates nice views, rather than having protrusions. If the player is moving towards a large ship on a curved approach to dock or enter on a specific spot, that will allow the player plenty of time to see the parallax grow as they get close. However, if the player is approaching on a direct path, the parallax will be minimized.  
  
Entryways like docking bays and gangways should be nestled into concave areas. The surrounding protrusions will create a sense of parallax as you move towards or away from the entrance. So... overhangs, side braces, giant clamps, whatever you can do.  
  
You can also use "bristles" on ships, large or small. Any kind of semitransparent lattice will work, with the idea being that regardless of your approach vector, these will have noticeable parallax. Lighting concave areas and areas behind the "bristles" will also produce a lot of changes as those regions become more or less visible due to parallax.  
  
If the ship has large topologically uninteresting zones, add lighting or paint elements to create demarcations. They don't have to be visible at large ranges, they're specifically to break it up when the player gets close, so faint greebling or motion-sensor lights are plausible.  
  
In addition to parallax tricks, you can use a million other tricks. Small ships can "bulk up" when parked by raising their wings, opening their canopies or fueling covers, half-ejecting fuel rods. How heavy they feel is also a factor: do the feet sink into the ground? Does the howling wind knock their antennae around but leave them unbudged?  
  
There's also things like atmospheric effects, depth of field, and converging lines to think about... placing a parked ship noticeably above or below the horizon will make it seem closer, while on the horizon it will feel further away. Therefore, small ships should park on the horizon line and large ships should park above or below it... keeping in mind that the player's horizon line is determined by camera height, not by eye height or walkway height, so approach vectors should have ceilings to force the player's camera into a predictable horizon line.  
  
And that's just the exterior...  
  
\---  
  
Making areas feel big on the interior is perhaps even more critical, because you don't want the player to have to walk long distances inside of a building or space ship. So things need to feel big without being big.  
  
Level design conversations about this are not impossible to find, but here's some basic tips I'm eager to try:  
  
Windows or overlooks onto interior spaces, not just exterior windows. Central spaces with complex traffic patterns, including multi-floor elements.  
  
Clean straight paths through cluttered rooms with a clear view of the next room, curved paths through larger, uncluttered rooms...  
  
Light the corners more aggressively than usual, but while remembering to break the cubey feel of corners. IE, stick well-lit furniture into corners.  
  
Use cut-out alcoves to create workspaces, rather than putting workspaces into the main floor area.  
  
Trying "false windows" instead of Jefferies Tubes: IE, a grate or transparent panel with a largish, lit area behind it.  
  
Having screens default to scenery instead of black.  
  
Using the wall lines common in sci fi to enhance the size of the room instead of just making it feel cluttered. This is easiest on scales larger than a small hallway: for example, in cargo bays. One critical part of this is to use lighting in any sci fi recesses: IE, if you have a head-height outwards bend, put lights in it.  
  
Use furniture/functional elements that take the room's major axis into account. For example, if I want a hallway to feel shorter, I can use vertical banding (braces and bulwarks). If I want it to feel longer, I can use horizontal banding (stripes and shelves).  
  
Using small rises and falls, both in large rooms and in chains of small rooms. The rising and falling can be floor, ceiling, or both.  
  
Create centerpiece elements that aren't actually in the center of the room, since players shouldn't be using 100% of the room evenly. Centerpieces should make the room feel larger when you're passing by, and usually only one or two edges of a rectangular room are travel lanes.  
  
Interrupt the flow of a room logically, but not visually. Using glass, transparent hologram, floor and ceiling patterns...  
  
And I want to try adding things like diffusing drapes and frosted glass rather than just big heavy metal doors.  
  
\---  
  
So that's what I've been thinking about this week.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:50 AM](https://projectperko.blogspot.com/2019/07/making-things-seem-bigger.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3191100891465337738 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3191100891465337738&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3191100891465337738)

[Newer Post](https://projectperko.blogspot.com/2019/08/topological-construction-play-with.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2019/06/space-survival-gameplay.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3191100891465337738/comments/default)
