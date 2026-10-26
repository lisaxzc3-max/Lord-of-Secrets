/* Повелитель Тайн — звуки и музыка. Всё синтезируется кодом (WebAudio), файлов нет. */
(function(){
"use strict";
var KEY="lotm_snd";
var st={on:1,sfx:0.8,mus:0.45};
try{var s0=JSON.parse(localStorage.getItem(KEY)||"null");if(s0&&typeof s0==="object"){st.on=s0.on===0?0:1;if(isFinite(s0.sfx))st.sfx=s0.sfx;if(isFinite(s0.mus))st.mus=s0.mus}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}

var AC=window.AudioContext||window.webkitAudioContext;
var ctx=null,master=null,sfxG=null,musG=null,rev=null,noiseBuf=null;
var scene="",timers=[],musNodes=[];

function init(){
if(ctx||!AC)return !!ctx;
try{
ctx=new AC();
master=ctx.createGain();master.gain.value=st.on?1:0;var tone=ctx.createBiquadFilter();tone.type="lowpass";tone.frequency.value=3000;tone.Q.value=0.4;master.connect(tone);tone.connect(ctx.destination);
sfxG=ctx.createGain();sfxG.gain.value=st.sfx;sfxG.connect(master);
musG=ctx.createGain();musG.gain.value=st.mus*0.5;musG.connect(master);
/* простая «пещерная» реверберация: несколько задержек с обратной связью */
rev=ctx.createGain();var dl=ctx.createDelay(1),fb=ctx.createGain(),lp=ctx.createBiquadFilter();
dl.delayTime.value=0.34;fb.gain.value=0.5;lp.type="lowpass";lp.frequency.value=1700;
rev.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(master);
var len=ctx.sampleRate*2;noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate);var d=noiseBuf.getChannelData(0);for(var i=0;i<len;i++)d[i]=Math.random()*2-1;
}catch(e){ctx=null}
return !!ctx;
}
function ready(){return ctx&&ctx.state==="running"&&st.on}
function resume(){if(init()&&ctx.state!=="running"){try{ctx.resume()}catch(e){}}}

/* ---------- базовые кирпичики ---------- */
function osc(type,f,t,dur,vol,opt){
opt=opt||{};
var o=ctx.createOscillator(),g=ctx.createGain();
o.type=type;o.frequency.setValueAtTime(f,t);
if(opt.to)o.frequency.exponentialRampToValueAtTime(Math.max(20,opt.to),t+dur);
if(opt.vib){var l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=opt.vib;lg.gain.value=opt.vibd||f*0.02;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+0.1)}
var a=opt.attack||0.005;
g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol),t+a);
g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
o.connect(g);g.connect(opt.out||sfxG);if(opt.wet){var w=ctx.createGain();w.gain.value=opt.wet;g.connect(w);w.connect(rev)}
o.start(t);o.stop(t+dur+0.05);return o;
}
function noise(t,dur,vol,type,f1,f2,q,opt){
opt=opt||{};
var s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;
var fl=ctx.createBiquadFilter();fl.type=type||"lowpass";fl.frequency.setValueAtTime(f1,t);
if(f2)fl.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t+dur);
fl.Q.value=q||0.7;
var g=ctx.createGain();var a=opt.attack||0.004;
g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol),t+a);
g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
s.connect(fl);fl.connect(g);g.connect(opt.out||sfxG);if(opt.wet){var w=ctx.createGain();w.gain.value=opt.wet;g.connect(w);w.connect(rev)}
s.start(t,Math.random());s.stop(t+dur+0.05);
}
function N(m){return 440*Math.pow(2,(m-69)/12)}

/* ---------- эффекты ---------- */
var SFX={
tap:function(t){osc("sine",880,t,0.05,0.18,{to:1100})},
back:function(t){osc("sine",660,t,0.06,0.16,{to:440})},
open:function(t){osc("triangle",440,t,0.09,0.2,{to:880});osc("sine",1320,t+0.05,0.12,0.1,{wet:0.3})},
deny:function(t){osc("square",180,t,0.12,0.14);osc("square",140,t+0.1,0.14,0.14)},
coin:function(t){osc("square",1320,t,0.07,0.1);osc("square",1760,t+0.07,0.22,0.1,{wet:0.3})},
hit:function(t){noise(t,0.14,0.55,"lowpass",2400,300);osc("sine",190,t,0.16,0.6,{to:55})},
crit:function(t){noise(t,0.2,0.7,"lowpass",3800,200);osc("sine",220,t,0.22,0.7,{to:45});osc("sine",1500,t+0.02,0.35,0.16,{wet:0.5});osc("triangle",2200,t+0.03,0.25,0.08,{wet:0.5})},
hurt:function(t){osc("sawtooth",260,t,0.28,0.32,{to:70});noise(t,0.2,0.4,"bandpass",900,200,1.2)},
heal:function(t){[72,76,79,84].forEach(function(m,i){osc("sine",N(m),t+i*0.08,0.5,0.2,{wet:0.5})})},
dodge:function(t){noise(t,0.18,0.25,"highpass",1500,5000,0.5)},
win:function(t){[60,64,67,72,76].forEach(function(m,i){osc("triangle",N(m),t+i*0.13,0.7,0.26,{wet:0.5,attack:0.01})});osc("sine",N(84),t+0.7,1.2,0.12,{wet:0.7})},
lose:function(t){[64,62,59,55,52].forEach(function(m,i){osc("sawtooth",N(m),t+i*0.22,0.7,0.14,{wet:0.4,attack:0.03})})},
level:function(t){[67,71,74,79,83,86].forEach(function(m,i){osc("triangle",N(m),t+i*0.09,0.6,0.22,{wet:0.6})});noise(t+0.5,1.0,0.12,"highpass",3000,9000,0.4,{attack:0.3})},
flee:function(t){noise(t,0.5,0.35,"bandpass",600,2500,1.2,{attack:0.05});osc("triangle",300,t,0.4,0.15,{to:700})},
banner:function(t){osc("sine",110,t,0.9,0.4,{to:80,wet:0.5});osc("triangle",N(57),t,0.8,0.12,{wet:0.5})},
phase:function(t){osc("sawtooth",90,t,1.1,0.4,{to:45,vib:7});noise(t,1.1,0.3,"lowpass",300,1500,1,{attack:0.2});osc("sine",N(48),t+0.2,0.9,0.2,{wet:0.6})},
event:function(t){[62,65,69].forEach(function(m,i){osc("sine",N(m),t+i*0.12,0.9,0.16,{wet:0.7,vib:5})})},
good:function(t){[69,73,76,81].forEach(function(m,i){osc("triangle",N(m),t+i*0.09,0.55,0.2,{wet:0.5})})},
bad:function(t){[60,57,53].forEach(function(m,i){osc("sawtooth",N(m),t+i*0.16,0.6,0.14,{wet:0.5,attack:0.02})})},
frog:function(t){for(var i=0;i<3;i++)osc("square",150+i*20,t+i*0.09,0.07,0.16,{vib:40,vibd:30})},
kiss:function(t){osc("sine",900,t,0.08,0.18,{to:1500});osc("sine",1500,t+0.1,0.08,0.14,{to:700})},
dive:function(t){noise(t,0.9,0.4,"lowpass",3000,200,0.8);for(var i=0;i<4;i++)osc("sine",500+i*140,t+0.2+i*0.12,0.1,0.1,{to:900+i*120})},
bell:function(t){osc("sine",261,t,1.6,0.25,{wet:0.7});osc("sine",392,t,1.4,0.12,{wet:0.7});osc("triangle",1046,t,0.8,0.05,{wet:0.7})},
plant:function(t){noise(t,0.18,0.35,"lowpass",900,200);osc("sine",150,t,0.14,0.3,{to:90})},
harvest:function(t){osc("sine",N(76),t,0.25,0.2,{wet:0.4});osc("sine",N(83),t+0.07,0.35,0.18,{wet:0.5});noise(t,0.08,0.18,"highpass",3000,6000,0.5)},
dew:function(t){[84,88,91].forEach(function(m,i){osc("sine",N(m),t+i*0.06,0.3,0.14,{wet:0.7})});noise(t,0.3,0.1,"bandpass",3500,1500,2)},
brew:function(t){for(var i=0;i<5;i++){osc("sine",300+Math.random()*500,t+i*0.07,0.1,0.14,{to:700+Math.random()*400,wet:0.4})}osc("triangle",N(60),t+0.35,0.6,0.15,{wet:0.5})},
raven:function(t){osc("sawtooth",420,t,0.12,0.14,{to:300});osc("sawtooth",380,t+0.15,0.14,0.14,{to:260})},
stamp:function(t){osc("sine",110,t,0.18,0.5,{to:60});noise(t,0.08,0.4,"lowpass",1800,300);osc("triangle",N(84),t+0.05,0.5,0.14,{wet:0.6})},
scroll:function(t){noise(t,0.22,0.16,"bandpass",2200,900,1.5);osc("triangle",N(67),t+0.1,0.25,0.1,{wet:0.5})},
chest:function(t){osc("sawtooth",90,t,0.3,0.25,{to:200});[72,76,79,84,88].forEach(function(m,i){osc("sine",N(m),t+0.2+i*0.09,0.7,0.2,{wet:0.7})})},
meow:function(t){osc("triangle",620,t,0.12,0.2,{to:900});osc("triangle",900,t+0.12,0.25,0.18,{to:520,wet:0.3});noise(t,0.3,0.05,"bandpass",1800,900,3)},
bark:function(t){noise(t,0.1,0.4,"bandpass",900,500,1.5);osc("sawtooth",260,t,0.1,0.3,{to:150});noise(t+0.17,0.1,0.35,"bandpass",800,450,1.5);osc("sawtooth",240,t+0.17,0.1,0.28,{to:140})},
purr:function(t){for(var i=0;i<10;i++){osc("sine",58+Math.random()*8,t+i*0.07,0.08,0.18)}osc("sine",N(72),t+0.1,0.5,0.06,{wet:0.5})},
munch:function(t){for(var i=0;i<4;i++){noise(t+i*0.1,0.06,0.3,"bandpass",1500+Math.random()*800,700,2)}},
squeak:function(t){osc("sine",1500,t,0.07,0.15,{to:2100});osc("sine",1800,t+0.09,0.07,0.13,{to:2400})},
grow:function(t){[60,64,67,72,76,79,84].forEach(function(m,i){osc("sine",N(m),t+i*0.1,0.8,0.2,{wet:0.7})});noise(t,0.6,0.1,"highpass",2000,7000,0.5)},
whisper:function(t){noise(t,1.2,0.2,"bandpass",2500,1200,3,{attack:0.5,wet:0.6})},
/* навыки */
slash:function(t){noise(t,0.16,0.5,"bandpass",3000,900,1.4);osc("sine",260,t+0.06,0.1,0.3,{to:80})},
divine:function(t){[76,79,83,88].forEach(function(m,i){osc("sine",N(m),t+i*0.07,0.9,0.18,{wet:0.8,vib:6})});noise(t,0.9,0.1,"highpass",4000,9000,0.4,{attack:0.2})},
airbullet:function(t){noise(t,0.32,0.45,"bandpass",5000,900,1.5);osc("sine",900,t+0.3,0.12,0.3,{to:200});noise(t+0.3,0.15,0.4,"lowpass",2000,300)},
paper:function(t){noise(t,0.3,0.4,"highpass",2500,6000,0.4);noise(t+0.45,0.12,0.35,"bandpass",4000,2000,2);noise(t+0.55,0.35,0.3,"highpass",3000,7000,0.4)},
masks:function(t){osc("sine",N(70),t,0.6,0.2,{to:N(63),vib:8,wet:0.7});osc("sine",N(75),t+0.15,0.7,0.16,{to:N(68),vib:7,wet:0.7})},
storm:function(t){noise(t,0.08,0.9,"highpass",2000,6000,0.5);noise(t+0.02,0.7,0.6,"lowpass",900,60,0.7);osc("sine",70,t+0.05,0.7,0.5,{to:35})},
wave:function(t){noise(t,0.9,0.5,"bandpass",300,2200,1.1,{attack:0.35});noise(t+0.4,0.8,0.5,"lowpass",2500,200,0.8,{attack:0.05});osc("sine",120,t+0.4,0.4,0.4,{to:50})},
lull:function(t){[79,76,72,67].forEach(function(m,i){osc("sine",N(m),t+i*0.22,0.8,0.18,{wet:0.8})})},
fury:function(t){osc("sawtooth",70,t,0.7,0.4,{to:180,vib:12});noise(t,0.7,0.4,"lowpass",400,3000,0.9,{attack:0.3});noise(t+0.45,0.25,0.6,"highpass",2500,7000,0.5)},
arrow:function(t){osc("triangle",520,t,0.25,0.3,{to:180,vib:30,vibd:20});noise(t+0.2,0.3,0.3,"bandpass",4000,1500,1.5);noise(t+0.55,0.1,0.5,"lowpass",1500,300);osc("sine",150,t+0.55,0.14,0.4,{to:60})},
fire:function(t){noise(t,0.9,0.5,"bandpass",500,2500,0.8,{attack:0.1});for(var i=0;i<6;i++)noise(t+0.1+i*0.1,0.05,0.35,"highpass",3000+Math.random()*3000,9000,0.5);osc("sine",110,t,0.5,0.35,{to:70})},
trap:function(t){osc("square",1500,t,0.04,0.28);osc("square",900,t+0.03,0.05,0.28);noise(t+0.05,0.1,0.5,"bandpass",3500,2500,3);osc("sine",100,t+0.06,0.15,0.4,{to:50})},
taunt:function(t){osc("sawtooth",260,t,0.5,0.3,{to:200,vib:14,wet:0.4});osc("sawtooth",390,t,0.5,0.2,{to:300,vib:14,wet:0.4})}
};

/* ===== тёмная палитра: минор, тритон, низкие тона, глухой металл ===== */
var DK={
tap:function(t){osc("sine",150,t,0.08,0.24,{to:80});noise(t,0.05,0.1,"lowpass",900,250)},
back:function(t){osc("sine",110,t,0.1,0.22,{to:62})},
open:function(t){noise(t,0.3,0.14,"bandpass",520,240,2.2,{attack:0.1});osc("sine",N(45),t,0.5,0.2,{wet:0.6,attack:0.05})},
deny:function(t){osc("sawtooth",92,t,0.26,0.2,{to:58});osc("sawtooth",97,t+0.02,0.26,0.16,{to:55})},
coin:function(t){osc("sine",523,t,0.7,0.09,{wet:0.7});osc("sine",1217,t,0.45,0.05,{wet:0.7});osc("sine",1890,t+0.01,0.3,0.03,{wet:0.7});noise(t,0.03,0.08,"bandpass",2400,1800,3)},
hit:function(t){noise(t,0.16,0.55,"lowpass",1500,180);osc("sine",125,t,0.2,0.7,{to:38})},
crit:function(t){noise(t,0.24,0.7,"lowpass",2200,140);osc("sine",150,t,0.3,0.8,{to:32});osc("sawtooth",N(40),t,0.6,0.16,{to:N(34),wet:0.4});osc("sawtooth",N(46),t,0.5,0.1,{to:N(40),wet:0.4})},
hurt:function(t){osc("sawtooth",190,t,0.34,0.3,{to:48});noise(t,0.22,0.35,"bandpass",500,140,1.2)},
heal:function(t){[52,55,59,62].forEach(function(m,i){osc("sine",N(m),t+i*0.13,1.1,0.13,{wet:0.85,attack:0.25,vib:4})});noise(t,1.2,0.05,"bandpass",1500,900,4,{attack:0.5,wet:0.7})},
dodge:function(t){noise(t,0.22,0.2,"bandpass",900,300,0.8,{attack:0.03})},
win:function(t){[43,50,55,58,62].forEach(function(m,i){osc("triangle",N(m),t+i*0.2,1.6,0.18,{wet:0.85,attack:0.12})});osc("sine",N(55),t+0.9,2.6,0.14,{wet:0.95})},
lose:function(t){[52,49,46,41,36].forEach(function(m,i){osc("sawtooth",N(m),t+i*0.3,1.1,0.12,{wet:0.7,attack:0.08})});osc("sine",N(29),t,2.4,0.4,{wet:0.5})},
level:function(t){[48,51,55,60,63].forEach(function(m,i){osc("sine",N(m),t+i*0.14,1.2,0.17,{wet:0.9,attack:0.04})});osc("sine",N(48)*2.03,t+0.2,2.4,0.05,{wet:0.95})},
flee:function(t){noise(t,0.6,0.3,"bandpass",420,1400,1.2,{attack:0.08});osc("triangle",220,t,0.5,0.13,{to:420})},
event:function(t){[45,48,51].forEach(function(m,i){osc("sine",N(m),t+i*0.18,1.4,0.15,{wet:0.9,vib:4,attack:0.1})})},
good:function(t){[57,60,64,67].forEach(function(m,i){osc("sine",N(m),t+i*0.12,0.9,0.14,{wet:0.85,attack:0.06})})},
bad:function(t){[48,47,42].forEach(function(m,i){osc("sawtooth",N(m),t+i*0.18,0.8,0.12,{wet:0.6,attack:0.04})})},
frog:function(t){for(var i=0;i<3;i++)osc("sawtooth",85+i*10,t+i*0.12,0.1,0.18,{vib:35,vibd:25})},
kiss:function(t){osc("sine",380,t,0.14,0.14,{to:560,wet:0.4});osc("sine",560,t+0.14,0.14,0.1,{to:300,wet:0.5})},
dive:function(t){noise(t,1.1,0.4,"lowpass",1400,120,0.8);osc("sine",90,t+0.2,0.8,0.25,{to:45})},
bell:function(t){osc("sine",N(48),t,3.2,0.3,{wet:0.9});osc("sine",N(48)*2.41,t,2.4,0.1,{wet:0.9});osc("sine",N(48)*3.76,t,1.6,0.06,{wet:0.9});noise(t,0.05,0.2,"lowpass",900,300)},
harvest:function(t){osc("sine",N(52),t,0.5,0.17,{wet:0.7});osc("sine",N(59),t+0.1,0.7,0.14,{wet:0.8});noise(t,0.1,0.12,"bandpass",1800,800,2)},
dew:function(t){osc("sine",700,t,0.12,0.12,{to:320,wet:0.8});osc("sine",520,t+0.18,0.14,0.08,{to:260,wet:0.9})},
brew:function(t){for(var i=0;i<5;i++){osc("sine",120+Math.random()*180,t+i*0.09,0.14,0.16,{to:260+Math.random()*160,wet:0.5})}osc("sine",N(41),t+0.3,0.9,0.14,{wet:0.7})},
raven:function(t){osc("sawtooth",300,t,0.18,0.15,{to:190});osc("sawtooth",270,t+0.2,0.2,0.15,{to:170})},
stamp:function(t){osc("sine",85,t,0.25,0.55,{to:42});noise(t,0.1,0.4,"lowpass",1200,200);osc("sine",N(48),t+0.05,0.9,0.12,{wet:0.8})},
scroll:function(t){noise(t,0.3,0.14,"bandpass",1500,600,1.5)},
chest:function(t){noise(t,0.5,0.14,"bandpass",600,260,2.5,{attack:0.2});osc("sawtooth",70,t,0.5,0.22,{to:130});[48,51,55].forEach(function(m,i){osc("sine",N(m),t+0.35+i*0.12,1.4,0.17,{wet:0.9})})},
meow:function(t){osc("triangle",430,t,0.2,0.16,{to:300,wet:0.6,vib:9});osc("triangle",300,t+0.2,0.4,0.12,{to:220,wet:0.6,vib:9})},
bark:function(t){noise(t,0.14,0.4,"bandpass",500,260,1.5);osc("sawtooth",160,t,0.16,0.32,{to:85});noise(t+0.2,0.14,0.35,"bandpass",480,250,1.5);osc("sawtooth",150,t+0.2,0.16,0.28,{to:80})},
squeak:function(t){osc("sine",640,t,0.12,0.1,{to:480,vib:30,vibd:25,wet:0.6})},
grow:function(t){[48,51,55,60,63].forEach(function(m,i){osc("sine",N(m),t+i*0.16,1.3,0.16,{wet:0.9,attack:0.1})});noise(t,0.9,0.06,"bandpass",900,500,3,{attack:0.4,wet:0.6})},
whisper:function(t){noise(t,1.8,0.26,"bandpass",1800,900,4,{attack:0.7,wet:0.8})},
divine:function(t){[57,60,64,69].forEach(function(m,i){osc("sine",N(m),t+i*0.09,1.4,0.15,{wet:0.9,vib:5,attack:0.1})});osc("sine",N(33),t,1.4,0.3,{wet:0.5})},
lull:function(t){[67,63,60,55].forEach(function(m,i){osc("sine",N(m),t+i*0.26,1.1,0.15,{wet:0.9,attack:0.1})})},
masks:function(t){osc("sine",N(58),t,0.9,0.2,{to:N(51),vib:6,wet:0.8});osc("sine",N(63),t+0.18,1,0.14,{to:N(56),vib:6,wet:0.8})}
};
for(var _k in DK)SFX[_k]=DK[_k];
function sfx(name,delay){
if(!st.on||!AC)return;
if(!init())return;
if(ctx.state!=="running"){try{ctx.resume()}catch(e){}return}
var f=SFX[name];if(!f)return;
try{f(ctx.currentTime+(delay||0)+0.01)}catch(e){}
}

/* ---------- музыка ---------- */
var SC={
city:{root:38,scale:[0,3,5,7,8,12],pad:[[0,7,12],[-4,3,8],[-2,5,10]],bpm:28,bell:0.22,heart:0.15,whisp:0.2,dis:0.15,wind:1,water:0,drum:0,vol:1},
calm:{root:38,scale:[0,3,5,7,10,12],pad:[[0,7,12],[-5,2,7]],bpm:26,bell:0.2,heart:0,whisp:0.15,dis:0.1,wind:1,water:0,drum:0,vol:0.85},
lake:{root:34,scale:[0,1,3,7,8,12],pad:[[0,7,10],[-2,5,8],[1,6,10]],bpm:24,bell:0.3,heart:0.25,whisp:0.3,dis:0.25,wind:0,water:1,drum:0,vol:1},
forest:{root:36,scale:[0,1,3,6,7,10],pad:[[0,7,12],[-4,3,7],[1,6,13]],bpm:22,bell:0.18,heart:0.3,whisp:0.35,dis:0.3,wind:1,water:0,drum:0,vol:1},
pets:{root:40,scale:[0,3,5,7,10,12],pad:[[0,7,12],[-4,3,8],[-2,5,9]],bpm:28,bell:0.25,heart:0,whisp:0.15,dis:0.1,wind:0,water:0,drum:0,vol:0.85},
quests:{root:39,scale:[0,2,3,7,8,12],pad:[[0,7,12],[-4,3,8],[-3,4,9]],bpm:30,bell:0.3,heart:0.1,whisp:0.2,dis:0.15,wind:0,water:0,drum:0,vol:0.9},
garden:{root:36,scale:[0,1,3,7,8,12],pad:[[0,7,12],[-2,5,9],[1,8,13]],bpm:24,bell:0.25,heart:0.15,whisp:0.3,dis:0.2,wind:1,water:1,drum:0,vol:0.9},
cemetery:{root:33,scale:[0,1,3,5,6,8],pad:[[0,6,12],[-4,3,8],[1,8,13]],bpm:20,bell:0.3,heart:0.4,whisp:0.45,dis:0.45,wind:1,water:0,drum:0,vol:1},
battle:{root:33,scale:[0,1,3,6,7,10],pad:[[0,6],[-2,5],[1,8]],bpm:78,bell:0.1,heart:0,whisp:0,dis:0.3,wind:0,water:0,drum:1,vol:1},
boss:{root:29,scale:[0,1,3,6,7,10],pad:[[0,6],[1,7],[-1,5]],bpm:96,bell:0.1,heart:0,whisp:0,dis:0.5,wind:0,water:0,drum:2,vol:1.1}
};
function clearMusic(){
timers.forEach(function(t){clearTimeout(t);clearInterval(t)});timers=[];
musNodes.forEach(function(n){try{n.stop()}catch(e){}try{n.disconnect()}catch(e){}});musNodes=[];
}
function every(ms,fn){fn();timers.push(setInterval(function(){if(ctx&&ctx.state==="running"&&!document.hidden)fn()},ms))}
function startScene(name){
clearMusic();
var c=SC[name];if(!c||!ctx||!st.on)return;
var out=musG;
/* дрон */
[0,0.07].forEach(function(det,i){
var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
o.type=i?"triangle":"sawtooth";o.frequency.value=N(c.root)*(1+det*0.01);f.type="lowpass";f.frequency.value=170;g.gain.value=0.0001;
g.gain.exponentialRampToValueAtTime(0.09*c.vol,ctx.currentTime+3);
var l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=0.07;lg.gain.value=90;l.connect(lg);lg.connect(f.frequency);l.start();
o.connect(f);f.connect(g);g.connect(out);o.start();musNodes.push(o,l);
});
var sb=ctx.createOscillator(),sbg=ctx.createGain();sb.type="sine";sb.frequency.value=N(c.root-12);sbg.gain.value=0.0001;sbg.gain.exponentialRampToValueAtTime(0.11*c.vol,ctx.currentTime+4);sb.connect(sbg);sbg.connect(out);sb.start();musNodes.push(sb);
/* шум: ветер или вода */
if(c.wind||c.water){
var s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;
var fl=ctx.createBiquadFilter();fl.type=c.wind?"bandpass":"lowpass";fl.frequency.value=c.wind?500:700;fl.Q.value=c.wind?1.2:0.5;
var ng=ctx.createGain();ng.gain.value=c.wind?0.1:0.07;
var l2=ctx.createOscillator(),lg2=ctx.createGain();l2.frequency.value=c.wind?0.11:0.2;lg2.gain.value=c.wind?300:250;l2.connect(lg2);lg2.connect(fl.frequency);l2.start();
var l3=ctx.createOscillator(),lg3=ctx.createGain();l3.frequency.value=c.wind?0.08:0.25;lg3.gain.value=ng.gain.value*0.7;l3.connect(lg3);lg3.connect(ng.gain);l3.start();
s.connect(fl);fl.connect(ng);ng.connect(out);s.start();musNodes.push(s,l2,l3);
}
var beat=60000/c.bpm,step=0,padI=0;
/* пады и колокольчики */
every(beat*4,function(){
var ch=c.pad[padI++%c.pad.length],t=ctx.currentTime+0.05,len=beat*4/1000*1.15;
ch.forEach(function(iv){osc("sine",N(c.root+iv),t,len,0.08*c.vol,{attack:len*0.45,out:out,wet:0.5,vib:0.2,vibd:2});osc("triangle",N(c.root+iv)*1.007,t,len,0.035*c.vol,{attack:len*0.5,out:out,wet:0.5})});
});
every(beat*2,function(){
if(Math.random()<c.bell){
var m=c.root+12+c.scale[Math.floor(Math.random()*c.scale.length)],t=ctx.currentTime+Math.random()*0.4;
osc("sine",N(m),t,4,0.06*c.vol,{out:out,wet:0.95,attack:0.02});osc("sine",N(m)*2.41,t,2.5,0.02*c.vol,{out:out,wet:0.95,attack:0.02});
}
});
every(beat*8,function(){
if(Math.random()<(c.dis||0)){var t=ctx.currentTime+0.1,len=beat*6/1000;
osc("sine",N(c.root+6),t,len,0.05*c.vol,{attack:len*0.5,out:out,wet:0.6});osc("sine",N(c.root+1)*1.01,t,len,0.04*c.vol,{attack:len*0.5,out:out,wet:0.6})}
});
every(beat*6,function(){
if(Math.random()<(c.whisp||0)){var t=ctx.currentTime+0.2;noise(t,3.2,0.045*c.vol,"bandpass",1700,950,5,{attack:1.5,out:out,wet:0.8})}
});
every(beat*3,function(){
if(Math.random()<(c.heart||0)){var t=ctx.currentTime+0.05;osc("sine",72,t,0.2,0.2,{to:38,out:out});osc("sine",64,t+0.3,0.22,0.15,{to:34,out:out})}
});
/* ритм боя */
if(c.drum){
every(beat,function(){
var t=ctx.currentTime+0.02;
osc("sine",95,t,0.22,0.3*c.vol*(step%4===0?1:0.6),{to:42,out:out});
if(c.drum>1||step%2===1)noise(t,0.05,0.08,"highpass",5000,9000,0.4,{out:out});
if(step%8===6)osc("sawtooth",N(c.root+12+c.scale[(step>>1)%c.scale.length]),t,0.3,0.05,{out:out,wet:0.3});
step++;
});
}
}
function music(name){
if(scene===name&&musNodes.length)return;
scene=name;
if(!AC)return;
if(!init())return;
if(ctx.state!=="running"){try{ctx.resume().then(function(){if(scene===name)startScene(name)})}catch(e){}return}
startScene(name);
}
function stop(){scene="";clearMusic()}

/* ---------- настройки ---------- */
function apply(){
if(!ctx)return;
master.gain.value=st.on?1:0;sfxG.gain.value=st.sfx;musG.gain.value=st.mus*0.5;
}
function toggle(v){
st.on=(v===undefined?(st.on?0:1):(v?1:0));save();
if(st.on){resume();if(scene){var n=scene;scene="";setTimeout(function(){music(n)},80)}}
else{clearMusic()}
apply();paintBtn();return st.on;
}
function setVol(kind,v){v=Math.max(0,Math.min(1,v));if(kind==="sfx")st.sfx=v;else st.mus=v;save();apply()}

/* ---------- кнопка звука ---------- */
var btn=null;
function paintBtn(){if(btn)btn.textContent=st.on?"🔊":"🔇"}
function mkBtn(){
if(btn||!document.body||document.documentElement.hasAttribute("data-nosndbtn"))return;
btn=document.createElement("button");btn.type="button";btn.setAttribute("aria-label","Звук");btn.setAttribute("data-nosnd","1");
btn.style.cssText="position:fixed;right:10px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:9000;width:38px;height:38px;border-radius:50%;border:1px solid #6a5a38;background:#150f20cc;color:#d6b779;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 12px #0008";
btn.addEventListener("click",function(e){e.stopPropagation();resume();toggle();if(st.on)sfx("tap")});
document.body.appendChild(btn);paintBtn();
}

/* ---------- автозвук на кнопки ---------- */
var CLICK_SEL="button,.btn,a,.skill,.nav,.loc,.pCard,.gCard,.tile,.cta,[onclick],[role=button]";
function onGesture(){resume();if(scene&&ctx&&ctx.state==="running"&&!musNodes.length)startScene(scene)}
document.addEventListener("pointerdown",function(e){
onGesture();
try{
var t=e.target&&e.target.closest&&e.target.closest(CLICK_SEL);
if(t&&!t.closest("[data-nosnd]")&&!t.disabled){
if(t.tagName==="A"||t.classList.contains("back"))sfx("back");else sfx("tap");
}
}catch(x){}
},true);
document.addEventListener("touchend",onGesture,{passive:true,capture:true});
document.addEventListener("visibilitychange",function(){
if(!ctx)return;
if(document.hidden){try{ctx.suspend()}catch(e){}}else if(st.on){try{ctx.resume()}catch(e){}}
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mkBtn);else mkBtn();

window.snd=function(n,d){try{sfx(n,d)}catch(e){}};window.sndMusic=function(n){try{music(n)}catch(e){}};window.sndStop=function(){try{stop()}catch(e){}};
window.LOTM_SND={sfx:sfx,music:music,stop:stop,toggle:toggle,setVol:setVol,state:st,resume:resume,
skill:function(fx,delay){sfx(fx,delay)},ready:ready,_master:function(){return master}};
/* общий чат: подключаем на каждой странице рядом с кнопкой звука */
try{var _ss=document.querySelector('script[src*="sound.js"]');if(_ss&&!document.documentElement.hasAttribute("data-nochat")){var _c=document.createElement("script");_c.src=_ss.src.replace(/sound\.js(\?.*)?$/,"chat.js");_c.defer=true;document.head.appendChild(_c)}}catch(e){}
try{var _ss2=document.querySelector('script[src*="sound.js"]');if(_ss2){var _t=document.createElement("script");_t.src=_ss2.src.replace(/sound\.js(\?.*)?$/,"theme.js");document.head.appendChild(_t)}}catch(e){}
try{var _ss3=document.querySelector('script[src*="sound.js"]');if(_ss3){var _i=document.createElement("script");_i.src=_ss3.src.replace(/sound\.js(\?.*)?$/,"icons.js");document.head.appendChild(_i)}}catch(e){}
})();
