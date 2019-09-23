// Some of the WebGL code based on an example in David Eck's 
// Introduction to Computer Graphics
//     Version 1.2, January 2018
// http://math.hws.edu/graphicsbook/
// 
// retrieved September 2019
//
// Basic code structure from TypescriptSamples rayTracer
import * as models from './basic-object-models-IFS.js';
// utility function to make sure we don't have too small numbers
function epsilon(value) {
    return Math.abs(value) < 0.000001 ? 0 : value;
}
// convert degrees to radians
var degreeToRadiansFactor = Math.PI / 180;
export function degToRad(degrees) {
    return degrees * degreeToRadiansFactor;
}
// convert radians to degress
var radianToDegreesFactor = 180 / Math.PI;
export function radToDeg(radians) {
    return radians * radianToDegreesFactor;
}
///////////////////////////////////////////
// minimal matrix, Color and vector classes
export class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static times(k, v) { return new Vector(k * v.x, k * v.y, k * v.z); }
    static minus(v1, v2) { return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z); }
    static plus(v1, v2) { return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z); }
    static dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z; }
    static mag(v) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); }
    static norm(v) {
        var mag = Vector.mag(v);
        var div = (mag === 0) ? Infinity : 1.0 / mag;
        return Vector.times(div, v);
    }
    static cross(v1, v2) {
        return new Vector(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
    }
    toString() {
        return "[" + this.x + ", " + this.y + ", " + this.z + "]";
    }
}
// NEW. Simple Class for colors.
export class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    static scale(k, v) { return new Color(k * v.r, k * v.g, k * v.b); }
    static plus(v1, v2) { return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b); }
    static times(v1, v2) { return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b); }
    static toDrawingColor(c) {
        var legalize = (d) => d > 1 ? 1 : d;
        return {
            r: Math.floor(legalize(c.r) * 255),
            g: Math.floor(legalize(c.g) * 255),
            b: Math.floor(legalize(c.b) * 255)
        };
    }
}
Color.white = new Color(1.0, 1.0, 1.0);
Color.grey = new Color(0.5, 0.5, 0.5);
Color.black = new Color(0.0, 0.0, 0.0);
Color.background = Color.black;
Color.defaultColor = Color.black;
export class Matrix {
    // construct a new matrix (including copying one and creating an identity matrix)
    constructor(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        // the matrix elements
        this.elements = new Float32Array(16);
        var te = this.elements;
        te[0] = n11;
        te[4] = n12;
        te[8] = n13;
        te[12] = n14;
        te[1] = n21;
        te[5] = n22;
        te[9] = n23;
        te[13] = n24;
        te[2] = n31;
        te[6] = n32;
        te[10] = n33;
        te[14] = n34;
        te[3] = n41;
        te[7] = n42;
        te[11] = n43;
        te[15] = n44;
        // te[ 0 ] = n11; te[ 1 ] = n12; te[ 2 ] = n13; te[ 3 ] = n14;
        // te[ 4 ] = n21; te[ 5 ] = n22; te[ 6 ] = n23; te[ 7 ] = n24;
        // te[ 8 ] = n31; te[ 9 ] = n32; te[ 10 ] = n33; te[ 11 ] = n34;
        // te[ 12 ] = n41; te[ 13 ] = n42; te[ 14 ] = n43; te[ 15 ] = n44;
        return this;
    }
    static transpose(m) {
        var t = m.elements;
        return new Matrix(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15]);
    }
    static copy(m) {
        var te = m.elements;
        return new Matrix(te[0], te[4], te[8], te[12], te[1], te[5], te[9], te[13], te[2], te[6], te[10], te[14], te[3], te[7], te[11], te[15]);
    }
    // static methods for creating some useful matrices
    static identity() { return new Matrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
    static lookAt(eye, target, up) {
        var z = Vector.norm(Vector.minus(target, eye));
        var x = Vector.norm(Vector.cross(up, z));
        var y = Vector.cross(z, x);
        return new Matrix(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1);
    }
    static makeRotationFromEuler(eu) {
        const x = degToRad(eu.x);
        const y = degToRad(eu.y);
        const z = degToRad(eu.z);
        const a = Math.cos(x), b = Math.sin(x);
        const c = Math.cos(y), d = Math.sin(y);
        const e = Math.cos(z), f = Math.sin(z);
        var matrix = Matrix.identity();
        var te = matrix.elements;
        const ae = a * e, af = a * f, be = b * e, bf = b * f;
        te[0] = c * e;
        te[4] = -c * f;
        te[8] = d;
        te[1] = af + be * d;
        te[5] = ae - bf * d;
        te[9] = -b * c;
        te[2] = bf - ae * d;
        te[6] = be + af * d;
        te[10] = a * c;
        // te[ 0 ] = c * e;
        // te[ 1 ] = - c * f;
        // te[ 2 ] = d;
        // te[ 4 ] = af + be * d;
        // te[ 5 ] = ae - bf * d;
        // te[ 6 ] = - b * c;
        // te[ 8 ] = bf - ae * d;
        // te[ 9 ] = be + af * d;
        // te[ 10 ] = a * c;
        return matrix;
    }
    static makeTranslation(t) {
        return new Matrix(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1);
    }
    static makeScale(s) {
        return new Matrix(s.x, 0, 0, 0, 0, s.y, 0, 0, 0, 0, s.z, 0, 0, 0, 0, 1);
    }
    // NEW:  create a perspective matrix.  This code taken from gl-matrix library
    static makePerspective(fovy, aspect, near, far) {
        let fovy_radian = degToRad(fovy);
        var f = 1.0 / Math.tan(fovy_radian / 2), nf = 1 / (near - far);
        return new Matrix(f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, (2 * far * near) * nf, 0, 0, -1, 0);
    }
    // compose transformations with multiplication
    multiply(b) {
        var ae = this.elements;
        var be = b.elements;
        var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
        var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
        // var a11 = ae[ 0 ], a12 = ae[ 1 ], a13 = ae[ 2 ], a14 = ae[ 3 ];
        // var a21 = ae[ 4 ], a22 = ae[ 5 ], a23 = ae[ 6 ], a24 = ae[ 7 ];
        // var a31 = ae[ 8 ], a32 = ae[ 9 ], a33 = ae[ 10 ], a34 = ae[ 11 ];
        // var a41 = ae[ 12 ], a42 = ae[ 13 ], a43 = ae[ 14 ], a44 = ae[ 15 ];
        // var b11 = be[ 0 ], b12 = be[ 1 ], b13 = be[ 2 ], b14 = be[ 3 ];
        // var b21 = be[ 4 ], b22 = be[ 5 ], b23 = be[ 6 ], b24 = be[ 7 ];
        // var b31 = be[ 8 ], b32 = be[ 9 ], b33 = be[ 10 ], b34 = be[ 11 ];
        // var b41 = be[ 12 ], b42 = be[ 13 ], b43 = be[ 14 ], b44 = be[ 15 ];
        return new Matrix(a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41, a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42, a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43, a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44, a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41, a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42, a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43, a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44, a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41, a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42, a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43, a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44, a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41, a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42, a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43, a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44);
    }
    multiplyVector(v) {
        var x = v.x;
        var y = v.y;
        var z = v.z;
        var e = this.elements;
        // return new Vector(e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ],
        //                   e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ],
        //                   e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ]);
        return new Vector(e[0] * x + e[1] * y + e[2] * z + e[3], e[4] * x + e[5] * y + e[6] * z + e[7], e[8] * x + e[9] * y + e[10] * z + e[11]);
    }
    getPosition() {
        return new Vector(this.elements[12], this.elements[13], this.elements[14]);
        // return new Vector(this.elements[3], this.elements[7], this.elements[11]);
    }
    getXVector() {
        return new Vector(this.elements[0], this.elements[1], this.elements[2]);
        // return new Vector(this.elements[0], this.elements[4], this.elements[8]);
    }
    getYVector() {
        return new Vector(this.elements[4], this.elements[5], this.elements[6]);
        // return new Vector(this.elements[1], this.elements[5], this.elements[9]);
    }
    getZVector() {
        return new Vector(this.elements[8], this.elements[9], this.elements[10]);
        // return new Vector(this.elements[2], this.elements[6], this.elements[10]);
    }
    // NEW.
    normalMatrix(out) {
        let a = this.elements;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, 
        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            throw "can't compute normalMatrix";
        }
        det = 1.0 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        return out;
    }
    ;
    toString() {
        var te = this.elements;
        return "[" +
            te[0] + ", " + te[4] + ", " + te[8] + ", " + te[12] + ",\n" +
            te[1] + ", " + te[5] + ", " + te[9] + ", " + te[13] + ",\n" +
            te[2] + ", " + te[6] + ", " + te[10] + ", " + te[14] + ",\n" +
            te[3] + ", " + te[7] + ", " + te[11] + ", " + te[15] + "]";
        // te[ 0 ] + ", " + te[ 1 ] + ", " + te[ 2 ] + ", " + te[ 3 ] + ",\n" +
        // te[ 4 ] + ", " + te[ 5 ] + ", " + te[ 6 ] + ", " + te[ 7 ] + ",\n" +
        // te[ 8 ] + ", " + te[ 9 ] + ", " + te[ 10 ]+ ", " + te[ 11 ] + ",\n" +
        // te[ 12 ] + ", " + te[ 13 ] + ", " + te[ 14 ]+ ", " + te[ 15 ] + "]";  
    }
}
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// New Classes for WebGL scene graph
//
// First, the two shaders we're using
var vertexShaderSource = `
attribute vec3 a_coords;
attribute vec3 a_normal;
attribute vec2 a_texCoords;

uniform mat4 modelview;
uniform mat4 projection;

varying vec2 v_texCoords;
varying vec3 v_normal;
varying vec3 v_eyeCoords;

void main() {
    vec4 coords = vec4(a_coords,1.0);
    vec4 eyeCoords = modelview * coords;

    gl_Position = projection * eyeCoords;

    v_normal = normalize(a_normal);
    v_eyeCoords = eyeCoords.xyz/eyeCoords.w; // (Note: eyeCoords.w is 1 unless modelview is weird)
    v_texCoords = a_texCoords;
}
`;
let maxLights = 8;
var fragmentShaderSource = `
precision mediump float;

const int MAX_LIGHTS = ` + maxLights + `;

uniform sampler2D texture;
uniform int useTexture;
uniform mat3 normalMatrix;

uniform vec3 ambientLightColor;
uniform float lightAttC0;
uniform float lightAttC1;
uniform float lightAttC2;

uniform int lightCount;
uniform vec4 lightPosition[` + maxLights + `];
uniform vec3 lightColor[` + maxLights + `];
uniform float lightIntensity[` + maxLights + `];

uniform vec3 diffuseColor;
uniform float ambientK;
uniform float diffuseK;
uniform float specularK;
uniform float specularExponent;

varying vec2 v_texCoords;
varying vec3 v_normal;
varying vec3 v_eyeCoords;

void main() {

    //gl_FragColor = texture_color;
    
    vec3 N, L, R, V;  // vectors for lighting equation
    N = normalize( normalMatrix*v_normal);
    V = normalize( -v_eyeCoords);  // (Assumes a perspective projection.)

    vec3 color = ambientLightColor.rgb * ambientK * diffuseColor;
    float att = 1.;

    for (int i=0; i < MAX_LIGHTS; i++) {
        if (i>lightCount) {break;}

        vec3 lightVal = vec3(0.,0.,0.); 
        if ( lightPosition[0].w == 0.0 ) {
            L = normalize( lightPosition[i].xyz );
        } else {
            vec3 Lvec = lightPosition[i].xyz/lightPosition[i].w - v_eyeCoords;
            float d = length(Lvec);
            att = 1.0/(lightAttC0 + lightAttC1 * d + lightAttC2 * d * d);
            L = normalize(Lvec);
        }
        R = -reflect(L,N);

        if ( dot(L,N) > 0.0 ) {
            lightVal = dot(L,N) * diffuseColor * diffuseK;
        }
        if (dot(R,V) > 0.0) {
            lightVal += vec3(1,1,1) * pow(dot(R,V),specularExponent) * specularK;
        }
        color += lightVal * att * lightIntensity[i] * lightColor[i];
    }

    if (useTexture > 0) {
        vec4 texture_color = texture2D( texture, v_texCoords );
        gl_FragColor = texture_color * vec4(color,1.0); 
    } else {
        gl_FragColor = vec4(color,1.0);
    }
 }
`;
// Texture class.  
//
export class Texture {
    constructor(url) {
        // Asynchronously load an image
        this.image = new Image();
        this.image.src = url;
        this.texture = null;
        this.imageLoaded = false;
        this.image.addEventListener('load', () => {
            this.imageLoaded = true;
        });
    }
    // setup() sets up the shader to use this texture.
    setupTexture(gl) {
        if (this.texture === null) {
            // Create a texture.
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            // Fill the texture with a 1x1 blue pixel.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        }
        else {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
        if (this.imageLoaded) {
            this.imageLoaded = false;
            // Now that the image has loaded make copy it to the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        ;
    }
}
//
// A surface properties class.  Collects all the surface properties of
// an object together.  
//
// The lighting equation properties.
// The texture, if there is one.
//
export class Surface {
    constructor() {
        this.diffuseColor = Color.grey;
        this.ambientK = 1;
        this.diffuseK = 1;
        this.specularK = 1;
        this.texture = null;
        this.specularExponent = 10;
    }
}
//////////////////////////////////////////
// all the nodes in the tree are Things
export class Thing {
    constructor() {
        this.position = new Vector(0, 0, 0);
        this.rotation = Matrix.identity();
        this.scale = new Vector(1, 1, 1);
        this.parent = null;
        this.children = new Array();
        this.transform = Matrix.identity();
        this.inverseTransform = Matrix.identity();
        this.worldTransform = Matrix.identity();
    }
    computeTransforms() {
        var p = Matrix.makeTranslation(this.position);
        var pinv = Matrix.makeTranslation(Vector.times(-1, this.position));
        var r = this.rotation;
        var rinv = Matrix.transpose(r);
        var s = Matrix.makeScale(this.scale);
        var sinv = Matrix.makeScale(new Vector(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z));
        this.transform = p.multiply(r.multiply(s));
        this.inverseTransform = sinv.multiply(rinv.multiply(pinv));
    }
    add(c) {
        this.children.push(c);
        if (c.parent) {
            c.parent.remove(c);
        }
        c.parent = this;
    }
    remove(c) {
        var index = this.children.indexOf(c);
        if (index !== -1) {
            c.parent = null;
            this.children.splice(index, 1);
        }
    }
    traverse(callback) {
        callback(this);
        for (var i = 0, l = this.children.length; i < l; i++) {
            this.children[i].traverse(callback);
        }
    }
}
/////////////////////////////
// Things that are Drawable.
export class Drawable extends Thing {
    // Child class will create the mesh and pass it in
    constructor(mesh) {
        super();
        this.surface = new Surface();
        this.a_coords_buffer = null;
        this.a_normal_buffer = null;
        this.index_buffer = null;
        this.texCoord_buffer = null;
        this.mesh = mesh;
    }
    setMaterial(s) {
        this.surface = s;
    }
    render(gl, sd) {
        if (this.a_normal_buffer === null) {
            this.a_coords_buffer = gl.createBuffer();
            this.a_normal_buffer = gl.createBuffer();
            this.index_buffer = gl.createBuffer();
            this.texCoord_buffer = gl.createBuffer();
        }
        // first, set up the surface properties
        gl.uniform1i(sd.u_useTexture, this.surface.texture ? 1 : 0);
        if (this.surface.texture) {
            this.surface.texture.setupTexture(gl);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.surface.texture.texture);
            gl.uniform1i(sd.u_texture, 0);
        }
        // some initial values, for fun.  They'll be overwritten, of course
        gl.uniform1f(sd.u_ambientK, this.surface.ambientK);
        gl.uniform1f(sd.u_diffuseK, this.surface.diffuseK);
        gl.uniform1f(sd.u_specularK, this.surface.specularK);
        gl.uniform3f(sd.u_diffuseColor, this.surface.diffuseColor.r, this.surface.diffuseColor.g, this.surface.diffuseColor.b);
        gl.uniform1f(sd.u_specularExponent, this.surface.specularExponent);
        // second, set up vertex shader inputs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_coords_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.mesh.vertexPositions, gl.STATIC_DRAW);
        gl.vertexAttribPointer(sd.a_coords_loc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(sd.a_coords_loc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.a_normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.mesh.vertexNormals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(sd.a_normal_loc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(sd.a_normal_loc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.mesh.vertexTextureCoords, gl.STATIC_DRAW);
        gl.vertexAttribPointer(sd.a_texCoords_loc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(sd.a_texCoords_loc);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indices, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, this.mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
export class Sphere extends Drawable {
    constructor(radius = 0.5, slices = 32, stacks = 16) {
        super(models.uvSphere(radius, slices, stacks));
    }
}
export class Cube extends Drawable {
    constructor(side = 1) {
        super(models.cube(side));
    }
}
export class Torus extends Drawable {
    constructor(outerRadius = 0.5, innerRadius = -1, slices = 32, stacks = 16) {
        super(models.uvTorus(outerRadius, innerRadius, slices, stacks));
    }
}
export class Ring extends Drawable {
    constructor(innerRadius = 0.25, outerRadius = -1, slices = 32) {
        super(models.ring(innerRadius, outerRadius, slices));
    }
}
export class Cylinder extends Drawable {
    constructor(radius = 0.5, height = -1, slices = 32, noTop = false, noBottom = false) {
        super(models.uvCylinder(radius, height, slices, noTop, noBottom));
    }
}
export class Cone extends Drawable {
    constructor(radius = 0.5, height = -1, slices = 32, noBottom = false) {
        super(models.uvCone(radius, height, slices, noBottom));
    }
}
//////////
// The Camera Thing.  There must be one and only one in the Scene.
export class Camera extends Thing {
    constructor(fovy, near = 0.1, far = 100) {
        super();
        this.fovy = fovy;
        this.near = near;
        this.far = far;
        this.aspect = 1;
        this.worldInverseTransform = Matrix.identity();
    }
    setupRender(gl, sd) {
        let perspectiveTransform = Matrix.makePerspective(this.fovy, this.aspect, this.near, this.far);
        gl.uniformMatrix4fv(sd.u_projection, false, perspectiveTransform.elements);
    }
}
// Things for Lights
export class Light extends Thing {
    constructor() {
        super();
        this.color = new Color(1, 1, 1);
        this.intensity = 1;
        this.directional = false;
    }
    setup(gl, sd, lightnumber, p) {
        if (lightnumber >= 0 && lightnumber < sd.u_lightColor.length) {
            gl.uniform4f(sd.u_lightPosition[lightnumber], p.x, p.y, p.z, this.directional ? 0.0 : 1.0);
            gl.uniform3f(sd.u_lightColor[lightnumber], this.color.r, this.color.g, this.color.b);
            gl.uniform1f(sd.u_lightIntensity[lightnumber], this.intensity);
        }
    }
}
// A scene!
export class Scene {
    constructor(container) {
        this.container = container;
        // background clear color
        this.background = new Color(0.1, 0.1, 0.3);
        // an ambient color. Default to the defaultColor
        this.ambient = new Color(0.1, 0.1, 0.1);
        // light attenuation
        this.attenuation = { c0: 1, c1: 0.1, c2: 0.01 };
        // temp space for the normal matrix
        this.normalMatrix = new Float32Array(9);
        this.world = new Thing();
        this.canvas = document.createElement('canvas');
        let glContext = this.canvas.getContext("webgl");
        if (!glContext) {
            throw "Browser does not support WebGL";
        }
        this.gl = glContext;
        this.shaderData = this.initGL();
        this.container.style.overflow = 'hidden';
        this.container.appendChild(this.canvas);
        var rect = container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
    }
    /* Creates a program for use in the WebGL context gl, and returns the
    * identifier for that program.  If an error occurs while compiling or
    * linking the program, an exception of type String is thrown.  The error
    * string contains the compilation or linking error.  If no error occurs,
    * the program identifier is the return value of the function.
    *    The second and third parameters are the id attributes for <script>
    * elementst that contain the source code for the vertex and fragment
    * shaders.
    */
    createProgram() {
        let gl = this.gl;
        var vsh = gl.createShader(gl.VERTEX_SHADER);
        if (!vsh) {
            throw "Couldn't create vertex shader";
        }
        gl.shaderSource(vsh, vertexShaderSource);
        gl.compileShader(vsh);
        if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
            throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
        }
        var fsh = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fsh) {
            throw "Couldn't create fragment shader";
        }
        gl.shaderSource(fsh, fragmentShaderSource);
        gl.compileShader(fsh);
        if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
            throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
        }
        var prog = gl.createProgram();
        if (!prog) {
            throw "Couldn't create shader program";
        }
        gl.attachShader(prog, vsh);
        gl.attachShader(prog, fsh);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            throw "Link error in program:  " + gl.getProgramInfoLog(prog);
        }
        return prog;
    }
    // TODO:  put your WebGL context initialization here
    initGL() {
        let gl = this.gl;
        var prog = this.createProgram();
        gl.useProgram(prog);
        let shaderData = {
            a_coords_loc: gl.getAttribLocation(prog, "a_coords"),
            a_normal_loc: gl.getAttribLocation(prog, "a_normal"),
            a_texCoords_loc: gl.getAttribLocation(prog, "a_texCoords"),
            u_modelview: gl.getUniformLocation(prog, "modelview"),
            u_projection: gl.getUniformLocation(prog, "projection"),
            u_normalMatrix: gl.getUniformLocation(prog, "normalMatrix"),
            u_ambientLight: gl.getUniformLocation(prog, "ambientLightColor"),
            u_lightAttC0: gl.getUniformLocation(prog, "lightAttC0"),
            u_lightAttC1: gl.getUniformLocation(prog, "lightAttC1"),
            u_lightAttC2: gl.getUniformLocation(prog, "lightAttC2"),
            u_lightCount: gl.getUniformLocation(prog, "lightCount"),
            u_lightPosition: [],
            u_lightColor: [],
            u_lightIntensity: [],
            u_useTexture: gl.getUniformLocation(prog, "useTexture"),
            u_texture: gl.getUniformLocation(prog, "texture"),
            u_diffuseColor: gl.getUniformLocation(prog, "diffuseColor"),
            u_ambientK: gl.getUniformLocation(prog, "ambientK"),
            u_diffuseK: gl.getUniformLocation(prog, "diffuseK"),
            u_specularK: gl.getUniformLocation(prog, "specularK"),
            u_specularExponent: gl.getUniformLocation(prog, "specularExponent"),
        };
        for (let i = 0; i < maxLights; i++) {
            shaderData.u_lightPosition.push(gl.getUniformLocation(prog, "lightPosition[" + i + "]"));
            shaderData.u_lightColor.push(gl.getUniformLocation(prog, "lightColor[" + i + "]"));
            shaderData.u_lightIntensity.push(gl.getUniformLocation(prog, "lightIntensity[" + i + "]"));
        }
        gl.enable(gl.DEPTH_TEST);
        return shaderData;
    }
    ///
    render() {
        let gl = this.gl;
        let sd = this.shaderData;
        gl.clearColor(this.background.r, this.background.g, this.background.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform3f(sd.u_ambientLight, this.ambient.r, this.ambient.g, this.ambient.b);
        gl.uniform1f(sd.u_lightAttC0, this.attenuation.c0);
        gl.uniform1f(sd.u_lightAttC1, this.attenuation.c1);
        gl.uniform1f(sd.u_lightAttC2, this.attenuation.c2);
        var tempCamera = null;
        var lights;
        // a function to traverse the graph, updating the matrices
        var updateMatricies = (obj) => {
            obj.computeTransforms();
            if (obj.parent) {
                obj.worldTransform = obj.parent.worldTransform.multiply(obj.transform);
            }
            else {
                obj.worldTransform = obj.transform;
            }
            if (obj instanceof Light) {
                lights.push(obj);
            }
            if (obj instanceof Camera) {
                tempCamera = obj;
            }
        };
        lights = [];
        // update the matrices
        this.world.traverse(updateMatricies);
        // WARNING:  HACK I needed here
        // Typescript does not notice that traverse() is calling updateMatricies and that (therefore) tempCamera might get
        // set.  So it narrows the type of tempCamera to "null", which raises errors when we try to use it
        // So, a little type hackery (might be a better way, I'm not sure) shuts up the errors.  We asset
        //  the type of tempCamera back out, and then reassign it to a more narrow camera, since we know it's valid
        if (tempCamera === null) {
            return;
        }
        let camera = tempCamera;
        camera.aspect = this.width / this.height;
        camera.setupRender(gl, sd);
        camera.worldInverseTransform = camera.inverseTransform;
        var cp = camera.parent;
        while (cp) {
            camera.worldInverseTransform =
                camera.worldInverseTransform.multiply(cp.inverseTransform);
            cp = cp.parent;
        }
        let numLights = Math.min(maxLights, lights.length);
        gl.uniform1i(sd.u_lightCount, numLights);
        for (let i = 0; i < numLights; i++) {
            var m = camera.worldInverseTransform.multiply(lights[i].worldTransform);
            let p = m.getPosition();
            lights[i].setup(gl, sd, i, p);
        }
        // set transform of each object to camera.wIT * obj.iT
        var renderThings = (obj) => {
            if (obj instanceof Drawable) {
                var m = camera.worldInverseTransform.multiply(obj.worldTransform);
                gl.uniformMatrix4fv(sd.u_modelview, false, m.elements);
                m.normalMatrix(this.normalMatrix);
                gl.uniformMatrix3fv(sd.u_normalMatrix, false, this.normalMatrix);
                obj.render(gl, sd);
            }
        };
        // "render" the div's
        this.world.traverse(renderThings);
    }
}
//# sourceMappingURL=SG.js.map