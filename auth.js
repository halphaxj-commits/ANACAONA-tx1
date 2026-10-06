/* ==========================================================
   SCOUT HUB ONLINE — js/auth.js
   Same public interface as before: Auth.get()/restore()/clear().
   Now backed by a real Supabase Auth session instead of a PHP
   session cookie.
   ========================================================== */

const Auth = (function () {
  let me = null;

  function get() { return me; }

  async function restore() {
    try {
      const r = await API.me();
      me = r.data.user;
    } catch {
      me = null;
    }
    return me;
  }

  function clear() { me = null; }

  return { get, restore, clear };
})();
