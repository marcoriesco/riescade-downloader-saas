import { NextResponse } from "next/server";
import {
  AppApiError,
  authenticateAppRequest,
} from "@/lib/server/app-auth";
import {
  assertDownloadAccess,
  listBiosAssets,
} from "@/services/download-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    await assertDownloadAccess(user);
    const catalog = await listBiosAssets();
    return NextResponse.json(catalog, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError
        ? error.message
        : "Unable to load BIOS catalog";
    if (status === 500) {
      console.error("BIOS catalog error:", error);
    }
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}

