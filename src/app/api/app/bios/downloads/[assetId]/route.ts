import { NextResponse } from "next/server";
import {
  AppApiError,
  authenticateAppRequest,
} from "@/lib/server/app-auth";
import { authorizeBiosDownload } from "@/services/download-service";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ assetId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await authenticateAppRequest(request);
    const { assetId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const result = await authorizeBiosDownload(
      user,
      assetId,
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
        : "Unable to authorize BIOS download";
    if (status === 500) {
      console.error("BIOS download authorization error:", error);
    }
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
