---
title: "COGENT and Cognition"
date: 2005-08-31
url: https://projectperko.blogspot.com/2005/08/cogent-and-cognition_31.html
labels:
  []
---

## Wednesday, August 31, 2005 


### COGENT and Cognition

I might have mentioned I have a couple of cog sci blogs on my radar. To show you how friendly cog sci blogs are, [here](http://mixingmemory.blogspot.com/2005/08/cogbloggroup-tomasello-ch-2-part-2.html) is a pretty representative post.  
  
But they are pretty interesting, if you're able to push the layers of contextual armor out of the way and translate it into english. This one touches on a couple of subjects, but one of the central tenets is that you can get a kind of spontaneous collaboration when your brains recognize that other people might have a reason for doing what they do.  
  
He also points out Noam Chomsky, who I very much dislike. I have read his books on linguistics, on knowledge representation, and on politics. He is full of shit, and mocking him horribly got me an A+ in college, mostly because the teacher was too dim to realize I was mocking him rather than supporting him. But that's a personal aside. I'm trying to talk about spontaneous collaboration.  
  
To me, the rest of the post is pretty pointless. The real gem is the idea of spontaneous collaboration. It's hardly a new idea, but it is a critical idea. The other gem is to hit on knowledge representation again.  
  
I hate this "linear" system we generally use for knowledge representation. Knowledge isn't represented linearly. I don't know HOW it's represented, but it's certainly not linear. Some people argue it's some kind of graph system, with related ideas "radiating out" from central ideas. Speaking from experience, I don't think that is it, either: such a system doesn't produce very good autonomous agents when simulated in a computer.  
  
Knowledge representation is critical. If you want an autonomous agent to learn, it has to be able to store and retreive data. That seems simple until you actually try to do it. Let's give the example of something simple: the autonomous agent, which we'll call "Alex", wants to get a sandwich.  
  
Alex learns how to make a sandwich by watching another agent. The data is stored, a consecutive series of steps. Alex can now make a sandwich.  
  
What if an ingredient is missing? He'll have to figure out how to get more of it, or do without. That's pretty easy, right? Well, he's never bought mustard before. He's bought mayo, though. How can he abstract the location and purchasability of mustard from mayo?  
  
That's easy, too. What if he can't find a knife? Is he going to abstract the location and purchasability of a knife from mustard? He'd be wrong. Plus, it's probably just in the dishwasher. Well, what's keeping him from assuming there's cheese in the dishwasher?  
  
Still too easy! I can handle that stuff. But making a sandwich is the weak way out.  
  
He wants a sandwich. He can ask some other agent to make it for him. He can buy it. He can steal someone else's sandwich. He can make it (or buy it, or steal it) ahead of time and then keep it for when he knows he WILL need it. How does he know that he can do these things? How does he know whether he should?  
  
This is just a sandwich. Imagine navigating a house, or trying to make a relationship work.  
  
The core problem is how you collect and coallate data. In essence, data representation.  
  
In a classic linear application, making a sandwich would essentially be a "program" with various options weighted by various factors. Not hard to make manually, but a bitch to learn on the fly. Of course, then it isn't very applicable in the long run. He just keeps putting mustard on? Maybe he doesn't like mustard! Maybe he prefers spicy Chinese mustard! These are mission-critical issues which linear representations struggle with, because they are not flexible. Trying to make them flexible makes them painfully bloated.  
  
I might have mentioned that I created the infrastructure for a reverse-parser text adventure. I call it "COGENT". The infrastructure is done: if I had a game programmed, it could be played. However, the programming interface is, by necessity, a bit less simple than most other text adventures. So programming a game is a bit difficult.  
  
Still, I know how to do it. I've gotten a start, and by using inheritance, I can do a lot of quick and easy stuff once I've gotten past the initial hurdles. It can't be distributed to people who don't own T2D yet, because the object files contain Torque 2D code, which means they can't be distributed (even though they execute fine). However, once version 1.4 comes out I'll create a compile function.  
  
The power here is that objects can modify object files, which means a permanent change in behavior. Human characters are possible, but human interactions would have to be painfully programmed in from the ground up.  
  
UNLESS I can find a way to represent the data. I don't need the humans to LEARN, per se, just to interpret knowledge I give them in a meaningful way.  
  
I've got a few ideas. We'll see.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [12:56 PM](https://projectperko.blogspot.com/2005/08/cogent-and-cognition_31.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112551996403621751 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112551996403621751&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112551996403621751)

[Newer Post](https://projectperko.blogspot.com/2005/08/movies.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/08/outpost-kaloki.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112551996403621751/comments/default)
