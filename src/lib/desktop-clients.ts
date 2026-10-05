export const DESKTOP_CLIENTS = {
  os: { name: "RIESCADE OS", callback: "riescade://auth/callback" },
  retrobat: {
    name: "RIESCADE RetroBat",
    callback: "riescade-retrobat://auth/callback",
  },
} as const;

export type DesktopClient = keyof typeof DESKTOP_CLIENTS;

// Never use a caller-supplied URI as a redirect. Keep older OS requests valid
// when they omit client, and permit only these two fixed desktop callbacks.
export function resolveDesktopClient(
  value: unknown,
  redirectUri?: unknown
): { id: DesktopClient; name: string; callback: string } {
  const id = value === undefined || value === null ? "os" : value;
  if (id !== "os" && id !== "retrobat") {
    throw new Error("Invalid desktop client");
  }
  const config = DESKTOP_CLIENTS[id];
  if (redirectUri !== undefined && redirectUri !== null && redirectUri !== config.callback) {
    throw new Error("Invalid desktop callback");
  }
  return { id, ...config };
}
