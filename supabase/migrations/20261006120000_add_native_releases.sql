create table public.native_releases (
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
  constraint native_releases_version_format
    check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  constraint native_releases_asset_name_format
    check (asset_name ~ '^riescade-native-v[0-9]+\.[0-9]+\.[0-9]+\.zip$'),
  constraint native_releases_sha256_format
    check (sha256 ~ '^[a-f0-9]{64}$'),
  constraint native_releases_size_positive
    check (size > 0 and size <= 209715200),
  constraint native_releases_signature_format
    check (signature ~ '^[A-Za-z0-9+/]+={0,2}$'),
  constraint native_releases_https_download
    check (download_url ~ '^https://')
);

alter table public.native_releases enable row level security;

revoke all on table public.native_releases from anon, authenticated;
grant select, insert on table public.native_releases to service_role;

create index native_releases_semver_idx
  on public.native_releases (version_major desc, version_minor desc, version_patch desc);

comment on table public.native_releases is
  'Signed update manifests for the riescade-native RetroBat companion.';
