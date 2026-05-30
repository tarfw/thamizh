import * as SecureStore from "expo-secure-store";

const BSKY_SESSION_KEY = "bluesky_session";

export type BlueskySession = {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
  pdsUrl: string;
};

export async function resolvePdsUrl(
  handle: string
): Promise<{ pdsUrl: string; did: string }> {
  const clean = handle.replace(/^@/, "").toLowerCase();
  if (clean.includes("@")) {
    throw new Error(
      "Bluesky handles use dots (.), not @ — try " +
        clean.replace("@", ".")
    );
  }

  const resolveRes = await fetch(
    `https://api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(clean)}`
  );
  if (!resolveRes.ok) {
    const msg =
      resolveRes.status === 400
        ? "Invalid Bluesky handle format"
        : "Bluesky handle not found";
    throw new Error(msg);
  }
  const { did } = await resolveRes.json();

  const docRes = await fetch(`https://plc.directory/${did}`);
  if (!docRes.ok) {
    throw new Error("Failed to resolve DID document");
  }
  const doc = await docRes.json();

  const pdsService = doc.service?.find(
    (s: any) =>
      s.id === "#atproto_pds" || s.type === "AtprotoPersonalDataServer"
  );
  if (!pdsService?.serviceEndpoint) {
    throw new Error("PDS endpoint not found in DID document");
  }

  return { pdsUrl: pdsService.serviceEndpoint, did };
}

export async function signInWithBluesky(
  handle: string,
  password?: string
): Promise<BlueskySession> {
  if (!password) {
    throw new Error("App password is required");
  }

  const clean = handle.replace(/^@/, "").toLowerCase();
  const { pdsUrl, did } = await resolvePdsUrl(clean);

  const tokenRes = await fetch(`${pdsUrl}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: clean,
      password: password,
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    let errMsg = `Authentication failed: ${tokenRes.status}`;
    try {
      const parsed = JSON.parse(errBody);
      if (parsed.message) {
        errMsg = parsed.message;
      }
    } catch {}
    throw new Error(errMsg);
  }

  const tokenData = await tokenRes.json();

  const session: BlueskySession = {
    accessJwt: tokenData.accessJwt,
    refreshJwt: tokenData.refreshJwt,
    handle: clean,
    did,
    pdsUrl,
  };

  await saveSession(session);
  return session;
}

export async function refreshSession(
  session: BlueskySession
): Promise<BlueskySession> {
  const res = await fetch(`${session.pdsUrl}/xrpc/com.atproto.server.refreshSession`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.refreshJwt}`,
    },
  });

  if (!res.ok) {
    throw new Error("Token refresh failed - please sign in again");
  }

  const data = await res.json();
  const refreshed: BlueskySession = {
    ...session,
    accessJwt: data.accessJwt,
    refreshJwt: data.refreshJwt,
  };

  await saveSession(refreshed);
  return refreshed;
}

export async function validateSession(
  session: BlueskySession
): Promise<boolean> {
  try {
    const res = await fetch(
      `${session.pdsUrl}/xrpc/com.atproto.server.getSession`,
      { headers: { Authorization: `Bearer ${session.accessJwt}` } }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function signOutBluesky(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BSKY_SESSION_KEY);
  } catch {}
}

export async function saveSession(session: BlueskySession): Promise<void> {
  await SecureStore.setItemAsync(BSKY_SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<BlueskySession | null> {
  try {
    const raw = await SecureStore.getItemAsync(BSKY_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BlueskySession;
  } catch {
    return null;
  }
}
