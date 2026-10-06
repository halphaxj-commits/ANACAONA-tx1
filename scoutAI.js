/* SCOUT HUB V30.7.2 — real AI text + browser voice input/output */
const ScoutAI=(()=>{
  let history=[];
  let recognition=null;
  let speaking=false;

  function offline(q){
    const text=String(q||'').toLowerCase().trim();
    const catalog=typeof Lessons!=='undefined'?Lessons.getCatalog():[];
    const hit=catalog.find(l=>`${l.title} ${l.description} ${(l.steps||[]).map(s=>s.content).join(' ')}`.toLowerCase().includes(text));
    if(hit)return `📚 ${hit.title}\n\n${hit.description}\n\nOu ka louvri leson sa a nan SCOUT ACADEMY pou li etap yo. ${hit.steps?.length?`Li gen ${hit.steps.length} etap lokal disponib menm san entènèt.`:''}`;
    const kb=[
      [/morse|kòd mòs/,'Morse sèvi ak pwen ak tirè. Mwen ka ede w pratike lèt yo ak ti egzèsis offline.'],
      [/bousòl|orientation|direksyon|kat/,'Pou oryantasyon, aprann pwen kadinal yo, li lejand kat la epi verifye direksyon an. SCOUT HUB gen leson Oryantasyon ak Kat offline.'],
      [/camp|kan/,'Bon preparasyon, respè anviwònman ak règ gwoup la enpòtan nan yon kan. Louvri leson Camping oswa Sekirite nan kan.'],
      [/badge|badj/,'Badges yo konekte ak aktivite Scout yo. Lè sistèm nan detekte yon travay oswa leson ki fini, li ka mete pwogrè a ajou.'],
      [/xp|nivo|progression/,'XP ou soti nan pwogrè Scout tankou travay, badges, compétences ak leson.'],
      [/ia|ai|entelijans/,'Mwen se Scout IA. Offline mwen sèvi ak konesans ki deja nan app la; online mwen itilize IA cloud la lè API a aktive.'],
    ];
    const found=kb.find(([re])=>re.test(text));
    if(found)return found[1];
    return '🤖 Mwen ka ede w ak Morse, oryantasyon, camping, sécurité, badges, XP, leson ak lòt sijè Scout. Lè API IA a aktive, mwen ka bay repons pi avanse online.';
  }

  async function ask(q){
    const prompt=String(q||'').trim();if(!prompt)return '';
    try{
      const c=await SupabaseClient.get();
      const {data,error}=await c.functions.invoke('scout-ai',{body:{question:prompt,history:history.slice(-8)}});
      if(!error&&data?.answer){
        history.push({role:'user',content:prompt},{role:'assistant',content:data.answer});
        return data.answer;
      }
    }catch{}
    return offline(prompt);
  }

  function getVoiceLang(){
    const lang=(localStorage.getItem('scoutHub.lang')||document.documentElement.lang||'ht').toLowerCase();
    return ({ht:'ht-HT',fr:'fr-FR',en:'en-US',es:'es-ES',pt:'pt-BR',de:'de-DE',it:'it-IT',zh:'zh-TW',ja:'ja-JP',ko:'ko-KR',ar:'ar-SA',ru:'ru-RU',tr:'tr-TR'})[lang]||'ht-HT';
  }

  function speak(text){
    if(!('speechSynthesis' in window)){return false;}
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(String(text||''));
    u.lang=getVoiceLang();
    u.rate=0.96;
    u.pitch=1;
    u.volume=1;
    u.onstart=()=>{speaking=true;document.getElementById('scoutAISpeak')?.classList.add('active');};
    u.onend=u.onerror=()=>{speaking=false;document.getElementById('scoutAISpeak')?.classList.remove('active');};
    window.speechSynthesis.speak(u);
    return true;
  }

  function stopSpeaking(){
    if('speechSynthesis' in window)window.speechSynthesis.cancel();
    speaking=false;document.getElementById('scoutAISpeak')?.classList.remove('active');
  }

  function startListening(input,status){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){if(status)status.textContent='🎙️ Mikwo vwa pa disponib nan navigatè sa a.';return false;}
    if(recognition){try{recognition.stop();}catch{} recognition=null;}
    recognition=new SR();
    recognition.lang=getVoiceLang();
    recognition.interimResults=true;
    recognition.continuous=false;
    recognition.onstart=()=>{if(status)status.textContent='🎙️ M ap koute… pale kounye a';document.getElementById('scoutAIListen')?.classList.add('active');};
    recognition.onresult=e=>{
      let finalText='',live='';
      for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0]?.transcript||'';if(e.results[i].isFinal)finalText+=t;else live+=t;}
      input.value=(finalText||live).trim();
      if(status&&live)status.textContent=`🎙️ ${live}`;
    };
    recognition.onerror=e=>{if(status)status.textContent=e.error==='not-allowed'?'🎙️ Bay navigatè a pèmisyon pou mikwo a.':'🎙️ Mwen pa t ka tande vwa a.';document.getElementById('scoutAIListen')?.classList.remove('active');};
    recognition.onend=()=>{if(status)status.textContent='';document.getElementById('scoutAIListen')?.classList.remove('active');recognition=null;};
    try{recognition.start();return true;}catch{recognition=null;return false;}
  }

  function appendMessage(box,role,text){
    const div=document.createElement('div');div.className=`v30-ai-msg ${role}`;div.innerHTML=Utils.esc(text).replace(/\n/g,'<br>');box.appendChild(div);return div;
  }

  function open(){
    App.modal(`<div class="v30-ai-modal">
      <span class="v30-kicker">🤖 SCOUT IA • JARVIS-STYLE</span>
      <h2>Asistan Scout ou</h2>
      <p class="muted">🟢 Offline + ☁️ IA online + 🎙️ vwa + 🔊 repons pale</p>
      <div id="scoutAIHistory" class="v30-ai-history"><div class="v30-ai-msg bot">Bonjou! Mwen se Scout IA. Ou ka ekri m oswa pale avè m. 👋⚜️</div></div>
      <div id="scoutAIVoiceStatus" class="scout-ai-voice-status" aria-live="polite"></div>
      <form id="scoutAIForm" class="v30-ai-form">
        <input id="scoutAIInput" autocomplete="off" placeholder="Ekri oswa pale ak Scout IA…" required>
        <button type="button" id="scoutAIListen" class="v30-outline-btn" title="Pale">🎙️</button>
        <button type="submit" class="primary-btn" title="Voye">➤</button>
      </form>
      <label class="scout-ai-autovoice"><input type="checkbox" id="scoutAIAutoVoice"> 🔊 Li repons yo otomatikman</label>
      <div class="scout-ai-actions">
        <button type="button" id="scoutAISpeak" class="v30-outline-btn">🔊 Pale dènye repons</button>
        <button type="button" id="scoutAIStop" class="v30-outline-btn">⏹️ Stop vwa</button>
      </div>
      <button id="scoutAIWeb" class="v30-outline-btn full">🌐 Rechèch sou entènèt</button>
    </div>`);

    const form=document.getElementById('scoutAIForm'),input=document.getElementById('scoutAIInput'),box=document.getElementById('scoutAIHistory'),status=document.getElementById('scoutAIVoiceStatus');
    let lastAnswer='';
    const send=async q=>{
      q=String(q||'').trim();if(!q)return;
      appendMessage(box,'user',q);input.value='';
      const wait=appendMessage(box,'bot','⏳ M ap reflechi…');
      const ans=await ask(q);lastAnswer=ans;wait.remove();appendMessage(box,'bot',ans);
      box.scrollTop=box.scrollHeight;
      if(document.getElementById('scoutAIAutoVoice')?.checked) speak(ans);
    };
    form.onsubmit=e=>{e.preventDefault();send(input.value);};
    document.getElementById('scoutAIListen').onclick=()=>startListening(input,status);
    document.getElementById('scoutAISpeak').onclick=()=>{if(lastAnswer)speak(lastAnswer);else status.textContent='🔊 Pa gen repons pou mwen li ankò.';};
    document.getElementById('scoutAIStop').onclick=stopSpeaking;
    document.getElementById('scoutAIWeb').onclick=()=>ScoutLearning.webSearch(input.value||'scoutisme');
  }

  return {open,ask,offline,speak,stopSpeaking,startListening};
})();
