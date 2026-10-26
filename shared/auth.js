/* Вход только по личным ссылкам, которые выдаёт бот командой /start. */
function needStart(){
try{
if(!document.getElementById("needStart")){
var d=document.createElement("div");d.id="needStart";
d.style.cssText="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:radial-gradient(ellipse at 50% 30%,#2a1f45,#0b0814);color:#e7dcc2;font:15px/1.6 system-ui,sans-serif";
d.innerHTML='<div style="max-width:320px"><div style="font-size:44px;margin-bottom:10px">𓂀</div><div style="font-size:19px;font-weight:700;color:#d6b779;margin-bottom:8px">Нужен вход через бота</div><div style="opacity:.85">Закрой окно, отправь боту <b>/start</b> и нажми кнопку <b>«Открыть игру»</b>. Так игра узнаёт, кто ты.</div></div>';
document.body.appendChild(d);
}
}catch(e){}
return Promise.reject(new Error("need_start"));
}
