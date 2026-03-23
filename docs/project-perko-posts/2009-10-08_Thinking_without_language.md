---
title: "Thinking without language"
date: 2009-10-08
url: https://projectperko.blogspot.com/2009/10/thinking-without-language.html
labels:
  []
---

## Thursday, October 08, 2009 


### Thinking without language

I have a lot of interest in making adaptive, interesting NPCs. In most cases, this involves making NPCs that are "smart" - that can react to what the user does, what the situation is, no matter how exotic it becomes.  
  
It turns out making NPCs more intelligent isn't actually what we want: we simply want them to *seem* more intelligent. If they actually *are* more intelligent, they'll act erratically (from our perspective) and will frequently derail the pacing and plot. This is in addition to making the world more chaotic simply because they take actions without the player's awareness.  
  
So we can either take pains to make intelligent NPCs and then cripple them so they don't get too uppity about it... or we can focus on making them seem more intelligent as they go about their not-so-uppity lives. We want them to have some level of independence, but just enough to adapt to the player, not enough to derail the game.  
  
As it turns out, that level of independence really isn't hard. You can program an NPC with a "tactical" understanding of the game world that the player navigates. Then the NPC can simply "play" this game using the same heuristics we would use to make him play any other tactical game. It doesn't even have to be a very high-level play, since they'll be playing tangentially to the player instead of competitively.  
  
An example of this would be the ever-popular "love triangle" in an RPG. If you have two prospective love interests, it is possible for them to understand the basics of time and interest allocation such that they can figure out who is ahead, who is behind, and how to try to score more interest from the player. They can even work together behind the scenes (not in character) to insure that whoever is behind advances as quickly as possible and whoever is ahead slows down, so there's always tension. This is opposed to how it would normally go, where the player would simply pick the one he (or she) fancies and stick with them until the end of the game.  
  
"Moves" on this playing field could consist of a variety of techniques, from the petty (showing up every time the pair gets some time alone) to the clever (figuring out what styles the player seems to like and dressing in them) to the meta (getting the opportunity to pull the player's ass out of the fire in a combat). The idea is to be somewhat subtle: a small push from the one behind combined with a bit of a snub from the one in front can do wonders, even if those pushes and snubs are not in any kind of romantic way.  
  
This brings me to my second point: language.  
  
Language isn't important. In fact, language is a pain in the ass. The only time you should be concerning yourself with language is when you have NPCs that actually have to communicate concepts. For NPCs that simply have to communicate emotion, language is like using a hammer on a screw. It looks like it should work, but it just isn't the right tool.  
  
Instead, what we want is the subtler patterns of body language and situational language, enhanced by clever use of the camera.  
  
Body language isn't something that can be canned. As most modern engines do not support live animations, this is a technically difficult situation despite the rather small and straightforward nature of the animations. There's no need for inverse kinematics or physics, just a little bit of layered subanimations to adjust the features, the way the head moves, the cant of the shoulders and the curve of the spine. It does have to interact with the world a bit - for example, staring aimlessly off into space only makes sense if there's space in that direction to stare aimlessly off into. Those are minor factors, and aren't exactly going to strain your engine.  
  
The subtleties of animating body language would probably be well worth it, but there are twin dangers here. Scylla is the uncanny valley: an NPC that moves "almost" right will probably be extremely unnerving. It's probably best to exaggerate and overanimate. Charybdis is the emotional levels this requires. Body language may add too much emotion into your NPCs, making your players uncomfortable. Driving the player away because the scene makes him uncomfortable is exactly the opposite of what you want!  
  
Body language is also not the only language you need: you'll also need situational language. Unlike real life, in a game world you can simply create situations at demand. These situations can be crafted to create the kind of emotional situation you want to create, regardless of the body language of the NPCs. For example, if the heuristic decides that the strong, tough-guy character needs to be brought down a peg to be liked by the player, the heuristic can simply make the next encounter a surprise encounter where tough-guy gets the worst of it (and, of course, reacts in-character: this assumes your characters are always reacting, unlike most RPG battles where the characters simply step forward, take their action, and step back).  
  
Situational language is our "crutch": because simple body language can't communicate concepts very well, we can use situations to gently say things that fall outside the limits of body language (such as "she's willing to sacrifice honor for fairness" or "he's willing to kill to protect you" or whatever). These are the concepts we would really *like* to convey through our adaptive NPCs, the concepts that make the NPCs really come alive in more than just a moment-to-moment way. And it's actually stronger to communicate them through a custom situation than through any conversation... so don't bother with language!  
  
What do you think?

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [6:51 AM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/478853520696936692 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=478853520696936692&from=pencil "Edit Post")


#### 11 comments:

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjURZbTUeIKNWlbodByylpnvz-37QYcobiyDEYrV3myl\_L8OO8suJx2EDy7h\_W64-WrZXWQc-CGlZ8O5lL3 UcLUKy0wjJDjQMJZZsrulgDhV6 Cfs83r421s5\_Sfmi8D8A/s45-c/cropgrow968982\_10200311668297839\_369994603\_n.jpg)](https://www.blogger.com/profile/13554930621825481241)

[Ellipsis](https://www.blogger.com/profile/13554930621825481241) said...

I definitely agree with the first part, but when you say "forget language" what you really mean is "forget conversation threads and cutscenes." Since our computers are really bad at writing (much less voice acting), we have to manually integrate every line of dialogue, and even if it's written well it might not have as big an effect on a player as something else could.  
  
That said, language, more broadly, can be used in much the same way that body-language or actions in combat can. You just need suitably generic, but also engaged-sounding phrases and lines that can be delivered when appropriate. Sure, it's not going to be particularly deep or interactive, but it can be just as effective as an NPC staring off into the distance.  
  
Random example: when playing Left 4 Dead, if Zoey runs across a dead Francis, she has this shocked and forlorn way of saying "Francis..." that makes me believe, for just a second, that they had some kind of a relationship (I don't mean a romantic one), even though these characters otherwise appear as empty puppets meant to be used for giant pvp battles.

[12:22 PM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255029745902#c838850399472564335 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/838850399472564335 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yeah, except that that's not language: the entire meaning is conveyed via tone.  
  
I can make a system that allows for a wide and subtle variation in body language to allow a character to have meaningful body language in any situation. I can't make a system that will allow me to record a voice actor saying everyone's name in eighty subtly different tones.  
  
The same result could be achieved using body language and careful camera work.

[12:46 PM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255031219019#c5763579470243286799 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5763579470243286799 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

"It turns out making NPCs more intelligent isn't actually what we want: we simply want them to seem more intelligent. If they actually are more intelligent, they'll act erratically (from our perspective) and will frequently derail the pacing and plot. This is in addition to making the world more chaotic simply because they take actions without the player's awareness."  
  
I think this was one of the problems with Storytron (the other ones being limitation in feedback and the inaccessibility of the language).  
  
I think what you meant by language is trying to give the characters a procedural language (i.e. Storytron or Facade in an inversely narrowed example).  
  
I´m totally with you on body language and this post has given me some food for thought in terms of animation.  
  
One of the things I´m interested in exploring and maybe be able to in a project at work is trying to get drama by creating interesting social contexts for two players co-operating rather than trying to construct the AI monolith. In that case the body language is live, implied, and subliminal, and a lot cheaper than producing all those animation assets.

[2:29 PM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255037344287#c4409542231601760112 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4409542231601760112 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjURZbTUeIKNWlbodByylpnvz-37QYcobiyDEYrV3myl\_L8OO8suJx2EDy7h\_W64-WrZXWQc-CGlZ8O5lL3 UcLUKy0wjJDjQMJZZsrulgDhV6 Cfs83r421s5\_Sfmi8D8A/s45-c/cropgrow968982\_10200311668297839\_369994603\_n.jpg)](https://www.blogger.com/profile/13554930621825481241)

[Ellipsis](https://www.blogger.com/profile/13554930621825481241) said...

Fair point about it not qualifying as real "language," but at that point is sophisticated body language even necessary (when as mentioned, getting it a little off can make it seem very awkward)?  
  
It seems that it would be a step up from existing systems as long as you have 1) NPCs make intelligent seeming decisions that cause players to believe they have personalities and goals, and 2) There is some way of showing this to the player. Again, while it's certainly cool to imagine a player seeing an NPC staring off into the distance and reading something into it, it's more likely that the player will look at and understand other abstract representations of NPC goals, moods, and activities.  
  
Again, not that effective body language wouldn't be cool, but it seems to be something above and beyond NPCs making intelligent-seeming decisions. You can still have a cool-looking avatar for people to project their feelings into without going all out on the body language front and get a lot of the impact avatars have.

[4:15 PM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255043747232#c1093406037703060871 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1093406037703060871 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I agree to some extent, but I have a hard time imagining a way to make the characters seem to react intelligently and emotionally without body language. Right now we still have characters react intelligently and emotionally with body language, but only in cut scenes. I want to take it out of the realm of "special events" and make every moment a personalized one.

[4:59 PM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255046344060#c5823679791033583993 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5823679791033583993 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09981225682631417415)

[Isaac](https://www.blogger.com/profile/09981225682631417415) said...

Does it have to be a visual representative of body language? Would a textual description work? I can see how it'd be much more repetitive and have less impact, but would it work as a prototype?  
  
Actually, hasn't Value been doing things somewhat along these lines? The cited Left 4 Dead bits are building on Team Fortress 2's character barks and Half Life's facial expressions, after all.  
  
The whole principle you're getting at, if I can restate it, is that words and speech repeat badly while other channels of expression (tone, body language, etc.) can be repeated procedurally.  
  
In which case I'd add a third expression: actions speak louder than words. Which ties in with your first point.

[7:23 PM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255054995465#c7874462565726319359 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7874462565726319359 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

TickledBlue said...

I couldn't agree more. From my experience, my dogs head and tail drooping or him limping after a battle in Fable 2 has more impact on me than any cut scene or dialogue tree I can remember.  
  
Not that I've played it, but apparently in the PS2 game Ico the act of leading the girl through the game by holding onto her hand has a profound effect on players.  
  
I'd also suggest along with clever camera work, effect use of sound/music to provide an additional layer of non-visual cues. I agree that tone of voice is far too problematic to provide, but what about things like snorts, sighs, heavy breathing, choked sobs (nothing too melodramatic of course and you need to be careful to ensure that they are not overused).

[9:01 PM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255060872728#c7706576463331009269 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7706576463331009269 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Isaac, the real issue isn't the clumsiness you're talking about, it's reading the player's feedback. Unless you're either planning on making a toy that plays itself or requiring extremely cumbersome player controls, you need a real-time 3D world to read even basic player feedback.  
  
With a real-time 3D world you can read how far the player is away, where they are staring, and how intently (for how long / sqrt(distance)) they are staring.  
  
This will allow you to at least determine the very basic limits of player attention, which you can use to effectively "court" the player's attention by having NPCs react.  
  
You'll have a hard time doing that in any other existing UI schema.

[6:31 AM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255095062152#c2038778812485024221 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2038778812485024221 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Tickled: I agree, but I'm no good with sounds myself.

[6:31 AM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255095088296#c1824980654408061368 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1824980654408061368 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15498823908469606899)

[Unknown](https://www.blogger.com/profile/15498823908469606899) said...

Hi Craig,  
  
I think you might enjoy this paper. It sort of ties in with the topic here. http://www.garlikov.com/Soc\_Meth.html  
  
Hope life is treating you well.  
Rocky

[8:17 AM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255447025101#c4361359828674296385 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4361359828674296385 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

"Oh, THAT Rocky..."  
  
Interesting paper, thanks!

[10:22 AM](https://projectperko.blogspot.com/2009/10/thinking-without-language.html?showComment=1255454551250#c7760090743408710319 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7760090743408710319 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/478853520696936692)

[Newer Post](https://projectperko.blogspot.com/2009/10/stuff-simple-games-are-made-of.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2009/09/odst-yeah-you-know-me.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/478853520696936692/comments/default)
