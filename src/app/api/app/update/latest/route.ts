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
    return NextResponse.json(release, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Latest app release error:", error);
    return NextResponse.json(
      { error: "Failed to load latest release" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
