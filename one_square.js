
// some globals
var gl;


var delay = 100;
var direction = true;
var iBuffer;
var vBuffer;
var colorBuffer;
var program;
var theta = [0,0,0];
var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var rotating = false;

modelViewMatrix = mat4();

var vertices = [
	vec4(-0.5, -0.5, 0.5, 1.0),
	vec4(-0.5, 0.5, 0.5, 1.0),
	vec4(0.5, 0.5, 0.5, 1.0),
	vec4(0.5, -0.5, 0.5, 1.0),
	vec4(-0.5, -0.5, -0.5, 1.0),
	vec4(-0.5, 0.5, -0.5, 1.0),
	vec4(0.5, 0.5, -0.5, 1.0),
	vec4(0.5, -0.5, -0.5, 1.0)
	];

var vertexColors = [
	[ 0.0, 0.0, 0.0, 1.0 ], // black
	[ 1.0, 0.0, 0.0, 1.0 ], // red
	[ 1.0, 1.0, 0.0, 1.0 ], // yellow
	[ 0.0, 1.0, 0.0, 1.0 ], // green
	[ 0.0, 0.0, 1.0, 1.0 ], // blue
	[ 1.0, 0.0, 1.0, 1.0 ], // magenta
	[ 1.0, 1.0, 1.0, 1.0 ], // white
	[ 0.0, 1.0, 1.0, 1.0 ] // cyan
	];

var gIndices = [
	1,0,3,
	3,2,1,
	2,3,7,
	7,6,2,
	3,0,4,
	4,7,3,
	6,5,1,
	1,2,6,
	4,5,6,
	6,7,4,
	5,4,0,
	0,1,5
];

var faces = new Array(24);

var numVertices = 36;
var points = [];
var colors = [];

var colors = [];

var offset = 0;

var width = 0.0;
var height = 0.0;

var rotatingX = false;
var rotatingY = false;
var rotatingZ= false;

window.onload = function init() {

	// get the canvas handle from the document's DOM
    var canvas = document.getElementById( "gl-canvas" );
	height = canvas.height
	width = canvas.width
	// initialize webgl
    gl = WebGLUtils.setupWebGL(canvas);

	// check for errors
    if ( !gl ) { 
		alert("WebGL isn't available"); 
	}

    // set up a viewing surface to display your image
    gl.viewport(0, 0, canvas.width, canvas.height);

	// clear the display with a background color 
	// specified as R,G,B triplet in 0-1.0 range
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Load shaders -- all work done in init_shaders.js
    program = initShaders(gl, "vertex-shader", "fragment-shader");

	// make this the current shader program
    gl.useProgram(program);

	// Get a handle to theta  - this is a uniform variable defined 
	// by the user in the vertex shader, the second parameter should match
	// exactly the name of the shader variable
    thetaLoc = gl.getUniformLocation(program, "theta");

	colorLoc = gl.getUniformLocation(program, "vertColor");

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (64*30000), gl.STATIC_DRAW);
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (96*30000), gl.STATIC_DRAW)
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
	gl.enableVertexAttribArray(vColor)

	iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, (96*30000), gl.STATIC_DRAW);

	colorCube();

    render();
};

function colorCube() {
	quad(1,0,3,2);
	quad(2,3,7,6);
	quad(3,0,4,7);
	quad(6,5,1,2);
	quad(4,5,6,7);
	quad(5,4,0,1);
}

function quad(a,b,c,d) {
	var indices = [a,b,c,a,c,d];

	for(let i = 0; i < indices.length; i++){
		points.push(vertices[indices[i]]);
		colors.push(vertexColors[indices[i]]);
	}
} 

function rotateX(theta){
	rotation = mat4(
		1,0,0,0,
		0,Math.cos(theta),-Math.sin(theta),0,
		0,Math.sin(theta),Math.cos(theta),0,
		0,0,0,1, 
	)
	return rotation
}

function rotateY(theta){
	rotation = mat4(
		Math.cos(theta), 0, Math.sin(theta), 0,
		0,1,0,0,
		-Math.sin(theta),0, Math.cos(theta), 0,
		0,0,0,1
	)
	return rotation
}

function rotateZ(theta){
	rotation = math4(
		Math.cos(theta), -Math.sin(theta),0,0,
		Math.sin(theta), Math.cos(theta),0,0,
		0,0,1,0,
		0,0,0,1
	)
	return rotation
}

function render() {
	// this is render loop

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT);

	if(rotating){
		theta[axis] += 2;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(gIndices), gl.STATIC_DRAW)

	gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0)

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}

function setRotate(input){
	switch (input) {
		case 'X':
			rotating = true;
			console.log("rotating x")
			axis = xAxis;
			break;

		case 'Y':
			rotating = true;
			console.log("rotating y")
			axis = yAxis;
			break;

		case 'Z':
			rotating = true;
			console.log("rotating z")
			axis = zAxis;
			break;

		default:
			console.log("not rotating")
			break;

	}
}