---
title: "Glitch Games"
date: 2013-04-22
url: https://projectperko.blogspot.com/2013/04/glitch-games.html
labels:
  - game design
---

## Monday, April 22, 2013 


### Glitch Games

There's always a steady undercurrent of glitch-related art and commentary. Modern games tend to have physics glitches where they fling you off into the sky, or texture glitches where things are painted in solely red warning text.  
  
But in the old days, glitches were often significantly deeper. I think my favorite glitch engine was Sierra Online's "The Shadow of Yserbius". The game itself never had any significant glitches for me during play. But if you went into the save file and hex-edited it, you could cause a hugely entertaining variety of glitches, such as your character turning into a giant stack of "scrolls of boomerang". Fun times.  
  
My interest in glitches began a lot earlier than that, though, because I began on the Apple II. The Apple II I had had a serious overheating problem: after two hours or so, it'd begin to overheat and randomly corrupt working memory. Rather than get upset about it, as a child exploring what Basic could accomplish, I became really interested in incorporating these RAM glitches into the games, capturing corrupt memory as text or images and trying to use it later, when the computer had cooled off.  
  
Of course, I also had an NES, and NES glitches typically changed the way the game worked. While you could simply have a visual glitch, NES games were programmed pretty tightly, so that kind of offset error usually meant the game code was about to fly off into the wild as well. At the time, I thought of glitches as destructive exploration: if you got one, something interesting and entertaining was happening... but you wouldn't survive it. I don't think I considered glitches as methods for cheating until the Playstation era.  
  
I think a lot of people like glitches. There's games simulating glitches, games that attempt to be made out of glitches, glitch art, and so on. There's something artistic about the computer's misinterpretation of things. That said, glitching is not an easy thing to actually incorporate into a game: it tends to result in crashes. So most such games are engineered with carefully programmed glitches that simulate the best possible kinds of glitch.  
  
I think the games which do glitch stuff most authentically are the monster games where you can scan something and get a monster out of it. Barcodes, images, QR codes - anything that produces a string of digits that the game interprets as a monster. However, typically these games play it very safe, and instead of trying to actually interpret the code, they simply use the code to select from a variety of premade monsters.  
  
Weak!  
  
If you allowed the game to actually compute the monster programmatically, then you begin to see real glitch games in action. The game's code base acts as a structured container, insuring that the glitch will never (or very rarely) actually kill off the game. However, by interpreting incoming data as a certain kind of code, you can get the same kind of glitch situation that you would have gotten by corrupting a NES game. Even the art used to draw the monster - rather than reading in pure gibberish and displaying static, you can use programmatic commands to draw chunks of the monster, allowing the code in question to draw something that looks vaguely in-world valid. Allowing for any length of code is also important: we're not talking about a string of integers used to select body type, head type, weapon type. We're talking about code that executes.  
  
There's not any particular reason it has to be monsters, either - that's just what's been built to date. You could do absolutely anything: dungeons, cities, ancient spells, anime magical girls... it would be a lot of fun to play around with things. Take any image or string of text and interpret it as a place, person, monster, thing, spell... stitch together your world and share it with your friends. Of course, try to progress through it as well.  
  
That last part is the iffy one. You can't really balance a game where code is arbitrarily executed.  
  
I think that rather than try to balance it, you need to just create a progression structure. For example, you might have a few NPC friends. Progressing through the game isn't about gaining levels. It's about surviving with your NPC friends. As time passes you grow closer and friendlier. There may also be some statistical progression, but rather than combat statistics it should be glitch slot growth. For example, you can only have two places in memory at the beginning, so each time you scan a potential place, you have to drop an old one. But as you gain levels, you gain more glitch slots, or perhaps can cement glitches into place so they don't take up slots.  
  
Either way, the point of the game is not to "win" it, although those mechanics exist. Instead the point of the game is to create a world and share it with your friends. Come up with the zaniest world, scariest world, most normal world - whatever you can come up with.  
  
The heart of such a game would be the interpreter, of course. There are a few ways to do that.  
  
One way is to interpret it as a byte array and simply treat each byte as a potential command or argument. So byte value "26" might be "draw arm". Then you have the next chunk spent on arguments: offset from cursor, arm type, arm size, arm color, etc.  
  
The problem with this is that most data will be pretty bland. There is a high chance that the input data will not have a byte value of "26" at any point. So most data would result in armless monsters.  
  
The solution to this is to have some kind of memory/changing command system. The most basic form of this would be that each time you receive a command, you rotate the command space a certain number of steps. So even if every byte is "26", you would end up receiving a lot of different commands and have a complete result.  
  
A more elegant method would be to combine that with a command chain system where a few commands are all clustered around the same core command space. For example, a "26" might be draw arm, but all of the 20s are "draw monster part" commands. The first 20-something results in drawing a torso, regardless of which command it actually is. Afterwards, they'll draw as they should. Or maybe 26 draws arms the first time is it called, but then overwrites the left arm the next time it is called, the right arm the time after that, and so on. 27 draws a new pair of arms...  
  
This kind of execution can also work well for powers and behavior... but, still, if you're planning on reading in pretty universal data, it's not ideal. For example, if people are submitting a compressed image like JPG, there's going to be a familiar pattern in every image. If they're submitting an uncompressed image, there's going to be vast numbers of repeating byte segments due to very similar pixel coloration.  
  
If you simply interpret these with a script interpreter as explained above, then many of your results are going to have a very patterned feel.  
  
In these cases, it may be best to use a data eater rather than a data parser. Use an algorithm which explores the topology of the data.  
  
So instead of interpreting "26" as "draw arm", you would have a "draw arm" subroutine that looks at, say, the byte 30% through the total data string. It then reads forward, counting the first five or so values it finds as seed values, and then continuing to count forward until it finds a new, distinct value. The quantity of each seed value and the value that stopped you would then be the arguments for your "draw arm" function. You could easily chain this - for example, the stopper value could be interpreted as a command which then works like a script interpreter to determine the attack linked to the arms, or even whether or not to start drawing more arms or something.  
  
This is a good way to operate within a very strict framework. If you're doing something like a dungeon level, you'll need to allow for arbitrarily complex structures painted by arbitrary code... but if you're trying to create an anime magical girl, there's a strict framework. Some elements will basically be arguments (height, for example). Others will be complex patterns (hair, magic attack)... but they'll all always have to exist. So you can't use a low-context interpreter like you would for dungeons. For these situations, using subsystems which read arbitrary points in the data may be better.  
  
Both methods combine with a few other features you may want to remember.  
  
The first is state. In most cases, you'll have some kind of state. For example, if you're creating a new attack pattern, then each new phase of attack you read is going to be attached to the end of the previous phase. If you're creating a monster's attack pattern, it's important to know whether you're laying a new attack piece into an existing attack, creating a multi-phase attack, or creating a brand new attack. So state is important.  
  
The next important thing is parallelism. In many situations, you'll want to have situations where several things are being added at once, or there is mirroring, or some such. For example, if you're drawing a dungeon, you may hit a T-junction. One option is to execute one side and then, when it completes, execute the other side from wherever the first side ends. But that implies a halting condition, which is not generally a good idea. A better option is to execute one side from where the T junction call is made, and simultaneously create the other side from a different point in the byte array. Even so much as a single byte offset is typically enough to create completely different results due to the difference in interpreting commands as arguments and arguments as commands. Mirroring is possible, too, in which case you probably want a condition where the mirroring will break and the two sides will diverge (or one side stop). That can be "X commands in" or "certain data read" or whatever.  
  
The last important thing I've used in my experiments is marking.  
  
Marking is what happens when a command creates a framework for stuff, but then you want to go back and fill it in later. Typically, I'll use front-to-back to create the scaffold, and then back-to-front to fill in the markings, although you could also divvy it up into something like "first 40% of code is scaffold, next 60% is fill-in".  
  
As an example, a scaffold might be the basic layout of a dungeon. You blitz through the architecture phase, creating tunnels and doors and rooms and all those basics. But every one of those commands also puts down markers - on the walls, the doors, the floors, and so on. The markings have three pieces: the core marking type (wall, door, floor, etc), the marking subtype (arbitrary, typically only 1-2 of each subtype in a room), and the marking order (a simple incrementing counter).  
  
When you complete the architecture, the fill-in phase begins. This is used to fill in those markings.  
  
The commands will typically fill in swaths of markings all at once. For example, "fill in the last 10 wall-A markings as type 1 torches". Those markings are then removed (or moved to a detailing list, depending on the depth of the generation algorithm). So if you then get the same command again, you'll have filled in the last 20 wall-A markings. But the rooms those torches are in are not entirely full of torches: they still have some wall-B, wall-C, or even wall-D markings. Plus, the halls might have wall-A markings and then something like wall-D and wall-E markings: each subtype is a different category of intended good, although there's no guarantee that is the good that will get placed there. For example, there is a (small) chance that wall-A markings will be filled with tables, or topiaries, or even spy hallways.  
  
There's also the commands to fill in just one, or fill in one, skip some, fill in one, skip some... for example, you may get the command to fill in wall-B markings with topiary in the pattern "topiary-skip-skip-topiary-skip-skip". Or you might get the command to replace every ninth wall-A with a doorway - and if there's no room on the other side of that wall-A marking, automatically create a closet and mark it with a storage-A mark.  
  
There are also commands to change the nature of markings. For example, "change the last 10 wall-A markings to wall-SECURE markings, and change the door-A markings in affected rooms to locked doors". These sorts of commands allow you to create zones with differing content, rather than simply relying wholly on randomness.  
  
Either way, you'll probably run out of marks before you run out of code. That's the intention, at any rate. If you still have marks left over, start over with the remaining marks, perhaps with some displacement. Don't leave marks unfilled.  
  
Markings can also be useful in creating monsters or items, but in those cases it's often just a matter of detail work rather than this kind of fundamental "where treasure chests get put" stuff.  
  
Anyway... that all sounds pretty far from glitches, right? I mean, generative dungeons and glitches aren't really the same thing...  
  
Well, I think they are. Fundamentally, my enjoyment of a glitch comes from the fact that the computer is interacting with me in a way the developer didn't intend. By giving the computer means to do that, I feel this kind of generative stuff is in the same spirit as hacking a save file to turn yourself into a stack of scrolls.  
  
And you can play it pretty fast and loose. If you prefer to have a more glitchlike experience, use fewer premade elements (such as "torches" or "arms") and instead generate those elements using more interpretation. Personally, I want the generated content to feel like it fits at least vaguely into the world without shattering it, but I still want it be crazy and weird. This is how I accomplish that.  
  
WELL THAT WAS LONG.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:49 AM](https://projectperko.blogspot.com/2013/04/glitch-games.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5456507605044951984 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5456507605044951984&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5456507605044951984)

[Newer Post](https://projectperko.blogspot.com/2013/04/ensemble-games-character-establishment.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/04/social-npcs-in-games-design.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5456507605044951984/comments/default)
