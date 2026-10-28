/* Живые иллюстрации леса: WebGL-деформация арта (дыхание, хвосты, ветви, ткань), мягкий туман и редкие частицы.
   Без бликов, без искр, без свечения. Если WebGL нет — остаётся обычная картинка. */
(function(){
"use strict";
var reduce=false;try{reduce=(window.__mm||matchMedia)("(prefers-reduced-motion:reduce)").matches}catch(_){}
var items=[],running=false,last=0;
var KINDS={mushroom:1,spider:2,tree:3,boar:4,wolf:5,kitsune:6,kitsune2:7,whisper:10,ring:11,hut:12,tracks:13,altar:14,loop:15,hunter:16,leech:20,pike:21,kikimora:22,vodyanoy:23,vodyanoy2:24,toad:25,drowned:26,serpent:27,serpent2:28,fisherman:30,boat:31,lights:32,bell:33,mermaid:34,fishhut:35,reflection:36,chest:37,frog:38};
function kindOf(src){src=String(src||"");var m=src.match(/\/(kitsune2|kitsune|mushroom|spider|tree|boar|wolf|whisper|ring|hut|tracks|altar|loop|hunter|vodyanoy2|vodyanoy|serpent2|serpent|leech|pike|kikimora|toad|drowned|fisherman|boat|lights|bell|mermaid|fishhut|reflection|chest|frog)\.jpg/);return m?KINDS[m[1]]:0}

var VS="attribute vec2 a;varying vec2 u;void main(){u=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}";
var FS=[
"precision mediump float;varying vec2 u;uniform sampler2D T;uniform float t,k;uniform vec2 S;",
"float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
"float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}",
"float fbm(vec2 p){return .5*n(p)+.3*n(p*2.07+3.1)+.2*n(p*4.1+7.7);}",
"float M(vec2 p,vec2 c,vec2 r){float d=length((p-c)/r);return 1.-smoothstep(0.,1.,d);}",
"void main(){",
" vec2 p=(u-.5)*S+.5;vec2 d=vec2(0.);",
" bool mon=(k<9.)||(k>19.&&k<29.5);",
" if(mon){",
"  float b=.007*sin(t*1.25);if(k>3.5&&k<4.5)b=.011*sin(t*1.1);if(k>22.5&&k<24.5)b=.010*sin(t*.9);if(k>24.5&&k<25.5)b=.009*sin(t*1.5);",
"  vec2 c=vec2(.5,.97);p=(p-c)/(1.+b)+c;",
"  if(k<1.5){d.x+=sin(t*.8)*.003*smoothstep(.55,.2,p.y);d.y+=sin(t*1.1+p.x*9.)*.004*(M(p,vec2(.78,.15),vec2(.14,.12))+M(p,vec2(.16,.26),vec2(.1,.1))+M(p,vec2(.88,.5),vec2(.1,.1)));}",
"  else if(k<2.5){float lm=smoothstep(.2,.4,abs(p.x-.5))*(1.-M(p,vec2(.5,.38),vec2(.25,.3)));d.x+=sin(t*1.2+p.y*7.)*.004*lm;d.y+=sin(t*1.5+p.x*9.)*.0028*lm;d.x+=sin(t*.5+p.y*4.)*.0015;}",
"  else if(k<3.5){float bm=smoothstep(.12,.3,abs(p.x-.5))*smoothstep(.78,.2,p.y)+smoothstep(.4,.0,p.y)*.6;d.x+=sin(t*.9+p.y*5.+p.x*3.)*.007*bm;d.y+=sin(t*.7+p.x*6.)*.003*bm;}",
"  else if(k<4.5){d.x+=sin(t*1.4+p.y*18.)*.0016*smoothstep(.2,.5,abs(p.x-.5))*step(p.y,.88);}",
"  else if(k<5.5){d.x+=sin(t*1.6+p.y*14.)*.0035*(M(p,vec2(.24,.58),vec2(.14,.3))+M(p,vec2(.5,.2),vec2(.2,.14)));}",
"  else if(k<6.5){float tm=M(p,vec2(.78,.62),vec2(.2,.22))+M(p,vec2(.16,.7),vec2(.18,.2));d.x+=sin(t*.9+p.y*5.)*.012*tm;",
"   d.x+=sin(t*1.1+p.y*10.)*.003*M(p,vec2(.5,.32),vec2(.16,.3));d.x+=sin(t*1.3+p.y*25.+p.x*6.)*.0025*smoothstep(.78,1.,p.y);",
"   float tw=pow(max(0.,sin(t*.7)),14.);d.y+=tw*.012*(M(p,vec2(.44,.07),vec2(.06,.07))+M(p,vec2(.58,.08),vec2(.06,.07)));}",
"  else if(k<7.5){vec2 q=p-vec2(.5,.5);float r=length(q)+.001;float tm=smoothstep(.2,.4,r)*smoothstep(.7,.45,r);vec2 pe=vec2(-q.y,q.x)/r;",
"   d+=pe*sin(t*.8+atan(q.y,q.x)*3.)*.014*tm;d.x+=sin(t*1.3+p.y*22.+p.x*5.)*.003*smoothstep(.72,1.,p.y);d.x+=sin(t*1.1+p.y*9.)*.003*M(p,vec2(.5,.28),vec2(.14,.2));}",
"  else if(k<20.5){vec2 mc=vec2(.66,.35);float mm=M(p,mc,vec2(.2,.2));p=mc+(p-mc)/(1.+.012*sin(t*2.2)*mm);d.x+=sin(t*1.1+p.y*5.)*.006*smoothstep(.85,.2,p.y);}",
"  else if(k<21.5){d.x+=sin(t*3.+p.y*14.)*.004*M(p,vec2(.5,.8),vec2(.3,.25));d.y+=sin(t*1.2+p.x*5.)*.006;d.y+=sin(t*1.7)*.006*M(p,vec2(.85,.15),vec2(.12,.1));}",
"  else if(k<22.5){d.x+=sin(t*1.+p.y*8.+p.x*3.)*.0045*M(p,vec2(.5,.5),vec2(.35,.45));d.y+=sin(t*1.3+p.x*6.)*.004*M(p,vec2(.45,.55),vec2(.12,.12));}",
"  else if(k<23.5){d.x+=sin(t*.9+p.y*7.)*.005*M(p,vec2(.5,.6),vec2(.22,.32));d.x+=sin(t*.7+p.y*9.)*.003*smoothstep(.1,.5,abs(p.x-.5))*smoothstep(.2,.7,p.y);}",
"  else if(k<24.5){d.y+=sin(t*1.2+p.x*9.)*.006*smoothstep(.62,.15,p.y)*(1.-M(p,vec2(.5,.45),vec2(.3,.35)));d.x+=sin(t*.9+p.y*7.)*.005*M(p,vec2(.5,.62),vec2(.2,.3));d.y+=sin(t*1.4+p.x*6.)*.005*(M(p,vec2(.17,.2),vec2(.13,.15))+M(p,vec2(.9,.4),vec2(.13,.15)));}",
"  else if(k<25.5){vec2 tc=vec2(.5,.6);p=tc+(p-tc)/(1.+.014*sin(t*2.)*M(p,tc,vec2(.3,.25)));d.x+=sin(t*.9+p.y*5.)*.003*(smoothstep(.2,.0,p.x)+smoothstep(.8,1.,p.x));}",
"  else if(k<26.5){d.x+=sin(t*.8+p.y*7.)*.005*M(p,vec2(.5,.45),vec2(.3,.4));d.y+=sin(t*1.1+p.x*8.)*.002*M(p,vec2(.5,.35),vec2(.3,.3));}",
"  else if(k<27.5){d.x+=sin(t*.7+p.y*2.)*.018*pow(max(0.,1.-p.y/.85),1.6);}",
"  else{d.x+=sin(t*1.25+p.y*2.)*.028*pow(max(0.,1.-p.y/.85),1.6);d.y+=sin(t*1.1+p.x*8.)*.005*smoothstep(.6,.2,p.y)*(1.-M(p,vec2(.5,.4),vec2(.28,.4)));}",
"  d.x+=sin(t*1.4+p.y*45.)*.003*smoothstep(.8,1.,p.y)*step(19.5,k);",
" }else{",
"  float sc=1.045;p=(p-.5)/sc+.5+vec2(sin(t*.13),cos(t*.11))*.012;",
"  if(k<10.5){float f=M(p,vec2(.12,.24),vec2(.1,.12))+M(p,vec2(.9,.27),vec2(.1,.12))+M(p,vec2(.44,.3),vec2(.06,.1));d+=vec2(sin(t*1.1+p.y*20.),cos(t*.9+p.x*18.))*.0018*f;}",
"  else if(k<11.5){d.y+=sin(t*1.2+p.x*10.)*.002*M(p,vec2(.5,.55),vec2(.5,.3));}",
"  else if(k<12.5){d.x+=sin(t*1.5+p.y*30.)*.004*M(p,vec2(.72,.1),vec2(.07,.13));}",
"  else if(k<13.5){d.x+=sin(t*1.3)*.008*M(p,vec2(.36,.14),vec2(.07,.09));d.x+=sin(t*.9+p.x*5.)*.003*M(p,vec2(.8,.12),vec2(.2,.15));}",
"  else if(k<14.5){d.x+=sin(t*1.1+p.y*14.)*.003*M(p,vec2(.5,.4),vec2(.13,.1));d.x+=sin(t*.9+p.y*8.)*.003*(M(p,vec2(.3,.25),vec2(.12,.1))+M(p,vec2(.64,.26),vec2(.12,.1)));}",
"  else if(k<15.5){d.x+=sin(t*.7)*.003*M(p,vec2(.5,.5),vec2(.1,.1));}",
"  else if(k<16.5){d.x+=sin(t*.8+p.y*12.)*.003*M(p,vec2(.55,.3),vec2(.2,.15));}",
"  else if(k<30.5){d.x+=sin(t*1.+p.y*6.)*.002*M(p,vec2(.5,.4),vec2(.2,.3));d.y+=sin(t*1.5)*.004*M(p,vec2(.85,.5),vec2(.1,.1));d.y+=sin(t*1.6+p.x*40.)*.003*M(p,vec2(.92,.88),vec2(.1,.08));}",
"  else if(k<31.5){d.y+=sin(t*.9)*.003*M(p,vec2(.5,.55),vec2(.4,.35));d.x+=sin(t*.7)*.002;d.x+=sin(t*1.1+p.y*6.)*.005*smoothstep(.3,.05,p.x);}",
"  else if(k<32.5){d.y+=sin(t*1.3+p.x*9.)*.005*M(p,vec2(.45,.38),vec2(.5,.14));d.x+=sin(t*1.1+p.y*6.)*.004*(smoothstep(.3,.0,p.x)+smoothstep(.7,1.,p.x));}",
"  else if(k<33.5){d.x+=sin(t*1.)*.004*M(p,vec2(.5,.45),vec2(.1,.12));d.y+=sin(t*1.2+p.x*10.)*.003*M(p,vec2(.5,.3),vec2(.25,.2));}",
"  else if(k<34.5){d.x+=sin(t*.9+p.y*6.)*.005*M(p,vec2(.5,.45),vec2(.25,.35));d.x+=sin(t*1.2+p.y*5.+p.x*4.)*.007*(smoothstep(.3,.05,p.x)+smoothstep(.7,.95,p.x));d.y+=sin(t*.8)*.003*M(p,vec2(.5,.4),vec2(.15,.2));}",
"  else if(k<35.5){d.x+=sin(t*.9+p.y*8.)*.004*M(p,vec2(.87,.22),vec2(.12,.18));d.x+=sin(t*.8+p.y*7.)*.003*M(p,vec2(.28,.3),vec2(.1,.2));}",
"  else if(k<36.5){d.x+=sin(t*1.2+p.y*35.+p.x*4.)*.006*smoothstep(.55,.62,p.y);d.x+=sin(t*1.1+p.y*6.)*.002*smoothstep(.55,.2,p.y);}",
"  else if(k<37.5){d.x+=sin(t*.8+p.y*14.+p.x*3.)*.0028;d.y+=sin(t*.9+p.x*10.)*.002;}",
"  else{vec2 tc=vec2(.5,.55);p=tc+(p-tc)/(1.+.012*sin(t*2.)*M(p,tc,vec2(.3,.25)));d.x+=sin(t*.9+p.y*5.)*.004*(smoothstep(.25,.0,p.x)+smoothstep(.75,1.,p.x));}",
"  if(k>29.5)d.x+=sin(t*1.4+p.y*45.)*.003*smoothstep(.8,1.,p.y)*step(k,36.5)*step(k,33.5);",
" }",
" p+=d;p=clamp(p,.002,.998);",
" vec3 col=texture2D(T,p).rgb;",
" /* тёплые окна хижины: едва заметное дыхание света */",
" if(k>34.5&&k<35.5){float fl2=.5+(sin(t*5.1)+sin(t*8.3)+sin(t*2.3))/6.;col*=1.+.05*(fl2-.5)*M(p,vec2(.62,.3),vec2(.06,.07));}",
" if(k>36.5&&k<37.5){col*=1.+.04*(fbm(p*vec2(3.,2.)+vec2(t*.12,0.))-.5)*smoothstep(.55,.0,p.y);}",
" if(k>11.5&&k<12.5){float fl=.5+(sin(t*5.3)+sin(t*8.7)+sin(t*2.1))/6.;float mw=M(p,vec2(.54,.31),vec2(.07,.07))+M(p,vec2(.32,.55),vec2(.06,.08))+M(p,vec2(.43,.54),vec2(.04,.05));col*=1.+.05*(fl-.5)*mw;}",
" /* мягкий туман */",
" float f=fbm(p*vec2(2.2,3.)+vec2(t*.02,t*.006));",
" float a=(.07+.07*smoothstep(.35,.95,p.y))*f*(mon?.55:1.)*((k>36.5&&k<37.5)?.35:1.);",
" col=mix(col,vec3(.60,.64,.57),a);",
" col*=1.+.012*sin(t*.4);",
" gl_FragColor=vec4(col,1.);",
"}"
].join("\n");

function sh(gl,type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
function initGL(it){
 var gl=it.c.getContext("webgl",{alpha:false,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:false})||it.c.getContext("experimental-webgl");
 if(!gl)throw new Error("nogl");
 var pr=gl.createProgram();gl.attachShader(pr,sh(gl,gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error("link");
 gl.useProgram(pr);
 var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 var loc=gl.getAttribLocation(pr,"a");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 it.gl=gl;it.pr=pr;it.tex=gl.createTexture();
 it.uT=gl.getUniformLocation(pr,"t");it.uK=gl.getUniformLocation(pr,"k");it.uS=gl.getUniformLocation(pr,"S");
}
function pot(n){return n>0&&(n&(n-1))===0}
function upload(it,img){
 var gl=it.gl;gl.bindTexture(gl.TEXTURE_2D,it.tex);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
 var ok=pot(img.naturalWidth)&&pot(img.naturalHeight);
 if(ok){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)}
 else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
}

/* ---- частицы: тихие, матовые, без свечения ---- */
function spawn(it,k){
 var cfg=null;
 if(k===1||k===11)cfg={n:k===1?14:16,kind:"spore"};
 else if(k===12)cfg={n:6,kind:"smoke"};
 else if(k===13||k===15||k===16)cfg={n:k===16?9:7,kind:"leaf"};
 else if(k===14||k===10)cfg={n:12,kind:"mote"};
 else if(k===3)cfg={n:6,kind:"leaf"};
 else if(k===37)cfg={n:9,kind:"bubble"};
 else if(k===6||k===7)cfg={n:6,kind:"leaf"};
 it.pk=k;it.ps=[];if(!cfg||reduce)return;it.cfg=cfg;
 for(var i=0;i<cfg.n;i++)it.ps.push({x:Math.random(),y:Math.random(),z:.5+Math.random()*.8,p:Math.random()*6.28,s:.5+Math.random()});
}
function drawParts(it,t,dt,W,H,S){
 var g=it.g;g.clearRect(0,0,W,H);
 if(!it.cfg||!it.ps.length)return;
 var kind=it.cfg.kind,u=Math.min(W,H)/400;
 for(var i=0;i<it.ps.length;i++){
  var q=it.ps[i];
  if(kind==="spore"){q.y-=dt*.018*q.s;q.x+=Math.sin(t*.5+q.p)*dt*.012;if(q.y<-.05){q.y=1.05;q.x=Math.random()}
   var a=.22*Math.sin(Math.max(0,Math.min(1,(1.05-q.y)/1.1))*3.14159);g.fillStyle="rgba(226,222,200,"+a.toFixed(3)+")";g.beginPath();g.arc(q.x*W,q.y*H,(1.2+q.z*1.6)*u,0,6.283);g.fill()}
  else if(kind==="mote"){q.y-=dt*.008*q.s;q.x+=Math.sin(t*.4+q.p)*dt*.01;if(q.y<-.05){q.y=1.05;q.x=Math.random()}
   var a2=.2*Math.sin(Math.max(0,Math.min(1,(1.05-q.y)/1.1))*3.14159);g.fillStyle="rgba(206,190,150,"+a2.toFixed(3)+")";g.beginPath();g.arc(q.x*W,q.y*H,(.9+q.z)*u,0,6.283);g.fill()}
  else if(kind==="leaf"){q.y+=dt*.03*q.s;q.x+=Math.sin(t*.7+q.p)*dt*.028;if(q.y>1.06){q.y=-.06;q.x=Math.random()}
   var a3=.5*Math.min(1,Math.max(0,q.y*6))*Math.min(1,(1.06-q.y)*6);var rot=Math.sin(t*.9+q.p)*.9+q.p;
   g.save();g.translate(q.x*W,q.y*H);g.rotate(rot);g.scale(1,.55+.45*Math.abs(Math.sin(t*1.1+q.p)));g.fillStyle=(i%2?"rgba(150,92,52,":"rgba(120,100,50,")+a3.toFixed(3)+")";
   g.beginPath();g.ellipse(0,0,(3+q.z*2.5)*u,(1.8+q.z*1.2)*u,0,0,6.283);g.fill();g.restore()}
  else if(kind==="bubble"){q.y-=dt*.035*q.s;q.x+=Math.sin(t*.9+q.p)*dt*.01;if(q.y<-.05){q.y=1.05;q.x=Math.random()}
   var a5=.22*Math.sin(Math.max(0,Math.min(1,(1.05-q.y)/1.1))*3.14159);g.strokeStyle="rgba(200,214,196,"+a5.toFixed(3)+")";g.lineWidth=Math.max(1,u*.8);g.beginPath();g.arc(q.x*W,q.y*H,(2+q.z*3)*u,0,6.283);g.stroke()}
  else if(kind==="smoke"){
   /* дым из трубы хижины (координаты арта → холст с учётом обрезки) */
   var ax=.715,ay=.17;var cx=((ax-.5)/S[0]+.5)*W,cy=((ay-.5)/S[1]+.5)*H;
   q.y+=dt*.2*q.s;if(q.y>1)q.y=0;var up=q.y,sz=(5+up*22)*u*(1/Math.max(S[0],S[1]));
   var x=cx+Math.sin(t*.8+q.p+up*5)*10*u+up*14*u,y=cy-up*H*.14;
   var a4=.1*Math.sin(up*3.14159);var gr=g.createRadialGradient(x,y,0,x,y,sz);gr.addColorStop(0,"rgba(190,190,180,"+a4.toFixed(3)+")");gr.addColorStop(1,"rgba(190,190,180,0)");g.fillStyle=gr;g.fillRect(x-sz,y-sz,sz*2,sz*2)}
 }
}

function draw(it,t,dt){
 var img=it.img,c=it.c;
 if(!img.complete||!img.naturalWidth||img.offsetWidth===0||img.classList.contains("hidden")){c.style.display="none";it.o.style.display="none";return}
 var k=kindOf(img.getAttribute("src")||img.currentSrc);if(!k){c.style.display="none";it.o.style.display="none";img.style.opacity="";return}
 img.style.opacity="0";c.style.display="block";it.o.style.display="block";
 var w=img.offsetWidth,h=img.offsetHeight,dpr=Math.min(devicePixelRatio||1,2);
 var cs=getComputedStyle(img);
 [c,it.o].forEach(function(e){e.style.left=img.offsetLeft+"px";e.style.top=img.offsetTop+"px";e.style.width=w+"px";e.style.height=h+"px";e.style.borderRadius=cs.borderRadius});
 c.style.filter=cs.filter==="none"?"":cs.filter;
 var W=Math.round(w*dpr),H=Math.round(h*dpr);
 if(c.width!==W||c.height!==H){c.width=W;c.height=H;it.o.width=W;it.o.height=H}
 var src=img.currentSrc||img.src;
 if(it.src!==src){it.src=src;upload(it,img);spawn(it,k)}
 var gl=it.gl;gl.viewport(0,0,W,H);
 var a=W/H,S=a>=1?[1,1/a]:[a,1];
 gl.uniform1f(it.uT,t);gl.uniform1f(it.uK,k);gl.uniform2f(it.uS,S[0],S[1]);
 gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 drawParts(it,t,dt,W,H,S);
}
var vis=[];
function loop(now){
 requestAnimationFrame(loop);
 if(document.hidden)return;
 if(now-last<33)return;var dt=Math.min(.1,(now-last)/1000);last=now;
 var t=reduce?0:now/1000;
 for(var i=0;i<items.length;i++){var it=items[i];if(it.off||it.hid)continue;try{draw(it,t,reduce?0:dt)}catch(e){fail(it)}}
}
function fail(it){it.off=1;it.c.style.display="none";it.o.style.display="none";it.img.style.opacity=""}
function attach(img){
 if(!img||img.__forestart)return;img.__forestart=1;
 var c=document.createElement("canvas"),o=document.createElement("canvas");
 c.style.cssText="position:absolute;pointer-events:none;display:none;z-index:1";
 o.style.cssText="position:absolute;pointer-events:none;display:none;z-index:2";
 img.parentNode.insertBefore(c,img.nextSibling);img.parentNode.insertBefore(o,c.nextSibling);
 var it={img:img,c:c,o:o,g:o.getContext("2d"),src:"",off:0};
 try{initGL(it)}catch(e){c.remove();o.remove();return}
 items.push(it);
 if("IntersectionObserver"in window){try{new IntersectionObserver(function(es){es.forEach(function(e){it.hid=e.isIntersecting?0:1})}).observe(img.parentNode)}catch(_){}}
 if(!running){running=true;requestAnimationFrame(loop)}
}
window.ForestArt={attach:attach};
})();
