/* SCOUT HUB V30.1 — foreground + Web Push plumbing */
const ScoutPush=(()=>{
  const KEY='scoutHub.push.enabled';
  async function enable(){
    if(!('Notification' in window))return {ok:false,reason:'unsupported'};
    const permission=await Notification.requestPermission();
    localStorage.setItem(KEY,permission==='granted'?'1':'0');
    if(permission!=='granted')return {ok:false,reason:permission};
    try{
      const reg=await navigator.serviceWorker.ready;
      const publicKey=window.SCOUT_VAPID_PUBLIC_KEY||'';
      if(publicKey&&reg.pushManager){
        const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:publicKey});
        const client=await SupabaseClient.get();const s=(await client.auth.getSession()).data.session;
        if(s)await client.from('push_subscriptions').upsert({user_id:s.user.id,endpoint:sub.endpoint,subscription:sub.toJSON(),updated_at:new Date().toISOString()},{onConflict:'endpoint'});
      }
      return {ok:true,background:!!publicKey};
    }catch{return {ok:true,background:false}}
  }
  function notify(title,body,tag='scout'){if(localStorage.getItem(KEY)!=='1')return;if('Notification' in window&&Notification.permission==='granted')try{new Notification(title,{body,tag,icon:'./manifest.json'})}catch{}}
  function status(){return 'Notification' in window?Notification.permission:'unsupported'}
  window.addEventListener('scout:notification',e=>{const n=e.detail;if(n)notify(n.title,n.body,n.type||'scout')});
  window.addEventListener('scout:emergency-announcement',e=>{const a=e.detail||{};notify('🚨 ALÈT IJANS',a.content||a.title||'Nouvo alèt ijans','emergency');window.Sound?.distress?.()});
  return {enable,notify,status};
})();
