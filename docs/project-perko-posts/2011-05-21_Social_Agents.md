---
title: "Social Agents"
date: 2011-05-21
url: https://projectperko.blogspot.com/2011/05/social-agents.html
labels:
  - social simulation
---

## Saturday, May 21, 2011 


### Social Agents

Let's talk about NPCs intended to have elements of social play.

This is a difficult thing to do. Most games that include any kind of adaptive social elements do a simple "like rating" that goes up as you play minigames or give gifts. Fable, Oblivion, Mass Effect, Dragon Age, etc etc etc are examples of that. Some are a bit more complex in that they monitor your actions and rate you accordingly instead of simply reacting to your minigame and dialog tree choices - IE, Dragon Age 2's continual random gaining and losing of friendship points.

These are really pretty bad.

There are theories on how to do it better, but they are generally about how to make the NPCs more intelligent. Let's think about it from the other direction.

There are two fundamental kinds of social situations. One is a largely static situation that the player enters. For example, a school, a village, or an empire's court. The other is a fluid situation where the social dynamics emerge over time as the player acts. Primarily, this would be characters joining your party in an RPG.

It's a mistake to think that the same techniques can be used in both situations. They're as different as a first person shooter and pokemon, and it's important to realize that. However, they do have similarities. The biggest similarity is that they both involve socializing with NPCs.

Putting aside how the NPCs react and what the player's options are, there is the important question of why you want to socialize with NPCs.

Probably the most common answer is romantic. Many games allow you to be close to all the various characters, but it's pretty clear that one is your "favorite" and is your romantic interest, with an optional helping of partial nudity as a reward.

This has pretty serious and obvious restrictions.

A second method that is often used concurrently is to get a statistical advantage. Becoming friends with someone gives them bonuses in combat, or gets you special equipment, or whatever. Statistical options are also inherently limited, because they are very much a binary (you don't have it, well now you do, you're done) reward, which is largely incompatible with the idea of continuous social interactions.

A third method is flavor: the more friendly someone is, the more they tell you about their backstory, even to the point of opening up sidequests. This often also involves pseudo-romance or, more cynically, cheesecake.

All of these methods are reward-focused. Let's think about it slightly differently. What do we want the player do? What are the actual actions and progressions?

This is where the two kinds of social systems diverge.

Let's talk about an emergent social situation, such as strangers joining your RPG party. What play does socializing with your party members actually add?

One real problem with this in the past is that the game is always focused on The Hero. All the socialization in question revolves around the hero. The goal is always clear in the player's mind: raise the social scores until whatever bonuses you get are maxed out.

There are a few ways around this one-dimensional play, and they all add depth to a party-based RPG. The two I'll mention here are to change the hero-centric view, and to add conflicting social dimensions.

If your game is a tactical RPG with many characters, you can arrange the socializing to be between two arbitrary characters. The "main" character can be friends with everyone, sure, but he can't stand next to everyone in every combat. It's more efficient for other characters to be friends with other characters, so your combat tactics can use their synergy. Of course, this requires that friendships degrade so that you can't simply max out everyone's friendship with everyone.

You can add conflicting social dimensions by not assuming that "friendship" is the one and only thing that comes out of socialization. You can add a variety of roles. How about a friendly rival? How about a teacher? How about a student? How about a trusted adviser? You can come up with a bunch of roles that are well-suited to creating a depth of party beyond simple "everyone's friends!" Choosing what roles you want to work towards for what characters, and whether that clashes with other roles already settled into, that can make the game interesting. Especially since the statistical and flavor bonuses you get are going to be different.

Notice that we haven't talked about the actual mechanics of how the player socializes. That's because it isn't as important as the framework the play enables. No matter how complicated and nuanced your social simulation is, if the end result is simply a single friendship value and a skimpier pair of pants, it's going to be dull!

...

The other kind of social system is one where it is largely intact in advance. For example, if you are a prince in an emperor's court, the other members of the court already have feelings about each other. Or there is a class in a school, and everyone except the transfer student already has defined their roles in their high-school setting.

In games, this is normally not simulated at all. Instead, it is presumed to be absolutely static except for the quest lines that are specifically scripted. So, ask yourself, how does it improve if we use simulation? What can we enable?

Probably the biggest thing you can enable is freedom: prescripted plot lines are pretty limited from both the players' and the designer's perspectives. However, as you may be aware if you've tried it, players are notoriously good at not acting like people. Player characters have the supernatural ability to completely derail any social environment by a combination of inhuman persistence and knowing exactly what to do.

There are a few ways around that, but let's put off talking about that and get back to the question: what do you get out of it? Freedom sounds nice, but freedom to do what?

This is a really difficult question to just answer, because it depends on the game. What is the point of the game? How can people help each other? How can they hinder each other? You need to answer these questions, or no amount of clever programming will help!

Once you've decided that, however, there is a fundamental "pattern" to the social situation: the node graph of who is connected to who in what ways. In a fundamental way, the pattern is going to be a clustered graph: certain people are going to be much more central and important. While they may not have many more connections to other people, their connections are more dominant.

For example, if Jenny is the super-popular cheerleader, she will have a lot of influence over a lot of people. Her underling Sara may know just as many people, but she will not be as dominant over them: her relationships are more likely to be on even footing. The rank delta will be lower, or inverted, from what Jenny normally uses.

So the pattern of clusters dominated by individuals is easy to imagine, but you need to remember that there are a lot of secondary connections that muck up our nice pretty graph and make it possible for the player to edge in through a "back door".

A clustered graph like this is useful because it naturally creates specific peer groups that the player can get involved in (positively or negatively). This also creates a natural stability to the social pattern that can resist a player's interference somewhat.

Anyway, these are the things I've been thinking recently about social agents.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:01 AM](https://projectperko.blogspot.com/2011/05/social-agents.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/6005171804163459342 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=6005171804163459342&from=pencil "Edit Post")

Labels: [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/6005171804163459342)

[Newer Post](https://projectperko.blogspot.com/2011/06/things-i-dont-have.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2011/05/here-there-be-monsters.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/6005171804163459342/comments/default)
