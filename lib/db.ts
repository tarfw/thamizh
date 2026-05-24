import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import constituenciesData from "../data/tn-assembly-constituencies.json";

// Unique ID Generator
export function id(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

const constituencies = constituenciesData.map((c) => ({
  ...c,
  id: c.code,
}));

// Local State Store
type Store = {
  user: { id: string; email?: string; isGuest?: boolean } | null;
  profiles: Record<
    string,
    {
      id: string;
      displayName: string;
      createdAt: number;
      bio?: string;
      handle?: string;
      userId?: string;
      constituencyId?: string;
    }
  >;
  messages: Record<
    string,
    {
      id: string;
      body: string;
      createdAt: number;
      authorId: string;
      constituencyId: string;
    }
  >;
};

const SEED_PROFILES: Record<string, any> = {
  "seed-prof-1": {
    id: "seed-prof-1",
    displayName: "Anbalagan K.",
    createdAt: Date.now() - 86400000 * 5,
    bio: "Pioneering community-first digital governance initiatives.",
    handle: "anbalagan",
    constituencyId: "021",
  },
  "seed-prof-2": {
    id: "seed-prof-2",
    displayName: "Senthamizh Selvi",
    createdAt: Date.now() - 86400000 * 4,
    bio: "Advocating for digital sovereignty and direct representation.",
    handle: "selvi_s",
    constituencyId: "021",
  },
  "seed-prof-3": {
    id: "seed-prof-3",
    displayName: "Arun Kumar",
    createdAt: Date.now() - 86400000 * 3,
    bio: "Tech enthusiast looking to improve local governance transparency.",
    handle: "arun_k",
    constituencyId: "021",
  },
};

const SEED_MESSAGES: Record<string, any> = {
  "seed-msg-1": {
    id: "seed-msg-1",
    body: "Vanakkam Anna Nagar assembly! Excited to launch this digital forum for local policy discussion.",
    createdAt: Date.now() - 3600000 * 10,
    authorId: "seed-prof-1",
    constituencyId: "021",
  },
  "seed-msg-2": {
    id: "seed-msg-2",
    body: "We should organize a community vote on improving green spaces around Tower Park.",
    createdAt: Date.now() - 3600000 * 8,
    authorId: "seed-prof-2",
    constituencyId: "021",
  },
  "seed-msg-3": {
    id: "seed-msg-3",
    body: "Agreed. Let's draft a proposal and invite the local ward members to join the space.",
    createdAt: Date.now() - 3600000 * 4,
    authorId: "seed-prof-3",
    constituencyId: "021",
  },
};

const globalStore: Store = {
  user: null,
  profiles: { ...SEED_PROFILES },
  messages: { ...SEED_MESSAGES },
};

let isInitialized = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

// Load Store from AsyncStorage
AsyncStorage.getItem("@thamizh_store")
  .then((saved) => {
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        globalStore.user = parsed.user || null;
        globalStore.profiles = { ...SEED_PROFILES, ...parsed.profiles };
        globalStore.messages = { ...SEED_MESSAGES, ...parsed.messages };
      } catch (e) {
        console.error("Failed to parse local store", e);
      }
    }
    isInitialized = true;
    notifyListeners();
  })
  .catch(() => {
    isInitialized = true;
    notifyListeners();
  });

async function saveStore() {
  try {
    await AsyncStorage.setItem("@thamizh_store", JSON.stringify(globalStore));
  } catch (e) {
    console.error("Failed to save store", e);
  }
}

class TxAction {
  type: string;
  id: string;
  action: "create" | "update" | "delete";
  attrs: any = {};
  links: any = {};

  constructor(
    type: string,
    id: string,
    action: "create" | "update" | "delete",
    attrs = {}
  ) {
    this.type = type;
    this.id = id;
    this.action = action;
    this.attrs = attrs;
  }

  update(attrs: any) {
    this.attrs = { ...this.attrs, ...attrs };
    return this;
  }

  link(links: any) {
    this.links = { ...this.links, ...links };
    return this;
  }
}

const txBuilder = {
  profiles: new Proxy(
    {},
    {
      get(target, id: string) {
        return {
          update: (attrs: any) => new TxAction("profiles", id, "update", attrs),
          create: (attrs: any) => new TxAction("profiles", id, "create", attrs),
        };
      },
    }
  ),
  messages: new Proxy(
    {},
    {
      get(target, id: string) {
        return {
          create: (attrs: any) => new TxAction("messages", id, "create", attrs),
          delete: () => new TxAction("messages", id, "delete"),
        };
      },
    }
  ),
};

function resolveQuery(queryObj: any): any {
  const result: any = {};

  for (const key in queryObj) {
    if (key === "constituencies") {
      let list = [...constituencies];
      const params = queryObj[key]?.$;
      if (params?.where) {
        const where = params.where;
        if (where.code !== undefined) {
          list = list.filter((c) => c.code === where.code);
        }
      }
      // Sort if ordered
      if (params?.order?.number === "asc") {
        list.sort((a, b) => a.number - b.number);
      }
      result.constituencies = list;
    }

    if (key === "profiles") {
      let list = Object.values(globalStore.profiles);
      const params = queryObj[key]?.$;
      if (params?.where) {
        const where = params.where;
        if (where["user.id"] !== undefined) {
          list = list.filter((p) => p.userId === where["user.id"]);
        }
        if (where["id"] !== undefined) {
          list = list.filter((p) => p.id === where["id"]);
        }
      }
      // Populate constituency
      const finalProfiles = list.map((p) => {
        const constituency =
          constituencies.find((c) => c.id === p.constituencyId) || null;
        return {
          ...p,
          constituency,
        };
      });
      result.profiles = finalProfiles;
    }

    if (key === "messages") {
      let list = Object.values(globalStore.messages);
      const params = queryObj[key]?.$;
      if (params?.where) {
        const where = params.where;
        if (where["author.id"] !== undefined) {
          list = list.filter((m) => m.authorId === where["author.id"]);
        }
        if (where["constituency.code"] !== undefined) {
          list = list.filter((m) => m.constituencyId === where["constituency.code"]);
        }
      }

      // Sort
      if (params?.order?.createdAt === "desc") {
        list.sort((a, b) => b.createdAt - a.createdAt);
      }

      // Limit
      if (params?.limit !== undefined) {
        list = list.slice(0, params.limit);
      }

      // Populate relations
      const finalMessages = list.map((m) => {
        const author = globalStore.profiles[m.authorId] || null;
        const constituency =
          constituencies.find((c) => c.id === m.constituencyId) || null;
        return {
          ...m,
          author: author
            ? {
                ...author,
                constituency,
              }
            : null,
          constituency,
        };
      });
      result.messages = finalMessages;
    }
  }

  return result;
}

export const db = {
  useAuth() {
    const [state, setState] = useState(() => ({
      user: globalStore.user as any,
      isLoading: !isInitialized,
      error: null as any,
    }));

    useEffect(() => {
      const listener = () => {
        setState({
          user: globalStore.user as any,
          isLoading: !isInitialized,
          error: null as any,
        });
      };
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, []);

    return state;
  },

  useQuery(query: any) {
    const [state, setState] = useState(() => ({
      isLoading: !isInitialized,
      data: query ? resolveQuery(query) : null,
      error: null as any,
    }));

    useEffect(() => {
      const listener = () => {
        setState({
          isLoading: !isInitialized,
          data: query ? resolveQuery(query) : null,
          error: null as any,
        });
      };
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, [JSON.stringify(query)]);

    return state;
  },

  tx: txBuilder as any,

  async transact(txActions: any | any[]) {
    const actions = Array.isArray(txActions) ? txActions : [txActions];

    for (const action of actions) {
      const { type, id: actionId, action: op, attrs, links } = action;

      if (type === "profiles") {
        if (op === "create" || op === "update") {
          const existing = globalStore.profiles[actionId] || {};
          globalStore.profiles[actionId] = {
            ...existing,
            id: actionId,
            ...attrs,
            userId: links?.user || existing.userId || null,
            constituencyId: links?.constituency || existing.constituencyId || null,
          };
        }
      }

      if (type === "messages") {
        if (op === "create") {
          globalStore.messages[actionId] = {
            id: actionId,
            ...attrs,
            authorId: links?.author || null,
            constituencyId: links?.constituency || null,
          };
        } else if (op === "delete") {
          delete globalStore.messages[actionId];
        }
      }
    }

    await saveStore();
    notifyListeners();
  },

  auth: {
    async signInAsGuest() {
      // Simulate connection lag of 100ms for natural feel, but fast
      await new Promise((resolve) => setTimeout(resolve, 100));
      const guestId = "guest-" + Math.random().toString(36).substring(2, 11);
      globalStore.user = { id: guestId };
      await saveStore();
      notifyListeners();
    },
    async signOut() {
      globalStore.user = null;
      await saveStore();
      notifyListeners();
    },
  },
};
