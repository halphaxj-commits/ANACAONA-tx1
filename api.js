/* ==========================================================
   SCOUT HUB ONLINE — js/api.js

   Same public method names as the original PHP-backed version
   (health/register/login/logout/me/members/createMember/messages/
   sendMessage/upload) and the same resolve-or-throw contract
   Utils.jsonFetch used ({success:true,data:...} on success, throws
   Error(message) on failure) — so features.js's account UI, and
   anything else calling API.xxx(), needed ZERO changes.

   Backed by Supabase Auth + Postgres + Storage instead of PHP.
   ========================================================== */

const API = (function () {
  async function sb() { return SupabaseClient.get(); }

  function fail(msg) { const e = new Error(msg); throw e; }

  async function health() {
    const client = await sb();
    const { error } = await client.from('badges').select('id').limit(1);
    if (error) fail(error.message);
    return { success: true, data: { supabase: true } };
  }

  function friendlyAuthError(error) {
    const msg = String(error?.message || error || 'Erreur inconnue');
    const low = msg.toLowerCase();
    if (low.includes('invalid login credentials')) return 'Email oswa modpas la pa kòrèk.';
    if (low.includes('email not confirmed')) return 'Email la poko verifye. Verifye bwat resepsyon/spam ou, oswa itilize “Voye email verifikasyon an ankò”.';
    if (low.includes('user already registered') || low.includes('already been registered') || low.includes('already registered')) return 'Kont sa a deja egziste. Pa kreye yon dezyèm kont ak menm email la. Eseye Konekte oswa “Mwen pèdi modpas mwen”.';
    if (low.includes('password should be at least')) return 'Modpas la dwe gen omwen 8 karaktè.';
    if (low.includes('rate limit')) return 'Twòp demann email. Tann kèk minit epi eseye ankò.';
    return msg;
  }

  async function register({ email, password, first_name, last_name, member_id, scout_name, unit, patrol, unit_role }) {
    const client = await sb();
    const redirectTo = window.location.origin + window.location.pathname;
    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(), password,
      options: { data: { first_name, last_name, member_id, scout_name, unit, patrol, unit_role: unit_role || 'Sp' }, emailRedirectTo: redirectTo }
    });
    if (error) fail(friendlyAuthError(error));
    if (!data.user) fail('Supabase pa retounen kont lan. Eseye ankò.');
    if (!data.session) {
      return { success: true, data: { user: { id: data.user.id, email: data.user.email }, needsEmailConfirmation: true } };
    }
    await SyncEngine.start();
    return { success: true, data: { user: { id: data.user.id, email: data.user.email }, needsEmailConfirmation: false } };
  }

  async function resendConfirmation(email) {
    const client = await sb();
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await client.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: redirectTo } });
    if (error) fail(friendlyAuthError(error));
    return { success: true, data: {} };
  }

  async function resetPassword(email) {
    const client = await sb();
    const redirectTo = window.location.origin + window.location.pathname + '?reset=1';
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) fail(friendlyAuthError(error));
    return { success: true, data: {} };
  }

  async function updatePassword(password) {
    const client = await sb();
    const { error } = await client.auth.updateUser({ password });
    if (error) fail(friendlyAuthError(error));
    return { success: true, data: {} };
  }

  async function login({ email, password }) {
    const client = await sb();
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) fail(friendlyAuthError(error));
    if (!data.session) fail('Koneksyon an pa kreye. Eseye ankò.');
    await SyncEngine.start();
    return { success: true, data: { user: { id: data.user.id, email: data.user.email } } };
  }

  async function loginWithGoogle() {
    const client = await sb();
    // Supabase must allow this public app URL in Authentication → URL Configuration.
    // The Google OAuth client itself uses the fixed Supabase callback URL.
    const redirectTo = window.location.origin + window.location.pathname;
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'select_account' }
      }
    });
    if (error) fail(friendlyAuthError(error));
    if (!data?.url) fail('Supabase pa retounen lyen Google la. Verifye Google provider la aktive.');
    return { success: true, data: { url: data.url } };
  }

  async function logout() {
    const client = await sb();
    const { error } = await client.auth.signOut();
    if (error) fail(error.message);
    return { success: true, data: {} };
  }

  async function me() {
    const client = await sb();
    // Validate the session against Supabase, not only the locally cached JWT.
    // This prevents a deleted/invalid account from looking authenticated offline.
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user) fail('NOT_AUTHENTICATED');
    return { success: true, data: { user: { id: data.user.id, email: data.user.email } } };
  }

  async function members() {
    const client = await sb();
    const { data, error } = await client.from('members').select('*').order('first_name');
    if (error) fail(error.message);
    return { success: true, data: { members: data } };
  }

  async function createMember(m) {
    const client = await sb();
    const { data, error } = await client.from('members').insert(m).select().single();
    if (error) fail(error.message);
    return { success: true, data: { member: data } };
  }

  // Kept for interface completeness; chat.js talks to Supabase directly
  // for realtime subscriptions, which this simple request/response shape
  // can't provide.
  async function messages(peerMemberId) {
    const client = await sb();
    const my = SyncEngine.getMyMemberId();
    if (!my) fail('NOT_AUTHENTICATED');
    const { data: convRows } = await client.from('conversation_members').select('conversation_id').eq('member_id', my);
    const convIds = (convRows || []).map((r) => r.conversation_id);
    let conversationId = null;
    if (convIds.length) {
      const { data: shared } = await client
        .from('conversation_members')
        .select('conversation_id')
        .eq('member_id', peerMemberId)
        .in('conversation_id', convIds);
      if (shared && shared.length) conversationId = shared[0].conversation_id;
    }
    if (!conversationId) return { success: true, data: { messages: [], me: my } };
    const { data, error } = await client.from('messages').select('*').eq('conversation_id', conversationId).order('created_at');
    if (error) fail(error.message);
    return { success: true, data: { messages: data, me: my } };
  }

  async function sendMessage({ to_member_id, type, content, client_id }) {
    const client = await sb();
    const my = SyncEngine.getMyMemberId();
    if (!my) fail('NOT_AUTHENTICATED');
    const { data: convRows } = await client.from('conversation_members').select('conversation_id').eq('member_id', my);
    const convIds = (convRows || []).map((r) => r.conversation_id);
    let conversationId = null;
    if (convIds.length) {
      const { data: shared } = await client
        .from('conversation_members')
        .select('conversation_id')
        .eq('member_id', to_member_id)
        .in('conversation_id', convIds);
      if (shared && shared.length) conversationId = shared[0].conversation_id;
    }
    if (!conversationId) {
      const { data: conv, error: convErr } = await client.from('conversations').insert({}).select().single();
      if (convErr) fail(convErr.message);
      conversationId = conv.id;
      await client.from('conversation_members').insert([
        { conversation_id: conversationId, member_id: my },
        { conversation_id: conversationId, member_id: to_member_id }
      ]);
    }
    const { data, error } = await client
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: my, receiver_id: to_member_id, message_type: type, content, client_id: client_id || null })
      .select()
      .single();
    if (error) fail(error.message);
    return { success: true, data: { message: data } };
  }

  async function upload(file, type) {
    const client = await sb();
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) fail('NOT_AUTHENTICATED');
    const bucket = type === 'voice' ? 'chat-audio' : 'chat-images';
    const ext = (file.name && file.name.split('.').pop()) || (type === 'voice' ? 'webm' : 'jpg');
    const path = sessionData.session.user.id + '/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext;
    const { error: upErr } = await client.storage.from(bucket).upload(path, file, { contentType: file.type || undefined });
    if (upErr) fail(upErr.message);
    const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
    return { success: true, data: { url: pub.publicUrl, path } };
  }

  return { health, register, resendConfirmation, resetPassword, updatePassword, login, loginWithGoogle, logout, me, members, createMember, messages, sendMessage, upload };
})();
