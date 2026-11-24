      (function(){
        const T=window.TBH,U=T.util,BAL=T.config.balance;
        T.load();
        T.battle.init();
        T.ui.init();
        T.items.sweepAutoSell();
        T.battle.resize();
        T.battle.startWave(T.S.wave,{silent:true});
        const resize=()=>T.battle.resize();
        new ResizeObserver(resize).observe(document.getElementById("stageWrap"));
        addEventListener("resize",resize);
        let last=performance.now(),uiAcc=0;
        function frame(t){const dt=Math.min(Math.max(0,(t-last)/1000),.1);last=t;if(!document.hidden){if(!T.ui.isPaused())T.battle.update(dt*T.S.settings.speed,dt);T.battle.render();uiAcc+=dt;if(uiAcc>.15){uiAcc=0;T.ui.tick()}}else uiAcc=0;requestAnimationFrame(frame)}
        requestAnimationFrame(frame);
        document.addEventListener("pointerdown",()=>{T.audio.init();T.audio.resume()},{once:true,capture:true});
        document.addEventListener("keydown",e=>{const tag=(e.target.tagName||"").toLowerCase();if(tag==="input"||tag==="select"||tag==="textarea")return;if(e.key==="p"||e.key==="P"||e.key==="з"||e.key==="З"){T.audio.init();T.ui.setPaused(!T.ui.isPaused())}else if(e.key==="m"||e.key==="M"||e.key==="ь"||e.key==="Ь"){T.audio.init();T.S.settings.muted=!T.S.settings.muted;T.audio.setMuted(T.S.settings.muted);T.save();T.ui.tick()}else if(e.key==="h"||e.key==="H"||e.key==="р"||e.key==="Р"){T.audio.init();document.getElementById("helpBtn").click()}else if(e.key==="Escape"){const m=document.getElementById("modal");if(m.classList.contains("on"))document.querySelector("#modal .ghostBtn")?.click()}});
        setInterval(()=>T.save(),5000);
        addEventListener("beforeunload",T.save);
        addEventListener("pagehide",T.save);
        const away=(Date.now()-T.S.lastSeen)/1000;
        if(T.hadSave()&&away>BAL.offline.minSeconds){const reward=T.offlineReward(away);if(reward.gold>0||reward.gems>0||reward.items.length)T.ui.showOffline(reward.gold,reward.items,reward.seconds,reward.gems)}
        let hiddenAt=0;
        document.addEventListener("visibilitychange",()=>{if(document.hidden){hiddenAt=Date.now();T.save()}else if(hiddenAt){const sec=(Date.now()-hiddenAt)/1000;if(sec>BAL.offline.minSeconds){const reward=T.offlineReward(sec);if(reward.gold>0||reward.gems>0||reward.items.length)T.ui.showOffline(reward.gold,reward.items,reward.seconds,reward.gems)}hiddenAt=0}});
      })();
