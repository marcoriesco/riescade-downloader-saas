alter table public.download_assets
  drop constraint download_assets_category_check,
  drop constraint download_assets_category_platform_check;

alter table public.download_assets
  add constraint download_assets_category_check
    check (category in ('bios', 'rom', 'emulator')),
  add constraint download_assets_category_platform_check
    check (
      (category = 'bios' and platform is null) or
      (category in ('rom', 'emulator') and platform is not null)
    );

create index download_assets_active_emulator_idx
  on public.download_assets (platform)
  where active and category = 'emulator';

comment on column public.download_assets.platform is
  'Platform ID for ROMs or normalized emulator ID for emulator packages.';
