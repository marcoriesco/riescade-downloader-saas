import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function POST() {
  return NextResponse.json(
    { error: "Relay removido. Atualize o RIESCADE e crie uma sala direta." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
