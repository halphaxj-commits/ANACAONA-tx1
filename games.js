/* SCOUT HUB V30.6 — Offline Scout games + Android Play launch */
const Games = (() => {
  // These are external Android apps. Their core/offline modes are provided by
  // their own developers; SCOUT HUB only links/launches them.
  const externalGames = [
    {id:'semo-play',icon:'🚩',title:'SEMO Play',desc:'Jeu rapide Semaphore + Morse, avec défis et difficulté progressive.',package:'dieuk.semoplay',url:'https://play.google.com/store/apps/details?id=dieuk.semoplay'},
    {id:'belajar-pramuka',icon:'🏕️',title:'Belajar Pramuka + Suara',desc:'Jeux Scout : traces, Morse, sémaphore et objets Scout.',package:'com.solitekids.secilpramuka',url:'https://play.google.com/store/apps/details?id=com.solitekids.secilpramuka'},
    {id:'quiz-morse',icon:'📡',title:'Quiz Morse',desc:'Quiz Morse + Time Attack jouables hors connexion.',package:'eu.netcreator.quizmorse',url:'https://play.google.com/store/apps/details?id=eu.netcreator.quizmorse'},
    {id:'knotcraft',icon:'🪢',title:'KnotCraft',desc:'60+ nœuds gratuits avec apprentissage pratique.',package:'net.northpeak.knotcraft',url:'https://play.google.com/store/apps/details?id=net.northpeak.knotcraft'},
    {id:'scout-knots',icon:'🧶',title:'Scout Knots',desc:'Collection de nœuds Scout utilisable hors connexion.',package:'simon.knotbook',url:'https://play.google.com/store/apps/details?id=simon.knotbook'},
    {id:'scouting-notes',icon:'📚',title:'Scouting Notes',desc:'Activités, jeux Scout, navigation et nœuds, sans internet.',package:'androidinterview.com.sc_app_5',url:'https://play.google.com/store/apps/details?id=androidinterview.com.sc_app_5'},
    {id:'scoutmaster-challenge',icon:'🏕️',title:'Scoutmaster Challenge',desc:'Mini-jeux de camp : installation, missions et défis Scout. Gratuit à installer.',package:'com.maysalward.ScoutmasterChallengeCampingSimulation',url:'https://play.google.com/store/apps/details?id=com.maysalward.ScoutmasterChallengeCampingSimulation'},
    {id:'camo-camping-adventure',icon:'🌲',title:'CAMO: Camping Adventure',desc:'Aventure hors ligne avec sentiers, missions, camp et défis. Sans achats intégrés.',package:'com.camo.campadventure',url:'https://play.google.com/store/apps/details?id=com.camo.campadventure'},
    {id:'morse-game',icon:'📡',title:'Morse',desc:'Jeu Morse hors connexion avec niveaux progressifs et défis de rythme.',package:'org.okayfine.morse',url:'https://play.google.com/store/apps/details?id=org.okayfine.morse'},
    {id:'semaphore-ai',icon:'🚩',title:'Semaphore — Signal & Decode',desc:'Pratique sémaphore avec défis Guided, Independent et Time Attack, avec mode hors connexion.',package:'id.web.idm.semaphore',url:'https://play.google.com/store/apps/details?id=id.web.idm.semaphore'},
    {id:'game-pramuka',icon:'🗺️',title:'Game Pramuka (GASIK)',desc:'Aventure éducative Scout avec défis de nœuds, navigation et nature.',package:'com.adjie.gamepramuka',url:'https://play.google.com/store/apps/details?id=com.adjie.gamepramuka'},
    {id:'pandu-diklat',icon:'🎯',title:'Pandu Diklat Pramuka',desc:'Quiz et skill games Scout, plus outils Morse et sémaphore.',package:'com.simentor.pramuka',url:'https://play.google.com/store/apps/details?id=com.simentor.pramuka'},
    {id:'scoutcode',icon:'⚜️',title:'ScoutCode',desc:'Codes Scout : Morse, sémaphore, chiffre César et autres défis; plusieurs fonctions hors connexion.',package:'com.ballestrinque.scoutcode',url:'https://play.google.com/store/apps/details?id=com.ballestrinque.scoutcode'},
    {id:'morse-learner',icon:'🎧',title:'Morse Learner',desc:'Entraînement Morse gratuit hors connexion avec niveaux et vitesse réglable.',package:'com.morselearner',url:'https://play.google.com/store/apps/details?id=com.morselearner'}
  ];
  const quiz=[
    {q:'Ki sa yon bousòl sèvi pou?',a:['Detèmine direksyon','Kwit manje','Koupe kòd'],c:0},
    {q:'Ki sa yon ne solid dwe genyen?',a:['Yon bon blocage','Yon ekran','Yon batri'],c:0},
    {q:'Ki prensip Scout ki ede nan sèvis?',a:['Ede lòt moun','Evite tout aktivite','Pa aprann anyen'],c:0},
    {q:'Ki zouti ki pi itil pou li yon kat?',a:['Lejand kat la','Kalkilatris sèlman','Kas ekoutè'],c:0}
  ];
  const games=[
    {id:'quiz',icon:'🧠',title:'Quiz Scout — App',desc:'Teste konesans ou dirèkteman nan SCOUT HUB.',tag:'4 kesyon'},
    {id:'morse',icon:'📡',title:'Morse Challenge',desc:'Dekode mesaj Morse yo pi vit.',tag:'8 rounds'},
    {id:'orientation',icon:'🧭',title:'Défi Orientation',desc:'Chwazi bon direksyon an nan sitiyasyon Scout.',tag:'Défi'},
    {id:'knots',icon:'🪢',title:'Maîtrise des nœuds',desc:'Aprann ki ne ki adapte ak chak travay.',tag:'Pratique'},
    {id:'memory',icon:'⚜️',title:'Scout Memory',desc:'Jwenn pè tèm Scout yo.',tag:'Mémoire'},
    {id:'runner',icon:'🏃',title:'Scout Runner',desc:'Yon mini-jeu aksyon: evite obstak, pran fleur-de-lis epi monte skò.',tag:'10 étapes'},
    {id:'morseblitz',icon:'📡',title:'Morse Blitz',desc:'Yon mini-jeu rapid pou rekonèt Morse anba presyon tan.',tag:'8 rounds'}
  ];
  function openQuiz(i=0,score=0){
    if(i>=quiz.length){App.modal(`<div class="v30-game-result"><div>🏆</div><h2>Quiz fini!</h2><p>Skò ou: <strong>${score}/${quiz.length}</strong></p><button id="v30QuizAgain" class="primary-btn">🔁 Rekòmanse</button></div>`);document.getElementById('v30QuizAgain').onclick=()=>openQuiz();return;}
    const q=quiz[i];App.modal(`<div class="v30-game-modal"><span class="v30-kicker">QUIZ SCOUT</span><h2>${q.q}</h2><p class="muted">Kesyon ${i+1}/${quiz.length} · ${score} pwen</p><div class="v30-choice-list">${q.a.map((x,n)=>`<button class="v30-choice" data-choice="${n}">${Utils.esc(x)}</button>`).join('')}</div></div>`);document.querySelectorAll('.v30-choice').forEach(b=>b.onclick=()=>openQuiz(i+1,score+(Number(b.dataset.choice)===q.c?1:0)));
  }
  function openOrientation(i=0,score=0){
    const qs=[{q:'Sou kat la, nò a anlè. Si destinasyon an agoch, ki direksyon li ye?',a:['Lwès','Lès','Sid'],c:0},{q:'Soleil leve nan ki direksyon?',a:['Lès','Lwès','Nò'],c:0},{q:'Pou verifye pozisyon w, ki de bagay itil?',a:['Kat + bousòl','Kas + mikwo','Telefòn + jwèt'],c:0}];
    if(i>=qs.length){App.modal(`<div class="v30-game-result"><div>🧭</div><h2>Défi fini!</h2><p>${score}/${qs.length} bon repons.</p><button id="v30OriAgain" class="primary-btn">🔁 Rekòmanse</button></div>`);document.getElementById('v30OriAgain').onclick=()=>openOrientation();return;}
    const q=qs[i];App.modal(`<div class="v30-game-modal"><span class="v30-kicker">ORIENTATION</span><h2>${q.q}</h2><p class="muted">Etap ${i+1}/${qs.length}</p><div class="v30-choice-list">${q.a.map((x,n)=>`<button class="v30-choice" data-choice="${n}">${x}</button>`).join('')}</div></div>`);document.querySelectorAll('.v30-choice').forEach(b=>b.onclick=()=>openOrientation(i+1,score+(Number(b.dataset.choice)===q.c?1:0)));
  }
  function openKnots(){const items=[['Nœud de cabestan','Itil pou mare yon liy sou yon poto.'],['Nœud plat','Itil pou ini de kòd menm gwosè.'],['Nœud de chaise','Fòme yon bouk ki pa sere sou tèt li.']];App.modal(`<div class="v30-game-modal"><span class="v30-kicker">NŒUDS</span><h2>Ki ne ou vle aprann?</h2><div class="v30-info-list">${items.map(x=>`<article><strong>🪢 ${x[0]}</strong><p>${x[1]}</p></article>`).join('')}</div><button id="v30KnotsSearch" class="v30-outline-btn full">🌐 Chèche yon demonstrasyon</button></div>`);document.getElementById('v30KnotsSearch').onclick=()=>ScoutLearning?.webSearch('nœuds scoutisme démonstration');}
  function openMemory(){const pairs=['⚜️ Fleur-de-lis','🧭 Bousòl','🪢 Nœud','🏕️ Kan'];let cards=[...pairs,...pairs].sort(()=>Math.random()-.5),open=[],done=0;App.modal(`<div class="v30-game-modal"><span class="v30-kicker">SCOUT MEMORY</span><h2>Jwenn pè yo</h2><div class="memory-grid">${cards.map((x,i)=>`<button class="memory-card" data-i="${i}" data-v="${Utils.esc(x)}">?</button>`).join('')}</div></div>`);document.querySelectorAll('.memory-card').forEach(b=>b.onclick=()=>{if(open.length>=2||b.classList.contains('matched')||b.classList.contains('revealed'))return;b.classList.add('revealed');b.textContent=b.dataset.v;open.push(b);if(open.length===2){if(open[0].dataset.v===open[1].dataset.v){open.forEach(x=>x.classList.add('matched'));done+=2;open=[];if(done===cards.length)setTimeout(openMemory,450)}else setTimeout(()=>{open.forEach(x=>{x.classList.remove('revealed');x.textContent='?'});open=[]},650)}});}
  function openRunner(){
    let score=0,lives=3,step=0,active=true;
    const obstacles=['🪵','🪨','🌿','⛰️'];
    const draw=()=>{
      if(!active)return;
      const obs=obstacles[Math.floor(Math.random()*obstacles.length)];
      App.modal(`<div class="v30-game-modal scout-video-game"><span class="v30-kicker">SCOUT RUNNER</span><h2>🏃 Mission sentier</h2><p class="muted">Évite l’obstacle et attrape les ⚜️. Score: <strong>${score}</strong> · ❤️ ${lives}</p><div class="runner-scene"><div class="runner-scout">🏃</div><div class="runner-obstacle">${obs}</div><div class="runner-star">⚜️</div></div><div class="runner-actions"><button id="runnerLeft" class="secondary-btn">⬅️ Esquiver</button><button id="runnerCatch" class="primary-btn">⚜️ Attraper</button><button id="runnerRight" class="secondary-btn">Esquiver ➡️</button></div><p class="muted">Etap ${step+1}/10</p></div>`);
      const finish=()=>{active=false;App.modal(`<div class="v30-game-result"><div>🏆</div><h2>Mission terminée!</h2><p>Score: <strong>${score}</strong> · Vies: ${lives}</p><button id="runnerAgain" class="primary-btn">🔁 Rekòmanse</button></div>`);document.getElementById('runnerAgain').onclick=()=>{score=0;lives=3;step=0;active=true;draw()};};
      const act=(choice)=>{if(!active)return;const good=(choice==='catch'&&obs==='⚜️')||(choice!=='catch'&&obs!=='⚜️');if(good)score+=10;else lives--;step++;if(step>=10||lives<=0){finish();return;}draw();};
      document.getElementById('runnerLeft').onclick=()=>act('left');document.getElementById('runnerCatch').onclick=()=>act('catch');document.getElementById('runnerRight').onclick=()=>act('right');
    };
    // The first round is always a fleur-de-lis target to teach the controls.
    obstacles.unshift('⚜️');draw();
  }
  function openMorseBlitz(){
    const letters=[['A','.-'],['B','-...'],['C','-.-.'],['E','.'],['T','-'],['S','...'],['O','---'],['M','--']];
    let i=0,score=0;
    const round=()=>{if(i>=8){App.modal(`<div class="v30-game-result"><div>📡</div><h2>Morse Blitz fini!</h2><p>${score}/8 bon repons.</p><button id="morseBlitzAgain" class="primary-btn">🔁 Rekòmanse</button></div>`);document.getElementById('morseBlitzAgain').onclick=()=>{i=0;score=0;round()};return;}const item=letters[Math.floor(Math.random()*letters.length)];App.modal(`<div class="v30-game-modal scout-video-game"><span class="v30-kicker">MORSE BLITZ</span><h2>📡 Ki lèt sa a?</h2><div class="morse-display">${item[1]}</div><p class="muted">Round ${i+1}/8 · ${score} pwen</p><div class="v30-choice-list">${letters.slice(0,4).sort(()=>Math.random()-.5).map(x=>`<button class="v30-choice" data-letter="${x[0]}">${x[0]}</button>`).join('')}</div></div>`);document.querySelectorAll('.v30-choice').forEach(b=>b.onclick=()=>{if(b.dataset.letter===item[0])score++;i++;round()});};round();
  }

  function openExternalGame(game){
    if(!game)return;
    // On Android, try to launch the installed app first. If it is not installed
    // (or the browser blocks the intent), fall back to the official Play page.
    const intent=`intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${encodeURIComponent(game.package)};end`;
    let fallback=setTimeout(()=>window.open(game.url,'_blank','noopener'),900);
    const clear=()=>{clearTimeout(fallback);window.removeEventListener('blur',clear);};
    window.addEventListener('blur',clear,{once:true});
    try{window.location.href=intent;}catch(_){clear();window.open(game.url,'_blank','noopener');}
  }

  function play(id){if(id==='runner')return openRunner();if(id==='morseblitz')return openMorseBlitz();if(id==='quiz')return openQuiz();if(id==='orientation')return openOrientation();if(id==='knots')return openKnots();if(id==='memory')return openMemory();if(id==='morse')return typeof Features!=='undefined'?Features.open('morse'):null;const ext=externalGames.find(g=>g.id===id);if(ext)return openExternalGame(ext);}
  function render(){
    const l=document.getElementById('gamesList');if(!l)return;
    l.innerHTML=`<div class="games-intro"><div><span class="v30-kicker">SCOUT PLAYGROUND</span><h2>🎮 Jwèt Scout</h2><p>Jwèt SCOUT HUB + jwèt Scout Android ki gen mòd offline.</p></div><span class="games-score">⭐ XP</span></div>
    <div class="game-section-label">📲 Jwèt & zouti Scout sou Google Play</div>
    <p class="muted games-note">Si jwèt la deja enstale, bouton <strong>▶️ Jwe</strong> eseye louvri jwèt la dirèkteman. Sinon li louvri paj Google Play la pou enstalasyon.</p>
    <div class="games-v30-grid external-games">${externalGames.map(g=>`<article class="game-card game-card-v30"><div class="game-icon-v30">${g.icon}</div><span class="game-tag">Offline · Google Play</span><h3>${g.title}</h3><p class="muted">${g.desc}</p><div class="game-actions"><button class="primary-btn" data-v30-external="${g.id}">▶️ Jwe</button><a class="secondary-btn" href="${g.url}" target="_blank" rel="noopener">📲 Google Play</a></div></article>`).join('')}</div>
    <div class="game-section-label">🎮 Mini-jeux SCOUT HUB</div>
    <div class="games-v30-grid">${games.map(g=>`<article class="game-card game-card-v30"><div class="game-icon-v30">${g.icon}</div><span class="game-tag">${g.tag}</span><h3>${g.title}</h3><p class="muted">${g.desc}</p><button class="primary-btn full" data-v30-game="${g.id}">▶ Jwe kounye a</button></article>`).join('')}</div>`;
    l.querySelectorAll('[data-v30-game]').forEach(b=>b.onclick=()=>play(b.dataset.v30Game));
    l.querySelectorAll('[data-v30-external]').forEach(b=>b.onclick=()=>play(b.dataset.v30External));
  }
  function init(){render();}
  return {init,render,play,openExternalGame};
})();
