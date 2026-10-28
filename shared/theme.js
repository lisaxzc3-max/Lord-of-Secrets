/* Повелитель Тайн — общий «мрачный» тон: приглушённые цвета, тёмная виньетка, лёгкое зерно.
   Включается на всех страницах. Выключатель — в настройках («Атмосфера»), значение хранится на устройстве. */
(function(){
"use strict";
if(window.__lotmTheme)return;window.__lotmTheme=1;
var KEY="lotm_tone";
var phone=false;try{phone=matchMedia("(pointer:coarse)").matches||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||"")}catch(e){}
/* режимы: dark — полный (фильтр цвета), light — лёгкий (плавнее на телефонах), vivid — без затемнения. По умолчанию: на телефоне light, иначе dark. */
function mode(){var v=null;try{v=localStorage.getItem(KEY)}catch(e){}return v==="dark"||v==="light"||v==="vivid"?v:(phone?"light":"dark")}
var m=mode();
if(m==="vivid")return;
try{var cs=document.currentScript||document.querySelector('script[src*="theme.js"]');if(cs&&cs.src){var lk=document.createElement("link");lk.rel="stylesheet";lk.href=cs.src.replace(/theme\.js(\?.*)?$/,"fx-dark.css");document.head.appendChild(lk)}}catch(e){}
var ok=false;try{ok=CSS.supports("backdrop-filter","blur(1px)")||CSS.supports("-webkit-backdrop-filter","blur(1px)")}catch(e){}
var s=document.createElement("style");
var grain="url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
/* На телефонах: вместо backdrop-filter и blend-mode (они перерисовывают весь экран каждый кадр) — один дешёвый слой:
   виньетка + тёплый приглушающий тон + лёгкое зерно. */
var light=(m==="light");
var grainL=grain.replace(".55 0'",".05 0'");
if(light){
 s.textContent="h1,h2,h3{font-family:Philosopher,Georgia,'Times New Roman',serif;letter-spacing:.04em}"; /* лёгкая атмосфера: без затемнения и виньетки, только шрифт заголовков */
}else
s.textContent=
"#lotmTone,#lotmGrain{position:fixed;inset:0;pointer-events:none}"+
(ok?"#lotmTone{z-index:2147483000;-webkit-backdrop-filter:saturate(.5) sepia(.16) contrast(1.05) brightness(.9);backdrop-filter:saturate(.5) sepia(.16) contrast(1.05) brightness(.9);background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 45%,rgba(4,2,8,.55) 100%)}":
 "#lotmTone{z-index:2147483000;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 45%,rgba(4,2,8,.6) 100%),rgba(20,14,10,.14)}")+
"#lotmGrain{z-index:2147483001;opacity:.07;background-image:"+grain+";mix-blend-mode:overlay}"+
"h1,h2,h3{font-family:Philosopher,Georgia,'Times New Roman',serif;letter-spacing:.04em}";
document.head.appendChild(s);
function add(){
 if(!document.body)return;
 if(!light){var a=document.createElement("div");a.id="lotmTone";a.setAttribute("aria-hidden","true");
 document.body.appendChild(a)}
 if(!light){var b=document.createElement("div");b.id="lotmGrain";b.setAttribute("aria-hidden","true");document.body.appendChild(b)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",add);else add();
})();
