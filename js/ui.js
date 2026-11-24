(function(){
  const T=window.TBH,C=T.config,BAL=C.balance,U=T.util,E=T.events,
    el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e},
    setText=(e,v)=>{if(e&&e.__t!==v){e.__t=v;e.textContent=v}},
    refs={};
  const plural=(n,one,few,many)=>{const a=n%10,b=n%100;return a===1&&b!==11?one:a>=2&&a<=4&&(b<10||b>=20)?few:many};
  /* ===== Сгенерированные фэнтези-иконки предметов (WebP) ===== */
  const ICONS={
    sword:"assets/items/sword.webp",axe:"assets/items/axe.webp",staff:"assets/items/staff.webp",blade:"assets/items/blade.webp",
    vest:"assets/items/vest.webp",mail:"assets/items/mail.webp",shield:"assets/items/shield.webp",plate:"assets/items/plate.webp",
    coin:"assets/items/coin.webp",fang:"assets/items/fang.webp",feather:"assets/items/feather.webp",seal:"assets/items/seal.webp",
    bow:"assets/items/bow.webp",dagger:"assets/items/dagger.webp",mace:"assets/items/mace.webp",fists:"assets/items/fists.webp",wand:"assets/items/wand.webp",sickle:"assets/items/sickle.webp",robe:"assets/items/robe.webp",coat:"assets/items/coat.webp"
  };
  const SLOT_ART={weapon:"sword",armor:"shield",talisman:"coin"};
  const iconImg=(art,size)=>`<img class="iIcon" style="width:${size}px;height:${size}px" src="${ICONS[art]||ICONS.coin}?v=50" alt="">`;
  // The generated 5×2 divine artifact sheet contains sword, axe, bow, staff,
  // shield / helm, armor, ring, amulet, boots. Pick the nearest matching art.
  const DIVINE_ART={bow:[2,0],dagger:[0,0],mace:[1,0],fists:[4,0],wand:[3,0],sickle:[1,0],robe:[1,1],coat:[1,1],sword:[0,0],blade:[0,0],axe:[1,0],feather:[2,0],
    staff:[3,0],shield:[4,0],vest:[1,1],mail:[1,1],plate:[1,1],
    coin:[2,1],fang:[3,1],seal:[3,1]};
  const itemIconImg=(it,art,size)=>{
    if(!it||it.rarity!=="divine")return iconImg(art,size);
    if(["dagger","mace","fists","wand","sickle","robe","coat"].includes(art))return `<span class="newDivineArt">${iconImg(art,size)}</span>`;
    const [x,y]=DIVINE_ART[art]||[2,1];
    return `<span class="divineGeneratedIcon" role="img" aria-label="Божественное снаряжение" style="width:${size}px;height:${size}px;--icon-x:${x*25}%;--icon-y:${y*100}%"></span>`;
  };
    (function(){const s=document.createElement("style");s.textContent=`
  .skillRow{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}
  .skillChip{display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border-radius:7px;font:700 9.5px var(--mono);border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--dim);cursor:help}
  .skillChip i{font-style:normal}
  .skillChip em{font-style:normal;color:var(--faint)}
  .skillChip.pas{border-color:rgba(56,223,255,.45);color:var(--cyan);background:rgba(56,223,255,.07)}
  .skillChip.a1{border-color:rgba(255,216,102,.45);color:var(--gold2);background:rgba(255,216,102,.07)}
  .skillChip.a2{border-color:rgba(255,122,61,.45);color:var(--ember);background:rgba(255,122,61,.07)}
  .classRow{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}
  .classTag{font:900 8.5px var(--mono);letter-spacing:.5px;padding:2px 5px;border-radius:6px;border:1px solid var(--line);color:var(--faint);background:rgba(255,255,255,.03)}
  .classTag.ok{border-color:rgba(120,255,122,.5);color:var(--green);background:rgba(120,255,122,.08)}
  .classTag.no{opacity:.45;text-decoration:line-through}
  .noFit{font:700 9.5px var(--mono);color:var(--red);margin-top:3px}
  .iIcon{display:block;filter:drop-shadow(0 1px 1px rgba(0,0,0,.6))}
  /* цепочка этапов: без скролл-бара, с отступами под увеличенную босс-точку */
  .stageChain{scrollbar-width:none;-ms-overflow-style:none;padding:6px 8px}
  .stageChain::-webkit-scrollbar{display:none}
  @media(max-width:560px){
    .itemCard{flex-wrap:wrap;gap:8px}
    .itemIcon{width:40px;height:40px}
    .itemInfo{flex:1 1 55%;min-width:0}
    .itemActions{width:100%;flex-direction:row;flex-wrap:wrap;align-items:stretch;gap:6px}
    .itemActions select{flex:1 1 90px;min-width:0;font-size:11px;padding:8px}
    .itemActions .equipBtn,.itemActions .sellBtn{flex:0 0 auto;padding:9px 12px;font-size:11px}
    .classTag{font-size:8px;padding:2px 4px}
    .campCard{flex-wrap:wrap}
    .campInfo{flex:1 1 60%}
    .campCard .buyBtn{width:100%;min-width:0}
    .filters{grid-template-columns:1fr}
  }`;document.head.appendChild(s)})();
  let paused=false,modalOpen=false,modalPause=false,modalReturnFocus=null,invDirty=true,heroesDirty=true,damageDirty=true,mapCircle=null,chainKey="",damageRenderKey="";const itemHeroPick={};
  const UI=T.ui={
    isPaused:()=>paused||modalPause,
    init(){["gold","gems","dps","zoneIcon","zoneName","waveLabel","progress","stageNow","stageChain","mapBtn","autoBtn","bossBar","bossName","bossFill","bossTimerFill","bossTime","partyFill","partyText","partyStats","dropInfo","heroList","squadCount","squadActive","squadReserve","damageTotal","damageStats","itemList","bagCount","filterSlot","filterRarity","sortItems","autoSell","sellSpare","atlasGold","goldNodes","healthNodes","damageNodes","lootNodes","divineInfo","divineBuy","divineLevel","statKills","statBosses","statDrops","statTime","pauseBtn","speedBtn","soundBtn","helpBtn","resetBtn","hint","hintClose","saveDot","banner","pauseOverlay","hurt"].forEach(id=>refs[id]=document.getElementById(id));refs.dropInfo.textContent=Math.round(T.derived.dropChance()*100)+"% · 💎 "+Math.round(BAL.divine.bossGemChance*100)+"% с босса";
      buildFilters();buildAtlas();bindControls();bindInventory();renderHeroes();renderSquad();renderInventory();renderStageChain();updateAll();E.on("inv",()=>{invDirty=true;renderSquad()});E.on("heroes",()=>{heroesDirty=true;invDirty=true;renderSquad()});E.on("party",()=>{heroesDirty=true;invDirty=true;renderSquad()});E.on("sprites",()=>{heroesDirty=true;renderSquad()});E.on("gold",()=>updateRecruitButtons());E.on("damageStats",()=>{damageDirty=true});E.on("wave",()=>{damageRenderKey="";damageDirty=true;updateAll();renderStageChain()});E.on("toast",d=>toast(d.msg,d.type));E.on("banner",d=>banner(d.txt,d.cls));E.on("hurt",()=>{refs.hurt.classList.remove("on");void refs.hurt.offsetWidth;refs.hurt.classList.add("on")});E.on("saved",()=>{refs.saveDot.textContent="● локально сохранено";refs.saveDot.title="Автосохранение и резервные копии активны";refs.saveDot.style.color="var(--green)";refs.saveDot.classList.remove("flash");void refs.saveDot.offsetWidth;refs.saveDot.classList.add("flash")});E.on("saveError",()=>{refs.saveDot.textContent="● ошибка сохранения";refs.saveDot.title="Браузер не смог записать сохранение. Освободите место или экспортируйте резервную копию.";refs.saveDot.style.color="var(--red)"});E.on("victory",showVictory);if(!T.S.hint)refs.hint.style.display="none"},
    tick(){if(invDirty){invDirty=false;renderInventory()}if(heroesDirty){heroesDirty=false;renderHeroes()}if(damageDirty){damageDirty=false;renderSquadDamage()}updateAll()},
    showOffline(gold,items,secs,gems=0){
      // Сначала начисляем и сохраняем награду: Esc/перезагрузка не должны её терять или выдавать повторно.
      T.econ.addGold(gold,{raw:true});
      const crystals=Math.max(0,Math.floor(Number(gems)||0));T.S.gems+=crystals;
      items.forEach(it=>T.items.handleDrop(it,null,null,"Офлайн"));T.save();
      const list=items.map(it=>{const r=T.derived.rarityOf(it),d=T.derived.itemDef(it);return`<div class="offItem"><span>${itemIconImg(it,d.art||SLOT_ART[it.slot],18)}</span><b style="color:${r.color}">${d.name}</b><small>ур.${it.ilvl}</small></div>`}).join("");
      modal({title:"С возвращением, герой!",sub:"ОФЛАЙН-БОЙ",icon:"🌙",html:`<p>Отряд сражался <b>${U.fmtTime(secs)}</b>, пока игра была закрыта.</p><div class="offGold">+🪙 ${U.fmt(gold)}</div><div class="offGems">+💎 ${crystals} алмазов</div>${items.length?`<p><b>Найдено предметов:</b></p>${list}`:"<p>Предметов не найдено.</p>"}<p class="muted">Награда уже зачислена и сохранена.</p>`,buttons:[{label:"Продолжить"}]})
    },
    setPaused(v){paused=v;refs.pauseOverlay.classList.toggle("on",v);refs.pauseBtn.textContent=v?"▶":"⏸";refs.pauseBtn.classList.toggle("on",v);refs.pauseBtn.setAttribute("aria-pressed",String(v))}
  };
  function bindControls(){refs.pauseBtn.onclick=()=>{T.audio.init();T.audio.resume();T.audio.play("click");UI.setPaused(!paused)};refs.speedBtn.onclick=()=>{T.audio.init();T.S.settings.speed=T.S.settings.speed>=3?1:T.S.settings.speed+1;T.save();T.audio.play("click");updateAll()};refs.soundBtn.onclick=()=>{T.audio.init();T.S.settings.muted=!T.S.settings.muted;T.audio.setMuted(T.S.settings.muted);T.save();updateAll()};refs.helpBtn.onclick=()=>{T.audio.init();showHelp()};refs.resetBtn.onclick=()=>{T.audio.init();showReset()};refs.hintClose.onclick=()=>{T.S.hint=false;refs.hint.style.display="none";T.save()};refs.autoBtn.onclick=()=>{T.S.settings.auto=!T.S.settings.auto;T.save();T.audio.play("click");updateAll()};refs.mapBtn.onclick=()=>{T.audio.init();T.audio.play("click");mapCircle=null;showWorldMap()};refs.sellSpare.onclick=()=>{T.audio.init();showSellSpare()};refs.divineBuy.onclick=()=>{T.audio.init();const level=Number(refs.divineLevel.value),cost=T.econ.divineCost(level);
      if(!T.econ.buyDivine(level))toast("Нужно "+cost+" алмазов и свободное место в сумке","info")};
    refs.divineLevel.onchange=()=>{T.audio?.play("click");updateDivineShop()};/* Atlas nodes are selected in buildAtlas(); purchases use #atlasInvest. */document.querySelectorAll(".panel").forEach(p=>p.hidden=!p.classList.contains("active"));document.querySelectorAll(".mobileTabs button").forEach(b=>{b.setAttribute("type","button");b.setAttribute("aria-pressed",String(b.classList.contains("on")));b.onclick=()=>{document.querySelectorAll(".mobileTabs button").forEach(x=>{const active=x===b;x.classList.toggle("on",active);x.setAttribute("aria-pressed",String(active))});let selected=null;document.querySelectorAll(".panel").forEach(p=>{const active=p.dataset.panel===b.dataset.tab;p.classList.toggle("active",active);p.hidden=!active;if(active)selected=p});T.audio.play("click");if(selected)requestAnimationFrame(()=>selected.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"}))}});[refs.filterSlot,refs.filterRarity,refs.sortItems].forEach(s=>s.onchange=()=>{invDirty=true;T.audio.play("click")});refs.autoSell.onchange=()=>{T.S.settings.autoSell=refs.autoSell.value;T.items.sweepAutoSell(true);T.save();T.audio.play("click")}}
  function bindInventory(){
    refs.itemList.addEventListener("click",e=>{const btn=e.target.closest("button");if(!btn||btn.disabled)return;const card=btn.closest(".itemCard");if(!card)return;const uid=card.dataset.uid;if(btn.classList.contains("equipBtn")){const v=card.querySelector(".heroPick").value;if(v){itemHeroPick[uid]=v;T.items.equip(uid,v)}}else if(btn.classList.contains("sellBtn"))T.items.sell(uid);else if(btn.classList.contains("enhanceBtn"))T.items.enhance(uid)});
    refs.itemList.addEventListener("change",e=>{const sel=e.target;if(!sel.classList||!sel.classList.contains("heroPick"))return;const card=sel.closest(".itemCard");if(!card)return;const uid=card.dataset.uid;itemHeroPick[uid]=sel.value;const old=card.querySelector(".replaceHint");if(old)old.remove();const h=replaceHintFor(uid,sel.value);if(h)card.querySelector(".itemActions").append(el("div","replaceHint",h))});
  }
  function replaceHintFor(uid,heroId){
    const S=T.S,it=S.inventory.find(i=>i.uid===uid),h=heroId?S.heroes[heroId]:null;
    if(!it||!h?.rec||!T.classOk(it,heroId))return"";
    const oldUid=h.equip[it.slot],oldItem=oldUid?S.equipped[oldUid]:null,oldDef=oldItem&&T.derived.itemDef(oldItem);
    const before=oldItem?.stats||{},keys=[...new Set([...Object.keys(before),...Object.keys(it.stats||{})])];
    const deltas=keys.map(k=>({k,value:(+it.stats?.[k]||0)-(+before[k]||0)})).filter(x=>Math.abs(x.value)>.05);
    const markup=deltas.map(({k,value})=>{const meta=C.statMeta[k]||{label:k,suffix:""};return`<span class="${value>0?"up":"down"}">${value>0?"+":""}${U.round1(value)}${meta.suffix||""} ${meta.label}</span>`}).join(" · ");
    return oldItem?`Заменит: ${oldDef?.name||"предмет"}${markup?` · ${markup}`:" · характеристики не изменятся"}`:`Свободный слот${markup?` · ${markup}`:""}`;
  }
  function buildFilters(){for(const k in C.slots)refs.filterSlot.append(new Option(C.slots[k].icon+" "+C.slots[k].name,k));C.rarities.forEach(r=>refs.filterRarity.append(new Option(r.name+"+",r.id)));if(T.S.settings.autoSell!=="off"&&T.S.settings.autoSell!=="spare")T.S.settings.autoSell="spare";refs.autoSell.value=T.S.settings.autoSell}
  function heroStatLine(st){const main=st.isHealer?`✚ ${U.fmt(st.hps)} лечение/с · ⚔ ${U.fmt(st.dps)} урон/с`:`⚔ ${U.fmt(st.dps)} урон/с`;return`${main} · ❤ ${U.fmt(st.maxHp)} HP · 🛡 ${U.fmt(st.armor)} броня`}
  function skillChip(s,kind){const b=el("span","skillChip "+kind);b.innerHTML=`<i>${s.icon}</i>${s.name}${s.cd?` <em>${s.cd}с</em>`:""}`;b.title=(s.desc||"")+(s.cd?` · Перезарядка ${s.cd}с`:"");return b}
  function classRow(d){const row=el("div","classRow");const names=C.heroes.filter(h=>!d.classes||d.classes.includes(h.id)).map(h=>h.name);if(d.armorType==="heavy")row.append(el("span","classTag","Тяжёлая броня · Только танки"));row.append(el("span","classTag ok",d.classes?names.join(" · "):"Все классы"));return row}
  const zoneArt=z=>`<img class="zoneArt" src="${z.iconArt}" alt="" width="38" height="38">`;
    function drawPortrait(cv,s,size,flip){size=size||46;cv.style.imageRendering="auto";const x=cv.getContext("2d");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.clearRect(0,0,size,size);x.save();if(flip){x.translate(size,0);x.scale(-1,1)}const sc=Math.min(size/s.w,size/s.h),dw=s.w*sc,dh=s.h*sc;x.drawImage(s.c,(size-dw)/2,(size-dh)/2,dw,dh);x.restore()}
  function stageState(w){const S=T.S;return w===S.wave?"current":w>S.maxWave?"locked":w<S.maxWave?"cleared":"avail"}
  function jumpWave(w){if(w<1||w>T.S.maxWave){toast("Этап ещё недоступен — сначала пройди предыдущие","info");return false}T.audio.play("click");T.battle.startWave(w,{silent:true});return true}
  function renderStageChain(){const S=T.S,box=refs.stageChain;if(!box)return;const key=S.wave+"/"+S.maxWave;if(key===chainKey)return;chainKey=key;
    const total=T.waves.total(),zi=C.levels.findIndex(z=>z.id===T.waves.zoneFor(S.wave).zone.id),tier=Math.floor((S.wave-1)/total),base=tier*total+zi*(C.levels[zi].waves||10),n=C.levels[zi].waves||10;
    box.innerHTML="";for(let i=0;i<n;i++){const w=base+i+1,st=stageState(w),boss=T.waves.isBoss(w);const b=el("button","stageDot "+st+(boss?" boss":""));b.title=`Этап ${i+1}/${n} · Волна ${w}${boss?" · БОСС":""}${st==="locked"?" (закрыто)":""}`;b.setAttribute("aria-label",b.title);if(st==="locked")b.disabled=true;else b.onclick=()=>{jumpWave(w)};box.append(b)}
    setText(refs.stageNow,`этап ${((S.wave-1)%(C.levels[zi].waves||10))+1}/${n}`)}
  function showWorldMap(){
    const S=T.S,total=T.waves.total(),Z=C.levels;
    const curTier=Math.floor((S.wave-1)/total),maxTier=Math.floor((Math.max(S.maxWave,S.wave)-1)/total);
    if(mapCircle==null||mapCircle>maxTier)mapCircle=curTier;
    const tabs=Array.from({length:maxTier+1},(_,c)=>`<button data-circle="${c}" class="${c===mapCircle?"on":""}">Круг ${c+1}</button>`).join("");
    const zones=Z.map((z,zi)=>{const nw=z.waves||10,base=mapCircle*total+zi*nw,first=base+1,frontier=Math.min(base+nw,S.maxWave);
      const locked=first>S.maxWave,done=Math.max(0,Math.min(nw,S.maxWave-base-1));
      const isCur=T.waves.zoneFor(S.wave).zone.id===z.id&&Math.floor((S.wave-1)/total)===mapCircle;
      const stages=Array.from({length:nw},(_,i)=>{const w=base+i+1,st=stageState(w),boss=T.waves.isBoss(w);return`<button class="mapStage ${st}${boss?" boss":""}" data-wave="${w}" ${st==="locked"?"disabled":""} title="Этап ${i+1} · Волна ${w}${boss?" · "+T.waves.bossDef(w).name:""}">${boss?"👑":i+1}</button>`}).join("");
      return`<div class="mapZone${locked?" locked":""}${isCur?" cur":""}${done>=nw?" done":""}"><button class="mapNode" data-wave="${frontier}" ${locked?"disabled":""} title="${locked?"Локация закрыта":"Перейти к пройденному рубежу локации"}"><span class="mi">${zoneArt(z)}</span><span class="mn">Уровень ${zi+1} · ${z.name}</span><span class="mp">${locked?"🔒":done+"/"+nw}</span></button><div class="mapStages">${stages}</div></div>`}).join("");
    modal({title:"Карта прогресса",sub:"ЛОКАЦИИ · УРОВНИ · ЭТАПЫ",icon:"🗺",
      html:`<p>Сейчас: <b>${T.waves.zoneFor(S.wave).zone.name}</b> · круг ${curTier+1} · волна ${S.wave}. Открыто до волны <b>${S.maxWave}</b>. Клик по этапу или локации переносит отряд; закрытые этапы недоступны.</p>
        <div class="mapLegend"><span><i style="background:var(--green)"></i>текущий</span><span><i style="background:var(--gold)"></i>пройден</span><span><i style="background:rgba(56,223,255,.4);border:1px solid var(--cyan)"></i>доступен</span><span><i style="background:var(--surf2);opacity:.5"></i>закрыт</span><span>👑 босс</span></div>
        <div class="seg mapTabs">${tabs}</div><div class="mapList">${zones}</div>`,
      buttons:[{label:"Закрыть",cls:"ghostBtn"}],
      after:card=>{
        card.querySelectorAll("[data-circle]").forEach(b=>{b.onclick=()=>{mapCircle=+b.dataset.circle;T.audio.play("click");showWorldMap()}});
        card.querySelectorAll("[data-wave]").forEach(b=>{b.onclick=()=>{const w=+b.dataset.wave;if(jumpWave(w))showWorldMap()}});
      }});
  }
  function renderHeroes(){
    const S=T.S,box=refs.heroList;box.innerHTML="";
    const intro=el("div","heroRosterIntro",`<b>ГЕРОИ ЭКСПЕДИЦИИ · ${C.heroes.length} ПЕРСОНАЖЕЙ</b><span>Открой карточку героя, чтобы изучить его способности, характеристики и экипировку. Составом отряда управляй в отдельной вкладке.</span>`);box.append(intro);
    const frag=document.createDocumentFragment();
    for(const hd of C.heroes){
      const h=S.heroes[hd.id],inP=T.inParty(hd.id),tile=el("button","heroTile"+(h.rec?(inP?" recruited active":" recruited reserve"):" locked"));tile.type="button";tile.dataset.hid=hd.id;
      const portrait=el("span","heroTilePortrait"),cv=document.createElement("canvas");cv.width=112;cv.height=112;drawPortrait(cv,T.getSprite(hd,"hero")[0],112,hd.sprite?.face==="left");portrait.append(cv);
      const roleLabel=hd.role==="tank"?"Танк":hd.role==="healer"?"Лекарь":hd.range==="melee"?"Ближний бой":"Дальний бой";
      const meta=el("span","heroTileMeta");meta.innerHTML=`<b title="${hd.name}">${hd.name}</b><small>${h.rec?`Уровень ${h.lvl} · ${inP?"В отряде":"Резерв"}:`:`Доступен для найма`} · ${roleLabel}</small>`;
      const state=el("span","heroTileState",h.rec?(inP?`⚔ ${T.formation().findIndex(x=>x.id===hd.id)+1}`:"🪑"):"✦");tile.append(portrait,meta,state);tile.addEventListener("click",()=>showHeroDetails(hd.id));frag.append(tile);
    }
    box.append(frag);
  }
  function renderSquad(){
    const S=T.S,activeBox=refs.squadActive,reserveBox=refs.squadReserve;if(!activeBox||!reserveBox)return;
    const F=T.formation(),cap=T.partyCap();setText(refs.squadCount,`${F.length}/${cap} бойца`);
    activeBox.innerHTML="";reserveBox.innerHTML="";
    if(!F.length)activeBox.append(el("p","squadEmpty","Отряд пока пуст. Найми героя, чтобы начать экспедицию."));
    F.forEach((hd,i)=>{
      const hero=S.heroes[hd.id],row=el("div","squadManageCard");
      const order=el("span","squadOrder",String(i+1));
      const portrait=el("span","squadMiniPortrait"),cv=document.createElement("canvas");cv.width=128;cv.height=128;drawPortrait(cv,T.getSprite(hd,"hero")[0],128,hd.sprite?.face==="left");portrait.append(cv);
      const roleLabel=hd.role==="tank"?"Танк":hd.role==="healer"?"Лекарь":hd.range==="melee"?"Ближний бой":"Дальний бой";
      const meta=el("div","squadManageMeta",`<b>${hd.name}</b><small>Уровень ${hero.lvl} · ${roleLabel}</small>`);
      const actions=el("div","squadManageActions");
      const up=el("button","squadAction moveAction","↑");up.title="Переместить вперёд";up.disabled=i===0;up.onclick=()=>moveHero(hd.id,-1);
      const down=el("button","squadAction moveAction","↓");down.title="Переместить назад";down.disabled=i===F.length-1;down.onclick=()=>moveHero(hd.id,1);
      const reserve=el("button","squadAction","В резерв");reserve.onclick=()=>{T.audio.play("click");T.toggleParty(hd.id)};
      actions.append(up,down,reserve);
      if((C.heroes.find(x=>x.id===hd.id)?.recruitCost||0)>0){const dismiss=el("button","squadAction dismissAction","Распустить");dismiss.onclick=()=>dismissHero(hd.id);actions.append(dismiss)}
      row.append(order,portrait,meta,actions);activeBox.append(row);
    });
    const reserve=C.heroes.filter(hd=>S.heroes[hd.id]?.rec&&!T.inParty(hd.id));
    reserve.forEach(hd=>{
      const hero=S.heroes[hd.id],row=el("div","squadManageCard reserveCard"),portrait=el("span","squadMiniPortrait"),cv=document.createElement("canvas");cv.width=128;cv.height=128;drawPortrait(cv,T.getSprite(hd,"hero")[0],128,hd.sprite?.face==="left");portrait.append(cv);
      const roleLabel=hd.role==="tank"?"Танк":hd.role==="healer"?"Лекарь":hd.range==="melee"?"Ближний бой":"Дальний бой";
      const meta=el("div","squadManageMeta",`<b>${hd.name}</b><small>Уровень ${hero.lvl} · Резерв · ${roleLabel}</small>`),actions=el("div","squadManageActions");
      const add=el("button","squadAction recruitAction","В отряд");add.disabled=F.length>=cap;add.onclick=()=>{T.audio.play("click");T.toggleParty(hd.id)};actions.append(add);
      if((hd.recruitCost||0)>0){const dismiss=el("button","squadAction dismissAction","Распустить");dismiss.onclick=()=>dismissHero(hd.id);actions.append(dismiss)}
      row.append(portrait,meta,actions);reserveBox.append(row);
    });
    const available=C.heroes.filter(hd=>!S.heroes[hd.id]?.rec);
    available.forEach(hd=>{
      const row=el("div","squadManageCard recruitCard"),portrait=el("span","squadMiniPortrait"),cv=document.createElement("canvas");cv.width=128;cv.height=128;drawPortrait(cv,T.getSprite(hd,"hero")[0],128,hd.sprite?.face==="left");portrait.append(cv);
      const roleLabel=hd.role==="tank"?"Танк":hd.role==="healer"?"Лекарь":hd.range==="melee"?"Ближний бой":"Дальний бой";
      const meta=el("div","squadManageMeta",`<b>${hd.name}</b><small>Доступен для найма · ${roleLabel} · ${U.fmt(hd.recruitCost||0)} 🪙</small>`),actions=el("div","squadManageActions"),hire=el("button","squadAction recruitAction","Нанять");hire.disabled=S.gold<(hd.recruitCost||0);hire.dataset.recruitCost=String(hd.recruitCost||0);hire.onclick=()=>{T.audio.play("click");if(!T.econ.buyHero(hd.id,"1"))toast("Недостаточно золота для найма","info")};actions.append(hire);row.append(portrait,meta,actions);reserveBox.append(row);
    });
    if(!reserve.length&&!available.length)reserveBox.append(el("p","squadEmpty","Все доступные герои уже наняты и распределены."));
    renderSquadDamage();
  }
  function updateRecruitButtons(){if(!refs.squadReserve)return;refs.squadReserve.querySelectorAll("button[data-recruit-cost]").forEach(btn=>{btn.disabled=T.S.gold<Number(btn.dataset.recruitCost)})}
  function moveHero(id,dir){const order=T.formation().map(h=>h.id),i=order.indexOf(id),j=i+dir;if(i<0||j<0||j>=order.length)return;[order[i],order[j]]=[order[j],order[i]];T.audio.play("click");T.setOrder(order)}
  function dismissHero(id){const hd=C.heroes.find(x=>x.id===id);if(!hd)return;const refund=Math.floor((hd.recruitCost||0)*.35);if(!confirm(`Распустить ${hd.name}? Экипировка вернётся в инвентарь, уровень сбросится. Возврат: ${U.fmt(refund)} золота.`))return;T.audio.play("click");if(!T.econ.sellHero(id))toast("Нельзя распустить последнего бойца отряда","info")}
  function renderSquadDamage(){
    const box=refs.damageStats;if(!box)return;const totals=T.battleState.damageByHero||{},F=T.formation(),all=[...F];
    // Keep a hero visible if they dealt damage earlier in this wave and were then moved to reserve.
    for(const hd of C.heroes)if((totals[hd.id]||0)>0&&!all.some(x=>x.id===hd.id))all.push(hd);
    const total=Object.values(totals).reduce((a,v)=>a+(+v||0),0),key=F.map(h=>h.id).join(",")+"|"+C.heroes.map(h=>totals[h.id]||0).join(",");
    setText(refs.damageTotal,U.fmt(total));if(key===damageRenderKey)return;damageRenderKey=key;box.innerHTML="";
    if(!all.length){box.append(el("p","squadEmpty","Найми героев, чтобы увидеть распределение урона."));return}
    const ranked=[...all].sort((a,b)=>(totals[b.id]||0)-(totals[a.id]||0));
    ranked.forEach((hd,index)=>{const dealt=totals[hd.id]||0,pct=total>0?dealt/total*100:0,row=el("div","damageRow");row.innerHTML=`<span class="damageRank">${index+1}</span><b class="damageName">${hd.name}</b><div class="damageTrack"><i style="width:${pct.toFixed(2)}%"></i></div><strong>${U.fmt(dealt)}</strong><small>${pct.toFixed(1)}%</small>`;box.append(row)});
  }
  function showHeroDetails(id){
    const hd=C.heroes.find(x=>x.id===id),h=T.S.heroes[id];if(!hd||!h)return;
    const st=T.derived.heroStats(id),inP=T.inParty(id),sk=T.skills?.heroes?.[id],xpNeed=h.rec&&h.lvl<BAL.hero.maxLevel?T.progression.xpNeed(h.lvl):0,
      xpPct=h.rec?(h.lvl>=BAL.hero.maxLevel?100:Math.min(100,(h.xp||0)/Math.max(1,xpNeed)*100)):0;
    const partyIds=T.formation().map(x=>x.id),partyIndex=partyIds.indexOf(id),canCycle=inP&&partyIds.length>1;
    const gear=Object.keys(C.slots).map(slot=>{
      const uid=h.equip[slot],it=uid?T.S.equipped[uid]:null,d=it?T.derived.itemDef(it):null,r=it?T.derived.rarityOf(it):null,divine=it?.rarity==="divine";
      const icon=it&&d?`<div class="heroGearMain"><div class="heroGearIcon ${divine?"divine":""}" style="--rarity:${r.color}">${itemIconImg(it,d.art||SLOT_ART[it.slot],46)}</div><div class="heroGearInfo"><b style="color:${r.color}">${d.name}</b><small>${r.name} · Ур.${it.ilvl} · Закалка ${it.enhance||0}/5</small><div class="heroGearStats">${T.items.statLines(it,id).map(x=>`<span>${x}</span>`).join("")}</div></div></div><button type="button" class="heroGearEnhance" data-enhance-gear="${it.uid}" ${(it.enhance||0)>=5||T.S.gold<T.items.enhanceCost(it)?"disabled":""}>${(it.enhance||0)>=5?"✓ Максимум закалки":`⚒ Закалить · ${U.fmt(T.items.enhanceCost(it))} 🪙`}</button><button type="button" class="heroGearUnequip" data-unequip-gear="${slot}">Снять предмет</button>`:`<div class="heroGearEmpty">${C.slots[slot].icon}<small>Пустой слот</small></div>`;
      const candidates=T.S.inventory.filter(item=>item.slot===slot&&T.classOk(item,id));
      const options=candidates.map(item=>{const def=T.derived.itemDef(item),rar=T.derived.rarityOf(item);return`<option value="${item.uid}">${rar.name} · ${def.name} · Ур.${item.ilvl}</option>`}).join("");
      const picker=`<div class="heroGearEquipRow"><select class="heroGearPick" data-gear-select="${slot}" ${!h.rec||!candidates.length?"disabled":""}><option value="">${candidates.length?"Выбрать предмет…":"Нет подходящих предметов"}</option>${options}</select><button type="button" class="heroGearEquip" data-equip-gear="${slot}" disabled>Надеть</button></div>`;
      return `<div class="heroDossierGear heroGearItem ${it?(divine?"divine":""):"empty"}"><span>${C.slots[slot].icon} ${C.slots[slot].name}</span>${icon}${picker}</div>`;
    }).join("");
    const skillHtml=sk?[["Пассивный навык",sk.passive],["Способность I",sk.a1],["Способность II",sk.a2]].map(([label,x])=>`<div class="heroDossierSkill"><small>${label}</small><b>${x.name}</b><span>${x.desc}</span></div>`).join(""):"";
    const waveDamage=T.battleState.damageByHero?.[id]||0;
    const roleLabel=hd.role==="tank"?"ТАНК":hd.role==="healer"?"ЛЕКАРЬ":hd.range==="melee"?"БЛИЖНИЙ БОЙ":"ДАЛЬНИЙ БОЙ";
    const statHtml=h.rec?`<div class="heroDossierStats"><span>Урон <b>${U.fmt(st.dmg)}</b></span><span>Атаки/с <b>${U.round1(st.speed)}</b></span><span>Здоровье <b>${U.fmt(st.maxHp)}</b></span><span>Крит. шанс <b>${U.round1(st.crit)}%</b></span><span>Крит. урон <b>${U.round1(st.critDmg)}%</b></span><span>Броня <b>${U.fmt(st.armor)}</b></span><span>Урон за сражение <b data-hero-wave-damage>${U.fmt(waveDamage)}</b></span></div>`:"<p class='muted'>Герой ещё не нанят. Найм и управление составом находятся во вкладке «Отряд».</p>";
    const buttons=[{label:"Закрыть",cls:"ghostBtn"}];
    const nav=canCycle?`<button type="button" class="heroDossierNav" data-hero-prev aria-label="Предыдущий герой отряда" title="Предыдущий боец">‹</button>`:"";
    const next=canCycle?`<button type="button" class="heroDossierNav" data-hero-next aria-label="Следующий герой отряда" title="Следующий боец">›</button>`:"";
    const html=`<div class="heroDossier" data-hero-id="${id}"><div class="heroDossierTop">${nav}<div class="heroDossierPortrait"><canvas id="heroDossierCanvas" width="180" height="180"></canvas></div><div class="heroDossierBio"><h3>${hd.name}</h3><div class="heroRoleLabel">${roleLabel}</div><p>${hd.flavor||""}</p>${h.rec?`<div class="heroXp"><i style="width:${xpPct}%"></i></div><small>${h.lvl>=BAL.hero.maxLevel?"МАКС. УРОВЕНЬ 100":U.fmt(h.xp||0)+" / "+U.fmt(xpNeed)+" опыта до следующего уровня"}</small><div class="heroDossierStatus">${inP?`⚔ Отряд · позиция ${partyIndex+1}`:"🪑 Резерв"}</div>`:"<div class='heroDossierStatus'>✦ Доступен для найма · управление во вкладке «Отряд»</div>"}</div>${next}</div>${statHtml}<h4>Экипировка · снятие, замена и закалка</h4><div class="heroDossierGearGrid">${gear}</div>${skillHtml?"<h4>Навыки</h4><div class='heroDossierSkills'>"+skillHtml+"</div>":""}</div>`;
    modal({title:hd.name,sub:h.rec?`ДОСЬЕ ГЕРОЯ · УРОВЕНЬ ${h.lvl}`:"ДОСЬЕ ГЕРОЯ",icon:"⚔",html,buttons,after:card=>{
      card.classList.add("heroDossierModal");
      const cv=card.querySelector("#heroDossierCanvas");if(cv)drawPortrait(cv,T.getSprite(hd,"hero")[0],180,hd.sprite?.face==="left");
      card.querySelector("[data-hero-prev]")?.addEventListener("click",()=>{T.audio.play("click");showHeroDetails(partyIds[(partyIndex-1+partyIds.length)%partyIds.length])});
      card.querySelector("[data-hero-next]")?.addEventListener("click",()=>{T.audio.play("click");showHeroDetails(partyIds[(partyIndex+1)%partyIds.length])});
      card.querySelectorAll("[data-enhance-gear]").forEach(btn=>btn.addEventListener("click",()=>{if(T.items.enhance(btn.dataset.enhanceGear)){T.audio.play("lvl");showHeroDetails(id)}else toast("Недостаточно золота или достигнут предел закалки","info")}));
      card.querySelectorAll("[data-unequip-gear]").forEach(btn=>btn.addEventListener("click",()=>{if(T.items.unequip(id,btn.dataset.unequipGear)){T.audio.play("sell");showHeroDetails(id)}}));
      card.querySelectorAll("[data-gear-select]").forEach(sel=>sel.addEventListener("change",()=>{const btn=card.querySelector(`[data-equip-gear="${sel.dataset.gearSelect}"]`);if(btn)btn.disabled=!sel.value}));
      card.querySelectorAll("[data-equip-gear]").forEach(btn=>btn.addEventListener("click",()=>{const slot=btn.dataset.equipGear,sel=card.querySelector(`[data-gear-select="${slot}"]`);if(sel?.value&&T.items.equip(sel.value,id)){T.audio.play("equip");showHeroDetails(id)}else toast("Не удалось надеть предмет","info")}));
    }});
  }
  const ATLAS_BRANCHES={
    gold:{title:"ЗОЛОТЫЕ ТРОПЫ",sub:"Больше монет с каждого противника",icon:"🪙",
      nodes:["Медный нюх","Скупщик трофеев","Золотая жила","Кошель гильдии","Монетный двор","Казна королей","Алчный дракон","Золотой век",
        "Клеймо богатства","Тайный караван","Рудные залежи","Сборщик податей","Казначей империи","Золотой компас","Бесконечный кошель","Королевская чеканка","Сокровищница звёзд","Владыка сокровищ"],
      effect:"+3% золота"},
    health:{title:"ЗАКАЛКА ГЕРОЕВ",sub:"Увеличивает запас здоровья отряда",icon:"❤",
      nodes:["Крепкая кровь","Железная воля","Стойкость","Закалённая плоть","Сердце титана","Несокрушимость","Кровь древних","Бессмертная сталь",
        "Живая броня","Зов предков","Воля хранителя","Твёрдый дух","Каменная кожа","Вечное сердце","Дыхание земли","Клятва стойкости","Бастион жизни","Неугасаемая душа"],
      effect:"+6% здоровья"},
    damage:{title:"ВОИНСКОЕ НАСЛЕДИЕ",sub:"Усиливает базовый урон каждого героя",icon:"⚔",
      nodes:["Острый клинок","Боевой опыт","Точность удара","Мастер оружия","Искусство войны","Сила ветеранов","Гнев чемпионов","Легендарный удар",
        "Клинок рассвета","Разящий выпад","Ярость битвы","Ритуал победы","Боевой инстинкт","Мощь героев","Стальная буря","Величие оружия","Гром победы","Клинок судьбы"],
      effect:"+4% урона"},
    loot:{title:"ОХОТНИЧЬИ ЗНАНИЯ",sub:"Повышает шанс найти экипировку с монстров",icon:"🎁",
      nodes:["Следопыт","Чутьё добытчика","Охотничьи сети","Тайники","Коллекционер","Удача авантюра","Сокровища глубин","Глаз дракона",
        "Знак охотника","Шёпот трофеев","Богатая добыча","Мастер поиска","След древних","Счастливый час","Звёздный трофей","Карта кладов","Зов сокровищ","Легендарный след"],
      effect:"+1.5 п.п. к шансу добычи"}
  };
  // 18 distinct interactive passive nodes in five curved, serpentine lanes.
  // Distances are generous vertically so labels do not collide on phones.
  const ATLAS_POINTS=[
    {x:14,y:16,symbol:"✦"},{x:38,y:16,symbol:"◆"},{x:62,y:16,symbol:"✧"},{x:86,y:16,symbol:"✶"},
    {x:86,y:33,symbol:"✹"},{x:62,y:33,symbol:"✶"},{x:38,y:33,symbol:"✦"},{x:14,y:33,symbol:"✧"},
    {x:14,y:50,symbol:"✶"},{x:38,y:50,symbol:"◆"},{x:62,y:50,symbol:"✺"},{x:86,y:50,symbol:"✦"},
    {x:86,y:67,symbol:"✧"},{x:62,y:67,symbol:"✹"},{x:38,y:67,symbol:"✶"},{x:14,y:67,symbol:"✦"},
    {x:38,y:84,symbol:"✧"},{x:62,y:84,symbol:"✹"}
  ];
  const ATLAS_NS="http://www.w3.org/2000/svg";
  let atlasActiveBranch="gold",atlasSelectedIndex=0;
  function selectAtlasBranch(branch,focusTab=false){
    if(!ATLAS_BRANCHES[branch])return;
    atlasActiveBranch=branch;
    atlasSelectedIndex=Math.min(ATLAS_POINTS.length-1,T.S.atlas?.[branch]||0);
    document.querySelectorAll("[data-atlas-tab]").forEach(tab=>{
      const active=tab.dataset.atlasTab===branch;
      tab.classList.toggle("on",active);tab.setAttribute("aria-selected",String(active));tab.tabIndex=active?0:-1;
      if(active&&focusTab)tab.focus({preventScroll:true});
    });
    document.querySelectorAll("[data-atlas-scene]").forEach(scene=>{scene.hidden=scene.dataset.atlasScene!==branch});
    updateAtlas();
  }
  function buildAtlas(){
    const makeSvg=(tag,attrs)=>{const node=document.createElementNS(ATLAS_NS,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));return node};
    for(const [key,meta] of Object.entries(ATLAS_BRANCHES)){
      const box=refs[key+"Nodes"];if(!box)continue;
      box.replaceChildren();
      const route=makeSvg("svg",{class:"atlasStarRoutes",viewBox:"0 0 1000 1000",preserveAspectRatio:"none","aria-hidden":"true"});
      route.append(makeSvg("ellipse",{class:"atlasOrbit",cx:500,cy:500,rx:450,ry:410}));
      route.append(makeSvg("ellipse",{class:"atlasOrbit faint",cx:500,cy:500,rx:290,ry:320}));
      ATLAS_POINTS.forEach((p,i)=>{
        const prior=i?ATLAS_POINTS[i-1]:{x:50,y:5};
        const line=makeSvg("line",{x1:prior.x*10,y1:prior.y*10,x2:p.x*10,y2:p.y*10,class:"atlasLink","data-atlas-edge":i});
        route.append(line);
      });
      box.append(route);
      const nexus=el("div","atlasNexus");
      nexus.setAttribute("aria-hidden","true");
      nexus.innerHTML='<span>✧</span><strong>АТЛАС</strong><small data-atlas-progress>0/18</small>';
      box.append(nexus);
      meta.nodes.forEach((name,i)=>{
        const point=ATLAS_POINTS[i],b=el("button","atlasSkillNode");
        b.type="button";b.dataset.atlas=key;b.dataset.level=i;
        b.style.left=point.x+"%";b.style.top=point.y+"%";
        b.setAttribute("aria-label",name+", "+meta.effect+", ранг "+(i+1));
        b.title=name+" · "+meta.effect;
        b.innerHTML='<span class="atlasNodeOrb"><b>'+point.symbol+'</b></span><span class="atlasNodeLabel">'+name+'</span>';
        b.addEventListener("click",()=>{atlasSelectedIndex=i;updateAtlas()});
        box.append(b);
      });
    }
    document.querySelectorAll("[data-atlas-tab]").forEach(tab=>{
      tab.addEventListener("click",()=>{T.audio?.play("click");selectAtlasBranch(tab.dataset.atlasTab)});
      tab.addEventListener("keydown",e=>{
        const keys=Object.keys(ATLAS_BRANCHES),current=keys.indexOf(tab.dataset.atlasTab);
        let next;
        if(e.key==="ArrowRight")next=(current+1)%keys.length;
        else if(e.key==="ArrowLeft")next=(current+keys.length-1)%keys.length;
        else if(e.key==="Home")next=0;
        else if(e.key==="End")next=keys.length-1;
        else return;
        e.preventDefault();selectAtlasBranch(keys[next],true);
      });
    });
    const buy=document.getElementById("atlasInvest");
    if(buy)buy.onclick=()=>{
      if(T.econ.buyAtlasNode(atlasActiveBranch)){
        atlasSelectedIndex=Math.min(ATLAS_POINTS.length-1,T.S.atlas[atlasActiveBranch]);
        updateAtlas();
      }
    };
    selectAtlasBranch("gold");
  }
  function updateAtlas(){
    setText(refs.atlasGold,U.fmt(T.S.gold));
    for(const [branch,meta] of Object.entries(ATLAS_BRANCHES)){
      const box=refs[branch+"Nodes"];if(!box)continue;
      const lvl=Math.max(0,Math.min(ATLAS_POINTS.length,T.S.atlas?.[branch]||0));
      const cost=T.econ.atlasCost(branch),canBuy=T.S.gold>=cost;
      setText(box.querySelector("[data-atlas-progress]"),lvl+"/"+meta.nodes.length);
      box.querySelectorAll("[data-level]").forEach(b=>{
        const i=+b.dataset.level,learned=i<lvl,next=i===lvl;
        b.classList.toggle("learned",learned);
        b.classList.toggle("next",next);
        b.classList.toggle("affordable",next&&canBuy);
        b.classList.toggle("locked",i>lvl);
        b.classList.toggle("selected",atlasActiveBranch===branch&&i===atlasSelectedIndex);
        b.setAttribute("aria-pressed",String(atlasActiveBranch===branch&&i===atlasSelectedIndex));
        b.title=meta.nodes[i]+" · "+meta.effect+" · "+(learned?"Изучено":next?(canBuy?"Можно изучить":"Нужно золота: "+U.fmt(cost)):"Открывается после предыдущего узла");
      });
      box.querySelectorAll("[data-atlas-edge]").forEach(edge=>{
        const i=+edge.dataset.atlasEdge;
        edge.classList.toggle("learned",i<lvl);
        edge.classList.toggle("next",i===lvl);
      });
    }
    const meta=ATLAS_BRANCHES[atlasActiveBranch],lvl=T.S.atlas?.[atlasActiveBranch]||0;
    if(!meta)return;
    const i=Math.max(0,Math.min(meta.nodes.length-1,atlasSelectedIndex)),cost=BAL.atlas.nodeCosts[i]??Infinity;
    const learned=i<lvl,next=i===lvl,affordable=next&&T.S.gold>=cost;
    setText(document.getElementById("atlasSelectedIcon"),meta.icon);
    setText(document.getElementById("atlasSelectedName"),meta.nodes[i]);
    setText(document.getElementById("atlasSelectedEffect"),meta.effect+" · ранг "+(i+1)+" из "+meta.nodes.length);
    setText(document.getElementById("atlasSelectedStatus"),learned?"✓ Пассивка изучена":next?affordable?"✦ Можно изучить":"Нужно ещё "+U.fmt(Math.max(0,cost-T.S.gold))+" 🪙":"🔒 Сначала изучите предыдущие узлы");
    const invest=document.getElementById("atlasInvest");
    if(invest){invest.disabled=!affordable;setText(invest,learned?"✓ Изучено":next?"Изучить · "+U.fmt(cost)+" 🪙":"Узел закрыт")}
  }
  function renderInventory(){
    const S=T.S,box=refs.itemList,scroll=box.scrollTop;
    setText(refs.bagCount,`${S.inventory.length}/${BAL.drops.inventoryCap}`);
    const spare=T.items.spareItems(),spareGold=spare.reduce((s,i)=>s+i.value,0);
    refs.sellSpare.disabled=!spare.length;
    setText(refs.sellSpare,spare.length?`🧹 Продать лишнее · ${spare.length} шт · ${U.fmt(spareGold)}🪙`:"🧹 Лишнего нет");
    box.innerHTML="";
    let list=[...S.inventory];
    const slot=refs.filterSlot.value,rar=refs.filterRarity.value,sort=refs.sortItems.value;
    if(slot!=="all")list=list.filter(i=>i.slot===slot);
    if(rar!=="all"){const min=C.rarities.findIndex(r=>r.id===rar);list=list.filter(i=>C.rarities.findIndex(r=>r.id===i.rarity)>=min)}
    if(sort==="new")list.sort((a,b)=>parseInt(b.uid.slice(1))-parseInt(a.uid.slice(1)));else if(sort==="power")list.sort((a,b)=>T.items.power(b)-T.items.power(a));else list.sort((a,b)=>b.value-a.value);
    if(!list.length){box.append(el("div","empty","<b>Инвентарь пуст</b>Предметы падают с монстров и боссов.<br>Фармите волны — экипировка сама найдёт вас."));return}
    const recruited=C.heroes.filter(h=>S.heroes[h.id]?.rec),frag=document.createDocumentFragment();
    if(S.gearRecovery&&S.inventory.length>BAL.drops.inventoryCap)frag.append(el("div","itemRequirement","После обновления неподходящие вещи возвращены в сумку. Освободите место: новые находки будут продаваться, пока сумка переполнена."));
    for(const it of list){
      const d=T.derived.itemDef(it),r=T.derived.rarityOf(it),card=el("div","itemCard"+(it.rarity==="divine"?" divineItem":""));
      card.dataset.uid=it.uid;card.style.borderLeftColor=r.color;
      const icon=el("div","itemIcon");icon.style.borderColor=r.color;icon.innerHTML=itemIconImg(it,d.art||SLOT_ART[it.slot],50);card.append(icon);
      const info=el("div","itemInfo");info.innerHTML=`<b style="color:${r.color}">${d.name}</b><span class="meta">${r.name} · ${C.slots[it.slot].name} · Ур.${it.ilvl}</span><div class="itemStats">${T.items.statLines(it).map(s=>`<span>${s}</span>`).join("")}</div>`;info.append(classRow(d));info.append(el("div","itemRequirement","Требуется уровень "+it.ilvl));card.append(info);
      const actions=el("div","itemActions"),sel=document.createElement("select");sel.className="heroPick";
      const compat=recruited.filter(h=>T.classOk(it,h.id));
      if(compat.length){
        compat.forEach(h=>sel.append(new Option(h.name+(T.inParty(h.id)?"":" (резерв)"),h.id)));
        const pref=itemHeroPick[it.uid]&&compat.some(h=>h.id===itemHeroPick[it.uid])?itemHeroPick[it.uid]:compat[0].id;
        sel.value=pref;
      }else{sel.disabled=true;sel.append(new Option("Нет подходящих героев",""))}
      const eq=el("button","equipBtn","Надеть");eq.disabled=!compat.length;eq.title=compat.length?"Надеть на выбранного героя":"Нужен подходящий класс и уровень "+it.ilvl;
      const sell=el("button","sellBtn",`Продать ${U.fmt(it.value)}🪙`);
      const enhance=el("button","enhanceBtn",(it.enhance||0)>=5?"Закалено 5/5":`⚒ ${it.enhance||0}/5 · ${U.fmt(T.items.enhanceCost(it))}🪙`);enhance.disabled=(it.enhance||0)>=5||S.gold<T.items.enhanceCost(it);enhance.title="Улучшает все характеристики предмета на 8%. До пяти уровней.";
      actions.append(sel,eq,enhance,sell);
      if(!compat.length)actions.append(el("div","noFit",recruited.some(h=>T.allowedClass(it,h.id))?"⚠ Требуется уровень "+it.ilvl:"⚠ Нет нанятого героя подходящего класса"));
      const hint=replaceHintFor(it.uid,sel.value);if(hint)actions.append(el("div","replaceHint",hint));
      card.append(actions);frag.append(card);
    }
    box.append(frag);box.scrollTop=scroll;
  }
  function updateDivineShop(){
    const level=Number(refs.divineLevel?.value)||20,cost=T.econ.divineCost(level);
    setText(refs.divineInfo,`Уровень реликвии: ${level} · Стоимость: ${cost} 💎 · В наличии: ${T.S.gems}`);
    if(refs.divineBuy){refs.divineBuy.disabled=T.S.gems<cost||T.S.inventory.length>=BAL.drops.inventoryCap;
      const badge=refs.divineBuy.querySelector("span");if(badge)setText(badge,cost+" 💎")}
  }
  function updateAll(){
    const S=T.S,B=T.battleState,z=T.waves.zoneFor(S.wave);
    setText(refs.gold,U.fmt(S.gold));setText(refs.gems,U.fmt(S.gems));setText(refs.dps,U.fmt(T.derived.totalDps()));
    if(refs.zoneIcon.dataset.zone!==z.zone.id){refs.zoneIcon.dataset.zone=z.zone.id;refs.zoneIcon.innerHTML=zoneArt(z.zone)}setText(refs.zoneName,z.zone.name+(z.tier?` · круг ${z.tier+1}`:""));
    setText(refs.waveLabel,"Волна "+S.wave+(B.bossWave?" · БОСС":""));setText(refs.progress,`${B.waveKills}/${B.waveTotal}`);
    renderStageChain();
    refs.autoBtn.classList.toggle("on",S.settings.auto);setText(refs.autoBtn,S.settings.auto?"АВТО ▶":"ФАРМ ∞");
    setText(refs.speedBtn,"×"+S.settings.speed);
    const snd=S.settings.muted?"🔇":"🔊";
    if(refs.soundBtn.__t!==snd){setText(refs.soundBtn,snd);refs.soundBtn.title=S.settings.muted?"Включить звук (M)":"Выключить звук (M)";refs.soundBtn.setAttribute("aria-pressed",String(!S.settings.muted))}
    const bossActive=B.bossWave&&B.boss&&!B.boss.dead;refs.bossBar.classList.toggle("on",bossActive);
    if(bossActive){
      setText(refs.bossName,"👑 "+B.boss.def.name);
      const hpPct=U.clamp(B.boss.hp/Math.max(1,B.boss.maxHp)*100,0,100),timePct=U.clamp(B.bossT/BAL.boss.timer*100,0,100);
      refs.bossFill.style.width=hpPct+"%";refs.bossTimerFill.style.width=timePct+"%";
      refs.bossFill.parentElement.setAttribute("aria-valuenow",String(Math.round(hpPct)));
      refs.bossTimerFill.parentElement.setAttribute("aria-valuenow",String(Math.round(timePct)));
      setText(refs.bossTime,Math.ceil(B.bossT)+"с");
    }
    let alive=0,total=0,hp=0,maxHp=0;
    for(const hd of T.partyDefs()){const hs=S.heroes[hd.id];if(!hs?.rec)continue;total++;const st=T.derived.heroStats(hd.id);maxHp+=st.maxHp;const rt=B.hs[hd.id];if(rt&&!rt.dead){alive++;hp+=Math.max(0,rt.hp)}}
    const ppct=maxHp>0?U.clamp(hp/maxHp*100,0,100):0;
    refs.partyFill.style.width=ppct+"%";
    refs.partyFill.style.background=ppct>50?"linear-gradient(90deg,var(--green),#baff8a)":ppct>25?"linear-gradient(90deg,var(--gold),#ffe08a)":"linear-gradient(90deg,var(--red),#ff9aaa)";
    setText(refs.partyText,`${alive}/${total} в строю`);setText(refs.partyStats,`HP ${U.fmt(hp)}/${U.fmt(maxHp)}`);
    updateAtlas();setText(refs.dropInfo,`${Math.round(T.derived.dropChance()*100)}% · 💎 ${Math.round(BAL.divine.bossGemChance*100)}% с босса`);updateDivineShop();
    setText(refs.statKills,U.fmt(S.stats.kills));setText(refs.statBosses,U.fmt(S.stats.bosses));setText(refs.statDrops,U.fmt(S.stats.drops));setText(refs.statTime,U.fmtTime(S.stats.play));
    const dossier=document.querySelector(".heroDossier");if(dossier){const damage=dossier.querySelector("[data-hero-wave-damage]");if(damage)setText(damage,U.fmt(B.damageByHero?.[dossier.dataset.heroId]||0))}
    if(damageDirty){damageDirty=false;renderSquadDamage()}
  }
  function toast(msg,type="info"){const box=document.getElementById("toasts"),t=el("div","toast "+type,msg);t.onclick=()=>t.remove();box.append(t);while(box.children.length>4)box.firstChild.remove();setTimeout(()=>{t.classList.add("out");setTimeout(()=>t.remove(),260)},4200)}
  function banner(txt,cls=""){const b=refs.banner;b.className="banner";void b.offsetWidth;b.textContent=txt;b.className="banner show "+cls}
  function modal(opts){
    modalReturnFocus=document.activeElement;modalOpen=true;modalPause=!!opts.pause;
    const root=document.getElementById("modal");root.classList.add("on");
    root.innerHTML=`<div class="scrim"></div><div class="card"><div class="sub">${opts.sub||"TBH"}</div><h2 id="modalTitle" tabindex="-1">${opts.icon||""} ${opts.title}</h2><div>${opts.html}</div><div class="modalBtns"></div></div>`;
    const card=root.querySelector(".card"),heading=card.querySelector("h2"),btns=root.querySelector(".modalBtns");
    card.setAttribute("role","dialog");card.setAttribute("aria-modal","true");card.setAttribute("aria-labelledby","modalTitle");
    (opts.buttons||[{label:"OK"}]).forEach(b=>{const btn=el("button",b.cls||"bigBtn"+(b.danger?" danger":""),b.label);btn.disabled=!!b.disabled;btn.onclick=()=>{T.audio.init();T.audio.play("click");if(b.fn)b.fn();closeModal()};btns.append(btn)});
    if(opts.after)opts.after(card);
    const first=card.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    (first||heading).focus({preventScroll:true});
  }
  function closeModal(){
    const root=document.getElementById("modal"),returnFocus=modalReturnFocus;
    root.classList.remove("on");root.innerHTML="";modalOpen=false;modalPause=false;modalReturnFocus=null;
    if(returnFocus?.isConnected&&typeof returnFocus.focus==="function")returnFocus.focus({preventScroll:true});
  }
  document.addEventListener("keydown",e=>{
    if(!modalOpen)return;
    if(e.key==="Escape"){e.preventDefault();closeModal();return}
    if(e.key!=="Tab")return;
    const card=document.querySelector("#modal .card");if(!card)return;
    const focusables=[...card.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);
    if(!focusables.length){e.preventDefault();card.focus();return}
    const first=focusables[0],last=focusables[focusables.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  function hardReset(){
    try{
      const orig=T.save;
      removeEventListener("beforeunload",orig);
      removeEventListener("pagehide",orig);
      T.save=function(){};
      localStorage.setItem("tbh_wipe","1");
      localStorage.removeItem("tbh_idle_equipment_v1");
      localStorage.removeItem("tbh_backup_v1");
      for(let i=1;i<=3;i++)localStorage.removeItem("tbh_autobackup_"+i);
      localStorage.removeItem("tbh_import_flag");
    }catch(e){}
    location.reload();
  }
  function showSellSpare(){
    const spare=T.items.spareItems();
    if(!spare.length){toast("✓ Лишних предметов нет — надето всё лучшее","success");return}
    if(T.items.autoEquipPreview().changes===0){T.items.sellSpare();return}
    const total=spare.reduce((s,i)=>s+i.value,0),counts={};
    spare.forEach(i=>counts[i.rarity]=(counts[i.rarity]||0)+1);
    const line=C.rarities.filter(r=>counts[r.id]).map(r=>`<b style="color:${r.color}">${r.name} ×${counts[r.id]}</b>`).join(" · ");
    modal({title:"Продать всё лишнее?",sub:"ИНВЕНТАРЬ",icon:"🧹",
      html:`<p>К продаже: <b>${spare.length}</b> ${plural(spare.length,"предмет","предмета","предметов")} вне лучшего комплекта отряда:</p><p>${line}</p><p class="offGold">+🪙 ${U.fmt(total)}</p><p style="opacity:.75">Надетая экипировка не пострадает. Запас для ещё не нанятых героев тоже будет продан. Бой продолжается, пока окно открыто.</p>`,
      buttons:[{label:"Отмена",cls:"ghostBtn"},{label:"Продать",fn:()=>T.items.sellSpare()},{label:"✨ Надеть лучшее и продать",fn:()=>{T.items.autoEquip();T.items.sellSpare()}}]});
  }
  function showReset(){modal({title:"Сбросить сохранение?",sub:"ОПАСНАЯ ЗОНА",icon:"⚠️",html:`<p>Все герои, золото, кристаллы, предметы и прогресс будут <b style="color:var(--red)">удалены навсегда</b>, включая резервную копию переноса.</p><p style="opacity:.75">Локальные слоты 💾 и скачанные файлы-копии останутся — из них можно восстановиться.</p>`,buttons:[{label:"Отмена",cls:"ghostBtn"},{label:"Стереть всё",danger:true,fn:hardReset}]})}
  function showVictory(){const S=T.S,fin=T.waves.bossDef(T.waves.victoryWave());modal({title:"Мир покорен!",sub:"ПОБЕДА · ВОЛНА "+T.waves.victoryWave(),icon:"🏆",html:`<p>${fin.name} повержен. Но орды бесконечны — отряд готов идти дальше.</p><p><b>Убийств:</b> ${U.fmt(S.stats.kills)} · <b>Боссов:</b> ${U.fmt(S.stats.bosses)} · <b>Предметов:</b> ${U.fmt(S.stats.drops)} · <b>Время:</b> ${U.fmtTime(S.stats.play)}</p>`,buttons:[{label:"⚔ Продолжить автобой",fn:()=>{}}]})}
  function showHelp(){modal({title:"Как играть",sub:"HORDEBREAKER · IDLE RPG",icon:"📖",html:`<ul><li>Герои сражаются <b>полностью сами</b> и идут к врагу единым строем.</li><li>У каждого героя <b>пассивка</b> (голубой чип) и <b>2 активных навыка</b> (жёлтый/оранжевый) — срабатывают сами по кулдауну. Варвар провоцирует врагов, Друид усиливает лечение, а Некромант один раз за волну воскрешает первого павшего союзника с 50% HP.</li><li><b>Классовая экипировка:</b> оружие и броня доступны только указанным классам, а уровень предмета не может превышать уровень героя. Талисманы универсальны по классу.</li><li>Навигация — <b>🗺 карта прогресса</b>; цепочка точек в шапке — этапы текущей локации.</li><li>Отряд — максимум <b>4 героя</b>. <b>👥</b> — состав, <b>⚙</b> — свободное построение: любого героя можно поставить на первую позицию.</li><li>Боссы имеют пассивку и 2 активных навыка и значительно больше HP.</li><li>Экипировка падает с монстров (${Math.round(BAL.drops.chance*100)}%) и боссов (100%). При выборе героя видно сравнение характеристик. <b>✨ Автоэкипировка</b> обновляет активный отряд и не трогает экипировку резерва.</li><li><b>🧹 Продать лишнее</b> — продаёт всё вне лучшего комплекта; если лучшее надето (✓) — сразу, без окна.</li><li>Герои получают опыт за убийства, а боссы с шансом 28% оставляют алмазы. В Атласе золото улучшает добычу и здоровье. Окна не останавливают бой. Пауза — <b>P</b>. <b>M</b> — звук, <b>H</b> — справка, <b>E</b> — автоэкипировка.</li></ul>`})}
})();