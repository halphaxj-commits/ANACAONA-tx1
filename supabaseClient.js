/* ==========================================================
   SCOUT HUB ONLINE — js/supabaseClient.js
   One shared Supabase client. Loads the supabase-js library from
   CDN lazily (only on first real use) so a device with no
   internet never fails on a blocking <script> tag.
   ========================================================== */

const SupabaseClient = (function () {
  let client = null;
  let sdkLoadPromise = null;

  function loadSdk() {
    if (typeof supabase !== 'undefined') return Promise.resolve();
    if (sdkLoadPromise) return sdkLoadPromise;
    sdkLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('supabase-js pa t kapab chaje (verifye koneksyon Internet ou).'));
      document.head.appendChild(script);
    });
    return sdkLoadPromise;
  }

  async function get() {
    if (!client) {
      await loadSdk();
      client = supabase.createClient(SCOUT_HUB_CONFIG.SUPABASE_URL, SCOUT_HUB_CONFIG.SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }, global: { headers: { 'x-client-info': 'scout-hub-v10' } }
      });
    }
    return client;
  }

  return { get };
})();
