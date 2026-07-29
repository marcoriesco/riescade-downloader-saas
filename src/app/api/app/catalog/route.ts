import { NextResponse } from "next/server";
import {
  AppApiError,
  authenticateAppRequest,
} from "@/lib/server/app-auth";
import {
  assertDownloadAccess,
  getPlatformCatalogRevision,
  listPlatformAssets,
} from "@/services/download-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    await assertDownloadAccess(user);
    const platform = new URL(request.url).searchParams.get("platform")?.trim().toLowerCase();
    if (!platform) {
      throw new AppApiError(400, "Platform is required");
    }
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const limit = Number(url.searchParams.get("limit") ?? "250");
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 500
    ) {
      throw new AppApiError(400, "Invalid catalog page");
    }
    const revision = await getPlatformCatalogRevision(platform);
    const etag = `"${platform}:${revision}"`;
    if (request.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "private, max-age=0, must-revalidate",
        },
      });
    }
    const catalog = await listPlatformAssets(platform, { offset, limit });
    return NextResponse.json(
      { platform, revision, ...catalog },
      {
        headers: {
          ETag: etag,
          "Cache-Control": "private, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError ? error.message : "Unable to load catalog";
    if (status === 500) {
      console.error("Platform catalog error:", error);
    }
    return NextResponse.json({ error: message }, { status });
  }
}
