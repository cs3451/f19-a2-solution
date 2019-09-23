// import the little Scene Graph library
import * as sg from './SG.js';

// find the div we want to use as our 3D Scene container
var scene = new sg.Scene(<HTMLDivElement>document.getElementById("scene"));

///////////////////////////////////
// Scene, in more human scale units

var cam = new sg.Camera(25,0.1,100);
cam.position = new sg.Vector(0,2,7); 
cam.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(-15,0,0));
scene.world.add(cam);

// put a white light above the origin
let light1 = new sg.Light();
light1.position = new sg.Vector(0,3,0);
light1.intensity = 1
scene.world.add(light1);

// put a blue light on the positive X axis
let light2 = new sg.Light();
light2.position = new sg.Vector(0,0.1,1.25);
light2.color = new sg.Color(0.2, 0.2, 1)
light2.intensity = 2
scene.world.add(light2);

var floor = new sg.Cube(1);
floor.surface.diffuseColor = new sg.Color(1,1,1);
floor.surface.diffuseK = 0.1
floor.surface.specularK = 0.5;
floor.position = new sg.Vector(0,0,0);
floor.scale = new sg.Vector(5,0.001,5);
scene.world.add(floor); 

// box
let box = new sg.Cube(0.75)
box.surface.diffuseColor = new sg.Color(1,1,1)
box.position = new sg.Vector(0,.75,0);
box.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(35,45,0));
scene.world.add(box)


// create a sphere, which we'll put a red light inside  
let sphereContainer = new sg.Thing()

let redSphere = new sg.Sphere(0.1)
redSphere.surface.diffuseColor = new sg.Color(1,0.1,0.1)
redSphere.position= new sg.Vector(1.5,0.25,0)

sphereContainer.add(redSphere)

let light3 = new sg.Light();
light3.position = new sg.Vector(0,0,0);
light3.color = new sg.Color(1, 0.2, 0.2)
light3.intensity = 1
redSphere.add(light3);

scene.world.add(sphereContainer)

// render this graph into the div container.
let startTime = performance.now();
let dt = 1.1
var renderFunc = function (t: number) {
    // time is returned in millisecons.  Lets convert to seconds, so it's more intuitive.

	let st = Math.sin(dt*10)
	redSphere.position.y = st * 0.4 + 0.5;

	st = Math.sin(dt)
	sphereContainer.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(0,st * 180,0));

    scene.render();
	requestAnimationFrame(renderFunc);
};
renderFunc(startTime);