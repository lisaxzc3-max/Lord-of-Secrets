/* Повелитель Тайн — кат-сцена ульты (видео на весь экран, ~5 с). Сейчас: Провидец, женский герой («Игра теней»).
   LOTM_ULTCUT.preload() — подгрузить ролик; LOTM_ULTCUT.play({snd,title}) -> Promise (true, если сцена показана). */
(function(){
"use strict";
if(window.LOTM_ULTCUT)return;
var SRC=(document.currentScript&&document.currentScript.src)||"";
var URL0=SRC.replace(/[^\/]*$/,"").replace(/\?.*$/,"")+"seer_f.mp4?v=u3";
var TOTAL=5.2;
/* звуки по времени ролика, секунды */
var SND=[[0.05,"bcast"],[1.12,"bbuff"],[2.95,"bdash"],[4.2,"bcards"],[4.42,"bcards"],[4.9,"hit"]];
var blobUrl=null,loading=null,playing=false;
function preload(){
 if(loading)return loading;
 loading=fetch(URL0).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){blobUrl=URL.createObjectURL(b);return blobUrl}).catch(function(){loading=null;return null});
 return loading;
}
function css(){
 if(document.getElementById("ucCss"))return;
 var g=document.createElement("canvas");g.width=g.height=96;var c=g.getContext("2d"),d=c.createImageData(96,96);
 for(var i=0;i<d.data.length;i+=4){var v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}
 c.putImageData(d,0,0);
 var s=document.createElement("style");s.id="ucCss";
 s.textContent=".ucS,.ucS *{border:0!important;outline:0!important;box-shadow:none!important;box-sizing:border-box;margin:0;padding:0;background-color:transparent}"+
 ".ucS{position:fixed;left:0;top:0;right:0;bottom:0;width:100vw;height:100vh;height:100dvh;z-index:2147483000;background:#000!important;touch-action:none;overflow:hidden;opacity:0;transition:opacity .3s;-webkit-tap-highlight-color:transparent;user-select:none}"+
 ".ucS.on{opacity:1}"+
 ".ucS video{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;display:block;background:#000}"+
 ".ucG{position:absolute;left:-60px;top:-60px;right:-60px;bottom:-60px;background:url("+g.toDataURL()+");opacity:.06;mix-blend-mode:overlay;animation:ucG .5s steps(1) infinite;pointer-events:none}"+
 "@keyframes ucG{0%{transform:translate(0,0)}20%{transform:translate(-31px,22px)}40%{transform:translate(27px,-40px)}60%{transform:translate(-18px,-12px)}80%{transform:translate(35px,30px)}}"+
 ".ucT{position:absolute;left:0;right:0;bottom:15%;text-align:center;font:600 19px/1.3 Georgia,'Times New Roman',serif;letter-spacing:.14em;color:#ffe2a6;text-shadow:0 0 14px #ffb04a,0 0 30px #c2641b,0 2px 3px #000;opacity:0;pointer-events:none;text-transform:uppercase}"+
 ".ucT small{display:block;font-size:11px;letter-spacing:.4em;color:#d9b97a;margin-bottom:6px;opacity:.85}";
 document.head.appendChild(s);
}
function play(o){
 o=o||{};
 if(playing)return Promise.resolve(false);
 playing=true;css();
 return Promise.race([preload(),new Promise(function(r){setTimeout(function(){r(null)},3500)})]).then(function(url){
  if(!url){playing=false;return false}
  return new Promise(function(done){
   var snd=o.snd||function(){},fin=false,fired={},raf=0,t0=Date.now(),skipped=false;
   var root=document.createElement("div");root.className="ucS";
   var v=document.createElement("video");v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute("playsinline","");v.setAttribute("webkit-playsinline","");v.setAttribute("disablepictureinpicture","");v.preload="auto";v.controls=false;v.src=url;
   root.appendChild(v);
   var gr=document.createElement("div");gr.className="ucG";root.appendChild(gr);
   var cap=document.createElement("div");cap.className="ucT";cap.innerHTML="<small>Откровение</small>"+(o.title||"Игра теней");root.appendChild(cap);
   document.body.appendChild(root);
   function finish(ok){
    if(fin)return;fin=true;cancelAnimationFrame(raf);
    root.classList.remove("on");
    setTimeout(function(){try{v.pause();v.removeAttribute("src");v.load()}catch(e){}root.remove();playing=false;done(!!ok)},ok?320:0);
   }
   function tick(){
    if(fin)return;var t=v.currentTime||0;
    for(var i=0;i<SND.length;i++){if(!fired[i]&&t>=SND[i][0]&&!(skipped&&SND[i][0]<4.8)){fired[i]=1;snd(SND[i][1])}else if(!fired[i]&&skipped&&SND[i][0]<4.8)fired[i]=1}
    var k=Math.max(0,Math.min(1,(t-4.15)/.3))*(1-Math.max(0,Math.min(1,(t-4.8)/.25)));
    cap.style.opacity=k;cap.style.transform="translateY("+(8-8*k)+"px)";
    if(t>=TOTAL||v.ended){finish(true);return}
    raf=requestAnimationFrame(tick);
   }
   v.addEventListener("ended",function(){finish(true)});
   v.addEventListener("error",function(){finish(false)});
   v.addEventListener("playing",function(){if(fin)return;root.classList.add("on");raf=requestAnimationFrame(tick)},{once:true});
   /* тихий пропуск касанием (без кнопки): перематывает к вспышке */
   root.addEventListener("pointerdown",function(){if(!skipped&&v.currentTime>1&&v.currentTime<4.8){skipped=true;try{v.currentTime=4.88}catch(e){}}});
   var pr=v.play();if(pr&&pr.catch)pr.catch(function(){finish(false)});
   setTimeout(function(){if(!fin&&!root.classList.contains("on"))finish(false)},2500);
   setTimeout(function(){if(!fin)finish(true)},9000);
  });
 });
}
window.LOTM_ULTCUT={preload:preload,play:play,total:TOTAL};
})();
