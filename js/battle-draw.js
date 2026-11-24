(function(){
  const T=window.TBH,bx=T.bx,U=T.util,B=bx.B,ctx=bx.ctx;
  const K=bx.K,gy=bx.gy;
  bx.spr=(s,x,y,sc,o={})=>{const img=o.img||s.c,w=s.w*sc,h=s.h*sc;ctx.save();ctx.globalAlpha*=o.alpha??1;ctx.imageSmoothingEnabled=!!s.img;ctx.imageSmoothingQuality="high";if(o.flip){ctx.translate(Math.round(x)+w,Math.round(y));ctx.scale(-1,1);ctx.drawImage(img,0,0,w,h)}else ctx.drawImage(img,Math.round(x),Math.round(y),w,h);ctx.restore()};
  bx.drawHills=(color,amp,base,speed,seed)=>{const off=(B.travel||0)*speed*.1;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-40,bx.H);for(let x=-40;x<=bx.W+40;x+=26){const y=base-(Math.sin((x+off)*.02+seed)*amp+Math.sin((x+off)*.043+seed*2)*amp*.5);ctx.lineTo(x,y)}ctx.lineTo(bx.W+40,bx.H);ctx.closePath();ctx.fill()};
  bx.drawFallen=(h,hd,s,sc,G)=>{const x=h.deadX??h.x,sq=.34,bw=s.w*sc,bh=s.h*sc;
    bx.shadow(x,G-2,bw*.5);
    ctx.save();ctx.globalAlpha=.62;ctx.translate(x,G-2);ctx.scale(1,sq);if(hd.sprite?.face==="left"){ctx.scale(-1,1)}ctx.drawImage(s.c,-bw/2,-bh,bw,bh);ctx.restore();
    ctx.save();ctx.strokeStyle="rgba(255,77,98,.5)";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-bw*.4,G-3);ctx.lineTo(x+bw*.4,G-3);ctx.stroke();ctx.restore();
    const age=h.deadAge||0;
    if(age<1.5){const a=1-age/1.5;ctx.save();ctx.globalAlpha=a*.85;ctx.fillStyle="#cfe8ff";ctx.shadowColor="#cfe8ff";ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x+Math.sin(age*6)*3,G-12-age*46,4.5,0,6.28);ctx.fill();ctx.restore()}
    ctx.fillStyle="#ff9aaa";ctx.font="bold 12px serif";ctx.textAlign="center";ctx.fillText("💀",x,G-bh*sq-8)};
  bx.drawSkillCD=(h,x,yBase,hd)=>{
    const kit=bx.HERO_SKILLS[hd.id];if(!kit)return;
    const p1=Math.max(0,Math.min(1,h.sk.a1/kit.a1.cd)),p2=Math.max(0,Math.min(1,h.sk.a2/kit.a2.cd));
    const draw=(cx,cy,p,c)=>{ctx.strokeStyle="rgba(0,0,0,.6)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,5,0,6.28);ctx.stroke();
      ctx.strokeStyle=p<=0?"#78ff7a":c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,5,-Math.PI/2,-Math.PI/2+(1-p)*6.28);ctx.stroke();
      if(p<=0){ctx.fillStyle="#78ff7a";ctx.font="bold 6px sans-serif";ctx.textAlign="center";ctx.fillText("✓",cx,cy+2.2)}};
    draw(x-10,yBase,p1,"#ffd866");draw(x+10,yBase,p2,"#ff7a3d");
  };
  bx.drawBuffBar=(h,x,yBase)=>{
    const b=h.buffs;if(!b)return;const keys=Object.keys(b).filter(k=>typeof b[k]==="number"&&b[k]>0);if(!keys.length)return;
    const palette={shieldT:{icon:"🛡",color:"#ffd866"},arcane:{icon:"✦",color:"#b06cff"},haste:{icon:"☯",color:"#78ff7a"},darkPact:{icon:"☠",color:"#b06cff"},shadowMark:{icon:"👁",color:"#b06cff"}};
    let dx=-((keys.length-1)*7);
    for(const k of keys){const p=palette[k]||{icon:"●",color:"#fff"};
      ctx.fillStyle=p.color;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(x+dx,yBase,4.5,0,6.28);ctx.fill();
      ctx.fillStyle="#0a0612";ctx.font="bold 6px sans-serif";ctx.textAlign="center";ctx.fillText(p.icon,x+dx,yBase+2.2);
      ctx.globalAlpha=1;dx+=14}
  };
  // Three depth planes, painted ground, and a repeating walkable road.
  // The far panorama remains legible while scenery and cobbles scroll.
  bx.drawTravelWorld=(G,zone)=>{
    const W=bx.W,H=bx.H,k=K(),travel=bx.REDUCED.matches?0:(B.travel||0);
    const id=zone?.id||"forest";
    const palettes={
      forest:["#25382f","#443a30","#7d6c50","#91c883"],waste:["#463129","#58402b","#c08a52","#ddab6a"],
      caves:["#29213e","#342b43","#6e6481","#9ea7cb"],peaks:["#273b53","#4c5969","#8496a8","#b7d8ec"],
      castle:["#332335","#483241","#78637a","#d9a19e"],crystal:["#24234b","#33335e","#7472bb","#81e3ec"],
      volcano:["#43252b","#623833","#a8674a","#e8995f"],cursed:["#192d29","#2b4032","#5e7458","#8eac76"]
    };
    const terrain=zone?.terrain||id,ground=zone?.colors?.ground||"#25382f";
    const [shadow,road,stone,glow]=palettes[id]||[U.shade(ground,-21),U.shade(ground,8),U.shade(ground,58),U.shade(zone?.colors?.sky2||ground,90)];
    ctx.save();
    // Midground silhouettes drift slowly: their speed differs from the roadway.
    for(let depth=0;depth<2;depth++){
      const scale=depth?.42:.18,step=depth?132:196,offset=travel*scale;
      ctx.globalAlpha=depth?.20:.11;ctx.fillStyle=shadow;
      for(let i=-2;i<Math.ceil(W/step)+3;i++){
        const seed=i+17, x=i*step-(offset%step)+((seed*19)%27),h=(depth?16:31)+(seed*13%17);
        ctx.beginPath();
        if(["forest","cursed","elfwood","darkwood","swamp"].includes(terrain)){
          ctx.moveTo(x-11,G+4);ctx.lineTo(x-8,G-h);ctx.lineTo(x-4,G-h-4);
          ctx.lineTo(x+3,G-h);ctx.lineTo(x+10,G+4);ctx.closePath();
          ctx.fill();ctx.beginPath();ctx.ellipse(x,G-h+2,19+depth*6,12,0,0,6.283);
        }else if(["mine","caves","crystal"].includes(terrain)){
          ctx.moveTo(x-18,G+5);ctx.lineTo(x-6,G-h);ctx.lineTo(x+5,G-h*1.3);
          ctx.lineTo(x+16,G+5);ctx.closePath();
        }else if(["city","gate","elfcity","dwarf","ruins","fortress","citadel","castle"].includes(terrain)){
          ctx.moveTo(x-10,G+4);ctx.lineTo(x-10,G-h);
          ctx.lineTo(x-15,G-h);ctx.lineTo(x,G-h-8);ctx.lineTo(x+15,G-h);
          ctx.lineTo(x+10,G-h);ctx.lineTo(x+10,G+4);ctx.closePath();
        }else{
          ctx.moveTo(x-22,G+4);ctx.lineTo(x-5,G-h);ctx.lineTo(x+4,G-h*1.1);
          ctx.lineTo(x+23,G+4);ctx.closePath();
        }
        ctx.fill();
      }
    }
    ctx.globalAlpha=1;
    // Continuous road is anchored under the heroes' feet and extends beyond the canvas.
    const upper=G-24*k;
    const grad=ctx.createLinearGradient(0,upper,0,H+7);
    grad.addColorStop(0,shadow);grad.addColorStop(.34,road);grad.addColorStop(1,shadow);
    ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(-10,upper+5);
    ctx.bezierCurveTo(W*.3,upper-4,W*.7,upper-4,W+10,upper+5);
    ctx.lineTo(W+10,H+10);ctx.lineTo(-10,H+10);ctx.closePath();ctx.fill();
    ctx.strokeStyle=stone;ctx.globalAlpha=.24;ctx.lineWidth=1.2*k;ctx.beginPath();
    ctx.moveTo(-5,upper+5);ctx.quadraticCurveTo(W*.5,upper-4,W+5,upper+5);ctx.stroke();
    // Irregular cobblestones and cracks; no bright dashed highway markings.
    // Every position is deterministic, so there is no texture flicker.
    const tile=Math.max(35,54*k),offset=((travel*.94)%tile+tile)%tile;
    for(let i=-2;i<Math.ceil(W/tile)+3;i++){
      const x=i*tile-offset,seed=((i%7)+7)%7,stagger=seed%2?5*k:-3*k;
      ctx.fillStyle=stone;ctx.globalAlpha=.10+(seed%3)*.018;
      ctx.beginPath();
      ctx.moveTo(x+4*k,G-9*k+stagger);
      ctx.lineTo(x+tile*.35,G-14*k+stagger);
      ctx.lineTo(x+tile*.72,G-10*k+stagger);
      ctx.lineTo(x+tile*.81,G-4*k+stagger);
      ctx.lineTo(x+tile*.48,G+1*k+stagger);
      ctx.lineTo(x+7*k,G-2*k+stagger);ctx.closePath();ctx.fill();
      ctx.strokeStyle=glow;ctx.globalAlpha=.12;ctx.lineWidth=.75*k;
      ctx.beginPath();ctx.moveTo(x+tile*.1,G-5*k+stagger);
      ctx.lineTo(x+tile*.36,G-7*k+stagger);
      ctx.lineTo(x+tile*.65,G-4*k+stagger);ctx.stroke();
      if(seed===2||seed===5){
        ctx.fillStyle=glow;ctx.globalAlpha=.22;ctx.beginPath();
        ctx.arc(x+tile*.3,G-16*k,1.5*k,0,6.283);ctx.fill();
      }
    }
    ctx.globalAlpha=1;
    ctx.restore();
  };
  bx.drawHeroes=(k,G)=>{let i=0;for(const hd of T.config.heroes){if(!T.S.heroes[hd.id]?.rec||!T.inParty(hd.id))continue;const h=B.hs[hd.id],s=T.getSprite(hd,"hero")[0],sc=bx.scaleOf(s),flip=hd.sprite?.face==="left",bob=h.dead?0:Math.round(Math.sin(B.time*(B.cameraMoving?12:5)+i*1.7)*(B.cameraMoving?2.8:1)),
    stepX=B.cameraMoving?Math.sin(B.time*9+i*1.7)*1.2:0,
    lx=h.lunge*(hd.range==="melee"?10:-3),x=h.x-s.w*sc/2+lx+stepX,y=G-s.h*sc+bob;
    if(h.dead){bx.drawFallen(h,hd,s,sc,G);i++;continue}
    bx.shadow(h.x,G-2,s.w*sc*.42);
    if(B.cameraMoving&&!bx.REDUCED.matches){
      // Small alternating footstep puffs make walking legible while heroes
      // remain camera-centered; no footsteps or ground motion in combat.
      const phase=B.time*12+i*1.7,step=Math.sin(phase);
      ctx.save();ctx.globalAlpha=.1+.09*Math.abs(step);ctx.fillStyle="#cbb9a0";
      ctx.beginPath();ctx.ellipse(h.x-8*k+step*3*k,G-3*k,5*k,1.7*k,0,0,6.283);ctx.fill();ctx.restore();
    }
    if(h.buffs?.shieldT>0){ctx.save();ctx.strokeStyle="rgba(255,216,102,"+(0.35+0.35*Math.sin(B.time*5))+")";ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.x,G-s.h*sc*.5,s.w*sc*.7,0,6.28);ctx.stroke();ctx.restore()}
    bx.spr(s,x,y,sc,{flip});if(h.hurt>0)bx.spr(s,x,y,sc,{img:s.hurt,alpha:h.hurt/.18*.7,flip});if(h.healGlow>0)bx.spr(s,x,y,sc,{img:s.heal,alpha:h.healGlow/.3*.5,flip});
    const bw=Math.max(34,s.w*sc),pct=U.clamp(h.hp/h.maxHp,0,1);
    bx.hpBar(h.x,y-9,bw,pct,false);
    ctx.fillStyle="rgba(242,234,219,.9)";ctx.font="bold 8px Courier New";ctx.textAlign="center";ctx.fillText(`${U.fmt(h.hp)}/${U.fmt(h.maxHp)}`,h.x,y-14);
    bx.drawSkillCD(h,h.x,y-24,hd);
    bx.drawBuffBar(h,h.x,y-34);
    if(h.castT>0)bx.castBubble(h.x,y-46,h.castIcon,h.castT);
    i++}};
  bx.drawMonsters=(k,G)=>{const sorted=[...B.monsters].sort((a,b)=>a.x-b.x);for(const m of sorted){const frames=T.getSprite(m.def,"mob"),s=frames[Math.floor(B.time*6+m.seed)%frames.length],sc=bx.scaleOf(s)*(m.boss?1.3:1),flip=m.def.sprite?.face!=="left",sw=s.w*sc,sh=s.h*sc,bob=m.flying?Math.sin(B.time*6+m.seed)*4:Math.round(Math.sin(B.time*7+m.seed)),y=G-sh+bob-(m.flying?20*k:0),x=m.x-sw/2-m.lunge*6;bx.shadow(m.x,G-2,sw*(m.flying?.3:.42));
    if(m.elite&&!m.boss){ctx.save();ctx.globalAlpha=0.25+0.12*Math.sin(B.time*5);ctx.strokeStyle="#ffd866";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,G-sh*.5,sw*.68,sh*.6,0,0,6.28);ctx.stroke();ctx.globalAlpha=1;ctx.restore()}
    if(m.boss&&(m.def.mechanic||m.def.id)==="flame_lord"){ctx.save();ctx.globalAlpha=0.18+0.12*Math.sin(B.time*4);ctx.fillStyle="#ff7a3d";ctx.beginPath();ctx.ellipse(m.x,G-4,sw*.9,10,0,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.restore()}
    if(m.boss&&(m.def.mechanic||m.def.id)==="crystal_titan"&&m.buffs?.crystalShell>0){ctx.save();ctx.strokeStyle="rgba(56,223,255,"+(0.4+0.4*Math.sin(B.time*6))+")";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,G-sh*.5,sw*.6,sh*.6,0,0,6.28);ctx.stroke();ctx.restore()}
    if(m.boss&&(m.def.mechanic||m.def.id)==="shadow_king"){ctx.save();ctx.globalAlpha=0.35+0.2*Math.sin(B.time*3);ctx.fillStyle="#b06cff";ctx.beginPath();ctx.ellipse(m.x,G-sh*.5,sw*.55,sh*.55,0,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.restore()}
    if(m.boss&&!m.dead&&bx.BOSS_SKILLS?.[m.def.id]?.color){const color=bx.BOSS_SKILLS[m.def.id].color;ctx.save();ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10*k;ctx.lineWidth=1.5*k;ctx.globalAlpha=m.castT>0?.75:.22;ctx.beginPath();ctx.ellipse(m.x,G-3*k,sw*.65,9*k,0,0,Math.PI*2);ctx.stroke();if(m.castT>0||m.buffs?.campaignGuard>0){ctx.globalAlpha=.35;ctx.beginPath();ctx.ellipse(m.x,G-sh*.5,sw*.66,sh*.57,0,0,Math.PI*2);ctx.stroke()}ctx.restore()}
    if(m.boss&&m.buffs?.rage>0){ctx.save();ctx.globalAlpha=0.45;ctx.strokeStyle="#ff4d62";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,G-sh*.5,sw*.55,sh*.55,0,0,6.28);ctx.stroke();ctx.globalAlpha=1;ctx.restore()}
    if(m.buffs?.chilled>0){ctx.save();ctx.globalAlpha=0.4;ctx.fillStyle="#38dfff";ctx.beginPath();ctx.ellipse(m.x,G-sh*.5,sw*.45,sh*.45,0,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.restore()}
    if(m.buffs?.cursed>0){ctx.save();ctx.globalAlpha=0.4+0.3*Math.sin(B.time*7);ctx.fillStyle="#b06cff";ctx.beginPath();ctx.ellipse(m.x,G-sh*.5,sw*.5,sh*.5,0,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.restore()}
    ctx.save();if(m.dead){const t=m.deathT/.25;ctx.globalAlpha=t;ctx.translate(m.x,y+sh/2);ctx.scale(1+(1-t)*.35,1+(1-t)*.35);ctx.translate(-m.x,-(y+sh/2))}bx.spr(s,x,y,sc,{flip});if(m.flash>0)bx.spr(s,x,y,sc,{flip,img:s.flash,alpha:m.flash/.12*.85});ctx.restore();
    if(!m.dead){const bw=m.boss?96*k:Math.max(28,sw),pct=U.clamp(m.hp/m.maxHp,0,1);
      bx.hpBar(m.x,y-8,bw,pct,!!m.boss);
      if(m.boss){ctx.fillStyle="#ffb8c8";ctx.font="bold 10px Courier New";ctx.textAlign="center";ctx.fillText("👑 "+m.def.name,m.x,y-16);
        if(m.castT>0)bx.castBubble(m.x,y-34,m.castIcon,m.castT)}
      else{if(m.elite){ctx.fillStyle="#ffd866";ctx.font="bold 9px Courier New";ctx.textAlign="center";ctx.fillText("✦ ЭЛИТА",m.x,y-16)}if(m.buffs&&Object.keys(m.buffs).length)bx.drawBuffBar(m,m.x,y-16)}}}};
  bx.drawProjectiles=k=>{for(const p of B.projs){ctx.save();
    if(p.type==="boss"){
      if(p.style==="shard"){ctx.translate(p.x,p.y);ctx.rotate(B.time*10);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(4.5,0);ctx.lineTo(0,8);ctx.lineTo(-4.5,0);ctx.closePath();ctx.fill();ctx.fillStyle="#e8fbff";ctx.beginPath();ctx.moveTo(0,-3.5);ctx.lineTo(2,0);ctx.lineTo(0,3.5);ctx.lineTo(-2,0);ctx.closePath();ctx.fill()}
      else if(p.style==="rain"){ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(p.x,p.y,5.5,0,6.28);ctx.fill();ctx.fillStyle="#ffd866";ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,6.28);ctx.fill()}
      else{ctx.strokeStyle=p.color;ctx.lineWidth=3;ctx.shadowColor=p.color;ctx.shadowBlur=12;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(p.x,p.y,26,-1.25,1.25);ctx.stroke();ctx.globalAlpha=.4;ctx.beginPath();ctx.arc(p.x+9,p.y,26,-1.25,1.25);ctx.stroke();ctx.globalAlpha=.2;ctx.beginPath();ctx.arc(p.x+18,p.y,26,-1.25,1.25);ctx.stroke()}
      ctx.restore();continue;}
    bx.drawHeroProjectile(p);
    ctx.restore()}};
  bx.drawParticles=()=>{for(const p of B.parts){const a=U.clamp(p.life/p.max,0,1);
    if(p.slash){
      const rot=-0.6+(1-a)*1.2;
      ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.dir,1);ctx.rotate(rot);ctx.lineCap="round";
      ctx.globalAlpha=a;ctx.strokeStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=14;ctx.lineWidth=p.w+2;
      ctx.beginPath();ctx.arc(0,0,p.r,-1.05,1.05);ctx.stroke();
      ctx.restore();ctx.globalAlpha=1;
    }
    else if(p.kind){
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate((p.rot||0)+(1-a)*(p.spin||0)*.12);
      ctx.globalAlpha=a*.9;ctx.fillStyle=p.color;ctx.strokeStyle=p.color;ctx.lineWidth=1.5;
      if(p.kind==="leaf"){ctx.beginPath();ctx.moveTo(0,-p.s*1.7);ctx.quadraticCurveTo(p.s*1.5,0,0,p.s*1.7);ctx.quadraticCurveTo(-p.s*1.5,0,0,-p.s*1.7);ctx.fill()}
      else if(p.kind==="shard"){ctx.beginPath();ctx.moveTo(0,-p.s*2);ctx.lineTo(p.s,0);ctx.lineTo(0,p.s*2);ctx.lineTo(-p.s,0);ctx.closePath();ctx.fill()}
      else if(p.kind==="rune"){ctx.beginPath();ctx.arc(0,0,p.s*1.4,0,6.283);ctx.stroke();ctx.beginPath();ctx.moveTo(-p.s,0);ctx.lineTo(p.s,0);ctx.moveTo(0,-p.s);ctx.lineTo(0,p.s);ctx.stroke()}
      else if(p.kind==="shadow"){ctx.beginPath();ctx.ellipse(0,0,p.s*1.8,p.s*.7,-.5,0,6.283);ctx.fill()}
      else if(p.kind==="spark"){ctx.beginPath();ctx.moveTo(-p.s*1.5,-p.s);ctx.lineTo(p.s*1.5,p.s);ctx.moveTo(-p.s,p.s*1.5);ctx.lineTo(p.s,-p.s*1.5);ctx.stroke()}
      else if(p.kind==="ember"){ctx.beginPath();ctx.moveTo(0,-p.s*2);ctx.quadraticCurveTo(p.s*2,0,0,p.s*1.5);ctx.quadraticCurveTo(-p.s*1.5,0,0,-p.s*2);ctx.fill()}
      ctx.restore();
    }
    else if(p.soul){ctx.save();ctx.globalAlpha=a*.9;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,6.28);ctx.fill();ctx.restore()}
    else if(p.ring){ctx.strokeStyle=p.color;ctx.globalAlpha=a;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,(1-a)*p.s+4,0,6.28);ctx.stroke();ctx.globalAlpha=1}
    else if(p.coin){ctx.globalAlpha=a;ctx.fillStyle="#ffd866";ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,6.28);ctx.fill();ctx.fillStyle="#fff8d8";ctx.fillRect(p.x-1,p.y-1.5,1.5,1.5);ctx.globalAlpha=1}
    else{ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);ctx.globalAlpha=1}}};
  bx.drawBeams=(k,G)=>{for(const b of B.beams){const a=1-b.t/b.dur,x=b.x,g=ctx.createLinearGradient(0,0,0,G);g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(.55,b.color+"55");g.addColorStop(1,b.color+"cc");ctx.fillStyle=g;ctx.fillRect(x-13*k,0,26*k,G);ctx.globalAlpha=a;ctx.fillStyle=b.color;ctx.font="bold 18px serif";ctx.textAlign="center";ctx.fillText("🎁",x,G-42*k-b.t*22);ctx.globalAlpha=1}};
  bx.drawTexts=()=>{ctx.textAlign="center";for(const t of B.texts){ctx.font=`bold ${t.big?14:11}px Courier New`;ctx.globalAlpha=U.clamp(t.life/t.max,0,1);ctx.lineWidth=3;ctx.strokeStyle="rgba(0,0,0,.75)";ctx.strokeText(t.txt,t.x,t.y);ctx.fillStyle=t.color;ctx.fillText(t.txt,t.x,t.y);ctx.globalAlpha=1}};
  bx.drawLevelUps=G=>{
    const labels=[],fontSize=bx.W<700?10:13;
    ctx.save();ctx.textAlign="center";ctx.font=`900 ${fontSize}px Courier New`;
    const width=ctx.measureText("LVL UP").width+8;
    for(const hd of T.formation()){
      const h=B.hs[hd.id];if(!(h.levelUpT>0))continue;
      const s=T.getSprite(hd,"hero")[0],sc=bx.scaleOf(s),age=2.2-h.levelUpT;
      const rise=bx.REDUCED.matches?0:Math.min(1,age/1.6)*16;
      const x=U.clamp(h.dead?(h.deadX??h.x):h.x,width/2+2,bx.W-width/2-2);
      let y=Math.max(34,G-s.h*sc*(h.dead?.34:1)-54-rise);
      // Stagger nearby labels when several party members level up together.
      while(labels.some(p=>Math.abs(p.x-x)<width+4&&Math.abs(p.y-y)<34)&&y>=68)y-=34;
      labels.push({x,y});
      ctx.globalAlpha=Math.min(1,h.levelUpT/.45);ctx.lineJoin="round";ctx.lineWidth=3;
      ctx.strokeStyle="rgba(12,8,20,.95)";ctx.fillStyle="#b5ff78";
      ctx.beginPath();ctx.moveTo(x,y-30);ctx.lineTo(x+7,y-22);ctx.lineTo(x+3,y-22);
      ctx.lineTo(x+3,y-15);ctx.lineTo(x-3,y-15);ctx.lineTo(x-3,y-22);ctx.lineTo(x-7,y-22);ctx.closePath();ctx.stroke();ctx.fill();
      ctx.fillStyle="#fff0a0";ctx.strokeText("LVL UP",x,y);ctx.fillText("LVL UP",x,y);
    }
    ctx.restore();
  };
})();
