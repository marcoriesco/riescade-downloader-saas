import { NextResponse } from "next/server";
import { loadSites, updateSite } from "../../lib/storage";

async function ping(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const start = Date.now();
  try {
    const res = await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(timeout);
    const duration = Date.now() - start;
    return { ok: res.ok, status: res.status, duration };
  } catch (err: any) {
    clearTimeout(timeout);
    return { ok: false, status: null, error: err.message };
  }
}

export async function GET() {
  try {
    const sites = loadSites();
    let updatedCount = 0;

    for (const site of sites) {
      console.log(`🔹 Pingando ${site.name} -> ${site.url}`);
      const result = await ping(site.url);

      const updates = {
        lastPing: new Date().toISOString(),
        lastStatus: result.status?.toString() || "erro",
        failures: result.ok ? 0 : (site.failures || 0) + 1
      };

      const success = updateSite(site.id, updates);
      if (success) {
        updatedCount++;
      }

      if (result.ok) {
        console.log(`✅ ${site.name} respondeu ${result.status}`);
      } else {
        console.log(`❌ Falha em ${site.name}: ${result.error || "Erro"}`);
      }
    }

    return NextResponse.json({ ok: true, total: sites.length, updated: updatedCount });
  } catch (err: any) {
    console.error("Erro no keepalive geral:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
