---
title: "Here I am, Brain the Size of a Planet..."
date: 2006-04-30
url: https://projectperko.blogspot.com/2006/04/here-i-am-brain-size-of-planet.html
labels:
  []
---

## Sunday, April 30, 2006 


### Here I am, Brain the Size of a Planet...

I have created the most powerful topological search and modification engine I've ever seen. Woo-hoo!  
  
In a labyrinth of an almost arbitrarily large size, it can find the shortest path(s) to the goal *and then modify them* . It can even *make* an intelligently designed path if one doesn't exist. This may sound familiar: I'm implementing Perkplot as a simple labyrinth puzzle game.  
  
It is astonishingly fast and I am well pleased. But I found something irritating as I was trying to tweak it for release to anyone who wanted to download it:  
  
T2D *crashes* due to the huge number of sprites involved in creating a 100 x 80 labyrinth (~24,000). It can create them, but when it comes time to get rid of them... crash!  
  
This means that although it is extremely powerful, it has this pain all up it's left diodes...  
  
So I'm looking into ways to reduce the number of sprites from 2-5 per tile to 1 per tile. It may take me a little while, but take heart:  
  
*The algorithm works!*

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [2:30 PM](https://projectperko.blogspot.com/2006/04/here-i-am-brain-size-of-planet.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114643265260694775 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114643265260694775&from=pencil "Edit Post")


#### 2 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Umm, are you allocating an array of 24k items, or using a linked list? Either way, I think you're using the wrong kind of pointer, which is why the crash. You need to use farpointers if you're going to work with that much memory.  
  
If T2D takes care of it for you, check the manuals for large-memory useage instructions. If there are none, it probably takes care of it for you, and you're just overrunning one of their buffer limits.

[5:47 AM](https://projectperko.blogspot.com/2006/04/here-i-am-brain-size-of-planet.html?showComment=1146487620000#c114648762091088982 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114648762091088982 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It's middleware. It's alpha. It's not mentioned.  
  
The actual problem is this: T2D alpha 2 crashes when you delete more than a few sprites without a pause.  
  
So, I reduced the number of sprites and inserted a pause between each.

[8:39 AM](https://projectperko.blogspot.com/2006/04/here-i-am-brain-size-of-planet.html?showComment=1146497940000#c114649797796900979 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114649797796900979 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114643265260694775)

[Newer Post](https://projectperko.blogspot.com/2006/04/okay.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/04/5.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114643265260694775/comments/default)
