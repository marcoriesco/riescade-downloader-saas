import { NextResponse } from "next/server";
import { AppApiError, readBearerToken } from "@/lib/server/app-auth";
import {
  isDesktopAppToken,
  revokeDesktopToken,
} from "@/lib/server/desktop-auth";

export async function POST(request: Request) {
  try {
    const token = readBearerToken(request.headers.get("authorization"));
    if (!isDesktopAppToken(token)) {
      throw new AppApiError(400, "Not a desktop app session");
    }
    await revokeDesktopToken(token);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError ? error.message : "Unable to sign out";
    return NextResponse.json({ error: message }, { status });
  }
}
