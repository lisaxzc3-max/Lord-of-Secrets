/* Повелитель Тайн — автобой на локациях (для посвящённых). Кнопка под «Исследовать». */
(function(){
"use strict";
var LOCS={forest:"Лес",lake:"Озеро",cemetery:"Кладбище"};
var loc=(location.pathname.match(/\/(forest|lake|cemetery)\//)||[])[1];
if(!loc)return;
var qs=new URLSearchParams(location.search);
var aEnc=qs.get("a_enc")||qs.get("a")||"";
var URL_=aEnc?"https://api.telebotcreator.com/new-webhook?data="+encodeURIComponent(aEnc):"";
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
function sfx(n){try{window.snd&&window.snd(n)}catch(e){}}
function unwrap(v){for(var i=0;i<3;i++){if(v&&v.result&&typeof v.result==="object")v=v.result;else break}return v}
function api(p){
 if(!URL_)return Promise.reject(new Error("Нужен вход через бота."));
 return fetch(URL_,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p),cache:"no-store"})
 .then(function(r){if(!r.ok)throw new Error("Ошибка сервера");return r.json()}).then(function(d){d=unwrap(d);if(!d||typeof d!=="object")throw new Error("Некорректный ответ");return d});
}
function mm(s){s=Math.max(0,s|0);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.innerHTML=h;return e}

var css=document.createElement("style");
css.textContent=
".abBtn{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:9px;width:100%;margin-top:10px;padding:13px 12px;border-radius:12px;border:1px solid #8a6a3a;background:linear-gradient(135deg,#3a2a14,#2a1a2e);color:#f3dc9c;font:inherit;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 0 18px #c79a4a22;transition:transform .15s,filter .2s}"+
".abBtn:active{transform:scale(.98)}"+
".abBtn svg{width:18px;height:18px;flex:none}"+
".abBtn small{font-weight:600;font-size:11px;opacity:.8}"+
".abBtn.rdy:after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,#ffe9a833 50%,transparent 65%);transform:translateX(-120%);animation:abSw 3.8s ease-in-out infinite}"+
"@keyframes abSw{0%,55%{transform:translateX(-120%)}100%{transform:translateX(120%)}}"+
".abBtn.cd,.abBtn.lk{filter:saturate(.5) brightness(.85);color:#cdbf9a;border-color:#5a4a34}"+
".abOv{position:fixed;inset:0;z-index:9800;display:flex;align-items:center;justify-content:center;padding:18px;background:#05030af0;opacity:0;transition:opacity .35s}"+
".abOv.on{opacity:1}"+
".abC{width:100%;max-width:380px;text-align:center;border:1px solid #6a58a0;border-radius:22px;padding:22px 18px 18px;background:radial-gradient(ellipse at 50% -10%,#5a2a4a55,transparent 60%),linear-gradient(170deg,#241a38,#0e0918);box-shadow:0 0 40px #8a5cff33;transform:translateY(14px) scale(.97);transition:transform .45s cubic-bezier(.2,.9,.3,1)}"+
".abOv.on .abC{transform:none}"+
".abE{font-size:9px;letter-spacing:3px;color:#e2c27a;text-transform:uppercase}"+
".abT{font:700 20px Georgia,serif;color:#fff3cf;margin:4px 0 12px}"+
".abRing{position:relative;width:118px;height:118px;margin:0 auto 12px}"+
".abRing svg{width:100%;height:100%;transform:rotate(-90deg)}"+
".abRing .bg{fill:none;stroke:#2a2040;stroke-width:6}"+
".abRing .fg{fill:none;stroke:url(#abG);stroke-width:6;stroke-linecap:round;stroke-dasharray:326.7;stroke-dashoffset:326.7;transition:stroke-dashoffset .12s linear}"+
".abRing b{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 30px Georgia,serif;color:#fff3cf}"+
".abRing b small{font:600 10px Inter,system-ui;letter-spacing:1px;color:#a99dba}"+
".abKl{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:0 0 12px;min-height:22px}"+
".abKl span{font-size:11px;border:1px solid #3a3057;background:#120c1e;border-radius:99px;padding:3px 9px;color:#cfc4e0;animation:abIn .4s both}"+
"@keyframes abIn{from{opacity:0;transform:translateY(6px) scale(.9)}}"+
".abRs{display:grid;gap:7px;margin-bottom:14px}"+
".abR{display:flex;align-items:center;justify-content:space-between;border:1px solid #3a3057;border-radius:12px;padding:10px 13px;background:#140e22;opacity:0;transform:translateY(8px);transition:.45s}"+
".abR.on{opacity:1;transform:none}"+
".abR i{font-style:normal;font-size:12px;color:#a99dba}"+
".abR b{font:700 18px Georgia,serif;color:#fff3cf}"+
".abR b em{font:600 11px Inter,system-ui;font-style:normal;color:#9dfad0;margin-left:6px}"+
".abR.lv{border-color:#e2c27a99;box-shadow:0 0 18px #e2c27a44}"+
".abOk{width:100%;padding:13px;border-radius:14px;font:700 15px Georgia,serif;color:#2a1a08;background:linear-gradient(135deg,#f3dc9c,#c79a4a 55%,#8a6428);border:0;cursor:pointer;opacity:0;transition:opacity .4s}"+
".abOk.on{opacity:1}"+
".abTx{font-size:13px;color:#cfc4e0;margin:2px 0 14px;line-height:1.45}"+
".abRow{display:flex;gap:10px}.abRow button{flex:1;padding:12px;border-radius:13px;font:700 14px Georgia,serif;border:1px solid #4a3d6a;background:#17122399;color:#eee6d6;cursor:pointer}"+
".abRow .go{border:0;color:#2a1a08;background:linear-gradient(135deg,#f3dc9c,#c79a4a)}"+
".abFx{position:fixed;pointer-events:none;z-index:9900;font-style:normal;animation:abFly 1.4s ease-out forwards}"+
"@keyframes abFly{to{transform:translate(var(--x),var(--y)) rotate(var(--r));opacity:0}}";
document.head.appendChild(css);

var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3L5 13h6l-1 8 8-10h-6z"/></svg>';
var S=null,btn=null,tick=null,busy=false;

function paint(){
 if(!btn||!S)return;
 btn.className="abBtn";
 if(!S.tier){btn.classList.add("lk");btn.innerHTML=ICON+"<span>Автобой <small>· для посвящённых</small></span>";return}
 var T=S.tiers[S.tier-1];
 var need=(S.locmin&&S.locmin[loc])||1;
 if((S.level||1)<need){btn.classList.add("lk");btn.innerHTML=ICON+"<span>Автобой <small>· с "+need+" уровня</small></span>";return}
 if(S.auto_left>0){btn.classList.add("cd");btn.innerHTML=ICON+"<span>Автобой <small>· через "+mm(S.auto_left)+"</small></span>";return}
 btn.classList.add("rdy");btn.innerHTML=ICON+"<span>Автобой <small>· "+T.auto+" боёв с бонусом</small></span>";
}
function startTick(){
 clearInterval(tick);
 tick=setInterval(function(){
  if(!S||!S.auto_left)return;S.auto_left--;
  if(S.auto_left<=0){S.auto_left=0}
  paint();
 },1000);
}
function load(){
 api({action:"vip_state"}).then(function(d){S=d;paint();startTick()}).catch(function(){});
}

function fx(x,y,list,n,dist){
 if(reduce)return;
 for(var i=0;i<n;i++){var d=el("i","abFx",list[i%list.length]);d.style.left=x+"px";d.style.top=y+"px";d.style.fontSize=(12+Math.random()*12)+"px";
  var a=Math.random()*6.283,r=dist*(.4+Math.random()*.6);d.style.setProperty("--x",Math.cos(a)*r+"px");d.style.setProperty("--y",Math.sin(a)*r+"px");d.style.setProperty("--r",(Math.random()*400-200)+"deg");
  document.body.appendChild(d);setTimeout((function(n){return function(){n.remove()}})(d),1500)}
}
function overlay(inner){
 var o=el("div","abOv");var c=el("div","abC",inner);o.appendChild(c);document.body.appendChild(o);
 requestAnimationFrame(function(){requestAnimationFrame(function(){o.classList.add("on")})});
 return o;
}
function close(o){o.classList.remove("on");setTimeout(function(){o.remove()},380)}

function askVip(){
 var o=overlay('<div class="abE">Тайный круг</div><div class="abT">Автобой для посвящённых</div><div class="abTx">Один тап — и ты получаешь опыт и фунты как за серию боёв на локации, с бонусом круга. Открой путь посвящённого?</div><div class="abRow"><button type="button" id="abNo">Позже</button><button type="button" class="go" id="abYes">В Тайный круг</button></div>');
 o.querySelector("#abNo").onclick=function(){sfx("back");close(o)};
 o.querySelector("#abYes").onclick=function(){sfx("tap");location.href="../vip/index.html"+location.search};
}

function run(){
 if(busy)return;busy=true;sfx("open");
 var o=overlay('<div class="abE">Автобой</div><div class="abT">'+LOCS[loc]+'</div>'+
  '<div class="abRing"><svg viewBox="0 0 120 120"><defs><linearGradient id="abG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#f3a8dc"/></linearGradient></defs><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" id="abFg" cx="60" cy="60" r="52"/></svg><b><span id="abN">0</span><small>БОЁВ</small></b></div>'+
  '<div class="abKl" id="abKl"></div><div class="abRs" id="abRs"></div><button type="button" class="abOk" id="abOk">Забрать славу</button>');
 var fg=o.querySelector("#abFg"),nE=o.querySelector("#abN"),kl=o.querySelector("#abKl"),rs=o.querySelector("#abRs"),ok=o.querySelector("#abOk");
 var req=api({action:"vip_auto",loc:loc}).catch(function(e){return{ok:false,text:e.message||"Нет связи."}});
 var t0=Date.now();
 req.then(function(d){
  var wait=Math.max(0,500-(Date.now()-t0));
  setTimeout(function(){
   if(!d||!d.ok){
    close(o);busy=false;
    if(d&&d.error==="cd"){S.auto_left=d.left;paint()}
    var tip=document.getElementById("msg");if(tip)tip.textContent=(d&&d.text)||"Не удалось.";
    return;
   }
   var N=d.fights,i=0,kn=Object.keys(d.kills||{});
   var step=reduce?1:Math.max(80,Math.min(180,1500/N));
   var iv=setInterval(function(){
    i++;nE.textContent=i;fg.style.strokeDashoffset=String(326.7*(1-i/N));sfx(i%4===0?"crit":"hit");
    var r=o.querySelector(".abRing").getBoundingClientRect();fx(r.left+r.width/2,r.top+r.height/2,["✦","·","⚔"],2,70);
    if(i>=N){
     clearInterval(iv);
     kn.forEach(function(k,j){var s=el("span");s.textContent=k+" ×"+d.kills[k];s.style.animationDelay=j*70+"ms";kl.appendChild(s)});
     setTimeout(function(){
      var rows=[["Опыт","+"+d.xp,d.bx>0?"+"+d.bx+" от круга":""],["Фунты","+"+d.gold,d.bg>0?"+"+d.bg+" от круга":""]];
      if(d.lvup)rows.unshift(["Новый уровень","Ур. "+d.level,""]);
      rows.forEach(function(r,j){var row=el("div","abR"+(r[0]==="Новый уровень"?" lv":""),"<i>"+r[0]+"</i><b>"+r[1]+(r[2]?"<em>"+r[2]+"</em>":"")+"</b>");rs.appendChild(row);setTimeout(function(){row.classList.add("on");sfx(r[0]==="Фунты"?"coin":(d.lvup&&j===0?"level":"good"))},120+j*260)});
      var c=o.querySelector(".abC").getBoundingClientRect();fx(c.left+c.width/2,c.top+80,["✦","💷","✧"],16,200);
      setTimeout(function(){ok.classList.add("on")},400+rows.length*260);
     },420);
    }
   },step);
   S=d;paint();
   ok.onclick=function(){sfx("tap");close(o);busy=false;if(d.lvup)setTimeout(function(){location.reload()},350)};
  },wait);
 });
}

function mount(){
 var ex=document.getElementById("exploreBtn");if(!ex||document.getElementById("abBtn"))return;
 btn=el("button","abBtn");btn.id="abBtn";btn.type="button";btn.innerHTML=ICON+"<span>Автобой</span>";
 ex.parentNode.insertBefore(btn,ex.nextSibling);
 btn.addEventListener("click",function(){
  if(busy)return;
  if(!S){sfx("deny");return}
  if(!S.tier){sfx("tap");askVip();return}
  var nd=(S.locmin&&S.locmin[loc])||1;
  if((S.level||1)<nd){sfx("deny");var m0=document.getElementById("msg");if(m0)m0.textContent="Автобой здесь доступен с "+nd+" уровня.";return}
  if(S.auto_left>0){sfx("deny");var m=document.getElementById("msg");if(m)m.textContent="Автобой восстановится через "+mm(S.auto_left)+".";return}
  run();
 });
 load();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();
