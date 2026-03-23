---
title: "Generating Episodes with Outrage"
date: 2015-08-06
url: https://projectperko.blogspot.com/2015/08/generating-episodes-with-outrage.html
labels:
  - game design
  - npc
  - social simulation
---

## Thursday, August 06, 2015 


### Generating Episodes with Outrage

Well, I thought about it a lot, and I came up with a new kind of game. It's a base building game - let's say it's about a space station. You build the station, manage the various pieces much like any other construction game.  
  
But it has a second kind of play: you can drop into episodic stories similar to what you might get on a TV show set on your station. Say, Babylon 5.  
  
The secret sauce is outrage.  
  
Instead of health, we track how angry characters are. An episodic story starts quite simply: someone is angry about something. We have a heuristic for setting up the whole situation - plonking in a bunch of characters with simple relationships, some resources, some places. For example, maybe a genocidal ex-warlord is visiting the station in secret, in order to get surgery to change his genetic fingerprint from a gray-market surgeon.  
  
The player created a number of characters as the "named crew" - each with stats, skills, and personality. This time, the linchpin character is the station's official doctor. He realizes who the visitor is and becomes outraged that this warlord is still floating around free, and will escape forever if the surgery is successful.  
  
The situation can be made as simple or complex as our engine and patience allow. We can add in constraints like "in this sector, there is no warrant for his arrest and no charges have been made against him" or "there is an assassin aiming for his life" or "he has young children" or "he has a shipment of slaves" or whatever. We can add as many or as few details as we would like.  
  
The core driving force is the doctor's outrage. It's very high - over the maximum limit. The doctor is on an in-game timer: if he doesn't act within a few hours, the player will lose control and the doctor will act as an NPC for the rest of this episode. Of course, anyone can be enraged and act out because of it, the doctor is simply today's starter.  
  
In order to keep control of the doctor, we have to act. Actions related to the outrage's source will reset the timer, so we can keep control if we do something related to the warlord. Ideally, we would like to reduce the outrage, but that's significantly harder to do since the source is something outside of our control.  
  
Here starts the gameplay proper. What does the player do during these episodes?  
  
The key is to not make the player do anything. The player is allowed to take any action they want (well, that we modeled). We don't insist that the player bring the warlord to justice, or protect him from the assassin, or whatever. The only thing we do is set up a situation where if the player doesn't act, he'll probably lose a character (the doctor will go rogue due to high outrage).  
  
ANY action related to the source of the outrage will delay the doctor going rogue, and the player can take more or less any action. This is a simple-asset 2D game, so you control the doctor mostly via menus rather than any kind of walking around, and that means you can select actions from lists in menus.  
  
There are a large number of unique and interesting skills in this world, and each character you create has some of them. The doctor might have "contagion management" and "medicine" as two high-rated skills. These skills come bundled with generic actions: "quarantine" is one from contagion management, while "sedate" is one from medicine. In addition, the doctor's position as head doctor also gives him some authority over other doctors on the station, including the gray-market surgeon. The doctor also has a huge number of other generic actions such as moving around, calling friends, carrying stuff, whatever.  
  
The key to all of this is that every action causes outrage dependent on how much it annoys the people affected by it. You can avoid outrage if your action is in regards to something that is already causing them outrage, but that's definitely not the case here. If the doctor decides to quarantine the warlord, he can. But it will outrage the warlord and his crew. Moreover, they will all know who they are outraged at: the doctor. This might be good, it might be bad, that's up to the player to decide.  
  
Instead, the doctor could choose to sedate the warlord and sneak him away to some secret place. This causes substantially more outrage, but since it was done in secret, the crew don't know who to be angry at and are instead just angry in general.  
  
The player can continue to take any action they please, targeting any character or place they please. Maybe it's time to activate the cop character: otherwise, those angry crew are going to cause a lot of trouble for the space station. But the cop doesn't know the doctor is the kidnapper, and the doctor is still boiling over with fury: he'll go rogue soon, since he's done taking actions against the source of his outrage.  
  
Fortunately, the cop can use her 'investigate' action and look deeply into the visiting ship. If this had been done right at the start, it would have caused a lot of outrage, but in this case there is an excuse. The crew members don't get outraged - the cop is acting in regards to the source of their anger. They don't get any less outraged, either, but at least their angry actions are delayed while the cop acts on their behalf.  
  
The doctor is also assuaged by the cop's investigation, since the source of the doctor's outrage is the kidnapping victim, and the cop's investigations naturally bring that up. So the result is that the cop gets to investigate while simultaneously pacifying everyone on both sides of the fence. A good way to have the situation unfold.  
  
Complexities, secrets, hidden agendas, and time limits can all be deployed to screw the player up. That part is straightforward.  
  
What's not straightforward is creating and modeling all the various actions that the various characters can take.  
  
Well, it is straightforward, but it needs explaining.  
  
Actions fall into a few basic categories. These categories can be expanded on later if needed, but the idea is the same: variations on a theme.  
  
For example, "lockdown" is one generic action type. This includes arrests, drugging, kidnapping, quarantining, stabbing, delaying, identity chip canceling - the intent is to keep the target from performing specific kinds of actions. For example, kidnapping someone removes almost every kind of action they could take, while locking down their bank account just prevents them from taking actions that cost money. Of course, locking down someone's bank account generates a lot less outrage than kidnapping them.  
  
Each lockdown action filters out various actions and has various acceptable excuses to prevent outrage.  
  
Another action category is "travel". This would include walking, sneaking, driving, taking a taxi, flying a spacecar, flying a battleship, etc. Each of these kinds of travel has a different price and annoys people in different ways, as well as covering different distances with different minimum ranges and with different up-front delays. Travel can be aimed at people as well as places, so our doctor could tail the warlord by using any of these actions with a lower minimum range than his current range.  
  
Another action category is "communicate". This is the action of sharing outrage between people in various ways, and includes gossip, complain, compliment, reassure, etc. One of the biggest issues for the player is that outraged characters will tend to gossip and complain, spreading that outrage to everyone.  
  
Another action category is "investigate". This could include stakeouts, interviews, sensor analysis, hacking into databases, etc. Each specific action has different parameters and different targets, but the fundamental result - coming out of it with more data to act on - is the same. Having additional data can mean knowing more targets (people or places) for other actions, but it can also mean being able to "inoculate" people.  
  
This is when you cause someone to get outraged at something specifically so you can take an action and not outrage them. For example, if you arrest someone without cause, they'll complain and spread their outrage to everyone they can talk to. But if you have evidence that they are a murderer, those people will be inoculated against it, and only people who aren't upset by a murderer will be upset by the arrest. This can even inoculate the murderer in some situations, creating wonderfully complex characters!  
  
Another action category is "instigate". This includes blackmail, allying, fast-talking, seducing, programming, etc. The various kinds of targets that you are trying to convince, the method used to convince them, and the kinds of actions you can make them take might all vary, but the fundamental act of instigating is easy to model.  
  
All of this results in a system where we understand the basic parameters in play and how each category of action affects them. It's up to the player whether they prefer to use stakeouts or interviews to do their investigation. Or perhaps they prefer to instigate instead of investigate. The machine is just as happy to chew on that action and alter the scenario to fit the result.  
  
The difficulty is not the actions, but creating an interesting response to the action. If the player can stakeout or interview, what makes one better than the other? Aside from having one point more skill in one or the other, why would a character prefer one or the other?  
  
That's where the situation needs to be complex and multi-faced. Outrage is a big help here: in trying to minimize outrage, you'll often find one or another action does best. Stakeouts and interviews create or assuage outrage at different times. Stakeouts tend to be secret, creating and assuaging outrage only with other people on the team. Interviews might create some outrage depending on the willingness of the target, but they are also more obvious, and therefore can be used to delay outrage onset by convincing people that you are acting to resolve some outrageous situation.  
  
Combine this with the tactical situation, and you have plenty of beautiful variables. Stakeouts take time - but sometimes that's exactly what you want, if you want to be available to act the moment they do something suspicious. Interviews are fast - but how likely is it that they know something? Are you going to give away more about what you're after than they'll give away to you?  
  
Each character you build has different specialties, but unlike an ordinary RPG, you don't travel in packs most of the time. Each character you bring into a scenario reduces the reward, so there's a lot of pressure to act independently. In addition, outrage can build up between characters and you can lose control over someone if you're not careful.  
  
Functionally, this means you can't always choose your cop. You won't always have high skills in stakeouts and interviews. Maybe it's your systems engineer today, and you need to investigate by hacking databases or deploying sensors. Different parameters, different tradeoffs.  
  
Now, regarding NPCs.  
  
Outraged NPCs are active NPCs. Even mild amounts of outrage make people more difficult to deal with, but the more outraged someone is, the faster and more aggressively they'll take action. The question is: what kinds of action?  
  
The good news is that it's easy to determine what kind of action they'll take. Just pick an action associated with a high skill. "Move" or "complain" if that turns out to be inapplicable.  
  
The really good news is that you can make this have dramatic irony very easily. Whereas the player chooses targets carefully to try and resolve the situation, the NPCs choose whoever will gain the largest percentage of outrage.  
  
For example, the warlord's crew is running around the station causing trouble. They consider troubling everyone, including both the cop and the doctor. The doctor is already hugely outraged, has been since the beginning. Five more points of outrage isn't even a dent. So we hear about it from the cop, who goes from 0 to 5 outrage. This pulls the cop into the story a bit more solidly - she now has a "reason" to get involved.  
  
This basic system means that any person or place that is explicitly introduced will be cycled into the plot opportunistically. It also means that "B" plots are easy - just activate two plots at once, and they'll naturally tangle as NPC actions target the least upset people on both sides and raise the temperature to boiling. It might not even be a player character: the warlord's crew might piss off a visiting trade delegation or your captain's mom.  
  
This is a pretty simple, straightforward system built explicitly for a low-representation game. That is, these actions don't play out in detail, it's more visual-novel-style graphics and focuses more on the results rather than the processes. In a game where 3D models have to act out every detail of staking out or kidnapping or flying space ships, this would be prohibitively expensive. But if we restrain ourselves, it's easy to model them statistically instead of physically.  
  
That's the outrage engine I invented, and this is the shortest essay on it I could write. First time it's been less than ten pages long.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:48 AM](https://projectperko.blogspot.com/2015/08/generating-episodes-with-outrage.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8218072505997220029 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8218072505997220029&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design) , [npc](https://projectperko.blogspot.com/search/label/npc) , [social simulation](https://projectperko.blogspot.com/search/label/social%20simulation)


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8218072505997220029)

[Newer Post](https://projectperko.blogspot.com/2015/08/good-bad-game-design.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2015/07/life-in-game.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8218072505997220029/comments/default)
