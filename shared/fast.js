/* LOTM fast: мгновенный отклик кнопок, кэш состояний (stale-while-revalidate), предзагрузка страниц. */
(function(){
"use strict";
if(window.LOTM_FAST)return;
var F=window.LOTM_FAST={};
var qs=new URLSearchParams(location.search),UID=qs.get("u")||"0";
/* --- preconnect к серверу --- */
try{var pc=document.createElement("link");pc.rel="preconnect";pc.href="https://api.telebotcreator.com";pc.crossOrigin="anonymous";document.head.appendChild(pc)}catch(e){}
/* --- шрифт заголовков: Philosopher (кириллица), запасной Georgia --- */
try{if(!document.getElementById("lt-font")){
var fc=document.createElement("link");fc.rel="preconnect";fc.href="https://fonts.gstatic.com";fc.crossOrigin="anonymous";document.head.appendChild(fc);
var fl=document.createElement("link");fl.id="lt-font";fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&display=swap";document.head.appendChild(fl);
var fs=document.createElement("style");fs.textContent="h1,h2,h3{font-family:Philosopher,Georgia,serif}";document.head.appendChild(fs)}}catch(e){}
/* --- стили --- */
var css=
".lt-pend{pointer-events:none!important;position:relative}"+
".lt-pend{opacity:.7}"+
".lt-sp{position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:2px solid #ffffff44;border-top-color:#ffd98a;animation:ltsp .7s linear infinite;pointer-events:none;box-shadow:0 0 8px #ffd98a55}"+
"@keyframes ltsp{to{transform:rotate(360deg)}}"+
"#ltBar{position:fixed;left:0;top:0;height:2px;width:0;z-index:100000;background:linear-gradient(90deg,transparent,#ffd98a,#a98fd0);box-shadow:0 0 8px #ffd98a;opacity:0;pointer-events:none;transition:width .4s ease-out,opacity .3s}"+
"a,button,[role=button],.btn,label,select,summary,input[type=checkbox],input[type=radio]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}"+
"html{-webkit-text-size-adjust:100%;text-size-adjust:100%}"+
"@media(prefers-reduced-motion:reduce){.lt-sp{animation-duration:2s}}";
try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st)}catch(e){}
/* --- верхняя полоска загрузки --- */
var inflight=0,barT=null,bar=null;
function barOn(){
 if(!bar){bar=document.createElement("div");bar.id="ltBar";document.body&&document.body.appendChild(bar)}
 if(!bar)return;bar.style.opacity="1";bar.style.width="35%";
 setTimeout(function(){if(inflight>0&&bar)bar.style.width="72%"},400);
}
function barOff(){if(!bar)return;bar.style.width="100%";setTimeout(function(){if(inflight===0&&bar){bar.style.opacity="0";setTimeout(function(){if(inflight===0)bar.style.width="0"},300)}},200)}
/* --- запоминаем, по какой кнопке нажали --- */
var last=null,lastT=0;
document.addEventListener("click",function(e){
 var t=e.target;if(!t||!t.closest)return;
 if(t.closest(".lt-pend")){e.stopImmediatePropagation();e.preventDefault();return}
 var b=t.closest("button,.btn,[role=button],.plc,.pcard,.tab,a.back");
 if(b&&!b.disabled){last=b;lastT=Date.now()}
},true);
function pend(b){
 if(!b||b.classList.contains("lt-pend"))return function(){};
 b.classList.add("lt-pend");var sp=document.createElement("span");sp.className="lt-sp";b.appendChild(sp);
 var done=false;
 return function(){if(done)return;done=true;try{b.classList.remove("lt-pend");sp.remove()}catch(e){}};
}
/* --- прогрев: после простоя команда api_action на сервере поднимается долго (первый ход мог висеть ~18 с).
   Лёгкий запрос при входе и раз в 3 минуты, пока страница открыта. --- */
(function(){
 var a=qs.get("a_enc")||qs.get("a")||"";if(!a||!window.fetch)return;
 var url="https://api.telebotcreator.com/new-webhook?data="+encodeURIComponent(a),busy=false,lastW=0;
 function ping(){
  if(busy||document.hidden)return;busy=true;lastW=Date.now();
  var ctl=window.AbortController?new AbortController():null,tm=setTimeout(function(){try{ctl&&ctl.abort()}catch(e){}},30000);
  window.fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"ping"}),cache:"no-store",signal:ctl?ctl.signal:undefined})
   .then(function(r){return r.text()}).catch(function(){}).then(function(){busy=false;clearTimeout(tm)});
 }
 setTimeout(ping,1500);setInterval(ping,180000);
 document.addEventListener("visibilitychange",function(){if(!document.hidden&&Date.now()-lastW>150000)ping()});
})();
/* --- мини-аватары путей (анимированные svg; для длинных списков и чатов — статичные копии) --- */
(function(){
 var BASE="";try{var u=document.currentScript.src;BASE=u.slice(0,u.indexOf("shared/fast.js"))}catch(e){}
 var MAP={seer:"seer",sailor:"sailor",hunter:"hunter","Провидец":"seer","Матрос":"sailor","Охотник":"hunter"};
 function src(pk,g,st){return BASE+"avatars/"+(g==="f"||g==="female"?"f":"m")+"_"+pk+".webp"}
 try{var cs=document.createElement("style");cs.textContent=".avMini{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}.avWrap:has(.avMini),.chAv:has(.avMini),.pav:has(.avMini),.row .av:has(.avMini),.fr .av:has(.avMini),.ch:has(.avMini){overflow:hidden}";document.head.appendChild(cs)}catch(e){}
 window.LOTM_AV={
  key:function(p){return MAP[p]||null},
  html:function(p,fb,g,st){var k=MAP[p];return k?'<img class="avMini" alt="" decoding="async" src="'+src(k,g,st)+'">':(fb||"👤")},
  fill:function(n,p,fb,g,st){if(!n)return;var k=MAP[p];if(!k){n.textContent=fb||"👤";return}n.textContent="";var i=new Image();i.className="avMini";i.alt="";i.decoding="async";i.src=src(k,g,st);i.onerror=function(){i.remove();n.textContent=fb||"👤"};n.appendChild(i)}
 };
})();
/* --- ссылка «назад» из места города/похода ведёт на нужную вкладку главной (а не всегда в Зал) --- */
(function(){
 var BASE="";try{var u=document.currentScript.src;BASE=u.slice(0,u.indexOf("shared/fast.js"))}catch(e){}if(!BASE)return;
 var CITY="top arena market bureau clan fortune home pets farm lab pier clinic boulevard bank",TRAVEL="forest lake cemetery ruins";
 function tabFor(){var seg=location.href.slice(BASE.length).split("/")[0];return(" "+CITY+" ").indexOf(" "+seg+" ")>=0?"city":((" "+TRAVEL+" ").indexOf(" "+seg+" ")>=0?"travel":"")}
 document.addEventListener("click",function(e){
  var a=e.target&&e.target.closest?e.target.closest("a[href]"):null;if(!a)return;
  try{var x=new URL(a.href,location.href),bp=new URL(BASE).pathname;
   if(x.origin===location.origin&&(x.pathname===bp||x.pathname===bp+"index.html")){var t=tabFor();if(t)x.searchParams.set("tab",t);else x.searchParams.delete("tab");a.href=x.toString()}}catch(err){}
 },true);
})();
/* --- обёртка fetch: только запросы к серверу игры ---
   Таймаут 30 с (после простоя сервер может просыпаться ~18 с). Запросы чтения («состояние», «список» и т.п.)
   при обрыве или ответе 5xx повторяются один раз. Действия (покупки, бои, награды) не повторяются сами:
   иначе можно списать или выдать дважды. */
var of=window.fetch;
if(of){
 var TMO=30000,READ=/(^|_)(state|view|list|poll|get)$|^profile|^ping$/;
 var mkErr=function(read,e){
  var to=e&&e.name==="AbortError";
  var m=new Error(to?(read?"Сервер долго отвечает. Проверь связь и попробуй ещё раз.":"Сервер долго отвечает. Действие могло выполниться: обнови страницу и проверь."):"Нет связи с сервером. Проверь интернет и попробуй ещё раз.");
  m.name=to?"TimeoutError":"NetworkError";m.cause=e;return m;
 };
 var send=function(self,u,o){
  if(!window.AbortController||(o&&o.signal))return of.call(self,u,o);
  var ctl=new AbortController(),tm=setTimeout(function(){try{ctl.abort()}catch(e){}},TMO),o2={};
  for(var k in (o||{}))o2[k]=o[k];o2.signal=ctl.signal;
  return of.call(self,u,o2).then(function(r){clearTimeout(tm);return r},function(e){clearTimeout(tm);throw e});
 };
 /* --- статистика ответов сервера (чтобы видеть реальные задержки) и плашка «нет связи» --- */
 var PF={n:0,sum:0,slow:0,fail:0,max:0,by:{},url:"",at:0};
 var pfFlush=function(force){
  if(!PF.url||PF.n<(force?3:20)||Date.now()-PF.at<60000)return;
  var b={action:"perf",n:PF.n,sum:PF.sum,slow:PF.slow,fail:PF.fail,max:PF.max,by:PF.by},url=PF.url;
  PF={n:0,sum:0,slow:0,fail:0,max:0,by:{},url:url,at:Date.now()};
  try{of.call(window,url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b),cache:"no-store",keepalive:true}).catch(function(){})}catch(e){}
 };
 var pfAdd=function(act,ms,failed,u){
  if(!act||act==="perf"||act==="ping")return;
  if(typeof u==="string")PF.url=u;
  PF.n++;PF.sum+=ms;if(ms>5000)PF.slow++;if(failed)PF.fail++;if(ms>PF.max)PF.max=ms;
  var e=PF.by[act]||(PF.by[act]={n:0,sum:0,max:0});e.n++;e.sum+=ms;if(ms>e.max)e.max=ms;
  pfFlush(false);
 };
 addEventListener("pagehide",function(){pfFlush(true)});
 var netF=0,netEl=null;
 var netBad=function(){
  netF++;if(netF<2||netEl||!document.body)return;
  netEl=document.createElement("div");netEl.id="ltNet";
  netEl.style.cssText="position:fixed;left:10px;right:10px;top:calc(8px + env(safe-area-inset-top));z-index:100001;max-width:440px;margin:0 auto;display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:14px;border:1px solid #8a4a54;background:#2a1018f2;color:#f5dede;font:13px/1.3 system-ui,sans-serif;box-shadow:0 8px 24px #000a";
  netEl.innerHTML='<span>Связь с сервером нестабильна</span><button type="button" style="border:1px solid #a98a4a;background:#5a3f16;color:#ffe9b0;border-radius:10px;padding:7px 12px;font:700 13px system-ui;cursor:pointer">Обновить</button>';
  netEl.querySelector("button").onclick=function(){location.reload()};
  document.body.appendChild(netEl);
 };
 var netOk=function(){netF=0;if(netEl){try{netEl.remove()}catch(e){}netEl=null}};
 var go=function(self,args,read){
  var u=args[0],o=args[1],act="";try{act=String(JSON.parse((o&&o.body)||"{}").action||"")}catch(e){}
  var t0=Date.now(),run=function(){return send(self,u,o)};
  var ok=function(r){var f=!!(r&&r.status>=500);pfAdd(act,Date.now()-t0,f,u);if(f)netBad();else netOk();return r};
  var bad=function(e){pfAdd(act,Date.now()-t0,true,u);netBad();throw e};
  if(!read)return run().then(ok,function(e){bad(mkErr(false,e))});
  var chk=function(r){if(r&&r.status>=500)throw {name:"HttpError"};return r};
  var wait=function(ms){return function(){return new Promise(function(res){setTimeout(res,ms)}).then(run).then(chk)}};
  return run().then(chk).catch(wait(900)).catch(wait(1800)).then(ok,function(e){bad(mkErr(true,e))});
 };
 window.fetch=function(u,o){
  var url=typeof u==="string"?u:(u&&u.url)||"";
  if(url.indexOf("new-webhook")<0)return of.apply(this,arguments);
  var self=this,action="";try{action=String(JSON.parse((o&&o.body)||"{}").action||"")}catch(e){}
  var read=READ.test(action);
  var quiet=!action||/chat_|_state$|^profile|poll|_view$|^arena_fight$|^ping$/.test(action);
  var release=function(){};
  if(last&&Date.now()-lastT<1200&&!quiet){release=pend(last);last=null}
  if(quiet)return go(self,arguments,read);
  inflight++;var t0=Date.now();
  var timer=setTimeout(barOn,250);
  var fdone=false;
  var fin=function(){if(fdone)return;fdone=true;inflight=Math.max(0,inflight-1);clearTimeout(timer);clearTimeout(safe);release();if(inflight===0)barOff()};
  var safe=setTimeout(fin,read?65000:TMO+3000);
  var p=go(self,arguments,read);
  p.then(fin,fin);
  return p;
 };
}
/* --- кэш состояний --- */
function key(k){return "lotmc:"+UID+":"+k}
F.get=function(k,maxAge){
 try{var r=localStorage.getItem(key(k));if(!r)return null;var o=JSON.parse(r);if(maxAge&&Date.now()-o.t>maxAge)return null;return o.d}catch(e){return null}
};
F.set=function(k,d){try{localStorage.setItem(key(k),JSON.stringify({t:Date.now(),d:d}))}catch(e){}};
/* swr: мгновенно показать кэш, затем свежие данные. cb(data,isCached) */
F.swr=function(k,fetcher,cb,maxAge){
 var c=F.get(k,maxAge||600000),shown=false;
 if(c){try{cb(c,true);shown=true}catch(e){}}
 return Promise.resolve(fetcher()).then(function(d){
  if(d&&d.ok!==false){F.set(k,d)}
  return d;
 });
};
/* --- предзагрузка страниц --- */
var pre={};
F.prefetch=function(url){
 if(!url||pre[url])return;pre[url]=1;
 try{var l=document.createElement("link");l.rel="prefetch";l.href=url;l.as="document";document.head.appendChild(l)}catch(e){}
};
F.idle=function(fn){(window.requestIdleCallback||function(f){setTimeout(f,1200)})(fn)};
})();
