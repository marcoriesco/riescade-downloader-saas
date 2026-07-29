import { NextResponse } from "next/server";
import {
  AppApiError,
  authenticateAppRequest,
} from "@/lib/server/app-auth";
import {
  assertDownloadAccess,
  listRomsetCatalog,
} from "@/services/download-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    await assertDownloadAccess(user);
    const url = new URL(request.url);
    const platform = url.searchParams.get("platform")?.trim().toLowerCase();
    if (!platform || !/^[a-z0-9_-]{1,64}$/.test(platform)) {
      throw new AppApiError(400, "Invalid platform");
    }
    const search = (url.searchParams.get("search") || "").slice(0, 128);
    const offset = Number(url.searchParams.get("offset") || 0);
    const limit = Number(url.searchParams.get("limit") || 500);
    const result = await listRomsetCatalog(platform, search, offset, limit);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError ? error.message : "Unable to load romset catalog";
    if (status === 500) console.error("Romset catalog error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
