create table public.app_releases (
  version text primary key,
  release_notes text not null default '',
  download_url text not null,
  asset_name text not null,
  sha256 text not null,
  size bigint not null,
  signature text not null,
  drive_file_id text,
  version_major integer generated always as ((split_part(version, '.', 1))::integer) stored,
  version_minor integer generated always as ((split_part(version, '.', 2))::integer) stored,
  version_patch integer generated always as ((split_part(version, '.', 3))::integer) stored,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint app_releases_version_format
    check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  constraint app_releases_asset_name_format
    check (asset_name ~ '^RIESCADE_OS_v[0-9]+\.[0-9]+\.[0-9]+\.(7z|zip)$'),
  constraint app_releases_sha256_format
    check (sha256 ~ '^[a-f0-9]{64}$'),
  constraint app_releases_size_positive
    check (size > 0 and size <= 4294967296),
  constraint app_releases_signature_format
    check (signature ~ '^[A-Za-z0-9+/]+={0,2}$'),
  constraint app_releases_https_download
    check (download_url ~ '^https://')
);

alter table public.app_releases enable row level security;

revoke all on table public.app_releases from anon, authenticated;
grant select, insert on table public.app_releases to service_role;

create index app_releases_semver_idx
  on public.app_releases (version_major desc, version_minor desc, version_patch desc);

comment on table public.app_releases is
  'Private update manifests published by the signed desktop release pipeline.';
