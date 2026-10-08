-- Direct sessions preserve existing authorization and service_role-only execution.
create or replace function public.social_publish_hosted_session(p_actor uuid,p_id uuid,p_game jsonb,p_connection jsonb,p_close boolean default false)
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
  or coalesce(p_connection->>'host','')!~'^[A-Za-z0-9.-]{1,255}$' or coalesce(p_connection->>'transport','')<>'direct' or p_connection ? 'session' or coalesce(p_connection->>'password','')!~'^[a-f0-9]{48}$'
  or coalesce(p_connection->>'port','')!~'^[0-9]{1,5}$' or (p_connection->>'port')::int not between 1 and 65535 then
  raise exception using message='SOCIAL_INVALID_REQUEST',errcode='P0001'; end if;
 insert into public.social_hosted_sessions(id,owner_id,game,connection) values(p_id,p_actor,p_game,p_connection)
 on conflict(id) do update set expires_at=now()+interval '2 minutes'
 where social_hosted_sessions.owner_id=p_actor and social_hosted_sessions.game=excluded.game and social_hosted_sessions.connection=excluded.connection;
 return p_id;
end; $$;

create or replace function public.social_hosted_invitation_connection(p_actor uuid,p_invitation uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 select h.connection into result from public.social_invitations i join public.social_hosted_sessions h on h.id=i.hosted_session_id
 where i.id=p_invitation and i.recipient_id=p_actor and i.status='accepted' and not h.closed and h.connection->>'transport'='direct' and h.expires_at>now() and i.created_at>now()-interval '4 hours'
 and not exists(select 1 from public.social_invitation_progress p where p.invitation_id=i.id and p.phase='cancelled')
 and exists(select 1 from public.social_relationships r where r.user_low=least(i.sender_id,i.recipient_id) and r.user_high=greatest(i.sender_id,i.recipient_id) and r.status='accepted');
 if result is null then raise exception using message='SOCIAL_UNAVAILABLE',errcode='P0001'; end if;
 return result;
end; $$;


revoke all on function public.social_publish_hosted_session(uuid,uuid,jsonb,jsonb,boolean), public.social_hosted_invitation_connection(uuid,uuid) from public,anon,authenticated;
grant execute on function public.social_publish_hosted_session(uuid,uuid,jsonb,jsonb,boolean), public.social_hosted_invitation_connection(uuid,uuid) to service_role;
