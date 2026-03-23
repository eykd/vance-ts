---
title: "Data = Process"
date: 2007-05-04
url: https://projectperko.blogspot.com/2007/05/data-process.html
labels:
  []
---

## Friday, May 04, 2007 


### Data = Process

There's a tendency today for code be a specific way. In fifty years, we'll look back upon this era of coding as sheer idiocy. We'll call it the "Enterprise Era". I can hear Kirk screaming now, so maybe I should call it the "Khaaaaaaaaaan! Era".  
  
There's this ideal that data and code should be separate. Now, this makes good sense: you're turning your program into a tool that interprets a specific kind of data (which is, actually, just a program written in the "language" of your program). This lets you change how you handle the data, lets you add new components, and so on really cleanly.  
  
The problem is that at some point, this became holy writ rather than clean coding.  
  
The "holy writ" version of this is the ideal that your program has to be able to be upgraded to handle other data without breaking or modifying its architecture - "seamless integration" or "seamless expansion".  
  
But you have to remember: a tool only "breaks even" when it saves as much time as it cost to implement. 99% of new feature requests *don't upgrade politely* . When you are given new requirements, usually they don't fit your architecture - even if you do have this beautiful infrastructure for adding new capabilities. So you have to go back and reprogram everything *anyway* . The tool saved no time. Worse, such "tools" frequently *slow down* normal development.  
  
Excessive infrastructure to support these theoretical, mythical improvements results in wasted time and a dramatically bloated code base. It's an inefficient waste of project resources to create tools that will never "break even".  
  
I'm not saying you shouldn't plan ahead. There's always a trade off: at what point is it worse to code more abstractly, and at which point is it worse to code more concretely? Obviously, sometimes you'll need something more toolish, sometimes you'll need something more applicationish.  
  
The separation of code and process (or lack thereof) is an attempt to make programming easier... NOT a mandate from above.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:23 AM](https://projectperko.blogspot.com/2007/05/data-process.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3412129911138364311 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3412129911138364311&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3412129911138364311)

[Newer Post](https://projectperko.blogspot.com/2007/05/wordplay.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/04/integrating-characters-into-games.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3412129911138364311/comments/default)
