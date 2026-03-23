---
title: "!ScriptableObject"
date: 2016-07-06
url: https://projectperko.blogspot.com/2016/07/scriptableobject.html
labels:
  - prefab
  - scriptableobject
  - unity
---

## Wednesday, July 06, 2016 


### ! ScriptableObject

Recently, a lot of people have been referencing [Richard Fine's video on ScriptableObjects](https://www.youtube.com/watch?v=VBA1QCoEAX4&feature=youtu.be). I'm gonna go ahead and rebut it.  
  
A few details: I loved ScriptableObjects. I made videos about how to use them. I certainly don't dislike Richard Fine, I think he does pretty solid work. But I think his obsession with ScriptableObjects is really muddying waters, and his video is misleading.  
  
Things have changed in the prefab world.  
  
Used to be that if you wanted something shared everywhere, you used ScriptableObjects. No matter the scene, no matter the situation, references to that ScriptableObject would point to the asset in the project, and one change would change it everywhere.  
  
However, in the past few years, prefabs have grown a lot of muscle. It's easy to overlook, because prefabs wear baggy clothes, but now you can (and should) use prefabs for many of the things he recommends using ScriptableObjects for.  
  
(And for the rest, you should use a real database.)  
  
You can reference uninstantiated MonoBehaviours now. You can read their values, call their functions, trigger their events - all without instantiating. What does this mean?  
  
It means that everything ScriptableObjects used to be good for, MonoBehaviours can do... and can unlock much more powerful patterns than ScriptableObjects tend to allow. Unity was built around the concept of prefabs and MonoBehaviours, and now we can merge that power with prefab referencing.  
  
Let me describe the patterns I'm using in The Galactic Line. These are MonoBehaviours-with-muscly-prefabs patterns.  
  
**The Magic Mixin**  
I have a lot of space ship parts. I don't like instantiating them, because they're heavy: they have LODed visuals, sound clips, lights, lots of stuff that I want to leave on the cutting room floor if the ship is too far away to see... but I still want to simulate the ships. Hundreds of ships you can't see, still being simulated as their resources drain away and their mission timers tick up.  
  
Ships are easy enough to simulate, but you need each of their parts to tell you what it does as time passes. What does this reactor do? It drains water and creates power. It drains antimatter and creates power, heat, and radiation. It's pressurized. It's not pressurized. It has these external visuals and collision meshes, these internal visuals and collision meshes. It makes these sounds in these situations. It has beds in it for some reason. Or maybe not.  
  
When I get close, these parts resolve into a GameObject. They have to, because we have to see them and hear them in the scene. I could bend over backwards to avoid making a prefab... but why? It makes sense to make it a prefab, that's what prefabs are for.  
  
The problem is that I want to access all that juicy functional stuff without instantiating the part.  
  
I could make all of them ScriptableObjects, but then we have a staggering number of floating loose ends. A radiation-production ScriptableObject saved off in some other directory, values specific to this reactor. It makes more sense to have a radiation-production MonoBehaviour and stick it onto the part. I can just customize it right there, no need to have dangling assets. That's what the GameObject is for.  
  
And I can access all of that directly, without instantiating anything. If I want to know how much power this reactor creates and how fast it guzzles fuel, I just ask it. If I want to know if it's air-tight, I just ask it if it has an air-tight mixin. If I want to know what its UI thumbnail is, I just ask it. Want to know what sounds it makes? Just ask. I need to simulate ten weeks of warp travel? Just ask it for those values and multiply by ten weeks.  
  
I can load everything I need onto the part prefab. It doesn't matter how complex the part is. It doesn't matter whether it involves nested objects or flat mixins. Modders can clone and alter the part, and it won't screw up the default because the values are per-prefab.  
  
In addition to being super easy to take care of and keep track of, I can then just drop it into the scene. Whether it's in play mode or edit mode, I can drop it into the scene and it will instantly be the thing it is. I can mount in anything I want, visually. LOD? Or not. Lighting or not. Hell, additional cameras displaying to holographic monitors? Sure. Sounds that play differently depending on how much the generator is being taxed? Why not!  
  
In this way, anyone can create ship components, drop on the relevant mixins (such as "Reactor" and "PressurizedSpace"), save it. They know what they'll get, and the game engine automatically optimizes to prevent any bloat. Advanced users can hook UnityEvents up to create nice triggers and visuals, or even create new scripts. Just drop 'em in. No loose ends, no complicated dependencies.  
  
Now, if the thought of a largely undifferentiated ball of objects makes you cringe... this method of creating and saving content is a fundamental in Unity. This is how Unity is engineered to work, and this is how it works most easily.  
  
You can engineer around it, but why? Use the engine in the way it's meant to be used, and you'll have a much easier time of it.  
  
**The Meta-Instantiator**  
My ships have a lot to keep track of, but I don't instantiate any of the parts if I can get away with this. This means I can have a fleet of Star Destroyers, each containing thousands of crew members, and from the perspective of the game it's just a bit of data that gets processed whenever it needs to be.  
  
The ship has a link to the blueprint prefab for the ship class, which in turn contains all the ship parts. If I instantiate that blueprint, I get a nice, shiny ship full of visuals and noises and stuff.  
  
But I don't have to instantiate it. Instead, I crawl through the parts compiling a list of all the resources and potential mission parameters and that jazz. A small algorithm calculates out the next "keyframe" in the ship's future - when the mission completes, when resources get dangerously low, when it reaches its destination, etc.  
  
The universe sim trickles forward at whatever pace the player wants, and when the in-universe time hits that keyframe, we crawl through the ship again to find the new situation and calculate out the next keyframe. This simple method allows us to have thousands of Star Destroyers without any slowdown at all. No per-frame update, we don't even really need an in-scene object to represent them. (And, since they're probably 500 light years away, that's good.)  
  
Well, we get close to a fleet of Star Destroyers, and therefore the ones nearby start getting instantiated into the game world. The player accidentally rams one, breaking one of those big engines. An NPC commander is generated and yells at the player.  
  
Oh no, this is awful! How do we remember things like a specific engine being broken, or a specific commander existing? We're just referencing a blueprint!  
  
... just save the instance as a custom ship.  
  
Since the blueprint contains a reference to its prefab and each component contains a reference to its own prefab, we can do whatever we want. We can easily save this "baked" blueprint, and then compare its stats to the changes in the definitions of things like engines and reactors. We could even just save the one damaged component, and leave the rest as references.  
  
We can also generate a mission to repair the ship, and when the mission completes, we can delete the custom blueprint and restore it to an ordinary blueprint reference. We could also save the commander - either as part of this ship or separately, as we prefer.  
  
Unlike a ScriptableObject, a prefab can easily be cloned, compared, reloaded, partially cloned, merged, instantiated piecemeal...  
  
**The Monster's Database**  
If you're a fan of ScriptableObjects, hopefully by now you're thinking "well for your specific application, sure, but IN GENERAL-"  
  
Most of the uses of ScriptableObjects are as data objects. The big advantage is that there's no extra stuff.  
  
For example, I have a list of various factions and species. If each was a MonoBehaviour, I could drag it onto a property on another class in the same way as I could do with a ScriptableObject - it'd automatically resolve the reference to the prefab as a reference to the specific MonoBehaviour on the prefab. It'd behave exactly like a ScriptableObject, but it'd have a GameObject lurking in the background being... nonoptimal.  
  
I mean, why would you ever instantiate a whole faction, right? Just drag it into the scene? You'd never need that, so it's just junk stapled onto my data class!  
  
I could argue that it allows for mixins, but we already did that. Let's argue for something else.  
  
Before that level of garbage starts to get noticeable, we run into another problem: managing hundreds of ScriptableObjects is just as obnoxious as managing hundreds of prefabs.  
  
There's a reason why GameMaker and RPGMaker use databases for this kind of thing: databases are a really great way to handle it. You could manipulate the editor to create a pseudo-database front end for your ScriptableObjects (or your prefabs), but... JUST MAKE A DATABASE. It's faster, less overhead, and can be easily exported and imported from Excel or an HTML form or whatever.  
  
The big problem with databases is that it's hard to drag a specific entry into a field in the inspector. I don't know the best solution for this, right now I'm using an editor trick to fake it, but it's not very good.  
  
In the end, my thoughts are simple: if you have dozens of entries, you probably need a database. If you have only a few, the extra garbage of having a GameObject attached isn't enough to worry me, and you can usually leverage mixins to add a lot of extra functionality on the cheap.  
  
**The Custom Prefab**  
My argument is simple: the prefab is now more powerful than the ScriptableObject.  
  
In the video above, Richard Fine creates a ScriptableObject to handle playing custom explosion sounds. This is the part of the video that upsets me the most, because it's a magic handwave that hides the fact that it does nothing useful at all.  
  
There's no reason to have a ScriptableObject "ShellExplode" floating around separately from the shell prefab that's going to explode. Just put it on the goddamn shell. Even the "play mode editing" would work the same way, because you're editing the prefab and it gets instantiated every time you hit shoot!  
  
And, of course, now you just have A Shell Object instead of a shell object and some random dangling object in another directory that may or may not be referenced correctly. Moreover, you can easily clone the shell prefab and create your Big Boss Shell and your Tracer Shell and your Rocket Shell, tweak away!  
  
It's not magic, it's the way Unity is built to work best.  
  
The idea that a prefab is somehow "fragile" is not true any more. The classic example of a ScriptableObject is that if you have ten monsters, they can all have the same stats and you'll never "accidentally" edit just one monster to have different values.  
  
If you have a lot of monsters, you'll probably be using a monster spawner that references a prefab, rather than hardcoding every monster. Even if you do hand-place each monster, changes to the prefab automatically update instances, as long as the instance's values haven't been manually altered. This works per property.  
  
So, for example, if I have ten orcs and I want one of them to have extra HP, I can increase the HP. And I change his AI role to "leader". And I add a potion to his inventory. And I put a hat on him. Later, I change the orc prefab's damage from 4 to 6. The orc I modified will have his damage correctly updated, while still keeping his hat and potion and HP and AI role!  
  
Sure, it's possible to accidentally change a value and not realize it, but that seems inconsequential compared to the overhead of needing a new, permanent asset file in your project directories for every slightly tweaked monster.  
  
That's the point of Unity. The point of Unity's entire approach is that you can tweak things in scene view! Using ScriptableObjects to "work around" that is like "working around" the game of basketball by taking out the ball. Yeah, you could probably come up with something, but it's not going to be a very effective use of your basketball pros or your basketball courts!  
  
**Use Interfaces and Delegates**  
I've seen a few other arguments for ScriptableObjects - for example, externalizing coroutines so you can plug them in willy-nilly, or using delegates bound up in ScriptableObjects to do things like flexible AI processing.  
  
Just... uh... just use C#.  

  
Not to sound elitist, but C# has delegates and interfaces already. Use them. Don't find an excuse to wrap them in ScriptableObjects, just mainline the stuff.  

  
Unity's support for these in the inspector view is kinda crappy, which is the big argument against it. Fortunately, you can use UnityEvents instead of delegates, and those do show up in the inspector fine.  
  
Interfaces are similarly inspector-unfriendly, but they're very powerful and useful and don't limit you to either a ScriptableObject or a MonoBehaviour - you can use either, or even a raw C# class, or have instances of all three for different applications that are referenced from a single system!  

  
Personally, I think using MonoBehaviour mixins as implementations of interfaces is really underestimated, but that's another topic entirely.  
  
**Use ScriptableObjects**  
Am I arguing that ScriptableObjects are useless?  
  
No, not at all. They are more optimal than prefabs, so if it occurs to you to use them, you should use them. They're especially nice when it comes to instantiating them outside of the scene, or moving references between clients.  
  
Fundamentally, ScriptableObjects are classes. That is, you've written lines of code. I generally suggest using them when you can write less code by using them, and I tend to find that means situations where I need to create and track arbitrary references and complex data.  
  
I've stored options menu defaults in ScriptableObjects, level code, galaxy definitions...  
  
But, in the end, I've never found them to be much earthshakingly better than either using prefabs or raw data. So I only use them when I'm in the mood to optimize.  
  
ScriptableObjects CAN do a lot of things, but that's because they're a C# class. They're not substantially better at those things than either a MonoBehavior or a C# class. Any optimization you can get by using them is marginal, and they don't offer any particularly astounding new patterns or workflow.  

  
I'm not against using them. I just don't want people to think they can do these amazing things... without ever realizing that simple prefabs can already do those things, and many other things at the same time.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [10:03 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/5384335138914962481 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=5384335138914962481&from=pencil "Edit Post")

Labels: [prefab](https://projectperko.blogspot.com/search/label/prefab) , [scriptableobject](https://projectperko.blogspot.com/search/label/scriptableobject) , [unity](https://projectperko.blogspot.com/search/label/unity)


#### 10 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Do you have some API links or a brief example demonstrating how you're retrieving prefab-values from your prefabs? I don't recall having seen how to do this before.

[8:08 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1468076932939#c7849065952395622855 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7849065952395622855 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Huh? You just do it. For example:  
  
public Image myImagePrefab;  
  
public function sprite WhatIcon() {  
return myImagePrefab.sprite;  
}

[8:37 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1468078628038#c201907144142284724 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/201907144142284724 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

(Capitalization issues aside...)

[8:37 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1468078665704#c8478046072217130845 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8478046072217130845 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

Sorry, I realized that was what you meant right after posting. I thought you originally meant that you were avoiding even loading the prefabs (and all their resources) until you needed to spawn the full object. I suppose you could do something similar by having the full/visual prefab separate and doing an async load as needed. If it really helped.  
  
So where do you store your current state for each part (say the remaining energy for an engine)? It seems like you would need to make a 'part prefab' that contains the script/properties for that part to simulate properly, and then have it also reference the 'visual part' prefab that is instanced when it needs render/etc?

[10:41 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1468086119737#c5707150303313798748 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5707150303313798748 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

I track a lot of generics (mission progress, resource rates and stockpiles, etc) on the ship object. It's basically just a data container, it doesn't even need to be instantiated into the scene.  
  
None of the parts contain that kind of state data, although they do contain information about when they are damaged or other things that can't be handled by generics. When that happens, I need to create them and save them.

[10:45 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1468086343577#c2498114361396068887 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2498114361396068887 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://lazygamedev.co.za/author/sas/)

[Sas van der Westhuizen](https://lazygamedev.co.za/author/sas/) said...

I'm seeing a lot of aggressiveness in your post. I'm by no means an expert, but I've always found prefabs to be very fragile and not quite able to do what I want it to. It might just be that I'm completely incompetent. What I did see in the talk Richard Fine did was making quite heavy use of the strategy pattern. Most importantly what I saw was allowing to put some "programming" control into the hands of somebody using the Unity editor over having to go and write some code. Yes most of these things end up in your assets folder, but so do prefabs? What difference does that make? You mention cloning a prefab if you need a slightly different shell, but some of the details and configurations of the shell stay the same. I merely see moving some of the data into a ScriptableObject as a means of "protecting" that data. If you end up with some prefab where ANY MonoBehaviour object can be attached to it, possibly fundamentally changing how the prefab functions. While I understand that you prefer doing things in another way, this is just a means to provide a low code implementation to your level and sound designers. It's merely a powerful tool that you can use to look at using the engine more than having to write funky lookup scripts for everything.

[4:19 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1511266778690#c6227992488425841808 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6227992488425841808 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/12280728079525418644)

[Unknown](https://www.blogger.com/profile/12280728079525418644) said...

How do you use interfaces in unity?  
Unity is so anti interfaces! I had to use ScriptableObject to be able to drag drop custom classes in the inspector

[4:20 PM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1518049223927#c3705997112835713337 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/3705997112835713337 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yeah, it's not good with interfaces or raw C# classes due to serialization silliness.

[6:54 PM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1518058495369#c5980272404955462876 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5980272404955462876 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/03616171056928744159)

[GDK](https://www.blogger.com/profile/03616171056928744159) said...

This comment has been removed by the author. 

[5:16 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1606828589636#c1986741985936557260 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1986741985936557260 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/03616171056928744159)

[GDK](https://www.blogger.com/profile/03616171056928744159) said...

Hi, do you happen to have a demo project of this prefab alternative to scriptable objects? Would you kindly share it please?

[5:17 AM](https://projectperko.blogspot.com/2016/07/scriptableobject.html?showComment=1606828644788#c1350014180651791248 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1350014180651791248 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/5384335138914962481)

[Newer Post](https://projectperko.blogspot.com/2016/07/games-writing-thematic-elements-and.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2016/07/galactic-politics.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/5384335138914962481/comments/default)
