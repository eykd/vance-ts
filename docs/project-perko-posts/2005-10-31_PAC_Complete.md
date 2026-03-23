---
title: "PAC Complete!"
date: 2005-10-31
url: https://projectperko.blogspot.com/2005/10/pac-complete.html
labels:
  []
---

## Monday, October 31, 2005 


### PAC Complete!

Over the weekend I finished the core architecture of the PAC engine. Groovy. The only big thing left is bosses/wave scripting!  
  
Of course, the codebase is far from "finished" - the engine will be polished continually right up until the end. But the architecture is there, and the polishing will be quite gentle.  
  
Taking "screenshots" of the PAC engine is, of course, pointless. It's a scripting language. However, to sooth the eyeball, here is an image of my early (but not as early as it was last week) map prototype.  
  
I was very concerned about the map. How would I represent a vast array of underground caverns? Especially since the player shouldn't know about unexplored locations?  
  
!\[Image\](https://lh3.googleusercontent.com/blogger\_img\_proxy/AEn0k\_uwgderUHcTozIyyCcMtQ6tWSxqWw31 Kjn9Z8nmBDZ1yFAY78GHlUjbfpaE38xVbLLMvsxLvLkwUCBJyXAoUSKDUuaXrgj-PDgj4dzwcCo=s0-d)  
[Full size](http://www.projectperko.com/images/tms10.jpg)  
  
The answer was simple once I found it: the map gets "drawn" as time goes on. The map is powered by a simple PAC script: memes which exist denote zones you have visited. For example, my first mission is "scaffold01". When beaten, it adds the "scaffold01" meme to your list, and in the map script is a line which is only triggered if you have the "scaffold01" meme. This particular map doesn't have any missions on it, because I wanted to show the unadulterated map.  
  
Obviously, the graphics are still preliminary: I'll be giving the parchment "depth", for example, before it's ready to go. But the concept is there.  
  
The script files are simple. Remember, this is not a programming language. It is only intended to do memetic calculations and control game flow. This is NOT TorqueScript. It's PACScript.  
  
For example, the present script for which pilot portrait to return is:  
  
\---  
? PLAYERFLYING  
return Portraits/pilot  
return Portraits/pilotonland  
\---  
  
(Where the Portraits/\* is the path/file of the picture to use.)  
  
Obviously, "?" is an if statement. You can just as easily do:  
  
\---  
? SCRUMDIDDLYUMPTUOUS > 10  
{  
m- SCRUMDIDDLYUMPTUOUS  
CONVERSE  
{  
pack PilotGraphics  
What's up?  
}  
PAUSE 1 second  
}  
\---  
  
(I don't support line-start white space yet, because I'm actually really unfamiliar with Torque 2D's string editing utilities. However, I am quite experienced with writing scripting languages, so the functionality works just fiiiiiiiine.)  
  
If the pilot is flying, the portrait is the windblown pilot. The "m-" deletes the meme. "m+" adds a number to the meme (or subtracts a number, if the number is negative). There's also "s+/-" for stage adding and subtracting, and "o+/-" for option adding and subtracting.  
  
So on and so forth.  
  
Now I can start on content!  
  
I'm in a great mood.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:41 AM](https://projectperko.blogspot.com/2005/10/pac-complete.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113078180224505477 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113078180224505477&from=pencil "Edit Post")


#### 4 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

This is a lot more historic than hardly anyone might imagine, with this there is now a documentable instnce of prior art for PAC-esque techniques. That means EA or Microsoft can't corner the dynamic content creation market before its comes to be with some patent. However I'm not sure the engine is robust enough to cover future engines which operate on similar principles of memetic adaptation, but use more powerful algorithms. Still, this is a big deal, congratulations! I look foward to playing with the scripting language.

[12:25 PM](https://projectperko.blogspot.com/2005/10/pac-complete.html?showComment=1130790300000#c113079031204331476 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113079031204331476 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It's not intended to be "robust enough" to do anything other than handle this game engine. I have a lot of experience with aiming too high. The old quote "aim for the stars and even if you fall short you'll still hit the moon" is pure, naive bullshit.  
  
Aim for the stars and you'll get nowhere. Aim for the moon, you'll get nowhere. Jump up, fall back down. Zero is gained, much energy is lost.  
  
So I aimed for a nearby hill. So far, the journey has been a good one.  
  
This is, of course, not patentable. The only thing I'm really doing is "controlling gamestate by recording which game elements the player chooses", which is hardly something new and unique.  
  
This is a test bed. It should also be a fun game. The second is more important than the first.  
  
Sorry if I sound like a downer, Patrick, but you're too idealistic and confident. You think too much of what is accomplished, and too much of what can be accomplished.  
  
I grew out of that.

[3:04 PM](https://projectperko.blogspot.com/2005/10/pac-complete.html?showComment=1130799840000#c113079988939581165 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113079988939581165 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

That said, you're welcome to play with the scripting language as soon as I get something beta-ish.

[3:05 PM](https://projectperko.blogspot.com/2005/10/pac-complete.html?showComment=1130799900000#c113079994351681625 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113079994351681625 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Well, to be fair I am only 20. Keep me posted.

[10:20 PM](https://projectperko.blogspot.com/2005/10/pac-complete.html?showComment=1130826000000#c113082604986756996 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/113082604986756996 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113078180224505477)

[Newer Post](https://projectperko.blogspot.com/2005/10/ngah-smegging-socialism.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/10/scaling-images.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113078180224505477/comments/default)
