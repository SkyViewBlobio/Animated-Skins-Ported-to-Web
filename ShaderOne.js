//ShaderOne class.
document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("shaderCanvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    var vertexShaderSource =
        "attribute vec4 my_vertex_position;" +
        "void main(void) {" +
        "  gl_Position = my_vertex_position;" +
        "}";


    var fragmentShaderSource = `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    uniform float redValue;
    uniform float greenValue;
    uniform float blueValue;
    uniform float distance;
    uniform float lineIntensity;
    uniform float whiteStep;

    void main(void) {
    vec2 p = (gl_FragCoord.xy - resolution / 2.0) / min(resolution.x, resolution.y);
    p.y *= resolution.y / resolution.x;

    float dist = length(p);
    float radius = 1.0 + distance;

    if (dist > radius) {
        discard;
    }

    float edge = 0.02;
    float alpha = 1.0 - smoothstep(radius - edge, radius + edge, dist);

    float u = abs(sin((atan(p.y, p.x) * lineIntensity + dist * distance) * 2.5 - time) * 0.1);

    float t = whiteStep / abs(u + .4 + sin(time) / 3.0 - dist);

    vec3 color = vec3(redValue, greenValue, blueValue);

      gl_FragColor = vec4(color * t, alpha);

     }
`;

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create positions for a circle
    var numSegments = 100; // Adjust the number of segments for a smoother circle
    var positions = new Float32Array((numSegments + 2) * 2); // +2 for center and repeating the first vertex

    positions[0] = 0;
    positions[1] = 0;

    for (var i = 0; i <= numSegments; i++) {
        var theta = (i / numSegments) * 2 * Math.PI;
        var index = (i + 1) * 2; // Start from index 2, as 0 and 1 are reserved for the center
        positions[index] = Math.cos(theta);
        positions[index + 1] = Math.sin(theta);
    }

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    var positionAttributeLocation = gl.getAttribLocation(program, "my_vertex_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    var timeLocation = gl.getUniformLocation(program, "time");
    var resolutionLocation = gl.getUniformLocation(program, "resolution");

    // Additional uniform locations for color sliders
    var redLocation = gl.getUniformLocation(program, "redValue");
    var greenLocation = gl.getUniformLocation(program, "greenValue");
    var blueLocation = gl.getUniformLocation(program, "blueValue");

    // Additional uniform locations for the white step slider
    var whiteStepSlider = document.getElementById("whiteStepSlider");
    var whiteStepLocation = gl.getUniformLocation(program, "whiteStep");

    var lineIntensitySlider = document.getElementById("lineIntensitySlider");
    var lineIntensityLocation = gl.getUniformLocation(program, "lineIntensity");

    // Additional uniform locations for the distance slider
    var distanceSlider = document.getElementById("distanceSlider");
    var distanceLocation = gl.getUniformLocation(program, "distance");

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    function draw() {
        gl.uniform1f(timeLocation, performance.now() / 1000.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 2); // +2 for center and repeating the first vertex
        requestAnimationFrame(draw);
    }

    draw();

    var redSlider = document.getElementById("redSlider");
    var greenSlider = document.getElementById("greenSlider");
    var blueSlider = document.getElementById("blueSlider");

    function updateShaderColor() {
        var redValue = parseFloat(redSlider.value) / 255.0;
        var greenValue = parseFloat(greenSlider.value) / 255.0;
        var blueValue = parseFloat(blueSlider.value) / 255.0;

        gl.uniform1f(redLocation, redValue);
        gl.uniform1f(greenLocation, greenValue);
        gl.uniform1f(blueLocation, blueValue);
    }

    redSlider.addEventListener("input", updateShaderColor);
    greenSlider.addEventListener("input", updateShaderColor);
    blueSlider.addEventListener("input", updateShaderColor);

    function updateShaderWhiteStep() {
        var whiteStepValue = parseFloat(whiteStepSlider.value);
        gl.uniform1f(whiteStepLocation, whiteStepValue);
    }

    whiteStepSlider.addEventListener("input", updateShaderWhiteStep);


    function updateShaderLineIntensity() {
    var lineIntensityValue = parseFloat(lineIntensitySlider.value);
    gl.uniform1f(lineIntensityLocation, lineIntensityValue);
    }

    lineIntensitySlider.addEventListener("input", updateShaderLineIntensity);


    function updateShaderDistance() {
    var distanceValue = parseFloat(distanceSlider.value);
    gl.uniform1f(distanceLocation, distanceValue);
    }

    distanceSlider.addEventListener("input", updateShaderDistance);

    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            return null;
        }

        return program;
    }
});