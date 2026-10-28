/* Описание навыков врага: нажми на врага в бою — откроется, нажми ещё раз — закроется. */
(function(){
"use strict";
var INFO={
"Жаба":{role:"Болотная тварь",skills:[
 ["🐸","Язык-хлыст","Каждый 3-й ход бьёт сильнее обычного (×1.5)."],
 ["🐸","Склизкий прыжок","Иногда прыгает и подлечивается."]]},
"Утопленница":{role:"Утонувшая путница",skills:[
 ["🌊","Утягивание на дно","Каждый 3-й ход бьёт тяжело (×1.6)."],
 ["🌊","Ледяной шёпот","Урон слабее, но прибавляет безумие."]]},
"Утопленник":{role:"Утонувший путник",skills:[
 ["🌊","Утягивание на дно","Каждый 3-й ход бьёт тяжело (×1.6)."],
 ["🌊","Ледяной шёпот","Урон слабее, но прибавляет безумие."]]},
"Змей":{role:"Босс озёр",skills:[
 ["🐍","Ядовитый укус","Обычный удар с накопительным ядом."],
 ["🌀","Кольца → Удушение","Змей сворачивается в кольца, а следующим ходом бьёт очень больно (×2.2). Готовься к удару."],
 ["🐍","Линька (фаза 2)","На половине здоровья восстанавливает часть HP, бьёт сильнее и душит чаще."]]},
"Гриб-спорник":{role:"Лесной гриб",skills:[
 ["🍄","Усыпляющие споры","Враг не бьёт, но ты можешь уснуть и пропустить ход."],
 ["🍄","Грибной шип","Усиленный удар (×1.5)."],
 ["🍄","Ядовитые споры","Слабый удар, но с отравлением."]]},
"Паук-ткач":{role:"Лесной охотник",skills:[
 ["🕸","Связывание паутиной","Твой урон снижается, а бегство невозможно на 2 хода."],
 ["🕷","Яд","Накладывает накопительное отравление."],
 ["🕷","Укус","Обычный удар, на 4-м ходу цикла сильнее."]]},
"Проклятое дерево":{role:"Живая древесина",skills:[
 ["🌳","Щит из веток","Покрывается небольшим щитом, который впитывает твой урон."],
 ["🌳","Удар корнями","Мощный удар (×1.7)."],
 ["🌳","Передышка","Дерево отдыхает и не бьёт — щит трескается. Лучшее время для атаки."],
 ["🌳","Удар ветками","Усиленный удар (×1.4)."]]},
"Шипастый кабан":{role:"Дикий зверь",skills:[
 ["🐗","Рытьё копытом","Готовится к тарану — следующий удар будет вдвое сильнее."],
 ["🐗","Таран","Бьёт на полную; после рытья — ×2."],
 ["🐗","Насадить на клыки","Усиленный удар (×1.3)."],
 ["🐗","Бег по кругу","Все твои удары в этот ход мимо."]]},
"Костяной волк":{role:"Нежить леса",skills:[
 ["🐺","Разгрызание","Сильный удар (×1.5)."],
 ["🐺","Вой","Не бьёт, но ослабляет твой урон на 2 хода."],
 ["🐺","Удар хвостом","Слабее, с побочным эффектом."],
 ["🦴","Костяная броня","Пока здоровья много, часть твоего урона срезается."]]},
"Лиса-оборотень":{role:"Босс леса",skills:[
 ["🦊","Царапание","Быстрый двойной удар (×1.4)."],
 ["🦊","Иллюзии","Создаёт копии — часть твоих ударов уходит в пустоту."],
 ["🦊","Обман","Притворяется мёртвой — береги ход."],
 ["🦊","Кицунэ (фаза 2)","На половине здоровья: Соблазнение, Иссушение и Поглощение жизни — враг лечится за твой счёт."]]},
"Призрак":{role:"Неупокоенный",skills:[
 ["👻","Холодное касание","Удар с охлаждением — твой урон снижен."],
 ["👻","Растворяется в тумане","Все твои удары в этот ход мимо."],
 ["👻","Стон мертвеца","Прибавляет безумие и может оглушить на ход."],
 ["👻","Вселение","Сильный удар (×1.5) и безумие."],
 ["🌫","Бестелесность","Часть твоего урона проходит сквозь него."]]},
"Гуль":{role:"Падальщик",skills:[
 ["🧟","Трупный укус","Сильный удар (×1.3) с заразой."],
 ["🧟","Раздирание","Очень сильный удар (×1.7)."],
 ["🧟","Пожирает падаль","Не бьёт, но восстанавливает себе здоровье."]]},
"Скелет-страж":{role:"Страж склепа",skills:[
 ["🛡","Костяной щит","Закрывается щитом, который впитывает твой урон."],
 ["⚔","Удар ржавым мечом","Усиленный удар (×1.5)."],
 ["🛡","Бросок щитом","Бьёт и ослабляет твой урон."],
 ["⚔","Рубящий удар","Тяжёлый удар (×1.4)."],
 ["🦴","Костяная броня","Постоянно срезает часть твоего урона."]]},
"Могильный червь":{role:"Хищник земли",skills:[
 ["🪱","Зарывается в землю","Все твои удары в этот ход мимо."],
 ["🪱","Выпад из-под земли","Очень сильный удар (×2.0)."],
 ["🪱","Кислотная слизь","Слабый удар, но с кислотным ядом."],
 ["🪱","Регенерация","Медленно лечится каждый ход."]]},
"Плакальщица":{role:"Дух скорби",skills:[
 ["😱","Вопль плакальщицы","Не бьёт, но давит на разум."],
 ["😱","Режущий крик","Бьёт и ослабляет твой урон."],
 ["😱","Предсмертный плач","Мощный удар (×1.6) — и она лечится."]]},
"Некромант-самоучка":{role:"Босс кладбища",skills:[
 ["💀","Призыв скелета","Скелет принимает твои удары вместо Некроманта."],
 ["🔮","Тёмный болт","Удар магией (×1.4)."],
 ["☠","Проклятие","Отравляет и ослабляет твой урон."],
 ["💀","Костяное копьё","Сильный удар (×1.6)."],
 ["🩸","Запретный ритуал (фаза 2)","На половине здоровья: Ритуальный круг, Взрыв тьмы и Высасывание души — враг лечится за твой счёт."]]},
"Фанатик с кинжалом":{role:"Сектант",skills:[
 ["🗡","Молитва рвения","Не бьёт, но следующий удар будет вдвое сильнее. Лучше добить его до молитвы."],
 ["🗡","Жертвенный удар","Если помолился — ×2, иначе ×1.3. Вызывает кровотечение."],
 ["🗡","Отравленный кинжал","Удар (×1.2) с ядом: 2 урона в ход, 3 хода."]]},
"Каменная горгулья":{role:"Страж-статуя",skills:[
 ["🗿","Каменная кожа","Покрывается каменным щитом, который впитывает твой урон. Пробей его и бей."],
 ["🗿","Удар крыла","Сильный удар (×1.6)."],
 ["🗿","Пике с высоты","Удар (×1.3), сбивает твои усиления."],
 ["🗿","Каменный кулак","Самый тяжёлый удар (×1.8)."]]},
"Одержимый стражник":{role:"Одержимый",skills:[
 ["🛡","Стойка стража","Поднимает щит, который впитывает твой урон."],
 ["⚔","Удар алебарды","Сильный удар (×1.4)."],
 ["👁","Чужая воля","Удар (×1.3), прибавляет безумие."],
 ["⚔","Рассекающий удар","Тяжёлый удар (×1.7)."],
 ["🛡","Доспех","Часть твоего урона всегда срезается."]]},
"Крыса-мутант":{role:"Мутант",skills:[
 ["🐀","Гнилой укус","Удар (×1.2) с отравлением."],
 ["🐀","Юркнула в щель","Не бьёт, но все твои удары в этот ход мимо."],
 ["🐀","Бросок из темноты","Сильный удар (×1.6)."],
 ["🐀","Регенерация","Каждый ход восстанавливает здоровье."]]},
"Пепельный культист":{role:"Маг-сектант",skills:[
 ["🔥","Пепельный огонь","Удар (×1.3), поджигает на 2 хода."],
 ["🔥","Заклинание пепла","Не бьёт, но ослабляет твой урон на 2 хода."],
 ["🔥","Огненный шар","Сильный удар (×1.7), поджигает."],
 ["💨","Рассеивается пеплом","Не бьёт, но все твои удары в этот ход мимо."]]},
"Верховный жрец":{role:"Босс руин",skills:[
 ["🕯","Призыв прислужников","Поднимает щит и немного лечится. Прислужники принимают твои удары."],
 ["✝","Кара культа","Сильный удар (×1.4)."],
 ["☠","Проклятие культа","Отравляет и ослабляет твой урон."],
 ["🔱","Жертвенный нож","Тяжёлый удар (×1.7) с кровотечением."],
 ["🔥","Чёрная литургия (фаза 2)","На половине здоровья: Алтарь жертвы (щит), Гнев культа и Высасывание жертвы. Жрец лечится за твой счёт."]]}
};
var css=document.createElement("style");
css.textContent=
".eiBadge{position:absolute;right:5px;top:5px;z-index:6;width:20px;height:20px;border-radius:50%;background:#000a;border:1px solid #e2c27a99;color:#e2c27a;font:700 12px/18px Georgia,serif;text-align:center;pointer-events:none;animation:eiPulse 2.4s ease-in-out infinite}"+
"@keyframes eiPulse{50%{box-shadow:0 0 10px #e2c27acc;transform:scale(1.12)}}"+
".eiOn .eiBadge{background:#e2c27a;color:#1a1020;animation:none}"+
"#enemyInfo{position:relative;overflow:hidden;max-height:0;opacity:0;margin:0 0 0;border:1px solid transparent;border-radius:14px;background:linear-gradient(160deg,#241a38f2,#120c1ef2);transition:max-height .45s cubic-bezier(.2,.8,.2,1),opacity .3s,margin .3s,border-color .3s}"+
"#enemyInfo.open{max-height:900px;opacity:1;margin:10px 0 2px;border-color:#6a58a0;box-shadow:0 0 20px #8a5cff33}"+
"#enemyInfo .eiIn{padding:11px 12px}"+
"#enemyInfo .eiHead{display:flex;justify-content:space-between;align-items:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#e2c27a;margin-bottom:8px}"+
"#enemyInfo .eiHead b{font-size:13px;letter-spacing:.5px;color:#fff;text-transform:none}"+
"#enemyInfo .eiHead span{color:#a99dba;letter-spacing:1px}"+
"#enemyInfo .eiS{display:flex;gap:9px;padding:7px 0;border-top:1px solid #ffffff0f;opacity:0;transform:translateX(-10px)}"+
"#enemyInfo.open .eiS{animation:eiIn .4s ease-out forwards;animation-delay:calc(var(--i)*70ms + 120ms)}"+
"@keyframes eiIn{to{opacity:1;transform:none}}"+
"#enemyInfo .eiI{flex:0 0 28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;background:#0006;border:1px solid #5a4a80}"+
"#enemyInfo .eiN{font-weight:800;font-size:12px;color:#f2e6c8}"+
"#enemyInfo .eiD{font-size:11px;color:#b8accb;line-height:1.4;margin-top:1px}"+
"#enemyInfo .eiNo{font-size:12px;color:#a99dba;padding:6px 0}"+
"@media(prefers-reduced-motion:reduce){#enemyInfo,#enemyInfo .eiS,.eiBadge{transition:none!important;animation:none!important;opacity:1!important;transform:none!important}}";
document.head.appendChild(css);

function init(){
 if(INFO["Лиса-оборотень"]&&!INFO["Кицунэ"])INFO["Кицунэ"]=INFO["Лиса-оборотень"];
 var frame=document.getElementById("enemyFrame");
 var label=document.getElementById("enemyLabel");
 if(!frame||!label)return;
 var card=frame.closest(".fighter");
 var fighters=card&&card.parentElement;
 if(!card||!fighters)return;
 var panel=document.createElement("div");panel.id="enemyInfo";panel.setAttribute("role","region");panel.setAttribute("aria-label","Навыки врага");
 fighters.parentNode.insertBefore(panel,fighters.nextSibling);
 var badge=document.createElement("i");badge.className="eiBadge";badge.textContent="i";badge.setAttribute("aria-hidden","true");
 frame.style.position=frame.style.position||"relative";frame.appendChild(badge);
 card.style.cursor="pointer";card.setAttribute("role","button");card.setAttribute("tabindex","0");card.setAttribute("aria-expanded","false");

 function find(name){
  for(var k in INFO){if(name.indexOf(k)>=0)return k}
  return "";
 }
 function build(){
  var name=(label.textContent||"").trim();var key=find(name);
  var d=key?INFO[key]:null;
  var h='<div class="eiIn"><div class="eiHead"><b>'+(key||name||"Противник")+'</b><span>'+(d?d.role:"")+' · нажми, чтобы скрыть</span></div>';
  if(d){d.skills.forEach(function(s,i){h+='<div class="eiS" style="--i:'+i+'"><div class="eiI">'+s[0]+'</div><div><div class="eiN">'+s[1]+'</div><div class="eiD">'+s[2]+'</div></div></div>'})}
  else h+='<div class="eiNo">Об этом враге пока ничего не известно.</div>';
  panel.innerHTML=h+"</div>";
 }
 function toggle(){
  var open=!panel.classList.contains("open");
  if(open){build();void panel.offsetWidth}
  panel.classList.toggle("open",open);
  card.classList.toggle("eiOn",open);card.setAttribute("aria-expanded",open?"true":"false");
  try{window.snd&&window.snd(open?"open":"back")}catch(e){}
 }
 card.addEventListener("click",toggle);
 card.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}});
 panel.addEventListener("click",function(){if(panel.classList.contains("open"))toggle()});
 /* новый враг — закрыть панель */
 var lastName=(label.textContent||"").trim();
 try{new MutationObserver(function(){var nn=(label.textContent||"").trim();if(nn===lastName)return;lastName=nn;if(panel.classList.contains("open")){panel.classList.remove("open");card.classList.remove("eiOn");card.setAttribute("aria-expanded","false")}}).observe(label,{childList:true,characterData:true,subtree:true})}catch(e){}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
