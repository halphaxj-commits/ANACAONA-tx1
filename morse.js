/* ==========================================================
   SCOUT HUB ONLINE — js/morse.js

   Text<->Morse converter + audio playback (whistle-style tone,
   not a plain beep — a Scout whistle is bright/piercing, so this
   mixes two close high frequencies rather than one flat tone) +
   a lightweight practice quiz (not progress-tracked in Supabase —
   this is a quick drill, not a formal lesson).
   ========================================================== */

const Morse = (function () {
  const MAP = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
  };
  const REV = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [v, k]));

  function encode(text) {
    return String(text || '').toUpperCase().split('').map((ch) => (ch === ' ' ? '/' : (MAP[ch] || ''))).join(' ').trim();
  }

  function decode(code) {
    return String(code || '').trim().split(/\s*\/\s*/).map((word) =>
      word.trim().split(/\s+/).filter(Boolean).map((sym) => REV[sym] || '').join('')
    ).join(' ');
  }

  // Whistle-style tone: two close high frequencies mixed (real whistles
  // aren't a pure single tone) with a fast attack/decay envelope.
  async function playMorse(text) {
    const code = encode(text);
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return code;
    const ac = new AC();
    await ac.resume();
    let t = ac.currentTime;
    const dot = 0.11, gap = 0.075;
    const freqs = [2500, 2900];

    function tone(duration) {
      freqs.forEach((f) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f * 0.92, t);
        o.frequency.linearRampToValueAtTime(f, t + 0.015);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.32, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        o.connect(g).connect(ac.destination);
        o.start(t);
        o.stop(t + duration + 0.01);
      });
    }

    for (const ch of code) {
      if (ch === ' ') { t += gap * 2; continue; }
      if (ch === '/') { t += dot * 5; continue; }
      const d = ch === '.' ? dot : dot * 3;
      tone(d);
      t += d + gap;
    }
    return code;
  }

  // ---- Lightweight practice quiz (not persisted — a quick drill) ----
  const POOL = Object.keys(MAP);

  function randomQuestion() {
    const letter = POOL[Math.floor(Math.random() * POOL.length)];
    const askMorse = Math.random() < 0.5;
    const correct = askMorse ? MAP[letter] : letter;
    const choicesSet = new Set([correct]);
    while (choicesSet.size < 4) {
      const other = POOL[Math.floor(Math.random() * POOL.length)];
      choicesSet.add(askMorse ? MAP[other] : other);
    }
    const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);
    return {
      prompt: askMorse ? `Ki kòd Mòs pou "${letter}"?` : `Ki lèt/chif kòd sa a reprezante: "${MAP[letter]}" ?`,
      choices,
      correctIndex: choices.indexOf(correct)
    };
  }

  return { encode, decode, playMorse, randomQuestion };
})();
