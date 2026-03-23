---
title: "Rocket Heart!"
date: 2006-06-11
url: https://projectperko.blogspot.com/2006/06/rocket-heart.html
labels:
  []
---

## Sunday, June 11, 2006 


### Rocket Heart!

Actually, I've decided I like calling it "rocket heart" rather than "chu chu carnage". Hey, I never claimed to be good at names.  
  
Anyhow, this post is about my social algorithm idea. This is a really long, boring post about a topic I haven't totally clarified to myself, yet. Read at your own risk, and I suggest bringing a sandwich. :)  
  
This might seem like a pretty weird algorithm, but the primary component is in the highly individual programming that goes into each character. These aren't interchangeable characters: they react to the same stimuli in very different ways.  
  
Each character has the ability to launch out a "relationship anchor", which you can think of as a chain connecting the launcher to the target. For example, if Anna likes Bob, she'll latch a relationship anchor to him. One representing the relationship she's aiming for - so maybe a pink one.  
  
This anchor doesn't anchor Bob to her, though! It has no effect on Bob at all! It's just an intention to have a relationship with Bob.  
  
Characters can choose to send events down these anchor chains. We'll imagine these events to be a horde of sparkles riding down the chain. These events are used to convince your target to respond to you in some way - say, by anchoring a similar chain to you. The reason we're imagining them as sparklies is because there are lots of ways to express yourself, and some of those ways are significantly more sparkly than others. IE, shouting that you love Bob over schoolwide PA is pretty damn sparkly, whereas smiling and waving is not very sparkly.  
  
Pretty simple? Okay, let's punch it up a notch.  
  
When characters are in the same physical place, think of their chains as glowing. Now, everyone in that place can see actions which other characters take. IE, they can see the sparklies. (You can put in a "not paying attention" thing, where less sparkly events aren't noticed, but functionally, if you're in one place, you see the sparklies.)  
  
Okay, this is where I describe how the characters are programmed.  
  
They use a system of sight responses, link responses, attenuating link actions, and removed link responses. Also, it is usually the case that a programmer scripts them to have several pre-exising links - characters don't usually start from zero.  
  
Sight responses are responses to seeing a character. If a character has a sight response, it'll usually relate to some shared element between characters (for example, Charles falls for every redhead). This usually just establishes a link of a given type if another character has a given attribute. It's really the "first impression" response.  
  
Link responses are responses to incoming events. An example might be to forge a romantic relationship with anyone who shoots a romantic event at you. We do want over-the-top characters, but that's a bit too over-the-top, so we'll probably have a somewhat more complex script which determines the value of the offer and how strong your other romantic relationships are... but it varies hugely from person to person. Don't forget, many actions are "live" and can't simply be ignored.  
  
Attenuation actions are functionally timed events linked to any given relationship link. For example, every day Donald wants to visit his girlfriend, *whoever that might be*. Pretty straight forward. This can also be done with schedules to save computation: people will slot scheduled events at the same time if they want to see each other. It's very easy, but less adaptable.  
  
(Also, attentuation actions typically reduce link strength after a certain amount of time without a phone call. :P)  
  
Removed link responses aren't responses to breaking social links. They're responses to *other people's actions on other people.* Remember, if we're in the same place, we can see actions taken. So, if Anna sees Bob being romantic with Coco, Anna will probably be upset. On the other hand, if Anna sees Bob being angry at Donald, she's likely to also be angry at Donald because she is on Bob's side of... whatever it is they happen to be arguing about.  
  
But Anna can only work with what she can see (or sense, if she establishes an "informant" relationship with someone who tells her about Bob).  
  
Okay, kind of complex? Really, it's complex enough to have it's own domain language. The basic idea is that each kind of relationship has different actions associated with it, each of which has a few features (most notably a "sparkliness"). Each person's preferences determine which actions they would prefer to take, and this can survive transition from one set of mechanics to another.  
  
For example, if Anna is shy, she won't want to use very sparkly actions. Most in-person actions are highly sparkly, so when Anna is actually with Bob, she's likely to hang in the background and do nothing other than be shy and occasionally whisper to a friend. When not in person, she likely persues some of the less-sparkly actions, such as talking to her friends about Bob, writing and discarding love letters to Bob, and stalking Bob.  
  
Most kinds of relationships will probably have around a dozen actions associated with them, all at various levels of sparkliness.  
  
Sending *out of relationship actions* is an important point, too. If Anna has only a romantic link to Bob, then *any* action she takes will be rated as a romantic action. This means she's going to be universally shy, because even talking to him about homework is going to make her think romantic thoughts.  
  
If she has a "friend" or "working" relationship with Bob in addition to her romantic one, she'll judge those actions on a different scale, and therefore will only be shy when it comes to romantic events. Presumably, non-friend, non-working, non-romantic events will default to either friend or working rather than romance... but it depends on her programming.  
  
Why wouldn't Anne establish a working relationship if she's going to be talking about homework? Because Anne might be programmed not to set up working relationships with men, or with someone she has a crush on. It makes for a more entertaining character.  
  
You can allow for demeanor in addition to event, if you feel particularly aggressive... but it isn't necessary to the system.  
  
Requests:  
  
Requests are usually made in response to an event. For example, if someone punches you, you can reply with a request for him not to do that again. A request is, in these cases, asking the person to do or not do a particular event. It can be sent loudly (vocally) or softly (body language or simple "stop"). If sent loudly, it is sparklier than the event you're trying to cause or stop. If sent softly, it is far less sparkly.  
  
Requests can also be "now" or "forever". The difference between "not in the face!" and "don't ever hit me again" is rather important. This leads us into indirect requests, which we'll talk about later.  
  
This is also useful in situations where someone wants a more or less sparkly event to use. In Anna's case, she might softly request Bob smile at her, which would consist of her tipping her head and giving him a slight, curious smile. Or, in Coco's more aggressive case, she might corner Bob and demand he kiss her.  
  
In a full system, there would need to be a complex system to deal with this, involving feedback loops and caution and all sorts of crap. In this system, each character is programmed individually, so their reactions to requests are also handled individually.  
  
Of course, each character has "default" code they start with. This code governs what their basic responses and actions are when they have no personality. For example, it might be, "if you get a request to do something, if you have a link of that relationship type with that person that is at least as strong as the sparkly level of the action, do it." It would be irritating to type that every time.  
  
Indirect Requests:  
  
Indirect queries are things like "please be nice to Bob!" These are on the complex side, and most characters will probably have this handled by their default code.  
  
Also, indirect requests are often used to create informants:  
  
Informants:  
  
Informants are an advanced concept that only need to be used in systems which feature gossip as a major source of interest. This is functionally an advanced request which, instead of asking for the target to perform or restrain from an action, asks them to report on someone else's actions.  
  
For example, Anna asks Coco to tell her about Bob. Coco will tell Anna what kinds of relationships Bob has had in the past, and then will tell her anything interesting he does while in her presence in the future. This forms a "vapor" relationship between Coco and Bob.  
  
Of course, what Coco actually does depends on her programming. She may simply refuse. She may lie. She may lie only if she's already in a romantic relationship with Bob. The possibilities are endless, but in function there's only three or four potential "response templates", so just choosing one instead of programming this in full is fine.  
  
Base Code:  
  
Notice that as the systems got more complex, they get less unique? Indirect action responses and informant responses are probably always going to be handled by default code rather than by uniquely programmed code.  
  
This is because these systems are getting closer to the "real" algorithm. The "real" social algorithm uses simple rules to build up a complex response system, but not only do I not know those simple rules, it would take too many system resources to make them happen.  
  
However, the complexity level is too high to program individually for each character. So the character's individual code is largely limited to basic relationships, as listed near the beginning of this giant freaking essay.  
  
Express Yourself:  
  
Linking this to meaningful output is still quite difficult. For example, what is a "mild stop doing that" shown as? What about when it's "stop making fun of Anna" versus "I wish Anna would stop stabbing Coco with that knife." Presumably, the two are different.  
  
Mild commands are generally nervous or suppressed, depending on the character, so that part is easy enough. But if you have actual text output? Ouch. That's gonna be pretty tough to get working right.  
  
I would suggest a symbolic language rather than a real one.  
  
Anyhow, the whole algorithm might sound a little messy, but it isn't. It's fast, adaptable, and doesn't require any huge breakthroughs. It also gives you over-the-top characters rather than generic ones - actually pretty rare with social algorithms. It *does* require careful placement: the inhumanities in the algorithm are going to be most clear when a character is out of their element (IE, Anna is less realistic when she's not crushing on Bob).  
  
The core code which allows this system to work is a simplistic domain language. I'll share that some other time.  
  
If you got this far, you have more patience than a depressed robot with pains up and down the diodes on his left side.

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [11:52 AM](https://projectperko.blogspot.com/2006/06/rocket-heart.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/115006483961356481 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=115006483961356481&from=pencil "Edit Post")


#### 3 comments:

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

I'm typically agressive, so its good that demeanor is valid input in this model. Also, relative proximity could serve as an other degree of feedback that wouldn't add to art asset demands.  
  
"Sparkliness" reminds of inclination in Storytron, or Tree precedence in ABL, but with an interesting exception, more is not always a stronger attracter. This ties in, at a basic level I guess, with the model of heterogeneous characters, so triple kudos on that.  
  
Informants, indirect requests and removed links seem to encapsulate the utility of three dimensional personality variables, but with less memory and conceptual tangle.  
  
I think I could handle this as a domain language. The conceptual metaphore that lets me grok this is the rhizome as a network of roots, which are primarily heterarchical, so I hope you don't mind if I call it rhizomatic script. Maybe I'm applying meaning where there is none, but we'll see. Having read the Facade papers, I can say the complexity is much less than it could be, so I feel confident I could handle it.  
  
Now, the core of the UI design I've got is a symbolic langauge, sort of a logographic alphabet. Thats good because non-english speaking players could potentially grok the meaning of responses and inputs, with perhaps some help from icons (which goes for anyone). I would however, like to use textual assets, and subsequent voice assets if we can budget it. I guess a good way to go is to script first, then identify the nodes that seem most contexually stable, and write dialogue for those. It'd be diffuclt, and as much a task for post-production as for production, but it could add to the experience to good deal, particulary around systemic attractors which denote heightened moments of drama. I'm open to having no text, BUT, I think hueristically speaking it'd be possible to have a minimum of text and marginalize the chance of something awkward being said.  
  
On the other hand, from my perspective, having most output be procedural is quite a blessing, because it reduces the work load from a novel's worth of writing to something closer to a short story or two.

[5:09 PM](https://projectperko.blogspot.com/2006/06/rocket-heart.html?showComment=1150070940000#c115007099451781589 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/115007099451781589 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Well, you can call it whatever you like, but I'll probably forget what you've called it by the next time I hear the term. ;)  
  
The domain language is shaping up. I think it's really simple to conceptualize using the specific language.

[5:21 PM](https://projectperko.blogspot.com/2006/06/rocket-heart.html?showComment=1150071660000#c115007167966164420 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/115007167966164420 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_oV2jH-NLzx8/SapqKTvwikI/AAAAAAAAAnQ/52 Zz4MZ4vio/S45-s35/Nordom. GIF)](https://www.blogger.com/profile/13614962832390315553)

[Patrick](https://www.blogger.com/profile/13614962832390315553) said...

"Rocket Hearts" is actually quite implicative of the function, you've got these AI "Hearts" shooting off relationship projections like rockets all over the place in a very lively set systematic way. How about we call it RH Script, that it means something to both of us.

[4:19 AM](https://projectperko.blogspot.com/2006/06/rocket-heart.html?showComment=1150111140000#c115011114793726228 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/115011114793726228 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/115006483961356481)

[Newer Post](https://projectperko.blogspot.com/2006/06/politics-as-usual.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2006/06/emergent-rather-than-generative-plot.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/115006483961356481/comments/default)
