---
title: "Opening Pandora's Black Box"
date: 2006-06-01
url: https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html
labels:
  []
---

## Thursday, June 01, 2006 


### Opening Pandora's Black Box

There's been a steady trickle of people discovering [Pandora](http://pandora.com/), an automated internet radio station which plays songs like the ones you like. I'd say that, on average, one person a month comments (either on their blog or directly to me) about Pandora.  
  
I discovered it a long time ago, but allow me to recap. I'd like to think I've improved in the past nine months.  
  
Pandora is a good idea, but the database is crap.  
  
That's probably being a bit harsh. For many people, I'm sure it serves quite well. But for us picky bastards, we leave unsatisfied, because what Pandora thinks we'll like is picked randomly out of the same... not "genre", but "theme".  
  
(I seriously doubt their method has changed in the past nine months, but let me know if this is wrong, and I'll re-investigate.)  
  
(Edit: Apparently, Pandora's database isn't third party: it just looked that way nine months ago. That doesn't chance much of my commentary, although the way their database is apparently set up, instead of having bad data, they just have spotty data. I'm not sure which is worse...)  
  
Pandora uses a very large third-party database to figure out things you might like. You type in, say, the name of a band. The third-party database specifies things about that band. Like, say, "minor harmonies" or "alt rock". Then Pandora pulls songs out of their library which match some of those specifics. As you rate songs, it weights the elements that song contains.  
  
The problem here is twofold. First, they are measuring the wrong things. Second, they are measuring unreliably.  
  
The third-party database isn't clean. Do you think all songs with "minor harmonies" were labeled as such? That's pretty high-level knowledge - chances are, whatever goon is entering the newest Rammstein song data doesn't know jack shit about minor harmonies.  
  
This means that the measurement is unreliable. However, even if it were reliable, it would still be measuring the wrong things.  
  
For example, I love rock. Good rock. Ooooooh yeah. And techno. When it's good.  
  
But most rock is terrible, and even more techno is terrible. When I rate these songs negatively, it either has (A) no effect or (B) makes the algorithm think I don't like techno. (I don't know which is true: I can't see their code.) Perhaps it has a magic handwave at the songs lots of people think are bad, but I doubt it. That would require them to keep data on every *song* rather than just every *user*.  
  
Calling a song "rock and roll" helps not at all. Some people consider more recent country songs "rock and roll". I don't. Oh, and I like western, but not country. Can it tell those apart?  
  
The answer is, no. Not even close. It just sits there and throws random crap at you. Because it's measuring something that's almost (but not completely) unlike user preference.  
  
User preference is *what songs the users like to listen to*.  
  
So, here's an incredible new idea: why don't you let the algorithm automatically generate "pseudo-genres" based on what songs get rated high or low by any given user?  
  
For example, you have one user, Alex. Alex likes filk and pop. But your algorithm doesn't know that. All it knows is that Alex likes these songs, hates those songs. It's the "Alex" pseudo-genre.  
  
Then Bob joins up. Bob likes filk and polka. Originally, the algorithm thinks Bob shares Alex's genre, but Bob starts crushing pop music with the might of his two-thumbs-down. The algorithm quickly realizes there are three pseudo-genres at work here: stuff Alex likes, stuff Bob likes, and stuff they both like.  
  
When Caroline joins, lets say she only listens to Pop. The algorithm quickly realizes that she likes the "Alex-only" genre, but dislikes both the "Bob-only" genre and the "Bob & Alex" genre.  
  
This sounds complex, but I've worked on the math, and I think it's totally plausible. It does require a rather significant database, though.  
  
Oh, and it doesn't let you easily play a song you've been paid to play more often, more often.  
  
But what it does is create pseudo-genres which are actually related to what people prefer to listen to, instead of meaningless user-assigned "genres" like "filk".

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [6:57 PM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114921509110450675 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114921509110450675&from=pencil "Edit Post")


#### 8 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I think this is actually what Amazon does with it's user system. You'd be really supprised how acurate Amazon's "here's things you might like" page can be, and it does it entirely based off people using the service, not on genre.  
  
As an experiment (on my friend convinced me to do), you can go on to Amazon and start adding CDs you own and you can rate them. About half way through, it will usually start recommending things you already own, as well as other stuff you've never heard of. Very nifty.

[7:22 AM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html?showComment=1149258120000#c114925816350783156 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114925816350783156 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Google makes its whole buisiness off of doing this well. I see what problems you have with Pandora, I just skip the songs I don't like and deal with the 60% hit rate.  
  
Just out of curiousity, what sort of math is involved in that?

[7:45 AM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html?showComment=1149259500000#c114925953157891327 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114925953157891327 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Amazon (and probably Google) use a one-dimensional version of what I'm talking about.  
  
Yowsa. This turned into a long-ass comment.  
  
I'll post about it. :D

[10:00 AM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html?showComment=1149267600000#c114926763950015220 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114926763950015220 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

The musical attributes database is Pandora's own and is presumably "clean." Whether that results in good recommendations is another matter, of course...  
  
Robert Gable  
http://rgable.typepad.com/aworks

[1:30 PM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html?showComment=1149280200000#c114928022266830840 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114928022266830840 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Ah, I see. Pandora and the Music Genome database are the same core group. I thought the Music Genome database was unaffiliated.  
  
Thanks for the correction!

[1:35 PM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html?showComment=1149280500000#c114928052057070296 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114928052057070296 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

You're trivializing what Pandora has done a bit... the database is not built by fans or by some third-world country's cheap labor, it was built by professional, experienced musicians in the LA area who were paid to "describe" the genome of the music. Thus, they know what minor harmonics, etc., are.  
  
That being said, I would agree that the objective grouping of the music somewhat misses the boat: I listen to music for subjective reasons!  
  
That's why I personally have found Last.fm to be the best of breed in this category. It builds it's database of associations based purely on listening habits of specific tracks. Not whole album buying habits (Amazon) or objective musical similarities (Pandora), but literally what you listen to.  
  
Using a tool called the Scrobbler (or something like that), it plugs in to your favorite music player and tracks every track you listen to, how often you listen to it, how long you listen to it. Using that, it builds a model of association between that given track and the rest of your listening profile.  
  
It's very cool. On their website they also have the necessary social software tools so users can tag, blog, comments, group, etc. around the music. Very cool, very functional, and the music selections are almost always dead on.  
  
The coolest thing is that if you donate to Last.fm you get an upgraded account ($3/month). The upgraded account allows you to give Last.fm a list of artists and it will create a custom station that reflects those artists. I find it's success rate to be well above 90%.  
  
Interestingly, you'll find bands like Radiohead and the Beatles are practically in every user's listening profile, thus no matter what band you choose you'll find Radiohead or the Beatles as an associated track... which, I'd say, is fairly accurate reflection of most of the web-savy users (most likely users of Last.fm) that I know in real life.

[1:41 PM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html?showComment=1149280860000#c114928091473960153 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114928091473960153 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I'll look into last.fm, thanks.  
  
As to the database, I find it hard to believe that any number of specialists could reasonably map out the ten million songs out there. That would be absurd.  
  
However, I didn't investigate the database very carefully, so it may be more reliable than I think.  
  
As you say, that doesn't make the measurement any more accurate.

[2:00 PM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html?showComment=1149282000000#c114928202332953523 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114928202332953523 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/08852086658302034166)

[Unknown](https://www.blogger.com/profile/08852086658302034166) said...

"Just out of curiousity, what sort of math is involved in that?"  
  
Bayesian Probability, \[probably :D \]  
Data Mining techniques would do it without having to re-invent the wheel, mathematically...

[6:54 AM](https://projectperko.blogspot.com/2006/06/opening-pandoras-black-box.html?showComment=1149602040000#c114960205594537817 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114960205594537817 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114921509110450675)

[Newer Post](https://projectperko.blogspot.com/2006/06/journey-into-amazon.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/06/happy-birthday-to-me.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114921509110450675/comments/default)
