/* Повелитель Тайн — обучение для новых игроков (подсказки + стартовый квест). Только для главной страницы. */
(function(){
"use strict";
if(window.LOTM_TUT)return;
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
function sfx(n){try{window.snd&&window.snd(n)}catch(e){}}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
var st=null,ui=null,ring=null,busy=false,raf=0,target=null,started=false;

var STEPS=[
 {t:"Твой герой",x:"Вот ты: имя, уровень, здоровье ❤️, фунты 💷 и опыт ⭐. Нажми на карточку — откроется профиль с характеристиками.",sel:"#topCard",btn:"Понятно ›"},
 {t:"Сумка",x:"Вещи и экипировка хранятся в Сумке 🎒. Нажми «Сумка» внизу — загляни внутрь.",sel:'.nav a[data-tab="bag"]'},
 {t:"Подарок за первый этап",x:"Далия оставила тебе стартовую вещь и 30 💷. Забирай, пригодится в бою.",sel:"#bag .bgHead",btn:"🎁 Забрать подарок",gift:true,needBag:true},
 {t:"Надень снаряжение",x:"Нажми на новую вещь в списке «Сумка», затем «Надеть». Вещи на тебе добавляют силу в бою.",sel:"#invList .ivRow",eq:true,needBag:true},
 {t:"Город",x:"В Городе 🌆 тебя ждут торговцы, бармен и Ратуша с Залом славы. Открой вкладку «Город».",sel:'.nav a[data-tab="city"]'},
 {t:"Куда драться",x:"Открой «Поход» и выбери локацию: Озёра или Лес. Начни с Озёр, там враги слабее.",sel:'.nav a[data-tab="travel"]',sel2:"#ctaGo"},
 {t:"В бой!",x:"Зайди в локацию, нажми «Исследовать» и победи врага. В бою я подскажу, что нажимать. После победы вернись сюда за наградой.",sel:'.nav a[data-tab="travel"]',sel2:"#ctaGo"},
 {t:"Победа!",x:"Первый враг повержен — Далия довольна. Забери награду за обучение.",sel:"#ctaGo",btn:"🎁 Забрать +50 💷",claim:true}
];

var css=document.createElement("style");
css.textContent=
"#tutBox.top{bottom:auto;top:calc(8px + env(safe-area-inset-top))}"+
"#tutBox.min .tx,#tutBox.min .bar,#tutBox.min .ac{display:none}"+
"#tutBox{position:fixed;left:10px;right:56px;bottom:calc(96px + env(safe-area-inset-bottom));z-index:8500;max-width:420px;margin:0;padding:11px 12px;border-radius:18px;border:1px solid #e2c27a99;background:linear-gradient(160deg,#2a2044f7,#150e28f7);box-shadow:0 8px 30px #000a,0 0 24px #8a5cff44;transform:translateY(160%);opacity:0;transition:transform .5s cubic-bezier(.2,.9,.25,1.1),opacity .3s;font-family:system-ui,-apple-system,sans-serif;color:#eee6d6}"+
"#tutBox.on{transform:none;opacity:1}"+
"#tutBox .tr{display:flex;gap:10px;align-items:flex-start}"+
"#tutBox .ow{flex:0 0 40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#3a2f52,#1d1530);border:1px solid #9a7c45;display:flex;align-items:center;justify-content:center;font-size:21px;animation:tutFl 3.5s ease-in-out infinite}"+
"@keyframes tutFl{50%{transform:translateY(-3px)}}"+
"#tutBox .hd{display:flex;justify-content:space-between;align-items:baseline;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#e2c27a}"+
"#tutBox .hd i{font-style:normal;color:#a99dba;letter-spacing:1px}"+
"#tutBox .tx{font-size:12.5px;line-height:1.35;margin-top:3px;color:#f1e8d3}"+
"#tutBox .bar{display:flex;gap:5px;margin:9px 0 0}"+
"#tutBox .bar b{flex:1;height:4px;border-radius:9px;background:#2a2040;transition:.5s}"+
"#tutBox .bar b.on{background:linear-gradient(90deg,#e2c27a,#fff3cf);box-shadow:0 0 8px #e2c27a}"+
"#tutBox .ac{display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:8px}"+
"#tutBox .sk{background:none;border:0;color:#8f84a6;font-size:11px;text-decoration:underline;padding:4px 0;cursor:pointer}"+
"#tutBox .go{border:1px solid #a98a4a;background:linear-gradient(145deg,#7a5c22,#3a2a10);color:#fff0c4;font:800 13px system-ui;border-radius:12px;padding:9px 16px;cursor:pointer;animation:tutGl 1.6s ease-in-out infinite}"+
"@keyframes tutGl{50%{box-shadow:0 0 18px #e2c27a99}}"+
"#tutRing{position:fixed;z-index:8400;pointer-events:none;border-radius:16px;border:2px solid #e2c27a;box-shadow:0 0 0 4px #e2c27a33,0 0 24px #e2c27acc;opacity:0;transition:opacity .3s,left .35s,top .35s,width .35s,height .35s;animation:tutRg 1.4s ease-in-out infinite}"+
"#tutRing.on{opacity:1}"+
"@keyframes tutRg{50%{box-shadow:0 0 0 9px #e2c27a11,0 0 34px #e2c27a}}"+
"#tutRing:after{content:\"👆\";position:absolute;left:50%;top:100%;margin-left:-11px;font-size:20px;animation:tutPt .9s ease-in-out infinite}"+
"@keyframes tutPt{50%{transform:translateY(-6px)}}"+
"#tutRing.up:after{top:auto;bottom:100%;transform:rotate(180deg)}"+
".tutFp{position:fixed;z-index:8600;pointer-events:none;font-size:20px;animation:tutP 1.2s ease-out forwards}"+
"@keyframes tutP{to{opacity:0;transform:translate(var(--x),var(--y)) scale(.3) rotate(var(--r))}}"+
"@media(prefers-reduced-motion:reduce){#tutBox,#tutRing,#tutBox *{animation:none!important;transition:none!important}}";
document.head.appendChild(css);

function build(){
 if(ui)return;
 ui=el("div");ui.id="tutBox";ui.setAttribute("role","status");
 ui.innerHTML='<div class="tr"><div class="ow">🦉</div><div style="flex:1;min-width:0"><div class="hd"><span id="tutT"></span><i id="tutN"></i></div><div class="tx" id="tutX"></div></div></div><div class="bar" id="tutBar"></div><div class="ac"><button type="button" class="sk" id="tutSk">Пропустить обучение</button><button type="button" class="go" id="tutGo" style="display:none"></button></div>';
 document.body.appendChild(ui);
 ring=el("div");ring.id="tutRing";document.body.appendChild(ring);
 ui.querySelector("#tutSk").addEventListener("click",skip);
 ui.querySelector(".ow").addEventListener("click",function(){ui.classList.toggle("min")});
 ui.querySelector("#tutGo").addEventListener("click",onGo);
}
function api(p){return window.tutApi(p)}
function idx(){ if(!st||st.done)return -1; if(st.s>=5&&st.win)return 7; return Math.min(st.s,6) }
function place(){
 cancelAnimationFrame(raf);
 if(!ring||!target||!st||st.done){if(ring)ring.classList.remove("on");return}
 var r=target.getBoundingClientRect();
 if(r.width>0){
  ring.style.left=(r.left-5)+"px";ring.style.top=(r.top-5)+"px";ring.style.width=(r.width+10)+"px";ring.style.height=(r.height+10)+"px";
  ring.classList.toggle("up",r.top>innerHeight*0.55);ring.classList.add("on");
  if(ui)ui.classList.toggle("top",(r.top+r.height/2)>innerHeight*0.42);
 }else ring.classList.remove("on");
 raf=requestAnimationFrame(place);
}
function findTarget(s){
 if(s.needBag){
  var bag=document.getElementById("bag");
  if(bag&&bag.classList.contains("hidden"))return document.querySelector('.nav a[data-tab="bag"]');
  if(s.eq){var sh=document.querySelector(".shBtns .btn.gold");if(sh&&sh.offsetParent!==null)return sh}
  var t0=document.querySelector(s.sel);if(t0)return t0;return document.querySelector("#bag .bgHead")
 }
 var t=document.querySelector(s.sel);
 if(s.sel2){var c=document.querySelector(s.sel2);var travel=document.getElementById("travel");
  if(travel&&!travel.classList.contains("hidden")){var l=document.querySelector("#travel .loc");if(l)return l}
  if(c&&c.offsetParent!==null&&!document.getElementById("hall").classList.contains("hidden"))return c}
 return t;
}
function render(){
 if(!st||st.done){hide();return}
 build();var i=idx(),s=STEPS[i];
 ui.querySelector("#tutT").textContent=s.t;ui.querySelector("#tutN").textContent="Обучение · "+(i+1)+"/"+STEPS.length;
 ui.querySelector("#tutX").textContent=s.x;
 var bar=ui.querySelector("#tutBar");bar.replaceChildren();
 for(var k=0;k<STEPS.length;k++){var b=document.createElement("b");if(k<=i)b.className="on";bar.appendChild(b)}
 var go=ui.querySelector("#tutGo");go.style.display=s.btn?"":"none";go.textContent=s.btn||"";
 ui.querySelector("#tutSk").style.display=s.claim?"none":"";
 if(!ui.classList.contains("on")){void ui.offsetWidth;ui.classList.add("on");sfx("scroll")}
 target=findTarget(s);place();
 flag(i);eqPoll(i);
}
var UID=(function(){var q=new URLSearchParams(location.search),tg=window.Telegram&&Telegram.WebApp;return String(q.get("u")||(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||"0")})();
function flag(i){try{if(i>=5&&i<7)localStorage.setItem("lotm_tutf_"+UID,"1");else{localStorage.removeItem("lotm_tutf_"+UID);localStorage.removeItem("lotm_tutw_"+UID)}}catch(e){}}
var eqT=0;
function eqPoll(i){
 if(i!==3){if(eqT){clearInterval(eqT);eqT=0}return}
 if(eqT)return;
 eqT=setInterval(function(){
  var e=document.getElementById("eqCnt");
  if(idx()!==3){clearInterval(eqT);eqT=0;return}
  if(e&&/^[1-9]/.test((e.textContent||"").trim())){clearInterval(eqT);eqT=0;sfx("good");next()}
  else{target=findTarget(STEPS[3])}
 },700);
}
function gift(){
 if(busy)return;busy=true;
 api({action:"tut_gift"}).then(function(d){busy=false;
  if(!d||!d.ok)return;
  sfx("win");celebrate();st=d;
  try{if(typeof loadProfileWithRetry==="function")loadProfileWithRetry(false)}catch(e){}
  render();
  var x=ui.querySelector("#tutX");if(x&&d.item)x.textContent="Получено: "+d.item+" и +30 💷. Нажми на неё в списке и надень.";
 },function(){busy=false});
}
function hide(){if(ui)ui.classList.remove("on");if(ring)ring.classList.remove("on");target=null;cancelAnimationFrame(raf)}
function apply(d){if(d&&d.ok){st=d;render()}}
function check(){
 if(busy)return;busy=true;
 api({action:"tut_state"}).then(function(d){busy=false;if(!d||!d.ok)return;var prev=idx();st=d;if(st.done){hide();return}
  render();if(idx()===7&&prev!==7)sfx("good")},function(){busy=false});
}
function next(){
 if(busy)return;busy=true;
 api({action:"tut_next"}).then(function(d){busy=false;if(d&&d.ok){sfx("good");apply(d)}},function(){busy=false});
}
function onGo(){
 var i=idx();
 if(i===0){next();return}
 if(i===2){gift();return}
 if(i===7)claim();
}
function claim(){
 if(busy)return;busy=true;
 api({action:"tut_claim"}).then(function(d){busy=false;
  if(!d||!d.ok){return}
  st=d;sfx("win");
  var p=document.getElementById("pounds");if(p)p.textContent=d.pounds;
  celebrate();
  var x=ui.querySelector("#tutX");ui.querySelector("#tutT").textContent="Обучение завершено";x.textContent="+"+d.got+" 💷 — твои. Тинген теперь твой. Удачи, странник!";
  ui.querySelector("#tutGo").style.display="none";ring.classList.remove("on");
  setTimeout(hide,3500);
 },function(){busy=false});
}
function celebrate(){
 if(reduce)return;var fl=document.createElement("div");fl.style.cssText="position:fixed;inset:0;z-index:8700;pointer-events:none;background:radial-gradient(circle,#e2c27aaa,transparent 70%);transition:opacity 1s";document.body.appendChild(fl);setTimeout(function(){fl.style.opacity=0},60);setTimeout(function(){fl.remove()},1200);
 for(var i=0;i<26;i++){var d=document.createElement("i");d.className="tutFp";d.style.fontStyle="normal";d.textContent=["💷","✦","✨","🎁"][i%4];d.style.left=(innerWidth/2)+"px";d.style.top=(innerHeight*0.6)+"px";d.style.setProperty("--x",(Math.random()*340-170)+"px");d.style.setProperty("--y",(-Math.random()*300-20)+"px");d.style.setProperty("--r",(Math.random()*480-240)+"deg");document.body.appendChild(d);(function(e){setTimeout(function(){e.remove()},1300)})(d)}
}
function skip(){
 if(busy)return;busy=true;
 api({action:"tut_skip"}).then(function(d){busy=false;sfx("back");st=d&&d.ok?d:{done:true};hide()},function(){busy=false});
}
function onTab(id){
 if(!st||st.done)return;var i=idx();
 if(i===1&&id==="bag")next();
 else if(i===4&&id==="city")next();
 else setTimeout(function(){if(st&&!st.done)render()},60);
}
/* клик по карточке героя — засчитывает шаг 1 */
document.addEventListener("click",function(e){var i=idx();if(i===0&&e.target.closest&&e.target.closest("#topCard"))setTimeout(next,50);
 if(i===5&&e.target.closest&&e.target.closest("#travel .loc, #ctaGo")){try{localStorage.setItem("lotm_tutf_"+UID,"1")}catch(_){}next()}
 if(i===2||i===3)setTimeout(function(){if(st&&!st.done)render()},120)},true);
window.addEventListener("resize",function(){if(target)place()});

window.LOTM_TUT={check:function(){if(!started){started=true;var o=window.showTab;if(typeof o==="function"){window.showTab=function(id){var r=o.apply(this,arguments);try{onTab(id)}catch(e){}return r}}}check()},state:function(){return st}};
})();
