/* SCOUT HUB V30 — UX layer: simpler home + dedicated learning hub */
const ScoutLearning = (() => {
  let bound = false;
  function openLesson(id){
    if (typeof Features !== 'undefined') Features.open('lessons');
    setTimeout(() => document.querySelector(`.lesson-open[data-id="${CSS.escape(String(id))}"]`)?.click(), 120);
  }
  function webSearch(query){
    const q = String(query || 'scoutisme').trim();
    window.open('https://www.google.com/search?q=' + encodeURIComponent(q + ' scoutisme'), '_blank', 'noopener');
  }
  function render(){
    const root = document.getElementById('learningHub');
    if (!root || typeof Lessons === 'undefined') return;
    const cat = Lessons.getCatalog ? Lessons.getCatalog() : [];
    if (!Lessons.isLoaded?.()) {
      root.innerHTML = '<div class="v30-loading">📚 Chajman bibliyotèk Scout…</div>';
      Lessons.loadAll().then(render).catch(() => { root.innerHTML = '<div class="v30-empty">Pa kapab chaje leson yo kounye a.</div>'; });
      return;
    }
    const categories = [...new Set(cat.map(x => x.category).filter(Boolean))];
    root.innerHTML = `
      <section class="learn-hero">
        <div class="learn-hero-icon">📚</div>
        <div><span class="v30-kicker">SCOUT ACADEMY</span><h1>Aprann plis. Pratike plis.</h1><p>Leson, quiz ak rechèch pou ede w vin yon Scout ki pi prepare.</p></div>
      </section>
      <div class="learn-tools">
        <label class="learn-search"><span>🔎</span><input id="v30LessonSearch" type="search" placeholder="Chèche yon leson…"></label>
        <button id="v30WebSearch" class="v30-outline-btn">🌐 Rechèch entènèt</button>
      </div>
      <div class="learn-meta"><span>📘 ${cat.length} leson</span><span>🧠 Quiz</span><span>🏆 Pwogrè sove</span><span>🌐 Recherche externe</span></div>
      <div id="v30LessonGrid" class="v30-lesson-grid"></div>
      <section class="research-card"><div><strong>🔎 Bezwen plis enfòmasyon?</strong><p>Chèche sou entènèt sou sijè Scout la san w pa kite app la.</p></div><button id="v30ResearchBtn" class="primary-btn">🌐 Rechèch</button></section>`;
    const draw = (term='') => {
      const t = term.toLowerCase().trim();
      const filtered = cat.filter(l => `${l.title} ${l.description||''} ${l.category||''}`.toLowerCase().includes(t));
      const grid = document.getElementById('v30LessonGrid');
      grid.innerHTML = filtered.length ? filtered.map(l => {
        const p = Lessons.getProgress(l.id);
        const done = !!p?.completed;
        const pct = done ? 100 : Math.min(99, Math.round(((p?.current_step||0) / Math.max(1,l.steps?.length||1))*100));
        return `<article class="v30-lesson-card"><div class="v30-lesson-icon">📖</div><div class="v30-lesson-body"><span class="v30-category">${Utils.esc(l.category||'Scout')}</span><h3>${Utils.esc(l.title)}</h3><p>${Utils.esc(l.description||'Aprann yon nouvo konpetans Scout.')}</p><div class="v30-progress"><i style="width:${pct}%"></i></div><small>${done?'✅ Konplete':p?`▶️ ${pct}% fini`:'✨ Nouvo'}</small></div><button class="v30-play" data-v30-lesson="${Utils.esc(l.id)}">${done?'↻':'▶'}</button></article>`;
      }).join('') : '<div class="v30-empty">😕 Pa gen leson ki koresponn.</div>';
      grid.querySelectorAll('[data-v30-lesson]').forEach(b => b.onclick = () => openLesson(b.dataset.v30Lesson));
    };
    draw();
    document.getElementById('v30LessonSearch').oninput = e => draw(e.target.value);
    document.getElementById('v30WebSearch').onclick = () => webSearch(document.getElementById('v30LessonSearch').value || 'techniques scoutisme');
    document.getElementById('v30ResearchBtn').onclick = () => webSearch(document.getElementById('v30LessonSearch').value || 'techniques scoutisme');
  }
  function init(){ if (bound) return; bound = true; }
  return {init,render,webSearch};
})();
