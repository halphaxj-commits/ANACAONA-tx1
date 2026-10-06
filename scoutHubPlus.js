/* SCOUT HUB V29 — cloud progression, challenges and audit hardening */
const ScoutHubPlus = (() => {
  const esc = v => Utils.esc(String(v ?? ''));
  const now = () => new Date().toISOString();
  const auditKey = 'scoutHub.audit.v2';
  const challengeKey = 'scoutHub.challenges.v2';
  const defaultChallenges = [
    {key:'mission_scout',title:'Mission Scout',description:'Fini 3 tâches de ton choix.',xp:50},
    {key:'esprit_equipe',title:'Esprit d’équipe',description:'Complète une activité et aide ta patrouille.',xp:75},
    {key:'apprendre_servir',title:'Apprendre pour servir',description:'Termine une leçon Scout.',xp:100}
  ];
  function currentMember(){
    const id=SyncEngine.getMyMemberId?.();
    return StorageService.collection('members').find(m=>String(m.id)===String(id))||null;
  }
  function localAudit(){try{return JSON.parse(localStorage.getItem(auditKey))||[]}catch{return[]}}
  async function record(action, details=''){
    const row={id:Utils.uid(),at:now(),action,details};
    const rows=localAudit(); rows.unshift(row); localStorage.setItem(auditKey,JSON.stringify(rows.slice(0,200)));
    try{
      const c=await SupabaseClient.get(); const s=(await c.auth.getSession()).data.session;
      if(s?.user) await c.from('admin_audit_logs').insert({actor_user_id:s.user.id,action,details:{text:String(details)}});
    }catch(e){console.warn('[ScoutHubPlus] cloud audit unavailable',e)}
  }
  async function loadChallenges(){
    try{
      const c=await SupabaseClient.get(); const s=(await c.auth.getSession()).data.session;
      if(s?.user){
        const {data,error}=await c.from('scout_challenges').select('*').order('created_at');
        if(!error){
          if(!data?.length){await c.from('scout_challenges').upsert(defaultChallenges.map(x=>({user_id:s.user.id,challenge_key:x.key,title:x.title,description:x.description,xp:x.xp})),{onConflict:'user_id,challenge_key'}); return loadChallenges()}
          return data.map(x=>({id:x.challenge_key,title:x.title,description:x.description,xp:x.xp,done:!!x.completed_at,completed_at:x.completed_at}));
        }
      }
    }catch(e){console.warn('[ScoutHubPlus] challenge cloud read failed',e)}
    try{return JSON.parse(localStorage.getItem(challengeKey))||defaultChallenges.map(x=>({...x,id:x.key,done:false}))}catch{return defaultChallenges.map(x=>({...x,id:x.key,done:false}))}
  }
  async function completeChallenge(key){
    try{
      const c=await SupabaseClient.get(); const s=(await c.auth.getSession()).data.session;
      if(s?.user){
        const {error}=await c.from('scout_challenges').update({completed_at:now()}).eq('user_id',s.user.id).eq('challenge_key',key);
        if(error)throw error;
        await recalculateCloudProgress(); await record('Défi terminé',key); return true;
      }
    }catch(e){console.warn('[ScoutHubPlus] challenge cloud write failed',e)}
    return false;
  }
  async function recalculateCloudProgress(){
    try{
      const c=await SupabaseClient.get(); const s=(await c.auth.getSession()).data.session; const member=currentMember();
      if(!s?.user||!member)return null;
      const [{count:taskCount},{count:badgeCount},{data:skills},{count:lessonCount}]=await Promise.all([
        c.from('task_completions').select('*',{count:'exact',head:true}).eq('member_id',member.id),
        c.from('member_badges').select('*',{count:'exact',head:true}).eq('member_id',member.id),
        c.from('member_skills').select('progress').eq('member_id',member.id),
        c.from('member_lesson_progress').select('*',{count:'exact',head:true}).eq('member_id',member.id).eq('completed',true)
      ]);
      const skillPoints=(skills||[]).reduce((n,x)=>n+Math.max(0,Math.min(100,Number(x.progress)||0)),0);
      const xp=(taskCount||0)*10+(badgeCount||0)*50+Math.round(skillPoints/5)+(lessonCount||0)*75;
      const level=Math.max(1,Math.floor(xp/250)+1);
      await c.from('scout_progress').upsert({user_id:s.user.id,xp,level,updated_at:now()},{onConflict:'user_id'});
      return {xp,level,skillPoints,tasks:taskCount||0,badges:badgeCount||0,lessons:lessonCount||0};
    }catch(e){console.warn('[ScoutHubPlus] progress recalc failed',e);return null}
  }
  async function progress(){
    const m=currentMember();
    try{const c=await SupabaseClient.get();const s=(await c.auth.getSession()).data.session;if(s?.user){const {data}=await c.from('scout_progress').select('*').eq('user_id',s.user.id).maybeSingle();if(data){const pct=Math.min(100,Math.round(((data.xp-(data.level-1)*250)/250)*100));return {member:m,xp:data.xp,level:data.level,pct}}}}catch{}
    const tasks=StorageService.collection('tasks'),badges=StorageService.collection('badges'),skills=StorageService.collection('skills');
    const doneTasks=tasks.filter(t=>t.completed).length,skillPoints=skills.reduce((n,s)=>n+Math.max(0,Math.min(100,Number(s.progress)||0)),0);
    const lessonCatalog=typeof Lessons!=='undefined'&&Lessons.isLoaded?Lessons.getCatalog():[];
    const completedLessons=lessonCatalog.filter(l=>Lessons.getProgress(l.id)?.completed).length;
    const xp=doneTasks*10+badges.length*50+Math.round(skillPoints/5)+completedLessons*75,level=Math.max(1,Math.floor(xp/250)+1),levelStart=(level-1)*250,pct=Math.min(100,Math.round(((xp-levelStart)/250)*100));
    return {member:m,tasks:doneTasks,badges:badges.length,skills:skillPoints,lessons:completedLessons,xp,level,pct};
  }
  async function progressUI(){
    const p=await progress(),name=p.member?`${p.member.first_name||''} ${p.member.last_name||''}`.trim():'Visiteur';
    return `<div class="plus-panel"><div class="plus-hero"><span>🏆</span><div><h2>Progression Scout</h2><p>${esc(name)} · Niveau ${p.level}</p></div></div><div class="xp-card"><div class="xp-row"><strong>⭐ ${p.xp} XP</strong><span>Prochain niveau: ${Math.max(0,250-(p.xp%250))} XP</span></div><div class="xp-track"><i style="width:${p.pct}%"></i></div></div><div class="plus-stats"><div><b>${p.tasks||0}</b><small>Tâches</small></div><div><b>${p.badges||0}</b><small>Badges</small></div><div><b>${p.lessons||0}</b><small>Leçons</small></div><div><b>${p.skills||0}</b><small>Points compétences</small></div></div><p class="muted">XP la soti nan done cloud yo lè kont lan konekte; local fallback la rete disponib offline.</p></div>`;
  }
  function patrolsUI(){const ms=StorageService.collection('members');const groups={};ms.forEach(m=>{const k=(m.patrol||'San patwouy').trim()||'San patwouy';(groups[k]??=[]).push(m)});const rows=Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,list])=>`<section class="patrol-card"><div class="patrol-head"><h3>🏕️ ${esc(name)}</h3><span>${list.length} manm</span></div><div class="patrol-members">${list.map(m=>`<span class="patrol-member">👤 ${esc((m.first_name||'')+' '+(m.last_name||''))}</span>`).join('')}</div></section>`).join('');return `<div class="plus-panel"><div class="plus-hero"><span>🏕️</span><div><h2>Patwouy</h2><p>Gwoupman manm yo dapre patwouy yo.</p></div></div>${rows||'<p class="muted">Pa gen patwouy anrejistre ankò.</p>'}</div>`}
  async function challengesUI(){const rows=await loadChallenges();return `<div class="plus-panel"><div class="plus-hero"><span>🎯</span><div><h2>Défis Scout</h2><p>Ti misyon pou fè pwogrè.</p></div></div>${rows.map(c=>`<article class="challenge-card ${c.done?'done':''}"><div><h3>${c.done?'✅':'🎯'} ${esc(c.title)}</h3><p>${esc(c.description)}</p></div><strong>+${c.xp} XP</strong><button class="secondary-btn" data-challenge="${esc(c.id||c.key)}" ${c.done?'disabled':''}>${c.done?'Fini':'Mwen fini'}</button></article>`).join('')}</div>`}
  async function dashboardUI(){const d=StorageService.data(),p=await progress(),ms=d.members,active=ms.filter(m=>m.user_id).length,done=d.tasks.filter(t=>t.completed).length;const patrols=new Set(ms.map(m=>(m.patrol||'San patwouy').trim()||'San patwouy')).size;return `<div class="plus-panel"><div class="plus-hero"><span>📊</span><div><h2>Dashboard Scout</h2><p>Yon rezime done SCOUT HUB yo.</p></div></div><div class="dashboard-grid"><div><b>${ms.length}</b><small>Manm total</small></div><div><b>${active}</b><small>Kont lye</small></div><div><b>${done}</b><small>Tâches fini</small></div><div><b>${d.badges.length}</b><small>Badges</small></div><div><b>${d.activities.length}</b><small>Aktivite</small></div><div><b>${patrols}</b><small>Patwouy</small></div></div><div class="feature-card"><h3>⭐ Progressyon mwen</h3><p>Nivo ${p.level} · ${p.xp} XP · ${p.pct}% pou pwochen nivo.</p><div class="xp-track"><i style="width:${p.pct}%"></i></div></div><div class="feature-card"><h3>🔄 Sync</h3><p>Teste Sync Health sou Akèy pou verifye 2 telefòn.</p></div></div>`}
  async function auditUI(){let rows=localAudit();try{const c=await SupabaseClient.get();const s=(await c.auth.getSession()).data.session;if(s?.user){const {data}=await c.from('admin_audit_logs').select('*').eq('actor_user_id',s.user.id).order('created_at',{ascending:false}).limit(100);if(data)rows=data.map(x=>({action:x.action,details:x.details?.text||'',at:x.created_at}))}}catch{}return `<div class="plus-panel"><div class="plus-hero"><span>🧾</span><div><h2>Journal d’administration</h2><p>Tras aksyon lokal + cloud pou kont ou.</p></div></div>${rows.length?rows.map(x=>`<div class="audit-row"><strong>${esc(x.action)}</strong><span>${esc(x.details)}</span><small>${new Date(x.at).toLocaleString()}</small></div>`).join(''):'<p class="muted">Pa gen aksyon anrejistre.</p>'}</div>`}
  async function open(key){let html='';if(key==='progress')html=await progressUI();if(key==='patrols')html=patrolsUI();if(key==='challenges')html=await challengesUI();if(key==='dashboard')html=await dashboardUI();if(key==='audit')html=await auditUI();if(!html)return false;App.modal(html);if(key==='challenges')document.querySelectorAll('[data-challenge]').forEach(b=>b.onclick=async()=>{await completeChallenge(b.dataset.challenge);open('challenges');Utils.toast('🎯 Defi a mete kòm fini.')});return true}
  function refresh(){const x=document.getElementById('scoutProgressMini');if(x)progress().then(p=>x.innerHTML=`⭐ Nivo ${p.level} · ${p.xp} XP`).catch(()=>{})}
  function init(){refresh();window.addEventListener('scout:realtime-ready',refresh);window.addEventListener('scout:realtime-event',()=>{refresh();recalculateCloudProgress()})}
  return {open,init,refresh,progress,record,recalculateCloudProgress};
})();
