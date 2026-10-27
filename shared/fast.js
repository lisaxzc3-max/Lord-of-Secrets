/* LOTM fast: мгновенный отклик кнопок, кэш состояний (stale-while-revalidate), предзагрузка страниц. */
(function(){
"use strict";
if(window.LOTM_FAST)return;
var F=window.LOTM_FAST={};
var qs=new URLSearchParams(location.search),UID=qs.get("u")||"0";
/* --- preconnect к серверу --- */
try{var pc=document.createElement("link");pc.rel="preconnect";pc.href="https://api.telebotcreator.com";pc.crossOrigin="anonymous";document.head.appendChild(pc)}catch(e){}
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
/* --- обёртка fetch: только запросы к серверу игры --- */
var of=window.fetch;
if(of){
 window.fetch=function(u,o){
  var url=typeof u==="string"?u:(u&&u.url)||"";
  if(url.indexOf("new-webhook")<0)return of.apply(this,arguments);
  var action="";try{action=String(JSON.parse((o&&o.body)||"{}").action||"")}catch(e){}
  var quiet=!action||/chat_|_state$|^profile|poll|_view$|^arena_fight$/.test(action);
  var release=function(){};
  if(last&&Date.now()-lastT<1200&&!quiet){release=pend(last);last=null}
  if(quiet)return of.apply(this,arguments);
  inflight++;var t0=Date.now();
  var timer=setTimeout(barOn,250);
  var fdone=false;
  var fin=function(){if(fdone)return;fdone=true;inflight=Math.max(0,inflight-1);clearTimeout(timer);clearTimeout(safe);release();if(inflight===0)barOff()};
  var safe=setTimeout(fin,25000);
  var p=of.apply(this,arguments);
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
