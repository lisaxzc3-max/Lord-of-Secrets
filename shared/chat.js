/* Повелитель Тайн — общий чат (Мир + личные сообщения). Плавающая кнопка на всех страницах. */
(function(){
"use strict";
if(window.__lotmChat)return;window.__lotmChat=1;
var qs=new URLSearchParams(location.search);
var aEnc=qs.get("a_enc")||qs.get("a")||"";
if(!aEnc||/\/loading\//.test(location.pathname))return;
var URL_=  "https://api.telebotcreator.com/new-webhook?data="+encodeURIComponent(aEnc);
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
var PATH={seer:"🔮",sailor:"⚓",hunter:"🏹"};
function sfx(n){try{window.snd&&window.snd(n)}catch(e){}}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function unwrap(v){for(var i=0;i<3;i++){if(v&&v.result&&typeof v.result==="object")v=v.result;else break}return v}
function call(p){
 return fetch(URL_,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p),cache:"no-store"})
 .then(function(r){if(!r.ok)throw new Error("http");return r.json()}).then(function(d){d=unwrap(d);if(!d||typeof d!=="object")throw new Error("bad");return d});
}
var CFGK="lotm_chat_cfg";
function cfg(){var c={world:1,dm:1,snd:1,tone:"bell",shake:1,fab:1};try{var j=JSON.parse(localStorage.getItem(CFGK)||"{}");for(var k in j)c[k]=j[k]}catch(e){}return c}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function hhmm(t){var d=new Date(t*1000);return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}

var css=document.createElement("style");
css.textContent=
"#chFab{position:fixed;right:10px;bottom:calc(124px + env(safe-area-inset-bottom));z-index:9000;width:38px;height:38px;border-radius:50%;border:1px solid #6a5a38;background:#150f20cc;color:#d6b779;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 12px #0008;transition:transform .2s}"+
"#chFab:active{transform:scale(.9)}"+
"#chFab.ring{animation:chRing .9s ease-in-out}"+
"@keyframes chRing{0%,100%{transform:rotate(0)}15%{transform:rotate(-16deg)}30%{transform:rotate(14deg)}45%{transform:rotate(-10deg)}60%{transform:rotate(8deg)}}"+
"#chFab.has::after{content:\"\";position:absolute;inset:-3px;border-radius:50%;border:1px solid #e2c27a;animation:chPulse 1.8s ease-out infinite}"+
"@keyframes chPulse{from{transform:scale(.9);opacity:.9}to{transform:scale(1.5);opacity:0}}"+
"#chFab b{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:99px;background:#d9443c;color:#fff;font:700 10px/16px system-ui,sans-serif;text-align:center;padding:0 3px;box-shadow:0 0 8px #d9443caa}"+
"#chFab b:empty{display:none}"+
"#chBack{position:fixed;inset:0;z-index:9500;background:#05030acc;backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .3s}"+
"#chBack.on{opacity:1;pointer-events:auto}"+
"#chPanel{position:fixed;left:0;right:0;bottom:0;z-index:9600;max-width:560px;margin:0 auto;height:min(82vh,640px);display:flex;flex-direction:column;background:linear-gradient(180deg,#1f1633,#0e0918);border:1px solid #6a58a0;border-bottom:0;border-radius:20px 20px 0 0;box-shadow:0 -10px 40px #8a5cff33;transform:translateY(105%);transition:transform .38s cubic-bezier(.2,.9,.25,1);font-family:system-ui,-apple-system,sans-serif;color:#e7dcc2;overflow:hidden}"+
"#chPanel.on{transform:none}"+
"#chPanel::before{content:\"\";position:absolute;inset:0;background:radial-gradient(ellipse at 50% -10%,#8a5cff2e,transparent 60%);pointer-events:none}"+
".chHead{position:relative;display:flex;align-items:center;gap:6px;padding:10px 12px 0}"+
".chGrip{position:absolute;top:5px;left:50%;width:38px;height:4px;margin-left:-19px;border-radius:9px;background:#ffffff26}"+
".chTab{flex:1;position:relative;border:1px solid #3a3057;background:#120c1e;color:#b8accb;border-radius:12px;padding:8px 6px;font:700 13px system-ui;cursor:pointer;transition:.25s}"+
".chTab.on{background:linear-gradient(160deg,#4a3680,#2a1f4a);color:#f6e9c4;border-color:#e2c27a99;box-shadow:0 0 14px #8a5cff55}"+
".chTab i{font-style:normal;background:#d9443c;color:#fff;border-radius:99px;font-size:10px;padding:1px 6px;margin-left:5px}"+
".chTab i:empty{display:none}"+
".chX{flex:0 0 34px;height:34px;border-radius:50%;border:1px solid #3a3057;background:#120c1e;color:#d6b779;font-size:15px;cursor:pointer}"+
".chBody{position:relative;flex:1;min-height:0;display:flex;flex-direction:column}"+
".chPane{position:absolute;inset:0;display:none;flex-direction:column}"+
".chPane.on{display:flex;animation:chFade .3s}"+
"@keyframes chFade{from{opacity:0;transform:translateX(12px)}}"+
".chMsgs{flex:1;overflow-y:auto;padding:12px 12px 6px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#4a3b70 transparent}"+
".chRow{display:flex;gap:7px;align-items:flex-end;max-width:88%;animation:chIn .35s cubic-bezier(.2,.9,.3,1.2)}"+
".chRow.me{align-self:flex-end;flex-direction:row-reverse}"+
"@keyframes chIn{from{opacity:0;transform:translateY(12px) scale(.9)}}"+
".chAv{flex:0 0 30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#3d2f63,#150e26);border:1px solid #6a58a0;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer}"+
".chBub{position:relative;background:linear-gradient(160deg,#2a2044,#1a1230);border:1px solid #3a3057;border-radius:14px 14px 14px 4px;padding:6px 10px 5px;min-width:0}"+
".chRow.me .chBub{background:linear-gradient(160deg,#5b3fa0,#3a2870);border-color:#8a6fe0;border-radius:14px 14px 4px 14px}"+
".chNm{font-size:11px;font-weight:800;color:#e2c27a;cursor:pointer;display:flex;gap:6px;align-items:baseline}"+
".chNm span{font-weight:600;color:#9488ab;font-size:10px}"+
".chNm .vN{font-weight:800;color:inherit;font-size:inherit}"+
".chTx{font-size:13px;line-height:1.35;color:#f0e8d2;word-break:break-word;margin-top:1px}"+
".chTm{font-size:9px;color:#8f84a6;text-align:right;margin-top:1px}"+
".chEmpty{margin:auto;text-align:center;color:#8f84a6;font-size:12px;padding:20px}"+
".chEmpty big{display:block;font-size:38px;margin-bottom:6px;animation:chFl 3s ease-in-out infinite}"+
"@keyframes chFl{50%{transform:translateY(-4px)}}"+
".chSend{position:relative;display:flex;gap:7px;padding:8px 10px calc(10px + env(safe-area-inset-bottom));border-top:1px solid #2f2745;background:#0e0918e6}"+
".chIn{flex:1;min-width:0;border-radius:14px;border:1px solid #3a3057;background:#150e24;color:#f0e8d2;padding:10px 12px;font:14px system-ui;outline:none;transition:.2s}"+
".chIn:focus{border-color:#e2c27a99;box-shadow:0 0 12px #8a5cff44}"+
".chGo{flex:0 0 44px;border-radius:14px;border:1px solid #e2c27a99;background:linear-gradient(160deg,#e2c27a,#a8843a);color:#1a1020;font-size:18px;cursor:pointer;transition:transform .15s}"+
".chGo:active{transform:scale(.88) rotate(-12deg)}"+
".chGo:disabled{opacity:.5}"+
".chErr{position:absolute;left:12px;right:12px;bottom:62px;background:#3a1620f2;border:1px solid #d9443c;color:#ffd0cc;font-size:12px;padding:6px 10px;border-radius:10px;opacity:0;transform:translateY(8px);transition:.25s;pointer-events:none;text-align:center}"+
".chErr.on{opacity:1;transform:none}"+
".chDmTop{display:flex;gap:6px;padding:10px 12px 4px}"+
".chFind{flex:1;min-width:0}"+
".chList{flex:1;overflow-y:auto;padding:6px 12px 12px;display:flex;flex-direction:column;gap:7px}"+
".chCv{display:flex;align-items:center;gap:9px;border:1px solid #3a3057;border-radius:13px;background:linear-gradient(160deg,#241a38,#150e26);padding:9px;cursor:pointer;color:inherit;font:inherit;text-align:left;animation:chIn .4s backwards;animation-delay:calc(var(--i)*45ms)}"+
".chCv:active{transform:scale(.97)}"+
".chCv .nm{font-weight:800;font-size:13px;color:#f6ecd0}"+
".chCv .ls{font-size:11px;color:#9488ab;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}"+
".chCv .un{margin-left:auto;background:#d9443c;color:#fff;border-radius:99px;font-size:10px;font-weight:700;padding:2px 7px;box-shadow:0 0 8px #d9443caa}"+
".chSec{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#a99dba;margin:4px 0 0}"+
".chTh{position:absolute;inset:0;display:none;flex-direction:column;background:#0e0918;z-index:2}"+
".chTh.on{display:flex;animation:chFade .3s}"+
".chThH{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #2f2745;font-weight:800;color:#e2c27a;font-size:14px}"+
".chThH button{border:1px solid #3a3057;background:#120c1e;color:#d6b779;border-radius:10px;padding:5px 10px;font:700 13px system-ui;cursor:pointer}"+
"@media(prefers-reduced-motion:reduce){#chPanel,#chBack,.chRow,.chCv,.chPane.on,.chTh.on{transition:none!important;animation:none!important}#chFab,#chFab::after{animation:none!important}}";
document.head.appendChild(css);

var S={open:false,tab:"world",ws:0,wseen:parseInt(ls("lotm_chat_ws")||"0",10)||0,unreadDm:0,newWorld:0,peer:null,peerNick:"",ds:0,me:"",busy:false,poll:null,booted:false};
var fab,back,panel,wMsgs,wIn,wGo,dList,thread,tMsgs,tIn,tGo,err,tabW,tabD,find,findRes;

function build(){
 fab=el("button");fab.id="chFab";fab.type="button";fab.setAttribute("aria-label","Чат");fab.setAttribute("data-nosnd","1");
 fab.append("💬",el("b"));
 fab.addEventListener("click",function(e){e.stopPropagation();open()});
 document.body.appendChild(fab);
 back=el("div");back.id="chBack";back.addEventListener("click",close);document.body.appendChild(back);
 panel=el("div");panel.id="chPanel";panel.setAttribute("data-nosnd","1");panel.setAttribute("role","dialog");
 var head=el("div","chHead");head.appendChild(el("div","chGrip"));
 tabW=el("button","chTab on");tabW.type="button";tabW.append("🌍 Мир",el("i"));
 tabD=el("button","chTab");tabD.type="button";tabD.append("✉ Личные",el("i"));
 var x=el("button","chX","✕");x.type="button";
 tabW.addEventListener("click",function(){setTab("world")});tabD.addEventListener("click",function(){setTab("dm")});x.addEventListener("click",close);
 head.append(tabW,tabD,x);
 var body=el("div","chBody");
 // мир
 var pw=el("div","chPane on");pw.id="chPW";
 wMsgs=el("div","chMsgs");
 var sw=sendBar(function(t){return send("chat_send",{txt:t})});wIn=sw.in;wGo=sw.go;
 pw.append(wMsgs,sw.bar);
 // лс
 var pd=el("div","chPane");pd.id="chPD";
 var top=el("div","chDmTop");find=el("input","chIn chFind");find.placeholder="🔎 Найти игрока по нику…";find.maxLength=24;
 top.appendChild(find);
 findRes=el("div","chList");
 dList=findRes;
 pd.append(top,findRes);
 thread=el("div","chTh");
 var th=el("div","chThH");var bk=el("button",null,"←");bk.type="button";bk.addEventListener("click",closeThread);
 th.append(bk,el("span"));
 tMsgs=el("div","chMsgs");
 var st=sendBar(function(t){return send("dm_send",{txt:t,to:S.peer})});tIn=st.in;tGo=st.go;
 thread.append(th,tMsgs,st.bar);
 pd.appendChild(thread);
 body.append(pw,pd);
 err=el("div","chErr");
 panel.append(head,body,err);
 document.body.appendChild(panel);
 var ft=null;
 find.addEventListener("input",function(){clearTimeout(ft);ft=setTimeout(doFind,350)});
 if(window.visualViewport){var f=function(){if(!S.open)return;var vv=window.visualViewport;panel.style.bottom=Math.max(0,window.innerHeight-vv.height-vv.offsetTop)+"px";panel.style.height=Math.min(vv.height*.9,640)+"px"};visualViewport.addEventListener("resize",f);visualViewport.addEventListener("scroll",f)}
}
function sendBar(fn){
 var bar=el("div","chSend");var i=el("input","chIn");i.placeholder="Сообщение…";i.maxLength=200;i.autocomplete="off";
 var g=el("button","chGo","➤");g.type="button";
 function go(){var t=i.value.trim();if(!t||g.disabled)return;g.disabled=true;sfx("tap");
  fn(t).then(function(ok){if(ok){i.value=""}}).then(function(){g.disabled=false;i.focus()},function(){g.disabled=false})}
 g.addEventListener("click",go);i.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();go()}});
 bar.append(i,g);return{bar:bar,in:i,go:g};
}
function showErr(t){err.textContent=t;err.classList.add("on");clearTimeout(showErr.t);showErr.t=setTimeout(function(){err.classList.remove("on")},2400)}

function send(action,p){
 p.action=action;
 return call(p).then(function(d){
  if(!d.ok){showErr(d.text||(d.error==="empty"?"Пустое сообщение":"Не удалось отправить"));sfx("bad");return false}
  sync();return true;
 },function(){showErr("Нет связи с сервером");return false});
}

function setTab(t){
 S.tab=t;tabW.classList.toggle("on",t==="world");tabD.classList.toggle("on",t==="dm");
 document.getElementById("chPW").classList.toggle("on",t==="world");document.getElementById("chPD").classList.toggle("on",t==="dm");
 if(t==="world"){S.newWorld=0;markWorld();scrollDown(wMsgs,true)}else{loadList()}
 paint();sfx("tap");
}
function open(){
 if(S.open)return;S.open=true;back.classList.add("on");panel.classList.add("on");sfx("open");
 try{window.Telegram&&Telegram.WebApp&&Telegram.WebApp.expand()}catch(e){}
 S.newWorld=0;markWorld();paint();sync();startPoll();
 setTimeout(function(){scrollDown(wMsgs,true)},350);
}
function close(){
 if(!S.open)return;S.open=false;back.classList.remove("on");panel.classList.remove("on");panel.style.bottom="";panel.style.height="";
 try{document.activeElement&&document.activeElement.blur()}catch(e){}
 sfx("back");startPoll();
}
function markWorld(){if(S.ws>S.wseen){S.wseen=S.ws;ls("lotm_chat_ws",String(S.wseen))}}
function paint(){
 var C=cfg();fab.style.display=C.fab?"":"none";
 var n=(C.dm?S.unreadDm:0)+(C.world&&!(S.open&&S.tab==="world")?S.newWorld:0);
 var b=fab.querySelector("b");b.textContent=n>0?(n>99?"99+":String(n)):"";
 fab.classList.toggle("has",n>0);
 var i=tabD.querySelector("i");i.textContent=S.unreadDm>0?String(S.unreadDm):"";
 var j=tabW.querySelector("i");j.textContent=(S.open&&S.tab!=="world"&&S.newWorld>0)?String(S.newWorld):"";
}
function scrollDown(c,force){
 var near=c.scrollHeight-c.scrollTop-c.clientHeight<90;
 if(force||near)c.scrollTop=c.scrollHeight;
}
function msgRow(m,i){
 var mine=String(m.uid)===String(S.me);
 var r=el("div","chRow"+(mine?" me":""));r.dataset.id=m.id;
 var av=el("div","chAv"+(window.VIP?VIP.f(m.v):""),PATH[m.path]||"👤");
 var bub=el("div","chBub");
 if(!mine){
  var nm=el("div","chNm");if(window.VIP&&m.v){var nb=el("div");nb.innerHTML=VIP.n(m.nick,m.v);nm.appendChild(nb)}else nm.textContent=m.nick;nm.appendChild(el("span",null,"ур."+m.lvl));
  var go=function(){if(window.PCard)PCard.open(String(m.uid),m.nick);else openThread(String(m.uid),m.nick)};
  nm.addEventListener("click",go);av.addEventListener("click",go);bub.appendChild(nm);
 }
 bub.appendChild(el("div","chTx",m.txt));bub.appendChild(el("div","chTm",hhmm(m.t)));
 r.append(av,bub);
 if(!reduce&&i!==undefined)r.style.animationDelay=Math.min(i,8)*30+"ms";
 return r;
}
function appendMsgs(box,list,first){
 if(first)box.replaceChildren();
 var empty=box.querySelector(".chEmpty");if(empty&&list.length)empty.remove();
 var near=box.scrollHeight-box.scrollTop-box.clientHeight<90;
 list.forEach(function(m,i){if(!box.querySelector('[data-id="'+m.id+'"]'))box.appendChild(msgRow(m,i))});
 while(box.children.length>80)box.firstChild.remove();
 if(!box.children.length){var e=el("div","chEmpty");e.append(el("big",null,box===wMsgs?"🌫️":"✉"),box===wMsgs?"В мире пока тихо. Скажи первое слово.":"Напиши первое сообщение.");box.appendChild(e)}
 if(first||near)box.scrollTop=box.scrollHeight;
}

var firstWorld=true,firstThread=false;
function sync(){
 if(S.busy)return;S.busy=true;
 var p={action:"chat_sync",ws:S.ws};
 if(S.open&&S.peer){p.peer=S.peer;p.ds=S.ds}
 call(p).then(function(d){
  S.busy=false;if(!d.ok)return;
  S.me=d.me||S.me;
  var w=Array.isArray(d.world)?d.world:[];
  if(!S.booted){S.booted=true;
   if(w.length){S.ws=w[w.length-1].id;if(!ls("lotm_chat_ws")){S.wseen=S.ws;ls("lotm_chat_ws",String(S.ws))}}
   S.newWorld=w.filter(function(m){return m.id>S.wseen&&String(m.uid)!==String(S.me)}).length;
   appendMsgs(wMsgs,w,true);
  }else if(w.length){
   var incoming=w.filter(function(m){return String(m.uid)!==String(S.me)});
   S.ws=w[w.length-1].id;appendMsgs(wMsgs,w,false);
   if(S.open&&S.tab==="world"){markWorld()}else{S.newWorld+=incoming.length}
   if(incoming.length){ring("world")}
  }else if(!wMsgs.children.length){appendMsgs(wMsgs,[],true)}
  var un=d.unread|0;
  if(un>S.unreadDm){ring("dm")}
  S.unreadDm=un;
  if(S.peer&&Array.isArray(d.dm)){
   var dm=d.dm;
   if(dm.length){S.ds=dm[dm.length-1].id;appendMsgs(tMsgs,dm,firstThread);firstThread=false;if(dm.some(function(m){return String(m.uid)!==String(S.me)})&&cfg().snd)sfx(cfg().tone)}
   else if(firstThread){appendMsgs(tMsgs,[],true);firstThread=false}
  }
  paint();
 },function(){S.busy=false});
}
function ring(kind){
 var C=cfg();if(kind==="world"&&!C.world)return;if(kind==="dm"&&!C.dm)return;
 if(S.open&&!(kind==="dm"&&S.tab!=="dm"))return;
 if(C.snd)sfx(C.tone);
 if(reduce||!C.shake)return;fab.classList.remove("ring");void fab.offsetWidth;fab.classList.add("ring");
}
function startPoll(){
 clearInterval(S.poll);
 S.poll=setInterval(function(){paint();if(!document.hidden)sync();if(S.open&&S.tab==="dm"&&!S.peer)loadList()},S.open?3500:25000);
}

function pathIco(p){return PATH[p]||"👤"}
function loadList(){
 if(S.peer)return;
 call({action:"dm_list"}).then(function(d){
  if(!d.ok||find.value.trim())return;
  var l=Array.isArray(d.list)?d.list:[];
  dList.replaceChildren();
  if(!l.length){var e=el("div","chEmpty");e.append(el("big",null,"✉"),"Бесед пока нет.\nНайди игрока по нику или нажми на имя в чате Мира.");e.style.whiteSpace="pre-line";dList.appendChild(e);return}
  dList.appendChild(el("div","chSec","Беседы"));
  l.forEach(function(c,i){dList.appendChild(convRow(c.uid,c.nick,c.last,c.unread,i,"👤",c.v))});
 },function(){});
}
function convRow(uid,nick,last,unread,i,ico,v){
 var b=el("button","chCv");b.type="button";b.style.setProperty("--i",i);
 b.appendChild(el("div","chAv"+(window.VIP?VIP.f(v):""),ico));
 var nmE=el("div","nm");if(window.VIP&&v)nmE.innerHTML=VIP.n(nick,v);else nmE.textContent=nick;
 var t=el("div");t.append(nmE,el("div","ls",last||""));b.appendChild(t);
 if(unread>0)b.appendChild(el("div","un",String(unread)));
 b.addEventListener("click",function(){openThread(uid,nick)});return b;
}
function doFind(){
 var q=find.value.trim();if(!q){loadList();return}
 call({action:"dm_find",q:q}).then(function(d){
  if(find.value.trim()!==q)return;
  dList.replaceChildren();
  var u=Array.isArray(d.users)?d.users:[];
  if(!u.length){var e=el("div","chEmpty","Никого не нашлось.");dList.appendChild(e);return}
  u.forEach(function(x,i){dList.appendChild(convRow(x.uid,x.nick,"Ур. "+x.lvl,0,i,pathIco(x.path),x.v))});
 },function(){});
}
function openThread(uid,nick){
 if(String(uid)===String(S.me))return;
 if(!S.open)open();
 if(S.tab!=="dm"){S.tab="dm";tabW.classList.remove("on");tabD.classList.add("on");document.getElementById("chPW").classList.remove("on");document.getElementById("chPD").classList.add("on")}
 S.peer=String(uid);S.peerNick=nick;S.ds=0;firstThread=true;
 thread.querySelector(".chThH span").textContent="✉ "+nick;
 tMsgs.replaceChildren();thread.classList.add("on");sfx("scroll");
 S.busy=false;sync();setTimeout(function(){try{tIn.focus()}catch(e){}},300);
}
window.__lotmDm=openThread;
function closeThread(){S.peer=null;thread.classList.remove("on");sfx("back");find.value="";loadList();sync()}

function boot(){
 if(!document.body)return;
 build();
 sync();startPoll();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.LOTM_CHAT={open:open,close:close};
})();
