---
title: "Behold the True Power of Data!"
date: 2006-01-28
url: https://projectperko.blogspot.com/2006/01/behold-true-power-of-data.html
labels:
  []
---

## Saturday, January 28, 2006 


### Behold the True Power of Data!

I don't live near any kind of grocery store, and I don't have a car. So I decided to try one of those grocery delivery services. In this case, [Peapod](http://www.peapod.com/). I ordered more than a week's worth of food - more than $50 of groceries. When they delivered, they brought me: a gallon of milk.  
  
Everything else I ordered was out of stock.  
  
Now, admittedly, I order some pretty unusual things, so I can see them being out of stock. However, there's about fifteen things wrong with the whole situation. Not least being their bizarre assumption that I would pay a $10 delivery charge for a $4 gallon of milk.  
  
To their credit, when I called them after turning the delivery away, they said there would be no charge. But the whole situation is ludicrous, and worse, there's no way to prevent such things from happening every time I order.  
  
This is caused by a half-assed data center.  
  
Why doesn't their database know what they have in stock - and what they are getting delivered before the loading time for the vans? If they don't have any, say, Balance Bars, why do they even let you order them? A decent database should return a "zero in stock" when you're out, and the UI should simply not allow you to purchase them, either by leaving them out entirely or by noting their out-of-stockiness.  
  
And if you're getting in more tomorrow, you know how many you're getting. Or you're really, really inept. So, the database should find it *simple* to simply say, "this is the number we're going to have tomorrow when the vans load (A), and this is the number the vans are going to load (B). So we will have (A - B) in stock and available for purchase."  
  
Furthermore, a good database can flag idiotic situations like pending delivery of 5% of your order. It should be able to tell someone to contact the orderer in situations like this and ask: "Do you want me to just deliver milk?"  
  
*This is basic database stuff*. I mean, this is the sort of thing that I can do - and have done, and will do. It's not hard stuff.  
  
Don't companies understand that *data is their most important asset*? They'll blow all their cash on some idiotic legacy database like FoxPro, or on some overblown "modern solution" like the various German "super-databases", and these things won't work right. Because you need to have a data specialist set it up for your company's needs. You think there's a turnkey solution for something like PeaPod? No!  
  
If someone says there is, they are lying.  
  
The funny thing about data specialists is that most of them get kickbacks for choosing to use a particular set of software - this guy is an MS guy, that guy is Oracle, so those are the solutions they will recommend. Those guys generally come expensive, but they're still better than actually walking over to MS or Oracle and asking for a solution. The software companies don't know anything about your needs, and never will. But they'll be happy to pretend they do!  
  
Of course, my suggestion is to find a nice, independent data specialist like me. One who has no problem using MySQL, a stable server of virtually any platform, and whatever front end the job needs, whether it be MS or PHP. We can give you the right solution for your needs, as opposed to bludgeoning our solution into a squiggly shape that kinda-sorta fits. Ah, the power of knowing your options.  
  
Actually, my suggestion is to find *me*, but I'll understand if you don't. Still: find a data specialist (or company of data specialists). Don't try to buy a "solution" straight from a software company. They will hose you. They don't care.  
  
And once you get your data working for you, you won't have Peapod's trouble. You'll have a level of elegance and automatic customer satisfaction that will make Peapod turn green. Er. Greener.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:35 AM](https://projectperko.blogspot.com/2006/01/behold-true-power-of-data.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113847818892264312 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113847818892264312&from=pencil "Edit Post")


#### 2 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

This encapsulates the spirit of the Gamasutra article I'm trying to write (haven't started it yet, heh). Data is a certain Yin to a game, and data representation should tie into the interface, the projected verbs (magic circle) and the content structures to create a reliably good service environment everytime the player boots up. Thats the missing piece of the puzzle, thanks Craig, you're a fairly intelligent guy.

[3:11 PM](https://projectperko.blogspot.com/2006/01/behold-true-power-of-data.html?showComment=1138576260000#c113857627937142426 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113857627937142426 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

You're welcome. Although I prefer to think of myself as an *unfairly* intelligent guy, ha.

[7:11 PM](https://projectperko.blogspot.com/2006/01/behold-true-power-of-data.html?showComment=1138590660000#c113859068882880672 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113859068882880672 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113847818892264312)

[Newer Post](https://projectperko.blogspot.com/2006/01/combat-sucks.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/01/tricking-players-into-having-good-time.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113847818892264312/comments/default)
