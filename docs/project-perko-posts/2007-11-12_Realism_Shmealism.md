---
title: "Realism Shmealism"
date: 2007-11-12
url: https://projectperko.blogspot.com/2007/11/realism-shmealism.html
labels:
  - game design
  - social simulation
---

## Monday, November 12, 2007 


### Realism Shmealism

I've been thinking more about social simulation recently - that's what causes any significant stretch of silence on this blog.  
  
I have always said that you can't really do a realistic social simulation in a game world, because there's no subtleties. It's too clear and simple. Recently I realized, however, that even if you could  , you wouldn't want to .  
  
Realistic social relationships and interactions are painfully boring 99.999% of the time. Like life. You show the interesting bits - or you make the character live an extraordinarily chaotic life - but you never sit there and show the boring parts. Unless, you know, you need to set the mood. Not as entertainment.  
  
The problem is that cheating is difficult. You can create a list of story elements or an algorithm for interesting behavior, but in the end you're looking at something that is strictly limited to what you, the developer, put into it. You aren't looking at a cornucopia of content, you're looking at a tool that helps you put in a different kind of content.  
  
The question isn't "how do we simulate social behavior". I don't think it ever really has been. The question is how we generate social content.  
  
My favorite method is to use player-generated or player-directed content.  
  
Let's imagine we're making a Star Trek game. Oldschool Kirk stuff. Half the actual fun stuff in those episodes were social interactions: Star Trek was typically very human-centric, which was probably one of the reasons it was so successful.  
  
So, we want to allow the players to generate content at some level. We basically have two choices: we can let them create the plot, or we can let them guide the characters.  
  
The first option means that a player will have some method of specifying plot elements. "Introduce a girl... Kirk's old girlfriend..." "a new spatial anomaly... that makes everyone itch..."  
  
The second option means that a player has to make the characters act in ways which fit their social roles. "Kirk rants to central command... about imminent war..." "Spock diagnoses a counteragent... to the itching..."  
  
Either way you do it, it's not incredibly difficult to let the other half be simulated. It reduces the problem dramatically, because now the player is the one creating the continuity, so we don't have to worry about it. It's even possible to switch back and forth, so long as we never let the computer handle both simultaneously: the player must always be around, gluing the past to the present.  
  
But you are left with an almost insurmountable difficulty: talking.  
  
To me, talking is the  difficulty. It's almost impossible to generate dialog on the fly, even when you get a player to be incredibly specific about the context. For example, Kirk is ranting to Spock about the danger his former girlfriend is in. We know exactly what we need to convey... but what does Kirk actually say ? And two episodes from now, when he has to rant about the danger that his old high school buddy is in, will he repeat himself?  
  
There's a few solutions that I can see.  
  
The first is to **write adaptive dialog**. A lot of it.  
  
If you're willing to blunt your fingers writing thousands of lines of tab A-slot B dialog, this is a good way to go. The AI doesn't have to be very good, because it's embodied in the dialog chains. You don't need a wide variety of evocative locations, because the dialog is your primary feedback mechanism...  
  
The second is to **create a meta-language**. Something that is simpler and cleaner than English, but still allows for communication.  
  
While some players won't like this, other players will take to it like taking candy from a baby. However, you will need to give your characters fairly advanced AI, so they can talk about and understand abstract concepts like love, self-doubt, what the future may hold... even good AI won't be able to do enough thinking for all of this, so it's generally best if the player controls the characters. This lets the player come up with the complex abstract concepts, and the characters just have to nod and smile.  
  
The third is to **go mute**. People talking is rendered as gibberish. Let the player try to figure out what is going on from the context.  
  
The downside to this is that the characters will be rendered pretty generic, so you need to make the context very strong and versatile. Body language becomes important, as does the number and variety of backdrops. Basically, this is a prop-driven system. It works well when the player has control over the plot (and can therefore introduce new props).  
  
Anyways, I'm just thinking about all this. I've come up with some game designs - I'll make something in Rails, I think - but I'm having a hard time coming up with something tenable.  
  
I want to make my next game have a very heavy human element. I don't want to make another spreadsheet game or shooter or pointless puzzler.  
  
What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [1:06 PM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/673388744832546465 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=673388744832546465&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 8 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Agreed that dialog is the problem. Making a system that can have meaningful dialogs with players should be possible without writing billions of lines if you can sufficiently define a subset of commonly used English (kind of an combination of approach #1's idea with approach #2's limitations). Research has shown that up to 80% of everyday communication in European languages occur with only the 500 most common words (*De Mauro, 1993*). Assuming you can build a system which is aware of the basics of grammar and the 'meaning' of the word (i.e. can put those words together into a meaningful sentence) it should be possible to create a pretty decent simulacrum of a 'talking' AI using maybe a dozen state variables and these words. (States like 'frustration', 'excitement', 'boredom', and 'interest' spring to mind.)  

  
The challenge then, I suppose, would be weighting the words to the states in such a way that is consistent but with enough randomness that it doesn't always map to the same words.  
  
At any rate, an interesting topic and I'm interested to see your approach.

[5:03 PM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html?showComment=1194915780000#c9006804254358290800 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/9006804254358290800 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

But the 80% of everyday communication that's easy to simulate is BORING! :D  
  
Continuity is always a huge problem, and that's why I like to foist it off on the player. I'm not sure exactly what the best approach is yet, though.

[5:31 PM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html?showComment=1194917460000#c4076603514378371125 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4076603514378371125 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/03146360375570794401)

[Ian Schreiber](https://www.blogger.com/profile/03146360375570794401) said...

I think you've hit the nail on the head. You described exactly why the Sims speak in gibberish... AND why Chris Crawford is doing this weird meta-language thing with Storytron.  
  
The fourth possibility is to not do a simulation at all, and just have huge amounts of prescripted social content. Japanese "dating sims" do this, as do some prominent US RPGs.

[7:56 AM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html?showComment=1194969360000#c4569696018611571545 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4569696018611571545 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Ian: I think that my first option is that option. You write lots and lots of dialog, and you don't have to have complicated AI or anything. It's all written in the dialog.

[10:46 AM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html?showComment=1194979560000#c345351619309922036 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/345351619309922036 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15516414416783046990)

[Olick](https://www.blogger.com/profile/15516414416783046990) said...

The question I have is, how would you use this in a game? Would the game be sort of a sandbox, where you create a plot at your own whim, or could it be used to create useful social content for say.. the elder scrolls games, which you have previously complained about poor social sub-games.

[9:34 AM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html?showComment=1195148040000#c6303446687726049107 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6303446687726049107 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

While in theory social content could be put into any game genre, the game has to be designed with social content in mind from the beginning.  
  
You can't just slap social content into, say, the Elder Scrolls games. Because it doesn't matter how good your algorithm is if it doesn't reflect in your game play.  
  
Even if Yea Olde Guarde has an advanced social engine, him liking you or disliking you or feeling anything about you at all is so totally irrelevant there's no point to implementing it.

[10:16 AM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html?showComment=1195150560000#c6718059113857835470 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6718059113857835470 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/07640683757330420292)

[Christopher Weeks](https://www.blogger.com/profile/07640683757330420292) said...

You write:  
  
"So, we want to allow the players to generate content at some level. We basically have two choices: we can let them create the plot, or we can let them guide the characters."  
  
I'm not grokking why it's given that they can't do both. And even if that's how it is, can they do both, but not at the same time? What if some of the current players do plot and the others to characterization?  
  
Also, I'm not sure exactly how this is related, but reading this blog article made me think "this guy needs to play Universalis." ( http://www.indie-rpgs.com/ramshead/ ) It's a paper-pencil RPG/story-game with no GM in which the players do everything, including setting, content and continuity.

[1:36 PM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html?showComment=1195162560000#c7546386488447221000 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7546386488447221000 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Weeks: you can certainly have both elements controlled by players. It would be kind of tedious if both were controlled by one player, unless it was some kind of staggered method, but it would be a very interesting multiplayer method.  
  
Universalis is a game that crops up pretty regularly - lots of people suggest it to me.  
  
Universalis has a moderately interesting approach in that it puts point values on various plot elements. However, it isn't nearly as unique as it seems to be: I have literally half a dozen RPG systems stacked up near my desk that take a very similar approach, all of which have strengths and weaknesses. Those are the ones I *didn't* create.  
  
The situation is a complex one, and there are a lot of issues and cool things you can do. However, in this particular case, I'm talking strictly about computer games.

[2:09 PM](https://projectperko.blogspot.com/2007/11/realism-shmealism.html?showComment=1195164540000#c6801155610909588508 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6801155610909588508 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/673388744832546465)

[Newer Post](https://projectperko.blogspot.com/2007/11/reavers.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/11/shadow-watch-review.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/673388744832546465/comments/default)
