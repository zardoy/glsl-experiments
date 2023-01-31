(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))d(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const f of s.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&d(f)}).observe(document,{childList:!0,subtree:!0});function e(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerpolicy&&(s.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?s.credentials="include":t.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function d(t){if(t.ep)return;t.ep=!0;const s=e(t);fetch(t.href,s)}})();const T=`// #version 100
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
`;let u=[],b=.2,v=[0,0],E=[0,0],l=[0,0],w=0;function L(n){let r=[...n];return r[0]-=u[0]/2,r[1]-=u[1]/2,r[0]/=u[0],r[1]/=u[1],r[0]/=b,r[1]/=b,r}const X=n=>n,z=(n,r,e)=>{const d=(f,A,x)=>{const h=f.createShader(A);if(f.shaderSource(h,x),f.compileShader(h),!f.getShaderParameter(h,f.COMPILE_STATUS)){const i=f.getShaderInfoLog(h);throw f.deleteShader(h),new Error("Shader compile error: "+i)}return h},t=n.createProgram();if(n.attachShader(t,d(n,n.VERTEX_SHADER,r)),n.attachShader(t,d(n,n.FRAGMENT_SHADER,e)),n.linkProgram(t),!n.getProgramParameter(t,n.LINK_STATUS)){const f=n.getProgramInfoLog(t);throw n.deleteProgram(t),new Error("Program link error: "+f)}return t},O=(n,r)=>{const e=document.querySelector("#stats");if(e)for(const d of e.children)d.dataset.name===n&&(d.textContent=r.toString())},D=n=>{const r=window.devicePixelRatio,e=n.getContext("webgl2",{powerPreference:"high-performance"});if(!e)throw new Error("WebGL2 not supported");const d=()=>{n.width=window.innerWidth*r,n.height=window.innerHeight*r,u[0]=n.width,u[1]=n.height};d(),window.addEventListener("resize",d);const t=z(e,X`
        attribute vec3 position;
			void main() {
				gl_Position = vec4( position, 1.0 );
			}`,T),s=e.getAttribLocation(t,"position"),f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f);const A=e.createVertexArray();e.bindVertexArray(A),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),e.useProgram(t),e.clearColor(0,0,.5,1),e.clear(e.COLOR_BUFFER_BIT),e.uniform1f(e.getUniformLocation(t,"zoom"),b);const x=()=>{e.uniform2f(e.getUniformLocation(t,"move"),v[0],v[1])},h=(o,a,m)=>{const c=L([a,m]);o>0?b/=1+o/250:b*=1+-o/250;const p=L([a,m]);v[0]+=c[0]-p[0],v[1]-=c[1]-p[1],e.uniform1f(e.getUniformLocation(t,"zoom"),b),x(),O("zoom",b)},y=(o,a,m={})=>{window.addEventListener(o,c=>{const p=Object.create(null);for(const[g,S]of Object.entries(c))typeof S=="function"&&(p[g]=S.bind(c)),p[g]=S;a({...p,clientX:c.clientX*r,clientY:c.clientY*r})},m)};y("wheel",o=>{const{deltaY:a,clientX:m,clientY:c}=o;h(a,m,c),o.preventDefault()},{passive:!1});const i=[],F=o=>{i.length>1||(console.log("down"),w=1,E=[o.clientX,o.clientY],l=[0,0],l[0]+=u[0]/2,l[1]+=u[1]/2)},P=o=>{w&&(console.log("up",l,w),l=L(l),v[0]+=l[0],v[1]-=l[1],w=0,x())};y("pointerdown",o=>{if(i.length>1){P();return}F(o),o.preventDefault()}),y("pointermove",o=>{if(i.length>1||!w)return;l=[E[0]-o.clientX,E[1]-o.clientY],l[0]+=u[0]/2,l[1]+=u[1]/2;let a=L(l);e.uniform2f(e.getUniformLocation(t,"move"),v[0]+a[0],v[1]-a[1])}),y("pointerup",o=>{if(i.length===0){w&&P();return}});const I=()=>{e.viewport(0,0,e.canvas.width,e.canvas.height),e.uniform2f(e.getUniformLocation(t,"resolution"),u[0],u[1]),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),e.STATIC_DRAW),e.drawArrays(e.TRIANGLES,0,6)},R=()=>{e.uniform2f(e.getUniformLocation(t,"resolution"),n.width,n.height)};R(),window.addEventListener("resize",R);const _=()=>{I(),requestAnimationFrame(_)};_();function U(o){let a=-1;o.onpointerdown=c=>{i.push(c)},o.onpointermove=c=>{const p=i.findIndex(g=>g.pointerId===c.pointerId);if(i[p]=c,i.length===2){const g=Math.hypot(i[0].clientX-i[1].clientX,i[0].clientY-i[1].clientY),S=(i[0].clientX+i[1].clientX)/2,Y=(i[0].clientY+i[1].clientY)/2;if(a>0){const C=g-a;h(-C,S*r,Y*r)}a=g}};function m(c){const p=i.findIndex(g=>g.pointerId===c.pointerId);i.splice(p,1),i.length<2&&(a=-1)}o.onpointerup=m,o.onpointercancel=m,o.onpointerout=m,o.onpointerleave=m}U(n)},B=document.querySelector("canvas#canvas");D(B);
