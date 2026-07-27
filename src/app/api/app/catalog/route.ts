import { NextResponse } from "next/server";
import { AppApiError } from "@/lib/server/app-auth";
import { listSnesAssets } from "@/services/download-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await listSnesAssets();
    return NextResponse.json({ platform: "snes", ...catalog });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError ? error.message : "Unable to load catalog";
    if (status === 500) {
      console.error("SNES catalog error:", error);
    }
    return NextResponse.json({ error: message }, { status });
  }
}
