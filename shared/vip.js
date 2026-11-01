/* Повелитель Тайн — VIP: префиксы имён и рамки аватаров (1 = Посвящённый, 2 = Благословлённый); рамки — арты shared/art/vip */
(function(){
"use strict";
if(window.VIP)return;
var NAMES={1:"Посвящённый",2:"Благословлённый"};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var BASE=(function(){try{var s=document.currentScript&&document.currentScript.src;if(s)return s.replace(/[^\/]*(\?.*)?$/,"")+"art/vip/"}catch(e){}return "/shared/art/vip/"})();
var V="?v=1";function U(n){return "url("+BASE+n+".webp"+V+")"}
/* путь ворона вокруг рамки: 6 c, облёт 2–5.5 c; координаты в долях бокса ворона */
function ravenKF(){
 var W=.19,T=6,R=.37,o="",st=[];
 function pos(c){return ((c-W/2)/(1-W)*100).toFixed(2)+"%"}
 function row(t,img,x,y,fs,fx,fy){st.push({t:t,img:img,x:x,y:y,fs:fs,fx:fx,fy:fy})}
 var PY=.2,n=14,F0=2;
 row(0,"r1",.5,PY,0,.5,.13);row(.99,"r1",.5,PY,0,.5,.13);row(1,"r2",.5,PY,0,.5,.13);row(1.99,"r2",.5,PY,0,.5,.13);
 for(var i=0;i<=n;i++){
  var t=F0+i*.25,th=i/n*360,r=th*Math.PI/180,x=.5+R*Math.sin(r),y=.5-R*Math.cos(r);
  var left=th>110&&th<250,img=(i%2?"r4":"r3")+(left?"l":"");
  if(i===0){x=.5;y=PY-.02}
  if(i===n){img="r2";x=.5;y=PY}
  var fp=Math.min(1,i/10),fs=i<=10?.07:0;
  row(t,img,x,y,fs,.5+.2*fp,.13+.7*fp);
 }
 row(F0+n*.25+.01,"r2",.5,PY,0,.7,.83);row(5.99,"r2",.5,PY,0,.7,.83);row(6,"r1",.5,PY,0,.5,.13);
 o+="@keyframes vRv{";
 st.forEach(function(k){
  var pc=(k.t/T*100).toFixed(3)+"%";
  o+=pc+"{background-image:"+U(k.img)+","+U("fth")+";background-position:"+pos(k.x)+" "+pos(k.y)+","+((k.fx-.035)/.93*100).toFixed(1)+"% "+((k.fy-.035)/.93*100).toFixed(1)+"%;background-size:"+(W*100)+"% "+(W*100)+"%,"+(k.fs*100)+"% "+(k.fs*100)+"%}";
 });
 return o+"}";
}
var css=document.createElement("style");
css.textContent=
":where(.vF){position:relative}"+
".vF{border-radius:50%!important;overflow:visible!important}"+
".vF>img,.vF .avMini{border-radius:50%}"+
".vF::after{content:'';position:absolute;left:50%;top:50%;width:145.4%;aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none;z-index:3;background-repeat:no-repeat;background-size:100% 100%}"+
".vF1::after{background-image:"+U("f1")+";filter:drop-shadow(0 1px 3px #000a)}"+
".vF2::after{background-image:"+U("f2")+","+U("st1")+","+U("st2")+";background-position:center,15% 17%,87% 85%;background-size:100% 100%,0 0,0 0;animation:vGl 4.5s ease-in-out infinite,vTw 6s ease-in-out infinite}"+
"@keyframes vGl{0%,100%{filter:drop-shadow(0 0 3px #ffd98a88) brightness(1)}50%{filter:drop-shadow(0 0 9px #c9a0ffcc) brightness(1.14)}}"+
"@keyframes vTw{0%,100%{background-size:100% 100%,0 0,0 0}20%{background-size:100% 100%,14% 14%,0 0}40%{background-size:100% 100%,0 0,0 0}60%{background-size:100% 100%,0 0,11% 11%}80%{background-size:100% 100%,0 0,0 0}}"+
".vF2::before{content:'';position:absolute;left:50%;top:50%;width:196.4%;aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none;z-index:4;background-repeat:no-repeat;background-image:"+U("r1")+";background-position:50% 12%;background-size:19% 19%;filter:drop-shadow(0 0 1.5px #d9b8ff) drop-shadow(0 0 5px #8a5cffcc);animation:vRv 6s linear infinite}"+
".vF2:nth-child(2n)::before{animation-delay:-2s}.vF2:nth-child(3n)::before{animation-delay:-4s}"+
ravenKF()+
".vF2::before{animation-duration:6s!important;animation-iteration-count:infinite!important}"+
".vF2:nth-child(2n)::before{animation-delay:-2s!important}.vF2:nth-child(3n)::before{animation-delay:-4s!important}"+
".vF2::after{animation-duration:4.5s,6s!important;animation-iteration-count:infinite!important}"+
".vN{display:inline;min-width:0}"+
".vN em{font-style:normal;font-weight:700;font-size:.74em;letter-spacing:.06em;margin-right:.45em;white-space:nowrap;text-transform:uppercase;vertical-align:.08em}"+
".vN b{font:inherit;color:inherit}"+
".vN.v1 em{color:#d8c08a;text-shadow:0 0 6px #cdb27a44}"+
".vN.v2 em{background:linear-gradient(100deg,#ffe9a8 0%,#f7b6e0 25%,#a9c8ff 50%,#a8ffd8 75%,#ffe9a8 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:vShine 7s linear infinite}"+
"@keyframes vShine{to{background-position:-250% 0}}"+
".vN.col{display:inline-flex;flex-direction:column;align-items:inherit}"+
".vN.col em{margin:0 0 1px}"+
"@media(prefers-reduced-motion:reduce){.vF2::after,.vF2::before,.vN.v2 em{animation:none!important}.vF2::after{background-size:100% 100%,0 0,0 0}}";
document.head.appendChild(css);
window.VIP={
  names:NAMES,
  esc:esc,
  /* HTML имени с префиксом. col=true — префикс отдельной строкой */
  n:function(nick,v,col){v=+v||0;var t=esc(nick);if(!NAMES[v])return t;return '<span class="vN v'+v+(col?' col':'')+'"><em>'+(v===2?"✦ ":"")+NAMES[v]+'</em><b>'+t+'</b></span>'},
  /* класс рамки для аватара (с пробелом в начале) */
  f:function(v){v=+v||0;return NAMES[v]?" vF vF"+v:""},
  /* повесить/снять рамку на элементе */
  frame:function(el,v){if(!el)return;v=+v||0;el.classList.remove("vF","vF1","vF2");if(NAMES[v]){el.classList.add("vF","vF"+v)}}
};
})();
