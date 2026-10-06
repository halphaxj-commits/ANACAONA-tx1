/* SCOUT HUB V11 — realtime notifications, tasks, badges, calendar + offline queue */
(() => {
  const QKEY='scoutHub.v11.offline.queue', BKEY='scoutHub.v11.badge.awards';
  const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

  function notify(title,body,type='info'){
    const item={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),title,body,type,created_at:new Date().toISOString(),read:false};
    const a=read('scoutHub.v11.notifications'); a.unshift(item); write('scoutHub.v11.notifications',a.slice(0,200));
    dispatchEvent(new CustomEvent('scout:notification',{detail:item})); return item;
  }
  function queue(table,row){
    const q=read(QKEY); q.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),table,row});
    write(QKEY,q); dispatchEvent(new CustomEvent('scout:offline-queue',{detail:{count:q.length}}));
  }
  async function flush(){
    if(!navigator.onLine||!window.SupabaseClient)return;
    const q=read(QKEY), left=[];
    try{
      const c=await SupabaseClient.get();
      for(const x of q){try{const {error}=await c.from(x.table).upsert(x.row);if(error)throw error}catch{left.push(x)}}
      write(QKEY,left); dispatchEvent(new CustomEvent('scout:offline-queue',{detail:{count:left.length}}));
    }catch{}
  }
  async function awardBadge(task){
    const id=task?.id||task?.task_id;if(!id)return;
    const awards=read(BKEY);if(awards.includes(id))return;
    const badge=task.badge_id||task.badge;if(!badge){awards.push(id);write(BKEY,awards);notify('🏅 Tâche terminée',`Ou ranpli « ${task.title||'tâche'} ».`,'task');return}
    try{
      const c=await SupabaseClient.get(), session=(await c.auth.getSession()).data.session, member=session?.user?.id;
      if(!member)throw new Error('no session');
      const {error}=await c.from('member_badges').upsert({member_id:member,badge_id:badge,earned_at:new Date().toISOString()});
      if(error)throw error;
    }catch{queue('member_badges',{member_id:'__SESSION__',badge_id:badge,earned_at:new Date().toISOString()})}
    awards.push(id);write(BKEY,awards);notify('🏅 Nouvo badj!',`Ou ranpli « ${task.title||'tâche'} ».`,'badge');
  }
  async function taskCompleted(task){
    const t={...task,status:'completed',completed_at:new Date().toISOString()};
    try{const c=await SupabaseClient.get();const {error}=await c.from('tasks').upsert(t);if(error)throw error;await awardBadge(t)}
    catch{queue('tasks',t);await awardBadge(t)}
    dispatchEvent(new CustomEvent('scout:task-completed',{detail:t}));
  }
  function calendarEvent(event){
    const e={...event,id:event.id||(crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()))};
    const a=read('scoutHub.v11.calendar'),i=a.findIndex(x=>x.id===e.id);if(i>=0)a[i]=e;else a.push(e);write('scoutHub.v11.calendar',a);
    if(navigator.onLine)SupabaseClient.get().then(c=>c.from('activities').upsert(e)).catch(()=>queue('activities',e));else queue('activities',e);
    dispatchEvent(new CustomEvent('scout:calendar-updated',{detail:e}));return e;
  }
  addEventListener('online',flush); addEventListener('load',flush);
  addEventListener('scout:realtime-event',e=>{const t=e.detail?.table,r=e.detail?.record||e.detail?.payload?.new||{};if(t==='announcements'){notify(r.is_emergency?'🚨 ALÈT IJANS':'📢 Nouvo anons',r.content||r.body||r.title||'Nouvo anons',r.is_emergency?'emergency':'announcement');if(r.is_emergency)dispatchEvent(new CustomEvent('scout:emergency-announcement',{detail:r}));}else if(t)notify('🔄 Realtime',`Nouvo chanjman nan ${t}.`,'realtime')});
  window.ScoutV11={notify,queue,flush,awardBadge,taskCompleted,calendarEvent};
})();
