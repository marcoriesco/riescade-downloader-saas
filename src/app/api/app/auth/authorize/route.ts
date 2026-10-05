import { NextResponse } from "next/server";
import { DESKTOP_CLIENTS, resolveDesktopClient } from "@/lib/desktop-clients";
import {
  AppApiError,
  authenticateSupabaseRequest,
} from "@/lib/server/app-auth";
import {
  createDesktopAuthorizationCode,
  validateDesktopAuthInput,
} from "@/lib/server/desktop-auth";

export async function GET() {
  return NextResponse.json({
    pkce: "S256",
    callbacks: {
      os: DESKTOP_CLIENTS.os.callback,
      retrobat: DESKTOP_CLIENTS.retrobat.callback,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const user = await authenticateSupabaseRequest(request);
    const body = await request.json().catch(() => ({}));
    let client;
    try {
      client = resolveDesktopClient(body.client, body.redirectUri);
    } catch {
      throw new AppApiError(400, "Invalid desktop client or callback");
    }
    const { state, challenge } = validateDesktopAuthInput(
      body.state,
      body.challenge
    );
    const code = await createDesktopAuthorizationCode(
      user.id,
      state,
      challenge
    );
    const callback = new URL(client.callback);
    callback.searchParams.set("code", code);
    callback.searchParams.set("state", state);
    return NextResponse.json({ callbackUrl: callback.toString() });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError ? error.message : "Unable to authorize app";
    if (status === 500) console.error("Desktop authorization error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
