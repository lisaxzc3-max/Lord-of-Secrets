/* Повелитель Тайн — сцена боя: модели героя и врага, рывки, эффекты навыков, удары, смерть.
   Подключается на странице боя после sound.js. Данные о спрайтах: shared/battle/{heroes,mobs,fx}. */
(function(){
"use strict";
var SRC=(document.currentScript&&document.currentScript.src)||"";
var BASE=SRC.replace(/[^\/]*$/,"").replace(/\?.*$/,"");
var V="?v=f2";
var META={"heroes":{"m_seer":{"idle":[288,392],"dash":[387,185],"cast":[256,393],"buff":[357,232]},"m_sailor":{"idle":[144,296],"dash":[346,248],"cast":[304,301],"buff":[303,244]},"m_hunter":{"idle":[160,296],"dash":[344,208],"cast":[369,200],"buff":[336,240]},"f_seer":{"idle":[128,308],"dash":[224,259],"cast":[264,301],"buff":[264,288]},"f_sailor":{"idle":[128,295],"dash":[304,244],"cast":[398,303],"buff":[296,252]},"f_hunter":{"idle":[128,305],"dash":[444,276],"cast":[464,268],"buff":[280,256]}},"mobs":{"drowned":[560,370],"toad":[560,342],"serpent":[560,367],"serpent2":[560,374],"leech":[560,371],"pike":[560,332],"kikimora":[560,374],"vodyanoy":[560,377],"vodyanoy2":[560,377],"mushroom":[511,560],"spider":[560,381],"tree":[560,516],"boar":[560,392],"wolf":[560,385],"kitsune":[560,414],"kitsune2":[560,374],"ghost":[362,560],"ghoul":[560,394],"skeleton":[377,560],"worm":[560,437],"banshee":[353,560],"necro":[360,560],"necro2":[372,560],"fanatic":[506,560],"gargoyle":[514,560],"guard":[370,560],"ratmut":[560,373],"cultist":[371,560],"priest":[373,560],"priest2":[372,560],"miner":[278,420],"cavrat":[454,329],"steamgolem":[370,469],"glowworm":[371,400],"foreman":[320,470],"gargant":[426,499],"lampman":[366,450],"cartshade":[343,380],"devourer":[449,480],"mineboss":[426,500],"mineboss2":[423,520]},"fx":{"hunter_0":[7,186,127],"hunter_1":[8,196,133],"hunter_2":[6,239,117],"hunter_3":[6,230,111],"sailor_0":[6,234,127],"sailor_1":[8,185,133],"sailor_2":[7,257,111],"sailor_3":[7,243,117],"seer_0":[6,197,104],"seer_1":[6,169,115],"seer_2":[6,175,105],"seer_3":[6,210,127]}};
var HM=META.heroes,MM=META.mobs,FM=META.fx;
var reduce=false;try{reduce=matchMedia("(prefers-reduced-motion:reduce)").matches}catch(e){}
function qual(){return window.LOTM_Q||"medium"}
function lowQ(){return qual()==="low"||reduce}
var SPD=1;try{SPD=+localStorage.getItem("lotm_bspd")||1}catch(e){}
if(reduce)SPD=3;
function snd(n,d){try{window.snd&&window.snd(n,d)}catch(e){}}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms/SPD)})}
function wapi(el,kf,opt){
 return new Promise(function(res){
  try{opt=opt||{};opt.duration=(opt.duration||300)/SPD;var a=el.animate(kf,opt);a.onfinish=res;a.oncancel=res}catch(e){res()}
 });
}
/* кат-сцена ульты (пока только Провидец, женский герой) */
function ultCutLoad(){return new Promise(function(r){
 if(window.LOTM_ULTCUT)return r(window.LOTM_ULTCUT);
 var e=document.createElement("script");e.src=BASE+"ult/ultcut.js?v=u2";e.onload=function(){r(window.LOTM_ULTCUT||null)};e.onerror=function(){r(null)};document.head.appendChild(e);
})}
var cache={};
function pre(url,dec){if(cache[url])return cache[url];var i=new Image();i.src=url;cache[url]=i;if(dec&&i.decode)i.decode().catch(function(){});return i}

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
var MOBFIT={fanatic:[.5,0],gargoyle:[.5,0],guard:[.56,0],ratmut:[.4,0],cultist:[.56,0],priest:[.56,0],priest2:[.62,0],ghost:[.55,.02],ghoul:[.42,0],skeleton:[.58,0],worm:[.6,0],banshee:[.57,.03],necro:[.57,0],necro2:[.62,0],mushroom:[.58,0],spider:[.44,0],tree:[.66,0],boar:[.44,0],wolf:[.46,0],kitsune:[.46,0],kitsune2:[.56,0],drowned:[.58,0],toad:[.42,0],serpent:[.56,0],serpent2:[.62,0],leech:[.6,0],pike:[.4,.1],kikimora:[.56,0],vodyanoy:[.62,0],vodyanoy2:[.68,0],miner:[0.52,0],cavrat:[0.38,0],steamgolem:[0.6,0],glowworm:[0.5,0],foreman:[0.58,0],gargant:[0.66,0],lampman:[0.56,0],cartshade:[0.5,0],devourer:[0.62,0],mineboss:[0.68,0],mineboss2:[0.72,0]};
var MOBIDLE={fanatic:"breath",gargoyle:"breath",guard:"breath",ratmut:"breath",cultist:"float",priest:"breath",priest2:"float",ghost:"float",ghoul:"breath",skeleton:"breath",worm:"sway",banshee:"float",necro:"breath",necro2:"float",mushroom:"breath",spider:"breath",tree:"sway",boar:"breath",wolf:"breath",kitsune:"breath",kitsune2:"float",pike:"bob",serpent:"sway",serpent2:"sway",leech:"sway",toad:"breath",drowned:"float",kikimora:"breath",vodyanoy:"breath",vodyanoy2:"breath",miner:"breath",cavrat:"breath",steamgolem:"breath",glowworm:"sway",foreman:"float",gargant:"breath",lampman:"float",cartshade:"float",devourer:"sway",mineboss:"breath",mineboss2:"breath"};
var MOBATK={fanatic:"claw",gargoyle:"claw",guard:"claw",ratmut:"bite",cultist:"bolt",priest:"claw",priest2:"bolt",ghost:"claw",ghoul:"claw",skeleton:"claw",worm:"bite",banshee:"claw",necro:"bolt",necro2:"bolt",mushroom:"claw",spider:"bite",tree:"claw",boar:"bite",wolf:"bite",kitsune:"claw",kitsune2:"claw",drowned:"claw",kikimora:"claw",vodyanoy:"claw",vodyanoy2:"claw",serpent:"bite",serpent2:"bite",pike:"bite",leech:"bite",toad:"tongue",miner:"claw",cavrat:"bite",steamgolem:"claw",glowworm:"bite",foreman:"bolt",gargant:"claw",lampman:"bolt",cartshade:"claw",devourer:"bite",mineboss:"claw",mineboss2:"claw"};
/* лицом ли к зрителю повёрнута поза; 1 = надо отзеркалить, чтобы смотрела вправо */
var HFLIP={"f_seer":{"idle":1},"f_sailor":{"idle":1}};
/* покадровая анимация: имя модели -> размеры холста, размеры кадра покоя, число кадров */
var FRN={idle:4,atk:4,hit:2};
var FRD={"banshee":[471,503,275.5,269.6,19.1,321,478],"boar":[766,443,476.1,483.4,1,483,379],"cultist":[520,521,236.2,233.9,1,326,480],"drowned":[719,510,502.8,403.1,1,480,436],"f_hunter":[478,422,271.1,263.4,1.0,222,420],"f_sailor":[528,450,240.7,231.4,1,270,420],"f_seer":[436,422,227.4,216.2,1.0,201,420],"fanatic":[597,500,335.2,342.7,1,370,479],"gargoyle":[598,533,302.2,359.8,1,404,486],"ghost":[483,502,261.6,251.8,14.0,355,481],"ghoul":[825,542,509.4,531.0,1,484,471],"guard":[681,523,384.8,378.1,1,326,483],"kikimora":[736,483,525.6,428.0,1,476,429],"kitsune":[824,438,433.0,512.4,1,480,376],"kitsune2":[588,444,270.2,340.9,1,477,402],"leech":[659,405,388.3,360.0,1,479,355],"m_hunter":[369,423,196.3,186.9,1.0,189,421],"m_sailor":[468,423,218.6,204.0,1.0,244,421],"m_seer":[483,455,205,205,0,281,444],"mushroom":[642,505,382.3,358.5,1,428,478],"necro":[516,498,228.7,253.9,1,317,480],"necro2":[431,520,188.4,190.1,1,329,480],"pike":[527,371,287.1,247.1,10.4,485,341],"priest":[494,496,288.3,288.3,1,327,480],"priest2":[440,493,220.8,226.6,1,334,480],"ratmut":[735,391,389.0,449.9,1,478,347],"serpent":[603,475,387.1,356.0,1,477,401],"serpent2":[553,480,348.3,308.2,1,484,383],"skeleton":[631,525,399.8,397.8,1,345,480],"spider":[634,420,288.5,257.7,1,482,404],"toad":[557,391,557,312.5,0,489,365],"tree":[634,504,345.0,326.3,1,436,479],"vodyanoy":[701,490,414.3,359.3,1,483,427],"vodyanoy2":[661,457,391.0,354.2,1,480,395],"wolf":[791,435,401.0,443.3,1,473,360],"worm":[573,509,298.5,300.4,1,486,471],"miner":[382,442,210.0,210.0,0,278,420],"cavrat":[649,585,325.0,325.0,0,454,330],"steamgolem":[506,497,265.0,265.0,0,370,470],"glowworm":[489,499,249.5,249.5,0,371,400],"foreman":[470,503,246.0,246.0,0,320,470],"gargant":[561,569,281.0,281.0,0,426,500],"lampman":[545,480,315.0,315.0,0,366,450],"cartshade":[474,459,245.5,245.5,0,343,380],"devourer":[622,603,311.5,311.5,0,449,480],"mineboss":[546,562,273.0,273.0,0,426,500],"mineboss2":[596,565,298.5,298.5,0,423,520]};
var FR={};for(var _k in FRD){var _a=FRD[_k];FR[_k]={w:_a[0],h:_a[1],ax:_a[2],cx:_a[3],bp:_a[4],iw:_a[5],ih:_a[6],n:FRN}}
var FT={hero:{t:0,id:0},foe:{t:0,id:0}};
function frUrl(k,a,i){return BASE+"frames/"+k+"_"+a+"_"+i+".webp"+V}
function frPre(k,first){
 var f=FR[k];if(!f)return;var im=pre(frUrl(k,"idle",0),1);
 if(f.rest)return;f.rest=1;
 /* остальные кадры качаем после первого, в простое, чтобы не мешать входу в бой */
 var go=function(){["idle","atk","hit"].forEach(function(a){for(var i=(a==="idle"?1:0);i<f.n[a];i++)pre(frUrl(k,a,i),1)})};
 var later=function(){if(window.requestIdleCallback)requestIdleCallback(go,{timeout:1500});else setTimeout(go,300)};
 if(im&&!im.complete){im.addEventListener("load",later,{once:true});im.addEventListener("error",later,{once:true})}else later();
}
function frDrop(k){var f=FR[k];if(!f)return;f.rest=0;for(var a in f.n)for(var i=0;i<f.n[a];i++)delete cache[frUrl(k,a,i)]}
function fkey(side){return side==="hero"?S.hk:S.mob}
function fimg(side){return side==="hero"?S.hImg:S.eImg}
function fon(side){return !!FR[fkey(side)]}
function fstop(side){var o=FT[side];if(o.t)clearInterval(o.t);o.t=0;o.id++}
function fshow(side,a,i){var k=fkey(side);if(!FR[k])return;var u=frUrl(k,a,i),im=fimg(side);if(im.getAttribute("src")!==u)im.src=u}
function fidle(side){ /* стойка: один неподвижный кадр, без покачивания */
 fstop(side);if(!fon(side)||S.dead[side])return;
 fshow(side,"idle",0);
}
function fonce(side,a,seq,ms,idleAfter){
 fstop(side);var id=FT[side].id;
 return new Promise(function(res){
  var j=0;(function step(){
   if(FT[side].id!==id)return res();
   fshow(side,a,seq[j]);var d=ms[j]/SPD;
   if(++j>=seq.length)return setTimeout(function(){if(FT[side].id===id&&idleAfter)fidle(side);res()},d);
   setTimeout(step,d);
  })();
 });
}

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
 if(FR[S.hk]){S.hero.classList.add("fr");frPre(S.hk,1)}else{S.hero.classList.remove("fr");fstop("hero");pre(BASE+"heroes/"+S.hk+"_idle.webp"+V)}
 /* остальные позы и эффекты подгружаем чуть позже, чтобы бой открылся быстрее */
 var hk=S.hk,pk=S.pk,later=function(){if(!FR[hk])["dash","cast","buff"].forEach(function(p){pre(BASE+"heroes/"+hk+"_"+p+".webp"+V)});for(var i=0;i<4;i++)pre(BASE+"fx/"+pk+"_"+i+".webp"+V)};
 if(window.requestIdleCallback)requestIdleCallback(later,{timeout:1500});else setTimeout(later,700);
 if(S.hk==="f_seer"&&!lowQ()){var ul=function(){ultCutLoad().then(function(u){try{u&&u.preload()}catch(e){}})};if(window.requestIdleCallback)requestIdleCallback(ul,{timeout:4000});else setTimeout(ul,2500)}
 setPose("idle",true);
}
function setPose(p,keep){
 if(FR[S.hk]){
  var f=FR[S.hk],k=Math.min((S.SH*0.5)/f.ih,S.SW*0.8/f.w);
  S.k=k;S.hw=Math.round(f.iw*k);S.hh=Math.round(f.ih*k);
  var u=S.hero;u.style.width=Math.round(f.w*k)+"px";u.style.height=Math.round(f.h*k)+"px";u.style.left=Math.round(S.HX-f.ax*k)+"px";u.style.bottom=Math.round(S.GY-(f.bp||0)*k)+"px";
  u.querySelector(".fl").style.setProperty("--f",1);
  if(keep&&S.pose===p&&FT.hero.t)return;
  S.pose=p;
  if(S.dead.hero)return;
  if(p==="cast")fonce("hero","atk",[0,1,2,3],[100,130,140,1]);
  else if(p==="dash")fonce("hero","atk",[0,1,2],[70,120,1]);
  else fidle("hero");
  return;
 }
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
 if(S.mob&&S.mob!==key&&FR[S.mob])frDrop(S.mob);
 S.mob=key;fstop("foe");
 if(FR[key]){frPre(key,1);S.foe.className="unit foe fr";S.eImg.onload=null;fidle("foe");placeFoe();return}
 pre(BASE+"mobs/"+key+".webp"+V);
 S.eImg.onload=function(){ /* запасной размер, если модели нет в списке */
  if(!MM[key]&&S.eImg.naturalWidth){MM[key]=[S.eImg.naturalWidth,S.eImg.naturalHeight];if(S.mob===key)placeFoe()}
 };
 S.eImg.src=BASE+"mobs/"+key+".webp"+V;
 S.foe.className="unit foe idle-"+(MOBIDLE[key]||"breath");
 placeFoe();
}
function placeFoe(){
 var fm0=FR[S.mob];
 if(fm0){
  var ft=MOBFIT[S.mob]||[.55,0];
  var k0=Math.min(S.SH*ft[0]/fm0.ih,S.SW*0.56/fm0.iw);
  S.ew=Math.round(fm0.iw*k0);S.eh=Math.round(fm0.ih*k0);
  S.EX=Math.min(S.SW*0.745,S.SW-S.ew/2-8);
  var u0=S.foe;u0.style.width=Math.round(fm0.w*k0)+"px";u0.style.height=Math.round(fm0.h*k0)+"px";
  u0.style.left=Math.round(S.EX-fm0.cx*k0)+"px";u0.style.bottom=Math.round(S.GY+S.SH*ft[1]-(fm0.bp||0)*k0)+"px";
  return;
 }
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
 if(fon(side)&&!S.dead[side])fonce(side,"hit",[0,1],[190,230],true);
 snd(hero?"hurt":"hit",hero?.5:.25);
 if(o.heavy)shake(o.heavy);
}
function hitStop(ms){ /* короткая заморозка кадра на сильном ударе */
 try{var an=S.stage.getAnimations({subtree:true}).filter(function(a){return a.playState==="running"});
  an.forEach(function(a){try{a.pause()}catch(e){}});
  setTimeout(function(){an.forEach(function(a){try{if(a.playState==="paused")a.play()}catch(e){}})},ms)}catch(e){}
}
function shake(n){
 var a=n===2?9:5,run=function(){
  var kf=lowQ()?[{transform:"translate(0,0)"},{transform:"translate(-"+a+"px,"+a/2+"px)"},{transform:"translate("+a+"px,-"+a/2+"px)"},{transform:"translate(-"+a/2+"px,0)"},{transform:"translate(0,0)"}]
   :[{transform:"translate(0,0) scale(1)"},{transform:"translate(-"+a+"px,"+a/2+"px) scale("+(n===2?1.05:1.03)+")",offset:.2},{transform:"translate("+a+"px,-"+a/2+"px) scale(1.02)",offset:.5},{transform:"translate(-"+a/2+"px,0) scale(1.01)",offset:.75},{transform:"translate(0,0) scale(1)"}];
  wapi(S.stage,kf,{duration:380});
 };
 if(lowQ())run();else{hitStop(n===2?90:60);setTimeout(run,n===2?90:60)}
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

/* ---- ультимейт-вставка: затемнение и название навыка перед сильным ударом ---- */
var ULT={seer_bullet:1,sailor_wave:1,hunter_shot:1};
var ULTT={seer:"Игра теней",sailor:"Гнев бури",hunter:"Охота"};
async function ultBanner(skill,title){
 if(lowQ()||(!ULT[skill]&&!title))return;
 var d=(window.LOTM_SKILLS&&LOTM_SKILLS.SK&&LOTM_SKILLS.SK[skill])||{};if(title){d={c:COL[S.pk],icon:"✦",name:title}}
 var o=document.createElement("div");o.className="ultB";o.style.setProperty("--c",d.c||"#ffd98a");
 o.innerHTML="<i></i><b>"+(d.icon||"")+" "+(d.name||"")+"</b>";
 S.stage.appendChild(o);
 await wapi(o,[{opacity:0},{opacity:1,offset:.25},{opacity:1,offset:.7},{opacity:0}],{duration:520});
 o.remove();
}
/* ---- атмосфера: лёгкие частицы по локации (только transform и opacity) ---- */
var AMB={lake:["#bfe8ff","bub"],forest:["#b8e08a","leaf"],cemetery:["#c9b8e8","ash"],ruins:["#ff9a4a","ember"]};
function ambient(){
 if(lowQ()||S.amb)return;
 var loc=(location.pathname.match(/\/(lake|forest|cemetery|ruins)\//)||[])[1];if(!loc)return;
 var cfg=AMB[loc],n=qual()==="high"?14:7,box=document.createElement("div");box.className="ambB "+cfg[1];box.style.setProperty("--c",cfg[0]);
 for(var i=0;i<n;i++){var e=document.createElement("i");
  e.style.left=(Math.random()*96+2)+"%";e.style.animationDuration=(7+Math.random()*7)+"s";e.style.animationDelay=(-Math.random()*12)+"s";
  e.style.setProperty("--dx",(Math.random()*60-30)+"px");e.style.setProperty("--s",(.5+Math.random()*.9).toFixed(2));box.appendChild(e)}
 S.stage.appendChild(box);S.amb=box;
}
async function act(skill,o){
 o=o||{};var isUlt=skill==="ult";
 if(isUlt)skill={seer:"seer_bullet",sailor:"sailor_hit",hunter:"hunter_shot"}[S.pk]||"basic";var A=ACT[skill]||ACT.basic;
 var pk=(window.LOTM_SKILLS&&LOTM_SKILLS.SK[skill]&&LOTM_SKILLS.SK[skill].path)||S.pk;
 if(!FM[pk+"_0"])pk=S.pk;
 var impact=function(){try{o.impact&&o.impact()}catch(e){}if(isUlt){shake(2);screenFlash(COL[S.pk]||"#fff")}};
 var cut=false;
 if(isUlt&&S.hk==="f_seer"&&!lowQ()){try{var uc=await ultCutLoad();if(uc)cut=await uc.play({snd:snd,title:ULTT[S.pk]})}catch(e){}}
 if(!cut)await ultBanner(skill,isUlt?"Откровение · "+ULTT[S.pk]:null);
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
 var FA=!!FR[S.mob];if(FA&&kind==="tongue")kind="bite";
 var fa=function(i){if(FA)fshow("foe","atk",i)};
 if(FA){fstop("foe");fa(0)}
 var impact=function(){try{o.impact&&o.impact()}catch(e){}};
 var dist=Math.round((S.EX-S.HX)*(o.heavy?0.62:0.5)*(FA?0.75:1));
 snd(o.snd||"benemy");
 await wapi(S.foe,[{transform:"translateX(0) scale(1)"},{transform:"translateX(12px) scale(.95,1.04)"}],{duration:230,easing:"ease-out",fill:"forwards"});
 if(kind==="bolt"){
  var f0=foeMid(),t0={x:S.HX+S.hw*0.2,y:S.SH-S.GY-S.hh*0.5};
  fa(1);
  var oc=MOBORB[S.mob]||"#b86bff";aura("foe",oc,600);snd("bcast");
  var orb=document.createElement("div");orb.style.cssText="position:absolute;z-index:21;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#fff,"+oc+" 45%,#00000000 72%);box-shadow:0 0 18px "+oc+";left:"+(f0.x-S.ew*0.25)+"px;top:"+(f0.y-S.eh*0.1)+"px";
  S.fx.appendChild(orb);
  await wapi(orb,[{transform:"translate(0,0) scale(.5)"},{transform:"translate("+(t0.x-f0.x+S.ew*0.25)+"px,"+(t0.y-f0.y+S.eh*0.1)+"px) scale(1.1)"}],{duration:360,easing:"ease-in",fill:"forwards"});
  orb.remove();fa(2);
  if(o.miss)dodge("hero");else{impact();hitFx("hero",o);fxHero("magic")}
  await sleep(120);fa(3);
  await wapi(S.foe,[{transform:"translateX(12px)"},{transform:"translateX(0)"}],{duration:240,fill:"forwards"});S.foe.style.transform="";
  if(FA&&!S.dead.foe)fidle("foe");
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
 fa(1);
 await wapi(S.foe,[{transform:"translateX(12px) scale(.95,1.04)"},{transform:"translateX(-"+dist+"px) scale(1.04)"}],{duration:210,easing:"cubic-bezier(.3,.7,.2,1)",fill:"forwards"});
 fa(2);snd(kind==="bite"?"bbite":"bclaw");
 if(o.miss)dodge("hero");else{impact();hitFx("hero",o);fxHero(kind)}
 await sleep(240);fa(3);
 await wapi(S.foe,[{transform:"translateX(-"+dist+"px) scale(1.04)"},{transform:"translateX(0) scale(1)"}],{duration:320,easing:"ease-in-out",fill:"forwards"});
 S.foe.style.transform="";if(FA&&!S.dead.foe)fidle("foe");
}
async function enemyCast(o){
 o=o||{};var col=o.color||"#c48cff";
 snd(o.snd||"benemy");snd("bcast",.05);
 aura("foe",col,900);
 if(fon("foe")&&!S.dead.foe){fstop("foe");fshow("foe","atk",0)}
 await wapi(S.foe,[{transform:"translateY(0) scale(1)"},{transform:"translateY(-10px) scale(1.06,1.08)",offset:.4},{transform:"translateY(0) scale(1)"}],{duration:620,easing:"ease-in-out"});
 if(fon("foe")&&!S.dead.foe)fidle("foe");
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
 if(fon(side==="hero"?"hero":"foe")){fstop(hero?"hero":"foe");fshow(hero?"hero":"foe","hit",0)}
 if(hero){
  await wapi(u,[{transform:"rotate(0) translateY(0)",opacity:1,filter:"none"},{transform:"rotate(80deg) translate(8px,6px)",opacity:.55,filter:"grayscale(1)"}],{duration:800,easing:"ease-in",fill:"forwards"});
 }else{
  await wapi(u,[{transform:"scale(1) translateY(0)",opacity:1,filter:"none"},{transform:"scale(1.04) translateY(0)",opacity:1,filter:"brightness(2.4)",offset:.2},{transform:"scale(.82) translateY(26px)",opacity:0,filter:"brightness(0)"}],{duration:900,easing:"ease-in",fill:"forwards"});
 }
}
function revive(){
 S.dead={hero:false,foe:false};
 if(fon("hero"))fidle("hero");if(fon("foe"))fidle("foe");
 [S.hero,S.foe].forEach(function(u){u.style.transform="";u.style.opacity="";u.style.filter="";try{u.getAnimations().forEach(function(a){a.cancel()})}catch(e){}});
}
function enter(){
 try{ambient()}catch(e){}
 S.hero.style.opacity=0;S.foe.style.opacity=0;
 wapi(S.hero,[{transform:"translateX(-90px)",opacity:0},{transform:"translateX(0)",opacity:1}],{duration:600,easing:"ease-out",fill:"forwards"}).then(function(){S.hero.style.opacity="";S.hero.style.transform=""});
 return sleep(150).then(function(){
  return wapi(S.foe,[{transform:"translateX(90px)",opacity:0},{transform:"translateX(0)",opacity:1}],{duration:650,easing:"ease-out",fill:"forwards"})
 }).then(function(){S.foe.style.opacity="";S.foe.style.transform=""});
}
function setSpeed(v){SPD=v;try{localStorage.setItem("lotm_bspd",String(v))}catch(e){}}
function preload(mob,path,gender){try{if(mob)frPre(mob);if(path)frPre((gender==="female"?"f":"m")+"_"+path)}catch(e){}}
window.LOTM_BSCENE={preload:preload,echo:echo,init:init,setHero:setHero,setFoe:setFoe,swapFoe:swapFoe,setPose:setPose,act:act,enemyAct:enemyAct,enemyCast:enemyCast,dodge:dodge,die:die,revive:revive,enter:enter,
 floatNum:floatNum,status:status,hitFx:hitFx,shake:shake,flash:screenFlash,aura:aura,measure:measure,layout:layout,sleep:sleep,
 setSpeed:setSpeed,speed:function(){return SPD},mobKey:function(){return S&&S.mob},ACT:ACT};
})();
