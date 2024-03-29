# Assignment 2: Scene Graph in WebGL

In this assignment, you will take the simple scene graph created in A1 and redo it for WebGL.  The scene graph supports various simple 3D objects, textures and lights.  You will write a shader to implement a lighting model similar to the one discussed in class.

## Due: Friday Oct 4th, 11:59pm

## Author

**Name:  PLEASE PUT YOUR NAME HERE**

## Overview 

The assignment requires you to do two main things:

1. Implement a WebGL renderer for the scene graph library defined in `src/SG.ts`. A number of new classes have been provided to define the interface that you must implement.
2. Adjust the texture coordinates on the box model generated by the included code, to properly map a custom texture labelling the faces. 

The learning objectives of this assignment are to gain hands on experience with shaders, 2D texturing and the Phong illumination model.  The amount of code provided far exceeds the amount of code you must write, so please start by taking the time to understand the updated `src/SG.ts`

The assignment will be graded out of 30.  

You should submit your project using github classroom, as in the previous assignments.  All of the code for the scene graph should be in `src/SG.ts`, and the texture coordinates on the box should be adjusted in the provided sample code (`src/app.ts` and `src/ex2.ts`) such that the central cube in the sample is textured as shown below. 

As before, the TAs should be able to compile your files by running the ```tsc``` command and then open index.html to see your animated character.

## The Scene Graph

The graph's ```render()``` method will compute all of the transformations on the tree of `Things` (graph nodes). The method will compute the camera matrices as before, and the world transformation matrix for each Drawable element in the graph. It will now need to also find the position of each light in the graph and, unlike the previous version of `src/SG.ts`, you will **NOT** use any HTML or CSS in the graph, but render everything with WebGL.  

The main task will be to complete a fragment shader that implements a lighting model similar to the one discussed in class.  The equation for the Phong lighting model you will implement is:

![Phong model](img/phong.png)

(where `Ipi` is the illumination of light `i`, a combination of the color of the light and a floating point intensity that scales the color).

The sample code also includes a new version of the previous example program (`ex1.html` and `src/ex1.ts`) that uses WebGL to render the set of five simple scenes from this A1 sample (in this case, we have created images of the DIVs from A1, and texture mapped them onto cubes):

- single cube, translated -11000 in z, camera translated by (-100,100,0)<br>
![scene 1](img/ex1a.png)

- single cube, translated -100 in z, camera translated by 451, so the front of the cube fills the view<br>
![scene 2](img/ex1b.png)

- single cube, flatted with a non-uniform scale, rotated by 35 degrees around X<br>
![scene 3](img/ex1c.png)

- two flattened cubes, transformed to be 90 degrees from each other, rotated on an edge, with a camera rotation, and a simple ground plane under them<br>
![scene 1](img/ex1d.png)

- single flattened cube, rotating, with camera rotating as well<br>
![scene 1](img/ex1e.png)

## Details

We have provided multiple test programs that can be used test your `src/SG.ts` module.  

- `src/ex1.ts` and `ex1.html` implement scenes similar to A1, shown above.  You can use this as a first set of tests;  once ex1.html matches the images above, at least the core of `src/SG.ts` works.  The examples in this sample can be close to working with only a very simple fragment shader (e.g., most lighting can be ignored).  The images above are from this working sample with correct lighting.

- A second test set is in `index.html` and `src/app.ts`, with a static variation in `ex2.html` and `src/ex2.ts`.  These two programs implement similar scenes, but `index.html` is animated (and the central cube is tilted forward, showing the top), while `ex2.html` is static (and the central cube is tilted upward, showing the bottom).  This sample should be modified to complete the texture coordinate half of the assignment.
  - Here is the animated index.html:<br>
![scene 1](img/a2-index.gif)
  - Here is the static ex2.html:<br>
![scene 1](img/a2-ex2.png)

- A version of `ex2` without textures is in `ex3`;  this will be useful for testing lighting because the colors are clearer.  

- `ex4` and `ex5` are a scene (animated and not) with eight lights. 

### Scene Graph

The sample code has comments to explain what needs to be written, but the main requirements are:

- Use WebGL instead of CSS perspective.  The Scene constructor has been updated to set up the canvas correctly for WebGL.
- The scene graph now has a `Drawable` class (to replace `HTMLThing`) that has a `mesh` property in it that should be rendered using a WebGL shader. The `mesh` contains a list of vertices, texture coordinates, and normals, along with an list of indices that define a series of triangles.
- There are a number of subtypes of `Drawable` provided that create some standard 3D object types.
- Each `Drawable` has a `Surface` property that defines the parameters to the lighting equation, and may also include a `Texture` property for the surface.  
- There are now `Light`s, which can be positional or directional.  Your graph should support up to eight lights.  
- Your implementation should support rendering object that have a texture or not, illuminated by up to eight directional and point lights.  You may implement these variations with one or more shaders.  The provided code assumes you will use a single shader, but you can change this to more shaders if you would like.

### Custom Texture Coordinates

The second part of the assignment is to adjust the texture coordinates on the central cube in both `src/app.ts` and `src/ex2` so that the texture on it has each of the six "names" mapped to the correct face, and orientated correctly (as shown in the above images):

- "front", "back", "left", "right" should be on the appropriate sides (left and right are on the left and right sides when looking at the front).  The text should be oriented so it is in the shown orientation (the text should be horizontal and read left-to-right around the cube).  

- "top" and "bottom" have smaller "(front)" text near one edge: that is the edge that should touch the front face.

The test files in `src/app.ts` and `src/ex2.ts` both contain a place to update the texture coordinates on the central cube in the scene.  The initial texture coordinates (which correspond to the default coordinates on the cube) map the entire texture to each face of the cube.  You should change the coordinates so that the correct 1/9th of the texture appears on the correct face, with the correct orientation.


## Submission

You will check out the project from github classroom, and submit it there.  The project folder should contain the files that were in the sample project, plus any additions to the sample project that are needed to implement the project.  Do not add extra files, and do not remove the .gitignore file (we do not want the "node_modules" directory in your repository.)

**Do Not Change the names** of the existing files (e.g., ex1.html, src/SG.ts, etc).  The TAs need to be able to test your program as follows:

1. cd into the directory and run ```npm install```
2. compile with ```tsc```
3. start a local web server in your directory (see below) and visit ```index.html```

Please test that your submission meets these requirements.  For example, after you check in your final version of the assignment to github, check it out again to a new directory and make sure everything builds and runs correctly.
 
# Development Environment

The sample has already been set up with a complete project for Typescript development, similar to the Assignments 0 and 1.  Please continue to use whatever setup works best for you.  
