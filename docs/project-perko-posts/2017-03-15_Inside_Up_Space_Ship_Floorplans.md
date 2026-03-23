---
title: "Inside-Up: Space Ship Floorplans"
date: 2017-03-15
url: https://projectperko.blogspot.com/2017/03/inside-up-space-ship-floorplans.html
labels:
  - camera
  - game design
  - the galactic line
---

## Wednesday, March 15, 2017 


### Inside-Up: Space Ship Floorplans

The Galactic Line is a game about crews aboard space ships. It has one particularly glaring challenge: the camera.  
  
Looking at the crew of a space ship is typically done via a birds-eye view with the roof stripped away, just like how you see people in The Sims, or FTL. This approach is particularly useful in games where you also build things or manage complex facilities, because this kind of "map" view is a natural fit with arranging pieces and laying floorplans.  
  
Originally, I had planned to have The Galactic Line feature several different cameras, including a first-person or close-third-person for realtime events. However, I think I've changed my mind. Let's talk about the drawbacks of the birds-eye view, my workarounds, and why I'm leaning in that direction again.  
  
**Floors**  
One of the biggest limitations of the birds-eye camera is when things are stacked. You can see this even in The Sims: when you're looking at the ground floor, you can't see people in the basement or upstairs. This keeps you from having a good overview, despite having a literal over view.  
  
The Galactic Line uses modular construction, rather than tiled construction. You click prefab rooms and sections together. This means we can arrange our modules so that they naturally click together in a manner that doesn't have overlapping rooms.  
  
1) Multi-layer modules (stairs, atriums, etc) give us a good control point for how ships can be arranged vertically. If these modules have doors on each floor offset from the floor beneath, then the attached modules will also be offset, allowing us to naturally stagger our layouts.  
  
2) Use of "gray" space such as storage and life support means that a habitation module can have lots of areas we can simply leave unrendered, allowing for rooms above or below to naturally fill that space. Moreover, hallways themselves are low-priority and could be rendered softly, if at all, allowing us to stack halls over rooms without blocking the rooms.  
  
3) Larger modules for larger ships may have a dozen rooms in one package. If we make each of those modules largely vertical, we can arrange the rooms so they don't block each other vertically. Additional ship modules will generally snap on horizontally, meaning our large modules rarely vertically overlap with other large modules.  
  
4) Sparse modules. Using a variety of layout tricks such as arbitrary angles, slopes, and gentle curves, we can make it difficult to tightly pack our modules. These work well if the modules have a number of windows or other external-facing elements to give an excuse as to why you don't want to pack them tightly. This would be, visually, fairly unique: most settings have tightly-packed hab areas.  
  
5) Subsystem filters rather than floor filters. Instead of looking at "deck 6", we can look at "off-duty rooms" or "engineering rooms" or "command rooms". By arranging these rooms using the aforementioned techniques, we can show a spiderweb of rooms on several floors, none overlapping. The focus on functionality means we can also see the operations of the sort we care about, rather than the arbitrary "nth floor" filter.  
  
**People**  
In The Sims, you can't see everyone all the time - they might be on a different floor, or just far enough to the side that they're not on screen. So there's a bunch of portraits on the screen which show their faces and needs, letting you keep track of them no matter what you're looking at.  
  
Our situation is a bit more complex. The Sims is about a few people, and the focus is on tending moods. In The Galactic Line, you could theoretically have a crew of thousands, and the focus is on the specific event that's unfolding rather than on moment-to-moment moods.  
  
The good news is that the event focus means we are also able to focus on only a few of our potentially thousands of crew members: the ones involved in the event.  
  
This means we can have a manageable number of portraits, but it also means we can have a manageable map presence. We can arrange our highlighted crewmembers to be in rooms with no overlap, so we'll always have a clear view of them. We can even build an adaptive interior view which highlights only the rooms they're in, making any potentially overlapping rooms invisible unless you manually walk into them for some reason.  
  
Functionally, this means we don't need portraits. We can use portraits for a variety of things, especially when arranging or building the crew, but for the event scenes we don't need them. You can see everyone involved. You can see what they're involved with because they're standing at a specific place in a specific room. There's no need for floating heads to pump numbers into your eyes.  
  
**Faces**  
The reason I wanted to go with a more personal camera is easy: this is a game about people, so I wanted closeups of people. I planned to do some camera manipulation when you get near/start talking. Get a reasonable closeup of the face.  
  
I need this because A) faces are distinct, and it's one of the important ways crew members are unique. B) The expressions they make are a critical part of empathizing with them and their situation.  
  
However, we don't need to rely on the player camera. There's no reason we can't have a separate dialog system, like thousands of games of all sorts. A popup of some kind that shows their face up close.  
  
There's loads of different approaches. For example, the full-screen dialog tree vs the chatroom-style messages with faces alongside. There are a fair number of distinct options - perhaps a sidebar element that folds out to show the ship's chat room would feel right... although the faces might be too small.  
  
Any way I slice it, there's no big problem with having a separate dialog engine. It's common.  
  
**Advantages to the Bird**  
Birds-eye camera has a few distinct advantages. I've already mentioned that it fits well with the construction engine. It also shows a fair number of people and the state of the ship all at a glance, which is nice.  
  
Another advantage is the low resolution required. Because the camera never gets too close, I can use relatively low-res assets for furniture, for bodies and rooms. I don't need to have high-res assets for books and posters.  
  
The main problem I have with the camera angle is simply that it's not very personal. Moving a pawn around on a giant board game is not very immersive. Walking around inside the ship is a hugely immersive experience that I would love to focus on, especially because the experience of being stuck aboard the ship is the focus of the game.  
  
Well, let me know what you think.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:09 AM](https://projectperko.blogspot.com/2017/03/inside-up-space-ship-floorplans.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/2609672703923464395 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=2609672703923464395&from=pencil "Edit Post")

Labels: [camera](https://projectperko.blogspot.com/search/label/camera) , [game design](https://projectperko.blogspot.com/search/label/game%20design) , [the galactic line](https://projectperko.blogspot.com/search/label/the%20galactic%20line)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/2609672703923464395)

[Newer Post](https://projectperko.blogspot.com/2017/03/character-checklist.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2017/03/glowing-open-worlds.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/2609672703923464395/comments/default)
