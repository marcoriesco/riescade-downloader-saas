import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { syncGoogleDriveCatalog } from "@/services/google-drive-sync-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const configuredSecret = process.env.GOOGLE_DRIVE_SYNC_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  const receivedSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!configuredSecret || !receivedSecret) return false;

  const expected = Buffer.from(configuredSecret);
  const received = Buffer.from(receivedSecret);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const platform =
      typeof body.platform === "string" ? body.platform : undefined;
    const result = await syncGoogleDriveCatalog(platform);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Google Drive catalog sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

