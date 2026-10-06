# SCOUT HUB V30.1 — Push + IA

## Notifications
- Notification permission UI is enabled.
- Foreground notifications and emergency announcement alarm are enabled.
- Service Worker includes the `push` event handler.
- Supabase table `public.push_subscriptions` stores Web Push subscriptions with RLS.
- For true background Web Push delivery, configure `window.SCOUT_VAPID_PUBLIC_KEY` with the public VAPID key and keep the VAPID private key only on a server-side sender. Never put the private key in the app.

## Scout IA
- Offline mode is built into `js/scoutAI.js` and works from the local Scout lesson catalog.
- Online mode calls the authenticated Supabase Edge Function `scout-ai`.
- The function first tries Supabase AI inference and can optionally use `OPENAI_API_KEY` as a server-side fallback.
- No API secret is shipped in the browser.
