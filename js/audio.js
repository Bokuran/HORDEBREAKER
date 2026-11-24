/* Оригинальные музыкальные и SFX-сэмплы через WebAudio; встроенный синтез — резервный режим.
   Громкости раздельные (master/music/sfx), сохраняются в settings.vol. */
(function(){
  const T=window.TBH,E=T.events;
  let AC=null,master=null,sfxBus=null,musBus=null,muted=false,timer=null,nextT=0,step=0,nbuf=null;
  let musicSource=null,musicLoading=false,musicBuffer=null,musicFileFailed=false;
  const liveVoices=new Set(),lastPlayed=new Map();
  const isForeground=()=>!document.hidden&&(typeof document.hasFocus!=="function"||document.hasFocus());
  let foreground=isForeground();
  function stopVoices(){
    for(const voice of liveVoices){try{voice.stop(0)}catch(e){}}
    liveVoices.clear();musicSource=null;
  }
  function setForeground(active){
    const next=!!active&&isForeground();
    if(foreground===next)return;
    foreground=next;
    if(!AC)return;
    if(!next){
      if(timer){clearInterval(timer);timer=null}
      stopVoices();
      nextT=AC.currentTime+0.2;
      apply();
      if(AC.state==="running")AC.suspend().catch(()=>{});
    }else{
      const ready=()=>{if(!foreground||!isForeground())return;nextT=AC.currentTime+0.18;step=step%128;if(!timer)timer=setInterval(sched,100);startMusicFile();apply()};
      if(AC.state==="suspended")AC.resume().then(ready).catch(()=>{});
      else ready();
    }
  }
  document.addEventListener("visibilitychange",()=>setForeground(isForeground()));
  window.addEventListener("blur",()=>setForeground(false));
  window.addEventListener("focus",()=>setForeground(isForeground()));
  const sampleBuffers={},sampleLoading={};
  const sampleFiles={
    click:"sfx_click.ogg",swing:"sfx_swing.ogg",hit:"sfx_hit.ogg",crit:"sfx_crit.ogg",heroHit:"sfx_hero_hit.ogg",
    heal:"sfx_heal.ogg",coin:"sfx_coin.ogg",sell:"sfx_coin.ogg",death:"sfx_death.ogg",boss:"sfx_boss.ogg",
    bossdie:"sfx_bossdie.ogg",wave:"sfx_wave.ogg",fire:"sfx_fire.ogg",arrow:"sfx_arrow.ogg",hammer:"sfx_hammer.ogg",
    boom:"sfx_boom.ogg",equip:"sfx_equip.ogg",lvl:"sfx_lvl.ogg",recruit:"sfx_recruit.ogg",chest:"sfx_chest.ogg",
    fail:"sfx_fail.ogg",drop:"sfx_drop.ogg"
  };
  const DEF={master:0.85,music:0.65,sfx:0.6};
  let vol=Object.assign({},DEF,(T.S&&T.S.settings&&T.S.settings.vol)||{});
  function apply(){
    if(!AC)return;
    master.gain.setTargetAtTime(muted||!foreground||!isForeground()?0:vol.master,AC.currentTime,0.03);
    musBus.gain.setTargetAtTime(vol.music*(musicSource?1:1.35),AC.currentTime,0.05);
    sfxBus.gain.setTargetAtTime(vol.sfx,AC.currentTime,0.05);
  }
  function init(){
    if(AC)return;
    const Ctor=window.AudioContext||window.webkitAudioContext;if(!Ctor)return;
    AC=new Ctor();
    master=AC.createGain();master.connect(AC.destination);
    sfxBus=AC.createGain();sfxBus.connect(master);
    musBus=AC.createGain();musBus.connect(master);
    vol=Object.assign({},DEF,(T.S&&T.S.settings&&T.S.settings.vol)||{});
    muted=!!(T.S&&T.S.settings&&T.S.settings.muted);
    apply();
    foreground=isForeground();nextT=AC.currentTime+0.18;step=0;
    preloadSamples();
    // The bundled soundtrack plays reliably after the user's first gesture.
    // Keep the adaptive synthesizer as a fallback for unsupported audio codecs.
    if(foreground){timer=setInterval(sched,100);startMusicFile()}
    else AC.suspend().catch(()=>{});
  }
  function resume(){if(!AC||!isForeground())return;if(!foreground)setForeground(true);else if(AC.state==="suspended")AC.resume().catch(()=>{})}
  function setMuted(m){const wasMuted=muted;muted=!!m;if(muted)stopVoices();
    if(wasMuted&&!muted&&AC){nextT=AC.currentTime+0.18;if(foreground&&isForeground())startMusicFile()}
    if(T.S&&T.S.settings)T.S.settings.muted=muted;apply()}
  function setVolumes(part){
    vol=Object.assign({},vol,part||{});
    for(const k of["master","music","sfx"])vol[k]=Math.max(0,Math.min(1,+vol[k]||0));
    if(T.S&&T.S.settings){T.S.settings.vol=Object.assign({},vol);if(T.save)T.save()}
    apply();
  }
  function getVolumes(){return Object.assign({},vol)}
  const now=()=>AC.currentTime;
  function tone(type,f0,f1,t,dur,peak,dest){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type=type;o.frequency.setValueAtTime(Math.max(1,f0),t);
    if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(dest||sfxBus);o.onended=()=>liveVoices.delete(o);
    liveVoices.add(o);o.start(t);o.stop(t+dur+0.05);
  }
  function noiseBuf(){
    if(nbuf)return nbuf;
    const len=Math.floor(AC.sampleRate*1);const b=AC.createBuffer(1,len,AC.sampleRate);const d=b.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    nbuf=b;return b;
  }
  function noise(t,dur,peak,type,f0,f1,q,dest){
    const s=AC.createBufferSource();s.buffer=noiseBuf();s.loop=true;
    const f=AC.createBiquadFilter();f.type=type||"bandpass";f.frequency.setValueAtTime(Math.max(20,f0||1200),t);
    if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    f.Q.value=q||1;
    const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(dest||sfxBus);s.onended=()=>liveVoices.delete(s);
    liveVoices.add(s);s.start(t);s.stop(t+dur+0.05);
  }
  const SFX={
    click(){tone("square",900,600,now(),0.06,0.10)},
    swing(){noise(now(),0.13,0.22,"bandpass",2600,500,1.4)},
    hit(){noise(now(),0.10,0.32,"lowpass",900,200,0.8);tone("triangle",180,60,now(),0.12,0.28)},
    crit(){noise(now(),0.12,0.36,"highpass",1800,4000,1);tone("square",520,140,now(),0.14,0.22);tone("sine",1200,300,now(),0.10,0.14)},
    heroHit(){tone("sawtooth",220,70,now(),0.16,0.22);noise(now(),0.10,0.18,"lowpass",700,150,1)},
    heal(){tone("sine",660,990,now(),0.18,0.14);tone("sine",990,1320,now()+0.08,0.16,0.10)},
    coin(){tone("sine",1320,1320,now(),0.07,0.12);tone("sine",1760,1760,now()+0.07,0.09,0.10)},
    death(){tone("sawtooth",300,40,now(),0.5,0.26);noise(now(),0.4,0.22,"lowpass",1200,100,1)},
    boss(){tone("sawtooth",70,45,now(),0.8,0.34);noise(now(),0.7,0.26,"lowpass",400,80,1);tone("square",140,60,now()+0.1,0.5,0.16)},
    bossdie(){noise(now(),0.7,0.42,"lowpass",2000,60,1);tone("sawtooth",160,30,now(),0.8,0.34);tone("sine",880,220,now()+0.1,0.5,0.16)},
    wave(){[523,659,784,1046].forEach((f,i)=>tone("triangle",f,f,now()+i*0.09,0.16,0.14))},
    fire(){noise(now(),0.25,0.26,"bandpass",600,2400,1.2);tone("sawtooth",120,60,now(),0.2,0.12)},
    arrow(){noise(now(),0.09,0.20,"highpass",3000,6000,1)},
    hammer(){tone("square",300,120,now(),0.1,0.16);noise(now(),0.08,0.16,"lowpass",1200,300,1)},
    boom(){noise(now(),0.4,0.40,"lowpass",1500,60,1);tone("sine",90,30,now(),0.4,0.34)},
    equip(){tone("square",700,900,now(),0.06,0.10);tone("square",1100,1400,now()+0.06,0.06,0.08)},
    sell(){SFX.coin()},
    lvl(){[440,554,659,880].forEach((f,i)=>tone("triangle",f,f,now()+i*0.07,0.14,0.13))},
    recruit(){[392,523,659,784].forEach((f,i)=>tone("triangle",f,f,now()+i*0.08,0.18,0.14))},
    chest(){[1046,1318,1568,2093].forEach((f,i)=>tone("sine",f,f,now()+i*0.06,0.12,0.10))},
    fail(){[330,262,208,165].forEach((f,i)=>tone("sawtooth",f,f*0.98,now()+i*0.12,0.2,0.15))},
    // Eight distinguishable attack signatures, rendered live for responsive feedback.
    paladin(){const t=now();tone("triangle",440,260,t,.19,.17);tone("sine",880,580,t+.025,.14,.10)},
    archer(){const t=now();noise(t,.075,.12,"highpass",3400,5600,1.5);tone("sine",920,630,t,.10,.08)},
    mage(){const t=now();noise(t,.20,.15,"bandpass",450,2200,1.4);tone("sawtooth",260,640,t,.18,.10)},
    monk(){const t=now();tone("square",380,210,t,.085,.12);noise(t,.075,.11,"highpass",1600,3200,1.2)},
    rogue(){const t=now();noise(t,.12,.10,"highpass",2300,800,1.4);tone("triangle",540,190,t,.13,.09)},
    necro(){const t=now();tone("sine",230,90,t,.23,.14);tone("triangle",410,170,t+.055,.18,.07)},
    barbarian(){const t=now();noise(t,0.20,0.24,"lowpass",420,90,1.1);tone("sawtooth",112,58,t,0.28,0.22);tone("triangle",78,48,t+0.05,0.24,0.18)},
    druid(){const t=now();tone("sine",523,784,t,0.22,0.12);tone("sine",659,987,t+0.07,0.24,0.10);tone("triangle",1046,1318,t+0.14,0.18,0.07)},
    necroRevive(){const t=now();tone("sawtooth",165,330,t,0.38,0.16);tone("sine",220,660,t+0.08,0.48,0.12);tone("sine",880,1320,t+0.30,0.25,0.08);noise(t+0.02,0.28,0.09,"bandpass",700,1600,1.4)},
    heroAttack(arg){const id=arg?.id||"paladin";(SFX[id]||SFX.hit)();if(arg?.crit)tone("sine",1110,540,now(),.105,.055)},
    heroHeal(arg){const t=now();if(arg?.id==="druid"){SFX.druid();tone("sine",1174,1568,t+.09,.17,.06)}
      else if(arg?.id==="necro"){SFX.necro();tone("sine",523,784,t+.04,.17,.10)}
      else SFX.heal()},
    heroSkill(arg){const id=arg?.id||"paladin",t=now();
      const signature={paladin:[523,784],archer:[880,1174],mage:[392,784],monk:[659,988],
        rogue:[466,622],necro:[330,494],barbarian:[196,294],druid:[587,880]}[id]||[440,660];
      const inverted=arg?.slot==="a2";
      tone(inverted?"sawtooth":"triangle",signature[0],signature[1],t,.24,.085);
      tone("sine",signature[1],signature[1]*(inverted?.74:1.26),t+.07,.24,.065)},
    drop(arg){const r=arg&&arg.rarity;const base=r==="legendary"?880:r==="epic"?740:r==="rare"?620:520;
      tone("triangle",base,base*1.5,now(),0.14,0.14);tone("triangle",base*1.5,base*2,now()+0.1,0.14,0.12)}
  };
  async function decodeAsset(path){
    const response=await fetch("assets/audio/"+path,{cache:"force-cache"});
    if(!response.ok)throw new Error("audio asset "+path+" "+response.status);
    return AC.decodeAudioData(await response.arrayBuffer());
  }
  function preloadSamples(){
    for(const [name,path] of Object.entries(sampleFiles)){
      if(sampleBuffers[name]||sampleLoading[name])continue;
      sampleLoading[name]=decodeAsset(path).then(buffer=>{sampleBuffers[name]=buffer;return buffer})
        .catch(err=>{console.warn("SFX fallback:",name,err);return null});
    }
  }
  // Music is the bundled original theme, with zone-dependent playback colors.
  // The on-the-fly composition in sched() remains a backup if an OGG decoder
  // isn't available. Never play two scores simultaneously.
  const zoneTempo={city:.95,gate:.98,forest:1,waste:.97,mountains:1.01,peaks:.95,elfwood:.92,elfcity:.94,deepwood:.88,highlands:1.02,dwarf:1.04,mines:.92,crystal:.94,marsh:.86,cursed:.89,ruins:.90,volcano:1.08,hellcanyon:1.06,fortress:1.1,citadel:1.12};
  function startMusicFile(){
    if(!AC||musicSource||musicLoading||musicFileFailed||muted||!foreground||!isForeground())return;
    const playBuffer=()=>{
      if(!musicBuffer||!AC||muted||!foreground||!isForeground()||musicSource)return;
      const source=AC.createBufferSource(),gain=AC.createGain();
      source.buffer=musicBuffer;source.loop=true;
      const zone=T.waves?.zoneFor?.(T.S?.wave||1)?.zone?.id||"forest";
      source.playbackRate.value=zoneTempo[zone]||1;
      const t=AC.currentTime;
      gain.gain.setValueAtTime(.0001,t);
      gain.gain.exponentialRampToValueAtTime(.9,t+.5);
      source.connect(gain);gain.connect(musBus);
      source.onended=()=>{liveVoices.delete(source);if(musicSource===source)musicSource=null};
      musicSource=source;liveVoices.add(source);
      source.start(t+.02);
      apply();
    };
    if(musicBuffer){playBuffer();return}
    musicLoading=true;
    decodeAsset("main_theme.ogg").then(buffer=>{
      musicBuffer=buffer;
      playBuffer();
    }).catch(err=>{
      musicFileFailed=true;
      console.warn("Bundled music unavailable; continuing with adaptive synthesizer:",err);
      apply();
    }).finally(()=>{musicLoading=false});
  }
  function play(name,arg){
    if(!AC||muted||!foreground||!isForeground()||AC.state!=="running")return;
    // Sound events are never queued. Rapid repeated rewards/combat events are
    // throttled rather than overlapping into a harsh loud transient.
    const keyId=name==="heroAttack"||name==="heroSkill"?name+":"+arg?.id:name;
    const elapsed=AC.currentTime-(lastPlayed.get(keyId)??-100);
    const cooldown=name==="coin"?.14:name==="heroAttack"?.07:name==="drop"?.10:name==="heroSkill"?.12:.025;
    if(elapsed<cooldown)return;lastPlayed.set(keyId,AC.currentTime);
    const key=sampleFiles[name]?name:null,buffer=key&&sampleBuffers[key];
    if(buffer){
      const source=AC.createBufferSource();source.buffer=buffer;
      if(name==="drop"&&arg&&arg.rarity){source.playbackRate.value=arg.rarity==="legendary"?1.28:arg.rarity==="epic"?1.14:arg.rarity==="rare"?1.06:1}
      source.onended=()=>liveVoices.delete(source);liveVoices.add(source);
      source.connect(sfxBus);source.start();return;
    }
    const f=SFX[name];if(f)f(arg);
  }
  E.on("sfx",d=>{if(typeof d==="string")play(d);else if(d&&d.name)play(d.name,d.arg)});
  // Original 128-step adaptive dark-fantasy score. Zone roots change its mood.
  // We schedule only a few steps ahead, discard missed beats, and use tiny voice gains.
  const BPM=96,SPB=60/BPM/2;
  const SCALE=[0,3,5,7,10,12,15,17,19,22],CHORDS=[0,5,3,7,0,8,5,3];
  const LEAD=[7,null,10,null,12,null,10,null,7,5,null,3,5,null,7,null,
    10,null,12,15,null,12,10,null,7,null,5,null,3,5,null,null];
  const mnote=(root,semi)=>root*Math.pow(2,semi/12);
  function sched(){
    if(!AC||muted||!foreground||!isForeground()||AC.state!=="running")return;
    if(musicSource){
      const zone=T.waves?.zoneFor?.(T.S?.wave||1)?.zone?.id||"forest";
      musicSource.playbackRate.value=zoneTempo[zone]||1;
      return;
    }
    if(nextT<AC.currentTime-0.08)nextT=AC.currentTime+0.12;
    let scheduled=0;
    while(nextT<AC.currentTime+0.23&&scheduled++<4){
      const s=step,t=nextT;
      const zone=T.waves?.zoneFor?.(T.S?.wave||1)?.zone;
      const root=(zone?.musicRoot||110)*0.5;
      const chord=CHORDS[Math.floor(s/16)%CHORDS.length];
      if(s%4===0){
        tone("triangle",mnote(root,chord),mnote(root,chord),t,SPB*3.4,.058,musBus);
        tone("sine",mnote(root/2,chord),mnote(root/2,chord),t,SPB*3.4,.056,musBus);
      }
      if(s%8===0)tone("sine",108,43,t,.15,.09,musBus);
      if(s%8===4)noise(t,.075,.045,"lowpass",900,150,0.8,musBus);
      if(s%2===1)noise(t,.025,.016,"highpass",6000,7500,1.0,musBus);
      if(s%16===0){
        tone("sine",mnote(root,chord+12),mnote(root,chord+12),t,SPB*7.8,.028,musBus);
        tone("triangle",mnote(root,chord+19),mnote(root,chord+19),t,SPB*7.8,.019,musBus);
      }
      const lead=LEAD[s%32];
      if(lead!=null&&Math.floor(s/32)%2===1){
        tone("triangle",mnote(root,lead+chord),mnote(root,lead+chord),t,SPB*1.1,.045,musBus);
      }
      if(s%4===2){
        const arpeggio=SCALE[(Math.floor(s/4)+Math.floor(s/16))%SCALE.length];
        tone("sine",mnote(root,chord+arpeggio+12),mnote(root,chord+arpeggio+12),t,SPB*1.2,.017,musBus);
      }
      step=(step+1)%128;nextT+=SPB;
    }
  }
  T.audio={init,resume,setMuted,setVolumes,getVolumes,play,setForeground,isForeground,get muted(){return muted}};
})();