---
title: "Modular Space Planes"
date: 2017-03-29
url: https://projectperko.blogspot.com/2017/03/modular-space-planes.html
labels:
  - game dev
  - modeling
  - space ships
---

## Wednesday, March 29, 2017 


### Modular Space Planes

So, in The Galactic Line, you build space ships out of modules. Therefore, I model and texture the modules, animate them as needed, and so on. It's reasonably decent.  
  
It inevitably results in an "industrial" look. The modules get slapped together in whatever way seems best. Even though you're not locked to a grid like in many voxel space ship games, you're still working with parts that have a fixed size and shape, and their seams will always look heavy and industrial.  
  
Moreover, repeated parts will always be the same size, so you tend to end up with straight lines and boxy profiles. This is especially noticeable with habitable areas, since you rely on door-to-door connections, and that typically means all your habitable areas have the same connection profile - leading to straight lines and flat profiles.  
  
Most space ships that are properly designed have flowing lines, tapered elements. They feel almost organic.  
  
That's a high bar for modular spacecraft. Flowing lines and tapers are tough to do in modules, because baking them into the modules means the modules can only be assembled in one order, and with no missing parts. No reason to make it modular, then!  
  
I've been struggling with this as I try to make a spaceplane set, so let's talk about a few methods to make modular ships have flowing lines.  
  
1) Algorithmic tapering  
  
It is possible to adjust the meshes of the modules to taper according to some algorithm. You can easily make a fuselage of modules into an organic tapered shape. This has some problems, though.  
  
First, it can't mask the seams of the modules. This means most of the modules have to have identical connectors, which radically limits the overall look. It's always going to be a tapered fuselage, just with different surface greebles representing the different parts. More complex seams are possible, but the tapering won't mask them, so you'll need to be aware of that.  
  
Second, if the modules have interiors, it's going to screw up the tapering. A room that shrinks or grows might become inaccessible or out of proportion. If the rooms are size-locked, now you have a problem where the windows need to stay attached to the outer hull, so now there are specific sub-elements of the mesh that must be scaled at different rates to get the final taper. Interior halls twist and grow, room ceilings rise while the rest of the room remains the same size... it's a mess.  
  
Without R&D, tapering could only be applied to non-habitable elements such as engines, tanks, machinery, etc. I don't know if that's worth the effort.  
  
2) Masking elements  
  
Slipping coats on the outside or shims on the inside is perfectly possible. For example, if you want your straight fuselage to take on a triangular shape, slip on a triangular bit of armor around it. Any shape can be mimicked like this, and the flow of the ship profile can be built primarily out of these masking elements instead of their contents.  
  
One problem is precisely that: the flow of the ship is mostly determined by specific masking elements, and is therefore pretty restricted.  
  
Another problem is that the masking elements inherently conflict with the surfaces they mask. If you're turning a straight fuselage into a triangle, then the windows on the fuselage are now, at best, recessed several meters into a concave pit. This is substantially worse if your fuselage modules have significant surface elements, such as bay windows, solar panels, machinery, or inflatable areas. Masking elements constrain what you can put on your core modules and where, meaning that they may look 'unfinished' when not masked.  
  
It is possible to do the opposite. If you have a split body rather than a fuselage, you can slowly move the elements apart or together and fill in the interior gaps. This is a fairly robust approach, but it means you'll have twice as many parts, twice as many halls. From a simplicity standpoint, it makes the most sense to "shim" with a hallway rather than a hull part, making the core hallway widen or narrow or have gathering points to change the flow of the profile. This can work, but care needs to be taken on how the attached rooms actually attach. Otherwise it will still end up looking very linear and dull.  
  
3) Adaptive sizing  
  
It's possible to set up the individual elements with blend shapes or bone animations to slightly change their shape. This is fairly adaptable, since it is per-part, but it does require that the linking areas remain interconnectable. So you can't go too off-the-wall.  
  
This can be used to taper elements, but they would all have to have the same basic taper characteristics in order to connect without big chunky seams. Perhaps more feasibly, it would allow you to raise or lower the exits, which would break up the linearity without feeling too forced and without any complex interconnectivity requirements.  
  
Of course, you could also just make some parts have a rise or fall inherently, which would accomplish the same thing. This would force players to accept specific patterns of shapes, but it's much cheaper.  
  
4) Painted hulls  
  
Another option is to let the players place the rooms/modules, then adaptively generate the flowing hull. This wouldn't be too hard - a convex mesh calculation with some holes cut for the windows and panels you want to expose. However, since I haven't done it, I don't know how good the result would really be. "Shrink-wrapped space ship" seems like it might be a bad look, and you'd need a lot of smart texturing algorithms.  
  
Even with that approach, you'd still need to use offsets to keep the habitable areas from going excessively flat.  
  
A subset might be possible. "Adaptive surfaces" are less difficult that fully generated ones, and it might be possible to create masking elements that "melt" into the existing objects, including making way for elements that need exposing. This is a bit of a challenge, but not as excessive as generating the full hull. Also, it'd allow for a lot more control over what the ship ends up looking like  
  
A super-easy subset would be adaptive surfaces that have shapekeys built in. The various shapekeys align with various shared shapes among the modules, allowing you to adjust the hull to fit properly. This is a big step up from simply allowing the meshes to overlap, but it does mean you'd need to have only a few, very common shared shapes.  
  
...  
  
Anyway, that was my very technical essay on a specific thing I'm doing.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:53 AM](https://projectperko.blogspot.com/2017/03/modular-space-planes.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/109018099102325085 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=109018099102325085&from=pencil "Edit Post")

Labels: [game dev](https://projectperko.blogspot.com/search/label/game%20dev) , [modeling](https://projectperko.blogspot.com/search/label/modeling) , [space ships](https://projectperko.blogspot.com/search/label/space%20ships)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/109018099102325085)

[Newer Post](https://projectperko.blogspot.com/2017/04/intense-gameplay-balance.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2017/03/what-plot-would-you-write.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/109018099102325085/comments/default)
