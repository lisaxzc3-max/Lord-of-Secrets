/* Оживление арта события у озера (царевна-жаба, сундук в омуте): canvas поверх картинки. */
(function(){
"use strict";
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
var phone=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent||"");
var S={cv:null,g:null,img:null,wrap:null,kind:null,vis:true,run:false,T:0,last:0};
function ss(a,b,x){x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)}
function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function size(){
  var cv=S.cv,im=S.img,w=S.wrap;if(!cv||!im||!w)return;
  var a=im.getBoundingClientRect(),b=w.getBoundingClientRect();
  cv.style.left=(a.left-b.left)+"px";cv.style.top=(a.top-b.top)+"px";cv.style.width=a.width+"px";cv.style.height=a.height+"px";
  var d=Math.min(window.devicePixelRatio||1,2),W=Math.max(2,Math.round(a.width*d)),H=Math.max(2,Math.round(a.height*d));
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
}
function ensure(wrap,img){
  if(S.cv&&S.wrap===wrap){S.img=img;return}
  S.wrap=wrap;S.img=img;
  var cv=document.createElement("canvas");cv.className="sceneFx";
  cv.style.cssText="position:absolute;pointer-events:none;z-index:2;display:none";
  wrap.appendChild(cv);S.cv=cv;S.g=cv.getContext("2d");
  try{new ResizeObserver(size).observe(wrap)}catch(e){}
  try{new IntersectionObserver(function(e){S.vis=e[0].isIntersecting;if(S.vis)start()},{threshold:0}).observe(cv)}catch(e){}
  document.addEventListener("visibilitychange",function(){if(!document.hidden)start()});
}
function glow(g,x,y,r,rgb,a){var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,"rgba("+rgb+","+a+")");q.addColorStop(1,"rgba("+rgb+",0)");g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()}
function star(g,x,y,r,a){
  g.save();g.translate(x,y);g.globalAlpha=a;g.fillStyle="rgba(255,245,215,1)";
  g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*.09,-r*.09,r,0);g.quadraticCurveTo(r*.09,r*.09,0,r);g.quadraticCurveTo(-r*.09,r*.09,-r,0);g.quadraticCurveTo(-r*.09,-r*.09,0,-r);g.fill();g.restore();
}
function mist(g,W,H,T){
  var mx=((T*.012)%1.3-.15)*W,q=g.createRadialGradient(mx,H*.97,0,mx,H*.97,W*.55);
  q.addColorStop(0,"rgba(170,185,190,.13)");q.addColorStop(1,"rgba(170,185,190,0)");g.fillStyle=q;g.fillRect(0,H*.5,W,H*.5);
}
var KIND={
 frog:{
  w:1122,h:1402,pos:.12,breath:[.010,.018],
  draw:function(g,W,H,T,P,s){
    g.globalCompositeOperation="lighter";
    var gl=.30+.08*Math.sin(T*.8)+.04*Math.sin(T*1.9);
    [[445,290],[700,282]].forEach(function(e){var p=P(e[0],e[1]);glow(g,p[0],p[1],W*.14,"255,185,60",gl)});
    mist(g,W,H,T);
    /* блик жемчужины */
    var k=Math.max(0,Math.sin(T*.9));k=k*k*k*k;var pp=P(565,112);
    if(k>.02){glow(g,pp[0],pp[1],W*.08,"255,250,235",.35*k);star(g,pp[0],pp[1],W*.06*(.5+k),k)}
    g.globalAlpha=1;g.globalCompositeOperation="source-over";
    /* капли с волос и подбородка */
    [[296,640],[262,430],[835,560],[748,470],[560,300]].forEach(function(d,i){
      var p=((i*.31+T*.2)%1);if(p>.6)return;var q=P(d[0],d[1]),y=q[1]+p*H*.22;
      g.fillStyle="rgba(205,235,225,"+(.75*(1-p/.6))+")";g.beginPath();g.ellipse(q[0],y,W*.005,W*.009+p*W*.012,0,0,6.2832);g.fill()});
  }
 },
 chest:{
  w:1254,h:1254,pos:0,breath:[0,0],sway:true,
  draw:function(g,W,H,T,P,s){
    g.globalCompositeOperation="lighter";
    /* луч света сверху */
    var a=.07+.035*Math.sin(T*.5)+.02*Math.sin(T*1.3),x0=P(520,0)[0];
    var lg=g.createLinearGradient(0,0,0,H*.7);lg.addColorStop(0,"rgba(120,225,210,"+a+")");lg.addColorStop(1,"rgba(120,225,210,0)");
    g.fillStyle=lg;g.beginPath();g.moveTo(x0-W*.05,0);g.lineTo(x0+W*.07,0);g.lineTo(x0+W*.2+Math.sin(T*.4)*W*.02,H*.7);g.lineTo(x0-W*.12,H*.7);g.closePath();g.fill();
    /* блики монет */
    [[640,655],[722,672],[800,692],[885,708],[606,650],[760,640]].forEach(function(c,i){
      var k=Math.max(0,Math.sin(T*1.25+i*1.9));k=Math.pow(k,6);var p=P(c[0],c[1]);
      glow(g,p[0],p[1],W*.07,"255,200,80",.16+.30*k);if(k>.05)star(g,p[0],p[1],W*.035*(.4+k),k*.95)});
    /* взвесь */
    g.fillStyle="rgba(200,235,230,.5)";
    for(var i=0;i<26;i++){
      var px=(rnd(i)*W+Math.sin(T*.25+i)*W*.02+T*W*.004*(rnd(i+9)-.3))%W;if(px<0)px+=W;
      var py=((rnd(i+40)*H-T*H*.012*(.5+rnd(i+3)))%H+H)%H,r=W*.0022*(.5+rnd(i+70)),tw=.15+.3*Math.abs(Math.sin(T*.7+i));
      g.globalAlpha=tw;g.beginPath();g.arc(px,py,r,0,6.2832);g.fill()}
    g.globalAlpha=1;g.globalCompositeOperation="source-over";
    /* пузыри из-под крышки */
    for(var j=0;j<12;j++){
      var u=((j*.083+T*(.05+rnd(j)*.04))%1),o=P(500+rnd(j+5)*400,420),
          x=o[0]+Math.sin(T*1.1+j*2.3)*W*.012*(1+u*2),y=o[1]-u*(o[1]+H*.05),r=W*(.0045+rnd(j+20)*.007)*(.7+u*.6);
      var al=ss(0,.08,u)*(1-ss(.8,1,u));
      g.globalAlpha=al*.8;g.strokeStyle="rgba(205,240,235,.9)";g.lineWidth=Math.max(1,W*.0018);g.beginPath();g.arc(x,y,r,0,6.2832);g.stroke();
      g.fillStyle="rgba(255,255,255,.7)";g.beginPath();g.arc(x-r*.35,y-r*.35,r*.22,0,6.2832);g.fill()}
    g.globalAlpha=1;
  }
 }
};
function draw(){
  var g=S.g,K=KIND[S.kind],cv=S.cv;if(!g||!K)return;
  var W=cv.width,H=cv.height,T=S.T;g.clearRect(0,0,W,H);
  var s=W/K.w,off=(K.h*s-H)*K.pos;
  function P(x,y){return [x*s,y*s-off]}
  var b=(Math.sin(T*1.4)+1)/2;
  if(S.img){
    if(K.sway)S.img.style.transform="scale("+(1.035+.01*Math.sin(T*.35)).toFixed(4)+") translate("+(Math.sin(T*.3)*.6).toFixed(2)+"px,"+(Math.cos(T*.23)*.5).toFixed(2)+"px)";
    else S.img.style.transform="scale("+(1+K.breath[0]*b*.9).toFixed(4)+","+(1+K.breath[1]*b*1.6).toFixed(4)+")";
  }
  K.draw(g,W,H,T,P,s);
}
function loop(now){
  if(!S.run)return;
  if(document.hidden||!S.vis||!S.kind){S.run=false;return}
  var step=phone?33:16;
  if(now-S.last>=step){var dt=Math.min(.1,(now-S.last)/1000);S.last=now;if(!reduce)S.T+=dt;draw()}
  requestAnimationFrame(loop);
}
function start(){if(S.run||!S.kind||reduce&&S.T>0)return;if(reduce){size();draw();return}S.run=true;S.last=performance.now();requestAnimationFrame(loop)}
function kindOf(src){var m=/e-(frog|chest)\.webp/.exec(String(src||""));return m?m[1]:null}
window.LOTM_SCENE={
  sync:function(wrap,img){
    try{
      if(!wrap||!img)return;ensure(wrap,img);var k=kindOf(img.src);
      if(!k){S.kind=null;S.cv.style.display="none";img.style.transform="";img.style.objectPosition="";return}
      S.kind=k;S.T=0;S.cv.style.display="block";
      img.style.transformOrigin=k==="frog"?"50% 100%":"50% 50%";img.style.objectPosition="50% "+(KIND[k].pos*100)+"%";
      size();start();if(reduce)draw();
    }catch(e){}
  },
  off:function(){S.kind=null;if(S.cv)S.cv.style.display="none";if(S.img){S.img.style.transform="";S.img.style.objectPosition=""}}
};
})();
