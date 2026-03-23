---
title: "Moddable NPCs"
date: 2014-08-15
url: https://projectperko.blogspot.com/2014/08/moddable-npcs.html
labels:
  - game design
  - npc
  - social simulation
---

## Friday, August 15, 2014 


### Moddable NPCs

I've talked a lot about mods a lot, and I'd like to talk about NPCs.  
  
Even with highly-moddable games, the NPCs are miserably difficult to manage. Skyrim probably has the most moddable NPCs, but the way the NPCs are implemented in the base game really limits their behavioral flexibility.  
  
So, let's talk about a game where modding NPCs is the point.  
  
You play a godling. Not in a gods-eye view, but as an actual person in-world, similar to Skyrim. Your big power is to create people out of clay. They turn into living NPCs, and you can interact with them.  
  
The basic loop is that the NPCs generate resources for you. You can gather some resources on your own - clay, water, grass, and whatever else you can find - but those are very basic and there's no crafting. Instead, you set the NPCs up to generate resources. First you create a farmer, and they make food. Lots of food - enough to feed everyone else nearby and still give you a stack of foodstuffs if you decide you need them. Maybe you create a woodcutter to create lots of wooden planks so you can build wooden houses instead of log cabins. Maybe you create a carpenter to turn wood into furniture, so you can fill those new wood houses with nice furniture. Maybe you put a shrine in the house so they can worship you and give you spirit points. Or a library, so they can generate new ideas...  
  
As time passes, the NPCs will get better at their jobs. This isn't stored as some internal skill variable. Instead, it is evident in the tools they use. Their tool shed becomes more full with higher-quality tools. Their bookshelf is filled out. Their yokes & ploughs upgrade to the next tier. Their skill is represented quite concretely by the objects in their home. Trying to move these items to a new home will lose a lot of the upgrades, so it's kinda-sorta-vaguely NPC-specific.  
  
While there is some challenge to creating a good flow for all the resources you'd like, the real challenge is in keeping your NPCs alive. You can create them easily enough, but if they are put under too much stress, they revert back to clay statues. They're not really dead - you can wake them back up as long as the statue isn't destroyed - but they certainly aren't living.  
  
Unfortunately, these NPCs are very vulnerable to stress. Their default state is "dead of stress", and it gets much worse if they have a job. You have to build their homes to alleviate that stress.  
  
For example, if you're going to start by building a farmer, you'll obviously need to give her all her farm tools and so on... but you'll also need to set up her home so she can survive. A bed, kitchen, and so on are all required to prevent added stress due to exhaustion and hunger. Then you also need to set things up to reduce the stress she is under! A fireplace, candles, some books, a veranda, some company...  
  
There's no need to simulate the NPC's stress in real time - it all derives from the furniture in her house. The NPCs are simulated when you are nearby, but that's for social purposes, not for statistical purposes.  
  
So, you set up a little farmer family. They farm, and they support each other, and stress is kept to a minimum. However, nothing lasts forever. As time passes, all the furniture in the house drifts and/or decays. This won't affect something like a workbench, but things like beds and chairs and bureaus and costumes all migrate and/or degrade. So your carefully balanced house steadily falls out of true, and stress becomes an issue. Eventually things will drift far enough or decay badly enough that the NPCs turn back into clay statues.  
  
This is often a catastrophic spiral, because a lot of the stress relief comes from other NPCs. The farmer parent's bed is a double, with each side assigned to one of them. This creates a romantic relationship between them, and that really reduces stress quite dramatically. But if mom turns to clay, that stress relief stops happening and dad quickly turns to clay. Of course the children are likely to turn to clay as well, since much of their stress relief comes from being taken care of by their parents (indicated by the parents ownership of things like the kitchen, front door, etc).  
  
Now, the moment-to-moment behavior of the NPCs is actually handled the same way. Every object can create a "state" for the character, and that state has certain kinds of behaviors and takes certain kinds of inputs. It's very freely done, and the heart of the modding system. Each state gets to "vote" on what it thinks the action of the NPC should be at any given time.  
  
For example, the parents share a bed, which sets up their romantic relationship. In addition to being stress control, this also creates a behavior state for each - the romantic interaction state. Romantic interaction probably doesn't mean "having sex" - it means the gentle interactions over the course of the day that show they are used to each other and think of each other frequently. The romantic state only votes on situations involving their lover, and it doesn't always win the vote: another piece of furniture might cause the pair to fight, or just do things other than get along gently.  
  
Moreover, the state of the bed can really change the nature of their interaction. Different beds might have different nuances - perhaps certain relationships are more bitter, or more brusque. Each side of the bed can be customized with a pillow, or perhaps have several states such as made/unmade, bedspread, etc. These can all be used as markers for different tones in the relationship.  
  
It might feel stupid to rely on things like a specific color pillow to represent a specific kind of interaction, but the point is that the NPCs can swap out the components randomly over time and their relationship will drift. By controlling how things get swapped out and how likely things are to be swapped in various ways, you can control how relationships grow or degrade. This is still clumsier than having a simple state machine hidden inside the NPCs, but it's much easier for the player to understand and control.  
  
Moreover, the relationship system is bound to the specific bed item type. Use a different bed for a different kind of relationship - not necessarily just a different nuance: it can be a completely unrelated mod with similar functionality. You can have both mods loaded into the game without difficulty: one is tied to beds A&B, the other to bed C. In fact, there's nothing preventing you from having several beds for one pair of people, each with a different relationship attached, resulting in several simultaneous romantic relationships.  
  
That might sound broken, but there is a limiting factor:  
  
The more rooms and furniture you have in a house, the more maintenance stress. This stress is distributed evenly among everyone, unless you have cleaning supplies assigned to specific people, in which case it is dropped on them. In the short run, mom and dad having three beds is quite nice, and stress is really kept very low thanks to the stress-relieving property of beds. However, as the beds decay, their stress relief drops off quickly and the relationships become rocky. The amount of maintenance stress does not drop off, so stress relief drops off three times faster than it would with a single bed.  
  
You can build a wealthy nobleman's house, lots of beds... just assign the maintenance duties to servants. That's how the pampered live their lives. Of course, their position of authority may involve taxing their citizens, in which case the citizens will all gain more stress because of the nobleman lording it over them... but there are advantages to that, with the nobles generating resources ordinary people can't generate. Well, that's one approach, at any rate. Maybe you have a different set of "nobility" mods loaded in.  
  
Anyway, all of this is done through an open API, allowing anyone to compile a plugin using the Unity framework. An integrated mod manager is actually pretty easy using the asset management tools in Unity, so this would be pretty easy to mod. It could also easily support multiplayer shared worlds due to the low amount of simulation required.  
  
There's a lot of other details. For example, the alignment and position of furniture often matters. A chair facing the fire is relaxing; a chair facing a desk will help generate ideas; a chair next to another chair will make the two people assigned to those chairs get along and have lower stress. Another thing to keep in mind is that NPCs might have different "hearts" - while they are all made out of clay, the seed you build around can be any small item. This can allow for NPCs to also be directly modded rather than always relying on furniture.  
  
Well, all in all it's actually not a hugely difficult game to start. At the beginning, it's just a simpler version of The Sims.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:46 AM](https://projectperko.blogspot.com/2014/08/moddable-npcs.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2758435433638810179 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2758435433638810179&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [npc](https://projectperko.blogspot.com/search/label/npc) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/16993116520760182498)

[Antsan](https://www.blogger.com/profile/16993116520760182498) said...

https://www.youtube.com/watch?v=ak3z2 Pm7 Iwg  
  
I imagine a game with that kind of graphics and those mechanics might be very intense.  
Trying to find the right balance between different kinds of people with their houses could be made pretty hard, with catastrophe always near.

[1:14 PM](https://projectperko.blogspot.com/2014/08/moddable-npcs.html?showComment=1408133655126#c6176745482382979795 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6176745482382979795 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I never realized until now just how much that Satan reminds me of SHODAN.  
  
Hm! Interesting.

[1:21 PM](https://projectperko.blogspot.com/2014/08/moddable-npcs.html?showComment=1408134081898#c8044941965463615132 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8044941965463615132 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2758435433638810179)

[Newer Post](https://projectperko.blogspot.com/2014/08/fluid-time.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/08/these-are-few-of-my-favorite-things-to.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2758435433638810179/comments/default)
