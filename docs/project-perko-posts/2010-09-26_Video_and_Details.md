---
title: "Video and Details"
date: 2010-09-26
url: https://projectperko.blogspot.com/2010/09/video-and-details.html
labels:
  - game design
  - world design
---

## Sunday, September 26, 2010 


### Video and Details

Here's a YouTube video of ChinaSim and the new toy that can actually be seen in video. (As you'll see, ChinaSim is basically impossible to see in video.)  
  
[Video](https://www.youtube.com/watch?v=d6 MuJafwRE0)  
  
Anyway, one thing the sharp-eyed among you will notice is that the new toy has some distinct weaknesses, one of which is that the trade routes don't tend to run along rivers/coasts. That's not ideal, but I'm just showing the basics, so I didn't bother to refine it. Ideally, the contours of the land play a huge role in what cities can reach which cities: cities on the same river can trade with each other, and cities on a coast can reach a wide range of cities also on the coast. Mountains are hard to cross, and so on. The new sim has some aspects of that, but they weren't turned up enough since I didn't spend any time polishing it.  
  
Another thing that you may have missed is that the ChinaSim cities modify the landscape, while the new toy cities don't. There are two reasons for this.  
  
ChinaSim cities build a lot of stuff. They build farms and mines and such. When I originally built it, the idea was to be almost identical to something like Civilization: a resource-based building game. However, that stuff seems very minor in comparison to trade routes, so I left it out.  
  
ChinaSim cities also chop down forests to bolster their economy. This is fairly realistic: even relatively early societies happily chopped down every tree they could find. It also serves as a handy limiter: when you're out of trees, you're out of an economic free ride. When your population outgrows the wilderness, you have to survive on your trade routes.  
  
It's invisible, but ChinaSim also has a fertility rating for the land, which drains over time. This was implemented specifically to get large, flourishing civilizations to collapse, Fertile Crescent Style.  
  
Those things can be added to the new toy, but even without them, sufficiently large nations tend to tear themselves apart into many smaller, independent nations. So there's no need to engineer a mass famine: the world will never consolidate (or never for long).  
  
There are tons of things I could do with the new sim if I wanted to spend more time on it. One is to replace the per-pixel border claims with regional border claims. I want to split the map into regional blocks of maybe 8-30 pixels in area, split along natural boundaries such as slopes, rivers, and so on. With per-pixel claiming, the nations spend a lot of processor power just thinking about what to claim to what extent (hence the halfassed blotchy look you see in the video). With a regional claiming style, that could be eased and made more realistic.  
  
While I've focused on computer algorithms that automatically generate a world, there are plenty of worlds that are not generated in that way. But hand-drawn worlds have many of the same features, and a game where the player is involved in building the world also has the same features.  
  
Anyway, if you want any implementation details, comment here and I'll provide them.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [12:14 PM](https://projectperko.blogspot.com/2010/09/video-and-details.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2079199230726727035 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2079199230726727035&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [world design](https://projectperko.blogspot.com/search/label/world%20design)


#### 6 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEs\_w3fS51Y1n854 MwGch8 Ne2KGcBJgvKv0Y7i80-gkLSIGGCoPRVhxE3cgZWGwno0 PkwKELEcyDW7iN0--WjDlJNmPQkLFwUFJW9PDMEeg0q5vFOt5qGWNapLLVaGIgQ/s45-c/SmallFace.jpg)](https://www.blogger.com/profile/08092961053525023723)

[Bronzite](https://www.blogger.com/profile/08092961053525023723) said...

I actually find this to be very interesting. How are you generating where new cities get placed, or what trade routes get created? Once established, do routes ever break? Besides running out, do resources ever change their demand or supply levels?

[3:09 PM](https://projectperko.blogspot.com/2010/09/video-and-details.html?showComment=1285538964564#c249087956498514567 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/249087956498514567 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

In both cases we can simply count up the total value of the tiles near the city (weighted for distance). Discrete resources such as gold or cattle are worth the most, followed by existing trade routes, followed by water tiles, followed by fertile lands, followed by forests. After that there are progressively less valuable lands, such as grasslands, swamps, crags, and so on. Each tile has a variable value, since tiles have many attributes. Decrease the value of the city if it is too close or too far from other cities.  
  
In ChinaSim, everything was gridded off and one starter city dropped in the best location in the grid (if possible). Further cities were placed when population permitted at the new best spot. Due to the strong penalty for being too close to a city, it wouldn't be right on top of each other.  
  
In ThousandLands, the new toy, cities are placed by roving bands of settlers (those black dots). They "flow" in the direction of higher value and settle when all directions lead to worse value. This flowing is much less computationally expensive than trying to calculate out the whole grid zone, but it does occasionally mean that the settlers do silly things.  
  
How trade routes are set up is a bit complicated, because I've tried a lot of different methods. In all cases, it more or less boils down to finding a city worth connecting to, and seeing if you can afford to build a path. A similar "flowing" system to that used by settlers is used to plan out a path and determine it's price, although obviously the thing of value in this case isn't resources, but ease of travel. Also, routes over water are much, much cheaper than routes over land, since you don't actually have to build the road. Of course, if you are establishing a route that is "on top of" another route, you can use the same road, and that's cheap enough.  
  
Routes break if either city is destroyed or if either side decides to embargo/block the route. This doesn't destroy the roadwork, if any, so it's often very cheap to restore a broken trade route. A trade route can be destroyed by war, but my AI never bothers.  
  
Resources never run out in my world, aside from basic fertility and forests in ChinaSim. The whole point was that I downplayed resources to a hilariously low level.

[4:09 PM](https://projectperko.blogspot.com/2010/09/video-and-details.html?showComment=1285542544280#c4544793655252935311 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4544793655252935311 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQGVSPmlXYBXDVsU9gDHvY7gClGEm13CSiUOrvj1yfrx9\_Jj8C45-fhxyb65KGHKGVk9aCNYBXzy9zVtTkuSz42WIY7uJSV8HS5 WhTOUSUlFImSDkvk9nvSzTxK6ihHA/s45-c/grenss.jpg)](https://www.blogger.com/profile/07006701742406299244)

[envelope](https://www.blogger.com/profile/07006701742406299244) said...

When larger nations tear themselves apart to form smaller ones, what are the pressures the drive that process?

[9:25 AM](https://projectperko.blogspot.com/2010/09/video-and-details.html?showComment=1285604731419#c5347136121678784353 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5347136121678784353 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

That's a great question!  
  
The answer is "unrest", which is represented visually by the "pulsing/flickering" that you might have been able to see in the video. Unrest is caused by a variety of factors, including a declining economy, losses in war, and cultural shift.  
  
Because cities with high unrest ratings are less productive and less resistant to cultural forces, at some point the unrest starts to spiral out of control. The nation can attempt to curb the unrest, but all that does is change the dynamic a bit, and it can easily backfire.  
  
Cities with high unrest make great targets for conquest, since a token military force (or no military force at all) can sway those in power to join your team. Alternately, a city with high unrest may rebel and start their own faction, which gives them an immediate "golden age", reflecting their will to stay independent.  
  
Cultural shift becomes more prevalent the more cities/further from the capital your cities are, since cultural shift is measured against the capital's culture. Cultural DRIFT is a major force in these situations - the cultural pressure from the capital can't keep up with the number of cities, all of which drift. However, cultural pressure from neighboring nations can also be a very important factor.  
  
Cultural drift/pressure is not a significant factor while at war. First, it takes too long in comparison. Second, wartime actions typically bring cities back in line with the capital culture - things like sending out new governors that were raised in the capital.  
  
However, in times of peace, drift and pressure will tear large nations apart. Especially if they are segmented by largely impassable terrain, since cultural pressure travels along trade routes.  
  
Along with stagnation rules (if implemented), these combine to insure that while the world can be conquered, it will never stay conquered very long.

[9:50 AM](https://projectperko.blogspot.com/2010/09/video-and-details.html?showComment=1285606218109#c4587375633680026000 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4587375633680026000 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It should be noted that the situations that cause unrest are usually nation-wide. A nation will usually shed many cities in a short amount of time, not just one here or there. The original nation will remain, much diminished, unless there's some kind of widespread revolution. I haven't programmed revolution of that sort in, though.

[11:19 AM](https://projectperko.blogspot.com/2010/09/video-and-details.html?showComment=1285611587900#c2847674832129827865 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2847674832129827865 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/07530201773972687532)

[Soyweiser](https://www.blogger.com/profile/07530201773972687532) said...

That video looked very interesting. Thanks for posting that.

[6:58 AM](https://projectperko.blogspot.com/2010/09/video-and-details.html?showComment=1287064706101#c5123313702997701103 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5123313702997701103 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2079199230726727035)

[Newer Post](https://projectperko.blogspot.com/2010/09/star-maps.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2010/09/spatial-play.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2079199230726727035/comments/default)
