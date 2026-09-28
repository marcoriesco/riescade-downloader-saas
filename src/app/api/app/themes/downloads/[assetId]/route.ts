import { NextResponse } from "next/server";
import { AppApiError, authenticateAppRequest } from "@/lib/server/app-auth";
import { authorizeThemeDownload } from "@/services/download-service";
import themesCatalog from "@/data/themes-catalog.json";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ assetId: string }>;
}

interface ConfiguredThemePackage {
  assetId?: string;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  version?: string;
}

interface ConfiguredTheme {
  id?: string;
  name?: string;
  version?: string;
  package?: ConfiguredThemePackage;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await authenticateAppRequest(request);
    const { assetId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const themeId = typeof body.theme === "string" ? body.theme : typeof body.themeId === "string" ? body.themeId : "";

    try {
      const result = await authorizeThemeDownload(
        user,
        themeId,
        assetId,
        typeof body.clientVersion === "string" ? body.clientVersion : undefined
      );
      return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (indexedErr) {
      const configuredMap = themesCatalog.themes as Record<string, ConfiguredTheme>;
      const configured = configuredMap[themeId];
      if (configured?.package && (configured.package.assetId === assetId || configured.id === themeId)) {
        return NextResponse.json({
          asset: {
            id: assetId,
            platform: themeId,
            title: configured.name || themeId,
            filename: configured.package.fileName || `${themeId}.zip`,
            size: configured.package.fileSize || null,
            downloadUrl: configured.package.downloadUrl || `https://www.riescade.com.br/downloads/themes/${themeId}.zip`,
            version: configured.version || "1.0.0"
          },
          downloadUrl: configured.package.downloadUrl || `https://www.riescade.com.br/downloads/themes/${themeId}.zip`
        }, { headers: { "Cache-Control": "no-store" } });
      }
      throw indexedErr;
    }
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (status === 500) console.error("Theme download authorization error:", error);
    return NextResponse.json(
      { error: error instanceof AppApiError ? error.message : "Unable to authorize theme download" },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
