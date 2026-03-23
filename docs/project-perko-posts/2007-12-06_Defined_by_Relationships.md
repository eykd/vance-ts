---
title: "Defined by Relationships"
date: 2007-12-06
url: https://projectperko.blogspot.com/2007/12/defined-by-relationships.html
labels:
  - social simulation
---

## Thursday, December 06, 2007 


### Defined by Relationships

More on social simulation  
  
For the past few months I've been studying language, especially Pinker's stuff and, therefore, Allen Fiske's stuff.  
  
It's always been a common approach to try to simulate characters by focusing on the relationships a character has. The only more common approach is to do a goal-focused approach, and in most of the tries I've seen, both are used.  
  
Fiske's basic idea is that there are four basic kinds of social relationships: Authority Ranking, Equality Matching, Market Pricing, and Communal Sharing. In English these are "Who's the boss", "tit for tat", "barter", and, um... communal sharing. That last one means that you treat a group as equivalent to a single person - for example, all blonds are dumb, you always help your family, everyone shares the roads, and politicians are liars.  
  
This sounds like a pretty great basis, doesn't it? I mean, you could set up characters to think in these terms no problem.  
  
The issue that instantly pops up is that relationships are not as transparent as you might presume. For example, when someone is in your home, they are a guest. When you are in their home, you  are the guest. Similarly, a waitress won't ask you what kind of appetizer you want if you meet her in a bookshop.  
  
Some of Pinker's work is based on the idea that much of the complexity of language arises from negotiating these relationships implicitly. For example, your parents teach you to say "please" and "thank you" because these allow you to make demands without entering into an authoritative relationship.  
  
Some more of Pinker's work is based on the idea that ideas and other nonphysical things can be discussed as if they were physical things. Moving a meeting from Thursday to Friday, for example.  
  
Combining these ideas is fairly obvious: if you can encode a situation into a relationship, you can have a wide diversity of relationships that are realistic. For example, you could simply say that the waitress relationship only exists while she's working at that restaurant. Or you can say that someone is only a mother to specific children. Or you can say that a general is only in a position of authority in military matters.  
  
Even then, you're likely to miss subtleties. For example, a guest. What kind of relationship do you have to a guest? You're expected to make them feel welcome, to play the host, but what kind of relationship is that, exactly? Is it giving them some level of authority? What are the limits of that relationship? Similarly, while a politician technically is in a position of authority over me, it is a very disperse and indirect thing: in person, he has absolutely no authority over me and, in fact, would probably be glared at quite a lot.  
  
Actually, what about being glared at? What kind of relationship is dislike? You could, I suppose, argue that it's a kind of negative communal sharing: you are specifically partitioning yourself from this person, specifically *not* sharing. This basis could, in turn, make you more aggressive and opportunistic in future social relationships with this person...  
  
As you can see, the complexities quickly begin to build. In order to simulate something resembling common human experience, it is necessary to create a wide variety of potential situations to relate over. For example, can you share your hopes with someone? You need to be able to, for a decent social simulation. So "hopes" need to have some kind of representation in the world. Probably several, since there are hopes like dreams of the future, and hopes like what we think might arise out of something, and hopes like hoping something we cannot see has gone well...  
  
Of course, it's not just a representation of hope, but also a social stigma attached to that representation. Me, I'm happy to tell most of my hopes on almost every scale to anyone who seems geeky... but I'm not likely to share my actual personal life. On the other hand, I know people who refuse to talk about what they want long-term while sober, but are fine with giving the gory details of their latest break-up.  
  
Do we each have a defined relationship to representations of concepts ? Perhaps so, but if so, we need to add some kind of "personal space" or "importance" relationship, because I can't see any way of representing what value I place on something in what contexts using the Fiske four. (Also, I think that equality matching and market pricing are fundamentally the same and should not be represented separately... so I guess it would still be four relationship types?)  
  
As usual, it gets really, really gory the closer to implementation you get. The reason for this, as Murray Gell-Mann explains, is because any given situation is not descended from a core algorithm, but from such an algorithm plus a metric butt-ton of random chance building on random chance.  
  
Our social algorithm is probably something fairly simple, although it may be difficult to express using English and more easy to express with math. But our actual social situation - both personal and cultural - is not a result of that algorithm. It's a result of that algorithm plus our life and the residue of the lives of our ancestors back at least four centuries.  
  
We cannot "grow" a culture that is like ours, even if we use the same algorithm. We might develop a culture that is human-like, but it will feel as alien to us as if we were riding with Attila the Hun... and not necessarily very entertaining at all.  
  
Attempting to reconstruct our culture, even simplified, is a monumental task involving listing a huge number of objects, cultural norms, microcultures, standard relationships within microcultures... Ugh!  
  
In my mind, this approach cannot be used to create social play unless it is created by somehow harnessing the power of thousands of players that build the culture over a large period of time.  
  
On the other hand, it may be possible to generalize all of our little obsessions and create something vaguely interesting to interact with that way... still, bottom-up is not the answer at the moment.  
  
Instead, I prefer to build a framework of interesting content, ignoring all the details, and then basically just picking from column A and column B. Then I can focus on social reactions to this content, rather than having to simulate a history with that content or the other characters involved...  
  
Either way, not very straight forward at all.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [12:06 PM](https://projectperko.blogspot.com/2007/12/defined-by-relationships.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4072593624042808038 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4072593624042808038&from=pencil "Edit Post")

Labels: [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 5 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15516414416783046990)

[Olick](https://www.blogger.com/profile/15516414416783046990) said...

I think.. I agree that the social systems are very volatile and complicated.  
However, if we are ever to get to that point, we are going to have to experiment with social simulation. And so a small system that rigidly categorizes could be a useful starting point to a system that flows more... I sorta believe (no evidence to prove) that when the right algorithm is found, it will lend itself to exploration and extension.  
  
In fact, regarding "growing" a culture, you said something that could be applicable regarding dialog just a bit ago. Instead of using actual words, use meta words, and words the represent ideas instead of grammar. It may be possible to use the same, but as a meta-culture. The simulated culture creates its own rules for interaction, and while it is meaningless on an ordinary human standard, it is useful to examine from a conceptual standpoint.  
  
Perhaps instead of using humans as a model, you could openly admit you are simulating a culture, and call them social cells. Maybe that would defeat the purpose you want to create this system, in order to play in a world where people have stories and useful interaction, but I bet it would be cool to watch anyways.

[11:23 PM](https://projectperko.blogspot.com/2007/12/defined-by-relationships.html?showComment=1197012180000#c335704805925730208 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/335704805925730208 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Hmm, I don't think that it is possible to have meaningful emergent culture without agents that are very, very similar to individual humans.  
  
I don't think that simulating on an abstract level will accomplish anything, although I'll pay attention if someone else tries it. I think that in order to get a meaningful result, you have to have a "world" which constrains and directs your virtual people very much like the real world constrains us. I believe that culture arises - is seeded by - these constraints.  
  
What I am saying is that instead of creating an emergent culture, what I am doing at the moment is creating a pseudorandom culture. It's much easier for me, as well as being more applicable to games.

[7:33 AM](https://projectperko.blogspot.com/2007/12/defined-by-relationships.html?showComment=1197041580000#c4701428303276183614 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4701428303276183614 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

The only way I can understand how to tackle this is to model and build very specific social situations, where a lot of knowledge is "baked" in, by way of the the specific dialog the human author/programmer writes for it.  
  
There can still be a simulation going on, modeling some aspect of the dynamics of the situation, but it isn't too general or abstract.  
  
I.e., most of the world knowledge and common sense needed for the situation is embedded in the dialog and the particulars of the model, and is not represented in a more general way.  
  
Perhaps, after building enough of these specific models, one can start to see commonalities between them, and start building more general models and simulations. Yet these would somehow can ground out / express themselves in specific ways (e.g., character-specific dialog).

[8:32 PM](https://projectperko.blogspot.com/2007/12/defined-by-relationships.html?showComment=1197347520000#c4662915161417499898 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4662915161417499898 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Exactly! The question is: what is the most efficient level and method of injecting baked goods? How few pastries can we get away with? Can they be plain donuts or do they have to be wedding cakes?

[9:37 PM](https://projectperko.blogspot.com/2007/12/defined-by-relationships.html?showComment=1197351420000#c8169916700482507052 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8169916700482507052 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01820409963072076964)

[Chris](https://www.blogger.com/profile/01820409963072076964) said...

Whats interesting here is the understanding that "players" adopt once they enter a world. Humans are very very good at both learning to rules of a world and then using them to inform their actions. Take any game or MMO: players first learn the available dialog of actions, then use that vocabulary to succeed at the game.  
  
Even with a limited grammer, players are willing to suspend their disbelief based on the limitations and explore where such a simulation can go. With a limited grammer and "baked in" social knowledge, there's still a lot to be learned.

[4:58 AM](https://projectperko.blogspot.com/2007/12/defined-by-relationships.html?showComment=1214567880000#c2018431816461208861 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2018431816461208861 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4072593624042808038)

[Newer Post](https://projectperko.blogspot.com/2007/12/blather.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/12/fun-with-fractals.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4072593624042808038/comments/default)
