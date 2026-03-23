---
title: "Interstellar Archaeology"
date: 2014-04-17
url: https://projectperko.blogspot.com/2014/04/interstellar-archaeology.html
labels:
  - game design
  - generative
---

## Thursday, April 17, 2014 


### Interstellar Archaeology

My friend ran a KickStarter about space and time being insanely vast. Most scifi compresses both space and time, but he wanted to show it in the proper scale. Me too! It inspired me, and I spent a lot of time thinking about it. And I decided that my contribution to this theme would be interstellar archaeology.  
  
No matter how many millions of years your society has, it's just a tiny blip. You will never meet another living alien species. Even if you live for a million years on a million suns, you won't meet them. Space is too big, time is too vast.  
  
But you can meet them. As long as you don't mind them being dead.  
  
So this is a game about archaeology, about discovering ancient, lapsed civilizations and digitally recreating them to live anew in a huge simulation. You aren't part of a civilization yourself: humans have "ascended" and you're just kicking around exploring the galaxy for a few million more years until you get bored of it. And you've decided to search the universe for dead civilizations and bring them back to life in your personal computer, manage your own universe that is chock full of alien species and civilizations. Maybe trade info with other ex-humans that are still kicking around.  
  
The mechanics of finding and studying ruins is not what I want to talk about. Instead, I want to talk about how to seed them. An algorithm for creating dead civilizations.  
  
Now, one way to do this is to simulate the civilization and come up with a big stack of places they went and things they did. However, this has the serious downside of being dull as paste. We would like the players to actually be interested in what happened, and that means humanizing it. Here's what I've come up with:  
  
If you search a given place for archaeological clues, you have a chance of finding a random clue from a random time period. Say, you discover a 100,000 year old derelict space ship caught in orbit around a moon.  
  
There are two keys to what this ship "means", archaeologically speaking.  
  
The first key is that the ship uses "compatible" clues. So if you are aware of a colony on a nearby planet from 2 million years ago, perhaps the ship is related to that. If you are aware of a colony from 110,000 years ago 20 light years away, maybe the ship is related to that. But the timing involved is important: if the ship is related to the 2 million year old colony, it certainly couldn't have come from it. Instead, it must have been searching for it, well aware of its age and likely demise.  
  
That brings us to the second key: the archaeological find is not categorized by where it is from or what it belongs to, but instead by mission. This gives players a strong hook to get interested. Usually, where they are from will arise pretty obviously from their mission. Moreover, as the mission emerges, archaeological seeds are laid for the player to discover elsewhere.  
  
For example, there is a million-year-old colony nearby. Is the ship involved with it somehow? There is a 110,000-year-old colony 200 light years away. Is the ship involved with that somehow?  
  
We don't simply determine where the ship is "from" or who built it. No, we care about the mission. Is the ship related to the million-year-old colony? If so, what was its mission? To reach the colony, almost certainly. Why would they have wanted to reach the colony?  
  
Well, not to put too fine a point on it, but we don't know why. The player doesn't know either. All they know is that the ship had that colony in the last surviving star chart.  
  
There's not a whole lot of research the player can do aboard the derelict, because it is truly ancient and basically just a jumble of floating rust particles. All the player can really do to follow the lead is to head for that colony. At least until some new information tells them what to look for in this ship.  
  
Maybe this player doesn't even know there is a colony there, just this star chart. Either way, when she searches for events ~100,000 years ago, she finds an archaeological event that was seeded by the discovery of the ship. What is it, exactly? Well, like the original discovery of the ship, it's largely random. She discovers that (rolls dice) a seed vault was stolen.  
  
A seed vault from an ancient civilization was stolen?  
  
There's a lot of ways she can go from this. One is to read into the million-year-old colony more, since she's obviously going to discover it exists given that its seed vault was stolen. However, she can also keep concentrating on the seed vault.  
  
It automatically works its way into the mission parameters of the ship that stole it. They were going to the ancient colony... for seeds... and they got them. What? Why?  
  
We need to come up with a driving response, so the algorithm looks up all possible explanations in the dictionary and decides there was a genetic plague on the 110,000-year-old colony, and they needed 'pure' ancient DNA samples to fight it. This, in turn, plants several more archaeological seeds. One on the 110,000-year-old colony - evidence of genetic collapse. One on the ship: evidence of the seed vault.  
  
These missions can keep expanding, but a key point is that this isn't a one-player game. This player isn't the only one working with this set of facts.  
  
Another player lands on the 110,000-year-old colony and searches for clues related to it. Since he's in the right place and searching in the right era, he discovers evidence of the genetic plague. He doesn't know quite what it is, though: a massive ecological collapse off some kind. The chain itself knows that a ship was launched with a specific mission because of this catastrophe, so it spawns an event for the new player to discover: the construction of a fleet of ships to try and find pure DNA. This seed of a space exodus is planted with the discovery of the ecological collapse: it generates only when needed.  
  
The new player can discover this event by continuing to search in the right place and time. Rather than discovering the location of the originally-discovered ship, this player instead finds star charts pointing to dozens of planets. Each of these planets is then allocated a "phantom" of the originally-discovered quest line. If the player goes to search one of those locations, it will randomly determine which elements to clone from the original quest line. It might have a million-year-old colony. It might have an event 100,000 years ago where someone stole seed banks (or attempted to, if there was no colony spawned). It might have a ship lying derelict nearby.  
  
Even if the original player gets sidetracked and never finished fleshing out what happened to the originally discovered ship, their progress lives on in the phantom missions descended from that work. And, as people stumble into pieces of the missions, they will usually be able to track the missions back to the homeworld. Many people will become familiar with the way that colony was destroyed by the plague, and their desperate final missions to save themselves. As they explore that time and space, they will discover more and more details about who these people were, what they were like, and what happened afterwards and before. These facts will be easier and easier for subsequent players to discover and, in turn, creating digital recreations of these people and this colony becomes easier and easier.  
  
So the basic progression is like this:  
  
1) Discover something. It will relate to existing discoveries via a mission template, and will create new clues to partially fill in that template.  
  
2) Discover clues spawned as part of a mission template. This will spawn more clues filling out the mission template or spawn pre- and post-mission events. The more interesting/sensical clues will be discovered first, creating a sort of filter to weed out the worst randomness.  
  
3) Research pre- and post-mission events to create echoes of the partially-filled-out mission template. This will allow for events/civilizations to become big and spread between players.  
  
4) Connect clues/events to clues/events from other chains that happened in the same place and time. This will allow civilizations to become dense and have coherent culture/items/event chains.  
  
In the end, the civilization is not formed by a series of algorithms determining how they expanded and what tech they had. Instead, it is determined by a random events being connected and amplified. The hard part is creating the unique content elements such as alien race design, ship appearance, and so on. The second most hard part is writing up a set of adaptive mission templates.  
  
Anyway, that's my idea.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:01 AM](https://projectperko.blogspot.com/2014/04/interstellar-archaeology.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5070701346089055030 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5070701346089055030&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [generative](https://projectperko.blogspot.com/search/label/generative)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5070701346089055030)

[Newer Post](https://projectperko.blogspot.com/2014/04/violence-in-sci-fi-construction-games.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/04/backstories-are-not-characterization.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5070701346089055030/comments/default)
