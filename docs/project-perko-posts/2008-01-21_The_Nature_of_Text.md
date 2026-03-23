---
title: "The Nature of Text"
date: 2008-01-21
url: https://projectperko.blogspot.com/2008/01/nature-of-text.html
labels:
  - text
  - theory
---

## Monday, January 21, 2008 


### The Nature of Text

I've been thinking about text. Text instead of graphics, text supporting graphics, text from characters... you know, text.  
  
The problem with generating text has never been getting the point across. It's not at all hard to make a situation generate text.  
  
I remember that I briefly played a weird little mail-based text game where my fantasy character would do all sorts of things and I would send back a little sheet marked up with what I would do next week.  
  
The game would print up a long, rambling, but marginally entertaining account of what I did (sort of like this blog, I guess). The fights would be things like "Throkdar swings his mace, but you duck nimbly... you stab Throkdar in the knee and he goes down like a sack of drowned kittens!"  
  
Generating text isn't *really* the issue. It's not hard to generate text: you can just have a bunch of sentence fragments and staple them together like a sack of drowned kittens. The difficulty instead lies with what text to generate.  
  
Communication is always communication, whether it's textual or graphic or audio. Every communique has a purpose. In games, there are three purposes to communicating. Let's go over them.  
  
The first purpose is to communicate a changing gameplay context. Graphically, this is done by different graphics. A green palette swap means this wolf is a were wolf. The fact that the bullet is coming towards you means it's a threat. The fact that you're on a narrow bridge means you can't dodge side to side. This is also done nongraphically. 200/900 HP means you're in danger. That red sixty means you just dealt a fair amount of damage. That you have a sack of drowned kittens equipped in your weapons slot rather than a bow means short range rather than long range.  
  
The second purpose is to communicate a changing non gameplay context. For example, you walk to Newvilletonburgh, and along the path you see..... Verdant farmlands. Blasted wastelands. A river of refugees. Snow.  
  
While these aren't directly linked to gameplay, they are critical for giving the player a sense of place and immersion. Often this is inextricably linked with gameplay changes. That is due to a designer linking them, not to any fundamental link between telling you about snow and making you fight yetis. The designer could just as easily tell you about snow and then program an encounter with Helios, god of the desert sun. It wouldn't make much sense, but there's nothing fundamentally stopping him.  
  
The third and final purpose is to avoid repetition like a sack of drowned kittens.  
  
Repetition is a complicated topic. A lot of really great games use a lot of repetition. Not just old games like Pac-Man, but new games, too. There's a fine line between repetition  and patterned play .  
  
For example, your favorite FPS. Featured an awful lot of running around shooting people. In fact, it didn't feature a whole lot else. But it didn't feel terribly repetitious, did it?  
  
Contrast and compare: Bioshock. Featured a lot of running around and shooting, and actually a fair amount of other things. But it felt extremely  repetitious.  
  
Repetition is what happens when the context  doesn't change. Exactly how sensitive a player is varies: some players probably didn't find Bioshock repetitive. Some players probably felt that getting a +2 to their plumbing rolls changed the game's context. I felt that if they had given me a rocket launcher it wouldn't have changed the game's context.  
  
In many ways, repetition is a function of the game's grain. The deeper the gameplay, the more subtle your communications can get without feeling repetitious. Bioshock's gameplay was about as deep as a high school cheerleader, so it hardly mattered to me that their communications were constantly shouting new things - the new things were not meaningfully different. On the other hand, a game of go is not exactly full of amazing new vistas, being that it consists entirely of putting stones down on a flat board. But the gameplay is very deep, and if you can see that depth, every tiny little stone changes the context completely. (If you can't see that depth, every tiny little stone is an excruciating exercise in repetition. Like a sack full of drowned kayakers.)  
  
Anyhow, those are the three basic things communication in a game has to cover. It's actually more two  things, since repetition is more a rule of how quickly and slowly the two other things need to change.  
  
Now, text  communications. And I don't mean "WEAPON: SPEAR + 2". I mean natural language text.  
  
For most text-centric games, all of the non-gameplay context communications are written up, whereas all the gameplay communications are generated. Example:  
West of House  
You are standing in an open field west of a white house, with a boarded front door.  
There is a small mailbox here.

The layout  is carefully scripted: everywhere you go it's TITLE then SCRIPTED TEXT DESCRIPTION then LIST OF STUFF. The list of stuff is generated automatically, as are many of the responses to what you type.  
  
Some really old text games print the full description of a room every time you enter it, which gets really repetitive. Newer text games have a verbose description that they print when you first enter it and after that they just print the title of the room, perhaps with a short blurb. At any time, you can call up  that long description again, if you've forgotten the context of the room and need a refresher course. If you haven't  forgotten, don't call it up, because it has nothing new to say to you.  
  
Graphical games are largely similar in structure. The graphics themselves are carefully scripted, but their positions and various numerical values are generated. While a full description of an enemy or character would get distracting if you saw it all the time, many games allow you to access some kind of status page for a close-up pic and the full statistical readout.  
  
Fundamentally the same .  
  
Except that graphics, numbers, and slots have a much finer grain  than full-text descriptions. 60 is different from 55, and if you see them pop up above someone's head, you know which you prefer. An enemy five tiles away is preferable to an enemy four tiles away. Equipping a spear + 2 is better than equipping a spear + 1.  
  
Putting these in text won't work. In fact, it would backfire. Anyone remember the old Dragon Warrior? "Thou has gained 2 gold. Thou hast gained 3 XP. Congratulations, thou has persevered and gained a level."  
  
What do they do now? "Gold: 2. XP: 3. LEVEL UP!" (fanfare)  
  
They've chopped all the fat out of the descriptions, because the fat didn't actually communicate  anything. The game state is numeric, and the only communications which are relevant are ones that specify numbers (Gold: 2) or packs of numbers (Fireball spell). Nothing else changes the gameplay context.  
  
You have to remember that the gameplay context is not simply a list of numbers, oh no. It's the topological layout of the situation. In the most obvious sense, where you are in the level as compared to the enemies, powerups, obstacles, and so forth. In less obvious examples, the variety of weapons you've got equipped, the node map of cities you can travel to, the array of equipment available for purchase, the likelyhood of stumbling across more ammo for a particular weapon in this particular area...  
  
So popping up "Gold: 2" is kind of a minimally effective communication. Gold is a very simple gameplay value - a simple scoring mechanism. Far more complex mechanisms are usually at play. "LEVEL UP!" used to be followed by: "+1 str, +1 dex, +3 HP". Now it's followed by a complex list of choices, often displayed graphically so that you can see what lies further down the paths you can choose.  
  
As we've gotten better at displaying graphical information, the topological density  has increased dramatically. But although this is technically graphics , it is not of the sort that is expensive to produce.  
  
The complex level-up system in KotOR, for example. It's all either text or tiny icons that show text when you click them. Which stats improve? Which skills improve? Which feats will you buy? It's an incredibly complicated situation, but all the details are clearly shown without resorting to advanced graphical wizardry.  
  
When we think "text game", we think "Zork". But a linear, one-dimensional stream of data simply cannot represent the level of complexity we're interested in. They're great at non  gameplay context, but poor at gameplay  context. Rogue-likes, with their ascii-maps, reverse the situation: they cut out the ability to represent non-gameplay context easily with text, but don't switch over to actually using graphics to represent non-gamplay... so they're stuck pretty solidly in only representing gameplay context.  
  
...  
  
The question isn't whether text can represent complex states. It certainly can. The question isn't even whether you can generate interesting text for your game rather than writing it. The answer is yes, so long as it's based on content that is actually in your game.  
  
The question is how to represent enough  complexity without turning into a game entirely consisting of menus.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [7:50 AM](https://projectperko.blogspot.com/2008/01/nature-of-text.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2678374028232759559 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2678374028232759559&from=pencil "Edit Post")

Labels: [text](https://projectperko.blogspot.com/search/label/text) , [theory](https://projectperko.blogspot.com/search/label/theory)


#### 2 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

Like Storytron. :P

[12:01 PM](https://projectperko.blogspot.com/2008/01/nature-of-text.html?showComment=1200945660000#c1047932994046456733 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1047932994046456733 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Not unless Storytron's made quite a breakthrough since I last saw it.

[12:11 PM](https://projectperko.blogspot.com/2008/01/nature-of-text.html?showComment=1200946260000#c6011576984564952161 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6011576984564952161 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2678374028232759559)

[Newer Post](https://projectperko.blogspot.com/2008/01/mass-effect.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/01/save-chatbots-part-2.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2678374028232759559/comments/default)
