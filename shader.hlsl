// #version 100
// precision highp float;

// uniform vec4 u_color;

// void main() {
//     gl_FragColor = u_color;
// }
#version 100
//#ifdef GL_ES
precision mediump float;
//#endif
uniform vec2 resolution;
uniform float zoom;
uniform vec2 move;
uniform vec2 set;
uniform bool is_set;
void main(void) {
	vec2 orig = gl_FragCoord.xy-resolution.xy/2.0;
	orig.xy /= resolution.xy;
	orig.xy /= zoom;
	orig.xy += move;
	orig.x *= resolution.x / resolution.y;
	vec2 buf = orig;
	//set = orig;
	// if (set)
	// 	orig = set
	float tt;
	for (float iter = 0.0;iter != 64.0;iter++) {
		if (!is_set) {
			float xtemp = buf.x * buf.x - buf.y * buf.y ;
			buf.y = 2.0 * buf.x * buf.y + orig.y;
			buf.x = xtemp+ orig.x;
		} else {
			float xtemp = buf.x * buf.x - buf.y * buf.y ;
			buf.y = 2.0 * buf.x * buf.y + set.y;
			buf.x = xtemp+ set.x;
		}
		tt = iter;
		if (length(buf)>4.0)
			break;
	}

	gl_FragColor = vec4(0.0,0.0,tt/64.0, 1.0);
	if (tt==63.0)
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

}
