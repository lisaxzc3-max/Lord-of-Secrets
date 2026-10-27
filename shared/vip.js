/* Повелитель Тайн — VIP: префиксы имён и рамки аватаров (1 = Посвящённый, 2 = Благословлённый) */
(function(){
"use strict";
if(window.VIP)return;
var NAMES={1:"Посвящённый",2:"Благословлённый"};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var css=document.createElement("style");
css.textContent=
"@property --va{syntax:'<angle>';inherits:false;initial-value:0deg}"+
":where(.vF){position:relative}"+
".vF1::after{content:'';position:absolute;inset:0;border-radius:inherit;border:2px solid #cdb27a;box-shadow:inset 0 0 7px #000a,0 0 8px #cdb27a40;pointer-events:none;z-index:3}"+
".vF2{box-shadow:0 0 14px #ffd98a55,0 0 26px #b48cff33}"+
".vF2::after{content:'';position:absolute;inset:0;border-radius:inherit;padding:2.5px;pointer-events:none;z-index:3;"+
"background:conic-gradient(from var(--va),#ffe9a8,#f3a8dc,#8fb8ff,#9dfad0,#ffe9a8);"+
"-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);"+
"animation:vSpin 6s linear infinite}"+
"@keyframes vSpin{to{--va:360deg}}"+
".vN{display:inline;min-width:0}"+
".vN em{font-style:normal;font-weight:700;font-size:.74em;letter-spacing:.06em;margin-right:.45em;white-space:nowrap;text-transform:uppercase;vertical-align:.08em}"+
".vN b{font:inherit;color:inherit}"+
".vN.v1 em{color:#d8c08a;text-shadow:0 0 6px #cdb27a44}"+
".vN.v2 em{background:linear-gradient(100deg,#ffe9a8 0%,#f7b6e0 25%,#a9c8ff 50%,#a8ffd8 75%,#ffe9a8 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:vShine 7s linear infinite;filter:drop-shadow(0 0 4px #ffd98a55)}"+
"@keyframes vShine{to{background-position:-250% 0}}"+
".vN.col{display:inline-flex;flex-direction:column;align-items:inherit}"+
".vN.col em{margin:0 0 1px}"+
"@media(prefers-reduced-motion:reduce){.vF2::after,.vN.v2 em{animation:none}}";
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
