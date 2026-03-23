---
title: "DarkStarlike"
date: 2013-08-12
url: https://projectperko.blogspot.com/2013/08/darkstarlike.html
labels:
  - game design
---

## Monday, August 12, 2013 


### DarkStarlike

One of the kinds of gameplay I like is base-building - or, more accurately, house-building.  
  
I really liked The Sims, but the focus on it being a time management game always wore on me. I didn't like that mechanic, especially since it punished building large, beautiful houses and rewarded building cramped little zig-zag houses. What's the point of building a house if you're going to be punished for building a nice one?  
  
I've always wanted to do the opposite: a game where time isn't short, but long. I became interested in facilities that are inhabited. Really lived in. The exact opposite of The Sims, it's a game where you build your base specifically to keep your inhabitants happy in the long term, as they live in it for days, weeks, years. Not "how efficient can you make it", but "how long-lasting can you make it", both in terms of mechanical components lasting for a long time and in terms of keeping the inhabitants happy with their daily lives and interactions as time wears on and on.  
  
That's why my most recent prototype is codenamed 'Dark Star'. If you haven't seen it, Dark Star was made before Alien, and then the script was reworked and refilmed and called "Alien". It's about a crew of a deep-space mining vessel, as time wears on them and they are harassed by an unimaginably stupid "terror". Unsurprisingly, since John Carpenter directed both, it also has a lot in common with The Thing. But the focus is less on the alien terror and more on the steadily unraveling humans stuck in isolation for years at a time. And it's also a comedy, rather than a horror movie.  
  
Any way you cut it, the difficulty of this concept as a game is how you model the inhabitants. Their behavior has to be simple enough to be meaty, but also support the steady unraveling and social pressures teams suffer when isolated for long periods of time. This is doubly important for my needs, because the game is intended to allow you to leave ships in various places and use them to either gather scientific data, materials, or hook up with other ships later and serve as supply points. There's going to be multiple ships out in the universe, so the modeling has to be something that the player can grasp relatively quickly. They'll have forgotten the precise details of what's going in ship 1 when they're flying ship 9.  
  
I thought about it a lot, but I couldn't come up with a very good mechanic. They were all really "The Sims"y, based on needs and proximity and so on. It got complicated, because you had to do things like assign rooms and jobs and manage shifts so that people would encounter each other - just a huge headache. I needed something that would run in an obvious manner at high timescales, as well as be easily and deeply modified whenever you wanted.  
  
So, here's the simple idea:  
  
The ship is a grid. Each inhabitant can be "posted" at one particular grid node. However, that's not their physical position: we don't actually care about their physical position for our simulation (although we do care about it for visuals). From their post, they project a "+" pattern - a beam in each orthogonal direction. All the tiles their beam hits are tiles which concern them. Those are the tiles they use or maintain day-to-day. So it should obviously include a place to sleep and a place to eat and a place to relax, whatever you can manage... and it should also hit the facilities they are responsible for repairing or using. The "+" pattern has no end - if your ship is 500 tiles wide, they will be concerned with 500 tiles horizontally (and howevermany a vertical slice is, as well). So larger ships allow characters a wider variety of facilities... and a much heavier maintenance duty, if you aren't careful.  
  
In terms of maintenance, it's best to have enough sailors to cover every single tile. Tiles that aren't covered aren't maintained. For some tiles, that's okay. But most facilities need maintenance. Similarly, a work station means nothing if nobody works at it.  
  
In terms of socializing, when two beams overlap that's a social encounter that the characters will have regularly - maybe not every day, but fairly regularly. The kind of social interaction depends on the kind of facility at the overlap. So if they overlap at a mess hall, they tend to eat lunch together. Characters aligned diagonally will always interact at precisely two points, so you can control what sort of interaction they have and what kind of social sustenance they provide by carefully choosing which points you interact on - if both points are the same kind of interaction, it's much more powerful but also much more limited.  
  
On the other hand, inhabitants can also be aligned on the same beam - either horizontally or vertically. (They can't be on precisely the same space, though.) In this case, there are a massive number of overlaps: every single tile along that axis. This can be a very powerful way to create plenty of social interactions... but overloading is often worse than going without, so care needs to be taken.  
  
The core idea is that the characters have particular social characteristics and needs. Each character is probably marked by obvious appearance characteristics as to what sort of needs they have - otherwise it would be a bit difficult to tell quickly enough for my taste. You could replace that with a series of floating icons or something if you really want to avoid stereotypes, but I was planning on using floating icons for what their actual state is. Requirements/tendencies are different from actual state.  
  
Then it's a simple matter of calculating from their various activities, and moving from your current state towards the calculated state by some amount per day (10%?).  
  
The most basic element is your personal needs. You need a bedroom, a washroom, and a place to eat on your beams. If you don't have them, you'll quickly get annoyed. If you have extra good ones, that might help to blunt your mood swings! However, this is just a very basic baseline. Things get more complex from then:  
  
You can calculate interpersonal interactions by simply looking at all the places your beams collide with other crewfolk's beams. This is a social interaction, and of the type the room specifies. The bad news is that this isn't scaled. On a ship with, say, 100 crew, you'd probably have 198 interactions, assuming none of the other crewmembers have the same X or Y coordinate as you. (There are ways to build a ship where the intersections happen in empty space or on incorrect job rooms, which can lessen that, but in general it stands.)  
  
This is made much worse when someone shares a coordinate with you, because they'll overlap on around half of your rooms in most cases, meaning you can easily rack up the width or height of the ship with interactions with that one person.  
  
Individuals can blunt this automatically, however. Any room they touch with a beam that nobody else touches with a beam is considered personal space, and they can use it to avoid 1 interpersonal interaction. So if I have 8 interpersonal interactions and 4 personal spaces, I can negate 4 of those interactions - and I'll automatically negate the ones that are the most problematic for me. If I'm not overdosing, I don't need to negate any of them. This doesn't mean you don't meet up with the other person, it just means that you also spend some time alone.  
  
Obviously, if someone shares a coordinate with you, then all the rooms on that axis are going to be shared rooms because they have the same beams as you. This means that it's going to really limit your personal space.  
  
The other kind of social input is the rooms you touch - shared or otherwise. This really only matters in small ships, because it's capped. If you touch three rooms, they'll each give you 33% of the social input you would have gotten if someone interacted with you there. But if you touch 100 rooms, you only get 1% each. So, as the ship gets larger, the contributions trend towards a very low baseline.  
  
Some rooms count differently depending on your skills/job/tendencies. For example, a medical doctor isn't going to get any benefit from a deep space scanning room, and a astrophysicist won't get any benefit from a med bay... even if the two overlap on it and theoretically have a social encounter. It just does nothing. So it's critical to have a very quick and easy "read" of the situation, which is simple enough. Just color and mark the beams, and estimate the social situation for the crewmember a few weeks into the journey.  
  
As the journey wears on, that might change. People's fundamental tendencies slowly drift out of kilter based on their long-term actual states. But it's a good enough estimation to keep a newbie in the game and not terribly confused. We can also implement some kind of actual relationship growth as well, if we like, which would further drive them off kilter - probably mostly driven by someone having lots of the same kind of social interaction with you.  
  
All told, this system should make it very easy to estimate how people will interact socially, while also linking everything to a fun and complex space station/ship game which lets you build, leverage, launch, and reuse ships. It seems like a fun combination of managing social topology, work, and ship maintenance. Rather than being about dealing and repairing damage from space battles, it's all about trying to create a ship that operates well for extremely long periods of time, including when damaged or on the fritz or a crewmember is sick.  
  
Anyway, I'll go ahead and program it some more.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:46 AM](https://projectperko.blogspot.com/2013/08/darkstarlike.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8362117065456136760 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8362117065456136760&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### 3 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/13213818240673090136)

[Mythological Beast](https://www.blogger.com/profile/13213818240673090136) said...

It's an interesting challenge. The grid thing seems artificial; more appropriate for an abstract game than something inheriting from a Sim.  
  
Maybe you want to abstract their motion in space, but not time? Think of it in terms of a Gant chart, where each person is required to spend some of their time on the job, but has the ability to spend time in various places when not on the job. Their personality traits determine where they want to spend that extra time, with an accounting for boredom and mania (based on other traits) when they spend too much time on any one distraction.  
  
When someone wants to spend time doing something specific, they interact with others. Their personality traits will then either mesh or conflict with those they interact with. (jobs count). This may have positive or negative effects on their boredom/mania ratings.  
  
Eventually you'll run into people who are bored to the point of desperate measures, or just go crazy running circles around their extracurricular avocation. The trick is to keep everyone from hitting there.  
  
Other possible modifiers. Adding possible distractions will increase the time it takes your crew to hit that spot. Shore Leave will reduce all boredom and/or stress. That kind of thing. Sounds like some interesting math. Be sure to use exponentially weighted averages, because that's how neurons actually work.

[1:13 PM](https://projectperko.blogspot.com/2013/08/darkstarlike.html?showComment=1376338408282#c3680562707203829467 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3680562707203829467 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I considered those, but the problem is that I just really... really... really like building stuff. Space ships, houses bases.  
  
Actual layout work.

[1:24 PM](https://projectperko.blogspot.com/2013/08/darkstarlike.html?showComment=1376339050472#c7401067208355517419 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7401067208355517419 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/01820409963072076964)

[Chris](https://www.blogger.com/profile/01820409963072076964) said...

I really like your theme and concept, but have a lot of doubts as to whether the grid mechanic won't quickly run aground beyond a certain level of size and complexity.  
  
I think you are binding the base-building and the resource (agent) assignment too closely.  
  
As Beast says, I'd be much more interested in a semi-realistic agent simulation to exercise the space base you design, with some kind of flow/fluid/heatmap technology driving the sims.  
  
Obviously this is the approach Prison Architect has taken, and there is a lot of value in it. I think you can avoid being encouraged to pack-everything-in by being really generous with travel time in the simulation (unlike the Sims), and providing happiness penalties for being too squished.  
  
I'm concerned that trying to optimise for grid-lines will destroy any chance of immersing the player in the setting, because no base will ever resemble a realistic layout.  
  
I also worry that trying to optimise in multiple dimensions (2d projection grid) just isn't fun. Designing an awesome dark-star space base is fun. Designing extended-duration science vessels is fun, but optimising to a grid?  
  
I'm with you on the building stuff. I've loved Dwarf Fortress, Evil Genius, The Sims, and now Prison Architect. Following that history, I think that the path forward is more realism in the agent modelling, rather than less.

[4:52 AM](https://projectperko.blogspot.com/2013/08/darkstarlike.html?showComment=1376481148639#c8352328337878496132 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8352328337878496132 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8362117065456136760)

[Newer Post](https://projectperko.blogspot.com/2013/08/the-nature-of-fans.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/08/constructive-implicit-goals.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8362117065456136760/comments/default)
