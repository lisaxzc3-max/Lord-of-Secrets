/* LOTM: каталог ингредиентов и зелий, рисунки-сигилы (всё рисуется кодом). */
(function(){
if(window.LOTM_ALCH)return;
var G={
fog_pearl:'<circle cx="12" cy="11" r="6"/><path d="M9 8.500a4 4 0 0 1 3-1.500" stroke-opacity=".7"/><path d="M4 19q2-1.500 4 0t4 0 4 0 4 0" stroke-opacity=".6"/>',
mirror_shard:'<path d="M12 3l6 7-3 11-8-4 1-9z"/><path d="M12 3l-3 8 6 2M9 11l-2 6" stroke-opacity=".6"/>',
raven_feather:'<path d="M5 20C6 10 12 4 20 4c0 8-6 13-13 13M5 20l8-8M10 14l3-1M8 17l3-1" />',
moon_dust:'<path d="M14 4a7 7 0 1 0 6 10 6 6 0 0 1-6-10z"/><circle cx="5" cy="6" r=".8" fill="currentColor"/><circle cx="8" cy="3.500" r=".6" fill="currentColor"/><circle cx="4" cy="11" r=".6" fill="currentColor"/>',
fate_thread:'<path d="M5 18c0-6 6-3 6-8S6 6 9 4M12 14c5 0 8 2 8 5M12 14c0-2 3-3 5-1"/><circle cx="9" cy="4" r="1.200"/><path d="M19 19l1.500 1.500" />',
serpent_scale:'<path d="M12 3c5 2 8 6 8 10 0 4-3 8-8 8s-8-4-8-8c0-4 3-8 8-10z"/><path d="M12 8c2 1 4 3 4 5M12 8c-2 1-4 3-4 5M12 8v12" stroke-opacity=".6"/>',
storm_crystal:'<path d="M12 2l6 5v10l-6 5-6-5V7z"/><path d="M13 6l-4 6h4l-2 6" stroke-opacity=".8"/>',
salt_root:'<path d="M12 3v7M12 10c-3 1-5 4-4 10M12 10c3 1 5 4 4 10M12 10v11M9 3q3 2 6 0"/>',
rust_anchor:'<path d="M12 4v13M8 9h8M5 14c1 4 4 6 7 6M15 18l3-1M9 3.500l3-1.500 3 1.500" /><path d="M16 15l3 3M19 15l-3 3" stroke-opacity=".6"/>',
thunder_tooth:'<path d="M7 3c-2 4-2 9 1 17 2-3 3-6 3-9 0 3 1 6 3 9 3-8 3-13 1-17z"/><path d="M13 6l-3 5h3l-2 5" stroke-opacity=".7"/>',
ruby_resin:'<path d="M12 3l7 5v8l-7 5-7-5V8z"/><path d="M12 8c2 3 3 4 3 6a3 3 0 0 1-6 0c0-2 1-3 3-6z" fill="currentColor" fill-opacity=".35"/>',
wolf_fang:'<path d="M6 4c8 0 12 4 12 12-1 3-3 5-5 5 1-5-1-10-7-13z"/><path d="M8 7q5 1 7 6" stroke-opacity=".6"/>',
ash_bloom:'<circle cx="12" cy="11" r="2"/><path d="M12 9C9 6 10 3 12 2c2 1 3 4 0 7zM10 11C7 8 4 9 3 11c1 2 4 3 7 0zM14 11c3-3 6-2 7 0-1 2-4 3-7 0zM12 13v8M9 17q3-2 3 4" /><circle cx="6" cy="20" r=".6" fill="currentColor"/><circle cx="18" cy="19" r=".6" fill="currentColor"/>',
blood_drop:'<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/><path d="M9 14a3 3 0 0 0 3 3" stroke-opacity=".6"/><path d="M8 20h8" stroke-opacity=".5"/>',
night_claw:'<path d="M6 3c-1 8 1 14 6 18M11 3c-1 8 1 14 6 18M16 3c0 5 1 9 4 13"/>'
};
var ING={
fog_pearl:{n:"Туманная жемчужина",r:3,d:"Холодная жемчужина с клубящимся туманом внутри. Говорят, она помнит чужие сны."},
mirror_shard:{n:"Осколок зеркала",r:2,d:"Острый осколок. В нём отражается не то, что стоит перед ним."},
raven_feather:{n:"Перо чёрного ворона",r:1,d:"Чёрное перо вестника. Пахнет дымом и старой бумагой."},
moon_dust:{n:"Лунная пыль",r:1,d:"Серебристая пыль, собранная под полной луной."},
fate_thread:{n:"Нить судьбы",r:3,d:"Тонкая нить, которая сама находит узел."},
serpent_scale:{n:"Чешуя морского змея",r:3,d:"Тяжёлая чешуя размером с ладонь. Холодная даже у огня."},
storm_crystal:{n:"Грозовой кристалл",r:2,d:"Внутри застыла молния. Слегка гудит."},
salt_root:{n:"Солёный корень",r:1,d:"Корень, выросший у самой воды. На вкус — слёзы."},
rust_anchor:{n:"Ржавый осколок якоря",r:1,d:"Кусок якоря, который никто не поднимал со дна."},
thunder_tooth:{n:"Клык шторма",r:2,d:"Клык существа, пришедшего вместе с бурей."},
ruby_resin:{n:"Рубиновая смола",r:2,d:"Красная смола, застывшая как кровь. Горит тихо и долго."},
wolf_fang:{n:"Клык костяного волка",r:1,d:"Жёлтый клык. Нет ни крови, ни запаха — только холод."},
ash_bloom:{n:"Пепельный цвет",r:1,d:"Цветок, растущий на пожарищах. Рассыпается от прикосновения."},
blood_drop:{n:"Застывшая кровь",r:3,d:"Капля, которая так и не свернулась. Тёплая на ощупь."},
night_claw:{n:"Коготь ночного хищника",r:2,d:"Чёрный коготь. Оставляет три тонких следа."}
};
var ORDER=["fog_pearl","mirror_shard","raven_feather","moon_dust","fate_thread","serpent_scale","storm_crystal","salt_root","rust_anchor","thunder_tooth","ruby_resin","wolf_fang","ash_bloom","blood_drop","night_claw"];
var POT={
clown:{n:"Зелье Клоуна",p:"seer",c:"#8a7fb0",info:"Последовательность 8 · Путь Шута",d:"Дымчатая жидкость, в которой мелькают чужие лица. Зелье следующей ступени Провидца."},
rage:{n:"Зелье Народа Ярости",p:"sailor",c:"#4f8f94",info:"Последовательность 8 · Путь Тирана",d:"Тёмное, как море перед бурей. Зелье следующей ступени Матроса."},
provoker:{n:"Зелье Провокатора",p:"hunter",c:"#a3262e",info:"Последовательность 8 · Путь Красного Жреца",d:"Густое и красное. Зелье следующей ступени Охотника."}
};
var RAR=["","#cdbf9f","#8fb3a6","#d6b779"], RARN=["","Обычный","Необычный","Редкий"];
var _cs=document.currentScript,ART=(_cs&&_cs.src?_cs.src.replace(/[^\/]*(\?.*)?$/,""):"shared/")+"art/alch/";
function glyph(id,cls){
 if(ING[id])return '<svg class="'+(cls||"")+'" viewBox="0 0 24 24" aria-hidden="true"><image href="'+ART+id+'.webp?v=1" width="24" height="24"/></svg>';
 return '<svg class="'+(cls||"")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'+(G[id]||"")+'</svg>';
}
function potion(pid,cls){
 if(POT[pid])return '<svg class="'+(cls||"")+'" viewBox="0 0 64 80" aria-hidden="true"><image href="'+ART+'pot_'+pid+'.webp?v=1" width="64" height="80" preserveAspectRatio="xMidYMid meet"/></svg>';
 var c=(POT[pid]||{c:"#8a7a58"}).c;
 return '<svg class="'+(cls||"")+'" viewBox="0 0 64 80" fill="none"><defs><linearGradient id="pl'+pid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c+'" stop-opacity=".95"/><stop offset="1" stop-color="#050306" stop-opacity=".95"/></linearGradient></defs>'+
 '<path d="M26 6h12v4l-2 2v10c9 4 16 12 16 24 0 12-8 22-20 22S12 58 12 46c0-12 7-20 16-24V12l-2-2z" fill="#0b0810" stroke="#8a7a58" stroke-width="1.6"/>'+
 '<path d="M14 44c0 11 7 20 18 20s18-9 18-20c-6 3-12-3-18 0s-12 3-18 0z" fill="url(#pl'+pid+')"/>'+
 '<path d="M24 6h16" stroke="#cdbf9f" stroke-width="2"/><path d="M20 30c-3 4-5 8-5 13" stroke="#cdbf9f" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>'+
 '<circle cx="28" cy="52" r="2" fill="#cdbf9f" fill-opacity=".35"/><circle cx="38" cy="47" r="1.400" fill="#cdbf9f" fill-opacity=".3"/></svg>';
}
window.LOTM_ALCH={ING:ING,ORDER:ORDER,POT:POT,glyph:glyph,potion:potion,RAR:RAR,RARN:RARN,G:G};
})();
