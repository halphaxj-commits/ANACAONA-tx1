import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../js/games.js', import.meta.url), 'utf8');

assert.match(source, /id:'semo-play'/, 'Existing SEMO Play link must stay');
assert.match(source, /id:'belajar-pramuka'/, 'Existing Belajar Pramuka link must stay');
assert.match(source, /id:'quiz-morse'/, 'Existing Quiz Morse link must stay');
assert.match(source, /id:'knotcraft'/, 'Existing KnotCraft link must stay');
assert.match(source, /id:'scout-knots'/, 'Existing Scout Knots link must stay');
assert.match(source, /id:'scouting-notes'/, 'Existing Scouting Notes link must stay');

assert.match(source, /id:'scoutmaster-challenge'/, 'New Scoutmaster Challenge link must be present');
assert.match(source, /id:'camo-camping-adventure'/, 'New CAMO game link must be present');
assert.match(source, /id:'morse-game'/, 'New Morse game link must be present');

console.log('games test: PASS');
