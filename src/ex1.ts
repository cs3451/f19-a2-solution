// import the little Scene Graph library
import * as sg from './SG.js';

// find the div's we want to use as our 3D Scene containers
var s1 = new sg.Scene(<HTMLDivElement>document.getElementById("translate-z-negative"));
var s2 = new sg.Scene(<HTMLDivElement>document.getElementById("translate-z-positive"));
var s3 = new sg.Scene(<HTMLDivElement>document.getElementById("rotate-x"));
var s4 = new sg.Scene(<HTMLDivElement>document.getElementById("rotate-y"));
var s5 = new sg.Scene(<HTMLDivElement>document.getElementById("rotate-z"));

///////////////////////////////////
// Scene 1.

// Move the camera back, and up half the size of the panel.  The upper left corner
// of the panel should be at the center of the viewport.
var cam1 = new sg.Camera(25,1,10000);
cam1.position = new sg.Vector(-100,100,0); 
s1.world.add(cam1);

// put a light above and to the left of the camera
let light1 = new sg.Light();
//light1.position = new sg.Vector(-10,50,0);
light1.position = new sg.Vector(0,0,1);
light1.directional = true
cam1.add(light1);

// create a texture for a cube
let t1 = new sg.Texture("/img/example-a.png");

// put a cube in the scene graph, pushed out a bit further down the z axis
var n1 = new sg.Cube(200);
n1.surface.texture = t1;
n1.surface.diffuseColor = new sg.Color(1,1,1);
n1.surface.specularK = 0;
n1.position = new sg.Vector(0,0,-1100); 
n1.scale = new sg.Vector(1,1,1)
s1.world.add(n1);

// render this graph into the div container.
var s1renderFunc = function() {
	s1.render();
	requestAnimationFrame(s1renderFunc);
};
s1renderFunc();

///////////////////////////////////
// Scene 2
//
// the camera is 25 degrees;  should result in a focal length of ~450 or so, based on a 200 pixel 
// square container.  We'll move it that far back, so the 200x200 panel should fill the viewport
var cam2 = new sg.Camera(25,1,10000);
cam2.position = new sg.Vector(0,0,451); 
s2.world.add(cam2);

// put a light above and to the left of the camera
let light2 = new sg.Light();
light2.position = new sg.Vector(0,0,1);
light2.directional = true;
cam2.add(light2);

// create a texture for a cube
let t2 = new sg.Texture("/img/example-b.png");

var n2 = new sg.Cube(200);
n2.surface.texture = t2;
n2.surface.diffuseColor = new sg.Color(1,1,1);
n2.surface.specularK = 0;
n2.position = new sg.Vector(0,0,-100); 
n2.scale = new sg.Vector(1,1,1)
s2.world.add(n2);

// render this graph into the div container.
var s2renderFunc = function() {
	s2.render();
	requestAnimationFrame(s2renderFunc);
};
s2renderFunc();

///////////////////////////////////
// Scene 3
//
// Move back, and rotate around positive X.  Top edge should be closer to screen.

var cam3 = new sg.Camera(25,1,10000);
cam3.position = new sg.Vector(0,0,750); 
s3.world.add(cam3);

// put a light above and to the left of the camera
let light3 = new sg.Light();
light3.position = new sg.Vector(0,0,1);
light3.directional = true;
cam3.add(light3);

// create a texture for a cube
let t3 = new sg.Texture("/img/example-c.png");

var n3 = new sg.Cube(200);
n3.surface.texture = t3;
n3.surface.diffuseColor = new sg.Color(1,1,1);
n3.surface.specularK = 0;
n3.scale = new sg.Vector(1,1,0.001)
n3.position = new sg.Vector(0,0,-100); 
n3.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(35,0,0)); 
s3.world.add(n3);

// render this graph into the div container.
var s3renderFunc = function() {
	s3.render();
	requestAnimationFrame(s3renderFunc);
};
s3renderFunc();

///////////////////////////////////
// Scene 4.  
//
// More complex scene.  Two red panels, set up so they are at 90 degrees to each 
// other along an edge.  One image panel under them.
//
// We also tilt the camera, to test that.

var cam4 = new sg.Camera(25,1,10000);
cam4.position = new sg.Vector(100,100,800); 
cam4.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(-10,10,0));
s4.world.add(cam4);

// put a light above and to the left of the camera
let light4 = new sg.Light();
light4.position = new sg.Vector(0,0,1);
light4.directional = true;
cam4.add(light4);

// create a texture for a cube
let t4a = new sg.Texture("/img/example-d1.png");
let t4b = new sg.Texture("/img/example-d2.png");
let t4c = new sg.Texture("/img/graph-paper.png");

// we move by -70.7 because after rotation by 45 degrees that's about what we have to move
// to get the edge into the center (hint: cos(45 degrees) = ~0.707)

var n4 = new sg.Thing();
var n4c = new sg.Cube(200);
n4c.surface.texture = t4a;
n4c.surface.diffuseColor = new sg.Color(1,1,1);
n4c.surface.specularK = 0;
n4c.scale = new sg.Vector(1,1,0.001)
n4.add(n4c)
n4.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(0,45,0)); 
n4.position = new sg.Vector(-70.7,0,0);
s4.world.add(n4);

var n41 = new sg.Thing();
var n41c = new sg.Cube(200);
n41c.surface.texture = t4b;
n41c.surface.diffuseColor = new sg.Color(1,1,1);
n41c.surface.specularK = 0;
n41c.scale = new sg.Vector(1,1,0.001)
n41.add(n41c)
n41.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(0,-90,0)); 
n41.position = new sg.Vector(100,0,100);
n4.add(n41);

var n4g = new sg.Cube(200);
n4g.surface.texture = t4c;
n4g.surface.diffuseColor = new sg.Color(1,1,1);
n4g.surface.specularK = 0;
n4g.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(-90,0,0)); 
n4g.position = new sg.Vector(0,-100,0);
n4g.scale = new sg.Vector(2,2,0.001);
n4.add(n4g); 

// render this graph into the div container.
var s4renderFunc = function() {
	s4.render();
	requestAnimationFrame(s4renderFunc);
};
s4renderFunc();

// ///////////////////////////////////
// // Scene 5.  Till in Z, spin in X, and rotate the camera back and forth
var cam5 = new sg.Camera(25,1,10000);
cam5.position = new sg.Vector(0,0,0); 
s5.world.add(cam5);

// put a light above and to the left of the camera
let light5 = new sg.Light();
light5.position = new sg.Vector(0,0,1);
light5.directional = true;
cam5.add(light5);

// create a texture for a cube
let t5 = new sg.Texture("/img/example-e.png");

var n5 = new sg.Cube(200);
n5.surface.texture = t5;
n5.surface.diffuseColor = new sg.Color(1,1,1);
n5.surface.specularK = 0;
n5.scale = new sg.Vector(1,1,0.001)

n5.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(0,0,35)); 
n5.position = new sg.Vector(0,0,-1000);
s5.world.add(n5);

var yRotation = 0;
var camYRotation =12;
var camYInc = 0.2;
var s5renderFunc = function() {
	yRotation += 3;
	if (yRotation > 360) {
		yRotation -= 360;
	}
	n5.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(0,yRotation,35)); 
	
	camYRotation += camYInc;
	if (camYRotation > 12 || camYRotation < -12) {
		camYRotation -= camYInc;
		camYInc *= -1;
	}
	cam5.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(0,camYRotation,0));
	
	s5.render();
	requestAnimationFrame(s5renderFunc);
};
s5renderFunc();