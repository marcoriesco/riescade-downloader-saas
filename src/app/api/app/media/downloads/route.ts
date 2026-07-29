import { NextResponse } from "next/server";
import {
  AppApiError,
  authenticateAppRequest,
} from "@/lib/server/app-auth";
import { authorizePlatformMediaDownload } from "@/services/download-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const body = await request.json().catch(() => ({}));
    const result = await authorizePlatformMediaDownload(
      user,
      body.platform,
      typeof body.clientVersion === "string" ? body.clientVersion : undefined
    );

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError
        ? error.message
        : "Unable to authorize full media download";

    if (status === 500) {
      console.error("Full media download authorization error:", error);
    }

    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
