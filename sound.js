const Sound = (function () {
  let ctx = null, master = null, ready = false;
  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
    return ctx;
  }
  async function wake() {
    const c = ensure();
    if (!c) return false;
    if (c.state === 'suspended') { try { await c.resume(); } catch {} }
    ready = c.state === 'running';
    return ready;
  }
  function enabled() {
    try { return StorageService.settings().sound !== false; } catch { return true; }
  }
  function note(freq, duration = 0.08, type = 'sine', volume = 0.035, when = 0) {
    if (!enabled()) return;
    const c = ensure();
    if (!c || !master) return;
    const t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + duration + 0.02);
  }
  async function click() { if (!(await wake())) return; note(560, 0.045, 'sine', 0.022); }
  async function success() { if (!(await wake())) return; note(660, 0.07, 'sine', 0.035); note(880, 0.09, 'sine', 0.028, 0.07); note(1040, 0.12, 'sine', 0.022, 0.14); }
  async function error() { if (!(await wake())) return; note(240, 0.09, 'triangle', 0.025); note(180, 0.12, 'triangle', 0.018, 0.08); }
  async function send() { if (!(await wake())) return; note(740, 0.055, 'triangle', 0.03); note(980, 0.075, 'triangle', 0.024, 0.055); }
  async function receive() { if (!(await wake())) return; note(620, 0.06, 'sine', 0.045); note(820, 0.09, 'sine', 0.040, 0.06); }
  async function morse(){ if (!(await wake())) return; note(880,0.10,'square',0.105); note(880,0.10,'square',0.105,0.13); note(880,0.10,'square',0.105,0.26); }
  async function distress(){ if (!(await wake())) return; for(let i=0;i<8;i++){ const base=i%2?620:980; note(base,0.24,'sawtooth',0.13,i*0.28); note(base+90,0.24,'square',0.08,i*0.28+0.12); } }
  async function init() {
    document.addEventListener('pointerdown', () => wake(), { passive: true });
    document.addEventListener('keydown', () => wake(), { passive: true });
    document.addEventListener('pointerdown', (e) => { if (e.target.closest('button,.media-btn,a')) click(); }, { passive: true });
  }
  return { init, wake, click, success, error, send, receive, morse, distress, get ready() { return ready; } };
})();
