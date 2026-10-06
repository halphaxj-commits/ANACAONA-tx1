-- SCOUT HUB V30.4 — global Creator-managed AI config
create table if not exists private.app_ai_config (
  id boolean primary key default true check (id),
  provider text not null default 'openai',
  model text not null default 'gpt-4o-mini',
  secret_id uuid,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table private.app_ai_config enable row level security;

create or replace function public.creator_get_ai_config()
returns jsonb language plpgsql security definer set search_path=public,private as $$
declare r private.app_ai_config;
begin
  if not public.is_app_creator() then raise exception 'creator_only'; end if;
  select * into r from private.app_ai_config where id=true;
  return jsonb_build_object('enabled',coalesce(r.enabled,false),'provider',coalesce(r.provider,'openai'),'model',coalesce(r.model,'gpt-4o-mini'),'has_api_key',r.secret_id is not null);
end; $$;

create or replace function public.creator_set_ai_config(provider_name text, model_name text, api_key text default null, enabled boolean default true)
returns jsonb language plpgsql security definer set search_path=public,private,vault as $$
declare old_secret uuid; new_secret uuid;
begin
  if not public.is_app_creator() then raise exception 'creator_only'; end if;
  select secret_id into old_secret from private.app_ai_config where id=true;
  if nullif(trim(coalesce(api_key,'')),'') is not null then
    if old_secret is not null then
      perform vault.update_secret(old_secret,trim(api_key),'scout_hub_ai_api_key','SCOUT HUB global AI API key'); new_secret:=old_secret;
    else
      new_secret:=vault.create_secret(trim(api_key),'scout_hub_ai_api_key','SCOUT HUB global AI API key');
    end if;
  else new_secret:=old_secret; end if;
  insert into private.app_ai_config(id,provider,model,secret_id,enabled,updated_at)
  values(true,coalesce(nullif(trim(provider_name),''),'openai'),coalesce(nullif(trim(model_name),''),'gpt-4o-mini'),new_secret,coalesce(enabled,true),now())
  on conflict(id) do update set provider=excluded.provider,model=excluded.model,secret_id=excluded.secret_id,enabled=excluded.enabled,updated_at=now();
  return jsonb_build_object('ok',true,'enabled',coalesce(enabled,true),'has_api_key',new_secret is not null);
end; $$;

create or replace function public.get_ai_runtime_config()
returns jsonb language plpgsql security definer set search_path=public,private,vault as $$
declare r private.app_ai_config; k text;
begin
  if current_setting('request.jwt.claim.role',true) <> 'service_role' then raise exception 'service_role_only'; end if;
  select * into r from private.app_ai_config where id=true;
  if r.secret_id is not null then select decrypted_secret into k from vault.decrypted_secrets where id=r.secret_id; end if;
  return jsonb_build_object('enabled',coalesce(r.enabled,false),'provider',coalesce(r.provider,'openai'),'model',coalesce(r.model,'gpt-4o-mini'),'api_key',k);
end; $$;

revoke all on function public.creator_get_ai_config() from public,anon;
grant execute on function public.creator_get_ai_config() to authenticated;
revoke all on function public.creator_set_ai_config(text,text,text,boolean) from public,anon;
grant execute on function public.creator_set_ai_config(text,text,text,boolean) to authenticated;
revoke all on function public.get_ai_runtime_config() from public,anon,authenticated;
grant execute on function public.get_ai_runtime_config() to service_role;
notify pgrst,'reload schema';
