# Google Drive download catalog

Google Drive is the only download provider used by the website and the
RIESCADE OS app. Platform configuration lives in
`src/data/games-catalog.json`; the database contains a private, synchronized
index of downloadable files.

## Drive layout

```text
RIESCADE/
├── bios/
├── emulators/
│   ├── eden.zip
│   ├── retroarch.zip
│   └── ryujinx.zip
└── roms/
    ├── snes/
    ├── megadrive/
    ├── nes/
    └── ...
```

Only the shared-drive ID is configured. On every synchronization, the server
finds `bios` and `roms` at the drive root and matches each direct child of
`roms` to the platform `id` in `games-catalog.json`, ignoring letter case.
Folder names are therefore part of the catalog contract.

Emulator packages live directly under `emulators` and must use the normalized
emulator ID as their filename. Only `.zip` files whose names exist in
`emulators-catalog.json` (or match one of its aliases) are indexed. Google
Drive's modification timestamp is used as the package version and its MD5 is
validated by the desktop app before installation.

The service account must be a member of the shared drive and only needs
read-only access. Its email and private key are server-only environment
variables and must never be exposed to the desktop app or browser.

## Platform configuration

Each platform declares its stable folder name as `id`:

```json
{
  "id": "snes",
  "name": "Super Nintendo",
  "extensions": [".zip", ".7z", ".smc", ".sfc"]
}
```

No individual Drive folder IDs are stored. A missing platform folder is skipped
during a complete synchronization and reported as an error when that platform
is explicitly requested. Duplicate folder names fail safely.

## Synchronization

From the website project directory, synchronize the complete catalog with:

```text
npm run sync-google-drive
```

To synchronize a single platform:

```text
npm run sync-google-drive -- snes
```

The command starts the website backend on a temporary local port, calls the
protected synchronization endpoint, prints the result, and stops the temporary
server. It is a website maintenance command and is never executed by the
RIESCADE OS desktop app.

The private endpoint below lists configured Drive folders and updates
`public.download_assets`:

```text
POST /api/internal/google-drive/sync
Authorization: Bearer GOOGLE_DRIVE_SYNC_SECRET
```

To synchronize only one platform:

```json
{
  "platform": "snes"
}
```

The synchronization:

1. Discovers `bios`, `roms`, and the platform folders from the shared-drive
   root.
2. Lists every file directly inside each discovered folder.
3. Ignores subfolders, non-downloadable files, files without a browser download
   link, and extensions not allowed by the platform.
4. Upserts file metadata using the stable Google Drive file ID.
5. Marks files removed from that folder as inactive.

Nested platform folders are intentionally not traversed. If a platform needs
subfolders, each downloadable folder must be represented explicitly in a
future catalog schema revision.

## Download authorization

Catalog discovery and download authorization require an authenticated app user
with an active RIESCADE subscription. The API validates the requested asset
against the private database index, records the authorization in
`download_requests`, and returns the Drive `webContentLink`.

```text
GET  /api/app/catalog?platform=snes
POST /api/app/downloads/{assetId}
GET  /api/app/bios/catalog
POST /api/app/bios/downloads/{assetId}
GET  /api/app/emulators/catalog
POST /api/app/emulators/downloads/{assetId}
```

The files must be configured so that the intended app users can open the
browser download link. Validate large files, redirects, resume support, and
Google download quotas with the SNES pilot before migrating the full library.

## Initial setup

1. Enable Google Drive API in the Google Cloud project.
2. Create a service account and JSON key.
3. Add the service-account email to the Google Workspace shared drive.
4. Configure the server environment variables documented in `.env.example`.
5. Apply the `download_assets` database migration.
6. Set `GOOGLE_SHARED_DRIVE_ID` to the shared-drive root ID.
7. Run the synchronization endpoint.
8. Test catalog and download authorization with a pilot account.

## Desktop application releases

Application releases use a separate `releases` folder in Google Drive. The
desktop release script uploads the versioned archive with the Drive resumable
upload API and then publishes its signed manifest to:

```text
POST /api/internal/releases/publish
Authorization: Bearer RELEASE_PUBLISH_SECRET
```

The public updater reads only the latest signed manifest:

```text
GET /api/app/update/latest
```

Release metadata is stored in the private `app_releases` table. RLS is enabled
without `anon` or `authenticated` policies; only the server-side service role
can read or insert releases. Published versions are immutable.
