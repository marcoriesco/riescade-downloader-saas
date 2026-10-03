-- Online identity overrides; Google remains the default identity.
alter table public.social_profiles add column avatar_url text,
  add column name_source text not null default 'custom' check(name_source in ('google','custom'));
update public.social_profiles set name_source='google' where display_name='RIESCADE Player';
alter table public.social_profiles alter column name_source set default 'google';
alter table public.social_profiles add constraint social_profiles_avatar_url_format check(avatar_url is null or (length(avatar_url)<=2048 and avatar_url like 'https://%'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('online-avatars','online-avatars',true,524288,array['image/webp']) on conflict(id) do nothing;
-- Uploads are performed only by the authenticated server via service_role.
