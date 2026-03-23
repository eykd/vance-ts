---
title: "Complexity in Open Empire Construction"
date: 2013-08-23
url: https://projectperko.blogspot.com/2013/08/complexity-in-open-empire-construction.html
labels:
  - game design
---

## Friday, August 23, 2013 


### Complexity in Open Empire Construction

One of the things I've been designing my current prototypes towards is rules that provide juicy emergent complexity. Most construction games put simple caps and restraints in to keep growth from exploding, but I want to make it so that it feels organic, and players should feel like the limits they are hitting are their own constructions.  
  
For example, in Civilization there is usually a "city penalty" - the more cities you have, the bigger of a penalty. I don't like that. Similarly, in many space expansion games like Master of Orion, there is a "fleet cap" which is very expensive to overdraw. Even just at the most basic level, there's only so many places you can build, so there's an enforced cap on your size anyway.  
  
Instead, I've been thinking about much "softer" organic constraints.  
  
For example, in this space game I'm building, information transmission happens via satellite dish - connecting two facilities together. However, there is a level of signal decay based on the distance between the facilities, obviously. The worse the decay, the lower the bandwidth. On the other hand, you can always just put on a bigger, stronger dish and boost that signal, right? Sure.  
  
So to prevent saturation at the highest level of gameplay, I implement saturation as a limit. Comm arrays produce radio noise - it's how they communicate. So I implement radio noise as another source of signal degradation. Those strong, high-quality communications between homeworld and Neptune work fine, but they fill the area between with noise, degrading other communications - even other communications from the same facilities. Obviously, some disruptions are more focused and disrupt less actual space - directed broadcast is your savior here. But as the number of facilities climb, figuring out how to aim and schedule direct broadcasts so disruption remains small will be a fun challenge. Do you use relay stations to keep the signal saturation manageable, or do you schedule a rotating series of broadcasts, each in its own short, clear window of time?  
  
This has the added, built-in bit of juice that the player can hear the radio broadcasts for wherever they happen to be looking at on the galaxy map. So if two stations are voice communicating, they'll hear "blah blah blah blah" simlish, as clear or fuzzily as the noise indicates. If it's a control system demanding a state change, they'll hear BREEP-dooooooop-BREEP or something. If it's a data transfer, the ever-popular modem sound.  
  
I really enjoy coming up with these soft-but-juicy kinds of mechanics. Mechanics that add to the player's experience based on what the player is doing, rather than forcefully putting up walls or highways. Here are some more that I have planned:  
  
Staying on the topic of information transfer, there are several kinds of information. I plan to start with three, but obviously more could be added. The three I want to start with are interpersonal, control, and science.  
  
Control is a resource a lot of devices use either intermittently or continuously. A button might take a small amount of control to push, and turn on the air filters. On the other hand, an atmospheric scanner might produce science based on the amount of control it can eat up. There are automatic buttons that can be programmed and don't require control, and there are automatic scanners... but in both cases, they are either less efficient or less robust.  
  
The key to control is that it's only produced by humans. You can transmit control via a comm station, typically from ground control (which has a lot of humans on staff). However, the bandwidth required can be prohibitive if you're trying to do something like scan a planet - it's more useful for just pushing buttons remotely. Even more than the simple signal bandwidth, the light seconds delay between controller and controlled will degrade the control pipe specifically, basically counting as extra signal degradation. Of course, if there are humans on the station, then the humans can be the source of the control and that has no delay.  
  
Humans both generate and store a certain amount of control, depending on their condition. A single human certainly produces enough control to push buttons and levers all day, but something like a scientific scanner might require several humans, or humans working at peak efficiency. Improving human condition requires not just life support, but also entertainment and places to live a life. Similar to the control transmissions, humans can transfer control resources to each other via a comm relay. Human to human interaction transfers control much more effectively than transferring control via control comms. So it's common to have ground control communicate with science teams to organize them, radically increasing their control resources.  
  
The max storage available to each human still depends on their condition, so that is a limiting factor. Again, the restrictions on the nature of comm stations can matter: do you maintain a constant stream of chatter to constantly charge the humans with control, or do you go with short bursts a few times a day to charge them up without constantly causing signal degradation?  
  
Of course, science is also a data resource and can be transferred in much the same way. When you scan a planet's atmosphere to produce science, that science is stored in a local database. In order to be useful, it needs to be transferred to a construction station, since the point of science is to allow or disallow construction of specific kinds of more advanced devices. So you need to get your science from your research facility to your construction facilities.  
  
One problem is signal degradation, of course. Especially since most serious science outposts will also have a high level of control requirements, which means that either control or interpersonal communication will often be degrading the signal. So maybe you schedule data uploads to happen at a specific time, and you cut off voice communication during that time.  
  
However, because it's fun to make things more complicated, the nature of science data is not the same as the nature of control data. With control data, one control transferred is one more control on the other side. It may take some time to do that transfer if the bandwidth is bad, but it's a zero-sum situation.  
  
With science data, the situation is more complex. First, it really does transfer. For the sake of playability, when you broadcast science data you remove it from the broadcaster. This is okay, because science is generated pretty rapidly, so you're not in danger of "running out".  
  
However, there is loss. When a database receives science data, it doesn't just add it in. Instead, a database has a certain amount of resistance based on the amount of data in it, to the tune of 1% per hour. So if you have 6000 science data, then you have a resistance of 60 data per hour. This is then applied against incoming communications.  
  
So if your science facility sends over 60 data in a 1-hour broadcast (quite slow), none of it would get through. But if you send 60 data in 1 minute, then 59 of that would get added in. Of course, then it would have 6059 science data in it, and will resist 60.59 data per hour.  
  
This rewards clever comms usage, and offers some fun optimization challenges.  
  
For example, you might broadcast in rapid, high-volume bursts. This would fillllll the sky with noise (and the player would hear a loud modem sound), but it'd be short-lived. That's a fun possibility. Another option is to have multiple databases. There's the "core" database, but then there's specifically the input database. The input database is very nearly empty, so even slow data trickles will fill it with little loss. Then, every day or so, the input database is pumped into the main database using a super-fast server at the rate of 1000 science per second, or something similarly absurd.  
  
Because science is never "spent" on building modules, the challenge is not to continuously generate science to replace lost science, but to reach new heights of science. So as you strive for more science so you can build better toys, you need to create better science pipelines. Fun!  
  
Anyway, these are the sorts of play ideas I've been thinking about for this prototype. And that's just the communication between bases...

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:08 AM](https://projectperko.blogspot.com/2013/08/complexity-in-open-empire-construction.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/1462981658205145112 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=1462981658205145112&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/1462981658205145112)

[Newer Post](https://projectperko.blogspot.com/2013/08/building-cramped-space-station.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/08/starship-game-design-discussion.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/1462981658205145112/comments/default)
