---
title: "Guided World Design and Discovery"
date: 2013-05-15
url: https://projectperko.blogspot.com/2013/05/guided-world-design-and-discovery.html
labels:
  - game design
  - world design
---

## Wednesday, May 15, 2013 


### Guided World Design and Discovery

Over the years, I've designed a lot of fantasy and science fiction worlds. A very common way to develop worlds for games is to come up with a heuristic that helps to guide you, so you don't have to generate an endless supply of things without an anchor.  
  
One method I used a long time ago was to drop cards onto a map and then draw the continents, mountains, swamps, and so on based on the cards. Initially I used standard playing cards with the suits representing geological foundations and the face value representing height. However, I wanted more diversity to draw from, because that's not enough of a trigger when you're generating nations and fantasy races. So I upgraded to tarot cards, which allowed me to throw in some more complex details such as the major arcana representing weather and seasonal patterns.  
  
Of course, after that I upgraded to Apples to Apples cards, and from there to simply picking words out of the dictionary. As a method of generating worlds, the card system was a little too basic, too structured and yet unable to handle complexity.  
  
I moved on to generating worlds based on simple physics-style assumptions, such as starting with tectonic plates and using them to generate land, ocean, and mountain ranges. Then I used the standard wind patterns that arise on any planet with an earth-like climate to determine the weather in various places... it's quite rewarding to learn so much about how a planet actually operates, but this is also a very limited approach, because there's not much meat at the national and ecological scale. Once you understand the kinds of ecologies that arise in the various climates, it's pretty clear the kinds of people and cultures which would arise in those kinds of ecologies. Once you get used to it, it all feels rather too pat, and once again you're stuck trying to invent new variations out of the blue for the whole world. Which is what this was supposed to prevent.  
  
Recently I've started thinking in terms of **discovery** rather than **creation**. The thing which got me on this kick was revisiting Minecraft and finding that, somehow, the new patches have made it run at 3 frames per second on my machine. Really the only thing you can do at 3 frames per second is explore. You can't really build or fight or mine. So I spent a little bit of time exploring Minecraft's generated world. I'm sure you have all spent some time doing that, but if you're like me, exploring is somewhat secondary to actually creating things.  
  
Minecraft's world is generated algorithmically. There's not much in the way of hidden mysteries - it's just a matter of how things come together. But the most interesting areas I discovered were the places where two competing world generation algorithms would collide. For example, when a mineshaft region collided with a rift region, and you had mineshafts pouring out into this endless chasm, and picking up again on the other side. Honestly, it could have been a bug: the game seemed exceedingly buggy and the framerate is a clue. But the bugginess actually created some really interesting terrain, like mountains cut in half, the insides revealed like geodes.  
  
This got me thinking: what if we consider the act of generating a world not actually an act of generating a world, but instead all about creating methods of generating worlds. The world itself is made up of those methods in various strands at various volumes. Predictable strands: you can clearly see the direction the generation is going and actually follow it along or even leave it and come back to it a few miles further along with the confidence that it will be there.  
  
The joy of these worlds would not be in changing them, but in building atop them. For example, rather than mining the ground and building a house, you would simply click to plop down an elven village. The structures they would build and the culture they would adopt would depend on the world around them. Which, in turn, would depend on the world generation algorithms.  
  
You could stick to something basic. The world generation algorithm here is a "jungle pool" - that is, it stamps jungle onto low-lying terrain while leaving the higher terrain bare. Plop down an elven village, you get some jungle-oriented elves building simple settlements in simple clearings.  
  
But move a ways away and you'll find that the world generation algorithm there is "megafauna". So this is a world generation tool which radically increases the size of the plants and animals in the area, and creates a kind of scrubbish prairie when left to its own devices. In this area it is the only generation tool, so the area is basically a savannah full of super-sized elephants and long-range megahunters like giant cats. It's a fantasy world. Plop the elves down here, and they become a roving tribe of hunters building their lives out of the skins and bones of the giant prey they find.  
  
The real treat, however, is finding a place where the two world generation algorithms collide. In this area, the jungle is massive, with trees the size of skyscrapers. Beetles and snakes are the size of houses. Plunking down elves here will mean they will build their villages in the trunks of these massive trees, and perhaps try to domesticate the giant beetles.  
  
...  
  
Sound fun but far-fetched?  
  
Well, for a video game world, it's a bit far fetched. You would have to come up with a bunch of algorithms that understand how to take the output of other algorithms and feed input back into them. This is not an insurmountable problem, but we are talking about a diverse array of resources that would react differently and serve different roles when amplified in different ways.  
  
For example, a giant beetle is not simply a normal beetle made giant. Normal beetles are a resource used for food and dyes. Giant beetles are unlikely to be for food or dyes, and instead are a dangerous wild monster - albeit probably not a carnivorous one. The beetle's nature changes when it is made giant. But the beetle might get passed to another, different algorithm. For example, a "glacier" algorithm which makes the lands iced over the whole year. Now the beetle has to be an "ice-digging" beetle. What sort of characteristics should be passed into that kind of a beetle?  
  
Similarly, the culture algorithm for each race needs to use the local resources in recursive calls to itself. The elves are passed giant trees and beetles to work with. They inhabit the giant trees, so in the next iteration they are passed giant tree houses and beetles. The giant tree houses are, themselves, a new resource that the elves can use. How? Maybe they turn them in to giant tree habitats for beetles. Maybe they create a source of magic from the life energy of the tree they are inhabiting.  
  
There are a lot of options, but the combination of diverse inputs and recursive execution makes it something that needs to be approached carefully. It's a difficult but interesting thing to work with. There's potential there, but a lot of work would need to be done first.  
  
On the other hand, using this method for hand-designing worlds has some merit because you can just invent for yourself what the crossovers are. You can manually do the combinations and recursion, filling in the blanks with whatever you happen to think would be awesome.  
  
The key to doing it by hand would be in determining how the different kinds of world building algorithms progress.  
  
For example, our "glacier" algorithm is unlikely to just randomly pop up in the middle of a desert. It would be limited to certain areas, and the pattern of progression would be a very wide, straightforward brush. On the other hand, a "magicite ore" algorithm might be a narrow and dodgy squiggle.  
  
And if the two meet... you have ice under the influence of magicite, or visa-versa. What happens along that squiggle? Living ice? Temperature so cold it freezes everything around? Weather that is a constant howling wind because of the massive downdraft the cold spot creates?  
  
Right now, this is the sort of world "generation" I'm thinking of. It's not a matter of simply following rules to generate a world. You follow rules to create potential, and then you choose which potential spots you would like to make important, and explore them.  
  
...  
  
This can also be done in science fiction settings, although the world generation swaths would instead be star, life, resource, ancient history, and planet generation swaths... maybe political swaths, technology swaths... it's so much fun just thinking of the possibilities.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:21 AM](https://projectperko.blogspot.com/2013/05/guided-world-design-and-discovery.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7695353618475119010 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7695353618475119010&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [world design](https://projectperko.blogspot.com/search/label/world%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7695353618475119010)

[Newer Post](https://projectperko.blogspot.com/2013/05/character-differences.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/05/a-thing-where-gods-meet.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7695353618475119010/comments/default)
