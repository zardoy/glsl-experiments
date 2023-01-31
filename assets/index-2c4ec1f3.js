(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))d(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&d(a)}).observe(document,{childList:!0,subtree:!0});function e(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerpolicy&&(s.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?s.credentials="include":t.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function d(t){if(t.ep)return;t.ep=!0;const s=e(t);fetch(t.href,s)}})();const D=`// #version 100
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
void main(void) {
	vec2 orig = gl_FragCoord.xy-resolution.xy/2.0;
	orig.xy /= resolution.xy;
	orig.xy /= zoom;
	orig.xy += move;
	orig.x *= resolution.x / resolution.y;
	vec2 buf = orig;
	float tt;
	for (float iter = 0.0;iter != 128.0;iter++) {
		float xtemp = buf.x * buf.x - buf.y * buf.y + orig.x;
		buf.y = 2.0 * buf.x * buf.y + orig.y;
		buf.x = xtemp;
		tt = iter;
		if (length(buf)>4.0)
			break;
	}
	gl_FragColor = vec4(sin(tt),log2(buf), 1.0);
	if (tt==127.0)
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

}
`;let u=[],g=.2,h=[0,0],A=[0,0],l=[0,0],b=0;function x(n){let r=[...n];return r[0]-=u[0]/2,r[1]-=u[1]/2,r[0]/=u[0],r[1]/=u[1],r[0]/=g,r[1]/=g,r}const T=n=>n,X=(n,r,e)=>{const d=(a,L,S)=>{const p=a.createShader(L);if(a.shaderSource(p,S),a.compileShader(p),!a.getShaderParameter(p,a.COMPILE_STATUS)){const i=a.getShaderInfoLog(p);throw a.deleteShader(p),new Error("Shader compile error: "+i)}return p},t=n.createProgram();if(n.attachShader(t,d(n,n.VERTEX_SHADER,r)),n.attachShader(t,d(n,n.FRAGMENT_SHADER,e)),n.linkProgram(t),!n.getProgramParameter(t,n.LINK_STATUS)){const a=n.getProgramInfoLog(t);throw n.deleteProgram(t),new Error("Program link error: "+a)}return t},z=(n,r)=>{const e=document.querySelector("#stats");if(e)for(const d of e.children)d.dataset.name===n&&(d.textContent=r.toString())},O=n=>{const r=window.devicePixelRatio,e=n.getContext("webgl2",{powerPreference:"high-performance"});if(!e)throw new Error("WebGL2 not supported");const d=()=>{n.width=window.innerWidth*r,n.height=window.innerHeight*r,u[0]=n.width,u[1]=n.height};d(),window.addEventListener("resize",d);const t=X(e,T`
        attribute vec3 position;
			void main() {
				gl_Position = vec4( position, 1.0 );
			}`,D),s=e.getAttribLocation(t,"position"),a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a);const L=e.createVertexArray();e.bindVertexArray(L),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),e.useProgram(t),e.clearColor(0,0,.5,1),e.clear(e.COLOR_BUFFER_BIT),e.uniform1f(e.getUniformLocation(t,"zoom"),g);const S=()=>{e.uniform2f(e.getUniformLocation(t,"move"),h[0],h[1])},p=(o,f,m)=>{const c=x([f,m]);o>0?g/=1+o/250:g*=1+-o/250;const v=x([f,m]);h[0]+=c[0]-v[0],h[1]-=c[1]-v[1],e.uniform1f(e.getUniformLocation(t,"zoom"),g),S(),z("zoom",g)},y=(o,f,m={})=>{window.addEventListener(o,c=>{f({preventDefault(){c.preventDefault()},clientX:c.clientX*r,clientY:c.clientY*r,deltaY:c.deltaY})},m)};y("wheel",o=>{const{deltaY:f,clientX:m,clientY:c}=o;p(f,m,c),o.preventDefault()},{passive:!1});const i=[],_=o=>{i.length>1||(console.log("down"),b=1,A=[o.clientX,o.clientY],l=[0,0],l[0]+=u[0]/2,l[1]+=u[1]/2)},P=o=>{b&&(console.log("up",l,b),l=x(l),h[0]+=l[0],h[1]-=l[1],b=0,S())};y("pointerdown",o=>{if(i.length>1){P();return}_(o),o.preventDefault()}),y("pointermove",o=>{if(i.length>1||!b)return;l=[A[0]-o.clientX,A[1]-o.clientY],l[0]+=u[0]/2,l[1]+=u[1]/2;let f=x(l);e.uniform2f(e.getUniformLocation(t,"move"),h[0]+f[0],h[1]-f[1])}),y("pointerup",o=>{if(i.length===0){b&&P();return}});const F=()=>{e.viewport(0,0,e.canvas.width,e.canvas.height),e.uniform2f(e.getUniformLocation(t,"resolution"),u[0],u[1]),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),e.STATIC_DRAW),e.drawArrays(e.TRIANGLES,0,6)},E=()=>{e.uniform2f(e.getUniformLocation(t,"resolution"),n.width,n.height)};E(),window.addEventListener("resize",E);const R=()=>{F(),requestAnimationFrame(R)};R();function Y(o){let f=-1;o.onpointerdown=c=>{i.push(c)},o.onpointermove=c=>{const v=i.findIndex(w=>w.pointerId===c.pointerId);if(i[v]=c,i.length===2){const w=Math.hypot(i[0].clientX-i[1].clientX,i[0].clientY-i[1].clientY),I=(i[0].clientX+i[1].clientX)/2,U=(i[0].clientY+i[1].clientY)/2;if(f>0){const C=w-f;p(-C,I*r,U*r)}f=w}};function m(c){const v=i.findIndex(w=>w.pointerId===c.pointerId);i.splice(v,1),i.length<2&&(f=-1)}o.onpointerup=m,o.onpointercancel=m,o.onpointerout=m,o.onpointerleave=m}Y(n)},B=document.querySelector("canvas#canvas");O(B);
