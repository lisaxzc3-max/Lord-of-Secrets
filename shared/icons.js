/* LOTM: руны и сигилы вместо эмодзи. Подключается из sound.js; следит за DOM. */
(function(){
if(window.__lotmIcons)return;window.__lotmIcons=1;
var G={
coin:'<circle cx="12" cy="12" r="8.5"/><path d="M10 16.500h5M10.500 16.500c.8-1.200.8-2.400.5-3.600C10.600 11 10.800 8 13 8c1 0 1.600.5 1.800 1.200M9.500 12.400h4"/>',
spark:'<path d="M12 3c.6 5 2.400 7.400 9 9-6.600 1.600-8.400 4-9 9-.6-5-2.400-7.400-9-9 6.600-1.600 8.400-4 9-9z"/>',
warn:'<path d="M12 3.500l9.500 16.500h-19z"/><path d="M12 10v5M12 17.500v.5"/>',
scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v1H9v11a2 2 0 0 1-4 0V6a2 2 0 0 1 2-2zM9 7v11a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-1"/><path d="M12 10h5M12 13h5" stroke-opacity=".6"/>',
skull:'<path d="M12 3.500c-4.400 0-7 2.800-7 6.500 0 2.300 1 3.800 2.500 4.800V18h9v-3.200c1.500-1 2.500-2.500 2.500-4.800 0-3.700-2.600-6.500-7-6.500z"/><circle cx="9.200" cy="10.500" r="1.600" fill="currentColor"/><circle cx="14.800" cy="10.500" r="1.600" fill="currentColor"/><path d="M10.500 18v2.500M13.500 18v2.500"/>',
tomb:'<path d="M6 20V10a6 6 0 0 1 12 0v10zM3 20h18M12 8v6M9.500 10.500h5"/>',
orb:'<circle cx="12" cy="11" r="7"/><path d="M7 11q5-5 10 0q-5 5-10 0z"/><circle cx="12" cy="11" r="1.800" fill="currentColor"/><path d="M8 20h8M9.500 18l-1 2M14.500 18l1 2"/>',
swords:'<path d="M5 19L18 6M18 6h-4M18 6v4M19 19L6 6M6 6h4M6 6v4M3.500 16.500l4 4M20.500 16.500l-4 4"/>',
moon:'<path d="M18.500 14.500A7.500 7.500 0 0 1 9.500 5.500a7.500 7.500 0 1 0 9 9z"/>',
box:'<path d="M4 9h16v11H4zM3 5h18v4H3zM12 9v11"/>',
star:'<path d="M12 3.500l2.600 5.400 5.900.8-4.300 4.100 1 5.800L12 16.800 6.800 19.600l1-5.800L3.500 9.700l5.900-.8z"/>',
ghost:'<path d="M5 20V11a7 7 0 0 1 14 0v9l-2.500-2-2 2-2.500-2-2.500 2-2-2z"/><circle cx="9.500" cy="11" r="1.200" fill="currentColor"/><circle cx="14.500" cy="11" r="1.200" fill="currentColor"/>',
drop:'<path d="M12 3.500c3.500 4.500 6 7.500 6 11a6 6 0 0 1-12 0c0-3.500 2.500-6.500 6-11z"/><path d="M9.500 15a2.500 2.500 0 0 0 2.500 2.500" stroke-opacity=".6"/>',
heart:'<path d="M12 20S4 14.500 4 9.200A4.200 4.200 0 0 1 12 7.500 4.200 4.200 0 0 1 20 9.200C20 14.500 12 20 12 20z"/>',
spiral:'<path d="M12 12.500a1 1 0 1 1 1.500-1 2.500 2.500 0 1 1-3.500 2.500 4.500 4.500 0 1 1 6.500-3 6.500 6.500 0 1 1-9.500 5.500"/>',
waves:'<path d="M3 8q3-3 6 0t6 0 6 0M3 13q3-3 6 0t6 0 6 0M3 18q3-3 6 0t6 0 6 0"/>',
flask:'<path d="M9.500 3.500h5M10.500 3.500v6L5 19a1.500 1.500 0 0 0 1.300 2h11.400A1.500 1.500 0 0 0 19 19l-5.500-9.500v-6"/><path d="M8 15h8" stroke-opacity=".6"/>',
shield:'<path d="M12 3l7.500 2.500v6c0 5-3.500 8.500-7.500 10-4-1.500-7.500-5-7.500-10v-6z"/><path d="M12 7v11" stroke-opacity=".5"/>',
paw:'<ellipse cx="12" cy="16" rx="4.500" ry="3.600"/><circle cx="6" cy="11" r="1.800"/><circle cx="10" cy="7" r="1.800"/><circle cx="14" cy="7" r="1.800"/><circle cx="18" cy="11" r="1.800"/>',
flame:'<path d="M12 3c1 4 5.500 6 5.500 11a5.500 5.500 0 0 1-11 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3C10 9 10.500 5.500 12 3z"/>',
mush:'<path d="M4 12a8 7 0 0 1 16 0zM9.500 12v6.500a2.500 2.500 0 0 0 5 0V12"/><circle cx="9" cy="9" r=".9" fill="currentColor"/><circle cx="14.500" cy="8.500" r=".9" fill="currentColor"/>',
bag:'<path d="M9 6a3 3 0 0 1 6 0M7 6h10l2 14H5zM9 11h6"/>',
bolt:'<path d="M13.500 3L6 13.500h5L10 21l8-11h-5z"/>',
target:'<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="4.500"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
candle:'<rect x="8.500" y="10" width="7" height="10" rx=".5"/><path d="M12 10V8.500M12 7.500c-2-1.500-2-3.500 0-5 2 1.500 2 3.500 0 5zM6 20h12"/>',
web:'<path d="M12 3v18M4 7l16 10M20 7L4 17"/><path d="M8 5.500q4 3.500 8 0M6 9q6 5 12 0M5 13q7 6 14 0" stroke-opacity=".7"/>',
frog:'<path d="M5 15a7 6 0 0 1 14 0c0 2.500-3 4-7 4s-7-1.500-7-4z"/><circle cx="8.500" cy="9" r="2.200"/><circle cx="15.500" cy="9" r="2.200"/><circle cx="8.500" cy="9" r=".7" fill="currentColor"/><circle cx="15.500" cy="9" r=".7" fill="currentColor"/><path d="M9 16q3 1.500 6 0"/>',
tree:'<path d="M12 3l5 7h-3l4 6H6l4-6H7z"/><path d="M12 16v5"/>',
leaf:'<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l8-8"/>',
beast:'<path d="M4 4l5 3h6l5-3-1 8c0 4-3 8-7 9-4-1-7-5-7-9z"/><circle cx="9.500" cy="12" r=".9" fill="currentColor"/><circle cx="14.500" cy="12" r=".9" fill="currentColor"/><path d="M11 16.500h2"/>',
snake:'<path d="M6 20c-3 0-3-4 0-4h8c3 0 3-5 0-5H9C5.500 11 5.500 6 9 6h7M16 6l3-1.500M16 6l3 1.500"/>',
owl:'<path d="M6 5l3 2h6l3-2v11c0 3-3 5-6 5s-6-2-6-5z"/><circle cx="9.500" cy="11" r="2"/><circle cx="14.500" cy="11" r="2"/><circle cx="9.500" cy="11" r=".6" fill="currentColor"/><circle cx="14.500" cy="11" r=".6" fill="currentColor"/><path d="M12 13l-.8 2h1.600z"/>',
bird:'<path d="M3 12c4-1 6-4 9-7 1 3 3 5 9 7-6 0-7 3-9 7-2-4-5-6-9-7z"/>',
mask:'<path d="M4 6c5-2 11-2 16 0v6c0 5-4 8-8 8s-8-3-8-8z"/><path d="M7.500 11q2-1.500 4 0M12.500 11q2-1.500 4 0M9.500 15.500q2.500 1.500 5 0"/>',
run:'<circle cx="14" cy="5" r="2"/><path d="M9 21l3-6-3-3 2-4 4 1 3 3M12 15l4 2 1 4M10.500 9.500L7 11"/>',
look:'<circle cx="10.500" cy="10.500" r="6"/><path d="M15 15l6 6"/>',
glass:'<path d="M6 3h12M6 21h12M7 3c0 5 3 6 5 9-2 3-5 4-5 9M17 3c0 5-3 6-5 9 2 3 5 4 5 9"/>',
bow:'<path d="M7 3q13 9 0 18M7 3v18M3 12h16M16 9l3 3-3 3"/>',
mist:'<path d="M3 8h13a3 3 0 1 0-3-3M3 13h18a3 3 0 1 1-3 3M3 18h9"/>',
eye:'<path d="M2.500 12C5 7 8.500 5 12 5s7 2 9.500 7c-2.500 5-6 7-9.500 7s-7-2-9.500-7z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
hand:'<path d="M8 12V5.500a1.500 1.500 0 0 1 3 0V11M11 11V4a1.500 1.500 0 0 1 3 0v7M14 11V5.500a1.500 1.500 0 0 1 3 0V13M17 13v-1.500a1.500 1.500 0 0 1 3 0V16c0 4-3 6-6 6s-5-1.500-6.500-4L4 13.500a1.500 1.500 0 0 1 2.500-1.500L8 14"/>',
quill:'<path d="M20 4C12 4 7 9 6 17l-2 3M20 4c0 8-5 13-13 13M10 14l6-6"/>',
zzz:'<path d="M4 6h6L4 12h6M13 12h5l-5 5h5"/>',
hood:'<path d="M12 3C7 3 5 8 5 13l-2 8h18l-2-8c0-5-2-10-7-10z"/><path d="M8.500 12c0-3 7-3 7 0v3c0 2-7 2-7 0z" stroke-opacity=".6"/>',
worm:'<path d="M5 19c-2-4 1-6 4-6s5-2 4-5 2-5 5-3"/><circle cx="18" cy="5" r="1" fill="currentColor"/>',
stone:'<path d="M7 21V9l2-5h6l2 5v12zM9.500 11h5M10 15h4"/>',
cup:'<path d="M6 4h12v6a6 6 0 0 1-12 0zM12 16v4M8 20h8M6 6H3v2a3 3 0 0 0 3 3M18 6h3v2a3 3 0 0 1-3 3"/>',
hat:'<path d="M4 17h16M7 17l1-9h8l1 9M7.500 13h9"/>',
boot:'<path d="M8 3h6v8l6 4v5H6z"/>',
ring:'<circle cx="12" cy="14" r="6"/><path d="M9 6l3-3 3 3-3 3z"/>',
bowl:'<path d="M3 11h18a9 8 0 0 1-18 0zM8 7q1-2 0-4M12 7q1-2 0-4M16 7q1-2 0-4"/>',
compass:'<circle cx="12" cy="12" r="9"/><path d="M15.500 8.500L13.500 13.500 8.500 15.500 10.500 10.500z"/>',
crown:'<path d="M4 18l-1-10 5 4 4-7 4 7 5-4-1 10zM4 21h16"/>',
man:'<circle cx="12" cy="8" r="3.500"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6z"/>',
men:'<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.500 2.500-5.500 6-5.500s6 2 6 5.500zM16 5.500a3 3 0 0 1 0 5.500M17 14c3 .5 4.500 2.500 4.500 5"/>',
house:'<path d="M3 12L12 4l9 8M5.500 10.500V20h13v-9.500M10 20v-6h4v6"/>',
castle:'<path d="M4 21V6h3v2h2V6h6v2h2V6h3v15zM10 21v-5a2 2 0 0 1 4 0v5"/>',
hall:'<path d="M3 9l9-5 9 5zM5 11v8M10 11v8M14 11v8M19 11v8M3 21h18"/>',
door:'<path d="M6 21V4h12v17M3 21h18M14.500 12.500v.5"/>',
tower:'<path d="M12 2v4M9 21l2-15h2l2 15M8 12h8M7.500 17h9"/>',
gear:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6.500" stroke-opacity=".5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M18.400 5.600l-2.100 2.100M7.700 16.300l-2.100 2.100"/>',
lock:'<rect x="5" y="11" width="14" height="10" rx="1.500"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
chat:'<path d="M4 5h16v11H11l-5 4v-4H4z"/>',
snd:'<path d="M4 9h4l5-4v14l-5-4H4zM16 9q3 3 0 6M18.500 6.500q5 5.500 0 11"/>',
mute:'<path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="1.500"/><path d="M3 7l9 7 9-7"/>',
cal:'<rect x="4" y="5" width="16" height="16" rx="1.500"/><path d="M4 10h16M8 3v4M16 3v4"/>',
chart:'<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8"/>',
fist:'<path d="M7 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7a5 5 0 0 1-5 5h-3a5 5 0 0 1-4-2l-2-3a1.500 1.500 0 0 1 2.500-1.500L7 14M7 11h12M11 6v5M15 6v5"/>',
cross:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
ball:'<circle cx="12" cy="12" r="8"/><path d="M5 8c4 1 10 1 14 0M5 16c4-1 10-1 14 0"/>',
ask:'<path d="M8.500 9a3.500 3.500 0 1 1 5 3.200c-1 .6-1.500 1.200-1.500 2.300M12 18v.5"/>',
burst:'<path d="M12 2l2 6 6-3-3 6 6 1-6 3 3 6-6-3-2 6-2-6-6 3 3-6-6-3 6-1-3-6 6 3z"/>',
broom:'<path d="M19 3L10 12M8 11l5 5-4 5H4l1-5z"/>',
trap:'<path d="M3 15h18v4H3zM5 15l3-8 3 8M13 15l3-8 3 8"/>',
arrow:'<path d="M4 12h15M13 6l6 6-6 6"/>',
wand:'<path d="M4 20L16 8M15 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
wheel:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v16M4 12h16M6.300 6.300l11.400 11.400M17.700 6.300L6.300 17.700"/>',
scales:'<path d="M12 4v16M6 20h12M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
urn:'<path d="M9 3h6M10 3v3c-4 1-5 5-5 8 0 4 3 7 7 7s7-3 7-7c0-3-1-7-5-8V3"/>',
knot:'<path d="M4 8c6-4 10 8 16 4M4 16c6 4 10-8 16-4"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c4 4 4 14 0 18M12 3c-4 4-4 14 0 18"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
snow:'<path d="M12 3v18M4.200 7.500l15.600 9M19.800 7.500l-15.600 9"/>',
pick:'<path d="M4 9c4-5 12-5 16 0M12 7v14M10 8l-1-2"/>',
flower:'<circle cx="12" cy="12" r="2"/><path d="M12 10c-3-3-2-6 0-7 2 1 3 4 0 7zM12 14c3 3 2 6 0 7-2-1-3-4 0-7zM10 12c-3 3-6 2-7 0 1-2 4-3 7 0zM14 12c3-3 6-2 7 0-1 2-4 3-7 0z"/>',
tri:'<path d="M4 6h16l-8 14z"/>',
dot:'<circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity=".7"/>',
sq:'<rect x="6" y="6" width="12" height="12" fill="currentColor" fill-opacity=".7"/>',
tick:'<path d="M5 12.500l4.500 4.500L19 7"/>',
anchor:'<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 11h8M5 14c0 4 3 7 7 7s7-3 7-7M5 14l-1.500 2M19 14l1.500 2"/>'
};
var RED={flame:1,heart:1,drop:1,burst:1},GOLD={coin:1,candle:1};
var M={};
function m(g,s){s.split(" ").forEach(function(e){M[e]=g})}
m("coin","💷 💰 💵 🪙");m("spark","✨ 💫 🌠 🎉 🎪 🌌 ⭐ 🌟");M["⭐"]="star";M["🌟"]="star";
m("warn","⚠ ❗ ❕");m("scroll","📜 📖 📋 📯 📓 📚");m("skull","💀 ☠ 🦴");m("tomb","⚰ 🪦");
m("orb","🔮");m("swords","⚔ 🗡 🪓 🔪");m("moon","🌙 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘");
m("box","🎁 📦 🧺 🧰");m("ghost","👻 😱 🙉 😵");m("drop","🩸 💧 💦 🫧");
m("heart","❤ 💚 💜 💛 💗 💞 💙 🤍");m("spiral","🌀 🧠");m("waves","🌊");m("flask","🧪 ⚗ 🫕");
m("shield","🛡");m("paw","🐾");m("flame","🔥");m("mush","🍄");m("bag","🎒");m("bolt","⚡ ⛈");
m("target","🎯");m("candle","🕯 🏮");m("web","🕸 🕷");m("frog","🐸");m("tree","🌲 🌳");
m("leaf","🌿 🍃 🍂 🌱 🪴 🍀");m("flower","🌼 🌹 🌸 🪻");
m("beast","🦊 🐺 🐗 🐈 🐕 🦁 🐱 🐶");m("snake","🐍");m("owl","🦉");m("bird","🦅 🐦 🦇 🪶");
m("mask","🎭 😤");m("run","🏃 🚶");m("look","🔍 🔎");m("glass","⌛ ⏳");m("bow","🏹");
m("mist","🌫 💨");m("eye","👁 👂");m("hand","✋ 🖐 🤲 👆 🙏");m("quill","✍ 🖋 ✎");m("zzz","💤");
m("hood","🧟 🧙 🥋");m("worm","🪱");m("stone","🗿");m("cup","🏆");m("hat","🎩");m("boot","👢");
m("ring","💍 📿");m("bowl","🍖 🍎 🥣 🍺");m("compass","🧭");m("crown","👑");m("man","👤");m("men","👥");
m("house","🏠 🛖");m("castle","🏰 🌆 🌇 🌅");m("hall","🏛 🏦 🏥");m("door","🚪");m("tower","🗼");
m("gear","⚙");m("lock","🔒");m("bell","🔔");m("chat","💬 🗣");m("snd","🔊");m("mute","🔇");m("mail","✉ 📭");
m("cal","📅");m("chart","📊");m("fist","💪");m("cross","🩹");m("ball","🧶 🎾");m("ask","❔ ❓");
m("burst","💥 💢");m("broom","🧹");m("trap","🪤");m("arrow","➡");m("wand","🪄");m("wheel","🎡 🛞");
m("scales","⚖");m("urn","🏺");m("knot","🪢");m("globe","🌍");m("sun","☀");m("snow","❄");m("pick","⛏");
m("tri","🔻");m("dot","🔴 🟤 🟢 🔷 🟡 🟠 🟣 🔵");m("sq","⬛ ⬜");m("tick","✅");m("anchor","⚓");m("mask","🃏");
var KEEP="▶◀▸◂✦✧✓✕✔✖♂♀⚥♪♫➤✺🜂✱✶✷✹✿❖◆◇●○■□▪▫★☆©®™";
window.LOTM_ICONS={glyphs:G,map:M};
var css=document.createElement("style");
css.textContent=".ic{display:inline-block;width:1.08em;height:1.08em;vertical-align:-.17em;color:var(--ic,#cdbf9f);line-height:1;flex:none}"+
".ic svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round;overflow:visible}"+
".ic.r{color:#c0343e}.ic.g{color:#c9a45e}.ic.ic-glow svg{filter:drop-shadow(0 0 3px currentColor)}"+
".ie{filter:grayscale(.9) sepia(.35) brightness(.82) contrast(1.05)}";
document.head.appendChild(css);
var RX=/\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}️?|[\u{1F3FB}-\u{1F3FF}])*/gu;
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,SELECT:1,TITLE:1,NOSCRIPT:1,CODE:1,PRE:1};
function mk(e){
 var k=e.replace(/[️]/g,"");var first=Array.from(k)[0];
 var g=M[k]||M[first];
 if(!g){
  if(e.indexOf("️")<0&&KEEP.indexOf(first)>=0)return null;
  var s=document.createElement("span");s.className="ie";s.textContent=e;s.setAttribute("data-e",e);return s;
 }
 var sp=document.createElement("span");sp.className="ic"+(RED[g]||first==="❤"||first==="🩸"||first==="🔴"?" r":"")+(GOLD[g]?" g":"");
 sp.setAttribute("data-e",e);sp.setAttribute("aria-hidden","true");
 sp.innerHTML='<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'+G[g]+'</svg>';
 return sp;
}
function okNode(n){
 for(var p=n.parentNode;p&&p.nodeType===1;p=p.parentNode){
  if(SKIP[p.tagName]||p.classList.contains("ic")||p.classList.contains("ie")||p.classList.contains("chTx")||p.hasAttribute("data-noicon")||p.namespaceURI==="http://www.w3.org/2000/svg")return false;
 }
 return true;
}
function proc(n){
 var t=n.nodeValue;if(!t||!RX.test(t)){RX.lastIndex=0;return}RX.lastIndex=0;
 if(!okNode(n))return;
 var frag=document.createDocumentFragment(),last=0,m2,ch=false;
 while((m2=RX.exec(t))){
  var el=mk(m2[0]);if(!el)continue;
  if(m2.index>last)frag.appendChild(document.createTextNode(t.slice(last,m2.index)));
  frag.appendChild(el);last=m2.index+m2[0].length;ch=true;
 }
 RX.lastIndex=0;
 if(!ch)return;
 if(last<t.length)frag.appendChild(document.createTextNode(t.slice(last)));
 n.parentNode.replaceChild(frag,n);
}
function walk(root){
 if(root.nodeType===3){proc(root);return}
 if(root.nodeType!==1||SKIP[root.tagName])return;
 var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),a=[],x;
 while((x=w.nextNode()))a.push(x);
 a.forEach(proc);
}
var q=[],sch=false;
function flush(){sch=false;var l=q;q=[];l.forEach(function(n){if(n.isConnected!==false)walk(n)})}
function enqueue(n){q.push(n);if(!sch){sch=true;(window.requestAnimationFrame||setTimeout)(flush)}}
function start(){
 walk(document.body);
 new MutationObserver(function(ms){ms.forEach(function(r){
  if(r.type==="characterData")enqueue(r.target);
  else r.addedNodes.forEach(function(n){if(n.nodeType===3||n.nodeType===1)enqueue(n)});
 })}).observe(document.body,{childList:true,subtree:true,characterData:true});
}
if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
})();
