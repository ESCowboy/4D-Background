class Mouse {
    static x = 0;
    static y = 0;
    static scroll = 0;
    static prevMousePos = { x: 0, y: 0 };
    static isMouseDown = false;
    static canvas = null;

    static attachEventListeners() {
        this.canvas = document.querySelector('canvas');
        this.canvas.addEventListener('mousedown', () => this.isMouseDown = true)
        this.canvas.addEventListener('mouseup', () => this.isMouseDown = false)
        this.canvas.addEventListener('mousemove', this.resolveMousePosition.bind(this));
        this.canvas.addEventListener('wheel', this.onScroll.bind(this));
    }

    static resolveMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.prevMousePos = {x: this.x, y: this.y}; 
        this.x = e.clientX - rect.left;
        this.y = rect.height - (e.clientY - rect.top) - 1;
    }

    static onScroll(e) {
        e.preventDefault();
        if (e.deltaY)
            this.scroll += (e.deltaY / Math.abs(e.deltaY)) * 0.1;
    }
}

Mouse.attachEventListeners();

export default Mouse;