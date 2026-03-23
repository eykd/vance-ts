---
title: "Animated Wrinkles in Affixed-Vert clothes"
date: 2014-06-23
url: https://projectperko.blogspot.com/2014/06/animated-wrinkles-in-affixed-vert.html
labels:
  - algorithm
  - mesh
---

## Monday, June 23, 2014 


### Animated Wrinkles in Affixed-Vert clothes

I've been thinking about wrinkles.  
  
One of the problems I have with most clothes even in high-poly assets is that they don't wrinkle right. The wrinkles are typically painted on quite nicely, but if the character bends or moves they do not adapt. I don't know if this bothers anyone else, but it seriously bugs me, because that's a huge opportunity.  
  
There are ways to make clothes have animated wrinkles. Let's cover some, remembering that we're talking about medium-poly game characters!  
  
The first way is to have physics-enabled clothing. As the cloth moves, it is continually recalculated. This is quite expensive and is mostly useful for things like capes and hair rather than compression or twist wrinkles, because you would need a very high-density mesh and a lot of computations.  
  
Another way I've used in the past is to "stutter-rig" the clothes. For example, your shirt might contain a lot of largely horizontal edge loops. Normally, you would smoothly weight them across the various spine bones. However, if you "stutter" them so each row is mapped slightly more or less to various bones, they don't move uniformly when you bend. The result is a cheap way to create compression or twist wrinkles, but the wrinkles are very low-density and have mediocre quality at best.  
  
Another way I've used is to have a lot of skeletal bones specifically for clothing animations. For example, you might have a bone coming down off the front and the back of the knee. These bones would be animated in the standard walking animation to lag behind the lower leg in certain ways. Loose clothes could be partially bound to these bones, which would create a fairly realistic system of lagging behind as the leg moves, naturally creating flare. Unfortunately, these lags do not create wrinkles, and there is a lot of added work for animators and riggers.  
  
Another way is to create shapekeys related to common wrinkle patterns, and drive them using driver bones. While the animations are still a bit annoying to create due to all the driver bones, the end result is deeper and more customizable than the skeletal animation system, because you can etch wrinkles into the cloth.  
  
All of these approaches are mesh-centric. However, in medium-poly clothes, mesh wrinkles are not going to be very precise. This is why most artists paint them into the textures rather than onto the meshes. Or, perhaps, model them in a high-poly mesh, then bake it down to a medium-poly mesh. The end result is the same: the bumpmap or parallax map has wrinkle info.  
  
The problem with this approach is that it isn't animated. If you bend forward, there are no compression wrinkles. If you twist, there are no twist wrinkles. Just whatever you etched into the base mesh.  
  
One possible way to create animated wrinkles is to have four bumpmap textures for your mesh. One is the default, one contains compression wrinkles, one contains twist wrinkles clockwise, one counterclockwise. You can use the vert color channels to mix these in the shader, overlaying the type of wrinkle. Since the verts blend, your mesh will vary across its surface - certain parts compressed, certain parts twisted, and so on.  
  
The hard part of this approach is how those colors get assigned. One method would be to use driving bones, but as with previous attempts, that would mean a lot of added bones and every animation would get more complex.  
  
An easier way to do it would be to hijack the base bone animations. We can approximate when to use compression or twist by simply watching the bones. When the bones rotate on axis, that's a twist. When they rotate on joint, the surface in the path of their rotation gains compression wrinkles.  
  
These can be calculated relatively easily and used to tint the verts. The computations may be fairly expensive, however, because every bone would need to be recalculated every frame, and in each frame we would have to write a new colors array to the mesh object, which is not exactly a fast process if my experiences mean much. Still, if we use distance from camera to disable that for anyone more than a few meters away, we could probably get away with it.  
  
Now, that won't get you all forms of wrinkles. While it might end up looking pretty nice, it doesn't really embody loose clothing - just various kinds of tight clothing. No billows, basically.  
  
Billows could be created in any of the mesh deforming methods explained above, but I'm not a fan of them because they require a lot of effort. There should be no effort involved: we know exactly what the clothing is shaped like and exactly what the body beneath is shaped like, so it should all be calculable.  
  
Unlike most game engines, we do actually know those details - in a very precise way. The affixed-vert system adapts the clothes to fit on an ever-changing body. We know precisely how much space there is supposed to be, even if the underlying mesh has been deleted or changed to prevent pop-through. Moreover, we can also have a "looseness" setting in the prefab for the clothing.  
  
This means we can adjust the exact position of the clothings' verts as we please, limited only by computation restrictions. But - here's the cool part - we can do that in the shader. Much like we use the RGB color channels to overlay the wrinkle bumpmaps, we can use the alpha color channel to cause billowing. Simply put, the more opaque the color, the more the vert is expanded along its normal.  
  
This is a lot faster and less destructive than actually changing the value of the verts in the mesh. It also is not much slower than the technique we used for the wrinkles, since setting the colors is the same price whether they have an alpha channel or not.  
  
The question then becomes "how do we set the alpha channel?"  
  
In order to calculate compression wrinkles, we have to compute whether a vert has been "pressed" in the direction of a bone's movement. This is absolute, not time-based: if the arm bone is levered upwards and then holds there, we get the same compression wrinkles no matter how much time passes. But we only want compression wrinkles on the top of the arm, not on the bottom.  
  
On the bottom, we want billows. Well, as much as the cloth allows.  
  
So when we calculate the bone's levering, we'll be using a simple system of normals. If the vert normals align with the bone motion, the vert is compressed. If the vert normals oppose, it gets billowed. And, of course, there's a weighted blend between the two for verts that aren't perfectly aligned.  
  
We could calculate the distance between the surface and the underlying logical body mesh to determine how much billowing we should allow, but it's actually not a great way to do it, because the cloth mesh is not created as loose as possible: it's created to look decent in normal situations, so it's pressed against the skin. Instead, we would benefit from using a "looseness" rating, either a cloth-wide rating or inherited from the alpha channel of the default mesh as painted in Blender (or whatever). In that way, certain parts of the clothing could be made to billow more or less.  
  
But there is a value in the relation of the surface cloth to the underlying logical body. This is a bit complex, so bear with me.  
  
When we calculate how to morph the cloth, we find the face our cloth vert would fall onto, and we move our cloth vert as far as those points have moved in the base body. So a fat person's belly pushes out considerably from the default mesh, and in turn our cloth does as well.  
  
But since we understand the nature of the changes in the body, we can also react to those changes intelligently if we want to spend some time creating an algorithm to do so. In specific, we could create a much more adaptive kind of cloth mesh.  
  
One of the big things clothes have never been able to do in games is get pushed and pulled like in reality. You can't roll up your sleeves in a game, because there's no concept of it. You might be able to switch to a "rolled up" variant mesh, but you can just arbitrarily roll them up.  
  
Well, you can if we use a smart autorig adjust.  
  
Let's say you want to push your sleeves up. Well, we know what face of the base mesh each vert of the sleeve defaults to. When moving the sleeve verts, we don't move them arbitrarily in real space. Instead, we march them along the body's surface, sliding along the face and folding over to the next one. We can do this very easily by projecting the vector of intended movement along the surface of the face, and recalculating that whenever we move to the next face. If that proves too expensive, we can simply move along the length of the relevant bone.  
  
As the sleeve moves up, it will need to do two things. The first is that it'll need to rig itself properly. It can do this by inheriting bone weights from the body mesh below, rather than using its default bone weights. In this way a long sleeve, pushed up, would become a proper short sleeve and not still be bound to the forearm and wrist.  
  
The second thing it'll need to do - and the reason I'm mentioning this concept here - is that it'll have to wrinkle.  
  
I haven't worked out the best algorithm for wrinkling yet, but it's going to involve simply moving the verts along the base body's normals.  
  
Anyway, that stuff is theoretical, but I know that I CAN do the color channel stuff. So I'll start there.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:07 AM](https://projectperko.blogspot.com/2014/06/animated-wrinkles-in-affixed-vert.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8703057566608561372 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8703057566608561372&from=pencil "Edit Post")

Labels: [algorithm](https://projectperko.blogspot.com/search/label/algorithm) , [mesh](https://projectperko.blogspot.com/search/label/mesh)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8703057566608561372)

[Newer Post](https://projectperko.blogspot.com/2014/06/context-driven-npcs.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/06/play-echoes.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8703057566608561372/comments/default)
