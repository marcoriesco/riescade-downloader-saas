import { NextResponse } from "next/server";
import { AppApiError } from "@/lib/server/app-auth";
import { listPlatformAssets } from "@/services/download-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const platform = new URL(request.url).searchParams.get("platform")?.trim().toLowerCase();
    if (!platform) {
      throw new AppApiError(400, "Platform is required");
    }
    const catalog = await listPlatformAssets(platform);
    return NextResponse.json(
      { platform, ...catalog },
      { headers: { "Cache-Control": "no-store" } }
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
