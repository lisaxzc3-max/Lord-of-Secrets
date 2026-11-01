/* Повелитель Тайн — подсказки обучения на страницах локации и боя (включается флагом из shared/tutorial.js на главной) */
(function(){
"use strict";
if(window.__tutF)return;window.__tutF=1;
var q=new URLSearchParams(location.search),tg=window.Telegram&&Telegram.WebApp;
var uid=String(q.get("u")||(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||"0");
var key="lotm_tutf_"+uid,on=false;
try{on=localStorage.getItem(key)==="1"}catch(e){}
if(!on)return;
function $(s){return document.querySelector(s)}
var css=document.createElement("style");
css.textContent=
"#tfBox{position:fixed;left:10px;right:10px;top:calc(66px + env(safe-area-inset-top));z-index:9000;max-width:440px;margin:0 auto;padding:10px 12px;border-radius:16px;border:1px solid #e2c27a99;background:linear-gradient(160deg,#2a2044f7,#150e28f7);box-shadow:0 10px 28px #000c;color:#f1e8d3;font:13px/1.4 system-ui,sans-serif;opacity:0;transform:translateY(-10px);transition:.35s;pointer-events:none}"+
"#tfBox.on{opacity:1;transform:none;pointer-events:auto}"+
"#tfBox.low{top:auto;bottom:calc(16px + env(safe-area-inset-bottom))}"+
"#tfBox .hd{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#e2c27a;margin-bottom:3px}"+
"#tfBox .ac{display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:8px}"+
"#tfBox button{border:0;background:none;color:#8f84a6;font-size:11px;text-decoration:underline;cursor:pointer;padding:4px 0}"+
"#tfBox .go{border:1px solid #a98a4a;background:linear-gradient(145deg,#7a5c22,#3a2a10);color:#fff0c4;font:800 13px system-ui;border-radius:11px;padding:8px 14px;text-decoration:none}"+
"#tfRing{position:fixed;z-index:8990;pointer-events:none;border-radius:14px;border:2px solid #e2c27a;box-shadow:0 0 0 4px #e2c27a33,0 0 22px #e2c27acc;opacity:0;transition:opacity .3s,left .3s,top .3s,width .3s,height .3s;animation:tfRg 1.4s ease-in-out infinite}"+
"#tfRing.on{opacity:1}@keyframes tfRg{50%{box-shadow:0 0 0 8px #e2c27a11,0 0 32px #e2c27a}}"+
"@media(prefers-reduced-motion:reduce){#tfBox,#tfRing{animation:none!important;transition:none!important}}";
document.head.appendChild(css);
var box=document.createElement("div");box.id="tfBox";
box.innerHTML='<div class="hd" id="tfT"></div><div id="tfX"></div><div class="ac"><button type="button" id="tfSk">Скрыть подсказки</button><button type="button" class="go" id="tfGo" style="display:none">Понятно ›</button></div>';
var ring=document.createElement("div");ring.id="tfRing";
function mount(){document.body.appendChild(box);document.body.appendChild(ring)}
if(document.body)mount();else document.addEventListener("DOMContentLoaded",mount);
var target=null,raf=0,onGo=null;
function place(){
 cancelAnimationFrame(raf);
 if(!target){ring.classList.remove("on");return}
 var r=target.getBoundingClientRect();
 if(r.width>0&&r.height>0){ring.style.left=(r.left-4)+"px";ring.style.top=(r.top-4)+"px";ring.style.width=(r.width+8)+"px";ring.style.height=(r.height+8)+"px";ring.classList.add("on")}
 else ring.classList.remove("on");
 raf=requestAnimationFrame(place);
}
function show(t,x,tg2,go){
 document.getElementById("tfT").textContent=t;document.getElementById("tfX").textContent=x;
 var b=document.getElementById("tfGo");b.style.display=go?"":"none";b.textContent=go||"";onGo=null;
 target=tg2||null;place();box.classList.add("on");
 try{window.snd&&window.snd("scroll")}catch(e){}
}
function hide(){box.classList.remove("on");target=null;ring.classList.remove("on");cancelAnimationFrame(raf)}
document.addEventListener("click",function(e){
 var id=e.target&&e.target.id;
 if(id==="tfSk"){try{localStorage.removeItem(key)}catch(_){}hide()}
 else if(id==="tfGo"&&onGo){var f=onGo;onGo=null;f()}
},true);
function wait(fn,cb,ms){var t=setInterval(function(){var v=fn();if(v){clearInterval(t);cb(v)}},ms||400)}

var isBattle=/\/battle\//.test(location.pathname);
if(!isBattle){
 box.classList.add("low");
 wait(function(){return $("#exploreBtn")},function(btn){
  show("Куда драться","Ты на месте. Нажми «Исследовать» — на берегу, в лесу, на кладбище или в руинах тебя встретит враг. Победи его и вернись на главную за наградой.",btn);
  btn.addEventListener("click",hide,{once:true});
 });
}else{
 wait(function(){var b=$("#battleSkills");return b&&b.querySelector(".sk")?b:null},function(sk){
  show("Твои навыки","Это способности твоего пути. Нажми любую — враг получит урон. После использования навык уходит на перезарядку. Удерживай навык — увидишь описание.",sk);
  var started=false;
  sk.addEventListener("click",function(){
   if(started)return;started=true;
   setTimeout(function(){
    var en=$("#enemyFrame");
    show("Враг","Нажми на врага — увидишь его навыки. Следи за здоровьем: твоё слева ❤, врага справа 🩸. Если плохо — используй лечащий навык или беги.",en,"Понятно ›");
    onGo=function(){hide()};
   },2600);
  },true);
 });
 wait(function(){var v=$("#victoryCard");return v&&!v.classList.contains("hidden")?v:null},function(v){
  show("Победа!","Первый враг повержен. Вернись на главную (кнопка «Назад» сверху) — Далия ждёт тебя с наградой за обучение.",$("#backHome"),"Понятно ›");
  onGo=function(){hide()};
 },600);
}
})();
