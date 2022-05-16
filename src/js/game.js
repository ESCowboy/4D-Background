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

        this.setupScene();
        this.raymarching.init(this.scene);
        this.setupUniforms();
        this.addGUI();
        this.render();

    }

    addGUI(){
        new GUI(this);
        this.stats = new Stats();
        this.stats.showPanel( 1 );
        document.body.appendChild( this.stats.dom );
    }

    setupScene() {
        for (let i = 0; i < 10; i++) {
            const position = Shape.randomVec4(1, 10, 10);
            this.scene.add(Shape.sphere(position, .4+Math.random()/2, "smin"))
        }
    }

    setupUniforms() {
        const uniforms = [
            { name: "iResolution", value: [w.gl.canvas.width, w.gl.canvas.height] },
            { name: "iMouse", value: [mouse.x, mouse.y] },
            { name: "wValue", value: 0 },
            { name: "cameraPosition", value: this.camera.shaderPosition },
            { name: "cameraTarget", value: this.camera.target },
        ];

        this.raymarching.setUniforms(uniforms);
    }

    getMousePosition() {
        const cof = 100;
        return [
            (mouse.x - window.innerWidth / 2) / cof,
            (mouse.y - window.innerHeight / 2) / cof,
        ]
    }

    updateUniforms() {
        this.raymarching.updateUniform("cameraPosition", this.camera.shaderPosition);
        this.raymarching.updateUniform("wValue", w.time / 20);
        this.raymarching.updateUniform("iMouse", this.getMousePosition());
    }

    render() {
        requestAnimationFrame(this.render.bind(this));
        this.updateUniforms();
        this.raymarching.render();
        this.stats.update();
    }
}

export default Game;
