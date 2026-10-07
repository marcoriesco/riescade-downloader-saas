import { NextResponse } from "next/server";
import { getLatestRetroBatPackage } from "@/services/retrobat-package-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const release = await getLatestRetroBatPackage();
    if (!release) {
      return NextResponse.json(
        { error: "No RetroBat package has been published" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.redirect(release.downloadUrl, {
      status: 307,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Latest RetroBat download error:", error);
    return NextResponse.json(
      { error: "Failed to load latest RetroBat package" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
