---
title: "Save the Chatbots, Part 2!"
date: 2008-01-20
url: https://projectperko.blogspot.com/2008/01/save-chatbots-part-2.html
labels:
  - chat
  - game design
  - generative
  - language
---

## Sunday, January 20, 2008 


### Save the Chatbots, Part 2!

Electric Boogaloo!  
  
My last post on chatbot-driven games got me thinking, and I see a limitation I don't like.  
  
A big part of the feedback in a game is feedback loops . You do something, something happens, you do something based on that, something happens based on that.  
  
The issue is that most games use a recursive loop, but these games wouldn't. Let's see if I can say what I mean.  
  
In an RPG, you walk around a world, and what you are near are depends on where you have walked before. Every step subtly changes your location, bringing you closer to some things and further from others. Similarly, when you kill an enemy, it gives you points and gold and so forth. Although the victory itself is win/lose, the side effects in terms of expended and gained resources are very muddy, and can be anywhere on the scale of goodness. Winning a fight but using up all your magic is almost a loss, even though you won. Moreover, all of these feedback loops - fighting, walking - are more or less unlimited. Save for unusual restrictions, you're allowed to walk around and fight as much as you like, "cycling" the loop at your pleasure.  
  
On the other hand, in this chatbot game, everything is binary. You either uncover the next bit of information or you don't. You either convince the chatbot of something or you don't. It's impossible to cycle this in an unlimited fashion without creating some kind of unusual pseudo-AI, and there are really no variable side effects because there is no engine to track them.  
  
Even if you aren't specifically stuck to a single linear story, you're still going through this only marginally interactive set of scripted rails.  
  
I'm not saying this is at it's heart a bad thing, but it is a very limiting thing.  
  
With this, you cannot realistically allow the players to just dick around. Either it has no effect at all, or they're moving forward. You have to script every possibility, which means that the players are more exploring your story and less exploring your world. They might as well be reading a book that only lets you turn the page if you answer a riddle.  
  
I'm not saying this is an innate restriction of chatbots. I'm saying that it's an innate restriction of games without recursive algorithms. Because the content is not implemented in a fashion that can be unlocked in tiny portions in many different ways over many different times, the content is grotesquely inefficient.  
  
Creating a dungeon is a lot more work than writing up a description of a dungeon. But the implemented dungeon can be explored by players in many different fashions at many different speeds, and there can be many different progressions of fights and treasure. Moreover, depending on how the player explores the dungeon, exploring the dungeon gets easier or harder.  
  
So, a player will read a description of a dungeon and think, "okay, cool, a dungeon". Two minutes later, you had better have another description of something and it had better make sense. Even then, the player has less of a feeling of agency. It's an inferior solution - I would guess your time is spent at maybe 1% efficiency when creating non-recursive content.  
  
This is actually the fundamental problem with adventure games in general, and is probably why they are not as popular. While there is something very juicy about the fact that every obstacle has a unique solution, the fact is that there are only maybe 1/50th the number of obstacles that you'd find in a recursive game of the same length. For every unique obstacle in an adventure game, you've fought four battles and gotten an upgrade in an RPG. Each battle is not simply an obstacle, but a complex set of interlocked obstacles. Same with upgrades.  
  
This is probably why I preferred Quest for Glory to King's Quest: Quest for Glory contained a number of recursive, interlocked systems in addition to the juicy unique puzzles.  
  
Now, it might be possible to create a chat-bot game that has recursive systems, but the fundamental issue here is that chatbots are essentially just memory banks with confusing UI. No chatbot on the market has the ability to create meaningful content or adapt to changes in the world on any interesting level. You would have to create a backbone that somehow determined what changes needed to happen and then modified the chatbot's memory banks. This would be difficult even without the complex world engine, because generating English that is fun to read is right up there on the list of unsolved problems.  
  
This is the big reason that games with adaptive/generative worlds don't have talking NPCs  in their generated parts. Any talking NPCs they have are back in the part of the game that can't be significantly altered by the player's recursive play.  
  
This is why when you talk to, say, characters in Animal Crossing, they always seem so self-obsessed and oblivious. It's because they actually cannot notice  when you change the world, except as they are scripted to. They cannot look at what you have done and say, "wait, in order to get to your door I need to wade through a river, what's up with that?" They are not only incapable of that level of logic, they are incapable of generating that kind of text.  
  
This is why graphics  are so popular: we have, over the decades, figured out a lot of nifty ways to recombine and adjust graphics to a recursive situation. With some newer games, you can even create completely new graphics inside the game itself - a completely unique face, most commonly.  
  
In some respects, I think it's because graphics is easier. Graphics is simply N-dimensional bits that are linked and moved around algorithmically. Wide cheekbones? Alter the cheek bits a bit. Green skin? Change the color of the skin.  
  
What is language? Written language is a maybe low-dimensional construct that is representing a maybe medium-dimensional construct (spoken language) that is representing some theoretical reality!  
  
But I don't actually think that's any harder. Graphics are just as steeped in cultural references and represent theoretical reality, and graphics are 2D representations of 3D representations. (You can count color as another dimension, I guess.)  
  
Unfortunately, that doesn't mean it's easy . After all, computer graphics aren't easy.  
  
But maybe the same approaches could be taken...  
  
I'll have to think about that, I've gotten off track. What I'm saying is that it's very hard to use chatbots in a recursive game, and that's a restriction I can't bear.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:32 AM](https://projectperko.blogspot.com/2008/01/save-chatbots-part-2.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2836870607474483730 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2836870607474483730&from=pencil "Edit Post")

Labels: [chat](https://projectperko.blogspot.com/search/label/chat) , [game design](https://projectperko.blogspot.com/search/label/game%20design) , [generative](https://projectperko.blogspot.com/search/label/generative) , [language](https://projectperko.blogspot.com/search/label/language)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15516414416783046990)

[Olick](https://www.blogger.com/profile/15516414416783046990) said...

Hah Electric Boogaloo.  
  
Well when you make a face in say... Oblivion, its actually rather easy to make the face unrealistic. Move the stuff randomly around and the face will be unrealistic. This may be a small thing, and the face still looks like a 'face' but its just.. off. I guess the talkn equivalent is using Engrish or having improper grammar. The less freedom you have the better the face can be. Like Mass Effect's sliders are a lot easier to get realistic because they limit it for you.  
  
This doesn't solve the basic problem of using information in a more explicit way to play a game though...

[10:06 PM](https://projectperko.blogspot.com/2008/01/save-chatbots-part-2.html?showComment=1200895560000#c1572145716759312772 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1572145716759312772 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I agree mostly, although I don't agree that less freedom means the face *can* be better. I think less freedom means the *arbitrary* or *random* face can be better. A dedicated faceur (that's French for Guy Who Makes Faces, right?) would like the more expressive sliders because they allow him to tweak the face to his content. His own eye would keep him from wandering to bad faces.

[6:22 AM](https://projectperko.blogspot.com/2008/01/save-chatbots-part-2.html?showComment=1200925320000#c78981784669755527 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/78981784669755527 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2836870607474483730)

[Newer Post](https://projectperko.blogspot.com/2008/01/nature-of-text.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/01/save-chatbots.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2836870607474483730/comments/default)
