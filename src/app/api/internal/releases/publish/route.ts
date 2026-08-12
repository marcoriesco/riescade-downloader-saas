import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { publishAppRelease } from "@/services/app-release-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const configuredSecret = process.env.RELEASE_PUBLISH_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  const receivedSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  if (!configuredSecret || !receivedSecret) return false;
  const expected = Buffer.from(configuredSecret);
  const received = Buffer.from(receivedSecret);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = await request.json();
    await publishAppRelease(input);
    return NextResponse.json({ published: true, version: input.version }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    const status = message.includes("already published") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
