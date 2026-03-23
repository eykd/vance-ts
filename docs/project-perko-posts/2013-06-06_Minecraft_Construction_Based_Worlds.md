---
title: "Minecraft Construction-Based Worlds"
date: 2013-06-06
url: https://projectperko.blogspot.com/2013/06/minecraft-construction-based-worlds.html
labels:
  - game design
  - world design
---

## Thursday, June 06, 2013 


### Minecraft Construction-Based Worlds

I've been doing a video series about building a Minecraft world in Unity, and it's kinda fun. One thing about me and Minecraft is that I don't really like fighting. I like building.  
  
So... while my computer installs Microsoft's updates, I got to thinking about how to make what is essentially a game stuck in creative mode, or maybe survival-no-monsters mode, and how to make it fun.  
  
A lot of Minecraft's actual challenge comes from the threat of monsters. Remove that, and Minecraft is a much more shallow game where you make scenery. The mechanisms in Minecraft are sub-par and don't really offer the kind of juicy worldbuilding I want from my mechanisms, and the scenery you create is not really useful or inhabitable. Well, aside from farms, but even those are only as useful as whatever you're growing, and that's not very useful because there's not really any fun end result. Just book cases or cakes that nobody will read or eat.  
  
There are a few ways to make construction-based games more interesting.  
  
The first is to do chunk-sharing. For example, if you build a house, you can hit "submit" and it has a chance of randomly popping up in other people's worlds. Of course, your world contains their stuff, too. This adds a lot to the exploration aspect of the game, but not to the actual crafting aspect. How do you make your house matter?  
  
I'm thinking two things: evolving life forms and displays.  
  
Let's start with displays.  
  
Displays are something that happens when conditions are met, and creates something really interesting to witness. For example, I might have trees which, as night falls, shoot fireworks into the sky. I might have bushes which, shortly after rain stops, explode with a musical "BZANG!" and throw seeds everywhere. Or, of course, you might build a house that flashes light patterns whenever anyone gets nearby. Either way, the "devices" in my world are expanded to include a lot of things that can happen independently of you, and these devices can often grow and propagate under their own power. If you grow a field of wheat, then silver motes will dance through the air just before dawn, getting everywhere. If you plant apple trees, then the birds will flock there every morning and flock away every evening (or whenever you walk nearby).  
  
Displays are useful because they are only valuable to a player in the region. While they may have some effect (spreading seeds, attracting animals, etc), they can be ignored in the larger sim when the player isn't actively in the area. We can use a good logical-dependency system to simulate their occurrence even when the block isn't loaded if needed, but we can still get away without showing the flashy visuals.  
  
These displays will make the world fun to explore, as at different times of day and different weathers you'll see different kinds of displays. And you'll wait with bated breath when the sun sets, to see the exploding trees and see the patterns of fireworks the local trees emit. Maybe it varies based on their altitude, or maybe there is some kind of DNA-like thing going on.  
  
Anyway, aside from displays there are evolving life forms. I think this is really important: you have to be able to build a living environment. And that means that things have to live. Not simply be green in the places you want, but grow and change in ways you can shape and meaningfully use.  
  
This means having entities with unique appearances or behaviors. This obviously means you can't simply say "a sheep", but instead need to have a more complex object representing the sheep that has some persistence in the game world. Physically this would actually not be terribly hard, but in terms of memory consumption it might be extremely annoying if all living entities in the game world had genetics, such as every random flower or tree you walk by. To offset this, wild trees and plants would have a genetic system defined by the chunk's seed value. It's only made into a specific example if it is taken or planted by the player.  
  
It's going to be a lot of fun to come up with cool things that can vary. Like growing a vast field of sparkler-mushrooms and carefully culling out the ones that don't sparkle in quite the right way... there's going to be a challenge in terms of computation, but I think it'll be okay.  
  
In terms of challenge, none of these things outright offer challenge. None of them say "do this or die". I think there's room for that, sure, but I think the room is already full from every other game ever made being in it. I'm thinking the challenge should be about finding or creating some kind of very limited energy stones or something. If you are within range of an energy source, you have the ability to break bricks, glide, have a deep inventory, craft magic stuff, maybe see through walls - lots of cool possibilities. The further from the energy stone, the longer it takes to gather enough energy to do that, until you quickly have no special capabilities at all. Fine for exploring, but the cool stuff is where the energy stones are.  
  
Of course, the devices in the game would also largely rely on energy from the energy stone, often piped out in pipe bricks...  
  
Anyway, that's the direction I'm thinking.  
  
... THE UPDATES STILL HAVEN'T INSTALLED.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:33 AM](https://projectperko.blogspot.com/2013/06/minecraft-construction-based-worlds.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2684925462303416347 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2684925462303416347&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [world design](https://projectperko.blogspot.com/search/label/world%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2684925462303416347)

[Newer Post](https://projectperko.blogspot.com/2013/06/a-deeper-problem-with-consoles.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/05/crew-of-starship.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2684925462303416347/comments/default)
