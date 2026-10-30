/* Повелитель Тайн — каноничные навыки трёх путей + анимации (всё рисуется кодом). */
(function(){
"use strict";
var COL={seer:"#9a7bff",sailor:"#4fb4ff",hunter:"#ff6a3a"};
var SK={
/* ПУТЬ ШУТА · Провидец (Клоун) */
divination:{path:"seer",cd:"divination",icon:"🔮",name:"Гадание",tag:"КД 3",c:"#7aa8ff",desc:"Карты и маятник: уклонение на 1 ход.",fx:"divine"},
seer_bullet:{path:"seer",cd:"s4",icon:"💨",name:"Воздушная пуля",tag:"КД 2",c:"#bfe6ff",desc:"Сжатый воздух. Урон от Интеллекта.",fx:"airbullet"},
boomerang:{path:"seer",cd:"boomerang",icon:"📜",name:"Бумажный кинжал",tag:"КД 3",c:"#f1e6c8",desc:"Удар и эхо через ход.",fx:"paper"},
acting:{path:"seer",cd:"acting",icon:"🎭",name:"Актёрство",tag:"КД 1",c:"#c48cff",desc:"Враг -25% атаки и защиты на 1 ход.",fx:"masks"},
/* ПУТЬ ТИРАНА · Матрос */
sailor_hit:{path:"sailor",cd:"hit",icon:"⛈",name:"Удар шторма",tag:"КД 2",c:"#ffe36a",desc:"Мощный удар, молния бьёт врага.",fx:"storm"},
sailor_wave:{path:"sailor",cd:"s4",icon:"🌊",name:"Морская волна",tag:"КД 2",c:"#4fb4ff",desc:"Водяной вал. Сила и Телосложение.",fx:"wave"},
sailor_drink:{path:"sailor",cd:"drink",icon:"🌙",name:"Колыбельная глубин",tag:"КД 3",c:"#7be3d8",desc:"Усыпляет врага на 2 хода.",fx:"lull"},
sailor_pray:{path:"sailor",cd:"pray",icon:"⚡",name:"Ярость шторма",tag:"КД 2",c:"#ff7b5e",desc:"Сила и Ловкость x2 на ход.",fx:"fury"},
/* ПУТЬ КРАСНОГО ЖРЕЦА · Охотник */
hunter_shot:{path:"hunter",cd:"s4",icon:"🎯",name:"Меткий выстрел",tag:"КД 2",c:"#ffd27a",desc:"Точный выстрел, 30% бить сильнее.",fx:"arrow"},
hunter_dagger:{path:"hunter",cd:"dagger",icon:"🔥",name:"Поджог",tag:"КД 2",c:"#ff6a3a",desc:"Огненный удар за 3% текущих HP. Первый удар x2.",fx:"fire"},
hunter_trap:{path:"hunter",cd:"trap",icon:"🪤",name:"Ловушка",tag:"КД 4",c:"#d6b779",desc:"Оглушает врага на 2 хода.",fx:"trap"},
hunter_boost:{path:"hunter",cd:"boost",icon:"😤",name:"Провокация",tag:"КД 1",c:"#ff5d5d",desc:"Враг промахивается чаще (-25%) 2 хода. Лечит 10% здоровья.",fx:"taunt"},
basic:{path:"",cd:"basic",icon:"⚔️",name:"Базовая атака",tag:"",c:"#d6b779",desc:"Обычная атака.",fx:"slash"},
flee:{path:"",cd:"",icon:"🏃",name:"Отступить",tag:"",c:"#999",desc:"Покинуть сражение.",fx:""}
};
var ORDER={
seer:["divination","seer_bullet","boomerang","acting"],
sailor:["sailor_hit","sailor_wave","sailor_drink","sailor_pray"],
hunter:["hunter_shot","hunter_dagger","hunter_trap","hunter_boost"]
};
/* От каких характеристик считается урон и эффект: base + Σ(стат × %) */
var DMG={
basic:{base:5,s:[["str",50]]},
seer_bullet:{base:8,s:[["int",50],["agi",20]]},
boomerang:{base:6,s:[["str",30]],note:"Эхо через ход: 3 + 30% Силы"},
sailor_hit:{base:10,s:[["str",40]]},
sailor_wave:{base:9,s:[["str",30],["con",30]]},
hunter_shot:{base:9,s:[["agi",60],["str",15]],note:"30% шанс ударить в 1,5 раза сильнее"},
hunter_dagger:{base:10,s:[["str",50]],note:"Первый удар ×2 · цена 3% текущих HP"},
sailor_pray:{eff:[["str","×2"],["agi","×2"]],note:"На 1 ход: усиливает удары и шанс крита"},
hunter_boost:{eff:[["con","10% макс. HP"]],note:"Лечение: 10% здоровья (мин. 3)"},
divination:{none:"Не зависит от характеристик"},
acting:{none:"Не зависит от характеристик"},
sailor_drink:{none:"Не зависит от характеристик"},
hunter_trap:{none:"Не зависит от характеристик"}
};
var PASS={
seer:["👁️","Предчувствие опасности","ПАССИВ","Уклонение от первой атаки в бою."],
sailor:["🛡️","Чешуя под кожей","ПАССИВ","+30 к максимальному здоровью."],
hunter:["🎯","Выслеживание","ПАССИВ","Первый нанесённый урон увеличен вдвое."]
};
var PATHNAME={seer:["Путь Шута","Провидец"],sailor:["Путь Тирана","Матрос"],hunter:["Путь Красного Жреца","Охотник"]};
function pathKey(s){
s=String(s||"").toLowerCase();
if(s==="seer"||s.indexOf("шут")>=0||s.indexOf("провид")>=0)return "seer";
if(s==="sailor"||s.indexOf("тиран")>=0||s.indexOf("матрос")>=0)return "sailor";
if(s==="hunter"||s.indexOf("жрец")>=0||s.indexOf("красн")>=0||s.indexOf("охотн")>=0)return "hunter";
return "";
}
function list(pk){return (ORDER[pk]||ORDER.seer).map(function(k){return Object.assign({key:k},SK[k])})}

/* ---------- CSS эффектов ---------- */
var css=
".sfxLayer{position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden}"+
".sfx{position:absolute;transform:translate(-50%,-50%);pointer-events:none;will-change:transform,opacity}"+
".sfx svg{display:block;overflow:visible}"+
"@keyframes sfRing{0%{transform:translate(-50%,-50%) scale(.2);opacity:.95}100%{transform:translate(-50%,-50%) scale(2.6);opacity:0}}"+
".sfRing{width:90px;height:90px;border-radius:50%;border:3px solid var(--c);box-shadow:0 0 20px var(--c),inset 0 0 14px var(--c);animation:sfRing .9s ease-out forwards}"+
"@keyframes sfPop{0%{transform:translate(-50%,-50%) scale(.2) rotate(-20deg);opacity:0}25%{opacity:1;transform:translate(-50%,-50%) scale(1.25) rotate(4deg)}100%{transform:translate(-50%,-70%) scale(1) rotate(0);opacity:0}}"+
".sfPop{font-size:46px;filter:drop-shadow(0 0 10px var(--c));animation:sfPop 1s ease-out forwards}"+
"@keyframes sfFly{0%{transform:translate(-50%,-50%) translate(0,0) rotate(var(--r,0deg));opacity:0}10%{opacity:1}100%{transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) rotate(var(--r,0deg));opacity:1}}"+
".sfFly{animation:sfFly var(--t,.5s) cubic-bezier(.4,.1,.7,1) forwards}"+
"@keyframes sfFade{0%{opacity:1}100%{opacity:0}}"+
"@keyframes sfPart{0%{transform:translate(-50%,-50%) translate(0,0) scale(1);opacity:1}100%{transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(.2);opacity:0}}"+
".sfPart{width:var(--s,8px);height:var(--s,8px);border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);animation:sfPart var(--t,.8s) ease-out forwards}"+
"@keyframes sfSlash{0%{transform:translate(-50%,-50%) rotate(var(--rot)) scaleX(0);opacity:0}30%{opacity:1;transform:translate(-50%,-50%) rotate(var(--rot)) scaleX(1)}100%{transform:translate(-50%,-50%) rotate(var(--rot)) scaleX(1);opacity:0}}"+
".sfSlash{width:130px;height:5px;border-radius:5px;background:linear-gradient(90deg,transparent,var(--c),#fff,var(--c),transparent);box-shadow:0 0 16px var(--c);animation:sfSlash .45s ease-out forwards}"+
"@keyframes sfWave{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}"+
".sfWaveWrap{position:absolute;left:0;right:0;overflow:hidden;height:150px;transform:translateY(-50%)}"+
".sfWaveWrap>div{position:absolute;left:-10%;right:-10%;top:0;bottom:0;animation:sfWave .9s ease-in forwards}"+
"@keyframes sfBolt{0%{opacity:0}10%{opacity:1}30%{opacity:.2}45%{opacity:1}100%{opacity:0}}"+
".sfBolt{animation:sfBolt .7s linear forwards}"+
"@keyframes sfFlame{0%{transform:translate(-50%,-30%) scale(.3);opacity:0}30%{opacity:1}100%{transform:translate(-50%,-110%) scale(1.2);opacity:0}}"+
".sfFlame{font-size:40px;filter:drop-shadow(0 0 12px #ff6a3a);animation:sfFlame .9s ease-out forwards}"+
"@keyframes sfSnap{0%{transform:translate(-50%,-260%);opacity:0}30%{opacity:1}55%{transform:translate(-50%,-50%)}100%{transform:translate(-50%,-50%);opacity:0}}"+
".sfSnap{animation:sfSnap 1.1s ease-in forwards}"+
"@keyframes sfJaw{0%{transform:rotate(0)}50%{transform:rotate(0)}60%{transform:rotate(var(--a))}100%{transform:rotate(var(--a))}}"+
"@keyframes sfShock{0%{transform:translate(-50%,-50%) scale(.2);opacity:1}100%{transform:translate(-50%,-50%) scale(3.2);opacity:0}}"+
".sfShock{width:60px;height:60px;border-radius:50%;border:4px solid var(--c);animation:sfShock .8s ease-out forwards}"+
"@keyframes sfCross{0%{transform:translate(-50%,-50%) scale(3) rotate(90deg);opacity:0}40%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}100%{transform:translate(-50%,-50%) scale(.8);opacity:0}}"+
".sfCross{animation:sfCross .75s ease-out forwards}"+
"@keyframes sfOrbit{0%{transform:translate(-50%,-50%) rotate(0deg) translateX(var(--rad)) rotate(0deg);opacity:0}15%{opacity:1}100%{transform:translate(-50%,-50%) rotate(360deg) translateX(var(--rad)) rotate(-360deg);opacity:0}}"+
".sfOrbit{font-size:26px;animation:sfOrbit 1.1s ease-in-out forwards}"+
"@keyframes sfNote{0%{transform:translate(-50%,-50%) translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(-50%,-50%) translate(var(--dx),-90px);opacity:0}}"+
".sfNote{font-size:26px;color:var(--c);text-shadow:0 0 10px var(--c);animation:sfNote 1.3s ease-out forwards}"+
"@keyframes sfTint{0%,100%{opacity:0}30%{opacity:var(--o,.35)}}"+
".sfTint{position:absolute;inset:0;animation:sfTint .7s ease-out forwards}"+
/* кнопки навыков */
".skill{--sk:#b48cff}"+
".skill:not(:disabled):not(.basic):not(.escape){border-color:color-mix(in srgb,var(--sk) 55%,#3a3340);overflow:hidden}"+
".skill:not(:disabled):not(.basic):not(.escape)::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,color-mix(in srgb,var(--sk) 35%,transparent) 50%,transparent 65%);transform:translateX(-120%);animation:skShine 4s ease-in-out infinite;pointer-events:none}"+
"@keyframes skShine{0%,60%{transform:translateX(-120%)}100%{transform:translateX(120%)}}"+
".skill .skIc{display:inline-block;margin-right:5px;animation:skBob 2.6s ease-in-out infinite;filter:drop-shadow(0 0 5px var(--sk))}"+
"@keyframes skBob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.12)}}"+
".skill .skTag{position:absolute;right:7px;top:6px;font-size:9px;letter-spacing:.08em;opacity:.55}"+
".skFm{display:flex;flex-wrap:wrap;align-items:center;gap:3px 4px;margin-top:6px;padding-top:5px;border-top:1px dashed #ffffff22;font-size:10px;line-height:1.3;color:#cfc3b2}"+
".skFm i{font-style:normal;font-size:8px;letter-spacing:.1em;opacity:.6;margin-right:1px}"+
".skFm .n{padding:1px 5px;border-radius:5px;background:#ffffff12;font-weight:700}"+
".skFm .st{padding:1px 5px;border-radius:5px;border:1px solid var(--c);color:var(--c);background:#0006;font-weight:700;white-space:nowrap}"+
".skFm em{margin-left:auto;font-style:normal;font-weight:800;color:#f2d98d}"+
".skFm.nn{opacity:.6}";

var layer=null;
function ensure(){
if(!document.getElementById("sfxCss")){var s=document.createElement("style");s.id="sfxCss";s.textContent=css;document.head.appendChild(s)}
if(!layer||!layer.isConnected){layer=document.createElement("div");layer.className="sfxLayer";document.body.appendChild(layer)}
return layer;
}
function ctr(el){var r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}}
function add(html,x,y,ms,cls,vars,tag){
var d=document.createElement(tag||"div");d.className="sfx "+(cls||"");
d.style.left=x+"px";d.style.top=y+"px";
if(vars)for(var k in vars)d.style.setProperty(k,vars[k]);
if(html!=null){if(typeof html==="string"&&html.charAt(0)==="<")d.innerHTML=html;else d.textContent=html}
ensure().appendChild(d);setTimeout(function(){d.remove()},ms||1000);return d;
}
function ring(p,c,dl){setTimeout(function(){add("",p.x,p.y,1000,"sfRing",{"--c":c})},dl||0)}
function burst(p,c,n,spread,ms){
for(var i=0;i<n;i++){var a=Math.random()*6.283,r=spread*(0.4+Math.random()*0.6);
add("",p.x,p.y,ms||900,"sfPart",{"--c":c,"--dx":Math.cos(a)*r+"px","--dy":Math.sin(a)*r+"px","--s":(4+Math.random()*7)+"px","--t":(0.5+Math.random()*0.5)+"s"})}
}
function pop(p,emoji,c,dl){setTimeout(function(){add(emoji,p.x,p.y,1050,"sfPop",{"--c":c})},dl||0)}
function slash(p,c,rot,dl){setTimeout(function(){add("",p.x,p.y,500,"sfSlash",{"--c":c,"--rot":rot})},dl||0)}
function tint(c,o){var t=document.createElement("div");t.className="sfx sfTint";t.style.cssText="left:0;top:0;transform:none;background:"+c;t.style.setProperty("--o",o||.3);ensure().appendChild(t);setTimeout(function(){t.remove()},800)}
function fly(a,b,html,cls,t,rot){return add(html,a.x,a.y,t*1000+100,"sfFly "+(cls||""),{"--dx":(b.x-a.x)+"px","--dy":(b.y-a.y)+"px","--t":t+"s","--r":(rot||0)+"deg"})}
function shake(){document.body.classList.remove("shake");void document.body.offsetWidth;document.body.classList.add("shake");setTimeout(function(){document.body.classList.remove("shake")},480)}

var FX={
slash:function(P,E){slash(E,"#d6b779","-35deg",180)},
divine:function(P){
ring(P,"#7aa8ff");
["🃏","🔮","✨","🂡"].forEach(function(e,i){add(e,P.x,P.y,1150,"sfOrbit",{"--rad":(46+i*4)+"px","animation-delay":(i*0.12)+"s"})});
pop(P,"🔮","#7aa8ff",150);
},
airbullet:function(P,E){
var tr=add('<svg width="120" height="16" viewBox="0 0 120 16"><defs><linearGradient id="abg"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect x="0" y="5" width="120" height="6" rx="3" fill="url(#abg)"/><circle cx="112" cy="8" r="7" fill="#fff"/></svg>',P.x,P.y,700,"sfFly",{"--dx":(E.x-P.x)+"px","--dy":(E.y-P.y)+"px","--t":".35s","--r":Math.atan2(E.y-P.y,E.x-P.x)+"rad"});
setTimeout(function(){ring(E,"#bfe6ff");burst(E,"#e8f6ff",14,70);shake()},340);
},
paper:function(P,E){
var f=fly(P,E,"📜","",.45,360);
setTimeout(function(){slash(E,"#f1e6c8","-30deg");burst(E,"#f1e6c8",10,60)},430);
setTimeout(function(){fly(E,P,"📜","",.5,720)},520);
},
masks:function(P,E){
tint("#6a2aa8",.35);
pop(E,"🎭","#c48cff");
[-50,50].forEach(function(dx,i){setTimeout(function(){pop({x:E.x+dx,y:E.y-20},i?"🎪":"🎭","#c48cff")},150+i*120)});
ring(E,"#c48cff",100);
},
storm:function(P,E){
tint("#fff6b0",.35);
var h=E.y;
add('<svg width="90" height="'+(h+20)+'" viewBox="0 0 90 '+(h+20)+'"><polyline points="45,0 28,'+h*0.25+' 58,'+h*0.4+' 30,'+h*0.65+' 52,'+h*0.75+' 40,'+h+'" fill="none" stroke="#fffbd0" stroke-width="6" stroke-linejoin="round" style="filter:drop-shadow(0 0 10px #ffe36a)"/><polyline points="45,0 28,'+h*0.25+' 58,'+h*0.4+' 30,'+h*0.65+' 52,'+h*0.75+' 40,'+h+'" fill="none" stroke="#ffe36a" stroke-width="2.5" stroke-linejoin="round"/></svg>',E.x,h/2,750,"sfBolt");
setTimeout(function(){burst(E,"#ffe36a",18,90);ring(E,"#ffe36a");shake()},120);
},
wave:function(P,E){
var w=document.createElement("div");w.className="sfx sfWaveWrap";w.style.cssText+=";left:0;right:0;top:"+E.y+"px;transform:translateY(-50%)";
w.innerHTML='<div><svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none"><path d="M0 150 L0 70 Q40 20 90 60 T180 50 T270 40 T360 20 Q390 5 400 40 L400 150Z" fill="#2a8ee0" fill-opacity=".85"/><path d="M0 150 L0 95 Q50 55 100 85 T200 75 T300 70 T400 60 L400 150Z" fill="#7fd0ff" fill-opacity=".8"/></svg></div>';
ensure().appendChild(w);setTimeout(function(){w.remove()},1000);
setTimeout(function(){burst(E,"#aee4ff",20,100);ring(E,"#4fb4ff");shake()},420);
},
lull:function(P,E){
tint("#0a2a4a",.45);
pop(E,"🌙","#7be3d8");
["♪","♫","💤","♪"].forEach(function(n,i){setTimeout(function(){add(n,E.x+(i-1.5)*22,E.y-10,1400,"sfNote",{"--c":"#7be3d8","--dx":(i-1.5)*14+"px"})},i*180)});
ring(E,"#7be3d8",150);
},
fury:function(P){
tint("#8a1010",.3);
ring(P,"#ff5d5d");ring(P,"#ffd84a",180);
burst(P,"#ff8a4a",22,90);
pop(P,"⚡","#ffd84a");
[-1,1].forEach(function(s){setTimeout(function(){pop({x:P.x+s*34,y:P.y-6},"⚡","#ff7b5e")},140)});
shake();
},
arrow:function(P,E){
add('<svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#ffd27a" stroke-width="3"><circle cx="32" cy="32" r="20"/><path d="M32 2v18M32 44v18M2 32h18M44 32h18"/><circle cx="32" cy="32" r="3" fill="#ff5d3a"/></svg>',E.x,E.y,800,"sfCross");
setTimeout(function(){
var a=Math.atan2(E.y-P.y,E.x-P.x);
add('<svg width="90" height="14" viewBox="0 0 90 14"><path d="M0 7h78" stroke="#e4ca91" stroke-width="3"/><path d="M78 0l12 7-12 7z" fill="#ffd27a"/><path d="M0 7l-6-6m6 6l-6 6" stroke="#ff6a3a" stroke-width="3"/></svg>',P.x,P.y,500,"sfFly",{"--dx":(E.x-P.x)+"px","--dy":(E.y-P.y)+"px","--t":".28s","--r":a+"rad"});
},250);
setTimeout(function(){burst(E,"#ffd27a",14,70);ring(E,"#ff6a3a");slash(E,"#ffd27a","-50deg")},560);
},
fire:function(P,E){
slash(E,"#ff5d3a","-40deg",180);
for(var i=0;i<5;i++)(function(i){setTimeout(function(){add("🔥",E.x+(i-2)*20,E.y+14,950,"sfFlame")},i*90)})(i);
burst(E,"#ff9a3a",24,95);burst(E,"#ffd27a",10,60);
ring(P,"#ff6a3a");
},
trap:function(P,E){
var s='<svg width="90" height="60" viewBox="0 0 90 60"><g style="transform-origin:10px 40px;--a:-40deg;animation:sfJaw .8s ease-in forwards"><path d="M10 40 L20 8 L30 38 L42 6 L52 38 L64 8 L74 40Z" fill="#c9bfa3" stroke="#6a5a38" stroke-width="2"/></g><g style="transform-origin:80px 20px;--a:40deg;animation:sfJaw .8s ease-in forwards"><path d="M80 20 L70 52 L58 22 L46 54 L36 22 L24 52 L14 20Z" fill="#b7ab8c" stroke="#6a5a38" stroke-width="2" transform="translate(-4,6)"/></g><rect x="4" y="38" width="82" height="8" rx="4" fill="#6a5a38"/></svg>';
add(s,E.x,E.y,1150,"sfSnap");
setTimeout(function(){shake();burst(E,"#d6b779",14,70);ring(E,"#d6b779")},700);
},
taunt:function(P,E){
pop(P,"❗","#ff5d5d");
[0,160,320].forEach(function(d){ring(P,"#ff5d5d",d)});
tint("#7a1010",.25);
pop(E,"💢","#ff5d5d",300);
}
};
function play(key,pEl,eEl){
var s=SK[key];if(!s||!s.fx||!FX[s.fx])return;
try{FX[s.fx](ctr(pEl),ctr(eEl))}catch(e){}
try{if(window.snd)snd(s.fx)}catch(e){}
}
/* кнопка навыка (в бою) */

var FCOL={str:"#ff8a6a",agi:"#7be3a0",int:"#7aa8ff",spi:"#d9a3ff",con:"#ffd27a"};
var FNAME={str:"Сила",agi:"Ловк.",int:"Инт.",spi:"Дух",con:"Тело"};
function formula(key){
var c=DMG[key];if(!c)return null;ensure();
var d=document.createElement("div");d.className="skFm";
function sp(t,cl,x){var e=document.createElement(t);if(cl)e.className=cl;e.textContent=x;return e}
if(c.none){d.classList.add("nn");d.textContent="Без зависимости от статов";return d}
d.appendChild(sp("i","",c.eff?"ЗАВИСИТ":"УРОН"));
if(c.s){
d.appendChild(sp("span","n",String(c.base)));
c.s.forEach(function(x){d.appendChild(sp("span","","+"));var e=sp("span","st",FNAME[x[0]]+" "+x[1]+"%");e.style.setProperty("--c",FCOL[x[0]]);d.appendChild(e)});
var S=window.LOTM_STATS;
if(S){var v=c.base;c.s.forEach(function(x){v+=Math.floor((+S[x[0]]||0)*x[1]/100)});d.appendChild(sp("em","","≈ "+v))}
}else if(c.eff){
c.eff.forEach(function(x){var e=sp("span","st",FNAME[x[0]]+" "+x[1]);e.style.setProperty("--c",FCOL[x[0]]);d.appendChild(e)});
}
return d;
}
function decorate(btn,key){
var s=SK[key];if(!s)return;ensure();
btn.style.setProperty("--sk",s.c);
}
try{if(document.head&&!document.getElementById('sfxCss')){var _s=document.createElement('style');_s.id='sfxCss';_s.textContent=css;document.head.appendChild(_s)}}catch(e){}
window.LOTM_SKILLS={DMG:DMG,SK:SK,ORDER:ORDER,PASS:PASS,PATHNAME:PATHNAME,pathKey:pathKey,list:list,play:play,decorate:decorate,formula:formula,css:css,ensure:ensure};
})();
