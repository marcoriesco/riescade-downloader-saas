alter table public.social_profiles add column presence_mode text not null default 'available'
  check (presence_mode in ('available', 'away', 'invisible'));

create table public.social_presence (
  user_id uuid not null references public.social_profiles(user_id) on delete cascade,
  device_id uuid not null,
  state text not null check (state in ('available', 'playing')),
  last_seen_at timestamptz not null default now(),
  primary key (user_id, device_id)
);

create table public.social_invitations (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.social_profiles(user_id) on delete cascade,
  recipient_id uuid not null references public.social_profiles(user_id) on delete cascade,
  request_id uuid not null,
  game jsonb not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '2 minutes',
  unique (sender_id, request_id),
  check (sender_id <> recipient_id),
  check (jsonb_typeof(game) = 'object'),
  check (game ?& array['title','system','core','content_hash','core_hash','emulator_hash']),
  check (jsonb_typeof(game->'title')='string' and jsonb_typeof(game->'system')='string' and jsonb_typeof(game->'core')='string'
    and jsonb_typeof(game->'content_hash')='string' and jsonb_typeof(game->'core_hash')='string' and jsonb_typeof(game->'emulator_hash')='string'),
  check (char_length(game->>'title') between 1 and 128),
  check ((game->>'system') ~ '^[a-zA-Z0-9_-]{1,40}$'),
  check ((game->>'core') ~ '^[a-zA-Z0-9_-]{1,64}$'),
  check ((game->>'content_hash') ~ '^[a-f0-9]{64}$'),
  check ((game->>'core_hash') ~ '^[a-f0-9]{64}$'),
  check ((game->>'emulator_hash') ~ '^[a-f0-9]{64}$')
);
create index social_invitations_sender_idx on public.social_invitations(sender_id, created_at desc);
create index social_invitations_recipient_idx on public.social_invitations(recipient_id, created_at desc);
create unique index social_invitations_pending_pair_idx on public.social_invitations
  (least(sender_id, recipient_id), greatest(sender_id, recipient_id)) where status = 'pending';

create table public.social_rooms (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.social_invitations(id) on delete cascade,
  host_id uuid not null references public.social_profiles(user_id) on delete cascade,
  guest_id uuid not null references public.social_profiles(user_id) on delete cascade,
  state text not null default 'validating' check (state in ('validating','cancelled','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '5 minutes',
  check (host_id <> guest_id)
);
create index social_rooms_host_idx on public.social_rooms(host_id, expires_at desc);
create index social_rooms_guest_idx on public.social_rooms(guest_id, expires_at desc);

alter table public.social_presence enable row level security;
alter table public.social_invitations enable row level security;
alter table public.social_rooms enable row level security;
revoke all on public.social_presence, public.social_invitations, public.social_rooms from public, anon, authenticated;
grant select, insert, update, delete on public.social_presence, public.social_invitations, public.social_rooms to service_role;

create function public.social_lock_game_pair(p_actor uuid, p_target uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  -- Account locks prevent overlapping rooms; acquire in a consistent order.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('social-account:' || least(p_actor,p_target)::text, 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('social-account:' || greatest(p_actor,p_target)::text, 0));
  -- Shared with friendship/block mutations in the first migration.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(least(p_actor,p_target)::text || ':' || greatest(p_actor,p_target)::text, 0));
end;
$$;

create function public.social_heartbeat(p_actor uuid, p_device uuid, p_state text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_device is null or p_state is null or p_state not in ('available','playing','offline') then
    raise exception using message = 'SOCIAL_INVALID_PRESENCE', errcode = 'P0001';
  end if;
  perform 1 from public.social_profiles where user_id = p_actor for update;
  if not found then raise exception using message = 'SOCIAL_UNAVAILABLE', errcode = 'P0001'; end if;
  delete from public.social_presence where user_id = p_actor and last_seen_at < now() - interval '75 seconds';
  if p_state = 'offline' then
    delete from public.social_presence where user_id = p_actor and device_id = p_device;
    return;
  end if;
  if not exists(select 1 from public.social_presence where user_id = p_actor and device_id = p_device)
    and (select count(*) from public.social_presence where user_id = p_actor) >= 8 then
    raise exception using message = 'SOCIAL_DEVICE_LIMIT', errcode = 'P0001';
  end if;
  insert into public.social_presence(user_id,device_id,state) values(p_actor,p_device,p_state)
    on conflict(user_id,device_id) do update set state = excluded.state, last_seen_at = now();
end;
$$;

create function public.social_create_invitation(p_actor uuid, p_target uuid, p_request uuid, p_game jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare existing public.social_invitations%rowtype; new_id uuid;
begin
  if p_actor is null or p_target is null or p_actor = p_target or p_request is null then
    raise exception using message = 'SOCIAL_INVALID_TARGET', errcode = 'P0001';
  end if;
  perform public.social_lock_game_pair(p_actor,p_target);
  if not exists(select 1 from public.social_relationships where user_low = least(p_actor,p_target)
    and user_high = greatest(p_actor,p_target) and status = 'accepted')
    or exists(select 1 from public.social_blocks where (blocker_id=p_actor and blocked_id=p_target) or (blocker_id=p_target and blocked_id=p_actor)) then
    raise exception using message = 'SOCIAL_UNAVAILABLE', errcode = 'P0001';
  end if;
  select * into existing from public.social_invitations where sender_id=p_actor and request_id=p_request;
  if found then
    if existing.recipient_id <> p_target or existing.game is distinct from p_game then
      raise exception using message = 'SOCIAL_INVALID_REQUEST', errcode = 'P0001';
    end if;
    return existing.id;
  end if;
  if exists(select 1 from public.social_rooms where state='validating' and expires_at>now()
    and (host_id in(p_actor,p_target) or guest_id in(p_actor,p_target))) then
    raise exception using message = 'SOCIAL_ROOM_BUSY', errcode = 'P0001';
  end if;
  update public.social_invitations set status='expired' where status='pending' and expires_at<=now()
    and least(sender_id,recipient_id)=least(p_actor,p_target) and greatest(sender_id,recipient_id)=greatest(p_actor,p_target);
  if exists(select 1 from public.social_invitations where status='pending'
    and least(sender_id,recipient_id)=least(p_actor,p_target) and greatest(sender_id,recipient_id)=greatest(p_actor,p_target)) then
    raise exception using message = 'SOCIAL_INVITATION_PENDING', errcode = 'P0001';
  end if;
  if (select count(*) from public.social_invitations where sender_id=p_actor and created_at>now()-interval '10 minutes') >= 20 then
    raise exception using message = 'SOCIAL_RATE_LIMIT', errcode = 'P0001';
  end if;
  insert into public.social_invitations(sender_id,recipient_id,request_id,game)
    values(p_actor,p_target,p_request,p_game) returning id into new_id;
  return new_id;
end;
$$;

create function public.social_respond_invitation(p_actor uuid, p_invitation uuid, p_action text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare invitation public.social_invitations%rowtype; room_id uuid;
begin
  if p_action is null or p_action not in ('accept','decline','cancel') then
    raise exception using message = 'SOCIAL_INVALID_ACTION', errcode = 'P0001';
  end if;
  select * into invitation from public.social_invitations where id=p_invitation and p_actor in(sender_id,recipient_id);
  if not found then raise exception using message = 'SOCIAL_UNAVAILABLE', errcode = 'P0001'; end if;
  perform public.social_lock_game_pair(invitation.sender_id,invitation.recipient_id);
  select * into invitation from public.social_invitations where id=p_invitation for update;
  if (p_action='cancel' and p_actor<>invitation.sender_id) or (p_action<>'cancel' and p_actor<>invitation.recipient_id) then
    raise exception using message = 'SOCIAL_FORBIDDEN', errcode = 'P0001';
  end if;
  if invitation.status<>'pending' then
    select id into room_id from public.social_rooms where invitation_id=p_invitation and state='validating' and expires_at>now();
    if invitation.status='accepted' and p_action<>'accept' then
      raise exception using message = 'SOCIAL_FORBIDDEN', errcode = 'P0001';
    end if;
    if invitation.status='accepted' and room_id is null then
      return pg_catalog.jsonb_build_object('status','expired','room_id',null);
    end if;
    return pg_catalog.jsonb_build_object('status',invitation.status,'room_id',room_id);
  end if;
  if invitation.expires_at<=now() then
    update public.social_invitations set status='expired' where id=p_invitation;
    return pg_catalog.jsonb_build_object('status','expired','room_id',null);
  end if;
  if not exists(select 1 from public.social_relationships where user_low=least(invitation.sender_id,invitation.recipient_id)
    and user_high=greatest(invitation.sender_id,invitation.recipient_id) and status='accepted')
    or exists(select 1 from public.social_blocks where (blocker_id=invitation.sender_id and blocked_id=invitation.recipient_id)
      or (blocker_id=invitation.recipient_id and blocked_id=invitation.sender_id)) then
    update public.social_invitations set status='cancelled' where id=p_invitation;
    return pg_catalog.jsonb_build_object('status','cancelled','room_id',null);
  end if;
  if p_action='accept' then
    if exists(select 1 from public.social_rooms where state='validating' and expires_at>now()
      and (host_id in(invitation.sender_id,invitation.recipient_id) or guest_id in(invitation.sender_id,invitation.recipient_id))) then
      raise exception using message = 'SOCIAL_ROOM_BUSY', errcode = 'P0001';
    end if;
    insert into public.social_rooms(invitation_id,host_id,guest_id) values(p_invitation,invitation.sender_id,invitation.recipient_id) returning id into room_id;
    update public.social_invitations set status='accepted' where id=p_invitation;
    return pg_catalog.jsonb_build_object('status','accepted','room_id',room_id);
  end if;
  update public.social_invitations set status=case when p_action='decline' then 'declined' else 'cancelled' end where id=p_invitation;
  return pg_catalog.jsonb_build_object('status',case when p_action='decline' then 'declined' else 'cancelled' end,'room_id',null);
end;
$$;

create function public.social_close_room(p_actor uuid, p_room uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare room public.social_rooms%rowtype;
begin
  select * into room from public.social_rooms where id=p_room and p_actor in(host_id,guest_id);
  if not found then raise exception using message = 'SOCIAL_UNAVAILABLE', errcode = 'P0001'; end if;
  perform public.social_lock_game_pair(room.host_id,room.guest_id);
  update public.social_rooms set state='cancelled' where id=p_room and state='validating';
end;
$$;

create function public.social_cancel_pair_sessions()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  update public.social_invitations set status='cancelled' where status in('pending','accepted')
    and least(sender_id,recipient_id)=old.user_low and greatest(sender_id,recipient_id)=old.user_high;
  update public.social_rooms set state='cancelled' where state='validating'
    and least(host_id,guest_id)=old.user_low and greatest(host_id,guest_id)=old.user_high;
  return old;
end;
$$;
create trigger social_relationships_cancel_sessions after delete on public.social_relationships
  for each row execute function public.social_cancel_pair_sessions();

create function public.social_session_snapshot(p_actor uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select pg_catalog.jsonb_build_object(
    'presence_mode', (select presence_mode from public.social_profiles where user_id=p_actor),
    'presence', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('user_id',friends.user_id,'state',
      case when profile.presence_mode='invisible' or not exists(select 1 from public.social_presence p where p.user_id=friends.user_id and p.last_seen_at>now()-interval '75 seconds') then 'offline'
        when profile.presence_mode='away' then 'away'
        when exists(select 1 from public.social_presence p where p.user_id=friends.user_id and p.state='playing' and p.last_seen_at>now()-interval '75 seconds') then 'playing'
        else 'available' end)) from
      (select case when requester_id=p_actor then recipient_id else requester_id end user_id from public.social_relationships where status='accepted' and p_actor in(requester_id,recipient_id)) friends
      join public.social_profiles profile on profile.user_id=friends.user_id), '[]'::jsonb),
    'invitations', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',i.id,'sender_id',i.sender_id,'recipient_id',i.recipient_id,
      'sender_name',s.display_name,'recipient_name',r.display_name,'game',i.game,'expires_at',i.expires_at))
      from (select * from public.social_invitations where p_actor in(sender_id,recipient_id) and status='pending' and expires_at>now() order by created_at desc limit 100) i
      join public.social_profiles s on s.user_id=i.sender_id join public.social_profiles r on r.user_id=i.recipient_id), '[]'::jsonb),
    'rooms', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',room.id,'host_id',room.host_id,'guest_id',room.guest_id,
      'state',room.state,'expires_at',room.expires_at,'game',i.game,'host_name',h.display_name,'guest_name',g.display_name))
      from public.social_rooms room join public.social_invitations i on i.id=room.invitation_id
      join public.social_profiles h on h.user_id=room.host_id join public.social_profiles g on g.user_id=room.guest_id
      where p_actor in(room.host_id,room.guest_id) and room.state='validating' and room.expires_at>now()), '[]'::jsonb)
  );
$$;

revoke all on function public.social_lock_game_pair(uuid,uuid), public.social_heartbeat(uuid,uuid,text),
  public.social_create_invitation(uuid,uuid,uuid,jsonb), public.social_respond_invitation(uuid,uuid,text),
  public.social_close_room(uuid,uuid), public.social_cancel_pair_sessions(), public.social_session_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.social_lock_game_pair(uuid,uuid), public.social_heartbeat(uuid,uuid,text),
  public.social_create_invitation(uuid,uuid,uuid,jsonb), public.social_respond_invitation(uuid,uuid,text),
  public.social_close_room(uuid,uuid), public.social_cancel_pair_sessions(), public.social_session_snapshot(uuid) to service_role;
