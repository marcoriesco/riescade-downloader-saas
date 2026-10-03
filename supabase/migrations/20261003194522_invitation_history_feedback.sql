-- Persist bounded user-facing failure messages. Existing callers keep their 3-argument RPC.
alter table public.social_invitation_progress add column message text check(message is null or (length(message)<=400 and message !~ '[[:cntrl:]]'));
create function public.social_set_invitation_progress(p_actor uuid,p_invitation uuid,p_phase text,p_message text)
returns void language plpgsql security invoker set search_path='' as $$
declare invitation public.social_invitations;
begin
 if p_message is not null and (length(p_message)>400 or p_message ~ '[[:cntrl:]]') then raise exception using message='SOCIAL_INVALID_REQUEST',errcode='P0001'; end if;
 select * into invitation from public.social_invitations where id=p_invitation and p_actor in(sender_id,recipient_id);
 if not found then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
 perform public.social_lock_game_pair(invitation.sender_id,invitation.recipient_id);
 select * into invitation from public.social_invitations where id=p_invitation for update;
 if invitation.status<>'accepted' or (p_phase<>'cancelled' and exists(select 1 from public.social_invitation_progress where invitation_id=p_invitation and phase='cancelled')) or invitation.created_at<now()-interval '4 hours' then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
 insert into public.social_invitation_progress(invitation_id,actor_id,phase,message) values(p_invitation,p_actor,p_phase,case when p_phase='failed' then nullif(btrim(p_message),'') else null end)
 on conflict(invitation_id,actor_id) do update set phase=excluded.phase,message=excluded.message,updated_at=now();
 update public.social_rooms r set expires_at=least(r.created_at+interval '4 hours',greatest(r.expires_at,now()+interval '2 minutes'))
 where r.invitation_id=p_invitation and r.state='validating' and r.created_at>now()-interval '4 hours'
 and not exists(select 1 from public.social_room_runtime rt where rt.room_id=r.id and rt.phase in('ended','failed'));
 if p_phase='cancelled' then
  update public.social_rooms set state='cancelled' where invitation_id=p_invitation;
 end if;
end; $$;

revoke all on function public.social_set_invitation_progress(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.social_set_invitation_progress(uuid,uuid,text,text) to service_role;
create or replace function public.social_set_invitation_progress(p_actor uuid,p_invitation uuid,p_phase text)
returns void language sql security invoker set search_path='' as $$
 select public.social_set_invitation_progress(p_actor,p_invitation,p_phase,null);
$$;
revoke all on function public.social_set_invitation_progress(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.social_set_invitation_progress(uuid,uuid,text) to service_role;

-- Return the actual invitation creation time, never its expiration time.
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
      'created_at',i.created_at,'game',i.game,'status',case when i.status='pending' and i.expires_at<=now() then 'expired' else i.status end,
      'hosted_session_id',i.hosted_session_id,'expires_at',i.expires_at,'room_id',(select id from public.social_rooms where invitation_id=i.id),
      'phase',case when exists(select 1 from public.social_invitation_progress where invitation_id=i.id and phase='failed') and (i.hosted_session_id is not null or exists(select 1 from public.social_rooms room where room.invitation_id=i.id and (room.state<>'validating' or room.expires_at<=now()))) then 'failed' when exists(select 1 from public.social_invitation_progress where invitation_id=i.id and phase='cancelled') then 'cancelled' when i.hosted_session_id is not null and (not exists(select 1 from public.social_hosted_sessions where id=i.hosted_session_id and not closed and expires_at>now()) or i.created_at<now()-interval '4 hours') then 'ended' when i.hosted_session_id is null and exists(select 1 from public.social_rooms where invitation_id=i.id and (state<>'validating' or expires_at<=now())) then 'ended' when exists(select 1 from public.social_invitation_progress where invitation_id=i.id and phase='cancelled') then 'cancelled' else coalesce((select phase from public.social_room_runtime where room_id=(select id from public.social_rooms where invitation_id=i.id)),(select case when state<>'validating' or expires_at<=now() then 'ended' else 'validating' end from public.social_rooms where invitation_id=i.id)) end,
      'progress',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('actor_id',p.actor_id,'phase',p.phase,'message',p.message)) from public.social_invitation_progress p where p.invitation_id=i.id),'[]'::jsonb)))
      from (select * from public.social_invitations where p_actor in(sender_id,recipient_id) and not exists(select 1 from public.social_invitation_dismissals d where d.actor_id=p_actor and d.invitation_id=social_invitations.id) and created_at>now()-interval '24 hours' order by created_at desc limit 100) i
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



create or replace function public.social_dismiss_invitation(p_actor uuid,p_invitation uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare invitation public.social_invitations; item jsonb;
begin
  select * into invitation from public.social_invitations where id=p_invitation;
  if not found or p_actor is null or p_actor not in(invitation.sender_id,invitation.recipient_id) then
    raise exception using message='SOCIAL_FORBIDDEN',errcode='P0001';
  end if;
  if exists(select 1 from public.social_invitation_dismissals where actor_id=p_actor and invitation_id=p_invitation) then return; end if;
  select value into item from pg_catalog.jsonb_array_elements(public.social_session_snapshot(p_actor)->'invitation_history') where value->>'id'=p_invitation::text;
  if item is null or not (item->>'status' in('cancelled','declined','expired') or (item->>'status'='accepted' and item->>'phase' in('ended','failed','cancelled'))) then
    raise exception using message='SOCIAL_MATCH_ACTIVE',errcode='P0001';
  end if;
  insert into public.social_invitation_dismissals(actor_id,invitation_id) values(p_actor,p_invitation) on conflict do nothing;
end;
$$;
revoke all on function public.social_dismiss_invitation(uuid,uuid) from public,anon,authenticated;
grant execute on function public.social_dismiss_invitation(uuid,uuid) to service_role;
