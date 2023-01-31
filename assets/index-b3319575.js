(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))d(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const f of a.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&d(f)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerpolicy&&(a.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?a.credentials="include":n.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function d(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();const O=`// #version 100
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

	gl_FragColor = vec4(buf,tt/32.0, 1.0);
	if (tt==63.0)
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

}
`;let l=[],g=.2,h=[0,0],F=[0,0],p=[0,0],y=0;const L=document.querySelector("#sliders");function A(e){let r=[...e];return r[0]-=l[0]/2,r[1]-=l[1]/2,r[0]/=l[0],r[1]/=l[1],r[0]/=g,r[1]/=g,r}const B=e=>e,q=(e,r,t)=>{const d=(f,E,v)=>{const m=f.createShader(E);if(f.shaderSource(m,v),f.compileShader(m),!f.getShaderParameter(m,f.COMPILE_STATUS)){const x=f.getShaderInfoLog(m);throw f.deleteShader(m),new Error("Shader compile error: "+x)}return m},n=e.createProgram();if(e.attachShader(n,d(e,e.VERTEX_SHADER,r)),e.attachShader(n,d(e,e.FRAGMENT_SHADER,t)),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){const f=e.getProgramInfoLog(n);throw e.deleteProgram(n),new Error("Program link error: "+f)}return n},H=(e,r)=>{const t=document.querySelector("#stats");if(t)for(const d of t.children)d.dataset.name===e&&(d.textContent=r.toString())},N=e=>{const r=window.devicePixelRatio,t=e.getContext("webgl2",{powerPreference:"high-performance"});if(!t)throw new Error("WebGL2 not supported");const d=()=>{e.width=window.innerWidth*r,e.height=window.innerHeight*r,l[0]=e.width,l[1]=e.height};d(),window.addEventListener("resize",d);const n=q(t,B`
        attribute vec3 position;
			void main() {
				gl_Position = vec4( position, 1.0 );
			}`,O),a=t.getAttribLocation(n,"position"),f=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,f);const E=t.createVertexArray();t.bindVertexArray(E),t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0),t.useProgram(n),t.clearColor(0,0,.5,1),t.clear(t.COLOR_BUFFER_BIT),t.uniform1f(t.getUniformLocation(n,"zoom"),g);const v=[0,0];t.uniform1f(t.getUniformLocation(n,"is_set"),0);const m=(o,s)=>{const u=()=>{s(o.value)};o.addEventListener("input",u)},P=()=>{t.uniform1f(t.getUniformLocation(n,"is_set"),1),t.uniform2f(t.getUniformLocation(n,"set"),v[0],v[1])};m(L.children[0],o=>{v[0]=parseFloat(o),P()}),m(L.children[1],o=>{v[1]=parseFloat(o),P()});const x=()=>{t.uniform2f(t.getUniformLocation(n,"move"),h[0],h[1])},_=(o,s,u)=>{const c=A([s,u]);o>0?g/=1+o/250:g*=1+-o/250;const b=A([s,u]);h[0]+=c[0]-b[0],h[1]-=c[1]-b[1],t.uniform1f(t.getUniformLocation(n,"zoom"),g),x(),H("zoom",g)},S=(o,s,u={})=>{window.addEventListener(o,c=>{s({preventDefault(){c.preventDefault()},clientX:c.clientX*r,clientY:c.clientY*r,deltaY:c.deltaY})},u)};S("wheel",o=>{const{deltaY:s,clientX:u,clientY:c}=o;_(s,u,c),o.preventDefault()},{passive:!1}),window.addEventListener("scroll",o=>{o.preventDefault(),_(window.scrollY,e.width/2,e.height/2)},{passive:!1});const i=[],I=o=>{i.length>1||(y=1,F=[o.clientX,o.clientY],p=[0,0],p[0]+=l[0]/2,p[1]+=l[1]/2)},R=o=>{y&&(p=A(p),h[0]+=p[0],h[1]-=p[1],y=0,x())};S("pointerdown",o=>{if(i.length>1){R();return}I(o),o.preventDefault()}),S("pointermove",o=>{if(i.length>1||!y)return;p=[F[0]-o.clientX,F[1]-o.clientY],p[0]+=l[0]/2,p[1]+=l[1]/2;let s=A(p);t.uniform2f(t.getUniformLocation(n,"move"),h[0]+s[0],h[1]-s[1])}),S("pointerup",o=>{if(i.length===0){y&&R();return}});const C=()=>{t.viewport(0,0,t.canvas.width,t.canvas.height),t.uniform2f(t.getUniformLocation(n,"resolution"),l[0],l[1]),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),t.STATIC_DRAW),t.drawArrays(t.TRIANGLES,0,6)},U=()=>{t.uniform2f(t.getUniformLocation(n,"resolution"),e.width,e.height)};U(),window.addEventListener("resize",U);const Y=()=>{C(),requestAnimationFrame(Y)};Y();function D(o){let s=-1;o.onpointerdown=c=>{i.push(c)},o.onpointermove=c=>{const b=i.findIndex(w=>w.pointerId===c.pointerId);if(i[b]=c,i.length===2){const w=Math.hypot(i[0].clientX-i[1].clientX,i[0].clientY-i[1].clientY),T=(i[0].clientX+i[1].clientX)/2,X=(i[0].clientY+i[1].clientY)/2;if(s>0){const z=w-s;_(-z,T*r,X*r)}s=w}};function u(c){const b=i.findIndex(w=>w.pointerId===c.pointerId);i.splice(b,1),i.length<2&&(s=-1)}o.onpointerup=u,o.onpointercancel=u,o.onpointerout=u,o.onpointerleave=u}D(e)},k=document.querySelector("canvas#canvas");N(k);L.addEventListener("pointerdown",e=>{e.stopPropagation()});L.addEventListener("pointermove",e=>{e.stopPropagation()});L.addEventListener("pointerup",e=>{e.stopPropagation()});
