class GUI {
    constructor(game) {
        this.game = game;
        this.gui = new dat.GUI();
        this.setupUniforms();
        this.addUI();
    }

    setupUniforms(uniforms) {
        this.uniforms = uniforms || {
            cameraTarget: this.game.camera.target,
            color_0: [.4, .0, .6, .0],
            color_1: [.4, .0, .6, .0],
            gradient_line: 0,
            gradient_rotation: 0,
            viewInside: 1,
            tessaractSize: [.1, .1, 9, 1],
            tessaractPosition: [0, 0, 0, 1],
            sphere_color: [.0, .0, .0],
            sphere_radius: 0
        }

        this.game.raymarching.setUniforms(Object.keys(this.uniforms).map(name => ({ name, value: this.uniforms[name] })));
        Object.keys(this.uniforms).forEach(name => {
            if (name.includes('color')) this.uniforms[name] = this.uniforms[name].map(v => v * 255);
        })
    }

    addUI() {
        this.addCamera();
        this.addBasicColor();
        this.addViewSwitch();
        this.addTessarract();
        this.addSphere();
        this.addPresets();
        this.addSaveBtn();
    }

    async loadPreset(name) {
        try {
            const data = await fetch(`./src/presets/${name}.json`);
            const preset = await data.json();
            this.parsePreset(preset);
        } catch (err) {}
    }

    parsePreset(data) {
        const preset = { ...data };
        const { camera } = preset;
        preset.cameraTarget = camera.target;
        delete preset.camera;

        this.game.camera.setInitState(camera);

        Object.keys(preset).forEach(name => {
            if (name.includes('color')) preset[name] = preset[name].map(v => v / 255);
        })
        this.setupUniforms(preset);

        this.gui.destroy();
        this.gui = new dat.GUI();
        this.addUI();
    }

    addPresets() {
        const presets = this.gui.addFolder('Presets');
        presets.add({ ['Load preset']: '' }, 'Load preset').onFinishChange(value => {
            this.loadPreset(value);
        })

        presets.open();

        presets.add({['Preset 1']: () => this.loadPreset('preset')}, 'Preset 1');
        presets.add({['Preset 2']: () => this.loadPreset('preset2')}, 'Preset 2');
    }

    addSphere() {
        const sphere = this.gui.addFolder('Sphere');
        sphere.addColor({ Color: this.uniforms.sphere_color }, 'Color').onChange((value) => {
            this.uniforms.sphere_color = value;
            this.game.raymarching.updateUniform('sphere_color', value.map(v => v / 255));
        });

        sphere.add({ Radius: this.uniforms.sphere_radius }, 'Radius', 0, 2).onChange((value) => {
            this.uniforms.sphere_radius = value;
            this.game.raymarching.updateUniform("sphere_radius", value);
        });
    }

    addViewSwitch() {
        const changeBG = () => {
            this.uniforms.viewInside *= -1;
            this.game.raymarching.updateUniform("viewInside", this.uniforms.viewInside)
        };
        this.gui.add({ changeBG }, 'changeBG');
    }

    addTessarract() {
        const tessarract = this.gui.addFolder('Tessarract');

        const size = tessarract.addFolder('Size');
        this.uniforms.tessaractSize.forEach((el, i, arr) => {
            size.add(arr, i, -10, 10).onChange((v) => {
                this.game.raymarching.updateUniform("tessaractSize", arr);
            }).listen();
        });

        const position = tessarract.addFolder('Position');
        this.uniforms.tessaractPosition.forEach((el, i, arr) => {
            position.add(arr, i, -10, 10).onChange((v) => {
                this.game.raymarching.updateUniform("tessaractPosition", arr);
            }).listen();
        });
    }

    addCamera() {
        const camera = this.gui.addFolder('Camera');
        const posFolder = camera.addFolder('Position');
        const { position, target } = this.game.camera;
        posFolder.add(position, 'x', -10, 10).listen();
        posFolder.add(position, 'y', -10, 10).listen();
        posFolder.add(position, 'z', -10, 10).listen();
        posFolder.add(position, 'w', -10, 10).listen();

        const camTarget = camera.addFolder('Target');
        target.forEach((el, i, arr) => {
            camTarget.add(arr, i, -10, 10).onChange((value) => {
                this.game.raymarching.updateUniform("cameraTarget", arr);
            });
        });

        const rotation = camera.addFolder('Rotation');
        [0, 0].forEach((el, i, arr) => {
            rotation.add(arr, i, -3, 3).onChange((value) => {
                this.game.camera.rotate(...arr);
            });
        });
    }

    addBasicColor() {
        const color = this.gui.addFolder('Color');
        ['color_0', 'color_1'].forEach(c => {
            color.addColor(this.uniforms, c).onChange((value) => {
                this.game.raymarching.updateUniform(c, value.map(v => v / 255));
            }).listen();
        })
        color.add(this.uniforms, 'gradient_line', -1, 1).onChange((value) => {
            this.game.raymarching.updateUniform("gradient_line", value);
        }).listen();

        color.add(this.uniforms, 'gradient_rotation', -2, 2).onChange((value) => {
            this.game.raymarching.updateUniform("gradient_rotation", value);
        }).listen();
    }

    addSaveBtn() {
        const saveFolder = this.gui.addFolder("Save");
        const Save = () => {
            const a = document.createElement('a');
            const file = new Blob([JSON.stringify({ ...this.uniforms, camera: this.game.camera })], { type: 'text/plain' });

            a.href = URL.createObjectURL(file);
            a.download = "preset.json";
            a.click();
            URL.revokeObjectURL(a.href);
        };

        saveFolder.add({ Save }, 'Save');
    }
}

export default GUI;