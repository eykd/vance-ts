---
title: "Avatars with Layers"
date: 2013-04-16
url: https://projectperko.blogspot.com/2013/04/avatars-with-layers.html
labels:
  - technical
  - unity
---

## Tuesday, April 16, 2013 


### Avatars with Layers

This is a technical implementation post.  
  
I'm slowly creating a Unity avatar generator, so this is a post about avatar generation.  
  
There seem to be a lot of different opinions about how to do it, but most of them seem to be either mired in the past or extremely limited. I plan to use three methods to allow users to construct their avatars. Keep in mind that users will be able to submit content and use it on their avatars, so this is a framework rather than a specific set of options. This means that we can't use any of the cheap outs like you get in the various superhero MMORPGs.  
  
**First**: you can stack texture layers. Or, more accurately, material layers.  
  
This would be used for skin tight stuff, such as tank tops, necklaces, socks, and so on. These simply require a texture with transparency, a bump map, and an optional set of material parameters if you want to make it have different shader parameters (for example, to get the look of a spandex bodysuit). This is simply stacked on top of the underlying materials, allowing underlying materials to show through.  
  
In addition, you can use this for simple decal work - scars, tattoos, robo-skin, whatever.  
  
The little secret to this is the use of bumpmap blending.  
  
It's quite easy to calculate out a single, final bumpmap by layering each bump map on top of the preceding bumpmap and fading it. This allows us to get a real feel for layers. For example, if you wear a chunky necklace and then a light shirt, the normals for the necklace will be used on the part of the shirt overlaying the necklace. So even though the necklace is partly hidden beneath the shirt, it doesn't vanish, it creates a little mound under the fabric.  
  
This trick isn't critical or anything, but it's easy and adds a bit of fun realism. It also paves the way for more advanced techniques, both those listed below and things like wet or damaged clothes, nonhuman skin types, and so on. It's also important because Unity doesn't seem to support bump map transparency, so that has to be calculated by us anyway.  
  
**Second**: your outermost "tight" layer determines your base mesh.  
  
The human body is split into three mesh segments: head, upper body, and lower body. When you wear a piece of clothing, it overrides the default mesh with the correct mesh. So if you wear a T-shirt, the upper body is overridden with a mesh that has the correct sleeves. However, if you then put a long-sleeve shirt over the T-shirt, the upper body mesh becomes the long-sleeve-shirt mesh. The texture for the mesh is just like above, where there is lots of transparencies to allow the underlying skin texture to show through where needed.  
  
These meshes are simply customizations of the base mesh, and have the same shape keys attached to them. This means that if your "muscle" slider was set to max and you put on a T-shirt, you'll still have a muscly body. Obviously it would be possible to have a mesh which didn't descend from the same topology - you could theoretically do some really crazy stuff and completely override the defaults. That's fine, that's kind of the point.  
  
The UV mapping of these meshes has to match the original UV mapping. The reason is that we need to be able to use the underlying layers correctly, and also use this layer as an underlying layer. For example, you have a neck tattoo. You put on a T-shirt. Your mesh changes, part of your tattoo is hidden beneath the shirt texture. You put on the long sleeved shirt, your mesh changes again. While the T-shirt's mesh is gone, the T-shirts texture and normal map are not. So the neck of the shirt shows in the V of the button-up shirt, and there are subtle hints of wrinkles and mass at the neck, hem, and shoulders where the T-shirt had bump mapping.  
  
Obviously, this has a few restrictions. For example, if you put a T-shirt on over the long-sleeved shirt, the long-sleeved shirt sleeves will be painted on your bare arm rather than having mass. I think that's fine.  
  
**Third**: non-tight layers are layered meshes.  
  
If you wear something which is poofy or doesn't adhere to your body, it's a separate mesh mapped to the same skeleton. So if you put a jacket on over your long-sleeved shirt, your shirt mesh remains your shirt mesh, and the jacket is a separate mesh. This can lead to issues if your sleeves are particularly poofy or something, but it's far less problematic than most alternatives.  
  
Similarly, your hair is an add-on mesh. Your chunky arm pouch. Your skirt. Your boots. Your wings. These are all just add-on meshes. There's no guarantee they'll all get along, but that's part of you designing your avatars. If you stick wings on and put a coat on, you're going to have wings magically sticking through your coat. Live with it, or make a new kind of coat.  
  
Of course, you could apply decals to these as well. Put a patch on your leather jacket.  
  
**Final thoughts**  
  
This is what I'm intending to make. It's actually not complicated, I've tested the feasibility of each of these with proof of concepts. It's just a lot of work.  
  
A lot, especially because it's all database-based.  
  
I really need to take maybe two weeks off work and just do this.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:50 AM](https://projectperko.blogspot.com/2013/04/avatars-with-layers.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5819772025541225401 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5819772025541225401&from=pencil "Edit Post")

Labels: [technical](https://projectperko.blogspot.com/search/label/technical) , [unity](https://projectperko.blogspot.com/search/label/unity)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5819772025541225401)

[Newer Post](https://projectperko.blogspot.com/2013/04/social-npcs.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/04/mechanics-for-theme.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5819772025541225401/comments/default)
