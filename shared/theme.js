/* Повелитель Тайн — общий «мрачный» тон: приглушённые цвета, тёмная виньетка, лёгкое зерно.
   Включается на всех страницах. Выключатель — в настройках («Атмосфера»), значение хранится на устройстве. */
(function(){
"use strict";
if(window.__lotmTheme)return;window.__lotmTheme=1;
var KEY="lotm_tone";
function mode(){try{return localStorage.getItem(KEY)||"dark"}catch(e){return"dark"}}
var m=mode();
if(m==="vivid")return;
var ok=false;try{ok=CSS.supports("backdrop-filter","blur(1px)")||CSS.supports("-webkit-backdrop-filter","blur(1px)")}catch(e){}
var s=document.createElement("style");
var grain="url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
s.textContent=
"#lotmTone,#lotmGrain{position:fixed;inset:0;pointer-events:none}"+
(ok?"#lotmTone{z-index:2147483000;-webkit-backdrop-filter:saturate(.5) sepia(.16) contrast(1.05) brightness(.9);backdrop-filter:saturate(.5) sepia(.16) contrast(1.05) brightness(.9);background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 45%,rgba(4,2,8,.55) 100%)}":
 "#lotmTone{z-index:2147483000;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 45%,rgba(4,2,8,.6) 100%),rgba(20,14,10,.14)}")+
"#lotmGrain{z-index:2147483001;opacity:.07;background-image:"+grain+";mix-blend-mode:overlay}"+
"h1,h2,h3{font-family:Georgia,'Times New Roman',serif;letter-spacing:.04em}";
document.head.appendChild(s);
function add(){
 if(!document.body)return;
 var a=document.createElement("div");a.id="lotmTone";a.setAttribute("aria-hidden","true");
 var b=document.createElement("div");b.id="lotmGrain";b.setAttribute("aria-hidden","true");
 document.body.appendChild(a);document.body.appendChild(b);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",add);else add();
})();
