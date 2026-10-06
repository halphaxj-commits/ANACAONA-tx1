-- SCOUT HUB V29: progress, task completion, challenges and audit hardening
create table if not exists public.task_completions (
 task_id uuid not null references public.tasks(id) on delete cascade,
 member_id uuid not null references public.members(id) on delete cascade,
 completed_at timestamptz not null default now(),
 primary key (task_id, member_id)
);
create table if not exists public.scout_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 xp integer not null default 0 check (xp >= 0), level integer not null default 1 check (level >= 1), updated_at timestamptz not null default now()
);
create table if not exists public.scout_challenges (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 challenge_key text not null, title text not null, description text not null, xp integer not null default 0 check (xp >= 0), completed_at timestamptz, created_at timestamptz not null default now(), unique(user_id, challenge_key)
);
create table if not exists public.admin_audit_logs (
 id uuid primary key default gen_random_uuid(), actor_user_id uuid not null references auth.users(id) on delete cascade,
 action text not null, details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
alter table public.task_completions enable row level security;
alter table public.scout_progress enable row level security;
alter table public.scout_challenges enable row level security;
alter table public.admin_audit_logs enable row level security;
revoke execute on function public.is_app_creator() from anon;
