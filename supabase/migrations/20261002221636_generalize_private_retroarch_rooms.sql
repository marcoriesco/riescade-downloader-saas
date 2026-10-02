-- Generalize the readiness protocol while retaining equality checks and service-role-only execution.
create or replace function public.social_room_step(p_actor uuid,p_room uuid,p_device uuid,p_action text,p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare room public.social_rooms; run public.social_room_runtime; expected jsonb; is_host boolean; should_launch boolean:=false;
begin
  select * into room from public.social_rooms where id=p_room and p_actor in(host_id,guest_id);
  if not found then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
  perform public.social_lock_game_pair(room.host_id,room.guest_id);
  select * into room from public.social_rooms where id=p_room for update;
  insert into public.social_room_runtime(room_id) values(p_room) on conflict do nothing;
  select * into run from public.social_room_runtime where room_id=p_room for update;
  is_host:=p_actor=room.host_id;
  if room.state<>'validating' or room.expires_at<=now() or room.created_at<now()-interval '4 hours' then
    update public.social_room_runtime set phase='ended',session=null where room_id=p_room;
    return pg_catalog.jsonb_build_object('phase','ended','launch',false);
  end if;
  if not exists(select 1 from public.social_relationships where user_low=least(room.host_id,room.guest_id) and user_high=greatest(room.host_id,room.guest_id) and status='accepted')
    or exists(select 1 from public.social_blocks where (blocker_id=room.host_id and blocked_id=room.guest_id) or (blocker_id=room.guest_id and blocked_id=room.host_id)) then
    update public.social_rooms set state='cancelled' where id=p_room;
    update public.social_room_runtime set phase='ended',session=null where room_id=p_room;
    return pg_catalog.jsonb_build_object('phase','ended','launch',false);
  end if;
  if p_device is null then raise exception using message='SOCIAL_FORBIDDEN',errcode='P0001'; end if;
  if (is_host and run.host_device is not null and run.host_device<>p_device) or (not is_host and run.guest_device is not null and run.guest_device<>p_device) then
    raise exception using message='SOCIAL_DEVICE_LIMIT',errcode='P0001';
  end if;
  if run.phase in('ended','failed') then return pg_catalog.jsonb_build_object('phase',run.phase,'launch',false); end if;
  if run.phase in('preparing','connecting','playing') and
    (run.host_seen<now()-interval '90 seconds' or run.guest_seen<now()-interval '90 seconds' or
     (run.phase<>'playing' and run.updated_at<now()-interval '90 seconds')) then
    update public.social_room_runtime set phase='failed',session=null where room_id=p_room;
    update public.social_rooms set state='cancelled' where id=p_room;
    return pg_catalog.jsonb_build_object('phase','failed','launch',false);
  end if;
  if p_action='ready' then
    select game into expected from public.social_invitations where id=room.invitation_id;
    -- Any platform/core may join; both peers must identify the same session content.
    if p_data->>'system' is distinct from expected->>'system'
      or p_data->>'core' is distinct from expected->>'core'
      or p_data->>'content_hash' is distinct from expected->>'content_hash'
      or p_data->>'core_hash' is distinct from expected->>'core_hash'
      or p_data->>'emulator_hash' is distinct from expected->>'emulator_hash' then
      raise exception using message='SOCIAL_INCOMPATIBLE',errcode='P0001';
    end if;
    if run.phase not in('validating','waiting') then raise exception using message='SOCIAL_ROOM_BUSY',errcode='P0001'; end if;
    if is_host then run.host_device:=p_device;run.host_ready:=true;run.host_seen:=now();
    else run.guest_device:=p_device;run.guest_ready:=true;run.guest_seen:=now(); end if;
    if run.host_ready and run.guest_ready then run.phase:='waiting'; end if;
  elsif p_action in('get','claim','session','connected','end','fail') then
    if (is_host and run.host_device is distinct from p_device) or (not is_host and run.guest_device is distinct from p_device) then
      if p_action<>'get' then raise exception using message='SOCIAL_FORBIDDEN',errcode='P0001'; end if;
    else
      if is_host then run.host_seen:=now();else run.guest_seen:=now();end if;
      if p_action='claim' then
        if is_host and run.phase='waiting' and not run.host_claimed then run.host_claimed:=true;run.phase:='preparing';run.updated_at:=now();should_launch:=true;
        elsif not is_host and run.phase='connecting' and not run.guest_claimed then run.guest_claimed:=true;should_launch:=true;
        end if;
      elsif p_action='session' then
        if not is_host or run.phase not in('preparing','connecting') or coalesce(p_data->>'session','')!~'^[A-Za-z0-9+/]{16}$' then
          raise exception using message='SOCIAL_FORBIDDEN',errcode='P0001';end if;
        if run.session is not null and run.session<>p_data->>'session' then raise exception using message='SOCIAL_INVALID_REQUEST',errcode='P0001';end if;
        run.session:=p_data->>'session';run.phase:='connecting';run.updated_at:=now();
      elsif p_action='connected' then
        if run.phase not in('connecting','playing') then raise exception using message='SOCIAL_FORBIDDEN',errcode='P0001';end if;
        if is_host then run.host_connected:=true;else run.guest_connected:=true;end if;
        if run.host_connected and run.guest_connected then run.phase:='playing';run.updated_at:=now();end if;
      elsif p_action in('end','fail') then run.phase:=case when p_action='end' then 'ended' else 'failed' end;run.session:=null;
      end if;
    end if;
  else raise exception using message='SOCIAL_INVALID_ACTION',errcode='P0001';end if;
  update public.social_room_runtime set phase=run.phase,host_device=run.host_device,guest_device=run.guest_device,
    host_ready=run.host_ready,guest_ready=run.guest_ready,host_seen=run.host_seen,guest_seen=run.guest_seen,
    host_claimed=run.host_claimed,guest_claimed=run.guest_claimed,host_connected=run.host_connected,guest_connected=run.guest_connected,
    session=run.session,updated_at=run.updated_at where room_id=p_room;
  update public.social_rooms set state=case when run.phase in('ended','failed') then 'cancelled' else state end,
    expires_at=case when run.phase in('waiting','preparing','connecting','playing') then least(created_at+interval '4 hours',now()+interval '90 seconds') else expires_at end where id=p_room;
  return pg_catalog.jsonb_build_object('phase',run.phase,'host_ready',run.host_ready,'guest_ready',run.guest_ready,'launch',should_launch,
    'session',case when not is_host and run.guest_device=p_device then run.session else null end,
    'role',case when is_host then 'host' else 'guest' end);
end;
$$;
revoke all on function public.social_room_step(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.social_room_step(uuid,uuid,uuid,text,jsonb) to service_role;

create or replace function public.social_session_snapshot(p_actor uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select pg_catalog.jsonb_build_object(
    'presence_mode', (select presence_mode from public.social_profiles where user_id=p_actor),
    'presence', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('user_id',friends.user_id,'state',
      case when profile.presence_mode='invisible' or not exists(select 1 from public.social_presence p where p.user_id=friends.user_id and p.last_seen_at>now()-interval '75 seconds') then 'offline'
        when exists(select 1 from public.social_presence p where p.user_id=friends.user_id and p.state='playing' and p.last_seen_at>now()-interval '75 seconds') then 'playing'
        when profile.presence_mode='away' then 'away'
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


revoke all on function public.social_session_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.social_session_snapshot(uuid) to service_role;
