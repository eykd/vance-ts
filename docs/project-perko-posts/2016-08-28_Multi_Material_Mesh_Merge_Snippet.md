---
title: "Multi-Material Mesh Merge Snippet"
date: 2016-08-28
url: https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html
labels:
  []
---

## Sunday, August 28, 2016 


### Multi-Material Mesh Merge Snippet

[For this video](https://youtu.be/6APzUgckV7U)  
  
public void AdvancedMerge()
 {
  // All our children (and us)
  MeshFilter\[\] filters = GetComponentsInChildren (false);

  // All the meshes in our children (just a big list)
  List materials = new List();
  MeshRenderer\[\] renderers = GetComponentsInChildren (false); // <-- you can optimize this
  foreach (MeshRenderer renderer in renderers)
  {
  if (renderer.transform == transform)
  continue;
  Material\[\] localMats = renderer.sharedMaterials;
  foreach (Material localMat in localMats)
  if (!materials. Contains (localMat))
  materials. Add (localMat);
  }

  // Each material will have a mesh for it.
  List submeshes = new List();
  foreach (Material material in materials)
  {
  // Make a combiner for each (sub)mesh that is mapped to the right material.
  List combiners = new List ();
  foreach (MeshFilter filter in filters)
  {
  if (filter.transform == transform) continue;
  // The filter doesn't know what materials are involved, get the renderer.
  MeshRenderer renderer = filter. GetComponent ();  // <-- (Easy optimization is possible here, give it a try!)
  if (renderer == null)
  {
  Debug. LogError (filter.name + " has no MeshRenderer");
  continue;
  }

  // Let's see if their materials are the one we want right now.
  Material\[\] localMaterials = renderer.sharedMaterials;
  for (int materialIndex = 0; materialIndex < localMaterials. Length; materialIndex++)
  {
  if (localMaterials \[materialIndex\] != material)
  continue;
  // This submesh is the material we're looking for right now.
  CombineInstance ci = new CombineInstance();
  ci.mesh = filter.sharedMesh;
  ci.subMeshIndex = materialIndex;
  ci.transform = Matrix4x4.identity;
  combiners. Add (ci);
  }
  }
  // Flatten into a single mesh.
  Mesh mesh = new Mesh ();
  mesh. CombineMeshes (combiners. ToArray(), true);
  submeshes. Add (mesh);
  }

  // The final mesh: combine all the material-specific meshes as independent submeshes.
  List finalCombiners = new List ();
  foreach (Mesh mesh in submeshes)
  {
  CombineInstance ci = new CombineInstance ();
  ci.mesh = mesh;
  ci.subMeshIndex = 0;
  ci.transform = Matrix4x4.identity;
  finalCombiners. Add (ci);
  }
  Mesh finalMesh = new Mesh();
  finalMesh. CombineMeshes (finalCombiners. ToArray(), false);
  myMeshFilter.sharedMesh = finalMesh;
  Debug. Log ("Final mesh has " + submeshes. Count + " materials.");
 }

Posted by [Craig Perko](https://www.blogger.com/profile/13173752470581218239 "author profile")  at  [12:28 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html "permanent link")  [!\[Image\](https://resources.blogblog.com/img/icon18\_email.gif)](https://www.blogger.com/email-post/11758224/1179603664882948168 "Email Post")  [!\[Image\](https://resources.blogblog.com/img/icon18\_edit\_allbkg.gif)](https://www.blogger.com/post-edit.g?blogID=11758224&postID=1179603664882948168&from=pencil "Edit Post")


#### 16 comments:

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/15442397108099231126)

[Unknown](https://www.blogger.com/profile/15442397108099231126) said...

First of all...your tutorial was just awesome ... ur way of explaining is really cool.  
  
Everything is working fine....except the the vert count...u see when ever there are n different meshes (without any submesh) the vert count is the sum of vert count of individual meshes(which it should be)..... but whenever there is a mesh with multiple submeshes the vert count of each submesh is taken as the vert count of the entire parent mesh(this is causing me a problem)... For example if there are 3 meshes A(with 2 submesh, m total verts) , B(0 submesh, n total verts) , C(0 submesh , k total verts)...so ideally the vert count of final mesh should be = m + n + k...but i am getting = 2m + n + k.... ;( (m verts for each submesh of A )  
  
Sorry for such long comments.... i'll really appreciate if u look into this...asap.  

[6:25 AM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1473081922179#c2044442908588944074 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2044442908588944074 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

It sounds like the verts are being included in both submeshes. I don't know whether that's a bug in the way you created the mesh or in the combiner function, I've never noticed it either way.  
  
If you can't solve the problem any other way, you can always create a mesh that is just the one submesh you want, then delete all the verts that aren't mentioned by the tris. This will require you to understand how the verts and tris work, though.

[8:06 AM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1473087975781#c2084436329134735070 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2084436329134735070 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/09308672656546606711)

[Unknown](https://www.blogger.com/profile/09308672656546606711) said...

What should I put where "myMeshFilter" is?

[12:26 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1541100402116#c6573139189841192811 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6573139189841192811 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

... your mesh filter. It's a thing on a gameobject.

[12:39 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1541101165200#c4696788501323366506 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4696788501323366506 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

DrHristov said...

OMG... I'm so sorry I wrote that! I read something completely different, that's why I got confused. I'm so sorry

[1:15 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1541103309684#c5615038264675663983 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5615038264675663983 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

DrHristov said...

Wait, in that case it won't work... My game is a minigolf game. In it, the level is randomly generated throughout a script. How it works: there is a starting tile already in the scene, from there it ganerates a random obstacle tile, after that another one and then at the end slaps the tile with the whole. The thing is first, the tiles a prefabs, second, the only time the tiles are in the hierarchy are in playmode - I can't do what you did on you video with the empty object "House", and third, the script is attached to the ball... can you help me?

[1:25 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1541103902420#c1878656978288069269 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/1878656978288069269 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

You can, but I don't think you need to. You shouldn't be seeing any slowdown from only a few meshes like that. Mark them as static and let Unity do the work for you.

[3:56 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1541112967517#c2600415438572155494 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/2600415438572155494 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

DrHristov said...

I made them static, but the black lines aren't disappearing. The actual problem I'm dealing with is that eventhough the tiles are perfectly next to each other(no space between them), there are black lines between the tiles. I looked for a solution and 2 things came up: first - make the material for the object sprites>default, this made the game look like shit, so I decided to go with the second solution whitch was the mesh combiner. I don't what to do man. I'v been working with unity for an year now, but I've never had this problem. Actually so you dont misunderstand me, the lines can be seen only on android, on the PC there are on lines.  
Maybe there is some tweeking in the static menu that can help?

[12:37 AM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1541144222154#c4569193841697668638 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4569193841697668638 "Delete Comment") 

[!\[Image\](https://2.bp.blogspot.com/\_-IghYFFB3OY/SaLSKjS3-1I/AAAAAAAAAB0/btom1yEVx6M/S45-s35/New%2 Bcanvas.png)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Mobile games render things differently, in a more optimized (annoying) way. There are a few solutions to your problem depending on your approach, but combining meshes would probably work.  
  
Basically, the trick is to have a separate parent or display object with an empty mesh filter, then stick your combined mesh into that.  
  
I have a video about how to do it if you have just one material. This post is about tweaking that so it works with many materials. But... you may also want to take a look at the asset store and see if there's a cheap asset to combine meshes. I think I remember a few.

[4:41 AM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1541158878900#c4098726945018657800 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4098726945018657800 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

DrHristov said...

OK, thanks. I'm going on a trip now so when I come back I'll try to do it.

[5:09 AM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1541160566723#c7518107019866002801 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7518107019866002801 "Delete Comment") 

[!\[Image\](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKxPnxleAIlZr1 Gs-MMw5o5MUIP86DQkCHUd-E6n1 ZeVcRHUlXS6cps-8\_iZbMt59dXhZ1z2iahPDWtUW4 KcVaPu6 Yim5 VcfQZbX0nJx7H0tHb6huma7 UnwHRDsxkWvQ/s45-c/Instasize\_0129205229.jpg)](https://www.blogger.com/profile/00543781846485040613)

[Abubaker](https://www.blogger.com/profile/00543781846485040613) said...

This script is broken. There is no Types for generic lists and GetComponent calls. Also it writes a correct number of materials into debug console but meshes don't get combined.

[6:51 AM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1608389460952#c5298954664410384239 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/5298954664410384239 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

Yes, check the date on the code snippets you use. Unity's constantly evolving implementations are a reason I don't use Unity any more.

[7:20 AM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1608391220809#c6903314441001359416 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/6903314441001359416 "Delete Comment") 

!\[Image\](https://resources.blogblog.com/img/blank.gif)

Anonymous said...

The problem Abubaker observed in the sample code is that all the type parameters of the generic types are invisible since the "less than" and "greater than" symbols are not escaped and thus interpreted as (invalid) HTML. ^^

[6:39 AM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1633095585822#c4094408633356480160 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/4094408633356480160 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/16014112078562237275)

[Unknown](https://www.blogger.com/profile/16014112078562237275) said...

This comment has been removed by the author. 

[2:28 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1645914507341#c8359645052016217525 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/8359645052016217525 "Delete Comment") 

[!\[Image\](https://www.blogger.com/img/blogger\_logo\_round\_35.png)](https://www.blogger.com/profile/02075485383061180575)

[Unknown](https://www.blogger.com/profile/02075485383061180575) said...

not working i have try to fix but even doing that it dosnt work, its seems to but it dosnt, my result was not correct so bad...

[3:41 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1662331291745#c7616504714446501755 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/7616504714446501755 "Delete Comment") 

[!\[Image\](https://resources.blogblog.com/img/blank.gif)](https://www.blogger.com/profile/13173752470581218239)

[Craig Perko](https://www.blogger.com/profile/13173752470581218239) said...

This is ancient, dude.

[5:50 PM](https://projectperko.blogspot.com/2016/08/multi-material-mesh-merge-snippet.html?showComment=1662339032329#c9036903938719929391 "comment permalink") [!\[Image\](https://resources.blogblog.com/img/icon\_delete13.gif)](https://www.blogger.com/comment/delete/11758224/9036903938719929391 "Delete Comment")

[Post a Comment](https://www.blogger.com/comment/fullpage/post/11758224/1179603664882948168)

[Newer Post](https://projectperko.blogspot.com/2016/08/concrete-analogies.html "Newer Post")  [Older Post](https://projectperko.blogspot.com/2016/08/world-weaving.html "Older Post")  [Home](https://projectperko.blogspot.com/)

Subscribe to: [Post Comments (Atom)](https://projectperko.blogspot.com/feeds/1179603664882948168/comments/default)
