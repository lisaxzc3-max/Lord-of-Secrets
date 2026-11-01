/* Повелитель Тайн — общие настройки вида.
   Качество графики (в настройках): low — без анимаций, medium — обычное, high — все эффекты (в том числе на главной).
   Значение хранится на устройстве (lotm_q). Затемнения экрана больше нет. */
(function(){
"use strict";
if(window.__lotmTheme)return;window.__lotmTheme=1;
var KEY="lotm_q";
var phone=false;try{phone=matchMedia("(pointer:coarse)").matches||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||"")}catch(e){}
function quality(){var v=null;try{v=localStorage.getItem(KEY)}catch(e){}return v==="low"||v==="medium"||v==="high"?v:(phone?"medium":"high")}
var q=quality();window.LOTM_Q=q;
try{document.documentElement.setAttribute("data-q",q)}catch(e){}
/* боевые эффекты в приглушённой гамме */
try{var cs=document.currentScript||document.querySelector('script[src*="theme.js"]');if(cs&&cs.src){var lk=document.createElement("link");lk.rel="stylesheet";lk.href=cs.src.replace(/theme\.js(\?.*)?$/,"fx-dark.css");document.head.appendChild(lk)}}catch(e){}
var s=document.createElement("style");
s.textContent="h1,h2,h3{font-family:Philosopher,Georgia,'Times New Roman',serif;letter-spacing:.04em}"+
(q==="low"?"*,*:before,*:after{animation-duration:.01ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0s!important}.vF2::before,.vF2::after{animation:none!important}":"");
document.head.appendChild(s);
})();
