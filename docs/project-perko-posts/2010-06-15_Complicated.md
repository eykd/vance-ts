---
title: "Complicated"
date: 2010-06-15
url: https://projectperko.blogspot.com/2010/06/complicated.html
labels:
  - game design
  - generative
---

## Tuesday, June 15, 2010 


### Complicated

So, I bought a DS game called "Infinite Space". I bought it because it had spaceships in it. It's very hard to find non-shooter sci fi games these days, so I buy every one I see.  
  
Playing Infinite Space, I was stunned: it's an extremely oldschool game that allows you to customize your ship and crew. I don't mean "equip cannon A instead of cannon B", like "customize" normally means today. I mean "play tetris with components to try to cram any of ten thousand highly varied things into any of a hundred different chassis". I don't mean "customize crew" as in "swap your three-person team out with any of two other options", I mean "assign any of the hundred people you can recruit into any of the hundred positions in your crew, including things like 'chef'".  
  
I haven't seen a complex game in so long, it felt great!  
  
Now, if pressed as to whether the game is any good, I would hesitate. The game is too oldschool in many respects: it is unforgiving, full of hidden gotchas, all but requires a walkthrough, and dying is a tremendous pain in the butt. However, it is also really one of the only complicated games on the market.  
  
We've seen an excessive trend towards simplicity in games. Every game must be winnowed down so that it can be played by a drunk frat boy with only one hour to spare. Sometimes, this results in some amazingly interesting games - for example, Shadows of the Colossus was not a complicated game, but it was a very interesting one.  
  
But there is something to be said for complexity. There is something to be said for letting a player have too many options, for making a game too dense to play drunk.  
  
This kind of complexity is distinct from the complexity of, say, a Sim City game. In Sim City you are given a pretty flat environment you can fill with pieces. Sure, the terrain may limit you, but point A and point B are going to be pretty much the same if they have the same terrain.  
  
On the other hand, the kind of structured complexity you find in complex games like Infinite Space is not flat. The details exist for a reason: it may seem pointless to have a "chef" position explicitly assignable, and it certainly doesn't add to the actual in-game situation much, but out of the fifty slots you can put people in, each is unique and has its own meaning. It's a contextual complexity, where every point in the "gameplay terrain" is explicitly defined to have some human meaning. Exploring this kind of complexity is inherently more engaging than exploring the same "size" "space" in a game with procedurally generated terrain or terrain that merely varies by statistics.  
  
This holds true for every kind of play where "space" exists and can be interacted with. Traveling from location to location is only as interesting as the variation between those locations. So we can have ten million locations that vary only statistically, but it won't be nearly as interesting as a hundred locations that are each unique. Similarly, if we're designing the components of a ship, having the insides of the ship be unique and weird shapes to match the design ideals of the manufacturer is more interesting than having randomly varying shapes or simple shapes.  
  
The problem with this approach is that it requires a fair amount of painstaking definitions and scripting. The amount of effort you put into making a hundred unique locations could probably make ten thousand statistically varying locations, instead. But they would feel very samey. The universe would have little texture.  
  
So I wonder if there's a middle ground, where you can procedurally generate content that is really unique, that really has a flavor and stands out.  
  
I think this requires three things:  
  
The first is a giant stack of things to be unique with. This is a pretty typical approach: if every planet has two interesting details, you can just write up a thousand interesting details and pick randomly, maybe crossing them off the list when you use them.  
  
However, that's not enough. You also need coherence. The uniqueness has to mean something. This might be able to be accomplished by having NPCs react to the uniqueness in vaguely intelligent ways, or having the complexity of the world (dungeon generation, culture, whatever is generated on the fly) react strongly to the uniquenesses that are here. It can probably also be accomplished by "smearing" uniquenesses: If this planet has an unusual quantity of gold, then the nearby colonies will be better off because of it, and the NPCs at those other colonies will talk about the gold.  
  
Smearing is actually related to the third aspect, which is that the player has to be drawn into the unique situations. For example, in Spore, every planet can have some seriously unique life forms. However, because there's nothing interesting to do with them that depends on their uniquenesses, they blend together into a shapeless blah. So the content has to draw the player in, require that the player take an hour or so to look around and really delve into the uniquenesses. This requires a depth of content (probably created by the previous paragraph's ideas). But it also requires gateways into that content, interesting plots or details that draw the player in.  
  
It may also be possible to use unique player-generated content, like Spore does, but you have to algorithmically generate the "smearing" and "gateways" so that the player gets drawn in. That would be an interesting thing to design.  
  
Hm. What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:51 AM](https://projectperko.blogspot.com/2010/06/complicated.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5055621957142496438 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5055621957142496438&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [generative](https://projectperko.blogspot.com/search/label/generative)


#### 5 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/03146360375570794401)

[Ian Schreiber](https://www.blogger.com/profile/03146360375570794401) said...

I think the more you proceduralize, the less the worlds feel hand-crafted, by definition. The "smearing" you talk about is really having hand-made (not procedural) content. Sure, it might be dropped into a procedural engine, but the parts that make the game really feel alive and coherent and not random are the parts that are hand-made. I suspect a game that blended the two would come away with the worst of both worlds: lots of development time to create the procedural aspects, and lots more development time to create the content. The problem that procedural gameplay is trying to solve -- removing the need for explicitly created content -- no longer applies.  
  
The closest "blending" I've seen is in games like Spelunky, where a dungeon level is procedurally generated out of hand-made sections. Or some Roguelikes that are mostly procedural but have special hand-made levels at various points (boss levels and the like). I suspect that's about as close as you'll get for something like this.  
  
Otherwise, it seems more like an either-or choice: create a deep, complex game with deliberate design choices at every step, but keep the scope constrained to the point where all this content is manageable within your schedule; or, go for infinite procedural gameplay at a shallow enough depth that creating the procedures is manageable within your schedule.

[9:56 AM](https://projectperko.blogspot.com/2010/06/complicated.html?showComment=1276620974821#c5473675618118587610 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5473675618118587610 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I think that you're repeating a dichotomy that doesn't exist. This is a topic I've [thought about a lot](http://projectperko.blogspot.com/search/label/player-generated%20content), both in terms of automatically generated content and in terms of player-generated content having to be correctly fitted into the game world.  
  
You can't get around the need to make stuff. You'll always need to make stuff. The question is how far that stuff can be extended/enabled using algorithms rather than painstakingly scripted into precise locations or just tossed about randomly.  
  
The "chunk assembly" method that's pretty common today (Diablo, Spelunky, etc) is actually what I'm arguing *against*. By having carefully defined areas that have distinct edges and assembling them Tetris-style, you're neatly packaging up your carefully scripted content so that it is put into safe, bite-sized units.  
  
My argument is that your framework might be better off taking those scripted things and making the edges indistinct, pulling the player in from further away, making the universe feel lived in rather than assembled from lego.

[10:15 AM](https://projectperko.blogspot.com/2010/06/complicated.html?showComment=1276622120512#c3107764267843742157 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3107764267843742157 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09981225682631417415)

[Isaac](https://www.blogger.com/profile/09981225682631417415) said...

For me, the main benefit of procedural generation isn't about removing the need to create content, it's about creating interactive content. A handcrafted interaction is only good once, a procedural system is interesting repeatedly.  
  
All content is going to be hand-made at some level. Procedural generation just adds layers of interactivity between the building blocks and the result, hopefully for the better.  
  
Most game systems right now fail the 'meaningful differences' test; I found the Pirates! remake ultimately disappointing because the content, while varied, turned out to be shorter than the main campaign. Civilization, on the other hand, gets away with this level of abstraction because the systems themselves are deep enough that Ghandi can show up in every game and not be distracting.  
  
It seems like the main benefit of the blending and gateways is to make the meaningful differences noticeable to the player. Showing that the system is working is important, and implies that there is more going on.

[1:01 PM](https://projectperko.blogspot.com/2010/06/complicated.html?showComment=1276632098775#c8235253985198119106 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8235253985198119106 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Aaron said...

I completely agree with this post.  
  
How interesting "terrain" is, be it physical or mechanical, is largely the interaction and contextualization of unique mechanics, not just statistical permutations.  
  
Many games feel they can get away with simply statistically varying a handful of attributes to make hundreds of items, but the end result is rather bland with the extra hassle of managing all the extra items where ten probably would have sufficed.

[1:36 PM](https://projectperko.blogspot.com/2010/06/complicated.html?showComment=1276634196245#c128673144182047603 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/128673144182047603 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Isaac: That's a really clear way to put it! It's all about the interactivity of the content.  
  
Both of you got at my core issue: statistical variation just isn't as interesting.

[6:19 PM](https://projectperko.blogspot.com/2010/06/complicated.html?showComment=1276651185606#c6132104191751476651 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6132104191751476651 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5055621957142496438)

[Newer Post](https://projectperko.blogspot.com/2010/06/non-generic-humans.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2010/06/apple-hour.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5055621957142496438/comments/default)
