---
title: "Discover Pandora"
date: 2005-09-06
url: https://projectperko.blogspot.com/2005/09/discover-pandora.html
labels:
  []
---

## Tuesday, September 06, 2005 


### Discover Pandora

I've got a soft spot for adaptive broadcasts. I've been [trying Pandora](http://www.pandora.com/), and so far it seems pretty darn impressive. I'll probably buy into it when my trial time runs dry.  
  
But what it brings home to me is adaptive data. Really, I have no idea what kind of preference system Pandora uses to pipe music from its database. However, it is an excruciatingly interesting problem.  
  
As you might know, I like restricting evil problems to a tiny subset of data, so that I can pull the core algorithm from them.  
  
*This is that tiny subset of data.*  
  
We want to talk about how to do language recognition or visual recognition? First lets get a really awesome preference system running.  
  
Presume we have a list of things. Say, songs. We have a list of users who rate these songs as we deliver them (or, in not rating them, tolerate them, thereby rating them).  
  
Our problem is that our database of music is not very good for defining someone's preferences. I just heard a song that was nothing but dischords and white noise in my "Vangelis" station. Why? "Harmonic progression and similar instruments". Que? What instruments? What progression?  
  
Not their fault: the song was inadequately entered into their database. At least, according to MY needs... and in the world of adaptive data, my needs are all that matter.  
  
Far more useful would be to tap the choices of thousands - hopefully tens of thousands - of other users who have already rated songs.  
  
Many of them will probably have no taste at all, at least according to me. Anyone who likes rap or hip-hop is to be excommunicated from the church of Craig.  
  
But some of them will have some of the same taste as me. And as I start rating songs, MY ratings and THEIR ratings will show to be similar. "Hey, they both hated DJ Hippy-Tip Badsongremix, but liked Dvorak! Let's pass this dude some of that dude's preferred songs."  
  
Yeah? Cool? Cool? Data's not so nice to us, though. Think about it:  
  
There are ten thousand users. Presumably, these users will fall into bands. For example, there will probably be a whole bunch of people who like "new age" music. Throughout that band of users, you'll get a spread of preferred songs - and a spread of not-quite-so-preferred songs that probably reflect something inside the genre that is simply bad music.  
  
But there are other bands - some of which include that band. For example, I like "new age" music, but only for certain values of "new age". I'm a Vangelis guy. Give me classic synth and a melody, I'm happy. However, I also like most other kinds of music. Like classical. And rock. And jazz. And blues. And folk. And dance. And techno. And western (but not country). But only SOME of each.  
  
I may be the only user with my preferences. However, out there in the sea of users are users which share SOME of my preferences. For example, there's this dude in Kentucky who really likes western, but not country. He hates classical and jazz, though, and he likes hip hop. Obviously, he can't be passed stuff directly from my preferences, and I can't be passed stuff directly from his.  
  
What you need to do is take a kind of "spectrometer" reading. Seperate it out the same way we do for elements. "Carbon has this reading, radium has that reading, and this particular particulate cloud is therefore 70% carbon and 25% radium." Obviously, I'm not being scientific here. I'm just giving an example of the sort of terms we should be thinking in.  
  
The dude in Kentucky is 70% "westernum" and 30% "hiphopogen". By having a spectrum of songs specifically for "countrinium" and "westernum", I can be assured that I don't get any countrinium. Sure, there's a lot of overlap, but that's true of spectrograph readings, too. It can be handled!  
  
But what kind of insane analysis would that require? I'm not up to snuff on the matter - is this something we have a mathematical algorithm for? Or are we doing it by hand and need one?  
  
Either way, this kind of analysis could be used in language, too. The difference is that language has an additional dimension in the data: whereas a list of songs is essentially an innumerable number of zero-dimension data points, language data points are multidimensional, and they aren't all polite about staying as distinct data points. Sort of like if every song in your database had ninety remixes.  
  
Hm. Time for... research!

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [1:53 PM](https://projectperko.blogspot.com/2005/09/discover-pandora.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112604196003857544 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112604196003857544&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112604196003857544)

[Newer Post](https://projectperko.blogspot.com/2005/09/burying-caesar.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/09/oh-and.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112604196003857544/comments/default)
