/* SCOUT HUB V12 — offline messages, badge automation, announcement alerts, daily calendar */
(() => {
  const Q='scoutHub.v12.queue', L='scoutHub.v12.localMessages', N='scoutHub.v12.alerts', D='scoutHub.v12.dailyCalendar';
  const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());
  const get=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
  const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

  function queue(table,row){const q=get(Q);q.push({id:uid(),table,row,created_at:new Date().toISOString()});put(Q,q);dispatchEvent(new CustomEvent('scout:offline-queue',{detail:{count:q.length}}))}
  async function flush(){
    if(!navigator.onLine||!window.SupabaseClient)return;
    const q=get(Q),left=[];
    try{
      const c=await SupabaseClient.get();
      for(const x of q){try{const {error}=await c.from(x.table).upsert(x.row);if(error)throw error}catch{left.push(x)}}
      put(Q,left);dispatchEvent(new CustomEvent('scout:offline-queue',{detail:{count:left.length}}))
    }catch{}
  }

  // A message sent while offline is shown instantly as "pending" and queued.
  async function sendMessage(message){
    const m={id:uid(),client_id:uid(),created_at:new Date().toISOString(),message_type:'text',...message,status:navigator.onLine?'sending':'pending'};
    const local=get(L);local.push(m);put(L,local);
    if(!navigator.onLine){queue('messages',{...m,status:'sent'});dispatchEvent(new CustomEvent('scout:message-local',{detail:m}));return m}
    try{
      const c=await SupabaseClient.get();
      const row={conversation_id:m.conversation_id,sender_id:m.sender_id,receiver_id:m.receiver_id,message_type:m.message_type,content:m.content,created_at:m.created_at,client_id:m.client_id,sender_member_id:m.sender_member_id,receiver_member_id:m.receiver_member_id,sender_user_id:m.sender_user_id,file_path:m.file_path,duration_sec:m.duration_sec};
      const {error}=await c.from('messages').insert(row);if(error)throw error;m.status='sent';
    }catch{m.status='pending';queue('messages',m)}
    put(L,local);dispatchEvent(new CustomEvent('scout:message-local',{detail:m}));return m;
  }

  async function processTask(task){
    if(!task?.id)return;
    const now=new Date().toISOString();
    const t={...task,completed:true,status:'completed',completed_at:now};
    try{const c=await SupabaseClient.get();const {error}=await c.from('tasks').upsert(t);if(error)throw error}catch{queue('tasks',t)}
    // Existing schema has badge_title/icon and skill_name on tasks.
    const session=window.SupabaseClient?await (await SupabaseClient.get()).auth.getSession():null;
    const member=session?.data?.session?.user?.id;
    if(member){
      const badgeTitle=t.badge_title, icon=t.badge_icon;
      if(badgeTitle){
        try{
          const c=await SupabaseClient.get();
          const badges=await c.from('badges').select('id').eq('title',badgeTitle).limit(1);
          let badgeId=badges.data?.[0]?.id;
          if(!badgeId){
            const made=await c.from('badges').insert({title:badgeTitle,name:badgeTitle,icon:icon||'🏅',description:'Badge gagné automatiquement',criteria:t.badge_hint||'Tâche complétée',member_id:member,awarded_at:now,source_task_id:t.id,auto_awarded:true}).select('id').single();
            badgeId=made.data?.id;
          }
          if(badgeId) await c.from('member_badges').upsert({member_id:member,badge_id:badgeId,awarded_at:now});
        }catch(e){queue('badges',{title:badgeTitle,name:badgeTitle,icon:icon||'🏅',member_id:member,awarded_at:now,source_task_id:t.id,auto_awarded:true})}
        alertUser('🏅 Badj touche!',`${icon||'🏅'} ${badgeTitle}`,'badge');
      }
    }
    dispatchEvent(new CustomEvent('scout:task-completed',{detail:t}));
  }

  function alertUser(title,body,kind='alert'){
    const a=get(N);const x={id:uid(),title,body,kind,created_at:new Date().toISOString(),read:false};a.unshift(x);put(N,a.slice(0,100));
    dispatchEvent(new CustomEvent('scout:alert',{detail:x}));
    if('Notification' in window && Notification.permission==='granted')try{new Notification(title,{body,tag:kind})}catch{}
  }

  function handleAnnouncement(a){
    const title=a?.title||'📢 Nouvo anons';
    const body=a?.content||a?.body||'Gen yon nouvo anons SCOUT HUB.';
    alertUser('🛑 '+title,body,'announcement');
  }

  function dailyCalendar(){
    const today=new Date().toISOString().slice(0,10);
    const events=get(D);
    return events.filter(x=>x.date===today||x.activity_date===today).sort((a,b)=>String(a.time||a.activity_time||'').localeCompare(String(b.time||b.activity_time||'')));
  }

  async function refreshDailyCalendar(){
    let items= [];
    try{
      const c=await SupabaseClient.get();
      const {data,error}=await c.from('activities').select('*').order('date',{ascending:true});
      if(!error&&data){items=data;put(D,data)}
    }catch{items=get(D)}
    const today=new Date().toISOString().slice(0,10);
    const todays=items.filter(x=>x.date===today||x.activity_date===today);
    put('scoutHub.v12.today',todays);
    dispatchEvent(new CustomEvent('scout:daily-calendar',{detail:{date:today,events:todays}}));
    return todays;
  }

  addEventListener('online',flush);
  addEventListener('load',()=>{flush();refreshDailyCalendar()});
  addEventListener('scout:realtime-event',e=>{
    const table=e.detail?.table;
    if(table==='announcements') handleAnnouncement(e.detail?.record||{});
    if(table==='activities') refreshDailyCalendar();
  });

  window.ScoutV12={sendMessage,processTask,alertUser,handleAnnouncement,refreshDailyCalendar,dailyCalendar,flush,queue};
})();
