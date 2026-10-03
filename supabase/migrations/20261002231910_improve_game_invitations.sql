-- Invitation preferences, durable outcomes and invitations into an existing native host.
alter table public.social_profiles add column receive_game_invites boolean not null default true;
alter table public.social_invitations add column hosted_session_id uuid;
create table public.social_hosted_sessions (
 id uuid primary key, owner_id uuid not null references public.social_profiles(user_id) on delete cascade,
 game jsonb not null, connection jsonb not null, closed boolean not null default false,
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '2 minutes',
 check(jsonb_typeof(game)='object' and jsonb_typeof(connection)='object')
);
create index social_hosted_sessions_owner_idx on public.social_hosted_sessions(owner_id,expires_at desc);
alter table public.social_invitations add constraint social_invitation_hosted_fk foreign key(hosted_session_id) references public.social_hosted_sessions(id);
create index social_invitations_hosted_idx on public.social_invitations(hosted_session_id) where hosted_session_id is not null;
create table public.social_invitation_progress (
 invitation_id uuid not null references public.social_invitations(id) on delete cascade,
 actor_id uuid not null references public.social_profiles(user_id) on delete cascade,
 phase text not null check(phase in('checking','needs_download','missing_game','downloading','installing','preparing','connecting','playing','failed','cancelled')),
 updated_at timestamptz not null default now(), primary key(invitation_id,actor_id)
);
alter table public.social_hosted_sessions enable row level security;
alter table public.social_invitation_progress enable row level security;
revoke all on public.social_hosted_sessions,public.social_invitation_progress from public,anon,authenticated;
grant select,insert,update,delete on public.social_hosted_sessions,public.social_invitation_progress to service_role;

create function public.social_set_invitation_preferences(p_actor uuid,p_receive boolean default null,p_mode text default null)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_actor is null or (p_mode is not null and p_mode not in('available','away','invisible')) then
  raise exception using message='SOCIAL_INVALID_PRESENCE',errcode='P0001'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('social-account:'||p_actor::text,0));
 update public.social_profiles set receive_game_invites=coalesce(p_receive,receive_game_invites),presence_mode=coalesce(p_mode,presence_mode) where user_id=p_actor;
 if not found then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
 if exists(select 1 from public.social_profiles where user_id=p_actor and (not receive_game_invites or presence_mode='invisible')) then
  update public.social_invitations set status='cancelled' where recipient_id=p_actor and status='pending';
 end if;
end; $$;

create function public.social_can_receive_invitation(p_actor uuid)
returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.social_profiles p where p.user_id=p_actor and p.receive_game_invites and p.presence_mode<>'invisible'
  and exists(select 1 from public.social_presence s where s.user_id=p_actor and s.last_seen_at>now()-interval '75 seconds')
  and not exists(select 1 from public.social_presence s where s.user_id=p_actor and s.state='playing' and s.last_seen_at>now()-interval '75 seconds'));
$$;

create function public.social_publish_hosted_session(p_actor uuid,p_id uuid,p_game jsonb,p_connection jsonb,p_close boolean default false)
returns uuid language plpgsql security invoker set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('social-account:'||p_actor::text,0));
 if p_id is null or p_actor is null then raise exception using message='SOCIAL_INVALID_REQUEST',errcode='P0001'; end if;
 if exists(select 1 from public.social_hosted_sessions where id=p_id and owner_id<>p_actor) then raise exception using message='SOCIAL_FORBIDDEN',errcode='P0001'; end if;
 if not p_close and exists(select 1 from public.social_hosted_sessions where id=p_id and (game is distinct from p_game or connection is distinct from p_connection)) then raise exception using message='SOCIAL_INVALID_REQUEST',errcode='P0001'; end if;
 if p_close then
  update public.social_hosted_sessions set closed=true,expires_at=now() where id=p_id and owner_id=p_actor;
  update public.social_invitations set status='cancelled' where hosted_session_id=p_id and status='pending';
  return p_id;
 end if;
 if exists(select 1 from public.social_hosted_sessions where id=p_id and closed) then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
 if p_game is null or not (p_game ?& array['title','system','core','content_hash','core_hash','emulator_hash']) or p_connection is null
  or coalesce(p_connection->>'host','')!~'^[A-Za-z0-9.-]{1,255}$' or coalesce(p_connection->>'session','')!~'^[A-Za-z0-9+/]{16}$'
  or coalesce(p_connection->>'port','')!~'^[0-9]{1,5}$' or (p_connection->>'port')::int not between 1 and 65535 then
  raise exception using message='SOCIAL_INVALID_REQUEST',errcode='P0001'; end if;
 insert into public.social_hosted_sessions(id,owner_id,game,connection) values(p_id,p_actor,p_game,p_connection)
 on conflict(id) do update set expires_at=now()+interval '2 minutes'
 where social_hosted_sessions.owner_id=p_actor and social_hosted_sessions.game=excluded.game and social_hosted_sessions.connection=excluded.connection;
 return p_id;
end; $$;

create function public.social_hosted_invitation_connection(p_actor uuid,p_invitation uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 select h.connection into result from public.social_invitations i join public.social_hosted_sessions h on h.id=i.hosted_session_id
 where i.id=p_invitation and i.recipient_id=p_actor and i.status='accepted' and h.expires_at>now() and i.created_at>now()-interval '4 hours'
 and not exists(select 1 from public.social_invitation_progress p where p.invitation_id=i.id and p.phase='cancelled')
 and exists(select 1 from public.social_relationships r where r.user_low=least(i.sender_id,i.recipient_id) and r.user_high=greatest(i.sender_id,i.recipient_id) and r.status='accepted');
 if result is null then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
 return result;
end; $$;

create function public.social_set_invitation_progress(p_actor uuid,p_invitation uuid,p_phase text)
returns void language plpgsql security invoker set search_path='' as $$
declare invitation public.social_invitations;
begin
 select * into invitation from public.social_invitations where id=p_invitation and p_actor in(sender_id,recipient_id);
 if not found then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
 perform public.social_lock_game_pair(invitation.sender_id,invitation.recipient_id);
 select * into invitation from public.social_invitations where id=p_invitation for update;
 if invitation.status<>'accepted' or (p_phase<>'cancelled' and exists(select 1 from public.social_invitation_progress where invitation_id=p_invitation and phase='cancelled')) or invitation.created_at<now()-interval '4 hours' then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
 insert into public.social_invitation_progress(invitation_id,actor_id,phase) values(p_invitation,p_actor,p_phase)
 on conflict(invitation_id,actor_id) do update set phase=excluded.phase,updated_at=now();
 update public.social_rooms r set expires_at=least(r.created_at+interval '4 hours',greatest(r.expires_at,now()+interval '2 minutes'))
 where r.invitation_id=p_invitation and r.state='validating' and r.created_at>now()-interval '4 hours'
 and not exists(select 1 from public.social_room_runtime rt where rt.room_id=r.id and rt.phase in('ended','failed'));
 if p_phase='cancelled' then
  update public.social_rooms set state='cancelled' where invitation_id=p_invitation;
 end if;
end; $$;

create or replace function public.social_create_invitation(p_actor uuid, p_target uuid, p_request uuid, p_game jsonb)
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
  if not public.social_can_receive_invitation(p_target) or not exists(select 1 from public.social_profiles where user_id=p_actor and presence_mode<>'invisible') then
    raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
  if p_game ? 'hosted_session_id' and not exists(select 1 from public.social_hosted_sessions where id=(p_game->>'hosted_session_id')::uuid and owner_id=p_actor and expires_at>now() and game=p_game-'hosted_session_id') then
    raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
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
  insert into public.social_invitations(sender_id,recipient_id,request_id,game,hosted_session_id)
    values(p_actor,p_target,p_request,p_game,nullif(p_game->>'hosted_session_id','')::uuid) returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.social_respond_invitation(p_actor uuid, p_invitation uuid, p_action text)
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
    if invitation.status='accepted' and room_id is null and invitation.hosted_session_id is null then
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
    if not public.social_can_receive_invitation(p_actor) or (invitation.hosted_session_id is not null and not exists(select 1 from public.social_hosted_sessions where id=invitation.hosted_session_id and expires_at>now())) then
      update public.social_invitations set status='cancelled' where id=p_invitation;
      return pg_catalog.jsonb_build_object('status','cancelled','room_id',null);
    end if;
    if exists(select 1 from public.social_rooms where state='validating' and expires_at>now()
      and (host_id in(invitation.sender_id,invitation.recipient_id) or guest_id in(invitation.sender_id,invitation.recipient_id))) then
      raise exception using message = 'SOCIAL_ROOM_BUSY', errcode = 'P0001';
    end if;
    if invitation.hosted_session_id is null then
      insert into public.social_rooms(invitation_id,host_id,guest_id,expires_at) values(p_invitation,invitation.sender_id,invitation.recipient_id,now()+interval '5 minutes') returning id into room_id;
    end if;
    update public.social_invitations set status='accepted' where id=p_invitation;
    return pg_catalog.jsonb_build_object('status','accepted','room_id',room_id);
  end if;
  update public.social_invitations set status=case when p_action='decline' then 'declined' else 'cancelled' end where id=p_invitation;
  return pg_catalog.jsonb_build_object('status',case when p_action='decline' then 'declined' else 'cancelled' end,'room_id',null);
end;
$$;


create or replace function public.social_session_snapshot(p_actor uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select pg_catalog.jsonb_build_object(
    'actor_id',p_actor,
    'receive_game_invites',(select receive_game_invites from public.social_profiles where user_id=p_actor),
    'presence_mode', (select presence_mode from public.social_profiles where user_id=p_actor),
    'presence', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('user_id',friends.user_id,'can_invite',public.social_can_receive_invitation(friends.user_id),'state',
      case when profile.presence_mode='invisible' or not exists(select 1 from public.social_presence p where p.user_id=friends.user_id and p.last_seen_at>now()-interval '75 seconds') then 'offline'
        when exists(select 1 from public.social_presence p where p.user_id=friends.user_id and p.state='playing' and p.last_seen_at>now()-interval '75 seconds') then 'playing'
        when profile.presence_mode='away' then 'away'
        else 'available' end)) from
      (select case when requester_id=p_actor then recipient_id else requester_id end user_id from public.social_relationships where status='accepted' and p_actor in(requester_id,recipient_id)) friends
      join public.social_profiles profile on profile.user_id=friends.user_id), '[]'::jsonb),
    'invitations', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',i.id,'sender_id',i.sender_id,'recipient_id',i.recipient_id,
      'sender_name',s.display_name,'recipient_name',r.display_name,'game',i.game,'expires_at',i.expires_at))
      from (select * from public.social_invitations where p_actor in(sender_id,recipient_id) and status='pending' and expires_at>now() and public.social_can_receive_invitation(recipient_id) order by created_at desc limit 100) i
      join public.social_profiles s on s.user_id=i.sender_id join public.social_profiles r on r.user_id=i.recipient_id), '[]'::jsonb),
    'invitation_history',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'id',i.id,'sender_id',i.sender_id,'recipient_id',i.recipient_id,'sender_name',s.display_name,'recipient_name',r.display_name,
      'game',i.game,'status',case when i.status='pending' and i.expires_at<=now() then 'expired' else i.status end,
      'hosted_session_id',i.hosted_session_id,'expires_at',i.expires_at,'room_id',(select id from public.social_rooms where invitation_id=i.id),
      'phase',case when i.hosted_session_id is not null and (not exists(select 1 from public.social_hosted_sessions where id=i.hosted_session_id and not closed and expires_at>now()) or i.created_at<now()-interval '4 hours') then 'ended' when i.hosted_session_id is null and exists(select 1 from public.social_rooms where invitation_id=i.id and (state<>'validating' or expires_at<=now())) then 'ended' when exists(select 1 from public.social_invitation_progress where invitation_id=i.id and phase='cancelled') then 'cancelled' else coalesce((select phase from public.social_room_runtime where room_id=(select id from public.social_rooms where invitation_id=i.id)),(select case when state<>'validating' or expires_at<=now() then 'ended' else 'validating' end from public.social_rooms where invitation_id=i.id)) end,
      'progress',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('actor_id',p.actor_id,'phase',p.phase)) from public.social_invitation_progress p where p.invitation_id=i.id),'[]'::jsonb)))
      from (select * from public.social_invitations where p_actor in(sender_id,recipient_id) and created_at>now()-interval '24 hours' order by created_at desc limit 100) i
      join public.social_profiles s on s.user_id=i.sender_id join public.social_profiles r on r.user_id=i.recipient_id),'[]'::jsonb),
    'hosted_session',(select pg_catalog.jsonb_build_object('id',id,'game',game) from public.social_hosted_sessions where owner_id=p_actor and expires_at>now() order by created_at desc limit 1),
    'rooms', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',room.id,'host_id',room.host_id,'guest_id',room.guest_id,
      'invitation_id',room.invitation_id,'phase',(select phase from public.social_room_runtime where room_id=room.id),'state',room.state,'expires_at',room.expires_at,'game',i.game,'host_name',h.display_name,'guest_name',g.display_name))
      from public.social_rooms room join public.social_invitations i on i.id=room.invitation_id
      join public.social_profiles h on h.user_id=room.host_id join public.social_profiles g on g.user_id=room.guest_id
      where p_actor in(room.host_id,room.guest_id) and room.state='validating' and room.expires_at>now()), '[]'::jsonb)
  );
$$;


revoke all on function public.social_session_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.social_session_snapshot(uuid) to service_role;

revoke all on function public.social_set_invitation_preferences(uuid,boolean,text),public.social_can_receive_invitation(uuid),public.social_publish_hosted_session(uuid,uuid,jsonb,jsonb,boolean),public.social_hosted_invitation_connection(uuid,uuid),public.social_set_invitation_progress(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.social_set_invitation_preferences(uuid,boolean,text),public.social_can_receive_invitation(uuid),public.social_publish_hosted_session(uuid,uuid,jsonb,jsonb,boolean),public.social_hosted_invitation_connection(uuid,uuid),public.social_set_invitation_progress(uuid,uuid,text) to service_role;
