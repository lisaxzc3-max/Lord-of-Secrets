/* Повелитель Тайн — кат-сцена ульты (на весь экран, ~5 с). Сейчас: Провидец, женский герой («Игра теней»).
   LOTM_ULTCUT.preload() — подгрузить кадры; LOTM_ULTCUT.play({snd,title}) -> Promise (true, если сцена показана). */
(function(){
"use strict";
if(window.LOTM_ULTCUT)return;
var SRC=(document.currentScript&&document.currentScript.src)||"";
var BASE=SRC.replace(/[^\/]*$/,"").replace(/\?.*$/,"")+"f_seer/";
var VER="?v=u2";
var FW=540,FH=960,TOTAL=5200,NI=3;
/* опорные кадры: [время мс, ключ]; между кадрами одного клипа лежат промежуточные (посчитаны по потоку движения) */
var BASE_TL=[[0,"a01"],[260,"a02"],[520,"a03"],[760,"a04"],[960,"a05"],
 [1180,"c07"],[1290,"c08"],[1400,"c09"],[1510,"c10"],[1620,"c11"],[1740,"c12"],[1860,"c13"],[1980,"c14"],[2100,"c15"],[2210,"c16"],[2320,"c17"],[2430,"c18"],[2540,"c19"],
 [2860,"a07"],[3000,"a08"],[3120,"a09"],[3240,"a10"],[3360,"a11"],[3480,"a12"],
 [3620,"a13"],[3740,"a14"],[3860,"a15"],[3980,"a16"],
 [4080,"b24"],[4170,"b25"],[4260,"b26"],[4350,"b27"],[4440,"b28"],[4530,"b29"],[4620,"b30"]];
/* пары, между которыми есть промежуточные кадры */
var FLOW={a01:1,a02:1,a03:1,a04:1,c07:1,c08:1,c09:1,c10:1,c11:1,c12:1,c13:1,c14:1,c15:1,c16:1,c17:1,c18:1,a07:1,a08:1,a09:1,a10:1,a11:1,a12:1,a13:1,a14:1,a15:1,b24:1,b25:1,b26:1,b27:1,b28:1,b29:1};
var TL=[];
BASE_TL.forEach(function(r,i){
 TL.push(r);var nx=BASE_TL[i+1];
 if(nx&&FLOW[r[1]])for(var j=1;j<=NI;j++)TL.push([r[0]+(nx[0]-r[0])*j/(NI+1),r[1]+"_"+j]);
});
var KEYS=TL.map(function(r){return r[1]});
/* камера: [t, масштаб, центр x, центр y (доли кадра), поворот°] */
var CAM=[[0,1.04,.5,.46,0],[600,1.22,.5,.36,0],[960,2.35,.5,.21,0],[1180,1.0,.5,.5,0],[2540,1.14,.5,.5,0],
 [2600,2.35,.5,.21,0],[3100,1.06,.5,.46,0],[3300,1.12,.5,.5,-1.6],[3480,1.18,.5,.5,1.2],[3620,1.2,.52,.5,0],[3980,1.36,.56,.52,0],[4620,1.0,.5,.5,0],[5000,1.5,.5,.5,0]];
/* затемнение / виньетка (0..1) */
var DARK=[[0,0],[240,.06],[620,.3],[960,.46],[2400,.44],[2860,.1],[3100,0],[5200,0]];
var VIG=[[0,.3],[960,.85],[2540,.85],[3100,.4],[3980,.55],[5200,.55]];
/* вспышка в конце */
var FLASH=[[4540,0],[4800,1],[5200,0]];

var BM=null,loading=null,playing=false;
function ease(x){return x<0?0:x>1?1:x*x*(3-2*x)}
function eo(x){x=x<0?0:x>1?1:x;return 1-Math.pow(1-x,3)}
function interp(arr,t,col){
 if(t<=arr[0][0])return arr[0][col];
 for(var i=1;i<arr.length;i++){if(t<=arr[i][0]){var a=arr[i-1],b=arr[i],k=ease((t-a[0])/(b[0]-a[0]));return a[col]+(b[col]-a[col])*k}}
 return arr[arr.length-1][col];
}
/* кадры хранятся сжатыми (Blob), в память-картинку разворачиваются по ходу сцены, иначе на телефоне не хватит памяти */
function load(){
 if(loading)return loading;
 var out={};
 loading=Promise.all(KEYS.map(function(k){
  return fetch(BASE+k+".webp"+VER).then(function(r){return r.ok?r.blob():null}).then(function(b){if(b)out[k]=b}).catch(function(){});
 })).then(function(){BM=out;return out});
 return loading;
}
function css(){
 if(document.getElementById("ucCss"))return;
 var s=document.createElement("style");s.id="ucCss";
 s.textContent=".ucS{position:fixed;inset:0;z-index:2147483000;background:#000;touch-action:none;overflow:hidden;opacity:0;transition:opacity .22s}.ucS.on{opacity:1}"+
 ".ucS canvas{position:absolute;inset:0;width:100%;height:100%;display:block}"+
 ".ucT{position:absolute;left:0;right:0;bottom:15%;text-align:center;font:600 19px/1.3 Georgia,'Times New Roman',serif;letter-spacing:.14em;color:#ffe2a6;text-shadow:0 0 14px #ffb04a,0 0 30px #c2641b,0 2px 3px #000;opacity:0;transform:translateY(8px);pointer-events:none;text-transform:uppercase}"+
 ".ucT small{display:block;font-size:11px;letter-spacing:.4em;color:#d9b97a;margin-bottom:6px;opacity:.85}"+
 ".ucK{position:absolute;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));font:12px/1 system-ui,sans-serif;color:#ffffffaa;letter-spacing:.08em;padding:8px 12px;border:1px solid #ffffff33;border-radius:14px;background:#0008;opacity:0;transition:opacity .4s}"+
 ".ucS.sk .ucK{opacity:1}";
 document.head.appendChild(s);
}
/* карта таро, рисуем кодом */
function card(c,w,h,glow){
 c.save();
 var r=w*.09;
 c.shadowColor="rgba(255,190,90,"+(.55*glow)+")";c.shadowBlur=w*.5;
 var g=c.createLinearGradient(-w/2,-h/2,w/2,h/2);g.addColorStop(0,"#2a2034");g.addColorStop(1,"#120c1c");
 c.fillStyle=g;c.beginPath();
 c.moveTo(-w/2+r,-h/2);c.lineTo(w/2-r,-h/2);c.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);c.lineTo(w/2,h/2-r);c.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
 c.lineTo(-w/2+r,h/2);c.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);c.lineTo(-w/2,-h/2+r);c.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);c.closePath();c.fill();
 c.shadowBlur=0;c.lineWidth=Math.max(1,w*.045);c.strokeStyle="rgba(240,196,110,"+(.55+.4*glow)+")";c.stroke();
 c.lineWidth=Math.max(1,w*.02);c.strokeStyle="rgba(240,196,110,.45)";
 c.strokeRect(-w*.38,-h*.4,w*.76,h*.8);
 c.strokeStyle="rgba(255,214,130,"+(.6+.4*glow)+")";c.lineWidth=Math.max(1,w*.03);
 c.beginPath();for(var i=0;i<8;i++){var a=i*Math.PI/4,r1=w*.07,r2=w*.3;c.moveTo(Math.cos(a)*r1,Math.sin(a)*r1*1.3);c.lineTo(Math.cos(a)*r2,Math.sin(a)*r2*1.4)}c.stroke();
 c.beginPath();c.arc(0,0,w*.14,0,7);c.stroke();
 c.restore();
}
function play(o){
 o=o||{};
 if(playing)return Promise.resolve(false);
 playing=true;css();
 return Promise.race([load(),new Promise(function(r){setTimeout(r,3200)})]).then(function(){
  if(!BM||KEYS.some(function(k){return!BM[k]})){playing=false;return false}
  var ORD=KEYS,DEC={},DONE={},last=null;
  function dec(k){if(DEC[k]||!BM[k])return;DEC[k]=createImageBitmap(BM[k]).then(function(b){DONE[k]=b;return b},function(){DEC[k]=null})}
  function pump(i){for(var j=i;j<=i+9&&j<ORD.length;j++)dec(ORD[j]);for(var q=0;q<i-3;q++){var kk=ORD[q];if(DONE[kk]){try{DONE[kk].close&&DONE[kk].close()}catch(e){}delete DONE[kk]}}}
  function get(k){return DONE[k]||null}
  pump(0);
  return Promise.all(ORD.slice(0,8).map(function(k){return DEC[k]})).then(function(){return new Promise(function(done){
   var snd=o.snd||function(){};
   var root=document.createElement("div");root.className="ucS";
   var cv=document.createElement("canvas");root.appendChild(cv);
   var cap=document.createElement("div");cap.className="ucT";cap.innerHTML="<small>Откровение</small>"+(o.title||"Игра теней");root.appendChild(cap);
   var sk=document.createElement("div");sk.className="ucK";sk.textContent="Пропустить ›";root.appendChild(sk);
   document.body.appendChild(root);
   var W=window.innerWidth,H=window.innerHeight,dpr=Math.min(window.devicePixelRatio||1,(window.LOTM_Q==="high"?1.6:1.25));
   cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
   var c=cv.getContext("2d"),CW=cv.width,CH=cv.height,cover=Math.max(CW/FW,CH/FH);
   /* зерно плёнки */
   var gr=document.createElement("canvas");gr.width=gr.height=96;var gc=gr.getContext("2d"),gd=gc.createImageData(96,96);
   for(var i=0;i<gd.data.length;i+=4){var v=Math.random()*255;gd.data[i]=gd.data[i+1]=gd.data[i+2]=v;gd.data[i+3]=26}
   gc.putImageData(gd,0,0);var gpat=c.createPattern(gr,"repeat");
   /* частицы-карты: бросок */
   var P=[];for(var n=0;n<16;n++){
    var sp=.55+Math.random()*.9,an=(-0.9+Math.random()*1.8);
    P.push({t0:3640+n*34+Math.random()*30,life:760+Math.random()*340,x0:.62,y0:.44,ax:an,sp:sp,rot:(Math.random()-.5)*8,sz:.06+Math.random()*.05,seed:Math.random()*6});
   }
   /* искры */
   var SP=[];for(var s=0;s<46;s++)SP.push({t0:900+Math.random()*3800,x:Math.random(),y:Math.random(),v:.02+Math.random()*.05,r:.6+Math.random()*1.8,ph:Math.random()*6});
   var t0=0,skipped=0,fin=false,raf=0,snds={};
   function fire(k,t,cb){if(!snds[k]&&t>=k){snds[k]=1;cb()}}
   function finish(){
    if(fin)return;fin=true;cancelAnimationFrame(raf);
    root.classList.remove("on");setTimeout(function(){root.remove();playing=false;done(true)},230);
   }
   function frame(now){
    if(!t0)t0=now;var t=now-t0;
    if(skipped)t=Math.max(t,4560+(now-skipped));
    if(t>=TOTAL){finish();return}
    var u=0;for(;u<TL.length-1&&t>=TL[u+1][0];u++);
    pump(u);
    var A=get(TL[u][1])||last,B=u<TL.length-1?get(TL[u+1][1]):null;
    if(A)last=A;
    var mix=B?Math.min(1,Math.max(0,(t-TL[u][0])/(TL[u+1][0]-TL[u][0]))):0;
    var S=interp(CAM,t,1),cx=interp(CAM,t,2),cy=interp(CAM,t,3),rot=interp(CAM,t,4);
    /* дрожь при броске и вспышке */
    var sh=0;if(t>3700&&t<3900)sh=(3900-t)/200*5;if(t>4560)sh=Math.max(sh,6*Math.min(1,(t-4560)/160));
    /* прыжок: подъём и возврат */
    var jy=0;if(t>3000&&t<3560){var jj=(t-3000)/560;jy=-Math.sin(jj*Math.PI)*.045}
    var hw=CW/(2*S*cover)/FW,hh=CH/(2*S*cover)/FH;
    var px=Math.min(Math.max(cx,hw),1-hw),py=Math.min(Math.max(cy+jy,hh),1-hh);
    c.setTransform(1,0,0,1,0,0);c.fillStyle="#000";c.fillRect(0,0,CW,CH);
    c.save();c.translate(CW/2+(Math.random()-.5)*sh*dpr,CH/2+(Math.random()-.5)*sh*dpr);c.rotate(rot*Math.PI/180);c.scale(S*cover,S*cover);c.translate(-px*FW,-py*FH);
    c.globalAlpha=1;if(A)c.drawImage(A,0,0,FW,FH);
    if(B&&mix>0){c.globalAlpha=mix;c.drawImage(B,0,0,FW,FH);c.globalAlpha=1}
    /* карты-частицы, они в системе кадра */
    P.forEach(function(p){
     var k=(t-p.t0)/p.life;if(k<=0||k>=1)return;
     var e=k*k*(1.8-.8*k);
     var x=p.x0+p.ax*.55*e+Math.sin(k*5+p.seed)*.02,y=p.y0+(.5-p.y0)*e*.9-.12*Math.sin(k*Math.PI)*p.sp;
     var sc=.3+e*(3.2*p.sp);
     c.save();c.translate(x*FW,y*FH);
     c.rotate(p.rot*e+Math.sin(p.seed)*.5);c.globalAlpha=Math.min(1,k*6)*(1-Math.max(0,(k-.8)/.2));
     card(c,p.sz*FW*sc,p.sz*FW*sc*1.62,.4+e*.6);c.restore();
    });
    c.restore();
    c.globalAlpha=1;
    /* искры золотой пыли */
    c.save();c.globalCompositeOperation="lighter";
    SP.forEach(function(q){
     var k=(t-q.t0)/1700;if(k<0||k>1)return;
     var a=Math.sin(k*Math.PI)*.55,x=(q.x+Math.sin(q.ph+k*3)*.03)*CW,y=(q.y-q.v*k*8)*CH;
     c.globalAlpha=a;c.fillStyle="#ffcf84";c.beginPath();c.arc(x,y,q.r*dpr*1.3,0,7);c.fill();
    });
    /* свечение финала: лучи и ореол вокруг карты */
    if(t>4040){
     var gk=ease((t-4040)/600),cxp=CW*.52,cyp=CH*.6;
     var g=c.createRadialGradient(cxp,cyp,0,cxp,cyp,CW*(.5+.6*gk));
     g.addColorStop(0,"rgba(255,214,140,"+(.5*gk)+")");g.addColorStop(.5,"rgba(255,150,60,"+(.18*gk)+")");g.addColorStop(1,"rgba(0,0,0,0)");
     c.globalAlpha=1;c.fillStyle=g;c.fillRect(0,0,CW,CH);
     c.strokeStyle="rgba(255,226,160,"+(.22*gk)+")";c.lineWidth=dpr*1.5;
     for(var r=0;r<14;r++){var an=r*Math.PI/7+t*.0004,l1=CW*.18,l2=CW*(.5+.9*gk);c.beginPath();c.moveTo(cxp+Math.cos(an)*l1,cyp+Math.sin(an)*l1);c.lineTo(cxp+Math.cos(an)*l2,cyp+Math.sin(an)*l2);c.stroke()}
    }
    c.restore();
    /* затемнение и виньетка */
    var d=interp(DARK,t,1),vg=interp(VIG,t,1);
    if(d>0){c.globalAlpha=d;c.fillStyle="#04020a";c.fillRect(0,0,CW,CH);c.globalAlpha=1}
    var vr=c.createRadialGradient(CW/2,CH*.46,Math.min(CW,CH)*.18,CW/2,CH*.5,Math.max(CW,CH)*.72);
    vr.addColorStop(0,"rgba(0,0,0,0)");vr.addColorStop(1,"rgba(2,0,8,"+(.88*vg)+")");c.fillStyle=vr;c.fillRect(0,0,CW,CH);
    /* зерно */
    c.save();c.translate(-Math.random()*96,-Math.random()*96);c.fillStyle=gpat;c.globalAlpha=1;c.fillRect(0,0,CW+96,CH+96);c.restore();
    /* вспышка */
    var fl=interp(FLASH,t,1);if(fl>0){c.globalAlpha=Math.min(1,fl);c.fillStyle="#fff1d2";c.fillRect(0,0,CW,CH);c.globalAlpha=1}
    /* подпись */
    var ck=ease((t-4140)/300)*(1-ease((t-4720)/260));cap.style.opacity=ck;cap.style.transform="translateY("+(8-8*ck)+"px)";
    /* звуки */
    if(!skipped){fire(10,t,function(){snd("bcast")});fire(1180,t,function(){snd("bbuff")});fire(2860,t,function(){snd("bdash")});fire(3640,t,function(){snd("bcards")});fire(3760,t,function(){snd("bcards")})}fire(4560,t,function(){snd("hit")});
    if(t>1300)root.classList.add("sk");
    raf=requestAnimationFrame(frame);
   }
   root.addEventListener("pointerdown",function(){if(!skipped&&t0&&performance.now()-t0>600)skipped=performance.now()});
   requestAnimationFrame(function(){root.classList.add("on");raf=requestAnimationFrame(frame)});
  })});
 });
}
window.LOTM_ULTCUT={preload:load,play:play,total:TOTAL};
})();
