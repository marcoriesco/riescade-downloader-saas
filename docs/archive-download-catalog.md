# Archive.org game catalog

The website authenticates members and returns game downloads hosted by
Archive.org. Platform configuration lives in `src/data/games-catalog.json`.

Each platform has an Archive.org item identifier and the corresponding public
details, metadata, and torrent URLs. Platforms without an identifier remain
visible in the configuration but are not enabled for remote download.

The catalog endpoint reads the item metadata from:

```text
https://archive.org/metadata/{identifier}
```

Only original files whose extension is allowed by the platform configuration
are returned as games. Archive-generated metadata, XML, thumbnails, and torrent
files are ignored.

Individual downloads still require an active RIESCADE membership. The app asks
the website for authorization, and the website records the request in
`download_requests`.

The full-system torrent URL is stored in the platform entry:

```text
https://archive.org/download/{identifier}/{identifier}_archive.torrent
```

Archive.org URLs are public. Authentication controls discovery and the app
workflow, but it cannot make an Archive.org file private.
