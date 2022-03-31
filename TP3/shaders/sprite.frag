#ifdef GL_ES
precision highp float;
#endif

uniform float M;
uniform float N;
uniform float m;
uniform float n;
uniform sampler2D texture;

varying vec2 vTextureCoord;

void main() {
    vec2 coordinates = vec2(vTextureCoord.s/M + m/M, vTextureCoord.t/N + n/N);
    gl_FragColor = texture2D(texture, coordinates);
}