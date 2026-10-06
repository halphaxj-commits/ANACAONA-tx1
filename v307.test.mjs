import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const index = read('../index.html');
const creator = read('../js/creator.js');
const chat = read('../js/chat.js');
const app = read('../js/app.js');
const games = read('../js/games.js');
const features = read('../js/features.js');

assert.match(creator, /SONLSEPYOK/, 'Creator console should show creator identity');
assert.match(creator, /creator-identity/, 'Creator console should have identity styling hook');
assert.match(index, /chatAiBtn/, 'Messages should expose a direct AI button');
assert.match(chat, /ScoutAI\.open|ScoutAI\.ask/, 'Messages should wire the AI assistant');
assert.match(index, /aiQuickAction/, 'Home should expose an AI quick action');
assert.match(app, /count:'exact'/, 'App counters should refresh cloud member count');
assert.match(games, /id:'scoutmaster-challenge'/, 'New Scoutmaster Challenge link must be present');
assert.match(games, /id:'camo-camping-adventure'/, 'New CAMO game link must be present');
assert.match(games, /id:'morse-game'/, 'New Morse game link must be present');
assert.match(features, /langSelect.*onchange/, 'Language selector must have a live change handler');
assert.doesNotMatch(features, /langSelect[\s\S]{0,500}location\.reload\(\)/, 'Changing language must not reload the app');
console.log('v30.7 feature test: PASS');

const scoutAI = read('../js/scoutAI.js');
assert.match(scoutAI, /SpeechRecognition|webkitSpeechRecognition/, 'AI should support voice input');
assert.match(scoutAI, /speechSynthesis/, 'AI should support voice output');
assert.match(scoutAI, /scoutAIListen/, 'AI modal should expose a microphone control');
assert.match(scoutAI, /scoutAISpeak/, 'AI modal should expose a speak control');
