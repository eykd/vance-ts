---
title: "Pangame Multiplayer"
date: 2013-02-14
url: https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html
labels:
  - game design
  - multiplayer
---

## Thursday, February 14, 2013 


### Pangame Multiplayer

There's a steadily rising amount of buzz about the concept of recording your gameplay footage automatically, so you can share it instantly if you think "oh that was cool!" This is already common in fighting games, but it's popping up in various other places. Evidently, it's going to be an automatic feature of the PS4, at least.  
  
I really think it's a great idea, but not for the idea of sharing your plays in video form. No, I think it's great because it enables pangame multiplayer.  
  
Let's say I design a number of semi-casual semi-social games. In the first one you play a hero who wanders the land killing monsters and collecting loot. The second one is a word-forming game like Boggle. The third is a Farmville-esque game.  
  
Each of these games stands on their own well enough, with some social gaming hooks as such games tend to have. However, each game also automatically records the last thirty seconds of your gameplay. And participates in the "pangame API".  
  
The "pangame API" is a game-agnostic event stream. Each game can connect to any other participant(s) and stream events to them. For example, if you make a word combo in your Boggle clone, you send out a 'success!' event with the point value attached. The other game catches it and interprets it. If the other game is also the Boggle clone, then you might increase their timer or, if competitive, lock down a few of their letters.  
  
But if another game is the other participant, it also catches the event just fine. The Farmville game interprets the success as a burst of productivity on your cows. The wandering hero interprets it as an HP-restore or, if competitive, a new monster entering the fray.  
  
By laying down a foundation of basic multiplayer events, you can allow two players playing completely different games to still cooperate or compete. Whether the two people are sitting in the same living room, Skyping across states, or even have never met, they are gaming together. Of course, it's no fun to just randomly see things pop up and not have any clue what's going on with the other player, so that's where the auto-recorded video comes into play.  
  
When the Boggle player finds a good word, it sends out the points event, yes. But it also sends out an audiovideo "blurb" that lets the other player see what's going on. There can also be a number of small "touch" events that don't change game state, but keep the two players connected via video. This kind of awareness is important in any kind of multiplayer game.  
  
The API can be a lot more complex than that. Each game has the standard events, yes, but each game also has a number of call-and-response challenges.  
  
For example, the Boggle game could get a message from the hero game: "My player is in dire trouble, your player needs to accomplish a medium-difficulty task to save him!" The Boggle game goes "medium difficulty, hmmm, okay: my player! Save the other guy by forming a word starting with 'K'!" And the Boggle game ALSO goes: "Hey hero game, here's a video stream of me challenging my player to do that!"  
  
The hero game never knows what challenge the Boggle game has issued its player. To the hero game, it doesn't matter what game the other player is playing. Just that the quest was accepted and if it was accomplished. It doesn't understand what the video contains - the video is a message to the player to let the player know what's going on in the other game. The hero game doesn't really know or care.  
  
On the other end of the spectrum, the Farmville game might say "hey, you, friend game over there! I have some resource trading stored up. Offer some resources for resources, would you?" And the Boggle game would go "Hey, my player: every letter you use in the next word will be sent over to your buddy and replaced with a random GOLD letter."  
  
Or the hero game could go "I cleared out this level with this event trail yesterday. You want to do a ghost race against it?"  
  
Obviously, there are concerns with spoofing or game balance, but there are always issues with such things. Fundamentally, I think this would be a great way to let players cooperate even when they aren't interested in playing the same game at the same time on the same type of device.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:10 AM](https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5371902107626373563 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5371902107626373563&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [multiplayer](https://projectperko.blogspot.com/search/label/multiplayer)


#### 7 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

This is what Gabe talked about at Dice, except flavored with hats.

[9:15 AM](https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html?showComment=1360862101757#c5668044544328092295 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5668044544328092295 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Do you have any links to that?

[9:16 AM](https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html?showComment=1360862171152#c4389147959509826286 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4389147959509826286 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

http://www.youtube.com/watch?v=PeYxKIDGh8I

[11:17 AM](https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html?showComment=1360869445265#c5219271470906540595 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5219271470906540595 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Excellent, I'll give it a watch. Thanks.

[11:18 AM](https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html?showComment=1360869508247#c1643601016932066175 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1643601016932066175 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I would not like this kind of thing **at all**. Here I am getting into being an adventurer and all of a sudden some guy's boggle game gives me some HP. That would totally ruin the immersion for me and, worse, would detract from the decision making process. Dare I go in this cave and fight the wibbly-monster, I think I have enough resources - massive battle, its going down to the wire, its going to be touch and go, unless some cows make milk in a farm elsewhere. The variables in my decision become 'who is online' rather than 'how well can i play this game'

[3:20 AM](https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html?showComment=1367403645152#c5258791186688659254 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5258791186688659254 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

So if you ever implement this, please make a 'hardcore' mode with outside help turned off. Although, bizarrely I would get a kick out of help other players if my games goes well.  
  
Perhaps an alternate way of doing this would be to have a central location (guild?) where achievements from the various games get piped into. As well as playing, you are boosting your guild. Should you play games within the guild bubble, you can get help as you describe.

[3:24 AM](https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html?showComment=1367403846773#c7196018285850694419 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7196018285850694419 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It's intended as multiplayer, not as single-player-with-annoying-popups, so if you played in single player it wouldn't happen.  
  
You could still do things like race ghosts or get friend gifts at the hub or other non-live interactions, of course.

[7:15 AM](https://projectperko.blogspot.com/2013/02/pangame-multiplayer.html?showComment=1367417717160#c3263359946999314080 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3263359946999314080 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5371902107626373563)

[Newer Post](https://projectperko.blogspot.com/2013/02/crafting-party-members.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/02/dlc-and-downloadable-games.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5371902107626373563/comments/default)
