/* SCOUT HUB V30.4 — Creator console + global AI configuration */
const CreatorConsole = (() => {
  const grades = [
    ['Commissaire district','admin','⭐'],['AG','leader','🛡️'],['Chef','leader','🏕️'],
    ['Cheftainne','leader','🏕️'],['1Cp','member','1️⃣'],['Cp','member','⚜️'],['Sp','member','🔰']
  ];
  const esc=v=>Utils.esc(String(v??''));
  async function isCreator(){
    try{
      const c=await SupabaseClient.get();
      const {data:sessionData}=await c.auth.getSession();
      if(!sessionData?.session?.user) return false;
      const {data:userData}=await c.auth.getUser();
      if(!userData?.user) return false;
      const {data,error}=await c.rpc('is_app_creator');
      if(error) throw error;
      return data===true;
    }catch(e){console.warn('[Creator] access check failed',e);return false;}
  }
  async function loadAIConfig(){
    try{
      const c=await SupabaseClient.get();
      const {data,error}=await c.rpc('creator_get_ai_config');
      if(error) throw error;
      return data||{enabled:false,provider:'openai',model:'gpt-4o-mini',has_api_key:false};
    }catch(e){console.warn('[Creator] AI config read failed',e);return {enabled:false,provider:'openai',model:'gpt-4o-mini',has_api_key:false};}
  }
  async function open(){
    if(!(await isCreator())){Utils.toast('🔒 Aksè Créateur refize.');return;}
    const members=StorageService.collection('members')||[];
    const ai=await loadAIConfig();
    let creatorEmail='';
    try{const c=await SupabaseClient.get();const {data}=await c.auth.getUser();creatorEmail=String(data?.user?.email||'');}catch(_){ }
    const verifiedEmail=creatorEmail.toLowerCase()==='halphaxjoe@gmail.com';
    App.modal(`<div class="creator-panel">
      <div class="creator-hero creator-hero-v307"><div class="creator-identity-line"><span class="creator-avatar-v307">👑</span><div><span class="creator-identity">SONLSEPYOK • CRÉATEUR VÉRIFIÉ</span><h2>Joe (SONLSEPYOK)</h2><p class="muted">${verifiedEmail?'✅ Compte Google vérifié: halphaxjoe@gmail.com':'🔐 Identité autorisée par Supabase'}</p></div></div><p class="muted">Centre de contrôle SCOUT HUB. Tout privilèj sensible pase pa Supabase.</p></div>
      <div class="creator-kpi-row"><div class="creator-kpi"><strong>${members.length}</strong><small>Manm lokal</small></div><div class="creator-kpi"><strong>${ai.enabled&&ai.has_api_key?'ON':'OFF'}</strong><small>IA globale</small></div><div class="creator-kpi"><strong>SUPABASE</strong><small>Vérification</small></div></div>
      <section class="feature-card creator-section-v307 creator-ai-card"><h3>🤖 IA globale de l’application</h3><p class="muted">Mete yon API key yon sèl fwa: Scout IA itilize li atravè Edge Function la pou tout app lan. Kle a pa parèt nan frontend lan epi li estoke nan Supabase Vault.</p>
        <div class="creator-ai-status"><i id="creatorAiDot" class="creator-ai-dot ${ai.enabled&&ai.has_api_key?'live':'off'}"></i><span id="creatorAiStatus">${ai.enabled&&ai.has_api_key?'🟢 IA globale aktive':'🟠 IA globale pa konfigire'}</span></div>
        <div class="creator-ai-grid">
          <label><span>Founisè IA</span><select id="creatorAiProvider"><option value="openai" ${ai.provider==='openai'?'selected':''}>OpenAI</option></select></label>
          <label><span>Modèl</span><input id="creatorAiModel" value="${esc(ai.model||'gpt-4o-mini')}" placeholder="gpt-4o-mini" autocomplete="off"></label>
        </div>
        <label><span>API Key</span><input id="creatorAiKey" type="password" placeholder="Kole API key la isit la" autocomplete="new-password" spellcheck="false"></label>
        <div class="card-actions"><button type="button" id="creatorAiSave" class="primary-btn">🔐 Sove + aktive IA globale</button><button type="button" id="creatorAiDisable" class="danger-btn">⏸️ Dezaktive IA globale</button></div>
        <p class="creator-ai-note muted">Sekirite: API key la voye sèlman sou koneksyon HTTPS pou yon RPC ki limite ak Créateur, epi li estoke kòm secret nan Supabase Vault. Li pa mete nan JavaScript, localStorage, oswa fichye ZIP.</p>
        <p id="creatorAiMessage" class="muted"></p>
      </section>
      <section class="feature-card creator-section-v307"><h3>🔐 Kòd pou chak grade</h3><p class="muted">Se ou menm ki chwazi kòd la. Supabase sere sèlman hash la.</p>
        <div class="creator-code-grid">${grades.map(([grade,role,icon])=>`<div class="creator-code-row"><div><strong>${icon} ${esc(grade)}</strong><small>${esc(role)}</small></div><input type="password" class="creator-code-input" data-grade="${esc(grade)}" data-role="${role}" placeholder="Kòd pou ${esc(grade)}" autocomplete="new-password"><button type="button" class="secondary-btn creator-save-code" data-grade="${esc(grade)}" data-role="${role}">💾 Anrejistre</button></div>`).join('')}</div>
        <p id="creatorCodeStatus" class="muted"></p>
      </section>
      <section class="feature-card creator-section-v307"><h3>🛠️ Aksè modification</h3><p class="muted">Créateur la ka bay oswa retire privilèj modification.</p>
        <div class="creator-editor-list">${members.filter(m=>m.user_id).map(m=>`<div class="creator-editor-row"><div><strong>${esc((m.first_name||'')+' '+(m.last_name||''))}</strong><small>${esc(m.member_id||m.user_id)}</small></div><button type="button" class="secondary-btn creator-grant-editor" data-user-id="${esc(m.user_id)}">🛠️ Autorize</button><button type="button" class="danger-btn creator-revoke-editor" data-user-id="${esc(m.user_id)}">Révoquer</button></div>`).join('')||'<p class="muted">Pa gen manm ki lye ak yon kont.</p>'}</div><p id="creatorEditorStatus" class="muted"></p>
      </section>
      <section class="feature-card creator-section-v307"><h3>🏅 Kòd deja anrejistre</h3><div id="creatorCodeList"><span class="muted">Chajman...</span></div></section>
    </div>`);
    bind();
  }
  async function refreshCodes(){
    const root=document.getElementById('creatorCodeList');if(!root)return;
    try{const c=await SupabaseClient.get();const {data,error}=await c.rpc('creator_list_role_codes');if(error)throw error;root.innerHTML=(data||[]).map(x=>`<div class="creator-code-list-row"><strong>${esc(x.unit_role||'—')}</strong><span>${esc(x.role)}</span><span>${x.active?'🟢 aktif':'⚪ inaktif'}</span><span>${esc(x.uses_remaining)} itilizasyon</span></div>`).join('')||'<p class="muted">Pa gen kòd ankò.</p>'}
    catch(e){root.innerHTML='<p class="muted">⚠️ Pa kapab chaje kòd yo.</p>';}
  }
  function bind(){
    document.getElementById('creatorAiSave')?.addEventListener('click',async()=>{
      const key=document.getElementById('creatorAiKey')?.value.trim(),provider=document.getElementById('creatorAiProvider')?.value||'openai',model=document.getElementById('creatorAiModel')?.value.trim()||'gpt-4o-mini',out=document.getElementById('creatorAiMessage');
      if(!key){if(out)out.textContent='⚠️ Mete API key la dabò.';return;}
      const btn=document.getElementById('creatorAiSave');btn.disabled=true;btn.textContent='⏳ Sove...';
      try{const c=await SupabaseClient.get();const {data,error}=await c.rpc('creator_set_ai_config',{provider_name:provider,model_name:model,api_key:key,enabled:true});if(error)throw error;if(out)out.textContent='✅ IA globale aktive pou tout app lan.';document.getElementById('creatorAiKey').value='';document.getElementById('creatorAiStatus').textContent='🟢 IA globale aktive';document.getElementById('creatorAiDot').classList.remove('off');document.getElementById('creatorAiDot').classList.add('live');}
      catch(e){if(out)out.textContent='❌ '+(e.message||'Pa kapab sove konfigirasyon IA a.');}
      finally{btn.disabled=false;btn.textContent='🔐 Sove + aktive IA globale';}
    });
    document.getElementById('creatorAiDisable')?.addEventListener('click',async()=>{const out=document.getElementById('creatorAiMessage');try{const c=await SupabaseClient.get();const {error}=await c.rpc('creator_set_ai_config',{provider_name:'openai',model_name:document.getElementById('creatorAiModel')?.value.trim()||'gpt-4o-mini',api_key:null,enabled:false});if(error)throw error;if(out)out.textContent='⏸️ IA globale dezaktive.';document.getElementById('creatorAiStatus').textContent='🟠 IA globale dezaktive';document.getElementById('creatorAiDot').classList.remove('live');document.getElementById('creatorAiDot').classList.add('off');}catch(e){if(out)out.textContent='❌ '+(e.message||'Pa kapab dezaktive IA a.')}});
    document.querySelectorAll('.creator-save-code').forEach(btn=>btn.onclick=async()=>{
      const grade=btn.dataset.grade,role=btn.dataset.role,input=document.querySelector(`.creator-code-input[data-grade="${CSS.escape(grade)}"]`),code=input?.value.trim(),out=document.getElementById('creatorCodeStatus');
      if(!code){if(out)out.textContent='Mete yon kòd dabò.';return;}
      try{const c=await SupabaseClient.get();const {data,error}=await c.rpc('creator_create_role_code',{code_plain:code,target_role:role,target_unit_role:grade,uses:1,expires:null});if(error)throw error;if(out)out.textContent=`✅ Kòd pou ${grade} la anrejistre. Se hash la sèlman ki estoke.`;input.value='';await refreshCodes();}
      catch(e){if(out)out.textContent='❌ '+(e.message||'Pa kapab anrejistre kòd la.');}
    });
    document.querySelectorAll('.creator-grant-editor').forEach(btn=>btn.onclick=async()=>{try{const c=await SupabaseClient.get();const {error}=await c.rpc('creator_grant_editor',{target_user:btn.dataset.userId});if(error)throw error;document.getElementById('creatorEditorStatus').textContent='✅ Aksè modification bay.';}catch(e){document.getElementById('creatorEditorStatus').textContent='❌ '+(e.message||'Aksyon an echwe.');}});
    document.querySelectorAll('.creator-revoke-editor').forEach(btn=>btn.onclick=async()=>{try{const c=await SupabaseClient.get();const {error}=await c.rpc('creator_revoke_editor',{target_user:btn.dataset.userId});if(error)throw error;document.getElementById('creatorEditorStatus').textContent='✅ Aksè modification retire.';}catch(e){document.getElementById('creatorEditorStatus').textContent='❌ '+(e.message||'Aksyon an echwe.');}});
    refreshCodes();
  }
  async function init(){const btn=document.getElementById('creatorFeatureBtn');if(!btn)return;const check=async()=>{if(await isCreator()){btn.hidden=false;if(!btn.dataset.bound){btn.dataset.bound='1';btn.addEventListener('click',e=>{e.preventDefault();open();});}}else btn.hidden=true;};await check();document.addEventListener('scout:auth-ready',check);}
  return {init,open,isCreator};
})();
