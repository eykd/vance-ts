---
title: "Explicit! (vs Implicit, of course)"
date: 2007-11-06
url: https://projectperko.blogspot.com/2007/11/explicit-vs-implicit-of-course.html
labels:
  []
---

## Tuesday, November 06, 2007 


### Explicit! (vs Implicit, of course)

Boring coding article.  
  
I'll skip the long backstory. Basically, I've recently started thinking about implicit vs explicit languages.  
  
As you know, Bob, an implicit language lets you do more with less, but makes it difficult to stray from the well-worn path. An explicit language is the opposite, allowing you to do precisely what you want to do, but requiring more. More code, more skill, more mental RAM.  
  
I've worked with the source of a lot of products in my life, and I have developed a healthy distaste for explicit coding. To me, it smacks of selfishness: a coder programming something using more because it is more comfortable for him, screw anyone who might have to use his code base later. Selfish coding.  
  
As long as I have the source (and I always have the source), I DON'T find implicit languages to be especially confusing or surprising as to what they do. There are occasional exceptions, such as Ruby on Rails' ever-indecipherable pluralization rules. But I have a much harder time parsing and remembering the added arguments and lines of an explicit language.  
  
Also, I find that if you build towards implicitness, you build very tightly architectured code. I don't have to wonder whether the "takedamage" function is part of the ship class, ship interface, cship class, c\_ship class, c\_hull class, c\_base\_object class, or what. I don't have to wonder why sometimes you're passing a weapon, other times a struct, sometimes a damage class, sometimes a raw number, sometimes an enum... I find that explicit coders will tend to spread this kind of function out among half a dozen more-or-less related classes, and that really pisses me off. (That's a real example, sirs and madams.)  
  
The funny thing is that most programming paradigms (like Object Oriented Programming) are attempts to build an implicit language out of an explicit language. You build chunks of code that you call and they IMPLICITLY do stuff. You're functionally building your own dialect of whatever with every program you write. But nobody seems to think like this.  
  
They should, because people like me have to live with your choices, and if you try to be as implicit as possible, we'll be able to understand your program in half an hour instead of half a month.  
  
So, that's my coding article of the month.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:46 AM](https://projectperko.blogspot.com/2007/11/explicit-vs-implicit-of-course.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/794562826154518688 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=794562826154518688&from=pencil "Edit Post")


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15516414416783046990)

[Olick](https://www.blogger.com/profile/15516414416783046990) said...

Wait. So people sometimes DON'T use object oriented programming in order to create easy to read and use code?  
  
I think, though, that in many cases there is a lot of swap between implicit and explicit languages. For example it is wholly possible to build towards implicitness in an explicit language. Conversely, you may override ANYTHING in Ruby, and therefore may be as explicit as you wish at any time.  
  
I'm just starting out in the industry, and already I have read code that makes me want to cry. Learning arguments and lines is not as big of an offender as having to track down massive indirection. Files calling other files calling scripts which proxy other scripts...

[10:05 PM](https://projectperko.blogspot.com/2007/11/explicit-vs-implicit-of-course.html?showComment=1194415500000#c1935714702979310995 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1935714702979310995 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yeah, 'sall about the architecture. Or lack thereof.

[6:19 AM](https://projectperko.blogspot.com/2007/11/explicit-vs-implicit-of-course.html?showComment=1194445140000#c7703633855241644139 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7703633855241644139 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/794562826154518688)

[Newer Post](https://projectperko.blogspot.com/2007/11/how-to-do-action-aka-starships-ftw.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/11/languages.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/794562826154518688/comments/default)
