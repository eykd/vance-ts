---
title: "Player Generated Functional Pixel Art"
date: 2013-11-08
url: https://projectperko.blogspot.com/2013/11/player-generated-functional-pixel-art.html
labels:
  - game design
  - player-generated content
---

## Friday, November 08, 2013 


### Player Generated Functional Pixel Art

I'm going to talk about something slightly nebulous.  
  
I think plenty of you appreciate the "pixel art aesthetic", while some of you probably think it's really tired. Putting aside nostalgia, to me the real value of pixel art lies in the fact that it is low resolution.  
  
There are two reasons this advantage is important. The first I won't go into detail about here, but in essence when the art style does not demand realism, you can really go all out on all the other aspects of the art - color, composition, lighting, animation. That's nice, but for this essay the second advantage is more important: it lets people create a lot of content, quite easily. You don't need to worry about 3D, or meshes, or UV maps, or any of that complexity. Anyone can create a pixel art wall, and even if it isn't very good, it's still serviceable.  
  
This is valuable because it means we can let players create pixel art within the game world.  
  
Other art styles also allow this. Voxel-based engines offer ever-more creative control to the player. Some allow the player to even design their own swords or characters out of mini-voxels. However, voxels have a lot of constraints - difficulty animating, rotating, squashing, having to wrangle the third dimension, and so on. Vector art style offers a lot of the freedom that pixel art does, but it's not as popular or entrenched, so players will have a harder time bringing it to life. Also, vector art's strength is in nuanced animation, which is another topic. For now, let's presume pixels.  
  
Putting pixel art in the hands of the player is actually pretty rare. Some games let you draw a bit of your character, but that's not the side of pixel art I'm interested in handing over.  
  
I want the players to be able to create complex, interesting worlds and challenges and plots out of pixels.  
  
There are a few games that are slightly similar to this, but I think there's a level beyond them. So we're going into use cases here.  
  
I think the core issue in content creation is scripting. We always think of scripting as something that you do to content, rather than with content. So it's always a bit complex for the player to grasp and rarely feels very intuitive, rarely feels linked to the style and feel of the game. Scripting is scripting, right?  
  
Well... what if we take the basic tenets of our art style, and use them to allow for scripting?  
  
You're wandering through a pixel art clockwork building. You ride an elevator up, and the grated elevator doors close and open with a shaky, rickety motion. As you approach the empty dais, there is a crank-wheel. You turn it, and a control panel rises out of the floor, dust shaking off. Your character sneezes.  
  
This is a reasonably compelling scenario, and you can imagine the developer creating it. But can you imagine a player creating it?  
  
Why not?  
  
Well, the biggest barrier to allowing the player to create this content is all the animated and interactive pieces. The players needs to know how to animate an elevator door, hook a rising controller up to a crank-wheel, and create a dust effect (or abuse an existing dust effect).  
  
In our current generation of player content, we normally think of player content as glitter rather than function. It's pretty easy for us to imagine a player drawing a pixel elevator door, a pixel control panel. But interactions and animations are not usually on our list of things players might be reasonably expected to do. Even in something like Minecraft, functionality is considered a very high-level concept and laying down redstone is an example of a painfully opaque, cumbersome method of creating interactivity.  
  
This is where pixel art comes to the rescue. Unlike most other art styles, pixel art is laid down chunk by chunk. Other art styles are typically "tweaky": you don't lay down part of a 3D mesh with a click, but instead steadily refine and refine and refine. But with pixel art? Click and there's a pixel.  
  
We can really leverage this. Imagine that when you paint a pixel art object, you're actually recording a progression. Let's say you draw a bush. You draw the gray-brown stalks emerging from the ground, then you draw the green leaves, then you draw the red berries. That is an animation. You can hit "play" and watch it happen. If you decide you want to refine something, you can always rewind or fast-forward through time to wherever you like, and insert another sequence... or a tempo change, a delay, an event, a sound effect...  
  
Let's say you draw the bush with animation in mind, so rather than just drawing red berries, you draw golden blossoms that turn into red berries as the petals fall to the ground. If we want to add a bit of fantasy to it, we could massage the appearance of the flowers - start them as little white buds, then they pop into full golden flowers. We can massage the tempo so they all pop at once, or in sequence. We can add in an event so that when they pop there's a puff of golden dust that enters the game world proper. Or simply make it register a new resource ("golden flower") for any other AI hooks out there that might care.  
  
This allows you to create a lot of complexity but here's the key: it all happens **in the paint window**.  
  
If you were doing thing to a 3D model, for example, you would have to script each of these things in a different environment. Create the model, create the animations, add the flower objects, synch the events to the animations... but here in pixel-art land, you simply paint the blossoms on, then click on the "paint event" button, select "dust" like you're selecting a paint color, and click on the blossom you just painted. It all happens right in the window. Moreover, it never requires you to magically connect point A to point B - everything happens on a specific pixel, optionally spreading to every pixel sharing the color. This removes much of the complexity associated with scripting.  
  
Integrating it into a wider worldscape might seem a bit difficult. How do you tell the dais it should rise when someone cranks the wheel? How do you tell the elevator it should alternate between the fifth and third floor? How do you tell the door to open and close at the right times?  
  
The answer is: never leave the paint window.  
  
The paint window lets you paint pixels... or sprites. Events, triggers, all of it.  
  
Let's say you want the elevator to go up. You've painted an elevator. If you painted it on the level, it's already there. Otherwise, drag it onto the palette, open the level, and drop it into the right spot. This is exactly equivalent to painting a single pixel.  
  
Add a trigger - "player enter" trigger onto the elevator sprite. It's exactly equivalent to adding a "pollen dust" event to a flower. What's it do? Well, you just pause the timeline until it gets triggered. What happens after the player enter trigger? Drag the elevator to the place you want it. Just like painting a string of pixels, the animation will mirror your drag. At the top, add another "player enter" trigger with a "play backwards" event attached.  
  
Okay, okay, that's just a warmup. What about the dais and the rising controls?  
  
Well, obviously you first drop the dais and the crank onto the level in the right spots. For now we'll assume the crank is already a crank and we don't have to script that. But how do you tell the level that the dais is connected to the crank and should rise as the crank is cranked?  
  
First the rising part. Just like the elevator: drag the dais up to create that animation. Instead of just triggering it, we need to link the progress along that animation to the crank's crank animation, allowing the player to organically control it. How?  
  
Classically, you would select it and add events between the two objects... but that breaks our rule of pixels. There should never be any "magic" eventing, because that makes it difficult for the player to conceptualize and maintain. Instead, we... yeah, we draw pixels. We draw a line of pixels (or sprites) between the dais and the crank, connecting them. We just draw them on another layer - the background. The wire exists in the game world, and we hook our new line of pixels to inherit the value of the crank's crank animation. Easy to do: the crank and the wire overlap at some point, and that is the pixel we paint with our "inherit" function. On the side of the dais, we do the same, except that the dais inherits from the wire instead of visa-versa. That becomes an event that you can synch with, and therefore you can drive your animation with it.  
  
Because of the fluidity of the editor, you can do a lot of complex stuff with this. It's not simply a system of wiring.  
  
For example, your painting of the wire is, in itself, an animation. Normally you would just tell the timeline to start at the end and remain there, but you could set it up so that you have to push a button to start the wire's animation, at which point it will crawl across the wall or through the floor in the same way that you drew it... forging the connection. The fact that you inherit from/to pixel positions means that the dais will wait patiently until some background sprite - anything - arrives in the specified position. As the dais rises, the pixel it is looking at will also slide upwards, so your wire has to have a vertical section to keep the connection static (or a clever person could animate the wire to rise with the dias by making the crank value force both animations). However, this sliding input means that the dais can also SWITCH inputs by just wiring things up a touch differently and letting it slide onto the new inputs.  
  
This is, coincidentally, how the console can be rigged to control other things, like doors. Individual pixels can be hooked up to different inputs and outputs, shared through contiguous color areas. Since every sprite has a foreground and background, you can wire contiguous colors "behind the scenes" if you really want to have a complex foreground mask. When the player interacts with the console, he'll have to choose which place to press, reflecting the fact that several wires are connected.  
  
Things like dust are also easy to explain. While we might paint a dust event to trigger at a certain time, that may not be what we actually want to do in this case. Instead, we would paint a "dust" pixel on the foreground. The dust pixel is a special pixel which increments over time, becoming grayer and more opaque. However, whenever any animation affecting that pixel or the whole sprite happens, the dust pixel dumps all its stored-up dust as a dust event.  
  
There's nothing special about the dust pixel. It's just a 1x1 sprite whose timeline plays very slowly, connected to a few basic triggers that cause it to reset its timeline while also dumping dust events into the world. You could create something similar yourself - for example, pixels that heat to red, or get steadily wetter in the rain.  
  
Anyway. I don't claim this system is ideal or polished, but I think it shows that you can give a lot more control to the player than they are normally given. If you leverage the basics of your art style, you might be able to expand those basics into a content creation system that allows for more than just a bit of visual glitter.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:52 AM](https://projectperko.blogspot.com/2013/11/player-generated-functional-pixel-art.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2996167152574792635 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2996167152574792635&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2996167152574792635)

[Newer Post](https://projectperko.blogspot.com/2013/11/crew-play.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/11/sun-wing.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2996167152574792635/comments/default)
