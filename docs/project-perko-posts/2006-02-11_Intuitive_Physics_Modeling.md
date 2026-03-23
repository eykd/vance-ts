---
title: "Intuitive Physics Modeling"
date: 2006-02-11
url: https://projectperko.blogspot.com/2006/02/intuitive-physics-modeling.html
labels:
  []
---

## Saturday, February 11, 2006 


### Intuitive Physics Modeling

Yeah, I had something else for my discerning readers, but I'm afraid I lost track of it. So, for my less-discerning readers, here's something that's on my mind in rather a small way:  
  
Intuitive physics modeling.  
  
When I was younger, I loved 3D artwork. To be honest, I still love it, but I no longer use it. Ever. Why? Because I can draw a dozen pictures as fast as I can create one 3D model of the same complexity. And the pictures bend, flow, and leap in ways that 3D models don't. Of course, in theory I could use the 3D model for a million pictures once I finish it - thus the attraction.  
  
These days, you can get software to do some animating for you. You move your little 3D buddy around, and it extrapolates all the little motions inbetween. Of course, if you want your hair and/or clothes to wave, that requires more expensive software.  
  
But it's so cool! You get a level of awesomeness you could never get from cell art, because they can take any animation they please, from any angle! You can even incorporate live changes to the animations, such as (primitive) flowing clothes and hair, or the ever-popular "bouncing boobs".  
  
There's just a one problem with 3D animation: ever try to get a 3D character to *take off his sock*? How about playing tug-of-war with his dog and a bit of rope? You ever try to get a 3D character to bend and flow? Fit a specific composition?  
  
These are things a 2D artist can do in a hundredth the time a 3D artist can for a single still frame, and a 2D artist can still do it just as fast for manual animation as a 3D artist can, with arguably more poignant results!  
  
But... 3D art! Awesome! Able to move camera around! Able to animate on the fly! Need 3D art!  
  
The thing is, I've hit this particular barrier at least half a dozen times, trying to figure out a decent way to do 3D art that didn't take all year. I'll say, up front, I don't know of any way to do what I'm about to talk about. But it seems to me that it should be possible!  
  
There are two things to think about if you want to make 3D art that can take its socks off. The first option is *representational collisions* , and the second option is *sprite-fu*.  
  
*Representational collisions* are an idea I came up with a few years back. I'm sure it's not unique, but here it is: I built a system which didn't represent the 3D model as a bunch of vertexes. It represented the 3D model as a bunch of oval shapes of various proportions.  
  
Then, collision detection was fairly simple: instead of determining whether a vertex had passed through a solid plane, you determined whether one ovoid object had collided with another ovoid object. Although the math is somewhat more complex, it requires fewer iterations and less checking. Anyhow, it ran fast enough for me, but I wasn't trying for real-time.  
  
Collisions in this manner are more useful than collisions from standard detection systems. You know how the collision works, you know where the mass is, and you can even deform the ovoids! I never got the deformation to work *well*, but I got them to flatten on the colliding side.  
  
You can then synthesize a mesh - either temporary or semipermanent - from the ovoid structure. Using some basic heuristics, you wrap the ovoids and blur their edges together, to avoid the sharp "oval sticking out of oval" you get without the blurring. This produces a very nice, organic feel.  
  
I also introduced cloth into the project. I never reached the phase of "shirt", but I could do "sheet". I had some serious problems getting the sheet to collide with other sheets, but it collided with the ovoids pretty well.  
  
I think someone who knew what they were doing could create a way of representing a model which didn't rely on a "mesh". Meshes should be end products, not internal math. So long as we stick with the idea of a "mesh", we're going to have some rather serious issues with getting it to interact with other things right. I don't know what the best way is - probably not my way, I'm sure - but there should be one, don't you think?  
  
The thing is, most 3D animation programs are obsessed with exact locations. This makes sense, because from moment to moment, the exact location is critical to keeping continuity. But why not experiment with something that *makes up* the exact mesh on the spot, knowing what the situation is?  
  
Here we're segueing into the other idea I had: *sprite-fu*.  
  
If your guy is taking off his sock and you want a picture of it - not an animation, just a picture - why can't the 3D program just call up it's "this is what this kind of thing sometimes looks like" programs and *invent* how the sock will look?  
  
While we're at it, what are we using 3D for, anyway? Two reasons: 3D locations and ease of animation. Sprites are a bit ugly to use in a 3D-world game - like Doom - so 3D works better there. Sprites also have to be hand-animated for every situation - and re-animated for each character. So 3D works better there, too, once you get over the initial expense. 3D also zooms in and out a bit better than *old-style* spritework.  
  
But ask yourself: can we use sprites for these things? A new kind of meta-sprite? An algorithm which *draws a sprite on the fly*?  
  
"Hey, I saw something like that, once. Computers really suck at making up drawings."  
  
Computers really suck at making up high-definition 3D images of people, too. But they're doing it. In such computationally intensive ways, it makes me cringe. In order to do a facial animation, the computer needs to know every point on the face, how to draw the points up and around, and exactly what strings to pull.  
  
It seems to me that you could create something of that nature using 2D art, approximating the same data 3D art uses, but in a more forgiving way.  
  
For example, what about taking a blunt 3D doll shape? Put it into the scene and let the 2D renderer jump on top of the simplistic, 20-poly doll, using it as anchors to build detailed face, clothing, hair...  
  
Can it be done? Why not? It seems easy enough, doesn't it? A set of heuristics as to how things move and hang on the 3D model? Eyes here, draw like this, angle changes do that? Shirts drawn with wrinkles from armpit - something like that?  
  
Slightly more advanced: wouldn't it be easier to make this system interact with clothing easier than the more cemented 3D system? Clothes stretch, bunch, and flow using a set of curves and lines which are part of the program's heuristics. You don't even need to represent them in the 3D part of the system, save to remember that they are there to interfere with the dolls.  
  
It seems to me that this should be quite possible. I don't know why it hasn't even been experimented with. It would give you all the flexibility of 3D with all the liveliness of 2D, if done right. Right?  
  
It's complex, sure. But not as complex as freaking Poser 5.0.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:13 PM](https://projectperko.blogspot.com/2006/02/intuitive-physics-modeling.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113971698815140414 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113971698815140414&from=pencil "Edit Post")


#### 2 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I've been trying to crunch just this issue in relation to interactive storytelling, which ties in to blocking motions and facial/gesture animations. I've decided to ditch the hyperreal (and expensive) faces and animation suites in favor of something simpler yet more dynamic.  
  
Representational collisions strikes me as a feasible first-generation solution being situation based, I think if you had simple hueristics for each character model you could specify the rendering idiosyncracies when you created the character and be done with it. One issue, in terms of Interactive Storytelling, does Representational Collisions imply collision detection in a spatial simulation? Or can it just be an intra-model calculation?  
  
I'm not sure the direction the Storytron people are going with their front-end, but for a second generation storytelling platform I think something like Sprite-Fu is a hot ticket. Coincidentally I have a kung-fu game idea that Sprite-Fu would work very well with.  
  
Would you say Sprite-Fu is a simpler (though still complex) cousin to the memetic animation idea I threw by you a while ago, where the motion points are treated as genetic primitives subject to hueristic-driven individual selection (local search) between generations?

[12:40 PM](https://projectperko.blogspot.com/2006/02/intuitive-physics-modeling.html?showComment=1139776800000#c113977685480734422 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113977685480734422 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I would say the two are different tiers of the same program: you need to know how to draw something, but you also need to know what you want to draw.  
  
As for whether my ideas are spatial collisions only, I suppose they don't have to be. But there are probably easier algorithms for non-spatial collisions.  
  
The problem with sprite-fu is getting the computer to draw the sprites well enough to pass muster. I did something like this in T2D a while back with facial animations, if you remember, but that was rather a hash. A full-featured system would require a dramatically more powerful drawing algorithm.

[12:55 PM](https://projectperko.blogspot.com/2006/02/intuitive-physics-modeling.html?showComment=1139777700000#c113977773877052299 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113977773877052299 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113971698815140414)

[Newer Post](https://projectperko.blogspot.com/2006/02/oh-and-if-you-havent.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/02/blogs-that-are-ads.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113971698815140414/comments/default)
