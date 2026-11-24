(function(){
  const T=window.TBH,C=T.config,BAL=C.balance;
  const E=T.events=(()=>{const m={};return{on(e,f){(m[e]=m[e]||[]).push(f)},emit(e,d){(m[e]||[]).forEach(f=>{try{f(d)}catch(err){console.error(err)}})}}})();
  const U=T.util={
    clamp:(v,a,b)=>v<a?a:v>b?b:v, lerp:(a,b,t)=>a+(b-a)*t,
    rand:(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a),
    irand:(a,b)=>Math.floor(a+Math.random()*(b-a+1)), pick:a=>a[Math.floor(Math.random()*a.length)],
    round1:v=>Math.round(v*10)/10,
    fmt(n){n=Math.floor(n);if(n<1000)return""+n;const u=["К","М","Б","Т","Кв","Кн"];let i=-1,v=n;while(v>=1000&&i<u.length-1){v/=1000;i++}return(v>=100?v.toFixed(0):v>=10?v.toFixed(1):v.toFixed(2))+u[i]},
    fmtTime(s){s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);if(h)return h+"ч "+m+"м";if(m)return m+"м "+Math.floor(s%60)+"с";return s+"с"},
    hex2rgb(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]},
    rgb(c){return`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`},
    mix(a,b,t){a=a||[0,0,0];b=b||[0,0,0];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]},
    shade(hex,amt){const c=U.hex2rgb(hex).map(v=>U.clamp(v+amt,0,255));return"#"+c.map(v=>Math.round(v).toString(16).padStart(2,"0")).join("")},
    weighted(list,key){let sum=0;for(const x of list)sum+=(x[key]||0);let r=Math.random()*sum;for(const x of list){r-=(x[key]||0);if(r<=0)return x}return list[list.length-1]},
  };
  function tintOf(src,w,h,col){const t=document.createElement("canvas");t.width=w;t.height=h;const x=t.getContext("2d");x.drawImage(src,0,0);x.globalCompositeOperation="source-in";x.fillStyle=col;x.fillRect(0,0,w,h);return t}
  function wrapSprite(c,img){return{c,w:c.width,h:c.height,img:!!img,flash:tintOf(c,c.width,c.height,"#ffffff"),hurt:tintOf(c,c.width,c.height,"#ff4d62"),heal:tintOf(c,c.width,c.height,"#78ff7a")}}
  function buildSprite(rows,palette){const h=rows.length,w=Math.max(...rows.map(r=>r.length)),c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const col=palette[r[i]];if(col){x.fillStyle=col;x.fillRect(i,j,1,1)}}});return wrapSprite(c,false)}
  const FB_HERO=["....hhhh....","....hffh....","....hhhh....","..aaaaaa.w..",".faaaaaa.w..","..aaaaaa.w..","..aaaaaa....","...aa.aa....","...aa.aa....","...bb.bb...."];
  const FB_MOB=["...cccc...","..cccccc..",".ccecccec.","cccccccccc","cccccccccc",".cccccccc.","..cc..cc..","..cc..cc.."];
  const FB_BOSS=["..y......y..","..ymmmmmmy..","...meemme...","...mmmmmm...",".ddmmmmmmdd.","dddmmmmmmddd",".ddmmmmmmdd.","...mmmmmm...","..mmm..mmm..","..mm....mm.."];
  function processSheet(img,count){
    const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height,c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(img,0,0);const id=x.getImageData(0,0,w,h),d=id.data;
    const corner=(px,py)=>{const i=(py*w+px)*4;return[d[i],d[i+1],d[i+2]]};
    const bg=corner(0,0),isPink=(r,g,b)=>r>=120&&b>=120&&g<Math.min(r,b)-20;
    const isBg=(r,g,b)=>{const dist=Math.abs(r-bg[0])+Math.abs(g-bg[1])+Math.abs(b-bg[2]);return isPink(r,g,b)||dist<90};
    for(let i=0;i<d.length;i+=4)if(d[i+3]>0&&isBg(d[i],d[i+1],d[i+2]))d[i+3]=0;
    x.putImageData(id,0,0);
    const colCount=new Array(w).fill(0);for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(d[(py*w+px)*4+3]>40)colCount[px]++;
    const minCol=Math.max(3,Math.floor(h*.02)),occ=colCount.map(v=>v>=minCol);let clusters=[],start=-1;
    for(let px=0;px<=w;px++){const on=px<w&&occ[px];if(on&&start<0)start=px;if(!on&&start>=0){clusters.push([start,px-1]);start=-1}}
    const mergeGap=Math.max(4,Math.floor(w*.012)),merged=[];for(const cl of clusters){if(merged.length&&cl[0]-merged[merged.length-1][1]<=mergeGap)merged[merged.length-1][1]=cl[1];else merged.push([...cl])}
    clusters=merged;
    if(clusters.length!==count){
      if(count===1&&clusters.length>1){let best=null,bw=-1;for(const[a,b]of clusters){let s=0;for(let px=a;px<=b;px++)s+=colCount[px];if(s>bw){bw=s;best=[a,b]}}clusters=[best]}
      else{clusters=[];for(let i=0;i<count;i++)clusters.push([Math.floor(i*w/count),Math.floor((i+1)*w/count)-1])}
    }
    return clusters.map(([x0,x1])=>{
      const rowCnt=new Array(h).fill(0);
      for(let py=0;py<h;py++)for(let px=x0;px<=x1;px++)if(d[(py*w+px)*4+3]>40)rowCnt[py]++;
      const gapTol=Math.max(2,Math.floor(h*.01)),segs=[];let sStart=-1,lastOn=-1;
      for(let py=0;py<=h;py++){const on=py<h&&rowCnt[py]>0;if(on){if(sStart<0)sStart=py;lastOn=py}else if(sStart>=0&&(py-lastOn>gapTol||py===h)){segs.push([sStart,lastOn]);sStart=-1}}
      let y0=0,y1=h-1,bestSum=-1;
      for(const[a,b]of segs){let sum=0;for(let py=a;py<=b;py++)sum+=rowCnt[py];if(sum>bestSum){bestSum=sum;y0=a;y1=b}}
      let minY=h,maxY=0,minX=x1,maxX=x0;
      for(let py=y0;py<=y1;py++)for(let px=x0;px<=x1;px++)if(d[(py*w+px)*4+3]>40){if(py<minY)minY=py;if(py>maxY)maxY=py;if(px<minX)minX=px;if(px>maxX)maxX=px}
      if(maxY<minY){minY=0;maxY=h-1;minX=x0;maxX=x1}
      return{cx:minX,cy:minY,cw:maxX-minX+1,ch:maxY-minY+1,src:c}
    })
  }
  function cropRegion(img,r){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,sx=Math.round(r[0]*iw),sy=Math.round(r[1]*ih),sw=Math.max(2,Math.round(r[2]*iw)),sh=Math.max(2,Math.round(r[3]*ih)),c=document.createElement("canvas");c.width=sw;c.height=sh;c.getContext("2d").drawImage(img,sx,sy,sw,sh,0,0,sw,sh);return c}
  // внутреннее разрешение спрайта поднято (>=120px), чтобы при отрисовке не было «пикселей»
  function spriteFromBox(box,pixelHeight){const th=U.clamp(Math.max(pixelHeight||48,120),16,240),tw=Math.max(4,Math.round(box.cw*(th/box.ch))),c=document.createElement("canvas");c.width=tw;c.height=th;const x=c.getContext("2d");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(box.src,box.cx,box.cy,box.cw,box.ch,0,0,tw,th);return wrapSprite(c,true)}
  const imgCache={};function loadImage(src){if(imgCache[src])return imgCache[src];imgCache[src]=new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error("img "+src));im.src=src});return imgCache[src]}
  T.loadImage=loadImage;
  const spriteCache={};
  T.getSprite=function(def,kind){
    const key=kind+":"+def.id;if(spriteCache[key])return spriteCache[key];let out;
    if(def.sprite?.rows)out=[buildSprite(def.sprite.rows,def.sprite.palette||{})];
    else if(def.sprite?.frames)out=def.sprite.frames.map(r=>buildSprite(r,def.sprite.palette||{}));
    else{const col=def.color||"#8fa2cc",pal={h:U.shade(col,35),f:"#ffd9a8",a:col,b:U.shade(col,-55),w:"#f2f6ff",c:col,e:"#101322",m:col,d:U.shade(col,-60),y:"#ffd866"};out=[buildSprite(kind==="hero"?FB_HERO:(def.boss?FB_BOSS:FB_MOB),pal)]}
    spriteCache[key]=out;const sp=def.sprite;
    if(sp?.src){
      const count=Math.max(1,sp.count||1),index=U.clamp(sp.index||0,0,count-1);
      const apply=(img,region)=>{const cropped=region?cropRegion(img,region):img;const boxes=sp.full?[{cx:0,cy:0,cw:cropped.width,ch:cropped.height,src:cropped}]:(region?processSheet(cropped,1):processSheet(img,count));const box=boxes[region||sp.full?0:index];if(box&&box.ch>0&&box.cw/box.ch>=0.15){spriteCache[key]=[spriteFromBox(box,sp.pixelHeight)];E.emit("sprites",{id:def.id})}};
      loadImage(sp.src).then(img=>apply(img,sp.region)).catch(()=>{if(sp.fb)loadImage(sp.fb.src).then(img2=>apply(img2,sp.fb.region)).catch(()=>{})});
    }
    return out
  };
  const KEY="tbh_idle_equipment_v1";
  const CAP=()=>C.partyCap||4;
  const HERO_MIG={knight:"paladin",healer:"necro"};
  function freshHeroes(){const h={};for(const d of C.heroes){const free=(d.recruitCost||0)<=0,eq={};for(const s of Object.keys(C.slots))eq[s]=null;h[d.id]={lvl:free?1:0,rec:free,equip:eq}}return h}
  function defaults(){return{v:2,balanceVersion:BAL.progression.version,gold:BAL.startGold||0,gems:0,wave:1,maxWave:1,heroes:freshHeroes(),party:[],order:[],inventory:[],equipped:{},nextUid:1,lazaretLvl:0,mineLvl:0,atlas:{gold:0,health:0,damage:0,loot:0},settings:{speed:1,muted:false,auto:true,autoSell:"off"},prestiges:0,victory:false,hint:true,lastSeen:Date.now(),stats:{kills:0,bosses:0,gold:0,play:0,drops:0}}}
  let S=defaults(),hadSave=false,loadedRaw=null,saveBlocked=false;
  let loadingItemUids=null;
  function validateItem(it){if(!it||typeof it!=="object"||Array.isArray(it))return null;const def=C.items.find(x=>x.id===it.defId);if(!def||!C.slots[def.slot]||!it.stats||typeof it.stats!=="object"||Array.isArray(it.stats))return null;const rar=C.rarities.find(r=>r.id===it.rarity)||C.rarities[0];let uid=String(it.uid||"");if(!uid||loadingItemUids?.has(uid)){do{uid="i"+(S.nextUid++)}while(loadingItemUids?.has(uid))}if(loadingItemUids)loadingItemUids.add(uid);const stats={};for(const k of Object.keys(def.stats)){
    const legacyArmor=k==="armor"&&it.stats.armor==null&&it.stats.defPct!=null;
    const v=Number(legacyArmor?Number(it.stats.defPct)*10:it.stats[k]);
    stats[k]=Number.isFinite(v)?U.clamp(v,0,1e12):0;
  }const divineScale=Number(it.divineScale)||0;if(rar.id==="divine"&&divineScale<10.5){const factor=10.5/(divineScale>0?divineScale:5.2);for(const k in stats)stats[k]=U.round1((+stats[k]||0)*factor)}return{uid,defId:def.id,slot:def.slot,rarity:rar.id,ilvl:Math.min(BAL.hero.maxLevel,Math.max(1,it.ilvl|0||1)),stats,value:Math.max(1,it.value|0||1),enhance:Math.max(0,Math.min(5,it.enhance|0)),divineScale:rar.id==="divine"?10.5:0}}
  function ensureParty(){if(!S.party.length){const rec=C.heroes.filter(h=>S.heroes[h.id]?.rec).map(h=>h.id);S.party=rec.slice(0,CAP())}S.party=S.party.filter(id=>S.heroes[id]?.rec).slice(0,CAP());if(!S.party.length){const first=C.heroes.find(h=>S.heroes[h.id]?.rec);if(first)S.party=[first.id]}}
  T.load=function(){S=defaults();hadSave=false;loadedRaw=null;saveBlocked=false;try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);if(!d||typeof d!=="object"||Array.isArray(d))throw new Error("invalid save root");hadSave=true;loadedRaw=raw;const base=defaults();S=Object.assign(base,d);S.balanceVersion=Number(d.balanceVersion)||1;S.gold=Number.isFinite(Number(d.gold))?Math.max(0,Number(d.gold)):base.gold;S.gems=Number.isFinite(Number(d.gems))?Math.max(0,Number(d.gems)):0;S.prestiges=Math.max(0,Number(d.prestiges)|0);S.mineLvl=Math.max(0,Number(d.mineLvl)|0);S.atlas=Object.assign({gold:Math.min(BAL.atlas.maxNodes,Number(d.mineLvl)||0),health:Math.min(BAL.atlas.maxNodes,Number(d.lazaretLvl??d.wallLvl)||0),damage:0,loot:0},d.atlas&&typeof d.atlas==="object"?d.atlas:{});for(const branch of ["gold","health","damage","loot"])S.atlas[branch]=Math.max(0,Math.min(BAL.atlas.maxNodes,Number(S.atlas[branch])|0));S.victory=!!d.victory&&Number(d.maxWave)>200;S.hint=d.hint!==false;S.settings=Object.assign(base.settings,d.settings&&typeof d.settings==="object"&&!Array.isArray(d.settings)?d.settings:{});S.settings.speed=[1,2,3].includes(Number(S.settings.speed))?Number(S.settings.speed):1;S.settings.muted=!!S.settings.muted;S.settings.auto=S.settings.auto!==false;S.settings.autoSell=["off","spare",...C.rarities.map(r=>r.id)].includes(S.settings.autoSell)?S.settings.autoSell:"off";S.stats=Object.assign(base.stats,d.stats&&typeof d.stats==="object"&&!Array.isArray(d.stats)?d.stats:{});for(const key of ["kills","bosses","gold","play","drops"])S.stats[key]=Number.isFinite(Number(S.stats[key]))?Math.max(0,Number(S.stats[key])):0;S.lazaretLvl=Math.max(0,(d.lazaretLvl??d.wallLvl??0)|0);
    const fresh=freshHeroes();
    const rawH=d.heroes&&typeof d.heroes==="object"&&!Array.isArray(d.heroes)?d.heroes:{},dh={};
    for(const k in rawH){const nk=(HERO_MIG[k]&&fresh[HERO_MIG[k]]&&!rawH[HERO_MIG[k]])?HERO_MIG[k]:k;dh[nk]=rawH[k]}
    for(const id in fresh){const old=dh[id];if(old){fresh[id].lvl=Math.max(0,Math.min(BAL.hero.maxLevel,old.lvl|0));fresh[id].xp=fresh[id].lvl>=BAL.hero.maxLevel?0:Math.max(0,Number(old.xp)||0);fresh[id].rec=!!old.rec||fresh[id].lvl>0;for(const slot of Object.keys(C.slots))fresh[id].equip[slot]=typeof old.equip?.[slot]==="string"?old.equip[slot]:null}}
    S.heroes=fresh;
    let party=Array.isArray(d.party)?d.party.map(id=>(HERO_MIG[id]&&dh[HERO_MIG[id]])?HERO_MIG[id]:id).filter(id=>S.heroes[id]?.rec):C.heroes.filter(h=>S.heroes[h.id].rec).map(h=>h.id);
    party=[...new Set(party)].slice(0,CAP());S.party=party;ensureParty();
    S.order=Array.isArray(d.order)?[...new Set(d.order.map(id=>(HERO_MIG[id]&&dh[HERO_MIG[id]])?HERO_MIG[id]:id).filter(id=>S.heroes[id]?.rec))]:[];
    loadingItemUids=new Set();S.inventory=(Array.isArray(d.inventory)?d.inventory:[]).map(validateItem).filter(Boolean);S.equipped={};const rawEquipped=d.equipped&&typeof d.equipped==="object"&&!Array.isArray(d.equipped)?d.equipped:{};for(const uid in rawEquipped){const it=validateItem(rawEquipped[uid]);if(it)S.equipped[it.uid]=it}for(const hid in S.heroes){const h=S.heroes[hid];for(const slot in h.equip){const uid=h.equip[slot];if(uid&&(!S.equipped[uid]||S.equipped[uid].slot!==slot))h.equip[slot]=null}}const used=new Set();for(const hid in S.heroes)for(const s in S.heroes[hid].equip){const u=S.heroes[hid].equip[s];if(u){if(used.has(u))S.heroes[hid].equip[s]=null;else used.add(u)}}for(const uid in S.equipped)if(!used.has(uid)){S.inventory.push(S.equipped[uid]);delete S.equipped[uid]}loadingItemUids=null;const maxUid=[...S.inventory,...Object.values(S.equipped)].reduce((mx,it)=>{const m=/^i(\d+)$/.exec(String(it.uid));return m?Math.max(mx,Number(m[1])):mx},0);const nextUid=Number(S.nextUid);S.nextUid=Math.max(Number.isSafeInteger(nextUid)&&nextUid>0?nextUid:1,maxUid+1);S.wave=U.clamp(S.wave|0||1,1,999999);S.maxWave=Math.max(S.maxWave|0||1,S.wave)}}catch(e){loadingItemUids=null;hadSave=false;S=defaults();console.warn("load failed",e)}ensureParty();T.S=S;migrateBalance();recoverRestrictedGear();hsCache={};if(!S.gearRecovery)overflow(false);return{state:S,hadSave}};
  const AUTO_BAK_PREFIX="tbh_autobackup_",AUTO_BAK_COUNT=3;
  
  T.save=function(){
    if(saveBlocked){E.emit("saveError",new Error("Не удалось создать резервную копию перед обновлением баланса"));return false}
    S.lastSeen=Date.now();
    let raw;
    try{raw=JSON.stringify(S)}catch(e){console.error("Save serialization failed",e);E.emit("saveError",e);return false}
    try{
      const previous=localStorage.getItem(KEY);
      // Rotate only when the serialized save changes. Keep the previous three
      // versions so a bad import or accidental reset can be rolled back.
      if(previous&&previous!==raw){
        try{
          const newest=JSON.parse(localStorage.getItem(AUTO_BAK_PREFIX+"1")||"null");
          const now=Date.now(),due=!newest||!Number.isFinite(newest.at)||now-newest.at>=30000;
          // Rotate at most once per 30s, not every autosave tick.
          if(due){
            const prior=JSON.parse(previous);
            if(prior&&typeof prior==="object"&&!Array.isArray(prior)&&prior.heroes&&prior.wave!=null){
              for(let i=AUTO_BAK_COUNT;i>1;i--){const old=localStorage.getItem(AUTO_BAK_PREFIX+(i-1));if(old)localStorage.setItem(AUTO_BAK_PREFIX+i,old)}
              localStorage.setItem(AUTO_BAK_PREFIX+"1",JSON.stringify({at:now,raw:previous}));
            }
          }
        }catch(backupError){console.warn("Could not rotate local backup; attempting primary save",backupError)}
      }
      localStorage.setItem(KEY,raw);E.emit("saved");return true;
    }catch(e){
      console.warn("Local save failed; storage may be full or unavailable",e);
      E.emit("saveError",e);return false;
    }
  };
  T.saveBackups={keys:Array.from({length:AUTO_BAK_COUNT},(_,i)=>AUTO_BAK_PREFIX+(i+1)),get(i){try{const v=JSON.parse(localStorage.getItem(AUTO_BAK_PREFIX+(i+1))||"null");return v&&typeof v.raw==="string"?v:null}catch(e){return null}}};
  T.hadSave=()=>hadSave;
  T.inParty=id=>S.party.includes(id);
  T.partyDefs=()=>C.heroes.filter(h=>S.party.includes(h.id));
  T.partyCap=CAP;
  T.formation=()=>{const rec=T.partyDefs();if(!rec.length)return[];const ordered=S.order.filter(id=>rec.some(h=>h.id===id)).map(id=>rec.find(h=>h.id===id));for(const h of rec)if(!ordered.some(x=>x.id===h.id))ordered.push(h);return ordered};
  T.setOrder=arr=>{const allowed=new Set(S.party);S.order=[...new Set((Array.isArray(arr)?arr:[]).filter(id=>allowed.has(id)&&S.heroes[id]?.rec))];T.save();E.emit("party");E.emit("heroes")};
  T.toggleParty=id=>{const h=S.heroes[id];if(!h?.rec){E.emit("toast",{msg:"Сначала наймите героя",type:"info"});return false}const i=S.party.indexOf(id);if(i>=0){if(S.party.length<=1){E.emit("toast",{msg:"В отряде должен остаться хотя бы один герой",type:"info"});return false}S.party.splice(i,1);S.order=S.order.filter(x=>x!==id);}else{if(S.party.length>=CAP()){E.emit("toast",{msg:`Отряд полон (${CAP()}) — уберите кого-то в резерв`,type:"info"});return false}S.party.push(id);}E.emit("heroes");E.emit("party");T.save();return true};
  const TOTAL_WAVES=C.levels.reduce((s,z)=>s+(z.waves||10),0)||1;
  const totalWaves=()=>TOTAL_WAVES;
  let zfW=-1,zfV=null;
  const WU=T.waves={
    total:totalWaves,victoryWave(){return C.levelRules.victoryWave||TOTAL_WAVES},isBoss(w){return w%C.levelRules.bossEvery===0},
    zoneFor(w){if(w===zfW&&zfV)return zfV;const total=TOTAL_WAVES,tier=C.levelRules.loop?Math.floor((w-1)/total):0,idx=(w-1)%total;let acc=0,zone=C.levels[0];for(const z of C.levels){if(idx<acc+(z.waves||10)){zone=z;break}acc+=z.waves||10}zfW=w;zfV={zone,tier,hpMult:(zone.hpMult||1)*Math.pow(C.levelRules.loopHpMult||1,tier),goldMult:(zone.goldMult||1)*Math.pow(C.levelRules.loopGoldMult||1,tier)};return zfV},
    mobPool(w){const z=WU.zoneFor(w).zone,pool=(z.monsters||[]).map(id=>C.monsters[id]).filter(Boolean);return pool.length?pool:[Object.values(C.monsters).find(m=>!m.boss)||Object.values(C.monsters)[0]]},
    bossDef(w){const z=WU.zoneFor(w).zone,stage=(w-1)%(z.waves||10)+1;return C.monsters[z.bosses?.[stage]||z.boss]||Object.values(C.monsters).find(m=>m.boss)||Object.values(C.monsters)[0]},
    enemyHp(w,boss,def){const zi=WU.zoneFor(w),b=boss?(BAL.boss.hpMult*(w===WU.victoryWave()?BAL.boss.finalMult:1)):1;return Math.ceil(BAL.enemy.hpBase*Math.pow(BAL.enemy.hpGrowth,Math.min(w-1,BAL.enemy.hpSoftcapWave-1))*Math.pow(BAL.enemy.hpLateGrowth,Math.max(0,Math.min(w,BAL.enemy.endgameWave)-BAL.enemy.hpSoftcapWave))*Math.pow(BAL.enemy.hpEndgameGrowth,Math.max(0,w-BAL.enemy.endgameWave))*zi.hpMult*(def.hpMult||1)*b)},
    enemyGold(w,boss,def){const zi=WU.zoneFor(w);return Math.ceil(BAL.enemy.goldBase*Math.pow(BAL.enemy.goldGrowth,Math.min(w-1,BAL.enemy.endgameWave-1))*Math.pow(BAL.enemy.goldEndgameGrowth,Math.max(0,w-BAL.enemy.endgameWave))*zi.goldMult*(def.goldMult||1)*(boss?BAL.boss.goldMult:1))},
    count(w){return WU.isBoss(w)?1:Math.min(BAL.enemy.countMax,BAL.enemy.countBase+Math.ceil(w*BAL.enemy.countPerWave))},
    spawnInt(w){return Math.max(BAL.enemy.spawnMin,BAL.enemy.spawnBase-w*.02)},
    retreatWave(w){return Math.floor((w-1)/C.levelRules.bossEvery)*C.levelRules.bossEvery+1}
  };
  const heroDef=id=>C.heroes.find(h=>h.id===id),rarityOf=it=>C.rarities.find(r=>r.id===it.rarity)||C.rarities[0],itemDef=it=>C.items.find(i=>i.id===it.defId),sumStat=(items,k)=>items.reduce((s,it)=>s+(+it.stats[k]||0),0),equippedItems=hid=>{const h=S.heroes[hid];return h?Object.entries(h.equip).filter(([slot,uid])=>C.slots[slot]&&S.equipped[uid]?.slot===slot&&classOk(S.equipped[uid],hid)).map(([,uid])=>S.equipped[uid]):[]},allEquipped=()=>Object.values(S.equipped),relicMult=()=>1;
  const allowedClass=(it,hid)=>{const d=it&&itemDef(it),hd=heroDef(hid);return !!d&&!!hd&&it.slot===d.slot&&(d.armorType!=="heavy"||hd.role==="tank")&&(!d.classes||d.classes.includes(hid))};
  const classOk=(it,hid)=>!!S.heroes[hid]?.rec&&allowedClass(it,hid)&&Number.isInteger(it.ilvl)&&it.ilvl>=1&&it.ilvl<=S.heroes[hid].lvl;
  T.allowedClass=allowedClass;T.classOk=classOk;
  T.equipReason=(it,hid)=>!S.heroes[hid]?.rec?"Герой не нанят":!allowedClass(it,hid)?"Не подходит классу":it.ilvl>S.heroes[hid].lvl?"Требуется уровень "+it.ilvl:"";
  function recoverRestrictedGear(){
    // Old saves may contain now-ineligible items. Return them intact, even
    // if this temporarily exceeds bag capacity. Never sell migration items.
    for(const [hid,h] of Object.entries(S.heroes))for(const slot of Object.keys(C.slots)){
      const uid=h.equip[slot],it=uid&&S.equipped[uid];
      if(it&&!classOk(it,hid)){h.equip[slot]=null;S.inventory.push(it);delete S.equipped[uid];S.gearRecovery=true}
    }
  }
  const D=T.derived={heroDef,rarityOf,itemDef,equippedItems,relicMult,
    heroStats(id,itemsOverride){const def=heroDef(id),h=S.heroes[id];if(!def||!h)return{lvl:0,dmg:0,speed:0,crit:0,critDmg:0,dps:0,hps:0,maxHp:0,armor:0,defPct:0,isHealer:false};const lvl=U.clamp(h.lvl||1,1,BAL.hero.maxLevel),items=itemsOverride||equippedItems(id),isHealer=def.role==="healer";let power=def.baseDmg*lvl*Math.pow(BAL.hero.dmgGrowth,lvl-1)*Math.pow(BAL.hero.milestoneMult,Math.floor(lvl/BAL.hero.milestoneEvery))*relicMult();power*=1+((S.atlas?.damage||0)*BAL.atlas.dmgPerNode)+sumStat(items,"dmgPct")/100;const speed=def.atkSpeed*(1+sumStat(items,"atkSpd")/100),crit=U.clamp(BAL.crit.baseChance+sumStat(items,"crit"),0,75),critDmg=BAL.crit.baseDamage+sumStat(items,"critDmg"),expected=power*speed*(1+crit/100*(critDmg/100-1)),baseHp=(def.baseHp||100)+(def.hpPerLevel||0)*(lvl-1),maxHp=Math.ceil(baseHp*(1+(S.atlas?.health||0)*BAL.atlas.hpPerNode)+sumStat(items,"hpFlat")),armor=Math.max(0,sumStat(items,"armor")),defPct=Math.min(BAL.combat.defCap,100*armor/(armor+BAL.combat.armorConstant+S.wave*BAL.combat.armorWaveScale)),regen=def.baseRegen??.6;return{lvl,dmg:power,speed,crit,critDmg,dps:isHealer?0:expected,hps:isHealer?expected:0,maxHp,armor,defPct,regen,isHealer}},
    totalDps(){return T.partyDefs().reduce((s,h)=>s+D.heroStats(h.id).dps,0)},
    totalHps(){return T.partyDefs().reduce((s,h)=>s+D.heroStats(h.id).hps,0)},
    globalGear(){return{goldPct:sumStat(allEquipped(),"goldPct")}},
    goldMult(){return(1+(S.atlas?.gold||0)*BAL.atlas.goldPerNode)*(1+D.globalGear().goldPct/100)},
    dropChance(){return Math.min(.45,BAL.drops.chance+(S.atlas?.loot||0)*BAL.atlas.lootPerNode)}
  };
  let hsCache={};
  const hsRaw=D.heroStats;
  D.heroStats=(id,ov)=>ov?hsRaw(id,ov):(hsCache[id]||(hsCache[id]=hsRaw(id)));
  E.on("heroes",()=>{hsCache={}});
  E.on("inv",()=>{hsCache={}});
  E.on("party",()=>{hsCache={}});
  E.on("wave",()=>{hsCache={}}); // armor mitigation depends on the current enemy wave
  const xpNeed=lvl=>Math.ceil(BAL.progression.xpRequiredBase+Math.max(0,lvl-1)*BAL.progression.xpPerLevel);
  const campaignLevels=[1];
  {let level=1,xp=0;for(let wave=1;wave<=TOTAL_WAVES;wave++){
    xp+=Math.ceil(BAL.progression.xpBase+wave*BAL.progression.xpWave)*(WU.isBoss(wave)?5:WU.count(wave));
    while(level<BAL.hero.maxLevel&&xp>=xpNeed(level)){xp-=xpNeed(level);level++}campaignLevels[wave]=level;
  }}
  const levelForWave=wave=>campaignLevels[U.clamp(Math.floor(Number(wave)||1),1,TOTAL_WAVES)];
  function migrateBalance(){
    if(!hadSave||S.balanceVersion>=BAL.progression.version)return;
    try{const key="tbh_balance_backup_v55";if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({at:Date.now(),raw:loadedRaw}))}
    catch(e){saveBlocked=true;console.error("Balance migration postponed: backup failed",e);return}
    for(const h of Object.values(S.heroes)){
      if(!h.rec)continue;
      let total=Number(h.xp)||0;
      for(let level=1;level<h.lvl;level++)total+=Math.ceil(BAL.progression.xpBase*Math.pow(BAL.progression.legacyXpGrowth,level-1));
      h.lvl=1;while(h.lvl<BAL.hero.maxLevel&&total>=xpNeed(h.lvl)){total-=xpNeed(h.lvl);h.lvl++}
      h.xp=h.lvl>=BAL.hero.maxLevel?0:total;
    }
    for(const it of [...S.inventory,...Object.values(S.equipped)]){
      if(it.rarity==="divine")continue;
      const oldLevel=it.ilvl,newLevel=levelForWave(oldLevel);
      const ratio=(1+(newLevel-1)*BAL.drops.itemLevelScale)/(1+(oldLevel-1)*BAL.drops.itemLevelScale);
      for(const stat in it.stats)it.stats[stat]=U.round1(it.stats[stat]*ratio);
      it.value=Math.max(1,Math.round(it.value*(BAL.drops.sellBase+newLevel*BAL.drops.sellPerLevel)/(BAL.drops.sellBase+oldLevel*BAL.drops.sellPerLevel)));
      it.ilvl=newLevel;
    }
    S.balanceVersion=BAL.progression.version;
    if(S.inventory.length>BAL.drops.inventoryCap)S.gearRecovery=true;
    T.balanceUpdated=true;
  }
  T.progression={xpNeed,levelForWave,awardKill(wave,boss){const xp=Math.ceil(BAL.progression.xpBase+Math.max(1,wave)*BAL.progression.xpWave)*(boss?5:1);const levels=[];for(const id of S.party){const h=S.heroes[id];if(!h?.rec)continue;const previousLevel=h.lvl,penalty=Math.max(.1,Math.min(1,(levelForWave(wave)+5)/Math.max(1,h.lvl)));h.xp=(h.xp||0)+Math.max(1,Math.floor(xp*penalty));while(h.lvl<BAL.hero.maxLevel&&h.xp>=xpNeed(h.lvl)){h.xp-=xpNeed(h.lvl);h.lvl++}
      if(h.lvl>=BAL.hero.maxLevel){h.lvl=BAL.hero.maxLevel;h.xp=0}if(h.lvl>previousLevel)levels.push({heroId:id,level:h.lvl})}if(levels.length){E.emit("heroes");levels.forEach(level=>E.emit("levelUp",level));E.emit("sfx","lvl")}return xp}};
  function slotScore(it,slot){const s=it.stats;if(slot==="armor")return(s.armor||0)*.4+(s.hpFlat||0)*.12+(s.goldPct||0)*.6;return(s.dmgPct||0)*3+(s.atkSpd||0)*3+(s.crit||0)*4+(s.critDmg||0)*1.2+(s.goldPct||0)*.6}
  function overflow(needsSlot=true){
     const cap=Math.max(1,BAL.drops.inventoryCap|0),target=needsSlot?cap-1:cap;
     if(S.inventory.length<=target)return;
     let total=0;
     while(S.inventory.length>target){
       const best=T.items?.bestUids?.()||new Set();
       let wi=0;
       for(let i=1;i<S.inventory.length;i++){
         const a=S.inventory[i],b=S.inventory[wi],aKeep=best.has(a.uid),bKeep=best.has(b.uid);
         if((!aKeep&&bKeep)||(aKeep===bKeep&&T.items.power(a)<T.items.power(b)))wi=i;
       }
       const [sold]=S.inventory.splice(wi,1);total+=sold.value;
     }
     if(total>0){S.gold+=total;S.stats.gold+=total;E.emit("gold",{amount:total,x:null,y:null,raw:true})}
   }
  function addRawGold(n,x,y){n=Math.ceil(n);S.gold+=n;S.stats.gold+=n;E.emit("gold",{amount:n,x,y,raw:true})}
  const IT=T.items={
    power(it){let p=0;for(const k in it.stats)if(k!=="regen")p+=it.stats[k]*(C.statMeta[k]?.weight||1);return p},
    statLines(it,hid){return Object.keys(it.stats).filter(k=>k!=="regen").map(k=>{const m=C.statMeta[k]||{label:k,suffix:"",icon:"•"};const healers=hid?heroDef(hid)?.role==="healer":C.heroes.some(h=>h.role==="healer"&&allowedClass(it,h.id));const label=k==="dmgPct"?(healers?"урон и лечение":"урон"):m.label;return`${m.icon} +${U.round1(it.stats[k])}${m.suffix} ${label}`})},
    roll(wave,boss){const rar=U.weighted(C.rarities,boss?"bossWeight":"weight"),def=U.pick(wave<=10&&Math.random()<.55?C.items.filter(d=>!d.classes||d.classes.some(id=>S.party.includes(id))):C.items),ilvl=U.clamp(levelForWave(wave)+U.irand(-1,1)+(boss?1:0),1,BAL.hero.maxLevel),stats={};for(const k in def.stats)stats[k]=U.round1(def.stats[k]*(1+(ilvl-1)*BAL.drops.itemLevelScale)*rar.mult*U.rand(.9,1.1));const value=Math.ceil((BAL.drops.sellBase+ilvl*BAL.drops.sellPerLevel)*rar.mult*rar.mult*(boss?1.5:1));return{uid:"i"+(S.nextUid++),defId:def.id,slot:def.slot,rarity:rar.id,ilvl,stats,value,enhance:0}},
    handleDrop(item,x,y,source){const r=D.rarityOf(item),def=itemDef(item),idx=C.rarities.findIndex(q=>q.id===r.id),th=S.settings.autoSell,thIdx=th==="off"?-1:C.rarities.findIndex(q=>q.id===th);S.stats.drops++;if(thIdx>=0&&idx<=thIdx){addRawGold(item.value,x,y);E.emit("drop",{item,x,y,autoSold:true,source});return}if(th==="spare"&&!IT.bestUids([item]).has(item.uid)){addRawGold(item.value,x,y);E.emit("drop",{item,x,y,autoSold:true,source});return}if(S.gearRecovery&&S.inventory.length>BAL.drops.inventoryCap){addRawGold(item.value,x,y);E.emit("drop",{item,x,y,autoSold:true,source});return}S.inventory.push(item);IT.sweepAutoSell();overflow(false);const autoSold=!S.inventory.some(i=>i.uid===item.uid);E.emit("inv");E.emit("drop",{item,x,y,autoSold,source});if(idx>=3&&!autoSold)E.emit("toast",{msg:`${def.icon} ${r.name} дроп: ${def.name}!`,type:"drop"})},
    maybeDrop(wave,boss,x,y,source){let n=0;if(Math.random()<(boss?BAL.drops.bossChance:D.dropChance()))n++;if(boss&&Math.random()<BAL.drops.bossExtraChance)n++;for(let i=0;i<n;i++)IT.handleDrop(IT.roll(wave,boss),x,y,source)},
    equip(uid,heroId){const idx=S.inventory.findIndex(i=>i.uid===uid),h=S.heroes[heroId];if(idx<0||!h||!h.rec)return false;const it=S.inventory[idx];
      if(!classOk(it,heroId)){E.emit("toast",{msg:itemDef(it).name+": "+T.equipReason(it,heroId),type:"danger"});return false}
      // Сначала забираем выбранный предмет из сумки: освободившийся слот
      // гарантирует, что старая экипировка вернётся без автопродажи другого предмета.
      const [selected]=S.inventory.splice(idx,1),slot=selected.slot,oldUid=h.equip[slot];
      if(oldUid&&S.equipped[oldUid]){S.inventory.push(S.equipped[oldUid]);delete S.equipped[oldUid]}
      S.equipped[uid]=selected;h.equip[slot]=uid;IT.sweepAutoSell();E.emit("inv");E.emit("heroes");E.emit("sfx","equip");T.save();return true},
    unequip(heroId,slot){const h=S.heroes[heroId];if(!h)return false;const uid=h.equip[slot];if(!uid||!S.equipped[uid])return false;if(S.inventory.length>=BAL.drops.inventoryCap){E.emit("toast",{msg:"Сумка заполнена — освободите место, чтобы снять предмет",type:"danger"});return false}
       const it=S.equipped[uid];S.inventory.push(it);delete S.equipped[uid];h.equip[slot]=null;E.emit("inv");E.emit("heroes");E.emit("sfx","sell");T.save();return true},
    sell(uid){const idx=S.inventory.findIndex(i=>i.uid===uid);if(idx<0)return false;const it=S.inventory[idx];S.inventory.splice(idx,1);addRawGold(it.value);E.emit("inv");E.emit("sfx","sell");T.save();return true},
    enhanceCost(it){return Math.ceil(it.value*((it.enhance||0)+1)*3)},
    enhance(uid){const it=S.inventory.find(x=>x.uid===uid)||S.equipped[uid];if(!it||(it.enhance||0)>=5)return false;const cost=IT.enhanceCost(it);if(S.gold<cost)return false;S.gold-=cost;it.enhance=(it.enhance||0)+1;for(const k in it.stats)it.stats[k]=U.round1(it.stats[k]*1.08);E.emit("inv");E.emit("heroes");E.emit("toast",{msg:`⚒ Снаряжение закалено: +8% · ${it.enhance}/5`,type:"success"});E.emit("sfx","lvl");T.save();return true},
    bestUids(extra){const p=IT.autoEquipPreview(extra),keep=new Set(p.reservedUids||[]);for(const h of p.heroes)for(const s of p.slots){const u=p.assign[h.id]?.[s];if(u)keep.add(u)}
      // Keep future-level and reserve gear only for recruited compatible heroes.
      for(const it of p.all)if(!p.heroes.some(h=>classOk(it,h.id))&&C.heroes.some(h=>S.heroes[h.id]?.rec&&allowedClass(it,h.id)))keep.add(it.uid);
      return keep},
    sweepAutoSell(explicit=false){if(S.settings.autoSell!=="spare"||(!explicit&&S.gearRecovery))return 0;if(explicit)S.gearRecovery=false;const spare=IT.spareItems();if(!spare.length)return 0;return IT.sellSpare()},
    spareItems(){const keep=IT.bestUids();return S.inventory.filter(it=>!keep.has(it.uid))},
    sellSpare(){const spare=IT.spareItems();if(!spare.length){E.emit("toast",{msg:"✓ Лишних предметов нет — надето всё лучшее",type:"info"});return 0}const uids=new Set(spare.map(i=>i.uid));const total=spare.reduce((s,i)=>s+i.value,0);S.inventory=S.inventory.filter(i=>!uids.has(i.uid));addRawGold(total);E.emit("inv");E.emit("toast",{msg:`🧹 Продано ${spare.length} предметов за ${U.fmt(total)}🪙`,type:"gold"});E.emit("sfx","chest");T.save();return spare.length},
    autoEquipPreview(extra){
      const heroes=T.partyDefs(),activeIds=new Set(heroes.map(h=>h.id)),slots=Object.keys(C.slots),
        reservedItems=[],reservedUids=new Set();
      // Предметы неактивных героев остаются закреплёнными за резервом и не участвуют в подборе.
      for(const hd of C.heroes){
        if(activeIds.has(hd.id))continue;
        for(const slot of slots){const uid=S.heroes[hd.id]?.equip?.[slot],it=uid&&S.equipped[uid];if(it){reservedItems.push(it);reservedUids.add(uid)}}
      }
      const activeEquipped=Object.values(S.equipped).filter(i=>!reservedUids.has(i.uid));
      const all=[...S.inventory,...activeEquipped,...(extra||[])],byUid={};
      all.forEach(i=>byUid[i.uid]=i);
      const assign={};for(const h of heroes){assign[h.id]={};for(const slot of slots){const uid=S.heroes[h.id].equip[slot];assign[h.id][slot]=uid&&byUid[uid]&&classOk(byUid[uid],h.id)?uid:null}}
      const used=new Set(heroes.flatMap(h=>slots.map(slot=>assign[h.id][slot]).filter(Boolean)));
      const itemsFor=hid=>slots.map(slot=>assign[hid]?.[slot]).filter(Boolean).map(uid=>byUid[uid]).filter(Boolean);
      const scoreFor=(hid,items)=>{
        const st=D.heroStats(hid,items),output=st.isHealer?st.hps:st.dps;
        return Math.log1p(Math.max(0,output))*100+Math.log1p(Math.max(0,st.maxHp/(1-st.defPct/100)))*(heroDef(hid).role==="tank"?35:14)+
          items.reduce((v,it)=>v+(+it.stats.goldPct||0),0)*.15;
      };
      // Never overwrite a hero's existing slot with a worse item merely because
      // that item has a higher generic rating. Consider actual hero statistics.
      for(let pass=0;pass<3;pass++){
        let changed=false;
        for(const h of heroes)for(const slot of slots){
          const current=assign[h.id][slot],beforeItems=itemsFor(h.id);
          const before=scoreFor(h.id,beforeItems);
          let best=current,bestGain=0;
          for(const it of all){
            if(it.slot!==slot||used.has(it.uid)||!classOk(it,h.id))continue;
            const trial=beforeItems.filter(x=>x.slot!==slot).concat(it);
            const gain=scoreFor(h.id,trial)-before;
            const oldSt=D.heroStats(h.id,beforeItems),newSt=D.heroStats(h.id,trial);
            const oldOutput=oldSt.isHealer?oldSt.hps:oldSt.dps,newOutput=newSt.isHealer?newSt.hps:newSt.dps;
            if(newOutput+1e-8<oldOutput)continue;
            if(gain>bestGain+1e-6){bestGain=gain;best=it.uid}
          }
          if(best!==current){if(current)used.delete(current);assign[h.id][slot]=best;used.add(best);changed=true}
        }
        if(!changed)break;
      }
      let dpsAfter=0;for(const h of heroes)dpsAfter+=D.heroStats(h.id,itemsFor(h.id)).dps;
      const dpsBefore=D.totalDps();let changes=0;
      for(const h of heroes)for(const slot of slots)if((S.heroes[h.id].equip[slot]||null)!==(assign[h.id][slot]||null))changes++;
      const util=items=>{const sum=k=>items.reduce((a,i)=>a+(+i.stats[k]||0),0);return{gold:sum("goldPct"),def:sum("armor"),hp:sum("hpFlat")}};
      const afterUids=[...reservedUids];for(const h of heroes)for(const slot of slots){const uid=assign[h.id][slot];if(uid)afterUids.push(uid)}
      const utilBefore=util(Object.values(S.equipped)),utilAfter=util(afterUids.map(uid=>byUid[uid]||reservedItems.find(i=>i.uid===uid)).filter(Boolean)),
        dpsGain=dpsBefore>0?(dpsAfter/dpsBefore-1)*100:0,
        improved=changes>0;
      return{heroes,slots,all,byUid,assign,changes,dpsBefore,dpsAfter,dpsGain,improved,utilBefore,utilAfter,reservedItems,reservedUids};
    },
    autoEquip(){
      const p=IT.autoEquipPreview();
      if(!p.heroes.length){E.emit("toast",{msg:"Нет активных героев",type:"danger"});return p}
      if(!p.changes){E.emit("toast",{msg:"✓ Уже надета лучшая экипировка",type:"success"});E.emit("sfx","click");return p}
      const assigned=new Set(p.reservedUids||[]),newEquipped={};
      // Сохраняем экипировку резерва без изменений.
      for(const it of p.reservedItems||[])newEquipped[it.uid]=it;
      for(const h of p.heroes)for(const slot of p.slots){
        const uid=p.assign[h.id]?.[slot]||null;
        S.heroes[h.id].equip[slot]=uid;
        if(uid){assigned.add(uid);newEquipped[uid]=p.byUid[uid]}
      }
      S.equipped=newEquipped;
      S.inventory=p.all.filter(i=>!assigned.has(i.uid));IT.sweepAutoSell();
      E.emit("inv");E.emit("heroes");E.emit("sfx","equip");
      const gainTxt=p.dpsGain>.05?` · +${p.dpsGain.toFixed(1)}% ДПС`:"";
      E.emit("toast",{msg:`✨ Автоэкипировка: слотов обновлено ${p.changes}${gainTxt}`,type:"success"});
      
      T.save();return p;
    }
  };
  const costSum=(base,r,lvl,n)=>base*Math.pow(r,lvl)*(Math.pow(r,n)-1)/(r-1),maxBuy=(base,r,lvl,gold)=>gold<=0?0:Math.min(500,Math.floor(Math.log(gold*(r-1)/(base*Math.pow(r,lvl))+1)/Math.log(r)));
  const EC=T.econ={costSum,maxBuy,
    addGold(n,opt={}){const amount=Math.ceil(n*(opt.raw?1:D.goldMult()));S.gold+=amount;S.stats.gold+=amount;E.emit("gold",{amount,x:opt.x,y:opt.y,raw:!!opt.raw});return amount},
    heroCost(id,qty){const def=heroDef(id),h=S.heroes[id],n=qty==="max"?Math.max(1,maxBuy(def.costBase,BAL.hero.costGrowth,h.lvl,S.gold)):parseInt(qty,10),cost=costSum(def.costBase,BAL.hero.costGrowth,h.lvl,n);return{n,cost,affordable:S.gold>=cost&&(qty!=="max"||maxBuy(def.costBase,BAL.hero.costGrowth,h.lvl,S.gold)>=1)}},
    buyHero(id,qty){const def=heroDef(id),h=S.heroes[id];if(!h.rec){if(S.gold<(def.recruitCost||0))return false;S.gold-=def.recruitCost||0;h.rec=true;h.lvl=1;if(S.party.length<CAP())S.party.push(id);E.emit("heroes");E.emit("party");E.emit("toast",{msg:`🎉 ${def.name} вступает в отряд!`,type:"success"});E.emit("sfx","recruit");T.save();return true}return false},
    sellHero(id){const def=heroDef(id),h=S.heroes[id];if(!def||!h?.rec||!(def.recruitCost>0))return false;if(S.party.includes(id)&&S.party.length<=1){E.emit("toast",{msg:"Нельзя распустить последнего героя в отряде",type:"info"});return false}
       const equippedCount=Object.values(h.equip).filter(uid=>uid&&S.equipped[uid]).length;
       if(S.inventory.length+equippedCount>BAL.drops.inventoryCap){E.emit("toast",{msg:"Недостаточно места в сумке для экипировки распускаемого героя",type:"danger"});return false}
       for(const slot of Object.keys(C.slots))if(h.equip[slot])IT.unequip(id,slot);S.party=S.party.filter(x=>x!==id);S.order=S.order.filter(x=>x!==id);const refund=Math.floor(def.recruitCost*.35);S.gold+=refund;S.stats.gold+=refund;h.rec=false;h.lvl=0;h.xp=0;E.emit("heroes");E.emit("party");E.emit("toast",{msg:`${def.name} распущен · +${U.fmt(refund)}🪙`,type:"success"});E.emit("sfx","sell");T.save();return true},
    atlasCost(branch){const lvl=S.atlas?.[branch]||0;return BAL.atlas.nodeCosts[lvl]||Infinity},
    buyAtlasNode(branch){if(!["gold","health","damage","loot"].includes(branch))return false;const lvl=S.atlas[branch]||0,cost=EC.atlasCost(branch);if(lvl>=BAL.atlas.maxNodes||S.gold<cost)return false;S.gold-=cost;S.atlas[branch]=lvl+1;E.emit("heroes");E.emit("toast",{msg:({gold:"🪙 Атлас: добыча золота усилена",health:"❤ Атлас: здоровье героев увеличено",damage:"⚔ Атлас: урон отряда увеличен",loot:"🎁 Атлас: шанс добычи повышен"})[branch],type:"success"});E.emit("sfx","lvl");T.save();return true},
    divineCost(level){const idx=BAL.divine.levels.indexOf(Number(level));return idx<0?Infinity:BAL.divine.prices[idx]},
    buyDivine(level=20){
       const lvl=Number(level),cost=EC.divineCost(lvl);
       if(!Number.isFinite(cost)||S.gems<cost)return false;
       if(S.inventory.length>=BAL.drops.inventoryCap){E.emit("toast",{msg:"Сумка заполнена — освободите место перед обменом алмазов",type:"danger"});return false}
       // Roll the base item first and scale by the selected EQUIPMENT item level,
       // not by the current wave or hero level. Avoid multiplying level twice.
       const base=IT.roll(lvl,true),def=itemDef(base),rar=D.rarityOf({rarity:"divine"});
       const sourceIlvl=base.ilvl,scale=(1+(lvl-1)*BAL.drops.itemLevelScale)/(1+(sourceIlvl-1)*BAL.drops.itemLevelScale);
       const mult=(rar.mult||BAL.divine.statMult)/(D.rarityOf(base).mult||1);
       base.ilvl=lvl;base.rarity="divine";base.divineScale=10.5;
       base.stats=Object.fromEntries(Object.entries(base.stats).map(([k,v])=>[k,U.round1(v*scale*mult)]));
       base.value=Math.ceil(base.value*mult*scale);
       S.gems-=cost;S.inventory.push(base);S.stats.drops++;E.emit("inv");E.emit("gems");
       E.emit("toast",{msg:`✨ ${def.name} · божественное снаряжение ур.${lvl}!`,type:"success"});
       E.emit("sfx","bossdie");T.save();return true
    }
  };
  // Офлайн-награды рассчитываются по фактическому пулу текущей зоны,
  // а не по условному врагу с hpMult/goldMult = 1.
  T.offlineReward=seconds=>{
    const dt=Math.min(Math.max(0,Number(seconds)||0),BAL.offline.maxSeconds),pool=T.waves.mobPool(S.wave),count=Math.max(1,pool.length);
    const avgHp=pool.reduce((sum,def)=>sum+T.waves.enemyHp(S.wave,false,def),0)/count;
    const avgGold=pool.reduce((sum,def)=>sum+T.waves.enemyGold(S.wave,false,def),0)/count;
    const dps=T.derived.totalDps(),healerPower=T.partyDefs().filter(h=>D.heroStats(h.id).isHealer).reduce((v,h)=>v+D.heroStats(h.id).hps,0);
     const effectiveDps=dps+(dps>0?healerPower*.25:healerPower);
     const potentialKills=effectiveDps/Math.max(1,avgHp)*dt*BAL.offline.efficiency;
     // Limit simulated farming to the actual enemy spawn cadence. Otherwise a
     // level-100 party in an early zone can earn billions while AFK.
     const spawnCap=dt/Math.max(BAL.enemy.spawnMin,T.waves.spawnInt(S.wave))*BAL.offline.efficiency;
     const kills=Math.min(potentialKills,spawnCap);
     const gold=Math.floor(kills*avgGold*T.derived.goldMult()),n=Math.min(BAL.drops.offlineItemCap,Math.floor(kills*T.derived.dropChance()));
    // A conservative number of simulated boss opportunities: rewards are
    // never inferred from an unlimited count of high-DPS offline kills.
    const attempts=Math.min(BAL.offline.maxGemAttempts,Math.floor(kills/BAL.offline.killsPerBossAttempt));
    let gems=0;
    for(let i=0;i<attempts;i++)if(Math.random()<BAL.divine.bossGemChance)gems++;
    gems=Math.min(gems,BAL.offline.maxGems);
    return{seconds:dt,kills,gold,gems,items:Array.from({length:n},()=>T.items.roll(S.wave,false))};
  };
  T.toast=(msg,type="info")=>E.emit("toast",{msg,type});
})();
