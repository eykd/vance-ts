---
title: "Minimum Complexity"
date: 2007-10-19
url: https://projectperko.blogspot.com/2007/10/minimum-complexity.html
labels:
  - social simulation
---

## Friday, October 19, 2007 


### Minimum Complexity

Lots of theory on social simulation...  
  
When trying to make some kind of social algorithm for NPCs, people concentrate very hard on coming up with clever ways of making NPCs adaptive and complex.  
  
These algorithms always outstrip the complexity of the data they analyze.  
  
For example, if you want to make a game where your compatriots will like you better if you help them in combat. That's easy enough: you can measure how helpful any given character is, and you can easily make their AI prefer to help out the characters they like. This could even lead to two NPCs hooking up.  
  
Aside from balance and pacing issues, this kind of simple algorithm rarely satisfies a designer. At a minimum, characters need a stock of dialog to tell the player who they like and why. "Hang on, Bob, I'm coming!", "Thanks, Anne!", "Somebody help me!"  
  
This generally keeps expanding in the designer's mind to include details or history. "Help! I'm surrounded!", "Watch out! Orcs!", "Remember when you rescued me from the orcs?"  
  
That's just expressions. The AI itself can also be enhanced to use indirect methods: "John, help Suzy!", "Dave, grab the rope!", "Orcs killed James, so I'm gonna kill every orc on the planet!"  
  
As you can see, it's easy to design up from a simple basis. Liking people who help you turns into helping people you like turns into remembering specific events turns into disliking entities that harm you (or those you like) turns into directing people that like you to helping people you like... this kind of "and then we can use THAT to do THIS" thinking is pretty easy.  
  
But the complexity rises very fast. It's no longer simply who helps you. At each step you need to add a new data source. If you want to help people yourself, you'll need to be able to scan the battlefield to determine who is in danger. If you want to keep memories, you'll need to have a memory system you can scan for applicability. If you want to dislike entities, you'll need to weight combat preferences by more than statistics. If you want to direct people, you'll need to be able to have an order system AND determine whether someone is likely to listen to you...  
  
That leaves aside all the scripting you'll have to do in order to make their communications clear. After all, this stuff has to happen out where the player can see it. This leads to eight hundred variants on the phrase "Dave, go help John" and "Help, I'm being killed by orcs!"  
  
This is a pretty simple example, as it limits itself entirely to the battlefield. If you add more play modes, your complexity is going to skyrocket. For example, what about an equipment and planning stage? What about a general chat play mode? All of these things will intertwine to create staggering complexity with hundreds of "data sources" and millions of lines of dialog.  
  
...  
  
The first step is to cut out the dialog. Dialog is the single most onerous duty in creating NPCs. If you have to write dialog for every element of their thought process, you'll soon find yourself wishing someone would just rip your fingers off so you wouldn't have to type anymore.  
  
Dialog can be replaced with other cues, most commonly pseudo-dialog consisting of "thought bubbles" and gibber. There are alternatives such as explicit body language, broken English, and a complex meta-language. I'm sure there are others.  
  
Once the dialog is generative rather than scripted, you can simply add meta-language cues for every kind of thing. This symbol or gesture means "help", that one means "orc", that one means "Dave", etc.  
  
This means you lose a lot of the uniqueness of the characters, though. When characters express themselves through dialog, they can say the same thing in unique ways and with unique voices. When they express themselves through symbols and body language, the uniqueness is limited if it exists at all.  
  
Which means your characters need to actually BE unique instead of just SOUNDING unique.  
  
Here's the problem: chances are extremely good that your system has a dominant or unavoidable strategy. For example, helping someone is the dominant strategy. So while you can make characters that act different by being less quick to help, those characters will not be much liked by the player, since they are flatly less effective.  
  
If you're clever, you can either manipulate this so that it is balanced or you can balance each character by giving them other advantages, such as better combat stats. I prefer the first choice. For example, people who are less likely to help people grow attached more quickly. So instead of just helping people in general, they will stiffly defend their best friends.  
  
The problem with this is that they are still not very unique. A player can quickly recognize the "stats" behind any given set of actions. "Oh, he's a friendly-5, generous-3 character..." That's not good. A character needs to have a deeply unique nature rather than simply being unique because nobody has exactly the same stats.  
  
In order to make characters more unique, you have to incorporate "focal points". These aren't statistics, but pieces of content. For example, Anne might have a phobia of the dark. This isn't a statistic: it makes Anne different from every other character because she reacts to dark places differently. Of course, she's only unique on battlefields where there is dark. Similarly, someone who hates orcs with a passion is only unique on a battlefield where there are orcs.  
  
So you have to choose the focal points carefully: if it's a phobia, it needs to be something that exists on basically every level, and many levels have lots of. If it's an obsession, it needs to be something that exists on most levels, but never is so plentiful that the obsession doesn't usefully steer the character.  
  
Instead of changing the behavior of the character, you can give the character very unique abilities that change how they interact with the world. If you do this, then they may grow to be unique if the rest of your system hinges on how they interact with the world.  
  
...  
  
Blah.  
  
Can you think of anything I'm forgetting?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:51 AM](https://projectperko.blogspot.com/2007/10/minimum-complexity.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8846997691140949344 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8846997691140949344&from=pencil "Edit Post")

Labels: [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8846997691140949344)

[Newer Post](https://projectperko.blogspot.com/2007/10/scripting-vs-generative-content.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2007/10/portal.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8846997691140949344/comments/default)
