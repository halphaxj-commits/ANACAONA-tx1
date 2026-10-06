const SyncHealth = (() => {
  let timer = null;

  async function run() {
    const set = (id, value) => {
      const e = document.getElementById(id);
      if (e) e.textContent = value;
    };

    set('shInternet', navigator.onLine ? '🟢 ON' : '🟠 OFF');
    set('shLocal', (() => {
      try { return localStorage.getItem('scoutHub.v2') ? '🟢 OK' : '🟠 EMPTY'; }
      catch { return '🔴 ERR'; }
    })());

    try {
      const client = await SupabaseClient.get();
      set('shSupabase', '🟢 CONNECTED');

      const { data, error } = await client.auth.getSession();
      set('shSession', error ? '🔴 ERR' : data.session ? '🟢 AUTH' : '🟠 NONE');

      const q = await client.from('members').select('id', { count: 'exact', head: true });
      set('shMembers', q.error ? '🔴 ERR' : String(q.count ?? 0));

      const tables = [
        'members','activities','tasks','announcements',
        'member_badges','member_skills','notifications',
        'music_tracks','member_lesson_progress'
      ];

      const ch = client.channel('sync-health-check-v10');
      tables.forEach(table => {
        ch.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          set('shRealtime', '🟢 LIVE');
          set('syncHealthText', `Realtime aktif • ${table} chanje`);
        });
      });

      ch.subscribe(status => {
        if (status === 'SUBSCRIBED') {
          set('shRealtime', '🟢 READY');
          set('syncHealthText', 'Supabase + Realtime pare. Chanjman sou yon telefòn dwe rive sou lòt la.');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          set('shRealtime', '🔴 ERROR');
          set('syncHealthText', 'Realtime pa konekte. Verifye RLS + publication supabase_realtime.');
        } else {
          set('shRealtime', status || '…');
        }
      });

      clearTimeout(timer);
      timer = setTimeout(() => {
        try { client.removeChannel(ch); } catch {}
      }, 30000);
    } catch (e) {
      set('shSupabase', '🔴 FAIL');
      set('shSession', '—');
      set('shMembers', '—');
      set('shRealtime', '🔴 FAIL');
      set('syncHealthText', 'Supabase pa disponib kounye a. Done lokal yo rete disponib.');
    }
  }

  function init() {
    document.getElementById('syncHealthBtn')?.addEventListener('click', run);
    window.addEventListener('online', run);
    window.addEventListener('scout:realtime-ready', run);
    window.addEventListener('scout:realtime-status', e => {
      const status = e.detail?.status;
      const el = document.getElementById('shRealtime');
      if (el && status) el.textContent = status === 'SUBSCRIBED' ? '🟢 LIVE' : status;
    });
    setTimeout(run, 900);
  }

  return { init, run };
})();
document.addEventListener('DOMContentLoaded', () => SyncHealth.init());
