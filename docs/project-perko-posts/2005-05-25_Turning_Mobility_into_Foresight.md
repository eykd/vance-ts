---
title: "Turning Mobility into Foresight"
date: 2005-05-25
url: https://projectperko.blogspot.com/2005/05/turning-mobility-into-foresight.html
labels:
  []
---

## Wednesday, May 25, 2005 


### Turning Mobility into Foresight

It's hard to program on workdays - it takes me about two hours to really start chugging along, and I don't have all that much more than that per evening once I get home from work. So I really just get to do little spats of playing around with the code.  
  
Yesterday, I tested some of my theories on turning MOBILITY into FORESIGHT, which you might remember me talking about, if you bothered reading [my essay on relative view in shmups](http://projectperko.blogspot.com/2005/05/relative-view-in-shmups.html).  
  
The basic idea is that you can use predictable patterns to set up salvos in predictable ways. Essentially, this 'extends' the view of the player so that he can predict the salvos - as if they were coming in from far off-screen.  
  
I played around with this over the past few days and found some interesting tidbits. First, it can work. It can work SPLENDIDLY. However, it is EXTREMELY FRAGILE.  
  
So long as the player is a fair distance away from the enemies when they open fire, you get this beautiful, predictable, almost HYPNOTIC spray of bullets which you then proceed to dodge with grace, elan, and frantic cursing. However, if the player is too close to the enemies when they fire, it's excessively hard to dodge and usually very ugly.  
  
I found that it's quite a thin line, but definitely doable. If the player is SHOOTING BAD GUYS, he's not usually very CLOSE to bad guys - he's busy shooting them down on one part of the screen, and the enemies on the other part of the screen are far enough away that their salvos are good.  
  
But when the player is frantically dodging, he isn't shooting enemies, and they begin to stack up. The areas which the players can go to which are 'far' from the enemies that are about to fire shrink and grow more difficult to grok, and certainly don't line him up for an offensive.  
  
So, the question becomes, is it possible to teach the computer to send the CORRECT waves of enemies in the CORRECT places?  
  
PAC says: Yes!  
  
In particular, there are really two 'modes' to any shmup: the "I am king of the world!" mode, where you are blowing enemies away and dodging shots easily; and the "I'm gonna die!" mode, where you are desperately dodging bullets, not able to really get a firing solution on anyone.  
  
Unfortunately, BOTH of these modes are positive feedback loops. When you're dominating the field, it's easy to dominate the field because there's nothing ON the field to distract or challenge you. When you're busy scampering for your life, it's hard to recover, because you can't shoot any of the enemies which are forcing you to scamper, so they continue shooting at you.  
  
But a computer should be able to determine fairly easily how 'pressured' the player is by counting the number of bullets on the screen and correlating with the firing - or lack thereof - of the player. Knowing this, it should be easy to pull back a bit or punch it up a notch, and controlling which mode the player is in will be a central capability of the PAC algorithm to keep the player interested.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:57 AM](https://projectperko.blogspot.com/2005/05/turning-mobility-into-foresight.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/111704514243362854 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=111704514243362854&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/111704514243362854)

[Newer Post](https://projectperko.blogspot.com/2005/05/freakonomics.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/05/six-strings.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/111704514243362854/comments/default)
