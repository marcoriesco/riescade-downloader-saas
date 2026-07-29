import { NextResponse } from "next/server";
import {
  AppApiError,
  authenticateAppRequest,
} from "@/lib/server/app-auth";
import { authorizeRomsetUpdate } from "@/services/download-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const body = await request.json().catch(() => ({}));
    const result = await authorizeRomsetUpdate(
      user,
      body.platform,
      body.filename,
      typeof body.clientVersion === "string" ? body.clientVersion : undefined
    );

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError ? error.message : "Unable to authorize romset update";
    if (status === 500) {
      console.error("Romset update authorization error:", error);
    }
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
