import type { User } from "@supabase/supabase-js";
import { AppApiError, isDownloadTester } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { getStorageProvider } from "@/storage";
import { getStorageConfig } from "@/storage/storage-config";

const PILOT_PLATFORM = "snes";
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

interface GameAsset {
  id: string;
  platform: string;
  provider: string;
  bucket: string;
  object_key: string;
  title: string;
  download_name: string;
  content_type: string | null;
  file_size: number | null;
  sha256: string | null;
  status: string;
}

export function hasActiveSubscription(
  subscription: { status: string; end_date: string | null } | null,
  now = new Date()
): boolean {
  if (!subscription || !ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
    return false;
  }
  return !subscription.end_date || new Date(subscription.end_date) > now;
}

async function assertDownloadAccess(user: User): Promise<void> {
  if (isDownloadTester(user.id)) {
    return;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("status,end_date")
    .eq("user_id", user.id)
    .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES])
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify subscription: ${error.message}`);
  }
  if (!hasActiveSubscription(data)) {
    throw new AppApiError(403, "An active subscription is required");
  }
}

async function assertRateLimit(userId: string): Promise<void> {
  const limit = Number(process.env.DOWNLOAD_REQUESTS_PER_MINUTE ?? "10");
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await getSupabaseAdmin()
    .from("download_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  if (error) {
    throw new Error(`Failed to verify download limit: ${error.message}`);
  }
  if ((count ?? 0) >= limit) {
    throw new AppApiError(429, "Too many download requests");
  }
}

async function getActiveSnesAsset(assetId: string): Promise<GameAsset> {
  const { data, error } = await getSupabaseAdmin()
    .from("game_assets")
    .select(
      "id,platform,provider,bucket,object_key,title,download_name,content_type,file_size,sha256,status"
    )
    .eq("id", assetId)
    .eq("platform", PILOT_PLATFORM)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load download asset: ${error.message}`);
  }
  if (!data) {
    throw new AppApiError(404, "SNES download not found");
  }
  return data as GameAsset;
}

export async function listSnesAssets() {
  const { data, error } = await getSupabaseAdmin()
    .from("game_assets")
    .select("id,title,download_name,file_size,sha256")
    .eq("platform", PILOT_PLATFORM)
    .eq("status", "active")
    .order("title");

  if (error) {
    throw new Error(`Failed to load SNES catalog: ${error.message}`);
  }

  return data;
}

export async function authorizeSnesDownload(
  user: User,
  assetId: string,
  clientVersion?: string
) {
  await assertDownloadAccess(user);
  await assertRateLimit(user.id);

  const asset = await getActiveSnesAsset(assetId);
  const config = getStorageConfig();

  if (asset.provider !== config.provider) {
    throw new Error(`Storage provider ${asset.provider} is not configured`);
  }

  const signed = await getStorageProvider().createDownloadUrl(
    {
      bucket: asset.bucket || config.bucket,
      objectKey: asset.object_key,
      downloadName: asset.download_name,
      contentType: asset.content_type,
    },
    config.downloadUrlTtl
  );

  const { error } = await getSupabaseAdmin().from("download_requests").insert({
    user_id: user.id,
    asset_id: asset.id,
    status: "authorized",
    provider: asset.provider,
    client_version: clientVersion?.slice(0, 64) || null,
    expires_at: signed.expiresAt,
  });

  if (error) {
    throw new Error(`Failed to register download: ${error.message}`);
  }

  return {
    asset: {
      id: asset.id,
      platform: asset.platform,
      title: asset.title,
      filename: asset.download_name,
      size: asset.file_size,
      sha256: asset.sha256,
    },
    downloadUrl: signed.url,
    expiresAt: signed.expiresAt,
  };
}
