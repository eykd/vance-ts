---
title: "Machine Dance"
date: 2013-10-25
url: https://projectperko.blogspot.com/2013/10/machine-dance.html
labels:
  - game design
---

## Friday, October 25, 2013 


### Machine Dance

Several people have suggested that I basically remake Kerbal, since I love it so much. Well, there's not much point in that: Kerbal has some flaws and some design choices I wouldn't have made, but fundamentally it's very well done. If I want more Kerbal, I'll just play Kerbal.  
  
But it is true that I want to build something that draws on Kerbal's inspiration. The reason I keep going back to Kerbal and talking about it ad nauseam is because it's really pretty unique. Even though the concept has been done before, it's never been executed like this.  
  
At the end of the day, there are a lot of things I want to learn from Kerbal... but it's not a game I'm interested in making. The focus is all wrong. Kerbal is focused too much on physics and launching, which are not what I want to talk about. I'm happy to play a game about them, but in order for me to be interested in making a game, I have to have something I want to talk about... and the physics of rockets aren't really high on my list.  
  
Instead, I'd prefer to talk about the other parts the space age. Science, inhabiting inhospitable worlds, getting along in zero gravity, the long isolation of a space station, the scare of relying on machines... to me, these are all more interesting things to talk about. They don't have a damn thing to do with launch or landing physics.  
  
It might be a mistake to keep chanting "KERRRBBALLL" while thinking about gameplay that's so far removed from the core idea of Kerbal. It's a preoccupation I need to shake.  
  
Instead, I'd like to talk about the idea of the machine dance. First, however, I need to talk about player generated content.  
  
In brief, there are a few different types of gameplay rolled into a content creation tool.  
  
One is the "model kit" style. This is when the player wants to create something they invented or imported, with only weak ties to in-game functionality. This is building a mansion or a sky castle in Minecraft, or trying to make a perfect moon lander replica in Kerbal.  
  
Another is the "extended function" style. This is when you try to absolutely maximize the statistics of the product. This is asparagus staging in Kerbal, or growing wheat in Minecraft. Without much concern towards aesthetics, you try to crush the constraints that normally slow you down.  
  
The last I can see is the "alternate function" style. This is when you try to do something different with the tools, but rather than having a specific model in mind, you are aiming for new functionality. This is creating songs and computers in Minecraft, or a self-assembling robot base in Kerbal. These are not things that the game preassembles for you, nor are they constraints that you normally deal with. The weakness of alternate function is mostly in whether or not the end product is useful or entertaining.  
  
In many (most?) cases, some combination of the three is what you end up using at any given time. For example, a beautiful "flower" that unfolds in space, perfect for creating a massive comm system that can handle dozens of satellites.  
  
With that in mind, I'd like to talk about the idea of the machine dance.  
  
This concept is about making the system interact with itself much more aggressively. Rather than focusing mostly on how you interact with the outside world, we need to focus on the system interacting with itself. This is important because most of the space topics I find interesting are about how the systems work in and of themselves, not how they confront the world around them. The whole point is that there is very rarely any world around!  
  
One way to do this is to create systems that work over time, changing slightly along the long mission hours. Fuel is burned as you accelerate, so if you want a truly long-term space ship, you'll need some way to generate fuel. So you include a component that generates fuel.  
  
However, this doesn't add gameplay! It actually removes gameplay - the difficulty in loading up enough fuel is gone. So in order to make this worthwhile, you have to recalibrate your difficulty to make the generating fuel thing interesting.  
  
One way to do it is to make it extremely chunky. For example, generated fuel isn't piped into the engine's fuel tank, but into a capsule. Then you have to exchange the empty canister in the engine for the full canister in the generator, either manually or using an automated robot arm. This activity strongly constrains the patterns in which you can use your engines.  
  
Another option is to make the generation itself constrained. For example, requiring you to be facing the sun, or generating a massive amount of heat, or any number of other constraints that actively interfere with the performance of other components.  
  
Both of these options inter-relate the various components and activities of the system. When you build an engine, you have to consider how your replacement canisters are going to move into place. You have to consider whether it'll work in deep space, or whether the waste heat from the engines will overheat the generator and visa-versa, and whether that interferes with the science module. The system has become much more tightly inter-related because each of the components has a set of constraints and effects that are turned on and off as you like.  
  
I think this is the secret to making base building interesting: mode-changing topological challenges. It's not simply a matter of whether you have a bio lab or not. It's whether your bio lab is placed in a way where it can be used reliably, where there's no interference from the radiation lab, or from the vibrating engines. It's the pattern in which you can use the bio lab, and whether you have to wait six months without turning on any other systems in order to complete the bio experiments. And it's all organic: the player is allowed to design a ship where the lab is located whever she likes, and it matters.  
  
But the mechanic runs deeper. I mentioned that you could either run the fresh canister over to the engine with a person... or with an automated mechanical arm. And here is the "dance" part of the machine dance.  
  
The idea isn't to simply design a bunch of things that turn on and off optimally. There's a lot of fun to be had in designing it to reconfigure itself in certain ways, allowing you to have a lot of freedom as to what things are doing what.  
  
Mechanical arms are one of the things. There's a lot of potential play hidden there: mechanical arms that swing through a shared space and have to be careful not to strike each other. Gantries that arms can slide along, so they can carry inventory long distances and stow it in cargo stacks.  
  
But there's a lot of stuff besides mechanical arms. For example, you might mechanically rearrange your modules so that they are more optimally arrayed. You might print out a new module using a 3D printer, then reabsorb it. You might have a module which inflates/unfolds, giving you a lot more interior room but cramping the exterior and becoming fragile. You might even have sliding gantries for entire hubs, allowing you to dock hubs with the hubs above or below them... or put a space gap between them when your modules need to be separated due to heat generation or whatever.  
  
Mechanical reconfiguration is fun ish, but it's limited to the clear and uninspiring rules of mechanical devices. You move devices because you need them to have less noise, or a direct connection to another node - these are simple restrictions that are difficult to build arbitrary complexity into. In the end, the complexity probably hits a pretty basic wall where you figure out how to move things in an optimal way and that's that. There's nothing fundamentally different about scaling it up or aiming for something more complex.  
  
To make that matter, we have two options. One is to add in additional complexity when you rescale or add functionality. For example, we might have a "heavy core" system where modules in the stack don't stack along the center, but instead stud the sides. This would offer a more complex way to inter-relate modules as there's now two dimensions of contact rather than one. Similarly, the mechanics of moving them around would be a bit different. We might add in some kind of "laser bond" where modules can be connected over a distance by a high-powered laser to provide information or particles or whatever, which in turn means neither of those modules can be moved while the laser is active. This would also allow us to have mirrors, which could be used to redirect the flow in real-time so that you COULD move laser-bonded modules as long as there was a tracking mirror installed... and, of course, you could just build laser light shows for fun.  
  
Tossing things around could also be fun, allowing you to have very long or large stations. Instead of using an arm to drag something from point A to point B, arm A tosses it through space to arm B. Works fine... as long as your engines are off. Wires could also be used to slide along or reel things in... so there are options as to how to add complexity, and you could make it very interesting by adding in different kinds of complexity for different sizes and functionalities.  
  
But the other option is that we can add in a human element. Right now the space station is just a mechanical device. There's certainly something compelling about a big aluminum tin can, but most construction games include people for a reason. People are compelling. Even if it's something as basic as Kerbal's nearly useless astronauts.  
  
I think we could easily integrate astronauts into this machine dance game by simply making them move around inside the modules. So the 'outside' of the modules is where all the mechanical stuff happens, but managing the 'inside' is a separate challenge.  
  
Some parts of it would be pretty basic. Everyone needs a place to sleep and so much air and so on. But you don't have to manually dictate that stuff. Astronauts is smrt. They can figure out how to get from work to their bed without your help, even if it does require them to go on a space walk. Instead, you handle their work assignments.  
  
Astronauts can be assigned to specific modules for work. This allows modules to be vastly more productive depending on whether astronauts have been assigned. It also allows us to give each module three states instead of two. Instead of just "on" or "off", we have "off", "holding", and "active". The bio lab can be put in "holding", where the projects are put into a slow-moving crawl but not canceled. It is less sensitive to interference and has fewer requirements/interference of its own.  
  
The thing I like about astronauts is that you can introduce them as a helpful way to make your modules more productive... then steadily introduce their personalities as the mission continues. Anyone capable of going into space is going to be able to work for a week without letting their idiosyncrasies interfere with their jobs. A month, maybe. Depends on the person.  
  
But at some point, the astronauts are going to begin forming lives in space. They'll start to have relationships, good and bad. They'll get lonely, or want to work on their hobbies. The more time passes, the more the astronauts resemble humans instead of cogs.  
  
This doesn't degrade their work. On the contrary, properly managed it will actually enhance their work, because they're getting used to how things work and are healthy and happy. But you have to manage them. This isn't simply having the right modules installed: you need to massage their personal lives by changing where they tend to go and who else tends to go to those places.  
  
Which is a topological challenge that can be worked through by mechanically rearranging modules and changing their primary assignment.  
  
To make matters more interesting, you can have certain things generate only when astronauts have acclimatized to space: producing cultural goods such as movies, songs, babies, etc. These can have value if you can wrangle them properly, and exactly what kind of life you give your astronauts will change what kinds of cultural goods they create.  
  
Anyway, just thinking aloud. Brewing ideas, as usual.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:18 AM](https://projectperko.blogspot.com/2013/10/machine-dance.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7413700264072967159 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7413700264072967159&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7413700264072967159)

[Newer Post](https://projectperko.blogspot.com/2013/10/constraint-is-interesting.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/10/mission-pacing.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7413700264072967159/comments/default)
