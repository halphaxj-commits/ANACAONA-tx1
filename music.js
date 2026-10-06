/* ==========================================================
   SCOUT HUB ONLINE — js/music.js
   3 real, distinct original tracks (verified different audio,
   compressed WAV->MP3 for low-end Android/mobile data), plus the
   ability to add your own local files. Site-wide tracks can also
   be managed by leaders/admins via Supabase (music_tracks table).
   ========================================================== */

const ScoutMusic = (function () {
  let audio = null, tracks = [], current = -1, siteTracks = [], isLeader = false, loopEnabled = false;
  const STORE = 'scoutHub.music.v2';

  function load() {
    try { tracks = JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { tracks = []; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(tracks.map(({ name, artist, src }) => ({ name, artist, src })))); } catch {}
  }

  async function loadSite() {
    siteTracks = [];
    try {
      const client = await SupabaseClient.get();
      const { data } = await client.from('music_tracks').select('*').eq('active', true).order('sort_order');
      if (Array.isArray(data) && data.length) {
        siteTracks = data.map((t) => ({ name: t.title, artist: t.artist, src: t.audio_url, icon: t.icon || '🎵', site: true, id: t.id }));
      }
    } catch {}
    if (!siteTracks.length) {
      try {
        const r = await fetch('./music/library.json', { cache: 'no-store' });
        if (r.ok) siteTracks = await r.json();
      } catch { siteTracks = []; }
    }
  }

  function all() { return [...siteTracks.map((t) => ({ ...t, site: true })), ...tracks.map((t) => ({ ...t, site: false }))]; }

  function row(t, i) {
    return `<div class="music-track ${current === i ? 'playing' : ''}"><span class="music-cover">${Utils.esc(t.icon || '🎵')}</span><div><strong>${Utils.esc(t.name || 'Track')}</strong><small>${Utils.esc(t.artist || 'Scout Music')}${t.site ? ' • Sit' : ' • Lokal'}${t.durationLabel ? ` • ${Utils.esc(t.durationLabel)}` : ''}</small></div><button type="button" data-play-track="${i}" class="secondary-btn">▶️</button>${!t.site ? `<button type="button" data-remove-track="${i}" class="icon-btn">×</button>` : ''}</div>`;
  }

  function renderInto(list) {
    if (!list) return;
    const a = all();
    list.innerHTML = a.length ? a.map(row).join('') : '<p class="muted">Pa gen mizik ankò.</p>';
    list.onclick = (e) => {
      const p = e.target.closest('[data-play-track]');
      const r = e.target.closest('[data-remove-track]');
      if (p) play(+p.dataset.playTrack);
      if (r) { const idx = +r.dataset.removeTrack - siteTracks.length; tracks.splice(idx, 1); save(); render(); }
    };
  }

  function render() { renderInto(document.getElementById('musicList')); }

  function addFiles(files) {
    for (const f of [...files].filter((f) => f.type.startsWith('audio/'))) {
      tracks.push({ name: f.name, artist: 'Fichye lokal', src: URL.createObjectURL(f) });
    }
    save();
    render();
  }

  function play(i) {
    const t = all()[i];
    if (!t) return;
    const a = document.getElementById('scoutAudio');
    if (!a) return;
    a.src = t.src;
    a.loop = loopEnabled;
    a.play().catch(() => {});
    audio = a;
    current = i;
    render();
    if (typeof Sound !== 'undefined') Sound.click();
    a.onended = () => {
      if (loopEnabled) return;
      const next = (i + 1) % all().length;
      if (all().length > 1) play(next);
    };
  }

  function stop() { if (audio) { audio.pause(); audio.currentTime = 0; } }

  async function open() {
    await loadSite();
    App.modal(`<h2>🎶 Mizik Scout</h2><p class="muted">3 mizik orijinal SCOUT HUB + mizik pa ou sou telefòn ou.</p><label class="primary-btn" style="display:inline-block;cursor:pointer">➕ Ajoute mizik pa ou<input id="musicFiles" type="file" accept="audio/*" multiple hidden></label><div id="musicList" class="music-list" style="margin-top:12px"></div><div style="display:flex;gap:8px;margin-top:12px"><button type="button" id="musicLoop" class="secondary-btn">🔁 Loop: <span>${loopEnabled ? 'ON' : 'OFF'}</span></button><button type="button" id="musicNext" class="secondary-btn">⏭️ Apre</button></div><audio id="scoutAudio" controls preload="metadata" style="width:100%;margin-top:12px"></audio>`);
    document.getElementById('musicFiles').onchange = (e) => addFiles(e.target.files);
    document.getElementById('musicLoop').onclick = () => {
      loopEnabled = !loopEnabled;
      const a = document.getElementById('scoutAudio');
      if (a) a.loop = loopEnabled;
      document.querySelector('#musicLoop span').textContent = loopEnabled ? 'ON' : 'OFF';
    };
    document.getElementById('musicNext').onclick = () => {
      const n = all().length ? (current + 1 + all().length) % all().length : -1;
      if (n >= 0) play(n);
    };
    render();
  }

  async function init() { load(); }

  return { init, open, stop };
})();
