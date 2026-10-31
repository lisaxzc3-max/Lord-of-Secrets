/* Повелитель Тайн — сцена боя: модели героя и врага, рывки, эффекты навыков, удары, смерть.
   Подключается на странице боя после sound.js. Данные о спрайтах: shared/battle/{heroes,mobs,fx}. */
(function(){
"use strict";
var SRC=(document.currentScript&&document.currentScript.src)||"";
var BASE=SRC.replace(/[^\/]*$/,"").replace(/\?.*$/,"");
var V="?v=b3";
var META={"heroes":{"m_seer":{"idle":[288,392],"dash":[387,185],"cast":[256,393],"buff":[357,232]},"m_sailor":{"idle":[144,296],"dash":[346,248],"cast":[304,301],"buff":[303,244]},"m_hunter":{"idle":[160,296],"dash":[344,208],"cast":[369,200],"buff":[336,240]},"f_seer":{"idle":[128,308],"dash":[224,259],"cast":[264,301],"buff":[264,288]},"f_sailor":{"idle":[128,295],"dash":[304,244],"cast":[398,303],"buff":[296,252]},"f_hunter":{"idle":[128,305],"dash":[444,276],"cast":[464,268],"buff":[280,256]}},"mobs":{"drowned":[560,370],"toad":[560,342],"serpent":[560,367],"serpent2":[560,374],"leech":[560,371],"pike":[560,332],"kikimora":[560,374],"vodyanoy":[560,377],"vodyanoy2":[560,377],"mushroom":[511,560],"spider":[560,381],"tree":[560,516],"boar":[560,392],"wolf":[560,385],"kitsune":[560,414],"kitsune2":[560,374],"ghost":[362,560],"ghoul":[560,394],"skeleton":[377,560],"worm":[560,437],"banshee":[353,560],"necro":[360,560],"necro2":[372,560],"fanatic":[506,560],"gargoyle":[514,560],"guard":[370,560],"ratmut":[560,373],"cultist":[371,560],"priest":[373,560],"priest2":[372,560]},"fx":{"hunter_0":[7,186,127],"hunter_1":[8,196,133],"hunter_2":[6,239,117],"hunter_3":[6,230,111],"sailor_0":[6,234,127],"sailor_1":[8,185,133],"sailor_2":[7,257,111],"sailor_3":[7,243,117],"seer_0":[6,197,104],"seer_1":[6,169,115],"seer_2":[6,175,105],"seer_3":[6,210,127]}};
var HM=META.heroes,MM=META.mobs,FM=META.fx;
var reduce=false;try{reduce=matchMedia("(prefers-reduced-motion:reduce)").matches}catch(e){}
var SPD=1;try{SPD=+localStorage.getItem("lotm_bspd")||1}catch(e){}
if(reduce)SPD=3;
function snd(n,d){try{window.snd&&window.snd(n,d)}catch(e){}}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms/SPD)})}
function wapi(el,kf,opt){
 return new Promise(function(res){
  try{opt=opt||{};opt.duration=(opt.duration||300)/SPD;var a=el.animate(kf,opt);a.onfinish=res;a.oncancel=res}catch(e){res()}
 });
}
var cache={};
function pre(url){if(cache[url])return;var i=new Image();i.src=url;cache[url]=i}

/* ---- какие позы и эффекты у каких навыков ---- */
var ACT={
 basic:{t:"melee",fx:2,s:"bslash",size:0.5},
 divination:{t:"buff",fx:1,on:"self",s:"bcards",size:0.5},
 seer_bullet:{t:"shot",fx:0,s:"bcards",size:0.3},
 boomerang:{t:"shot",fx:0,s:"bcards",size:0.3},
 acting:{t:"spell",fx:3,on:"foe",s:"bcast",size:0.55},
 sailor_hit:{t:"melee",fx:1,on:"foe",s:"bthunder",size:0.55},
 sailor_wave:{t:"shot",fx:0,s:"bzap",size:0.42},
 sailor_drink:{t:"spell",fx:3,on:"foe",s:"bcast",size:0.55},
 sailor_pray:{t:"buff",fx:3,on:"self",s:"bbuff",size:0.5},
 hunter_shot:{t:"shot",fx:0,s:"bfire",size:0.34},
 hunter_dagger:{t:"melee",fx:1,on:"foe",s:"bfirehit",size:0.5},
 hunter_trap:{t:"spell",fx:3,on:"foe",s:"bfire",size:0.55},
 hunter_boost:{t:"buff",fx:3,on:"self",s:"bbuff",size:0.5}
};
var MOBORB={cultist:"#ff7a22",priest2:"#ff3a3a"};
var HIT_SND={seer:"bslash",sailor:"bpillar",hunter:"bfirehit"};
/* высота врага в долях сцены и подъём над землёй */
var MOBFIT={fanatic:[.5,0],gargoyle:[.5,0],guard:[.56,0],ratmut:[.4,0],cultist:[.56,0],priest:[.56,0],priest2:[.62,0],ghost:[.55,.02],ghoul:[.42,0],skeleton:[.58,0],worm:[.6,0],banshee:[.57,.03],necro:[.57,0],necro2:[.62,0],mushroom:[.58,0],spider:[.44,0],tree:[.66,0],boar:[.44,0],wolf:[.46,0],kitsune:[.46,0],kitsune2:[.56,0],drowned:[.58,0],toad:[.42,0],serpent:[.56,0],serpent2:[.62,0],leech:[.6,0],pike:[.4,.1],kikimora:[.56,0],vodyanoy:[.62,0],vodyanoy2:[.68,0]};
var MOBIDLE={fanatic:"breath",gargoyle:"breath",guard:"breath",ratmut:"breath",cultist:"float",priest:"breath",priest2:"float",ghost:"float",ghoul:"breath",skeleton:"breath",worm:"sway",banshee:"float",necro:"breath",necro2:"float",mushroom:"breath",spider:"breath",tree:"sway",boar:"breath",wolf:"breath",kitsune:"breath",kitsune2:"float",pike:"bob",serpent:"sway",serpent2:"sway",leech:"sway",toad:"breath",drowned:"float",kikimora:"breath",vodyanoy:"breath",vodyanoy2:"breath"};
var MOBATK={fanatic:"claw",gargoyle:"claw",guard:"claw",ratmut:"bite",cultist:"bolt",priest:"claw",priest2:"bolt",ghost:"claw",ghoul:"claw",skeleton:"claw",worm:"bite",banshee:"claw",necro:"bolt",necro2:"bolt",mushroom:"claw",spider:"bite",tree:"claw",boar:"bite",wolf:"bite",kitsune:"claw",kitsune2:"claw",drowned:"claw",kikimora:"claw",vodyanoy:"claw",vodyanoy2:"claw",serpent:"bite",serpent2:"bite",pike:"bite",leech:"bite",toad:"tongue"};
/* лицом ли к зрителю повёрнута поза; 1 = надо отзеркалить, чтобы смотрела вправо */
var HFLIP={"f_seer":{"idle":1},"f_sailor":{"idle":1}};

var S=null; /* состояние сцены */
function $(i){return document.getElementById(i)}

function init(cfg){
 S={stage:cfg.stage,fx:cfg.fx,hero:$("playerFrame"),foe:$("enemyFrame"),hk:"m_seer",pk:"seer",pose:"idle",mob:"",
    SW:0,SH:0,GY:0,HX:0,EX:0,hw:0,hh:0,ew:0,eh:0,busy:false,k:1,dead:{hero:false,foe:false}};
 S.hImg=S.hero.querySelector("img");S.eImg=S.foe.querySelector("img");
 measure();
 window.addEventListener("resize",function(){measure();layout()});
 return S;
}
function measure(){
 var r=S.stage.getBoundingClientRect();S.SW=r.width;S.SH=r.height;
 S.GY=Math.round(S.SH*0.16);S.HX=S.SW*0.25;S.EX=S.SW*0.745;
}
function layout(){if(S.hk)setPose(S.pose,true);if(S.mob)placeFoe()}

/* ---- герой ---- */
function setHero(path,gender){
 S.pk=path||"seer";S.hk=(gender==="female"?"f":"m")+"_"+S.pk;
 ["idle","dash","cast","buff"].forEach(function(p){pre(BASE+"heroes/"+S.hk+"_"+p+".webp"+V)});
 for(var i=0;i<4;i++)pre(BASE+"fx/"+S.pk+"_"+i+".webp"+V);
 setPose("idle",true);
}
function setPose(p,keep){
 var m=HM[S.hk]&&HM[S.hk][p];if(!m)return;
 S.pose=p;
 var idle=HM[S.hk].idle;
 var k=(S.SH*0.5)/idle[1];
 if(m[0]*k>S.SW*0.62)k=Math.min(k,S.SW*0.62/m[0]);
 var kk=(S.SH*0.5)/idle[1];
 k=Math.min(kk,S.SW*0.62/Math.max(m[0],1));
 var w=Math.round(m[0]*k),h=Math.round(m[1]*k);
 S.k=k;S.hw=w;S.hh=h;
 var u=S.hero;u.style.width=w+"px";u.style.height=h+"px";u.style.left=Math.round(S.HX-w/2)+"px";u.style.bottom=S.GY+"px";
 var f=(HFLIP[S.hk]&&HFLIP[S.hk][p])?-1:1;u.querySelector(".fl").style.setProperty("--f",f);
 var url=BASE+"heroes/"+S.hk+"_"+p+".webp"+V;
 if(S.hImg.getAttribute("src")!==url)S.hImg.src=url;
}

/* ---- враг ---- */
function setFoe(key){
 S.mob=key;pre(BASE+"mobs/"+key+".webp"+V);
 S.eImg.onload=function(){ /* запасной размер, если модели нет в списке */
  if(!MM[key]&&S.eImg.naturalWidth){MM[key]=[S.eImg.naturalWidth,S.eImg.naturalHeight];if(S.mob===key)placeFoe()}
 };
 S.eImg.src=BASE+"mobs/"+key+".webp"+V;
 S.foe.className="unit foe idle-"+(MOBIDLE[key]||"breath");
 placeFoe();
}
function placeFoe(){
 var m=MM[S.mob];if(!m)return;
 var fit=MOBFIT[S.mob]||[.55,0];
 var k=Math.min(S.SH*fit[0]/m[1],S.SW*0.56/m[0]);
 var w=Math.round(m[0]*k),h=Math.round(m[1]*k);
 S.ew=w;S.eh=h;
 S.EX=Math.min(S.SW*0.745,S.SW-w/2-8);
 var u=S.foe;u.style.width=w+"px";u.style.height=h+"px";u.style.left=Math.round(S.EX-w/2)+"px";u.style.bottom=Math.round(S.GY+S.SH*fit[1])+"px";
}
function swapFoe(key){ /* смена фазы: вспышка и новая модель */
 return wapi(S.eImg,[{filter:"brightness(1)"},{filter:"brightness(3) saturate(.3)"},{filter:"brightness(1)"}],{duration:420}).then(function(){});
}

/* ---- эффекты-спрайты ---- */
function mkfx(key,w,h){
 var m=FM[key];var e=document.createElement("div");e.className="fxs";
 e.style.cssText="width:"+w+"px;height:"+h+"px;background-image:url("+BASE+"fx/"+key+".webp"+V+");background-size:"+(m[0]*100)+"% 100%;background-repeat:no-repeat";
 S.fx.appendChild(e);return e;
}
function setFrame(e,n,i){e.style.backgroundPosition=(n>1?i/(n-1)*100:0)+"% 0"}
function dims(key,size){var m=FM[key];var w=Math.round(S.SW*size),sc=w/m[1];return{w:w,h:Math.round(m[2]*sc),n:m[0]}}
/* проигрывает кадры from..to на месте. anchor: "b" — низ по центру, "c" — центр */
function fxPlay(key,x,y,size,o){
 o=o||{};var d=dims(key,size);var a=o.from==null?0:o.from,b=o.to==null?d.n-1:o.to;
 var e=mkfx(key,d.w,d.h);
 e.style.left=Math.round(x-d.w/2)+"px";
 e.style.top=Math.round(o.anchor==="c"?y-d.h/2:y-d.h)+"px";
 if(o.flip)e.style.transform="scaleX(-1)";
 var fps=o.fps||14,t0=performance.now();
 return new Promise(function(res){
  (function tick(now){
   var i=a+Math.floor((now-t0)*SPD/1000*fps);
   if(i>b){e.remove();res();return}
   setFrame(e,d.n,i);requestAnimationFrame(tick);
  })(t0);
 });
}
/* снаряд: летит от from к to, кадры растут по пути */
function fxShot(key,from,to,size,dur){
 var d=dims(key,size);var e=mkfx(key,d.w,d.h);
 e.style.left=Math.round(from.x-d.w/2)+"px";e.style.top=Math.round(from.y-d.h)+"px";
 var t0=performance.now();
 return new Promise(function(res){
  (function tick(now){
   var p=Math.min(1,(now-t0)*SPD/dur);
   var yy=(to.y-from.y)*p-Math.sin(p*Math.PI)*S.SH*0.05;
   e.style.transform="translate("+((to.x-from.x)*p).toFixed(1)+"px,"+yy.toFixed(1)+"px)";
   setFrame(e,d.n,Math.min(d.n-2,Math.floor(p*(d.n-1))));
   if(p<1)requestAnimationFrame(tick);else{e.remove();res()}
  })(t0);
 });
}
function burst(key,x,y,size){ /* последний кадр ряда как вспышка попадания */
 var d=dims(key,size);var e=mkfx(key,d.w,d.h);
 e.style.left=Math.round(x-d.w/2)+"px";e.style.top=Math.round(y-d.h)+"px";setFrame(e,d.n,d.n-1);
 return wapi(e,[{opacity:0,transform:"scale(.5)"},{opacity:1,transform:"scale(1.05)",offset:.25},{opacity:0,transform:"scale(1.25)"}],{duration:420,easing:"ease-out"}).then(function(){e.remove()});
}

/* ---- мелкие эффекты ---- */
function flashImg(img,kind){
 var f=kind==="hero"?"brightness(1.8) sepia(1) saturate(6) hue-rotate(-45deg)":"brightness(2.6) saturate(.25)";
 return wapi(img,[{filter:"none"},{filter:f,offset:.25},{filter:"none"}],{duration:380});
}
function knock(u,dx,rot){
 return wapi(u,[{transform:"translateX(0)"},{transform:"translateX("+dx+"px) rotate("+rot+"deg)",offset:.3},{transform:"translateX(0)"}],{duration:380,easing:"ease-out"});
}
function hitFx(side,o){
 o=o||{};
 var hero=side==="hero",u=hero?S.hero:S.foe,img=hero?S.hImg:S.eImg;
 flashImg(img,side);knock(u,hero?-14:14,hero?-2:2);
 snd(hero?"hurt":"hit",hero?.5:.25);
 if(o.heavy)shake(o.heavy);
}
function shake(n){
 var a=n===2?9:5;
 wapi(S.stage,[{transform:"translate(0,0)"},{transform:"translate(-"+a+"px,"+a/2+"px)"},{transform:"translate("+a+"px,-"+a/2+"px)"},{transform:"translate(-"+a/2+"px,0)"},{transform:"translate(0,0)"}],{duration:380});
}
function screenFlash(col){
 var f=document.createElement("div");f.className="sflash";f.style.background=col||"#fff";S.stage.appendChild(f);
 wapi(f,[{opacity:.7},{opacity:0}],{duration:450}).then(function(){f.remove()});
}
function floatNum(side,text,kind){
 var u=side==="hero"?S.hero:S.foe;
 var x=side==="hero"?S.HX:S.EX,top=S.SH-parseFloat(u.style.bottom||0)-parseFloat(u.style.height||0)-4;
 var e=document.createElement("div");e.className="fnum "+(kind||"dmg");e.textContent=text;
 e.style.left=Math.round(x)+"px";e.style.top=Math.max(40,Math.round(top))+"px";
 S.fx.appendChild(e);setTimeout(function(){e.remove()},1300/SPD);
}
function status(side,icon){
 var u=side==="hero"?S.hero:S.foe;var el=u.querySelector(".stIc");
 if(!icon){if(el)el.remove();return}
 if(!el){el=document.createElement("div");el.className="stIc";u.appendChild(el)}
 el.textContent=icon;
}
function aura(side,col,ms){
 var u=side==="hero"?S.hero:S.foe;
 var g=document.createElement("div");g.className="auraG";g.style.setProperty("--c",col);u.appendChild(g);
 wapi(g,[{opacity:0,transform:"scale(.6)"},{opacity:.9,transform:"scale(1.05)",offset:.35},{opacity:0,transform:"scale(1.2)"}],{duration:ms||900}).then(function(){g.remove()});
}
var COL={seer:"#ffb066",sailor:"#9a8cff",hunter:"#ff5a3a"};

/* ---- ход героя ---- */
function handPos(){return{x:S.HX+S.hw*0.38,y:S.SH-S.GY-S.hh*0.55}}
function foeMid(){return{x:S.EX,y:S.SH-parseFloat(S.foe.style.bottom||S.GY)-S.eh*0.45}}
function foeBase(){return{x:S.EX,y:S.SH-parseFloat(S.foe.style.bottom||S.GY)}}
async function act(skill,o){
 o=o||{};var A=ACT[skill]||ACT.basic;
 var pk=(window.LOTM_SKILLS&&LOTM_SKILLS.SK[skill]&&LOTM_SKILLS.SK[skill].path)||S.pk;
 if(!FM[pk+"_0"])pk=S.pk;
 var impact=function(){try{o.impact&&o.impact()}catch(e){}};
 var fb=foeBase(),fm=foeMid();
 if(A.t==="melee"){
  setPose("dash");snd("bdash");
  var dx=Math.round((S.EX-S.HX)*0.66);
  await wapi(S.hero,[{transform:"translateX(0)"},{transform:"translateX("+dx+"px)"}],{duration:260,easing:"cubic-bezier(.25,.8,.3,1)",fill:"forwards"});
  snd(A.s);snd(HIT_SND[pk]||"bslash");
  var big=A.fx===1;
  var pf=fxPlay(pk+"_"+A.fx,big?fb.x:fm.x,big?fb.y:fm.y,A.size,{anchor:big?"b":"c",fps:16});
  await sleep(big?200:120);
  impact();hitFx("foe",{heavy:big?1:0});
  await pf;await sleep(60);
  setPose("idle");
  await wapi(S.hero,[{transform:"translateX("+dx+"px)"},{transform:"translateX(0)"}],{duration:300,easing:"ease-in-out",fill:"forwards"});
  S.hero.style.transform="";
 }else if(A.t==="shot"){
  setPose("cast");snd("bcast");aura("hero",COL[pk],700);
  await wapi(S.hero,[{transform:"translateX(0)"},{transform:"translateX(-8px)",offset:.5},{transform:"translateX(0)"}],{duration:300});
  snd(A.s);
  var hp=handPos();
  await fxShot(pk+"_"+A.fx,hp,{x:fb.x-S.ew*0.15,y:fm.y+10},A.size,380);
  impact();hitFx("foe");snd(HIT_SND[pk]||"hit");
  await burst(pk+"_"+A.fx,fm.x,fm.y+18,A.size*1.6);
  if(A.echo){ /* эхо: второй удар */
   await sleep(160);snd("bcards");
   var pe=fxPlay(pk+"_"+A.echo,fm.x,fm.y,0.5,{anchor:"c",fps:15});await sleep(160);hitFx("foe");await pe;
  }
  setPose("idle");
 }else if(A.t==="spell"){
  setPose("cast");snd("bcast");aura("hero",COL[pk],700);
  await sleep(300);snd(A.s);
  var pp=fxPlay(pk+"_"+A.fx,fb.x,fb.y+6,A.size,{anchor:"b",fps:13});
  await sleep(380);impact();flashImg(S.eImg,"foe");
  await pp;setPose("idle");
 }else{ /* усиление */
  setPose("buff");snd("bbuff");aura("hero",COL[pk],1000);
  var hb={x:S.HX,y:S.SH-S.GY+4};
  var pb=fxPlay(pk+"_"+A.fx,hb.x,hb.y,A.size,{anchor:"b",fps:13});
  await sleep(420);impact();
  await pb;await sleep(80);setPose("idle");
 }
}

/* эхо Бумажного кинжала: второй удар приходит на следующем ходу */
async function echo(){
 var fm=foeMid();snd("bcards");
 var pe=fxPlay("seer_2",fm.x,fm.y,0.5,{anchor:"c",fps:15});
 await sleep(160);hitFx("foe");await pe;
}

/* ---- ход врага ---- */
async function enemyAct(o){
 o=o||{};var kind=MOBATK[S.mob]||"claw";
 var impact=function(){try{o.impact&&o.impact()}catch(e){}};
 var dist=Math.round((S.EX-S.HX)*(o.heavy?0.62:0.5));
 snd(o.snd||"benemy");
 await wapi(S.foe,[{transform:"translateX(0) scale(1)"},{transform:"translateX(12px) scale(.95,1.04)"}],{duration:230,easing:"ease-out",fill:"forwards"});
 if(kind==="bolt"){
  var f0=foeMid(),t0={x:S.HX+S.hw*0.2,y:S.SH-S.GY-S.hh*0.5};
  var oc=MOBORB[S.mob]||"#b86bff";aura("foe",oc,600);snd("bcast");
  var orb=document.createElement("div");orb.style.cssText="position:absolute;z-index:21;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#fff,"+oc+" 45%,#00000000 72%);box-shadow:0 0 18px "+oc+";left:"+(f0.x-S.ew*0.25)+"px;top:"+(f0.y-S.eh*0.1)+"px";
  S.fx.appendChild(orb);
  await wapi(orb,[{transform:"translate(0,0) scale(.5)"},{transform:"translate("+(t0.x-f0.x+S.ew*0.25)+"px,"+(t0.y-f0.y+S.eh*0.1)+"px) scale(1.1)"}],{duration:360,easing:"ease-in",fill:"forwards"});
  orb.remove();
  if(o.miss)dodge("hero");else{impact();hitFx("hero",o);fxHero("magic")}
  await wapi(S.foe,[{transform:"translateX(12px)"},{transform:"translateX(0)"}],{duration:240,fill:"forwards"});S.foe.style.transform="";
  return;
 }
 if(kind==="tongue"){
  var from=foeMid(),to={x:S.HX+S.hw*0.2,y:S.SH-S.GY-S.hh*0.5};
  var t=document.createElement("div");t.className="tongue";var len=Math.hypot(from.x-to.x,from.y-to.y);
  t.style.cssText="left:"+from.x+"px;top:"+(from.y-45)+"px;width:"+len+"px;transform-origin:0 50%;transform:rotate("+(Math.atan2(to.y-(from.y-45),to.x-from.x)*180/Math.PI)+"deg) scaleX(0)";
  S.fx.appendChild(t);snd("bsplash");
  await wapi(t,[{transform:t.style.transform},{transform:t.style.transform.replace("scaleX(0)","scaleX(1)")}],{duration:170,fill:"forwards"});
  if(o.miss)dodge("hero");else{impact();hitFx("hero",o);fxHero(kind)}
  await wapi(t,[{opacity:1},{opacity:0}],{duration:160});t.remove();
  await wapi(S.foe,[{transform:"translateX(12px)"},{transform:"translateX(0)"}],{duration:240,fill:"forwards"});S.foe.style.transform="";
  return;
 }
 await wapi(S.foe,[{transform:"translateX(12px) scale(.95,1.04)"},{transform:"translateX(-"+dist+"px) scale(1.04)"}],{duration:210,easing:"cubic-bezier(.3,.7,.2,1)",fill:"forwards"});
 snd(kind==="bite"?"bbite":"bclaw");
 if(o.miss)dodge("hero");else{impact();hitFx("hero",o);fxHero(kind)}
 await sleep(240);
 await wapi(S.foe,[{transform:"translateX(-"+dist+"px) scale(1.04)"},{transform:"translateX(0) scale(1)"}],{duration:320,easing:"ease-in-out",fill:"forwards"});
 S.foe.style.transform="";
}
async function enemyCast(o){
 o=o||{};var col=o.color||"#c48cff";
 snd(o.snd||"benemy");snd("bcast",.05);
 aura("foe",col,900);
 await wapi(S.foe,[{transform:"translateY(0) scale(1)"},{transform:"translateY(-10px) scale(1.06,1.08)",offset:.4},{transform:"translateY(0) scale(1)"}],{duration:620,easing:"ease-in-out"});
 try{o.impact&&o.impact()}catch(e){}
}
function fxHero(kind){
 var x=S.HX+S.hw*0.05,y=S.SH-S.GY-S.hh*0.55;
 var e=document.createElement("div");e.className="eHit "+kind;e.style.left=Math.round(x)+"px";e.style.top=Math.round(y)+"px";
 e.innerHTML=kind==="magic"?"<b></b>":kind==="claw"?"<i></i><i></i><i></i>":kind==="bite"?"<i></i><i></i><b></b>":"<b></b>";
 S.fx.appendChild(e);setTimeout(function(){e.remove()},700/SPD);
}
async function dodge(side){
 var u=side==="hero"?S.hero:S.foe,dx=side==="hero"?-34:34;
 snd("bmiss");floatNum(side,"Промах","miss");
 await wapi(u,[{transform:"translateX(0)",opacity:1},{transform:"translateX("+dx+"px)",opacity:.45,offset:.4},{transform:"translateX(0)",opacity:1}],{duration:420});
}
async function die(side){
 var hero=side==="hero",u=hero?S.hero:S.foe;S.dead[side==="hero"?"hero":"foe"]=true;
 snd("bdie");
 if(hero){
  await wapi(u,[{transform:"rotate(0) translateY(0)",opacity:1,filter:"none"},{transform:"rotate(80deg) translate(8px,6px)",opacity:.55,filter:"grayscale(1)"}],{duration:800,easing:"ease-in",fill:"forwards"});
 }else{
  await wapi(u,[{transform:"scale(1) translateY(0)",opacity:1,filter:"none"},{transform:"scale(1.04) translateY(0)",opacity:1,filter:"brightness(2.4)",offset:.2},{transform:"scale(.82) translateY(26px)",opacity:0,filter:"brightness(0)"}],{duration:900,easing:"ease-in",fill:"forwards"});
 }
}
function revive(){
 S.dead={hero:false,foe:false};
 [S.hero,S.foe].forEach(function(u){u.style.transform="";u.style.opacity="";u.style.filter="";try{u.getAnimations().forEach(function(a){a.cancel()})}catch(e){}});
}
function enter(){
 S.hero.style.opacity=0;S.foe.style.opacity=0;
 wapi(S.hero,[{transform:"translateX(-90px)",opacity:0},{transform:"translateX(0)",opacity:1}],{duration:600,easing:"ease-out",fill:"forwards"}).then(function(){S.hero.style.opacity="";S.hero.style.transform=""});
 return sleep(150).then(function(){
  return wapi(S.foe,[{transform:"translateX(90px)",opacity:0},{transform:"translateX(0)",opacity:1}],{duration:650,easing:"ease-out",fill:"forwards"})
 }).then(function(){S.foe.style.opacity="";S.foe.style.transform=""});
}
function setSpeed(v){SPD=v;try{localStorage.setItem("lotm_bspd",String(v))}catch(e){}}
window.LOTM_BSCENE={echo:echo,init:init,setHero:setHero,setFoe:setFoe,swapFoe:swapFoe,setPose:setPose,act:act,enemyAct:enemyAct,enemyCast:enemyCast,dodge:dodge,die:die,revive:revive,enter:enter,
 floatNum:floatNum,status:status,hitFx:hitFx,shake:shake,flash:screenFlash,aura:aura,measure:measure,layout:layout,sleep:sleep,
 setSpeed:setSpeed,speed:function(){return SPD},mobKey:function(){return S&&S.mob},ACT:ACT};
})();
