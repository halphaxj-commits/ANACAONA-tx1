/* SCOUT HUB V10 — auth recovery bridge
   AuthGate is the single UI for login/register/recovery.
   This file exposes the same operations for any other page that needs them.
*/
window.ScoutAuthRecovery = {
  async resend(email) {
    const client = await SupabaseClient.get();
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await client.auth.resend({
      type: "signup",
      email: String(email || "").trim(),
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
    return true;
  },

  async forgot(email, redirectTo) {
    const client = await SupabaseClient.get();
    const target = redirectTo || (window.location.origin + window.location.pathname + "?reset=1");
    const { error } = await client.auth.resetPasswordForEmail(String(email || "").trim(), {
      redirectTo: target
    });
    if (error) throw error;
    return true;
  },

  async updatePassword(password) {
    const client = await SupabaseClient.get();
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
    return true;
  }
};
