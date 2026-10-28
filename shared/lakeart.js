/* Живые иллюстрации озера: мягкое дыхание, покачивание, рябь воды и туман. Без бликов и искр. */
(function(){
"use strict";
var reduce=false;try{reduce=(window.__mm||matchMedia)("(prefers-reduced-motion:reduce)").matches}catch(_){}
var items=[],running=false,last=0;
function kindOf(src){src=String(src||"");
 if(/serpent2/.test(src))return"serpent2";if(/serpent/.test(src))return"serpent";if(/drowned/.test(src))return"drowned";
 if(/toad/.test(src))return"toad";if(/frog/.test(src))return"frog";if(/chest/.test(src))return"chest";return"";}
function ss(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
/* смещение строки: x в долях ширины, y в долях высоты */
function rowOff(k,y,t){
 var o=0;
 if(k==="drowned"){o=Math.sin(t*.8+y*5)*.004*ss(.1,.7,y)*(1-ss(.76,.8,y));if(y>.78)o+=Math.sin(t*1.5+y*60)*.007*ss(.78,1,y)}
 else if(k==="serpent"||k==="serpent2"){var p=k==="serpent2",a=p?.03:.02,sp=p?1.25:.7;
  o=Math.sin(t*sp)*a*Math.pow(Math.max(0,1-y/.86),1.6);if(y>.85)o+=Math.sin(t*1.7+y*55)*.006*ss(.85,1,y)}
 else if(k==="frog"){o=Math.sin(t*.6+y*4)*.003*ss(.4,.7,y)*(1-ss(.82,.88,y));if(y>.88)o+=Math.sin(t*1.2+y*50)*.005*ss(.88,1,y)}
 else if(k==="chest"){if(y>.68)o+=Math.sin(t*1.3+y*45)*.008*ss(.68,1,y)}
 return o}
function draw(it,t){
 var img=it.img,c=it.c,g=it.g;
 if(!img.complete||!img.naturalWidth||img.offsetWidth===0||img.classList.contains("hidden")){c.style.display="none";return}
 var k=kindOf(img.getAttribute("src")||img.currentSrc);if(!k){c.style.display="none";return}
 c.style.display="block";
 var w=img.offsetWidth,h=img.offsetHeight,dpr=Math.min(devicePixelRatio||1,2);
 c.style.left=img.offsetLeft+"px";c.style.top=img.offsetTop+"px";c.style.width=w+"px";c.style.height=h+"px";
 var cs=getComputedStyle(img);c.style.borderRadius=cs.borderRadius;
 var W=Math.round(w*dpr),H=Math.round(h*dpr);if(c.width!==W||c.height!==H){c.width=W;c.height=H}
 g.imageSmoothingQuality="high";g.clearRect(0,0,W,H);
 var iw=img.naturalWidth,ih=img.naturalHeight,N=64;
 var br=1+.008*Math.sin(t*1.2);
 var bob=k==="chest"?Math.sin(t*.9)*.012:(k==="frog"?Math.sin(t*.7)*.004:0);
 g.save();
 /* дыхание: масштаб от нижней середины */
 g.translate(W/2,H*(.98+bob));g.scale(br,br);g.translate(-W/2,-H*.98);
 for(var i=0;i<N;i++){
  var y0=i/N,y1=(i+1)/N,ym=(y0+y1)/2;
  var off=rowOff(k,ym,t),sx=0,sw=iw,dx=off*W,dw=W;
  if(k==="toad"&&ym>.4&&ym<.82){var s=1+.016*Math.sin(t*1.3)*Math.sin((ym-.4)/.42*Math.PI);dx=(W-W*s)/2;dw=W*s}
  g.drawImage(img,sx,y0*ih,sw,(y1-y0)*ih+1,dx,y0*H,dw,(y1-y0)*H+1.5);
 }
 g.restore();
 /* туман */
 for(var m=0;m<3;m++){
  var sp=.012+m*.006,x=(((t*sp+m*.37)%1.5)-.25)*W,y=H*(.62+m*.1),r=H*(.42+m*.1);
  var gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,"rgba(150,170,165,.16)");gr.addColorStop(1,"rgba(150,170,165,0)");
  g.fillStyle=gr;g.fillRect(0,0,W,H);
 }
 /* круги на воде у сундука */
 if(k==="chest"){
  g.lineWidth=Math.max(1,W*.006);
  for(var q=0;q<3;q++){var u=((t*.22+q/3)%1),a=(1-u)*.09;
   g.strokeStyle="rgba(150,180,170,"+a.toFixed(3)+")";g.beginPath();g.ellipse(W*.5,H*.7,W*(.2+u*.3),H*(.05+u*.08),0,0,6.283);g.stroke()}
 }
}
function loop(now){
 requestAnimationFrame(loop);
 if(document.hidden)return;
 if(now-last<33)return;last=now;
 var t=reduce?0:now/1000;
 for(var i=0;i<items.length;i++)draw(items[i],t);
}
function attach(img){
 if(!img||img.__lakeart)return;img.__lakeart=1;
 var p=img.offsetParent||img.parentElement;
 var c=document.createElement("canvas");c.style.cssText="position:absolute;pointer-events:none;display:none;z-index:1";
 img.parentNode.insertBefore(c,img.nextSibling);
 img.style.opacity="0";
 var it={img:img,c:c,g:c.getContext("2d")};items.push(it);
 if(!running){running=true;requestAnimationFrame(loop)}
}
window.LakeArt={attach:attach};
})();
