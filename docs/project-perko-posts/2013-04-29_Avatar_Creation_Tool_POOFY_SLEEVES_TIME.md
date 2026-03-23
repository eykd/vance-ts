---
title: "Avatar Creation Tool: POOFY SLEEVES TIME"
date: 2013-04-29
url: https://projectperko.blogspot.com/2013/04/avatar-creation-tool-poofy-sleeves-time.html
labels:
  - characters
  - modeling
  - unity
---

## Monday, April 29, 2013 


### Avatar Creation Tool: POOFY SLEEVES TIME

TECHNICAL POST  
  
I've made a lot of progress on the avatar creation tool, after two weeks wasted. Right now, you can paint clothes in multiple layers, and then rearrange the layers, move them to different avatars, and so on.  
  
For example, you could paint a shirt. Then you could paint chainmail. The mail would be a specular rather than diffuse material, it'd be bumpmapped properly, and the shirt would show through the holes. You could then switch the order, putting the shirt on over the chainmail. The shirt (assuming it was 100% opacity) would obscure the mail, but the mail's heightmap would make the shirt bumpy in a muted version of the mail's bumps.  
  
Also, you can paint on wrinkles and thickness, and you can paint skin as well if you want tattoos or warts or whatever.  
  
This actually works really well. I am very happy with it. But this is all texture/bumpmap stuff. Meaning that your arm will always be shaped like your arm. This is fine for tight sleeves, but if you have poofy sleeves at all, you'll need to actually modify the mesh.  
  
Originally, the plan was that I would create modified versions of the mesh, and you could just select which one you wanted to use. Your shirt is based on the short sleeve mesh variant, or the poofy sleeve mesh variant, or whatever. It'd be a lot of work, not just because I would need to create a ton of variants, but because every variant would have to be mapped to the half dozen body shape keys/morph targets so that each would look correct on beefy people, fat people, and so on.  
  
But... the success of this in-unity clothes generation means I'm rethinking that. Is there a way to allow the users to create their own mesh?  
  
Sure!  
  
First off, it's easy to actually modify or create meshes. The hard part is determining what to create, how. And UV mapping it.  
  
Let's say that you're building the top half of a Disney princess dress - floofy and pastel. You want the shoulders to floof: right now, they're just that frosting-colored blue painted right on the skin, like a tight shirt. So you switch from texture paint mode to mesh edit mode.  
  
You mouseover the shoulder and scroll-wheel up. The shoulders inflate along their normal. Perfect. Your shoulders are floofy.  
  
That part is easy. It's just another morph target. Morph targets are stored as "Vertex N offset by XYZ", and that's literally what you're doing. Except we would store it in a 4D Vertex, where W would be the normal. By allowing it to be offset by the normal instead of (or as well as) XYZ coordinates, we allow for bodies that are different shapes. This probably isn't a big deal with shoulders, since most people's shoulders are roughly the same shape, but it really matters when you're trying to do armor on a fat guy.  
  
Oh, is it not flounced quite right? Click and drag to move the vertices around with a grab brush. Again, very easy. Now the morph target is offset by a multiple of the normal and a certain XYZ value. Mousewheel down to pull the point inward...  
  
You can use this trick to do mesh digging as well as floofing. Let's say you want to make someone with a robot arm, so you want the arm to have actual indents along metallic tracks. You paint the metal tracks, then you mousewheel down to pull the vertices in along their normal, digging into the mesh.  
  
This stuff is the cake. The hard part starts now:  
  
You want a sleeve. That is, you want a short sleeve that stands slightly away from the arm and the arm is within it. You don't want to simply modify the arm's size. You want to create more mesh around the arm.  
  
Let's start with the UI. It's the same. The user mousewheels up on the sleeve. The algorithm detects the edge of the clothing you've painted, and says "okay, this texture ends between this vertex and the next vertex on the triangle. So I can't just move this vertex, that would affect a region not covered by the texture. I have to tear it."  
  
So it clones the vertex, lifts it along the normal of its parent vertex, and creates tris trying it back to its parent mesh on the shoulder side while leaving it detached on the elbow side. A sleeve. It's got the same bone weights and tracks fine.  
  
Mousewheel down, it retracts towards the parent until it merges and vanishes.  
  
Want your poofy edge to have a poofy shoulder? Mousewheel up on the shoulder. This is all connected space, so it doesn't detach from the parent model. Only the edge points detach, meaning that your model only gains a few vertices instead of cloning vast amounts. Depending on the quality of the model, this may actually go in a few vertices: the point is that the sleeve gives the indication that there is an arm up it, so the detached portion does have to have a certain depth.  
  
Collars or unbuttoned fronts or whatever all have the same method, except that with collars you'd want to drag the new vertices down and out so that they fold over properly. That may actually require a special function, since otherwise they might be attached to the neck bone rather than the chest bone. Still, it's not that bad - a "reparent to closest vertex" would do.  
  
If you did want to create something that is an entirely separate layer, that'd be a slightly different system built on the same principle: instead of editing the base mesh, you'd create a clone of the base mesh containing only the vertices that are covered by the texture, then edit that.  
  
In both cases, these vertices can be stored in the exact same WXYZ from N framework that we used for offsetting parent vertices. Except, instead of moving the parent vertex, they clone it.  
  
However - this is the rough part. They can't clone the UV map location of the parent. Instead, they have to create a new UV map position for their tris, and cut the pixels that were on their parents' UV map, pasting them to their own. This is required because otherwise the arm inside the sleeve would be the same color as the sleeve.  
  
I'm actually... not sure about how to do that. I know there's a way to do it, but I've never tried it out. It may be annoyingly complex. But it's an absolute necessity.  
  
...  
  
Okay, we've discussed sleeves and collars and entirely distinct layers... but what if we want a topology that isn't simply an offset version of the parent?  
  
The obvious example is skirts. What if we want a skirt?  
  
When you mouse up along the inside of the leg, you'll quickly cross over the X axis. If you're in "merge mode", those vertices would impact and merge, causing their triangles to also merge (and average their bone weights). If any vertex only has triangles which are entirely along 0 X, it self-destructs, "hollowing" the skirt out. (Otherwise you would have extremely loose shorts).  
  
This is not so hard, although it has one big downside: the skirt would end up with a very low poly count horizontally. Because of that, we may need an algorithm to add "stripes" to the skirt. This'd be easy if the skirt was just a standalone mesh: we could just do loop cuts. But since it's often going to be integrated into the overall mesh, we need to come up with a method of creating vertical cuts that don't screw up the topology near the waist. that's going to be some work, but it's not nightmarish, just annoying. Alternately, I could just make the legs themselves have a high poly count so that skirts wouldn't suffer.  
  
...  
  
IT ALL SEEMS FEASIBLE LET'S DO IT.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:26 AM](https://projectperko.blogspot.com/2013/04/avatar-creation-tool-poofy-sleeves-time.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8694778112005859264 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8694778112005859264&from=pencil "Edit Post")

Labels: [characters](https://projectperko.blogspot.com/search/label/characters) , [modeling](https://projectperko.blogspot.com/search/label/modeling) , [unity](https://projectperko.blogspot.com/search/label/unity)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8694778112005859264)

[Newer Post](https://projectperko.blogspot.com/2013/04/facilitating-rules.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/04/survival-horror-isnt-about.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8694778112005859264/comments/default)
