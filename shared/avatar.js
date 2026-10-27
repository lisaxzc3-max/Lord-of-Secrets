/* Портреты путей: подмена старых svg-аватаров мужчин на арт и лёгкая анимация на крупных показах.
   Работает сам: следит за <img src=".../avatars/m_(seer|sailor|hunter)[8].svg"> во всей странице. */
(function(){
"use strict";
var RE=/(^|\/)avatars\/m_(seer|sailor|hunter)8?\.svg(\?.*)?$/;
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
var phone=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent||"");
var N=1254;
/* точки в исходной картинке 1254x1254 */
var CFG={
 hunter:{eyes:[[525,345],[712,345]],rgb:"255,70,45",gl:.30,rune:[620,135]},
 sailor:{eyes:[[527,382],[712,382]],rgb:"80,170,255",gl:.30,drips:[[565,725],[665,742]],
   bolt:[[330,385],[290,470],[230,540],[255,590],[170,650],[120,700],[60,760]]},
 seer:{eyes:[[768,392]],rgb:"190,110,255",gl:.34,card:[240,480]}
};
var items=[],run=false,last=0,T=0,io=null;
function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function glow(g,x,y,r,rgb,a){var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,"rgba("+rgb+","+a+")");q.addColorStop(1,"rgba("+rgb+",0)");g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()}
function swap(img){
  if(img.dataset.avFail)return;var s=img.getAttribute("src")||"",m=RE.exec(s);if(!m)return;
  var key=/m_(seer|sailor|hunter)/.exec(s)[1];
  var ns=s.replace(/avatars\/m_(seer|sailor|hunter)8?\.svg/,"avatars/p_$1.webp");
  img.dataset.av=key;img.dataset.avOld=s;
  img.addEventListener("error",function f(){img.removeEventListener("error",f);delete img.dataset.av;img.dataset.avFail="1";img.src=img.dataset.avOld},{once:true});
  img.src=ns;
}
function attach(img){
  var key=img.dataset.av;if(!key||img._avFx||!img.parentNode)return;
  var w=img.offsetWidth,h=img.offsetHeight;if(w<80||h<80)return;
  var p=img.parentNode;if(getComputedStyle(p).position==="static")p.style.position="relative";
  var cv=document.createElement("canvas");cv.className="avFx";cv.style.cssText="position:absolute;pointer-events:none;z-index:1";
  p.appendChild(cv);img._avFx={cv:cv,g:cv.getContext("2d"),key:key,vis:true,seed:Math.random()*100,bolt:-9};
  img._avFx.img=img;items.push(img._avFx);
  if(io)io.observe(cv);cv._it=img._avFx;
  place(img._avFx);start();
}
function place(it){
  var im=it.img,cv=it.cv;if(!im.isConnected){return}
  var w=im.offsetWidth,h=im.offsetHeight;if(w<2||h<2)return;
  cv.style.left=im.offsetLeft+"px";cv.style.top=im.offsetTop+"px";cv.style.width=w+"px";cv.style.height=h+"px";
  var d=Math.min(window.devicePixelRatio||1,2),W=Math.round(w*d),H=Math.round(h*d);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
}
function draw(it,T){
  var cv=it.cv,g=it.g,c=CFG[it.key],W=cv.width,H=cv.height;if(!c||W<2)return;
  g.clearRect(0,0,W,H);
  var fit=getComputedStyle(it.img).objectFit,sc=fit==="contain"?Math.min(W,H)/N:Math.max(W,H)/N,
      ox=(W-N*sc)/2,oy=(H-N*sc)/2;
  function P(x,y){return [ox+x*sc,oy+y*sc]}
  var t=T+it.seed;
  g.globalCompositeOperation="lighter";
  var gl=c.gl+.08*Math.sin(t*.8)+.04*Math.sin(t*1.9);
  c.eyes.forEach(function(e){var p=P(e[0],e[1]);glow(g,p[0],p[1],N*sc*.075,c.rgb,gl)});
  var S=N*sc;
  if(it.key==="hunter"){
    var rp=P(c.rune[0],c.rune[1]);glow(g,rp[0],rp[1],S*.12,"255,60,40",.10+.07*Math.sin(t*.6));
    for(var i=0;i<16;i++){
      var u=((rnd(i)+t*(.035+rnd(i+7)*.04))%1),x=P(rnd(i+3)*N,0)[0]+Math.sin(t*.9+i)*S*.015,y=H-u*H*1.05;
      g.fillStyle="rgba(255,"+(120+rnd(i+9)*80|0)+",50,"+(.75*Math.sin(u*3.1416))+")";
      g.beginPath();g.arc(x,y,S*.003*(.6+rnd(i+11)),0,6.2832);g.fill()}
  }else if(it.key==="sailor"){
    /* молния: редкая, плавно гаснет */
    if(t-it.bolt>7+rnd(Math.floor(t/7))*4){it.bolt=t}
    var f=t-it.bolt;
    if(f<1.4){
      var a=f<.12?f/.12:Math.max(0,1-(f-.12)/1.25);
      g.strokeStyle="rgba(140,200,255,"+(.9*a)+")";g.lineWidth=Math.max(1.5,S*.004);g.lineJoin="round";
      g.shadowColor="rgba(80,160,255,"+a+")";g.shadowBlur=S*.03;
      g.beginPath();c.bolt.forEach(function(b,i){var p=P(b[0],b[1]);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke();g.shadowBlur=0;
      var gp=P(150,520);glow(g,gp[0],gp[1],S*.28,"70,140,255",.10*a)
    }
    /* дождь */
    g.strokeStyle="rgba(170,205,255,.22)";g.lineWidth=Math.max(1,S*.0012);
    for(var j=0;j<22;j++){var v=((rnd(j)+t*.7)%1),rx=rnd(j+5)*W,ry=v*H*1.2-H*.1;g.beginPath();g.moveTo(rx,ry);g.lineTo(rx-S*.01,ry+S*.035);g.stroke()}
  }else{
    var cp=P(c.card[0],c.card[1]);glow(g,cp[0],cp[1],S*.13,"180,100,255",.14+.09*Math.sin(t*.7));
    for(var k=0;k<6;k++){
      var w2=((rnd(k)+t*.025)%1),sx=P(40+rnd(k+3)*260,0)[0]+Math.sin(t*.5+k*1.7)*S*.025,sy=H*(.85-w2*.8);
      glow(g,sx,sy,S*.08,"150,80,230",.10*Math.sin(w2*3.1416))}
  }
  g.globalCompositeOperation="source-over";
  if(it.key==="sailor"){
    g.fillStyle="rgba(200,225,255,.7)";
    (c.drips||[]).forEach(function(d,i){var q=((i*.4+t*.2)%1);if(q>.6)return;var p=P(d[0],d[1]);
      g.globalAlpha=1-q/.6;g.beginPath();g.ellipse(p[0],p[1]+q*S*.12,S*.003,S*.006+q*S*.008,0,0,6.2832);g.fill()});
    g.globalAlpha=1}
}
function loop(now){
  if(!run)return;
  if(document.hidden){run=false;return}
  var step=phone?40:20;
  if(now-last>=step){var dt=Math.min(.1,(now-last)/1000);last=now;if(!reduce)T+=dt;
    var any=false;
    for(var i=items.length-1;i>=0;i--){var it=items[i];
      if(!it.img.isConnected||!it.cv.isConnected){items.splice(i,1);continue}
      if(!it.vis)continue;any=true;place(it);draw(it,T)}
    if(!items.length){run=false;return}
  }
  requestAnimationFrame(loop);
}
function start(){if(run||!items.length)return;if(reduce){items.forEach(function(it){place(it);draw(it,2)});return}run=true;last=performance.now();requestAnimationFrame(loop)}
try{io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.target._it)e.target._it.vis=e.isIntersecting});start()},{threshold:0})}catch(e){}
document.addEventListener("visibilitychange",function(){if(!document.hidden)start()});
function scan(root){
  var l=root.querySelectorAll?root.querySelectorAll("img"):[];
  if(root.tagName==="IMG")swap(root);
  for(var i=0;i<l.length;i++)swap(l[i]);
}
function tryAttach(img){
  if(!img.dataset.av||img._avFx)return;
  if(img.complete&&img.naturalWidth)attach(img);
  else img.addEventListener("load",function(){attach(img)},{once:true});
}
function sweep(root){
  var l=(root.querySelectorAll?root.querySelectorAll("img[data-av]"):[]);
  if(root.tagName==="IMG"&&root.dataset.av)tryAttach(root);
  for(var i=0;i<l.length;i++)tryAttach(l[i]);
}
function init(){
  scan(document);sweep(document);
  new MutationObserver(function(ms){
    ms.forEach(function(m){
      if(m.type==="attributes"){swap(m.target);tryAttach(m.target)}
      else m.addedNodes.forEach(function(n){if(n.nodeType===1){scan(n);sweep(n)}})
    })
  }).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["src"]});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
