import {
  loadSession,
  refreshSession,
  saveSession,
  type BlueskySession,
} from "./bluesky-auth";

export type BskyProfile = {
  did: string;
  handle: string;
  displayName: string;
  description: string;
  avatar: string | null;
  banner: string | null;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  createdAt: string | null;
  indexedAt: string | null;
};

export type BskyPostAuthor = {
  did: string;
  handle: string;
  displayName: string;
  avatar: string | null;
};

export type BskyPostImage = {
  thumb: string;
  fullsize: string;
  alt: string;
};

export type BskyFeedItem = {
  uri: string;
  cid: string;
  indexedAt: string;
  author: BskyPostAuthor;
  text: string;
  isReply: boolean;
  isRepost: boolean;
  repostedBy: { handle: string; displayName: string } | null;
  images: BskyPostImage[];
  replyCount: number;
  repostCount: number;
  likeCount: number;
};

const PUBLIC_API = "https://public.api.bsky.app";

async function authedFetch(
  session: BlueskySession,
  path: string,
  init?: RequestInit
): Promise<Response> {
  let current = session;
  let res = await fetch(`${current.pdsUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${current.accessJwt}`,
    },
  });

  if (res.status === 401) {
    try {
      current = await refreshSession(current);
      await saveSession(current);
    } catch {
      throw new Error("Session expired — please sign in again");
    }
    res = await fetch(`${current.pdsUrl}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${current.accessJwt}`,
      },
    });
  }

  return res;
}

export async function fetchMyProfile(): Promise<BskyProfile> {
  const session = await loadSession();
  if (!session) throw new Error("Not signed in to Bluesky");

  const url = `${PUBLIC_API}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(
    session.did
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
  const data = await res.json();

  return {
    did: data.did,
    handle: data.handle,
    displayName: data.displayName ?? data.handle,
    description: data.description ?? "",
    avatar: data.avatar ?? null,
    banner: data.banner ?? null,
    followersCount: data.followersCount ?? 0,
    followsCount: data.followsCount ?? 0,
    postsCount: data.postsCount ?? 0,
    createdAt: data.createdAt ?? null,
    indexedAt: data.indexedAt ?? null,
  };
}

function mapFeedView(view: any): BskyFeedItem | null {
  const post = view?.post;
  if (!post) return null;

  const record = post.record ?? {};
  const embedImages = (post.embed?.images ?? []) as any[];

  const reposter = view?.reason?.by;

  return {
    uri: post.uri,
    cid: post.cid,
    indexedAt: post.indexedAt,
    author: {
      did: post.author?.did ?? "",
      handle: post.author?.handle ?? "",
      displayName: post.author?.displayName ?? post.author?.handle ?? "",
      avatar: post.author?.avatar ?? null,
    },
    text: record.text ?? "",
    isReply: !!record.reply,
    isRepost: !!reposter,
    repostedBy: reposter
      ? {
          handle: reposter.handle,
          displayName: reposter.displayName ?? reposter.handle,
        }
      : null,
    images: embedImages.map((i) => ({
      thumb: i.thumb,
      fullsize: i.fullsize,
      alt: i.alt ?? "",
    })),
    replyCount: post.replyCount ?? 0,
    repostCount: post.repostCount ?? 0,
    likeCount: post.likeCount ?? 0,
  };
}

export async function fetchAuthorFeed(
  filter:
    | "posts_with_replies"
    | "posts_no_replies"
    | "posts_with_media"
    | "posts_and_author_threads" = "posts_with_replies",
  limit = 50
): Promise<BskyFeedItem[]> {
  const session = await loadSession();
  if (!session) throw new Error("Not signed in to Bluesky");

  const url = `${PUBLIC_API}/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
    session.did
  )}&filter=${filter}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load feed (${res.status})`);
  const data = await res.json();
  return ((data.feed ?? []) as any[])
    .map(mapFeedView)
    .filter((x): x is BskyFeedItem => x !== null);
}

export async function updateMyProfile(updates: {
  displayName?: string;
  description?: string;
}): Promise<void> {
  const session = await loadSession();
  if (!session) throw new Error("Not signed in to Bluesky");

  // Read the existing profile record (may not exist yet for brand-new accounts).
  const getRes = await authedFetch(
    session,
    `/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(
      session.did
    )}&collection=app.bsky.actor.profile&rkey=self`
  );

  let existingValue: Record<string, unknown> = {};
  let swapRecord: string | undefined;

  if (getRes.ok) {
    const data = await getRes.json();
    existingValue = (data.value ?? {}) as Record<string, unknown>;
    swapRecord = data.cid;
  } else if (getRes.status !== 404 && getRes.status !== 400) {
    throw new Error(`Failed to read profile record (${getRes.status})`);
  }

  const nextValue: Record<string, unknown> = {
    ...existingValue,
    $type: "app.bsky.actor.profile",
  };
  if (updates.displayName !== undefined)
    nextValue.displayName = updates.displayName;
  if (updates.description !== undefined)
    nextValue.description = updates.description;

  const body: Record<string, unknown> = {
    repo: session.did,
    collection: "app.bsky.actor.profile",
    rkey: "self",
    record: nextValue,
  };
  if (swapRecord) body.swapRecord = swapRecord;

  const putRes = await authedFetch(session, "/xrpc/com.atproto.repo.putRecord", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const txt = await putRes.text();
    let msg = `Failed to update profile (${putRes.status})`;
    try {
      const parsed = JSON.parse(txt);
      if (parsed.message) msg = parsed.message;
    } catch {}
    throw new Error(msg);
  }
}

export async function fetchMyLikes(limit = 50): Promise<BskyFeedItem[]> {
  const session = await loadSession();
  if (!session) throw new Error("Not signed in to Bluesky");

  const res = await authedFetch(
    session,
    `/xrpc/app.bsky.feed.getActorLikes?actor=${encodeURIComponent(
      session.did
    )}&limit=${limit}`
  );
  if (!res.ok) throw new Error(`Failed to load likes (${res.status})`);
  const data = await res.json();
  return ((data.feed ?? []) as any[])
    .map(mapFeedView)
    .filter((x): x is BskyFeedItem => x !== null);
}
