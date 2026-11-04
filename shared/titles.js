/* Титулы: каталог, плашки и отображение возле ника */
(function(){
"use strict";
if(window.LOTM_TITLES)return;
var BASE=(function(){try{var s=document.currentScript&&document.currentScript.src;if(s)return s.replace(/[^\/]*(\?.*)?$/,"")+"art/title/"}catch(e){}return "/shared/art/title/"})();
var LIST=[
 {id:"novice",n:"Искатель тайн",r:0,d:"Есть у каждого игрока"},
 {id:"fog",n:"Дитя тумана",r:1,d:"Достигни 10 уровня"},
 {id:"keeper",n:"Хранитель секретов",r:2,d:"Достигни 25 уровня"},
 {id:"fool",n:"Тот, Кто Над Туманом",r:3,d:"Особый титул, выдаётся за великие дела"}
];
var MAP={};LIST.forEach(function(t){MAP[t.id]=t});
var COL=["#cfd3da","#e9d9a8","#f6e3ff","#ffe9a8"];
var st=document.createElement("style");
st.textContent=".ttChip{display:inline-block;vertical-align:middle;box-sizing:border-box;max-width:100%;padding:5px 20px;margin:2px 0;background:center/100% 100% no-repeat;font:800 10px/13px system-ui;letter-spacing:.04em;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000}"+
".ttChip.sm{padding:3px 15px;font-size:9px;line-height:11px;margin:0 4px 0 0}"+
".ttChip.lg{padding:12px 34px;font-size:13px;line-height:17px}"+
".ttChip.r0{background-image:url("+BASE+"ttl0.webp);color:"+COL[0]+"}"+
".ttChip.r1{background-image:url("+BASE+"ttl1.webp);color:"+COL[1]+"}"+
".ttChip.r2{background-image:url("+BASE+"ttl2.webp);color:"+COL[2]+"}"+
".ttChip.r3{background-image:url("+BASE+"ttl3.webp);color:"+COL[3]+"}";
document.head.appendChild(st);
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
window.LOTM_TITLES={list:LIST,get:function(id){return MAP[String(id||"")]||null},
 html:function(id,size){var t=MAP[String(id||"")];if(!t)return"";return'<span class="ttChip r'+t.r+(size?" "+size:"")+'">'+esc(t.n)+"</span>"},
 el:function(id,size){var t=MAP[String(id||"")];if(!t)return null;var e=document.createElement("span");e.className="ttChip r"+t.r+(size?" "+size:"");e.textContent=t.n;return e}};
})();
