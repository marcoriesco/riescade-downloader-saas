create table public.download_assets (
  id text primary key,
  drive_file_id text not null unique,
  drive_folder_id text not null,
  category text not null,
  platform text,
  filename text not null,
  title text not null,
  mime_type text not null,
  file_size bigint,
  md5_checksum text,
  web_content_link text not null,
  install_mode text not null default 'file',
  install_name text not null,
  romset_version text,
  drive_modified_at timestamptz,
  active boolean not null default true,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint download_assets_id_format
    check (id ~ '^[a-f0-9]{64}$'),
  constraint download_assets_drive_file_id_format
    check (drive_file_id ~ '^[a-zA-Z0-9_-]+$'),
  constraint download_assets_drive_folder_id_format
    check (drive_folder_id ~ '^[a-zA-Z0-9_-]+$'),
  constraint download_assets_category_check
    check (category in ('bios', 'rom')),
  constraint download_assets_platform_format
    check (
      platform is null or
      (platform = lower(platform) and platform ~ '^[a-z0-9_-]{1,64}$')
    ),
  constraint download_assets_category_platform_check
    check (
      (category = 'bios' and platform is null) or
      (category = 'rom' and platform is not null)
    ),
  constraint download_assets_file_size_check
    check (file_size is null or file_size >= 0),
  constraint download_assets_md5_check
    check (md5_checksum is null or md5_checksum ~ '^[a-f0-9]{32}$'),
  constraint download_assets_install_mode_check
    check (install_mode in ('file', 'extract'))
);

create index download_assets_active_platform_title_idx
  on public.download_assets (platform, title)
  where active and category = 'rom';

create index download_assets_active_category_title_idx
  on public.download_assets (category, title)
  where active;

create index download_assets_folder_idx
  on public.download_assets (drive_folder_id);

alter table public.download_assets enable row level security;

revoke all on table public.download_assets from anon, authenticated;
grant select, insert, update, delete on table public.download_assets
  to service_role;

comment on table public.download_assets is
  'Private server-side index of downloadable files stored in Google Drive.';

comment on table public.download_requests is
  'Audit trail for Google Drive download authorizations issued to the app.';
