create table public.app_auth_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  state_hash text not null,
  pkce_challenge text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint app_auth_codes_hash_format
    check (code_hash ~ '^[a-f0-9]{64}$' and state_hash ~ '^[a-f0-9]{64}$'),
  constraint app_auth_codes_challenge_format
    check (pkce_challenge ~ '^[A-Za-z0-9_-]{43,128}$')
);

create index app_auth_codes_expiry_idx
  on public.app_auth_codes (expires_at)
  where consumed_at is null;

create table public.app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  last_used_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint app_sessions_token_hash_format
    check (token_hash ~ '^[a-f0-9]{64}$')
);

create index app_sessions_user_idx
  on public.app_sessions (user_id, created_at desc);

create index app_sessions_expiry_idx
  on public.app_sessions (expires_at)
  where revoked_at is null;

alter table public.app_auth_codes enable row level security;
alter table public.app_sessions enable row level security;

revoke all on table public.app_auth_codes from anon, authenticated;
revoke all on table public.app_sessions from anon, authenticated;

comment on table public.app_auth_codes is
  'Single-use, PKCE-bound codes used to authorize the desktop app.';
comment on table public.app_sessions is
  'Hashed opaque sessions for the desktop app. Server-side access only.';
