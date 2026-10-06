import { NextResponse } from "next/server";
import { getLatestNativeRelease } from "@/services/native-release-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const release = await getLatestNativeRelease();
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
    console.error("Latest native release error:", error);
    return NextResponse.json(
      { error: "Failed to load latest release" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
