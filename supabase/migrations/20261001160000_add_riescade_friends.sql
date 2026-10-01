-- Desktop social access is mediated by authenticated RIESCADE server APIs.
-- Opaque desktop tokens cannot be used directly as Supabase Auth JWTs.
create table public.social_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  friend_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)),
  display_name text not null default 'RIESCADE Player',
  created_at timestamptz not null default now(),
  constraint social_profiles_code check (friend_code ~ '^[0-9A-F]{16}$'),
  constraint social_profiles_name check (char_length(btrim(display_name)) between 1 and 40)
);

create table public.social_relationships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.social_profiles(user_id) on delete cascade,
  recipient_id uuid not null references public.social_profiles(user_id) on delete cascade,
  user_low uuid generated always as (least(requester_id, recipient_id)) stored,
  user_high uuid generated always as (greatest(requester_id, recipient_id)) stored,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (user_low, user_high),
  check (requester_id <> recipient_id),
  check ((status = 'accepted') = (accepted_at is not null))
);
create index social_relationships_requester_idx on public.social_relationships (requester_id, created_at desc);
create index social_relationships_recipient_idx on public.social_relationships (recipient_id, created_at desc);

create table public.social_blocks (
  blocker_id uuid not null references public.social_profiles(user_id) on delete cascade,
  blocked_id uuid not null references public.social_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index social_blocks_blocked_idx on public.social_blocks (blocked_id);

create table public.social_request_limits (
  user_id uuid primary key references public.social_profiles(user_id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null check (request_count >= 0)
);

alter table public.social_profiles enable row level security;
alter table public.social_relationships enable row level security;
alter table public.social_blocks enable row level security;
alter table public.social_request_limits enable row level security;
revoke all on public.social_profiles, public.social_relationships, public.social_blocks, public.social_request_limits from public, anon, authenticated;
grant select, insert, update, delete on public.social_profiles, public.social_relationships, public.social_blocks, public.social_request_limits to service_role;

-- Invoker privileges, callable only by the server role. The actor is supplied
-- exclusively from authenticateAppRequest(), never from an HTTP request body.
create function public.social_apply_action(p_actor uuid, p_target uuid, p_action text)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  relation public.social_relationships%rowtype;
  total_requests integer;
begin
  if p_actor is null or p_target is null or p_actor = p_target then
    raise exception using message = 'SOCIAL_INVALID_TARGET', errcode = 'P0001';
  end if;
  if p_action is null or p_action not in ('request', 'accept', 'decline', 'cancel', 'remove', 'block', 'unblock') then
    raise exception using message = 'SOCIAL_INVALID_ACTION', errcode = 'P0001';
  end if;
  -- Serialize every mutation of this unordered pair, including blocks.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    least(p_actor, p_target)::text || ':' || greatest(p_actor, p_target)::text, 0));
  if not exists (select 1 from public.social_profiles where user_id = p_actor)
     or not exists (select 1 from public.social_profiles where user_id = p_target) then
    raise exception using message = 'SOCIAL_UNAVAILABLE', errcode = 'P0001';
  end if;
  if p_action = 'block' then
    insert into public.social_blocks (blocker_id, blocked_id) values (p_actor, p_target) on conflict do nothing;
    delete from public.social_relationships where user_low = least(p_actor, p_target) and user_high = greatest(p_actor, p_target);
    return 'blocked';
  elsif p_action = 'unblock' then
    delete from public.social_blocks where blocker_id = p_actor and blocked_id = p_target;
    return 'unblocked';
  end if;
  if exists (select 1 from public.social_blocks where
    (blocker_id = p_actor and blocked_id = p_target) or (blocker_id = p_target and blocked_id = p_actor)) then
    raise exception using message = 'SOCIAL_UNAVAILABLE', errcode = 'P0001';
  end if;
  select * into relation from public.social_relationships
    where user_low = least(p_actor, p_target) and user_high = greatest(p_actor, p_target);
  if p_action = 'request' then
    if relation.status = 'accepted' then return 'accepted'; end if;
    if relation.status = 'pending' then
      if relation.requester_id = p_actor then return 'pending'; end if;
      raise exception using message = 'SOCIAL_INCOMING_REQUEST', errcode = 'P0001';
    end if;
    insert into public.social_request_limits as limits (user_id, request_count) values (p_actor, 1)
      on conflict (user_id) do update set
        request_count = case when limits.window_started_at <= now() - interval '1 hour' then 1 else limits.request_count + 1 end,
        window_started_at = case when limits.window_started_at <= now() - interval '1 hour' then now() else limits.window_started_at end
      returning request_count into total_requests;
    if total_requests > 20 then
      raise exception using message = 'SOCIAL_RATE_LIMIT', errcode = 'P0001';
    end if;
    insert into public.social_relationships (requester_id, recipient_id) values (p_actor, p_target);
    return 'pending';
  elsif p_action = 'accept' then
    if relation.recipient_id is distinct from p_actor then
      raise exception using message = 'SOCIAL_FORBIDDEN', errcode = 'P0001';
    end if;
    update public.social_relationships set status = 'accepted', accepted_at = coalesce(accepted_at, now()) where id = relation.id;
    return 'accepted';
  elsif p_action in ('cancel', 'decline') then
    if relation.id is null then return 'removed'; end if;
    if relation.status <> 'pending'
      or (p_action = 'cancel' and relation.requester_id <> p_actor)
      or (p_action = 'decline' and relation.recipient_id <> p_actor) then
      raise exception using message = 'SOCIAL_FORBIDDEN', errcode = 'P0001';
    end if;
  elsif p_action = 'remove' then
    if relation.id is null then return 'removed'; end if;
    if relation.status <> 'accepted' then
      raise exception using message = 'SOCIAL_FORBIDDEN', errcode = 'P0001';
    end if;
  end if;
  delete from public.social_relationships where id = relation.id;
  return 'removed';
end;
$$;
revoke all on function public.social_apply_action(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.social_apply_action(uuid, uuid, text) to service_role;

comment on table public.social_profiles is 'Opt-in public identity; no emails, library paths, or account credentials.';
comment on table public.social_relationships is 'One pending or accepted relationship per unordered pair; server access only.';
comment on function public.social_apply_action(uuid, uuid, text) is 'Atomic social transitions and request quota. Server must authenticate the actor.';
