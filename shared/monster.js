/* Оживление арта монстра в рамке боя: дыхание, свет глаз, капли, дымка. Подключается рядом с картинкой, прежние эффекты (вспышки, бросок) не ломает. */
(function(){
"use strict";
var K=1145,KH=1374,POSY=.1;
/* координаты в исходной картинке 1145x1374 */
var CFG={
 toad:{eyes:[[415,262],[722,262]],rgb:"255,175,45",gl:.24,drops:[[570,650]],breath:.022},
 drowned:{eyes:[[503,248],[625,248]],rgb:"90,225,255",gl:.32,drops:[[575,440],[330,700],[840,660]],breath:.014},
 snake:{eyes:[[478,232],[662,232]],rgb:"255,225,60",gl:.28,drops:[[160,520],[950,500],[215,640],[935,620]],breath:.018}
};
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
var phone=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent||"");
var S={cv:null,g:null,img:null,frame:null,cfg:null,key:null,vis:true,run:false,T:0,last:0,red:false};
function keyOf(src){var m=/m-(toad|drowned|snake)\.webp/.exec(String(src||""));return m?m[1]:null}
function size(){
  if(!S.cv)return;var r=S.cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
  var w=Math.max(2,Math.round(r.width*d)),h=Math.max(2,Math.round(r.height*d));
  if(S.cv.width!==w||S.cv.height!==h){S.cv.width=w;S.cv.height=h}
}
function ensure(frame,img){
  if(S.cv&&S.frame===frame)return;
  S.frame=frame;S.img=img;
  var cv=document.createElement("canvas");cv.className="monFx";
  cv.style.cssText="position:absolute;left:4px;top:4px;width:calc(100% - 8px);height:calc(100% - 8px);border-radius:10px;pointer-events:none;z-index:2;display:none";
  frame.appendChild(cv);S.cv=cv;S.g=cv.getContext("2d");
  try{new ResizeObserver(size).observe(cv)}catch(e){}
  try{new IntersectionObserver(function(e){S.vis=e[0].isIntersecting;if(S.vis)start()},{threshold:0}).observe(cv)}catch(e){}
  document.addEventListener("visibilitychange",function(){if(!document.hidden)start()});
}
function ss(a,b,x){x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)}
function draw(){
  var g=S.g,c=S.cfg,cv=S.cv;if(!g||!c)return;
  var W=cv.width,H=cv.height,T=S.T;g.clearRect(0,0,W,H);
  var s=W/K,off=(KH*s-H)*POSY,b=(Math.sin(T*1.4)+1)/2;
  /* дыхание: лёгкое растяжение картинки от нижнего края */
  if(S.img)S.img.style.transform="scale("+(1+c.breath*b*.9).toFixed(4)+","+(1+c.breath*b*1.6).toFixed(4)+")";
  g.globalCompositeOperation="lighter";
  var glow=c.gl+.10*Math.sin(T*.8)+.04*Math.sin(T*1.9),rgb=S.red?"255,70,40":c.rgb;
  c.eyes.forEach(function(p){
    var x=p[0]*s,y=p[1]*s-off,r=W*.17,q=g.createRadialGradient(x,y,0,x,y,r);
    q.addColorStop(0,"rgba("+rgb+","+glow+")");q.addColorStop(1,"rgba("+rgb+",0)");g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()});
  var mx=((T*.012)%1.3-.15)*W,q2=g.createRadialGradient(mx,H*.97,0,mx,H*.97,W*.5);
  q2.addColorStop(0,"rgba(160,170,180,.12)");q2.addColorStop(1,"rgba(160,170,180,0)");g.fillStyle=q2;g.fillRect(0,H*.5,W,H*.5);
  g.globalCompositeOperation="source-over";
  c.drops.forEach(function(d,i){
    var p=(i*.37+T*.26)%1;if(p>.55)return;
    var x=d[0]*s,y0=d[1]*s-off,y=y0+p*H*.24;if(y<0||y>H)return;
    g.fillStyle="rgba(210,235,225,"+(.8*(1-p/.55))+")";g.beginPath();g.ellipse(x,y,W*.006,W*.01+p*W*.012,0,0,6.2832);g.fill()});
}
function loop(now){
  if(!S.run)return;
  if(document.hidden||!S.vis||!S.cfg){S.run=false;return}
  var step=phone?33:16;
  if(now-S.last>=step){var dt=Math.min(.1,(now-S.last)/1000);S.last=now;if(!reduce)S.T+=dt;draw()}
  requestAnimationFrame(loop);
}
function start(){if(S.run||!S.cfg||reduce&&S.T>0)return;if(reduce){size();draw();return}S.run=true;S.last=performance.now();requestAnimationFrame(loop)}
/* вызвать после установки src у картинки противника */
window.LOTM_MON={
  sync:function(frame,img){
    try{
      var k=keyOf(img&&img.src);
      if(!frame||!img)return;
      ensure(frame,img);
      if(!k){S.cfg=null;S.key=null;S.cv.style.display="none";img.classList.remove("mon");img.style.transform="";img.style.objectPosition="";return}
      S.key=k;S.cfg=CFG[k];S.cv.style.display="block";S.T=0;
      img.classList.add("mon");img.style.objectPosition="50% "+(POSY*100)+"%";img.style.transformOrigin="50% 100%";
      size();start();if(reduce)draw();
    }catch(e){}
  },
  off:function(){S.cfg=null;S.key=null;if(S.cv)S.cv.style.display="none";if(S.img){S.img.classList.remove("mon");S.img.style.transform="";S.img.style.objectPosition=""}},
  red:function(on){S.red=!!on}
};
})();
