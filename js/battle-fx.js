(function(){
  const T=window.TBH,bx=T.bx,B=bx.B,ctx=bx.ctx,U=T.util;
  const colors={paladin:"#f4cc79",archer:"#d7c79a",monk:"#efb47c",rogue:"#b69ad7",barbarian:"#d89266",mage:"#f29958",necro:"#94cbb1",druid:"#afce83"};
  B.fx=[];
  const emit=(kind,x,y,options={})=>{
    const f={kind,x,y,age:0,duration:.5,color:colors[options.heroId]||"#e6d6ad",...options};
    B.fx.push(f);if(B.fx.length>96)B.fx.splice(0,B.fx.length-96);return f;
  };
  const point=m=>{const s=T.getSprite(m.def,"mob")[0];return{x:m.x,y:bx.gy()-s.h*bx.scaleOf(s)*(m.boss?1.3:1)*.52-(m.flying?20*bx.K():0)}};
  bx.enemyImpactPoint=point;
  const allyPoint=h=>{const s=T.getSprite(h.def,"hero")[0];return{x:h.x,y:bx.gy()-s.h*bx.scaleOf(s)*.5}};
  bx.updateFx=dt=>{for(const f of B.fx)f.age+=dt;B.fx=B.fx.filter(f=>f.age<f.duration)};
  bx.heroFx=(heroId,x,y,crit=false)=>emit("impact",x,y,{heroId,crit,duration:crit?.48:.32});
  bx.healFx=(h,heroId)=>{
    const kind=heroId==="druid"?"bloom":heroId==="monk"?"focus":"soul";
    if(B.fx.some(f=>f.kind===kind&&f.anchor===h&&f.age<.05))return;
    const p=allyPoint(h);emit(kind,p.x,p.y,{heroId,anchor:h,duration:.8});
  };
  bx.meleeFx=(hd,h,target,crit)=>{
    const p=point(target),start=bx.heroSwingPos(hd,h);
    emit(hd.id==="monk"?"fist":"cut",(start.x+p.x)/2,p.y,{heroId:hd.id,crit,duration:hd.id==="barbarian"?.42:.28,radius:Math.min(48*bx.K(),Math.abs(p.x-start.x)*.6+12*bx.K())});
  };
  bx.skillFx=(hd,h,slot,fm)=>{
    const heroId=hd.id,k=bx.K(),enemies=B.monsters.filter(bx.visibleEnemy),p=fm?point(fm):allyPoint(h);
    const at=(kind,m,options={})=>{const q=point(m);emit(kind,q.x,q.y,{heroId,duration:.85,...options})};
    const allies=(kind)=>{for(const def of bx.livingHeroes()){const a=B.hs[def.id],q=allyPoint(a);emit(kind,q.x,q.y,{heroId,anchor:a,duration:1.05})}};
    if(heroId==="archer"){
      if(slot==="a1"){
        // Cosmetic arrows only: damage remains in the skill's original calculation.
        // Every shaft starts and lands above a struck enemy, never a screen percentage.
        for(const m of enemies.slice(0,16)){
          const q=point(m),count=bx.REDUCED.matches?1:3;
          for(let i=0;i<count;i++)emit("rain",q.x,q.y,{heroId,target:m,offset:(i-1)*9*k,delay:i*.075,duration:.75+i*.075});
        }
      }else emit("pierce",h.x+12*k,bx.gy()-40*k,{heroId,tx:p.x,ty:p.y,duration:.45});
    }else if(heroId==="paladin"){
      if(slot==="a1")allies("ward");
      else for(const m of B.monsters)if(!m.dead&&Math.abs(m.x-h.x)<140*k)at("holy",m);
    }else if(heroId==="monk"){
      if(slot==="a1")for(let i=0;i<3;i++)emit("fist",p.x+(i-1)*9*k,p.y+(i%2?7:-7)*k,{heroId,delay:i*.09,duration:.48+i*.09,crit:true});
      else {const q=allyPoint(h);emit("focus",q.x,q.y,{heroId,anchor:h,duration:1})}
    }else if(heroId==="rogue"){
      if(slot==="a1")for(const m of [...B.monsters].filter(m=>!m.dead).sort((a,b)=>Math.abs(a.x-h.x)-Math.abs(b.x-h.x)).slice(0,3))at("cut",m,{radius:30*k,crit:true});
      else at("execute",fm,{duration:.65});
    }else if(heroId==="barbarian"){
      if(slot==="a1"){const q=allyPoint(h);emit("roar",q.x,q.y,{heroId,anchor:h,duration:.8})}
      else for(const m of B.monsters)if(!m.dead&&Math.abs(m.x-fm.x)<=150*k)at("cleave",m);
    }else if(heroId==="mage"){
      for(const m of enemies)if(slot==="a2"||Math.abs(m.x-fm.x)<260*k)at(slot==="a1"?"fire":"frost",m,{color:slot==="a1"?colors.mage:"#aed5df"});
    }else if(heroId==="necro"){
      if(slot==="a1")allies("soul");else at("curse",fm,{target:fm,color:"#b29aca",duration:1.2});
    }else if(heroId==="druid"){
      if(slot==="a1")allies("bloom");
      else{const a=bx.mostInjuredExcept("druid")||h,q=allyPoint(a);emit("roots",q.x,q.y,{heroId,anchor:a,duration:1.2})}
    }
  };
  function line(x1,y1,x2,y2,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  function glow(x,y,r,color,alpha=.35){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color+"00");ctx.save();ctx.globalAlpha*=alpha;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
  function leaf(x,y,r,angle,color){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-r,0);ctx.quadraticCurveTo(0,-r,r,0);ctx.quadraticCurveTo(0,r,-r,0);ctx.fill();line(-r*.65,0,r*.65,0,"#eff0c3",.7);ctx.restore()}
  function sigil(x,y,r,color,t){
    ctx.strokeStyle=color;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(x,y,r,r*.28,0,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<6;i++){const a=i*Math.PI/3+t;const xx=x+Math.cos(a)*r*.8,yy=y+Math.sin(a)*r*.23;line(xx-2,yy-3,xx+2,yy+3,color,1)}
  }
  function arrow(x,y,angle,k,color,power=false){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    line(-22*k,0,5*k,0,"#332921",3*k);line(-22*k,0,5*k,0,color,1.2*k);
    ctx.fillStyle="#e9e2cd";ctx.beginPath();ctx.moveTo(11*k,0);ctx.lineTo(2*k,-3*k);ctx.lineTo(4*k,0);ctx.lineTo(2*k,3*k);ctx.closePath();ctx.fill();
    line(-21*k,0,-26*k,-3*k,"#a1b78e",1.6*k);line(-18*k,0,-23*k,3*k,"#a1b78e",1.6*k);
    if(power)line(-42*k,0,-8*k,0,"#f5dfa2",2*k);ctx.restore();
  }
  // Render flight from the same target point used by projectile collision.
  bx.drawHeroProjectile=p=>{
    const k=bx.K(),q=p.type==="heal"?(p.targetHero?allyPoint(p.targetHero):{x:p.x+1,y:p.y}):(p.target?point(p.target):{x:p.x+1,y:p.y});
    const a=Math.atan2(q.y-p.y,q.x-p.x),id=p.heroId||"archer",color=colors[id]||p.color;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ctx.lineCap="round";
    if(p.type==="arrow")arrow(0,0,0,k,color,p.piercing||p.crit);
    else if(id==="mage"||p.type==="fire"){
      glow(-3*k,0,19*k,"#ed8c48",.5);
      const g=ctx.createLinearGradient(-30*k,0,7*k,0);g.addColorStop(0,"#ae472000");g.addColorStop(.65,"#d96532");g.addColorStop(1,"#ffe4a6");
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(8*k,0);ctx.bezierCurveTo(4*k,-10*k,-11*k,-6*k,-30*k,-2*k);ctx.quadraticCurveTo(-14*k,4*k,-24*k,7*k);ctx.quadraticCurveTo(0,10*k,8*k,0);ctx.fill();
      glow(3*k,0,6*k,"#fff1ca",.8);
    }else if(id==="druid"){
      glow(0,0,15*k,"#9cb66c",.3);
      for(let i=0;i<3;i++)leaf(-i*7*k,Math.sin(B.time*8-i)*3*k,(6-i)*k,i*.8,"#a9c77e");
    }else{
      const healing=p.type==="heal",c=healing?"#abd9ad":"#b59bd1";
      glow(0,0,16*k,c,.4);
      ctx.strokeStyle=c;ctx.lineWidth=2*k;ctx.beginPath();ctx.moveTo(-27*k,2*k);ctx.bezierCurveTo(-14*k,-8*k,-6*k,9*k,4*k,0);ctx.stroke();
      ctx.fillStyle=healing?"#dbedc4":"#d8c9e5";ctx.beginPath();ctx.ellipse(1*k,0,6*k,4*k,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#40463c";ctx.beginPath();ctx.arc(3*k,-1.5*k,1*k,0,Math.PI*2);ctx.arc(3*k,1.5*k,1*k,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  };
  bx.drawFx=()=>{
    const k=bx.K(),reduced=bx.REDUCED.matches;
    for(const f of B.fx){
      const age=f.age-(f.delay||0);if(age<0)continue;
      const duration=f.duration-(f.delay||0),t=U.clamp(age/duration,0,1),motion=reduced?.45:t;
      let x=f.x,y=f.y;if(f.anchor){const q=allyPoint(f.anchor);x=q.x;y=q.y}
      ctx.save();ctx.globalAlpha=Math.min(1,(1-t)*3);ctx.lineCap="round";ctx.lineJoin="round";
      const color=f.color,ground=bx.gy()-3*k,r=(f.radius||27*k)*(f.crit?1.2:1);
      if(f.kind==="rain"){
        x=(f.target?.x??x)+f.offset;
        if(!reduced&&t<.68){const progress=t/.68,startY=Math.max(4,y-140*k),yy=startY+(y-startY)*progress;arrow(x+10*k*(1-progress),yy,Math.PI/2+.07,k*.8,color);}
        else{glow(x,y,13*k,color,.25);line(x-4*k,y-4*k,x+4*k,y+4*k,"#eee2bf",1.5*k);sigil(x,ground,10*k,color,0)}
      }else if(f.kind==="pierce"){
        if(!reduced){const u=Math.min(1,t*1.6);arrow(U.lerp(x,f.tx,u),U.lerp(y,f.ty,u),Math.atan2(f.ty-y,f.tx-x),k,color,true)}
      }else if(["cut","execute","cleave"].includes(f.kind)){
        ctx.translate(x,y);ctx.rotate(f.kind==="cleave"?-.6:f.heroId==="rogue"?-.8:-.3);
        const radius=f.kind==="cleave"?38*k:r;
        glow(0,0,radius,color,.12);
        for(let i=0;i<(f.heroId==="rogue"||f.kind==="execute"?2:1);i++){
          ctx.save();if(i)ctx.rotate(1.5);
          ctx.fillStyle=color;ctx.globalAlpha*=.7;
          ctx.beginPath();ctx.arc(0,0,radius,-1.3+motion*.6,1.15+motion*.6);ctx.arc(-4*k,0,radius-4*k,1.15+motion*.6,-1.3+motion*.6,true);ctx.closePath();ctx.fill();
          ctx.strokeStyle="#f2e8d0";ctx.lineWidth=1.2*k;ctx.beginPath();ctx.arc(0,0,radius,-1+motion*.6,.7+motion*.6);ctx.stroke();ctx.restore();
        }
        if(f.kind==="cleave")for(let i=0;i<5;i++){const a=i*.7;line(Math.cos(a)*10*k,12*k,Math.cos(a)*(18+motion*18)*k,(18+motion*12)*k,"#bb9c7a",1.6*k)}
      }else if(f.kind==="fist"||f.kind==="impact"){
        const radius=(f.kind==="fist"?21:f.crit?17:11)*k;
        glow(x,y,radius,color,.35);
        for(let i=0;i<6;i++){const a=i*Math.PI/3+.25;line(x+Math.cos(a)*4*k,y+Math.sin(a)*4*k,x+Math.cos(a)*radius*(.6+motion),y+Math.sin(a)*radius*(.6+motion),i%2?color:"#f3e7ca",(f.kind==="fist"?2:1)*k)}
        if(f.kind==="fist"){ctx.strokeStyle=color;ctx.lineWidth=2*k;ctx.beginPath();ctx.arc(x,y,radius*(.3+motion*.6),0,Math.PI*2);ctx.stroke()}
      }else if(f.kind==="fire"){
        sigil(x,ground,31*k,"#bd784b",0);glow(x,y,35*k,"#e9813c",.35);
        for(let i=0;i<5;i++){const xx=x+(i-2)*10*k,hh=(25+15*Math.sin(i*2+1)+motion*18)*k;
          const g=ctx.createLinearGradient(xx,ground,xx,ground-hh);g.addColorStop(0,"#f1bf77bb");g.addColorStop(.6,"#c76739aa");g.addColorStop(1,"#c7673900");ctx.fillStyle=g;
          ctx.beginPath();ctx.moveTo(xx-7*k,ground);ctx.quadraticCurveTo(xx-11*k,ground-hh*.5,xx+3*k,ground-hh);ctx.quadraticCurveTo(xx,ground-hh*.3,xx+8*k,ground);ctx.fill();}
      }else if(f.kind==="frost"){
        sigil(x,ground,32*k,color,0);glow(x,y,28*k,color,.22);
        for(let i=0;i<5;i++){const xx=x+(i-2)*12*k,hh=(18+(i%3)*12)*(reduced?1:Math.min(1,t*5))*k;
          ctx.fillStyle=i%2?"#91b4c7aa":"#d1e5e9bb";ctx.beginPath();ctx.moveTo(xx-6*k,ground);ctx.lineTo(xx-3*k,ground-hh);ctx.lineTo(xx+4*k,ground-hh-7*k);ctx.lineTo(xx+7*k,ground);ctx.closePath();ctx.fill();line(xx+4*k,ground-hh-5*k,xx+1*k,ground,"#eff8ee",k);}
      }else if(f.kind==="holy"||f.kind==="ward"){
        glow(x,y,32*k,color,.25);sigil(x,ground,26*k,color,motion*.2);
        ctx.strokeStyle=color;ctx.lineWidth=1.8*k;
        if(f.kind==="ward"){ctx.beginPath();ctx.moveTo(x,y-25*k);ctx.lineTo(x+20*k,y-17*k);ctx.quadraticCurveTo(x+19*k,y+13*k,x,y+25*k);ctx.quadraticCurveTo(x-19*k,y+13*k,x-20*k,y-17*k);ctx.closePath();ctx.stroke();line(x,y-15*k,x,y+12*k,"#f7e7b6",k);line(x-8*k,y-5*k,x+8*k,y-5*k,"#f7e7b6",k)}
        else{line(x,y-35*k,x,y+25*k,color,5*k);line(x-17*k,y-5*k,x+17*k,y-5*k,color,3*k);line(x,y-32*k,x,y+22*k,"#fff1c5",1.5*k)}
      }else if(f.kind==="curse"){
        if(f.target&&!f.target.dead){const q=point(f.target);x=q.x;y=q.y}
        glow(x,y,28*k,color,.18);ctx.strokeStyle=color;ctx.lineWidth=1.2*k;
        ctx.beginPath();ctx.arc(x,y,23*k,0,Math.PI*2);ctx.stroke();
        for(let i=0;i<3;i++){const a=i*Math.PI*2/3-.5;line(x+Math.cos(a)*23*k,y+Math.sin(a)*23*k,x+Math.cos(a+2.1)*23*k,y+Math.sin(a+2.1)*23*k,color,k)}
        sigil(x,ground,29*k,color,motion*.3);
      }else if(f.kind==="roar"||f.kind==="focus"){
        sigil(x,ground,30*k,color,motion*.4);
        for(let i=0;i<3;i++){ctx.globalAlpha=Math.min(1,(1-t)*2)*(1-i*.22);ctx.strokeStyle=color;ctx.lineWidth=(2-i*.4)*k;ctx.beginPath();ctx.ellipse(x,y,(15+i*10+motion*15)*k,(23+i*8)*k,0,-1.2,1.2);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y,(15+i*10+motion*15)*k,(23+i*8)*k,0,Math.PI-1.2,Math.PI+1.2);ctx.stroke()}
      }else if(["bloom","roots","soul"].includes(f.kind)){
        sigil(x,ground,25*k,color,motion*.3);glow(x,y,29*k,color,.18);
        for(let i=0;i<5;i++){
          const a=i*Math.PI*2/5+motion*1.6,xx=x+Math.cos(a)*20*k,yy=y+Math.sin(a)*15*k-motion*12*k;
          if(f.kind==="soul"){glow(xx,yy,6*k,"#c7e2bb",.55);line(xx,yy,xx-4*k,yy+11*k,color,k)}
          else leaf(xx,yy,5*k,a,color);
        }
        if(f.kind==="roots")for(const dir of [-1,1]){ctx.strokeStyle="#839766";ctx.lineWidth=2*k;ctx.beginPath();ctx.moveTo(x+dir*24*k,ground);ctx.bezierCurveTo(x+dir*6*k,y+20*k,x+dir*36*k,y,x+dir*15*k,y-25*k);ctx.stroke()}
      }
      ctx.restore();
    }
  };
})();
