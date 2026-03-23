---
title: "You didn't answer in the form of a question!"
date: 2006-05-27
url: https://projectperko.blogspot.com/2006/05/you-didnt-answer-in-form-of-question.html
labels:
  []
---

## Saturday, May 27, 2006 


### You didn't answer in the form of a question!

I admit it, I am addicted to infrastructure.  
  
I just found myself writing a scripting language for Kampaku.  
  
The idea is that you restrict the scope of the language, which gives you a simple and - most importantly - *short* language which allows you to program for that scope.  
  
The problem is, as you start to write it, you start to think, "you know, if *that* part of the game was *also* handled by this same script language..."  
  
So, as usual, I find myself programming an engine.  
  
Hrm.  
  
Earlier, I discussed the kinds of languages that might replace Lisp as top dog. I know what language I want, now.  
  
I want a language which scopes.  
  
By that, I don't mean the variables act right or it's object oriented or any of that stuff. I mean that the language itself scopes to interact with cross-sections of itself. It's a more advanced version of object oriented, something like object oriented macros. Macros in the Lisp sense: code that makes code.  
  
For example, I program a game where I have heroes. Each hero has different capabilities. In object oriented code, I would make a "hero" object and, I dunno, list the capabilities. This gets painful because the hero object would regularly need to reference other objects "outside" its scope. For example, the soldiers in the army, or the capability of the town you're standing in, or the emotional state of another hero. This means that you have to give it a shit-ton of carefully engineered connections so it can find them in a blind morass of code.  
  
But what if you want to make it so that the hero ability takes effect on everything in five miles? Or if you want to have him create a new city? Or if you want him to be able to change the rules of physics?  
  
For each interesting new capability, you have to write a new function (or two or three) detailing how the ability changes the game. Then you have to make sure he can find the stuff he needs to change. After you've finished that and compiled, you're stuck being unable to add any new capabilities.  
  
Seems like a half-assed solution, to me.  
  
In cross-scoped programs, the program is to some extent self-aware. You can program your hero to add or modify functions to other objects (they don't have to be objects: it can just be a code morass, if that suits you better). The various functions and/or objects are tagged with what kind of data they modify and/or create - scoped by the effect it has on the program's world.  
  
Therefore, if you want a hero to create a new city, and you haven't programmed that in, you can make the hero's special ability function contain code *which modifies code elsewhere in the program* to include a new city in the game.  
  
So far, this is just an absurd version of macroing. It's extroverted macros, rather than introverted macros. Most macros make code from nothing. This style modifies code which is already live and running elsewhere in the system. Not a new concept, but a distinct difference.  
  
The key is that the language itself knows what part of the code is doing what, and allows you to specify changes not in terms of parsing through the code for the right location and tweaking, but through a simple set of interactive commands.  
  
Right now, if you want to change, say, the law of gravity (and you haven't programmed that capability in), you have to scan through the code for gravity, find the sign, and reverse it. And if you want to make it so that gravity is positive for some people and negative for others, you have to find that whole section of code, exactly, and replace it with another section of code.  
  
Moreover, if you have half a dozen different possible modifications, your code has to be able to delineate those mods no matter what combination of modifications are active - without damaging any of the other modifications unless your new code specifically calls for it.  
  
Sure, you could program something that might be able to do this. For example, something which leaves comments everywhere in the code and uses them as anchors for code modification. That's more or less what I'm suggesting: it's a radically different approach.  
  
This approach would also allow you to code-without-coding. Instead of programming functions, you add rules. The program knows where the additions should go, and it knows what variables are being modified, and it knows the importance of those variables.  
  
Let's say you have a blank screen. You want to create a character sprite. You say, "create character sprite using image 01" or whatever the terminology is. The program finds the GUI section and inserts a new function for doing just that. It calls it "(create sprite) character".  
  
Later, you say, "character sprite moves right when you press ->, left with <-, etc". The algorithm quickly looks back and sees the character tag, matches the two up, and adds that functionality.  
  
The actual code might be object-oriented, or a sprawling mess connecting the IO code directly to the sprite's underlying representation. It doesn't really matter, so long as the program keeps track. The new functionality is also carefully labeled and hashed.  
  
Later, the character gets a confusion mod, and you say, "for thirty seconds, all the character sprite movement is 90 degrees to the right of what it should be".  
  
Ha ha ha ha! The algorithm modifies the code, and then, *thirty seconds later, **unmodifies the code***.  
  
Moreover, that thirty second timer is *also code* . Which means it can be referenced so you can cut it short or extend it or whatever. Furthermore, if the movement code changes in those thirty seconds (maybe you pick up another confusion mod), it can either extend the thirty seconds or start up *another* timer and rotate you *another* ninety degrees.  
  
Fascinating.  
  
Of course, the modification would probably be pretty slow - it has to scan a hash table to find the right code, then scan that code's microhash for specific elements, then modify a microelement, rewrite the microhash, and rewrite the primary hash.  
  
But the code itself should run relatively quickly... sure, slower than C, but what isn't? The point isn't speed, the point is *power*.  
  
To do that rotation thing I mentioned above would take a hundred lines of code in any language you care to mention, and it would only work for rotation, not for, say, acceleration or changing movement to teleportation.  
  
Why not make a whole programming language around it?  
  
Why not?  
  
It would be the ultimate prototyping language...

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:28 AM](https://projectperko.blogspot.com/2006/05/you-didnt-answer-in-form-of-question.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114875296693830901 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114875296693830901&from=pencil "Edit Post")


#### 4 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I think you're on to something; you're essentially talking about something that you could implement a design metaphore in, which would adapt the system to suit that design metaphore as you make adjustments, correct?  
  
I wonder how/if this could be coupled to a dynamic content creation engine...  
  
Also, could something like this be implemented on top of Flash, using its recursive function? Seems like it'd be something very useful.

[12:34 PM](https://projectperko.blogspot.com/2006/05/you-didnt-answer-in-form-of-question.html?showComment=1148758440000#c114875845616021037 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114875845616021037 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

"Implement a design metaphore" means nothing to me, Patrick.  
  
It could be implemented in Flash, or t2d, or anthing that has "eval". But you'll have to make allowances for some pretty significant slowdown. I know t2d compiles into byte code, and I'd be surprised if Flash didn't. "Eval" doesn't compile into byte code, and therefore runs at a significantly slower speed.

[3:40 PM](https://projectperko.blogspot.com/2006/05/you-didnt-answer-in-form-of-question.html?showComment=1148769600000#c114876962223942781 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114876962223942781 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

By design metaphore, I mean an underlying concept which has both mechanical and aesthetic implications on the given system. For instance, Chess, you have Knights that have a specific mechanics, but this reflects the metaphore of mideaval feudal warfare, same with Rooks representing catapualts, Bishops representing bishops that can move in sneaky slants and so on. I was asking if you've got a higher level of abstraction where something like the *idea* behind Chess, for example, can be implemented, and new formal objects are tailored to that overlying abstraction.

[12:51 AM](https://projectperko.blogspot.com/2006/05/you-didnt-answer-in-form-of-question.html?showComment=1148802660000#c114880268283216438 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114880268283216438 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I hadn't really thought about it. A shorter coding cycle would certainly let you spend more time on your setting.

[7:13 AM](https://projectperko.blogspot.com/2006/05/you-didnt-answer-in-form-of-question.html?showComment=1148825580000#c114882563611046703 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114882563611046703 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114875296693830901)

[Newer Post](https://projectperko.blogspot.com/2006/05/things-that-go-bump.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/05/quantum-misunderstandings_25.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114875296693830901/comments/default)
