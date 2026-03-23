---
title: "Programming Worlds"
date: 2008-03-06
url: https://projectperko.blogspot.com/2008/03/programming-worlds.html
labels:
  []
---

## Thursday, March 06, 2008 


### Programming Worlds

For me, one of the biggest problems with programming languages is that they are languages. Languages are inherently one-dimensional: they progress forward along a line and that's it. For the most part, the things we want to communicate are one-dimensional: "I'm going to eat a sandwich" is a straight progression. "Turn left at the third light, then right at the dead mime" is a straight progression.  
  
But there are lots of things that aren't straight progressions - things that language is bad at. For example, teaching someone how to gut a fish. Teaching someone how to make a hat. Showing someone a fractal. Explaining a molecule's structure.  
  
Instead of trying to explain these with a language, we generally try to explain these with images. Usually, we accompany these images with language, because various *pieces* of the image might be known well enough to not need explaining. "This is a hydrogen atom", the label proclaims. "You should already know what a hydrogen atom is, so I don't need to explain it further."  
  
Language as *label* is fundamentally different than language as *progression*. If you say "This is a donut", that's not really the same kind of communication as saying "I'm going to eat this donut" or "a donut is made of dough and nuts". That's probably important to keep in mind...  
  
"Where are you going with this?" you may ask.  
  
Why are we trying to tell a computer how to do complex things by using a linear language? We don't tell *people* how to do complex things using a linear language. The only reason we still tell *computers* in that way is because we really haven't figured out how to get the computer to "understand" a richer system.  
  
Except... that's completely not true. Even ten years ago there were visual programming languages. The computer understood that each piece on the screen was part of a whole.  
  
What is missing from that picture is the relationship between the objects on the screen. You could draw eight text boxes, but the computer doesn't really know anything more about them. Unless you specify in a *language*, behind the scenes.  
  
That part is a real nightmare, logistically speaking. We've gotten used to it, but fundamentally, it's very messy and difficult. We've come up with a lot of ways to try to partition it, to simplify it, to standardize it, but it's still a nightmare. And it gets worse every year.  
  
So... let's think for a minute.  
  
Instead of thinking in terms of linear language, let's think in terms of pictures. When we draw shapes on the screen, the program knows what those shapes are and where they are. It just doesn't know what to do with them. It doesn't know how the shapes interact with the rest of the shapes and the world in general.  
  
You can make assumptions pretty easily. If you download one of the new "2D physics engines" that are all the rage recently, you'll find that you can easily draw remarkably complicated systems and the computer knows exactly what to do with them. I made a spinny thing that swung a bucket around fast enough to keep water in the bucket despite gravity. It took me two minutes, and I'd never used the system before. How long would it have taken in C#?  

  
Obviously, the assumptions that the engine makes are very limiting. It's not really possible to make a real game in the engine. You would have to look outside the engine for things like scoring, stage control, narrative events, inventory management...  
  
But...  
  
What if I had another system for building a narrative, and it understood the "physics" of interacting plot blobbies I draw. I could quickly sketch out an adaptive, dynamic plot. I could watch the nameless colored blobs spin and bounce off of each other. If I built it, I would know what each blob was. That one's the princess, that's the castle, that's the hero, that's the magic sword... tweak until they bounce and stick and move in ways that make sense, even if you allow the hero to have variable inputs.  
  
In fact, it could be the *same engine*, fundamentally. While you probably don't want to model plots using only Newtonian physics, those dynamics plus a few more (state changes, for example) would probably suffice. You won't be writing 1984, but you can create a fun, dynamic little plot.  
  
In two minutes.  
  
Now, the problem with that is that it really doesn't have any oomph. I mean, you see a pink blob labeled "princess" and a red blob labeled "dragon" and, well, rescue one from the other. Wheee?  
  
What becomes necessary is to allow this system to talk to another system. Which means that you would express yourself, moment to moment, on the physical system. That would determine some of the state changes in the plot system, which in turn would create a new physical layout for you to manipulate.  
  
This isn't straightforward to actually *do* . It's only easy to *say*.  
  
For example, if we're sticking to the knight-rescues-princess bit, and assuming you play the knight, then the primary gameplay would probably involve moving around the physical map stabbing things.  
  
We could simply make it so that when your plot-avatar encounters another plot-avatar, the enemy's level starts up. You kill the enemy, we delete the plot avatar, and your plot avatar keeps floating along in his path.  
  
That's not terribly interesting. Why make a plot engine if we're going to limit people to linear plots?  
  
Instead, we want to allow the player to alter his plot-avatar's path and/or state by what he does in the physical bit.  
  
One way to do this is "measures of success". The character adds how many kills he made to his velocity, and changes state depending on how much damage he took. This provides a minimal level of control, usually only useful for changing the timing of plot events. Still, you might be surprised how much of an effect that can have on a well-designed plot.  
  
Another way to do this is through pickups. These would be physical objects that aren't really physically important. For example, you find a letter from the wicked witch to the traitorous general. You read the postmark, and head off towards her house. This changes your direction on the plot level, pointing you towards a certain plot element.  
  
By collecting multiple "references", you could choose which one to move towards...  
  
Anyhow, the point is that a system that can do "anything" is very complicated to program. A lot of the things we do don't require a programming *language* , but a programming *world*. I would say "environment", except that already means something.  
  
There are a bunch of these already around. But because they exist in isolation, they are of extremely limited use.  
  
The core idea is that we can link together a bunch of systems that make specific assumptions and come up with what we need. It could just be stacking the same systems over and over, each time tweaking parameters and gluing in links.  
  
...  
  
Well, I like the idea.  
  
What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:10 AM](https://projectperko.blogspot.com/2008/03/programming-worlds.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6766833885003373078 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6766833885003373078&from=pencil "Edit Post")


#### 12 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

You post makes one think beyond the typical programming paradigms but some such things have been tried and failed. Novell's AppWare comes to mind.  
  
Regardless, I think you may be on to something. Perhaps it is just domain specific, for example the physics engine, etc. I am going to have think on this.  
  
Good post.

[2:04 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204841040000#c3997179714685243691 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3997179714685243691 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Please do. If you think of anything, post a comment here.

[2:20 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204842000000#c3421290258350086511 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3421290258350086511 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/14295247089905712338)

[Tom Hudson](https://www.blogger.com/profile/14295247089905712338) said...

On the contrary, we only tell people how to do **simple** things using pictures. For anything complex, we use text - often reams and reams of text, with occasional pictures to illustrate, but most of those pictures are useless without the context provided by the text.  
  
Visual languages have seen a big fall-off in popularity, even among academic language theorists. The most common reason I've seen cited is that they scale really really poorly - dataflow diagrams, for example, grow unmanagable very quickly. We're better at comprehending large bodies of text than we are at comprehending large diagrams (covering many, many pages), and our tools are better as well.  
  
Visual langauges **are** useful for narrow, well-defined applications that have fairly small problems. People are getting a lot of mileage out of visual languages for building shaders, for example, but attempts to commercialize visual languages for more general data analysis back around 2000-2003 failed, and all the research projects I know of in that space are floundering.  
  
Visual languages can capture a certain range of semantics; it appears to be significantly narrower than that of most programming languages. A visual programming interface for Lisp was an absolute nightmare - total impedance mismatch between what the language wanted to talk about and what the diagrams could convey.  
  
\[Disclaimer: I started a visual langauge project and was involved in it roughly 2001-2005.\]

[2:25 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204842300000#c1153998356330145535 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1153998356330145535 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Reminds me of a design I outlined involving Novamente where you draw various objects that, based on color, texture and shape, isntantiate different objects that interact according to atomic behaviors and traits. Kind of ambitious, but it might be more focused to make a game/toy along these lines than a full-blown authoring environment.  
  
Though visual interfaces could be wonderfully integrated into linguistic aspects of an authoring environment at some point.

[2:32 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204842720000#c1351734922952803779 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1351734922952803779 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Tom: That's true for some very advanced topics and very true for topics about language, but for most procedural teaching that's not linear, you get a lot of diagrams!  
  
I'm not suggesting that everything go in one nasty, messy diagram. That would be insane. What I'm suggesting is that it might be possible to use a larger number of smaller diagrams, much like what you would find when learning how to, say, [build a boat](http://www.amazon.com/gp/reader/0937822582/ref=sib_dp_pt/002-2501411-0796853#reader-link).  

  
I don't think the language can be entirely visual, but for my purposes, a language where the bulk of the procedural stuff is built into the visualization would be preferable to having to represent that same complexity with a linear language.  
  
I'm not sure which projects you worked on, but you're right: this kind of thing has failed before. I would like to think that using a simpler method like I suggest might be more feasible. Think of it as object-oriented diagramming. :D

[3:29 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204846140000#c8370499300847933685 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8370499300847933685 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

By the way, that "build a boat" link wasn't cherry-picked. It was the first result.

[3:30 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204846200000#c5195827747109362452 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5195827747109362452 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/17574626231451600275)

[Ryan](https://www.blogger.com/profile/17574626231451600275) said...

At the beginning of this post, you complained about sequential programming languages, so I figured I'd mention [VHDL](http://en.wikipedia.org/wiki/VHDL), which is used to describe and implement electronics hardware. With it, you can make circuits that run in parallel. Of course, it's also a big pain the ass to use. :P

[3:32 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204846320000#c6921403254335782661 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6921403254335782661 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Things like VHDL - and most applied visual editors (such as Maya or CAD) - have the problem that they are built to be able to represent the whole of possibility.  
  
VHDL basically gives you atoms and asks you to build a human cell. Maya covers a massive scope of 3D possibilities from bone animation to bump mapping to raytracing...  
  
What I'm thinking about would be much simpler, like [PHUN](http://www.vrlab.umu.se/research/phun/). It wouldn't require a doctorate to use.

[3:40 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204846800000#c9221121489859936580 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/9221121489859936580 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Programmers don't think about programming linearly. They think in nested structures, building components out of smaller components. Once a component seems to be working, its underlying intricacies can be ignored completely until it starts malfunctioning and you have to sigh and dive in to figure out what's wrong.  
  
Storing the code in a linear format is done purely for convenience and compatibility with the widest range of tools. In fact, it's specious to call programming languages even *superficially* linear, because if you open a text file containing natural language text next to a text file containing code, the visual difference is huge. The nested structure of code is visible even in a basic text editor and is even more obvious in the smarter editors that parse the structure and provide an interface to visually collapse the components.  
  
The hard part of programming isn't the textual representation. It really, really isn't. The hard part is defining the problem you're trying to solve and thinking the solution through to the degree of precision that is necessary to automate it. That's always going to be the bigger stumbling block than the code's visual representation, and that's why attempts at democratization of programming by making it more visual have seemed dumb to me. What's the point of putting forth the effort helping people over the hill when they're just going to run into the mountain right afterwards?

[5:25 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204853100000#c4414974507784613342 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4414974507784613342 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

You're right, but I'm not really talking about a programming language. I'm not trying to build Excel.  
  
The idea here is to use nested, mobile diagrams to create juicy, interesting little chunks of interaction.  
  
Games are not really meant to be "programmed". We only program them because there isn't really much of an alternative...  
  
But these days, we're seeing a lot of games that aren't about the programming. We're seeing ARGs and facebooks games and even semi-games like Flickr.  
  
These games are built on programming, sure, but they aren't about laying down threads of linear design. They're about complex, juicy interaction between various unique parts. They are more like The Incredible Machine than Word for Windows.  
  
I'm not suggesting everything should (or could) be done in this kind of system. I am saying that it is very easy to lay out fun situations in adaptive diagrams, and it's hard to do that with code.

[5:39 PM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1204853940000#c3907728472794328180 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3907728472794328180 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/14295247089905712338)

[Tom Hudson](https://www.blogger.com/profile/14295247089905712338) said...

Craig, can you clarify what you meant by "mobile" in "nested, mobile diagrams"?  
  
This discussion makes me wish I knew more about aspect-oriented programming. Wikipedia's article seems adequate, but not enough to base design-decisions off of. I think AOP could a good balance to your visual language.  
  
Let me throw in another disclaimer: visual languages are pretty good for data modeling. If you can implement your entire plot physics in the underlying engine, then people will be able to describe their plots visually and let your calculus go to work.  
  
This feels like the tension between the Interactive Fiction languages TADS3 and Inform7. TADS takes the approach that "the language designers can carefully build a complex, standard world model - get all the bugs out, provide the implementor with what they need to start writing a game that includes a whole host of semantics and physics". Inform advocates argue "every game needs a different world model, and it's just as much work to strip out the parts you don't need for your game as it is to implement the parts you do need in the first place." Having dabbled with both languages, I'm in the Inform camp; I would expect that anybody doing novel work would want to extend or specialize your plot calculus to deal with the kinds of narratives they were trying to tell. Those 2D physics engines are great to play with, but to write the game behind them took work under the hood.

[6:09 AM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1205327340000#c1818125989570112466 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1818125989570112466 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I kind of phrased it clumsily. What I meant when I said "mobile" was "changing" - these are not simply still pictures. There is an algorithm which drives them and changes them over time.  
  
You have my idea more or less right. I prefer Inform as well, and it definitely takes effort to build the underlying engine.  
  
But it doesn't have to be a physics engine: it can be any algorithmic thing, so long as it provides simple changes over time that can combine into complex results.

[6:38 AM](https://projectperko.blogspot.com/2008/03/programming-worlds.html?showComment=1205329080000#c1540475170611652384 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1540475170611652384 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6766833885003373078)

[Newer Post](https://projectperko.blogspot.com/2008/03/death-by-misadventure.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/03/themes.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6766833885003373078/comments/default)
