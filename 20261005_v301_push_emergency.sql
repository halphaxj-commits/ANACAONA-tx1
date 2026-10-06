alter table public.announcements add column if not exists is_emergency boolean not null default false;
create table if not exists public.push_subscriptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 endpoint text not null unique, subscription jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push subscriptions own select" on public.push_subscriptions;
drop policy if exists "push subscriptions own insert" on public.push_subscriptions;
drop policy if exists "push subscriptions own update" on public.push_subscriptions;
drop policy if exists "push subscriptions own delete" on public.push_subscriptions;
create policy "push subscriptions own select" on public.push_subscriptions for select to authenticated using (user_id=(select auth.uid()));
create policy "push subscriptions own insert" on public.push_subscriptions for insert to authenticated with check (user_id=(select auth.uid()));
create policy "push subscriptions own update" on public.push_subscriptions for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "push subscriptions own delete" on public.push_subscriptions for delete to authenticated using (user_id=(select auth.uid()));
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);
