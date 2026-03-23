---
title: "Tangents and Simplistic 3D Simulation"
date: 2005-07-19
url: https://projectperko.blogspot.com/2005/07/tangents-and-simplistic-3d-simulation.html
labels:
  []
---

## Tuesday, July 19, 2005 


### Tangents and Simplistic 3D Simulation

Well, I now know what a garbage truck's horn sounds like. It has a deep, hollow, sudden sound, like a foghorn. I also know exactly what time the trash guys stop by my place: 4:52 AM.  
  
I don't know exactly what was going on, but I also know exactly what time they STOPPED honking their horn: 5:03. Almost exactly ten minutes of foghorning. I know it was them, because moments after they stopped honking, they emptied the bins.  
  
I should be upset, and I'm sure I'll very much regret the lost sleep later today, but I got a lot of good thinking done in the two subsequent hours of sleep I missed.  
  
In addition to a very interesting dream, I got a lot of mathy stuff done - trying to figure out how to simulate things like clothes and hair within the limitations of Torque 2D.  
  
Long, gritty, mathy concept commentary follows, even though you'd probably rather hear about the dream:  
  
One of the things I did for my preliminary emotion engine was to use rotating sprites instead of, say, continually calculating and re-calculating sine waves and phases and crap.  
  
I put down a 'base' sprite, then I simply run a laundry list of attachments, polar coordinates (translated into x/y for mounting), rotating, etc. I then pin these to the base sprite.  
  
The base sprite, which is invisible, is a rectangle of any dimensions I please. Since I'm translating from polar coordinates, it is an ellipse of any size I please. Since mount points are put in relative coordinates (IE -1 for left edge, 1 for right edge), I can do basic unrotated 'circle' calculations even though it is a rotated ellipse.  
  
I can then rotate the ellipse, and the mounted objects rotate with the ellipse, at the right speed, without me having to calculate out the exact position an object on a rotating ellipse would land on.  
  
I can use the relative global X/Y coordinates for the mounted objects, in addition to how far they've rotated, to determine how to display these objects on the "main" display. For the face, I used three circles: side view, front view, and top view. I then combined the location data for every object on each circle, multiplying by the view angle's modifier, and got a passable location, size, and rotation for every object. All without having to do any complex math after the first assignment.  
  
"Complex" is a relative term.  
  
Now, the problem is pretty simple:  
  
I can't make curved lines straight, and I can't make straight lines curved.  
  
So, for example, if you have a sprite which represents, say, HAIR, you can't have it bend realistically using just one sprite. Moreover, you can't even have it bend UNREALISTICALLY when you take into account things like collision with your shoulders. It turns into a giant mess, and you have to carefully define a dozen "hair sprites" to get it to look good.  
  
In addition, although a series of flat planes for the rude structure of the face (cheeks, forehead) looks decent from head on, it starts to disintigrate as you get more than about twenty or thirty degrees off true. Looked at from above, the face is either a wedge or a square, both of which are not very nice.  
  
Now, 3D graphics solve this problem primarily by adding more polys. Tomb Raider's boobs look pointy? Give them more polygons! It's a simple solution, and not one I care to simulate, because that would require me to (A) simulate 3D in a 2D engine, and (B) actually build models, which would be a pain in the ass. So, instead, I'm going to give it more polygons.  
  
The difference is: I'm working with a 2D sprite system, so I'm using sprites. The question is: can I make a system which is largely automated for displaying a cartoony person in functional 3D? Someone who can turn, lie down, jump up and down? Moreover, can I give them decently convincing hair and clothes?  
  
All of this without the 'blocky' feel we get from the too-few polygon approach?  
  
Well, yes, I think it might be possible. I found a way to distort sprites.  
  
But it's a bitch.  
  
Torque 2D allows us to load up any graphics file, and has a number of options as to how to treat it. You can treat it like one sprite. You can treat it like a number of different sprites, seperated by a pixel of a given color. Or you can treat it like a stamp factory, where each subchunk of X vs Y is its own image.  
  
So we load up the "tailor image" of what we're trying to display. Essentially, it's the same as a skin image for a 3D system, except in a number of different images, one for each 'subsection' of the body. This keeps us from having to cut images twice (which I don't think T2D supports), and also allows us to combine skins without needing to make a new image for every permutation.  
  
We take the level of detail, and split it that many times using X/Y coordinates. Since all images are in powers of two, our LOD should also be in powers of two, to keep us from splitting illegally.  
  
So, for example, if you're looking at someone far away, the image might get split into four along the X axis, plating in a cube fashion. At that range, the cubular nature won't be clear. When we get close, we might split it sixty-four times, although that is quite a lot. Of course, we'll also be splitting on the Y axis. A heuristic can allow us to split more along whichever axis is more critically needed. For example, a face needs a lot of splits along the X axis, but is pretty comfortable with a minimum of Y-axis splits. Not all of these splits will be used: more than half of them will be invisible, on the back or sides of the object.  
  
We then have our rotating mounts as mentioned in the beginning, which have tagged "faces" on them. We use rotating mounts so that we don't have to recalculate sine a thousand times per render. This also allows us to quickly and easily simulate non-spheres - ellipses, boxes, tubes, anything else we can think of, just using other mount sprites with the same tagged faces. Given that most of our "spheres" will be, at best, egg-shaped, this is important.  
  
Since T2D does sprite simulation so well, we'll probably have three rotating mounts per 'body part' (including loose clothes and hair), which will add up to something like fifty rotating mounts for a decked-out human. Each of those will have a number of mounts (128?), but the mounts are not sprites: they are simply mount points. Then we will have a number of sprites which are arranged by those mount rigs, probably a few hundred per person for a close up, maybe up to a thousand for, say, the girl with long hair, flowing robes, and wings. However, these sprites have no collision detection or physics, so I know T2D can handle it. The particle systems regularly pump out hundreds of sprites.  
  
The problem is that edges and shadows are a bit touchy. The outlines are the sprites which have been smushed to illegibility, automagically replaced with simple black. This has some irritating side effects, but I can deal. Shadows... well, you can easily write shadows into an image, but they'll never change! Meaning you'll have nothing realistic. If I want shadows, I'll have to create a semi-transparent sprite which I can then 'plate' over another sprite based on its rotation vs. the light source's rotation.  
  
So maybe edges and shadows aren't so touchy. Layering is going to be a bitch, but, hey, I'll survive.  
  
The other half of the equation is, of course, the actual structure of the body. Hey, I warned you this was going to be long, gritty stuff.  
  
We build the body out of simple primitives - which are simulated by mount points on the invisible mounting sprites. Most everything in the human body can be adequately simulated by a simple ellipse, albeit an egg-shaped one.  
  
I'd want collision detection of some variety on THIS part, since I don't want clothes, hair, and most especially limbs passing through each other.  
  
Of course, this leads to all sorts of simplification errors and collision problems where spheres collide. But that's only a problem when we have things like shading and extreme close-ups from the 'side'. For close-ups, we can build skin "clothes".  
  
The way this - and tight clothing - works is slightly complex. Specify a skin linkage and a tightness. IE: "stomach to chest, tight". The simulator will then demark the 'edges' of the starting sphere, based on what is essentially "belt fan" methodology, which is fairly easy to calculate if you know the radii and location of each sphere. This breaks down a little with ellipses - it's probably still possible, but I don't really know the math for determining rotated ellipses. Study time!  
  
Of course, "loose" belt fans will tend to follow inertia, largely defined by gravity, whereas "ultratight" belt fans will jump straight across that boundary. Think of it like this: two spheres, floating horizontally from each other. A belt fan goes around them, connecting them with straight lines. As you 'loosen' the belt, the top sags down, adhering to the spheres, and the bottom sags down, loosening from the spheres. At the moment, I have no plans to support "weight".  
  
You can also specify an exact SIZE, in theory, which will then calculate the tightness based on radius of the whole circuit. Perhaps I'll even put in stress limits and counter-forces...  
  
Anyway, clothes happen in much the same way. If you define a shirt, you define it as a group of sprite sheets, each anchored to a given sphere and wrapped around another sphere - or left free. Things which are left free are essentially super-loose, allowed to follow inertia as they please, subject to collisions with body circles and perhaps other super-loose objects.  
  
I don't know exactly how I'll handle loose clothes and hair, just yet. I know the basics, but the difficulty lies in wrinkles and cohesian. A shirt sleeve isn't going to just rip - it's going to drape. I'll probably do it by creating another invisible sphere which 'rolls' to the inertia-prone edge. So, when you see a cloth hanging, it's really wrapping around the bump of another, invisible mass.  
  
But I'll have to figure that out.  
  
Fully loose items like ribbons are easier: I'll make them subject to collision detection, but other things can't collide with them. They have no collision sphere - just a point-check against existing collision spheres. This does mean they will pass through other ribbons, but that's so minor I don't much care.  
  
Things like capes and hair are harder, since they are like ribbons in that they don't have a 'drape' system, but like loose clothing in that they can't be passed through. I haven't quite got them figured out yet. I'm not sure whether I'll use some complex collision detection, or just make them a kind of amorphous sheet of connected ribbons. That would be a little ugly - because other loose cloth and ribbons could pass through it. Maybe I'll think of something else. Suggestions are welcome, although if you've read this far, you're insane.  
  
The real difficulty, in my mind, is keeping everything correctly connected. In addition to being able to wrap correctly and leave virtual or real 'holes' for the various things that pass through it, contiguous clothing needs to flow from point to point. For example, a poofy short-sleeved shirt is kind of easy: it wraps around the upper arm and a virtual 'inertial sphere'. However, a poofy long-sleeved shirt not only wraps around that inertial sphere, it continues on to wrap around another one on the forearm. I'm not sure how well that will work out. I'll have to try it.  
  
Anyhow, this will allow for turning straight lines into curves, since this 'plating/striping' method of display gives us a bunch of strips, each of which can be rotated and shrunk to the correct level. This means we can view anything from any angle.  
  
Hmmmmm... I think that's pretty much it.  
  
Now, the final question: Why the hell am I doing this? Why not just create a 3D model, or limit myself to animations which are within 30 degrees of true?  
  
Well, in all honesty I wouldn't mind doing it in 3D. But my 3D experiences with actually manufacturing models have been... not too much fun. In addition, with 3D you have to worry about all sorts of crap like mesh manipulation, and it's almost impossible to do clothes with any kind of useful depth. With my method, it should actually be possible to animate - on the fly - GRABBING someone by their shirt or hair!  
  
This is because the collision detection is simple. The graphical display, on the other hand, is not. So even though the character will be built out of essentially nothing but 3D ellipses, it won't look shitty (I hope). Essentially, I'll be creating the vertexes on the fly. Or, at least, choosing which of the thousands of vertexes to USE on the fly.  
  
It's like infinite LOD combined nicely with an automated algorithm for producing that level of detail PLUS an utter lack of problems with stretching joints and collisions.  
  
On the downside, it probably won't WORK.  
  
On the upside, the emotion engine I've been using is fully compatible, and is, in fact, the basis of this whole deal. It should be possible and, when completed, should be very animated.  
  
I hope.  
  
If you've read this far, buy yourself a cookie. You deserve it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:29 AM](https://projectperko.blogspot.com/2005/07/tangents-and-simplistic-3d-simulation.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112180419682654305 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112180419682654305&from=pencil "Edit Post")


#### 2 comments:

[!\[Image\](https://2.bp.blogspot.com/\_WQk0 YgqQA9Q/SaAzb6ng2VI/AAAAAAAAANw/Go874k1XLAc/S45-s35/profile.jpg)](https://www.blogger.com/profile/01646249933207430061)

[Darius Kazemi](https://www.blogger.com/profile/01646249933207430061) said...

Mm. I could definitely go for a cookie right now.  
  
I completely understand your insistence on hacking 2D to death rather than working full 3D.

[10:47 AM](https://projectperko.blogspot.com/2005/07/tangents-and-simplistic-3d-simulation.html?showComment=1121881620000#c112188165497561573 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/112188165497561573 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Damn, man, you read all that? I'll BUY you a freaking cookie next time I see you.  
  
"Hacking 2D to death" is definitely the correct term here.

[12:50 PM](https://projectperko.blogspot.com/2005/07/tangents-and-simplistic-3d-simulation.html?showComment=1121889000000#c112188900157577286 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/112188900157577286 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112180419682654305)

[Newer Post](https://projectperko.blogspot.com/2005/07/wormie-bits.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/07/preferred-by-experts.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112180419682654305/comments/default)
