/* Микшер звука в интерфейсе: кнопка 🎚 в шапке + модалка с ползунками.
   Значения хранятся в settings.vol и применяются на лету. */
(function(){
  const T=window.TBH;if(!T||!T.audio)return;
  const st=document.createElement("style");
  st.textContent=`
  .volRow{display:flex;align-items:center;gap:10px;margin:10px 0}
  .volRow label{flex:0 0 92px;font:700 11px var(--mono);color:var(--dim)}
  .volRow input[type=range]{flex:1;accent-color:var(--gold);height:22px}
  .volRow .val{flex:0 0 42px;text-align:right;font:900 11px var(--mono);color:var(--gold2)}
  .volMute{display:flex;align-items:center;gap:8px;margin:12px 0;font:700 12px var(--mono);color:var(--dim)}
  .volMute input{width:18px;height:18px;accent-color:var(--red)}
  .volTest{display:flex;gap:8px;margin-top:10px}`;
  document.head.appendChild(st);
  const root=document.createElement("div");root.className="modal";root.id="volModal";
  root.innerHTML=`<div class="scrim"></div><div class="card" style="width:min(440px,94vw)">
    <div class="sub">АУДИО</div><h2>🎚 Настройки звука</h2>
    <div class="volRow"><label>Общая</label><input type="range" id="volMaster" min="0" max="100"><span class="val" id="volMasterV"></span></div>
    <div class="volRow"><label>Музыка</label><input type="range" id="volMusic" min="0" max="100"><span class="val" id="volMusicV"></span></div>
    <div class="volRow"><label>Эффекты</label><input type="range" id="volSfx" min="0" max="100"><span class="val" id="volSfxV"></span></div>
    <label class="volMute"><input type="checkbox" id="volMute"> Выключить звук полностью (M)</label>
    <div class="volTest"><button class="miniBtn" id="volTestSfx">🔔 Проверить эффект</button><button class="miniBtn" id="volTestMus">🎵 Проверить музыку</button></div>
    <div class="modalBtns"><button class="ghostBtn" id="volClose">Готово</button></div>
  </div>`;
  document.body.appendChild(root);
  const $=id=>root.querySelector("#"+id);
  function sync(){
    const v=T.audio.getVolumes();
    $("volMaster").value=Math.round(v.master*100);$("volMasterV").textContent=Math.round(v.master*100)+"%";
    $("volMusic").value=Math.round(v.music*100);$("volMusicV").textContent=Math.round(v.music*100)+"%";
    $("volSfx").value=Math.round(v.sfx*100);$("volSfxV").textContent=Math.round(v.sfx*100)+"%";
    $("volMute").checked=T.audio.muted;
  }
  function open(){T.audio.init();T.audio.resume();sync();root.classList.add("on")}
  function close(){root.classList.remove("on")}
  root.querySelector(".scrim").onclick=close;
  $("volClose").onclick=close;
  const bind=(id,key)=>{$(id).addEventListener("input",e=>{
    T.audio.init();T.audio.resume();
    T.audio.setVolumes({[key]:e.target.value/100});
    $(id+"V").textContent=e.target.value+"%";
  })};
  bind("volMaster","master");bind("volMusic","music");bind("volSfx","sfx");
  $("volMute").addEventListener("change",e=>{
    T.audio.init();T.audio.resume();
    T.audio.setMuted(e.target.checked);
    if(T.save)T.save();
  });
  $("volTestSfx").onclick=()=>{T.audio.init();T.audio.resume();T.audio.play("hit");setTimeout(()=>T.audio.play("crit"),180);setTimeout(()=>T.audio.play("coin"),360)};
  $("volTestMus").onclick=()=>{T.audio.init();T.audio.resume();T.audio.setMuted(false);$("volMute").checked=false;if(T.save)T.save()};
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&root.classList.contains("on"))close()});
  const tc=document.querySelector(".topControls");
  if(tc&&!document.getElementById("soundCfgBtn")){
    const b=document.createElement("button");
    b.className="iconBtn";b.id="soundCfgBtn";b.title="Настройки звука";b.setAttribute("aria-label","Настройки звука");b.textContent="🎚";
    tc.insertBefore(b,document.getElementById("helpBtn")||null);
    b.onclick=open;
  }
})();