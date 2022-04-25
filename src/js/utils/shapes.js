class Shape {
    static vec4(x, y, z, w) {
        if (y == undefined) return { x, y: x, z: x, w: x }
        if (z == undefined) return { x, y, z: y, w: y }
        if (w == undefined) return { x, y, z, w: z }
        return { x, y, z, w }
    }

    static randomVec4(x = 1, y = 1, z = 1, w = 1) {
        const randX = this.randomValue(x);
        const randY = this.randomValue(y);
        const randZ = this.randomValue(z);
        return this.vec4(randX, randY, randZ, w)
    }

    static randomValue(limit = 1) {
        return Math.random() * limit - limit / 2;
    }

    static parsePosition(position) {
        for (let prop in position) {
            position[prop] = position[prop].toFixed(2)
        }
        return position;
    }

    static sphere(position, radius, modifier) {
        let shader = '';
        const { x, y, z, w } = this.parsePosition(position);
        const shape = `sdSphere(pos-vec4(${x}, (mod(${y}+wValue*${Math.random()*3+1}, 2.0)-1.0)*8.0, ${z}, ${w}), ${radius.toFixed(2)})`;
        switch (modifier) {
            case "smin": shader = `res = vec2(smin( res.x, ${shape}, 0.5), 1.0);`; break;
            default: shader = `res = opU( res, vec2( ${shape}, 1.0 ) );`; break;
        }
        shader += `//input`;

        return {
            type: "sphere",
            position,
            shader
        }
    }

    static tessaract(position, size, modifier, isStatic) {
        const { x, y, z, w } = position;
        const { x: sx, y: sy, z: sz, w: sw } = size;

        let pos = `pos-vec4( ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}, ${w.toFixed(2)}+wValue/10.)`;
        if (!isStatic) pos = `Rot4D(${pos}, vec3(scrollW , scrollW, -scrollW))`;

        let shape = `sdTesseract(${pos}, vec4(${sx.toFixed(2)}, ${sy.toFixed(2)}, ${sz.toFixed(2)}, ${sw.toFixed(2)}) )`;

        let shader;

        switch (modifier) {
            case "smin": shader = `res = vec2(smin( res.x, ${shape}, 0.5), 1.0);`; break;
            default: shader = `res = opU( res, vec2( ${shape}, .0 ) );`; break;
        }

        shader += `//input`;

        return {
            type: "tessaract",
            position,
            size,
            shader
        }
    }

    static plane(position, modifier, isStatic) {
        const { x, y, z, w } = position;

        let pos = `pos-vec4( ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}, ${w.toFixed(2)}+wValue/10.)`;
        if (!isStatic) pos = `Rot4D(${pos}, vec3(scrollW , scrollW, -scrollW))`;

        let shape = `sdPlane(${pos})`;

        let shader;

        switch (modifier) {
            case "smin": shader = `res = vec2(smin( res.x, ${shape}, 0.8), 1.0);`; break;
            default: shader = `res = opU( res, vec2( ${shape}, .0 ) );`; break;
        }

        shader += `//input`;

        return {
            type: "plane",
            position,
            shader
        }
    }
}

export default Shape;