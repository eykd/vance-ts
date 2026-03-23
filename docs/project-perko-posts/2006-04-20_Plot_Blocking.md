---
title: "Plot Blocking"
date: 2006-04-20
url: https://projectperko.blogspot.com/2006/04/plot-blocking.html
labels:
  []
---

## Thursday, April 20, 2006 


### Plot Blocking

Very long!  
  
**Overview**  
  
I've been plinking away at a new system for handling plots in computer games. I've come up with a tentative scripting meta-language which, in theory, can handle any kind of plot *and allow a computer to change the plot slightly to account for player capability*.  
  
Of course, I can't decide what to call the language. I think that "plotz" and "plotalot" are both likely to have it die without ever being born. Heh. I guess I'll call it "Perkplot", at least for the moment.  
  
Perkplot works as a constraint system using a few basic fundamentals which all plots share. Although Perkplot cannot *come up* with plots, it can *modify* plots to take into account a given player's capabilities by adding or relaxing constraints, and *instantiate* a full plot without requiring everything to be carefully scripted.  
  
**What's a plot?**  
  
A plot in Perkplot is a set of constraints and challenge markers. A challenge marker changes constraints and a constraint limits how you can reach or use a challenge marker. A constraint may be, but is not usually, a plot.  
  
For ease of discussion, a plot is considered to have "nodes". A node is a given group of challenge markers and constraints.  
  
For example, if you wake up in jail, the first plot node might involve getting out of the cell. The second might involve getting past the guards. The third might involve figuring why you're in jail. Each of these nodes probably has a fairly large number of constraints and challenge markers, but another node is not likely to share them.  
  
These nodes are for simplicity of discussion: they are not actually inherent in the language of Perkplot.  
  
**Challenge Markers!**  
  
Challenge markers are the heart of the plot. This is how plot moves forward. A challenge marker may be a place, an event, a thing, an acquisition, an action, or anything else that can be measured by the game. A challenge marker allows you to move from one plot node to the next because when it is triggered, it changes the constraints and challenge markers in play.  
  
If multiple challenge markers are reached simultaneously, the one with the highest priority happens first. If there are two markers with the same priority, the one with the most constraints on it happens first.  
  
This allows you to perform some detailed plot "trees". For example, if someone reaches a room, you can have two markers in it: a "reached room" marker and a "reached room with ally still alive" marker. In the latter case, there's a constraint on it: the ally still has to be alive. Therefore, it fires first. In firing, it erases the "reached room" marker.  
  
They can also call other markers. So maybe the reached room and reached room w/ally markers both call another marker which is used for the results they share.  
  
Anyhow, just traveling from marker to marker isn't terribly fun. Therefore, we put in constraints.  
  
**Restraining Orders**  
  
constraints are things which change the way the universe works. This allows plots to actually exist rather than just be a long line of challenge markers.  
  
For example, if a plot is about a virulent space disease, then one of the constraints might be that certain people get sick and cannot travel. This sickness may even spread. This constraint changes the way the world works and also packs a strong emotional punch. This constraint sets it apart from another plot about space pirates or tribbles.  
  
Anyhow, constraints are often used to keep players away from challenge markers. This is the challenge of a plot: to solve it despite the difficulties.  
  
There are a few kinds of common constraints:  
  
Data constraint: A data constraint is something which could theoretically be solved without any information, but is very difficult to. So you need to go hunting. It's very similar to a key constraint, but generally can be bypassed by walkthroughs or multiple playthroughs.  
  
Key constraint: A key constraint is the classic widget hunt. Of course, not all widgets are physical. A key constraint can require a keycard, a code, a person, a decision, an attribute, and answer... anything, really. It's a very specific constraint often used when you need to highlight a given piece of information, person, or map area.  
  
Character constraint: A character constraint is something which requires a character skill or attribute at a given level. For example, lockpicking. In simulationist games, you can usually use other characters to fulfill these constraints. In a less simulationist game, using another character's skill would fall under a key constraint rather than a character constraint. The biggest difference is that a key constraint always has a solution. A character constraint might not.  
  
Red Herring constraint: This is a constraint which exists solely to make the player try to solve it, even though it is unsolvable. Perhaps it requires an impossibly high skill, or a character that's dead, or a widget that doesn't exist. These really piss players off.  
  
Hunt constraint: A hunt constraint is a constraint that can be fulfilled by trawling the area. Whether social, physical, or locational, the hunt constraint offers a way "past" the other constraints *without disabling them*. For example, finding a hidden door or getting the king to write you a letter of recommendation.  
  
Skill constraint: A constraint which the player must perform an actual skill-based game to fulfill.  
  
Chain constraint: A chain constraint is a constraint which can only be fulfilled by reaching another challenge marker (and, usually, solving a bunch more constraints).  
  
None of these constraints are actually different in terms of the language: they are differentiated specifically for discussion. In the language, you simply list the method(s) by which a constraint may be filled, whether that's a challenge marker or a ball-point pen. (This is why some of the "types" of constraint conflict.)  
  
**Can't Get No Sastisfaction!**  
  
The problem with simulationist games is that players will often find that a plot has become either very easy or impossible.  
  
By creating a constraint satisfaction language for your plots, Perkplot allows the system to adjust the constraints to match the available resources.  
  
When a constraint is introduced, Perkplot determines roughly how easily it can be satisfied. For example, if a constraint requires someone with red-level access and two of your party members already have it, the constraint is worthless. Therefore, new constraints need to be created to make the game a little more fair.  
  
Each constraint has a supposed difficulty. Although they could be painfully marked one by one as the game is created, it's generally easier to just have "easy constraints" and "hard constraints", along with maybe a few "very hard constraints" for things like bosses. constraints which are created in play have this difficulty automatically calculated and compared to the difficulty they were intended to have.  
  
If a constraint comes in as significantly easier than it should be, a new constraint is created at about half the difficulty difference. This means that making wise choices is still rewarded, but without making the game a cakewalk.  
  
Creating additional constraints is one of the key elements of Perkplot. It uses what is pretty much simple graph theory to determine a valid additional constraint for the too-easy constraint in question. The constraint may go "above" the first constraint, requiring you to do something before you can fulfill it, or "below" the first constraint, meaning you do the first constraint and then realize you're not done.  
  
An example of the first would be if your red-level clearance party member was kidnapped: you have to track him down to get your red-level clearance back. An example of the second type would be if after you open the door, a monster attacks you.  
  
In addition, if a constraint turns out to be considerably harder than it should be (and is the only path to a marker), a new challenge marker is added that will bypass the too-hard constraint. For example, if you need red-level clearance but everyone with that level clearance was spaced, the "blow the hell out of the door" marker will be added, allowing you an alternate method of obtaining entry.  
  
Of course, in a simulationist game, this is usually not needed. Although spacing the captain would make it harder to get that clearance you need, there should be a large number of other ways of accomplishing your goal through the "natural" laws of the universe. Crawling in through ductwork, or hacking the door, or blowing it up, or going back and finding the captain's spaced body.  
  
Also, good designers will likely have several "routes" to any given marker. If a route is too easy, it is made harder. But if it is too hard, simply take another route.  
  
Either way, we run into one of the problems that this system was created to prevent:  
  
**Invisible constraints**  
  
Very few games have every constraint spelled out to you. Moreover, even the ones which are spelled out usually have lots of steps which are not. However, an automated system cannot meaningfully choose if and how to represent constraints.  
  
constraints are the part of the plot that give it an emotional appeal. As a writer, the designer needs to tell the constraints as best he can in order to make the player feel like something important is happening. The system cannot frame constraints such as "Dave just died" in ways which are both interesting and touching. That's the writer's job. They should write in a cut scene, or a piece of dialogue, or something.  
  
But the system does create new constraints. These constraints have to be clearly stated, but need not have any emotional content. For example, if the door breaks and you can't get through, the game can simply tell the player, "The door is broken. Maybe there's another way around/Maybe there's a way to fix it." (Whichever is the case.) It doesn't have to try to inspire you to any emotion other than irritation.  
  
This is the missing heart of the system: it generates no inherently emotional content, just balancing content.  
  
**constraint Levels**  
  
Creating constraint series is what the whole game is about. Really, you just move from constraint to constraint during the course of any game, with occasional bouts of luck and skill in any given constraint.  
  
For example, imagine a level from a game like, say, Doom. Each corridor and room can be thought of as a constraint: once acheived, new constraints are made available. The room off to the side. The collapsed rubble pile. The elevator.  
  
A hallway can even be broken up into multiple constraints, if it is long enough for that to make sense.  
  
These constraints would allow us to modify the level to change over time. If the level is too easy from point A to point B, one of the constraints fails. A hallway collapses. A door needs to be unlocked with a widget from point C. Etc.  
  
Any physical level can be designed like this. Moreover, any *nonphysical* level can be designed like this.  
  
Peoples' relationships can be defined as a set of constraints. People's positions can be constraints. People's beliefs can be constraints. What weapon can affect someone is a constraint. How much damage they can take is a constraint.  
  
All of these constraints change the way your world works. They can be built with painstaking personal care, or they can be assembled by algorithms. They can be big, affecting the whole game, or small, affecting one corner of one room. They can be physical, mental, emotional - anything you want. You can have a constraint that says all type 1 doors can be blown off their hinges with explosives, or a constraint that says this particular door can be.  
  
The key here is that constraints are a navigable graph. You can tell which constraints lead to which constraints, and thereby you can tell how many "nodes" and how much "difficulty" there is in trying to accomplish a specific task.  
  
When the constraints gain too much complexity, things can start to become a little shaky due to the difference between the searching algorithm and the emotional player simply grokking the situation. But for most games, that's simply not a problem.  
  
(Don't forget: a constraint can be long term. It's not like every time you hit a challenge marker all the constraints go away. The ammo you spent and the friends you lost stay spent and lost...)  
  
**Simulation**  
  
Perkplot is useful for more than just making your plots adapt to a chaotic player presence. It's also useful for adapting your non-plot elements *and* allowing you to plot a plot in vastly more detail.  
  
Preferably using a computer tool, you can reduce a given plot sequence down to a set of constraints and markers. You can bring in what the player is likely to have as resources, see if it works okay. Moreover, you can bring in the bizarre extremes that players are likely to bring in: the player who can't hit the broad side of a barn. The player who's been leveling for the past two weeks. The player who hates your stupid mascot character so much that he leaves her dead continuously. The player who forgot to buy a new weapon and is still weilding "pointy stick, mark one".  
  
This is especially useful in more simulationist games. You can write a simple script to run through all the permutations. What if the player brings comes in a mage? An archer? A swordmaster? A berserker? A thief? What if he comes in with eight hundred packs of high explosives and no gun? (A valid tactic in surprisingly many games...)  
  
What if the player is friends with group A? Group B? What if he hates both? What if he has them radically outclassed?  
  
Now, there are parts of your game that might not technically be constraints. Like the NPC AI. I suppose you could make it a series of restraints, but it would be kind of messy. So, this simulation is far from perfect. But... it is helpful, don't you think?  
  
**Memetic Locking**  
  
It is easy to program in a system of adaptive constraints which allow for and more fully utilize pattern adaptation control, wolfpack memetics, and some other fun content adaptations using words nobody who hasn't read this blog has heard. :)  
  
The grain is a little coarse, but it's still much better than existing systems, which don't have the capability at all.  
  
**Example**  
  
Just in case it's hard to understand, here's an example.  
  
Let's say it's a college hijinks game. You live in a dorm, as do many other characters.  
  
The level constraints are relatively simple. In the dorm, each wing of each hall is a constraint. While fulfilling that constraint, you can go to stairwells, elevators, hallways, and rooms constraints which are fulfilled by the constraint you are currently standing in.  
  
So, if you're standing in your room, the only constraint it might lead to is the hallway constraint. From there, you might take the elevator constraint to the lobby constraint and out into one of the campus constraints. We'll stick to our dorm for now.  
  
Each person in the dorm has his own laundry list of constraints. Who they like, what their schedules are, which room is theirs, what they enjoy. This allows the player to interact with them in a more freeform manner. If correctly programmed, the constraints in this part are open to freeform alteration. Ellen likes Frank? You can intervene. Maybe get Frank to go out with her. Maybe get her to hate Frank. Whatever.  
  
The exact level of response we can get from these characters depends on how we've built our restraints. In our game, we might be able to get Ellen to fall for us, or if reality doesn't bend that far, maybe not.  
  
For plots, maybe we have a power failure. Our constraints come into play. It's dark. The elevator fails. The campus' overactive security doors slam down into "bulkhead" mode and the stairwells aren't accessable.  
  
Our plot demands two people in the elevator: Gerard and someone else. Gerard is terrified of dark, enclosed spaces. Who else is in there?  
  
Well, it could be random. Or we could have a specific person. Or, more likely, we can choose someone based on their *connectivity with Gerard*. Of course, to allow NPCs to freely change their opinion of other NPCs, we'd need a pretty solid social engine, but we could have scripted changes without too much issue. Maybe Gerard is stuck in the elevator with whatever's closest to an enemy. After a little while, they get in a fight. After that, they give up on being enemies and come to an understanding. After that, Gerard goes cannibal.  
  
We could set it up however we like. That is why *we* write the plot, not the system.  
  
How would you rescue Gerard and his enemy? Well, we can also define that, but remember that we already have a constraint net in place. We need to remember to disable the standard "hallway to elevator" constraints. Then we put in new constraints: turning the power on, breaking the doors open, whatever. We can put in some other constraints where we can shout to people on other floors, or even go out and in windows. Maybe we can hear Gerard yelling and pounding on the door.  
  
All of this can be done with constraint management.  
  
If you got this far, you are a patient person, and you have invested an absurd amount of time in this. So, invest a little more. Comment.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:57 AM](https://projectperko.blogspot.com/2006/04/plot-blocking.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/114557747295111537 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=114557747295111537&from=pencil "Edit Post")


#### 8 comments:

[!\[Image\](https://cfoust.8bit.co.uk/images/myeyes.jpg)](https://www.blogger.com/profile/04620030154228411039)

[Textual Harassment](https://www.blogger.com/profile/04620030154228411039) said...

Cool. Not only is this an interesting system, The terminology you use is a great vocabulary for talking about level design.  
  
How far would an adaptive constraint system go? If I go challenge the boss with just my pointy stick, should I be able to beat him? Ideally, IMO, the boss should defeat me until I have improved myself enough to win. But then we are getting into a sort of branching plot.  
  
Oh! or would the boss simply not appear until the time is right? I'm not sure whether I should consider the boss a node or just a kind of constraint. It could probably be used either way.  
  
If you really can anticipate the wide range playstyles the players will try (and maybe you can, but I'm a firm believer in the ability of players to break any system), this sounds like a great way to keep a plot on track and to keep it somewhat interesting to the player.

[8:11 PM](https://projectperko.blogspot.com/2006/04/plot-blocking.html?showComment=1145589060000#c114558909449452591 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114558909449452591 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

The language doesn't tell you what to do: it just lets you do things you might not have been able to before. So, you would have to decide for yourself what you want the boss to do to someone with a pointy stick. If you want it to not appear, it can stay away. If you want it to kill you, it can kill. So on, so forth.  
  
These are the things which automated systems cannot decide. That is why this system doesn't try. It simply gives you the tools.  
  
Any system can be broken: this one is not invulnerable. But it does allow for *better* simulation, and that's, well, better.  
  
Also, it can adapt to player breakage. If the player is not having the difficulty he should be having, it can adjust what it views as difficult.

[8:47 PM](https://projectperko.blogspot.com/2006/04/plot-blocking.html?showComment=1145591220000#c114559126481064147 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114559126481064147 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

This sounds much more workable than what I thought you were proposing earlier. I like the idea that, in a multi-pathed environment, if you're doing well already, some of the easier paths will be blocked off. I think that's an easy first-step to this idea, and I think it's within reach to do that well.

[8:20 AM](https://projectperko.blogspot.com/2006/04/plot-blocking.html?showComment=1145632800000#c114563280988662925 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114563280988662925 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I think so, too. :)

[8:26 AM](https://projectperko.blogspot.com/2006/04/plot-blocking.html?showComment=1145633160000#c114563321801769811 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114563321801769811 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_J9nH8VP3jPY/SaBVJVlCjeI/AAAAAAAAAEE/NwbzPSlkeSg/S45-s35/monkeypickedtea.jpg)](https://www.blogger.com/profile/04258136580607405464)

[teamonkey](https://www.blogger.com/profile/04258136580607405464) said...

This looks good and very workable.  
  
The way you describe Challenge Markers sounds almost exactly how I usually script missions - a "switch" statement where each "case" is a different stage of the mission. A challenge marker seems to be describing the point at which I alter the value of the variable on which the switch is operating.  
  
I know that's the least interesting bit of your post, but as a result I can see your system being applied as a very useful way of planning out a quest or mission, complete with complex interactions and dynamic restraints (which is a bit mind-bending at the moment). A formal visual representation certainly wouldn't go amiss.

[10:40 AM](https://projectperko.blogspot.com/2006/04/plot-blocking.html?showComment=1145727600000#c114572763667947876 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114572763667947876 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgV0GDkqo1 Spre3kVrDWY1m0 Vu1WKWZBlRvP2VXzBQKLWcjtIYRS-RnSn9HBOlnCQmgCnAi9 ZwUsu-3y765sGe9n\_d-D5 OzhmDtP3UONl3rUjbWNKe25 SxVKrwaeedsnA/s45-c/Me.gif)](https://www.blogger.com/profile/00811255096467614445)

[Mory](https://www.blogger.com/profile/00811255096467614445) said...

Either you or I don't quite understand what you're talking about- I'm not sure which.  
  
"Peoples' relationships can be defined as a set of constraints. People's positions can be constraints. People's beliefs can be constraints. What weapon can affect someone is a constraint. How much damage they can take is a constraint."  
  
Let's imagine character Bob. He likes apples. He is friends with Tom. He is a Zen Buddhist. He is vulnerable to gun shots. He is very sensitive to social pressure. If I've understood you at all, then none of these are constraints. No, they're either concepts the writer has given himself in order to decide how to write the character, or properties plugged into your magical "pretty solid social engine", which incidentally you glossed over.  
  
Tell me if I've got this right: You've described a constraint as some sort of challenge which must be overcome by the player. (Not really much more than a glorified *if* statement.) Bob liking apples is not a constraint. If he won't talk to you until you give him an apple, *that's* a constraint. And that's not a plot- it's a puzzle.  
  
Granted, Plerkot (Can I call it Plerkot?) is a good idea for certain types of RPGs and the like. (Not all, or even many; I'll get back to that later.) But with all due respect to your strip poker game, no one has yet succeeded at making a social simulator which is capable of coming up with plausible reactions on the fly as part of a larger story. That's the hurdle interactive storytelling must overcome, and I don't see how Plerkot can get around it.  
  
If the character in the elevator with Gerard is random, how is the program going to figure out how he'll respond? Obviously, the writer needs to put that in, which means that he still has a large number of branching paths to look after and Plerkot doesn't change anything. Whatever happens in that elevator is going to affect the relationships of the two characters, which pushes the story in a completely different direction- Where is Plerkot making this any easier?  
  
"Imagine a level from a game like, say, Doom. Each corridor and room can be thought of as a constraint: once acheived, new constraints are made available. The room off to the side. The collapsed rubble pile. The elevator."  
Now this I'm even more confused about. How is a room a constraint? I can see how the things *in* the room could be seen as constraints, but the room itself? What, are we supposed to see any walking at all as hunt constraints? Position is not a constraint, it's simply a variable the programming needs to take into account. But you go on:  
"So, if you're standing in your room, the only constraint it might lead to is the hallway constraint. From there, you might take the elevator constraint to the lobby constraint and out into one of the campus constraints. We'll stick to our dorm for now."  
Does this actually mean anything at all?  
  
Getting back to the difference between a puzzle and a plot, as I mentioned before: You say that Plerkot "in theory, can handle any kind of plot and allow a computer to change the plot slightly to account for player capability." I can accept this to a certain degree, but it puzzles me how **you** can.  
  
Let's go back to our new friend Bob. He won't talk to us unless we bring him an apple. So bringing the apple will cause him to push the story forward with the next scripted segment. But what if, earlier in our story, we ate the apple? The game will see that the progression is too difficult, and allow us to ask him to continue anyway. In both branches of the story, the continuation will be identical; it's just how you get there that's different.  
  
In my perspective, the two branches, on the whole, are slightly different from one another, and one will certainly be **better told than the other** (taking into account pacing, long-term payoff of plot threads, etc.). But from your perspective, these two branches should be seen as **exactly** the same! After all, have you not said that "there is a fundamental difference between experiencing a story - even an interactive one - and experiencing a game"? What the program is changing is not the plot (as you see it), but the gameplay which leads to it. The puzzle.  
  
Another point which puzzles me:  
"These constraints would allow us to modify the level to change over time. If the level is too easy from point A to point B, one of the constraints fails. A hallway collapses. A door needs to be unlocked with a widget from point C. Etc."  
What do you mean by "too easy"? The player has some gun he wasn't supposed to have yet? The level has shifted in a way not planned? These thoughts worry me. They paint the picture of a game thrown together randomly, with no thought given to emotional impact, difficulty curve, pacing, proper training, or anything else but the movement from A to B. I have seen certain games like this, particularly from America, in which there is very little thought placed behind any of these things, but it is a poor game which relies on such a messy design job- cheaply produced RPGs and the like.  
  
**A nonlinear game is *never* as good as a linear game.** If the program needs to figure out to correct the difficulty, then the difficulty hasn't been designed well to begin with. And it should have been, because the computer-corrected version of the game is not going to be anywhere near as compelling as a solid, straightforward level designed by a good level designer.  
  
So here's how I see Plerkot (until you post to correct me and explain what you *really* meant): Not very useful for plots, an interesting idea for RPGs and puzzle games -but ill-advised for both.

[11:14 AM](https://projectperko.blogspot.com/2006/04/plot-blocking.html?showComment=1145729640000#c114572965641643203 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114572965641643203 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Teamonkey: the idea is that there are pieces that can be applied without too much trouble, and pieces that are more advanced. Sort of like learning enough French to get to your hotel, as opposed to learning enough to date a girl.  
  
Mory: I think we have a deep misunderstanding. I'll make a post on it in the fairly near future - maybe tomorrow or Monday.  
  
Short answer: I'm not using "constraint" in the way you think I am. A constraint is merely something which defines the rules of the game system within a given scope.  
  
So "John likes apples" is not a constraint *unless* there is a social system (which is totally optional and in no way integral to the concept). If the social system allows you to make friends with people by bringing them their favorite things (like, say, DOAXBV) then "John likes apples" is a constraint. It defines a piece of how the game works.  
  
John doing something for you is a *challenge marker*, not a constraint. The constraint might be "you must bring John apples". When fulfilled, it would allow you to reach the challenge marker.  
  
The idea that a challenge marker is the same even if you make it easier/more difficult to reach is, unfortunately, inherent. Because the system does not understand the deep magic of emotional appeals, changing the plot result is something that only a writer can do.  
  
He can, of course, write in several scenarios, like classic tree structure. In this case, the only real use Plerkot or Perkplot would have is in allowing them to clearly write out what the *game dynamic* behind the plot at any given time is. Oh, and some difficulty adaptation.

[4:53 PM](https://projectperko.blogspot.com/2006/04/plot-blocking.html?showComment=1145749980000#c114575003723463322 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114575003723463322 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I think its solid, and I'm glad you included nonphysical level designs, like causal bubbles in a storyworld.  
  
I would use the term "metaplot" instead of "plot", in the sense you use the word, since a plot is a single instance of causally linked events, and a metaplot is a framework within a constrained dynamic of different plots can happen. Just a hair split.  
  
To address Mory's point about on-the-fly reactions, I think Storytron actually does this, but only in an illusory sense, the reactions are part of the scripts, which involve the verb being used, the boolean role of the reactor, and the formulas that weigh their choice of options, so that believable reactions happen consistently. I'd like to hear Craig's approach to this in his engine, as well as what the content demands would be (a.k.a. the abstracted "level" design) once a framework has been constructed.  
  
I think a data medium for describing both constraints and the "writing" would be memes, where the non-constraints are meta-memes which are semantically valid only in relation to the hard materials.  
  
Its a good start, I'll send you your paycheck in like, eighteen months.

[6:41 PM](https://projectperko.blogspot.com/2006/04/plot-blocking.html?showComment=1145842860000#c114584286697133329 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/114584286697133329 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/114557747295111537)

[Newer Post](https://projectperko.blogspot.com/2006/04/protection.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/04/lazy-smart-people.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/114557747295111537/comments/default)
