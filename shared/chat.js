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
 var ac=null,tm=null,o={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p),cache:"no-store"};
 try{if(window.AbortController){ac=new AbortController();o.signal=ac.signal;tm=setTimeout(function(){try{ac.abort()}catch(e){}},20000)}}catch(e){}
 return fetch(URL_,o)
 .then(function(r){clearTimeout(tm);if(!r.ok)throw new Error("http");return r.json()},function(e){clearTimeout(tm);throw e}).then(function(d){d=unwrap(d);if(!d||typeof d!=="object")throw new Error("bad");return d});
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
".chTab{flex:1;min-width:0;position:relative;border:1px solid #3a3057;background:#120c1e;color:#b8accb;border-radius:12px;padding:8px 2px;font:700 12px system-ui;cursor:pointer;transition:.25s;white-space:nowrap}"+
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
".chStkB{flex:0 0 40px;border-radius:14px;border:1px solid #3a3057;background:#150e24;color:#e2c27a;font-size:19px;cursor:pointer;padding:0}"+
".chStkB.on{border-color:#e2c27a99;background:#2a1f4a}"+
".chStkP{position:absolute;left:0;right:0;bottom:100%;max-height:190px;overflow-y:auto;display:none;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px;background:#0e0918f4;border-top:1px solid #3a3057;-webkit-overflow-scrolling:touch}"+
".chStkP.on{display:grid}"+
".chStkP button{aspect-ratio:1;border:0;border-radius:10px;background:#1a1230;padding:3px;cursor:pointer;display:flex;align-items:center;justify-content:center}"+
".chStkP button:active{transform:scale(.92)}"+
".chStkP img,.chStk img{width:100%;height:100%;object-fit:contain;display:block}"+
".chStkP .chStkE{grid-column:1/-1;text-align:center;color:#8f84a6;font:12px system-ui;padding:10px}"+
".chBub.stk{background:none;border:0;padding:2px 4px}"+
".chStk{width:128px;height:128px}"+
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
".chFr{display:flex;align-items:center;gap:9px;border:1px solid #3a3057;border-radius:13px;background:linear-gradient(160deg,#241a38,#150e26);padding:8px 9px;color:inherit;font:inherit;animation:chIn .4s backwards;animation-delay:calc(var(--i)*40ms)}"+
".chFr .mid{flex:1;min-width:0;cursor:pointer}.chFr .nm{font-weight:800;font-size:13px;color:#f6ecd0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"+
".chFr .ls{font-size:11px;color:#9488ab}.chFr .ls.on{color:#7fd69a}"+
".chFr .acts{display:flex;gap:6px}.chFr .acts button{border:1px solid #3a3057;background:#120c1e;color:#d6b779;border-radius:10px;padding:7px 10px;font:700 12px system-ui;cursor:pointer}"+
".chFr .acts button.ok{border-color:#5aa874;color:#9be6b2}.chFr .acts button.no{color:#e0908a}"+
".chSec{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#a99dba;margin:4px 0 0}"+
".chTh{position:absolute;inset:0;display:none;flex-direction:column;background:#0e0918;z-index:2}"+
".chTh.on{display:flex;animation:chFade .3s}"+
".chThH{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #2f2745;font-weight:800;color:#e2c27a;font-size:14px}"+
".chThH button{border:1px solid #3a3057;background:#120c1e;color:#d6b779;border-radius:10px;padding:5px 10px;font:700 13px system-ui;cursor:pointer}"+
"@media(prefers-reduced-motion:reduce){#chPanel,#chBack,.chRow,.chCv,.chPane.on,.chTh.on{transition:none!important;animation:none!important}#chFab,#chFab::after{animation:none!important}}";
document.head.appendChild(css);

var S={open:false,tab:"world",cs:0,cseen:parseInt(ls("lotm_chat_cs")||"0",10)||0,newClan:0,cn:"",fq:0,ci:0,ws:0,wseen:parseInt(ls("lotm_chat_ws")||"0",10)||0,unreadDm:0,newWorld:0,peer:null,peerNick:"",ds:0,me:"",busy:false,poll:null,booted:false};
var fab,back,panel,wMsgs,wIn,wGo,dList,thread,tMsgs,tIn,tGo,err,tabW,tabD,tabC,tabF,cMsgs,cIn,cInfo,fList,fFind,fBody,find,findRes;

function build(){
 fab=el("button");fab.id="chFab";fab.type="button";fab.setAttribute("aria-label","Чат");fab.setAttribute("data-nosnd","1");
 fab.append("💬",el("b"));
 fab.addEventListener("click",function(e){e.stopPropagation();open()});
 document.body.appendChild(fab);
 back=el("div");back.id="chBack";back.addEventListener("click",close);document.body.appendChild(back);
 panel=el("div");panel.id="chPanel";panel.setAttribute("data-nosnd","1");panel.setAttribute("role","dialog");
 var head=el("div","chHead");head.appendChild(el("div","chGrip"));
 tabW=el("button","chTab on");tabW.type="button";tabW.append("🌍 Мир",el("i"));
 tabC=el("button","chTab");tabC.type="button";tabC.append("⚜ Клан",el("i"));
 tabD=el("button","chTab");tabD.type="button";tabD.append("✉ ЛС",el("i"));
 tabF=el("button","chTab");tabF.type="button";tabF.append("👥 Друзья",el("i"));
 var x=el("button","chX","✕");x.type="button";
 tabW.addEventListener("click",function(){setTab("world")});tabC.addEventListener("click",function(){setTab("clan")});tabD.addEventListener("click",function(){setTab("dm")});tabF.addEventListener("click",function(){setTab("fr")});x.addEventListener("click",close);
 head.append(tabW,tabC,tabD,tabF,x);
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
 // клан
 var pc=el("div","chPane");pc.id="chPC";
 cInfo=el("div","chSec");cInfo.style.cssText="padding:8px 12px 0;margin:0";
 cMsgs=el("div","chMsgs");
 var sc=sendBar(function(t){return send("chat_send",{txt:t,ch:"clan"})});cIn=sc.in;
 pc.append(cInfo,cMsgs,sc.bar);
 // друзья
 var pf=el("div","chPane");pf.id="chPF";
 var ftop=el("div","chDmTop");fFind=el("input","chIn chFind");fFind.placeholder="🔎 Найти игрока, чтобы добавить…";fFind.maxLength=24;ftop.appendChild(fFind);
 fList=el("div","chList");
 pf.append(ftop,fList);
 body.append(pw,pc,pd,pf);
 err=el("div","chErr");
 panel.append(head,body,err);
 document.body.appendChild(panel);
 var ft=null;
 find.addEventListener("input",function(){clearTimeout(ft);ft=setTimeout(doFind,350)});
 var ft2=null;fFind.addEventListener("input",function(){clearTimeout(ft2);ft2=setTimeout(doFindFr,350)});
 if(window.visualViewport){var f=function(){if(!S.open)return;var vv=window.visualViewport;panel.style.bottom=Math.max(0,window.innerHeight-vv.height-vv.offsetTop)+"px";panel.style.height=Math.min(vv.height*.9,640)+"px"};visualViewport.addEventListener("resize",f);visualViewport.addEventListener("scroll",f)}
}
var STK={ids:null,img:{},busy:{},
 list:function(){if(STK.ids)return Promise.resolve(STK.ids);
  try{var c=JSON.parse(ls("lotm_stk_ids")||"null");if(c&&c.length)STK.ids=c}catch(e){}
  return call({action:"stk_list"}).then(function(d){if(d.ok&&d.ids){STK.ids=d.ids;ls("lotm_stk_ids",JSON.stringify(d.ids))}return STK.ids||[]},function(){return STK.ids||[]})},
 src:function(id){if(STK.img[id])return Promise.resolve(STK.img[id]);
  var c=ls("lotm_stk_"+id);if(c){STK.img[id]=c;return Promise.resolve(c)}
  if(STK.busy[id])return STK.busy[id];
  return STK.busy[id]=call({action:"stk_get",id:id}).then(function(d){delete STK.busy[id];if(!d.ok||!d.d)return null;var u="data:image/webp;base64,"+d.d;STK.img[id]=u;ls("lotm_stk_"+id,u);return u},function(){delete STK.busy[id];return null})},
 fill:function(im,id){STK.src(id).then(function(u){if(u)im.src=u;else im.alt="🖼"})}
};
var STKRE=/^\[stk:([\w-]{1,40})\]$/;
function sendBar(fn){
 var bar=el("div","chSend");var i=el("input","chIn");i.placeholder="Сообщение…";i.maxLength=200;i.autocomplete="off";
 var g=el("button","chGo","➤");g.type="button";
 var sb=el("button","chStkB","🙂");sb.type="button";var sp=el("div","chStkP");
 function sendStk(id){if(g.disabled)return;g.disabled=true;sfx("tap");sp.classList.remove("on");sb.classList.remove("on");
  fn("[stk:"+id+"]").then(function(){g.disabled=false},function(){g.disabled=false})}
 sb.addEventListener("click",function(){var on=!sp.classList.contains("on");sp.classList.toggle("on",on);sb.classList.toggle("on",on);sfx("tap");
  if(on&&!sp.children.length){sp.appendChild(el("div","chStkE","Загрузка…"));
   STK.list().then(function(ids){sp.replaceChildren();if(!ids.length){sp.appendChild(el("div","chStkE","Стикеров пока нет"));return}
    ids.forEach(function(id){var b=el("button");b.type="button";var im=document.createElement("img");im.loading="lazy";im.alt="";b.appendChild(im);b.addEventListener("click",function(){sendStk(id)});sp.appendChild(b);STK.fill(im,id)})})}});
 function go(){var t=i.value.trim();if(!t||g.disabled)return;g.disabled=true;sfx("tap");
  fn(t).then(function(ok){if(ok){i.value=""}}).then(function(){g.disabled=false;i.focus()},function(){g.disabled=false})}
 g.addEventListener("click",go);i.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();go()}});
 bar.append(sp,sb,i,g);return{bar:bar,in:i,go:g};
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
 S.tab=t;tabW.classList.toggle("on",t==="world");tabC.classList.toggle("on",t==="clan");tabD.classList.toggle("on",t==="dm");tabF.classList.toggle("on",t==="fr");
 document.getElementById("chPW").classList.toggle("on",t==="world");document.getElementById("chPC").classList.toggle("on",t==="clan");document.getElementById("chPD").classList.toggle("on",t==="dm");document.getElementById("chPF").classList.toggle("on",t==="fr");
 if(t==="world"){S.newWorld=0;markWorld();scrollDown(wMsgs,true)}
 else if(t==="clan"){S.newClan=0;markClan();scrollDown(cMsgs,true);sync()}
 else if(t==="fr"){loadFriends()}
 else{loadList()}
 paint();sfx("tap");
}
function open(){
 if(S.open)return;S.open=true;back.classList.add("on");panel.classList.add("on");sfx("open");
 try{window.Telegram&&Telegram.WebApp&&Telegram.WebApp.expand()}catch(e){}
 S.newWorld=0;markWorld();if(S.tab==="clan"){S.newClan=0;markClan()}paint();S.idle=0;sync();startPoll();
 setTimeout(function(){scrollDown(wMsgs,true)},350);
}
function close(){
 if(!S.open)return;S.open=false;back.classList.remove("on");panel.classList.remove("on");panel.style.bottom="";panel.style.height="";
 try{document.activeElement&&document.activeElement.blur()}catch(e){}
 sfx("back");startPoll();
}
function markClan(){if(S.cs>S.cseen){S.cseen=S.cs;ls("lotm_chat_cs",String(S.cseen))}}
function markWorld(){if(S.ws>S.wseen){S.wseen=S.ws;ls("lotm_chat_ws",String(S.wseen))}}
function paint(){
 var C=cfg();fab.style.display=C.fab?"":"none";
 var n=(C.dm?S.unreadDm:0)+(C.world&&!(S.open&&S.tab==="world")?S.newWorld:0)+(!(S.open&&S.tab==="clan")?S.newClan:0)+S.fq+S.ci;
 var b=fab.querySelector("b");b.textContent=n>0?(n>99?"99+":String(n)):"";
 fab.classList.toggle("has",n>0);
 var i=tabD.querySelector("i");i.textContent=S.unreadDm>0?String(S.unreadDm):"";
 var j=tabW.querySelector("i");j.textContent=(S.open&&S.tab!=="world"&&S.newWorld>0)?String(S.newWorld):"";
 var k=tabC.querySelector("i");k.textContent=(S.open&&S.tab!=="clan"&&S.newClan>0)?String(S.newClan):"";
 var f=tabF.querySelector("i");f.textContent=(S.fq+S.ci)>0?String(S.fq+S.ci):"";
}
function scrollDown(c,force){
 var near=c.scrollHeight-c.scrollTop-c.clientHeight<90;
 if(force||near)c.scrollTop=c.scrollHeight;
}
function msgRow(m,i){
 var mine=String(m.uid)===String(S.me);
 var r=el("div","chRow"+(mine?" me":""));r.dataset.id=m.id;
 var av=el("div","chAv"+(window.VIP?VIP.f(m.v):""),PATH[m.path]||"👤");fillAv(av,m.path,m.g,true);
 var bub=el("div","chBub");
 if(!mine){
  var nm=el("div","chNm");if(window.VIP&&m.v){var nb=el("div");nb.innerHTML=VIP.n(m.nick,m.v);nm.appendChild(nb)}else nm.textContent=m.nick;nm.appendChild(el("span",null,"ур."+m.lvl));
  var go=function(){if(window.PCard)PCard.open(String(m.uid),m.nick);else openThread(String(m.uid),m.nick)};
  nm.addEventListener("click",go);av.addEventListener("click",go);bub.appendChild(nm);
 }
 var sm=STKRE.exec(String(m.txt||""));
 if(sm){bub.classList.add("stk");var sd=el("div","chStk");var si=document.createElement("img");si.alt="🖼";sd.appendChild(si);bub.appendChild(sd);STK.fill(si,sm[1])}
 else bub.appendChild(el("div","chTx",m.txt));bub.appendChild(el("div","chTm",hhmm(m.t)));
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
 if(!box.children.length){var e=el("div","chEmpty");e.append(el("big",null,box===wMsgs?"🌫️":box===cMsgs?"⚜":"✉"),box===wMsgs?"В мире пока тихо. Скажи первое слово.":box===cMsgs?(S.cn?"В клане пока тихо. Скажи первое слово.":"Ты не состоишь в клане. Вступи в клан, чтобы общаться с братьями."):"Напиши первое сообщение.");box.appendChild(e)}
 if(first||near)box.scrollTop=box.scrollHeight;
}

var firstWorld=true,firstThread=false;
function sync(){
 if(S.busy)return;S.busy=true;
 var p={action:"chat_sync",ws:S.ws,cs:S.cs};
 if(S.open&&S.peer){p.peer=S.peer;p.ds=S.ds}
 call(p).then(function(d){
  S.busy=false;if(!d.ok)return;
  S.me=d.me||S.me;var _sg=(Array.isArray(d.world)?d.world.length:0)+(Array.isArray(d.clan)?d.clan.length:0)+(Array.isArray(d.dm)?d.dm.length:0)+((d.unread|0)!==S.unreadDm?1:0)+((d.fq|0)!==S.fq?1:0)+((d.ci|0)!==S.ci?1:0);S.idle=_sg?0:(S.idle|0)+1;
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
  var cl=Array.isArray(d.clan)?d.clan:[];
  var hadClan=!!S.cn;S.cn=d.cn||"";
  S.fq=d.fq|0;S.ci=d.ci|0;
  cInfo.textContent=S.cn?"⚜ "+S.cn:"";
  if(!S.cbooted){S.cbooted=true;
   if(cl.length){S.cs=cl[cl.length-1].id;if(!ls("lotm_chat_cs")){S.cseen=S.cs;ls("lotm_chat_cs",String(S.cs))}}
   S.newClan=cl.filter(function(m){return m.id>S.cseen&&String(m.uid)!==String(S.me)}).length;
   appendMsgs(cMsgs,cl,true);
  }else if(cl.length){
   var cin=cl.filter(function(m){return String(m.uid)!==String(S.me)});
   S.cs=cl[cl.length-1].id;appendMsgs(cMsgs,cl,false);
   if(S.open&&S.tab==="clan"){markClan()}else{S.newClan+=cin.length}
   if(cin.length)ring("clan");
  }else if(!cMsgs.children.length||hadClan!==!!S.cn){appendMsgs(cMsgs,[],true)}
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
 var C=cfg();if(kind==="world"&&!C.world)return;if(kind==="clan"&&S.open&&S.tab==="clan")return;if(kind==="dm"&&!C.dm)return;
 if(S.open&&!(kind==="dm"&&S.tab!=="dm"))return;
 if(C.snd)sfx(C.tone);
 if(reduce||!C.shake)return;fab.classList.remove("ring");void fab.offsetWidth;fab.classList.add("ring");
}
function pollDelay(){
 if(S.open)return S.idle>6?9000:5000;
 return S.idle>8?90000:(S.idle>3?60000:30000);
}
function startPoll(){
 clearTimeout(S.poll);S.tk=(S.tk||0);
 var run=function(){
  paint();
  if(!document.hidden){S.tk++;sync();if(S.open&&S.tab==="dm"&&!S.peer&&S.tk%2===0)loadList();if(S.open&&S.tab==="fr"&&!fFind.value.trim()&&S.tk%3===0)loadFriends()}
  S.poll=setTimeout(run,pollDelay());
 };
 S.poll=setTimeout(run,pollDelay());
}

function pathIco(p){return PATH[p]||"👤"}
function fillAv(n,p,g,st){try{if(window.LOTM_AV&&LOTM_AV.key(p))LOTM_AV.fill(n,p,PATH[p],g,st)}catch(e){}}
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
function convRow(uid,nick,last,unread,i,ico,v,g){
 var b=el("button","chCv");b.type="button";b.style.setProperty("--i",i);
 var _av=el("div","chAv"+(window.VIP?VIP.f(v):""),pathIco(ico));if(PATH[ico])fillAv(_av,ico,g,i>=12);b.appendChild(_av);
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
  u.forEach(function(x,i){dList.appendChild(convRow(x.uid,x.nick,"Ур. "+x.lvl,0,i,x.path,x.v,x.g))});
 },function(){});
}
function seenTxt(sec){
 if(sec<0)return{t:"давно не заходил",on:false};
 if(sec<180)return{t:"в сети",on:true};
 if(sec<3600)return{t:"был "+Math.round(sec/60)+" мин назад",on:false};
 if(sec<86400)return{t:"был "+Math.round(sec/3600)+" ч назад",on:false};
 return{t:"был "+Math.round(sec/86400)+" дн назад",on:false};
}
function frRow(x,i,mode){
 var r=el("div","chFr");r.style.setProperty("--i",i);
 var av=el("div","chAv"+(window.VIP?VIP.f(x.v):""),pathIco(x.path));fillAv(av,x.path,x.g,i>=12);
 var mid=el("div","mid");var nmE=el("div","nm");if(window.VIP&&x.v)nmE.innerHTML=VIP.n(x.nick,x.v);else nmE.textContent=x.nick;
 var sub;
 if(mode==="friend"){var sn=seenTxt(x.seen==null?-1:x.seen);sub=el("div","ls"+(sn.on?" on":""),(sn.on?"● ":"")+"Ур. "+x.lvl+" · "+sn.t)}
 else sub=el("div","ls","Ур. "+x.lvl+(mode==="req"?" · хочет дружить":mode==="sent"?" · заявка отправлена":""));
 mid.append(nmE,sub);
 var open=function(){if(window.PCard)PCard.open(String(x.uid),x.nick)};
 av.addEventListener("click",open);mid.addEventListener("click",open);
 r.append(av,mid);
 var acts=el("div","acts");
 if(mode==="friend"){var w=el("button",null,"✉");w.type="button";w.title="Написать";w.addEventListener("click",function(){openThread(String(x.uid),x.nick)});acts.appendChild(w)}
 if(mode==="req"){
  var ok=el("button","ok","✓");ok.type="button";ok.addEventListener("click",function(){frOp("accept",x.uid)});
  var no=el("button","no","✕");no.type="button";no.addEventListener("click",function(){frOp("decline",x.uid)});acts.append(ok,no);
 }
 if(mode==="sent"){var cx=el("button",null,"Отозвать");cx.type="button";cx.addEventListener("click",function(){frOp("cancel",x.uid)});acts.appendChild(cx)}
 if(mode==="find"){var ad=el("button","ok","＋ Добавить");ad.type="button";ad.addEventListener("click",function(){frOp("add",x.uid)});acts.appendChild(ad)}
 r.appendChild(acts);return r;
}
function frOp(op,uid){
 call({action:"friend_op",op:op,uid:String(uid)}).then(function(d){
  if(!d.ok){showErr(d.text||"Не получилось");sfx("bad");return}
  sfx(op==="add"&&d.state==="sent"?"tap":"win");
  if(op==="add"&&d.state==="sent")showErr("Заявка отправлена");
  if(op==="add"&&d.state==="friend")showErr("Вы теперь друзья");
  fFind.value="";loadFriends(true);
 },function(){showErr("Нет связи с сервером")});
}
window.__lotmFriendOp=frOp;window.__lotmFriendsChanged=function(){if(S.open&&S.tab==="fr"&&!fFind.value.trim())loadFriends();else sync()};
function loadFriends(force){
 Promise.all([call({action:"friend_list"}),call({action:"clan_inv_list"}).catch(function(){return{ok:false}})]).then(function(rr){
  var d=rr[0],iv=rr[1];
  if(!d.ok||(fFind.value.trim()&&!force))return;
  fList.replaceChildren();
  var rq=d.requests||[],fl=d.friends||[],se=d.sent||[],il=(iv&&iv.ok&&iv.inv)||[];S.fq=rq.length;S.ci=il.length;paint();
  if(il.length){fList.appendChild(el("div","chSec","Приглашения в клан"));il.forEach(function(x,i){fList.appendChild(invRow(x,i))})}
  if(rq.length){fList.appendChild(el("div","chSec","Заявки в друзья"));rq.forEach(function(x,i){fList.appendChild(frRow(x,i,"req"))})}
  fList.appendChild(el("div","chSec","Друзья · "+fl.length+"/"+(d.cap||50)));
  if(!fl.length){var e=el("div","chEmpty");e.append(el("big",null,"👥"),"Друзей пока нет.\nНайди игрока по нику или нажми на его имя в чате.");e.style.whiteSpace="pre-line";fList.appendChild(e)}
  fl.forEach(function(x,i){fList.appendChild(frRow(x,i,"friend"))});
  if(se.length){fList.appendChild(el("div","chSec","Отправленные заявки"));se.forEach(function(x,i){fList.appendChild(frRow(x,i,"sent"))})}
 },function(){});
}
function invRow(x,i){
 var r=el("div","chFr");r.style.setProperty("--i",i);
 r.appendChild(el("div","chAv","⚜"));
 var mid=el("div","mid");mid.appendChild(el("div","nm","["+x.t+"] "+x.n));
 mid.appendChild(el("div","ls","от "+x.from+" · "+x.mem+"/"+x.cap+" · ур. клана "+x.lv));
 r.appendChild(mid);
 var acts=el("div","acts");
 var ok=el("button","ok","✓ Вступить");ok.type="button";
 var no=el("button","no","✕");no.type="button";
 ok.addEventListener("click",function(){
  ok.disabled=true;
  call({action:"clan_inv_accept",cid:x.cid}).then(function(d){
   if(!d.ok){ok.disabled=false;showErr(d.text||"Не получилось");sfx("bad");return}
   sfx("win");showErr("Ты принят в «"+x.n+"»");S.cn="";sync();loadFriends(true);
  },function(){ok.disabled=false;showErr("Нет связи с сервером")});
 });
 no.addEventListener("click",function(){
  call({action:"clan_inv_decline",cid:x.cid}).then(function(){sfx("back");loadFriends(true)},function(){showErr("Нет связи с сервером")});
 });
 acts.append(ok,no);r.appendChild(acts);return r;
}
function doFindFr(){
 var q=fFind.value.trim();if(!q){loadFriends();return}
 call({action:"dm_find",q:q}).then(function(d){
  if(fFind.value.trim()!==q)return;
  fList.replaceChildren();
  var u=Array.isArray(d.users)?d.users:[];
  if(!u.length){fList.appendChild(el("div","chEmpty","Никого не нашлось."));return}
  u.forEach(function(x,i){fList.appendChild(frRow(x,i,"find"))});
 },function(){});
}
function openThread(uid,nick){
 if(String(uid)===String(S.me))return;
 if(!S.open)open();
 if(S.tab!=="dm")setTab("dm");
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
