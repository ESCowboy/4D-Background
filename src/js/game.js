import RayMarching from './raymarching.js';
import Camera from './entity/camera.js';
import mouse from './utils/mouse.js';
import Shape from './utils/shapes.js';
import w from './utils/world-scope.js';
import Scene from './entity/scene.js';
import GUI from './utils/gui.js';

class Game {
    constructor() {
        this.raymarching = new RayMarching();
        this.camera = new Camera();
        this.scene = new Scene();
        this.init();
    }

    async init() {
        await this.raymarching.loadShaders();
        new GUI(this);

        this.setupScene();
        this.raymarching.init(this.scene);

        this.setupUniforms();
        this.render();
    }

    setupScene() {
        for(let k = 0; k < 20; k++){
            this.scene.add(Shape.sphere(Shape.randomVec4(2, 10, 10), .5, "smin"))
        }
    }

    setupUniforms() {
        const uniforms = [
            { name: "iResolution", value: [w.gl.canvas.width, w.gl.canvas.height] },
            { name: "iMouse", value: [mouse.x, mouse.y] },
            { name: "scrollW", value: mouse.scroll },
            { name: "wValue", value: 0 },
            { name: "cameraPosition", value: this.camera.shaderPosition },
            { name: "cameraTarget", value: this.camera.target },
            { name: "iTime", value: 0 }
        ];

        this.raymarching.setUniforms(uniforms);
    }

    getMousePosition() {
        const cof = 100;
        return [
            (mouse.x-window.innerWidth/2) / cof,
            (mouse.y-window.innerHeight/2) / cof,
        ]
    }

    updateUniforms() {
        this.raymarching.updateUniform("iTime", w.time);
        this.raymarching.updateUniform("cameraPosition", this.camera.shaderPosition);
        this.raymarching.updateUniform("cameraTarget", this.camera.target);
        this.raymarching.updateUniform("scrollW", mouse.scroll);
        this.raymarching.updateUniform("wValue", w.time/20);
        this.raymarching.updateUniform("iMouse", this.getMousePosition());
    }

    render() {
        requestAnimationFrame(this.render.bind(this));
        this.updateUniforms();
        this.raymarching.render();
    }
}

export default Game;