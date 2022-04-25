class GUI {
    constructor(game) {
        this.game = game;
        this.gui = new dat.GUI();

        this.init();
    }

    init() {
        this.wValue = 0;

        this.gui.add(this, 'wValue', -10, 10).onChange((value) => {
            this.game.raymarching.updateUniform("wValue", value);
        });

        var cam = this.gui.addFolder('Camera');
        cam.add(this.game.camera.position, 'x', -10, 10).listen();
        cam.add(this.game.camera.position, 'y', -10, 10).listen();
        cam.add(this.game.camera.position, 'z', -10, 10).listen();
        cam.add(this.game.camera.position, 'w', -10, 10).listen();
        // cam.open();

        var camTarget = this.gui.addFolder('Camera Target');
        camTarget.add(this.game.camera.target, 0, -10, 10).listen();
        camTarget.add(this.game.camera.target, 1, -10, 10).listen();
        camTarget.add(this.game.camera.target, 2, -10, 10).listen();
        camTarget.add(this.game.camera.target, 3, -10, 10).listen();
        camTarget.open();
    }
}

export default GUI;