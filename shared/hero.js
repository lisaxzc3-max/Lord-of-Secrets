/* Живая сцена главной: ночной Тинген и Богиня Ночи (WebGL, ~30 кадров/с, пауза вне экрана) */
(function(){
"use strict";
var hero=document.getElementById("hero");if(!hero)return;
var reduce=false;try{reduce=(window.__mm||matchMedia)("(prefers-reduced-motion:reduce)").matches}catch(_){}
var cs=document.currentScript,base=cs&&cs.src?cs.src.replace(/[^\/]*(\?.*)?$/,"")+"art/":"shared/art/";
var img=new Image(),img2=new Image(),n=0;
function ld(){if(++n===2)setTimeout(start,300)}
img.onload=ld;img2.onload=ld;img.src=base+"tingen.jpg?v=2";img2.src=base+"goddess.jpg?v=1";
function start(){
 var gl=document.createElement("canvas"),fx=document.createElement("canvas");
 gl.className="heroGL";fx.className="heroFx";
 var g=gl.getContext("webgl",{antialias:false,alpha:false,powerPreference:"low-power"});
 if(!g)return;
 var c2=fx.getContext("2d");
 var AR=img.width/img.height;
 var vs="attribute vec2 p;uniform vec2 V,O;varying vec2 u;void main(){u=vec2((p.x*.5+.5)*V.x+O.x,(1.-(p.y*.5+.5))*V.y+O.y);gl_Position=vec4(p,0.,1.);}";
 var fs=`precision highp float;varying vec2 u;uniform sampler2D T;uniform sampler2D P;uniform float t,o;uniform vec2 m;
 float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
 float h21(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
 float nz(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 q){return nz(q)*.55+nz(q*2.1)*.3+nz(q*4.3)*.15;}
 void main(){
  vec2 p=u;
  float ar=1.722488;
  float sky=smoothstep(.55,.15,p.y);
  vec2 mc=vec2(.68,.27);
  float md=length((p-mc)*vec2(ar,1.));
  float cloud=sky*smoothstep(.07,.2,md);
  vec2 d=vec2(sin(p.y*22.+t*.25)*.0025+sin(t*.07)*.012,sin(p.x*14.+t*.2)*.0012)*cloud*o;
  p+=d+m*.004*o;
  vec3 col=texture2D(T,p).rgb;
  float L=lum(col);
  float pulse=.5+.5*sin(t*.7);

  /* Богиня Ночи: её луна совпадает с луной Тингена */
  float ph=1.2;
  vec2 gp=vec2((u.x*ar-.577)/(.687805*ph),(u.y+.276)/ph);
  if(gp.x>0.&&gp.x<1.&&gp.y>0.&&gp.y<1.){
   float sk=smoothstep(.42,.95,gp.y);
   float hr=smoothstep(.15,.3,gp.y)*(1.-smoothstep(.5,.7,gp.y));
   float fe=(smoothstep(.3,.0,gp.x)+smoothstep(.72,1.,gp.x))*smoothstep(.45,.75,gp.y);
   vec2 gd=vec2(sin(gp.y*9.+t*.8+gp.x*4.),cos(gp.x*7.-t*.6))*.0045*sk+vec2(sin(gp.y*14.-t*.7),sin(gp.x*10.+t*.5))*.002*hr+vec2(sin(gp.y*12.+t*1.1),cos(gp.x*9.-t*.9))*.0035*fe;
   vec3 g=texture2D(P,gp+gd*o).rgb;
   g=max(g-.17,0.)*1.7;
   float edge=smoothstep(.0,.22,gp.x)*smoothstep(1.,.78,gp.x)*smoothstep(.0,.1,gp.y)*smoothstep(1.,.8,gp.y);
   float horizon=smoothstep(.66,.5,u.y);
   float sky=smoothstep(.07,.16,L);
   /* тёмные шпили и башни остаются перед богиней */
   col+=g*edge*horizon*(.35+.65*sky)*.95*o;
  }
  /* луна */
  vec2 mh=(u-mc)*vec2(ar,1.);float mr=length(mh);
  col+=vec3(1.,.2,.1)*exp(-pow(mr/.2,2.))*(.2+.12*pulse)*o;
  col+=vec3(1.,.5,.3)*exp(-pow(mr/.07,2.))*(.08+.06*pulse)*o;
  /* туман над городом */
  float fy=smoothstep(.42,.58,u.y)*(1.-smoothstep(.72,.98,u.y));
  float fg=fbm(vec2(u.x*ar*3.+t*.05,u.y*5.-t*.02));
  col=mix(col,vec3(.55,.35,.4),fg*fy*.32*o);
  /* мерцание окон и огней */
  float warm=smoothstep(.0,.25,col.r-col.b)*smoothstep(.5,.75,L)*smoothstep(.6,.7,u.y);
  float hc=h21(floor(u*vec2(260.,150.)));
  col*=1.+.35*warm*sin(t*(1.2+hc*2.)+hc*40.)*o;
  /* часы на башне */
  float cd=length((u-vec2(.348,.485))*vec2(ar,1.));
  col+=vec3(1.,.3,.15)*exp(-pow(cd/.03,2.))*(.2+.15*sin(t*.8+1.))*o;
  /* красный отсвет на нижних улицах */
  col+=vec3(.4,.05,.03)*smoothstep(.6,1.,u.y)*(.05+.04*sin(t*.5+u.x*6.))*o;
  /* звёздные нити света, свисающие сверху по всей сцене */
  float cx=u.x*ar*11.;float ci=floor(cx);float fx=fract(cx);
  float hs=h21(vec2(ci,3.7));
  float pos=.2+.6*h21(vec2(ci,9.1));
  float strand=exp(-pow((fx-pos)/(.05+.06*hs),2.));
  float lenf=.28+.42*h21(vec2(ci,5.3));
  float vf=1.-smoothstep(.0,lenf,u.y);
  float on=step(.3,hs);
  float sp=h21(vec2(ci*13.+floor((fx-pos)*46.),floor(u.y*240.)));
  float tw=.5+.5*sin(t*(1.+sp*2.)+sp*60.);
  float spark=step(.78,sp)*tw;
  float behind=.35+.65*smoothstep(.07,.16,L);
  col+=vec3(1.,.88,.6)*on*vf*behind*(strand*(.07+spark*.95))*o;
  /* блик на облаках */
  float sw=exp(-pow((fract(u.x*.5-t*.02)-.5)/.1,2.));
  col+=vec3(.5,.2,.2)*sw*sky*pow(L,1.5)*.25*o;
  gl_FragColor=vec4(col,1.);
 }`;
 function sh(ty,s){var x=g.createShader(ty);g.shaderSource(x,s);g.compileShader(x);if(!g.getShaderParameter(x,g.COMPILE_STATUS)){console.error(g.getShaderInfoLog(x));return null}return x}
 var v=sh(g.VERTEX_SHADER,vs),f=sh(g.FRAGMENT_SHADER,fs);if(!v||!f)return;
 var pr=g.createProgram();g.attachShader(pr,v);g.attachShader(pr,f);g.linkProgram(pr);g.useProgram(pr);
 var bf=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,bf);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);
 var lc=g.getAttribLocation(pr,"p");g.enableVertexAttribArray(lc);g.vertexAttribPointer(lc,2,g.FLOAT,false,0,0);
 function mk(unit,im,name){g.activeTexture(g.TEXTURE0+unit);var t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.texImage2D(g.TEXTURE_2D,0,g.RGB,g.RGB,g.UNSIGNED_BYTE,im);
  g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
  g.uniform1i(g.getUniformLocation(pr,name),unit)}
 mk(0,img,"T");mk(1,img2,"P");
 var uT=g.getUniformLocation(pr,"t"),uO=g.getUniformLocation(pr,"o"),uM=g.getUniformLocation(pr,"m"),uV=g.getUniformLocation(pr,"V"),uOf=g.getUniformLocation(pr,"O");
 /* яркие огни для искр */
 var oc=document.createElement("canvas");oc.width=240;oc.height=Math.round(240/AR);var ox=oc.getContext("2d");ox.drawImage(img,0,0,oc.width,oc.height);
 var px=ox.getImageData(0,0,oc.width,oc.height).data,S=[];
 for(var y=2;y<oc.height-2;y+=2)for(var x=2;x<oc.width-2;x+=2){var i=(y*oc.width+x)*4,L=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255;if(y/oc.height>.5&&L>.5&&px[i]>px[i+2]*1.25)S.push([x/oc.width,y/oc.height,L])}
 var seed=7;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}
 var stars=[],i2;for(i2=0;i2<50&&S.length;i2++){var s=S[Math.floor(rnd()*S.length)];stars.push({x:s[0],y:s[1],ph:rnd()*6.28,sp:.5+rnd()*1.3,sz:.5+rnd()*1.1+s[2]*.6})}
 var embers=[],bats=[],sand=[];
 for(i2=0;i2<0;i2++)sand.push({x:rnd(),y:rnd()*.9,v:.012+rnd()*.03,ph:rnd()*6.28,r:.5+rnd()*1.1,l:.01+rnd()*.03});
 for(i2=0;i2<36;i2++)embers.push({life:rnd()*5,max:4,x:rnd(),y:.7,dx:0,v:.04,r:1,ph:rnd()*6});
 for(i2=0;i2<4;i2++)bats.push({x:rnd(),y:.12+rnd()*.35,v:.03+rnd()*.05,ph:rnd()*6,r:.8+rnd()*.7});
 hero.insertBefore(fx,hero.firstChild);hero.insertBefore(gl,hero.firstChild);
 var W=0,H=0,V=[1,1],O=[0,0],pointer=[0,0],tgt=[0,0];
 function size(){
  var r=hero.getBoundingClientRect();if(!r.width)return;
  var dpr=Math.min(devicePixelRatio||1,1.5);
  W=Math.round(r.width*dpr);H=Math.round(r.height*dpr);
  gl.width=fx.width=W;gl.height=fx.height=H;g.viewport(0,0,W,H);
  var a=r.width/r.height;
  V=[Math.min(1,a/AR),Math.min(1,AR/a)];O=[(1-V[0])*.82,(1-V[1])*.3];
  g.uniform2f(uV,V[0],V[1]);g.uniform2f(uOf,O[0],O[1]);
 }
 size();addEventListener("resize",size);
 hero.addEventListener("pointermove",function(e){var r=hero.getBoundingClientRect();tgt=[(e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1]});
 hero.addEventListener("pointerleave",function(){tgt=[0,0]});
 var vis=true;if("IntersectionObserver" in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting},{threshold:0}).observe(hero);
 var tt=0,last=performance.now(),lastDraw=0,still=reduce;
 function X(ux){return (ux-O[0])/V[0]*W}function Y(uy){return (uy-O[1])/V[1]*H}
 function frame(now){
  requestAnimationFrame(frame);
  if(document.hidden||!vis||!hero.offsetWidth)return;
  if(now-lastDraw<32)return;lastDraw=now;
  var dt=Math.min(.06,(now-last)/1000);last=now;if(!still)tt+=dt;
  if(!W)size();
  pointer[0]+=(tgt[0]-pointer[0])*.08;pointer[1]+=(tgt[1]-pointer[1])*.08;
  g.uniform1f(uT,tt);g.uniform1f(uO,still?0:1);g.uniform2f(uM,-pointer[0],-pointer[1]);
  g.drawArrays(g.TRIANGLE_STRIP,0,4);
  c2.clearRect(0,0,W,H);if(still)return;
  var k,e,j;c2.globalCompositeOperation="lighter";
  var sc=H/150;
  for(j=0;j<stars.length;j++){var st=stars[j];k=Math.pow(Math.max(0,Math.sin(tt*st.sp+st.ph)),8);if(k<.03)continue;
   var x=X(st.x),y=Y(st.y),r=st.sz*k*sc*.55;if(x<0||x>W)continue;
   c2.fillStyle="rgba(255,170,110,"+(.9*k).toFixed(2)+")";
   c2.beginPath();c2.moveTo(x,y-r*3);c2.lineTo(x+r*.35,y-r*.35);c2.lineTo(x+r*3,y);c2.lineTo(x+r*.35,y+r*.35);c2.lineTo(x,y+r*3);c2.lineTo(x-r*.35,y+r*.35);c2.lineTo(x-r*3,y);c2.lineTo(x-r*.35,y-r*.35);c2.closePath();c2.fill()}
  for(j=0;j<sand.length;j++){var sd=sand[j];sd.y+=sd.v*dt;if(sd.y>.95){sd.y=-.02;sd.x=rnd()}
   var sx=X(sd.x+Math.sin(tt*.4+sd.ph)*.004),sy=Y(sd.y),a=.35+.5*Math.abs(Math.sin(tt*.9+sd.ph*2)),fade=Math.min(1,sd.y*8)*Math.min(1,(.95-sd.y)*8);
   var gr=c2.createLinearGradient(sx,sy-sd.l*H,sx,sy);gr.addColorStop(0,"rgba(255,215,130,0)");gr.addColorStop(1,"rgba(255,215,130,"+(a*fade*.55).toFixed(2)+")");
   c2.strokeStyle=gr;c2.lineWidth=Math.max(1,sd.r*sc*.35);c2.beginPath();c2.moveTo(sx,sy-sd.l*H);c2.lineTo(sx,sy);c2.stroke();
   c2.fillStyle="rgba(255,225,150,"+(a*fade).toFixed(2)+")";c2.beginPath();c2.arc(sx,sy,sd.r*sc*.4,0,6.283);c2.fill()}
  for(j=0;j<embers.length;j++){e=embers[j];e.life+=dt;
   if(e.life>e.max){e.life=0;e.max=3+rnd()*4;if(rnd()<.3){e.x=.68+(rnd()-.5)*.05;e.y=.27+(rnd()-.5)*.04}else{e.x=rnd();e.y=.6+rnd()*.4}e.dx=(rnd()-.5)*.03;e.v=.02+rnd()*.04;e.r=.6+rnd()*1.4}
   k=e.life/e.max;var ex=X(e.x+e.dx*k*3+Math.sin(tt*1.5+e.ph)*.006*k),ey=Y(e.y-e.v*e.life);
   c2.fillStyle="rgba(255,"+(120+Math.floor(80*(1-k)))+",60,"+(.9*Math.sin(Math.PI*k)).toFixed(2)+")";
   c2.beginPath();c2.arc(ex,ey,e.r*sc*.5,0,6.283);c2.fill()}
  c2.globalCompositeOperation="source-over";
  for(j=0;j<bats.length;j++){var f=bats[j];f.x+=f.v*dt;if(f.x>1.1){f.x=-.1;f.y=.1+rnd()*.35;f.v=.03+rnd()*.05}
   var bx=X(f.x),by=Y(f.y+Math.sin(tt*.9+f.ph)*.015),s2=sc*1.7*f.r,fl=Math.sin(tt*9+f.ph*3)*.6;
   c2.fillStyle="rgba(6,2,8,.85)";c2.beginPath();c2.moveTo(bx,by);c2.quadraticCurveTo(bx-s2*1.5,by-s2*(1+fl),bx-s2*3,by+s2*.3);c2.quadraticCurveTo(bx-s2*1.5,by+s2*.2,bx,by+s2*.7);c2.quadraticCurveTo(bx+s2*1.5,by+s2*.2,bx+s2*3,by+s2*.3);c2.quadraticCurveTo(bx+s2*1.5,by-s2*(1+fl),bx,by);c2.fill()}
 }
 gl.style.opacity=0;requestAnimationFrame(function(){gl.style.transition="opacity 1.2s";gl.style.opacity=1;fx.style.opacity=1;requestAnimationFrame(frame)});
}
})();
