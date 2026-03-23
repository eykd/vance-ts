---
title: "Language of Plot!"
date: 2006-05-05
url: https://projectperko.blogspot.com/2006/05/language-of-plot.html
labels:
  []
---

## Friday, May 05, 2006 


### Language of Plot!

The time has come to explain the magical language which lets Perkplot work. Hopefully, you remember the basic [introduction](http://projectperko.blogspot.com/2006/05/perkplot.html) I gave a few days ago. This will tell you exactly how the damn thing works in the nitty-gritties - but only basic examples.  
  
Let me describe it from a workplace perspective, since there is no way you'd sit down and code the interpretable files directly. Instead, we're staring at an interface that might remind you of a flowchart generator.  
  
Every node on the flowchart is a fragment (formerly called "element"). Each fragment has a different context, perhaps denoted by the shape or color of the fragment. Lets say this is a diagram for a "save the princess" section of the game. There are half a dozen fragments, but the ones which draw our eyes at this stage are the "princess" fragment - colored green, meaning "character context" - and the "plot" fragment, a kind of master fragment colored purple, meaning "controller context".  
  
There's a line connecting them: an arrow from the princess to the plot. Let's click on the plot fragment and see what's up.  
  
The plot fragment unfolds into a new window showing what appears to be - of course - another flowchart. The nodes on this flowchart are "bundles". Some are constraint bundles, some are command bundles. There is a section for inputs, showing fragments which feed into this one (at least, that's what it shows at this stage).  
  
We'll say we're in a "basic" mode, as opposed to a more complex "expert" mode. This means that we don't have to see all the dancing lines. Instead, we only see the lines connecting the bundles to each other. There are a variety of lines shown. We were building this, but it doesn't work right. So let's scrap it and start over.  
  
We choose to keep the inputs, and we're left with a blank screen save for the incoming fragments on the left. We drag the princess on to the screen. A bundle is created. We label it "at the top of the tower".  
  
Let's put the princess in a room. We look over to our inputs and see "level engine". Drag that on to the princess' node. Now there's a red "level" line running out to a newly created empty node. We could enter constraints manually, but let's right-click the empty node.  
  
Look at that! A context-sensitive menu. It gives us a list of things that the level engine fragment we're using is willing to provide. Including submenus, if necessary. We'll select "room".  
  
The princess is now in a room. Probably not the right kind of room, as we've just stuck her in whatever the engine considers to be a default room.  
  
So, lets click on the bundle and enter the bundle editor. This is a list of constraints and commands, connected like a flowchart.  
  
We see the incoming pink line, and it is attached to a small cascade of constraints that were automatically inserted when we told the level system to give us a room. These constraints pipe into the level engine fragment, so they are essentially parameters passed to the level generation system. One of them says, "structure: room". Another says, "architecture: generic". Another says, "purpose: generic". There's also one saying, "size: 15x15x10".  
  
We edit the architecture constraint such that it reads "architecture: royal". The purpose becomes "bedroom".  
  
There's a little red thread coming off the bottom of these. It reflects the thread of the room. Think of it as the room object. Click on it, pull up a context menu. My, we've done a lot of development on this level engine. We select "door" and, from the submenu, "locked".  
  
A new node. "Door: locked".  
  
We originally had this produce another red thread for the door, but we decided that was simply too much complexity. Instead, we modify the "door: locked" and make it "door: wizard key". The engine knows that if it says something besides "locked", that's the item it takes to unlock it. (More specifically, that's the fragment we need to introduce to unlock it.)  
  
If we run our game, we'll see the princess is now locked in a room. Of course, the room isn't currently connected to anything, nor is it really in a tower. That would require more work. Depending on the adaptability and graphical quality of our game, it might require some significant level design. Since the file format is transparent, you can actually have another program built specifically for level designing if you like - although you'll have to write it yourself.  
  
Anyhow, this isn't so bad, is it?  
  
Unfortunately, that's just constraints. We've also got commands.  
  
Commands are what allow your game to be a game rather than a movie. They can pause, force, activate, watch, import, modify, and volunteer fragments. They can alter, replace, or create new constraints and commands. They can also directly interface with whatever IO you've got running, although good programming practice insists you limit that to a few IO-specific fragments.  
  
Commands are activated when a thread is activated. Remember threads? The princess was a thread. The room was a thread. All fragments turn into threads when you import them. Similarly, groups of constraints (and commands) can be turned into threads.  
  
Let's go back to our princess. In the invisible time between paragraphs, we've created an entire tower for our hero, and the ground outside. Let's add some commands.  
  
We have a "player" fragment that enters this "plot" fragment we're working on. (Actually, it's not so much a plot fragment as a level fragment, so while we're thinking about it, we quickly go and change the fragment's context.)  
  
Let's create some commands in the "front of the tower" bundle (similar to the "top of the tower" bundle we created a few paragraphs ago). We create a command which sends a constraint thread (like the "room" one that called the level engine) out to the "display fragment". It says, "display: portraittalk", "words: 'Help me! Help!'". We also drag the princess on to that thread. Our display code knows to take the portrait specified in the princess' fragment, so we don't need to specify exactly what it is. Now we have a three-component thread: two constraints and a thread (which, if you remember, is just a big-ass list of constraints, threads, and commands). It goes into the display fragment and causes a display. The display fragment does not weave this particular display into a thread, because we designed it that way.  
  
However, at the moment, that command to send that thread to the display fragment will never trigger. It's not connected to a thread which can activate. So, we drag *it* onto the player fragment, rather than the other way around. It is now connected to the player fragment. If that player fragment enters this fragment, it automatically becomes a thread (all fragments entering other fragments do). If the player thread reaches this particular bundle, it activates the code.  
  
In short, if the player walks to the front of the tower, the princess shouts, "help!"  
  
It's a simple example, of course, and it took some time to describe. But, it seems fairly intuitive and quick. You can program much more complex things.  
  
Of course, commands don't have to be stuck in bundles. In fact, we've automatically created commands which activate this entire fragment when the time is right. Each of the fragments linked to this fragment (the princess, the level engine, the player) is accompanied by an "activate fragment if these threads activate" set of commands, perhaps sheathed in a constraint which makes limits them to activating in a specific scope (such as if the player steps within a hundred meters of the tower).  
  
The game itself is just as easily controlled, because the game fragment is constantly updating. You can call it - or feed off of it. For example, the level engine we called to create our tower feeds more explicit commands into the game engine which create the actual level. Similarly, the player moving around changes what the game engine's outputs are, until it stumbles across one we can feed on.  
  
This is the first "level" of programming. Not included here are active fragments and a clearer description of recombinatory/self-modifying fragments. I also didn't tell you how the context menu is created. I didn't tell you how scopes work, or how automated connectivity works.  
  
I will. But not today.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [9:42 AM](https://projectperko.blogspot.com/2006/05/language-of-plot.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114685409912028649 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114685409912028649&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114685409912028649)

[Newer Post](https://projectperko.blogspot.com/2006/05/croquet.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/05/perkplot.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114685409912028649/comments/default)
