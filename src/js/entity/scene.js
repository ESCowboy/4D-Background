class Scene {
    constructor(){
        this.children = [];
        this.shader = "//input";
    }

    add(...meshes) {
        this.children = [...this.children, ...meshes];
        this.updateShader();
    }

    updateShader() {
        this.shader = "//input";
        this.children.forEach(child => this.shader = this.shader.replace("//input", child.shader))
    }
}

export default Scene;