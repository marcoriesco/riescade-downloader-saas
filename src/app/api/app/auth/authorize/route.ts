import { NextResponse } from "next/server";
import {
  AppApiError,
  authenticateSupabaseRequest,
} from "@/lib/server/app-auth";
import {
  createDesktopAuthorizationCode,
  validateDesktopAuthInput,
} from "@/lib/server/desktop-auth";

export async function POST(request: Request) {
  try {
    const user = await authenticateSupabaseRequest(request);
    const body = await request.json().catch(() => ({}));
    const { state, challenge } = validateDesktopAuthInput(
      body.state,
      body.challenge
    );
    const code = await createDesktopAuthorizationCode(
      user.id,
      state,
      challenge
    );
    const callback = new URL("riescade://auth/callback");
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
