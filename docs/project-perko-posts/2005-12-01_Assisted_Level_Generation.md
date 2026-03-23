---
title: "Assisted Level Generation"
date: 2005-12-01
url: https://projectperko.blogspot.com/2005/12/assisted-level-generation.html
labels:
  []
---

## Thursday, December 01, 2005 


### Assisted Level Generation

Long-winded theory...  
  
In my older attempts to design level creation utilities, I always tried to go as automatic as possible. This ended up requiring me to try to figure out how characters act, synthesize what they say and what they do, and all sorts of other "breakthrough" stuff. Obviously, the final product was much less impressive.  
  
But the idea I had a few posts back, about "inhabited levels", is something within reach.  
  
Perhaps you can't generate convincing characters and sub-plots automatically. But you can generate *items* automatically.  
  
What if you had a "meta-level script"? When it came time to release the next episode, your meta-script would say "George switches rooms with Janie." In the game, it would switch their claimed domains, but it would also create an automatic "trail" depending on how much information you gave it.  
  
Then the system creates "items" (conversations, records, actual items) which relate to this. What it creates depends on the "flow" of the level and the priority of the information. For example, it could have two people talking in the corridor: "I heard Janie and George switched rooms!" "Really? Why?" "I dunno..." Or, if you want a higher priority, you could get an email asking why they did, or telling you they did. "FYI, captain, I got this room change request and okayed it." Or, if it's a lesser priority, it could be a slip of paper you pull out of a searched cabinet in the back of a room. "ROOM CHANGE REQUEST FORM: BLAH BLAH BLAH."  
  
As stated, there's no context. Although we might be able to make an algorithm to extrapolate the context from earlier info, we're going to avoid that sort of thing. So, it doesn't know why. This lack of emotional anchoring means the only things that can be created are barren, as listed above. A clever algorithm could inject emotion. For example, instead of the conversation above, it could be: "I head Janie and George switched room!" "Damn it, that means I'm living next to George now. He's so whiny!" "... said the pot to the kettle..." This generates emotional context - either fresh or recycled.  
  
If it's a really clever algorithm, Janie can find remnants of George's stay, or visa-versa. Anything from the innocuous to the damning. But this requires a high-level algorithm quite stronger than what I would waste time on at the moment.  
  
But it is probably more suitable to specify a context. Instead of merely saying, "George and Janie switch rooms" you could add, "because Janie wants to be near her boyfriend."  
  
Both George and Jamie have defined parameters which guide what items they can be expressed with. For example, Jamie might be a cheerful xenobiologist, and George a whiny security guard. This means that any text or conversation will be tainted with that, assuming you auto-generate text and conversation.  
  
So, in this context a lot of interesting items could be created. You could have a BBoard rant from George about how he doesn't want to move and yadda yadda yadda. You could have a love letter or conversation between Jamie and her boyfriend talking about how great it is that they are so close together.  
  
At this stage, the algorithm is pretty complex. We've got it generating conversations, for Pete's sake. So let's simplify.  
  
Instead of using auto-generation, use aided manual generation.  
  
Write a conversation, maybe even denote who says which side. But don't specify where, or the timing: let the game engine handle that. That's within it's grasp. Specify a love letter, let the game figure out where to put it. Specify both, and let the game decide which to choose.  
  
The key to this much simpler method is "ownership". People have places they frequent, which they own and share in varying degrees. Understanding that a cabin is private and highly owned, that means that love letters are more likely to be found there. Understanding that corridors are public and not owned, that means that gossip and such are more likely to happen there. Mix this with a dose of "functionality", and you have a level map that can have items plugged in semi-automatically.  
  
"Jay and Steve play ping-pong. Eventually, Jay loses." Obviously, they play ping-pong *at the ping-pong table*. You don't need to carefully place Jay. You don't need to choose animations or commentary. You could, but there should be a stock of generic phrases to draw on for times when you have not specified anything.  
  
If the level doesn't have a ping-pong table, a smart script will improvise. But a dumb script, like the one I'm thinking about, would simply return a "no ping-pong table" error. (That's error 00x00E050, BTW.)  
  
The "realness" of the script would rise the more contextual-parsing you programmed the script to make. For example, a basic script would be programmed either to never let Steve or Jay to score a point, or to let them occasionally score a point at random, but not keep track of how many points are scored. Both are unrealistic. A more sensitive, adaptive script could let them score points in front of the player, but since the game cannot be "won" until that part of the script runs, it would reduce the chances the more points were scored, making them "better players" as the game went on. It would also alter the commentary to comments suitable for a higher skill level. This would mean that the longer the player watched, the more skilled they would get.  
  
Of course, this skilled algorithm is flirting with death by complexity, because the algorithm would need to remember that Steve and Jay play an awe-inspiring game of ping-pong, if the player watched long enough. Rationalization and internal consistency...  
  
But, even with the stupidest version, wouldn't it be preferable to have the level place all the components on itself, instead of manually generating each foozball table and night lamp?  
  
Maybe I'll whip up a language to specify such things in.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [2:08 PM](https://projectperko.blogspot.com/2005/12/assisted-level-generation.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113347671767412429 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113347671767412429&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113347671767412429)

[Newer Post](https://projectperko.blogspot.com/2005/12/games-with-class.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/12/snow.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113347671767412429/comments/default)
