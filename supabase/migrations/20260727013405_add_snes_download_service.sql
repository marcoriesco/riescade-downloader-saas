create extension if not exists pgcrypto;

create table public.game_assets (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  provider text not null default 's3',
  bucket text not null,
  object_key text not null,
  title text not null,
  download_name text not null,
  content_type text,
  file_size bigint,
  sha256 text,
  status text not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_assets_platform_format
    check (platform = lower(platform) and platform ~ '^[a-z0-9-]+$'),
  constraint game_assets_provider_check check (provider in ('s3')),
  constraint game_assets_status_check check (status in ('inactive', 'active')),
  constraint game_assets_file_size_check check (file_size is null or file_size >= 0),
  constraint game_assets_sha256_check
    check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  constraint game_assets_storage_object_unique unique (bucket, object_key)
);

create index game_assets_active_platform_idx
  on public.game_assets (platform, title)
  where status = 'active';

create table public.download_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.game_assets(id) on delete restrict,
  status text not null,
  provider text not null,
  client_version text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint download_requests_status_check
    check (status in ('authorized', 'denied', 'failed')),
  constraint download_requests_client_version_length
    check (client_version is null or char_length(client_version) <= 64)
);

create index download_requests_user_created_idx
  on public.download_requests (user_id, created_at desc);

create index download_requests_asset_created_idx
  on public.download_requests (asset_id, created_at desc);

alter table public.game_assets enable row level security;
alter table public.download_requests enable row level security;

revoke all on table public.game_assets from anon, authenticated;
revoke all on table public.download_requests from anon, authenticated;

comment on table public.game_assets is
  'Private catalog of downloadable assets. Access is server-side only.';
comment on table public.download_requests is
  'Audit trail for short-lived download authorizations issued to the app.';
