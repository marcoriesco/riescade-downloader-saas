import { NextResponse } from "next/server";
import emulatorsCatalog from "@/data/emulators-catalog.json";
import {
  AppApiError,
  authenticateAppRequest,
} from "@/lib/server/app-auth";
import { assertDownloadAccess, listEmulatorPackages } from "@/services/download-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    await assertDownloadAccess(user);

    const packages = await listEmulatorPackages();
    const packageById = new Map(packages.map((item) => [item.emulatorId, item]));
    const configured = emulatorsCatalog.emulators as Record<string, { aliases?: string[] } & Record<string, unknown>>;
    const emulators = Object.fromEntries(
      Object.entries(configured).map(([id, entry]) => {
        const packageInfo = packageById.get(id) ||
          (entry.aliases || []).map((alias) => packageById.get(alias)).find(Boolean);
        return [id, packageInfo ? { ...entry, package: packageInfo } : entry];
      })
    );

    return NextResponse.json({ ...emulatorsCatalog, emulators }, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError
        ? error.message
        : "Unable to load emulator catalog";
    if (status === 500) {
      console.error("Emulator catalog error:", error);
    }
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
