/* Секретики и мелкие приколы (только клиент, без сервера) */
(function(){
"use strict";
if(window.LOTM_SEC)return;
var K="lotm_sec",ALL={eye:"Око",fog:"Туман",whisper:"Шёпот",night:"Полуночник",idle:"Терпеливый",logo:"Печать",fool:"Дурак",sound:"Эхо"};
function load(){try{return JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(e){return{}}}
function save(o){try{localStorage.setItem(K,JSON.stringify(o))}catch(e){}}
var css=document.createElement("style");
css.textContent="#secT{position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top));transform:translate(-50%,-30px);opacity:0;z-index:99999;max-width:86vw;padding:10px 16px;border-radius:14px;background:#120c20ee;border:1px solid #e2c27a88;color:#f0e8d2;font:13px/1.35 system-ui;text-align:center;box-shadow:0 6px 24px #000a,0 0 18px #8a5cff44;transition:.45s cubic-bezier(.2,.9,.25,1);pointer-events:none}"+
"#secT.on{transform:translate(-50%,0);opacity:1}#secT i{display:block;font-style:normal;color:#e2c27a;font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:3px}"+
"#secFog{position:fixed;inset:0;z-index:99998;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 60%,#b9a8e055,#241a3acc 70%);transition:opacity 1.2s}#secFog.on{opacity:1}"+
"#secEye{position:fixed;left:50%;top:50%;z-index:99998;pointer-events:none;font-size:96px;color:#e2c27a;text-shadow:0 0 30px #8a5cff;transform:translate(-50%,-50%) scale(.6);opacity:0;transition:.9s}#secEye.on{opacity:.9;transform:translate(-50%,-50%) scale(1)}";
document.head.appendChild(css);
var tEl=null,tt=0,q=[];
function toast(h,t){
 if(!tEl){tEl=document.createElement("div");tEl.id="secT";document.body.appendChild(tEl)}
 tEl.innerHTML="<i></i><span></span>";tEl.firstChild.textContent=h;tEl.lastChild.textContent=t;
 tEl.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){tEl.classList.remove("on")},3800)}
function found(id,h,t){
 var o=load(),n=0;for(var k in o)n++;
 if(!o[id]){o[id]=1;save(o);n++;toast("Секрет найден · "+n+"/"+Object.keys(ALL).length,t);try{window.snd&&window.snd("open")}catch(e){}}
 else toast(h,t)}
var EYE='<svg viewBox="0 0 100 60" width="150" height="90" fill="none" stroke="#e2c27a" stroke-width="3" stroke-linecap="round"><path d="M4 30C20 8 80 8 96 30C80 52 20 52 4 30Z"/><circle cx="50" cy="30" r="12" fill="#8a5cff55"/><circle cx="50" cy="30" r="5" fill="#e2c27a"/><path d="M50 4V-2M24 10L20 4M76 10L80 4" /></svg>';
function overlay(id,ms,txt){var e=document.getElementById(id);if(!e){e=document.createElement("div");e.id=id;if(txt)e.innerHTML=EYE;document.body.appendChild(e)}
 void e.offsetWidth;e.classList.add("on");setTimeout(function(){e.classList.remove("on")},ms)}
var WH=["Кто-то зовёт тебя по имени, которого ты не называл.","За туманом кто-то считает твои шаги.","Серая дымка шепчет: «Не оборачивайся».","Тот, Кто Над Туманом, листает твою страницу.","Слышишь? Это тикают часы, которых нет.","Ты не первый, кто сюда заходит. И не последний.","Не всякая тайна хочет быть раскрытой."];
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
var CMD={
 "/туман":function(){overlay("secFog",3200);found("fog","Туман","Туман сгущается… и отступает.")},
 "/глаз":function(){overlay("secEye",2600,"𓂀");found("eye","Око","Он смотрит. Он всегда смотрит.")},
 "/шёпот":function(){found("whisper","Шёпот",rnd(WH))},
 "/дурак":function(){found("fool","Дурак","Карта Дурака. Начало и конец одного пути.")},
 "/секреты":function(){var o=load(),n=0,l=[];for(var k in ALL){if(o[k]){n++;l.push(ALL[k])}}toast("Найдено "+n+"/"+Object.keys(ALL).length,l.length?l.join(" · "):"Пока ничего. Тайны любят искать.")}
};
CMD["/туман"].a=CMD["/глаз"].a=1;
window.LOTM_SEC={cmd:function(t){t=String(t||"").trim().toLowerCase().replace(/ё/g,"е");var m;for(var k in CMD){if(k.replace(/ё/g,"е")===t){CMD[k]();return true}}return false},toast:toast,found:found};
/* ночной режим: 00:00–05:00 */
setTimeout(function(){var h=new Date().getHours();if(h<5&&!sessionStorage.getItem("secN")){try{sessionStorage.setItem("secN","1")}catch(e){}found("night","Полуночник","Ночью Тайны ближе. Не спится?")}},4000);
/* редкий шёпот при заходе: 3% */
if(Math.random()<.03)setTimeout(function(){toast("Шёпот",rnd(WH))},6000);
/* тишина: 90 сек без касаний */
var idle=0;function rs(){clearTimeout(idle);idle=setTimeout(function(){found("idle","Терпеливый","Ты ещё здесь? Туман умеет ждать.")},90000)}
["touchstart","click","keydown"].forEach(function(e){addEventListener(e,rs,{passive:true})});rs();
/* 7 быстрых тапов по печати/фото на заставке */
var taps=[];addEventListener("click",function(e){var t=e.target;if(!t||!t.closest)return;if(t.closest(".seal,.photoWrap,#ltShield")&&document.getElementById("loader")){var n=Date.now();taps=taps.filter(function(x){return n-x<2500});taps.push(n);if(taps.length>=7){taps=[];overlay("secEye",2600,"𓂀");found("logo","Печать","Печать открылась на миг. Никому не говори.")}}},true);
/* 5 быстрых нажатий по кнопке звука */
var st=[];addEventListener("click",function(e){var t=e.target;if(!t||!t.closest||!t.closest("button[aria-label=\"Звук\"]"))return;var n=Date.now();st=st.filter(function(x){return n-x<2000});st.push(n);if(st.length>=5){st=[];found("sound","Эхо","Эхо ответило из пустоты.")}},true);
})();
