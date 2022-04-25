class Collision {
    static length(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
    }

    static isCollided(p1, p2) {
        return (length(p1, p2) - (p1.w + p2.w)) <= 0;
    }

    static isCollidedCutOff(p, player) {
        return (length(p, player) - (p.w - player.w / 2)) <= 0;
    }

    static checkCollision() {
        let hit;
        cutoff.forEach(p => {
            if (isCollidedCutOff(p, player)) hit = false;
        })

        if (hit == undefined) {
            obstacles.forEach(p => {
                if (isCollided(player, p)) hit = true;
            })
        }

        return !!hit;
    }
}