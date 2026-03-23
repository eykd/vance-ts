---
title: "Do You Speak Recursive?"
date: 2006-05-23
url: https://projectperko.blogspot.com/2006/05/do-you-speak-recursive.html
labels:
  []
---

## Tuesday, May 23, 2006 


### Do You Speak Recursive?

I miss LISP!  
  
Well, okay, to be exact, I miss LISP's cousins. LISP itself is kind of overly hardcore.  
  
There is a popular theory that what you can think is affected by the languages you know. I think it's definitely true, triple true for programming.  
  
I don't know how it is for you, but in my neck of the woods, there are a lot of people who seem to think that all programming languages are able to express the same basic functionality. I think they've taken the whole "Turing-compatible" thing to heart a bit too much.  
  
"Sure," they'll say, "Java does such-and-such worse, and C++ does such-and-such better, but you can use either to do so-and-so..."  
  
I say, "Provincial! C++ and Java *are the same language!*"  
  
Some of you might be nodding along. Some of you might be about to explode in irritation.  
  
I say that the difference between Java and C++ is about as much as the difference between crayons and markers. Sure, they're different. But we're not exactly talking about radically different mediums.  
  
Where's our painting? Where's our architecture? Where's our pottery? Our *singing and dancing*? Why are we stuck rubbing little sticks against flat paper?  
  
I miss LISP.  
  
I might have mentioned that.  
  
In my time programming web-accessable databases, I used quite a lot of PHP.  
  
Sure, PHP is a kludge. It's ugly, kinda slow, and has all the grace of a cow falling from a helicopter... onto another helicopter. But you know what it has? "Eval". Yeah, despite how it looks, it's still a (distant, inbred) cousin of LISP.  
  
Not a single project went by without me using that "eval" statement.  
  
Have you ever used "eval"? As you know, Bob, it lets you pump in strings you make up on the fly, and it executes them as if they were code.  
  
If you're thinking, "and so what?" then you, my friend, don't speak 'interpreter' or 'recursion'. Not fluently.  
  
Using eval, you can create code which creates code.  
  
For example, say you have an object which keeps several arrays of objects inside it. You want to apply some code to each member of a given array.  
  
Using non-interpreted code, you have two choices. Either invade the object's data and forcably apply the function, or make the function a member of the object.  
  
Either way, if you have about thirty different ways you need to do that, you end up with a huge mess of re-used, messy code.  
  
Alternately, you can pass the object the code you want to run, and it will apply that code to each member of the array. No muss, no fuss.  
  
Sure, you can work around it using, say, function pointers. But those are just methods of working around a disability that comes from not being an interpreted language.  
  
The power of this kind of algorithm is staggering, and it's just the tip of the iceberg.  
  
And *that's* limiting things to LISP.  
  
What about other languages we haven't even innovated yet? What about a language built specifically to run evolving swarms of code - an aLife-specific language? Imagine sitting at your desk and popping in a few basic pieces of code. Then the system runs - on its own - and you simply click your way through your favorite members of each generation.  
  
Or a language for neural nets? Or a language for massively parallel processing? Or a language for massively *multiplayer* processing?  
  
I miss LISP, it's true - t2d has an "eval" function but it's a bit wonky.  
  
However, I'm looking forward to these new kinds of languages even more than I'm missing the old ones.  
  
Can you imagine what we'll be able to imagine with them?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [3:13 PM](https://projectperko.blogspot.com/2006/05/do-you-speak-recursive.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114842401513800243 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114842401513800243&from=pencil "Edit Post")


#### 6 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I've speculated at a powerful langauge for authoring storyworlds and/or games in a dynamic content creation environment, a langauge of langauges, that seems to be in line with the recursion you talk about from first principles. For instance, you'd define the parameters of the langauge a given actor uses to define their role in the world, and express that role either verbally, with verbs, or both. So your memetic kernal would act as a constraint for generating scripts that in turn execute in real-time. A tall order, but a promising idea I think.

[6:04 AM](https://projectperko.blogspot.com/2006/05/do-you-speak-recursive.html?showComment=1148475840000#c114847588676691915 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114847588676691915 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

People often overlook the option of creating langauge-based tools that are suited to the problem domain. Which is simpler, regex for textual pattern matching or while/for loops?  
  
One of the senior engineers over here is a big proponent of creating tools that speak in domain languages as opposed to a command data format. It's a subtle distinction, but the result is a more powerful toolchain.  
  
But what I really wanted to comment on... you mentioned "eval" and you mentioned T2D (which I assume was a reference to Torque2D). Have you checked out Flash recently? I've been diving in deep over the last few weeks and have been nothing but impressed. There's a complete open source toolchain available (MTASC, swfmill, and FlashDevelop to name the most promising) that can produce cutting edge Flash-based applications without touching Macromedia's (Adobe's) Flash IDE. And it's all in the standards-based ActionScript2 language (EMCAScript, i.e. JavaScript).  
  
I've never done much JavaScript programming (just simple mods on web scripts I've found for various websites), but I'm really enjoying it. It's got a full, Java-like object model (which is very nice for old Java / new C# programmers like myself). It also has loose, dynamic typing, which is quite satisfying for prototyping work (and quite elegant for production work).  

  
And it has eval... which, if carefully controlled (for security reasons), is pretty nice.  
  
Also of note is the latest version of the Flash Player, version 8, which has bitmap optimizations (pretty decent performance for a completely cross-platform, truly write-once-run-anywhere toolset) and file upload/download functionality. Even better, the in-beta Flash 9 player has further optimizations to the virtual machine for even better code performance.  
  
Last but not least, if you want to distribute things as a stand-alone app, there's the newly open-sourced ScreenWeaver "projector." Using this, you can extend Flash to your hearts content (for downloaded exes) using DLLs, etc, that hook into the ActionScript code.  
  
Did I mention everything above is cross-platform on the big three (Windows, MacOS, Linux) as well as cross-platform (in various shades) to a magnitude of platforms: Windows CE, Palm, mobile phones (Flash Lite), Xbox, Xbox360, GameCube, Wii, Nintendo DS, PSP, PS2 and any other platform you can imagine if you want to license the source to the Flash Player for $150k.  
  
It's got an incredibly artist-friendly asset toolchain (the Flash IDE or any of the myriad tools that target SWF) and an incredibly programmer-friendly code toolchain (FlashDevelop, MTASC, swfmill, Eclipse plug-ins). There's even NeoSwiff, a tool that compiles C#. NET apps to Flash with almost full support for the . NET libs (and already full support for C# language).  

  
I would strongly, strongly, strongly recommend everyone go out and try these open source Flash tools ASAP (see OSFlash.org). It's truly where indie gamedev should be...  
  
(And if you don't believe me, check out Scott Bilas's presentation from GDC05 on the subject...)  
  
BTW, one last tidbit: the Flash Player version 7 has 85%+ market penetration on web-enabled devices. That's better than Java, Quicktime or Windows Media Player. Hell, that's better compatibility and predictability than you can get with anything other than plain-text or basic HTML!

[12:59 PM](https://projectperko.blogspot.com/2006/05/do-you-speak-recursive.html?showComment=1148500740000#c114850077186483735 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114850077186483735 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Open source Flash? I'm so there!  
  
I didn't realize it had been absorbed - I wasn't using Flash because I didn't want to develop on a pirated toolkit. But if there's open source options...  
  
After this game, I'll jump in on that!  
  
Thanks!  
  
As for domain languages, I'd love to know more. Got any info?

[1:43 PM](https://projectperko.blogspot.com/2006/05/do-you-speak-recursive.html?showComment=1148503380000#c114850338703124504 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114850338703124504 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I don't have much I can provide on domain languages... certainly nothing more than a quick google would answer. You basically summed it up (at least the reasoning behind it) in your post, even if you didn't throw out the terms! ;)  
  
BTW, my above comments has basically been transformed into this length post on my own blog: http://troygilbert.com/2006/05/24/found-that-game-framework-i-was-looking-for/

[5:51 PM](https://projectperko.blogspot.com/2006/05/do-you-speak-recursive.html?showComment=1148518260000#c114851826735601068 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114851826735601068 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Whoops, Blogger doesn't do it automatically, so I'll do it for the lazy ones in the crowd:  
  
[Found: that game development framework I was looking for...](http://troygilbert.com/2006/05/24/found-that-game-framework-i-was-looking-for/)

[5:52 PM](https://projectperko.blogspot.com/2006/05/do-you-speak-recursive.html?showComment=1148518320000#c114851832825410961 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114851832825410961 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, thanks for the info. I guess I'll mosey on over to your blog for a bit.

[7:23 PM](https://projectperko.blogspot.com/2006/05/do-you-speak-recursive.html?showComment=1148523780000#c114852383623443172 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114852383623443172 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114842401513800243)

[Newer Post](https://projectperko.blogspot.com/2006/05/learn-to-draw-in-five-minutes-3-detail.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/05/data.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114842401513800243/comments/default)
