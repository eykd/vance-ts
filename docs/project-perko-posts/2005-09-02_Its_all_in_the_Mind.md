---
title: "Its all in the Mind"
date: 2005-09-02
url: https://projectperko.blogspot.com/2005/09/its-all-in-mind.html
labels:
  []
---

## Friday, September 02, 2005 


### Its all in the Mind

There's been a "breakthrough" in [natural language "interpretation"](http://www.scienceblog.com/cms/node/8802).  
  
It's unlikely that anyone reading this blog is as deeply involved with this sort of thing as I am, so if you read that entry, you're likely to think, "Oh, of course, it's so obvious! Just compare the syntax/context of a list of sentences!"  
  
Mmmmm... nope.  
  
The article is bullshit. It contains NO USEFUL INFORMATION.  
  
People have been doing that kind of search since 1990, or earlier. That's not the breakthrough at all. If there is a breakthrough - and there might be - the article doesn't actually tell us anything about it.  
  
Because the breakthrough would be in the method of representing the data.  
  
Everyone who's tried to create a learning language parser has done the same kind of analysis that blog entry is touting as a breakthrough. The difficulty they quickly hit is: "How the hell do we 'compile' these sequences and differences into something useful?"  
  
That is the difficulty this group might have beaten. Or, they might be full of hot air. It's totally impossible to tell off the article text.  
  
On the surface, that doesn't sound all that incredibly difficult, does it? It's just, what, a list of words and possible next words? If we see "I want a first-class ticket" and "I want a coach ticket" then we can determine that "first-class" and "coach" are somehow related. So any time a sentence says something involving first class, we can assume it could also say coach? How about "this meal was first-class" vs "this meal was fantastic"? Suddenly, can you have a "fantastic" ticket, or a "coach" meal? How about a "speeding ticket"?  
  
So you, what, create context domains? "Fantastic<->First-Class" is a food-domain relationship, "coach<->first class" is an airplane-domain relationship? How could it determine context domains? I guess you'd have to preprogram it, at least at first.  
  
Simple word-after-word lists don't work. You'll need to have some kind of "contextual block" system which learns what kind of progression is valid and what kind of words can be in what kinds of blocks and what word-block combinations can link to which world-block combinations.  
  
Then what you end up with is a titanic database of word combinations and relations inside contextual frameworks. We're talking millions, tens of millions of entries. How do you make entries? What are word blocks? How do you define them? How do you define their relationship with other word blocks? Is "I want" a word block? Or two? Is "I WE YOU IT THEY HE SHE" a word block? If so, the corresponding word block might be "WANT WANTS", or "WANT WANTS WANTED WANTING WILLWANT HASWANTED HAVEWANTED", etc, etc, etc. How do you determine which parts of the first block link to which parts of the second block?  
  
Do you split them into multiple blocks? Maybe "I WE THEY YOU" is one block, and "IT HE SHE" is another, linked to "WANT" and "WANTS" respectively. But then you have both "WANT" and "WANTS" linked to exactly the same following blocks - so are you going to manufacture twice as many links and entries for this kind of setup?  
  
What about the fact that you've heard "I WANT A TICKET" and "HE WANTS A TICKET", but can you extrapolate that "WE WANT A TICKET" is valid? Or "HE WANT A TICKET"? Or "I WANTS TICKET, STOOPID MACHINE"?  
  
It's not as easy as it seems. The representation is excessively difficult.  
  
I would be interested in the "breakthrough" these people have made, but I'm pretty sure it's something that's been thought of (and probably implemented) before.  
  
My own approaches tend to revolve more around "functional" language use. IE, what does "I WANT A TICKET" actually accomplish? How about "I WANT AN APPLE PIE"? From that you can determine that "I WANT" relates to the talker receiving.  
  
Of course, in COGENT we don't have natural language - we have reverse parsing. In some ways, that makes my life easier. In any case, creating individual knowledge bases and reverse-parsing a conversation will certainly be an interesting challenge. I think I'm going to use contextual frameworks, as touched on above. It's gonna be fun.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:07 AM](https://projectperko.blogspot.com/2005/09/its-all-in-mind.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/112568602096370173 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=112568602096370173&from=pencil "Edit Post")


#### No comments:

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/112568602096370173)

[Newer Post](https://projectperko.blogspot.com/2005/09/weekends-and-finder.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2005/09/kaloki-halo-and-play-loops.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/112568602096370173/comments/default)
