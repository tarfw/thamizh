import { useMemo } from "react";
import { useSpacetimeDB } from "./SpacetimeDBProvider";
import { ts } from "./db";
import { reducers } from "./module_bindings";
import type { User } from "./module_bindings/types";
import constituenciesData from "../data/tn-assembly-constituencies.json";

export type ConstituencyRow = {
  id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameTa: string;
  district: string;
  number: number;
  reservation?: string;
};

const constituencyMap = new Map<string, ConstituencyRow>();
for (const c of constituenciesData) {
  constituencyMap.set(c.code, { ...c, id: c.code });
}

const constituencies = [...constituencyMap.values()];

export { constituencies };

export function useSession() {
  const { conn, users } = useSpacetimeDB();
  const { identity, isActive, tablesReady, error } = conn;

  const currentUser = useMemo(() => {
    if (!identity || !isActive || !tablesReady) return null;
    return (
      (users as User[]).find((u) => u.identity.toHexString() === identity.toHexString()) ??
      null
    );
  }, [users, identity, isActive, tablesReady]);

  const profile = useMemo(() => {
    if (!currentUser) return null;
    return {
      id: currentUser.identity.toHexString(),
      displayName: currentUser.displayName,
      handle: currentUser.handle,
      avatarUrl: currentUser.avatarUrl,
      bio: "",
      createdAt: ts(currentUser.lastSeen),
    };
  }, [currentUser]);

  const user = useMemo(
    () => (currentUser ? { id: currentUser.identity.toHexString() } : null),
    [currentUser]
  );

  const constituency = null;

  return {
    isLoading: !error && (!isActive || !identity || !tablesReady),
    error,
    user,
    profile,
    constituency,
  };
}

export async function verifyBlueskyHandle(handle: string) {
  const clean = handle.replace(/^@/, "").toLowerCase();
  if (clean.includes("@")) {
    throw new Error(
      "Bluesky handles use dots (.), not @ — try " +
        clean.replace("@", ".")
    );
  }
  const res = await fetch(
    `https://api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(clean)}`
  );
  if (!res.ok) {
    const msg = res.status === 400 ? "Invalid Bluesky handle format" : "Bluesky handle not found";
    throw new Error(msg);
  }
  const data = await res.json();
  return { did: data.did, handle: clean };
}
