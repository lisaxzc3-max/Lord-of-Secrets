/* Повелитель Тайн — страница боя на локации: сцена, ходы, награды.
   Общий код для озера, леса, кладбища и руин. Настройки локации: window.BATTLE_CFG (в самой странице).
   Подключается после sound.js и bscene.js. */
(function(){
var CFG=window.BATTLE_CFG;
var SRC=(document.currentScript&&document.currentScript.src)||"";
var ART=SRC.replace(/[^\/]*$/,"").replace(/\?.*$/,"")+"../art/";
document.title=CFG.title+" · Сражение";
var app=document.getElementById("app");
app.innerHTML='<div class="wrap">'+
'<section class="stage" id="stage">'+
'<div class="mist a"></div><div class="mist b"></div>'+
'<div class="top"><a class="back" id="backHome" href="../index.html">'+CFG.back+'</a><div class="turn wait" id="turn">Загрузка</div><button class="spd" id="spd" type="button" aria-label="Скорость боя">⏩</button><div class="statusPill" id="statusPill">Загрузка</div></div>'+
'<div class="hud l"><div class="nm" id="playerName">Путешественник</div><div class="rl" id="playerPath">Путь неизвестен</div><div class="bar hp"><i id="playerHpBar"></i></div><div class="num">❤ <span id="playerHp">—</span></div><div class="chips" id="heroChips"></div></div>'+
'<div class="hud r"><div class="nm" id="enemyLabel">Противник</div><div class="rl" id="enemyRole">Враждебная сущность</div><div class="bar enemyHp"><i id="enemyHpBar"></i></div><div class="num">🩸 <span id="enemyHp">—</span></div><div class="chips" id="chips"></div></div>'+
'<div class="fighters" id="fighters"><div class="fighter heroSlot"><div class="unit hero" id="playerFrame" style="position:absolute"><div class="fl"><img id="playerImg" alt="Герой" draggable="false"></div></div></div><div class="fighter foeSlot"><div class="unit foe" id="enemyFrame" style="position:absolute"><div class="fl"><img id="enemyImg" alt="Противник" draggable="false"></div></div></div></div>'+
'<div class="fxl" id="fx"></div>'+
'<div class="msg" id="battleMessage"><div class="mi" id="messageIcon">📜</div><div id="battleText" aria-live="polite">'+CFG.intro+'</div></div>'+
'</section><div id="eiAnchor"></div>'+
'<section class="dock" id="skillCard"><div class="dockHead"><span id="skillPathLabel">Способности пути</span><span>Удерживай — описание</span></div><div class="skillGrid" id="battleSkills"></div></section>'+
'<section class="card resultCard victoryCard hidden" id="victoryCard"><div class="resultSymbol">✦</div><div class="resultTitle">ПОБЕДА</div><div class="resultText">'+CFG.win+'</div><div class="rewardGrid"><div class="reward"><div class="rewardValue">+<span id="vTenge">—</span></div><div class="rewardLabel">£ Фунты</div></div><div class="reward"><div class="rewardValue">+<span id="vExp">—</span></div><div class="rewardLabel">✨ Опыт</div></div><div class="reward ingDrop hidden" id="vIngBox"><div class="rewardValue" id="vIng">—</div><div class="rewardLabel">🧪 Ингредиенты</div></div></div><div class="resultActions"><button class="actionBtn primary" id="exploreAgainBtn" type="button">⌕ Исследовать снова</button><button class="actionBtn" id="victoryCloseBtn" type="button">Закрыть</button></div></section>'+
'<section class="card resultCard defeatCard hidden" id="defeatCard"><div class="resultSymbol">☠</div><div class="resultTitle">ПОРАЖЕНИЕ</div><div class="resultText" id="defeatText">Силы иссякли. Дождись воскрешения.</div><div class="resultActions"><button class="actionBtn primary" id="defeatCloseBtn" type="button">'+CFG.backDefeat+'</button><button class="actionBtn" id="defeatRetryBtn" type="button">Обновить данные</button></div></section>'+
'<section class="card errorBox hidden" id="errorBox" role="alert"><div id="errorText"></div><button class="actionBtn" id="retryBtn" type="button" style="margin-top:10px">Повторить загрузку</button></section>'+
'<section class="card logCard"><div class="logHead"><div class="logTitle">Хроника сражения</div><div class="logCount" id="logCount">0 записей</div></div><details class="logDisclosure" id="logDisclosure"><summary><span>📜 Показать события боя</span><span class="logSummarySub" id="logSummarySub">Хроника свёрнута</span></summary><div id="battleLog"><div class="logEntry info">'+CFG.intro+'</div></div></details></section>'+
'<div class="bottomNote">Ход боя и награды обрабатываются сервером.<br>'+CFG.note+'</div></div>';
var stg=document.getElementById("stage");
stg.style.setProperty("--stageBg",'url("'+ART+CFG.bg+'")');
stg.style.setProperty("--stagePos",CFG.bgPos||"50% 100%");
var rs=document.documentElement.style;
rs.setProperty("--mist",CFG.mist);rs.setProperty("--p2glow",CFG.p2glow);rs.setProperty("--shield",CFG.shield);
})();
"use strict";
try{sndMusic("battle")}catch(_){}
const tg=window.Telegram?.WebApp||null;
try{tg?.ready();tg?.expand();tg?.setHeaderColor("#101014")}catch(_){}

const qs=new URLSearchParams(location.search);
const uid=String(qs.get("u")||tg?.initDataUnsafe?.user?.id||"0");
const pEnc=qs.get("p_enc")||qs.get("p")||"";
const aEnc=qs.get("a_enc")||qs.get("a")||"";
/* вход только по личным ссылкам бота */
let PROFILE_URL=pEnc?"https://api.telebotcreator.com/new-webhook?data="+encodeURIComponent(pEnc):"";
let ACTION_URL=aEnc?"https://api.telebotcreator.com/new-webhook?data="+encodeURIComponent(aEnc):"";
let handshakePromise=null,busy=false,ended=false,initialized=false,PLAYER_PATH="",logEntries=[],lastCds={};
let curEnemy="",curBoss=false,curPhase=1,curMob="";
const cur={hero:null,heroMax:null,foe:null,foeMax:null};

const $=id=>document.getElementById(id);
const B=window.LOTM_BSCENE;
const skillInfo=LOTM_SKILLS.SK;
const sleep=ms=>B.sleep(ms);

/* временные эффекты на героя и врага: ключ → [значок, подпись, длительность в ходах, класс] */
const CFG=window.BATTLE_CFG,MOB=CFG.mob,P2=CFG.p2||{},SHOWN=CFG.shown||{},ROLE=CFG.role||{},MOBSND=CFG.mobsnd||{};
const BUFF={
divination:["hero","🔮 Уклонение",1,"good"],
sailor_pray:["hero","⚡ Ярость",1,"good"],
acting:["foe","🎭 Ослаблен",1,"warn"],
sailor_drink:["foe","💤 Сон",2,"warn"],
hunter_trap:["foe","⛓ Оглушён",2,"warn"],
hunter_boost:["foe","🎯 Промахи",2,"warn"]
};
const eff={hero:{},foe:{}};

/* ===== ВСПОМОГАТЕЛЬНОЕ ===== */
function unwrap(value){for(let i=0;i<3;i++){if(value&&value.result&&typeof value.result==="object")value=value.result;else break}return value}
function setStatus(text,kind=""){const el=$("statusPill");el.textContent=text;el.className="statusPill"+(kind?" "+kind:"")}
function setTurn(text,cls){const t=$("turn");t.textContent=text;t.className="turn "+(cls||"")}
function setMessage(text,title,icon="📜"){
 const el=$("battleText");el.textContent=text||"Туман скрывает дальнейшие события.";
 el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop");$("messageIcon").textContent=icon;
}
function showError(text){$("errorText").textContent=text||"Не удалось связаться с игровой системой.";$("errorBox").classList.remove("hidden")}
function hideError(){$("errorBox").classList.add("hidden")}
function setBusy(value,label){
 busy=value;
 if(value)setStatus(label||"Обработка…","busy");else if(!ended)setStatus("В бою","live");
 refreshSkillState();$("exploreAgainBtn").disabled=value;
}
function cleanBattleText(value){
 const text=String(value??"").trim();
 const messages={no_battle:"Сражение завершено. Если не атаковать больше 3 минут, бой прерывается сам.",cooldown:"Способность ещё восстанавливается.",dead:"Персонаж не может продолжать бой."};
 return messages[text]||text;
}
function addLog(text,kind="info"){
 text=cleanBattleText(text);if(!text||!text.trim())return;
 logEntries.unshift({text,kind});if(logEntries.length>30)logEntries.length=30;
 const log=$("battleLog");log.replaceChildren();
 logEntries.forEach(e=>{const d=document.createElement("div");d.className="logEntry "+e.kind;d.textContent=e.text;log.appendChild(d)});
 const n=logEntries.length;
 $("logCount").textContent=n+" "+(n===1?"запись":n>=2&&n<=4?"записи":"записей");
 $("logSummarySub").textContent="Последнее: "+logEntries[0].text.slice(0,48)+(logEntries[0].text.length>48?"…":"");
}
function banner(text,color){
 snd("banner");
 const b=document.createElement("div");b.className="banner";b.textContent=text;if(color)b.style.setProperty("--c",color);
 $("fx").appendChild(b);setTimeout(()=>b.remove(),1750);
}
function sparks(box){
 const colors=["#e4ca91","#d6b779","#fff3c4","#b28c4d"];
 for(let i=0;i<24;i++){
  const s=document.createElement("i");s.className="spark";s.style.left=(Math.random()*100)+"%";
  s.style.setProperty("--c",colors[i%colors.length]);s.style.setProperty("--t",(1.6+Math.random()*1.6).toFixed(2)+"s");
  s.style.animationDelay=(Math.random()*.7).toFixed(2)+"s";box.appendChild(s);setTimeout(()=>s.remove(),3800);
 }
}

/* ===== ЗДОРОВЬЕ (без эффектов: эффекты рисует сцена) ===== */
function safePercent(v,m){const n=Number(v),x=Number(m);if(!Number.isFinite(n)||!Number.isFinite(x)||x<=0)return 0;return Math.max(0,Math.min(100,n/x*100))}
function setHealth(side,hp,maxHp){
 const player=side==="player";
 const hpEl=$(player?"playerHp":"enemyHp"),bar=$(player?"playerHpBar":"enemyHpBar");
 const c=Number(hp),m=Number(maxHp);
 if(hp==null||maxHp==null||!Number.isFinite(c)||!Number.isFinite(m)||m<=0){hpEl.textContent="—";bar.style.width="0%";return}
 hpEl.textContent=c+"/"+m;
 const pc=safePercent(c,m),old=parseFloat(bar.style.width)||0,box=bar.parentElement;
 let ghost=box.querySelector(".ghost");if(!ghost){ghost=document.createElement("b");ghost.className="ghost";box.prepend(ghost)}
 ghost.style.transition=pc<old?"width .9s ease .35s":"none";ghost.style.width=pc+"%";bar.style.width=pc+"%";
 if(player){cur.hero=c;cur.heroMax=m}else{cur.foe=c;cur.foeMax=m}
}
function setEnemyLevel(level,boss,phase){
 curBoss=!!boss;const p=Number(phase)||1;
 const parts=[];if(level)parts.push("Ур. "+level);if(boss)parts.push("Фаза "+p);
 parts.push(boss?"Босс":(ROLE[curEnemy]||"Враждебная сущность"));
 const role=$("enemyRole");role.textContent=parts.join(" · ");role.classList.toggle("boss",!!boss);
 $("stage").classList.toggle("arenaBoss",!!boss);sndMusic(boss?"boss":"battle");
 const p2=!!boss&&p>=2,was2=$("stage").classList.contains("arenaP2");
 $("stage").classList.toggle("arenaP2",p2);
 if(P2[curMob]&&p2!==was2){B.setFoe(p2?P2[curMob]:curMob);B.swapFoe()}
 curPhase=p;
}

/* ===== СТАТУСЫ ===== */
const st={sleep:0,web:0,weak:0,poison:0,stack:0,shield:0,coil:0};
const CHIPCLS={sleep:"warn",web:"warn",weak:"warn",coil:"warn",poison:"bad",stack:"bad",shield:"good"};
function drawChips(){
 const fc=$("chips"),hc=$("heroChips");fc.replaceChildren();hc.replaceChildren();
 const add=(box,text,cls)=>{const c=document.createElement("span");c.className="chip "+cls;c.textContent=text;box.appendChild(c)};
 for(const k in CFG.chips){
  if(st[k]>0){const [side,label]=CFG.chips[k];add(side==="foe"?fc:hc,label.replace("{n}",st[k]),CHIPCLS[k]||"warn")}
 }
 Object.values(eff.hero).forEach(e=>add(hc,e[1],e[3]));
 Object.values(eff.foe).forEach(e=>add(fc,e[1],e[3]));
 $("enemyFrame").classList.toggle("shielded",st.shield>0);
 B.status("hero",st.sleep>0?(CFG.sleepIcon||"💤"):null);
}
function applyBuff(move){
 const b=BUFF[move];if(!b)return;
 eff[b[0]][move]=[b[0],b[1],b[2],b[3]];
}
function tickEffects(){
 for(const side of ["hero","foe"])for(const k of Object.keys(eff[side])){
  eff[side][k][2]--;if(eff[side][k][2]<=0)delete eff[side][k];
 }
}
function tickStatuses(){
 st.web=Math.max(0,st.web-1);st.weak=Math.max(0,st.weak-1);if(st.poison>0)st.poison--;st.sleep=0;st.coil=0;
}
/* помощники для приёмов врагов конкретной локации */
const X={st,B,banner,snd:(n,d)=>snd(n,d),$,P2,
 enemy:()=>curEnemy,
 phase2(){curPhase=2;$("stage").classList.add("arenaP2");if(P2[curMob]){B.setFoe(P2[curMob]);B.swapFoe()}}};

/* ===== СЦЕНА ===== */

/* ===== НАВЫКИ ===== */
let skBuilt="",tipTimer=0,tipShown=false;
function showTip(info){
 hideTip();tipShown=true;
 const t=document.createElement("div");t.className="skTip";t.id="skTip";
 const b=document.createElement("b");b.textContent=info.name+(info.tag?" · "+info.tag:"");
 t.append(b,document.createElement("br"),document.createTextNode(info.desc||""));
 document.body.appendChild(t);
}
function hideTip(){const t=$("skTip");if(t)t.remove()}
function renderSkills(cds={}){
 lastCds=cds||{};
 const pk=LOTM_SKILLS.pathKey(PLAYER_PATH)||"seer",box=$("battleSkills");
 if(skBuilt!==pk||!box.children.length){
  box.replaceChildren();skBuilt=pk;
  $("skillPathLabel").textContent=LOTM_SKILLS.PATHNAME[pk][0];
  LOTM_SKILLS.list(pk).forEach(s=>addSkill(s.key,s.cd,""));
  addSkill("basic","basic","basic");addSkill("flee",null,"escape");
 }
 refreshSkillState();
}
function refreshSkillState(){
 $("battleSkills").querySelectorAll("button.sk").forEach(b=>{
  const cd=b.dataset.cdk?Number(lastCds[b.dataset.cdk]||0):0;
  b.dataset.cooldown=cd>0?"true":"false";b.disabled=busy||ended||cd>0;
  let bd=b.querySelector(".cd");
  if(cd>0){if(!bd){bd=document.createElement("span");bd.className="cd";b.appendChild(bd)}if(bd.textContent!==String(cd))bd.textContent=cd}
  else if(bd)bd.remove();
 });
}
function addSkill(key,cdk,cls){
 const info=skillInfo[key]||{name:key,desc:""},b=document.createElement("button");
 b.type="button";b.className="sk "+cls;b.dataset.key=key;if(cdk)b.dataset.cdk=cdk;b.dataset.cooldown="false";
 b.style.setProperty("--sk",info.c||"#d6b779");
 const ic=document.createElement("span");ic.className="skIc";ic.textContent=info.icon||"•";
 const nm=document.createElement("span");nm.className="skN";nm.textContent=info.name||key;
 b.append(ic,nm);
 if(info.tag){const t=document.createElement("span");t.className="skT";t.textContent=info.tag;b.appendChild(t)}
 const start=()=>{tipShown=false;clearTimeout(tipTimer);tipTimer=setTimeout(()=>showTip(info),420)};
 const stop=()=>{clearTimeout(tipTimer);if(tipShown)setTimeout(hideTip,60)};
 b.addEventListener("pointerdown",start);b.addEventListener("pointerup",stop);b.addEventListener("pointerleave",stop);b.addEventListener("pointercancel",stop);
 b.addEventListener("contextmenu",e=>e.preventDefault());
 b.addEventListener("click",()=>{if(tipShown){tipShown=false;return}if(b.dataset.cooldown!=="true")doBattle(key)});
 $("battleSkills").appendChild(b);
}

/* ===== ОКОНЧАНИЕ ===== */
function showVictory(data){
 sndStop();snd("win");
 ended=true;setStatus("Победа");setTurn("Победа","");
 $("vTenge").textContent=data.tenge==null?"—":Number(data.tenge);
 $("vExp").textContent=data.exp_add==null?"—":Number(data.exp_add);
 try{const m=String(data.text||"").match(/🧪\s*(.+)$/m),b=$("vIngBox");if(m){$("vIng").textContent=m[1].replace(/^Найдено:\s*/,"");b.classList.remove("hidden");setTimeout(()=>snd("dew"),700)}else b.classList.add("hidden")}catch(e){}
 $("victoryCard").classList.remove("hidden");$("defeatCard").classList.add("hidden");
 $("skillCard").classList.add("hidden");hideError();
 setMessage("Сражение завершено. Награда обработана игровой системой.","","✦");
 addLog("Победа! Сражение завершено.","good");
 sparks($("victoryCard"));
}
function showDefeat(data){
 sndStop();snd("lose");
 ended=true;setStatus("Поражение");setTurn("Поражение","foe");
 $("defeatCard").classList.remove("hidden");$("victoryCard").classList.add("hidden");
 $("skillCard").classList.add("hidden");hideError();
 if(data?.text)$("defeatText").textContent=cleanBattleText(data.text);
 setMessage(cleanBattleText(data?.text||"Ты больше не можешь продолжать бой."),"","☠");
 addLog("Поражение. Сражение окончено.","bad");
 document.body.classList.add("defeatFx");
}

/* ===== СВЯЗЬ ===== */
function locUrl(){const p=new URLSearchParams(location.search);p.delete("enemy");p.delete("event_data");const q=p.toString();return "../index.html"+(q?"?"+q:"")}
function goLoc(){location.href=locUrl()}
function openEvent(data){const p=new URLSearchParams(location.search);p.delete("enemy");p.set("event_data",JSON.stringify(data));location.href="../event/index.html?"+p.toString()}
async function ensure(){
 if(PROFILE_URL&&ACTION_URL)return true;
 if(handshakePromise)return handshakePromise;
 handshakePromise=(async()=>{
  const response=await needStart({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:uid}),cache:"no-store"});
  if(!response.ok)throw new Error("Не удалось подключиться к игровой системе (HTTP "+response.status+").");
  const data=unwrap(await response.json());
  const profile=data?.profile_url||data?.PROFILE_URL,action=data?.action_url||data?.ACTION_URL;
  if(typeof profile!=="string"||!profile||typeof action!=="string"||!action)throw new Error("Сервер не вернул адреса профиля и действий.");
  const pu=new URL(profile),au=new URL(action);
  if(pu.protocol!=="https:"||au.protocol!=="https:")throw new Error("Некорректные адреса API.");
  PROFILE_URL=pu.href;ACTION_URL=au.href;return true;
 })();
 try{return await handshakePromise}finally{handshakePromise=null}
}
async function api(payload){
 await ensure();
 const r=await fetch(ACTION_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});
 if(!r.ok)throw new Error("Ошибка игрового сервера (HTTP "+r.status+").");
 const data=unwrap(await r.json());
 if(!data||typeof data!=="object")throw new Error("Сервер вернул некорректный ответ.");
 return data;
}
async function loadProfile(){
 await ensure();
 const r=await fetch(PROFILE_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"profile"}),cache:"no-store"});
 if(!r.ok)throw new Error("Не удалось загрузить профиль (HTTP "+r.status+").");
 const data=unwrap(await r.json());
 if(!data||typeof data!=="object")throw new Error("Профиль игрока не получен.");
 return data;
}
function getEnemyName(s){let e=s||qs.get("enemy")||CFG.enemyDefault;return (CFG.alias&&CFG.alias[e])||e}
async function refreshBattleState(){
 const s=await api({action:"battle_state"});
 if(s?.enemy_hp!=null&&s.enemy_max!=null)setHealth("enemy",s.enemy_hp,s.enemy_max);
 if(s?.hp!=null&&s.max_hp!=null)setHealth("player",s.hp,s.max_hp);
 if(s?.enemy_level)setEnemyLevel(s.enemy_level,s.boss,s.phase);
 if(s?.cds)renderSkills(s.cds);
 return s;
}
function pickEnemy(name){
 curEnemy=name;$("enemyLabel").textContent=SHOWN[name]||name;
 curMob=MOB[name]||CFG.mobDefault;
 B.setFoe((curBoss&&curPhase>=2&&P2[curMob])?P2[curMob]:curMob);
}

async function load(){
 if(busy)return;
 document.body.classList.remove("defeatFx");
 setBusy(true,"Загрузка…");hideError();setTurn("Загрузка","wait");
 try{
  const stP=api({action:"battle_state"}).catch(e=>({__err:e}));
  const profile=await loadProfile();
  PLAYER_PATH=profile.path||"";window.LOTM_STATS=profile;
  const pk=LOTM_SKILLS.pathKey(profile.path_key||profile.path)||"seer";
  B.revive();B.setHero(pk,profile.gender);
  $("playerName").textContent=profile.nickname||"Путешественник";
  $("playerPath").textContent=PLAYER_PATH||"Путь неизвестен";
  setHealth("player",profile.hp,profile.max_hp);
  let state=null;
  try{state=await stP;if(state&&state.__err){const e=state.__err;state=null;throw e}}
  catch(error){if(!qs.get("enemy"))throw error;setMessage(cleanBattleText(error.message),"","⚠️")}
  curBoss=!!state?.boss;curPhase=Number(state?.phase)||1;
  const enemy=getEnemyName(state?.enemy);
  pickEnemy(enemy);
  setEnemyLevel(state?.enemy_level,state?.boss,state?.phase);
  if(state?.enemy_hp!=null&&state?.enemy_max!=null)setHealth("enemy",state.enemy_hp,state.enemy_max);
  else setHealth("enemy",null,null);
  renderSkills(state?.cds||{});
  if(!initialized){
   B.enter();
   const sn=MOBSND[enemy];if(sn)setTimeout(()=>snd(sn),500);
   addLog("Ты столкнулся с противником: "+(SHOWN[enemy]||enemy)+(state?.enemy_level?" (ур. "+state.enemy_level+")":"")+".","info");
   if(state?.boss){
    setMessage(CFG.boss.msg,"",CFG.boss.icon);
    setTimeout(()=>{banner(CFG.boss.banner(enemy),CFG.boss.color);B.shake(2)},700);
   }else setMessage(CFG.enter(SHOWN[enemy]||enemy),"","🌫");
   initialized=true;
  }
  if(state?.error==="no_battle"||state?.type==="no_battle"){
   setMessage(state?.idle?"Бой прерван: ты не атаковал больше 3 минут. "+CFG.back_hint+" и начни столкновение заново.":"Сервер не обнаружил активное сражение.","","⚠️");
   addLog("Активное сражение не найдено на сервере.","info");
  }else if(state?.ok===false&&state?.error){setMessage(cleanBattleText(state.error),"","⚠️")}
  $("backHome").href=locUrl();setStatus("В бою","live");setTurn("Твой ход","");drawChips();
 }catch(error){
  showError(error.message);setStatus("Нет связи");setTurn("Нет связи","wait");
  setMessage("Не удалось получить данные сражения.","","⚠️");
 }finally{setBusy(false)}
}

/* ===== ТЕКСТЫ ВРАГА ===== */
function normalizeBattleText(value){
 if(value==null)return "";
 if(typeof value==="string")return cleanBattleText(value);
 if(Array.isArray(value))return value.map(normalizeBattleText).filter(Boolean).join("\n");
 if(typeof value==="object"){
  for(const key of ["text","message","detail","log","player_log","playerLog","player_text","playerText","enemy_log","enemyLog","e_log","enemy_message","enemyText","enemy_text","attack_log","battle_log"]){
   const t=normalizeBattleText(value[key]);if(t)return t;
  }
  return "";
 }
 return cleanBattleText(value);
}
function getBattleLogs(d){
 return{
  player:normalizeBattleText(d.log??d.player_log??d.playerLog??d.player_text??d.playerText??d.text??""),
  enemy:normalizeBattleText(d.e_log??d.enemy_log??d.enemyLog??d.enemy_text??d.enemyText??d.enemy_message??d.attack_log??"")
 };
}
const RX_MISS=/промах|уклон|мимо|избег|увернул/i;
const RX_SKIP=CFG.skipRx||/спит|усып|оглуш|пропуска|не может действ|скован|обездвиж|в ловушке/i;
const RX_CAST_=CFG.castRx||/(?!)/;

/* приёмы врагов: общий каркас, сами приёмы описаны в настройках локации */
function bossFx(text){
 if(!text)return{heavy:0};
 tickStatuses();
 let r=null;try{r=CFG.bossFx&&CFG.bossFx(text,X)}catch(e){}
 return r||{heavy:0};
}

/* ===== ХОД БОЯ ===== */
async function doBattle(move){
 if(busy||ended)return;
 hideError();hideTip();setBusy(true,"Ход…");setTurn("Твой ход","");
 try{
  if(move==="flee"){
   const d=await api({action:"battle",move});
   if(d.error){setMessage(cleanBattleText(d.text||d.error),"","⚠️");return}
   setMessage("Ты отступаешь с поля боя.","","🏃");snd("bmiss");goLoc();return;
  }
  const data=await api({action:"battle",move});
  if(data.error==="cooldown"){
   if(data.cds)renderSkills(data.cds);
   setMessage("Эта способность ещё восстанавливается.","","⌛");addLog("Способность ещё восстанавливается.","info");return;
  }
  if(data.error==="dead"){showDefeat(data);return}
  if(data.error){
   const t=cleanBattleText(data.text||data.error);setMessage(t,"","⚠️");addLog(t,"bad");
   if(data.hp!=null&&data.max_hp!=null)setHealth("player",data.hp,data.max_hp);
   if(data.enemy_hp!=null&&data.enemy_max!=null)setHealth("enemy",data.enemy_hp,data.enemy_max);
   if(data.cds)renderSkills(data.cds);
   return;
  }
  if(data.type==="event"||data.type==="battle_event"||data.type==="event_choice"){openEvent(data);return}
  if(data.type==="flee"){setMessage("Ты покидаешь поле боя.","","🏃");goLoc();return}
  const known=data.type==="battle"||data.type==="victory"||data.type==="defeat";
  if(!known){
   if(data.hp!=null&&data.max_hp!=null)setHealth("player",data.hp,data.max_hp);
   if(data.enemy_hp!=null&&data.enemy_max!=null)setHealth("enemy",data.enemy_hp,data.enemy_max);
   const m=cleanBattleText(data.text||data.message||data.error||"Сервер вернул неизвестный результат.");
   setMessage(m,"","❔");addLog(m,"info");return;
  }
  await playTurn(move,data);
 }catch(error){
  showError(error.message||"Ошибка связи при выполнении хода.");
  setMessage("Не удалось получить подтверждение хода.","","⚠️");
 }finally{setBusy(false);if(!ended)setTurn("Твой ход","")}
}

async function playTurn(move,data){
 const logs=getBattleLogs(data);
 const prev={hero:cur.hero,foe:cur.foe};
 const newHero=data.hp!=null?Number(data.hp):prev.hero,newFoe=data.enemy_hp!=null?Number(data.enemy_hp):prev.foe;
 const heroMax=Number(data.max_hp??cur.heroMax),foeMax=Number(data.enemy_max??cur.foeMax);
 const dmgFoe=prev.foe!=null?prev.foe-newFoe:0,dmgHero=prev.hero!=null?prev.hero-newHero:0;
 const victory=data.type==="victory",defeat=data.type==="defeat";

 /* 1. ход героя */
 const asleep=st.sleep>0;
 if(logs.player){setMessage(logs.player,"","⚔️");addLog(logs.player,"good")}
 if(asleep){B.floatNum("hero","Сон","miss");snd("bmiss");await sleep(600)}
 else await B.act(move,{impact:()=>{
  if(data.enemy_hp!=null||victory){
   const f=victory?0:newFoe;
   if(dmgFoe>0){
    const crit=foeMax>0&&dmgFoe>=foeMax*0.25;
    B.floatNum("foe","−"+dmgFoe,crit?"crit":"dmg");if(crit){B.shake(1);snd("crit")}
   }else if(dmgFoe<0)B.floatNum("foe","+"+(-dmgFoe),"heal");
   setHealth("enemy",victory?0:f,foeMax);
  }
 }});
 if(/🪃↩/.test(logs.player||""))await B.echo();
 applyBuff(move);
 if(data.type==="battle"&&data.enemy_hp!=null)setHealth("enemy",newFoe,foeMax);
 if(data.enemy_level)setEnemyLevel(data.enemy_level,data.boss,data.phase);

 if(victory){
  await B.die("foe");await sleep(250);showVictory(data);return;
 }

 /* 2. лечение героя своим навыком (Провокация и т.п.) */
 if(!defeat&&dmgHero<0&&!logs.enemy){B.floatNum("hero","+"+(-dmgHero),"heal");snd("heal",.4);setHealth("player",newHero,heroMax)}

 /* 3. ход врага */
 const txt=logs.enemy;
 if(txt||dmgHero>0||defeat){
  setTurn("Ход врага","foe");await sleep(380);
  setMessage(txt||"Враг атакует.","","🩸");if(txt)addLog(txt,"bad");
  const fx=bossFx(txt);
  const skip=RX_SKIP.test(txt)&&dmgHero<=0;
  const miss=!skip&&dmgHero<=0&&!defeat&&(RX_MISS.test(txt)||!!txt)&&!RX_CAST_.test(txt);
  const cast=!skip&&dmgHero<=0&&!defeat&&RX_CAST_.test(txt);
  if(cast){
   await B.enemyCast({color:(CFG.castColor?CFG.castColor(txt):"#e2c27a"),snd:MOBSND[curEnemy]});
   if(data.hp!=null)setHealth("player",newHero,heroMax);
  }else if(skip){
   B.status("foe","💤");snd("bmiss");B.floatNum("foe","Пропуск","miss");
   if(data.hp!=null)setHealth("player",newHero,heroMax);
   await sleep(900);B.status("foe",null);
  }else{
   await B.enemyAct({heavy:fx.heavy,miss,snd:MOBSND[curEnemy],impact:()=>{
    if(dmgHero>0){
     const crit=heroMax>0&&dmgHero>=heroMax*0.25;
     B.floatNum("hero","−"+dmgHero,crit?"crit":"dmg");
    }else if(dmgHero<0)B.floatNum("hero","+"+(-dmgHero),"heal");
    if(data.hp!=null)setHealth("player",defeat?0:newHero,heroMax);
   }});
  }
  if(st.poison>0&&dmgHero>0)B.aura("hero","#6dff7a",700);
 }else if(data.hp!=null)setHealth("player",newHero,heroMax);

 if(defeat){await B.die("hero");await sleep(300);showDefeat(data);return}
 tickEffects();drawChips();
 if(data.cds)renderSkills(data.cds);else{try{await refreshBattleState()}catch(_){}}
 setTurn("Твой ход","");
}

async function exploreAgain(){
 if(busy)return;
 hideError();setBusy(true,"Поиск…");
 try{
  const d=await api({action:CFG.explore});
  if(d.error==="cooldown"){setMessage("Подожди ещё "+(d.left||5)+" сек.","","⌛");return}
  if(d.ok===false||d.error){setMessage(cleanBattleText(d.text||d.error||"Сейчас ничего не найдено."),"","⚠️");return}
  const p=new URLSearchParams(location.search);
  if(d.type==="event"){p.delete("enemy");p.set("event_data",JSON.stringify(d));location.href="../event/index.html?"+p.toString();return}
  p.delete("event_data");if(d.enemy)p.set("enemy",d.enemy);
  location.href="./index.html?"+p.toString();
 }catch(error){showError(error.message||"Не удалось начать новый бой.")}
 finally{setBusy(false)}
}

$("exploreAgainBtn").addEventListener("click",exploreAgain);
$("victoryCloseBtn").addEventListener("click",goLoc);
$("defeatCloseBtn").addEventListener("click",goLoc);
$("defeatRetryBtn").addEventListener("click",()=>{B.revive();ended=false;load()});
$("retryBtn").addEventListener("click",load);
const spd=$("spd");
function paintSpd(){spd.classList.toggle("on",B.speed()>1)}
spd.addEventListener("click",()=>{B.setSpeed(B.speed()>1?1:2);paintSpd();snd("tap")});
window.addEventListener("DOMContentLoaded",()=>{B.init({stage:$("stage"),fx:$("fx")});paintSpd();load()});
