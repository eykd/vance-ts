---
title: "A bit more PAC detail..."
date: 2005-10-26
url: https://projectperko.blogspot.com/2005/10/bit-more-pac-detail.html
labels:
  []
---

## Wednesday, October 26, 2005 


### A bit more PAC detail...

More theory. This time about the specifics of The Machine City's PAC engine.  
  
The PAC engine tracks "memes". Before the game even starts, characters, options, levels, anything the player will ever get the chance to choose in any way, these things are each given a ".meme" file. That file contains a list of the memes they represent, along with a numerical value.  
  
The key is that each meme can also be a file.  
  
For example, your inventor has a file. Presuming her name is Casey, her file name would be "casey.meme". Each of her inventions has a file. For example, "plasmacannon.meme". In the plasma cannon's file would be a list of memes and values. For example, "hotfireydeath 4", "heavyweapons 4", and "casey 2".  
  
These .meme files are cloned from a core template set every time you start a new profile/game. After that, they are modified as the player navigates the game.  
  
Each choice scripted into the game comes with a memetic weight. Commonly, a "friend" increase or decrease, but others are available. Also, every choice reflects a support or denial of the memes inside the .meme file of the choice made. These value modifications are copied into the profile file, tracking the player's preferences over the course of the game.  
  
For example, if you regularly choose the plasma cannon as your gun, you'll have a seriously high rating inside your profile for "plasmacannon", "hotfireydeath", "heavyweapons", and (to a lesser extent) "casey". (The weapon probably has negative values for "lightweapons" and other conflicting memes, so as to keep the player from ever "maxing out" all the memes.)  
  
These ratings are a critical part of the PAC engine, which runs (and runs on) "package" files. A package file is essentially a list of choices supported by the capability for "if" statements and the ability to affect both gamespace and the profile-specific variable/memes which guide the game.  
  
For example, a package file might contain options as to what upgrades Casey will build in what order. Since you've selected the plasma cannon so many times, you have "hotfireydeath" and "heavyweapons" as very high values, so the package file will highlight the options which have those memetic attributes. Depending on the circumstances, one is either automatically chosen or you are presented with a selection to choose from. (Of course, they can also have required meme values, so you can't choose a "super heavy plasma cannon" before you get a "plasma cannon". The "plasmacannon" meme will be at 0 value until you use the plasma cannon.)  
  
This can also be used to permanently change how some global thing behaves. For example, if you replace Casey with Finkle the one-eyed sociopathic mad scientist, that doesn't require a core change to the game. Your package files simply have a "scientist" split in them, and your scientist is currently set to "finkle", not "casey". This, in turn, calls the correct science-related files. "finklesci.package" is called whenever science is referenced instead of "caseysci.package". And, of course, any social files they have are also called correctly. These clusters of files are probably specified in their own package file for ease of tracking and maintenance.  
  
You can even use this system to alter individuals on a shallower level. Say you just want to change how Casey looks. Maybe you win a bet, and for the rest of the game she has to dress in a chicken costume. Well, that's easy: the graphics files referred to in casey's package files reference a variable/meme. When you're first introduced, "caseygraphics" is set equal to the file "caseygraphicsdefault.package", which in turn passes back specific graphic files depending on what kind of display is needed. After a given choice, you can simply set "caseygraphics" to "caseygraphicschicken.package". This would have no effect on her speech or capabilities, save if you explicitly say, "if caseygraphics == caseygraphicschicken.package then".  
  
Of course, using the PAC engine is voluntary. The game gets along quite well with minimal use of this engine - I think the minimum is probably its use in passing the correct graphic file depending on mood and situation. It's pretty easy to use it to spruce up the game with some random commentary based on who is with you at any given time, as well. It only gets complicated when you start trying to drive characters and plots with it.  
  
We'll see how well I can pull it off. :)

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:15 AM](https://projectperko.blogspot.com/2005/10/bit-more-pac-detail.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/113035529941806735 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=113035529941806735&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/113035529941806735)

[Newer Post](https://projectperko.blogspot.com/2005/10/more-fear.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/10/pac-visits-machine-city.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/113035529941806735/comments/default)
