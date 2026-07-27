# SNES app download pilot

The website authenticates users and issues short-lived download authorization.
The RIESCADE app downloads the file directly from private object storage.

## Server configuration

Create a standard, read-only Backblaze B2 Application Key restricted to the
pilot bucket. The B2 master key is not supported by the S3-compatible API and
must never be used by the application.

Configure the server-only environment variables documented in `.env.example`.
Do not prefix storage credentials with `NEXT_PUBLIC_`.

## Database

Apply the Supabase migration, then register one authorized SNES test asset:

```sql
insert into public.game_assets (
  platform,
  provider,
  bucket,
  object_key,
  title,
  download_name,
  content_type,
  file_size,
  sha256,
  status
) values (
  'snes',
  's3',
  'riescade-download',
  'snes/homebrew/authorized-test.zip',
  'Authorized SNES test',
  'authorized-test.zip',
  'application/zip',
  null,
  null,
  'active'
);
```

Use only an object whose distribution is authorized. Add the Supabase UUID of
the pilot user to `DOWNLOAD_TEST_USER_IDS`, or test with a user whose
subscription has status `active` or `trialing`.

## App API

List the authorized SNES catalog:

```http
GET /api/app/catalog
Authorization: Bearer <supabase-access-token>
```

Request a five-minute download URL:

```http
POST /api/app/downloads/<asset-id>
Authorization: Bearer <supabase-access-token>
Content-Type: application/json

{"clientVersion":"2.3.1"}
```

The response includes the expected filename, size, SHA-256 hash, temporary URL,
and expiration timestamp. The app should download to a `.part` file, verify the
hash, and only then move the file into `roms/snes`.
