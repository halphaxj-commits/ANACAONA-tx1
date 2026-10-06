-- SCOUT HUB V27 — Signup fix
-- Required because the auth trigger uses ON CONFLICT (user_id) on public.members.
-- Safe to run more than once.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'members_user_id_key'
      AND conrelid = 'public.members'::regclass
  ) THEN
    ALTER TABLE public.members
      ADD CONSTRAINT members_user_id_key UNIQUE (user_id);
  END IF;
END $$;
