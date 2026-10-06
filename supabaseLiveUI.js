(() => {
  const set = (id, text) => {
    const e = document.getElementById(id);
    if (e) e.textContent = text;
  };

  const status = (value) => {
    const ok = value === 'SUBSCRIBED' || value === 'LIVE';
    set('supabaseRealtimeState', ok ? '🟢 LIVE' : (value || '…'));
    set('supabaseLiveBadge', ok ? '🟢 LIVE' : (value || '…'));
  };

  window.addEventListener('scout:realtime-status', e => status(e.detail?.status));
  window.addEventListener('scout:realtime-ready', () => {
    status('LIVE');
    set('supabaseDbState', '🟢 CONNECTED');
    set('supabaseTwoPhoneState', '🟢 SYNC');
  });

  setTimeout(async () => {
    try {
      const c = await SupabaseClient.get();
      const q = await c.from('members').select('id', { count: 'exact', head: true });
      set('supabaseDbState', q.error ? '🔴 ERROR' : '🟢 CONNECTED');
    } catch {
      set('supabaseDbState', '🔴 OFFLINE');
    }
  }, 1000);
})();
