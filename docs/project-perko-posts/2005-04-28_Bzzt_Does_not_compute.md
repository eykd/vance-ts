---
title: "Bzzt! Does not compute."
date: 2005-04-28
url: https://projectperko.blogspot.com/2005/04/bzzt-does-not-compute.html
labels:
  []
---

## Thursday, April 28, 2005 


### Bzzt! Does not compute.

I spent the last TWO DAYS trying to figure out why the software I'm writing had gone all cracky. Access times went from less than a quarter second to half a minute.  
  
I was picking through my code - what was it? The code was tight as a drum. It couldn't possibly be the code. Maybe one of the external functions I was using was taking up dramatically more time than I thought? Well, not that one... or that one...  
  
I finally figured out the problem: I was running 'arp' and it never occurred to me that Linux would HANG on arp for thirty seconds. Turns out I had an amorous Windows server frantically trying to back up my Linux box. Since it's the only Linux box on the network, neither knew how to handle the situation. Furthermore, for reasons unknown to me, the Windows box REFUSED to respond to pings while trying to back up the system.  
  
Worse, if I rebooted, it just reconnected. Until IT gets around to fixing the problem, I just cut that segment out completely. I'll live, although it creates a security hole. In a system specifically (and at request) created to be as secure as tissue paper. I'm not worried.  
  
Now the code runs lightning fast again. Ah, code looks real tight after the fourth rewrite.  
  
If you've gotten this far, you really need something more interesting to read. Honestly. Listening to me mutter about work-related projects ranks right up there with playing solitaire.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [3:49 PM](https://projectperko.blogspot.com/2005/04/bzzt-does-not-compute.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/111472916137015721 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=111472916137015721&from=pencil "Edit Post")


#### 1 comment:

[!\[Image\](https://2.bp.blogspot.com/\_WQk0 YgqQA9Q/SaAzb6ng2VI/AAAAAAAAANw/Go874k1XLAc/S45-s35/profile.jpg)](https://www.blogger.com/profile/01646249933207430061)

[Darius Kazemi](https://www.blogger.com/profile/01646249933207430061) said...

...as I take a break from my Solitaire game to read your blog...

[6:50 PM](https://projectperko.blogspot.com/2005/04/bzzt-does-not-compute.html?showComment=1114739400000#c111473943558910717 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/111473943558910717 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/111472916137015721)

[Newer Post](https://projectperko.blogspot.com/2005/04/workers-disunite.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/04/rummaging-and-foraging.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/111472916137015721/comments/default)
