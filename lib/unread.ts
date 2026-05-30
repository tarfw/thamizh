import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "@chat_last_read_v1";

type LastReadMap = Record<string, number>;

let cache: LastReadMap | null = null;
let loadPromise: Promise<LastReadMap> | null = null;
const listeners = new Set<() => void>();

async function loadFromStorage(): Promise<LastReadMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function ensureLoaded(): Promise<LastReadMap> {
  if (cache) return Promise.resolve(cache);
  if (!loadPromise) {
    loadPromise = loadFromStorage().then((m) => {
      cache = m;
      notify();
      return m;
    });
  }
  return loadPromise;
}

function notify() {
  for (const fn of listeners) fn();
}

async function persist() {
  if (!cache) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {}
}

export function getLastReadSync(roomId: string): number {
  return cache?.[roomId] ?? 0;
}

export async function markRead(roomId: string, at: number = Date.now()): Promise<void> {
  const map = await ensureLoaded();
  if ((map[roomId] ?? 0) >= at) return;
  map[roomId] = at;
  notify();
  await persist();
}

export function useLastRead() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    ensureLoaded().then(() => {
      if (!cancelled) setTick((t) => t + 1);
    });
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      cancelled = true;
      listeners.delete(listener);
    };
  }, []);

  const getLastRead = useCallback((roomId: string): number => {
    return cache?.[roomId] ?? 0;
  }, [tick]);

  return { getLastRead, ready: cache !== null };
}
