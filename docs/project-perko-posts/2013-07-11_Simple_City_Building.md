---
title: "Simple City-Building"
date: 2013-07-11
url: https://projectperko.blogspot.com/2013/07/simple-city-building.html
labels:
  - game design
---

## Thursday, July 11, 2013 


### Simple City-Building

I've been thinking about city-building games, especially after the catastrophe that the newest Sim City visited upon us.  
  
But here's the secret about me and the Sim City franchise: I don't like it.  
  
I mean, it's enjoyable enough, but when I think of cities, I think of cities. Huge things with global influence. The new Sim City, with its four square blocks of space, really hammered this home. I didn't start feeling like Sim City 2000 was talking my language until the city hit the max size cap... and then that was pretty much endgame. Endgame where I was just starting to feel it was interesting.  
  
I thought about it some. How do you design a city game where your city really feels like a huge city with global influence?  
  
Well, obviously, you make it a huge city with global influence.  
  
The global influence part means making the city part of a larger world or universe. New York City isn't simply New York City: it is influenced by and strongly influences world events. It receives its fair share of immigrants from whatever culture is currently going through an immigration wave, it influences global banking but feels the bite when global banking fails, it has crime but the crime sometimes involves multinational cartels...  
  
New York City isn't about plumbing and roadwork, to me. It's about creating a beating heart to pump the blood of human society through the world. That's the sort of game I want to play.  
  
The question is: how do you do it?  
  
One way to do it is, of course, via simple spreadsheet. You can make a game where all the decisions are laid out in bare sentences, and you simply allocate funds and votes. But that's a bit too dry. Cities do exist in physical space. I want my city to exist as solid city - buildings, streets, and so on. They don't have to be all simulated in detail, but I want a south side and a Devil's Kitchen and a market district and all that.  
  
So I've put together a simple framework. I'll describe it here, maybe create a prototype (although I'm already doing a different prototype, so maybe not).  
  
The grid for the city is a grid, with each tile being about the size of a new Sim City city - IE, a smallish district. The grid is warped for an organic feel, but the fundamental structure is unbroken except when it's impossible to build somewhere because of water or broken land.  
  
Each district (grid tile) has ratings. Some are things like beauty, terrain roughness, or altitude. Some are based around the population: residents, commuters, pollution, crime, culture. And, obviously, each district has four neighbors (or less, if they're on a coast or at the edge of a major highway).  
  
When you define a zone, you don't define it in terms of residential or industrial or whatever. Instead, you point it at something.  
  
For example, if you want an airport district, you point it at the sky. If you want a shipping district, you point it at the neighboring sea, or the neighboring highway.  
  
You can also point it at specific areas of concern. Point it at banking, at movies, at medicine or physics. Whatever other global economic concepts arise. In a game with technologies and economies, this will also generate resources, which is useful.  
  
You can point them at specific physical areas far away. Point them at a space station, at another city on the other side of the planet, at the north pole. Now they are connected to whatever you pointed them at, both in terms of physical travel and in terms of economic relationships. The reverse is also true: if you point a district at a faraway city, immigrants from that city will tend to live in that district, and that district's culture will be strongly influenced by them.  
  
Lastly, you can point them at other districts in your city, but only at neighbors. For example, you might point a district at your airport district, and it will grow to support the airport, with hotels and warehouses and upscale commercial stuff.  
  
Some of this is automatic, though. For example, if you have a district pointed at heavy industry and a district pointed at shipping, they'll automatically add to the city's totals of shipping and industry, and therefore support each other even without being pointed at each other. Similarly, a district can be pointed at another continent without actually having a transcontinental airport in it, as long as you have a transcontinental airport in the city somewhere. It's only when you want a district to be completely shaped by the need to support another district you use the pointing thing.  
  
As the world situation changes, the pressures from various elements change, and therefore the pressures on the districts change. If a horrible earthquake hits a city one of your districts is pointed to, the refugees pouring into that district will radically amp up the population and destroy the economy. You need to revamp your city to this changing situation. You could adapt the neighboring districts to support this district, but the neighbors may be on important tasks of their own. You could point new districts at that damaged city, and un-point this district. That wouldn't reduce the economic damage already done to the district, but it would take the pressure off and allow it to begin healing. But the new districts don't have any economy already in existence, which means refugees into those districts will turn it into a permanent slum, since there's no jobs or ready culture to absorb them... you could also just un-point the existing district and say "screw off" to the remaining refugees, which would be pretty vile but perhaps economically viable.  
  
You can also go on the offensive. Your district pointed at physics research? Pump cash into it and push for a physics breakthrough!  
  
One of the keys to this game is that it is multiplayer. Not necessarily strictly on-line, but there are other cities in the world. The ways they all interact is a big part of the game. There's a lot of potential to make this a fun semi-casual asynchronous game.  
  
I think this is a pretty easy design. I like it.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [8:26 AM](https://projectperko.blogspot.com/2013/07/simple-city-building.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/8998036552721760825 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=8998036552721760825&from=pencil "Edit Post")

Labels: [game design](https://projectperko.blogspot.com/search/label/game%20design)


#### 2 comments:

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

I like your thinking regarding city sims, and I was also disappointed by the failures of Sim City 5. Your pointing/linking idea seems like it could be useful to give a game more of a goal or direction rather than just a balancing act of zoning.  
  
Your post reminded me of one made on the "Procedural World" blog back in 2010 about a city/world simulation game on a much larger scale than most:  
  
http://procworld.blogspot.com/2010/12/simulating-large-virtual-worlds.html  
  
Here are just a few short quotes from the article:  
  
"A single world may have dozens of cities, each one hosting a few million virtual citizens. The image below shows a screen capture of a young city. The area covered by this image is 1/1000 of the world and it contains a few hundred facilities. Approximately two million virtual citizens live in this city."  
  
"Eventually the entire world is connected by a single road system. \[...\] Imagine that player A goes bankrupt in one city, at this point all his workers are laid out. The unemployment ratio could go up in the city to the point many citizens may decide to move to a city very far away that is showing a more promising future. Player B, located in the further city, may see a rise in the occupancy for his residential buildings there and benefit from player A's misfortune."  
  
"The first abstraction is used to model the production and exchange of goods. It assumes everything moving in the world is a fluid. Fluids are of a given type, they have some magnitude and they have some quality. Surprisingly, the same abstraction is used to model population and workforce."  
  
Thank you for sharing your ideas. --Verzor

[10:31 PM](https://projectperko.blogspot.com/2013/07/simple-city-building.html?showComment=1373779872289#c9192353096111390923 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/9192353096111390923 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yeah, rather than simulating with any kind of fidelity, I'm aiming for just getting the feel of a big city.  
  
But the heart is the same.

[7:45 AM](https://projectperko.blogspot.com/2013/07/simple-city-building.html?showComment=1373813151548#c157031443132304899 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/157031443132304899 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/8998036552721760825)

[Newer Post](https://projectperko.blogspot.com/2013/07/the-digital-fire-sale.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2013/07/games-as-striking-moments.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/8998036552721760825/comments/default)
