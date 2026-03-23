---
title: "And Venn There Vas Vone"
date: 2008-06-27
url: https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html
labels:
  - player-generated content
---

## Friday, June 27, 2008 


### And Venn There Vas Vone

If you've been reading for a while, you may remember my analysis of Pandora and other internet radio things. The idea here is they allow you to like or dislike certain songs, and they'll feed you more of what you like. There are many applications for this kind of system: Amazon, MySpace, DeviantART - anything where there are a lot of people and a lot of content.  
  
Pandora - and many others - handle this by clumping things into genres. Then they try to decide what genres you like or dislike, and whether a given song is good or bad within a genre.  
  
That's a rotten way to do it. A) it's got a lot of overhead, B) it assumes all things fall into specific, pre-existing genres.  
  
I spent a lot of time struggling to figure out a way to do it better. To do it using the power of other people's favorites. Today, here is an idea for a solution.  
  
...  
  
Let's say you're playing a MMOG like SecondLife. There's a lot of player content. You have two friends. One is a hardcore combat hog, player-killer extreme. The other is an RP sexaholic. You don't have much interest in either of those things.  
  
They both use a lot of player generated content, but as you might suspect, there's not a ton of overlap. However, you notice that they both have really cool houses full of really cool knick-knacks. A lot of them by the same creators!  
  
In SecondLife, you'd probably make note of the creators, then go and track down their shops or some such. In our game, the game already knows what the players like/have bought. It says, "Oh, you like that lamp? Both of your friends like that lamp. It's a genuine DeathKnight Bloodwine Lamp - here's his catalog. Other things both your friends like are..."  
  
That example is taking something trivial and making it even more trivial, and it is also probably a bit... exposing. Let's take it to another level entirely.  
  
You're playing in a game where players can create content. Not just hats and houses and dildos, but stories and adventures and NPCs and histories.  
  
If you were to wander this universe, you would find a lot of really terrible content. It's the way the world works.  
  
Lets say that, due to some staggeringly bad luck, the first thing you encounter is Harry Potter slash fic. You hurredly vote it down, and it vanishes.  
  
The computer doesn't know that it's slash fic. It's not in a category as fanfiction or even porn (although it may be marked "adult").  
  
Instead, the computer queries for everyone who *liked* it. Everyone who voted it up. And then, it looks at their shared favorites and bans the top most common from your sight. If 30 people liked what you're seeing now, and 16 of them also liked something over the next hill... you probably don't want to see it.  
  
On the other hand, if you voted the slash fic up, it would have done the opposite, and that piece of content would now be flagged for your attention.  
  
That's the basic idea.  
  
So far, it's basically an inverted version of Amazon's method. But let's go a bit further.  
  
...  
  
What if you like fantasy adventures, but there's one you can't stand? You want the game to keep giving you fantasy adventures, just fewer shitty ones. Or fewer ones involving talking mascot characters. You hate mascot characters.  
  
If you just follow the above algorithm, it will actually prefer to ban the GOOD ones, because they have more shared favorites.  
  
If the system tries to ban something you've already favorited, it nullifies the whole thing and moves on to a quality-level analysis, which is something I don't think Amazon does:  
  
Instead of pulling "people who like this thing I hate", you have to pull "people who hate this thing I hate and LIKE my favorites that the first level of analysis tried to ban."  
  
From here you can't just ban shared dislikes, because they'll probably end up being that slash fic, which is no help. Instead, you have to limit your ban-stick specifically to things that were on the list for banning on the first level. Basically, you're still using that original list from the first analysis, you're just keeping the good stuff off the cutting board.  
  
...  
  
Mmmmmmmmmmm...  
  
That's some tasty tasty algorithm, there!  
  
Do you understand it? Obviously, it can be further optimized, but do you get the idea?  
  
This is theoretically better than the current system used by Amazon, because although they use favorites, they sometimes get my awesome sub-genre preferences mixed up with some major genre preferences, and send me ads for crap I wouldn't buy for free. Banning it doesn't do much good...  
  
With this method, it would quickly isolate the people who like my sub-genre but hate the major genre, just like me. It would be able to identify these emergent little sub-genres. For free. Instantly. Automatically.  
  
We can also include an automated weighting schema. If your likes and dislikes tend to be very similar to another person's, and there are no clashes, then he'll be weighted as a more valuable measure of your favorites. If you two are precisely reversed, you'll automatically avoid his likes preferentially.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:31 AM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/1664801194234562525 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=1664801194234562525&from=pencil "Edit Post")

Labels: [player-generated content](https://projectperko.blogspot.com/search/label/player-generated%20content)


#### 8 comments:

[!\[Image\](https://2.bp.blogspot.com/\_WQk0 YgqQA9Q/SaAzb6ng2VI/AAAAAAAAANw/Go874k1XLAc/S45-s35/profile.jpg)](https://www.blogger.com/profile/01646249933207430061)

[Darius Kazemi](https://www.blogger.com/profile/01646249933207430061) said...

Spore will be doing a subset of that for its content recommendation. Basically the "you like this, and you have friends with similar taste, therefore you might like some of the other stuff they like," Amazon-style recs.

[12:22 PM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html?showComment=1214594520000#c1829378682766701740 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1829378682766701740 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yeah, except that's what I'm trying to avoid.  
  
The two advantages of my system are this:  
  
1) It's better at blacklisting stuff. Instead of only trawling for favorites, you can ban stuff intelligently. This means that you'll still get to sample the "neutral" stuff that you will otherwise miss with the hyper-targeted "favorites" system most places use today.  
  
2) It allows me to use subsets of people's interests. For example, I really like some of the music you like. But I hate a lot of it, too. Using a "Darius likes these" favorites system is worse than useless, because more than half of the suggestions will be stuff I don't like at ALL. On the other hand, using my system, it will check for overlaps, cropping away all the stuff you like and I don't.

[12:26 PM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html?showComment=1214594760000#c4664293322285964210 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4664293322285964210 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_WQk0 YgqQA9Q/SaAzb6ng2VI/AAAAAAAAANw/Go874k1XLAc/S45-s35/profile.jpg)](https://www.blogger.com/profile/01646249933207430061)

[Darius Kazemi](https://www.blogger.com/profile/01646249933207430061) said...

Right, although unlike songs, Spore understands way more about the structural content of its creatures/vehicles/buildings etc. So I would assume (and while this would be a huge assumption for any other team, the Spore team is SMART) that there is also some understanding of "oh, well you overlap with your friends in the purple carnivores that are noodle-shaped area, here are some other noodley carnivores that are fushia and magenta that they like."

[12:31 PM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html?showComment=1214595060000#c4267718476100950121 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4267718476100950121 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

That's a good point, Spore is kind of an interesting arena because all the meta-data is fairly easy to interpret. Although even they probably have a hard time with "scary" vs "cute" vs "gangly" vs "realistic" and so forth.  
  
I'm thinking more SecondLife-style, where the options are so complex and interwoven that it's basically impossible to calculate "fundamental attributes" that mean much.

[12:33 PM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html?showComment=1214595180000#c2587854754252087429 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2587854754252087429 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/02886423674873513147)

[John Nesky](https://www.blogger.com/profile/02886423674873513147) said...

For brevity/clarity:  
A = thing you hated  
B = set of people who liked it  
C = set of things that people in B tend to like  
  
As it is, I still see some risk of banning things that you might like. If, indeed, the very first thing you saw was A, and you voted A down and and the computer queries B and finds C and queues C for banning, there's no possibility that C will conflict with things that you already said you liked because you haven't said you liked anything yet. But it's too late, you'll never see things in C now, because they're banned, though it's actually likely that they were pretty good since so many people liked them.  
  
So, two things:  
1) What you REALLY wanted to ban was the union of ( C AND ( things whose average rating among B is significantly higher than the average rating among everyone else ) )  
  
2) It should probably be a sort of "soft" ban, where the system will not show the banned item to you, UNTIL it is determined through a sort of reverse of this system that the people who like the things you like also like the banned item, and then the ban is lifted.

[9:25 PM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html?showComment=1214627100000#c3228688589260226222 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3228688589260226222 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

There is a risk if you're unlucky right at the beginning, but by my thinking, a player whose first encounter is a mediocre example of what he wants to see won't vote it down.  
  
If you join a radio station and the first song it plays is a mediocre song that sounds in the right genre, you're not going to give it the thumb's down: at worst, you'll let it ride.  
  
While the ban is a soft ban, the math makes it pretty much irrelevant. There's a lot of content, and you're only banning the most congruent - the most "popular" - so you'll run into some other examples one or two more times, and as soon as you favorite them (or fail to ban them), the system readjusts...

[6:39 AM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html?showComment=1214660340000#c8234431020449810481 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8234431020449810481 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01867491782144075781)

[DmL](https://www.blogger.com/profile/01867491782144075781) said...

The problem I have with Pandora and Amazon's requests is that I already know about everything they know about and/or think they should recommend to me, if it's not something I already don't like.  
  
This seems like it might help that a bit, but the "new" stuff in a system by default won't have alot of thumbs-ups in the system, so going by popularity doesn't seem useful to me as a very prolific and active player in a system (in amazon, I've already read or seen all their "popular" movies and books, in Pandora the bands I like aren't popular or genre-defined really, so it gives me off-the-wall tangentially related crap - that I already know about).  
  
Your system would work well for a new player in the well defined ecosystem, but I guess that doesn't seem useful to me in most instances... I'd rather see a system for prolific players in the less-well-defined ecosystem.  
  
Which seems to expose another flaw... your system doesn't protect you at all from brand new crap... which is 99% of SecondLife, for instance.

[5:21 PM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html?showComment=1214698860000#c17277108060399639 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/17277108060399639 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It's easy enough to set a threshold. A new player would start with the classics, things that got a high rating.  
  
An older player would probably get hit with a lot of untested content - unless he doesn't go looking, of course. However, I don't see as how that's a downside. If you don't want to see hordes of generic crap, set your threshold to, say, fifteen positive votes required before you can even see it.

[5:37 PM](https://projectperko.blogspot.com/2008/06/and-venn-there-vas-vone.html?showComment=1214699820000#c6913125868620317947 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6913125868620317947 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/1664801194234562525)

[Newer Post](https://projectperko.blogspot.com/2008/06/layer-cake-shadowrun-introduction.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2008/06/tension-pool-mechanics.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/1664801194234562525/comments/default)
