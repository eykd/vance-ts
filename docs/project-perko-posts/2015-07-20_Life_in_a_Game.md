---
title: "Life in a Game"
date: 2015-07-20
url: https://projectperko.blogspot.com/2015/07/life-in-game.html
labels:
  - characters
  - game design
  - generative
---

## Monday, July 20, 2015 


### Life in a Game

So, after Space Engineer's recent disastrous update, I switched back to Rimworld for a while.  
  
Rimworld is coming along nicely. You can build complex bases, set up your citizens in complex ways. There's a lot of fun to be had, especially when you start laying on the mods. But there is a big weakness. I can't blame it on Rimworld: it's a weakness in all base-building games.  
  
The problem with these games is that nobody lives in your bases.  
  
OK, I know there's, like, 30 people living in the base according to the game. They wander around, have their little tasks. In Rimworld they even goof off or chat. Still, none of them actually feel alive. They don't form relationships. They don't have hobbies. They don't do things with each other, have friends, have enemies. They don't have lifestyles or emotions, at least none that are differentiated in any significant way from anyone else. They have a lot of stats, but who cares?  
  
As the number of people in your team goes up, their individual stats matter less and less. Instead, how they contribute to the operation of the team is what matters. It doesn't matter whether person A is marginally better or worse at farming, it matters whether they can play the farming role, and whether they should be a focused farmer or someone who helps farm when the workload gets rough but has other jobs the rest of the time.  
  
What's the alternative?  
  
There's a reason the Sims was popular: it allowed players to feel like their little avatars were living a life. The tools used to do this were simple: a familiar scenario (working and cohabitating) with clearly defined roles, lifestyles, relationships, optional goals (having kids, ranking up, collecting meteors, etc), attention retention (everyone needs to be clicked on sometimes), and personality proxies (appearance, clothing sets, certain personality traits).  
  
Let's talk about each of the techniques individually, and then let's talk about how to shape your game to allow for them.  
  
**Personality proxies** are the most problematic, because they bring in the most from outside the game world. We'll have to talk about them in detail later, but the short version is that you have to be able to tell who is who. If you have more than four team members, having slightly different names and icons isn't going to cut it: you need a dense representation of who is who, along as many axes as possible. Not just physical appearance, but voice, animations, fashion, mannerisms, personal possessions, and room decoration.  
  
**Lifestyles** are technically a personality proxie, but it's worth mentioning them as a distinct group because these interact with the world, or at least the timing of things. Lifestyles are specific habits, inhibitions, and judgments not shared by the rest of the group - for example, one person might obsessively collect statues, one person might be the only person on base that smokes weed, one person might only work at night, one person might dress in finery get offended if someone else looks shlubby.  
  
Lifestyles are powerful because they are behavioral elements. However, these should not be chosen willy-nilly. When we talk about how to do personality proxies, we'll be bringing these up again.  
  
**Evocative scenario**: A familiar scenario is a way to allow the player to hook into the game world. Almost everyone has struggled to work a day job, had roomies, eaten pizza, invited people over, etc. This familiar setting can have any characters inserted into it, since living with Spock and Captain Kirk in a tiny apartment is hilarious.  
  
But, again, this brings in a lot from outside: "familiar" scenario assumes it is familiar. Similarly, while it allows the player to import characters they already have an attachment to, it isn't very good at differentiating random characters. Everyone has to live, eat, participate in daily life. You can put Spock into an apartment, but someone as interesting and evocative as Spock cannot arise from an apartment. There's no room for his characterization.  
  
Because of that, if we're focusing on random characters, we need the exact opposite. Rather than a familiar scenario, we need an evocative, unfamiliar scenario that will allow characters to establish and continually re-establish a strong personality.  
  
**Clearly defined roles** are important to allow people to distinguish themselves at the most fundamental level. The wider the disparity of roles, the wider the variation between the characters. In The Sims, you have the breadwinner, the housemaker, the children, the skeezy roomie, and so on. You also have all the details you drag in from your expectations: the annoying roomie, the tidy roomie, the control-freak roomie. It's two axes of roles: one aligned with the core gameplay (time/money), one aligned with personal interactions with shared resources.  
  
If we're generating characters randomly, we need to have roles that offer us powerful differentiation. We slot the character into a role and suddenly they come alive. The green thumb luddite is facility manager? We suddenly have an explosion of expectations about how the facility will function and how they will interact with other characters *even if none of that actually happens in the game*.  
  
The difficulty is getting a breadth of roles. You can't simply use social status, because a simple numeric rank isn't evocative enough. Instead, think of each role as "which core task do they do, when?"  
  
In The Sims, you don't really have "breadwinner A, B, and C", you have one person that wastes their life working in an office, another one that does arts from home, and maybe a third that works part-time at night but still keeps their days largely free. These roles each interact with the core scenario in a different way, at a different place and time. In addition, the people that don't work aren't simply "not working". Each has a role within the function of the house and life in general. One is a child, one is raising children, one is studying for college, one is a housekeeper, one is a social climber, etc, etc.  
  
It's not that the breadwinner has a higher social rank. It's that everyone has their own approach to some set of core tasks.  
  
If we can somehow break the core tasks into two completely distinct groups, it gives everyone two roles, which is even better.  
  
**Optional goals** are a powerful tool to pull the player into the game world. These are things which take quite a while to accomplish in full, but have numerous small steps you can take along the way. By choosing to dedicate characters to these goals, the player can set up their own story arc and create numerous opportunities for the other characters to get involved peripherally.  
  
The Sims is full of these. You're always working *towards* something. Whether it's ranking up your day job, improving your skills, or raising your kid, there's always a task you've chosen to do and it's working towards a long-term goal you've chosen to aim for.  
  
Optional goals are incredibly important for distinguishing randomized characters, because they give the characters a Want. When a character wants something, they come alive. In a randomly-generated team, every character having a Want would get confusing and muddled, which is why I think it's best to allow the player to assign these wants by aiming for specific end goals. Even if the character doesn't understand that they are aiming for a specific end goal, they will continue to perform the step-by-step actions towards that goal at the player's command, and therefore act as if they do understand and are aiming for the end goal.  
  
**Relationships** are also valuable, but, again, they should be used to help the player differentiate the characters. Rather than randomly forming relationships, it is generally better to allow the player to choose which characters get along in which ways, because the player is forming a personal memory of these characters and relating them on purpose.  
  
Not all relationships are simple vanilla romances. Ideally, a flexible relationship engine will allow the player to create the range of complex human relationships. The game doesn't have to understand exactly what a "rival" is or exactly how a "love triangle" works, but it should allow the player to drive these defined relationships around while creating a pretty reliable framework to hang them on.  
  
A fun option is to create optional complications in exchange for some kind of bonus. Rather than forcing person A to fall in love with person B, you can give the player the option of allowing it in exchange for a level boost to those characters. Let the player choose whether to let that interfere with their carefully-laid plans or not.  
  
**Attention Retention** is a trick used to keep characters in the player's memory. Once you have more than about four characters, some of them will necessarily become background characters. To prevent them from fading out of the player's mind and become cogs in the game's machinery, you need to draw the player's attention back to them once in a while.  
  
There are a lot of ways to do this, but my favorite is to add a "token" to each player every time period. When a player activates a character for some kind of social interaction, the tokens can be used to level up. Therefore, background characters will sometimes jump into the foreground and level up dramatically, which is a fun way to do it.  
  
...  
  
Now. Let's talk about the first and most important way to make generated characters interesting: personality proxies and lifestyles.  
  
This needs special attention for a lot of reasons, but let's start with the basics.  
  
When we build a character in a game with defined characters, we design the characters to reflect their personalities. Every aspect of their appearance, voice, mannerisms, fashion, animations, possessions, and even room decorations reflect their personality.  
  
However, random characters do not usually have that setup. That's because if you try it, you'll end up with incredibly offensive and limited stereotypes. Instead, most devs use personality traits that aren't related to your physical appearance or fashion choices. It's less limited, but it's also much harder to distinguish your characters. Moreover, the "colorblind" approach is not a whole lot better, as it assumes the universal culture is your own.  
  
The thing to consider is that most games with defined characters have those characters resonate with their life situation. That is, they are who they are because of their own culture. For example, Tali is a really bad stereotype, but she constantly interacts with and resonates with her situation. You are asked to understand why she is who she is, rather than just treating her as a given. Even the blue bisexuals that want to bang you have a lot of culture and society and general baggage that tries to make them more interesting than their stereotype.  
  
Most of the time, rather than having each species stand in for a kind of human, we've started to have each species stand in for a kind of lifestyle or situation. It would have been easy to make the Krogan a literal stand-in for native Americans, and the Qunari as stand-ins for Russians. Instead, they went the other way and carefully made them not stand-ins. Mostly.  
  
It's not a flawless approach, but it's generally pretty good. The idea is to create artificial situations, artificial cultures and societies. Each one represents some core concern in your universe's fiction.  
  
An easy example is Dragon Age, which chose to make its elves a destitute amalgam of every oppressed minority they could think up. The elves don't represent a specific human culture, but they do resonate with the idea of oppression. Dragon Age has a lot to say about oppression and the nature of power, so having a tentpole species represent one corner of that idea was a pretty good idea. We can argue about how it fell short, but it is fundamentally a pretty good idea.  
  
Rimworld doesn't have any deep fiction to it, but the game mechanics suggest specific human concerns. People within a few hundred miles of each other can have radically different technologies and resource levels, meaning that disparity is tremendous. You have the technology to build a fully self-sufficient base in just a few months, except for the waves of attackers that come to steal your things. So disparity is tremendous and violence is common. Life is cheap, technology is cheap, everything is cheap.  
  
It would be relatively easy to come up with cultures that anchor these concepts. Your crew could easily come from those cultures, which would allow them to have a lot of baseline opinions and an easy-to-understand personality. Moreover, you could have each culture be visually distinct.  
  
Not as in "these guys are brown, those guys are pink". Differentiation should be chosen more carefully. If everyone is human, differentiate mostly on things any human could choose to do: fashion, accent, behavior, tattoos, hair dye/cut, equipment, room clutter, etc. The idea is to give the player strong audiovisual clues as to the situation and personality of the characters without implying anything horrible on accident.  
  
Rimworld would have a particularly difficult time of it, though, because the characters are so tiny and indistinct. I would probably add larger portraits to help with that, but another option is to allow the characters to alter their surroundings. For example, a character might have a dominant color scheme, and everything they own (including the things they wear) is automatically recolored to it. They might leave specific kinds of clutter in the places they hang out. They could even have flavored footsteps - different timbre to represent how they move. There are a lot of ways to make the characters more distinct, and you should try them all.  
  
Of course, not all of them should be about distinguishing which fake culture the person is from. A lot of them should be related to that person's personality, instead.  
  
Now, about lifestyles.  
  
Lifestyles are an extension of this idea, but are active. They are habits, inhibitions, and judgments. These allow a character to interact with other characters and with the operation of the group in general.  
  
Personality proxies as discussed above are largely passive, and are intended mostly to help players remember who is who. But lifestyles push. This is when the characters start to come alive a bit: by interacting with things and people in specific ways, you can get a resonance.  
  
Someone's personality is largely defined by how it resonates with their situation. A lot of that will happen in the player's head or in the lore of the universe - "people from faction A have been oppressed for centuries by-" done, we know the basis for their behavior. But sometimes we want to see that resonance come into existence in the game world proper.  
  
This is extra powerful in a base-building game, because you can arrange the base to cause different kinds of situations depending on the lifestyles of the people within it. If someone insists on always wearing the best finery, a dusty, overheated base will be a nightmare for them.  
  
The critical thing about lifestyles to remember is that it is for the player's benefit, not the characters'. Every lifestyle exists to resonate with something else the player controls, whether it's another character or the base itself. Because of that, lifestyles should only resonate with what the character can control, and they should resonate on-camera.  
  
For example, in Rimworld there is a trait that makes a character annoying, and anyone that talks with them gets annoyed. However, there is really no way for the player to control who socializes with who, so it takes a lot of effort to mitigate that lifestyle. If there were more tools for controlling socialization, it would be a more interesting trait.  
  
Ideally, each lifestyle should interact with something the player can control. The more nuanced and constructive that control is, the better. A dusty, hot base can be mitigated with air conditioning, filters, and a dedicated janitor, so it's a pretty good trait... if you allow the player to do those things. But each of those things comes with another side effect, and that's the heart of this.  
  
You ask the player to consider the characters, to work the characters into their core concerns. To choose how far to go for each character. It's a promising approach.  
  
Anyway, those are my thoughts.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [12:01 PM](https://projectperko.blogspot.com/2015/07/life-in-game.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6997698115938296663 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6997698115938296663&from=pencil "Edit Post")

Labels: [characters](https://projectperko.blogspot.com/search/label/characters) , [game design](https://projectperko.blogspot.com/search/label/game%20design) , [generative](https://projectperko.blogspot.com/search/label/generative)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6997698115938296663)

[Newer Post](https://projectperko.blogspot.com/2015/08/generating-episodes-with-outrage.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/07/characterization-in-games.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6997698115938296663/comments/default)
