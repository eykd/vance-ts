---
title: "Castles of the Mind"
date: 2009-09-20
url: https://projectperko.blogspot.com/2009/09/castles-of-mind.html
labels:
  - social simulation
---

## Sunday, September 20, 2009 


### Castles of the Mind

Nothin' but theory.  
  
It's obvious we can't keep scripting every aspect of our NPCs' lives. There are too many NPCs, too many subtle differences in how the player can treat them. We need to build algorithms that can reasonably drive an NPC's actions - not for all games, but for the growing number that require extremely detailed, player-driven interactions with NPCs.  
  
We've tried to use alignments - you know, lawful good, chaotic good, lawful neutral. But these alignments were created specifically to give tabletop players a framework for making tough moral choices. If you're lawful good, you'll eventually have to choose between honor and justice. If you're lawful neutral, you'll have to decide which is better: order or peace?  
  
These tough questions are possible because of the framework of "lawful/chaotic, good/evil", but they can only be *answered* by a human mind. Well, a computer could pick a pre-scripted answer (or a random one), but that's not the same at all.  
  
Another attempt is with factions. If a character is on the magician's faction, he wants to help magicians and hinder their enemies. But this breaks down for the opposite reason that alignments do: factions are too simplistic. The pat answer of "anything the magicians do is right" is robotic and unrealistic, and the greatest source of personal strife in this environment would be a "fall from grace", where a character decides the magician's guild *isn't* very good, and what they decide to do about it. As with answering the questions an alignment poses, there's no way to create a meaningful answer out of this data set.  
  
Don't even think that factions *plus* alignment is the answer: that just introduces two dimensions of moral choice instead of one, and no answers on either axis.  
  
Unfortunately, to make NPCs capable of having these kinds of moral dilemmas and subtle moral choices, we have to have a much more rugged and nuanced model.  
  
The first step is to build a graph (node graph, not bar graph) of the things the character cares about. This could be people, places, ideals, etc. This would probably need to be scripted, or created from augmented stereotypes: randomly assigning them wouldn't make much sense. This is a simple positive or negative number for each.  
  
From this foundation we can create their opinions on other people, places, ideals, and things. Some of these would probably have defaults set up - for example, if you are for the ideal of law and order, then you probably like the town guard. If you have a father who is a town guard, you probably like the town guard.  
  
These defaults can be over-ridden if the designer feels it would be interesting to have a different value, and of course things that are unrelated in most people's minds might be related in a given NPC's mind due to their personal experiences.  
  
All of these values are positive or negative, and there are edges linking them back to the node(s) they spawn from.  
  
This propagation can continue indefinitely - if you like the town guard, then you like the guy who likes the town guard - but should probably be capped to three layers.  
  
This foundation is significantly more complex than the simpler faction model, but it allows us half of the equation we need in order to make more nuanced decisions. You like the city guard, but if you see the city guard going bad, you'll have second thoughts and perhaps even turn against them, since you only like the city guard because you like law and order. This is true even if you like the city guard a *lot* more than you like law and order, because even though you may not be aware of it, your liking of the city guard does, in the long run, descend from those fundamental values.  
  
When talking about simple reactive responses, this model is not better than either of the more basic models. If the player attacks a guard, the NPC's response to the player is no different than if the NPC simply had a faction preference for the guards (or, more likely, the government, since it's always abstracted way out).  
  
But the whole point is to pull the NPC away from simple reactive responses into having justified moral reactions. This framework allows the NPC to change their feelings over time in a meaningful manner, especially in response to the aftereffects of player intervention. If the player kills a cop, that festers in the minds of the NPCs who care... but if the cop shoots at the player in cold blood, that also festers.  
  
It *also* allows them to stay cozy in their bias, because the positive reactions from positive propaganda would offset a larger amount of negative press, just due to the math involved.  
  
Adding into this a news/rumor system, you could create a city that actually responds to events in an intelligent and emotional manner, even though they're probably stuck expressing it with canned catchphrases from a voice actor. It would also create a "disinformation" system of crooked politicians and self-centered media clowns, just like the real world. Although that's optional when you're creating the world from scratch.  
  
However, I don't really think that's enough, because the NPCs still have no way to be proactive. This allows them to know what they think about things, and allows them to change how they think according to what they see, but it doesn't allow them to make or interpret plans.  
  
I haven't really come up with anything solid on that side, but I have the strong idea that it involves ranking change over time and remembering causes of change. This would have the benefit of also allowing for recollection - an NPC who feels maudlin when they go to the park where they spent much of their childhood.  
  
However, the progression doesn't work out yet.  
  
What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:11 AM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/3733674116627286787 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=3733674116627286787&from=pencil "Edit Post")

Labels: [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 12 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjURZbTUeIKNWlbodByylpnvz-37QYcobiyDEYrV3myl\_L8OO8suJx2EDy7h\_W64-WrZXWQc-CGlZ8O5lL3 UcLUKy0wjJDjQMJZZsrulgDhV6 Cfs83r421s5\_Sfmi8D8A/s45-c/cropgrow968982\_10200311668297839\_369994603\_n.jpg)](https://www.blogger.com/profile/13554930621825481241)

[Ellipsis](https://www.blogger.com/profile/13554930621825481241) said...

Cool, but the "canned catchphrase" line seems like a really serious obstacle to me.  
  
No matter how complex an NPCs reaction to a situation is, in order for the player to see that, the NPC needs to express it as text or even as spoken audio. In most of these games, what the NPC says is our primary means of understanding what they're thinking, so in order for the player to see complex thoughts, he has to hear/read them.  
  
So either you need a natural language processing algorithm that can write original sentences (in which case applying it to NPCs in a game is not what you'd be winning a prize for), or you'd need a different way of conveying these thoughts and emotions.  
  
The first thing popping in my head, actually, is that in Arkham Asylum, when you're in "detective mode" you see the condition of NPCs, friendly and hostile. In the game, all it realy does is add validation to your "I'm trying to freak out these goons" tactics, but if you had some way of getting that kind of information about NPCs as they interact with the world around them (as well as you), that might be enough for the player to feel the effects of your algorithm.

[1:08 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253477334849#c3365668472691169340 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3365668472691169340 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I [agree](http://projectperko.blogspot.com/2008/04/fundamental-issues-in-social-play.html).  
  
I think the answer in the short term lies in doing away with speech and replacing it with something else, such as alien glyphs or body language or such.

[1:11 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253477497622#c4973812915008713333 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4973812915008713333 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Speaking of which, what do you think of structuring a content creation language around a logographic chanting model?

[3:14 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253484846830#c4479083130834754215 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4479083130834754215 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I doubt "chanting" means what you think it does, but using any custom, artificial language isn't a bad idea. It gets rid of a lot of the arbitrary complexities surrounding a real language.  
  
However, it doesn't get around the need to have the NPCs capable of thought complicated enough to need a language.

[3:16 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253484990817#c4605677125730188598 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4605677125730188598 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/14295247089905712338)

[Tom Hudson](https://www.blogger.com/profile/14295247089905712338) said...

If you're interested in the conlang approach you probably should look at what Chris Crawford has been up to this past decade or thereabouts, currently at http://www.storytron.com/. It seems to me like it works for toys, but fails on anything larger; one of the standard Deikto examples was just awful.

[7:25 AM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253543151846#c8549882486879194115 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8549882486879194115 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I'm very familiar with Crawford's approach, and some people (Patrick in particular) know that I'm not very enchanted with it. As I said, you need to have the backbone to support the language: the idea that the language IS the backbone might have some merit, but not in any grammar I'm familiar with.

[7:28 AM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253543302923#c6364285689081581721 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6364285689081581721 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/14295247089905712338)

[Tom Hudson](https://www.blogger.com/profile/14295247089905712338) said...

Oops, we did have exactly that discussion 16 months ago, didn't we?

[4:09 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253574573827#c528987969379139624 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/528987969379139624 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, I'd love to have it again if there's anything new on the table...

[4:24 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253575475419#c646602253229956484 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/646602253229956484 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Well I'm interested in the user metaphor of actual chanting, like the first draft on a script is made via the mic and then edited with the keyboard. What I have in mind is defining the heuristics for an evolutionary algorithm/local search so that you can pare down the possible outcomes of a stochastic data-confetti machine. The NPCs in this case can be as simple as rule-based systems running around based on a few different variable stimulit, or FSMs. Having an in-game language and proportional cognitive complexity on the CPU side is a later challenge.  
  
Actually, what I'm trying to do right now in regards to "interactive drama" or what-have-you is to completely avoid AI driven approaches at all, and instead try to design interesting game mechanics between human beings. Why reinvent the mind when we're already got a shit ton of them just walking around?

[8:21 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253762482184#c5561134487434074338 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5561134487434074338 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Oh yeah, regarding Storytron, I can say that what really holds it back is the obtuse design of the authorship language, it apparently fails at the goal of being artist-usable. That may be due to the underlying design flaws of its algorithmic base, maybe, I can't really judge that. All I know is that I am a poor programmer and I've had a much smoother time using GameMaker or game-packaged editors that involved chunks of naked scripting. Something about trying to constrain an authorship tool to a GUI that seems to backfire every time. There has to be some code with parenthesis containing numbers somewhere in the dev environment, its just a question of what kind of code.

[8:24 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1253762658240#c3881025982705883132 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3881025982705883132 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/07640683757330420292)

[Christopher Weeks](https://www.blogger.com/profile/07640683757330420292) said...

"a city that actually responds to events in an intelligent and emotional manner"  
  
The most exciting thing about that is the PC as an change agent. Being able to propagandize the right people at the right time and seeing the effects ripple across the city is really exciting.  
  
As for the generic expression of these preferences, I've been wondering: What prevents us from scraping bloggers, editorialists, Twitterers and Facebook users for expressions to modify for use in game. You'd be able to build up profiles on those personality's preferences, algorithmically determine which of their expressions are appropriate for your use with some degree of confidence and then swap out nouns or whatever. Is there value in that? In case I'm not clear, we might assign coefficients of preference for Rush Limbaugh regarding Presidents Bush and Obama and when our NPC has a similar in-game regard for e.g. the town guard, we might take Limbaugh's "President Obama eats babies when no one's looking" and swap "Captain Gribulous" for "President Obama" (or something) when they line up. Wouldn't that provide a constantly evolving and yet consistent répertoire of personalized phrases?

[12:50 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1254253816803#c6318494436712617098 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6318494436712617098 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Unfortunately, that kind of thing is extremely context sensitive. Just look at Twitter's search for "Obama": http://twitter.com/#search?q=obama  

  
It's basically impossible to heuristically repurpose that stuff. For example, "The reason Polanski was arrested now and not before is: the justice has a political color and the new color is Obama"  
  
Repurposing it to fantasy characters would be possible, but very forced.

[1:01 PM](https://projectperko.blogspot.com/2009/09/castles-of-mind.html?showComment=1254254513326#c7959698076568795154 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7959698076568795154 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/3733674116627286787)

[Newer Post](https://projectperko.blogspot.com/2009/09/odst-yeah-you-know-me.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2009/09/blue-mars.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/3733674116627286787/comments/default)
