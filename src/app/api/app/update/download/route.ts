import { NextResponse } from "next/server";
import { getLatestAppRelease } from "@/services/app-release-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const release = await getLatestAppRelease();
    if (!release) {
      return NextResponse.json(
        { error: "No release has been published" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.redirect(release.zipUrl, {
      status: 307,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Latest app download error:", error);
    return NextResponse.json(
      { error: "Failed to load latest release" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
