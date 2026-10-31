/* Повелитель Тайн — живой фон главной: ночной город, Богиня с красной луной.
   WebGL-шейдер рисует арт (shared/art/home.webp) с движением: облака, платье, пульс красной луны,
   мерцание окон и свечей, вода, туман. Поверх — птицы, искры и лепестки (canvas 2D).
   Работает только на вкладке «Зал», вне экрана и в свёрнутом окне останавливается. */
(function(){
"use strict";
var stage=document.getElementById("homeStage");if(!stage)return;
var reduce=false;try{reduce=matchMedia("(prefers-reduced-motion:reduce)").matches}catch(_){}
var cs=document.currentScript,base=cs&&cs.src?cs.src.replace(/[^\/]*(\?.*)?$/,"")+"art/":"shared/art/";
var AW=841,AH=1600;
var gl=null,fx=null,c2=null,prog=null,uT=null,uRes=null,tex=null,ready=false,running=false,raf=0,last=0,t0=performance.now(),acc=0;
var parts=[],birds=[],W=0,H=0,sc=1;

var VS="attribute vec2 p;varying vec2 u;void main(){u=vec2(p.x*.5+.5,1.-(p.y*.5+.5));gl_Position=vec4(p,0.,1.);}";
var FS="#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nvarying vec2 u;uniform sampler2D T;uniform float t;"+
"float h21(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}"+
"float nz(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}"+
"float fbm(vec2 q){return nz(q)*.55+nz(q*2.1)*.3+nz(q*4.3)*.15;}"+
"void main(){"+
" vec2 P=vec2(u.x*841.,u.y*1600.);"+
" vec2 d=vec2(0.);"+
" float sky=smoothstep(335.,380.,P.y)*(1.-smoothstep(640.,760.,P.y));"+
" d+=vec2(fbm(P*.006+vec2(t*.05,0.))-.5,fbm(P*.006+vec2(3.,t*.035))-.5)*5.*sky;"+
/* Богиня: колышется платье и волосы */
" vec2 g=(P-vec2(430.,560.))/vec2(215.,170.);float gm=smoothstep(1.,.35,length(g));"+
" float low=smoothstep(.0,1.,(P.y-430.)/260.);"+
" d.x+=sin(P.y*.045+t*1.15+P.x*.01)*2.1*gm*(.25+.9*low)+sin(P.y*.09-t*.8)*.9*gm*low;"+
" d.y+=sin(P.x*.05+t*.9)*.8*gm*low;"+
/* вода */
" float wm=smoothstep(1030.,1055.,P.y)*(1.-smoothstep(1200.,1225.,P.y))*smoothstep(410.,450.,P.x)*(1.-smoothstep(690.,720.,P.x));"+
" d.x+=sin(P.y*.32+t*1.5+P.x*.02)*1.7*wm;d.y+=sin(P.x*.11+t*1.1)*.6*wm;"+
" vec3 col=texture2D(T,(P+d)/vec2(841.,1600.)).rgb;"+
" float L=dot(col,vec3(.299,.587,.114));"+
" float warm=smoothstep(.04,.34,col.r-col.b)*smoothstep(.2,.6,L);"+
/* красная луна в руках Богини */
" vec2 oc=P-vec2(543.,494.);float od=length(oc);"+
" float pulse=.5+.5*sin(t*1.25);float fl=.5+.5*sin(t*3.3+nz(vec2(t*.6,2.))*6.);"+
" col+=vec3(1.,.2,.1)*exp(-pow(od/78.,2.))*(.16+.14*pulse)+vec3(1.,.42,.22)*exp(-pow(od/38.,2.))*(.07+.1*pulse*fl);"+
" col*=1.+.09*pulse*smoothstep(46.,10.,od);"+
/* окна, часы, фонари: тёплое мерцание */
" float below=smoothstep(690.,760.,P.y)*(1.-smoothstep(1195.,1235.,P.y));"+
" float cell=nz(P*.055);"+
" float tw=.5+.5*sin(t*(1.2+cell*3.)+cell*40.);"+
" col+=vec3(1.,.55,.2)*warm*below*(tw-.5)*.34;"+
" vec2 cl=P-vec2(147.,730.);col+=vec3(1.,.15,.08)*exp(-pow(length(cl)/46.,2.))*(.1+.1*sin(t*1.5));"+
" cl=P-vec2(213.,730.);col+=vec3(1.,.5,.2)*exp(-pow(length(cl)/40.,2.))*(.08+.08*sin(t*1.5+1.4));"+
/* свечи и фонарь */
" vec2 cp[6];cp[0]=vec2(40.,962.);cp[1]=vec2(242.,1090.);cp[2]=vec2(343.,1160.);cp[3]=vec2(371.,1188.);cp[4]=vec2(699.,1178.);cp[5]=vec2(80.,915.);"+
" for(int i=0;i<6;i++){float ph=float(i)*1.7;float f=.55+.45*sin(t*7.+ph*3.)*sin(t*3.1+ph)+.2*nz(vec2(t*4.,ph));"+
"  col+=vec3(1.,.62,.26)*exp(-pow(length(P-cp[i])/(i==5?42.:24.),2.))*(.1+.13*f);}"+
/* туман над городом */
" float fy=smoothstep(770.,830.,P.y)*(1.-smoothstep(940.,1030.,P.y));"+
" float fg=fbm(vec2(P.x*.004+t*.02,P.y*.01-t*.006));"+
" col=mix(col,vec3(.34,.36,.55),fg*fy*.2);"+
/* блики на воде */
" float sp=step(.986,h21(floor(P/vec2(5.,3.))+floor(t*2.2)));"+
" col+=vec3(1.,.72,.45)*sp*wm*.5*smoothstep(520.,640.,P.x)*(1.-smoothstep(640.,690.,P.x));"+
/* звёзды */
" vec2 sc=P/16.;vec2 si=floor(sc);float sr=h21(si+7.3);vec2 sp2=vec2(h21(si+1.1),h21(si+5.7));"+
" float sdist=length((fract(sc)-sp2)*16.);float sst=step(.93,sr)*exp(-sdist*sdist/1.6)*sky*smoothstep(.32,.14,L)*(.45+.55*sin(t*(.8+sr*4.)+sr*60.));"+
" col+=vec3(.78,.82,1.)*sst*.9;"+
" gl_FragColor=vec4(col,1.);}";

function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){try{console.warn(gl.getShaderInfoLog(s))}catch(_){}return null}return s}
function initGL(img){
 var cv=document.getElementById("hsGL");if(!cv)return false;
 try{gl=cv.getContext("webgl",{antialias:false,alpha:false,powerPreference:"low-power"})}catch(_){gl=null}
 if(!gl)return false;
 var v=sh(gl.VERTEX_SHADER,VS),f=sh(gl.FRAGMENT_SHADER,FS);if(!v||!f)return false;
 prog=gl.createProgram();gl.attachShader(prog,v);gl.attachShader(prog,f);gl.linkProgram(prog);
 if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return false;
 gl.useProgram(prog);
 var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 var loc=gl.getAttribLocation(prog,"p");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.uniform1i(gl.getUniformLocation(prog,"T"),0);uT=gl.getUniformLocation(prog,"t");
 return true;
}

function size(){
 var r=stage.getBoundingClientRect();if(!r.width)return;
 sc=r.width/AW;
 var dpr=Math.min(window.devicePixelRatio||1,1.6);
 var cw=Math.round(r.width*dpr),ch=Math.round(r.width*AH/AW*dpr);
 var cv=document.getElementById("hsGL");
 if(cv&&(cv.width!==cw||cv.height!==ch)){cv.width=cw;cv.height=ch;if(gl)gl.viewport(0,0,cw,ch)}
 if(fx){W=fx.width=Math.round(r.width*Math.min(dpr,1.3));H=fx.height=Math.round(r.width*AH/AW*Math.min(dpr,1.3))}
}

/* частицы поверх арта */
function spawnEmber(){
 parts.push({k:0,x:543+(Math.random()-.5)*40,y:494+(Math.random()-.5)*30,vx:(Math.random()-.3)*5,vy:-(6+Math.random()*10),life:0,max:2.5+Math.random()*2.5,s:1+Math.random()*1.6});
}
function spawnPetal(){
 parts.push({k:1,x:260+Math.random()*420,y:430+Math.random()*60,vx:(Math.random()-.4)*10,vy:6+Math.random()*7,life:0,max:9+Math.random()*5,s:2+Math.random()*2,r:Math.random()*6.28,vr:(Math.random()-.5)*2});
}
function spawnBird(){
 var dir=Math.random()<.6?1:-1;
 birds.push({x:dir>0?-30:AW+30,y:560+Math.random()*130,v:dir*(38+Math.random()*26),ph:Math.random()*6,s:.8+Math.random()*.7,dir:dir});
}
var nextBird=3,nextEmber=0,nextPetal=0;
function drawFx(dt,t){
 if(!c2)return;
 c2.clearRect(0,0,W,H);
 var k=W/AW;
 nextEmber-=dt;if(nextEmber<=0){spawnEmber();nextEmber=.14+Math.random()*.25}
 nextPetal-=dt;if(nextPetal<=0){spawnPetal();nextPetal=2.2+Math.random()*3.5}
 nextBird-=dt;if(nextBird<=0){spawnBird();nextBird=9+Math.random()*12}
 for(var i=parts.length-1;i>=0;i--){
  var p=parts[i];p.life+=dt;if(p.life>p.max){parts.splice(i,1);continue}
  var a=Math.min(1,p.life*1.5)*Math.min(1,(p.max-p.life)*1.2);
  if(p.k===0){
   p.x+=p.vx*dt+Math.sin(t*2+p.s*9)*.25;p.y+=p.vy*dt;
   var gx=p.x*k,gy=p.y*k,rad=p.s*k*2.4;
   var g=c2.createRadialGradient(gx,gy,0,gx,gy,rad*3);
   g.addColorStop(0,"rgba(255,170,100,"+(.9*a)+")");g.addColorStop(.35,"rgba(255,90,50,"+(.4*a)+")");g.addColorStop(1,"rgba(255,60,30,0)");
   c2.fillStyle=g;c2.fillRect(gx-rad*3,gy-rad*3,rad*6,rad*6);
  }else{
   p.x+=(p.vx+Math.sin(t*.8+p.r)*7)*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;
   if(p.y>1180){p.life=p.max}
   c2.save();c2.translate(p.x*k,p.y*k);c2.rotate(p.r);c2.scale(1,.55+.45*Math.sin(p.r*1.7));
   c2.fillStyle="rgba(190,28,38,"+(.75*a)+")";c2.beginPath();c2.ellipse(0,0,p.s*k*2.2,p.s*k*1.2,0,0,6.283);c2.fill();c2.restore();
  }
 }
 for(var j=birds.length-1;j>=0;j--){
  var b=birds[j];b.x+=b.v*dt;
  if((b.dir>0&&b.x>AW+40)||(b.dir<0&&b.x<-40)){birds.splice(j,1);continue}
  var fl=Math.sin(t*9+b.ph),by=b.y+Math.sin(t*1.3+b.ph)*6;
  c2.save();c2.translate(b.x*k,by*k);c2.scale(b.s*k*1.5*b.dir,b.s*k*1.5);
  c2.fillStyle="rgba(8,8,18,.88)";c2.beginPath();
  c2.moveTo(0,0);c2.quadraticCurveTo(-6,-7*fl,-14,-3*fl+2);c2.quadraticCurveTo(-7,-1,0,1.5);
  c2.quadraticCurveTo(7,-1,14,-3*fl+2);c2.quadraticCurveTo(6,-7*fl,0,0);c2.fill();c2.restore();
 }
}

function onScreen(){
 if(document.hidden)return false;
 if(document.body.getAttribute("data-tab")!=="hall")return false;
 var r=stage.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;
}
function loop(now){
 raf=0;if(!ready||!running)return;
 if(!onScreen()){running=false;return}
 var dt=Math.min(.1,(now-last)/1000);
 /* около 30 кадров в секунду */
 if(now-last<30){raf=requestAnimationFrame(loop);return}
 last=now;var t=(now-t0)/1000;
 /* при «уменьшении движения» фон идёт медленно и без частиц */
 gl.uniform1f(uT,reduce?t*.35:t);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 if(!reduce)drawFx(dt,t);
 raf=requestAnimationFrame(loop);
}
function kick(){
 if(!ready||running)return;
 if(!onScreen())return;
 running=true;last=performance.now();size();raf=requestAnimationFrame(loop);
}
function start(img){
 if(!initGL(img)){stage.classList.add("noGL");return}
 fx=document.getElementById("hsFx");c2=fx?fx.getContext("2d"):null;
 ready=true;size();
 /* первый кадр сразу, чтобы не мигала статичная картинка */
 gl.uniform1f(uT,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 stage.classList.add("glOn");
 kick();
}
var img=new Image();img.onload=function(){setTimeout(function(){start(img)},50)};img.onerror=function(){stage.classList.add("noGL")};
img.src=base+"home.webp?v=h1";
addEventListener("resize",function(){size()});
document.addEventListener("visibilitychange",function(){if(!document.hidden)kick()});
try{new MutationObserver(function(){kick()}).observe(document.body,{attributes:true,attributeFilter:["data-tab"]})}catch(_){}
addEventListener("scroll",function(){kick()},{passive:true});
})();
