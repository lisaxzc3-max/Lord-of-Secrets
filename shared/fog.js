/* Анимированный туман для главной: два слоя (под карточками и лёгкая дымка поверх). Всё рисуется кодом. */
(function(){
"use strict";
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
var LOW=false;try{LOW=(navigator.deviceMemory&&navigator.deviceMemory<=3)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)}catch(e){} /* слабое устройство: меньше частиц и кадров */
var SC=.5; /* половинное разрешение — мягкий туман, дёшево для телефона */
function mk(z,op){var c=document.createElement("canvas");c.style.cssText="position:fixed;inset:0;width:100%;height:100%;z-index:"+z+";pointer-events:none;opacity:"+op;document.body.insertBefore(c,document.body.firstChild);return c}
function sprite(rgb){
 var c=document.createElement("canvas");c.width=c.height=256;var g=c.getContext("2d");
 var r=g.createRadialGradient(128,128,0,128,128,128);
 r.addColorStop(0,"rgba("+rgb+",.55)");r.addColorStop(.45,"rgba("+rgb+",.22)");r.addColorStop(1,"rgba("+rgb+",0)");
 g.fillStyle=r;g.fillRect(0,0,256,256);return c;
}
var TINT=[sprite("150,130,210"),sprite("110,120,190"),sprite("190,160,120"),sprite("120,90,170")];
var layers=[{c:null,z:0,o:1,p:[],n:14,sp:[.12,.35],sz:[300,560],al:[.5,1],yr:[.05,1]},{c:null,z:2,o:.28,p:[],n:6,sp:[.25,.55],sz:[360,640],al:[.25,.5],yr:[.55,1.05]}];
var W=0,H=0,t0=performance.now(),running=true;
function rnd(a,b){return a+Math.random()*(b-a)}
function size(){
 W=Math.ceil(innerWidth*SC);H=Math.ceil(innerHeight*SC);
 layers.forEach(function(L){L.c.width=W;L.c.height=H;L.x=L.c.getContext("2d")});
}
function seed(){
 layers.forEach(function(L){L.p=[];for(var i=0;i<(LOW?Math.ceil(L.n*.6):L.n);i++){
  L.p.push({x:rnd(-.2,1.2)*W,y:rnd(L.yr[0],L.yr[1])*H,s:rnd(L.sp[0],L.sp[1])*(Math.random()<.5?-1:1),z:rnd(L.sz[0],L.sz[1])*SC,a:rnd(L.al[0],L.al[1]),ph:rnd(0,6.28),pf:rnd(.15,.45),vy:rnd(.01,.05)*(Math.random()<.5?-1:1),img:TINT[(Math.random()*TINT.length)|0]})
 }});
}
function draw(now){
 var t=(now-t0)/1000;
 layers.forEach(function(L){
  var g=L.x;g.clearRect(0,0,W,H);
  L.p.forEach(function(p){
   if(!reduce){p.x+=p.s*.6;p.y+=Math.sin(t*p.pf+p.ph)*p.vy*8}
   var half=p.z;
   if(p.s>0&&p.x-half>W)p.x=-half;else if(p.s<0&&p.x+half<0)p.x=W+half;
   var pulse=.75+.25*Math.sin(t*p.pf+p.ph);
   g.globalAlpha=Math.min(1,p.a*pulse);
   g.drawImage(p.img,p.x-half,p.y-half,half*2,half*2);
  });
  g.globalAlpha=1;
 });
}
var last=0;
function loop(now){
 if(!running)return;
 if(now-last>(LOW?50:33)){last=now;draw(now)} /* ~30 fps, на слабых ~20 */
 requestAnimationFrame(loop);
}
function start(){
 if(!document.body){return document.addEventListener("DOMContentLoaded",start)}
layers.forEach(function(L){L.c=mk(L.z,L.o)});
 size();seed();draw(performance.now());
 if(!reduce)requestAnimationFrame(loop);
 addEventListener("resize",function(){size();seed();draw(performance.now())});
 document.addEventListener("visibilitychange",function(){running=!document.hidden;if(running&&!reduce)requestAnimationFrame(loop)});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
