---
title: "A Soft Touch"
date: 2014-07-21
url: https://projectperko.blogspot.com/2014/07/a-soft-touch.html
labels:
  - game design
  - npc
  - social simulation
---

## Monday, July 21, 2014 


### A Soft Touch

This is how you make adaptive NPCs that are actually fun for the player to interact with long-term.  
  
...  
  
I want NPCs that change based on what the player does. Not on linear character arcs, but in a living, breathing world. And I've created a lot of systems to do that, created a lot of prototypes.  
  
The problem is that the more complex an NPC is, the more opaque everything is. In theory it's fun to have a very nuanced NPC reacting to the player's actions over time, but in practice it's impossible to tell what's going on.  
  
So let's throw out the idea of a personality.  
  
The NPCs have no personality. They have no internal tendency towards one thing or another, behaving one way or another.  
  
Despite that, we're going to have the player absolutely convinced that not only do they have a personality, they have meaningful interactions and grow in meaningful ways.  
  
...  
  
The secret is board games.  
  
While NPCs don't have a personality, they do have a lot of situations they are in. This NPC is ill. This NPC wears mod clothes. This NPC has a kid. Regardless of where they are physically, those sorts of things shape their behavior. This creates their personality.  
  
The key to making all of thing interesting is to accept that we're not modeling a person, we're modeling a piece of the world. We're modeling a complex and slowly evolving situation.  
  
Anna is a parent. However, it's not a check box. It's a mistake to simply tick "is a parent" and then rely on Anna's personality to determine what sort of parent she is. Instead, Anna's parenthood is a board game where she and the kid go in endless loops. Which loop she's on, which loop the kid's on, what the tile says to do today... that's what we mean when we say "Anna is a parent".  
  
Anna wears mod clothes. What we mean by that is that Anna wears the same kinds of clothes in an inertial loop. Each day she wears clothes, she stitches those in as tiles on her board, into the future. She proceeds down a track of her own making, and each tile is a reference to something she's worn before. She'll try to wear something similar, now that she's landed on it.  
  
Anna is ill. In addition to screwing up her stats, the illness has a board game layout full of forks and loops. You can tell exactly what is going on with Anna's illness, because it is proceeding down this layout. Medicine can change the statistical penalties. Medical care can change whether you go left or right at this next fork.  
  
This method of representing someone's personal life is flexible and powerful, but most importantly it is easy to understand.  
  
No matter how many things affect an NPC, if each of them is a game board, the player can clearly see what is happening.  
  
The only problem is that there are a lot of game boards. Not three - dozens. At the very least, every relationship between two people is its own game board.  
  
Now the issue is which game boards matter, when.  
  
...  
  
There are three kinds of "mattering".  
  
One is when an NPC is directly involved with the subject of the game board. For example, if Anna is talking to her kid, Anna's status on parental game board will strongly influence her behavior. When Anna buys more clothes, Anna's track record will strongly influence her choices.  
  
This is very simple, but doesn't really give the characters a personality. Their personality arises from mixing their various concerns together.  
  
The latter two kinds of mattering help to mix these things together, and they serve to create a personality the player can both understand and get interested in.  
  
The second kind of mattering is "resonance".  
  
When you and your target have similar boards, you can compare your positions on those boards. Anna is married to Bob. They are both parents of the same kind. If Anna and Bob are talking, they may talk about their parenting, because they both have a parenting board. They can compare: oh, little Jimmy likes you better than me, oh, I grounded him, oh, I keep telling everyone how great a kid he is...  
  
This can also be used to compare paths between the two positions. "Little Jimmy likes you better..." (calculate path) "Well, you could try helping him on his homework, that might (cause him to go left next time instead of right)". Or (calculate path) "Well, it can't be helped (there is no path from there to here)".  
  
This resonance works fine for all kinds of boards. Compare clothes. Compare illnesses. You can even compare friendships, although there are likely to be so many of that board it should probably be exempt to keep every conversation from being about friendships.  
  
There are a few things that weight when you bring boards up. For example, the further "behind" someone is on their board, the less likely they are to try and compare.  
  
The third kind of mattering is "proximity".  
  
We can't quiiiiite talk about that yet, but soon.  
  
...  
  
Every board can be queried for the categories of actions it recommends. That query takes a lot of arguments, so the board can be pretty adaptive. For example, Anna and Bob are married. The kinds of activities the board will recommend are obviously going to be completely different based on whether Anna is with Bob or with some other guy, and whether Anna is outside at noon or in bed at midnight.  
  
The board is always ready to give its advice, but the NPC is going to ignore that advice much of the time. For example, if you have a kid, the board is probably going to recommend you behave yourself, don't swear, and be a good example for your kid.  
  
If your kid isn't around, you can ignore that.  
  
That's because the NPC only cares about a board based on proximity. So if your kid is at school, you might swear like a sailor and watch TV in your underpants. If your kid is at your side, the board's suggestions are a lot more important all the sudden. And, of course, there's a whole range between.  
  
It's the range inbetween where things get complex and interesting.  
  
First off, there is a percentage of actual concern. The board will tell you how much you personally believe that you should actually be a good example for your kid even when your kid isn't around. That will depend on where you are on the board, rather than on any personality you might have. The parenting board has many loops of different quality, and each loop has its own rating for that.  
  
Between the "actually care" percent and the "actually need to" percent is the "would like to if I can get away with it" percent. That's where the swearing softly lies: as long as your kid isn't affected (can't hear), there's no problem with swearing. Right?  
  
This is a meaty region. The interplay of "actually care" and "need to keep up appearances".  
  
If you actually care, then your personality will be "swear less, behave better" - you'll be a goodie two-shoes. If you care too much, you'll be an annoying nanny figure telling other people to stop swearing. It's the same if you're a kid, of course - behave well in front of your parents... or behave well everywhere?  
  
It's not binary. You want to actually behave like a role model maybe 25% worth, and you need to keep up appearances 75% worth. That doesn't make you 75% sleazy. It makes you 75% "behave appropriately" - behave well in the situations that call for it, and don't let your personal activities screw up your kid. That's pretty good!  
  
Now consider Anna and Bob's marriage.  
  
Obviously, the marriage will tell Anna and Bob to only get romantic with each other. But... how much of that ends up being "I really only want to sleep with my spouse" and how much of that is "I need to keep my spouse from finding out"? It can be hard to tell, and it can evolve over time as their positions on the board of marriage change.  
  
This also gets complex because the "keep it from affecting X" is complicated. Consider this: your kid is very sick, and you're trying to get the doctor to treat him. If the doctor is being reluctant, you may find yourself swearing at him. In theory the parent board says you shouldn't swear in front of your kid (most of the time), but that's overridden, a minor concern next to the massive "protect!" imperative. It's just that your "protect!" imperative doesn't normally have much to say.  
  
Also, consider someone threatening to tell your kid or your spouse something about your behavior. What if your sister says she's going to tell your kid you swear like a sailor? Well, that's a rather minor issue. It'd be better if she didn't, but as tiers of infractions go, swearing is a pretty minor one. On the other hand, if your sister says she'll tell your kid that you killed a cop, that's... a bit more serious.  
  
So there are hooks for playing cover-up.  
  
...  
  
The point of this system is to make it the most interesting experience possible for the player.  
  
Everything is pretty easy to understand. Even if you don't know precisely what an NPC has been up to recently, you can look at their position on the board and see where they must have come from. You can see where they are going, and perhaps persuade them to do something to change how things will evolve.  
  
You can change their situation, and in doing so change how they act and react. The situation can evolve in big ways, sure - a kid could get kidnapped, or a house could burn down - but you can also evolve the situation in small ways. Push someone's token just one step further on one board. Convince them to try to get along with one person for one day. Tiny details that can change the flow of the future - and you can see how.  
  
Moreover, there's room for mods.  
  
Each personality element is a situation represented by a board. Adding more boards is relatively easy - just create a new situation or category of relationship, and the board simply runs. No problems. You want to add in a mentor/pupil relationship? No problem. You want to add in a "werewolf" "illness"? No problem. You want to upgrade the fashion system to a more complex board rather than a pattern of repeating clothing decisions? No problem!  
  
"But how about making the game interesting?"  
  
The key there is to set things up so there is tension. This arises naturally from the way each board calls for specific behaviors and responses that interact with other boards.  
  
For example, Anna and Bob have a kid, and they're all in pretty good relationships. However, times are rough - their job boards are languishing, which means their household board is staggering around, taking the bad loops because the cash requirements aren't being met.  
  
This is already interactive, but the situation is a little bit more interactive because the parental boards demand Anna and Bob protect their kid and serve as good examples. This means they attempt to downplay how difficult a time they have, and keep debt collectors from encountering their kid.  
  
That's already a pretty interesting situation to drop the player into, either as a third party or as one of the three family members. It's adaptive - it's possible for you to improve the situation in various ways, or hammer away at the cracks if you're a vile person.  
  
However, the overall scene is also set.  
  
Little Jimmy has a classmate who is very rich and not very nice - makes fun of Jimmy for having crappy parents. Jimmy, as a child, has a "defend" requirement in his child board, and beats the rich kid up. Drama is born!  
  
But why does the rich kid make fun of Jimmy?  
  
Resonance. The rich kid and Jimmy both have a household board. The rich kid compares them as part of standard operation: "my parents are doing soooo much better than your parents and (path search) your parents will NEVER be as rich as mine!" The scale of the insult is pretty high, and Jimmy's response is also scaled appropriately.  
  
The idea sounds good to me.  
  
As a way of building worlds, it's an easy way to make a compelling world that creates ongoing life stories.  
  
As a way of allowing players to participate in that world, it's crystal clear without being simplistic, and well-chosen small actions can have a long-term effect.  
  
As a way of modding, it's easy to add more options!  
  
Anyone read this far?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:07 AM](https://projectperko.blogspot.com/2014/07/a-soft-touch.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/470521484359641360 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=470521484359641360&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [npc](https://projectperko.blogspot.com/search/label/npc) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### 5 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/07184814011386929524)

[MeachWare Admin](https://www.blogger.com/profile/07184814011386929524) said...

Re: ? I did  
  
Good read, I'm trying to relate it to my space sim game to get the various "systems" (factions) to interact with each other (or not). ... And now I'm thinking of the races in Alpha Centari & Alien Crossfire  
  
Thanks

[5:15 AM](https://projectperko.blogspot.com/2014/07/a-soft-touch.html?showComment=1406031321889#c3005960075114449677 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3005960075114449677 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjURZbTUeIKNWlbodByylpnvz-37QYcobiyDEYrV3myl\_L8OO8suJx2EDy7h\_W64-WrZXWQc-CGlZ8O5lL3 UcLUKy0wjJDjQMJZZsrulgDhV6 Cfs83r421s5\_Sfmi8D8A/s45-c/cropgrow968982\_10200311668297839\_369994603\_n.jpg)](https://www.blogger.com/profile/13554930621825481241)

[Ellipsis](https://www.blogger.com/profile/13554930621825481241) said...

I like this concept, but at this point I'm having trouble visualizing exactly what the boards look like. You describe them as "loops," but that sounds like you eventually end up back at a starting point where your personal history no longer matters. Are they more like 2D or 3D grids that show a character's tendencies relative to this topic? Are they a loop attached to a 2D grid, so that when the loop completes your position on the grid has moved?

[1:50 PM](https://projectperko.blogspot.com/2014/07/a-soft-touch.html?showComment=1406062237195#c6473543222133421193 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6473543222133421193 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

The original essay had 5 pages of me describing the boards, so I left it out.  
  
Many of the boards are unending - things like jobs and households and being a parent don't end except if something catastrophic happens.  
  
So they are loops - concentric loops. You shift in and out as the situation changes. For example, the household board is a bunch of circles with the innermost circle being destitute and the outermost being incredibly wealthy. Every so often, there's a fork that might improve your state or weaken it depending on how much cash you've got.  
  
Your position can return to where it originally was, but only if your situation hasn't changed much.

[2:22 PM](https://projectperko.blogspot.com/2014/07/a-soft-touch.html?showComment=1406064179297#c946724395614823126 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/946724395614823126 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjURZbTUeIKNWlbodByylpnvz-37QYcobiyDEYrV3myl\_L8OO8suJx2EDy7h\_W64-WrZXWQc-CGlZ8O5lL3 UcLUKy0wjJDjQMJZZsrulgDhV6 Cfs83r421s5\_Sfmi8D8A/s45-c/cropgrow968982\_10200311668297839\_369994603\_n.jpg)](https://www.blogger.com/profile/13554930621825481241)

[Ellipsis](https://www.blogger.com/profile/13554930621825481241) said...

Cool, that definitely helps. So you have a position along a loop, a distance from 0 (some kind of progress or investment in that board), a rating for personal concern with that board, and proximity to the board. Does that sum up the variables?

[2:35 PM](https://projectperko.blogspot.com/2014/07/a-soft-touch.html?showComment=1406064922173#c3952331014438275975 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3952331014438275975 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, your position on the game board is not measured as being along a loop, and your "progress" isn't measured as such either.  
  
Instead, every tile on the board has a 'tier' which reflects how 'good' it is. Someone on a better loop or arc would have a much higher 'tier'.  
  
That's just used for comparing similar boards, though. It has no effect on what each tile actually means in terms of forced events or stat changes.

[3:37 PM](https://projectperko.blogspot.com/2014/07/a-soft-touch.html?showComment=1406068651807#c6323958453238534175 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6323958453238534175 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/470521484359641360)

[Newer Post](https://projectperko.blogspot.com/2014/07/star-trek-interiors.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2014/07/species-in-not-star-trek.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/470521484359641360/comments/default)
