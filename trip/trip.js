"use strict";
const tg=window.Telegram&&window.Telegram.WebApp;
try{tg&&tg.ready();tg&&tg.expand()}catch(_){}
const $=id=>document.getElementById(id);
const qs=new URLSearchParams(location.search);
const uid=String(qs.get("u")||(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||"0");
const enc=(k,a)=>{const v=qs.get(k+"_enc")||qs.get(k)||"";return v?"https://api.telebotcreator.com/new-webhook?data="+encodeURIComponent(v):""};
const ACTION_URL=enc("a"),PROFILE_URL=enc("p");
const sfx=n=>{try{window.snd&&window.snd(n)}catch(_){}};
const buzz=()=>{try{tg&&tg.HapticFeedback&&tg.HapticFeedback.selectionChanged()}catch(_){}};
{const bp=new URLSearchParams(location.search);bp.delete("tab");bp.delete("auto");const q=bp.toString();$("back").href="../index.html"+(q?"?"+q:"")}
const SW=1086,SH=1448,IMG="img/";
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ---------- данные ---------- */
/* d: к какой локации относится точка; p: координаты на сцене (over — общий вид) */
const LOC={
 lake:{n:"Озёра · Топи",e:"🐸",img:"lake",min:1,lv:"1–6",sk:1,boss:"Змей, Водяной",url:"../lake/index.html",lab:[170,900],
  ds:"Жабы, пиявки, щуки, кикиморы и Змей, что просыпается в глубине.",fog:null,
  reg:[[0,560],[470,640],[470,1140],[0,1140]]},
 forest:{n:"Лес · Чаща",e:"🌲",img:"forest",min:5,lv:"5–10",sk:2,boss:"Кицунэ",url:"../forest/index.html",lab:[840,820],
  ds:"Споры, паутина и шёпот. Где-то здесь бродит Кицунэ.",fog:[840,800],
  reg:[[580,500],[1086,430],[1086,1140],[600,1140]]},
 cemetery:{n:"Кладбище Тингена",e:"🪦",img:"cemetery",min:10,lv:"10–15",sk:3,boss:"Некромант",url:"../cemetery/index.html",lab:[300,330],
  ds:"Туман, склепы и неупокоенные. Здесь ночует Некромант.",fog:[290,320],
  reg:[[0,60],[520,150],[560,540],[0,540]]},
 ruins:{n:"Руины Фаркарда",e:"🏛",img:"ruins",min:15,lv:"15–20",sk:4,boss:"Верховный жрец",url:"../ruins/index.html",lab:[825,345],
  ds:"Фанатики, горгульи и пепел. Под алтарём ждёт Верховный жрец.",fog:[840,330],
  reg:[[620,0],[1086,0],[1086,470],[610,540]]}
};
/* точки: k -> {n,e,d,m,ds,url,p:{сцена:[x,y]}} ; main=true: точка входа локации */
const PL={
 lake:{n:"Озёра · Топи",e:"🐸",d:"lake",main:1,p:{over:[170,900],lake:[560,985]}},
 forest:{n:"Лес · Чаща",e:"🌲",d:"forest",main:1,p:{over:[850,810],forest:[560,1010]}},
 cemetery:{n:"Кладбище Тингена",e:"🪦",d:"cemetery",main:1,p:{over:[300,330],cemetery:[520,800]}},
 ruins:{n:"Руины Фаркарда",e:"🏛",d:"ruins",main:1,p:{over:[825,345],ruins:[560,1100]}},
 boss:{n:"Логово Кальветуа",e:"💀",boss:1,m:"Босс недели",ds:"Тёмная башня на краю мира. Раз в неделю здесь открывается бой с боссом недели, а в рейтинге ждут лучшие.",url:"../boss/index.html",p:{over:[543,150]}},
 lair_lake:{n:"Омут Змея",e:"💀",d:"lake",lair:"lake",p:{lake:[790,250]}},
 shrine_forest:{n:"Святилище лис",e:"🦊",d:"forest",lair:"forest",sh:"Старое святилище с рыжими лентами. Говорят, духи лис видят каждого.",p:{forest:[230,560]}},
 lair_forest:{n:"Логово Кицунэ",e:"💀",d:"forest",lair:"forest",p:{forest:[570,150]}},
 lair_cemetery:{n:"Мавзолей Некроманта",e:"💀",d:"cemetery",lair:"cemetery",p:{cemetery:[800,120]}},
 chapel_cemetery:{n:"Часовня",e:"⛪",d:"cemetery",lair:"cemetery",sh:"Часовня со сломанным шпилем. Свечи в ней горят сами.",p:{cemetery:[250,340]}},
 lair_ruins:{n:"Подземелье жреца",e:"💀",d:"ruins",lair:"ruins",p:{ruins:[690,730]}},
 altar_ruins:{n:"Алтарный зал",e:"🔥",d:"ruins",lair:"ruins",sh:"Алтарный зал с багровым тлением в трещинах пола.",p:{ruins:[700,290]}}
};
const REG_ORDER=["ruins","cemetery","forest","lake"];

/* ---------- состояние ---------- */
const vp=$("vp"),layer=$("layer"),world=$("world"),bg=$("bg");
const S={scene:"over",s:1,tx:0,ty:0,min:1,max:4,sel:null,busy:false,lv:1};
const hr=new Date().getHours();
const OVER=(hr>=22||hr<6)?"night":"over";
const sceneImg=n=>IMG+(n==="over"?OVER:LOC[n].img)+".webp";
const EV={};
let last=null;try{last=localStorage.getItem("lotm_last_loc")}catch(_){}
function vsz(){return{w:vp.clientWidth,h:vp.clientHeight}}
function limits(){const{w,h}=vsz();S.min=Math.max(Math.min(w/SW,h/SH),Math.max(w/SW,h/SH)*0.88);S.max=Math.max(S.min*2.4,Math.min(S.min*3.4,0.9))}
function clampT(slack){
 const{w,h}=vsz(),cw=SW*S.s,ch=SH*S.s,k=slack||0;
 S.tx=cw<=w?(w-cw)/2:Math.min(k,Math.max(w-cw-k,S.tx));
 S.ty=ch<=h?(h-ch)/2:Math.min(k,Math.max(h-ch-k,S.ty));
}
let invS=0;
function apply(){
 world.style.transform="translate3d("+S.tx+"px,"+S.ty+"px,0) scale("+S.s+")";
 if(Math.abs(S.s-invS)>0.004){invS=S.s;world.style.setProperty("--inv",(1/S.s).toFixed(4))}
}
function focusOn(x,y,s){
 const{w,h}=vsz();S.s=Math.min(S.max,Math.max(S.min,s||S.min));
 S.tx=w/2-x*S.s;S.ty=h/2-y*S.s;clampT();apply();
}
let anim=0;
function animTo(s,tx,ty,ms){
 cancelAnimationFrame(anim);
 const s0=S.s,x0=S.tx,y0=S.ty,t0=performance.now();ms=reduce?1:(ms||280);
 (function f(now){
  const k=Math.min(1,(now-t0)/ms),e=1-Math.pow(1-k,3);
  S.s=s0+(s-s0)*e;S.tx=x0+(tx-x0)*e;S.ty=y0+(ty-y0)*e;clampT();apply();
  if(k<1)anim=requestAnimationFrame(f);
 })(t0);
}
function zoomAt(cx,cy,ns,ms){
 ns=Math.min(S.max,Math.max(S.min,ns));
 const wx=(cx-S.tx)/S.s,wy=(cy-S.ty)/S.s;
 let tx=cx-wx*ns,ty=cy-wy*ns;
 const{w,h}=vsz(),cw=SW*ns,ch=SH*ns;
 tx=cw<=w?(w-cw)/2:Math.min(0,Math.max(w-cw,tx));ty=ch<=h?(h-ch)/2:Math.min(0,Math.max(h-ch,ty));
 animTo(ns,tx,ty,ms);
}
function flyTo(x,y,s,ms,up){
 const{w,h}=vsz();s=Math.min(S.max,Math.max(S.min,s));
 let tx=w/2-x*s,ty=h*(up?0.36:0.5)-y*s;const cw=SW*s,ch=SH*s;
 tx=cw<=w?(w-cw)/2:Math.min(0,Math.max(w-cw,tx));ty=ch<=h?(h-ch)/2:Math.min(0,Math.max(h-ch,ty));
 animTo(s,tx,ty,ms||420);
}

/* ---------- доступ по уровню ---------- */
function minOf(k){const P=PL[k];if(!P)return 0;const L=LOC[P.main?k:(P.lair||P.d)];return L?L.min:0}
function locked(k){return minOf(k)>S.lv}

/* ---------- сцены ---------- */
function pinFrame(k,sel){
 if(locked(k))return "pin_lock";
 if(sel)return "pin_sel";
 return PL[k].boss&&EV.boss?"pin_boss":"pin";
}
function setPinState(b,k){
 b.querySelector(".pf").src=IMG+pinFrame(k,b.classList.contains("sel"))+".webp";
 b.classList.toggle("lock",locked(k));
 b.classList.toggle("here",last===k&&!b.classList.contains("sel"));
}
function pinEl(k){
 const P=PL[k],b=document.createElement("button");
 b.type="button";b.className="pin";b.dataset.k=k;
 b.innerHTML='<img class="pf" alt=""><span class="pe"></span><span class="pn"></span>';
 b.querySelector(".pn").textContent=P.n;b.querySelector(".pe").textContent=P.e;
 b.querySelector(".pe").style.cssText="position:absolute;left:19%;top:15%;width:62%;height:50%";
 setPinState(b,k);return b;
}
function build(name){
 world.className="";
 world.querySelectorAll(".pin,.fog").forEach(n=>n.remove());
 bg.src=sceneImg(name);
 const add=(el,x,y)=>{el.style.left=x+"px";el.style.top=y+"px";world.appendChild(el)};
 Object.keys(PL).forEach(k=>{const pos=PL[k].p[name];if(pos)add(pinEl(k),pos[0],pos[1])});
 if(name==="over")Object.keys(LOC).forEach(k=>{const L=LOC[k];if(L.fog&&L.min>S.lv){const f=document.createElement("img");f.className="fog";f.src=IMG+"fog.webp";f.alt="";f.draggable=false;f.dataset.f=k;add(f,L.fog[0],L.fog[1])}});
 $("ttS").textContent=name==="over"?"Земли за воротами":"Поход";
 $("ttB").textContent=name==="over"?"Карта похода":LOC[name].n;
 $("crumb").classList.toggle("on",name!=="over");
}
function refreshLocks(){
 world.querySelectorAll(".pin").forEach(b=>setPinState(b,b.dataset.k));
 if(S.scene==="over"){
  world.querySelectorAll(".fog").forEach(f=>{if(LOC[f.dataset.f].min<=S.lv)f.remove()});
 }
 if(S.sel)select(S.sel,false);
}
function preload(){
 const go=()=>Object.keys(LOC).forEach(d=>{const i=new Image();i.src=sceneImg(d)});
 window.requestIdleCallback?requestIdleCallback(go,{timeout:2500}):setTimeout(go,900);
}
function goScene(name,focus,keepSel){
 if(S.busy)return;S.busy=true;closeSheet();
 const doIt=()=>{
  S.scene=name;build(name);limits();
  const pos=focus&&PL[focus]&&PL[focus].p[name];
  S.s=S.min;focusOn(pos?pos[0]:SW/2,pos?pos[1]:SH/2,pos?S.min*2.0:S.min);
  layer.classList.remove("out");
  if(!reduce){layer.classList.remove("in");void layer.offsetWidth;layer.classList.add("in")}
  S.busy=false;
  if(focus&&keepSel)select(focus,true);
 };
 if(reduce){doIt();return}
 layer.classList.add("out");
 const im=new Image();im.src=sceneImg(name);
 setTimeout(()=>{(im.complete?Promise.resolve():new Promise(r=>{im.onload=im.onerror=r})).then(doIt)},230);
}

/* ---------- карточка ---------- */
function closeSheet(){
 $("sheet").classList.remove("on");
 if(S.sel){const b=world.querySelector('.pin[data-k="'+S.sel+'"]');if(b){b.classList.remove("sel");setPinState(b,S.sel)}}
 S.sel=null;
}
function locOf(k){const P=PL[k];return LOC[P.main?k:(P.lair||P.d)]||null}
function select(k,fly){
 const P=PL[k];if(!P)return;
 if(S.sel&&S.sel!==k)closeSheet();
 S.sel=k;
 const b=world.querySelector('.pin[data-k="'+k+'"]');
 if(b){b.classList.add("sel");setPinState(b,k)}
 const L=locOf(k),lock=!!(L&&L.min>S.lv);
 let meta,ds,tag,go="🔍 Исследовать",goOff=false,go2=false;
 if(P.boss){
  meta=EV.boss?"Босс недели открыт":"Босс недели";ds=P.ds;tag="Край света";go=EV.boss?"⚔ К боссу недели":"Локация и рейтинг";
 }else if(P.main){
  meta="Ур. "+L.lv+" · "+"💀".repeat(L.sk)+" · Босс: "+L.boss;ds=L.ds;tag=L.n;go2=S.scene==="over";
 }else if(P.sh){
  meta=L.n;ds=P.sh;tag=L.n;
 }else{
  meta="Босс: "+L.boss;ds="Здесь обитает "+L.boss+". Слабым в одиночку тут делать нечего.";tag=L.n;
 }
 if(lock&&!P.boss){go="🔒 С "+L.min+" уровня";goOff=true}
 $("sName").textContent=P.n;$("sMeta").textContent=meta;$("sDesc").textContent=ds;$("sTag").textContent=tag;
 const g=$("sGo");g.classList.toggle("off",goOff);g.textContent=go;g.disabled=goOff;
 const g2=$("sGo2");g2.style.display=go2?"":"none";g2.textContent="Карта локации";
 $("sheet").classList.add("on");
 sfx("tap");buzz();
 if(fly){const pos=P.p[S.scene];if(pos)flyTo(pos[0],pos[1],Math.max(S.s,S.min*(S.scene==="over"?2.2:1.7)),420,true)}
}
function enter(url,key,auto){
 sfx("open");
 try{if(key){localStorage.setItem("lotm_last_loc",key);localStorage.setItem("lotm_tutf_"+uid,"1")}}catch(_){}
 const p=new URLSearchParams(location.search);p.set("_t",String(Date.now()));p.delete("auto");if(auto)p.set("auto","1");
 location.href=url+"?"+p.toString();
}
$("sGo").addEventListener("click",()=>{
 const P=PL[S.sel];if(!P||$("sGo").disabled)return;
 if(P.boss){enter(P.url);return}
 const key=P.main?S.sel:(P.lair||P.d);enter(LOC[key].url,key,true);
});
$("sGo2").addEventListener("click",()=>{const P=PL[S.sel];if(P&&P.main){sfx("open");goScene(P.d,S.sel,true)}});
$("toOver").addEventListener("click",()=>{sfx("back");const d=S.scene;goScene("over");setTimeout(()=>{const l=LOC[d]&&LOC[d].lab;if(l)flyTo(l[0],l[1],S.min*1.0,1)},500)});

/* ---------- жесты ---------- */
const ptr=new Map();let g=null,vel={x:0,y:0,t:0},inertia=0,lastTap={t:0,x:0,y:0};
function inPoly(x,y,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function locAt(x,y){for(const d of REG_ORDER)if(inPoly(x,y,LOC[d].reg))return d;return null}
function toWorld(cx,cy){const r=vp.getBoundingClientRect();return[(cx-r.left-S.tx)/S.s,(cy-r.top-S.ty)/S.s]}
vp.addEventListener("pointerdown",e=>{
 if(e.target.closest("#sheet,.ctl,.crumb"))return;
 cancelAnimationFrame(anim);cancelAnimationFrame(inertia);$("hint").classList.add("off");
 try{vp.setPointerCapture(e.pointerId)}catch(_){}
 ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptr.size===1)g={mode:"pan",x0:e.clientX,y0:e.clientY,t0:performance.now(),moved:0};
 else if(ptr.size===2){
  const[a,b]=[...ptr.values()];
  g={mode:"pinch",d0:Math.hypot(a.x-b.x,a.y-b.y)||1,s0:S.s,moved:99};
  const r=vp.getBoundingClientRect(),cx=(a.x+b.x)/2-r.left,cy=(a.y+b.y)/2-r.top;
  g.wx=(cx-S.tx)/S.s;g.wy=(cy-S.ty)/S.s;
 }
});
vp.addEventListener("pointermove",e=>{
 if(!ptr.has(e.pointerId))return;
 const p=ptr.get(e.pointerId),dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
 if(!g)return;
 if(g.mode==="pan"&&ptr.size===1){
  g.moved+=Math.abs(dx)+Math.abs(dy);
  if(g.moved<6)return;
  S.tx+=dx;S.ty+=dy;clampT(30);apply();
  const now=performance.now(),dt=Math.max(1,now-vel.t);vel={x:dx/dt*16,y:dy/dt*16,t:now};
 }else if(g.mode==="pinch"&&ptr.size>=2){
  const[a,b]=[...ptr.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1;
  const r=vp.getBoundingClientRect(),cx=(a.x+b.x)/2-r.left,cy=(a.y+b.y)/2-r.top;
  let ns=g.s0*d/g.d0;ns=Math.min(S.max*1.05,Math.max(S.min*(S.scene==="over"?0.9:0.7),ns));
  S.s=ns;S.tx=cx-g.wx*ns;S.ty=cy-g.wy*ns;clampT(40);apply();
 }
});
function endPtr(e){
 if(!ptr.has(e.pointerId))return;
 ptr.delete(e.pointerId);
 if(!g)return;
 if(g.mode==="pinch"){
  if(ptr.size<2){
   g=null;
   if(S.scene!=="over"&&S.s<S.min*0.86){goScene("over");return}
   zoomAt(vsz().w/2,vsz().h/2,Math.max(S.s,S.min),160);
   ptr.clear();
  }
  return;
 }
 const g0=g;g=null;
 if(e.type==="pointercancel")return;
 const dt=performance.now()-g0.t0;
 if(g0.moved<8&&dt<420){tap(e.clientX,e.clientY);return}
 if(performance.now()-vel.t<80&&!reduce){
  let vx=vel.x,vy=vel.y;
  (function f(){vx*=0.93;vy*=0.93;if(Math.abs(vx)+Math.abs(vy)<.4)return;S.tx+=vx;S.ty+=vy;clampT(0);apply();inertia=requestAnimationFrame(f)})();
 }else{zoomAt(vsz().w/2,vsz().h/2,S.s,1);clampT(0);apply()}
 clampT(0);apply();
}
vp.addEventListener("pointerup",endPtr);vp.addEventListener("pointercancel",endPtr);
vp.addEventListener("wheel",e=>{e.preventDefault();const r=vp.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,S.s*(e.deltaY<0?1.25:0.8),180)},{passive:false});
function tap(cx,cy){
 const el=document.elementFromPoint(cx,cy);
 const pin=el&&el.closest&&el.closest(".pin");
 const now=performance.now(),dbl=now-lastTap.t<320&&Math.hypot(cx-lastTap.x,cy-lastTap.y)<30;lastTap={t:now,x:cx,y:cy};
 if(pin){const k=pin.dataset.k;if(S.sel===k)return;select(k,false);return}
 if(dbl){
  const r=vp.getBoundingClientRect();
  if(S.s>S.min*1.6)zoomAt(cx-r.left,cy-r.top,S.min,260);else zoomAt(cx-r.left,cy-r.top,S.s*2.2,260);
  return;
 }
 if(S.sel){closeSheet();return}
 if(S.scene==="over"){
  const[x,y]=toWorld(cx,cy),d=locAt(x,y);
  if(d){sfx("open");goScene(d)}
 }
}
/* ---------- кнопки ---------- */
const mid=()=>({x:vsz().w/2,y:vsz().h/2});
$("zin").addEventListener("click",()=>{const m=mid();zoomAt(m.x,m.y,S.s*1.6,240);sfx("tap")});
$("zout").addEventListener("click",()=>{const m=mid();if(S.scene!=="over"&&S.s<=S.min*1.05){goScene("over");return}zoomAt(m.x,m.y,S.s/1.6,240);sfx("tap")});
$("compass").addEventListener("click",()=>{closeSheet();flyTo(SW/2,SH/2,S.min,380);sfx("tap")});
$("locate").addEventListener("click",()=>{
 const k=(last&&PL[last]&&PL[last].main)?last:"lake";sfx("tap");buzz();
 if(PL[k].p[S.scene]){select(k,true);return}
 if(S.scene!=="over"){goScene("over",k,true);return}
 select(k,true);
});
/* ---------- список ---------- */
function renderList(){
 const box=$("rows");box.replaceChildren();
 ["lake","forest","cemetery","ruins"].concat(["boss"]).forEach(k=>{
  const P=PL[k],L=P.boss?null:LOC[k],lock=L&&L.min>S.lv;
  const r=document.createElement("button");r.type="button";r.className="row";
  r.innerHTML='<span class="em" style="font-size:30px;width:50px;text-align:center;flex:0 0 auto"></span><span class="t"><b></b><small></small><i></i></span>';
  r.querySelector(".em").textContent=lock?"🔒":P.e;
  r.querySelector("b").textContent=P.n;
  r.querySelector("small").textContent=L?("Ур. "+L.lv+" · Босс: "+L.boss):"Босс недели · рейтинг";
  r.querySelector("i").textContent=lock?"Откроется с "+L.min+" уровня":(L?"Доступно":"Раз в неделю");
  r.addEventListener("click",()=>{closeList();sfx("open");if(S.scene!=="over")goScene("over",k,true);else select(k,true)});
  box.appendChild(r);
 });
}
function openList(){$("list").classList.add("on");renderList();sfx("open")}
function closeList(){$("list").classList.remove("on")}
$("bList").addEventListener("click",openList);
$("lx").addEventListener("click",()=>{closeList();sfx("back")});

/* ---------- данные игрока и босс недели ---------- */
function setProfile(d){
 if(!d||typeof d!=="object")return;
 const lv=Math.max(1,parseInt(d.level)||1);
 if(d.hp!=null&&d.max_hp!=null){$("vHp").textContent=d.hp+"/"+d.max_hp;$("vMad").textContent=Math.round(Number(d.madness)||0);$("vLv").textContent="Ур. "+lv;$("vit").classList.add("on")}
 if(lv!==S.lv){S.lv=lv;refreshLocks()}
}
function unwrap(d){for(let i=0;i<3;i++){if(d&&d.result&&typeof d.result==="object")d=d.result;else break}return d}
async function loadProfile(){
 if(!PROFILE_URL)return;
 try{
  const r=await fetch(PROFILE_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}",cache:"no-store"});
  if(!r.ok)return;
  const d=unwrap(await r.json());
  try{window.LOTM_FAST&&LOTM_FAST.set("profile",d)}catch(_){}
  setProfile(d);
 }catch(_){}
}
async function loadEvents(){
 if(!ACTION_URL)return;
 try{
  const r=await fetch(ACTION_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"boss_state"}),cache:"no-store"});
  if(!r.ok)return;
  const d=unwrap(await r.json());
  if(d&&d.ok===true&&(d.ph==="reg"||d.ph==="battle")){
   EV.boss=true;
   const b=world.querySelector('.pin[data-k="boss"]');if(b)setPinState(b,"boss");
   if(S.sel==="boss")select("boss",false);
  }
 }catch(_){}
}

/* ---------- старт ---------- */
function start(){
 try{const c=window.LOTM_FAST&&LOTM_FAST.get("profile",7*24*3600*1000);if(c){const lv=Math.max(1,parseInt(c.level)||1);S.lv=lv;setProfile(c)}}catch(_){}
 limits();S.scene="over";build("over");
 S.s=S.min;focusOn(SW/2,SH*0.5,S.min);
 layer.classList.add("in");
 preload();loadProfile();loadEvents();
 setTimeout(()=>$("hint").classList.add("off"),4200);
 const deep=qs.get("go");if(deep&&LOC[deep])setTimeout(()=>goScene(deep,deep,true),400);
}
addEventListener("resize",()=>{const z=S.s/S.min;limits();S.s=Math.max(S.min,Math.min(S.max,z*S.min));clampT();apply()});
document.addEventListener("contextmenu",e=>e.preventDefault());
document.addEventListener("gesturestart",e=>e.preventDefault());
if(document.readyState==="loading")addEventListener("DOMContentLoaded",start);else start();
