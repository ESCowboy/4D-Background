import w from './utils/world-scope.js';

const canvas = document.querySelector("#canvas");
const gl = canvas.getContext("webgl");
w.canvas = canvas;
w.gl = gl;

const UNIFORM_TYPES = {
    1: gl.uniform1f.bind(gl),
    2: gl.uniform2f.bind(gl),
    3: gl.uniform3f.bind(gl),
    4: gl.uniform4f.bind(gl)
}

class RayMarching {
    constructor() {
        this.uniforms = {};
        this.attributes = {};
        this.vs = null;
        this.fs = null;
        this.originalFS = null;
        this.program = null;
        this.positionBuffer = null;
    }

    init(scene) {
        this.setupFSShader(scene);
        this.attachEventListeners();
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        this.program = webglUtils.createProgramFromSources(gl, [this.vs, this.fs]);
        this.setupAttributes();
        this.setupBuffer();
        this.matrixLocation = gl.getUniformLocation(this.program, "u_matrix");
    }

    async loadShaders() {
        this.vs = await this.loadShader("vertex-shader.glsl");
        this.fs = await this.loadShader("fragment-shader.glsl");
        this.originalFS = this.fs;
    }

    setupFSShader(scene){
        this.fs = this.originalFS.replace("//input", scene.shader);
    }

    loadShader(url) {
        return new Promise(async resolve => {
            const res = await fetch(`./src/shaders/${url}`);
            const shader = await res.text();
            resolve(shader)
        })
    }

    setUniforms(uniforms) {
        uniforms.forEach(({name, value}) => {
            this.uniforms[name] = {
                location: gl.getUniformLocation(this.program, name),
                value,
                update: function () {
                    typeof(this.value) == "object"? 
                    UNIFORM_TYPES[this.value.length](this.location, ...this.value) : 
                    gl.uniform1f( this.location, this.value);
                },
            }
        });
    }

    updateUniform(name, value){
        this.uniforms[name].value = value || 0;
    }

    setupBuffer() {
        this.positionBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        // fill it with a 2 triangles that cover clipspace
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          -1, -1,  // first triangle
           1, -1,
          -1,  1,
          -1,  1,  // second triangle
           1, -1,
           1,  1,
        ]), gl.STATIC_DRAW);
    }

    setupAttributes() {
        this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    }

    attachEventListeners(){
        window.addEventListener('resize', () => {
            webglUtils.resizeCanvasToDisplaySize(gl.canvas);
            this.updateUniform("iResolution", [gl.canvas.width, gl.canvas.height]);
        })
    }

    render(){
        const now = new Date().getTime()*0.001;
        const elapsedTime = Math.min(now - w.then, 0.1);
        w.time += elapsedTime;
        w.then = now;
    
        // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.useProgram(this.program);
        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        gl.vertexAttribPointer(
            this.positionAttributeLocation,
            2,          // 2 components per iteration
            gl.FLOAT,   // the data is 32bit floats
            false,      // don't normalize the data
            0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
            0,          // start at the beginning of the buffer
        );
    
        Object.values(this.uniforms).forEach(u => u.update())
    
        gl.drawArrays(
            gl.TRIANGLES,
            0,     // offset
            6,     // num vertices to process
        );
    }
}

export default RayMarching;