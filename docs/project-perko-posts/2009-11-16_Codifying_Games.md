---
title: "Codifying Games"
date: 2009-11-16
url: https://projectperko.blogspot.com/2009/11/codifying-games.html
labels:
  - theory
---

## Monday, November 16, 2009 


### Codifying Games

I stumbled across [this](http://www.jorisdormans.nl/article.php?ref=machinations) today. Not sure how I found it. It's another attempt to create some method of codifying games. It's a mechanistic method, better than most of the systems I've seen proposed, but I don't like it.  
  
To me, a game is only a game when a player plays it. So I argue against solely representing the mechanics, and instead prefer to represent in a more holistic manner. I have a lot of problems with a mechanistic approach, and perhaps the largest is one which Joris falls into as well: a mechanistic approach tends to assume a single player playing a single, one-dimensional play-through. This is something I want to get away from.  
  
So, my ideal language for describing games would take into account the fact that every game is played millions of times by both different players and the same players on repeat plays. I would also like to be able to model multiplayer games and, more specifically, games featuring parallel play, where the players do not take clean turns but instead act at their own pace. For example, a MMORPG.  
  
My ideal language also allows for non-mechanistic elements to be modeled, as well as emergent, player-generated, and random elements that may or may not be mechanistic. Furthermore, I think it is a mistake to try to balance games using any language, although the language might indicate where sticky spots might be.  
  
The game examples chosen by theorists proposing would-be languages are always highly mechanistic games, which suit their highly mechanistic languages. Modeling chess or tic-tac-toe is not very interesting to me. How about we model Sim City or Quest for Glory IV? Or Fluxx or Apples to Apples?  
  
The *non-mechanistic* elements in those games are very strong, which makes any mechanistic representation of them woefully incomplete. Even just the mechanistic elements are generally badly represented: a big part of Sim City is the way your older construction decisions affect your new construction decisions. This complexity is not just beyond modern models: I think it might be beyond models. I think it might require actually creating and playing the game. But the basic idea of it, and the amplitude of it, and the reaction it hopes to cause, can be represented.  
  
Unfortunately, my magical ideal language doesn't exist, and I have only a few basic ideas as to what it might, maybe, look like. I just thought I'd chime in with my dislike of these mechanistic representations.  
  
After all, a game designer first and foremost builds interactive systems. So maybe we should have a model that represents the player half more thoroughly?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:19 AM](https://projectperko.blogspot.com/2009/11/codifying-games.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6214746308732772657 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6214746308732772657&from=pencil "Edit Post")

Labels: [theory](https://projectperko.blogspot.com/search/label/theory)


#### 5 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15516414416783046990)

[Olick](https://www.blogger.com/profile/15516414416783046990) said...

How is Sim City not described with this model? The previous decisions are a state just like any other, and the system is flexible.  
  
I think that many of the 'exceptions' you bring up can be described with the system fairly well, like MMO's and Sim City. I'd have to invest some more time to figure it out though..  
  
However I agree with Apples to Apples. Just played it for the first time a few nights ago, and its... the entire game subsists on multiplayer interactions.  
Maybe more accurately you could say the core of the game is exploiting human psychology.  
  
What about RPG's? How do you mechanistically describe the not-mechanic parts of so many RPG's that don't associate the storytelling with mechanics. (ie: DnD and associated games) In fact, its difficult to do with games that DO bring mechanics to storytelling, because its rarely an entire system.  
  
I like the mechanistic system as a tool and a method of description, but like every single system before, it is proving impossible to completely describe a game with a system we have come up with. It may be entirely impossible to do.  
  
Just the mechanics though, in computer games at least, will definitely be able to be defined with language. In fact every electronic/computer/video game is already mechanistically defined with programming language.

[11:47 AM](https://projectperko.blogspot.com/2009/11/codifying-games.html?showComment=1258400852508#c2259295362542809662 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2259295362542809662 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Sim City is not described by this model because it cannot be calculated in this model. The state of an existing city and its effect on future development cannot be reasonably simulated using this model, because it requires SIMULATING THE CITY.  
  
It is necessary to somehow abstract it, but leave a strong indication of the complexity and power of the system.  
  
Like simultaneous-play multiplayer games, it might theoretically be possible to extend this kind of mechanistic language to support that kind of stuff, but I just think it's the wrong approach.  
  
Instead, I think that we should be modeling the *player*. This is especially important to me because mechanistically irrelevant things are often very important parts of the game.  
  
For example, the fact that a player really gets attached to his city (or parts of it) isn't covered by the mechanistic model. Neither is his sudden desire to drop Godzilla on them.  
  
Similarly, the ability to dress your characters up in silly/sexy clothes is almost completely mechanistically irrelevant, but serves a significant draw in many modern games. Plus, of course, the less interactive aspects such as how cool the elven city looks, or how irritating your sidekick is.  
  
These mechanistic languages fall very short on these fronts.

[12:02 PM](https://projectperko.blogspot.com/2009/11/codifying-games.html?showComment=1258401767103#c2806592180003456203 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2806592180003456203 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

To be more specific: modeling a game with such a strongly complex long-term state isn't served well by abstracting it to "place building", "connect resources to building", etc.  
  
The part that makes it a game isn't the placing of the building, but WHY, WHERE, and WHEN to place it, things which are simply not modeled in most mechanistic languages.  
  
This is separate from the lack of fuzzy probability stuff, which I think is also important to have.

[12:07 PM](https://projectperko.blogspot.com/2009/11/codifying-games.html?showComment=1258402031322#c810011947807987751 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/810011947807987751 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

In defense of what I try to do with the Machinations framework, it was never intended as a model for all aspects of gaming. I wholeheartedly agree that as it currently stands it clearly favours what you call mechanistic games. Although, I do believe that all games have some sort of mechanical layer, it is definately not only one nor the most important one. Games that for a large part depend on social interaction, on clever level design, or interactive storytelling are poorly served by my framework. That being said, I do believe that all types of games would benefit from better mechanics, no matter what the main gameplay is about. In my opinion, most roleplaying games suffer from poor mechanics, ironically often resulting in quite mechanic gameplay where the only thing you can roll more dice. DnD is a good example, but many MMORPGs also spring to mind. It is my experience, from my own work and from working with students, that getting the mechanics right, makes designing other aspects of the game a lot easier. So the framework is an attempt shed some more light on an aspect that often poorly understood, and sometimes difficult to understand.  
In any case, thank you for the critisism, it is always so much more interesting to discus these things with people that do not agree with you an some matters. I am currently trying to expand the framework to include more level design aspects. Hopefully that would address better the gameplay of games like SimCity or other games with dynamic levels.  
\-Joris Dormans

[11:37 AM](https://projectperko.blogspot.com/2009/11/codifying-games.html?showComment=1258573031943#c9147016102208706200 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/9147016102208706200 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I hope I didn't come off as harsh. My disagreement isn't with your framework: it's with the entire field of mechanistic frameworks. The sort of person you mentioned in the first few paragraphs of your paper.  
  
I have big reservations as to whether a level-design framework based on a mechanistic approach will work out. You're trying to model something with 4, 5, or 6 axes of full freedom onto a model that only supports, at most, two axes of partial freedom.  
  
It'll be interesting to see, though. It could help in certain ways, like trying to keep forking possibilities under control.

[11:50 AM](https://projectperko.blogspot.com/2009/11/codifying-games.html?showComment=1258573808447#c5058513968459083664 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5058513968459083664 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6214746308732772657)

[Newer Post](https://projectperko.blogspot.com/2009/11/multiplayer.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2009/11/pirates.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6214746308732772657/comments/default)
