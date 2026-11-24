(function(){
  const T=window.TBH,C=T.config,U=T.util,E=T.events,BAL=C.balance;
  const canvas=document.getElementById("stage"),ctx=canvas.getContext("2d");
  canvas.style.imageRendering="auto";
  const bx=T.bx={canvas,ctx,W:900,H:210,SC:4,dpr:1};
  bx.K=()=>bx.SC/4;
  bx.gy=()=>bx.H-15;
  bx.scaleOf=s=>s.img?(bx.SC*16)/s.h:bx.SC;
  bx.MELEE_ARC=84;
  const B=T.battleState=bx.B={monsters:[],projs:[],parts:[],texts:[],beams:[],hs:{},state:"inter",t:.3,next:1,spawnLeft:0,spawnT:0,spawnInt:1,bossWave:false,boss:null,bossT:0,waveKills:0,waveTotal:0,damageByHero:{},time:0,advance:0,shake:{t:0,d:1,m:0}};
  for(const h of C.heroes)B.hs[h.id]={id:h.id,def:h,x:80,cool:U.rand(.2,.8),lunge:0,home:80,hp:0,maxHp:0,dead:false,deadAge:0,deadX:null,hurt:0,healGlow:0,sk:{a1:U.rand(3,6),a2:U.rand(6,10),mom:0,sharp:0,arcane:0},buffs:{},castT:0,castIcon:"",walkOff:0};
  const ZC=bx.ZC={},REDUCED=bx.REDUCED=matchMedia("(prefers-reduced-motion: reduce)"),zoneRGBCache={},bgCache={};
  function zoneRGB(z){let c=zoneRGBCache[z.id];if(!c)c=zoneRGBCache[z.id]={sky1:U.hex2rgb(z.colors.sky1),sky2:U.hex2rgb(z.colors.sky2),h1:U.hex2rgb(z.colors.hill1),h2:U.hex2rgb(z.colors.hill2),gr:U.hex2rgb(z.colors.ground)};return c}
  bx.cropToCanvas=(im,r)=>{const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,sx=Math.round(r[0]*iw),sy=Math.round(r[1]*ih),sw=Math.max(2,Math.round(r[2]*iw)),sh=Math.max(2,Math.round(r[3]*ih)),c=document.createElement("canvas");c.width=sw;c.height=sh;const x=c.getContext("2d");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);return c};
  bx.zoneBg=z=>{if(!z||!z.bg||!z.bg.src)return null;let e=bgCache[z.id];if(!e){e=bgCache[z.id]={img:null};
    const set=(im,r)=>{e.img=r?bx.cropToCanvas(im,r):im};
    T.loadImage(z.bg.src).then(im=>set(im,z.bg.region)).catch(()=>{if(z.bg.fb)T.loadImage(z.bg.fb.src).then(im2=>set(im2,z.bg.fb.region)).catch(()=>{})});
  }return e.img};
  bx.setZoneInstant=()=>{const c=zoneRGB(T.waves.zoneFor(T.S?.wave||1).zone);ZC.sky1=[...c.sky1];ZC.sky2=[...c.sky2];ZC.h1=[...c.h1];ZC.h2=[...c.h2];ZC.gr=[...c.gr]};
  bx.lerpZone=dt=>{if(!ZC.sky1)bx.setZoneInstant();const c=zoneRGB(T.waves.zoneFor(T.S.wave).zone),t=1-Math.exp(-dt*1.4);ZC.sky1=U.mix(ZC.sky1,c.sky1,t);ZC.sky2=U.mix(ZC.sky2,c.sky2,t);ZC.h1=U.mix(ZC.h1,c.h1,t);ZC.h2=U.mix(ZC.h2,c.h2,t);ZC.gr=U.mix(ZC.gr,c.gr,t)};
  bx.stars=Array.from({length:54},()=>({x:Math.random(),y:Math.random()*.48,s:U.irand(1,2),ph:U.rand(6.28)}));
  bx.clouds=Array.from({length:4},(_,i)=>({x:U.rand(900),y:12+i*11,w:U.rand(45,95),spd:U.rand(4,10)}));
  bx.shake=(m,d)=>{if(REDUCED.matches)return;const S=B.shake;if(m>S.m||S.t<=0){S.m=m;S.d=d;S.t=d}};
  bx.float=(txt,x,y,color,big=false)=>{B.texts.push({txt,x,y,color,big,life:.9,max:.9});if(B.texts.length>48)B.texts.shift()};
  bx.burst=(x,y,color,n,spd=100)=>{for(let i=0;i<n;i++){const a=U.rand(6.28),v=U.rand(.3,1)*spd;B.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,g:170,life:U.rand(.3,.7),max:.7,color,s:U.rand(1.5,3.5)})}if(B.parts.length>420)B.parts.splice(0,B.parts.length-420)};
  bx.souls=(x,y)=>{for(let i=0;i<12;i++)B.parts.push({soul:true,x:x+U.rand(-10,10),y:y-U.rand(6,40),vx:U.rand(-14,14),vy:-U.rand(30,80),g:-40,life:U.rand(.6,1.3),max:1.3,color:i%3?"#cfe8ff":"#78ff7a",s:U.rand(2,4)});if(B.parts.length>420)B.parts.splice(0,B.parts.length-420)};
  bx.coins=(x,y,n)=>{for(let i=0;i<n;i++)B.parts.push({coin:true,x,y,vx:U.rand(-45,45),vy:-U.rand(80,150),g:230,life:.95,max:.95,color:"#ffd866",s:2.6})};
  bx.ring=(x,y,color,r=20)=>{B.parts.push({ring:true,x,y,life:.22,max:.22,color,s:r})};
  /* КОМПАКТНАЯ дуга взмаха: радиус ограничен сверху (40·k, у боссов 52·k),
     поэтому взмах читается как удар оружия, а не дуга на пол-поля */
  bx.slash=(x,y,dir,color,r,w)=>{
    const cap=(w>=5?52:40)*bx.K();
    r=U.clamp(Math.min(r||cap,cap),14*bx.K(),cap);
    B.parts.push({slash:true,x,y,dir,color,r,w:w||4,life:.26,max:.26});
    for(let i=0;i<3;i++){const a=U.rand(-0.8,0.8);B.parts.push({x:x+Math.cos(a)*r*dir*0.8,y:y+Math.sin(a)*r*0.8,vx:U.rand(-40,40)+dir*60,vy:U.rand(-60,20),g:220,life:U.rand(.18,.32),max:.32,color:i%2?"#ffffff":color,s:U.rand(1.5,2.5)})}
    if(B.parts.length>460)B.parts.splice(0,B.parts.length-460);
  };
  bx.shadow=(x,y,w)=>{ctx.save();ctx.fillStyle="rgba(0,0,0,.38)";ctx.beginPath();ctx.ellipse(x,y,Math.max(6,w),Math.max(3,w*.22),0,0,6.28);ctx.fill();ctx.restore()};
  bx.roundRect=(x,y,w,h,r)=>{r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()};
  bx.hpBar=(x,y,w,pct,boss)=>{const h=boss?8:5;
    ctx.save();
    ctx.fillStyle="rgba(0,0,0,.72)";bx.roundRect(x-w/2-1.5,y-1.5,w+3,h+3,3);ctx.fill();
    ctx.strokeStyle=boss?"rgba(255,77,98,.65)":"rgba(255,255,255,.20)";ctx.lineWidth=1;bx.roundRect(x-w/2-1.5,y-1.5,w+3,h+3,3);ctx.stroke();
    if(pct>0){const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);
      if(boss){g.addColorStop(0,"#ff4d62");g.addColorStop(1,"#ffd866")}
      else if(pct>.5){g.addColorStop(0,"#2fae5d");g.addColorStop(1,"#baff8a")}
      else if(pct>.25){g.addColorStop(0,"#c98a20");g.addColorStop(1,"#ffe08a")}
      else{g.addColorStop(0,"#c93a4a");g.addColorStop(1,"#ff9aaa")}
      ctx.fillStyle=g;bx.roundRect(x-w/2,y,w*pct,h,2);ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.25)";bx.roundRect(x-w/2,y,w*pct,Math.max(1,h*0.42),2);ctx.fill();}
    ctx.restore()};
  bx.castBubble=(x,y,icon,t)=>{const a=U.clamp(t/0.35,0,1);const pop=1+0.25*Math.max(0,(t-0.75)/0.25);
    ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.scale(pop,pop);
    ctx.fillStyle="rgba(18,12,28,.9)";ctx.beginPath();ctx.arc(0,0,9.5,0,6.28);ctx.fill();
    ctx.strokeStyle="rgba(255,216,102,.9)";ctx.lineWidth=1.5;ctx.shadowColor="rgba(255,216,102,.8)";ctx.shadowBlur=9;ctx.beginPath();ctx.arc(0,0,9.5,0,6.28);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle="#ffd866";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(icon,0,0.5);
    ctx.textBaseline="alphabetic";ctx.restore()};
  // Ranged heroes can engage any living enemy visible on the arena, regardless of canvas width.
  bx.visibleEnemy=m=>!!m&&!m.dead&&m.x>=0&&m.x<=bx.W-4*bx.K();
  bx.rangedTarget=()=>{let target=null;for(const m of B.monsters)if(bx.visibleEnemy(m)&&(!target||m.x<target.x))target=m;return target};
  bx.frontMonster=()=>{let f=null;for(const m of B.monsters)if(!m.dead&&(!f||m.x<f.x))f=m;return f};
  bx.nearestMonster=x=>{let f=null,bd=1e9;for(const m of B.monsters){if(m.dead)continue;const d=Math.abs(m.x-x);if(d<bd){bd=d;f=m}}return f};
  bx.livingHeroes=()=>T.partyDefs().filter(h=>!B.hs[h.id].dead);
  bx.frontHero=()=>{const barbarian=B.hs.barbarian;if(barbarian&&!barbarian.dead&&T.inParty("barbarian")&&barbarian.buffs?.taunt>0)return barbarian;let f=null;for(const h of bx.livingHeroes()){const rt=B.hs[h.id];if(!f||rt.x>f.x)f=rt}return f};
  bx.banner=(txt,cls)=>E.emit("banner",{txt,cls:cls||""});
  bx.syncHeroHp=()=>{for(const hd of C.heroes){const hs=T.S.heroes[hd.id],h=B.hs[hd.id];if(!hs?.rec||!T.inParty(hd.id))continue;const st=T.derived.heroStats(hd.id),oldMax=h.maxHp||st.maxHp;h.maxHp=st.maxHp;if(h.dead)continue;if(h.hp<=0)h.hp=st.maxHp;else h.hp=Math.min(st.maxHp,h.hp+Math.max(0,st.maxHp-oldMax))}};
  bx.heroPassiveDmgMult=(h,hd)=>{if(!h||!hd)return 1;let m=1;
    if(hd.id==="paladin"&&h.hp<h.maxHp*0.30)m*=0.70;
    if(hd.id==="barbarian"){m*=0.82;if(h.hp<h.maxHp*0.40)m*=0.82}
    if(h.buffs?.shieldT>0)m*=0.55;
    return m};
  bx.bossEvade=m=>!(!m?.boss||(m.def.mechanic||m.def.id)!=="shadow_king")&&Math.random()<0.30;
  bx.bossArmorMult=m=>{if(!m?.boss)return 1;if(m.buffs?.campaignGuard>0)return .65;if((m.def.mechanic||m.def.id)==="crystal_titan")return m.buffs?.crystalShell>0?0.60:0.75;return 1};
  bx.applyIncomingHit=(h,rawDamage,color,source={})=>{
    if(h.dead||h.buffs?.reviveGrace>0)return;
    const st=T.derived.heroStats(h.id),isBoss=!!source.boss;
    let raw=Math.max(1,Math.ceil(rawDamage*(1-st.defPct/100)));
    raw=Math.ceil(raw*bx.heroPassiveDmgMult(h,h.def));
    const sourceBossId=source.def?.mechanic||source.def?.id||source.bossId;
    if(isBoss&&sourceBossId==="shadow_king"&&h.buffs?.shadowMark>0)raw=Math.ceil(raw*1.18);
    if(isBoss&&h.buffs?.bossMark>0)raw=Math.ceil(raw*1.15);
    const cap=Math.ceil(h.maxHp*(isBoss?BAL.combat.bossHitCapPct:BAL.combat.normalHitCapPct));
    const dmg=Math.max(1,Math.min(raw,cap));
    h.hp-=dmg;h.hurt=.2;
    if(h.def.id==="monk")h.sk.mom=0;
    const s=T.getSprite(h.def,"hero")[0],sc=bx.scaleOf(s);
    bx.float("-"+U.fmt(dmg),h.x,bx.gy()-s.h*sc-10,color||"#ff4d62");
    bx.burst(h.x,bx.gy()-s.h*sc*.5,color||"#ff4d62",6,80);bx.shake(1.5,.12);E.emit("sfx","heroHit");
    if(h.hp<=0)bx.killHero(h);
  };
  bx.applyBossHit=(h,dmg,color,source)=>bx.applyIncomingHit(h,dmg,color,{boss:true,...(source||{})});
  bx.hitHero=(h,m)=>bx.applyIncomingHit(h,m.dmg,"#ff4d62",m);
  bx.killHero=h=>{
    const necro=B.hs.necro;
    // Necromancer's passive is a one-use rescue per wave: the first fallen ally returns at half HP.
    if(!B.necroReviveUsed&&necro&&necro!==h&&!necro.dead&&T.inParty("necro")&&T.inParty(h.id)){
      B.necroReviveUsed=true;h.hp=Math.max(1,Math.ceil((h.maxHp||T.derived.heroStats(h.id).maxHp)*0.50));h.dead=false;h.deadAge=0;h.deadX=null;h.hurt=0;h.healGlow=1;h.buffs=h.buffs||{};h.buffs.reviveGrace=.75;
      bx.burst(h.x,bx.gy()-24*bx.K(),"#78ff7a",22,150);bx.souls(h.x,bx.gy()-10*bx.K());bx.ring(h.x,bx.gy()-20*bx.K(),"#b06cff",38*bx.K());
      bx.float("☠ ВОСКРЕШЕНИЕ · 50% HP",h.x,bx.gy()-58*bx.K(),"#a8ff9b",true);E.emit("sfx","necroRevive");E.emit("toast",{msg:`Некромант воскресил ${h.def.name}!`,type:"success"});E.emit("damageStats");return true;
    }
    h.hp=0;h.dead=true;h.deadAge=0;h.deadX=h.x;
    bx.burst(h.x,bx.gy()-24*bx.K(),"#ff4d62",18,120);bx.souls(h.x,bx.gy()-10*bx.K());bx.ring(h.x,bx.gy()-20*bx.K(),"#ff4d62",26*bx.K());
    bx.float("💀 погиб",h.x,bx.gy()-52*bx.K(),"#ff9aaa",true);
    E.emit("sfx","death");bx.shake(3,.25);return false;
  };
  bx.mostInjuredExcept=exId=>{let best=null,bestRatio=1;for(const hd of T.partyDefs()){if(hd.id===exId)continue;const h=B.hs[hd.id];if(h.dead||h.maxHp<=0)continue;const ratio=h.hp/h.maxHp;if(ratio<bestRatio-.001){bestRatio=ratio;best=h}}return bestRatio<.999?best:null};
  bx.applyHeal=(h,amount,crit,sourceHeroId,quiet=false)=>{if(h.dead)return;const before=h.hp,boost=sourceHeroId==="druid"?1.20:1;h.hp=Math.min(h.maxHp,h.hp+amount*boost*(h.buffs?.bossHealCut>0?.65:1));const real=h.hp-before;h.healGlow=.3;const s=T.getSprite(h.def,"hero")[0],sc=bx.scaleOf(s);bx.float("+"+U.fmt(real),h.x,bx.gy()-s.h*sc-10,"#78ff7a",crit);bx.healFx(h,sourceHeroId||h.id);if(!quiet)E.emit("sfx",{name:"heroHeal",arg:{id:sourceHeroId,crit}})};
  bx.resize=()=>{const wrap=document.getElementById("stageWrap");bx.W=Math.max(280,wrap.clientWidth);bx.H=Math.max(120,wrap.clientHeight);bx.dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(bx.W*bx.dpr);canvas.height=Math.round(bx.H*bx.dpr);canvas.style.imageRendering="auto";bx.SC=bx.W<700?3:bx.W<1100?4:5};
})();