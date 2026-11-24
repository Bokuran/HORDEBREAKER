(function(){
  const T=window.TBH,C=T.config,U=T.util,E=T.events,BAL=C.balance;
  const bx=T.bx,B=bx.B,ctx=bx.ctx;
  const K=bx.K,gy=bx.gy,ARC=()=>bx.MELEE_ARC*K();
  const WALK=55;          // скорость шага вперёд
  const INTER=5;
  B.travel=B.travel||0;B.cameraMoving=false;B.combatUntil=0;
  function modelHalf(def,kind,bossMult){const s=T.getSprite(def,kind)[0];return s.w*bx.scaleOf(s)*(bossMult||1)/2}
  // Both fighters use the same body spacing, including the enemy's lane offset.
  function contactGap(heroDef,m){return modelHalf(heroDef,"hero")+modelHalf(m.def,"mob",m.boss?1.3:1)+(8+(m.slot||0)%3*2)*K()}
  const Battle=T.battle={
    init(){bx.setZoneInstant();bx.syncHeroHp()},
    resize:bx.resize,
    startWave(w,opt={}){const S=T.S,prevZone=T.waves.zoneFor(S.wave).zone.id;S.wave=w;B.necroReviveUsed=false;B.monsters=[];B.projs=[];B.beams=[];B.boss=null;B.bossWave=T.waves.isBoss(w);B.waveTotal=T.waves.count(w);B.spawnLeft=B.waveTotal;B.waveKills=0;B.damageByHero={};E.emit("damageStats");B.spawnInt=T.waves.spawnInt(w);B.spawnT=.35;B.state="fight";B.bossT=BAL.boss.timer;
      for(const hd of C.heroes){const hs=S.heroes[hd.id],h=B.hs[hd.id];if(!hs?.rec||!T.inParty(hd.id))continue;const wasDead=h.dead;const st=T.derived.heroStats(hd.id);h.maxHp=st.maxHp;h.hp=st.maxHp;h.dead=false;h.deadAge=0;h.deadX=null;h.hurt=0;h.healGlow=0;h.cool=U.rand(.1,.6);
        // НЕ телепортируем: сохраняем текущее смещение, возвращение/выход продолжаются плавно
        h.walkOff=wasDead?0:(h.walkOff||0);h.x=h.home+h.walkOff;
        // Перезарядки и накопленные пассивки — часть непрерывного боя.
        // Между волнами не сбрасываем готовые навыки и короткие боевые усиления.
        h.sk=h.sk||{a1:U.rand(4,8),a2:U.rand(8,14),mom:0,sharp:0,arcane:0};
        h.sk.a1=Number.isFinite(h.sk.a1)?h.sk.a1:U.rand(4,8);
        h.sk.a2=Number.isFinite(h.sk.a2)?h.sk.a2:U.rand(8,14);
        h.buffs=h.buffs||{};h.castT=0}
      const z=T.waves.zoneFor(w);bx.zoneBg(z.zone);if(B.bossWave)bx.banner("👑 "+T.waves.bossDef(w).name,"boss");else if(!opt.silent)bx.banner("ВОЛНА "+w);if(z.zone.id!==prevZone)E.emit("toast",{msg:`${z.zone.icon||"🗺"} Новая зона: ${z.zone.name}`,type:"info"});E.emit("wave",{wave:w,boss:B.bossWave})},
    update(dt,realDt=dt){const S=T.S;B.time+=dt;S.stats.play+=Math.max(0,Number(realDt)||0);if(B.state==="inter"){B.t-=dt;if(B.t<=0)Battle.startWave(B.next)}else{if(B.spawnLeft>0){B.spawnT-=dt;if(B.spawnT<=0){Battle.spawn(B.bossWave);B.spawnLeft--;B.spawnT=B.spawnInt}}if(B.bossWave&&B.boss&&!B.boss.dead){B.bossT-=dt;if(B.bossT<=0){Battle.retreat("⏱ Босс не повержен за "+BAL.boss.timer+"с!","БОСС ВЫСТОЯЛ");return}}if(B.spawnLeft===0&&B.monsters.every(m=>m.dead))Battle.clearWave()}
      const k=K(),F=T.formation(),n=F.length,STEP=44*k;
      // Walking is a distinct camera phase: once heroes reach their on-screen
      // formation position they walk in place while the scenery travels.
      // Never use change in hero.x as the camera's sole travel signal.
      const rangedTarget=()=>bx.rangedTarget();
      // Начальный строй учитывает ширину спрайтов. После боя сохраняем
      // продвижение: отряд идёт дальше, а пейзаж движется влево.
      const leftClearance=F.length?Math.max(...F.map(hd=>modelHalf(hd,"hero"))):0;
      const baseX=leftClearance+8*k;
      const homeBase=i=>baseX+(n-1-i)*STEP;
      const meleeIds=F.filter(h=>h.range==="melee"&&!B.hs[h.id].dead).map(h=>h.id);
      const fm=bx.frontMonster();
      const maxA=Math.max(0,bx.W*0.5-homeBase(0));
      // Melee attacks and ranged projectiles use a finite engagement distance.
      // Once an enemy enters that zone, stop the camera immediately, including
      // when the hero is already stationary in the middle of the screen.
      const closeCombat=!!fm&&F.some(hd=>{
        const h=B.hs[hd.id];if(h.dead)return false;
        const half=modelHalf(hd,"hero")+modelHalf(fm.def,"mob",fm.boss?1.3:1);
        return hd.range==="melee"?fm.x-h.x<=half+22*k:!!rangedTarget();
      });
      if(closeCombat||B.projs.length||F.some(hd=>B.hs[hd.id].lunge>.08||B.hs[hd.id].castT>.08)){
        B.combatUntil=Math.max(B.combatUntil||0,B.time+.55);
      }
      const combatLocked=closeCombat||B.time<(B.combatUntil||0);
      const living=F.some(hd=>!B.hs[hd.id].dead);
      const marching=!combatLocked&&living&&(B.state==="inter"||(B.state==="fight"&&(B.spawnLeft>0||!!fm)));
      const march=150*k;
      if(marching)B.advance=Math.min(maxA,B.advance+march*dt);
      for(const m of B.monsters){if(m.dead){m.deathT-=dt;continue}
        m.flash=Math.max(0,m.flash-dt);m.lunge=Math.max(0,m.lunge-dt*4);m.castT=Math.max(0,(m.castT||0)-dt);
        if(m.buffs)for(const kk of Object.keys(m.buffs))if(typeof m.buffs[kk]==="number"){m.buffs[kk]-=dt;if(m.buffs[kk]<=0)delete m.buffs[kk]}
        // Скорость каждый кадр рассчитывается от неизменной базы: замедление и ярость
        // могут действовать одновременно и не перезаписывают друг друга.
        if(!Number.isFinite(m.baseSpd))m.baseSpd=m.spd;
        const chilled=m.buffs?.chilled>0,raging=m.boss&&m.buffs?.rage>0;
        m.spd=m.baseSpd*(chilled?0.45:1)*(raging?1.3:1);
        if(m.boss)m.atkMult=raging?1.35:1;
        if(m.boss&&m.x<=bx.W-12*k)bx.bossSkillTick(m,dt);
        const target=bx.frontHero();if(!target)continue;
        const stopDist=contactGap(target.def,m);
        const desired=target.x+stopDist;
        // Clamp the approach at contact. A fixed center-to-center range can be
        // smaller than a wide sprite and cause repeated penetration/pushback.
        if(m.x>desired+2)m.x=Math.max(desired,m.x-m.spd*dt);
        else{m.x=desired;
          m.atkT-=dt;
          const dist=Math.abs(target.x-m.x);
          if(m.atkT<=0&&dist<=stopDist+6*k){m.atkT=m.boss?BAL.combat.bossAtkInt:BAL.combat.monsterAtkInt;m.lunge=1;const atkM=m.atkMult||1;
            bx.slash(m.x-14*k,gy()-28*k,-1,m.boss?"#ff4d62":(m.def.color||"#f2eadb"),U.clamp(dist,20*k,ARC()),m.boss?5:3);
            bx.hitHero(target,{...m,dmg:Math.ceil(m.dmg*atkM)})}}}
      B.monsters=B.monsters.filter(m=>!m.dead||m.deathT>0);if(n&&bx.livingHeroes().length===0){Battle.retreat("💀 Отряд полностью пал!","ОТРЯД ПАЛ");return}
      for(const hd of C.heroes){const hs=S.heroes[hd.id];if(!hs?.rec||!T.inParty(hd.id))continue;const fi=F.findIndex(x=>x.id===hd.id);if(fi<0)continue;const h=B.hs[hd.id];h.lunge=Math.max(0,h.lunge-dt*5);h.hurt=Math.max(0,h.hurt-dt);h.healGlow=Math.max(0,h.healGlow-dt);h.castT=Math.max(0,(h.castT||0)-dt);h.home=homeBase(fi)+B.advance;
        h.levelUpT=Math.max(0,(h.levelUpT||0)-Math.max(0,realDt));
        if(h.dead){h.deadAge=(h.deadAge||0)+dt;continue}
        const st=T.derived.heroStats(hd.id);h.maxHp=st.maxHp;h.hp=Math.min(h.maxHp,h.hp+st.regen*dt);
        bx.heroSkillTick(hd,h,dt,st);
        if(h.dead)continue;
        if(hd.role==="healer"){
          h.x=Math.min(h.home,bx.W-modelHalf(hd,"hero")-10*k);h.walkOff=0;
          h.cool-=dt;
          if(h.cool<=0){
            // Do not spend every attack on tiny HP deficits or redundant heals already in flight.
            const ally=bx.livingHeroes().map(d=>B.hs[d.id]).filter(a=>a.maxHp>0).map(a=>({a,missing:a.maxHp-a.hp-B.projs.filter(p=>!p.done&&p.type==="heal"&&p.targetHero===a).reduce((n,p)=>n+p.amount*(p.heroId==="druid"?1.2:1),0)})).filter(o=>o.missing>=o.a.maxHp*.06).sort((a,b)=>b.missing/b.a.maxHp-a.missing/a.a.maxHp)[0]?.a;
            const enemy=rangedTarget();
            if(ally){h.cool=1/st.speed;h.lunge=1;const crit=Math.random()*100<st.crit,amount=st.dmg*(crit?st.critDmg/100:1)*(h.buffs?.arcane?1.5:1),spr=T.getSprite(hd,"hero")[0],sc=bx.scaleOf(spr);B.projs.push({type:"heal",x:h.x+10*k,y:gy()-spr.h*sc*.6,targetHero:ally,amount,crit,color:hd.projColor||"#78ff7a",heroId:hd.id,done:false});if(h.buffs?.arcane)delete h.buffs.arcane}
            else if(enemy){h.cool=1/st.speed;h.lunge=1;const crit=Math.random()*100<st.crit,dmg=st.dmg*(crit?st.critDmg/100:1)*(h.buffs?.arcane?1.5:1),spr=T.getSprite(hd,"hero")[0],sc=bx.scaleOf(spr);B.projs.push({x:h.x+12*k,y:gy()-spr.h*sc*.58,type:hd.projectile||"orb",color:hd.projColor||"#78ff7a",target:enemy,dmg,crit,splash:hd.splash||0,heroId:hd.id,done:false});E.emit("sfx",{name:"heroAttack",arg:{id:hd.id,crit}});if(h.buffs?.arcane)delete h.buffs.arcane}
          }
        }
        else{
          const target=hd.range==="melee"?(bx.nearestMonster(h.x)||bx.frontMonster()):rangedTarget();
          let reach=ARC();
          if(hd.range==="melee"){
            const i=Math.max(0,meleeIds.indexOf(hd.id));
            const halves=target?(modelHalf(hd,"hero")+modelHalf(target.def,"mob",target.boss?1.3:1)):0;
            const bodyGap=target?contactGap(hd,target):8*k;
            const lane=i*(STEP+12*k);
            const desiredX=target?target.x-bodyGap-lane:h.home;
            // The camera does not follow heroes: stop chasing before the character
            // reaches the right border, allowing enemies to approach on-screen.
            const rightInset=modelHalf(hd,"hero")+10*k;
            const safeFrontX=Math.min(bx.W-rightInset,bx.W*(bx.W<700?.58:.68));
            const maxWalkOff=Math.max(0,safeFrontX-h.home);
            const desiredOff=Math.max(0,Math.min(desiredX-h.home,maxWalkOff));
            h.walkOff=Math.min(Math.max(0,h.walkOff||0),maxWalkOff);
            // Герой не отступает к home между целями/волнами. Новая цель
            // может только увеличить его выдвижение, поэтому рывка вперёд-назад нет.
            if(target&&(h.walkOff||0)<desiredOff)h.walkOff=Math.min(desiredOff,(h.walkOff||0)+WALK*k*dt);
            h.x=Math.min(h.home+(h.walkOff||0),safeFrontX);
            if(target){const limit=target.x-(halves+4*k);if(h.x>limit)h.x=limit}
            reach=bodyGap+lane+6*k;
          }else{const rightInset=modelHalf(hd,"hero")+10*k;h.x=Math.min(h.home+(h.walkOff||0),bx.W-rightInset,bx.W*(bx.W<700?.58:.68))}
          h.cool-=dt;
          if(h.cool<=0&&target){
            h.sk.sharp=(h.sk.sharp||0)+1;
            const sharpCrit=hd.id==="archer"&&h.sk.sharp>=3;
            if(sharpCrit)h.sk.sharp=0;
            if(hd.id==="mage"){h.sk.arcane=(h.sk.arcane||0)+1;if(h.sk.arcane>=5){h.sk.arcane=0;h.buffs=h.buffs||{};h.buffs.arcane=1}}
            let dmgMult=1;
            if(hd.id==="monk")dmgMult*=1+0.03*Math.min(10,h.sk.mom||0);
            if(hd.id==="rogue"&&target.hp/target.maxHp<0.3)dmgMult*=1.4;
            const crit=sharpCrit||Math.random()*100<st.crit;
            const arcaneMult=(h.buffs?.arcane)?1.5:1;
            const dmg=Math.ceil(st.dmg*(crit?st.critDmg/100:1)*arcaneMult*dmgMult);
            if(hd.range==="melee"){
              const dist=Math.abs(target.x-h.x);
              if(dist<=reach){
                h.cool=1/st.speed;h.lunge=1;
                
                bx.meleeFx(hd,h,target,crit);
                Battle.damage(target,dmg,{crit,heroId:hd.id});
                if(hd.id==="monk")h.sk.mom=(h.sk.mom||0)+1;
                const impact=bx.enemyImpactPoint(target);bx.heroFx(hd.id,impact.x,impact.y,crit);E.emit("sfx",{name:"heroAttack",arg:{id:hd.id,crit}})}
            }
            else{h.cool=1/st.speed;h.lunge=1;const spr=T.getSprite(hd,"hero")[0],sc=bx.scaleOf(spr);B.projs.push({x:h.x+12*k,y:gy()-spr.h*sc*.58,type:hd.projectile||"orb",color:hd.projColor||hd.color||"#38dfff",target,dmg,crit,splash:hd.splash||0,heroId:hd.id,done:false});E.emit("sfx",{name:"heroAttack",arg:{id:hd.id,crit}})}
          }
        }
      }
      // Actual visual travel continues even after the heroes reach the center:
      // their feet keep stepping while the world moves beneath them. Attacks
      // and projectiles shut travel off in the same frame they begin.
      const actionStarted=B.projs.length>0||F.some(hd=>{
        const h=B.hs[hd.id];return !h.dead&&(h.lunge>.08||h.castT>.08);
      });
      if(actionStarted)B.combatUntil=Math.max(B.combatUntil||0,B.time+.55);
      B.cameraMoving=marching&&!actionStarted&&!bx.REDUCED.matches;
      if(B.cameraMoving)B.travel+=Math.min(Math.max(0,dt),.1)*125*k;
      for(const p of B.projs){
        if(p.type==="boss"){
          if(p.style==="wave"){p.x-=p.spd*dt;p.hit=p.hit||{};
            for(const hd of T.partyDefs()){const h=B.hs[hd.id];if(h.dead||p.hit[hd.id])continue;if(Math.abs(h.x-p.x)<22*k){p.hit[hd.id]=1;bx.applyBossHit(h,p.dmg,p.color,{bossId:p.bossId})}}
            if(Math.random()<dt*40)B.parts.push({x:p.x,y:p.y+U.rand(-26,10),vx:U.rand(-20,20),vy:U.rand(-40,-10),g:0,life:.3,max:.3,color:p.color,s:2});
            if(p.x<-60)p.done=true;
            continue;}
          const th=p.targetHero;if(!th||th.dead){p.done=true;continue}
          if(p.style==="rain"){p.y+=p.spd*dt;p.x=th.x+(p.ox||0);
            if(Math.random()<dt*50)B.parts.push({x:p.x,y:p.y,vx:U.rand(-10,10),vy:U.rand(20,60),g:0,life:.25,max:.25,color:p.color,s:2});
            if(p.y>=gy()-14*k){bx.applyBossHit(th,p.dmg,p.color,{bossId:p.bossId});bx.burst(p.x,gy()-14*k,p.color,12,120);bx.shake(2,.15);p.done=true}
            continue;}
          const tx=th.x,ty=gy()-30*k,dx=tx-p.x,dy=ty-p.y,dist=Math.hypot(dx,dy)||1;
          if(dist<=Math.max(12*k,p.spd*dt)){bx.applyBossHit(th,p.dmg,p.color,{bossId:p.bossId});bx.burst(tx,ty,p.color,10,110);p.done=true;continue}
          p.x+=dx/dist*p.spd*dt;p.y+=dy/dist*p.spd*dt;
          if(Math.random()<dt*40)B.parts.push({x:p.x,y:p.y,vx:U.rand(-12,12),vy:U.rand(-12,12),g:0,life:.25,max:.25,color:p.color,s:2});
          continue;
        }
        if(p.type==="heal"){const th=p.targetHero;if(!th||th.dead){p.done=true;continue}const spr=T.getSprite(th.def,"hero")[0],sc=bx.scaleOf(spr),tx=th.x,ty=gy()-spr.h*sc*.55,dx=tx-p.x,dy=ty-p.y,dist=Math.hypot(dx,dy),spd=330*k;if(dist<=Math.max(10*k,spd*dt)){bx.applyHeal(th,p.amount,p.crit,p.heroId);p.done=true;continue}p.x+=dx/dist*spd*dt;p.y+=dy/dist*spd*dt;continue}
        if(!p.target||p.target.dead){p.target=rangedTarget();if(!p.target){p.done=true;continue}}
        const frames=T.getSprite(p.target.def,"mob"),ms=bx.scaleOf(frames[0]),sh=frames[0].h*ms,tx=p.target.x,ty=gy()-sh*.52-(p.target.flying?20*k:0),dx=tx-p.x,dy=ty-p.y,dist=Math.hypot(dx,dy),spd=390*k;
        if(dist<=Math.max(11*k,spd*dt)){if(!p.piercing)Battle.damage(p.target,p.dmg,{crit:p.crit,heroId:p.heroId});if(p.heroId)bx.heroFx(p.heroId,tx,ty,p.crit);if(p.splash){for(const m of B.monsters)if(!m.dead&&m!==p.target&&Math.abs(m.x-tx)<p.splash*k)Battle.damage(m,p.dmg*.6,{color:"#ff7a3d",heroId:p.heroId});E.emit("sfx","boom")}p.done=true;continue}
        p.x+=dx/dist*spd*dt;p.y+=dy/dist*spd*dt;
        
      }
      B.projs=B.projs.filter(p=>!p.done);
      bx.updateFx(dt);
      for(const p of B.parts){p.life-=dt;
        if(p.coin&&p.life<.45){p.vx=U.lerp(p.vx,(bx.W-20-p.x)*4,.25);p.vy=U.lerp(p.vy,(8-p.y)*4,.25)}
        else if(!p.slash&&p.ring==null&&p.soul==null){p.vy+=(p.g||0)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}}
      B.parts=B.parts.filter(p=>p.life>0);
      for(const t of B.texts){t.life-=dt;t.y-=30*dt}B.texts=B.texts.filter(t=>t.life>0);
      for(const b of B.beams)b.t+=dt;B.beams=B.beams.filter(b=>b.t<b.dur);
      B.shake.t=Math.max(0,B.shake.t-dt);
      const zNow=T.waves.zoneFor(S.wave).zone;if(!bx.zoneBg(zNow))bx.lerpZone(dt)},
    spawn(boss){const S=T.S,k=K(),def=boss?T.waves.bossDef(S.wave):U.pick(T.waves.mobPool(S.wave)),hp=T.waves.enemyHp(S.wave,boss,def),elite=!boss&&S.wave%5===(BAL.elite.waveRemainder||3)&&B.spawnLeft===B.waveTotal,finalHp=boss?Math.ceil(hp*(BAL.boss.spawnHpMult||1)):elite?Math.ceil(hp*(BAL.elite.hpMult||1)):hp,
      baseDmg=Math.max(1,Math.ceil(Math.pow(finalHp,BAL.combat.monsterDmgPow)*BAL.combat.monsterDmgScale*(boss?BAL.combat.bossDmgMult:1))),
      m={def,boss,elite,hp:finalHp,maxHp:finalHp,x:bx.W+45,slot:(B.waveTotal-B.spawnLeft)%6,jit:U.rand(0,10),
        spd:boss?90*k*(def.speedMult||1):(BAL.enemy.speedBase+U.rand(0,12)+Math.min(BAL.enemy.speedMaxBonus,S.wave*BAL.enemy.speedPerWave))*k*(def.speedMult||1)*2.5,
        dmg:(def.mechanic||def.id)==="flame_lord"?Math.ceil(baseDmg*0.8):baseDmg,
        atkT:U.rand(.8,1.4),flash:0,lunge:0,dead:false,deathT:0,seed:U.rand(6.28),flying:!!def.flying,
        sk:boss?{a1:U.rand(4,8),a2:U.rand(10,16)}:null,buffs:{},atkMult:1,castT:0,castIcon:""};
      m.baseSpd=m.spd;B.monsters.push(m);if(boss){B.boss=m;bx.shake(3,.3);E.emit("sfx","boss")}},
    damage(m,dmg,o={}){if(m.dead)return;
      if(bx.bossEvade(m)){bx.float("ПРОМАХ",m.x+U.rand(-6,6),gy()-50,"#b06cff",true);return}
      dmg=Math.ceil(dmg*bx.bossArmorMult(m));
      if(m.buffs?.cursed>0)dmg=Math.ceil(dmg*1.3);
      const actualDamage=Math.min(Math.max(0,m.hp),Math.max(0,dmg));
      if(o.heroId&&actualDamage>0){B.damageByHero=B.damageByHero||{};B.damageByHero[o.heroId]=(B.damageByHero[o.heroId]||0)+actualDamage;E.emit("damageStats")}
      m.hp-=dmg;m.flash=.12;const frames=T.getSprite(m.def,"mob"),ms=bx.scaleOf(frames[0]),sh=frames[0].h*ms;bx.float(U.fmt(dmg)+(o.crit?"!":""),m.x+U.rand(-6,6),gy()-sh-(m.flying?20*K():0)-5,o.color||(o.crit?"#ff7a3d":"#f2eadb"),o.crit);if(m.hp<=0)Battle.kill(m)},
    kill(m){const S=T.S;m.dead=true;m.deathT=.25;const bounty=Math.ceil(T.waves.enemyGold(S.wave,m.boss,m.def)*(m.elite?(BAL.elite.goldMult||1):1));T.econ.addGold(bounty,{x:m.x,y:gy()-24});bx.burst(m.x,gy()-18*K(),m.boss?"#ff4d62":m.def.color||"#78ff7a",m.boss?30:10,m.boss?150:100);bx.coins(m.x,gy()-24,3);E.emit("sfx","coin");S.stats.kills++;if(!m.summoned)B.waveKills++;T.progression.awardKill(S.wave,m.boss);T.items.maybeDrop(S.wave,m.boss,m.x,gy()-30,m.def.name);if(m.boss){S.stats.bosses++;if(Math.random()<BAL.divine.bossGemChance){S.gems++;E.emit("toast",{msg:"💎 Босс оставил алмаз!",type:"success"});T.save()} B.boss=null;bx.banner("БОСС ПОВЕРЖЕН!","gold");bx.shake(6,.42);E.emit("sfx","bossdie");if(S.wave===T.waves.victoryWave()&&!S.victory){S.victory=true;T.save();E.emit("victory")}}},
    clearWave(){const S=T.S,w=S.wave,bonus=Math.ceil(T.waves.enemyGold(w,false,{goldMult:1})*(BAL.economy.waveBonusMult+B.waveTotal*.3)*(B.bossWave?2:1));T.econ.addGold(bonus,{x:bx.W/2,y:bx.H/2});E.emit("sfx","wave");S.maxWave=Math.max(S.maxWave,w+1);B.next=S.settings.auto?w+1:w;B.state="inter";B.t=INTER},
    retreat(msg,bannerTxt){const S=T.S,back=T.waves.retreatWave(S.wave);E.emit("sfx","fail");E.emit("hurt");bx.banner(bannerTxt,"boss");E.emit("toast",{msg:msg+" Отступление на волну "+back+".",type:"danger"});B.advance=0;for(const hd of C.heroes){const hs=S.heroes[hd.id],h=B.hs[hd.id];if(!hs?.rec||!T.inParty(hd.id))continue;const wasDead=h.dead;const st=T.derived.heroStats(hd.id);h.maxHp=st.maxHp;h.hp=st.maxHp;h.dead=false;h.deadAge=0;h.deadX=null;h.walkOff=wasDead?0:(h.walkOff||0);h.x=h.home+h.walkOff;h.buffs={};h.castT=0}B.fx=[];B.monsters=[];B.projs=[];B.beams=[];B.boss=null;B.state="inter";B.t=2;B.next=back},
    resetVisuals(){B.fx=[];B.monsters=[];B.projs=[];B.parts=[];B.texts=[];B.beams=[];B.boss=null;B.travel=0;B.cameraMoving=false;B.combatUntil=0;B.state="inter";B.t=.5;B.next=1;B.advance=0;for(const hd of C.heroes){const h=B.hs[hd.id];h.hp=0;h.maxHp=0;h.dead=false;h.deadAge=0;h.deadX=null;h.walkOff=0;h.buffs={};h.castT=0;h.levelUpT=0}},
    render(){ctx.setTransform(bx.dpr,0,0,bx.dpr,0,0);ctx.clearRect(0,0,bx.W,bx.H);
      const k=K(),G=gy(),z=T.waves.zoneFor(T.S.wave).zone,bgImg=bx.zoneBg(z);
      if(bgImg){
        // Far panorama scrolls slowly LEFT as heroes travel RIGHT. Alternate
        // mirrored tiles so the source image loops seamlessly without a snap,
        // without bouncing, and without exposing empty canvas edges.
        const iw=bgImg.width,ih=bgImg.height,sc=Math.max(bx.W/iw,bx.H/ih)*1.08,dw=iw*sc,dh=ih*sc;
        const offset=(bx.REDUCED.matches?0:B.travel*.23),phase=((offset%dw)+dw)%dw;
        const cycle=Math.floor(offset/dw),baseX=(bx.W-dw)/2-phase,y=(bx.H-dh)/2;
        for(let tile=-1;tile<=Math.ceil(bx.W/dw)+1;tile++){
          const dx=baseX+tile*dw;
          if(dx>=bx.W||dx+dw<=0)continue;
          ctx.save();
          if(Math.abs(tile+cycle)%2===1){ctx.translate(dx+dw,0);ctx.scale(-1,1);ctx.drawImage(bgImg,0,y,dw,dh)}
          else ctx.drawImage(bgImg,dx,y,dw,dh);
          ctx.restore();
        }
        ctx.fillStyle="rgba(6,4,12,.12)";ctx.fillRect(0,0,bx.W,bx.H)
      }
      else{const g=ctx.createLinearGradient(0,0,0,bx.H);g.addColorStop(0,U.rgb(bx.ZC.sky1));g.addColorStop(1,U.rgb(bx.ZC.sky2));ctx.fillStyle=g;ctx.fillRect(-8,-8,bx.W+16,bx.H+16);
        if(z.stars){for(const s of bx.stars){ctx.globalAlpha=.25+.6*Math.abs(Math.sin(B.time*.8+s.ph));ctx.fillStyle="#cfe8ff";ctx.fillRect(s.x*bx.W,s.y*bx.H,s.s,s.s)}ctx.globalAlpha=1}
        ctx.fillStyle="rgba(255,255,255,.06)";for(const c of bx.clouds){const x=((c.x+B.travel*c.spd*.14)%(bx.W+160))-80;ctx.beginPath();ctx.ellipse(x,c.y,c.w,7,0,0,6.28);ctx.fill()}
        bx.drawHills(U.rgb(bx.ZC.h1),12,G-10,6,1.3);bx.drawHills(U.rgb(bx.ZC.h2),8,G-3,14,4.1);
        ctx.fillStyle=U.rgb(bx.ZC.gr);ctx.fillRect(-8,G,bx.W+16,bx.H-G+8);ctx.fillStyle="rgba(255,255,255,.13)";ctx.fillRect(-8,G,bx.W+16,2)}
      bx.drawTravelWorld(G,z);
      // Shake only sprites/effects, never background; otherwise edge pixels blink.
      ctx.save();const shake=B.shake;
      if(shake.t>0){const f=shake.t/Math.max(.01,shake.d);ctx.translate(U.rand(-1,1)*Math.min(3,shake.m)*f,U.rand(-1,1)*Math.min(3,shake.m)*f)}
      bx.drawHeroes(k,G);bx.drawMonsters(k,G);bx.drawProjectiles(k);bx.drawParticles();bx.drawBeams(k,G);bx.drawFx();bx.drawTexts();
      ctx.restore();bx.drawLevelUps(G);}
  };
  E.on("gold",d=>{if(d.x!=null){bx.float("+"+U.fmt(d.amount),d.x,d.y-10,"#ffd866");bx.coins(d.x,d.y,2)}});
  E.on("drop",d=>{const r=T.derived.rarityOf(d.item);if(d.x!=null){B.beams.push({x:d.x,color:r.color,t:0,dur:1.25});bx.burst(d.x,gy()-30*K(),r.color,16,120);bx.float(d.autoSold?"+"+U.fmt(d.item.value)+"🪙":" "+T.derived.itemDef(d.item).name,d.x,gy()-52*K(),r.color,true)}E.emit("sfx",{name:"drop",arg:{rarity:d.item.rarity}})});
  E.on("heroes",bx.syncHeroHp);
  E.on("levelUp",({heroId})=>{const h=B.hs[heroId];if(h)h.levelUpT=2.2});
  E.on("party",()=>{bx.syncHeroHp()});
  bx.setZoneInstant();
})();
