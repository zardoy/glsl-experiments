// #version 100
// precision highp float;

// uniform vec4 u_color;

// void main() {
//     gl_FragColor = u_color;
// }
#version 100
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 resolution;
uniform float zoom;
uniform vec2 move;
void main(void) {
	vec2 orig = gl_FragCoord.xy-resolution.xy/2.0;
	orig.xy /= resolution.xy;
	orig.xy /= zoom;
	orig.xy += move;
	orig.x *= resolution.x / resolution.y;
	vec2 buf = orig;
	float tt;
	for (float iter = 0.0;iter != 256.0;iter++) {
		float xtemp = buf.x * buf.x - buf.y * buf.y + orig.x;
		buf.y = 2.0 * buf.x * buf.y + orig.y;
		buf.x = xtemp;
		tt = iter;
		if (length(buf)>2.0)
			break;
	}
	gl_FragColor = vec4(tt/255.0,0.0, 0.0, 1.0);
	if (tt==255.0)
		gl_FragColor = vec4(0.5, 1.0, 0.5, 1.0);

}
