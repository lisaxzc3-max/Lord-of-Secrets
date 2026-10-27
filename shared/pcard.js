/* Повелитель Тайн — краткая карточка игрока (по тапу на ник/аватарку). Без статов и артефактов. */
(function(){
"use strict";
if(window.PCard)return;
var qs=new URLSearchParams(location.search);
var aEnc=qs.get("a_enc")||qs.get("a")||"";
var URL_=aEnc?"https://api.telebotcreator.com/new-webhook?data="+encodeURIComponent(aEnc):"";
var base=(function(){try{var s=document.querySelector('script[src*="pcard.js"]');return s?s.src.replace(/shared\/pcard\.js(\?.*)?$/,""):""}catch(e){return ""}})();
var PATH={seer:"🔮",sailor:"⚓",hunter:"🏹"};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function unwrap(v){for(var i=0;i<3;i++){if(v&&v.result&&typeof v.result==="object")v=v.result;else break}return v}
function sfx(n){try{window.snd&&window.snd(n)}catch(e){}}
var css=document.createElement("style");
css.textContent=
"#pcBack{position:fixed;inset:0;z-index:9800;display:flex;align-items:flex-end;justify-content:center;background:#05030acc;backdrop-filter:blur(3px);opacity:0;transition:opacity .25s}"+
"#pcBack.on{opacity:1}"+
"#pcBox{position:relative;width:100%;max-width:420px;margin:0 8px calc(10px + env(safe-area-inset-bottom));padding:22px 18px 16px;border-radius:20px;border:1px solid #6a58a0;background:linear-gradient(180deg,#221836,#0e0918);color:#e8dcc4;font-family:Georgia,serif;text-align:center;overflow:hidden;transform:translateY(24px);transition:transform .3s cubic-bezier(.2,.9,.3,1)}"+
"#pcBack.on #pcBox{transform:none}"+
"#pcBox::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% -10%,#8a5cff30,transparent 62%);pointer-events:none}"+
"#pcBox>*{position:relative}"+
".pcAv{width:92px;height:92px;margin:0 auto 10px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#3d2f63,#150e26);border:2px solid #6a58a0;display:flex;align-items:center;justify-content:center;font-size:42px;overflow:hidden;box-shadow:0 0 22px #8a5cff40}"+
".pcAv img{width:100%;height:100%;object-fit:cover;display:block;border-radius:50%}"+
".pcNm{font:700 20px Georgia,serif;color:#f1e3bd;letter-spacing:.02em;word-break:break-word}"+
".pcLv{margin-top:3px;font:700 12px system-ui,sans-serif;letter-spacing:.14em;color:#b99cff}"+
".pcRows{margin:14px 0 4px;display:grid;gap:7px;text-align:left}"+
".pcR{display:flex;align-items:center;gap:10px;padding:8px 11px;border-radius:12px;background:#0b0714aa;border:1px solid #2f2745}"+
".pcR i{font-style:normal;font-size:17px;flex:0 0 22px;text-align:center}"+
".pcR span{flex:1;min-width:0}.pcR b{display:block;font:700 13px Georgia,serif;color:#eadfc6}.pcR small{display:block;font:600 10px system-ui,sans-serif;letter-spacing:.08em;color:#8f84a6;text-transform:uppercase;margin-bottom:1px}"+
".pcBtns{display:flex;gap:8px;margin-top:14px}"+
".pcBtn{flex:1;border:1px solid #3a3057;background:#120c1e;color:#d6b779;border-radius:12px;padding:11px 8px;font:700 13px system-ui,sans-serif;cursor:pointer}"+
".pcBtn.main{border-color:#8a6cd0;background:linear-gradient(180deg,#3a2a66,#21163d);color:#f1e3bd}"+
".pcBtn:active{transform:scale(.97)}"+
".pcLoad{padding:34px 0;color:#9488ab;font:600 13px system-ui,sans-serif}"+
"@media(prefers-reduced-motion:reduce){#pcBack,#pcBox{transition:none}}";
document.head.appendChild(css);

function avatar(d){
 var wrap=document.createElement("div");wrap.className="pcAv"+(window.VIP&&d.v?VIP.f(d.v):"");
 var ico=PATH[d.path_key]||"👤";
 if(PATH[d.path_key]){
  var img=new Image();img.alt="";
  img.src=base+"avatars/"+(d.gender==="female"?"f":"m")+"_"+d.path_key+(d.sequence&&d.sequence<=8?"8":"")+".svg";
  img.onerror=function(){img.remove();wrap.textContent=ico};
  wrap.appendChild(img);
 }else wrap.textContent=ico;
 return wrap;
}
function row(i,k,v){return '<div class="pcR"><i>'+i+'</i><span><small>'+esc(k)+'</small><b>'+esc(v)+'</b></span></div>'}

function close(){
 var b=document.getElementById("pcBack");if(!b)return;
 b.classList.remove("on");sfx("back");setTimeout(function(){b.remove()},260);
}
function open(uid,nick,opts){
 opts=opts||{};
 var old=document.getElementById("pcBack");if(old)old.remove();
 var back=document.createElement("div");back.id="pcBack";
 var box=document.createElement("div");box.id="pcBox";
 box.innerHTML='<div class="pcLoad">'+(nick?esc(nick)+" · ":"")+'Открываю досье…</div>';
 back.appendChild(box);document.body.appendChild(back);
 back.addEventListener("click",function(e){if(e.target===back)close()});
 requestAnimationFrame(function(){back.classList.add("on")});sfx("open");
 if(!URL_){box.innerHTML='<div class="pcLoad">Нет связи с игрой.</div><div class="pcBtns"><button class="pcBtn" type="button" id="pcX">Закрыть</button></div>';box.querySelector("#pcX").onclick=close;return}
 fetch(URL_,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"player_card",uid:String(uid)}),cache:"no-store"})
 .then(function(r){if(!r.ok)throw new Error("http");return r.json()}).then(function(d){
  d=unwrap(d);if(!d||d.ok===false)throw new Error((d&&d.text)||"fail");
  box.replaceChildren();
  box.appendChild(avatar(d));
  var nm=document.createElement("div");nm.className="pcNm";
  if(window.VIP&&d.v)nm.innerHTML=VIP.n(d.nick,d.v);else nm.textContent=d.nick;
  box.appendChild(nm);
  var lv=document.createElement("div");lv.className="pcLv";lv.textContent="УРОВЕНЬ "+d.level+(d.me?" · ЭТО ТЫ":"");box.appendChild(lv);
  var h="";
  if(d.path)h+=row(PATH[d.path_key]||"✦","Путь",d.path+(d.seq_name?" · "+d.seq_name+(d.sequence&&d.sequence<=9?" (посл. "+d.sequence+")":""):""));
  if(d.clan)h+=row("⚜","Клан","["+d.clan.tag+"] "+d.clan.name+" · "+d.clan.rank_name+(d.clan.post_name?" · "+d.clan.post_name:""));
  else h+=row("⚜","Клан","Не состоит в клане");
  if(d.arena)h+=row("⚔","Арена",d.arena.league+" · "+d.arena.rating);
  if(d.rank)h+=row("🏆","Рейтинг","№ "+d.rank+" по уровню");
  var rows=document.createElement("div");rows.className="pcRows";rows.innerHTML=h;box.appendChild(rows);
  var bt=document.createElement("div");bt.className="pcBtns";
  var dm=window.__lotmDm;
  if(!d.me&&dm&&opts.dm!==false){
   var w=document.createElement("button");w.type="button";w.className="pcBtn main";w.textContent="✉ Написать";
   w.onclick=function(){close();setTimeout(function(){dm(String(d.uid),d.nick)},120)};bt.appendChild(w);
  }
  var c=document.createElement("button");c.type="button";c.className="pcBtn";c.textContent="Закрыть";c.onclick=close;bt.appendChild(c);
  box.appendChild(bt);
 }).catch(function(e){
  box.innerHTML='<div class="pcLoad">'+esc(e&&e.message&&e.message!=="http"&&e.message!=="fail"?e.message:"Не удалось открыть досье.")+'</div><div class="pcBtns"><button class="pcBtn" type="button" id="pcX">Закрыть</button></div>';
  box.querySelector("#pcX").onclick=close;
 });
}
window.PCard={open:open,close:close};
})();
