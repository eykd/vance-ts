---
title: "Creating Deep Data"
date: 2010-01-21
url: https://projectperko.blogspot.com/2010/01/creating-deep-data.html
labels:
  - game design
  - generative
---

## Thursday, January 21, 2010 


### Creating Deep Data

One of my abiding interests is algorithmic means to help create content in games. There are a lot of ways of doing this, and it's a very interesting topic, but I'd like to talk about my efforts to simulate China.  
  
More specifically, I have always liked the Dynasty Warriors games, as well as most other games that have some of the same "feel", such as Romance of the Three Kingdoms. However, what I like isn't the gameplay, it's the feel. Carving your way through an army isn't much fun unless there's a reason to care, and hopefully some mid-mission chaos that makes sense. To me, the most interesting thing about Dynasty Warriors is the (emergent or scripted) story that accompanies the assaults and defenses you make.  
  
Details like "well, the such-and-such clan are excellent shipwrights!" or "We must be careful, so-and-so has hired exotic mercenaries" or "this fortress has never been taken, because it is on a mountain surrounded by a river".  
  
So I built me a toy to simulate China. It builds the terrain algorithmically, simulates a few million years of weathering, places a few hundred primitive tribes, and builds a medieval-period civilization of warlords and trade routes.  
  
The end result is just a demo, not a real game, but the data density is immense. You can clearly see the fragments of plots and interesting data points floating around. For example, I've seen a village turn into a major sea port specifically because the city that was the major sea port in the region was destroyed in a war. The population and resources of the region required a port, so the village took on that role. Before then, they were a little fishing village with a few tea farms up in the nearby mountains.  
  
The port "remembers" being a little fishing town, and it "remembers" all the different regions and cultures that the new immigrants came from. Given another order of magnitude of development, it could easily produce detailed people from the town, each knowing his own history and having a sense of style, accent, and ethics rooted in his ethnic heritage but blurring into the city's mix.  
  
The rapid growth without a centralized authority has specific side effects that would govern the city's layout and feel: haphazard streets, ramshackle buildings built on the lowest dollar, ports just kind of extending everywhere. Contrast this with the same situation, except a central authority carefully controlled land zoning and safety. Wider, straighter roads, better buildings, carefully expanded "fractal" docks...  
  
These are details that have historically been up to the designer/writer to decide and implement.  
  
As our data becomes denser and our worlds start to contain ever more detail over an ever wider scope, that becomes less and less tenable. MMORPGs and similar games would benefit greatly from being able to "paint" in broad strokes - a war happened here, this desert blocks travel, etc. From these strokes can come dozens of new cities, each populated with basic quests, able to generate new NPCs rather than continuously recycling the same twelve, each with their own unique flavor.  
  
Obviously the writer would come in and do some real work on the details, or at least re-generate dull sections. But the point is to provide a scaffold that allows you to build these massive worlds, these super-detailed worlds, without spending ten years of development time. There are some kinds of things that already do this - a lot of the various Elder Scrolls games have generated terrain - but there's a fundamental difference between creating repetitive filler content and creating content that anyone would find interesting. Not only can these "deep data" techniques create a lot of interesting content, they can even continue to run during the game, creating a world that evolves and remembers.  
  
Anyhow, the real reason I'm posting is because I think I've figured out how to apply it to people . Hmmmmm.  
  
What are your thoughts?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [12:18 PM](https://projectperko.blogspot.com/2010/01/creating-deep-data.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/511031309954748848 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=511031309954748848&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [generative](https://projectperko.blogspot.com/search/label/generative)


#### 7 comments:

[!\[Image\](https://4.bp.blogspot.com/\_rlnTLtFUVhk/SZ5cTA0zxUI/AAAAAAAAAa0/0GN9kGQ4whs/S45-s35/mejapan160.png)](https://www.blogger.com/profile/04546075843043674835)

[Claes Mogren](https://www.blogger.com/profile/04546075843043674835) said...

Interesting, how long does it take to run? How do you visualize it?  
  
I guess you know about Dwarf Fortress already and their generated world, complete with historic events and people? Lots of interesting things there.  
  
Also, are you aware of the [Procedural Content Generation wiki](http://pcg.wikidot.com/)?

[4:05 AM](https://projectperko.blogspot.com/2010/01/creating-deep-data.html?showComment=1264161912758#c8671085594737575226 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8671085594737575226 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I am not aware of the wiki, I'll look into it. I am very aware of Dwarf Fortress, but the generated world is either too shallow or expressed to shallowly: I never get any feeling for the professed depth.  
  
The hardest part of the whole simulation was getting it to run fast. I'll try to make a youTube video this weekend.  
  
Basically, there are parts of it that run fast (weathering) and parts of it that run really slow (initial tribe placement). One of the things that really slows it down, though, is the fact that none of the stuff (except initial tribe placement) is done "blind". It draws and redraws the screen fairly rapidly to keep the player aware of what's going on.  
  
So you can see the weathering happen, the planet getting older as you watch. You can see the tribes fight it out.  
  
But, ugh, it's hard to show the "memory". It's there, but without an in-game expression of it, it might as well not be.

[5:37 AM](https://projectperko.blogspot.com/2010/01/creating-deep-data.html?showComment=1264167428120#c1973830178467097335 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1973830178467097335 "Delete Comment") 

[!\[Image\](https://4.bp.blogspot.com/\_rlnTLtFUVhk/SZ5cTA0zxUI/AAAAAAAAAa0/0GN9kGQ4whs/S45-s35/mejapan160.png)](https://www.blogger.com/profile/04546075843043674835)

[Claes Mogren](https://www.blogger.com/profile/04546075843043674835) said...

I've been thinking more about the last sentence you wrote, about applying it to people.  
  
I guess most people define them self by their culture, where culture includes religion, language and traditions that are special to the region where they grow up. How would this be modeled?  
  
How culture is spread depends largely on how advanced the civilization is. I think there are three major inventions that divides this into separate ages. Litteracy, the printing press and the Internet.  
  
Before writing, oral traditions were the only way to pass culture and the number of people that you could reach as a single story-teller was not many. Once you are able to write it down, it can be copied and spread a lot more efficiently. Once you can print as many copies as you like, it will spread even more, and with something like the internet, global access to information is practically instantaneous.  
  
What is your plan for world altering inventions in this simulation of yours? This includes such things as the plow, concrete, sailing and navigation and so on.

[1:49 PM](https://projectperko.blogspot.com/2010/01/creating-deep-data.html?showComment=1264283396445#c7255487131817035306 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7255487131817035306 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

You're right to some extent, but the fundamental mechanisms by which culture spreads and maintains itself have not changed.  
  
It's always easiest to look at your own culture as being different and more advanced, but we learned our personal values, religions, and preferences in the same way as people have since we weren't people: from the people we interact with.  
  
Literacy, the printing press, and the internet didn't change that fact, they simply change the parameters. Who you can interact with.  
  
But culture is still erecting huge barriers, even in this era of connectivity. I rarely interact with any religious culture, I don't know many people from low socioeconomic brackets, and nearly everyone I hang out with (and/or inherit my culture from) is a college-educated, fairly-well-off English-as-a-first-language secular geek.  
  
The rules haven't changed, just the inputs.

[2:08 PM](https://projectperko.blogspot.com/2010/01/creating-deep-data.html?showComment=1264284536305#c5205661002680833981 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5205661002680833981 "Delete Comment") 

[!\[Image\](https://4.bp.blogspot.com/\_rlnTLtFUVhk/SZ5cTA0zxUI/AAAAAAAAAa0/0GN9kGQ4whs/S45-s35/mejapan160.png)](https://www.blogger.com/profile/04546075843043674835)

[Claes Mogren](https://www.blogger.com/profile/04546075843043674835) said...

True, I guess I hang around the same kind of people you describe. Maybe the fact that we are more aware of distant cultures now don't matter all that much, it still doesn't spread.  
  
In ancient times the large trade routes, like the silk road, spread culture along itself both ways. (Water trade routes probably did something similar, but only for the major ports.) These days trading, shipping and traveling is easy and we don't have to interact with other cultures if we don't want to.  
  
To get back to the simulation discussion, I wonder how culture can be generated procedurally? By using certain colors, building styles, materials and inventions? What about wars and other large conflicts, sadly also a common thing in human history?  
  
(Thanks for an interesting discussion bte, I've been pondering this kind of questions for a long time.)

[3:58 PM](https://projectperko.blogspot.com/2010/01/creating-deep-data.html?showComment=1264291080297#c7913237014107979310 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7913237014107979310 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, again I'm going to disagree a bit. The reason culture spread along the silk road is because *people* spread along the silk road. We do see the same thing today, with the immigration patterns into Europe: the Polish into Ireland, for example, or the Muslims into England.  
  
They go for much the same reasons as the people along the silk road. There is no longer a physical road, but the same kind of economic "chain" links the world, drawing cultures along itself.  
  
Imitation is also a major factor in the spread of culture, and this is usually when an economically weaker nation is taken over (economically or militarily) by a much stronger nation. The best example of this is Japan, where you can clearly see Japan's culture adopting the traits of its most important neighbors. First the Chinese, then the Americans.  
  
A few other factors also control how culture flows, such as the low culture on the totem pole being persecuted in times of poor economic performance. The Jewish tend to be the most obvious example of this throughout history, but it is also true of Mexicans, Latinos, and, formerly, the Irish. Leaving a lot of folks out, obviously.  
  
The randomized creation of culture is another topic entirely, which maybe I'll post about. However, even if every culture has to be specified manually, you can still have an extremely dense and rich environment if you understand how they will flow.

[4:18 PM](https://projectperko.blogspot.com/2010/01/creating-deep-data.html?showComment=1264292323152#c5160899417939399099 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5160899417939399099 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13139112015452095102)

[The Kingslayer](https://www.blogger.com/profile/13139112015452095102) said...

I say that's an idea worth exploring in a title.

[8:44 PM](https://projectperko.blogspot.com/2010/01/creating-deep-data.html?showComment=1265604241171#c1998681449344636175 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1998681449344636175 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/511031309954748848)

[Newer Post](https://projectperko.blogspot.com/2010/01/mass-effect-2-and-wide-flat-gaming.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2010/01/white-knight.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/511031309954748848/comments/default)
