/* SCOUT HUB V29 — automatic task badge + skill progression */
const BadgeEngine = (() => {
  async function sb(){return SupabaseClient.get()}
  async function member(){return SyncEngine.getMyMemberId?.()||null}
  async function award(badgeName,meta={}){
    const my=await member();if(!my)return false;const c=await sb();
    let {data:badge}=await c.from('badges').select('id').eq('name',badgeName).maybeSingle();
    if(!badge && meta.create){const made=await c.from('badges').insert({name:badgeName,title:badgeName,description:'Badge gagné automatiquement',criteria:meta.criteria||'Action Scout complétée',icon:meta.icon||'🏅',member_id:null,source_task_id:meta.taskId||null,auto_awarded:true}).select('id').single();badge=made.data}
    if(!badge)return false;
    const {data:existing}=await c.from('member_badges').select('member_id').eq('member_id',my).eq('badge_id',badge.id).maybeSingle();
    if(existing)return false;
    const {error}=await c.from('member_badges').insert({member_id:my,badge_id:badge.id});if(error)return false;
    await SyncEngine.pullMyBadges();await ScoutHubPlus?.recalculateCloudProgress?.();Sound?.success?.();Utils.toast('🏅 Nouvo badj debloke: '+badgeName+'!');App?.counters?.();return true;
  }
  async function updateSkill(name,amount=25){
    if(!name)return false;const my=await member();if(!my)return false;const c=await sb();const {data:skill}=await c.from('skills').select('id').eq('name',name).maybeSingle();if(!skill)return false;
    const {data:cur}=await c.from('member_skills').select('progress').eq('member_id',my).eq('skill_id',skill.id).maybeSingle();const next=Math.min(100,Math.max(0,Number(cur?.progress||0)+amount));
    const {error}=await c.from('member_skills').upsert({member_id:my,skill_id:skill.id,progress:next},{onConflict:'member_id,skill_id'});if(error)return false;await SyncEngine.pullMySkills();return true;
  }
  async function completeTask(task){
    const my=await member();if(!my)return false;const c=await sb();
    await c.from('task_completions').upsert({task_id:task.id,member_id:my,completed_at:new Date().toISOString()},{onConflict:'task_id,member_id'});
    let awarded=false;
    if(task.badge_title) awarded=await award(task.badge_title,{create:true,icon:task.badge_icon||'🏅',taskId:task.id,criteria:task.badge_hint||'Tâche complétée'})||awarded;
    if(task.skill_name) await updateSkill(task.skill_name,25);
    if(!task.badge_title) awarded=await award('Premye Tâche')||awarded;
    await ScoutHubPlus?.recalculateCloudProgress?.();return awarded;
  }
  async function uncompleteTask(task){const my=await member();if(!my)return false;const c=await sb();await c.from('task_completions').delete().eq('task_id',task.id).eq('member_id',my);await ScoutHubPlus?.recalculateCloudProgress?.();return true}
  async function checkTaskCompletion(task){return completeTask(task||{})}
  async function checkLessonCompletion(){const ok=await award('Premye Leson');await ScoutHubPlus?.recalculateCloudProgress?.();return ok}
  return {award,updateSkill,completeTask,uncompleteTask,checkTaskCompletion,checkLessonCompletion};
})();
