/* Повелитель Тайн — скелетная 2D-анимация: части модели качаются вокруг суставов.
   Для героя и врага, у которых есть набор частей shared/battle/rig/<ключ>/*.webp. Остальные остаются на обычных спрайтах. */
(function(){
"use strict";
var SRC=(document.currentScript&&document.currentScript.src)||"";
var BASE=SRC.replace(/[^\/]*$/,"").replace(/\?.*$/,"")+"rig/";
var V="?v=r3";
var DEFS={"m_seer": {"W": 275, "H": 632, "parts": [{"id": "cape", "x": 0, "y": 154, "w": 212, "h": 246, "z": 1, "px": 110, "py": 11}, {"id": "leg_b", "x": 138, "y": 374, "w": 95, "h": 253, "z": 2, "px": 47, "py": 16}, {"id": "arm_b", "x": 91, "y": 179, "w": 77, "h": 257, "z": 3, "px": 38, "py": 22}, {"id": "leg_f", "x": 118, "y": 377, "w": 94, "h": 252, "z": 4, "px": 47, "py": 16}, {"id": "torso", "x": 47, "y": 146, "w": 207, "h": 262, "z": 5, "px": 105, "py": 258}, {"id": "head", "x": 84, "y": 0, "w": 183, "h": 196, "z": 6, "px": 61, "py": 187}, {"id": "arm_f", "x": 113, "y": 179, "w": 104, "h": 249, "z": 7, "px": 52, "py": 22}], "extra": [{"id": "cards", "x": 96, "y": 316, "w": 105, "h": 211}]}, "toad": {"W": 561, "H": 352, "parts": [{"id": "far", "x": 204, "y": 132, "w": 330, "h": 180, "z": 1, "px": 165, "py": 6}, {"id": "leg_b", "x": 374, "y": 105, "w": 202, "h": 242, "z": 2, "px": 99, "py": 16}, {"id": "body", "x": 160, "y": 6, "w": 340, "h": 274, "z": 3, "px": 170, "py": 274}, {"id": "jaw", "x": 33, "y": 132, "w": 218, "h": 151, "z": 4, "px": 94, "py": 11}, {"id": "head", "x": 6, "y": 6, "w": 256, "h": 216, "z": 5, "px": 160, "py": 176}, {"id": "leg_f", "x": 187, "y": 105, "w": 217, "h": 241, "z": 6, "px": 127, "py": 16}], "extra": []}};
var reduce=false;try{reduce=matchMedia("(prefers-reduced-motion:reduce)").matches}catch(e){}
function lowQ(){return reduce||window.LOTM_Q==="low"}
function mk(c,css){var e=document.createElement("div");e.className=c;if(css)e.style.cssText=css;return e}
function T(a){ /* {id:"transform"} */return a}

/* позы: вращения вокруг суставов (положительный угол = по часовой, то есть вперёд для героя, смотрящего вправо) */
var POSES={
 m_seer:{
  idle:{},
  dash:{torso:"rotate(9deg)",head:"rotate(8deg) translateX(4px)",arm_f:"rotate(-78deg)",arm_b:"rotate(38deg)",cape:"rotate(22deg)",leg_f:"rotate(-26deg)",leg_b:"rotate(30deg)"},
  cast:{torso:"rotate(-3deg)",head:"rotate(-5deg)",arm_f:"rotate(-96deg)",arm_b:"rotate(10deg)",cape:"rotate(9deg)"},
  buff:{torso:"translateY(-8px)",head:"rotate(-9deg)",arm_f:"rotate(-58deg)",arm_b:"rotate(-52deg)",cape:"rotate(14deg)"},
  hit:{torso:"rotate(-9deg)",head:"rotate(-15deg)",arm_f:"rotate(16deg)",arm_b:"rotate(20deg)",cape:"rotate(16deg)",leg_f:"rotate(5deg)",leg_b:"rotate(-5deg)"}
 },
 toad:{
  idle:{},
  attack:{head:"translateX(-28px) rotate(-4deg)",jaw:"rotate(12deg) translateX(-12px)",leg_f:"rotate(-8deg)",body:"translateX(-6px)"},
  hit:{body:"scale(1.03,.93)",head:"rotate(9deg) translateX(12px)",jaw:"rotate(10deg)",leg_f:"rotate(4deg)"}
 }
};
/* фоновые покачивания (дыхание, ткань) */
var IDLE={
 m_seer:[
  ["torso",[{transform:"translateY(0) scale(1)"},{transform:"translateY(-6px) scale(1.008,1.014)"}],2000],
  ["head",[{transform:"rotate(0deg) translateY(0)"},{transform:"rotate(-1.6deg) translateY(-6px)"}],2200],
  ["cape",[{transform:"rotate(0deg)"},{transform:"rotate(3.2deg)"}],2400],
  ["arm_f",[{transform:"rotate(1.5deg)"},{transform:"rotate(-2.6deg)"}],2600],
  ["arm_b",[{transform:"rotate(-1.2deg)"},{transform:"rotate(2.2deg)"}],2800]
 ],
 toad:[
  ["body",[{transform:"scale(1,1)"},{transform:"scale(1.008,1.03)"}],1700],
  ["head",[{transform:"translateY(0) rotate(0deg)"},{transform:"translateY(-9px) rotate(-1.2deg)"}],2100],
  ["jaw",[{transform:"scaleY(1)"},{transform:"scaleY(1.09)"}],1300],
  ["leg_f",[{transform:"rotate(0deg)"},{transform:"rotate(1.4deg)"}],2300],
  ["far",[{transform:"translateX(0)"},{transform:"translateX(-4px)"}],2500]
 ]
};

function create(key,unit,img){
 var d=DEFS[key];if(!d)return null;
 var fl=unit.querySelector(".fl")||unit;
 var root=mk("rig","position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .25s");
 var st=mk("rs","position:absolute;left:0;top:0;width:"+d.W+"px;height:"+d.H+"px;transform-origin:0 0");
 root.appendChild(st);
 var P={},anims=[],cur="idle",loaded=0,total=d.parts.length+d.extra.length,self={key:key,def:d,root:root,destroyed:false};
 function onload(){loaded++;if(loaded>=total&&!self.destroyed){root.style.opacity=1;if(img)img.style.display="none";startIdle()}}
 d.parts.forEach(function(p){
  var o=mk("rp","position:absolute;left:"+p.x+"px;top:"+p.y+"px;width:"+p.w+"px;height:"+p.h+"px;z-index:"+p.z+";transform-origin:"+p.px+"px "+p.py+"px");
  var i=mk("ri","position:absolute;inset:0;transform-origin:"+p.px+"px "+p.py+"px");
  var im=new Image();im.draggable=false;im.alt="";im.onload=onload;im.onerror=onload;im.src=BASE+key+"/"+p.id+".webp"+V;
  i.appendChild(im);o.appendChild(i);st.appendChild(o);P[p.id]={o:o,i:i,p:p};
 });
 d.extra.forEach(function(x){
  var host=P[d.parts.filter(function(p){return p.id==="arm_f"})[0]&&"arm_f"];
  var o=mk("rx","position:absolute;left:"+(x.x-(host?host.p.x:0))+"px;top:"+(x.y-(host?host.p.y:0))+"px;width:"+x.w+"px;height:"+x.h+"px;opacity:0;transition:opacity .2s");
  var im=new Image();im.draggable=false;im.alt="";im.onload=onload;im.onerror=onload;im.src=BASE+key+"/"+x.id+".webp"+V;o.appendChild(im);
  (host?host.o:st).appendChild(o);P[x.id]={o:o,p:x};
 });
 fl.appendChild(root);
 function startIdle(){
  if(lowQ()||anims.length)return;
  (IDLE[key]||[]).forEach(function(a,n){var t=P[a[0]];if(!t)return;
   try{var an=t.i.animate(a[1],{duration:a[2],direction:"alternate",iterations:Infinity,easing:"ease-in-out",delay:-n*350});anims.push(an)}catch(e){}});
 }
 function apply(name){
  var tb=(POSES[key]||{})[name]||{};
  Object.keys(P).forEach(function(id){var t=P[id];if(!t.o)return;if(id==="cards"){t.o.style.opacity=(name==="cast")?1:0;return}t.o.style.transform=tb[id]||""});
 }
 self.pose=function(name){if(self.destroyed)return;cur=name;apply(name)};
 self.flinch=function(){
  if(self.destroyed||!POSES[key].hit)return;apply("hit");
  setTimeout(function(){if(!self.destroyed)apply(cur)},230);
 };
 self.attack=function(kind){
  if(self.destroyed)return;var nm=POSES[key].attack?"attack":null;if(!nm)return;
  apply(nm);setTimeout(function(){if(!self.destroyed)apply(cur)},340);
 };
 self.fit=function(w,h){var k=h/d.H;st.style.transform="scale("+k+")"};
 self.destroy=function(){self.destroyed=true;anims.forEach(function(a){try{a.cancel()}catch(e){}});if(root.parentNode)root.parentNode.removeChild(root);if(img)img.style.display=""};
 return self;
}
window.LOTM_RIG={has:function(k){return !!DEFS[k]},create:create,defs:DEFS};
})();
