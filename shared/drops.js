/* Повелитель Тайн — мини-иконки выпавших ингредиентов и снаряжения (бой, события). */
(function(){
"use strict";
if(window.LOTM_DROPS)return;
var cs=document.currentScript,BASE=(cs&&cs.src?cs.src.replace(/[^\/]*(\?.*)?$/,""):"../../shared/")+"art/";
var ING={"Туманная жемчужина": "fog_pearl", "Осколок зеркала": "mirror_shard", "Перо чёрного ворона": "raven_feather", "Лунная пыль": "moon_dust", "Нить судьбы": "fate_thread", "Чешуя морского змея": "serpent_scale", "Грозовой кристалл": "storm_crystal", "Солёный корень": "salt_root", "Ржавый осколок якоря": "rust_anchor", "Клык шторма": "thunder_tooth", "Рубиновая смола": "ruby_resin", "Клык костяного волка": "wolf_fang", "Пепельный цвет": "ash_bloom", "Застывшая кровь": "blood_drop", "Коготь ночного хищника": "night_claw"};
var GEAR={"Капюшон Серого Тумана": "head", "Маска Безликого": "face", "Плащ Шепчущих Теней": "body", "Лунный Стилет": "weapon", "Сапоги Безмолвных Шагов": "legs", "Подвеска Оловянного Ока": "necklace", "Перстень Забытых Имён": "ring"};
var css=document.createElement("style");
css.textContent=".dpRow{display:flex;align-items:center;gap:7px;text-align:left;font:700 12px/1.25 system-ui,sans-serif;color:#f1e8d3;margin:4px 0}"+
".dpRow img{flex:0 0 30px;width:30px;height:30px;object-fit:contain;filter:drop-shadow(0 2px 3px #000a)}"+
".dpRow b{display:block;font-weight:700}.dpRow small{display:block;font-weight:400;font-size:10px;color:#a79db4}"+
".rchip.drop{display:inline-flex;align-items:center;gap:7px;color:#f1e8d3;border-color:#8a7348}"+
".rchip.drop img{width:26px;height:26px;object-fit:contain;margin:-3px 0}";
document.head.appendChild(css);
function img(kind,name){
 var k=kind==="ing"?ING[name]:GEAR[name];if(!k)return "";
 return '<img alt="" draggable="false" src="'+BASE+(kind==="ing"?"alch/":"gear/")+k+'.webp?v=1">';
}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function names(str){return String(str||"").split(/\s*,\s*/).map(function(x){return x.trim()}).filter(Boolean)}
/* строки «иконка + название + тип» для карточки победы */
function rows(kind,list){
 var tag=kind==="ing"?"Ингредиент":"Снаряжение";
 return list.map(function(n){return '<div class="dpRow">'+(img(kind,n)||"<span>"+(kind==="ing"?"🧪":"🎒")+"</span>")+"<span><b>"+esc(n)+"</b><small>"+tag+"</small></span></div>"}).join("");
}
function ingFromText(t){var m=String(t||"").match(/🧪\s*(?:Найдено:\s*)?([^·\n]+)/);return m?names(m[1]):[]}
/* чипы в результате события */
function addFromResult(grid,r){
 if(!grid||!r)return;
 var list=[];
 if(r.find)list=names(r.find);else list=ingFromText(r.text);
 list.forEach(function(n,i){
  var c=document.createElement("span");c.className="rchip drop";c.style.animationDelay=(0.1+i*0.12)+"s";
  c.innerHTML=(img("ing",n)||"🧪")+"<span>"+esc(n)+"</span>";grid.appendChild(c);
 });
}
window.LOTM_DROPS={ing:function(n){return ING[n]||null},gear:function(n){return GEAR[n]||null},rows:rows,ingFromText:ingFromText,names:names,addFromResult:addFromResult};
})();
