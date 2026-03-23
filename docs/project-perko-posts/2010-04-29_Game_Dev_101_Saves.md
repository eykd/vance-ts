---
title: "Game Dev 101: Saves"
date: 2010-04-29
url: https://projectperko.blogspot.com/2010/04/game-101-saves.html
labels:
  - game design
  - game dev 101
---

## Thursday, April 29, 2010 


### Game Dev 101: Saves

Another post intended to help newbies learn some of the basics that normally require you to screw up first. This is my opinion, not some industry standard, but I hope it helps.  
  
If your game is the sort that lets people save, it's important to think about some aspects of that.  
  
Most fundamentally, there are several games I've stopped playing not because they were bad, but because their save systems were impossible to get along with. For example, in Dynasty Warriors 6: Empires, in order to save your game you've got to select a hard drive, select a slot, click A, click left then A, and then click A again, each with a second-long fade animation you can't skip. It takes a good ten seconds to tell it to save to the same exact place you saved it last turn.  
  
An equally serious problem are games that have one save-load screen. The worst mistake a save system can cause is when the player clicks on "load" when they meant "save". Enough time has passed and progress has been made they they feel nervous about losing it, so they go to save, and BAM, they lose it because they went to save. That'll make you lose a player real quick.  
  
So, if you allow manual saving and loading, the basic rules are simple. Have two distinct screens, one for saving, one for loading. These screens no longer need to have "save" or "load" buttons, those are relics. The only reason to do it in an old-fashioned way is if your publisher or platform demands it.  
  
If you allow the user to name their saves, then when they click on a save slot, it should start with an arbitrary name but highlight all the letters so that, if the player starts typing, his text overwrites. While the slot is active, a "cancel" and a "save" button should pop up next to the slot, preferably not in a layout where you will accidentally click one when you mean the other (circular buttons with different colors are good). Pressing "enter" after you edit the text (or without editing the text) should save, while pressing "escape" (or "b" or whatever) should cancel. There is no need to pop up another window demanding confirmation, because the confirmation is built into the way it saves.  
  
If you do not allow your user to enter a name, the old way is still the best: the user clicks on a slot and, if the slot already has a save game in it, a window pops up to ask if you're sure you want to overwrite. Generally, I like to default to yes (and have the "yes" button under the cursor's current position), but you can argue either way.  
  
In terms of slots, games disagree on whether to use big slots where you can only fit 4-5 on the screen at once, or small slots that can fit dozens. I think big slots are best (as long as you can scroll to see more), but that's up to you.  
  
Also divided on is whether to include autosave slots on the save screen or not. I think you should: players are better off knowing how often autosave saves, and how many rotating autosave slots the game uses. I also recommend making autosaves distinct from user saves, in that a user cannot save over an autosave slot, or delete one.  
  
Load screens are a similar matter. Your slots should have the same layout, and you should definitely include autosave slots. However, the screen itself should be visually super-distinct from the save screen. If save is green and leafy, load should be a giant red mech. It should be impossible to mistake one for the other, and you should assume nobody will ever see the word "save" or "load" where it is emblazoned across the top of the screen. You did label the screens, right?  
  
There are two ways to respond to a click to load. Well, three, but the click-and-instantly-load option isn't accepted very well, for some reason.  
  
If you are using small slots to fit lots on the screen, when the user clicks on a slot an info card should "pop up" in a standard position on the screen, saying more about the save game (time elapsed, position, party members, ammo, etc). Clicking on the slot OR the info card should load. The info card might have a visual tag - an arrow and a "LOAD" icon - but this should not be the only place to click. Any reasonable click should work.  
  
If you are using large slots or your publisher/platform demands it, pop up a dialog. "Load this game?" Again, I like defaulting to "yes", with the yes under the cursor, but whatever your publisher demands takes precedence.  
  
The automatic naming of save games is an art that most games don't bother with. The location and total time of play are important, but it's also important to give the player some context as to what was going on when they saved. If the game is smart enough, I like to put a "headed to..." or "just finished..." tag on my save games automatically. This is more important in games where there is a lot of backtracking and freedom, and can functionally just tell the player what his active quest is, or what plot point he most recently completed.  
  
\---  
  
Every game should autosave what it can. Not all games need to autosave the exact position of all the pieces, or the velocity of the player, or any of that. A lot of games only need to autosave points and victories and what level you're on. In some cases, this kind of autosaving is so basic that all this talk of slots and loading makes no sense: something like Bookworm Adventures, for example, just saves your progress and that's it. No need for slots, no need for manual saves or load screens.  
  
However, many games with less linear progression and more player freedom will need to think about how autosaves fit into their overall loading and and saving schema. The answer is: autosaves ***are*** your overall loading and saving schema.  
  
The truth is that manual saves are relics. There's no reason not to include them, so include them. But you should build your game with the assumption that the player is going to rely wholly on autosaves. I think you will find that, in a few years, that is exactly what players will do.  
  
Autosaving is still a young science. One important detail is that an autosave can't take any time to do: you can't pause the game for an autosave. This can be troublesome if you need to save a lot of information, but there are always ways. Having the save happen on another thread is always possible.  
  
Despite the fact that autosaves should happen fluidly, you should put up a marker when you do autosave - just a little thing in the corner of the screen. In the future I expect this will be unneeded, but for now people still don't trust autosaves to save well, and you should put up an icon.  
  
Never use just one autosave slot if you have multiple manual save slots. Three is a good number if you're worried about space. If you're not worried about space, use ten. You can revolve through them, but I actually recommend only revolving through them after a certain amount of time (five minutes) has passed. If you autosave ten times in two minutes, there's no reason that should overwrite the entire set of autosaves.  
  
Autosave as intelligently as you can. If the player is about to enter a room with a big battle, autosave. When the player quits the game, autosave. After the big battle, autosave. Something new picked up? Autosave. If you find your game autosaving "too much", it's only a problem if it is affecting your gameplay or slowing the machine down.  
  
In the unlikely event that you are autosaving something with diverging paths (such as the "moral choices" of Bioware games) you should consider autosaving into a permanent slot just before each option, such that no matter how many more autosaves are made, the player can always return there and try the other path.  
  
Autosaves should have reasonably useful names so that, when a player wants to load, he knows exactly where he was and what was going on. Screenshots included in your autosaves are also valuable for this.  
  
...  
  
The last kind of save type is the quick save and quick load. To be honest, I don't like the quick save and the quick load, not unless they are somehow fundamentally linked to the gameplay. I think quick saves will cripple your design if you're a good designer, and let poor design slide if you're a crappy designer. See: every FPS with a quick save.  
  
Some people still love quicksaves. It makes them feel in control. I think it's bad design to cater to that. But, hey, whatever floats your boat.  
  
I have no real advice on their implementation, other than to remind you not to make the quicksave button right next to the quickload button. Put an empty button between them, at the very least.  
  
...  
  
The technical side of loading and saving can be quite difficult for a beginner. Reading from a file to initialize (or re-initialize) tons of values for tons of objects is pretty intimidating.  
  
If your needs are minimal, a simple custom save format will work fine. However, if you're talking about saving in the middle of a level and bringing everything back exactly as it was, you're talking about a whole lot of parsing code.  
  
Many languages can automatically save and load objects if they are correctly tagged. For example, in XNA/C# you can use the \[Serializable\] tag to make it so you can write and read XML representing the object. This is typically good enough for a small project, although if you're talking about a whole world of objects, it can be pretty slow and fatty.  

  
If you are developing a game with a huge number of must-be-saveable elements, you probably want to not develop that game, because it's too complicated for an indie. However, assuming you absolutely must, you have two options.  
  
One is to do most everything through a database. If the state of the object is stored in an in-memory table, you can create versioning information in that table to save the state when you need to. You can write the table to the hard drive intermittently, or when the player quits.  
  
Also, when I develop my tools to do level design, they output a particular script (I normally just use XML these days). For ease of integration, I usually make my save games use the exact same script. This can be optimized, if needed, to only write the changes  between the level script and the current moment.  
  
However, I need to stress: an indie game will almost certainly NOT have such punishingly huge levels that it needs to save using these kinds of methods. Normally, just a simple custom script or a serializable tag will do the trick.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:25 AM](https://projectperko.blogspot.com/2010/04/game-101-saves.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/1987722957435319760 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=1987722957435319760&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [game dev 101](https://projectperko.blogspot.com/search/label/game%20dev%20101)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/1987722957435319760)

[Newer Post](https://projectperko.blogspot.com/2010/05/wickerwork.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2010/04/game-101-menus.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/1987722957435319760/comments/default)
