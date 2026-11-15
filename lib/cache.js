// Small query cache shared by the data layer (lib/api.js) and screens (lib/useQuery.js).
//  - TTL based freshness, stale-while-revalidate friendly (peek() returns stale data too)
//  - de-duplicates concurrent identical requests
//  - prefix invalidation after mutations
//  - selected keys are mirrored to AsyncStorage so lists show instantly after an app restart
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'cache:';
const store = new Map(); // key -> { data, ts }
const inflight = new Map(); // key -> Promise
const listeners = new Set();

const notify = (key) => listeners.forEach((fn) => fn(key));
export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const peek = (key) => store.get(key)?.data;
export const isFresh = (key, ttl) => {
  const e = store.get(key);
  return !!e && Date.now() - e.ts < ttl;
};

// Loads persisted entries into memory (call once at startup).
export async function hydrateCache() {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    if (!keys.length) return;
    const pairs = await AsyncStorage.multiGet(keys);
    pairs.forEach(([k, v]) => {
      if (!v) return;
      try {
        store.set(k.slice(PREFIX.length), JSON.parse(v));
      } catch (_) {}
    });
  } catch (_) {}
}

export function setCache(key, data, { persist = false } = {}) {
  store.set(key, { data, ts: Date.now() });
  if (persist) AsyncStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() })).catch(() => {});
  notify(key);
}

// Returns cached data when fresh, otherwise fetches (one request per key at a time).
export function cachedFetch(key, fetcher, { ttl = 60000, persist = false, force = false } = {}) {
  if (!force && isFresh(key, ttl)) return Promise.resolve(store.get(key).data);
  if (inflight.has(key)) return inflight.get(key);
  const p = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      setCache(key, data, { persist });
      return data;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

// Drops every entry whose key starts with `prefix` so the next read refetches.
export function invalidate(prefix) {
  [...store.keys()].forEach((k) => {
    if (k.startsWith(prefix)) {
      store.delete(k);
      AsyncStorage.removeItem(PREFIX + k).catch(() => {});
      notify(k);
    }
  });
}

export async function clearCache() {
  store.clear();
  inflight.clear();
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch (_) {}
}
