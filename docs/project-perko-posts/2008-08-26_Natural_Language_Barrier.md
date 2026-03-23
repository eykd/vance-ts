---
title: "Natural Language Barrier"
date: 2008-08-26
url: https://projectperko.blogspot.com/2008/08/natural-language-barrier.html
labels:
  - ai
  - language
  - social simulation
---

## Tuesday, August 26, 2008 


### Natural Language Barrier

This is going to get ugly...  
  
I was thinking about social AI. Social characters that can comment on things in meaningful ways without being carefully scripted. Let me take you on a tour of my thought processes.  
  
Okay, pretend you're Batman. What is your opinion of... bank robbers?  
  
...  
  
If you bothered to stop and answer the question, you probably came up with something like "I hate 'em. I'm gonna catch 'em and lock 'em up!"  
  
Now, pretend you're Mario. What is your opinion of... bank robbers?  
  
...  
  
A little fuzzier? They're... bad people... not quite as crisp an opinion as Batman has.  
  
Now, pretend you're frogger. What is your opinion of... bank robbers?  
  
...  
  
*Frogger doesn't have an opinion of bank robbers*. Frogger has opinions about trucks and logs and jumping from lily pad to lily pad. The only possible opinion he could have about bank robbers is that he doesn't like them because they drive too fast.  
  
The pong paddle doesn't even have opinions on that level of cultural depth. The pong paddle's opinions will be so simplistic as to not even really count as opinions.  
  
Well, obviously, frogger and Mario and Batman don't actually have opinions. They aren't capable of judging things for themselves: they don't have any kind of algorithm to let them. But we can imagine what they would think if they did , and the basic idea holds up.  
  
You can only have opinions on things that you know about.  
  
For most characters, the things they can conceivably learn about on their own are extremely limited: they can hate goblins, maybe, or have an opinion on a sword or whether a girl is pretty. In the case of a chatbot, it would be even more severely limited, because they don't even have a world to fall back on.  
  
Even young players bring in an expectation of depth. Even if we're interacting with Bugs Bunny, we're expecting Bugs to have a life. A history, a future beyond this two-minute sequence with Elmer Fudd. We expect him to have a life, with all the complexities, changes, judgments, and opinions that entails. That's what makes him worth knowing.  
  
So, if you try to build a social AI such as a chatbot or an RPG NPC, one of the things people will routinely do is to try to program those in. This character... doesn't like bank robbers. Okay. Now, if the question comes up, the character will say, "I hate bank robbers!"  
  
...  
  
"Why?"  
  
Oops. No answer. We broke it.  
  
Adding information in this way is the shallowest, most brittle method of adding information. The illusion of depth we gain is painfully bad. It only works when we carefully restrict the player's topics of conversation. Everyone's familiar with this: you can't ask why unless the programmer has added that option to the menu. Otherwise, you're stuck with asking about, say, goblins. Or where the magic sword is.  
  
Chatbots tend to be extremely clumsy because this brittleness is faced head on, along with the natural clumsiness of trying to *interpret* player input, which has the same basic issues. Fundamentally, we square the brittleness.  
  
I don't think this is a very good way to do things. We seem to be climbing the steep side of the mountain. Every inch costs us another hour of painful scrabbling.  
  
Is there a way around?  
  
...  
  
Okay, the problem, at it's core, is that you can only have an opinion on things you know about. And the world we build is pretty limited: we only include the things we want the player to be able to interact with. This means that our NPCs will never experience building a house, getting married, dying, electing a new president, learning a secret... not unless we specifically script them in, creating a very fragile, shallow experience. They can have opinions on how to fight orcs, what's the best way to level up, and so forth... but those opinions aren't terribly interesting...  
  
The solution would seem to be to get our NPCs to experience many things that are outside the scope of the game. If we want them to have actual opinions, we have to give them the experiences. Then they will be able to comment on them in depth.  
  
However, creating a world where all of these experiences are algorithmically emergent would be... well, I'm not sure there's a word for it. "So close to impossible you might as well spend your time looking for wild polar bears in Florida."  
  
The world is an extremely complex place, and the computation required to simulate something even 1/100,000,000 as complex is prohibitive.  
  
The only real option is to glean experiences from the real world somehow.  
  
How about we use a handy-dandy filter? One that's very common?  
  
How about we use you?  
  
What if we built a chatbot that learns what things are via stories? This isn't a chatbot that asks you how you are, or tells you that it's a chatbot. This is a chatbot that listens to you tell stories... and maybe tells stories back.  
  
Humans tell stories to children all the time. Not simply for entertainment, but to teach. "Don't touch that, it'll burn you!" is a story. "Your face will stick like that!" is a story. So is Sleeping Beauty.  
  
The chatbot has to come pre-equipped with a lot of basic tools for learning and interpreting. In order to be deep enough, the chatbot has to have an "experience" fairly similar to a human. That means that the chatbot has to be able to learn things like "thunder is loud", "lemons are sour", and "he felt sad".  
  
Let's take a look at how it might work.  
  
YOU: "There was a little boy..."  
CB: (There: preprogrammed element to assign focus)  
(Was: past tense be \[complexity hidden\])  
(a little boy: unknown element: LITTLE BOY)  
(LITTLE BOY is noun...)  
CB: "Tell me about the little boy!"  
  
YOU: "He was fast and clever."  
CB: (He: re/little boy, now defined as MALE)  
(Was: past tense be \[complexity hidden\])  
(fast and clever)  
(fast: basic adjective, preprogrammed)  
(clever: unknown adjective)  
CB: "Tell me how he was clever!"  
  
YOU: "Well, he once outsmarted the goblin king..."  
CB: (Well: response fluff \[complexity hidden\])  
(he: re/little boy)  
(once: time marker, preprogrammed)  
(outsmarted: unknown verb)  
(the goblin king: unknown element: GOBLIN KING)  
(Plan to say: "tell me how he outsmarted the goblin king!")  
(Compare to original, apply modifier only)  
CB: "How?"  
  
etc, etc.  
  
There is a lot of hand-waving here, obviously. We're presuming a pretty advanced parser with a strong understanding of basic linguistics *combined with* a strong ability to link things to a human-like experience.  
  
To give you an example of the complexity, let's look back on our Batman/Bank Robber example in a new light.  
  
"I hate 'em. I'm gonna catch 'em and lock 'em up!" is what I said. But Batman would be more likely to say something like, "If you rob a bank, I'll make sure you end up rotting in prison."  
  
These both say "the same thing", because we're used to thinking about the "logical content" of a phrase. To a programmer, used to computers, that's all that matters.  
  
But in truth, there is a world of complexity between the two sayings. Let me show you.  
  
"I hate 'em" is a value judgment that isn't even brought up in the second one. Even though we specifically ask what Batman thinks of bank robbers, the more canon Batman doesn't say "I think X".  
  
This is because canon Batman tries to keep his emotions out of it. To him, it hardly matters whether he personally likes or hates bank robbers. They are *objectively* criminals, so his opinion is pointless.  
  
This is a subtle point, and it's easy to wave it away as projection or overanalysis. Except that these subtle differences are *the* meat. The logical content of the phrases is almost unimportant - our valuation is what matters. In this case, off-the-cuff Batman is saying "I think bank robbers are bad" and canon Batman is saying "bank robbers are bad" by simply taking it for granted that his opinion isn't even worth mentioning.  
  
There are other subtleties. Here's another: canon Batman says "If you rob a bank, I...", while off-the-cuff Batman jumps straight into the "I..."  
  
Canon Batman once again shows a different mindset. We asked what he thinks about bank robbers. He redirects the question to be about bank robber*y*. He's not talking about the people that rob banks. He's talking about the act of robbing a bank, which happens to be attached to a person.  
  
Again, he's not judging the person, he's judging the activity. He's basically saying "Robbing banks is bad", as opposed to off-the-cuff Batman, who's saying "Bank robbers are bad". They're very different values.  
  
These complexities add up pretty quickly. If out little chatbox later decides to tell a story about bank robbery, which way he was taught will matter. If he learned from canon-Batman, he can tell a story about everyday people who get caught up in the need to rob a bank, and suffer the consequences. If he learned from cuff-Batman, he'll probably tell a story about ne'er-do-wells who rob banks and are generally bad people. (Of course, by the time he can tell a story about bank robbery, he'll have to have heard a few stories about bank robbery. At this point, he doesn't even know what "robbery" means...)  
  
"That level of complexity is impossible!"  
  
Hmmm...  
  
What you really need is a carefully chosen fuzzy semantics system, and then you build it step by step by step, naturally.  
  
In order to comprehend the story, you need to understand a huge amount of basic experiences that humans learn in their infancy. Things like: time moves forward. Stuff doesn't just vanish. Some things smell bad. Big people are usually stronger. People like being happy.  
  
These same bits of understanding should be able to form the basics of the semantics system, as well.  
  
How would you store "bank robbers are bad" as opposed to "robbing banks is bad"? Well, the first is a person who, in their past, robbed a bank. The second is the act of robbing a bank. They're fundamentally very different, and the first one contains the second. It's not usually so simple.  
  
Here's a *really* subtle example to chew on:  
  
"The baby grew up clever and strong" as opposed to  
"The baby grew up **to be** clever and strong"  
  
What a tiny difference. Surely there's no difference?  
  
Actually, there's a huge difference.  
  
In the second case, the act of "growing up" has a purpose: to be clever and strong. In the first case, the act of "growing up" just happens, and the baby is clever and strong while growing up.  
  
The difference is the distance between "the Goonies" and "Stand by Me". The Goonies is about a bunch of kids who run around being kids. They all have their personalities and shticks, and there is some growing up, but by and large it's about kids being kids. The movie ends with them still being kids, and the whole point was actually to maintain the status quo.  
  
Stand by Me is about kids going out and growing up. They have personalities and an adventure, but the whole point is to grow up. Their childhood is a transitional phase. It's the point of the whole thing.  
  
That's the difference adding two little words makes, when you are thinking in terms of stories!  
  
How would you represent this in your semantic web?  
  
Whoa-oh, now you're getting into a messy situation!  
  
Classically, we'd build our semantic web with some kind of connective system. "Grew up clever and strong" would link "grew up" to "clever" and "strong" directly. "Grew up to be clever and strong" would have the same links, but with some kind of qualifier. "Purpose" links, perhaps.  
  
The problem with this method is that it's more or less one-way. We're not looking for a book report: we don't care that the kid grew up clever and strong. We just care that kids grow up, and whether they grow up with attributes or for attributes.  
  
So I've started to compile a list of... I don't have a word, really. We'll call them cogshazams. Cogshazams are mental pigeonholes (or, perhaps, pidginholes, ar-har) that concepts can fill. They are the basic mental responses someone can have.  
  
One example is "security". A concept might be about security - giving more security or taking security away. Getting married is usually slotted strongly into the security cogshazam. Having a kid is generally full of insecurity - it's a big responsibility that changes your life - but *being* a kid is generally pretty secure.  
  
Another example might be "competition". The cold war was anti security, pro competition.  
  
The idea is that our little listener will build a semantic net based mostly on these kinds of judgments rather than building a really complicated semantic net.  
  
In the case of growing up: if growing up is for the purpose of ending up an adult (IE, growing up to be clever and strong) then we can label "growing up" as "destiny" cogshazam. When we think about it in the future, we'll keep in mind that people who are growing up are marching towards their destiny.  
  
If growing up is just something you do, and you can be all clever and strong while you do it, then we would use "building" cogshazam. We would keep in mind that someone who is growing up is improving, growing... but are who they are, not necessarily marching towards being some specific "final form".  
  
"Growing up" can have a lot of other labels attached to it, depending on the stories you tell. Friendship is a common one, as is security, but anti-control...  
  
Anyway, once we've labeled "growing up" as building or destiny, we might later wish to reconstitute that knowledge. How would you do that?  
  
Well, if you wanted to talk about someone growing up, you would call it up. You would see it has, say, destiny attached to it. You would find something else you like that fills the proper linguistic slot and has destiny attached to it. You would combine them. To simplify grossly.  
  
So you might say, "When he grew up, he conquered the world!"  
  
There is still quite a lot of handwaving... for example, we'd need to keep track of amounts. Something that is only a little bit destined should probably not be so strongly combined with something that is strongly destined. For example, "He was born on a dark and stormy night, so he grew up to conquer the world!" is a little awkward...  
  
Also, this doesn't cover things like twists, and I'm flat-out leaving out the parsing part...  
  
But I think this is plenty long as it is.  
  
If you get this far, you have a lot of time on your hands. Might as well leave an insightful comment.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:34 AM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/4825273542332954044 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=4825273542332954044&from=pencil "Edit Post")

Labels: [ai](https://projectperko.blogspot.com/search/label/ai) , [language](https://projectperko.blogspot.com/search/label/language) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 9 comments:

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Should be clearer: I'm not trying to make any kind of pattern recognition breakthrough. We're not talking about Shakespeare the Chatbot, here.  
  
The system probably won't have much understanding of context. It only needs to have the vaguest ideas of basic logic, and only that because it needs to understand that a strong enemy is bad.  
  
This is a system so that NPCs can react to getting hit on, can meaningfully comment on someone's new baby, can be proud of their house, and can come up with really creative insults. We're not looking for something particularly clever.

[1:32 PM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1219782720000#c6047432640361921077 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6047432640361921077 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I'm wondering if this wouldn't be radically simplified by constraining the semantic world by the pursuit of a goal, either implicit, explicit or aesthetic. The examples you gave involve characters defining themselves and their understanding of other objects in the context of meeting goals, so I don't see why this couldn't be applied more broadly. It doesn't have to be rigid either, you could have a social game with a loose, implied goal of "happiness" that involves any number of routes, money, love, accomplishment, ect. these are all quantified at some level, balanced by the usual economy of tuned equations, so that your fuzzy semantics can be parameterized fairly specifically.  
  
In other words, the language parser and semantic logic are just an extension of the game, a more complex analogue to the fog of war.

[7:00 PM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1219802400000#c4054229362976335052 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4054229362976335052 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

In essence, my cogshazams are goals.  
  
I'm not to set on getting more goal-oriented, because it's a very limited approach. A lot of things happen outside of a goal framework.  
  
For example, the stove is hot. The goblins are evil. The space ship is low on fuel. He is sick.  
  
These things can cause goals, but that's a character thing, and has nothing to do with understanding the world as a whole.

[7:18 PM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1219803480000#c3505349034557625560 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3505349034557625560 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01867491782144075781)

[DmL](https://www.blogger.com/profile/01867491782144075781) said...

Wow, this idea of a weighted linking of ideas is pretty strong, and seems like it would greatly simplify sentence construction on a limited basis. I could see this being used to great effect in a world like Dwarf Fortress where you could apply it not just to individuals but to civilizations as well.  
  
Also nice pun "pidgin holes." : )

[11:43 AM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1219862580000#c4979655826615488008 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4979655826615488008 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Now I'm really trying to think of a theory where I can actually use the phrase "pidgin holes"... argh...  
  
That's basically the reason I thought of it. Some game containing a lot of NPCs and a game world that's supposed to be immersive. You want the NPCs to say things that are relevant to what's going on, but you don't want to spend eighty years writing scripts...

[11:54 AM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1219863240000#c2181361595494963748 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2181361595494963748 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Don't quit your day job and go into AI research :)  
  
Hey, I make ass-pulled designs and schemes as much as the next fellow, but in the end my scheme for, as an example, making AIs search through 3D space in a manner more like humans (ie. starting nearby and then searching outwards) is nowhere near as fast or efficient as stuff some 3D gurus come up with, like BSPs or whatever.  
  
It's always been a bit of a Holy Grail for independent game designers in the "west" to come up with some sort of abstracted, procedural mechanism for social interaction. (eg. Facade). But whilst those projects are interesting from a design standpoint, they've always failed to produce the sort of emotional connection that they're trying for.  
  
Whereas you see a lot of social-style games coming from japan (many of them hentai :P ). We see from games like Persona 3 that they dont even bother with any sort of AI - they just throw writers at the problem until it goes away.  
  
I wonder if it's because most western indy game devs are programmers and can't really write dialogue or understand socialising in the first place? ;)

[5:02 AM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1220184120000#c1943835090968102134 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1943835090968102134 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Presumably, you're the same anonymous troll that whined about my Persona 3 post as well. Again, you are posting tangents. Your comment has nothing to do with my post, it's merits or flaws.  
  
Hell, you're comparing it with various search optimizations, which is like comparing cars and air conditioners.  
  
But I hope you feel mighty smart.  
  
That is the point, right?

[8:59 AM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1220198340000#c560606155930771574 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/560606155930771574 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

The point is, most attempts to proceduralise social content results in something like Oblivion's little chat puzzles.  
  
I guess that's fine if you want to take away all the "social" component of social gameplay, and just turn it into a little game.  
  
It's like the flipside of how Monkey Island turned combat into a conversation, perhaps.  
  
But it certainly doesnt give you the emotional involvement you get with well-written social content.  
  
Anonymity is wonderful. I use it whenever possible.

[6:26 PM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1220232360000#c6320128994270698501 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6320128994270698501 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Anonymity is great if you're, say, protesting scientology. It's not great for having civilized conversations.  
  
But this is the first post you've had that's been civilized, so here's some civility back:  
  
The point isn't to make high-quality content. The point is to make a LOT of content.  
  
You cannot script very much content into a game world. Scripting is simply too time-intensive, and as the game world increases in size, the amount of scripting increases at an exponential rate. Games like Oblivion employ dozens of scriptors full time for five years. And their conversations still ended up shit.  
  
Solutions like this - which has NOTHING IN COMMON WITH OBLIVION'S CONVERSATION SYSTEM AND IS DESIGNED TO SOLVE A COMPLETELY UNRELATED PROBLEM - are an attempt to allow you to include a large amount of unscripted, lesser content to back up your scripted, greater content.

[8:42 PM](https://projectperko.blogspot.com/2008/08/natural-language-barrier.html?showComment=1220240520000#c7997695160072543795 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7997695160072543795 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/4825273542332954044)

[Newer Post](https://projectperko.blogspot.com/2008/08/even-more-on-social-npcs.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/08/thought-exercise.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/4825273542332954044/comments/default)
