---
title: "Save the Chatbots!"
date: 2008-01-18
url: https://projectperko.blogspot.com/2008/01/save-chatbots.html
labels:
  - game design
  - text
---

## Friday, January 18, 2008 


### Save the Chatbots!

At the postmortem earlier this week, one of the presenters was Chris Canfield. I presume [this is him](http://www.chriscanfield.net/index.html), although the page contains precisely nothing in common with his presentation.  
  
One of the things he's doing on the side is building chatbot-based games. The basic idea is that higher fidelity - graphics, better graphics, insanely good graphics - are not only more and more expensive, but are also more and more obviously fake. So scale back down, you get a more believable (and cheaper) experience.  
  
Also, he used the phrase "burn content". It makes me feel all happy to hear it tossed off like it's an obvious, well-understood concept.  
  
Anyway, the basic idea is not terribly new. Text games are cheaper to make, if you like gross understatements, and many people are pleased by the kinds of content you can have. For example, it's very difficult to include thoughts or indirect information in a visual game. How do you say, "he knew she was carrying the photo with her even after all these years" visually?  
  
Text adventure games are, however, a limited genre. Consisting of X parts inventory management puzzles and Y parts reading the designer's mind, calling them "interactive fiction" is an arrogant stretch. There are a few games out there which attempt to be something else, usually something involving characters that react realistically, but they are generally pretty haphazard, opaque, and confusing.  
  
Chris' approach has been to separate the games out into what is functionally two games. One game is an information game: going to websites, reading fake blogs, collecting information that you can assemble into a picture of what's going on. The other game is a natural language chat which serves as the hub for the information game and is how the game is actually "won".  
  
For example, in a murder mystery, you would chat with "guests" to get some information, follow the leads on the internet, chat with guests about what you discovered on the net, and so forth until you found the guilty party.  
  
In some ways, this is a great approach. It allows a game world to exist without any actual need to have it implemented in an engine. You not only don't need a 3D model of the city, you don't even need a text adventure node map. The only way you encounter the world is through the "eyes" of one of its inhabitants, talking to you or posting about it on the internet.  
  
This has a really, really powerful upside on the other half of the equation, as well. Because you are seeing *everything* through the eyes of the characters, you will really get a feel for the characters. Presuming the chat phase isn't so hideous that it breaks immersion, this is a great way to build a deep interest for the characters in a game.  
  
From his description, his examples all focus on a heavily scripted setup. The games play through in one particular way - or you lose. They're oldschool rails puzzle games. This makes perfect sense because it means (A) you can build content instead of generating it algorithmically and (B) your chat bots don't have to adapt.  
  
To me, that kind of play is pointless. Even if you script in multiple paths, it's not really very interactive. I like adventure games for what they are, but I need interactive systems to really get into a game. That's why I liked the Quest for Glory series so much more than the King's Quest series.  
  
But once you create an interactive system, your content needs to be linked to it. If you can pick stuff up, then you need to have a system for inventory and what content can be picked up and what happens when something is brought somewhere and used.  
  
Which basically throws the advantage of "chat-bot adventures" right out the window, since the whole point was to replace the complex, bulky system with a set of viewpoints.  
  
...  
  
Anyway, I have some ideas on that, but I've got to think them through a bit more. Just thought I would share the basic idea.  
  
What's your take on text adventures?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:42 AM](https://projectperko.blogspot.com/2008/01/save-chatbots.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/858396313946544827 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=858396313946544827&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [text](https://projectperko.blogspot.com/search/label/text)


#### 6 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09230578036395991204)

[clem](https://www.blogger.com/profile/09230578036395991204) said...

In a sense, you could have an inventory system with a chat-bot adventure. Your inventory in this case is full of the information you acquire from the chat-bots which is then automatically compiled into an adventure journal.  
  
Now, unlike a lantern or a loaf of bread, you can't drop or destroy information. But interactivity can be provided to the player by decisions that revolve around which chat-bots you share information with. You could even introduce misinformation to chat-bots.  
  
For example, imagine a scenario where a chat-bot in the guise of a police informant is given a tip by the player that frames any of a number of other chat-bots for a crime. Depending which chat-bot you frame for the crime opens different chat options with the remaining bots.

[9:49 AM](https://projectperko.blogspot.com/2008/01/save-chatbots.html?showComment=1200678540000#c2456328091603350789 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2456328091603350789 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

That's along the lines of what I was thinking. The problem with that is that you quickly gain a huge amount of information, and combing through it to select precisely what you want can be quite a chore. Part of the strength of inventory games is that you don't have eight million inventory items.

[9:58 AM](https://projectperko.blogspot.com/2008/01/save-chatbots.html?showComment=1200679080000#c956897577703706622 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/956897577703706622 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09230578036395991204)

[clem](https://www.blogger.com/profile/09230578036395991204) said...

I think that's a legitimate concern, but by no means insurmountable. An implementation of the adventure journal couldn't be a half-ass effort, as it needs a fairly sophisticated means of searching through journal entries and limiting information's visibility as it becomes less relevant.  
  
I never played Majestic when it was all the rage, but they must have faced similar issues. I wonder how they worked through them.

[10:20 AM](https://projectperko.blogspot.com/2008/01/save-chatbots.html?showComment=1200680400000#c8655790062148452308 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8655790062148452308 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I'm not saying it's impossible, but I'm saying that information is a different kind of beast.  
  
You could do it Phoenix Wright style, discard each piece of information when it is no longer relevant. The problem is that information is suddenly just inventory items that happen to not actually exist.  
  
But if I do a game on information, I would want the information to be *information*, which means it not only propagates and can be imperfect or invented, but also means it can be connected and brought back into play for creative reasons.

[10:50 AM](https://projectperko.blogspot.com/2008/01/save-chatbots.html?showComment=1200682200000#c9131531993495317881 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/9131531993495317881 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

For better or worse, my appreciation for text based stuff goes as far as the psychoanalyze-pinhead mode in emacs. I think this is going to be a niche market, but given the low costs of production, it could still be profitable.  
  
Perhaps it could be expanded to include a simple graphical component while maintaining the "on rails, low content" sensibilities. That might be the way to do game conversions of stuff like Aqua Teen Hunger Force. Come to think of it, I'd probably play these games if they could make me laugh. I don't need parallax occlusion maps to make me chuckle.

[10:05 AM](https://projectperko.blogspot.com/2008/01/save-chatbots.html?showComment=1200765900000#c8107612915548962968 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8107612915548962968 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I think that's a good idea. As an alternative to cheap advergames, cheap chat-games seem like more fun!  
  
But I'm worried about hidden dynamics limitations - it's hard to describe here, so I'll probably need to do a post about it.

[10:35 AM](https://projectperko.blogspot.com/2008/01/save-chatbots.html?showComment=1200767700000#c276675094744816994 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/276675094744816994 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/858396313946544827)

[Newer Post](https://projectperko.blogspot.com/2008/01/save-chatbots-part-2.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/01/mario-says.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/858396313946544827/comments/default)
