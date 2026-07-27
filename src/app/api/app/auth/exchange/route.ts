import { NextResponse } from "next/server";
import { AppApiError } from "@/lib/server/app-auth";
import { exchangeDesktopAuthorizationCode } from "@/lib/server/desktop-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const session = await exchangeDesktopAuthorizationCode(
      body.code,
      body.state,
      body.verifier
    );
    return NextResponse.json({
      accessToken: session.token,
      expiresAt: session.expiresAt,
      user: {
        id: session.user.id,
        email: session.user.email,
        name:
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          null,
      },
    });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    const message =
      error instanceof AppApiError ? error.message : "Unable to create session";
    if (status === 500) console.error("Desktop code exchange error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
