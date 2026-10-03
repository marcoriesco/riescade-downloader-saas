-- Hide a finished match only for the requesting participant.
create table public.social_invitation_dismissals (
  actor_id uuid not null references public.social_profiles(user_id) on delete cascade,
  invitation_id uuid not null references public.social_invitations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (actor_id, invitation_id)
);
create index social_invitation_dismissals_invitation_idx on public.social_invitation_dismissals(invitation_id);
alter table public.social_invitation_dismissals enable row level security;
revoke all on public.social_invitation_dismissals from public,anon,authenticated;
grant all on public.social_invitation_dismissals to service_role;

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


create function public.social_dismiss_invitation(p_actor uuid,p_invitation uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare invitation public.social_invitations; item jsonb;
begin
  select * into invitation from public.social_invitations where id=p_invitation;
  if not found or p_actor is null or p_actor not in(invitation.sender_id,invitation.recipient_id) then
    raise exception using message='SOCIAL_FORBIDDEN',errcode='P0001';
  end if;
  if exists(select 1 from public.social_invitation_dismissals where actor_id=p_actor and invitation_id=p_invitation) then return; end if;
  select value into item from pg_catalog.jsonb_array_elements(public.social_session_snapshot(p_actor)->'invitation_history') where value->>'id'=p_invitation::text;
  if item is null or item->>'status'<>'accepted' or item->>'phase' is distinct from 'ended' then
    raise exception using message='SOCIAL_MATCH_ACTIVE',errcode='P0001';
  end if;
  insert into public.social_invitation_dismissals(actor_id,invitation_id) values(p_actor,p_invitation) on conflict do nothing;
end;
$$;
revoke all on function public.social_dismiss_invitation(uuid,uuid) from public,anon,authenticated;
grant execute on function public.social_dismiss_invitation(uuid,uuid) to service_role;
