// import the little Scene Graph library
import * as sg from './SG.js';
// find the div we want to use as our 3D Scene container
var scene = new sg.Scene(document.getElementById("scene"));
///////////////////////////////////
// Scene, in more human scale units
var cam = new sg.Camera(25, 0.1, 100);
cam.position = new sg.Vector(0, 2, 7);
cam.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(-15, 0, 0));
scene.world.add(cam);
// put a white light above the origin
let light1 = new sg.Light();
light1.position = new sg.Vector(0, 3, 0);
light1.intensity = 1;
scene.world.add(light1);
let lightSphere = new sg.Sphere(0.02);
lightSphere.surface.diffuseColor = new sg.Color(1, 1, 1);
lightSphere.position = new sg.Vector(0, 0, 0);
light1.add(lightSphere);
// put a blue light on the positive Z axis
let light2 = new sg.Light();
light2.position = new sg.Vector(0, 0.1, 1.25);
light2.color = new sg.Color(0.2, 0.2, 1);
light2.intensity = 1;
scene.world.add(light2);
lightSphere = new sg.Sphere(0.02);
lightSphere.surface.diffuseColor = new sg.Color(0.2, 0.2, 1);
lightSphere.position = new sg.Vector(0, 0, 0);
light2.add(lightSphere);
// put a green light on the positive X axis
let light4 = new sg.Light();
light4.position = new sg.Vector(1.25, 0.1, 0.25);
light4.color = new sg.Color(0.2, 1, 0.2);
light4.intensity = 1;
scene.world.add(light4);
lightSphere = new sg.Sphere(0.02);
lightSphere.surface.diffuseColor = new sg.Color(0.2, 1, 0.2);
lightSphere.position = new sg.Vector(0, 0, 0);
light4.add(lightSphere);
// put a green light on the negative X axis
let light5 = new sg.Light();
light5.position = new sg.Vector(-1.25, 0.1, 0.25);
light5.color = new sg.Color(0.2, 1, 0.2);
light5.intensity = 1;
scene.world.add(light5);
lightSphere = new sg.Sphere(0.02);
lightSphere.surface.diffuseColor = new sg.Color(0.2, 1, 0.2);
lightSphere.position = new sg.Vector(0, 0, 0);
light5.add(lightSphere);
// put a blue light on the positive Z axis
let light6 = new sg.Light();
light6.position = new sg.Vector(0, 0.1, -1.25);
light6.color = new sg.Color(0.2, 0.2, 1);
light6.intensity = 1;
scene.world.add(light6);
lightSphere = new sg.Sphere(0.02);
lightSphere.surface.diffuseColor = new sg.Color(0.2, 0.2, 1);
lightSphere.position = new sg.Vector(0, 0, 0);
light6.add(lightSphere);
// put a light on the positive X / Z axis
let light7 = new sg.Light();
light7.position = new sg.Vector(1.25, 1.1, 1.25);
light7.color = new sg.Color(1, 1, 0.2);
light7.intensity = 1;
scene.world.add(light7);
lightSphere = new sg.Sphere(0.02);
lightSphere.surface.diffuseColor = new sg.Color(1, 1, 0.2);
lightSphere.position = new sg.Vector(0, 0, 0);
light7.add(lightSphere);
// put a green light on the negative X / Z axis
let light8 = new sg.Light();
light8.position = new sg.Vector(-1.25, 1.1, -1.25);
light8.color = new sg.Color(0.2, 1, 1);
light8.intensity = 1;
scene.world.add(light8);
lightSphere = new sg.Sphere(0.02);
lightSphere.surface.diffuseColor = new sg.Color(0.2, 1, 1);
lightSphere.position = new sg.Vector(0, 0, 0);
light8.add(lightSphere);
var floor = new sg.Cube(1);
floor.surface.diffuseColor = new sg.Color(1, 1, 1);
floor.surface.diffuseK = 0.3;
floor.surface.specularK = 0.5;
floor.position = new sg.Vector(0, 0, 0);
floor.scale = new sg.Vector(5, 0.001, 5);
scene.world.add(floor);
// ring
let ring = new sg.Torus(.66, .33);
ring.surface.diffuseColor = new sg.Color(1, 1, 1);
ring.surface.diffuseK = 0.3;
ring.position = new sg.Vector(0, .75, 0);
ring.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(35, 0, 0));
scene.world.add(ring);
let cone1 = new sg.Cone(0.4, 1);
cone1.surface.diffuseColor = new sg.Color(1, 1, 1);
cone1.surface.diffuseK = 0.4;
cone1.surface.specularK = 0;
cone1.position = new sg.Vector(-1.25, .5, -1);
cone1.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(-90, 0, 0));
scene.world.add(cone1);
let cone2 = new sg.Cone(0.4, 1);
cone2.surface.diffuseColor = new sg.Color(1, 1, 1);
cone2.surface.diffuseK = 0.4;
cone2.surface.specularK = 0;
cone2.position = new sg.Vector(1.25, .5, -.25);
cone2.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(-90, 0, 0));
scene.world.add(cone2);
// create a sphere, which we'll put a red light inside  
let sphereContainer = new sg.Thing();
let redSphere = new sg.Sphere(0.1);
redSphere.surface.diffuseColor = new sg.Color(1, 0.1, 0.1);
redSphere.position = new sg.Vector(1.5, 0.25, 0);
sphereContainer.add(redSphere);
let light3 = new sg.Light();
light3.position = new sg.Vector(0, 0, 0);
light3.color = new sg.Color(1, 0.2, 0.2);
light3.intensity = 1;
redSphere.add(light3);
scene.world.add(sphereContainer);
// render this graph into the div container.
let startTime = performance.now();
let dt = 1.1;
var renderFunc = function (t) {
    // time is returned in millisecons.  Lets convert to seconds, so it's more intuitive.
    let st = Math.sin(dt * 10);
    redSphere.position.y = st * 0.4 + 0.5;
    st = Math.sin(dt);
    sphereContainer.rotation = sg.Matrix.makeRotationFromEuler(new sg.Vector(0, st * 180, 0));
    scene.render();
    requestAnimationFrame(renderFunc);
};
renderFunc(startTime);
//# sourceMappingURL=ex5.js.map