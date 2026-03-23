---
title: "So you want some dialogue, do you?"
date: 2006-04-01
url: https://projectperko.blogspot.com/2006/04/so-you-want-some-dialogue-do-you.html
labels:
  []
---

## Saturday, April 01, 2006 


### So you want some dialogue, do you?

This is a post about what I learned from Crowd of Three, and what I'm going to learn from my next game.  
  
When creating a social intelligence, there are a lot of ways to go about it. There are, however, three core elements that always need to be included:  
  
1) A reason to socially interact.  
  
2) A result of socially interacting.  
  
3) A visible social interaction.  
  
The problem is that in almost any situation anyone can think of, the world needs to be pretty darn complex to provide a variety of reasons to socially interact. If you've just got two empty-headed people sitting around on a vast white golf ball, what are their interactions going to consist of? Not a whole lot!  
  
So you add things that get the blood pumping. Danger. Love. Money. Lust. Histories, futures, presents. You give them a reason to react, then trigger the reaction.  
  
A classic example: shoot a neutral person, they get pissed and try to kill you - or run away. What choice they makes depends on not only being triggered by you, but by the rest of the content. Comparative strength. Bloodthirstyness. Fear. Morality.  
  
If the programmer is really good, this guy will tell his friends that you're a dick. And there's another cause, and another effect.  
  
The second step is effect, of course. Someone who dislikes you has to have some noticeable effect, or you'll never even know. And the opposite is also true: people who like you need to do stuff to show you that.  
  
In the above example, the shooting and running and spreading rumors are all perfectly valid results.  
  
In Crowd of Three, the causes are (A) random vagueries and (B) trade. The random conversations that the people have at the beginning of the game allow them to build small preferences for and against other people. These preferences are weighted somewhat by the personalities of the characters, but are effectively random. This tiny difference determines who they are more likely to have more vagueries with and who they are more likely to trade with (for example, giving dice is an extremely common trade practice).  
  
All this worked okay, but I overlooked many of the strongest causes and was limited from some of the results I would have liked. For example, I wanted the characters to be able to get into fights, or at least shouting contests, that had to be broken up by other players. But this was a sufficiently large task that I decided not to do it. Similarly, I wanted characters to be able to negotiate a game plan among their "team" - "help me win this next round by giving me your dice, and I'll give you two tokens..." But, again, that would have required a pretty sizeable chunk of code.  
  
There were further refinements I could have made. For example, I could have made you dislike anyone who won tokens from you. But by then the other shortcomings had become evident enough to make it pointless.  
  
The biggest shortcomings lay in step three: visible social interactions. With no ability to move and only the very roughest visual emotional displays, the interactions had to be wholly through the game and text. For reasons unknown to me, the author of this game was stupid enough to only make one game interaction, and it was not even visually displayed.  
  
The end result of which is that showing the player what the social interactions were (and giving the characters character) lay wholly on the shoulders of simple text. Putting aside the fact that text is naturally less effective at this than virtually any other medium, each character needed to be able to talk about a wide variety of social interactions. In a voice which supports their characterization.  
  
Too tall a freaking order. Text generation isn't nearly as hard as text parsing, but as you have seen if you've played Crowd of Three, it's not as easy as I might wish. Perhaps with a team of writers... but I don't have such a team. (Although, if I started over now, I would do better. I know more, now. Generating dialogue is a totally different order from the descriptive text I've generated in the past.)  
  
There's other problems with step three (in this game and others). Showing the player a social interaction with crystal clarity allows him to see the seams in the simulation. This damages the empathy the player has built up. He thinks, "not a person..."  
  
So, what's my next try?  
  
Well, as I built Crowd of Three, I thought about other situations which had a high emotional breadth and depth, but were simple enough for a one-man team and a few weeks. I could come up with only one other option:  
  
Dreams. Daydreams, to be precise.  
  
Dreams are, in my opinion, a great idea. Dreams are fuzzy, not particularly logical. Seams can be hidden beneath the fact that it's a dream. Furthermore, I don't have to write a word of dialogue: it fits into the theme perfectly to allow people to talk in meaningless squiggles representing nothing more than an emotion.  
  
Furthermore, dreams offer a wider variety of causes and effects without requiring me to build a whole world. You can't jump off the boat? Of course not. It's a dream. You can't fully control yourself? Of course not. It's a dream.  
  
There's a lot of other issues, of course. Primary among these is:  
  
How the hell do I make a game about a dream without requiring an absurd amount of art content? Remember, I have to clearly show the emotions and actions of the humans involved.  
  
I could do just lineart. The coloring is really what takes me forever. And I think lineart might do well in a dream.  
  
Anyhow, this is a bit of what I have learned, and what I plan to do next. Comments?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [3:11 PM](https://projectperko.blogspot.com/2006/04/so-you-want-some-dialogue-do-you.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114393557328551833 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114393557328551833&from=pencil "Edit Post")


#### 3 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

The daydream idea sounds great, and if your proto is good you might want to consider fishing around for interested artists to do a bigger production. But as Raph Koster says, the best design doc is a prototype, so we will see.  
  
At GDC I met a GBA programmer and the next day got an idea for a social game based on gestural magic. I won't know if the local agency microgame is fun till we do first proto, but I suspect it will be.  
  
My big concern is how the spell casting fits into the social/dramatic macroGame. Theres plenty of reasons to interact, I've got a world IP I've been developing thats pretty ripe for that. And I think it'll be easy to see a clear response to immediate interactions, like you cast faerie fire and do some tricks and a character watching it lights up with amusement.  
  
The hard part is making the social interactions visible, getting these small feedbacks to add up to a clear indication of how relationships change in the bigger picture. I'm also considering using Santiago's verbal interface that I showed you in the Utopia demo and using that as an alternative to dialogue trees. So the player will have magic and analogue responses to dialogue as their means of imparting social choice, the magic is actually digital since spells are comprised of specific sequences of gestural symbols. So thats one digital and one analogue form of communication, as well as spell-based mini-games where the overall number of outcomes (and maybe the analogue pattern of play, but thats much harder) builds a reparte between the involved characters.  
  
I know I can check everything I've bitten off, but I'm trying to pace myself and get it right in pre-production before I dive into writing and scripting mass amounts of content. Any advice you have from your experience would be extremely appreciated.  
  
Note: my project's dialogue would consist of pre-written text, possibly recombinant to some degree.

[9:30 PM](https://projectperko.blogspot.com/2006/04/so-you-want-some-dialogue-do-you.html?showComment=1143955800000#c114395580638952263 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114395580638952263 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, my warning is that you're underestimating the difficulty of creating content. Gestures aren't much content, but they need to be backed by a rather impressive interpretive algorithm. On the other hand, text isn't complex, but you need a whole lot of it.  
  
I find almost anything can be fun if it has a good game behind it. If you don't include a game, it has to be a powerful, recombinant algorithm that fascinates.

[7:54 AM](https://projectperko.blogspot.com/2006/04/so-you-want-some-dialogue-do-you.html?showComment=1143989640000#c114398969816989746 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114398969816989746 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Right, we're working on proto-ing the interpretive algorithm now, getting it to work with the greatest margin of forgivable error. In the dramatic macroGame, there is a clear goal of becoming a magi, as well as side-issues amoung the characters, so I think I'll be okay.  
  
And fortunately, lots of text is something I can deliver. When I was 17 I wrote a 300 page novel in 9 months, I suspect a game's worth of text would be about a third of that.

[10:55 AM](https://projectperko.blogspot.com/2006/04/so-you-want-some-dialogue-do-you.html?showComment=1144000500000#c114400054976423004 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114400054976423004 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114393557328551833)

[Newer Post](https://projectperko.blogspot.com/2006/04/if-mud-mmorpg.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/04/why-strip-poker.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114393557328551833/comments/default)
