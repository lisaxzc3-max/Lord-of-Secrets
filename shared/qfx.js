/* Повелитель Тайн — визуальные эффекты квестов (этапы I и II).
   Арт-фон + мягкие эффекты поверх: свет свечей и ламп, частицы, лёгкая камера, тряска, помехи.
   Все эффекты рисуются кодом. Координаты в пресетах заданы долями арта 941×1672. */
(function(){
"use strict";
if(window.QFX)return;
var IW=941,IH=1672,OPY=0.35;
var reduce=false;try{reduce=matchMedia("(prefers-reduced-motion:reduce)").matches}catch(e){}
var o={base:"./img/",ver:"2"};
var stage,cam,shk,sceneEl,glowEl,cv,cx,vig;
var W=0,H=0,DPR=1,T=0,last=0,raf=0,running=false;
var imgs={},curName="",cur=null,items=[],bursts=[],glows=[],pushT=0,lowMind=false;

/* ---------- стили ---------- */
var CSS=
"#stage{position:fixed;inset:0;z-index:0;overflow:hidden;background:#07050d}"+
"#qcam,#qshk{position:absolute;inset:0;transform-origin:50% 38%}"+
"#qshk{transition:filter 1.4s}"+
"#qscene{position:absolute;inset:0;background:linear-gradient(#0a0814,#1a1530)}"+
"#qscene img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 35%;opacity:0;transition:opacity 1.3s ease}"+
"#qscene img.on{opacity:1}"+
"#qglows,#qfx{position:absolute;inset:0;pointer-events:none}"+
"#qfx{width:100%;height:100%}"+
".qg{position:absolute;pointer-events:none;mix-blend-mode:screen;opacity:0;transition:opacity 1.6s}"+
".qg.on{opacity:1}"+
".qg.candle{animation:qcandle 2.9s ease-in-out infinite}"+
".qg.breath{animation:qbreath 7s ease-in-out infinite}"+
".qg.beam{animation:qbeam 4.6s ease-in-out infinite;filter:blur(1.5px)}"+
".qg.ell{animation:qshim 8s ease-in-out infinite}"+
".qg.dim{transition:opacity 1.8s;opacity:.04!important;animation:none}"+
"@keyframes qcandle{0%,100%{opacity:.82;transform:scale(1)}18%{opacity:1;transform:scale(1.05)}37%{opacity:.7;transform:scale(.96)}58%{opacity:.95;transform:scale(1.03)}79%{opacity:.78;transform:scale(.98)}}"+
"@keyframes qbreath{0%,100%{opacity:.55}50%{opacity:1}}"+
"@keyframes qbeam{0%,100%{opacity:.6}50%{opacity:1}}"+
"@keyframes qshim{0%,100%{opacity:.35}50%{opacity:.95}}"+
"#qvig{position:fixed;inset:0;z-index:3;pointer-events:none;background:radial-gradient(ellipse at 50% 42%,transparent 52%,rgba(5,3,12,.55) 100%);transition:background 1.2s}"+
"#qvig.red{background:radial-gradient(ellipse at 50% 42%,transparent 38%,rgba(90,14,28,.62) 100%)}"+
"#qvig.low{background:radial-gradient(ellipse at 50% 42%,transparent 44%,rgba(70,10,24,.5) 100%);animation:qlow 3.4s ease-in-out infinite}"+
"@keyframes qlow{0%,100%{opacity:.7}12%{opacity:1}24%{opacity:.75}36%{opacity:1}60%{opacity:.7}}"+
".qring{position:fixed;z-index:4;pointer-events:none;border-radius:50%;border:1px solid rgba(220,195,140,.5)}"+
".qflash{position:fixed;inset:0;z-index:40;pointer-events:none;opacity:0}"+
"@media(prefers-reduced-motion:reduce){.qg{animation:none!important;opacity:.7}#qvig.low{animation:none}}";

/* ---------- геометрия ---------- */
function sc(){return Math.max(W/IW,H/IH)}
function map(x,y){var s=sc(),dw=IW*s,dh=IH*s;return [(W-dw)/2+x*dw,(H-dh)*OPY+y*dh]}
function unit(){return sc()*IW}
function rnd(a,b){return a+Math.random()*(b-a)}

/* ---------- пресеты сцен ---------- */
var CAND="255,190,110";
function cand(x,y,r,a){return {t:"candle",x:x,y:y,r:r||.08,c:CAND,a:a||.5}}
function lamp(x,y,r){return {t:"candle",x:x,y:y,r:r||.09,c:"255,205,120",a:.5,lamp:1}}
var PRE={
 room:{tint:"#1b1830",push:1.06,glows:[cand(.16,.125,.10,.55),{t:"breath",x:.61,y:.17,r:.20,c:"200,212,255",a:.15},{t:"breath",x:.53,y:.48,r:.06,c:"255,120,120",a:.14}],parts:[{t:"dust",n:34,c:"215,205,235"}]},
 street:{tint:"#1a1830",push:1.05,glows:[lamp(.32,.385,.10),lamp(.44,.46,.07),lamp(.53,.51,.05),lamp(.57,.53,.04),lamp(.79,.42,.09),lamp(.70,.51,.06),{t:"breath",x:.58,y:.11,r:.18,c:"210,215,255",a:.12}],parts:[{t:"mist",n:4,y0:.45,y1:.8,c:"170,165,205"},{t:"leaf",n:12},{t:"dust",n:16,c:"220,200,160"}]},
 bridge:{tint:"#191830",push:1.05,glows:[lamp(.21,.32,.09),lamp(.93,.35,.08),{t:"breath",x:.54,y:.14,r:.24,c:"225,225,255",a:.16},{t:"breath",x:.24,y:.14,r:.06,c:"255,215,140",a:.18}],parts:[{t:"mist",n:4,y0:.55,y1:.85,c:"170,165,205"},{t:"ripple",n:5,y0:.68,y1:.95},{t:"dust",n:16,c:"215,210,235"}]},
 door:{tint:"#1b1730",push:1.04,glows:[{t:"beam",x:.497,y1:.125,y2:.72,a:.85},{t:"breath",x:.5,y:.87,r:.2,c:"235,190,120",a:.2}],parts:[{t:"spark",n:32,cx:.5,cy:.26,rad:.43,c:"235,205,140"},{t:"dust",n:20,c:"220,200,160"}]},
 mirror:{tint:"#1b1830",push:1.06,glows:[{t:"ell",x:.54,y:.31,rx:.19,ry:.24,c:"150,170,255",a:.2},cand(.30,.375,.07,.5),cand(.345,.43,.06,.45)],parts:[{t:"dust",n:30,c:"215,205,235"}]},
 stairs:{tint:"#18162c",push:1.07,glows:[cand(.13,.31,.09,.5),cand(.64,.04,.07,.4),cand(.94,.185,.08,.45),cand(.55,.135,.05,.4),cand(.87,.37,.05,.4),{t:"breath",x:.5,y:.7,r:.1,c:"235,200,130",a:.18}],parts:[{t:"page",n:12},{t:"dust",n:16,c:"215,205,235"},{t:"spark",n:12,cx:.5,cy:.7,rad:.1,c:"235,205,140"}]},
 archive:{tint:"#1a1630",push:1.05,glows:[cand(.235,.066,.06,.45),cand(.78,.06,.06,.45),cand(.2,.29,.06,.45),cand(.82,.29,.06,.45),cand(.43,.5,.05,.5),cand(.62,.52,.05,.5),{t:"breath",x:.5,y:.18,r:.16,c:"170,185,255",a:.12}],parts:[{t:"dust",n:38,c:"225,210,190"},{t:"page",n:7}]},
 reading:{tint:"#1a1730",push:1.05,glows:[{t:"breath",x:.5,y:.23,r:.2,c:"170,185,255",a:.15},cand(.17,.43,.06,.5),cand(.83,.43,.06,.5),cand(.13,.74,.06,.5)],parts:[{t:"dust",n:28,c:"215,205,235"}]},
 heart:{tint:"#1a1832",push:1.05,glows:[{t:"breath",x:.5,y:.52,r:.24,c:"255,215,150",a:.3},cand(.27,.47,.05,.5),cand(.73,.47,.05,.5),{t:"breath",x:.53,y:.21,r:.14,c:"215,220,255",a:.13}],parts:[{t:"pageup",n:12},{t:"spark",n:28,cx:.5,cy:.22,rad:.4,c:"235,205,140"},{t:"dust",n:16,c:"215,205,235"}]},
 dawn:{tint:"#2a2540",push:1.05,glows:[{t:"breath",x:.62,y:.31,r:.32,c:"255,210,140",a:.26},cand(.73,.64,.05,.4)],parts:[{t:"rays",sx:.62,sy:.31},{t:"dust",n:28,c:"255,232,185"}]},
 ash:{tint:"#2a2038",push:1.06,glows:[{t:"candle",x:.19,y:.59,r:.12,c:"255,120,50",a:.5},{t:"candle",x:.19,y:.77,r:.12,c:"255,120,50",a:.5},{t:"candle",x:.91,y:.59,r:.1,c:"255,120,50",a:.4},{t:"breath",x:.58,y:.4,r:.26,c:"255,190,140",a:.18}],parts:[{t:"ember",n:34,src:[[.19,.59],[.19,.77],[.91,.59],[.5,.9]]},{t:"ash",n:28},{t:"page",n:7}]}
};

/* ---------- частицы ---------- */
var I={},U={},D={};
var LEAF=["150,120,60","125,95,52","170,140,72"];
I.dust=function(it,g,first){it.x=rnd(0,W);it.y=first?rnd(0,H):H+8;it.vx=rnd(-7,7);it.vy=-rnd(5,14);it.r=rnd(.6,1.7);it.p=rnd(0,6.28);it.a=rnd(.2,.5)};
U.dust=function(it,dt){it.x+=it.vx*dt;it.y+=it.vy*dt;if(it.y<-8||it.x<-8||it.x>W+8)return 1};
D.dust=function(c,it,g){c.fillStyle="rgba("+(g.c||"215,205,235")+","+(it.a*(.6+.4*Math.sin(T*1.3+it.p))).toFixed(3)+")";c.beginPath();c.arc(it.x,it.y,it.r,0,6.283);c.fill()};
I.leaf=function(it,g,first){it.x=rnd(0,W);it.y=first?rnd(0,H):-10;it.vx=rnd(-8,8);it.vy=rnd(24,44);it.rot=rnd(0,6.28);it.vr=rnd(-1.5,1.5);it.s=rnd(3.5,6.5);it.p=rnd(0,6.28);it.col=LEAF[Math.floor(Math.random()*3)];it.a=rnd(.5,.8)};
U.leaf=function(it,dt){it.x+=it.vx*dt+Math.sin(T*1.1+it.p)*16*dt;it.y+=it.vy*dt;it.rot+=it.vr*dt;if(it.y>H+12)return 1};
D.leaf=function(c,it){c.save();c.translate(it.x,it.y);c.rotate(it.rot);c.scale(1,.35+.65*Math.abs(Math.cos(T*1.8+it.p)));c.fillStyle="rgba("+it.col+","+it.a+")";c.beginPath();c.ellipse(0,0,it.s,it.s*.5,0,0,6.283);c.fill();c.restore()};
I.page=function(it,g,first){it.x=rnd(0,W);it.y=first?rnd(0,H):-12;it.vx=rnd(-6,6);it.vy=rnd(16,32);it.rot=rnd(0,6.28);it.vr=rnd(-.9,.9);it.p=rnd(0,6.28);it.a=rnd(.35,.6)};
U.page=function(it,dt){it.x+=it.vx*dt+Math.sin(T*.9+it.p)*14*dt;it.y+=it.vy*dt;it.rot+=it.vr*dt;if(it.y>H+14)return 1};
D.page=function(c,it){c.save();c.translate(it.x,it.y);c.rotate(it.rot);c.fillStyle="rgba(218,208,182,"+it.a+")";var f=Math.cos(T*1.6+it.p);c.fillRect(-4,-5.5*f,8,11*f);c.restore()};
I.pageup=function(it,g,first){it.x=rnd(0,W);it.y=first?rnd(0,H):H+12;it.vx=rnd(-6,6);it.vy=-rnd(16,34);it.rot=rnd(0,6.28);it.vr=rnd(-.9,.9);it.p=rnd(0,6.28);it.a=rnd(.3,.55)};
U.pageup=function(it,dt){it.x+=it.vx*dt+Math.sin(T*.9+it.p)*14*dt;it.y+=it.vy*dt;it.rot+=it.vr*dt;if(it.y<-14)return 1};
D.pageup=D.page;
I.ember=function(it,g,first){var s=g.src;if(s&&s.length){var q=s[Math.floor(Math.random()*s.length)],p=map(q[0],q[1]);it.x=p[0]+rnd(-34,34);it.y=p[1]+rnd(-20,20)}else{it.x=rnd(0,W);it.y=H+6}it.vx=rnd(-8,8);it.vy=-rnd(26,70);it.life=rnd(2.4,5);it.age=first?rnd(0,it.life):0;it.r=rnd(.9,2.3);it.p=rnd(0,6.28)};
U.ember=function(it,dt){it.age+=dt;it.x+=it.vx*dt+Math.sin(T*2+it.p)*10*dt;it.y+=it.vy*dt;if(it.age>it.life)return 1};
D.ember=function(c,it){var a=1-it.age/it.life;c.fillStyle="rgba(255,150,70,"+(a*.85).toFixed(3)+")";c.beginPath();c.arc(it.x,it.y,it.r,0,6.283);c.fill();c.fillStyle="rgba(255,120,50,"+(a*.18).toFixed(3)+")";c.beginPath();c.arc(it.x,it.y,it.r*3.2,0,6.283);c.fill()};
I.ash=function(it,g,first){it.x=rnd(0,W);it.y=first?rnd(0,H):-8;it.vx=rnd(-6,6);it.vy=rnd(12,28);it.r=rnd(.8,1.9);it.p=rnd(0,6.28);it.a=rnd(.25,.5)};
U.ash=function(it,dt){it.x+=it.vx*dt+Math.sin(T+it.p)*9*dt;it.y+=it.vy*dt;if(it.y>H+8)return 1};
D.ash=function(c,it){c.fillStyle="rgba(195,185,180,"+it.a+")";c.beginPath();c.arc(it.x,it.y,it.r,0,6.283);c.fill()};
I.spark=function(it,g){it.ang=rnd(0,6.283);it.k=rnd(.93,1.05);it.p=rnd(0,6.28);it.sp=rnd(.01,.03)*(Math.random()<.5?-1:1);it.r=rnd(.9,2)};
U.spark=function(it,dt,g){it.ang+=it.sp*dt};
D.spark=function(c,it,g){var rad=(g.rad||.1)*it.k,p=map((g.cx||.5)+Math.cos(it.ang)*rad,(g.cy||.3)+Math.sin(it.ang)*rad*(IW/IH));var a=Math.max(0,.5+.5*Math.sin(T*2.1+it.p))*.8;c.fillStyle="rgba("+(g.c||"235,205,140")+","+a.toFixed(3)+")";c.beginPath();c.arc(p[0],p[1],it.r,0,6.283);c.fill()};
I.mist=function(it,g){it.x=rnd(-.2,1.2);it.y=rnd(g.y0||.5,g.y1||.8);it.r=rnd(.28,.5);it.vx=rnd(.004,.012)*(Math.random()<.5?-1:1);it.a=rnd(.05,.09)};
U.mist=function(it,dt){it.x+=it.vx*dt;if(it.x>1.35)it.x=-.35;if(it.x<-.35)it.x=1.35};
D.mist=function(c,it,g){var p=map(it.x,it.y),r=it.r*unit(),gr=c.createRadialGradient(p[0],p[1],0,p[0],p[1],r);var col=g.c||"170,165,205";gr.addColorStop(0,"rgba("+col+","+it.a+")");gr.addColorStop(1,"rgba("+col+",0)");c.fillStyle=gr;c.fillRect(p[0]-r,p[1]-r,r*2,r*2)};
I.ripple=function(it,g){it.x=rnd(.1,.9);it.y=rnd(g.y0||.7,g.y1||.95);it.life=rnd(3,4.4);it.age=-rnd(0,4)};
U.ripple=function(it,dt,g){it.age+=dt;if(it.age>it.life){I.ripple(it,g)}};
D.ripple=function(c,it){if(it.age<0)return;var k=it.age/it.life,p=map(it.x,it.y),rx=k*.085*unit();c.strokeStyle="rgba(200,205,240,"+((1-k)*.22).toFixed(3)+")";c.lineWidth=1;c.beginPath();c.ellipse(p[0],p[1],rx,rx*.22,0,0,6.283);c.stroke()};
I.rays=function(it){it.p=rnd(0,6.28)};
U.rays=function(){};
D.rays=function(c,it,g){var p=map(g.sx,g.sy),L=Math.max(W,H)*1.1;for(var i=0;i<5;i++){var ang=1.95+i*.16,a=.05+.03*Math.sin(T*.5+i*1.3);c.save();c.translate(p[0],p[1]);c.rotate(ang);var gr=c.createLinearGradient(0,0,L,0);gr.addColorStop(0,"rgba(255,226,160,"+a.toFixed(3)+")");gr.addColorStop(1,"rgba(255,226,160,0)");c.fillStyle=gr;c.beginPath();c.moveTo(0,0);c.lineTo(L,-L*.07);c.lineTo(L,L*.07);c.closePath();c.fill();c.restore()}};
/* всплески (однократные) */
function mkBurst(kind,x,y,n){var p=map(x,y);for(var i=0;i<n;i++){bursts.push({k:kind,x:p[0]+rnd(-30,30),y:p[1]+rnd(-20,20),vx:rnd(-24,24),vy:kind==="ember"?-rnd(40,110):-rnd(18,55),age:0,life:rnd(1.4,2.8),r:rnd(1,2.4)})}if(bursts.length>140)bursts.splice(0,bursts.length-140)}
function drawBursts(c,dt){for(var i=bursts.length-1;i>=0;i--){var b=bursts[i];b.age+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.age>b.life){bursts.splice(i,1);continue}var a=1-b.age/b.life;c.fillStyle=b.k==="ember"?"rgba(255,150,70,"+(a*.85).toFixed(3)+")":"rgba(240,215,150,"+(a*.8).toFixed(3)+")";c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill()}}

/* ---------- кадр ---------- */
function frame(ts){
  raf=0;if(!running)return;
  var dt=Math.min(.05,(ts-last)/1000||.016);last=ts;T+=dt;
  cx.clearRect(0,0,W,H);
  for(var i=0;i<items.length;i++){var it=items[i],g=it.g;if(U[it.k](it,dt,g))I[it.k](it,g,false);D[it.k](cx,it,g)}
  drawBursts(cx,dt);
  if(!document.hidden)raf=requestAnimationFrame(frame);else setTimeout(function(){if(running&&!raf)raf=requestAnimationFrame(frame)},500);
}
function start(){if(reduce){drawStatic();return}if(running)return;running=true;last=performance.now();raf=requestAnimationFrame(frame)}
function drawStatic(){cx.clearRect(0,0,W,H);for(var i=0;i<items.length;i++){var it=items[i];D[it.k](cx,it,it.g)}}
function build(parts){
  items=[];(parts||[]).forEach(function(g){var n=g.n||1;if(!I[g.t])return;for(var i=0;i<n;i++){var it={k:g.t,g:g};I[g.t](it,g,true);items.push(it)}});
  if(reduce)drawStatic();
}

/* ---------- свет ---------- */
function clearGlows(){glows.forEach(function(g){g.el.remove()});glows=[]}
function mkGlow(c){
  var el=document.createElement("i");el.className="qg "+c.t;
  var col=c.c||CAND,a=c.a==null?.5:c.a;
  if(c.t==="beam")el.style.background="linear-gradient(to bottom,rgba(255,226,160,0),rgba(255,226,160,"+a+") 12%,rgba(255,226,160,"+a+") 88%,rgba(255,226,160,0))";
  else if(c.t==="ell")el.style.cssText+="border-radius:50%;background:radial-gradient(ellipse at center,rgba("+col+","+a+"),rgba("+col+",0) 72%)";
  else el.style.cssText+="border-radius:50%;background:radial-gradient(circle,rgba("+col+","+a+"),rgba("+col+",0) 68%)";
  if(c.t==="candle"||c.t==="breath"||c.t==="ell"||c.t==="beam"){el.style.animationDelay="-"+(Math.random()*6).toFixed(2)+"s";if(c.t==="candle")el.style.animationDuration=(2.2+Math.random()*1.6).toFixed(2)+"s"}
  glowEl.appendChild(el);var g={c:c,el:el};glows.push(g);placeGlow(g);
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add("on")})});
}
function placeGlow(g){
  var c=g.c,el=g.el,u=unit(),s=el.style;
  if(c.t==="beam"){var a=map(c.x,c.y1),b=map(c.x,c.y2),w=Math.max(3,u*.011);s.left=(a[0]-w/2)+"px";s.top=a[1]+"px";s.width=w+"px";s.height=(b[1]-a[1])+"px";return}
  var p=map(c.x,c.y);
  if(c.t==="ell"){var ww=c.rx*2*u,hh=c.ry*2*u;s.left=(p[0]-ww/2)+"px";s.top=(p[1]-hh/2)+"px";s.width=ww+"px";s.height=hh+"px";return}
  var d=(c.r||.08)*2*u;s.left=(p[0]-d/2)+"px";s.top=(p[1]-d/2)+"px";s.width=d+"px";s.height=d+"px";
}
function layout(){W=innerWidth;H=innerHeight;DPR=Math.min(window.devicePixelRatio||1,1.5);if(!cv)return;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cx.setTransform(DPR,0,0,DPR,0,0);glows.forEach(placeGlow);if(reduce)drawStatic()}

/* ---------- картинки ---------- */
function load(name){
  if(imgs[name])return imgs[name];
  var im=new Image();im.decoding="async";im.alt="";
  var r={im:im,ok:null,cb:[]};
  im.onload=function(){r.ok=true;r.cb.forEach(function(f){f()});r.cb=[]};
  im.onerror=function(){r.ok=false;r.cb=[]};
  im.src=o.base+name+".jpg?v="+o.ver;imgs[name]=r;return r;
}
function reveal(name){
  var r=imgs[name];if(!r||!r.ok||curName!==name)return;
  if(!r.im.parentNode)sceneEl.appendChild(r.im);
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    if(curName!==name)return;
    var all=sceneEl.querySelectorAll("img");for(var i=0;i<all.length;i++)if(all[i]!==r.im)all[i].classList.remove("on");
    r.im.classList.add("on");
  })});
}

/* ---------- камера и эффекты ---------- */
function anim(el,frames,opt){try{if(el&&el.animate&&!reduce)return el.animate(frames,opt)}catch(e){}return null}
function push(k){
  if(reduce||!cam)return;
  cam.style.transition="none";cam.style.transform="scale("+k+")";void cam.offsetWidth;
  cam.style.transition="transform 16s cubic-bezier(.15,.5,.25,1)";cam.style.transform="scale(1)";
}

var Q=window.QFX={
  init:function(el,opt){
    if(stage)return;opt=opt||{};if(opt.base)o.base=opt.base;if(opt.ver)o.ver=String(opt.ver);
    var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
    stage=el;stage.id="stage";
    stage.innerHTML='<div id="qcam"><div id="qshk"><div id="qscene"></div><div id="qglows"></div><canvas id="qfx"></canvas></div></div>';
    cam=stage.querySelector("#qcam");shk=stage.querySelector("#qshk");sceneEl=stage.querySelector("#qscene");glowEl=stage.querySelector("#qglows");cv=stage.querySelector("#qfx");
    cx=cv.getContext("2d");
    vig=document.createElement("div");vig.id="qvig";document.body.appendChild(vig);
    layout();addEventListener("resize",layout);
    document.addEventListener("visibilitychange",function(){if(!document.hidden&&running&&!raf)raf=requestAnimationFrame(frame)});
  },
  scene:function(name){
    if(!stage||curName===name)return;
    curName=name;cur=PRE[name]||{};
    sceneEl.style.background="linear-gradient(#0a0814,"+(cur.tint||"#1a1530")+")";
    var r=load(name);if(r.ok)reveal(name);else if(r.ok===null)r.cb.push(function(){reveal(name)});
    clearGlows();(cur.glows||[]).forEach(mkGlow);
    bursts=[];build(cur.parts);start();
    if(cur.push)push(cur.push);
  },
  preload:function(list){
    var q=(list||[]).slice();
    (function next(){var n=q.shift();if(!n)return;var r=load(n);var go=function(){setTimeout(next,350)};if(r.ok!==null)go();else r.cb.push(go)})();
  },
  vis:function(n){
    switch(n){
      case"hit":case"hurt":case"crit":case"storm":Q.shake(1);break;
      case"bad":Q.shake(.5);break;
      case"masks":case"seqwhisper":Q.glitch();break;
      case"divine":case"win":case"qchime":Q.holy();break;
      case"fire":Q.fire();break;
      case"bell":case"qclock":Q.pulse();break;
      case"dive":Q.dive();break;
      case"lose":Q.hurt();break;
      case"flee":Q.shake(.6);break;
      case"qbeat":Q.beat();break;
      case"qdoor":Q.open();break;
    }
  },
  shake:function(k){k=k||1;var a=6*k;anim(shk,[{transform:"translate(0,0)"},{transform:"translate("+(-a)+"px,"+(a*.5)+"px)"},{transform:"translate("+a+"px,"+(-a*.6)+"px)"},{transform:"translate("+(-a*.6)+"px,"+(-a*.3)+"px)"},{transform:"translate("+(a*.3)+"px,"+(a*.2)+"px)"},{transform:"translate(0,0)"}],{duration:420,easing:"ease-out"})},
  glitch:function(){anim(shk,[{filter:"none",transform:"none"},{filter:"hue-rotate(40deg) saturate(1.5)",transform:"translateX(-5px) skewX(1.5deg)"},{filter:"hue-rotate(-30deg)",transform:"translateX(6px)"},{filter:"none",transform:"translateX(-2px)"},{filter:"none",transform:"none"}],{duration:380})},
  flash:function(color){
    if(reduce)return;var d=document.createElement("div");d.className="qflash";d.style.background="radial-gradient(circle,"+(color||"#e8d49a")+"aa,transparent 70%)";document.body.appendChild(d);
    var a=anim(d,[{opacity:0},{opacity:.7,offset:.25},{opacity:0}],{duration:1300,easing:"ease-out"});setTimeout(function(){d.remove()},a?1350:50);
  },
  holy:function(){Q.flash("#e8d49a");mkBurst("spark",.5,.34,18)},
  fire:function(){Q.flash("#ff9a4a");mkBurst("ember",.5,.85,16)},
  pulse:function(){
    if(reduce)return;var d=document.createElement("div");d.className="qring";var s=Math.min(W,H)*.5;
    d.style.cssText+="left:"+(W/2-s/2)+"px;top:"+(H*.3-s/2)+"px;width:"+s+"px;height:"+s+"px";document.body.appendChild(d);
    var a=anim(d,[{transform:"scale(.2)",opacity:.5},{transform:"scale(2.6)",opacity:0}],{duration:1900,easing:"ease-out"});setTimeout(function(){d.remove()},a?1950:50);
  },
  dive:function(){anim(cam,[{transform:"scale(1)"},{transform:"scale(1.16)"},{transform:"scale(1)"}],{duration:1100,easing:"ease-in-out"})},
  beat:function(){anim(cam,[{transform:"scale(1)"},{transform:"scale(1.012)"},{transform:"scale(1)"},{transform:"scale(1.008)"},{transform:"scale(1)"}],{duration:620})},
  hurt:function(){if(!vig)return;vig.classList.add("red");Q.shake(.8);setTimeout(function(){vig.classList.remove("red")},1500)},
  mind:function(n){
    if(!vig)return;lowMind=n<=2;vig.classList.toggle("low",lowMind);
    if(shk)shk.style.filter=n<=1?"saturate(.72)":"";
  },
  lampsOff:function(cb){
    var L=glows.filter(function(g){return g.c.lamp});
    L.forEach(function(g,i){setTimeout(function(){g.el.classList.add("dim");if(cb)try{cb(i)}catch(e){}},300+i*330+Math.random()*200)});
  },
  open:function(){
    var b=glows.filter(function(g){return g.c.t==="beam"});
    b.forEach(function(g){g.el.style.animation="none";anim(g.el,[{transform:"scaleX(1)",opacity:.9},{transform:"scaleX(22)",opacity:.55}],{duration:2300,easing:"ease-in",fill:"forwards"})});
    Q.flash("#f3e2ae");mkBurst("spark",.5,.5,26);
  },
  burst:function(k,x,y,n){mkBurst(k,x,y,n||12)}
};
})();
