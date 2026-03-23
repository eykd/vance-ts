---
title: "The Tailor's Paradox..."
date: 2008-02-28
url: https://projectperko.blogspot.com/2008/02/tailors-paradox.html
labels:
  - player-generated content
---

## Thursday, February 28, 2008 


### The Tailor's Paradox...

For the past year or two, I've had the very strong impression that if I can figure out how to put *tailoring* into a computer game, I will have solved a major content generation problem.  
  
If you look at games that allow player to generate clothing, you find there are two basic approaches.  
  
The basic approach is to let players spray paint their avatars with a semitransparent image that looks vaguely like clothes. SecondLife actually offers a wide variety of twiddles and tweaks that allow you to do this in-game, but the result is pathologically ugly, so most of this kind of thing is made by importing an image from another program.  
  
Reskinning like this is just not what I would consider a solution. It's begging the question. Clothing has a distinct existence from the avatar - or, at least, it should.  
  
The other method is when you build clothes as a physical object and then somehow mount them on the avatar. While this produces clothes that have a distinct physicality, it runs into a wide variety of problems with varying body sizes and animations. Flowing clothes are essentially an impossibility, and forget clothes that interact with things (no stuffing your pants into your boots!).  
  
Physical objects are subject to the rules of physical objects, and in modern engines that usually means solid-object physics and pre-scripted animations. Engines just aren't built for soft things. I guess a game that revolves entirely around the physics of soft things might be interesting, actually.  
  
But a larger problem than physics is actually specifying the construction of the clothing.  
  
If you're just reskinning, you don't have to worry about it: the construction is only skin deep, literally. Just paint whatever you like.  
  
If you're building an actual object, the construction is usually very difficult, only made easier because the physics simulation is nonexistent so you don't have to worry about anything actually *working*. Most construction kits are built for solid objects like furniture, simple houses, and swords. Complex, adaptive physical constructs such as clothes and jet skis are usually quite difficult and certainly not mechanically interactive.  
  
Many games - such as Project Entropia - solve this by having specific, tweakable blueprints. But that's not what I want. This problem is the heart of the issue, and is what I'm trying to solve. How would you (A) let the player create clothing designs and (B) simulate them on various avatars?  
  
Remember, since we're working in a 3D space and can ignore gravity and the need to manually cut things, there's probably no reason to use 2D representations at any point.  
  
This is not an easy problem: think about it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:14 AM](https://projectperko.blogspot.com/2008/02/tailors-paradox.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/7140994974255648375 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=7140994974255648375&from=pencil "Edit Post")

Labels: [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content)


#### 2 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01622491121542472937)

[Unknown](https://www.blogger.com/profile/01622491121542472937) said...

Problem 1: Simulate a sheet of cloth, and how it interacts with your solid models. If you can't do this with your physics engine, give up and develop a hack. If you can't make a sheet of cloth, toss it over a chair, and end up with something that looks like a chair covered by a sheet, then you're not going to get realistic clothing. It is not actually a difficult simulation, it's just not something that most physics engines bother with.  
  
Problem 2: Teaching people how clothing works. It's really amazing how few people actually understand what is involved in the making of clothes. The easiest thing to do here is just to give them patterns (as in sewing patterns) which they can 'skin' however they like, and then turn the patterns into clothes afterwards. And if they alter the patterns, alter the clothes to match - it's just a matter of attaching the edges of the patterns to each other.  
  
So basically, once you've managed your physics-engine add-on, it becomes a two-step process (where, in the real-world, it's a three step process, and the third step of 'making the clothes' takes most of the time). First, choose a pattern. Second, modify pattern and choose colors. Third, press the 'make clothes' button and let the engine do all the work. It's got the elegance of skinning, and if you can modify the patterns (which are 2-D objects, by the way, and thus very easily edited) then you can have all of the complexity of REAL clothing. Because this is how the real world works.

[4:57 AM](https://projectperko.blogspot.com/2008/02/tailors-paradox.html?showComment=1204462620000#c831913008719777843 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/831913008719777843 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Ah, but that's not feasible. First, simulating clothing in a standard 3D polygon/vertex environment isn't as easy as you make it sound: while it's straightforward, it's very computationally expensive, especially if you have multiple pieces of cloth interacting  
  
Second, I was really hoping for something that didn't translate an arbitrary 2D pattern into an arbitrary 3D pattern. I was hoping for something... more WYSIWYG.  
  
The reason is twofold. First, people are more likely to work if they can see what the results are immediately. Tighter feedback loop = more powerful designers.  
  
Second, some clothes don't do so hot on 2D patterns. Things like shirts and pants, sure. But what about more structurally significant pieces, like armor or bras? You'd have to come up with a way to represent - on a lot of 2D sheets - things like "strap A into tab B" and "curved outwards 30 degrees" and "make this a pocket and stuff it".

[8:24 AM](https://projectperko.blogspot.com/2008/02/tailors-paradox.html?showComment=1204475040000#c1640004424351288528 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1640004424351288528 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/7140994974255648375)

[Newer Post](https://projectperko.blogspot.com/2008/02/hey-lets-talk-roguelikes.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/02/language-ui-and-systems-design.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/7140994974255648375/comments/default)
