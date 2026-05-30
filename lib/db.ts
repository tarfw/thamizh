import AsyncStorage from "@react-native-async-storage/async-storage";
import { DbConnection, tables, reducers } from "./module_bindings";
import type { User, Message, GroupChat, GroupMember } from "./module_bindings/types";

export type { User, Message, GroupChat, GroupMember };
export { tables, reducers };

const DB_NAME = "thamizh-chat";
const HOST = "wss://maincloud.spacetimedb.com";
const TOKEN_KEY = `@spacetime_token_${DB_NAME}`;

type Listener = () => void;

let connection: any = null;
let identityRef: { toHexString(): string } | null = null;
let identityHex: string | null = null;
let isActive = false;
let tablesReady = false;
let connectError: string | null = null;
const listeners = new Set<Listener>();

let connectionStateSnapshot: {
  isActive: boolean;
  identity: { toHexString(): string } | null;
  tablesReady: boolean;
  error: string | null;
} = { isActive: false, identity: null, tablesReady: false, error: null };

let usersSnapshot: readonly User[] = [];
let messagesSnapshot: readonly Message[] = [];
let groupChatsSnapshot: readonly GroupChat[] = [];
let groupMembersSnapshot: readonly GroupMember[] = [];

function refreshConnectionSnapshot() {
  connectionStateSnapshot = {
    isActive,
    identity: identityRef,
    tablesReady,
    error: connectError,
  };
}

function refreshUsersSnapshot() {
  if (!connection || !tablesReady) {
    usersSnapshot = [];
    return;
  }
  usersSnapshot = Array.from((connection.db as any).user.iter()) as User[];
}

function refreshMessagesSnapshot() {
  if (!connection || !tablesReady) {
    messagesSnapshot = [];
    return;
  }
  messagesSnapshot = Array.from((connection.db as any).message.iter()) as Message[];
}

function refreshGroupChatsSnapshot() {
  if (!connection || !tablesReady) {
    groupChatsSnapshot = [];
    return;
  }
  groupChatsSnapshot = Array.from((connection.db as any).groupChat.iter()) as GroupChat[];
}

function refreshGroupMembersSnapshot() {
  if (!connection || !tablesReady) {
    groupMembersSnapshot = [];
    return;
  }
  groupMembersSnapshot = Array.from((connection.db as any).groupMember.iter()) as GroupMember[];
}

export function getConnectionState() {
  return connectionStateSnapshot;
}

export function getUsers(): readonly User[] {
  return usersSnapshot;
}

export function getMessages(): readonly Message[] {
  return messagesSnapshot;
}

export function getGroupChats(): readonly GroupChat[] {
  return groupChatsSnapshot;
}

export function getGroupMembers(): readonly GroupMember[] {
  return groupMembersSnapshot;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function notify() {
  for (const fn of listeners) fn();
}

async function restoreToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function attachTableListener(
  tableName: string,
  refreshFn: () => void,
) {
  const db: any = connection?.db;
  const table = db?.[tableName];
  if (!table) {
    console.warn(`[db] table ${tableName} not found on connection.db`);
    return;
  }
  const onChange = () => { refreshFn(); notify(); };
  try { table.onInsert?.(onChange); } catch (e) { console.warn(`[db] ${tableName}.onInsert failed`, e); }
  try { table.onUpdate?.(onChange); } catch (e) { console.warn(`[db] ${tableName}.onUpdate failed`, e); }
  try { table.onDelete?.(onChange); } catch (e) { console.warn(`[db] ${tableName}.onDelete failed`, e); }
}

function attachAllTableListeners() {
  attachTableListener("user", refreshUsersSnapshot);
  attachTableListener("message", refreshMessagesSnapshot);
  attachTableListener("groupChat", refreshGroupChatsSnapshot);
  attachTableListener("groupMember", refreshGroupMembersSnapshot);
}

let initPromise: Promise<void> | null = null;

export async function disconnect(): Promise<void> {
  if (connection) {
    try { (connection as any).disconnect?.(); } catch {}
    connection = null;
  }
  isActive = false;
  identityRef = null;
  identityHex = null;
  tablesReady = false;
  connectError = null;
  usersSnapshot = [];
  messagesSnapshot = [];
  groupChatsSnapshot = [];
  groupMembersSnapshot = [];
  refreshConnectionSnapshot();
  initPromise = null;
  await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
  notify();
}

export async function ensureConnected(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const token = await restoreToken();
    const builder = DbConnection.builder()
      .withUri(HOST)
      .withDatabaseName(DB_NAME)
      .withCompression("none");

    if (token) builder.withToken(token);

    builder
      .onConnect((_ctx, ident, tok) => {
        identityRef = ident as any;
        identityHex = (ident as any).toHexString();
        isActive = true;
        AsyncStorage.setItem(TOKEN_KEY, tok).catch(() => {});
        refreshConnectionSnapshot();
        notify();
      })
      .onDisconnect(() => {
        const wasActive = isActive;
        isActive = false;
        identityRef = null;
        identityHex = null;
        tablesReady = false;
        usersSnapshot = [];
        messagesSnapshot = [];
        groupChatsSnapshot = [];
        groupMembersSnapshot = [];
        refreshConnectionSnapshot();
        if (wasActive) notify();
      })
      .onConnectError((_ctx, err) => {
        console.error("SpacetimeDB connection error:", err);
        connectError = err instanceof Error ? err.message : String(err);
        refreshConnectionSnapshot();
        notify();
      });

    connection = builder.build() as any;

    // Wait for connection to go active (15s timeout so the UI doesn't spin forever)
    await new Promise<void>((resolve, reject) => {
      if (connection!.isActive) {
        resolve();
        return;
      }
      const deadline = Date.now() + 15000;
      const check = () => {
        if (connection!.isActive) {
          resolve();
        } else if (connectError) {
          reject(new Error(`SpacetimeDB connect failed: ${connectError}`));
        } else if (Date.now() > deadline) {
          reject(new Error(`SpacetimeDB connect timed out after 15s (host=${HOST}, db=${DB_NAME})`));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });

    // Subscribe to all tables (10s timeout)
    await new Promise<void>((resolve, reject) => {
      const deadline = setTimeout(() => {
        reject(new Error("SpacetimeDB subscription timed out after 10s — does the deployed module have the expected tables?"));
      }, 10000);

      const subBuilder = connection!.subscriptionBuilder()
        .onApplied(() => {
          clearTimeout(deadline);
          tablesReady = true;
          try { attachAllTableListeners(); } catch (e) { console.warn("[db] attachAllTableListeners failed", e); }
          refreshUsersSnapshot();
          refreshMessagesSnapshot();
          refreshGroupChatsSnapshot();
          refreshGroupMembersSnapshot();
          refreshConnectionSnapshot();
          notify();
          resolve();
        });

      // onError is available on newer SDKs; guard for older ones
      if (typeof subBuilder.onError === "function") {
        subBuilder.onError((_ctx: unknown, err: unknown) => {
          clearTimeout(deadline);
          reject(new Error(`SpacetimeDB subscription failed: ${err instanceof Error ? err.message : String(err)}`));
        });
      }

      subBuilder.subscribe([
        "SELECT * FROM user",
        "SELECT * FROM message",
        "SELECT * FROM reaction",
        "SELECT * FROM privateChat",
        "SELECT * FROM groupChat",
        "SELECT * FROM groupMember",
      ]);
    });
  })().catch((err) => {
    console.error("[db] ensureConnected failed:", err);
    connectError = err instanceof Error ? err.message : String(err);
    refreshConnectionSnapshot();
    notify();
    initPromise = null;
    throw err;
  });
  return initPromise;
}

export function getDb() {
  return connection;
}

export function getIdentity() {
  return identityRef;
}

export function getIdentityHex() {
  return identityHex;
}

export function ts(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "object") {
    const v = value as { toMillis?: () => bigint | number; toDate?: () => Date };
    if (typeof v.toMillis === "function") return Number(v.toMillis());
    if (typeof v.toDate === "function") return v.toDate().getTime();
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function id(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function toCamelCase(s: string): string {
  return s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export async function callReducer(name: string, ...args: any[]): Promise<any> {
  await ensureConnected();
  if (!connection) throw new Error("Not connected");
  const reducers = connection.reducers as Record<string, (...a: any[]) => any>;
  const fn = reducers[name] ?? reducers[toCamelCase(name)];
  if (!fn) {
    const available = Object.keys(reducers).join(", ");
    throw new Error(`Reducer "${name}" not found. Available: ${available}`);
  }
  return await fn(...args);
}
