import mouse from '../utils/mouse.js';
import w from '../utils/world-scope.js';

class Camera {
    constructor() {
        // this.position = new Proxy({ x: 0, y: 0, z: 10, w: 1 }, this.updatePosition());
        // z: -4.4
        this.position = new Proxy({ x: 4.28, y: 0, z: -9, w: 1 }, this.updatePosition());
        this.target = [1.6, 0, 1.6, 0.5];
        this.rotation = m4.identity();
        this.shaderPosition = Object.values(this.position);
        this.mousePos = {
            x: 0,
            y: 0
        }
        this.attachEventListener();
    }

    setInitState({position, rotation, target, mousePos}){
        this.target = target;
        this.position = new Proxy(position, this.updatePosition());
        this.rotation = rotation;
        this.updateShaderPosition();
    }

    rotate(x, y) {
        this.rotation = m4.yRotation(x);
        this.rotation = m4.xRotate(this.rotation, y);
        this.updateShaderPosition();
    }

    updateShaderPosition() {
        this.shaderPosition = m4.transformVector(this.rotation, Object.values(this.position));
    }

    rotateByMouse() {
        this.mousePos = this.resolveMousePosition();
        const { x, y } = this.mousePos;
        this.rotate(-x, -y);
    }

    updatePosition() {
        const self = this;
        return {
            set: function (obj, prop, value) {
                obj[prop] = value;
                self.shaderPosition = m4.transformVector(self.rotation, Object.values(self.position));
            }
        }
    }

    resolveMousePosition() {
        const dx = mouse.prevMousePos.x - mouse.x;
        const dy = mouse.prevMousePos.y - mouse.y;
        let { x, y } = this.mousePos;

        x += dx / w.gl.canvas.width * 10;
        y += dy / w.gl.canvas.height * 10;
        if (y <= 0) y = 0;
        if (y >= Math.PI) y = Math.PI;
        return { x, y }
    }

    handleMouseMove() {
        if (mouse.isMouseDown) this.rotateByMouse();
    }

    attachEventListener() {
        mouse.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    }
}

export default Camera;