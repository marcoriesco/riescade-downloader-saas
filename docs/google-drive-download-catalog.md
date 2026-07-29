# Google Drive download catalog

Google Drive is the only download provider used by the website and the
RIESCADE OS app. Platform configuration lives in
`src/data/games-catalog.json`; the database contains a private, synchronized
index of downloadable files.

## Drive layout

```text
RIESCADE/
├── bios/
└── roms/
    ├── snes/
    ├── megadrive/
    ├── nes/
    └── ...
```

Google Drive folder IDs are canonical. Folder names are only for human
organization and may change without breaking the catalog.

The service account must be a member of the shared drive and only needs
read-only access. Its email and private key are server-only environment
variables and must never be exposed to the desktop app or browser.

## Platform configuration

Every enabled platform declares its Drive folder ID:

```json
{
  "id": "snes",
  "name": "Super Nintendo",
  "extensions": [".zip", ".7z", ".smc", ".sfc"],
  "folder_id": "GOOGLE_DRIVE_FOLDER_ID"
}
```

A platform with an empty `folder_id` remains visible in the general platform
catalog but its downloads are disabled.

## Synchronization

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

1. Lists every file directly inside the configured folder.
2. Ignores subfolders, non-downloadable files, files without a browser download
   link, and extensions not allowed by the platform.
3. Upserts file metadata using the stable Google Drive file ID.
4. Marks files removed from that folder as inactive.

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
6. Add the BIOS and platform folder IDs to `games-catalog.json`.
7. Run the synchronization endpoint.
8. Test catalog and download authorization with a pilot account.
