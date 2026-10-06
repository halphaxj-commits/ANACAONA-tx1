/* ==========================================================
   SCOUT HUB ONLINE — js/storage.js

   Same public interface as before (collection/add/update/remove/
   data/settings/setSettings/clear/exportData/importData) so every
   caller (members.js, activities.js, features.js, app.js) needs
   ZERO changes. Internally, this now mirrors Supabase:

   - On boot, SyncEngine.start() pulls every shared table from
     Supabase into the same localStorage shape the app already
     reads/writes synchronously.
   - add()/update()/remove() write to the local mirror IMMEDIATELY
     (so the UI stays instant), then push the same change to
     Supabase in the background. If offline or not logged in, the
     write stays local-only (same as the original app's behavior).
   - Supabase Realtime subscriptions pull in changes made by OTHER
     devices and merge them into the local mirror automatically.

   Mapping notes (documented, not hidden):
   - badges/skills mirror this user's OWN member record's awarded
     badges / skill progress (member_badges / member_skills joined
     with the catalog tables), since the existing UI has no
     member-selector — same single-subject assumption the original
     local-only implementation effectively made.
   ========================================================== */

const StorageService = (function () {
  const K = 'scoutHub.v2';
  const defaults = {
    members: [], activities: [], tasks: [], badges: [], skills: [],
    announcements: [], messages: [],
    settings: { theme: 'dark', language: 'ht', apiBase: '' }
  };

  function read() {
    try { return JSON.parse(localStorage.getItem(K)) || structuredClone(defaults); }
    catch { return structuredClone(defaults); }
  }
  function write(d) { localStorage.setItem(K, JSON.stringify(d)); return d; }
  function data() {
    const d = read();
    for (const k of Object.keys(defaults)) if (k !== 'settings' && !Array.isArray(d[k])) d[k] = [];
    d.settings = { ...defaults.settings, ...(d.settings || {}) };
    return d;
  }
  function collection(name) { return data()[name]; }

  function add(name, x) {
    const d = data();
    const r = { id: Utils.uid(), created_at: new Date().toISOString(), ...x };
    d[name].push(r);
    write(d);
    SyncEngine.pushCreate(name, r);
    return r;
  }
  function update(name, id, x) {
    const d = data(), i = d[name].findIndex((v) => v.id === id);
    if (i < 0) return null;
    d[name][i] = { ...d[name][i], ...x };
    write(d);
    SyncEngine.pushUpdate(name, d[name][i]);
    return d[name][i];
  }
  function remove(name, id) {
    const d = data();
    const removed = d[name].find((v) => v.id === id);
    d[name] = d[name].filter((v) => v.id !== id);
    write(d);
    if (removed) SyncEngine.pushDelete(name, removed);
  }
  function settings() { return data().settings; }
  function setSettings(s) {
    const d = data();
    d.settings = { ...d.settings, ...s };
    write(d);
    SyncEngine.pushSettings(d.settings);
  }
  function clear() { localStorage.removeItem(K); }
  function exportData() {
    const d = data();
    return JSON.stringify({ app: 'SCOUT HUB ONLINE', schema: 2, exported_at: new Date().toISOString(), data: d }, null, 2);
  }
  function importData(raw) {
    const p = JSON.parse(raw);
    if (!p?.data || !Array.isArray(p.data.members) || !Array.isArray(p.data.activities)) throw new Error('INVALID_BACKUP');
    const d = data();
    for (const k of ['members', 'activities', 'tasks', 'badges', 'skills', 'announcements', 'messages'])
      if (Array.isArray(p.data[k])) d[k] = p.data[k];
    if (p.data.settings) d.settings = { ...d.settings, ...p.data.settings };
    write(d);
  }

  function replaceCollection(name, rows) {
    const d = data();
    d[name] = rows;
    write(d);
  }
  function upsertRow(name, row) {
    const d = data();
    const i = d[name].findIndex((v) => v.id === row.id);
    if (i >= 0) d[name][i] = row; else d[name].push(row);
    write(d);
  }
  function removeRow(name, id) {
    const d = data();
    d[name] = d[name].filter((v) => v.id !== id);
    write(d);
  }

  return {
    data, collection, add, update, remove, settings, setSettings,
    clear, exportData, importData,
    replaceCollection, upsertRow, removeRow
  };
})();
