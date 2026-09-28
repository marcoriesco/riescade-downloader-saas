import { NextResponse } from "next/server";
import themesCatalog from "@/data/themes-catalog.json";
import {
  AppApiError,
  authenticateAppRequest,
} from "@/lib/server/app-auth";
import { assertDownloadAccess, listThemePackages } from "@/services/download-service";

export const dynamic = "force-dynamic";

interface ThemePackageInfo {
  assetId: string;
  themeId: string | null;
  fileName: string;
  fileSize: number | null;
  md5: string | null;
  version: string;
}

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    await assertDownloadAccess(user);

    let packages: ThemePackageInfo[] = [];
    try {
      packages = await listThemePackages();
    } catch {
      packages = [];
    }

    const packageById = new Map(packages.map((item) => [item.themeId, item]));
    const configured = (themesCatalog.themes || {}) as Record<string, Record<string, unknown>>;
    const themes = Object.fromEntries(
      Object.entries(configured).map(([id, entry]) => {
        const packageInfo = packageById.get(id);
        const preview =
          typeof entry.previewUrl === "string" && entry.previewUrl.startsWith("/")
            ? `https://www.riescade.com.br${entry.previewUrl}`
            : entry.previewUrl;
        return [
          id,
          {
            ...entry,
            previewUrl: preview,
            ...(packageInfo ? { package: packageInfo } : {}),
          },
        ];
      })
    );

    return NextResponse.json({ ...themesCatalog, themes }, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError
        ? error.message
        : "Unable to load themes catalog";
    if (status === 500) {
      console.error("Themes catalog error:", error);
    }
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
