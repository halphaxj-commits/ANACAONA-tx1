# SCOUT HUB V27 — Signup fix

Base: SCOUT_HUB_V26_CLEAN_AUTH_PERSISTENT

## Correction
The Supabase auth trigger inserts/upserts `public.members` with `ON CONFLICT (user_id)`. The database must therefore have a UNIQUE constraint on `public.members.user_id`.

Migration added:
`supabase/migrations/20261004_signup_members_user_id_unique.sql`

The local `database/schema.sql` was also updated so `members.user_id` is declared UNIQUE.

No app pages, authentication UI, realtime engine, music, games, badges, skills, or other V26 features were removed.
