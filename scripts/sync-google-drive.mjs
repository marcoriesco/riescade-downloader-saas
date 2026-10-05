import { spawn } from "node:child_process";
import dotenv from "dotenv";
import { mkdir, writeFile, rename, rm } from "node:fs/promises";
import { resolve, dirname } from "node:path";

dotenv.config({ path: ".env.local" });

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SYNC_URL = `${BASE_URL}/api/internal/google-drive/sync`;
const secret = process.env.GOOGLE_DRIVE_SYNC_SECRET?.trim();
const args=process.argv.slice(2);
const catalogOnly=args.includes("--catalog-only");
const platform = args.find(arg=>arg!=="--catalog-only")?.trim().toLocaleLowerCase();

if (!secret) {
  throw new Error("GOOGLE_DRIVE_SYNC_SECRET is not configured");
}

if (platform && !/^[a-z0-9_-]{1,64}$/.test(platform)) {
  throw new Error("Invalid platform. Example: snes");
}

const nextBin = "node_modules/next/dist/bin/next";
const server = spawn(
  process.execPath,
  [nextBin, "dev", "--hostname", "127.0.0.1", "--port", String(PORT)],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "ignore", "pipe"],
    windowsHide: true,
  }
);

let serverError = "";
server.stderr.setEncoding("utf8");
server.stderr.on("data", (chunk) => {
  serverError += chunk;
});

async function waitForServer() {
  const deadline = Date.now() + 45_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(
        `The temporary site server stopped unexpectedly. ${serverError.trim()}`
      );
    }

    try {
      await fetch(BASE_URL);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error("The temporary site server did not start within 45 seconds");
}

async function stopServer() {
  if (server.exitCode !== null) return;

  server.kill();
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ]);
}

try {
  console.log(
    catalogOnly ? "Exporting the existing catalog without synchronizing Google Drive" : platform
      ? `Synchronizing Google Drive platform: ${platform}`
      : "Synchronizing the complete Google Drive catalog"
  );

  await waitForServer();
  if (!catalogOnly) {
  const response = await fetch(SYNC_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(platform ? { platform } : {}),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? `Synchronization failed (${response.status})`);
  }

  console.log(JSON.stringify(result, null, 2));
  }
  console.log("Generating the complete RetroBat marker catalog");
  const exported=await fetch(SYNC_URL,{headers:{Authorization:`Bearer ${secret}`}});
  if(!exported.ok)throw new Error(`Catalog export failed (${exported.status})`);
  const catalog=await exported.json();
  if(catalog.schema_version!==1 || !Array.isArray(catalog.assets) || catalog.total!==catalog.assets.length)throw new Error("Invalid exported catalog");
  const destination=resolve("public/catalogs/retrobat.json");
  const temporary=`${destination}.${process.pid}.tmp`;
  await mkdir(dirname(destination),{recursive:true});
  try {await writeFile(temporary,JSON.stringify(catalog));await rename(temporary,destination);}
  finally {await rm(temporary,{force:true});}
  console.log(`RetroBat catalog: ${catalog.total} games, ${catalog.platforms.length} systems. Saved to ${destination}`);
} finally {
  await stopServer();
}
