/* ==========================================================
   SCOUT HUB ONLINE — js/syncEngine.js

   Bridges StorageService's local mirror with Supabase. Nothing
   in members.js/activities.js/features.js calls this directly —
   storage.js calls SyncEngine.pushCreate/pushUpdate/pushDelete/
   pushSettings after every local write, and app.js calls
   SyncEngine.start() once at boot.
   ========================================================== */

const SyncEngine = (function () {
  let myMemberId = null;
  let channels = [];
  let started = false;

  async function sb() { return SupabaseClient.get(); }

  async function session() {
    const client = await sb();
    const { data } = await client.auth.getSession();
    return data.session || null;
  }

  // ---- row <-> local shape (1:1 column names for members/activities/tasks) ----
  function fromTasksRow(r) { return r; }
  function fromMembersRow(r) { return r; }
  function fromActivitiesRow(r) { return r; }
  function fromAnnouncementsRow(r) { return { id: r.id, title: r.title, content: r.content || r.body || '', date: r.date || r.created_at, is_emergency: !!r.is_emergency }; }

  async function pullAll() {
    const s = await session();
    if (!s) return; // not logged in — stay local-only, same as original app offline behavior
    const client = await sb();

    const [members, activities, tasks, announcements] = await Promise.all([
      client.from('members').select('*').order('first_name'),
      client.from('activities').select('*').order('date'),
      client.from('tasks').select('*').order('created_at', { ascending: false }),
      client.from('announcements').select('*').order('date', { ascending: false })
    ]);
    if (members.data) StorageService.replaceCollection('members', members.data.map(fromMembersRow));
    if (activities.data) StorageService.replaceCollection('activities', activities.data.map(fromActivitiesRow));
    if (tasks.data) StorageService.replaceCollection('tasks', tasks.data.map(fromTasksRow));
    if (announcements.data) StorageService.replaceCollection('announcements', announcements.data.map(fromAnnouncementsRow));

    const { data: meRow } = await client.from('members').select('id').eq('user_id', s.user.id).maybeSingle();
    myMemberId = meRow ? meRow.id : null;

    if (myMemberId) {
      const { data: mb } = await client.from('member_badges').select('awarded_at,badges(id,name,description)').eq('member_id', myMemberId);
      if (mb) StorageService.replaceCollection('badges', mb.map((r) => ({ id: r.badges.id, name: r.badges.name, description: r.badges.description, awarded_at: r.awarded_at })));

      const { data: ms } = await client.from('member_skills').select('progress,skills(id,name,description)').eq('member_id', myMemberId);
      if (ms) StorageService.replaceCollection('skills', ms.map((r) => ({ id: r.skills.id, name: r.skills.name, description: r.skills.description, progress: r.progress })));
    }

    const { data: settingsRow } = await client.from('settings').select('*').eq('user_id', s.user.id).maybeSingle();
    if (settingsRow) {
      const d = StorageService.data();
      d.settings = { ...d.settings, theme: settingsRow.theme, language: settingsRow.language };
      localStorage.setItem('scoutHub.v2', JSON.stringify(d));
    }
  }

  function subscribeRealtime() {
    channels.forEach((c) => c.unsubscribe && c.unsubscribe());
    channels = [];

    sb().then((client) => {
      const channel = client.channel('scout-hub-db-sync');

      const refetch = (table, payload) => {
        window.dispatchEvent(new CustomEvent('scout:realtime-event', {
          detail: { table, record: payload?.new || payload?.old || {}, payload }
        }));
        if (['members','activities','tasks','announcements'].includes(table)) {
          pullTable(table).catch(console.warn);
        } else if (table === 'member_badges') {
          pullMyBadges().catch(console.warn);
        } else if (table === 'member_skills') {
          pullMySkills().catch(console.warn);
        }
      };

      const tables = [
        'members',
        'activities',
        'tasks',
        'announcements',
        'member_badges',
        'member_skills',
        'notifications',
        'music_tracks',
        'member_lesson_progress',
        'task_completions',
        'scout_progress',
        'scout_challenges',
        'admin_audit_logs'
      ];

      tables.forEach((table) => {
        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => refetch(table, payload)
        );
      });

      channel.subscribe((status) => {
        window.dispatchEvent(new CustomEvent('scout:realtime-status', {
          detail: { status, tables }
        }));
        if (status === 'SUBSCRIBED') {
          window.dispatchEvent(new CustomEvent('scout:realtime-ready', {
            detail: { tables }
          }));
        }
      });

      channels.push(channel);
    }).catch((err) => {
      window.dispatchEvent(new CustomEvent('scout:realtime-status', {
        detail: { status: 'CHANNEL_ERROR', error: String(err?.message || err) }
      }));
      console.error('[SyncEngine] realtime start failed', err);
    });
  }

  function debounced(fn) {
    let t;
    return () => { clearTimeout(t); t = setTimeout(fn, 150); };
  }

  async function pullTable(name) {
    const client = await sb();
    const orderCol = name === 'activities' ? 'date' : name === 'announcements' ? 'date' : 'created_at';
    const { data } = await client.from(name).select('*').order(orderCol, { ascending: name !== 'announcements' && name !== 'tasks' });
    if (data) {
      StorageService.replaceCollection(name, name === 'announcements' ? data.map(fromAnnouncementsRow) : data);
      if (typeof App !== 'undefined' && App.refresh) App.refresh();
    }
  }

  // ---- push (fire-and-forget from storage.js's perspective; errors are
  // caught so a Supabase hiccup never breaks the already-applied local write) ----

  async function pushCreate(name, row) {
    const s = await session();
    if (!s) return;
    const client = await sb();
    try {
      if (name === 'members') {
        const { data: createdMember, error: memberError } = await client.from('members').insert({ user_id: null, first_name: row.first_name, last_name: row.last_name, scout_name: row.scout_name || null, member_id: row.member_id, unit: row.unit || null, patrol: row.patrol || null, unit_role: row.unit_role || 'Sp', role: 'member' }).select('*').single(); if(memberError) throw memberError; if(createdMember){ StorageService.removeRow('members', row.id); StorageService.upsertRow('members', createdMember); }
      } else if (name === 'activities') {
        await client.from('activities').insert({ title: row.title, date: row.date, time: row.time || null, location: row.location || null, description: row.description || null });
      } else if (name === 'tasks') {
        const {data:createdTask,error:taskError}=await client.from('tasks').insert({ title: row.title, description: row.description || null, due_date: row.due_date || null, priority: row.priority || 'normal', completed: !!row.completed, badge_hint: row.badge_hint || null, badge_title: row.badge_title || null, badge_icon: row.badge_icon || '🏅', skill_name: row.skill_name || null }).select('*').single();
        if(taskError) throw taskError;
        if(createdTask){ StorageService.removeRow('tasks', row.id); StorageService.upsertRow('tasks', createdTask); }
      } else if (name === 'announcements') {
        await client.from('announcements').insert({ title: row.title, content: row.content, author_user_id: s.user.id, is_emergency: !!row.is_emergency });
      } else if (name === 'skills') {
        const { data: skillRow } = await client.from('skills').select('id').eq('name', row.name).maybeSingle();
        if (skillRow && myMemberId) {
          await client.from('member_skills').upsert({ member_id: myMemberId, skill_id: skillRow.id, progress: row.progress || 0 });
        }
      }
    } catch (err) { console.error('[SyncEngine] pushCreate failed', name, err); }
  }

  async function pushUpdate(name, row) {
    const s = await session();
    if (!s) return;
    const client = await sb();
    try {
      if (name === 'members') {
        await client.from('members').update({ first_name: row.first_name, last_name: row.last_name, scout_name: row.scout_name || null, member_id: row.member_id, unit: row.unit || null, patrol: row.patrol || null, unit_role: row.unit_role || 'Sp' }).eq('id', row.id);
      } else if (name === 'activities') {
        await client.from('activities').update({ title: row.title, date: row.date, time: row.time || null, location: row.location || null, description: row.description || null }).eq('id', row.id);
      } else if (name === 'tasks') {
        await client.from('tasks').update({ title: row.title, description: row.description || null, due_date: row.due_date || null, priority: row.priority || 'normal', completed: !!row.completed, badge_hint: row.badge_hint || null, badge_title: row.badge_title || null, badge_icon: row.badge_icon || '🏅', skill_name: row.skill_name || null }).eq('id', row.id);
        if(row.completed && typeof BadgeEngine!=='undefined') await BadgeEngine.checkTaskCompletion(row);
      } else if (name === 'skills') {
        if (myMemberId) await client.from('member_skills').upsert({ member_id: myMemberId, skill_id: row.id, progress: row.progress || 0 });
      }
    } catch (err) { console.error('[SyncEngine] pushUpdate failed', name, err); }
  }

  async function pushDelete(name, row) {
    const s = await session();
    if (!s) return;
    const client = await sb();
    try {
      if (name === 'members') await client.from('members').delete().eq('id', row.id);
      else if (name === 'activities') await client.from('activities').delete().eq('id', row.id);
      else if (name === 'tasks') await client.from('tasks').delete().eq('id', row.id);
    } catch (err) { console.error('[SyncEngine] pushDelete failed', name, err); }
  }

  async function pushSettings(s) {
    const sess = await session();
    if (!sess) return;
    const client = await sb();
    try {
      await client.from('settings').upsert({ user_id: sess.user.id, theme: s.theme, language: s.language });
    } catch (err) { console.error('[SyncEngine] pushSettings failed', err); }
  }

  async function start() {
    const s = await session();
    if (!s) return;
    await pullAll();
    subscribeRealtime();
    started = true;
  }

  window.addEventListener('online', () => { if (started) start().catch(console.warn); });

  function getMyMemberId() { return myMemberId; }

  async function pullMyBadges() {
    if (!myMemberId) return;
    const client = await sb();
    const { data: mb } = await client.from('member_badges').select('awarded_at,badges(id,name,description)').eq('member_id', myMemberId);
    if (mb) StorageService.replaceCollection('badges', mb.map((r) => ({ id: r.badges.id, name: r.badges.name, description: r.badges.description, awarded_at: r.awarded_at })));
  }

  async function pullMySkills() {
    if (!myMemberId) return;
    const client = await sb();
    const { data: ms } = await client.from('member_skills').select('progress,skills(id,name,description)').eq('member_id', myMemberId);
    if (ms) StorageService.replaceCollection('skills', ms.map((r) => ({ id: r.skills.id, name: r.skills.name, description: r.skills.description, progress: r.progress })));
  }

  return { start, pullAll, pushCreate, pushUpdate, pushDelete, pushSettings, getMyMemberId, pullMyBadges, pullMySkills };
})();
