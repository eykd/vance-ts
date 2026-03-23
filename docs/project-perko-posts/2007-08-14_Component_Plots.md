---
title: "Component Plots"
date: 2007-08-14
url: https://projectperko.blogspot.com/2007/08/component-plots.html
labels:
  - generative
  - narrative
  - story
---

## Tuesday, August 14, 2007 


### Component Plots

When you talk about "generative" or "adaptive" plots, you run into a lot of problems with implementation.  
  
The common approach is to carefully script out every possible plot. I call this the "big atom" method - the "atomic" elements of your plot are chunks of plot that are often several levels long. This produces a massive "branching" problem, where the more influence you allow a player, the more scripting you have to do. Lots of games use this method, including the much-vaunted KOTOR and Deus Ex series. And they have it polished: they know a lot of tricks to keep the branching down and reuse script.  
  
But the fact is that the method is limited because you have to specifically script out every element of the plot.  
  
An approach a lot of people try is a "small atom" approach, where they create tiny, generic plot elements that are stapled together over the course of the game. This isn't used in real games, however, because context is a huge part of games and we don't really have an algorithm for that figured out. At best, the "small atom" approach creates a meandering, disconnected plot. Normally, it creates gibberish.  
  
There is really no "medium atom" approach in common use. The closest we have is map generators in things like Diablo, where individual chunks of a dungeon are created, but they are arranged into a map somewhat randomly. This works decently for hack-and-slash games, but if you try to implement it for a plot, you end up with the worst elements of big and small atom approaches: although any given segment of the plot makes sense, over the long haul the plot is a meandering mess. And you have to carefully script every element. Although rare, this method has been used occasionally, usually by people like Chris Crawford.  
  
Sure, there are steps you can take to make these systems a bit more palatable. For example, you can use a "big atom" approach for the base plot, but then use "medium atom" elements to determine how the player guides the "big atom" elements. You can even subdivide that to allow the "medium atom" elements to be guided by "small atom" events... Siboot uses small atoms with medium atoms to give some context.  
  
Alternately, you can be vague, generic, or carefully insert the reasoning between plot elements, allowing players to think there is some mysterious force behind things or letting them come up with their own reasoning. This works best in games where you can hear the player thinking and then come up with actual reasons similar to (but not exactly equal to) the player's reasoning. A computer game could be built with this in mind, but it has yet to be done.  
  
However, these are all dodges. The real problem with all of these approaches is that a computer doesn't know anything about context, and programming it to know something about context is, as of yet, unproven theory. The larger atoms basically let the writers create more context, to supplant the computer's lack of context. Of course, what causes the branching and the pain is the fact that context changes as the plot progresses differently... so the writers have to write more variants, and you end up with a huge amount script.  
  
As far as I can tell, there are three ways to implement context that aren't simply changing the size of the "atomic" script or pretending to have a magic algorithm that "knows" context.  
  
1) Player-generated context. If you supply tiny story atoms to players, they will be happy to assemble them into fully functional plots that make sense. Assuming some kind of massive player base, you would see something akin to the Sims' photo albums.  
  
2) Level-generated context. Similar to having AI navigate a level by embedding pathing and waypoints, you can have a "map" of a plot and fill it in with chunks that are context-suited. If you know that there is going to be a lovecraftian demon as your end boss, you can focus on adding horrifying plot elements rather than adventuresome plot elements, and even have a pseudorandom beginning, middle, and end. This is similar to having "intelligent" atoms, but far more centralized.  
  
3) "Long atoms". If you want context, why not build the context into the atom? If you have a lovecraftian demon as an end boss, you can make that plot element "cast back" a series of hints and foreshadowing, even call for suitable atoms to attach to those nodes. Similarly, if you accomplish a subplot early on in the game, it can "cast forward" the repercussions, injecting elements into the play at later moments without needing to "connect" to whatever elements are currently active. This is basically the reverse of level-generated context.  
  
Thoughts?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:57 AM](https://projectperko.blogspot.com/2007/08/component-plots.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4062405816512192626 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4062405816512192626&from=pencil "Edit Post")

Labels: [generative](https://projectperko.blogspot.com/search/label/generative) , [narrative](https://projectperko.blogspot.com/search/label/narrative) , [story](https://projectperko.blogspot.com/search/label/story)


#### 10 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjT7uUKpqWUp3g3OOg1qI0SCCfXxC7mTBAjIiZRON9025hidI4ICBM8VDVsf2ZZjZvthdgnFcIPoammyvHG75iaai43 DeQwESgeuv9wZ3gFnGeOI37qyFM4vr0o0l0U4kk/s45-c/2e7d0508-s.jpg)](https://www.blogger.com/profile/10742095724171892869)

[Chill](https://www.blogger.com/profile/10742095724171892869) said...

Well, the main idea seems to be to connect atoms in a way that isn't random. Not entirely anyways. I'd venture to guess that it doesn't matter too much how you do, as long as it does *look* random.  
  
and btw, are these word verification things getting longer?

[5:31 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187137860000#c2101217846702849200 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2101217846702849200 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, that's not exactly what I mean. The problem isn't connecting them in non-random ways - anyone can do that just by saying that X can only follow Y or Z.  
  
It's like this: letters tend to follow specific other letters. An "n" is often followed by a "g" or a "d". But simply knowing which letters are likely to follow which letters doesn't give you meaningful words, it just gives you words that look meaningful at first glance. Like "angebruber".

[6:52 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187142720000#c1129674759938111403 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1129674759938111403 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

And, uh, I don't see the word verify thing, because at some point they grew a brain and decided that the OWNER of the blog probably isn't a bot.

[6:53 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187142780000#c6454324527686670622 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6454324527686670622 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01081324048399333328)

[andrewstern](https://www.blogger.com/profile/01081324048399333328) said...

Hi Craig, I'd like to mention our implementation for the interactive drama Facade. We created over two dozen medium-sized narrative chunks which we called "beats". Each beat is composed of a collection smaller-sized chunks, which we called "beatgoals". Each beatgoal is composed of one or more "joint dialog behaviors" (jdb's).  
  
Each beat, for example, FixingDrinks, or ArgumentOverItalyTrip, or PhoneCallFromParents, is its own \_narrative machine\_ able to perform its narrative content in a (modest) variety of ways -- depending on the tension level at the moment, who the player may be siding with overall, and what previous beats have occurred, etc.  
  
The context variation for each beat comes from creating a wide variety of jdb's, and organizing them to intelligently and coherently intermix, and generally be sequenced in many different orders. We authored ~2500 jdb's for Facade, comprising about 1000 beatgoals, comprising 27 beats.  
  
Any one runthrough of a beat takes 30-60 seconds, and plays somewhere from 10%-20% of the total content available in the beat.  
  
More details can be found in this paper (pdf -- http://www.interactivestory.net/papers/MateasSternAIIDE05.pdf), with a greatly expanded version (including some code snippets) in the book Second Person. Also the Behind the Facade guide has additional details (http://www.interactivestory.net/goodies/behindthefacade.html).  
  
(Note, we sort of misnamed these units -- we really should have called beatgoals "beats", and called beats something like "scenes", although they are smaller than scenes.)  
  
I should also note, Facade's beats performed best in the first half of the drama; the second half of the drama was organized a bit differently and more experimentally, and didn't come off as coherently as we hoped.  
  
I'm currently in the process of making version 2.0 of this technology, for our current work. Eventually, I'd love the tech to make it out into the world as middleware for others to use.

[2:44 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187300640000#c1069044206501401316 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1069044206501401316 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

That's largely what I was talking about, yes. From what I know of the tech, however, you had serious problems with exploding content requirements (2500 scripts is a lot of scripts, regardless of how small they are).  
  
I think it might be possible to get a more "mixable" system, such that there are "generic" beatgoals that can be used to fill in a "smart beat", with their exact content adapted to fit the circumstances. It would need to be done carefully, because the context that comes with the "generic" beatgoals might conflict with the context of the overall beat, or alter it in unsuitable ways...  
  
I haven't read any documents on Facade since it was released. The last time I read up on it was way back in the day, and it looked like you were basically doing a "chain of pearls" script which had a bunch of smaller elements that could swap out. Sort of like a branching plot, except carefully built to keep the number of scripts you had to write under control.  
  
The method was well-suited to the game you chose to make, because the continuity of the game was so restricted that you didn't have to worry about the context getting wildly out of control. I remember that when I read about it, I said to myself, "to scale this up, you'd need to write more and more scripts..."  
  
I'll read up on it again, now that I've had it pointed out to me. It's been a few years, so hopefully it's clearer and I'm smarter. :)

[2:56 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187301360000#c2556292460968047713 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2556292460968047713 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01081324048399333328)

[andrewstern](https://www.blogger.com/profile/01081324048399333328) said...

cool...  
  
"you had serious problems with exploding content requirements (2500 scripts is a lot of scripts, regardless of how small they are)"  
  
Yes and no. My belief is, and experience tells me, to create a rich experience with satisfying variety and agency (especially something that people will shell out good money for), there's little choice but to have a lot of content in the system. If well-organized, the bits of content can be resequenced in many ways, getting towards "generativity" (even if you've hand-written each individual bit of dialog).  
  
It was about 1 person-year to author those 2500 behaviors (a bit more procedural than typical "scripts", but anyway). For our next project(s), we hope (need) to do 2-3 person-years of content authoring.  
  
Note, writing/AI-wise, that's only about $300K of salary -- sizeable for an indie game production, but a pittance compared to commercial game budgets. (Of course you need animation, voice, etc. to go along with all the content, which is expensive -- but there are ways to keep costs down there, such as procedural animation.)

[3:10 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187302200000#c6098814090051831517 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6098814090051831517 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01081324048399333328)

[andrewstern](https://www.blogger.com/profile/01081324048399333328) said...

And yeah, a smaller domain for the game (e.g., one location, a short period of time, small number of characters, etc.) definitely helps keep the scale down overall.  
  
We're interested in making shorter but deeper experiences, like good short stories / plays / films. This is opposed to the epic, long, but very shallow games of today.  
  
The cool thing is, this jibes nicely with the growing market for casual games.

[3:25 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187303100000#c4778159741897938826 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4778159741897938826 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, it certainly sounds like you're planning on doing what I wanted to do. :D  
  
My problem is that these "vignette-style" games don't suit me. So I keep looking for a method to create a lot of "virtual content" - content the player sees, but that I can create more easily than simply manually scripting it.  
  
What I'm looking into now is to manually script things, but write them carefully such that I can juxtapose them and have their meaning change. As a simple example, one piece of content might be you overhearing Anne tell Barbara she likes you. If the content before that one was Anne acting shy around you, then you get one impression of her. If the content before was her flirting with you, then you get a different impression of her.  
  
Similarly, if one of those pieces of content are played AFTER you overhear her confession, they bring a very different context, a very different tension, but it doesn't require new writing.  
  
Also, instead of overhearing her admitting she likes you, you could overhear her telling Barbara that she wants to write a story about your youthful indiscretions. All the pieces can still be combined meaningfully, and they create different impressions.  
  
Obviously, that's just a limited example. It's something I'm whittling at.

[4:19 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187306340000#c5812898280762597506 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5812898280762597506 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01081324048399333328)

[andrewstern](https://www.blogger.com/profile/01081324048399333328) said...

I think that approach sounds promising. The meaning of the story would be emergent, then, yes? (You're intelligently, not randomly, juxtaposing/sequencing small narrative pieces, where the system itself doesn't have an top-down understanding of the overall narrative being generated, correct?)  
  
I bet that will work some of the time, and some of the time it will be hard for the player to make perfect sense of what's going on.  
  
Your approach reminds me of Brandon Rickman's "Dr. K Project", which he wrote up for the Narrative Intelligence symposium back in 1999, later included in the edited volume by the same name, edited by Mateas and Sengers. You can probably find the paper online.  
  
Also it reminds me a bit of the approach Michael Samyn is taking with his Drama Princess experiements.

[4:20 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187479200000#c938944181572986492 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/938944181572986492 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Ah, the Dr. K--- Project is an exercise in allowing the user to build an experience out of semirandom components. The user sorts the noise into signal.  
  
As it has been implemented, that works for very dreamlike stories, where causality and context are basically irrelevant or static.  
  
What I was thinking of was not nearly so random: it has a strong progression from start to finish, but the developing story can create a fairly large number of meaningful contexts using randomly selected bits of script... so although the story is fundamentally the same, the user's perception of it varies wildly.  
  
But it's not all planned out yet. In particular I'm not fond of the way it interacts with replayability, since players know things from the last time around. That changes their context, but not in a way I'm sure I can adapt to...

[4:56 PM](https://projectperko.blogspot.com/2007/08/component-plots.html?showComment=1187481360000#c8386238596962786167 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8386238596962786167 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4062405816512192626)

[Newer Post](https://projectperko.blogspot.com/2007/08/unequal-information.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/08/olpc-and-only-computer-you-have.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4062405816512192626/comments/default)
