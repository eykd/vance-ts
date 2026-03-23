---
title: "Clothes are Expensive"
date: 2014-06-12
url: https://projectperko.blogspot.com/2014/06/clothes-are-expensive.html
labels:
  - modeling
  - player-generated content
---

## Thursday, June 12, 2014 


### Clothes are Expensive

Now that I'm seriously considering a fantasy or scifi open-world RPG, even a small one, I need to face the dire truth:  
  
Clothes are reaaaaaaally expensive. They take a reaaaaaally huge amount of modeling effort. I can buy content from the asset store for the houses and the dinnerware and the weapons and stuff, but none of the asset store character model packs hold up to my requirements. So I need to talk clothes.  
  
This essay will be me talking to myself about the technical challenges and possible solutions. Stop reading if you are easily bored by technical details.  
  
Right now, the biggest thing I cannot abide in an open-world game is everyone having the same body type. It was never acceptable to me, and now that Unity handles shapekeys so easily, there's not much technical reason to stop people from having a wide variety of body types based off a single mesh. I have modeled those kinds of bodies, and I'm confident I can create a base mesh or two to support a wide variety of bodies in my game.  
  
The problem is the clothes.  
  
Right now, there are two common methods of doing clothes.  
  
One is **mesh overlay**: the underlying body mesh (the "naked" mesh) still exists, the mesh of the cloth is physically "on top". This is a somewhat rare approach for "core" clothes like shirts, although it's common for things like capes and hair. A big reason it's not popular is that the clothes tend to clip through the underlying body mesh, giving you 'pop-through'. Even if you increase the amount of empty space between the clothing and the body(giving it a weird, floaty look) you still have to painstakingly massage everything until the weights and positions are absolutely ideal.  
  
The issue is that mesh overlay systems only really work if you have one body type. Every shapekey slider the base body has must be replicated into the overlay mesh, and each must be massaged both independently and in tandem to make sure there's no pop-through. This is an extremely difficult and time-consuming activity. Even if all you do is bone scaling, it will affect the overlay clothes differently and things will go south.  
  
Unsuitable.  
  
The other method is **mesh replacement**. The base mesh is chopped into pieces, and the pieces are deleted and replaced by costume elements as needed. If you put on a shirt, your torso mesh is deleted and the shirt mesh is put in its place. This is the most common way to do costumes in games.  
  
However, if you have shapekeys, every costume element has to respond to those shapekeys in the right way. While this isn't as strenuous as mesh overlays, it is still time-consuming, and you need to be careful to keep seams intact. This is particularly difficult to do in Blender, since deleting verts makes shapekeys go haywire - you can't simply copy over the seams and keep them properly shapekeying.  
  
If I had to choose one of these methods, obviously I'd choose the mesh replacement method. But neither is suitable for my needs. Here are some much rarer options.  
  
**Cloned mesh**: Clothes are made out of verts cloned off the main body. This is a common "my first shirt" modeling trick, but it works poorly because the topology of a shirt is not going to be the same as the topology of a chest.  
  
**Mesh morphs**: Instead of the shapekeys being limited to changing your body type, they also change the clothes you appear to wear: the "short sleeve" morph pops sleeves out of your arms - perhaps they were hidden on the interior of the mesh. Then your "clothes" consist of addons like buttons, collars, belts, and so on - the core shape is embedded into the shape keys.  
  
While it's an interesting idea, it's quite limited and annoying to actually use. It'd be easier to do mesh replacement.  
  
**Smart Mesh Replacement**: Just like mesh replacement, but minimize the number of meshes you have to build by making the replacement mesh have custom shapekeys to alter its appearance. In this way you can make the exact cut or fit vary, giving you a much wider variety of clothes out of a single, smarter mesh. However, it has all the flaws of the mesh replacement system.  
  
**Shrinkwrap Overlay**: Model your clothes larger than the beefiest, heaviest version of your character model. When equipped in-game, shrink-wrap the clothes to fit whatever underlying body is in use.  
  
This one's important, so let's talk about it in detail.  
  
The shrinkwrap solution is fun because it allows for arbitrarily layered clothes and will usually adapt pretty easily to completely new meshes. The problem is the same as with all shrinkwrap solutions: pop-through. Say you have a a face on your body mesh's shoulder that is completely horizontal, but the clothes have a seam down that point and two slightly tilted-down faces running out from the seam. The shrink wrap will end up with the edges of the body face popping through the centers of the tilted-down clothes faces.  
  
Normally you'd pad it to avoid this - a few millimeters of spacing. This may be possible, but it's an ugly and weird-looking approach to have the clothes "float". The higher the density of the overlay mesh, the less spacing you need, at least as long as the bone weighting lined up. But, this being an open-world RPG, we don't want absurdly detailed clothes.  
  
A number of shrinkwrapping algorithms exist to minimize pop-through. For example, there's a "vertex locking" shrink wrap which attaches itself to nearby verts when possible. This really minimizes pop-through, and also comes with the advantage of easily allowing you to reweight the bone weights on the overlay.  
  
Well, that sort of thing is possible, but it does lead me to a simpler question: if we're going to snap to verts, why not do that from the beginning?  
  
**Affixed-Vert**: In this version, you create your new model (whether overlay or replacement) with your default, no-shape-keys-activated model in mind. Then you actually copy in the no-shape-keys-activated model. If you are doing an overlay, delete the faces. If you're doing a replacement, only delete the faces you don't want to show. This requires no shape keys.  
  
In the game engine, someone equips your clothes.  
  
1) A map is created mapping the verts of your clothes mesh to the verts of the base body mesh in the places they are identical.  
2) A map is created of all the unmatched verts, linking them to their nearest matched vert.  
3) A delta is taken of the in-game character's vert positions as compared to the original base body mesh.  
4) All the verts in the clothes mesh are moved by that amount, as the maps indicate.  
5) All verts with no faces are deleted (cleanup).  
6) The modified mesh is either overlayed or replaces the character's mesh, as indicated by the settings.  
  
While it will probably work, it has a few issues I can see.  
  
The first is that it requires a specific body mesh. This solution does not work with arbitrary body meshes as the shrinkwrap solution would. However, it might not be hard to create variants for new body types.  
  
The second issue is that shape keys frequently distort the normals of a mesh. For example, a fat man's belly distorts a cloth mesh substantially. It creates rolls and folds that don't exist in a skinny man's model. Care would need to be taken to intelligently handle this chaos when mapping the clothes.  
  
The third is that layered clothing might be very tough. Well, it's tough anyway, so I guess we're okay.  
  
It also has a few advantages I can see.  
  
One is that, while it doesn't need to have the body's morphs, it can have its own morphs. This would allow for the clothing to intelligently adjust itself according to whatever parameters you wanted. In addition to a slider for something like sleeve length or neckline, you could have a slider for "too big" or "too small" or "in freefall" or "gravity is forward". This would really only work if you were doing replacement instead of overlay, but it would be pretty neat.  
  
Another is that we could easily introduce super-cheap clothing physics. Since we know what verts on the custom cloth are affixed to what verts on the underlying body, we know how much space there is between them. Using this value, we can introduce physics-like wobble as the character moves. Aggressive movement such as jumping could be done by shrinking the distance on distant ones, and increasing the distance on closer ones... or we could use a shapekey, as mentioned.  
  
The key to this content is making it easy for modders to create custom content for the game. And I can't think of any way to make it easier: copy the part of the base model you need, slap your custom model on top, and you're ready to go. No need for painstaking massages. If you want to allow modders to create new bodies, release your clothes models without the body models mixed in, and they can mix in their body models easy as pie.  
  
There are probably other ways to handle this, but I can't think of anything else that seems more promising. If anyone out there has better ideas, let me know.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:38 AM](https://projectperko.blogspot.com/2014/06/clothes-are-expensive.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3673432759328411181 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3673432759328411181&from=pencil "Edit Post")

Labels: [modeling](https://projectperko.blogspot.com/search/label/modeling) , [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3673432759328411181)

[Newer Post](https://projectperko.blogspot.com/2014/06/chattering-questlines.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/06/npc-growth-and-personality.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3673432759328411181/comments/default)
