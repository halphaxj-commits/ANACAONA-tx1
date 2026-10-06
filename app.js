const App=(()=>{function modal(html){document.getElementById('modalBody').innerHTML=html;document.getElementById('modal').classList.remove('hidden');document.getElementById('modal').setAttribute('aria-hidden','false')}function closeModal(){document.getElementById('modal').classList.add('hidden');document.getElementById('modalBody').replaceChildren()}function applyTheme(){document.body.classList.toggle('light',StorageService.settings().theme==='light');document.getElementById('themeBtn').textContent=StorageService.settings().theme==='dark'?'☀️':'🌙'}async function refreshCloudMemberCount(){try{const c=await SupabaseClient.get();const{data:s}=await c.auth.getSession();if(!s?.session)return;const{count,error}=await c.from('members').select('id',{count:'exact',head:true});if(!error&&Number.isFinite(count)){const el=document.getElementById('memberCount');if(el)el.textContent=String(count)}}catch(e){console.warn('[Stats] cloud member count unavailable',e)}}
async function counters(){const d=StorageService.data();memberCount.textContent=d.members.length;activityCount.textContent=d.activities.length;badgeCount.textContent=d.badges.length;taskCount.textContent=d.tasks.filter(x=>!x.completed).length;try{const c=await SupabaseClient.get();const {data:s}=await c.auth.getSession();if(s?.session){const {count,error}=await c.from('members').select('id',{count:'exact',head:true});if(!error&&Number.isFinite(count))memberCount.textContent=String(count)}}catch(_){} }async function refresh(){await SyncEngine.pullAll();applyTheme();I18n.apply();Members.render();Activities.render();Games.init();Chat.renderConversations();if(typeof ScoutHubPlus!=='undefined')ScoutHubPlus.refresh();await counters();await refreshCloudMemberCount();updateStatus()}async function updateStatus(){let online=false;try{const client=await SupabaseClient.get();const{data}=await client.auth.getSession();if(data.session){await API.health();online=true}}catch{online=false}document.getElementById('connectionStatus').textContent=online?'Online':'Visiteur';document.getElementById('modeBadge').textContent=online?'🟢 ONLINE':'👤 MODE VISITEUR'}async function init(){const splashStart=Date.now();
document.getElementById('modalClose').onclick=closeModal;
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
document.getElementById('quickSignupBtn')?.addEventListener('click',()=>AuthGate?.openRegister?.('Kreye kont SCOUT HUB ou.'));
/* GUEST-FIRST: authentication is optional for browsing.
   Protected actions (such as sending messages) request login when needed. */
await safely('Auth.restore',()=>Auth.restore());
safely('Navigation.init',()=>Navigation.init());
safely('Members.init',()=>Members.init());
safely('Activities.init',()=>Activities.init());
safely('Games.init',()=>Games.init());
safely('Chat.init',()=>Chat.init());
safely('Media.init',()=>Media.init());
safely('Voice.init',()=>Voice.init());
safely('Features.init',()=>Features.init());
safely('ScoutHubPlus.init',()=>ScoutHubPlus.init());
safely('CreatorConsole.init',()=>CreatorConsole.init());
safely('Settings.init',()=>Settings.init());
safely('Sound.init',()=>Sound.init());
applyTheme();I18n.apply();counters();
await safely('SyncEngine.start',()=>SyncEngine.start());
await safely('App.refresh',()=>refresh());
updateStatus();window.addEventListener('online',updateStatus);window.addEventListener('offline',updateStatus);
const elapsed=Date.now()-splashStart;
setTimeout(()=>{const splash=document.getElementById('splashScreen');document.body.classList.remove('scout-loading');if(splash&&splash.classList.contains('splash-screen')){splash.classList.add('splash-hide');setTimeout(()=>splash.remove(),450)}},Math.max(0,500-elapsed))}async function safely(name,fn){try{return await fn()}catch(err){console.error('[App.init] '+name+' failed, continuing boot:',err)}}return{init,modal,closeModal,applyTheme,counters,refresh}})();document.addEventListener('DOMContentLoaded',App.init);
