---
title: "Episodic Overlap!"
date: 2006-04-26
url: https://projectperko.blogspot.com/2006/04/episodic-overlap.html
labels:
  []
---

## Wednesday, April 26, 2006 


### Episodic Overlap!

Me, I think that a major new game style is going to be *episodic* games. But I also think that virtually every game a decade from now is going to be built around *player-generated content*. Frankly, the two don't mix too terribly well.  
  
(Edit: by which I mean, having one shared world in which episodes are written by different authors using different characters. Think of the Star Trek universe. And that had lots of editors!)  
  
But it gave me an idea.  
  
What about an episodic game where there are a dozen - or two dozen, or ten dozen - writers? They write episodes, you download and play them. But they are in a shared universe. Could you make the universe stable without a giant overlord editor putting the smackdown on authors?  
  
Well, say you let players download whichever episodes they want. If they think Arnold is a bad writer and Boba is a good one, they can download all of Boba's stuff and none of Arnold's.  
  
But what happens when Carrie makes an episode which uses content from Arnold? You download that and - wait a second! What's with this integral character you've never heard of before? Wait, Arnold's episodes are all high-power and your character is low-power!  
  
Ah-ha! Ah haha*ha*! I have a solution! And here you didn't even realize there was a problem!  
  
If you remember, a few posts ago I wrote a little essay on a possible metalanguage called Perkplot (or Plerkot, or Plotz, or whichever, I don't really care). This system represents the game's relations to other parts of the game, allowing it to judge how difficult it will be for players to get from one portion of the game to another. Then, it can modify the relationships to make it easier or harder on the fly.  
  
What if we apply this to that! Or that to this!  
  
What we end up with is *episode maps* . Think of them as a kind of outline. Each part of the outline is linked with some writing. Played alone, the map is traversed with ease like a regular game. However, it establishes a *metamap* containing what boils down to "the current state of the game". For example, an episode ends with Diedre in love with Egon. Until something changes that, Diedre and Egon will be in love in *all future episodes*, rather than having a scene written by another author in which they are neutral.  
  
In addition, the episode provides *element maps* . Element maps are little fragments of map that can be used *in other episodes* to bridge connections that rely on something that doesn't exist in this player's particular metamap.  
  
For example, if an episode has a villain, Frogenheimer. The way it's written, this villain's defeat is led up to by Egon and Diedre's *hatred* of each other. Obviously, having already played the Egon/Diedre love episode, that would be a rather shocking change.  
  
So, the engine goes and looks for a way to make it work. What it does is it tries to fit an element map into the episode map to route *around* that node. Exactly how this works depends on the episode map, and I'll explain that in a bit.  
  
If the engine has no suitable element map *or* if the number of patches required is higher than the player's "patch" threshold, the engine uses a different element map to change the metamap to match what the episode needs. IE, it plays through an element map which makes Egon and Diedre hate each other. (The player may have to actually track that down, a kind of sidequest in the game.)  
  
In addition, an episode can include element maps *to patch itself* if there are other, popular episodes you want to take into account.  
  
What this ends up meaning is that if you want Diedre and Egon to be in love throughout all episodes, you write element maps to route around every conceivable situation which might include them not being in love any more. However, volume does not always outweigh quality, and certain authors can be considered to have dramatically more "weight", leading to their episodes ignoring your element maps.  
  
What does this mean?  
  
Aside from meaning that poor Egon and Diedre are likely to have a tempestuous relationship, it means that you can have episodic games with dozens - or hundreds, or thousands - of *unedited* writers. A player can download from whoever, play it, keep it in his universe or uninstall it, change their opinion of the author...  
  
It comes at a price. This isn't simply scripting. It's one level higher. There would need to be a tool kit to help.  
  
The amount of stuff you would need to produce in an episode would be higher, but the amount of exactitude required would be lower. You don't have to do stats, for example, simply relative power levels. Of course, you would have to have several axes of power, and understand the RPS of the game - it would have to be carefully designed.  
  
The episodes would functionally need to be written twice. Once for humans, once for computers. Transitions from one constraint to another would require you to mention the method of the constraint change. For example, our heroes teleport across the world to a far off land. If your player's world doesn't have that power level, the engine needs to know it can replace "teleport" with "boat" and shorten the distance considerably.  
  
There could also be "stealth" episodes - episodes which inject themselves into the slack created by other episodes. If they are boating across the sea, a stealth episode could happen at that time which has little to do with the primary plot.  
  
The system would be complex, but with the right tool, it could be managed. Combining the map-routing system I just explained and the difficulty-monitoring system I explained in the original Perkplot post, your episode would fit itself into the world delightfully, neither too easy or too hard, and not breaking much...  
  
There's so much you could do. If you're playing an episode by a weaker writer, you could have it more likely to be patched with an element map from a stronger writer than if you were playing a stronger writer's episode and considering a weaker writer's element map.  
  
People could post their versions of what happened, and the episodes they used to "seed" the situation.  
  
If you don't want to play the episode, you can just have the system take the episode map into account without actually running through it.  
  
You could have different paths through any given episode, resulting in a different metamap of how the universe is. You could save *different paths* through *all the episodes as a whole*. The "Egon/Diedre love path" vs the "Egon/Diedre hate path", for example. Save them as pieces, so you can add in one of those two paths to any other set of paths...  
  
You could play an episode *in the past* , forcing the engine to recalculate the metamap leaving out episodes past a certain date. Or you could run an old episode as a *current* episode. Imagine watching an episode from Buffy or something, where the episode plot and dynamic is the same, but the episode *airs in the wrong season entirely*! Totally different power levels and character dynamics.  
  
Of course, the engine would be... yow.  
  
Maybe the engine could also be open sourced... hm...........  
  
....  
  
Anyhow, comments appreciated.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:36 AM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114607195071493079 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114607195071493079&from=pencil "Edit Post")


#### 8 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/13280914228859902589)

[Duncan M](https://www.blogger.com/profile/13280914228859902589) said...

Wait... Episodic content and Player Generated content don't mix well? How do you figure?  
  
Most extensive player generated plot-based content is released in episode-sized bites to the comminuty. Look at Neverwinter Nights (as the prime example). There are several player generated story-worlds that have been released an episode at a time. Even the persistent worlds (a player devised extension of the game engine) are frequently updated with new content.  
  
Rarely is user generated content designed all at once, unless it is designed small.

[2:46 PM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html?showComment=1146087960000#c114608797476099892 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114608797476099892 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Duncan: I mean that sharing *one world* between an unlimited number of people doesn't normally work.  
  
I should have made clear: I mean *intertwined* episodes. All in the same universe and with the capability to reference each other.

[8:06 PM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html?showComment=1146107160000#c114610717158534863 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114610717158534863 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Egads. You don't like trying to solve the easy problems, do you? I don't think it would work, for two reasons:  
First, you would need to choose either taking on all the work yourself (a parser that takes in dialogue and spits out relationship charts), or leave it on the heads of the developers (they're responsible for said relationship charts). Either way, you lose. The parser would need to handle everything, and we don't have the tools for anything approaching that today. And the task of making those charts for every possible permutation is too onerous for any reasonably sized episodic content. It's lose-lose, and unless you figure out a way around this trap, I can't see it working.  
  
The second reason is that episodic content of this type is almost never generated like you're talking about. There's fiction, written serially by one author. There's fiction written serially by numerous authors (Star Trek is a good example). There's fan fiction and group ficion that's written in parallel by numerous authors - and that's as close as you're going to get to what you're talking about. And when you get the fan fiction or group fiction (player generated content, for all intents and purposes), you're not expecting the original author's episodic content to adhere to the fanfiction author's additions. You WANT to get the material in the method that the original author intended, not filtered through N different people's perceptions of how things should have gone. Too many chefs spoil the broth, as the saying goes.  
  
Not saying that it's impossible to get it to work in the end, but it would be tough, and it wouldn't be better than what we have now.

[7:30 AM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html?showComment=1146148200000#c114614822565386243 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114614822565386243 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/13280914228859902589)

[Duncan M](https://www.blogger.com/profile/13280914228859902589) said...

I agree with kestrel404, you are trying to set up a way to solve and integrate all fan-fiction. Inherently, there are things that are cannon (as dictated by official sanction and release) and things that are just not. By allowing everyone to create in the same (small?) universe you force some weird overlaps that will not always work out.  
  
In existing types of fiction that mirror what you'd like to create (such as Star Trek, Star Wars, Forgotten Realms), each author typically creates their own stories within the existing cannon of the world. And each story concept has to be vetted by editors so that inconsistencies don't arise within the world. Fan-fic builds on this, but does it unedited, and therefore has a lot more material that would otherwise be non-permissible. looking a the whole universe without filters would not be possible, or even desirable. Mixing and matching is possible, but only because we can selectively edit what we don't like, in our heads, as we go.  
  
A better idea would be to establish a world in which multiple concurrent and independent stories and characters can evolve. The author becomes responsible for the characters that they create, and the stories that they build. If they overlap, so what? This is what we see in player created NWN content. It all exists within a Forgotten Realms world. It can reference as much or as little cannon as the author wants, but anything is technically permissible. Each is an independent story, within a larger world.  
  
The only way to port a character completely from one author to another would be to script their entire personality, so that someone else can use it without altering it beyond the initial (or subsequent) requirements. How frustrating would it be to create a character only to have someone else devalue it by creating a bad story with it? I create a character, but someone else kills him before I can use him in my meta-plot. Frustrating.

[8:20 AM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html?showComment=1146151200000#c114615123142070901 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114615123142070901 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It is, as you say, an absurd problem. But just because that is the way it is today doesn't mean that is the way it has to be tomorrow.  
  
I can almost see the engine in my head, the math is almost there. A powerful way of organizing and creating data. Clicking and dragging. Highlighting data you know is going to be a problem. Creating your "official line", including episodes you and your favorites have created.  
  
Even if it doesn't improve the game industry (and I think it will), it has applications in other industries.  
  
Corvus, I look forward to your post. In all honesty, I've been sort of ignoring your Honeycomb posts, because they have a lot of trivia about the game you're developing in them. So, I'm a blank slate. :)

[8:37 AM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html?showComment=1146152220000#c114615224835319831 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114615224835319831 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I've given a thought to my second issue, the one about how content is generated, and I'd like to revise it. I recall two instances of what you're talking about that I've found. Neither are very good works, but they exist, and they have potential.  
  
The first is [the Drunkard's Walk fanfiction squared](http://www.eclipse.net/~rms/dw-fics.html), which is fanfiction of fanfiction. None of it is exceptional, but it's inter-related in roughly the same manner as what you're talking about.  
  
The other is [Stefan Gagne's Unreal Estate Open House](http://www.pixelscapes.com/unrealestate/), which is an open, episodic, n-author writing project that vaguely resembles fanfiction, but the source material is Stefan Gagne's original fiction. This might warrant your attention, Craig, as the system/meta-language they use for control over plotlines and characters is interesting (if somewhat trivial).  
  
I don't considder Eyrie Productions an example of what you're talking about, because Gryphon exercises pretty much complete editorial control.  
  
So, there are examples of this in the wild. Perhaps there will be a success story here, but I'm not keeping my hopes up.

[8:58 AM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html?showComment=1146153480000#c114615348196763059 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114615348196763059 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I'll look into it. The more data, the better, I always say.  
  
Really, always. You can't get a word in edgewise over my "The More Data, the Better"ing.

[9:33 AM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html?showComment=1146155580000#c114615562090492979 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114615562090492979 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

My approach is kind of the inverse, and much simpler. Since the main play loop involves making decisions that affect the story, each narrative experience produced by the players withing the constriants of each episode becomes the player generated content, and gaining insight into the workings of the storyworld at large will evoke people to share their experiences and try to get at that common something, the metaplot.  
  
I think your approach could definetetly be interesting, but maybe it'd be better to streamline into the gameplay with a massively multiplayer space which focuses on collaborative play, which is, in a sense, what I understand Corvus is up to.

[11:18 PM](https://projectperko.blogspot.com/2006/04/episodic-overlap.html?showComment=1146205080000#c114620511183375791 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114620511183375791 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114607195071493079)

[Newer Post](https://projectperko.blogspot.com/2006/04/palladium.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/04/video-villain.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114607195071493079/comments/default)
