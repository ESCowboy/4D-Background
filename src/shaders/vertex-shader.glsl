    attribute vec4 a_position;
    uniform mat4 u_matrix;
    varying vec4 pos;
    void main() {
        pos = a_position;

        gl_Position = a_position;
    }