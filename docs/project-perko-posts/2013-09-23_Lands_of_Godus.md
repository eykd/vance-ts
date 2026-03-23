---
title: "Lands of Godus"
date: 2013-09-23
url: https://projectperko.blogspot.com/2013/09/lands-of-godus.html
labels:
  - game design
  - rambling
---

## Monday, September 23, 2013 


### Lands of Godus

This is a rambling discussion of terraforming as a gameplay mechanic. It's me refining some design details for my mech game.  
  
So, yes, I've been playing Godus on and off since it went into public beta. This is not really a review of Godus, although I do have to talk about Godus to get to what I want to talk about.  
  
I really like the land in Godus. Now, the actual process of terraforming it is quite clunky, but the feel of the land itself is incredibly nice. The fine layers end up building some really nice layouts.  
  
For example, when chasing buried treasure, I ended up digging a deep "bore hole". When building a flat region for a "village", I created some hundred-foot-high pure, sheer cliffs that broke into jagged regions at the edges. When created stepped terrace "villages", I ended up with a beautiful, meandering hilly village.  
  
The feel of the land is spectacular.  
  
Unfortunately, the game itself is pretty crap. But the feel of the land sticks with me. I keep going back for a few minutes each day, not because I care about the game, but because reshaping the land results in very compelling results.  
  
I thought about how to make a game more intricately linked with this kind of land. Godus is just about flattening everything down for human use, which is a very dull kind of landscape to aim for. I started to think about other kinds of uses and aims we might have. Also, since my focus is on science fiction, I'm not thinking about primitive human villages.  
  
So, a big part of the feel of the terrain comes from variation in height. I feel most interested when I create interesting topologies. Cliffs, boreholes, terraces, patchy surfaces. What use could they have?  
  
My concept is basically to make the surface of the planet into a Minecraft-style crafting bench. When you want to build a building, you have a certain size frame in orbit. You call up a reticle, and it highlights an area on the map the same size as the frame. The building that will be constructed depends on the topology of the surface.  
  
If it's just a flat region, you'll build a hab module (at one particular size). On the other hand, if there's a borehole there, you'll build a water trap. If there's a little bump in the center, you'll build a mech assembly tower. If it's a gentle slope, you'll build a terraced vacu-farm. This can be made more complex by having special tiles inside the reticle, such as ore or trees or water or something. It's not just height, but also resource.  
  
This is one way I plan to force the player to spread their colonies across a planetoid instead of just putting everything down in one spot: the resources will be scattered around, so if you want a functioning society on a planetoid, you'll need to have different kinds of colonies specializing in different things in different places.  
  
Unlike Minecraft, the resource tiles are not actually a single tile of that resource, but are simply markers indicating that a tile has access to that resource. For example, an icy tile. You could certainly chip it out and walk away with a block of rock with some ice on it, but that's not a resource tile, it's just some resource. The ice tile in the wild represents the way ice will form in that spot, and therefore a building on top of it will be able to rely on a steady ice diet. Similarly, an iron ore tile doesn't mean there's iron on the surface, but instead represents that there is iron somewhere beneath that tile. A mining building will dig down to the deep ore, but stripping away a few surface layers won't get you much if any actual ore.  
  
This offers a means to help us create interesting terraforming opportunities, because we can talk about resource husbandry.  
  
What causes an icy surface to form on the dust and rock? Well, ice forms in areas that are constantly in shadow. This means that you can create environments which create icy tiles by carving down or building up such that there is a shadow. The height and direction of the wall you'll need to create depends on the latitude you're at. If you're at a pole, the sun will hang low on the horizon, and a single layer of land will cast enough shadow to keep an area perpetually in shadow. Nearer the equator, you'll have to build a very deep hole - and even then, the ice may fade in the summer.  
  
This is a pretty simple system, right? But it creates vast amounts of potential.  
  
For example, what if we want to start terraforming our landscape? We want to create a stream. Well, one way to do it is to create a lot of ice patches and, when they melt in the summer sun, a trickle of water will flow from each. By etching courses into the landscape, you can control this trickle of water and cause it to course along a specific route. Life could grow in the waters, especially if you direct them into still pools that might be able to last until next spring. With enough time and effort, you could even start to grow plants from that water.  
  
This terraforming has nothing to do with putting down buildings or colonies. We create a landscape that serves other purposes. Environmental resources and hazards - weather, radiation, heat, cold, water - respond to the shape of the land to some degree. So we can adapt the world to suit our needs.  
  
A big question with this sort of thing is "what about caves?"  
  
Caves would obviously allow for shadow even at noon, and allow for shelter from wind no matter what the time, and so on. But caves are a complicated topic. They could be a whole game in themselves.  
  
So I don't think I'll allow for caves.  
  
I mean, players can create them because they can alter the surface of the world, but buildings are dropped from orbit, so any kind of overhang prevents structural construction. There might be some way to use overhangs to help generate resources (or you could encase a building after the fact), but the downsides would all be severe enough to make it a curiosity instead of a primary method. It's just too much of a pain to implement the complexities of caves.  
  
Cliffs, on the other hand, have an important role to play. In addition to looking cool, cliffs offer shade and protection from storms. Unlike in a cave, you can still use solar power and transmit radio signals into orbit when you're up against a cliff. So cliffs are useful, especially in areas where the sun is harsh or there is an atmosphere. In addition, some kinds of life will prefer to form between layers of rock, so cliffs would be ideal for them. Another kind of resource husbandry system.  
  
Aside from the raw terraforming, there's also seasons and days. Every planetoid has seasons and days - many of them unreasonably long or short. The flow of husbanded resources (such as shade, ice, life, etc) will change over the seasons, or even from day to night. This means that a building which relies on ice might be robbed of ice for long stretches of time, essentially useless for much of the year. Perhaps building the walls up higher will extend that lifespan...  
  
All of this is fine, but it doesn't change the fact that right now my prototype uses ugly square bricks. A big part of what makes the Godus terrain so inviting is that it is gently curved.  
  
It's actually not too hard to do that same thing with my terrain, but it is worth mentioning that the UV mapping might be really annoying, especially when one layer has several different kinds of bricks. Also, I don't think Godus simply uses rounded square terrain. I haven't really looked into it in detail, but it looks like it either uses hex terrain or square terrain with alternately-weighted columns/rows.  
  
Well, I should be able to design something vaguely decent on that front.  
  
Hm. This was a lot more rambly than anticipated.  
  
I'm never sure whether to publish these rambling essays or not. They're mostly me thinking to myself.  
  
Well, I guess there's no limited page count, so I'll publish.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:47 AM](https://projectperko.blogspot.com/2013/09/lands-of-godus.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4488780600027569464 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4488780600027569464&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [rambling](https://projectperko.blogspot.com/search/label/rambling)


#### 4 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09981225682631417415)

[Isaac](https://www.blogger.com/profile/09981225682631417415) said...

I always find this kind of analysis useful.  
  
I mean, if you happen to eventually release a Kerbal/Godus/Minecraft mashup I'll certainly play it. But it's also just useful to get another perspective on these kinds of issues, either for my own projects or just in thinking about how to get emergent agency in games. I don't think exactly like you do, so you see a lot of details I haven't thought of, or haven't thought of yet.

[10:50 AM](https://projectperko.blogspot.com/2013/09/lands-of-godus.html?showComment=1379958645027#c3349562436730688277 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3349562436730688277 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I'm always working on prototypes. I'm hoping that making it a youtube series will prevent me from slacking off.

[10:55 AM](https://projectperko.blogspot.com/2013/09/lands-of-godus.html?showComment=1379958957866#c4364029086859217856 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4364029086859217856 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09981225682631417415)

[Isaac](https://www.blogger.com/profile/09981225682631417415) said...

Also, for the UV mapping: I haven't played the Godus beta, so I can't tell what they're doing for the textures. From the screenshots I'd guess that a cylindrical projection on the sides would be sufficient for the discrete levels of terrain they have. You'd want to introduce a deliberate discontinuity between the sides and the tops, such as a grass fringe, but that's useful for gameplay anyway.

[10:56 AM](https://projectperko.blogspot.com/2013/09/lands-of-godus.html?showComment=1379959013848#c3295747007801839397 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3295747007801839397 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

For UV-mapping, the difficulty is not showing any compression on the surface. However, I think I can deal with that in a simple way - just use the realspace coordinates of the verts to determine UV coordinates. So it probably won't be an issue after all.

[12:02 PM](https://projectperko.blogspot.com/2013/09/lands-of-godus.html?showComment=1379962963864#c7376339647887272729 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7376339647887272729 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4488780600027569464)

[Newer Post](https://projectperko.blogspot.com/2013/09/secrets-in-open-world.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/09/fun-in-mech-moment.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4488780600027569464/comments/default)
