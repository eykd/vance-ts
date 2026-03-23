---
title: "Space Navigation"
date: 2008-11-09
url: https://projectperko.blogspot.com/2008/11/space-navigation.html
labels:
  - space
  - technical
---

## Sunday, November 09, 2008 


### Space Navigation

This is a technical essay for beginners on the subject of AI navigation in space games.  
  
A few weeks ago, I tried to build a space-fleet-combat-game. In the process, I learned a whole lot about how to get an AI to navigate in space. Recently, one of my friends tried the same thing, and I realized it might be worth doing an introductory essay on space navigation, plotting intercept courses, taking into account gravity wells, etc.  
  
Proper space games, whether Star Control 2-style or Wing Commander-style, have a few factors that make them completely different from other games. First, the main engines point directly backwards and turning isn't instant. Second, you keep going on the same vector: no (or very low) friction.  
  
This totally destroys the old fashioned interception calculations that you might use for a first-person-shooter or RPG, because as time passes, the target will be in a different location relative to you (whether it's you, he, or both that are moving).  
  
The easiest way I found to calculate out a basic intercept course is as follows:  
  
Get the distance between you and your target. Divide it by your average speed. That is the ETA.  
  
Calculate the new positions of you and your target at ETA, but cap your vector at a certain constant number of seconds (3 is good for most action space games). IE, if the enemy is moving x+1m/s, in ten seconds he'll be at x+10m. However, if *you* are moving at x+1m/s, in ten seconds you'll be at x+3m, because your vector vanishes after three seconds. We negate our own vector because we plan on changing it radically.  
  
Now, determine how long it would take to reach these virtual positions. IE, how quickly you can turn to the proper heading and close at speed. Do not bother taking into account your current vector. This is the estimated course (EC).  
  
If the EC is roughly the same length as the ETA, go for it. If it's significantly different, increase or decrease your ETA significantly and try again until you find an EC that works or your ETA becomes stupid (error out).  
  
This system works in most space games because most space games have a maximum speed cap. If your maximum speed is 100m/s and you're traveling at x+100m/s, accelerating along the z axis will make you arc away from that and to z+100m/s, no x velocity at all. This is true both of 2D and 3D space games: most of them impose this artificial speed cap so that people have a hope of being able to navigate intuitively.  
  
The slower you turn and the longer it takes to reach your maximum speed, the more of a factor your current velocity will be, and the longer your personal velocity cut-off time should be. In addition, when calculating your estimated course (EC), you should take into account that your average speed will be lower than your maximum speed because you have to accelerate - and if your acceleration is slow, that will be more important. Obviously, the longer the thrust, the closer to your maximum speed your average speed will be.  
  
...  
  
Now, if you're like me, you're the sort of person who doesn't want a speed cap. If you're traveling at x+100m/s and you start thrusting along z, you'll reach x+100m/s & z+100m/s. No speed cap except maybe light speed.  
  
This makes navigation difficult because you have to factor in your vector much more strongly, often moving to negate it. On the surface, you should just be able to do away with the velocity cutoff. However, it's not quite that simple.  
  
First, you need to calculate not just where the enemy ship will be at ETA based on his current vector, but also based on his acceleration. If a ship is accelerating away, you need to take that into account or you'll be hopelessly off course.  
  
Second, this system produces *radically inappropriate intercept speeds* . You'll blow by your enemy doing 0.3c, you won't even see the bastard as he blips by. So you need to put in some kind of rough vector matching *mixed into the basic intercept package*. It's possible to program, but the actual physics of the matter make it highly difficult: unless your ship has many times the thrust of the ship you're intercepting, it will take you a long, long time to close and match vectors. And if you've got any human-controlled ships, forget it!  
  
Another factor in this kind of game is the light-speed cap, which is a common thing to want to include. The idea is that the speed cap is light speed, and the closer you get to light speed, the more thrust it takes to change your vector.  
  
There are a lot of problems with this. In basics, this means that your current velocity *will screw up your acceleration* . Plotting an intercept course may involve having to *slow down* so you can accelerate along another vector.  
  
Of course, the truth is that the issue is radically more complex than that, because you're always operating from your own frame of reference. You aren't going 0.9c: everything else is. The light speed limit is no good for gameplay unless you (A) are a physicist or (B) throw away any realism it may have had.  
  
...  
  
With the described system, basic navigation is possible. However, most games want more advanced navigation: they want to be able to orbit planets, do gravitational slingshots, present broadsides, interpose specific faces of their ships, ram (and avoid ramming), etc, etc, etc.  
  
Each of these things requires some pretty significant tweaking... and, of course, the basic calculations presented here are not exactly optimized. They give pretty rough (but functional) intercepts.  
  
There's the basics. Hope it helps.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:32 AM](https://projectperko.blogspot.com/2008/11/space-navigation.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2295286379508047663 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2295286379508047663&from=pencil "Edit Post")

Labels: [space](https://projectperko.blogspot.com/search/label/space) , [technical](https://projectperko.blogspot.com/search/label/technical)


#### 4 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I played with gravitation field navigation/pursuit several years ago. Algorithm was not very reliable and fairly tricky. Worked for the orbits in the gravitational field of big planet. Idea was first make orbit plane of the hunter rotate until it was about the same as orbit plane of the target. After that hunter approach the target, raising its orbit for braking and lowering for acceleration. Fuel was unlimited.  
Was working only for one planet, so no slingshots.

[12:07 PM](https://projectperko.blogspot.com/2008/11/space-navigation.html?showComment=1226261220000#c2120579308724206064 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2120579308724206064 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, the way I would have dealt with that is by pretending it was in normal x/y space, only wrapping it into spherical space for display purposes.  
  
So an "orbit" would simply be traveling a straight line across the x axis, wrapping as needed. Your x velocity would be multiplied depending on your y position to account for the wrapping procedure.  
  
Then you could simply use the algorithm I listed for intercept courses.  
  
It would be harder to do a 3D version of this, but the same basic philosophy would work.

[12:15 PM](https://projectperko.blogspot.com/2008/11/space-navigation.html?showComment=1226261700000#c1874915370389337372 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1874915370389337372 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I was using spherical coordinates anyway, so it was kind of extension of your suggestion. The hole point was gravity field, with airbraking and elliptical orbits. BTW by simple wrapping you would get spirals instead of ellipses.

[10:04 PM](https://projectperko.blogspot.com/2008/11/space-navigation.html?showComment=1226297040000#c7809594367860204421 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7809594367860204421 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

You can fix the ellipse problem with a y-drift system, but I'm fine with losing a bit of realism for the sake of playability.

[10:35 PM](https://projectperko.blogspot.com/2008/11/space-navigation.html?showComment=1226298900000#c8843410890044309709 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8843410890044309709 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2295286379508047663)

[Newer Post](https://projectperko.blogspot.com/2008/11/crossing-geographical-wires.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/11/more-on-augmented-reality.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2295286379508047663/comments/default)
