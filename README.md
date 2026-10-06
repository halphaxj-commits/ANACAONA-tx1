# SCOUT HUB ONLINE

Production-oriented mobile-first Scout app using HTML/CSS/JavaScript + PHP 8 + SQLite.

## Local/offline
Open through a PHP server for API features. The UI keeps local data in localStorage for offline-first basic management.

## HostPilot
See `HOSTPILOT_SETUP.md`. Put the project in HostPilot web root and open it from the HostPilot URL. For a second phone, use the server phone LAN IP, not `localhost`.

## Authentication
Online API requires Register/Login. Passwords are hashed server-side with `password_hash()`.

## Games

## Important
HostPilot is a LAN/local server setup. It is not automatically public internet hosting. Do not expose an unauthenticated PHP server to the public internet. For public deployment add HTTPS, authentication hardening, rate limiting, backups, and a production database.


## V7 — ONLINE REALTIME + OFFLINE DIRECT
- Separate login and registration interfaces.
- Sync Health diagnostic for Internet, Supabase Auth, members count and Realtime subscription.
- Two-device sync test guidance.
- Offline Direct uses browser WebRTC DataChannel for direct peer messaging after manual offer/answer exchange.
- Important: a normal PWA cannot reliably access Android Bluetooth or Wi‑Fi Direct APIs directly. This V7 does not pretend to implement those native transports; it provides a real browser-level direct channel. A native Android wrapper can later add Nearby Connections/Bluetooth/Wi‑Fi Direct.


V8 AUTH + REALTIME PATCH: separate login/register views, password recovery, resend confirmation, clearer auth errors, modern publishable Supabase key, realtime reconnect hook, cleaner Scout visual style. Email delivery itself depends on Supabase Auth mailer/provider configuration.


## V9 — Cyberpunk Rose + Auth Recovery
- Restored Cyberpunk Rose visual direction.
- Added password recovery and resend-confirmation helpers.
- Preserved Supabase Realtime architecture.
- Added mobile-friendly focus/touch styling.
- This package does not fake Bluetooth/Wi-Fi Direct: browser direct messaging still requires a supported WebRTC path/signaling.


## V10 — Login + Recovery + Realtime
- Fixed the login blocker: the app now passes `SUPABASE_PUBLISHABLE_KEY` to `createClient()`.
- Added real password recovery: email link -> recovery session -> set a new password.
- Added resend-confirmation flow from the login screen.
- Added a visible Supabase / REAL-TIME SYNC card.
- Realtime now subscribes to the shared Scout tables enabled in `supabase_realtime`.
- Sync Health now reports LIVE/READY/ERROR and checks the cloud members table.
- Kept the Cyberpunk Rose visual direction and mobile responsiveness.

### Email delivery
The frontend can request confirmation/recovery emails, but actual delivery is controlled by Supabase Auth email configuration. For a real public deployment, configure a custom SMTP provider in Supabase Authentication > Emails/SMTP. Do not put SMTP passwords or secret keys in this ZIP.

## V11
Notifications, task completion -> badge automation, realtime calendar updates, offline queue and automatic retry when connection returns.

## V12
Offline text-message queue, announcement alerts, automatic badge awarding using task badge metadata, daily calendar refresh, and local alert fallback.

V14 auth fixes: password recovery now handles query/hash/PASSWORD_RECOVERY flows; duplicate email registration is rejected by Supabase Auth and the UI gives a clear message; cyberpunk-rose auth entrance animation added. Supabase account audit found 2 auth users at build time, so no user records were deleted.

## V26 role/access update

- File-size cap is removed at the `scout-media` bucket level; the Supabase project/plan global cap still applies.
- Unit functions use: `Commissaire district`, `AG`, `Chef`, `Cheftainne`, `1Cp`, `Cp`, `Sp`.
- New accounts are always normal members for access control.
- Leader/Admin access can only be activated with a private role-activation code. Direct role edits are blocked by database triggers.

## V29 Hardening
- Google OAuth/session readiness is checked before Creator RPC access.
- Task completion is tracked per signed-in member in `public.task_completions`.
- Task badges and skill progression can be mapped per task (`badge_title`, `badge_icon`, `badge_hint`, `skill_name`).
- XP/progression, Scout challenges and admin audit records have cloud tables with RLS.
- Local fallback remains available for guest/offline browsing.
- Service-worker cache bumped to V29.
- Supabase security note: SECURITY DEFINER functions must remain restricted by internal authorization checks; anonymous execution of `is_app_creator()` was revoked.


## V30 UX overhaul
- Simplified home dashboard and 5-item mobile navigation.
- Dedicated Scout Academy learning hub with lesson search and external web research.
- Built-in Scout mini-games: Quiz, Morse, Orientation, Knots and Memory.
- Modern mobile-first visual layer while preserving V29 Supabase/auth/realtime architecture.
## V30.1 improvements
- Real offline lesson catalog with 17 Scout lessons and local progress fallback.
- Hybrid Scout IA: local/offline assistant plus authenticated Supabase Edge Function.
- Notification permission, subscription plumbing, foreground alerts and emergency announcement alarm.
- Morse audio gain increased for clearer practice.
- Play Store game destination references removed; games remain built into SCOUT HUB.
