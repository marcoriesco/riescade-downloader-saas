alter table public.download_requests
  drop constraint if exists download_requests_asset_id_fkey;

alter table public.download_requests
  alter column asset_id type text using asset_id::text;

drop table if exists public.game_assets;

comment on table public.download_requests is
  'Audit trail for download authorizations issued to the app.';
